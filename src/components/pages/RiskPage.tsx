import { AlertTriangle, Scale, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { RiskFeedPanel } from "@/components/dashboard/RiskFeedPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { formatTonnes } from "@/lib/format";
import type { RiskSeverity } from "@/lib/mine-data";

const RANK: Record<RiskSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

export function RiskPage() {
  const { mine, scenario, loggedAlertImpactTonnes } = useDashboard();
  const highest = mine.riskAlerts.reduce<RiskSeverity | null>(
    (current, alert) =>
      current === null || RANK[alert.severity] > RANK[current] ? alert.severity : current,
    null,
  );
  const gap = Math.max(0, scenario.shortfallTonnes - loggedAlertImpactTonnes);
  const coverage =
    scenario.shortfallTonnes > 0
      ? Math.min(100, (loggedAlertImpactTonnes / scenario.shortfallTonnes) * 100)
      : 100;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Operational assurance"
        title={`Focus attention where ${mine.label} can lose the most.`}
        description="See active issues in priority order, understand their estimated production impact, and compare known alerts with the broader scenario shortfall."
        icon={ShieldAlert}
        badges={
          <>
            <HeroBadge tone={highest === "CRITICAL" ? "rose" : "amber"}>
              Highest alert: {highest ?? "None"}
            </HeroBadge>
            <HeroBadge>{mine.riskAlerts.length} open alerts</HeroBadge>
            <HeroBadge tone="rose">Scenario: {scenario.riskLevel}</HeroBadge>
          </>
        }
      />

      <section aria-label="Risk indicators" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalysisMetric
          label="Known alert impact"
          provenance="simulated"
          value={`−${formatTonnes(loggedAlertImpactTonnes)} T`}
          description="Combined estimated impact of the currently logged mine alerts."
          icon={Siren}
          tone="rose"
        />
        <AnalysisMetric
          label="Scenario shortfall"
          provenance="modelled"
          value={`−${formatTonnes(scenario.shortfallTonnes)} T`}
          description="Output at risk under the selected rainfall and downtime inputs."
          icon={AlertTriangle}
          tone="amber"
        />
        <AnalysisMetric
          label="Explained coverage"
          provenance="modelled"
          value={`${coverage.toFixed(0)}%`}
          description="Share of scenario shortfall represented by explicitly logged alerts."
          icon={Scale}
          tone="violet"
          progress={coverage}
        />
        <AnalysisMetric
          label="Unexplained gap"
          provenance="modelled"
          value={`${formatTonnes(gap)} T`}
          description="Residual shortfall to investigate beyond the current alert register."
          icon={ShieldCheck}
          tone={gap > 1000 ? "rose" : "teal"}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <RiskFeedPanel />
        <Panel
          title="Response Queue"
          provenance="modelled"
          description="A practical order of work generated from the current scenario."
          right={<RiskBadge severity={scenario.riskLevel} />}
        >
          <ol className="space-y-3">
            {scenario.directives.map((directive, index) => (
              <li key={directive} className="relative flex gap-3">
                {index < scenario.directives.length - 1 ? (
                  <span
                    className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative grid size-8 shrink-0 place-items-center rounded-xl border border-teal/15 bg-teal-soft font-mono text-[10px] font-bold text-teal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="pt-0.5">
                  <p className="text-[11px] leading-5 text-foreground">{directive}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {index === 0
                      ? "Act first"
                      : index === scenario.directives.length - 1
                        ? "Close the loop"
                        : "Then proceed"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
            Alerts in this prototype are scenario fixtures. Confirm any operational action with the
            mine control room and current statutory procedures.
          </div>
        </Panel>
      </section>
    </div>
  );
}
