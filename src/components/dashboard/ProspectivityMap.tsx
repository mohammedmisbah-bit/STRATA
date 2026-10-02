import "maplibre-gl/dist/maplibre-gl.css";

// `?worker&url` makes Vite bundle the worker together with its own imports
// (`./maplibre-gl-shared.mjs`). A plain `?url` copies the file raw, and the
// shared chunk it imports is never emitted, so the worker 404s in production.
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type {
  LayerSpecification,
  Map as MapLibreMap,
  Marker,
  Popup,
  StyleSpecification,
} from "maplibre-gl";
import { Layers, Loader2, MapPinOff, Satellite } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDashboard } from "@/context/use-dashboard";
import { GEOLOGY_LEGEND, NGDR_GEOLOGY_LAYER } from "@/data/ngdrGeologyLayer";
import { PROSPECTIVITY, type ProspectTarget } from "@/data/prospectivity";
import { useUiText } from "@/i18n/use-ui-text";
import { formatLatitude, formatLongitude, formatScore } from "@/lib/format";
import { MAP_FOCUS_EVENT, type MapFocusDetail } from "@/lib/map-events";
import type { BeaconTone, MapBeacon, MineProfile } from "@/lib/mine-data";
import { cn } from "@/lib/utils";
import { fetchNearestGridCell, type GridCellResult } from "@/services/prospectivityService";

type MapLibreModule = typeof import("maplibre-gl");
type MapStatus = "loading" | "ready" | "error";

const GEOLOGY_SOURCE_ID = "ngdr-geology";
const HEATMAP_SOURCE_ID = "s2-prospectivity";

/**
 * Sentinel-2 / Copernicus DEM prospectivity raster from the pipeline. One
 * georeferenced PNG (~100 m cells); transparent below the score threshold.
 */
const HEATMAP_LAYER: LayerSpecification = {
  id: "s2-prospectivity-heatmap",
  type: "raster",
  source: HEATMAP_SOURCE_ID,
  paint: { "raster-opacity": 0.9, "raster-fade-duration": 0 },
};

/** Legend stops, matching `colour_ramp` in pipeline/strata_pipeline.py. */
const HEATMAP_GRADIENT = "linear-gradient(90deg, #2DD4BF, #FACC15, #FB923C, #F43F5E)";
/**
 * Mine-level zoom. The shaft and prospect beacons sit 1–2 km apart, so at the
 * old zoom of 9 their labels stacked on top of each other. Zoom out with the
 * controls to see the whole belt.
 */
const MINE_ZOOM = 12.4;

/**
 * Keyless dark vector basemap from OpenFreeMap (OpenStreetMap data). No API
 * key, no registration; attribution ships inside the style.
 *
 * CARTO's `basemaps.cartocdn.com` raster tiles were used previously, but they
 * now watermark every tile with "API KEY REQUIRED".
 */
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/**
 * Used when the basemap style can't be fetched (offline, blocked host). The
 * geology overlay and markers still render on a plain background.
 */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: "fallback-background", type: "background", paint: { "background-color": "#0b1620" } },
  ],
};

/** How long to wait for the remote style before switching to the fallback. */
const STYLE_TIMEOUT_MS = 8000;

/** NGDR / GSI overlay, bottom to top. All share the geology source. */
const OVERLAY_LAYERS: LayerSpecification[] = [
  {
    id: "ngdr-lithology-fill",
    type: "fill",
    source: GEOLOGY_SOURCE_ID,
    filter: ["==", ["get", "kind"], "lithology"],
    paint: {
      "fill-color": ["get", "color"],
      // Full strength at belt scale; fades at mine scale, where the view sits
      // entirely inside one polygon and a solid tint would hide the basemap.
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        ["get", "opacity"],
        12,
        ["*", ["get", "opacity"], 0.3],
      ],
    },
  },
  {
    id: "ngdr-lithology-outline",
    type: "line",
    source: GEOLOGY_SOURCE_ID,
    filter: ["==", ["get", "kind"], "lithology"],
    paint: { "line-color": ["get", "color"], "line-width": 1, "line-opacity": 0.7 },
  },
  {
    id: "ngdr-lineaments",
    type: "line",
    source: GEOLOGY_SOURCE_ID,
    filter: ["==", ["get", "kind"], "lineament"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": ["get", "color"],
      "line-width": 1.75,
      "line-dasharray": [3, 2],
      "line-opacity": 0.9,
    },
  },
];

const BEACON_COLORS: Record<BeaconTone, { dot: string; bg: string; border: string; text: string }> =
  {
    rose: {
      dot: "#FB7185",
      bg: "rgba(76,5,25,0.72)",
      border: "rgba(251,113,133,0.55)",
      text: "#FECDD3",
    },
    amber: {
      dot: "#FBBF24",
      bg: "rgba(69,26,3,0.72)",
      border: "rgba(251,191,36,0.55)",
      text: "#FDE68A",
    },
    emerald: {
      dot: "#34D399",
      bg: "rgba(2,44,34,0.72)",
      border: "rgba(52,211,153,0.55)",
      text: "#A7F3D0",
    },
  };

const LABEL_FONT = '600 10px/1.2 "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

/** DOM element for a mine site marker. Decorative; the sr-only list carries the text. */
function createSiteElement(site: MineProfile, isActive: boolean): HTMLElement {
  const size = isActive ? 14 : 9;
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = "display:flex;align-items:center;gap:6px;pointer-events:none;";

  const dot = document.createElement("span");
  dot.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:9999px",
    `background:${isActive ? "#2DD4BF" : "#94A3B8"}`,
    "border:2px solid #0F172A",
    isActive ? "box-shadow:0 0 0 4px rgba(45,212,191,0.3)" : "",
  ].join(";");

  const label = document.createElement("span");
  label.textContent = site.label.replace(/\s+Mine$/, "");
  label.style.cssText = [
    `font:${LABEL_FONT}`,
    `color:${isActive ? "#CCFBF1" : "#CBD5E1"}`,
    "text-shadow:0 1px 3px #020617",
    "white-space:nowrap",
  ].join(";");

  root.append(dot, label);
  return root;
}

/** DOM element for a pipeline greenfield target. Decorative; the sr-only list carries the text. */
function createTargetElement(target: ProspectTarget): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = "display:flex;align-items:center;gap:5px;pointer-events:none;";

  const diamond = document.createElement("span");
  diamond.style.cssText =
    "width:9px;height:9px;transform:rotate(45deg);background:#C4B5FD;border:1.5px solid #1E1B4B;box-shadow:0 0 0 3px rgba(196,181,253,0.25);";

  const label = document.createElement("span");
  label.textContent = `${target.id} · ${formatScore(target.score)}`;
  label.style.cssText = [
    `font:${LABEL_FONT}`,
    "color:#EDE9FE",
    "background:rgba(30,27,75,0.78)",
    "border:1px solid rgba(196,181,253,0.5)",
    "border-radius:6px",
    "padding:2px 5px",
    "white-space:nowrap",
  ].join(";");

  root.append(diamond, label);
  return root;
}

type UiTranslate = ReturnType<typeof useUiText>;

/**
 * Popup body for a clicked grid cell. Built with DOM nodes and `textContent`
 * only, so nothing from the database is ever parsed as HTML.
 */
function buildCellPopup(t: UiTranslate, result: GridCellResult | null): HTMLElement {
  const root = document.createElement("div");
  root.style.cssText =
    "font:500 11px/1.45 ui-sans-serif,system-ui,sans-serif;color:#0F172A;min-width:170px;";

  const title = document.createElement("p");
  title.textContent = t("map.cell.title");
  title.style.cssText =
    "margin:0 0 4px;font:700 9px/1.3 ui-monospace,monospace;letter-spacing:0.08em;text-transform:uppercase;color:#0F766E;";
  root.append(title);

  const line = (text: string, muted = false) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.cssText = `margin:0;${muted ? "color:#64748B;" : ""}`;
    root.append(p);
  };

  if (result === null) {
    line(t("map.cell.loading"), true);
  } else if (result.status === "empty") {
    line(t("map.cell.none"), true);
  } else if (result.status === "error") {
    line(t("map.cell.error"), true);
  } else {
    const { cell } = result;
    line(`${t("map.cell.score")}: ${formatScore(cell.score)}`);
    line(`${t("map.cell.interval")}: ${formatScore(cell.lower)}–${formatScore(cell.upper)}`);
    if (cell.ironClay !== null) line(`${t("map.cell.ironClay")}: ${cell.ironClay.toFixed(2)}`);
    if (cell.slopeDegrees !== null)
      line(`${t("map.cell.slope")}: ${cell.slopeDegrees.toFixed(1)}°`);
    line(`${formatLatitude(cell.latitude)}, ${formatLongitude(cell.longitude)}`, true);
  }
  return root;
}

/** DOM element for an operational beacon (risk / prospect) on the active mine. */
function createBeaconElement(beacon: MapBeacon): HTMLElement {
  const colors = BEACON_COLORS[beacon.tone] ?? BEACON_COLORS.emerald;
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = "display:flex;align-items:center;gap:6px;pointer-events:none;";

  const pulse = document.createElement("span");
  pulse.style.cssText = "position:relative;display:inline-flex;width:10px;height:10px;";
  const ring = document.createElement("span");
  ring.className = "motion-safe:animate-ping";
  ring.style.cssText = `position:absolute;inset:0;border-radius:9999px;background:${colors.dot};opacity:0.6;`;
  const core = document.createElement("span");
  core.style.cssText = `position:relative;width:10px;height:10px;border-radius:9999px;background:${colors.dot};`;
  pulse.append(ring, core);

  const label = document.createElement("span");
  label.textContent = beacon.label;
  label.style.cssText = [
    `font:${LABEL_FONT}`,
    `color:${colors.text}`,
    `background:${colors.bg}`,
    `border:1px solid ${colors.border}`,
    "border-radius:6px",
    "padding:3px 6px",
    "white-space:nowrap",
  ].join(";");

  root.append(pulse, label);
  return root;
}

/**
 * MapLibre GL prospectivity map with a togglable NGDR / GSI Bhukosh geology
 * overlay (Sausar Group lithology + fault lineaments).
 *
 * SSR-safe: the server and first client render emit only the static shell.
 * `maplibre-gl` touches `window` at import time, so it is loaded dynamically
 * inside an effect and never evaluated on the server.
 *
 * The map instance survives mine changes — the camera flies to the new mine
 * and markers are rebuilt, instead of paying WebGL re-initialisation.
 */
export function ProspectivityMap() {
  const { mine, mines } = useDashboard();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const initialCenterRef = useRef(mine.coordinates);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [basemapFailed, setBasemapFailed] = useState(false);
  const t = useUiText();
  const [overlayVisible, setOverlayVisible] = useState(true);
  // Read by the load handler so a toggle made before load is honoured.
  const overlayVisibleRef = useRef(overlayVisible);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const heatmapVisibleRef = useRef(heatmapVisible);
  // Map event handlers outlive renders; they read the current translator here.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const popupRef = useRef<Popup | null>(null);

  // Create the map once. Effects never run during SSR, but the explicit window
  // guard keeps this safe if the component is ever rendered by a non-React
  // server path or a test environment without a DOM.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (container === null) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let styleTimeout: number | undefined;

    import("maplibre-gl")
      .then((lib) => {
        if (cancelled) return;
        libRef.current = lib;
        // Vite fingerprints and emits this worker. Setting it explicitly avoids
        // MapLibre resolving a non-existent sibling beside the optimized chunk.
        lib.setWorkerUrl(mapLibreWorkerUrl);

        try {
          const { lat, lon } = initialCenterRef.current;
          map = new lib.Map({
            container,
            style: BASEMAP_STYLE_URL,
            center: [lon, lat],
            zoom: MINE_ZOOM,
            attributionControl: { compact: true },
          });
        } catch {
          // Typically WebGL unavailable (old GPU, disabled hardware acceleration).
          setStatus("error");
          return;
        }

        const instance = map;
        instance.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");

        // Attach overlay layers as soon as the style is parsed. `load` waits
        // for every basemap tile, so one slow or blocked tile host would leave
        // the whole map stuck behind the loading state.
        let initialised = false;
        let usingFallback = false;
        const switchToFallback = () => {
          if (cancelled || initialised || usingFallback) return;
          usingFallback = true;
          setBasemapFailed(true);
          instance.setStyle(FALLBACK_STYLE);
          instance.once("style.load", onStyleReady);
        };
        styleTimeout = window.setTimeout(switchToFallback, STYLE_TIMEOUT_MS);

        const onStyleReady = () => {
          if (cancelled || initialised) return;
          initialised = true;
          window.clearTimeout(styleTimeout);
          if (instance.getSource(GEOLOGY_SOURCE_ID) === undefined) {
            instance.addSource(GEOLOGY_SOURCE_ID, { type: "geojson", data: NGDR_GEOLOGY_LAYER });
          }
          const visibility = overlayVisibleRef.current ? "visible" : "none";
          // Slot the geology beneath the basemap's first label layer so town
          // and road names stay readable on top of the fills.
          const beforeId = instance.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
          for (const layer of OVERLAY_LAYERS) {
            if (instance.getLayer(layer.id) === undefined) instance.addLayer(layer, beforeId);
            instance.setLayoutProperty(layer.id, "visibility", visibility);
          }
          // Heatmap sits above the translucent lithology fill but under the
          // outlines and lineaments, so structure stays readable on top.
          if (instance.getSource(HEATMAP_SOURCE_ID) === undefined) {
            instance.addSource(HEATMAP_SOURCE_ID, {
              type: "image",
              url: PROSPECTIVITY.heatmap.url,
              coordinates: PROSPECTIVITY.heatmap.coordinates,
            });
          }
          if (instance.getLayer(HEATMAP_LAYER.id) === undefined) {
            instance.addLayer(HEATMAP_LAYER, "ngdr-lithology-outline");
          }
          instance.setLayoutProperty(
            HEATMAP_LAYER.id,
            "visibility",
            heatmapVisibleRef.current ? "visible" : "none",
          );
          mapRef.current = instance;
          setStatus("ready");
        };
        instance.once("style.load", onStyleReady);
        instance.once("load", onStyleReady);

        // The OpenFreeMap dark style references a few pattern images (e.g.
        // "wood-pattern" at high zoom) that its sprite doesn't ship. In
        // MapLibre 6 only the resolver can supply an image before MapLibre
        // logs it as missing; a `styleimagemissing` listener fires too late.
        instance.setMissingStyleImageResolver((imageId) => {
          if (!instance.hasImage(imageId)) {
            instance.addImage(imageId, { width: 1, height: 1, data: new Uint8Array(4) });
          }
        });
        if (instance.isStyleLoaded()) onStyleReady();

        // Basemap tile failures (offline, blocked CDN) are non-fatal: the
        // geology overlay and markers still render, and a notice explains the
        // missing background.
        instance.on("error", (event) => {
          if (cancelled) return;
          const sourceId = (event as { sourceId?: unknown }).sourceId;
          // No sourceId before the style loads means the style itself failed.
          if (!initialised && sourceId === undefined) {
            switchToFallback();
            return;
          }
          if (
            typeof sourceId === "string" &&
            sourceId !== GEOLOGY_SOURCE_ID &&
            sourceId !== HEATMAP_SOURCE_ID
          ) {
            setBasemapFailed(true);
          }
        });

        // Click to inspect: the nearest 500 m cell, read live from Supabase.
        let clickRequest = 0;
        instance.getCanvas().style.cursor = "crosshair";
        instance.on("click", (event) => {
          const { lat: clickLat, lng: clickLon } = event.lngLat;
          const requestId = ++clickRequest;
          popupRef.current?.remove();
          const popup = new lib.Popup({ closeButton: true, maxWidth: "260px" })
            .setLngLat(event.lngLat)
            .setDOMContent(buildCellPopup(tRef.current, null))
            .addTo(instance);
          popupRef.current = popup;
          void fetchNearestGridCell(clickLat, clickLon).then((result) => {
            if (cancelled || requestId !== clickRequest) return;
            popup.setDOMContent(buildCellPopup(tRef.current, result));
          });
        });

        // The panel can change size without a window resize (tab reveal,
        // sidebar, breakpoint), so track the container itself.
        resizeObserver = new ResizeObserver(() => instance.resize());
        resizeObserver.observe(container);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(styleTimeout);
      resizeObserver?.disconnect();
      popupRef.current?.remove();
      popupRef.current = null;
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  // Rebuild markers whenever the roster or active mine changes.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (status !== "ready" || map === null || lib === null) return;

    for (const marker of markersRef.current) marker.remove();
    const next: Marker[] = [];

    for (const site of mines) {
      const isActive = site.id === mine.id;
      next.push(
        new lib.Marker({
          element: createSiteElement(site, isActive),
          anchor: "left",
          offset: [isActive ? -7 : -4.5, 0],
        })
          .setLngLat([site.coordinates.lon, site.coordinates.lat])
          .addTo(map),
      );
    }

    for (const beacon of mine.mapBeacons) {
      next.push(
        new lib.Marker({ element: createBeaconElement(beacon), anchor: "left", offset: [-5, 0] })
          .setLngLat([beacon.coordinates.lon, beacon.coordinates.lat])
          .addTo(map),
      );
    }

    if (heatmapVisible) {
      for (const target of PROSPECTIVITY.targets) {
        next.push(
          new lib.Marker({ element: createTargetElement(target), anchor: "left", offset: [-5, 0] })
            .setLngLat([target.lon, target.lat])
            .addTo(map),
        );
      }
    }

    markersRef.current = next;
  }, [status, mines, mine, heatmapVisible]);

  // "Show on map" requests from the target list.
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || map === null) return;
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<MapFocusDetail>).detail;
      map.flyTo({ center: [detail.lon, detail.lat], zoom: detail.zoom ?? 13, essential: false });
    };
    window.addEventListener(MAP_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(MAP_FOCUS_EVENT, onFocus);
  }, [status]);

  useEffect(() => {
    heatmapVisibleRef.current = heatmapVisible;
    const map = mapRef.current;
    if (status !== "ready" || map === null) return;
    if (map.getLayer(HEATMAP_LAYER.id) !== undefined) {
      map.setLayoutProperty(HEATMAP_LAYER.id, "visibility", heatmapVisible ? "visible" : "none");
    }
  }, [status, heatmapVisible]);

  // Fly to the active mine. `essential: false` lets MapLibre skip the animation
  // under prefers-reduced-motion.
  const { lat, lon } = mine.coordinates;
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || map === null) return;
    map.flyTo({ center: [lon, lat], zoom: MINE_ZOOM, essential: false });
  }, [status, lat, lon]);

  // Apply the overlay toggle.
  useEffect(() => {
    overlayVisibleRef.current = overlayVisible;
    const map = mapRef.current;
    if (status !== "ready" || map === null) return;
    const visibility = overlayVisible ? "visible" : "none";
    for (const layer of OVERLAY_LAYERS) {
      if (map.getLayer(layer.id) !== undefined) {
        map.setLayoutProperty(layer.id, "visibility", visibility);
      }
    }
  }, [status, overlayVisible]);

  return (
    <div className="flex h-full min-h-[340px] flex-col overflow-hidden rounded-md bg-console-deep">
      <div className="relative min-h-0 flex-1">
        {/*
          MapLibre adds `.maplibregl-map { position: relative }` to its container,
          and that stylesheet loads after Tailwind, so an `absolute inset-0` on the
          container itself is overridden and the map collapses to 0px tall. The
          wrapper owns the absolute fill; the container just takes 100%.
        */}
        <div className="absolute inset-0">
          <div
            ref={containerRef}
            className="h-full w-full"
            role="region"
            aria-label={t("map.region", { belt: mine.beltName, mine: mine.label })}
          />
        </div>

        <ul className="sr-only">
          {mines.map((site) => (
            <li key={site.id}>
              {site.label}
              {site.id === mine.id ? ` ${t("map.selected")}` : ""}:{" "}
              {formatLatitude(site.coordinates.lat)}, {formatLongitude(site.coordinates.lon)}
            </li>
          ))}
          {mine.mapBeacons.map((beacon) => (
            <li key={beacon.id}>{beacon.label}</li>
          ))}
          {heatmapVisible
            ? PROSPECTIVITY.targets.map((target) => (
                <li key={target.id}>
                  {t("targets.title")} {target.id}: {t("map.cell.score")}{" "}
                  {formatScore(target.score)}, {formatLatitude(target.lat)},{" "}
                  {formatLongitude(target.lon)}
                </li>
              ))
            : null}
        </ul>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => setOverlayVisible((visible) => !visible)}
            aria-pressed={overlayVisible}
            disabled={status === "error"}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold transition-colors duration-200 active:scale-[0.97]",
              "focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
              overlayVisible
                ? "border-teal-400/60 bg-teal-950/70 text-teal-200 hover:bg-teal-900/70"
                : "border-slate-600 bg-slate-950/70 text-slate-300 hover:bg-slate-900/70",
            )}
          >
            <Layers className="size-3" aria-hidden="true" />
            <span className="hidden sm:inline">{t("map.toggle")}</span>
            <span className="sm:hidden">{t("map.toggleShort")}</span>
            <span className="sr-only">{overlayVisible ? t("map.on") : t("map.off")}</span>
          </button>
          <button
            type="button"
            onClick={() => setHeatmapVisible((visible) => !visible)}
            aria-pressed={heatmapVisible}
            disabled={status === "error"}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold transition-colors duration-200 active:scale-[0.97]",
              "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
              heatmapVisible
                ? "border-amber-400/60 bg-amber-950/70 text-amber-100 hover:bg-amber-900/70"
                : "border-slate-600 bg-slate-950/70 text-slate-300 hover:bg-slate-900/70",
            )}
          >
            <Satellite className="size-3" aria-hidden="true" />
            {t("map.heatmapToggle")}
            <span className="sr-only">{heatmapVisible ? t("map.on") : t("map.off")}</span>
          </button>
          <span className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            {mine.beltName}
          </span>
        </div>

        {status === "ready" ? (
          <div className="pointer-events-none absolute bottom-9 right-2 z-10 rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1.5">
            {heatmapVisible ? (
              <>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {t("map.heatmapLegend")}
                </p>
                <span
                  className="block h-1.5 w-36 rounded-full"
                  style={{ background: HEATMAP_GRADIENT }}
                  aria-hidden="true"
                />
                <span className="mt-0.5 flex justify-between font-mono text-[9px] text-slate-300">
                  <span>{formatScore(PROSPECTIVITY.heatmap.threshold)}</span>
                  <span>1.00</span>
                </span>
              </>
            ) : null}
            <p className="mt-1 text-[9px] text-slate-400">{t("map.clickHint")}</p>
          </div>
        ) : null}

        {overlayVisible && status === "ready" ? (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1.5">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {t("map.legend")}
            </p>
            <ul className="space-y-0.5">
              {GEOLOGY_LEGEND.map((entry) => (
                <li
                  key={entry.unit}
                  className="flex items-center gap-1.5 text-[10px] text-slate-200"
                >
                  {entry.kind === "lineament" ? (
                    <span
                      className="h-0 w-3.5 border-t-2 border-dashed"
                      style={{ borderColor: entry.color }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="size-2.5 rounded-sm border"
                      style={{ backgroundColor: `${entry.color}55`, borderColor: entry.color }}
                      aria-hidden="true"
                    />
                  )}
                  {entry.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] text-slate-400">
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
              {t("map.loading")}
            </span>
          </div>
        ) : null}

        {status === "ready" && basemapFailed ? (
          <p
            className="pointer-events-none absolute right-2 top-24 z-10 max-w-[14rem] rounded-md border border-amber-400/40 bg-slate-950/90 px-2 py-1.5 text-[10px] leading-4 text-amber-200"
            role="status"
          >
            {t("map.basemapFailed")}
          </p>
        ) : null}

        {status === "error" ? (
          <div
            className="absolute inset-0 grid place-items-center p-4 text-center text-[11px] text-slate-300"
            role="status"
          >
            <span className="flex max-w-xs flex-col items-center gap-2">
              <MapPinOff className="size-5 text-slate-500" aria-hidden="true" />
              {t("map.webgl")}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800 bg-slate-950/90 px-3 py-1.5 font-mono text-[10px] text-teal-300">
        <span>Lat {formatLatitude(mine.coordinates.lat)}</span>
        <span>Lon {formatLongitude(mine.coordinates.lon)}</span>
        <span>
          ~{mine.depthMeters} m {mine.type}
        </span>
        <span>{mine.oreProfile}</span>
        <span>{t("pros.score", { score: formatScore(mine.prospectivityScore) })}</span>
        <span className="text-slate-400">
          {t("map.groundTruth")}: {mine.officialSource}
        </span>
      </div>
    </div>
  );
}

/** Card-footer attribution for the prospectivity explorer. */
export function ProspectivityMapAttribution() {
  const t = useUiText();
  return (
    <p className="text-[10px] leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">{t("map.sources")}</span> Contains modified
      Copernicus Sentinel data {PROSPECTIVITY.sources.imageryWindow[1].slice(0, 4)} and Copernicus
      DEM GLO-90 (ESA, via Copernicus Data Space Ecosystem) | GSI Bhukosh (Geological Maps) | NGDR
      (GIS Layers) | MOIL Investor Relations (Ground Truth)
      <span className="block sm:inline"> · {t("map.overlayNote")}</span>
    </p>
  );
}
