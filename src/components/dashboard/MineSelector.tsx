import { ChevronDown, Database, Loader2, WifiOff } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { cn } from "@/lib/utils";

/**
 * Mine switcher, populated from the mine service.
 *
 * Changing this recomputes depth, target, trend, alerts, coordinates, spectral
 * readings and the whole scenario through the context. The adjacent badge makes
 * the data provenance explicit, so a reader is never guessing whether they are
 * looking at live rows or the hardcoded fallback.
 */
export function MineSelector() {
  const { selectedMineId, selectMine, mineOptions, mineSource, minesError, isFetchingMines } =
    useDashboard();

  const isLive = mineSource === "supabase";

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="mine-selector" className="sr-only">
        Select mine
      </label>
      <div className="relative flex items-center">
        <select
          id="mine-selector"
          value={selectedMineId}
          onChange={(event) => selectMine(event.target.value)}
          disabled={mineOptions.length === 0}
          className="appearance-none rounded-full border border-slate-line bg-card py-1.5 pl-4 pr-9 text-xs font-medium shadow-sm outline-none transition-colors duration-300 hover:border-teal focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {mineOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <span
        className={cn(
          "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
          isLive
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-line bg-secondary text-muted-foreground",
        )}
        title={
          isLive
            ? "Mine roster loaded from the Supabase mines table."
            : `Using the built-in MOIL roster. ${minesError ?? ""}`.trim()
        }
      >
        {isFetchingMines ? (
          <Loader2 className="size-2.5 animate-spin" aria-hidden="true" />
        ) : isLive ? (
          <Database className="size-2.5" aria-hidden="true" />
        ) : (
          <WifiOff className="size-2.5" aria-hidden="true" />
        )}
        {isLive ? "Live" : "Fallback"}
      </span>
    </div>
  );
}
