import { Gauge, ShieldAlert, Target, TrendingDown } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
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
  const worstSeverity = highestSeverity(mine.riskAlerts);

  return (
    <section
      aria-label="Key operating indicators"
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}
    >
      <Kpi
        icon={<Target className="size-4" />}
        label="Monthly target"
        provenance="simulated"
        value={`${formatTonnes(scenario.targetTonnes)} T`}
        caption={`${mine.label} · prospectivity ${formatScore(mine.prospectivityScore)}`}
      />
      <Kpi
        icon={<Gauge className="size-4" />}
        label="Forecast output"
        provenance="modelled"
        value={`${formatTonnes(scenario.projectedTonnes)} T`}
        tone="teal"
        badge={
          <span className="rounded-full bg-teal-soft px-2 py-1 text-[9px] font-bold text-teal">
            {formatPercent(scenario.attainmentPct)}
          </span>
        }
        caption="Updates as scenario inputs change"
      />
      <Kpi
        icon={<TrendingDown className="size-4" />}
        label="Projected deficit"
        provenance="modelled"
        value={`−${formatTonnes(scenario.shortfallTonnes)} T`}
        tone="coral"
        pulse={scenario.riskLevel === "CRITICAL"}
        badge={<RiskBadge severity={scenario.riskLevel} />}
        caption={`Modelled loss −${formatTonnes(scenario.modelledLossTonnes)} T`}
      />
      <Kpi
        icon={<ShieldAlert className="size-4" />}
        label="Active risk alerts"
        provenance="simulated"
        value={String(mine.riskAlerts.length)}
        caption={worstSeverity === null ? "No open alerts" : `Highest severity: ${worstSeverity}`}
      />
    </section>
  );
}
