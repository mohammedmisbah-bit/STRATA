import { CloudRain, Gauge, SlidersHorizontal, Target, TimerReset } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { ScenarioSimulatorPanel } from "@/components/dashboard/ScenarioSimulatorPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatPercent, formatTonnes } from "@/lib/format";

const STEPS = ["1", "2", "3"] as const;

export function SimulatorPage() {
  const { mine, scenario, hoistDowntimeHours, rainfallMm } = useDashboard();
  const t = useUiText();

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={t("nav.simulator.eyebrow")}
        title={t("sim.title", { mine: mine.label })}
        description={t("sim.desc")}
        icon={SlidersHorizontal}
        badges={
          <>
            <HeroBadge tone="amber">
              {t("sim.downtimeBadge", { hours: hoistDowntimeHours })}
            </HeroBadge>
            <HeroBadge tone="teal">{t("sim.rainfallBadge", { mm: rainfallMm })}</HeroBadge>
            <HeroBadge tone={scenario.riskLevel === "CRITICAL" ? "rose" : "neutral"}>
              {t("sim.riskBadge", { level: scenario.riskLevel })}
            </HeroBadge>
          </>
        }
      />

      <section
        aria-label={t("nav.simulator.label")}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label={t("sim.m.projected")}
          provenance="modelled"
          value={`${formatTonnes(scenario.projectedTonnes)} T`}
          description={t("sim.m.projectedDesc", { target: formatTonnes(scenario.targetTonnes) })}
          icon={Gauge}
          tone="teal"
          progress={scenario.attainmentPct}
        />
        <AnalysisMetric
          label={t("common.attainment")}
          provenance="modelled"
          value={formatPercent(scenario.attainmentPct)}
          description={t("sim.m.attainmentDesc")}
          icon={Target}
          tone="sky"
          progress={scenario.attainmentPct}
        />
        <AnalysisMetric
          label={t("sim.m.downtime")}
          provenance="modelled"
          value={`−${formatTonnes(scenario.hoistLossTonnes)} T`}
          description={t("sim.m.share", { pct: formatPercent(scenario.hoistSharePct, 0) })}
          icon={TimerReset}
          tone="amber"
        />
        <AnalysisMetric
          label={t("sim.m.rainfall")}
          provenance="modelled"
          value={`−${formatTonnes(scenario.rainfallLossTonnes)} T`}
          description={t("sim.m.share", { pct: formatPercent(scenario.rainfallSharePct, 0) })}
          icon={CloudRain}
          tone="violet"
        />
      </section>

      <section className="grid items-start gap-4 2xl:grid-cols-[1.35fr_0.65fr]">
        <ScenarioSimulatorPanel />
        <Panel title={t("sim.workflow")} provenance={null} description={t("sim.workflowDesc")}>
          <ol className="space-y-4">
            {STEPS.map((step) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0b3940] font-display text-sm font-semibold text-teal-200 shadow-sm">
                  {step}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-foreground">{t(`sim.step${step}`)}</h3>
                  <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    {t(`sim.step${step}Desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl bg-[#0a202a] p-4 text-white shadow-inner">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-teal-200/70">
              {t("sim.transparency")}
            </p>
            <p className="mt-2 text-[11px] leading-5 text-slate-300">{t("sim.transparencyBody")}</p>
          </div>
        </Panel>
      </section>

      <ProductionTrendPanel expanded />
    </div>
  );
}
