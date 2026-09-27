import type { ComponentType } from "react";

import { DASHBOARD_VIEWS, type DashboardView } from "@/context/dashboard-context";
import { useDashboard } from "@/context/use-dashboard";
import { cn } from "@/lib/utils";

import { ConfidenceView } from "./ConfidenceView";
import { Panel } from "./Panel";
import { ProspectivityMap, ProspectivityMapAttribution } from "./ProspectivityMap";
import { SpectralView } from "./SpectralView";
import { panelId, tabId } from "./view-meta";
import { ViewTabs } from "./ViewTabs";

const VIEW_COMPONENTS: Record<DashboardView, ComponentType> = {
  map: ProspectivityMap,
  spectral: SpectralView,
  confidence: ConfidenceView,
};

/**
 * Hosts the three specialised views.
 *
 * All three stay mounted and are cross-faded via opacity rather than being
 * conditionally rendered. Two reasons:
 *
 *  1. Switching tabs never tears down view-local state (chart animation state,
 *     hover position, and later the MapLibre GL instance, which is expensive to
 *     re-initialise).
 *  2. Using opacity instead of `display: none` keeps every panel at full layout
 *     size, so Recharts' ResponsiveContainer always measures a real width and
 *     never collapses to a zero-width chart on reveal.
 *
 * Inactive panels get `pointer-events-none`, `aria-hidden` and `inert` so they
 * are unreachable by mouse, screen reader and keyboard alike.
 */
export function ProspectivityExplorer({ expanded = false }: { expanded?: boolean | undefined }) {
  const { activeView, mine } = useDashboard();
  const canvasHeight = expanded
    ? activeView === "spectral"
      ? "h-[760px] md:h-[540px]"
      : "h-[520px] md:h-[560px]"
    : activeView === "spectral"
      ? "h-[720px] md:h-[420px]"
      : "h-[420px]";

  return (
    <Panel
      title="Prospectivity Spatial Explorer"
      provenance="simulated"
      description="Move between mapped geology, satellite indicators and model confidence without losing your place."
      right={<ViewTabs />}
      footer={<ProspectivityMapAttribution />}
    >
      <div className={cn("relative transition-[height] duration-300", canvasHeight)}>
        {DASHBOARD_VIEWS.map((view) => {
          const ViewComponent = VIEW_COMPONENTS[view];
          const isActive = activeView === view;

          return (
            <div
              key={view}
              id={panelId(view)}
              role="tabpanel"
              aria-labelledby={tabId(view)}
              aria-hidden={!isActive}
              // `inert` keeps hidden panels out of the tab order entirely.
              inert={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-300 ease-in-out",
                isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
            >
              {/* Remount on mine change, never on tab change. The map is exempt:
                  it flies to the new mine instead of re-creating its WebGL context. */}
              <ViewComponent key={view === "map" ? "map" : mine.id} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
