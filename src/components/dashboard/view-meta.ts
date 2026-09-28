import { Crosshair, Layers, Map as MapIcon, type LucideIcon } from "lucide-react";

import type { DashboardView } from "@/context/dashboard-context";
import type { UiKey } from "@/i18n/ui-strings";

export const VIEW_META: Record<
  DashboardView,
  { labelKey: UiKey; descKey: UiKey; icon: LucideIcon }
> = {
  map: { labelKey: "view.map", descKey: "view.map.desc", icon: MapIcon },
  spectral: { labelKey: "view.spectral", descKey: "view.spectral.desc", icon: Layers },
  confidence: { labelKey: "view.confidence", descKey: "view.confidence.desc", icon: Crosshair },
};

/** Stable DOM ids so the tablist and tabpanels can reference each other. */
export function tabId(view: DashboardView): string {
  return `view-tab-${view}`;
}

export function panelId(view: DashboardView): string {
  return `view-panel-${view}`;
}
