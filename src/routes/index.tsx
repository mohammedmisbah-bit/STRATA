import { createFileRoute } from "@tanstack/react-router";
import { Map as MapIcon } from "lucide-react";

import { DashboardProvider } from "@/context/DashboardContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useDashboard } from "@/context/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { ProductionLogPanel } from "@/components/dashboard/ProductionLogPanel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { ProspectivityExplorer } from "@/components/dashboard/ProspectivityExplorer";
import { RiskFeedPanel } from "@/components/dashboard/RiskFeedPanel";
import { ScenarioSimulatorPanel } from "@/components/dashboard/ScenarioSimulatorPanel";

const DESCRIPTION =
  "Live manganese prospectivity mapping, spectral layers, confidence bounds and shortfall scenario simulation across MOIL mines.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MOIL Reserve & Production Intelligence" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "MOIL Reserve & Production Intelligence" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <LanguageProvider>
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    </LanguageProvider>
  );
}

function DashboardFooter() {
  const { mine } = useDashboard();

  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-line bg-card px-4 py-2 text-[10px] text-muted-foreground">
      <span>Sources: SCADA, Sentinel-2 spectral, SRTM DEM, GSI Bhukosh, NASA POWER</span>
      <span className="flex items-center gap-1">
        <MapIcon className="size-3" aria-hidden="true" />
        {mine.label} · {mine.district}, {mine.state}
      </span>
    </footer>
  );
}

function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <DashboardHeader />
      <KpiStrip />

      <main className="flex-1 space-y-3 px-4 pb-4">
        <ProspectivityExplorer />

        <div className="grid gap-3 lg:grid-cols-2">
          <ProductionTrendPanel />
          <RiskFeedPanel />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ScenarioSimulatorPanel />
          <ProductionLogPanel />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
