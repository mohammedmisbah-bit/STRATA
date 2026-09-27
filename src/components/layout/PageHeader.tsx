import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  badges,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badges?: ReactNode | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <section className="page-hero relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#071b25] px-5 py-6 text-white shadow-[0_30px_80px_-36px_rgba(2,20,28,0.9)] sm:px-7 sm:py-8 lg:px-9">
      <div className="strata-contours absolute inset-0 -z-10 opacity-65" aria-hidden="true" />
      <div
        className="absolute -right-24 -top-32 -z-10 size-80 rounded-full bg-teal-400/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-1/3 -z-10 h-48 w-96 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-white/12 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur">
              <Icon className="size-5 text-teal-300" aria-hidden="true" />
            </span>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-200/80">
              {eyebrow}
            </p>
          </div>
          <h1 className="max-w-2xl font-display text-[clamp(1.8rem,4vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-balance">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
            {description}
          </p>
          {badges ? <div className="mt-5 flex flex-wrap items-center gap-2">{badges}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function HeroBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "teal" | "amber" | "rose";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/7 text-slate-200",
    teal: "border-teal-300/20 bg-teal-300/10 text-teal-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  } as const;

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
