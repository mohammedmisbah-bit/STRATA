import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatScore } from "@/lib/format";

export function ConfidenceView() {
  const { mine } = useDashboard();
  const t = useUiText();

  // Recharts needs the interval as a [lo, hi] tuple to render a banded Area.
  const data = useMemo(
    () =>
      mine.confidenceBands.map((band) => ({
        ...band,
        range: [band.lo, band.hi] as [number, number],
      })),
    [mine],
  );

  return (
    <div className="flex h-full min-h-[340px] flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold">{t("confidence.heading", { mine: mine.label })}</p>
        <span className="rounded-full bg-teal-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-teal">
          {t("confidence.variance", { variance: formatScore(mine.prospectivityVariance) })}
        </span>
      </div>

      <div className="min-h-0 flex-1 rounded-md border border-border bg-panel-grid p-2">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            {t("confidence.empty", { mine: mine.label })}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="band"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                  background: "#FFFFFF",
                }}
                formatter={(value: number | number[], name: string) =>
                  Array.isArray(value)
                    ? [`${formatScore(value[0])} – ${formatScore(value[1])}`, "95% CI"]
                    : [formatScore(value), name === "mean" ? "Mean score" : name]
                }
              />
              <Area
                type="monotone"
                dataKey="range"
                stroke="#99F6E4"
                fill="#CCFBF1"
                fillOpacity={0.8}
                name="95% CI"
              />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="#0F766E"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0F766E" }}
                name="mean"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
