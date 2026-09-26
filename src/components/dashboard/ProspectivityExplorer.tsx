import type { ComponentType } from "react";

import { DASHBOARD_VIEWS, type DashboardView } from "@/context/dashboard-context";
import { useDashboard } from "@/context/use-dashboard";
import { cn } from "@/lib/utils";

import { ConfidenceView } from "./ConfidenceView";
import { MapView } from "./MapView";
import { Panel } from "./Panel";
import { SpectralView } from "./SpectralView";
import { panelId, tabId } from "./view-meta";
import { ViewTabs } from "./ViewTabs";

const VIEW_COMPONENTS: Record<DashboardView, ComponentType> = {
  map: MapView,
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
export function ProspectivityExplorer() {
  const { activeView, mine } = useDashboard();

  return (
    <Panel title="Prospectivity Spatial Explorer" right={<ViewTabs />}>
      <div className="relative h-[340px]">
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
              {/* Remount only when the mine changes, never when the tab changes. */}
              <ViewComponent key={mine.id} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
