import { Building2, ChevronDown, Database, Loader2, WifiOff } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { cn } from "@/lib/utils";

/**
 * Global mine switcher. Every analysis page reacts to this one selection.
 * Provenance is visible beside the control on larger screens and remains in the
 * native select's accessible label on compact screens.
 */
export function MineSelector() {
  const { mine, selectMine, mineOptions, mineSource, minesError, isFetchingMines } = useDashboard();
  const isLive = mineSource === "supabase";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="group relative flex min-w-0 items-center rounded-xl border border-border/80 bg-card/95 shadow-[0_6px_22px_-14px_rgba(15,23,42,0.55)] ring-1 ring-white transition hover:border-teal/35 hover:shadow-md focus-within:border-teal/50 focus-within:ring-2 focus-within:ring-teal/15">
        <Building2
          className="ml-3 hidden size-3.5 shrink-0 text-teal sm:block"
          aria-hidden="true"
        />
        <label htmlFor="mine-selector" className="sr-only">
          Active mine site
        </label>
        <select
          id="mine-selector"
          value={mine.id}
          onChange={(event) => selectMine(event.target.value)}
          disabled={mineOptions.length === 0}
          aria-label={`Active mine site. ${isLive ? "Live Supabase roster" : "Curated fallback roster"}`}
          className="min-w-0 max-w-[10.5rem] appearance-none bg-transparent py-2.5 pl-3 pr-8 text-[11px] font-bold text-foreground outline-none sm:max-w-[13rem] sm:pl-2.5 sm:text-xs"
        >
          {mineOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {isFetchingMines ? (
          <Loader2
            className="pointer-events-none absolute right-2.5 size-3.5 animate-spin text-teal"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground transition group-hover:text-teal"
            aria-hidden="true"
          />
        )}
      </div>

      <span
        className={cn(
          "hidden items-center gap-1 rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.1em] sm:flex",
          isLive
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-800",
        )}
        title={
          isLive
            ? "Mine roster loaded from the Supabase mines table."
            : `Using the built-in MOIL roster. ${minesError ?? ""}`.trim()
        }
      >
        {isLive ? (
          <Database className="size-2.5" aria-hidden="true" />
        ) : (
          <WifiOff className="size-2.5" aria-hidden="true" />
        )}
        {isLive ? "Live" : "Curated"}
      </span>
    </div>
  );
}
