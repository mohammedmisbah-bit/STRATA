import { CalendarDays, ChartNoAxesCombined, Gauge, Target, TrendingDown } from "lucide-react";
import { useMemo } from "react";

import { ProductionLogPanel } from "@/components/dashboard/ProductionLogPanel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatPercent, formatTonnes } from "@/lib/format";

export function ProductionPage() {
  const { mine, scenario } = useDashboard();
  const t = useUiText();

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
        eyebrow={t("nav.production.eyebrow")}
        title={t("prod.title", { mine: mine.label })}
        description={t("prod.desc")}
        icon={ChartNoAxesCombined}
        badges={
          <>
            <HeroBadge tone="teal">
              {t("prod.fyAttainment", { pct: formatPercent(summary.attainment) })}
            </HeroBadge>
            <HeroBadge>{t("prod.observations", { count: mine.trend.length })}</HeroBadge>
            <HeroBadge tone="amber">{t("prod.dailySynthetic")}</HeroBadge>
          </>
        }
      />

      <section
        aria-label={t("nav.production.label")}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label={t("prod.m.actual")}
          provenance="simulated"
          value={`${formatTonnes(summary.actual)} T`}
          description={t("prod.m.actualDesc", { count: mine.trend.length })}
          icon={Gauge}
          tone="teal"
          progress={summary.attainment}
        />
        <AnalysisMetric
          label={t("prod.m.target")}
          provenance="simulated"
          value={`${formatTonnes(summary.target)} T`}
          description={t("prod.m.targetDesc")}
          icon={Target}
          tone="sky"
        />
        <AnalysisMetric
          label={t("prod.m.below")}
          provenance="simulated"
          value={`${summary.below} ${t("common.months")}`}
          description={t("prod.m.belowDesc")}
          icon={TrendingDown}
          tone={summary.below > 6 ? "rose" : "amber"}
        />
        <AnalysisMetric
          label={t("prod.m.best")}
          provenance="simulated"
          value={
            summary.best ? `${summary.best.month} · ${formatTonnes(summary.best.actual)} T` : "—"
          }
          description={t("prod.m.bestDesc")}
          icon={CalendarDays}
          tone="violet"
        />
      </section>

      <ProductionTrendPanel expanded />
      <ProductionLogPanel expanded />

      <aside className="rounded-2xl border border-border/70 bg-white/80 p-4 text-[11px] leading-5 text-muted-foreground shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p>
          <strong className="text-foreground">{t("prod.howTo")}</strong> {t("prod.howToBody")}
        </p>
        <p className="mt-2 shrink-0 rounded-xl bg-slate-100 px-3 py-2 font-mono text-[10px] sm:mt-0">
          {t("prod.currentScenario", {
            tonnes: formatTonnes(scenario.projectedTonnes),
            pct: formatPercent(scenario.attainmentPct),
          })}
        </p>
      </aside>
    </div>
  );
}
