import { Activity, Database } from "lucide-react";
import { useMemo } from "react";

import { useDashboard } from "@/context/use-dashboard";
import {
  CORRELATED_PRODUCTION_RECORDS,
  getRecordsForMine,
  lossCorrelation,
  summarizeRecords,
} from "@/data/mockProductionData";
import { formatPercent, formatTonnes } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Panel } from "./Panel";

export function ProductionLogPanel() {
  const { mine } = useDashboard();

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
      title="Daily Production Log · Synthetic"
      right={
        <span className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Database className="size-3" aria-hidden="true" />
            Correlated · seeded
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
            {records.length} / {CORRELATED_PRODUCTION_RECORDS.length} rows
          </span>
        </span>
      }
    >
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Attainment", value: formatPercent(summary.attainmentPct) },
            { label: "Avg downtime", value: `${summary.avgHoistDowntimeHrs} hrs` },
            { label: "Total rainfall", value: `${summary.totalRainfallMm} mm` },
            {
              label: "Days below target",
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
            The 30-record fixture assigns one mine per day, so {mine.label} has no rows in this
            sample. Switch mine, or change VITE_MOCK_SEED to reshuffle.
          </div>
        ) : (
          <div className="max-h-[220px] overflow-auto rounded-md border border-border">
            <table className="w-full border-collapse text-left text-[11px]">
              <caption className="sr-only">
                Synthetic daily production records for {mine.label}
              </caption>
              <thead className="sticky top-0 bg-secondary">
                <tr className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th scope="col" className="px-2 py-1.5 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    Downtime
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    Rainfall
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    Target
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    Actual
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    Var
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

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Synthetic fixture standing in for the Supabase <code>production_logs</code> table, from{" "}
          <code>generateCorrelatedRecords()</code>. <code>actual_tonnes</code> is derived from
          downtime and rainfall using the simulator's own coefficients plus noise, so the series is
          fittable — the <code>r</code> badge above is measured from the data, not hardcoded.
        </p>
      </div>
    </Panel>
  );
}
