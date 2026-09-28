import { Activity, Database, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import { useDashboard } from "@/context/use-dashboard";
import {
  CORRELATED_PRODUCTION_RECORDS,
  getRecordsForMine,
  lossCorrelation,
  summarizeRecords,
} from "@/data/mockProductionData";
import { useUiText } from "@/i18n/use-ui-text";
import { formatPercent, formatTonnes } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Panel } from "./Panel";

/**
 * Flip to `true` only once `production_logs` is loaded from real data and
 * reconciled against MOIL's monthly production disclosures on NSE. While the
 * table shows the synthetic fixture, claiming validation would be false.
 */
const VALIDATED_AGAINST_MOIL_FILINGS = false;

function FilingsValidationBadge() {
  const t = useUiText();
  const Icon = VALIDATED_AGAINST_MOIL_FILINGS ? ShieldCheck : ShieldAlert;
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        VALIDATED_AGAINST_MOIL_FILINGS
          ? "border-teal/40 bg-teal-soft text-teal"
          : "border-amber-300 bg-amber-100 text-amber-900",
      )}
      title={
        VALIDATED_AGAINST_MOIL_FILINGS
          ? "Monthly totals reconciled with MOIL production disclosures filed on NSE."
          : "Synthetic fixture. Reconcile real production_logs with MOIL NSE monthly filings, then set VALIDATED_AGAINST_MOIL_FILINGS."
      }
    >
      <Icon className="size-3" aria-hidden="true" />
      {VALIDATED_AGAINST_MOIL_FILINGS ? t("log.validated") : t("log.pending")}
    </span>
  );
}

export function ProductionLogPanel({ expanded = false }: { expanded?: boolean | undefined }) {
  const { mine } = useDashboard();
  const t = useUiText();

  // Correlated variant: actual_tonnes responds to downtime and rainfall using the
  // same coefficients as the scenario simulator, so the table shows real signal
  // instead of independent noise.
  const records = useMemo(
    () => getRecordsForMine(mine.label, CORRELATED_PRODUCTION_RECORDS),
    [mine.label],
  );
  const summary = useMemo(() => summarizeRecords(records), [records]);

  // Measured, not asserted. Computed across the whole fixture because a
  // single-mine slice can be as small as three rows.
  const correlation = useMemo(() => lossCorrelation(CORRELATED_PRODUCTION_RECORDS), []);

  return (
    <Panel
      title={t("log.title")}
      provenance="synthetic"
      description={t("log.desc")}
      right={
        <span className="flex flex-wrap items-center gap-2">
          <FilingsValidationBadge />
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Database className="size-3" aria-hidden="true" />
            {t("log.seeded")}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
              correlation !== null && correlation < -0.8
                ? "bg-teal-soft text-teal"
                : "bg-amber-100 text-amber-900",
            )}
            title="Pearson correlation between modelled loss (downtime × 140 + rainfall × 55) and actual tonnage, across the full fixture."
          >
            <Activity className="size-2.5" aria-hidden="true" />r ={" "}
            {correlation === null ? "—" : correlation.toFixed(3)}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            {t("log.rows", { shown: records.length, total: CORRELATED_PRODUCTION_RECORDS.length })}
          </span>
        </span>
      }
    >
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: t("common.attainment"), value: formatPercent(summary.attainmentPct) },
            { label: t("log.avgDowntime"), value: `${summary.avgHoistDowntimeHrs} hrs` },
            { label: t("log.totalRainfall"), value: `${summary.totalRainfallMm} mm` },
            {
              label: t("log.daysBelow"),
              value: `${summary.daysBelowTarget} / ${summary.recordCount}`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-border bg-panel-grid px-2 py-1.5"
            >
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="font-mono text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {records.length === 0 ? (
          <div className="grid place-items-center rounded-md border border-dashed border-border bg-panel-grid p-6 text-center text-xs text-muted-foreground">
            {t("log.empty", { mine: mine.label })}
          </div>
        ) : (
          <div
            role="region"
            aria-label={t("log.tableLabel", { mine: mine.label })}
            tabIndex={0}
            className={cn(
              "overflow-auto rounded-xl border border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              expanded ? "max-h-[520px]" : "max-h-[260px]",
            )}
          >
            <table className="w-full min-w-[680px] border-collapse text-left text-[11px]">
              <caption className="sr-only">
                Synthetic daily production records for {mine.label}
              </caption>
              <thead className="sticky top-0 bg-secondary">
                <tr className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th scope="col" className="px-2 py-1.5 font-semibold">
                    {t("log.col.date")}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    {t("log.col.downtime")}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    {t("log.col.rainfall")}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    {t("common.target")}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    {t("common.actual")}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    {t("log.col.var")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const variance = record.actual_tonnes - record.target_tonnes;
                  return (
                    <tr
                      key={`${record.mine_name}-${record.date}`}
                      className="border-t border-border font-mono odd:bg-panel-grid"
                    >
                      <td className="px-2 py-1.5">{record.date}</td>
                      <td className="px-2 py-1.5 text-right">
                        {record.hoist_downtime_hrs.toFixed(1)} h
                      </td>
                      <td className="px-2 py-1.5 text-right">{record.rainfall_mm.toFixed(1)} mm</td>
                      <td className="px-2 py-1.5 text-right">
                        {formatTonnes(record.target_tonnes)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {formatTonnes(record.actual_tonnes)}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-1.5 text-right font-semibold",
                          variance < 0 ? "text-coral" : "text-teal",
                        )}
                      >
                        {variance < 0 ? "−" : "+"}
                        {formatTonnes(Math.abs(variance))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[10px] leading-relaxed text-muted-foreground">{t("log.note")}</p>
      </div>
    </Panel>
  );
}
