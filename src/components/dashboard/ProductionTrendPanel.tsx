import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatPercent, formatTonnes } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Panel } from "./Panel";

export function ProductionTrendPanel({ expanded = false }: { expanded?: boolean | undefined }) {
  const { mine, scenario } = useDashboard();
  const t = useUiText();

  const summary = useMemo(() => {
    const points = mine.trend;
    if (points.length === 0) {
      return { attainmentPct: 0, monthsBelowTarget: 0, bestMonth: null, worstMonth: null };
    }

    const totalActual = points.reduce((sum, point) => sum + point.actual, 0);
    const totalTarget = points.reduce((sum, point) => sum + point.target, 0);

    let best = points[0] ?? null;
    let worst = points[0] ?? null;
    for (const point of points) {
      if (best && point.actual > best.actual) best = point;
      if (worst && point.actual < worst.actual) worst = point;
    }

    return {
      attainmentPct: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
      monthsBelowTarget: points.filter((point) => point.actual < point.target).length,
      bestMonth: best,
      worstMonth: worst,
    };
  }, [mine]);

  const hasData = mine.trend.length > 0;

  return (
    <Panel
      title={t("trend.title")}
      provenance="simulated"
      description={t("trend.desc")}
      right={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
            summary.attainmentPct >= 95
              ? "bg-emerald-100 text-emerald-800"
              : summary.attainmentPct >= 85
                ? "bg-amber-100 text-amber-900"
                : "bg-rose-100 text-rose-800",
          )}
        >
          {t("prod.fyAttainment", { pct: formatPercent(summary.attainmentPct) })}
        </span>
      }
    >
      <div className="flex h-full flex-col gap-2">
        <div
          className={cn(
            "rounded-xl border border-border/70 bg-panel-grid p-2.5",
            expanded ? "h-[340px] sm:h-[400px]" : "h-[230px]",
          )}
        >
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
              <ComposedChart data={mine.trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                    background: "#FFFFFF",
                  }}
                  formatter={(value: number, name: string) => [`${formatTonnes(value)} T`, name]}
                />
                <Legend
                  verticalAlign="top"
                  height={22}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name={t("common.actual")}
                  stroke="#0F766E"
                  strokeWidth={2}
                  fill="#CCFBF1"
                  fillOpacity={0.7}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name={t("common.target")}
                  stroke="#D97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <ReferenceLine
                  y={scenario.projectedTonnes}
                  stroke="#BE123C"
                  strokeDasharray="2 3"
                  strokeWidth={1.5}
                  label={{
                    value: t("trend.simulated"),
                    position: "insideTopRight",
                    fontSize: 9,
                    fill: "#BE123C",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              {t("trend.empty", { mine: mine.label })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { label: t("trend.monthsBelow"), value: `${summary.monthsBelowTarget} / 12` },
            {
              label: t("trend.best"),
              value: summary.bestMonth
                ? `${summary.bestMonth.month} · ${formatTonnes(summary.bestMonth.actual)} T`
                : "—",
            },
            {
              label: t("trend.weakest"),
              value: summary.worstMonth
                ? `${summary.worstMonth.month} · ${formatTonnes(summary.worstMonth.actual)} T`
                : "—",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-border bg-panel-grid px-2 py-1.5"
            >
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="truncate font-mono text-[11px] font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
