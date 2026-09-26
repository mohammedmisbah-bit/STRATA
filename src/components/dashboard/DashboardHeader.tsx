import { Mountain } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";

import { Beacon } from "./Beacon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MineSelector } from "./MineSelector";

export function DashboardHeader() {
  const { mine } = useDashboard();

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-line bg-card px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className="grid size-8 shrink-0 place-items-center rounded-md bg-teal text-primary-foreground"
          aria-hidden="true"
        >
          <Mountain className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">
            MOIL Reserve &amp; Production Intelligence
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Manganese Ore India Limited · Ops Console
          </p>
        </div>
      </div>

      <div className="mx-auto flex flex-wrap items-center gap-2">
        <MineSelector />
        <span className="rounded-full border border-slate-line bg-secondary px-2.5 py-1 font-mono text-[10px] font-medium text-muted-foreground">
          {mine.depthMeters} m {mine.type} · {mine.district}, {mine.state}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-emerald-700">
          <Beacon tone="emerald" /> LIVE TELEMETRY FEED
        </span>
        <div
          className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-line bg-secondary text-[11px] font-semibold"
          title="Signed in as R. Kumar"
        >
          RK
        </div>
      </div>
    </header>
  );
}
