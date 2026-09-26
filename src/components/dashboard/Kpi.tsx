import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PANEL_HOVER } from "./Panel";

export type KpiTone = "plain" | "teal" | "coral";

const ICON_CLASSES: Record<KpiTone, string> = {
  plain: "bg-secondary text-foreground",
  teal: "bg-teal-soft text-teal",
  coral: "bg-card text-coral",
};

const VALUE_CLASSES: Record<KpiTone, string> = {
  plain: "text-foreground",
  teal: "text-foreground",
  coral: "text-coral",
};

export function Kpi({
  icon,
  label,
  value,
  caption,
  badge,
  tone = "plain",
  pulse = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  caption?: string | undefined;
  badge?: ReactNode | undefined;
  tone?: KpiTone | undefined;
  /** Draws attention to a breached metric. Suppressed under reduced-motion. */
  pulse?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border px-3 py-2 shadow-sm",
        PANEL_HOVER,
        pulse ? "animate-soft-glow" : "bg-card",
      )}
    >
      <div
        className={cn("grid size-9 shrink-0 place-items-center rounded-md", ICON_CLASSES[tone])}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className={cn("font-mono text-lg font-semibold", VALUE_CLASSES[tone])}>
            {value}
          </span>
          {badge}
        </div>
        {caption ? <p className="truncate text-[10px] text-muted-foreground">{caption}</p> : null}
      </div>
    </div>
  );
}
