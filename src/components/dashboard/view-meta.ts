import { Crosshair, Layers, Map as MapIcon, type LucideIcon } from "lucide-react";

import type { DashboardView } from "@/context/dashboard-context";

export const VIEW_META: Record<
  DashboardView,
  { label: string; icon: LucideIcon; description: string }
> = {
  map: { label: "Map Mode", icon: MapIcon, description: "High-density GIS risk map" },
  spectral: { label: "Spectral Layers", icon: Layers, description: "Band ratio breakdown" },
  confidence: {
    label: "Confidence Bounds",
    icon: Crosshair,
    description: "Bootstrap 95% intervals",
  },
};

/** Stable DOM ids so the tablist and tabpanels can reference each other. */
export function tabId(view: DashboardView): string {
  return `view-tab-${view}`;
}

export function panelId(view: DashboardView): string {
  return `view-panel-${view}`;
}
