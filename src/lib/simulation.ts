/**
 * Scenario simulator — pure, synchronous, dependency-free.
 *
 * Nothing here touches React, the network, or the DOM. That keeps the model
 * swappable: when the FastAPI `/forecast` endpoint goes live it can return the
 * same `ScenarioResult` shape and the UI stays untouched, with these local
 * formulas remaining as the offline fallback.
 */

import type { MineProfile, RiskSeverity } from "./mine-data";

export const SIMULATOR_LIMITS = {
  hoistDowntimeHours: { min: 0, max: 48, step: 1, default: 12, unit: "hrs" },
  rainfallMm: { min: 0, max: 150, step: 1, default: 45, unit: "mm" },
} as const;

/** Tonnes lost per unit of each driver. */
export const LOSS_COEFFICIENTS = {
  perHoistDowntimeHour: 140,
  perRainfallMm: 55,
} as const;

/** Shortfall tonnage boundaries for severity classification. */
export const RISK_THRESHOLDS = {
  critical: 3500,
  high: 1200,
  medium: 400,
} as const;

export type ScenarioDriver = "hoist" | "rainfall" | "balanced";

export type ScenarioInput = {
  hoistDowntimeHours: number;
  rainfallMm: number;
};

export type ScenarioResult = {
  targetTonnes: number;
  projectedTonnes: number;
  /** Target minus projected. Never negative. */
  shortfallTonnes: number;
  /**
   * Raw modelled loss before the zero-floor clamp. Diverges from
   * `shortfallTonnes` only when the modelled loss exceeds the target.
   */
  modelledLossTonnes: number;
  hoistLossTonnes: number;
  rainfallLossTonnes: number;
  /** Projected output as a percentage of target, 0 – 100+. */
  attainmentPct: number;
  riskLevel: RiskSeverity;
  dominantDriver: ScenarioDriver;
  /** Share of modelled loss attributable to hoist downtime, 0 – 100. */
  hoistSharePct: number;
  rainfallSharePct: number;
  directives: string[];
};

/**
 * Coerces a value into a finite number inside [min, max].
 *
 * Only numbers and non-blank numeric strings are accepted. Everything else —
 * `null`, `undefined`, `""`, `[]`, `{}`, booleans — returns the fallback rather
 * than being coerced, because `Number(null)` and `Number("")` both evaluate to
 * `0`, which would silently read as a real zero-downtime reading.
 */
export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  let numeric: number;
  if (typeof value === "number") {
    numeric = value;
  } else if (typeof value === "string" && value.trim() !== "") {
    numeric = Number(value);
  } else {
    return fallback;
  }
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

export function clampHoistDowntime(value: unknown): number {
  const { min, max, default: fallback } = SIMULATOR_LIMITS.hoistDowntimeHours;
  return Math.round(clampNumber(value, min, max, fallback));
}

export function clampRainfall(value: unknown): number {
  const { min, max, default: fallback } = SIMULATOR_LIMITS.rainfallMm;
  return Math.round(clampNumber(value, min, max, fallback));
}

export function classifyShortfall(shortfallTonnes: number): RiskSeverity {
  const shortfall = Number.isFinite(shortfallTonnes) ? shortfallTonnes : 0;
  if (shortfall > RISK_THRESHOLDS.critical) return "CRITICAL";
  if (shortfall > RISK_THRESHOLDS.high) return "HIGH";
  if (shortfall > RISK_THRESHOLDS.medium) return "MEDIUM";
  return "LOW";
}

function resolveDominantDriver(hoistLoss: number, rainfallLoss: number): ScenarioDriver {
  if (hoistLoss === rainfallLoss) return "balanced";
  return hoistLoss > rainfallLoss ? "hoist" : "rainfall";
}

function formatTonnes(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

/**
 * Deterministic mitigation directives.
 *
 * Ordered so the dominant loss driver is addressed first, then the secondary
 * driver, then the planning follow-up. Once Groq (Llama-3.3-70B) is wired in,
 * this output becomes the grounding prompt and the guaranteed fallback when the
 * LLM call fails or times out.
 */
export function buildDirectives(
  mine: MineProfile,
  input: ScenarioInput,
  outcome: {
    hoistLossTonnes: number;
    rainfallLossTonnes: number;
    projectedTonnes: number;
    shortfallTonnes: number;
    riskLevel: RiskSeverity;
    dominantDriver: ScenarioDriver;
  },
): string[] {
  const { hoistDowntimeHours, rainfallMm } = input;
  const { projectedTonnes, shortfallTonnes, riskLevel, dominantDriver } = outcome;
  const isOpencast = mine.type === "opencast";
  const directives: string[] = [];

  const hoistDirective =
    hoistDowntimeHours === 0
      ? `Hoisting circuit nominal at ${mine.label}. Hold the current maintenance cadence and keep the standby winder on hot reserve.`
      : isOpencast
        ? `Recover ${hoistDowntimeHours} hr of hoisting/conveying loss at ${mine.label} by extending in-pit shovel-truck cycles and pulling spare dumpers onto the primary ramp.`
        : `Reschedule shaft maintenance into the 22:00–04:00 window and reallocate secondary underground haulage to offset the ${hoistDowntimeHours} hr hoist delay at ${mine.label} (${mine.depthMeters} m).`;

  const rainfallDirective =
    rainfallMm === 0
      ? `No precipitation impact modelled. Release held stock from the ROM pad while haul roads are dry.`
      : rainfallMm > 80
        ? isOpencast
          ? `Activate full pit dewatering and cover the ROM stockpiles — ${rainfallMm} mm exceeds the ${mine.district} bench-stability envelope.`
          : `Run decline sump pumps continuously and inspect portal drainage — ${rainfallMm} mm is above the safe infiltration margin at ${mine.label}.`
        : `Pre-position dewatering capacity; ${rainfallMm} mm at ${mine.label} remains inside operating tolerance.`;

  if (dominantDriver === "hoist") {
    directives.push(hoistDirective, rainfallDirective);
  } else if (dominantDriver === "rainfall") {
    directives.push(rainfallDirective, hoistDirective);
  } else {
    directives.push(
      `Hoist downtime and precipitation are contributing equally at ${mine.label}. Run both mitigations in parallel rather than sequencing them.`,
      hoistDirective,
      rainfallDirective,
    );
  }

  if (riskLevel === "CRITICAL") {
    directives.push(
      `Escalate to the ${mine.district} control room now — modelled shortfall of ${formatTonnes(shortfallTonnes)} T breaches the ${formatTonnes(RISK_THRESHOLDS.critical)} T critical threshold.`,
    );
  } else if (riskLevel === "HIGH") {
    directives.push(
      `Flag to the production planning desk; ${formatTonnes(shortfallTonnes)} T shortfall needs a recovery plan inside 48 hrs.`,
    );
  }

  directives.push(
    `Re-baseline the monthly plan to ${formatTonnes(projectedTonnes)} T against a ${formatTonnes(mine.monthlyTargetTonnes)} T target and notify despatch by 18:00 IST.`,
  );

  return directives;
}

/**
 * Runs the scenario for a mine. Inputs are clamped and the target is guarded, so
 * this is safe to call with unvalidated values.
 */
export function runScenario(mine: MineProfile, input: ScenarioInput): ScenarioResult {
  const hoistDowntimeHours = clampHoistDowntime(input.hoistDowntimeHours);
  const rainfallMm = clampRainfall(input.rainfallMm);

  const targetTonnes = Number.isFinite(mine.monthlyTargetTonnes)
    ? Math.max(0, mine.monthlyTargetTonnes)
    : 0;

  const hoistLossTonnes = hoistDowntimeHours * LOSS_COEFFICIENTS.perHoistDowntimeHour;
  const rainfallLossTonnes = rainfallMm * LOSS_COEFFICIENTS.perRainfallMm;
  const modelledLossTonnes = hoistLossTonnes + rainfallLossTonnes;

  const projectedTonnes = Math.max(0, targetTonnes - modelledLossTonnes);
  const shortfallTonnes = targetTonnes - projectedTonnes;

  const attainmentPct = targetTonnes > 0 ? (projectedTonnes / targetTonnes) * 100 : 0;
  const riskLevel = classifyShortfall(shortfallTonnes);
  const dominantDriver = resolveDominantDriver(hoistLossTonnes, rainfallLossTonnes);

  const hoistSharePct = modelledLossTonnes > 0 ? (hoistLossTonnes / modelledLossTonnes) * 100 : 0;

  const directives = buildDirectives(
    mine,
    { hoistDowntimeHours, rainfallMm },
    {
      hoistLossTonnes,
      rainfallLossTonnes,
      projectedTonnes,
      shortfallTonnes,
      riskLevel,
      dominantDriver,
    },
  );

  return {
    targetTonnes,
    projectedTonnes,
    shortfallTonnes,
    modelledLossTonnes,
    hoistLossTonnes,
    rainfallLossTonnes,
    attainmentPct,
    riskLevel,
    dominantDriver,
    hoistSharePct,
    rainfallSharePct: modelledLossTonnes > 0 ? 100 - hoistSharePct : 0,
    directives,
  };
}
