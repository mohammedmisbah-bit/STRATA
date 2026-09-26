import { RISK_BADGE_CLASSES } from "@/lib/format";
import type { RiskSeverity } from "@/lib/mine-data";
import { cn } from "@/lib/utils";

/**
 * Severity pill. Colour comes from the shared RISK_BADGE_CLASSES map so the
 * badge, the alert surface and the map beacon can never disagree.
 */
export function RiskBadge({
  severity,
  className,
}: {
  severity: RiskSeverity;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        RISK_BADGE_CLASSES[severity] ?? RISK_BADGE_CLASSES.LOW,
        className,
      )}
    >
      {severity}
    </span>
  );
}
