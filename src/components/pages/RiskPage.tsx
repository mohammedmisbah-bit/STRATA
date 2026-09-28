import { AlertTriangle, Scale, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { RiskFeedPanel } from "@/components/dashboard/RiskFeedPanel";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatTonnes } from "@/lib/format";
import type { RiskSeverity } from "@/lib/mine-data";

const RANK: Record<RiskSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

export function RiskPage() {
  const { mine, scenario, loggedAlertImpactTonnes } = useDashboard();
  const t = useUiText();
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
        eyebrow={t("nav.risk.eyebrow")}
        title={t("risk.title", { mine: mine.label })}
        description={t("risk.desc")}
        icon={ShieldAlert}
        badges={
          <>
            <HeroBadge tone={highest === "CRITICAL" ? "rose" : "amber"}>
              {t("risk.highest", { level: highest ?? t("common.none") })}
            </HeroBadge>
            <HeroBadge>{t("risk.openCount", { count: mine.riskAlerts.length })}</HeroBadge>
            <HeroBadge tone="rose">{t("risk.scenario", { level: scenario.riskLevel })}</HeroBadge>
          </>
        }
      />

      <section
        aria-label={t("nav.risk.label")}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label={t("risk.m.known")}
          provenance="simulated"
          value={`−${formatTonnes(loggedAlertImpactTonnes)} T`}
          description={t("risk.m.knownDesc")}
          icon={Siren}
          tone="rose"
        />
        <AnalysisMetric
          label={t("risk.m.shortfall")}
          provenance="modelled"
          value={`−${formatTonnes(scenario.shortfallTonnes)} T`}
          description={t("risk.m.shortfallDesc")}
          icon={AlertTriangle}
          tone="amber"
        />
        <AnalysisMetric
          label={t("risk.m.coverage")}
          provenance="modelled"
          value={`${coverage.toFixed(0)}%`}
          description={t("risk.m.coverageDesc")}
          icon={Scale}
          tone="violet"
          progress={coverage}
        />
        <AnalysisMetric
          label={t("risk.m.gap")}
          provenance="modelled"
          value={`${formatTonnes(gap)} T`}
          description={t("risk.m.gapDesc")}
          icon={ShieldCheck}
          tone={gap > 1000 ? "rose" : "teal"}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <RiskFeedPanel />
        <Panel
          title={t("risk.queue")}
          provenance="modelled"
          description={t("risk.queueDesc")}
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
                  <p className="text-[11px] leading-5 text-foreground" lang="en">
                    {directive}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {index === 0
                      ? t("risk.actFirst")
                      : index === scenario.directives.length - 1
                        ? t("risk.closeLoop")
                        : t("risk.thenProceed")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
            {t("risk.disclaimer")}
          </div>
        </Panel>
      </section>
    </div>
  );
}
