import { useRef, type KeyboardEvent } from "react";

import { DASHBOARD_VIEWS, type DashboardView } from "@/context/dashboard-context";
import { useDashboard } from "@/context/use-dashboard";
import { cn } from "@/lib/utils";

import { panelId, tabId, VIEW_META } from "./view-meta";

/**
 * ARIA tablist with roving tabindex and arrow-key navigation.
 *
 * Only the active tab sits in the tab order; Left/Right/Up/Down/Home/End move
 * the selection and carry focus with it, which is the expected pattern for an
 * automatic-activation tablist.
 */
export function ViewTabs() {
  const { activeView, setActiveView } = useDashboard();
  const listRef = useRef<HTMLDivElement>(null);

  const focusTab = (view: DashboardView) => {
    listRef.current?.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = DASHBOARD_VIEWS.indexOf(activeView);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % DASHBOARD_VIEWS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + DASHBOARD_VIEWS.length) % DASHBOARD_VIEWS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = DASHBOARD_VIEWS.length - 1;
    }

    if (nextIndex === null) return;
    const nextView = DASHBOARD_VIEWS[nextIndex];
    if (nextView === undefined) return;

    event.preventDefault();
    setActiveView(nextView);
    focusTab(nextView);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Prospectivity explorer view"
      onKeyDown={handleKeyDown}
      className="flex flex-wrap gap-1.5"
    >
      {DASHBOARD_VIEWS.map((view) => {
        const meta = VIEW_META[view];
        const Icon = meta.icon;
        const isActive = activeView === view;

        return (
          <button
            key={view}
            id={tabId(view)}
            data-view={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId(view)}
            tabIndex={isActive ? 0 : -1}
            title={meta.description}
            onClick={() => setActiveView(view)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ease-in-out hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive
                ? "border-teal bg-teal text-primary-foreground shadow-sm"
                : "border-slate-line bg-card text-slate-600 hover:bg-secondary",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
