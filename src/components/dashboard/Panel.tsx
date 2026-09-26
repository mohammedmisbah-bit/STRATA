import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const PANEL_HOVER = "transition-all duration-300 ease-in-out hover:shadow-md";

/**
 * Standard bordered panel container used across the executive grid.
 * `bodyClassName` lets a caller take over layout inside the body (e.g. the
 * fixed-height stack the view tabs need).
 */
export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  right?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-lg border border-border bg-card shadow-sm",
        PANEL_HOVER,
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
          {title}
        </h2>
        {right}
      </header>
      <div className={cn("min-h-0 flex-1 p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
