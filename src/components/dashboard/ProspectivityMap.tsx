import "maplibre-gl/dist/maplibre-gl.css";

// `?worker&url` makes Vite bundle the worker together with its own imports
// (`./maplibre-gl-shared.mjs`). A plain `?url` copies the file raw, and the
// shared chunk it imports is never emitted, so the worker 404s in production.
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type {
  LayerSpecification,
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from "maplibre-gl";
import { Layers, Loader2, MapPinOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDashboard } from "@/context/use-dashboard";
import { GEOLOGY_LEGEND, NGDR_GEOLOGY_LAYER } from "@/data/ngdrGeologyLayer";
import { formatLatitude, formatLongitude, formatScore } from "@/lib/format";
import type { BeaconTone, MapBeacon, MineProfile } from "@/lib/mine-data";
import { cn } from "@/lib/utils";

type MapLibreModule = typeof import("maplibre-gl");
type MapStatus = "loading" | "ready" | "error";

const GEOLOGY_SOURCE_ID = "ngdr-geology";
const MINE_ZOOM = 9;

/**
 * Keyless dark raster basemap (CARTO over OpenStreetMap). Free for
 * low-volume use with attribution; move to a paid or self-hosted tile source
 * before heavy production traffic.
 */
const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    basemap: {
      type: "raster",
      tiles: ["a", "b", "c"].map(
        (sub) => `https://${sub}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`,
      ),
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "basemap", type: "raster", source: "basemap" }],
};

/** NGDR / GSI overlay, bottom to top. All share the geology source. */
const OVERLAY_LAYERS: LayerSpecification[] = [
  {
    id: "ngdr-lithology-fill",
    type: "fill",
    source: GEOLOGY_SOURCE_ID,
    filter: ["==", ["get", "kind"], "lithology"],
    paint: { "fill-color": ["get", "color"], "fill-opacity": ["get", "opacity"] },
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
  const [overlayVisible, setOverlayVisible] = useState(true);
  // Read by the load handler so a toggle made before load is honoured.
  const overlayVisibleRef = useRef(overlayVisible);

  // Create the map once. Effects never run during SSR, but the explicit window
  // guard keeps this safe if the component is ever rendered by a non-React
  // server path or a test environment without a DOM.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (container === null) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;

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
            style: BASEMAP_STYLE,
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

        instance.on("load", () => {
          if (cancelled) return;
          instance.addSource(GEOLOGY_SOURCE_ID, { type: "geojson", data: NGDR_GEOLOGY_LAYER });
          const visibility = overlayVisibleRef.current ? "visible" : "none";
          for (const layer of OVERLAY_LAYERS) {
            instance.addLayer(layer);
            instance.setLayoutProperty(layer.id, "visibility", visibility);
          }
          mapRef.current = instance;
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
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

    markersRef.current = next;
  }, [status, mines, mine]);

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
        <div
          ref={containerRef}
          className="absolute inset-0"
          role="region"
          aria-label={`Map of ${mine.beltName}, centred on ${mine.label}`}
        />

        <ul className="sr-only">
          {mines.map((site) => (
            <li key={site.id}>
              {site.label}
              {site.id === mine.id ? " (selected)" : ""}: {formatLatitude(site.coordinates.lat)},{" "}
              {formatLongitude(site.coordinates.lon)}
            </li>
          ))}
          {mine.mapBeacons.map((beacon) => (
            <li key={beacon.id}>{beacon.label}</li>
          ))}
        </ul>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => setOverlayVisible((visible) => !visible)}
            aria-pressed={overlayVisible}
            disabled={status === "error"}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold backdrop-blur transition-colors",
              "focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
              overlayVisible
                ? "border-teal-400/60 bg-teal-950/70 text-teal-200 hover:bg-teal-900/70"
                : "border-slate-600 bg-slate-950/70 text-slate-300 hover:bg-slate-900/70",
            )}
          >
            <Layers className="size-3" aria-hidden="true" />
            <span className="hidden sm:inline">[ Toggle NGDR Geological Overlay ]</span>
            <span className="sm:hidden">Geology overlay</span>
            <span className="sr-only">{overlayVisible ? "(on)" : "(off)"}</span>
          </button>
          <span className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            {mine.beltName}
          </span>
        </div>

        {overlayVisible && status === "ready" ? (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 backdrop-blur">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              NGDR / GSI Bhukosh · simulated
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
              Loading map…
            </span>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            className="absolute inset-0 grid place-items-center p-4 text-center text-[11px] text-slate-300"
            role="status"
          >
            <span className="flex max-w-xs flex-col items-center gap-2">
              <MapPinOff className="size-5 text-slate-500" aria-hidden="true" />
              The map needs WebGL, which isn't available in this browser. Mine coordinates are
              listed below.
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
        <span>Score {formatScore(mine.prospectivityScore)}</span>
        <span className="text-slate-400">Ground truth: {mine.officialSource}</span>
      </div>
    </div>
  );
}

/** Card-footer attribution for the prospectivity explorer. */
export function ProspectivityMapAttribution() {
  return (
    <p className="text-[10px] leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">Data Sources:</span> GSI Bhukosh (Geological
      Maps) | NGDR (GIS Layers) | MOIL Investor Relations (Ground Truth)
      <span className="block sm:inline">
        {" "}
        · Overlay geometry is a simulated approximation of the GSI / NGDR layers, not digitised
        vectors.
      </span>
    </p>
  );
}
