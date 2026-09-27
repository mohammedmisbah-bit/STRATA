import type { LucideIcon } from "lucide-react";

import { ProvenanceBadge, type Provenance } from "@/components/dashboard/ProvenanceBadge";
import { cn } from "@/lib/utils";

const TONES = {
  teal: {
    icon: "bg-teal-soft text-teal",
    glow: "bg-teal/15",
    bar: "bg-teal",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    glow: "bg-amber-400/15",
    bar: "bg-amber-500",
  },
  rose: {
    icon: "bg-rose-50 text-rose-700",
    glow: "bg-rose-400/15",
    bar: "bg-rose-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700",
    glow: "bg-violet-400/15",
    bar: "bg-violet-500",
  },
  sky: {
    icon: "bg-sky-50 text-sky-700",
    glow: "bg-sky-400/15",
    bar: "bg-sky-500",
  },
  slate: {
    icon: "bg-slate-100 text-slate-700",
    glow: "bg-slate-400/10",
    bar: "bg-slate-500",
  },
} as const;

export type AnalysisMetricTone = keyof typeof TONES;

export function AnalysisMetric({
  label,
  value,
  description,
  icon: Icon,
  tone = "slate",
  progress,
  provenance,
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: AnalysisMetricTone | undefined;
  /** Optional 0–100 visual indicator. */
  progress?: number | undefined;
  /** Required so no metric can render without stating its data source. */
  provenance: Provenance;
}) {
  const palette = TONES[tone];
  const clamped = progress === undefined ? undefined : Math.min(100, Math.max(0, progress));

  return (
    <article className="group relative isolate min-h-36 overflow-hidden rounded-2xl border border-white/80 bg-card/95 p-4 shadow-[0_14px_42px_-28px_rgba(15,23,42,0.55),0_2px_8px_-4px_rgba(15,23,42,0.16)] ring-1 ring-slate-950/[0.025] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.55)] sm:p-5">
      <span
        className={cn(
          "absolute -right-12 -top-12 -z-10 size-32 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125",
          palette.glow,
        )}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {value}
          </p>
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", palette.icon)}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
      <ProvenanceBadge kind={provenance} className="mt-3" />
      {clamped === undefined ? null : (
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-700", palette.bar)}
            style={{ width: `${clamped}%` }}
          />
        </div>
      )}
    </article>
  );
}
