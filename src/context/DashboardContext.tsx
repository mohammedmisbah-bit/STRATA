import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { composeMineProfile, DEFAULT_MINE_ID, getMineProfile } from "@/lib/mine-data";
import { clampHoistDowntime, clampRainfall, runScenario, SIMULATOR_LIMITS } from "@/lib/simulation";
import { FALLBACK_MINES, fetchMines, type FetchMinesResult } from "@/services/mineService";

import {
  DashboardContext,
  DEFAULT_VIEW,
  isDashboardView,
  type DashboardContextValue,
  type DashboardView,
} from "./dashboard-context";

export const MINES_QUERY_KEY = ["mines"] as const;

/**
 * Rendered on the server and during the first client paint. Using the hardcoded
 * roster as placeholder data means the markup is byte-identical on both sides,
 * so there is no hydration mismatch and no empty-selector flash. The query still
 * runs, and live rows replace this as soon as they arrive.
 */
const PLACEHOLDER_RESULT: FetchMinesResult = {
  mines: [...FALLBACK_MINES],
  source: "fallback",
  error: null,
};

/**
 * Single source of truth for the dashboard.
 *
 * Everything the UI renders is either a piece of state held here or a value
 * derived from it, so any control change recalculates the whole dashboard in one
 * pass. No component owns its own copy of mine, view or slider state.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedMineId, setSelectedMineId] = useState<string>(DEFAULT_MINE_ID);
  const [activeView, setActiveViewState] = useState<DashboardView>(DEFAULT_VIEW);
  const [hoistDowntimeHours, setHoistDowntimeState] = useState<number>(
    SIMULATOR_LIMITS.hoistDowntimeHours.default,
  );
  const [rainfallMm, setRainfallState] = useState<number>(SIMULATOR_LIMITS.rainfallMm.default);

  // `fetchMines` never rejects, so there is no error state to model here — a
  // failure arrives as a successful result carrying `source: "fallback"`.
  const minesQuery = useQuery({
    queryKey: MINES_QUERY_KEY,
    queryFn: fetchMines,
    placeholderData: PLACEHOLDER_RESULT,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const mines = useMemo(() => {
    const records = minesQuery.data?.mines ?? FALLBACK_MINES;
    const composed = records.map(composeMineProfile);
    // Guarantee a non-empty roster no matter what the data layer returns.
    return composed.length > 0 ? composed : [getMineProfile(DEFAULT_MINE_ID)];
  }, [minesQuery.data]);

  const mineOptions = useMemo(
    () => mines.map((profile) => ({ id: profile.id, label: profile.label })),
    [mines],
  );

  // Resolving against the live roster rather than validating on write means a
  // stale selection (roster changed under us) degrades to the first mine instead
  // of blanking the dashboard.
  const mine = useMemo(() => {
    const match = mines.find((profile) => profile.id === selectedMineId);
    return match ?? mines[0] ?? getMineProfile(DEFAULT_MINE_ID);
  }, [mines, selectedMineId]);

  const selectMine = useCallback((id: unknown) => {
    setSelectedMineId((current) => (typeof id === "string" && id.trim().length > 0 ? id : current));
  }, []);

  const setActiveView = useCallback((view: unknown) => {
    setActiveViewState((current) => (isDashboardView(view) ? view : current));
  }, []);

  const setHoistDowntimeHours = useCallback((hours: unknown) => {
    setHoistDowntimeState(clampHoistDowntime(hours));
  }, []);

  const setRainfallMm = useCallback((millimetres: unknown) => {
    setRainfallState(clampRainfall(millimetres));
  }, []);

  const resetScenario = useCallback(() => {
    setHoistDowntimeState(SIMULATOR_LIMITS.hoistDowntimeHours.default);
    setRainfallState(SIMULATOR_LIMITS.rainfallMm.default);
  }, []);

  const { refetch } = minesQuery;
  const refreshMines = useCallback(() => {
    // Discard the promise deliberately: `fetchMines` cannot reject, and react-query
    // already owns the result. Returning it would invite an unhandled rejection.
    void refetch();
  }, [refetch]);

  // Recomputed on any mine or slider change — this is what makes the whole
  // dashboard reactive from a single source of truth.
  const scenario = useMemo(
    () => runScenario(mine, { hoistDowntimeHours, rainfallMm }),
    [mine, hoistDowntimeHours, rainfallMm],
  );

  const loggedAlertImpactTonnes = useMemo(
    () => mine.riskAlerts.reduce((total, alert) => total + alert.impactTonnes, 0),
    [mine],
  );

  const mineSource = minesQuery.data?.source ?? "fallback";
  const minesError = minesQuery.data?.error ?? null;
  const isLoadingMines = minesQuery.isPending;
  const isFetchingMines = minesQuery.isFetching;

  const value = useMemo<DashboardContextValue>(
    () => ({
      selectedMineId,
      mine,
      mines,
      mineOptions,
      mineSource,
      minesError,
      isLoadingMines,
      isFetchingMines,
      refreshMines,
      activeView,
      hoistDowntimeHours,
      rainfallMm,
      scenario,
      loggedAlertImpactTonnes,
      selectMine,
      setActiveView,
      setHoistDowntimeHours,
      setRainfallMm,
      resetScenario,
    }),
    [
      selectedMineId,
      mine,
      mines,
      mineOptions,
      mineSource,
      minesError,
      isLoadingMines,
      isFetchingMines,
      refreshMines,
      activeView,
      hoistDowntimeHours,
      rainfallMm,
      scenario,
      loggedAlertImpactTonnes,
      selectMine,
      setActiveView,
      setHoistDowntimeHours,
      setRainfallMm,
      resetScenario,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
