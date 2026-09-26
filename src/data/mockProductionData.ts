/**
 * Local synthetic production data. No Mockaroo, no network, no API key.
 *
 * Deterministic on purpose. The app server-renders, so a generator built on a
 * bare `Math.random()` would produce one dataset during SSR and a different one
 * during hydration, and React would throw a mismatch. A seeded PRNG plus a
 * UTC-midnight date anchor makes both passes agree.
 *
 * This module is the stand-in for the Supabase `production_logs` table. Keep the
 * `ProductionRecord` shape stable and swap the source underneath.
 */

import { env } from "@/lib/env";
import { MINE_OPTIONS } from "@/lib/mine-data";

export type ProductionRecord = {
  mine_name: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  /** 0.0 – 48.0, one decimal. */
  hoist_downtime_hrs: number;
  /** 0.0 – 120.0, one decimal. */
  rainfall_mm: number;
  /** Integer, 22,000 – 28,000. */
  target_tonnes: number;
  /** Integer, 14,000 – 28,500. */
  actual_tonnes: number;
};

export const PRODUCTION_RANGES = {
  hoistDowntimeHrs: { min: 0, max: 48 },
  rainfallMm: { min: 0, max: 120 },
  targetTonnes: { min: 22000, max: 28000 },
  actualTonnes: { min: 14000, max: 28500 },
} as const;

/**
 * Bump to reshuffle the fixture, or set VITE_MOCK_SEED in `.env`.
 *
 * Must stay a build-time constant: the server and the browser both generate the
 * fixture, so a value that differs between them would cause a hydration
 * mismatch. Vite inlines VITE_* identically on both sides, so this is safe.
 */
export const MOCK_SEED = env.mockData.seed;

export const MOCK_RECORD_COUNT = env.mockData.recordCount;

/**
 * mulberry32 — small, fast, well-distributed 32-bit PRNG.
 * Chosen over a hand-rolled LCG because the low bits stay usable.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomFloat(rng: () => number, min: number, max: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round((min + rng() * (max - min)) * factor) / factor;
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

/** `YYYY-MM-DD` for a UTC timestamp. Avoids local-timezone drift. */
function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/** Midnight UTC today — a stable anchor for both render passes. */
function utcMidnightToday(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

const DAY_MS = 86_400_000;

export type GenerateOptions = {
  /** Number of records to produce. Default 30. */
  count?: number | undefined;
  /** Mine names to draw from. Defaults to MOIL's five main mines. */
  mineNames?: readonly string[] | undefined;
  /** PRNG seed. Same seed always yields the same array. */
  seed?: number | undefined;
  /** Epoch ms for "today". Defaults to midnight UTC today. */
  anchorTimestamp?: number | undefined;
  /**
   * One record per mine per day instead of one record per day with a randomly
   * assigned mine. Used by the per-mine log panel.
   */
  perMine?: boolean | undefined;
};

const DEFAULT_MINE_NAMES: readonly string[] = MINE_OPTIONS.map((option) => option.label);

/**
 * Builds synthetic daily production records, newest first.
 *
 * Note on fidelity: per the agreed schema, `actual_tonnes` is drawn
 * independently of `hoist_downtime_hrs` and `rainfall_mm`. The fixture therefore
 * contains no causal signal between downtime, rainfall and output — fine for
 * populating tables and charts, but it cannot be used to fit or backtest the
 * shortfall forecaster. See `generateCorrelatedRecords` for that.
 */
export function generateProductionRecords(options: GenerateOptions = {}): ProductionRecord[] {
  const count = Math.max(0, Math.floor(options.count ?? MOCK_RECORD_COUNT));
  const seed = options.seed ?? MOCK_SEED;
  const anchor = options.anchorTimestamp ?? utcMidnightToday();
  const mines =
    options.mineNames !== undefined && options.mineNames.length > 0
      ? options.mineNames
      : DEFAULT_MINE_NAMES;

  const rng = mulberry32(seed);
  const records: ProductionRecord[] = [];

  for (let dayOffset = 0; dayOffset < count; dayOffset++) {
    const date = toIsoDate(anchor - dayOffset * DAY_MS);

    if (options.perMine === true) {
      for (const mineName of mines) {
        records.push(buildRecord(rng, mineName, date));
      }
      continue;
    }

    const mineName = mines[randomInt(rng, 0, mines.length - 1)] ?? mines[0] ?? "Unknown Mine";
    records.push(buildRecord(rng, mineName, date));
  }

  return records;
}

function buildRecord(rng: () => number, mineName: string, date: string): ProductionRecord {
  const { hoistDowntimeHrs, rainfallMm, targetTonnes, actualTonnes } = PRODUCTION_RANGES;
  return {
    mine_name: mineName,
    date,
    hoist_downtime_hrs: randomFloat(rng, hoistDowntimeHrs.min, hoistDowntimeHrs.max),
    rainfall_mm: randomFloat(rng, rainfallMm.min, rainfallMm.max),
    target_tonnes: randomInt(rng, targetTonnes.min, targetTonnes.max),
    actual_tonnes: randomInt(rng, actualTonnes.min, actualTonnes.max),
  };
}

/**
 * Variant where output actually responds to its drivers, using the same
 * coefficients as the scenario simulator (140 T per downtime hour, 55 T per mm)
 * plus noise. Use this when the shortfall model needs data with real signal in
 * it; the plain generator above is a presentation fixture only.
 */
export function generateCorrelatedRecords(options: GenerateOptions = {}): ProductionRecord[] {
  const base = generateProductionRecords(options);
  const rng = mulberry32((options.seed ?? MOCK_SEED) ^ 0x5f2d);

  return base.map((record) => {
    const modelledLoss = record.hoist_downtime_hrs * 140 + record.rainfall_mm * 55;
    const noise = randomFloat(rng, -900, 900, 0);
    const actual = Math.round(record.target_tonnes - modelledLoss + noise);
    return {
      ...record,
      actual_tonnes: Math.max(0, actual),
    };
  });
}

/**
 * The 30-record fixture, matching the agreed schema exactly.
 *
 * Module-scope evaluation is safe because the generator is deterministic — the
 * server and the browser build the identical array.
 */
export const MOCK_PRODUCTION_RECORDS: readonly ProductionRecord[] = generateProductionRecords();

/**
 * The correlated fixture — the one the UI renders.
 *
 * Deterministic for the same reason as `MOCK_PRODUCTION_RECORDS`, so it is safe
 * to evaluate at module scope under SSR.
 */
export const CORRELATED_PRODUCTION_RECORDS: readonly ProductionRecord[] =
  generateCorrelatedRecords();

export function getRecordsForMine(
  mineName: string,
  records: readonly ProductionRecord[] = MOCK_PRODUCTION_RECORDS,
): ProductionRecord[] {
  return records.filter((record) => record.mine_name === mineName);
}

/**
 * Pearson correlation between modelled loss and actual output.
 *
 * Lets the UI display the measured strength of the downtime/rainfall signal
 * rather than claiming it. Returns null when there is too little data or no
 * variance to correlate against.
 */
export function lossCorrelation(records: readonly ProductionRecord[]): number | null {
  if (records.length < 3) return null;

  const xs = records.map((r) => r.hoist_downtime_hrs * 140 + r.rainfall_mm * 55);
  const ys = records.map((r) => r.actual_tonnes);
  const meanX = xs.reduce((sum, v) => sum + v, 0) / xs.length;
  const meanY = ys.reduce((sum, v) => sum + v, 0) / ys.length;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let index = 0; index < xs.length; index++) {
    const dx = (xs[index] ?? 0) - meanX;
    const dy = (ys[index] ?? 0) - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  const denominator = Math.sqrt(varianceX * varianceY);
  if (denominator === 0) return null;

  const r = covariance / denominator;
  return Number.isFinite(r) ? r : null;
}

export type ProductionSummary = {
  recordCount: number;
  totalTargetTonnes: number;
  totalActualTonnes: number;
  /** Actual as a percentage of target, 0 when there is no target. */
  attainmentPct: number;
  avgHoistDowntimeHrs: number;
  totalRainfallMm: number;
  peakRainfallMm: number;
  daysBelowTarget: number;
};

const EMPTY_SUMMARY: ProductionSummary = {
  recordCount: 0,
  totalTargetTonnes: 0,
  totalActualTonnes: 0,
  attainmentPct: 0,
  avgHoistDowntimeHrs: 0,
  totalRainfallMm: 0,
  peakRainfallMm: 0,
  daysBelowTarget: 0,
};

/** Aggregates a record set. Returns zeroes for an empty input, never NaN. */
export function summarizeRecords(records: readonly ProductionRecord[]): ProductionSummary {
  if (records.length === 0) return EMPTY_SUMMARY;

  let totalTarget = 0;
  let totalActual = 0;
  let totalDowntime = 0;
  let totalRainfall = 0;
  let peakRainfall = 0;
  let daysBelowTarget = 0;

  for (const record of records) {
    totalTarget += record.target_tonnes;
    totalActual += record.actual_tonnes;
    totalDowntime += record.hoist_downtime_hrs;
    totalRainfall += record.rainfall_mm;
    if (record.rainfall_mm > peakRainfall) peakRainfall = record.rainfall_mm;
    if (record.actual_tonnes < record.target_tonnes) daysBelowTarget += 1;
  }

  return {
    recordCount: records.length,
    totalTargetTonnes: totalTarget,
    totalActualTonnes: totalActual,
    attainmentPct: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
    avgHoistDowntimeHrs: Math.round((totalDowntime / records.length) * 10) / 10,
    totalRainfallMm: Math.round(totalRainfall * 10) / 10,
    peakRainfallMm: peakRainfall,
    daysBelowTarget,
  };
}
