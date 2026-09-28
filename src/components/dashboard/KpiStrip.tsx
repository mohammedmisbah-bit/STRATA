import { Gauge, ShieldAlert, Target, TrendingDown } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatPercent, formatScore, formatTonnes } from "@/lib/format";
import type { RiskAlert, RiskSeverity } from "@/lib/mine-data";
import { cn } from "@/lib/utils";

import { Kpi } from "./Kpi";
import { RiskBadge } from "./RiskBadge";

const SEVERITY_RANK: Record<RiskSeverity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

function highestSeverity(alerts: readonly RiskAlert[]): RiskSeverity | null {
  return alerts.reduce<RiskSeverity | null>(
    (worst, alert) =>
      worst === null || SEVERITY_RANK[alert.severity] > SEVERITY_RANK[worst]
        ? alert.severity
        : worst,
    null,
  );
}

export function KpiStrip({ className }: { className?: string | undefined }) {
  const { mine, scenario } = useDashboard();
  const t = useUiText();
  const worstSeverity = highestSeverity(mine.riskAlerts);

  return (
    <section
      aria-label={t("nav.overview.label")}
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}
    >
      <Kpi
        icon={<Target className="size-4" />}
        label={t("kpi.monthlyTarget")}
        provenance="simulated"
        value={`${formatTonnes(scenario.targetTonnes)} T`}
        caption={t("kpi.prospectivityCaption", {
          mine: mine.label,
          score: formatScore(mine.prospectivityScore),
        })}
      />
      <Kpi
        icon={<Gauge className="size-4" />}
        label={t("kpi.forecastOutput")}
        provenance="modelled"
        value={`${formatTonnes(scenario.projectedTonnes)} T`}
        tone="teal"
        badge={
          <span className="rounded-full bg-teal-soft px-2 py-1 text-[9px] font-bold text-teal tabular-nums">
            {formatPercent(scenario.attainmentPct)}
          </span>
        }
        caption={t("kpi.forecastCaption")}
      />
      <Kpi
        icon={<TrendingDown className="size-4" />}
        label={t("kpi.projectedDeficit")}
        provenance="modelled"
        value={`−${formatTonnes(scenario.shortfallTonnes)} T`}
        tone="coral"
        pulse={scenario.riskLevel === "CRITICAL"}
        badge={<RiskBadge severity={scenario.riskLevel} />}
        caption={t("kpi.modelledLoss", { tonnes: formatTonnes(scenario.modelledLossTonnes) })}
      />
      <Kpi
        icon={<ShieldAlert className="size-4" />}
        label={t("kpi.activeAlerts")}
        provenance="simulated"
        value={String(mine.riskAlerts.length)}
        caption={
          worstSeverity === null
            ? t("kpi.noAlerts")
            : t("kpi.highestSeverity", { level: worstSeverity })
        }
      />
    </section>
  );
}
