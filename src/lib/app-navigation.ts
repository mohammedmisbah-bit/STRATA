import type { LucideIcon } from "lucide-react";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export type AppPath = "/" | "/prospectivity" | "/production" | "/risk" | "/simulator";

export type AppNavigationItem = {
  path: AppPath;
  label: string;
  shortLabel: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  accent: "teal" | "violet" | "amber" | "rose" | "sky";
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  {
    path: "/",
    label: "Command Center",
    shortLabel: "Overview",
    description: "The essential picture across geology, output, risk and planning.",
    eyebrow: "Operations overview",
    icon: LayoutDashboard,
    accent: "teal",
  },
  {
    path: "/prospectivity",
    label: "Prospectivity",
    shortLabel: "Geology",
    description: "Explore the mineral belt, spectral signals and model confidence.",
    eyebrow: "Geospatial intelligence",
    icon: MapPinned,
    accent: "violet",
  },
  {
    path: "/production",
    label: "Production",
    shortLabel: "Output",
    description: "Understand target performance, history and production drivers.",
    eyebrow: "Production intelligence",
    icon: ChartNoAxesCombined,
    accent: "sky",
  },
  {
    path: "/risk",
    label: "Risk Monitor",
    shortLabel: "Risk",
    description: "Prioritise active issues and compare logged versus modelled impact.",
    eyebrow: "Operational assurance",
    icon: ShieldAlert,
    accent: "rose",
  },
  {
    path: "/simulator",
    label: "Scenario Lab",
    shortLabel: "Simulate",
    description: "Test downtime and rainfall, then turn the result into an action plan.",
    eyebrow: "Decision simulator",
    icon: SlidersHorizontal,
    accent: "amber",
  },
];

export function isNavigationActive(pathname: string, target: AppPath): boolean {
  return target === "/" ? pathname === "/" : pathname.startsWith(target);
}

export function navigationForPath(pathname: string): AppNavigationItem {
  return (
    APP_NAVIGATION.find((item) => isNavigationActive(pathname, item.path)) ?? APP_NAVIGATION[0]!
  );
}
