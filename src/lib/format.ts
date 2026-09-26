import type { RiskSeverity } from "./mine-data";

/** Indian-locale tonnage. Non-finite input renders as an em dash, never "NaN". */
export function formatTonnes(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("en-IN");
}

/** Signed tonnage for deltas. Zero renders unsigned. */
export function formatSignedTonnes(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toLocaleString("en-IN")}`;
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatScore(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

/** Decimal degrees with a hemisphere suffix. */
export function formatLatitude(lat: number | null | undefined): string {
  if (typeof lat !== "number" || !Number.isFinite(lat)) return "—";
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
}

export function formatLongitude(lon: number | null | undefined): string {
  if (typeof lon !== "number" || !Number.isFinite(lon)) return "—";
  return `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
}

/** Tailwind classes per severity. Single source of truth for badge colour. */
export const RISK_BADGE_CLASSES: Record<RiskSeverity, string> = {
  CRITICAL: "bg-rose-100 text-rose-800 border-rose-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  MEDIUM: "bg-amber-100 text-amber-900 border-amber-300",
  LOW: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

/** Card surface classes for an alert of a given severity. */
export const RISK_SURFACE_CLASSES: Record<RiskSeverity, string> = {
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-900",
  HIGH: "border-orange-200 bg-orange-50 text-orange-900",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-900",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export const RISK_BEACON_TONE: Record<RiskSeverity, "rose" | "amber" | "emerald"> = {
  CRITICAL: "rose",
  HIGH: "amber",
  MEDIUM: "amber",
  LOW: "emerald",
};
