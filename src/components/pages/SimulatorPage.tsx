import { CloudRain, Gauge, SlidersHorizontal, Target, TimerReset } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { ScenarioSimulatorPanel } from "@/components/dashboard/ScenarioSimulatorPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { formatPercent, formatTonnes } from "@/lib/format";

const STEPS = [
  {
    number: "1",
    title: "Set downtime",
    detail:
      "Estimate how many hours the shaft, incline or primary material flow will be unavailable.",
  },
  {
    number: "2",
    title: "Set rainfall",
    detail: "Enter expected rainfall, or pull the latest Open-Meteo reading for the active mine.",
  },
  {
    number: "3",
    title: "Review and act",
    detail:
      "Compare output and risk, then generate a grounded mitigation directive for the shift team.",
  },
] as const;

export function SimulatorPage() {
  const { mine, scenario, hoistDowntimeHours, rainfallMm } = useDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Decision simulator"
        title={`Test recovery choices before they affect ${mine.label}.`}
        description="Change two understandable operating drivers—downtime and rainfall—and immediately see the estimated output, risk level and recommended response."
        icon={SlidersHorizontal}
        badges={
          <>
            <HeroBadge tone="amber">{hoistDowntimeHours} h downtime</HeroBadge>
            <HeroBadge tone="teal">{rainfallMm} mm rainfall</HeroBadge>
            <HeroBadge tone={scenario.riskLevel === "CRITICAL" ? "rose" : "neutral"}>
              {scenario.riskLevel} risk
            </HeroBadge>
          </>
        }
      />

      <section
        aria-label="Scenario indicators"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label="Projected output"
          provenance="modelled"
          value={`${formatTonnes(scenario.projectedTonnes)} T`}
          description={`Against a ${formatTonnes(scenario.targetTonnes)} T monthly target.`}
          icon={Gauge}
          tone="teal"
          progress={scenario.attainmentPct}
        />
        <AnalysisMetric
          label="Attainment"
          provenance="modelled"
          value={formatPercent(scenario.attainmentPct)}
          description="The share of target remaining after modelled operating losses."
          icon={Target}
          tone="sky"
          progress={scenario.attainmentPct}
        />
        <AnalysisMetric
          label="Downtime impact"
          provenance="modelled"
          value={`−${formatTonnes(scenario.hoistLossTonnes)} T`}
          description={`${formatPercent(scenario.hoistSharePct, 0)} of total modelled loss.`}
          icon={TimerReset}
          tone="amber"
        />
        <AnalysisMetric
          label="Rainfall impact"
          provenance="modelled"
          value={`−${formatTonnes(scenario.rainfallLossTonnes)} T`}
          description={`${formatPercent(scenario.rainfallSharePct, 0)} of total modelled loss.`}
          icon={CloudRain}
          tone="violet"
        />
      </section>

      <section className="grid items-start gap-4 2xl:grid-cols-[1.35fr_0.65fr]">
        <ScenarioSimulatorPanel />
        <Panel
          title="A Simple Three-Step Workflow"
          provenance={null}
          description="No modelling expertise required. Start with what the shift team knows."
        >
          <ol className="space-y-4">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0b3940] font-display text-sm font-semibold text-teal-200 shadow-sm">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-[10px] leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl bg-[#0a202a] p-4 text-white shadow-inner">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-teal-200/70">
              Model transparency
            </p>
            <p className="mt-2 text-[11px] leading-5 text-slate-300">
              The deterministic baseline prices each downtime hour at 140 tonnes and each millimetre
              of rainfall at 55 tonnes. The AI directive explains a response; it does not change the
              calculation.
            </p>
          </div>
        </Panel>
      </section>

      <ProductionTrendPanel expanded />
    </div>
  );
}
