import { useDashboard } from "@/context/use-dashboard";
import { formatLatitude, formatLongitude, formatScore } from "@/lib/format";

import { Beacon } from "./Beacon";

const BEACON_LABEL_STYLES = {
  rose: {
    background: "rgba(255,241,242,0.15)",
    borderColor: "rgba(251,113,133,0.5)",
    color: "#FECDD3",
  },
  amber: {
    background: "rgba(254,243,199,0.12)",
    borderColor: "rgba(251,191,36,0.5)",
    color: "#FDE68A",
  },
  emerald: {
    background: "rgba(204,251,241,0.12)",
    borderColor: "rgba(52,211,153,0.5)",
    color: "#A7F3D0",
  },
} as const;

/**
 * GIS map surface.
 *
 * Currently a CSS-rendered stand-in, but every position and label is read from
 * the mine profile (including real lat/lon on each beacon), so swapping in
 * MapLibre GL is contained to this file — no data-layer changes needed.
 */
export function MapView() {
  const { mine } = useDashboard();

  return (
    <div className="relative h-full min-h-[340px] overflow-hidden rounded-md bg-console-deep">
      <div className="absolute inset-0 opacity-40 bg-map-grid" aria-hidden="true" />

      {/* Mineralised belt glow */}
      <div
        className="absolute left-[8%] top-[30%] h-24 w-[80%] -rotate-12 rounded-full blur-2xl"
        style={{ background: "rgba(45,212,191,0.18)" }}
        aria-hidden="true"
      />

      <div className="absolute left-4 top-3 max-w-[80%] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {mine.beltName} · {mine.label}
      </div>

      <div className="animate-radar" aria-hidden="true" />

      {mine.mapBeacons.map((beacon) => {
        const labelStyle = BEACON_LABEL_STYLES[beacon.tone] ?? BEACON_LABEL_STYLES.emerald;
        return (
          <div
            key={beacon.id}
            className="absolute flex items-center gap-2"
            style={{ left: `${beacon.xPct}%`, top: `${beacon.yPct}%` }}
          >
            <Beacon tone={beacon.tone} />
            <span
              className="rounded-md border px-2 py-1 text-[10px] font-semibold backdrop-blur"
              style={labelStyle}
            >
              {beacon.label}
            </span>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800 bg-slate-950/85 px-3 py-1.5 font-mono text-[10px] text-teal-300">
        <span>Lat {formatLatitude(mine.coordinates.lat)}</span>
        <span>Lon {formatLongitude(mine.coordinates.lon)}</span>
        <span>Res {mine.gridResolution}</span>
        <span>
          {mine.depthMeters} m {mine.type}
        </span>
        <span>Score {formatScore(mine.prospectivityScore)}</span>
        <span>GSI Bhukosh active</span>
      </div>
    </div>
  );
}
