import type { ComponentType } from "react";

import { DASHBOARD_VIEWS, type DashboardView } from "@/context/dashboard-context";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
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
 * All three stay mounted and cross-fade via opacity + a small translate
 * (compositor-only), so switching tabs never tears down the WebGL map or
 * re-measures a chart. The stage height is fixed per breakpoint — animating
 * height would force layout every frame.
 *
 * Inactive panels get `pointer-events-none`, `aria-hidden` and `inert` so they
 * are unreachable by mouse, screen reader and keyboard alike.
 */
export function ProspectivityExplorer({ expanded = false }: { expanded?: boolean | undefined }) {
  const { activeView, mine } = useDashboard();
  const t = useUiText();

  return (
    <Panel
      title={t("explorer.title")}
      provenance="simulated"
      description={t("explorer.desc")}
      right={<ViewTabs />}
      footer={<ProspectivityMapAttribution />}
    >
      <div
        className={cn(
          "relative",
          // Mobile needs extra height so the stacked spectral cards fit.
          expanded ? "h-[760px] md:h-[560px]" : "h-[720px] md:h-[420px]",
        )}
      >
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
              inert={!isActive}
              className={cn(
                "absolute inset-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isActive
                  ? "z-10 translate-y-0 opacity-100"
                  : "pointer-events-none z-0 translate-y-1.5 opacity-0",
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
