import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PANEL_HOVER } from "./Panel";
import { ProvenanceBadge, type Provenance } from "./ProvenanceBadge";

export type KpiTone = "plain" | "teal" | "coral";

const TONES: Record<KpiTone, { icon: string; value: string; glow: string; accent: string }> = {
  plain: {
    icon: "bg-slate-100 text-slate-700",
    value: "text-foreground",
    glow: "bg-slate-300/10",
    accent: "from-slate-400/50",
  },
  teal: {
    icon: "bg-teal-soft text-teal",
    value: "text-foreground",
    glow: "bg-teal/15",
    accent: "from-teal/70",
  },
  coral: {
    icon: "bg-rose-50 text-coral",
    value: "text-coral",
    glow: "bg-coral/12",
    accent: "from-coral/70",
  },
};

export function Kpi({
  icon,
  label,
  value,
  caption,
  badge,
  tone = "plain",
  pulse = false,
  provenance,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  caption?: string | undefined;
  badge?: ReactNode | undefined;
  tone?: KpiTone | undefined;
  pulse?: boolean | undefined;
  /** Required so no KPI can render without stating its data source. */
  provenance: Provenance;
}) {
  const palette = TONES[tone];

  return (
    <article
      className={cn(
        "group relative isolate min-h-[9.25rem] overflow-hidden rounded-2xl border border-white/80 bg-card/95 p-4 shadow-[0_14px_42px_-30px_rgba(15,23,42,0.55),0_2px_8px_-4px_rgba(15,23,42,0.14)] ring-1 ring-slate-950/[0.025]",
        PANEL_HOVER,
        pulse && "animate-soft-glow",
      )}
    >
      <span
        className={cn(
          "absolute -right-10 -top-12 -z-10 size-32 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125",
          palette.glow,
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent opacity-70",
          palette.accent,
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn("grid size-10 shrink-0 place-items-center rounded-xl", palette.icon)}
          aria-hidden="true"
        >
          {icon}
        </span>
        {badge}
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xl font-semibold tracking-[-0.04em]", palette.value)}>
        {value}
      </p>
      {caption ? (
        <p className="mt-1 truncate text-[10px] text-muted-foreground">{caption}</p>
      ) : null}
      <ProvenanceBadge kind={provenance} className="mt-2.5" />
    </article>
  );
}
