import { Gauge, ShieldAlert, Target, TrendingDown } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { formatPercent, formatScore, formatTonnes } from "@/lib/format";
import type { RiskAlert, RiskSeverity } from "@/lib/mine-data";

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

export function KpiStrip() {
  const { mine, scenario } = useDashboard();
  const worstSeverity = highestSeverity(mine.riskAlerts);

  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        icon={<Target className="size-4" />}
        label="Monthly Target"
        value={`${formatTonnes(scenario.targetTonnes)} T`}
        caption={`${mine.label} · prospectivity ${formatScore(mine.prospectivityScore)}`}
      />

      <Kpi
        icon={<Gauge className="size-4" />}
        label="Forecast Output"
        value={`${formatTonnes(scenario.projectedTonnes)} T`}
        tone="teal"
        badge={
          <span className="rounded-full bg-teal-soft px-1.5 py-0.5 text-[10px] font-semibold text-teal">
            {formatPercent(scenario.attainmentPct)}
          </span>
        }
        caption="Simulated against current slider inputs"
      />

      <Kpi
        icon={<TrendingDown className="size-4" />}
        label="Projected Deficit"
        value={`−${formatTonnes(scenario.shortfallTonnes)} T`}
        tone="coral"
        pulse={scenario.riskLevel === "CRITICAL"}
        badge={<RiskBadge severity={scenario.riskLevel} />}
        caption={`Modelled loss −${formatTonnes(scenario.modelledLossTonnes)} T`}
      />

      <Kpi
        icon={<ShieldAlert className="size-4" />}
        label="Active Risk Alerts"
        value={String(mine.riskAlerts.length)}
        caption={worstSeverity === null ? "No open alerts" : `Highest severity: ${worstSeverity}`}
      />
    </div>
  );
}
