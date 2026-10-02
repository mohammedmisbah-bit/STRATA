import { Crosshair } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { PROSPECTIVITY } from "@/data/prospectivity";
import { useUiText } from "@/i18n/use-ui-text";
import { formatLatitude, formatLongitude, formatScore } from "@/lib/format";
import { requestMapFocus } from "@/lib/map-events";

import { Panel } from "./Panel";
import { panelId } from "./view-meta";

const MINE_LABELS: Record<string, string> = Object.fromEntries(
  PROSPECTIVITY.sources.labels.map((mine) => [mine.id, mine.label]),
);

/** Ranked greenfield clusters from the pipeline, each one a click from the map. */
export function ProspectTargetsPanel() {
  const t = useUiText();
  const { setActiveView } = useDashboard();

  const showOnMap = (lat: number, lon: number) => {
    setActiveView("map");
    document.getElementById(panelId("map"))?.scrollIntoView({ block: "center" });
    requestMapFocus({ lat, lon, zoom: 13 });
  };

  return (
    <Panel title={t("targets.title")} provenance="satellite" description={t("targets.desc")}>
      <ol className="space-y-2">
        {PROSPECTIVITY.targets.map((target) => (
          <li
            key={target.id}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-slate-50/60 px-3 py-2.5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-100 font-mono text-[10px] font-bold text-violet-800">
              {target.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] tabular-nums">
                <strong className="text-foreground">{formatScore(target.score)}</strong>
                <span className="text-muted-foreground">
                  [{formatScore(target.lo)}–{formatScore(target.hi)}]
                </span>
                <span className="text-muted-foreground">{target.areaKm2.toFixed(1)} km²</span>
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {t("targets.near", {
                  km: target.nearestMineKm.toFixed(1),
                  mine: MINE_LABELS[target.nearestMine] ?? target.nearestMine,
                })}{" "}
                · {formatLatitude(target.lat)}, {formatLongitude(target.lon)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => showOnMap(target.lat, target.lon)}
              aria-label={t("targets.showLabel", { id: target.id })}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-white px-2 py-1.5 text-[10px] font-bold text-teal transition-colors hover:bg-teal-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Crosshair className="size-3" aria-hidden="true" />
              <span className="hidden sm:inline">{t("targets.show")}</span>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
