import { useQuery } from "@tanstack/react-query";
import { Database, TriangleAlert } from "lucide-react";

import { PROSPECTIVITY } from "@/data/prospectivity";
import { useUiText } from "@/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import { fetchGridCellCount } from "@/services/prospectivityService";

import { Panel } from "./Panel";

const LABELS = new Map(PROSPECTIVITY.validation.mines.map((row) => [row.id, row.label]));

function aucTone(auc: number): string {
  if (auc >= 0.75) return "text-teal";
  if (auc >= 0.6) return "text-amber-700";
  return "text-rose-700";
}

/**
 * Honest scorecard for the satellite model: spatially grouped
 * leave-one-mine-out AUC per deposit, the simple-index baseline, what the
 * forest leans on, and a live row count from the Supabase grid.
 */
export function ModelValidationPanel() {
  const t = useUiText();
  const { validation, features, generatedAt, sources } = PROSPECTIVITY;
  const topFeatures = features.slice(0, 6);
  const maxImportance = topFeatures[0]?.importance ?? 1;

  const countQuery = useQuery({
    queryKey: ["prospectivity-grid-count"],
    queryFn: fetchGridCellCount,
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const liveCount = countQuery.data ?? null;

  return (
    <Panel
      title={t("val.title")}
      provenance="satellite"
      description={t("val.desc")}
      footer={
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Database className="size-3" aria-hidden="true" />
            {countQuery.isPending
              ? "…"
              : liveCount === null
                ? t("val.liveCellsOffline")
                : t("val.liveCells", { count: liveCount.toLocaleString("en-IN") })}
          </span>
          <span>
            {t("val.generated", {
              date: generatedAt.slice(0, 10),
              obs: sources.medianClearObservations,
            })}
          </span>
        </p>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#0a202a] p-4 text-white">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-200/70">
            {t("val.meanAuc")}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.05em] tabular-nums">
            {validation.meanAuc.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">{t("val.scale")}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-slate-50/70 p-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("val.baseline")}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.05em] text-slate-500 tabular-nums">
            {validation.baselineMeanAuc.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground" lang="en">
            {validation.baselineDescription}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-left text-[11px]">
          <thead>
            <tr className="border-b border-border/70 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className="py-2 pr-2 font-bold">
                {t("val.col.mine")}
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-bold">
                {t("val.col.auc")}
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-bold">
                {t("val.col.baseline")}
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                {t("val.col.rank")}
              </th>
            </tr>
          </thead>
          <tbody>
            {validation.mines.map((row) => (
              <tr key={row.id} className="border-b border-border/50 last:border-0">
                <th scope="row" className="py-2 pr-2 font-semibold text-foreground">
                  {row.label}
                  {row.heldOutWith.length > 0 ? (
                    <span className="block text-[9px] font-normal text-muted-foreground">
                      {t("val.withNeighbour", {
                        mines: row.heldOutWith.map((id) => LABELS.get(id) ?? id).join(", "),
                      })}
                    </span>
                  ) : null}
                </th>
                <td
                  className={cn(
                    "py-2 pr-2 text-right font-mono font-semibold tabular-nums",
                    aucTone(row.auc),
                  )}
                >
                  {row.auc.toFixed(2)}
                </td>
                <td className="py-2 pr-2 text-right font-mono text-slate-500 tabular-nums">
                  {row.baselineAuc.toFixed(2)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-foreground">
                  {t("val.rank", { pct: row.topPercent.toFixed(row.topPercent < 10 ? 1 : 0) })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-4 text-xs font-bold text-foreground">{t("val.features")}</h3>
      <ul className="mt-2 space-y-1.5">
        {topFeatures.map((feature) => (
          <li key={feature.id} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-2">
            <span className="truncate text-[10px] text-muted-foreground" lang="en">
              {feature.label}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span
                className="block h-full rounded-full bg-teal"
                style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-[10px] tabular-nums text-foreground">
              {(feature.importance * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t("val.caveat")}
      </p>
    </Panel>
  );
}
