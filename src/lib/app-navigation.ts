import type { LucideIcon } from "lucide-react";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

/** Workspace routes. The public landing page lives at "/" outside this list. */
export type AppPath = "/dashboard" | "/prospectivity" | "/production" | "/risk" | "/simulator";

/** Keys into `nav.<id>.*` in the UI string dictionary. */
export type NavId = "overview" | "prospectivity" | "production" | "risk" | "simulator";

export type AppNavigationItem = {
  id: NavId;
  path: AppPath;
  icon: LucideIcon;
  accent: "teal" | "violet" | "amber" | "rose" | "sky";
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  { id: "overview", path: "/dashboard", icon: LayoutDashboard, accent: "teal" },
  { id: "prospectivity", path: "/prospectivity", icon: MapPinned, accent: "violet" },
  { id: "production", path: "/production", icon: ChartNoAxesCombined, accent: "sky" },
  { id: "risk", path: "/risk", icon: ShieldAlert, accent: "rose" },
  { id: "simulator", path: "/simulator", icon: SlidersHorizontal, accent: "amber" },
];

export function isNavigationActive(pathname: string, target: AppPath): boolean {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function navigationForPath(pathname: string): AppNavigationItem {
  return (
    APP_NAVIGATION.find((item) => isNavigationActive(pathname, item.path)) ?? APP_NAVIGATION[0]!
  );
}
