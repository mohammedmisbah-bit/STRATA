import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ProvenanceBadge, type Provenance } from "./ProvenanceBadge";

export const PANEL_HOVER =
  "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.5)]";

/** Elevated analysis card shared across dashboard and detail pages. */
export function Panel({
  title,
  description,
  right,
  children,
  className,
  bodyClassName,
  footer,
  provenance,
}: {
  title: string;
  /**
   * Required. Pass `null` only for guidance cards that show no data, so every
   * data card is forced to declare where its numbers come from.
   */
  provenance: Provenance | null;
  description?: string | undefined;
  right?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
  footer?: ReactNode | undefined;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/80 bg-card/95 shadow-[0_16px_48px_-32px_rgba(15,23,42,0.55),0_2px_8px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-950/[0.025] backdrop-blur-sm",
        PANEL_HOVER,
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[13px] font-semibold tracking-[-0.02em] text-foreground sm:text-sm">
              {title}
            </h2>
            {provenance === null ? null : <ProvenanceBadge kind={provenance} />}
          </div>
          {description ? (
            <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {right}
      </header>
      <div className={cn("min-h-0 flex-1 p-4 sm:p-5", bodyClassName)}>{children}</div>
      {footer === undefined ? null : (
        <footer className="border-t border-border/70 bg-slate-50/55 px-4 py-2.5 sm:px-5">
          {footer}
        </footer>
      )}
    </section>
  );
}
