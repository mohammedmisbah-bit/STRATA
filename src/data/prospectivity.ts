/**
 * Output of the satellite prospectivity pipeline (`pipeline/strata_pipeline.py`).
 *
 * Sentinel-2 L2A median composite + Copernicus DEM GLO-90, fetched from the
 * Copernicus Data Space Ecosystem, scored by a presence-background Random
 * Forest trained on known MOIL deposits and validated leave-one-mine-out.
 *
 * The summary is bundled (static import) so server and client render the same
 * numbers with no loading flash. The full 500 m grid lives in Supabase
 * `prospectivity_grid` and is queried on demand (see prospectivityService).
 * Re-run the pipeline to refresh both.
 */
import raw from "./prospectivity-summary.json";

export type PipelineBand = {
  band: string;
  mean: number | null;
  lo: number | null;
  hi: number | null;
};

export type PipelineMineStats = {
  label: string;
  coordinateSource: string;
  score: number;
  lo: number;
  hi: number;
  /** Share of belt cells scoring at or below this mine's neighbourhood. */
  beltPercentile: number;
  ferric: number;
  ferrous: number;
  clay: number;
  ndvi: number;
  slope: number;
  relief: number;
  elevation: number;
  beltFerricPercentile: number;
  beltClayPercentile: number;
  confidenceBands: PipelineBand[];
};

export type ProspectTarget = {
  id: string;
  lat: number;
  lon: number;
  score: number;
  peak: number;
  lo: number;
  hi: number;
  areaKm2: number;
  nearestMine: string;
  nearestMineKm: number;
};

export type ValidationRow = {
  id: string;
  label: string;
  auc: number;
  baselineAuc: number;
  topPercent: number;
  heldOutWith: string[];
};

export type ProspectivitySummary = {
  generatedAt: string;
  sources: {
    imagery: string;
    imageryWindow: [string, string];
    composite: string;
    medianClearObservations: number;
    dem: string;
    labels: { id: string; label: string; source: string }[];
  };
  grid: { bbox: number[]; width: number; height: number; cellMeters: number; validCells: number };
  heatmap: {
    url: string;
    coordinates: [[number, number], [number, number], [number, number], [number, number]];
    threshold: number;
  };
  model: {
    type: string;
    trees: number;
    bootstrap: number;
    bootstrapUnit: string;
    interval: string;
    positiveRingMeters: number[];
    backgroundCells: number;
  };
  features: { id: string; label: string; importance: number }[];
  validation: {
    method: string;
    mines: ValidationRow[];
    meanAuc: number;
    baselineMeanAuc: number;
    baselineDescription: string;
  };
  mines: Record<string, PipelineMineStats>;
  targets: ProspectTarget[];
};

export const PROSPECTIVITY = raw as unknown as ProspectivitySummary;

export function getPipelineMine(id: string): PipelineMineStats | null {
  return PROSPECTIVITY.mines[id] ?? null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jan–Apr 2026" from the imagery window. */
export function imageryWindowLabel(): string {
  const [from, to] = PROSPECTIVITY.sources.imageryWindow;
  const month = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1] ?? "";
  const fromYear = from.slice(0, 4);
  const toYear = to.slice(0, 4);
  return fromYear === toYear
    ? `${month(from)}–${month(to)} ${toYear}`
    : `${month(from)} ${fromYear}–${month(to)} ${toYear}`;
}
