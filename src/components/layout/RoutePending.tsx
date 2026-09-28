import { Loader2 } from "lucide-react";

import { useUiText } from "@/i18n/use-ui-text";

/**
 * Deterministic route skeleton — no random widths, so it is hydration-safe.
 * Only rendered on client transitions slower than the router's pendingMs.
 */
export function RoutePending() {
  const t = useUiText();

  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-label={t("shell.loading")}>
      <section className="relative min-h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#071b25] p-6 shadow-[0_30px_80px_-36px_rgba(2,20,28,0.9)] sm:p-8">
        <div className="strata-contours absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative max-w-2xl space-y-4 motion-safe:animate-pulse">
          <span className="block h-11 w-11 rounded-2xl bg-white/10" />
          <span className="block h-3 w-36 rounded-full bg-teal-300/20" />
          <span className="block h-9 w-4/5 rounded-xl bg-white/12" />
          <span className="block h-4 w-full rounded-lg bg-white/8" />
          <span className="block h-4 w-2/3 rounded-lg bg-white/8" />
        </div>
        <span className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-semibold text-slate-300">
          <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden="true" />
          {t("shell.loading")}
        </span>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl border border-white/80 bg-card/80 shadow-sm motion-safe:animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
