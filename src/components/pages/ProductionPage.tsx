import { CalendarDays, ChartNoAxesCombined, Gauge, Target, TrendingDown } from "lucide-react";
import { useMemo } from "react";

import { ProductionLogPanel } from "@/components/dashboard/ProductionLogPanel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { formatPercent, formatTonnes } from "@/lib/format";

export function ProductionPage() {
  const { mine, scenario } = useDashboard();

  const summary = useMemo(() => {
    const target = mine.trend.reduce((total, point) => total + point.target, 0);
    const actual = mine.trend.reduce((total, point) => total + point.actual, 0);
    const below = mine.trend.filter((point) => point.actual < point.target).length;
    const best = mine.trend.reduce<(typeof mine.trend)[number] | null>(
      (current, point) => (current === null || point.actual > current.actual ? point : current),
      null,
    );
    return {
      target,
      actual,
      attainment: target > 0 ? (actual / target) * 100 : 0,
      below,
      best,
    };
  }, [mine]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Production intelligence"
        title={`Turn ${mine.label} output history into a clearer plan.`}
        description="Compare target and actual output, inspect day-level drivers, and keep the current operating scenario visible beside the historical pattern."
        icon={ChartNoAxesCombined}
        badges={
          <>
            <HeroBadge tone="teal">FY attainment {formatPercent(summary.attainment)}</HeroBadge>
            <HeroBadge>{mine.trend.length} monthly observations</HeroBadge>
            <HeroBadge tone="amber">Daily log: deterministic synthetic data</HeroBadge>
          </>
        }
      />

      <section
        aria-label="Production indicators"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label="Historical actual"
          provenance="simulated"
          value={`${formatTonnes(summary.actual)} T`}
          description={`Total across ${mine.trend.length} fiscal-month observations.`}
          icon={Gauge}
          tone="teal"
          progress={summary.attainment}
        />
        <AnalysisMetric
          label="Historical target"
          provenance="simulated"
          value={`${formatTonnes(summary.target)} T`}
          description="Aggregate target represented by the local trend fixture."
          icon={Target}
          tone="sky"
        />
        <AnalysisMetric
          label="Below target"
          provenance="simulated"
          value={`${summary.below} months`}
          description="Months where recorded actual output did not reach the target line."
          icon={TrendingDown}
          tone={summary.below > 6 ? "rose" : "amber"}
        />
        <AnalysisMetric
          label="Strongest month"
          provenance="simulated"
          value={
            summary.best ? `${summary.best.month} · ${formatTonnes(summary.best.actual)} T` : "—"
          }
          description="Highest actual output in the available twelve-month series."
          icon={CalendarDays}
          tone="violet"
        />
      </section>

      <ProductionTrendPanel expanded />
      <ProductionLogPanel expanded />

      <aside className="rounded-2xl border border-border/70 bg-white/70 p-4 text-[11px] leading-5 text-muted-foreground shadow-sm backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p>
          <strong className="text-foreground">How to read this page:</strong> the monthly chart is a
          planning fixture, while the day-level table is a seeded dataset designed to preserve a
          realistic relationship between rainfall, downtime and output.
        </p>
        <p className="mt-2 shrink-0 rounded-xl bg-slate-100 px-3 py-2 font-mono text-[10px] sm:mt-0">
          Current scenario: {formatTonnes(scenario.projectedTonnes)} T ·{" "}
          {formatPercent(scenario.attainmentPct)}
        </p>
      </aside>
    </div>
  );
}
