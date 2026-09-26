import { useContext } from "react";

import { DashboardContext, type DashboardContextValue } from "./dashboard-context";

/**
 * Reads the dashboard state engine.
 *
 * Throws on a missing provider rather than returning a silent default — a
 * component rendered outside `<DashboardProvider>` is a wiring bug, and a
 * degraded fallback would hide it.
 */
export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (context === null) {
    throw new Error("useDashboard must be used within a <DashboardProvider>.");
  }
  return context;
}
