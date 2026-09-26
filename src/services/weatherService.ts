/**
 * Keyless precipitation data via Open-Meteo.
 *
 * No key, no signup, generous free tier for non-commercial use. Returns `null`
 * on any failure so the caller can fall back to the manual rainfall slider
 * rather than showing an error state.
 *
 * Endpoint is overridable via VITE_OPEN_METEO_BASE_URL for commercial plans.
 */

import { env } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 8_000;

/** Balaghat Mine — the default reference point from the project brief. */
export const DEFAULT_COORDINATES = { latitude: 21.8083, longitude: 80.1833 } as const;

export type DailyPrecipitation = {
  /** `YYYY-MM-DD`. */
  date: string;
  precipitationMm: number;
};

export type PrecipitationSnapshot = {
  latitude: number;
  longitude: number;
  daily: DailyPrecipitation[];
  /** Most recent day with a reading, or null if none. */
  latest: DailyPrecipitation | null;
  /** Wettest day in the window, or null if none. */
  peak: DailyPrecipitation | null;
  totalMm: number;
  timezone: string;
  fetchedAt: string;
};

export type FetchPrecipitationOptions = {
  /** Completed days to include before today. Open-Meteo caps this at 92. */
  pastDays?: number | undefined;
  /** Forecast days to include. Open-Meteo caps this at 16. */
  forecastDays?: number | undefined;
  signal?: AbortSignal | undefined;
};

type OpenMeteoPayload = {
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
  daily?: { time?: unknown; precipitation_sum?: unknown } | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Fetches daily precipitation totals for a coordinate.
 *
 * Open-Meteo returns `null` inside `precipitation_sum` for days it has no data
 * for, so those entries are dropped rather than coerced to 0 — a missing reading
 * and a genuinely dry day are different facts.
 */
export async function fetchDailyPrecipitation(
  latitude: number = DEFAULT_COORDINATES.latitude,
  longitude: number = DEFAULT_COORDINATES.longitude,
  options: FetchPrecipitationOptions = {},
): Promise<PrecipitationSnapshot | null> {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return null;

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "precipitation_sum",
    timezone: "auto",
    past_days: String(clamp(Math.floor(options.pastDays ?? 7), 0, 92)),
    forecast_days: String(clamp(Math.floor(options.forecastDays ?? 1), 0, 16)),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort("external");
  const externalSignal = options.signal;

  if (externalSignal !== undefined) {
    if (externalSignal.aborted) {
      clearTimeout(timeout);
      return null;
    }
    externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    const response = await fetch(`${env.weather.baseUrl}?${params.toString()}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as OpenMeteoPayload;
    const times = payload.daily?.time;
    const sums = payload.daily?.precipitation_sum;

    if (!Array.isArray(times) || !Array.isArray(sums)) return null;

    const daily: DailyPrecipitation[] = [];
    for (let index = 0; index < times.length; index++) {
      const date = times[index];
      const value = sums[index];
      // Skip gaps rather than reading a missing day as zero rainfall.
      if (typeof date !== "string" || !isFiniteNumber(value)) continue;
      daily.push({ date, precipitationMm: Math.max(0, Math.round(value * 10) / 10) });
    }

    if (daily.length === 0) return null;

    let latest = daily[0] ?? null;
    let peak = daily[0] ?? null;
    let totalMm = 0;

    for (const entry of daily) {
      totalMm += entry.precipitationMm;
      if (latest !== null && entry.date >= latest.date) latest = entry;
      if (peak !== null && entry.precipitationMm > peak.precipitationMm) peak = entry;
    }

    return {
      latitude: isFiniteNumber(payload.latitude) ? payload.latitude : latitude,
      longitude: isFiniteNumber(payload.longitude) ? payload.longitude : longitude,
      daily,
      latest,
      peak,
      totalMm: Math.round(totalMm * 10) / 10,
      timezone: typeof payload.timezone === "string" ? payload.timezone : "UTC",
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    // Offline, aborted, throttled or malformed — all handled the same way.
    return null;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }
}
