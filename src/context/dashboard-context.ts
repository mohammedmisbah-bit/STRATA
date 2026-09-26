import { createContext } from "react";

import type { MineProfile } from "@/lib/mine-data";
import type { ScenarioResult } from "@/lib/simulation";
import type { MineSource } from "@/services/mineService";

/** The three specialised GIS views. */
export const DASHBOARD_VIEWS = ["map", "spectral", "confidence"] as const;

export type DashboardView = (typeof DASHBOARD_VIEWS)[number];

export const DEFAULT_VIEW: DashboardView = "map";

export function isDashboardView(value: unknown): value is DashboardView {
  return typeof value === "string" && (DASHBOARD_VIEWS as readonly string[]).includes(value);
}

export type DashboardContextValue = {
  /** Currently selected mine id. */
  selectedMineId: string;
  /**
   * Resolved profile for `selectedMineId`. Always defined — falls back to the
   * first available mine if the selected id is not in the current roster.
   */
  mine: MineProfile;
  /** Full roster, live from Supabase when configured, otherwise the fallback. */
  mines: MineProfile[];
  /** Selector options in roster order. */
  mineOptions: Array<{ id: string; label: string }>;
  /** Whether the roster came from Supabase or the hardcoded fallback. */
  mineSource: MineSource;
  /** Reason the fallback was used, when applicable. */
  minesError: string | null;
  /** True only on the very first load, before any roster is available. */
  isLoadingMines: boolean;
  /** True during any fetch, including background refetches. */
  isFetchingMines: boolean;
  /** Re-runs the roster query. */
  refreshMines: () => void;
  /** Active specialised view tab. */
  activeView: DashboardView;
  hoistDowntimeHours: number;
  rainfallMm: number;
  /** Derived scenario for the current mine + slider values. */
  scenario: ScenarioResult;
  /** Sum of the current mine's open alert impacts, in tonnes. */
  loggedAlertImpactTonnes: number;
  selectMine: (id: unknown) => void;
  setActiveView: (view: unknown) => void;
  setHoistDowntimeHours: (hours: unknown) => void;
  setRainfallMm: (millimetres: unknown) => void;
  /** Returns both sliders to their spec defaults. */
  resetScenario: () => void;
};

export const DashboardContext = createContext<DashboardContextValue | null>(null);
