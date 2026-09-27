/**
 * MOIL mine master data.
 *
 * Ground-truth fields — `depthMeters`, `type`, `oreProfile`, `operationalNote` —
 * carry approximate figures from MOIL SEBI / NSE corporate filings and the IBM
 * Indian Minerals Yearbook, tagged via `officialSource`. Depths are rounded and
 * change as development deepens; re-check against the latest annual report.
 *
 * ⚠️ Everything else — targets, trends, alerts, confidence bands, spectral
 * readings, beacons — is still a plausible placeholder so the UI can be
 * exercised end to end. Those values are expected to be replaced by the
 * Supabase `mines` / `production_logs` / `prospectivity_grid` tables.
 *
 * The shape of this module is the contract the UI consumes. Keep the types
 * stable and swap the data source underneath.
 */

/** Provenance tag for the MOIL ground-truth fields on each mine record. */
export const MOIL_OFFICIAL_SOURCE = "MOIL SEBI / NSE Corporate Filings";

export const MINE_IDS = ["balaghat", "dongri-buzurg", "chikla", "kandri", "ukwa"] as const;

export type MineId = (typeof MINE_IDS)[number];

/** Default selection required by spec: Balaghat Mine. */
export const DEFAULT_MINE_ID: MineId = "balaghat";

export type MineType = "underground" | "opencast";

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Coordinates = {
  lat: number;
  lon: number;
};

/** One month of target-vs-actual production, in tonnes. */
export type TrendPoint = {
  month: string;
  target: number;
  actual: number;
};

export type RiskAlert = {
  id: string;
  severity: RiskSeverity;
  title: string;
  cause: string;
  /** Positive magnitude in tonnes. The UI renders the sign. */
  impactTonnes: number;
  detectedAt: string;
};

/** A single point on the bootstrap confidence-interval curve. */
export type ConfidenceBand = {
  band: string;
  mean: number;
  lo: number;
  hi: number;
};

export type SpectralTone = "ochre" | "teal" | "slate";

export type SpectralLayer = {
  id: string;
  title: string;
  source: string;
  description: string;
  reading: string;
  tone: SpectralTone;
};

export type BeaconTone = "rose" | "emerald" | "amber";

/**
 * Map annotation. `xPct` / `yPct` place the beacon on the current CSS map
 * surface; `coordinates` carries the real position so the MapLibre GL swap can
 * drop the percentages without touching the data layer.
 */
export type MapBeacon = {
  id: string;
  tone: BeaconTone;
  label: string;
  xPct: number;
  yPct: number;
  coordinates: Coordinates;
};

export type MineProfile = {
  /**
   * Slug. One of `MineId` for the five known mines, but deliberately widened to
   * `string` so a mine that only exists in Supabase still renders.
   */
  id: string;
  /** Canonical display name used by the selector and all headings. */
  label: string;
  district: string;
  state: string;
  type: MineType;
  depthMeters: number;
  /** Ore character, e.g. grade band or ore type. */
  oreProfile: string;
  /** Provenance of the ground-truth fields. */
  officialSource: string;
  /** Operational context, e.g. a mining-method transition. */
  operationalNote: string | null;
  monthlyTargetTonnes: number;
  coordinates: Coordinates;
  gridResolution: string;
  beltName: string;
  /** Mean prospectivity score, 0.0 – 1.0. */
  prospectivityScore: number;
  /** ± variance from the Random Forest bootstrap. */
  prospectivityVariance: number;
  trend: TrendPoint[];
  riskAlerts: RiskAlert[];
  confidenceBands: ConfidenceBand[];
  spectralLayers: SpectralLayer[];
  mapBeacons: MapBeacon[];
};

const FISCAL_MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
] as const;

/**
 * Pairs a flat list of actuals with the fiscal-month labels. Guards against a
 * short or over-long actuals array so a bad data feed can never produce holes
 * in the chart.
 */
function buildTrend(target: number, actuals: readonly number[]): TrendPoint[] {
  return FISCAL_MONTHS.map((month, index) => ({
    month,
    target,
    actual: actuals[index] ?? target,
  }));
}

const MINE_PROFILES: Record<MineId, MineProfile> = {
  balaghat: {
    id: "balaghat",
    label: "Balaghat Mine",
    district: "Balaghat",
    state: "Madhya Pradesh",
    type: "underground",
    depthMeters: 385,
    oreProfile: "High-grade Mn > 44%",
    officialSource: MOIL_OFFICIAL_SOURCE,
    operationalNote: "Deepest underground manganese mine in Asia",
    monthlyTargetTonnes: 25000,
    coordinates: { lat: 21.8083, lon: 80.1833 },
    gridResolution: "10 m × 10 m",
    beltName: "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: 0.84,
    prospectivityVariance: 0.06,
    trend: buildTrend(
      25000,
      [24100, 24800, 22300, 19800, 18900, 21200, 23600, 24500, 25300, 25100, 24700, 23900],
    ),
    riskAlerts: [
      {
        id: "blg-hoist-3",
        severity: "CRITICAL",
        title: "Shaft #3 Hoist Gearbox Degradation",
        cause: "Gear reliability failure — vibration signature above threshold",
        impactTonnes: 2100,
        detectedAt: "02:14 IST",
      },
      {
        id: "blg-vent-l7",
        severity: "MEDIUM",
        title: "Level 7 Ventilation Fan Derate",
        cause: "Secondary fan holding 78% of rated airflow",
        impactTonnes: 600,
        detectedAt: "05:40 IST",
      },
    ],
    confidenceBands: [
      { band: "Top 5%", mean: 0.92, lo: 0.86, hi: 0.97 },
      { band: "Top 10%", mean: 0.85, lo: 0.78, hi: 0.91 },
      { band: "Top 20%", mean: 0.71, lo: 0.62, hi: 0.79 },
      { band: "Top 30%", mean: 0.54, lo: 0.45, hi: 0.62 },
      { band: "Top 50%", mean: 0.28, lo: 0.2, hi: 0.35 },
    ],
    spectralLayers: [
      {
        id: "blg-iron",
        title: "Iron Oxide Index",
        source: "Sentinel-2 · Band 4 / Band 2",
        description:
          "Weathered manganese gossans mapped from surface reflectance across the shaft collar corridor.",
        reading: "1.84 · High anomaly",
        tone: "ochre",
      },
      {
        id: "blg-clay",
        title: "Clay Alteration Ratio",
        source: "Sentinel-2 · Band 11 / Band 12",
        description:
          "Hydrothermal alteration halo indicating favourable host lithology along the strike.",
        reading: "2.12 · Optimal",
        tone: "teal",
      },
      {
        id: "blg-dem",
        title: "SRTM DEM Lineaments",
        source: "SRTM 30 m · Hillshade",
        description: "Fault structure and topography controlling ore body continuity at depth.",
        reading: "Slope 14.2° · Density high",
        tone: "slate",
      },
    ],
    mapBeacons: [
      {
        id: "blg-beacon-risk",
        tone: "rose",
        label: "Shaft #3 · CRITICAL (-2,100 T)",
        xPct: 62,
        yPct: 34,
        coordinates: { lat: 21.8112, lon: 80.1878 },
      },
      {
        id: "blg-beacon-prospect",
        tone: "emerald",
        label: "North strike extension · Score 0.91",
        xPct: 24,
        yPct: 58,
        coordinates: { lat: 21.8201, lon: 80.1702 },
      },
    ],
  },

  "dongri-buzurg": {
    id: "dongri-buzurg",
    label: "Dongri Buzurg Mine",
    district: "Bhandara",
    state: "Maharashtra",
    type: "opencast",
    depthMeters: 120,
    oreProfile: "Manganese dioxide (MnO₂) ore",
    officialSource: MOIL_OFFICIAL_SOURCE,
    operationalNote: "Opencast-to-underground transition",
    monthlyTargetTonnes: 18000,
    coordinates: { lat: 21.3833, lon: 79.6167 },
    gridResolution: "10 m × 10 m",
    beltName: "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: 0.79,
    prospectivityVariance: 0.08,
    trend: buildTrend(
      18000,
      [17600, 18200, 14100, 11200, 10400, 13800, 16900, 17800, 18400, 18100, 17600, 16800],
    ),
    riskAlerts: [
      {
        id: "dgb-bench-4",
        severity: "HIGH",
        title: "Bench 4 Slope Slagging",
        cause: "Rainfall saturation — 118 mm logged over 72 h",
        impactTonnes: 1400,
        detectedAt: "23:05 IST",
      },
      {
        id: "dgb-ramp-2",
        severity: "MEDIUM",
        title: "Haul Road Washout — Pit Ramp 2",
        cause: "Surface runoff eroding ramp crown",
        impactTonnes: 500,
        detectedAt: "06:20 IST",
      },
    ],
    confidenceBands: [
      { band: "Top 5%", mean: 0.88, lo: 0.8, hi: 0.95 },
      { band: "Top 10%", mean: 0.8, lo: 0.71, hi: 0.88 },
      { band: "Top 20%", mean: 0.66, lo: 0.55, hi: 0.76 },
      { band: "Top 30%", mean: 0.49, lo: 0.38, hi: 0.59 },
      { band: "Top 50%", mean: 0.24, lo: 0.15, hi: 0.32 },
    ],
    spectralLayers: [
      {
        id: "dgb-iron",
        title: "Iron Oxide Index",
        source: "Sentinel-2 · Band 4 / Band 2",
        description:
          "Exposed pit walls give a direct reflectance read on manganese-bearing horizons.",
        reading: "2.07 · Very high anomaly",
        tone: "ochre",
      },
      {
        id: "dgb-clay",
        title: "Clay Alteration Ratio",
        source: "Sentinel-2 · Band 11 / Band 12",
        description: "Elevated clay response on the southern wall — monitor for slope stability.",
        reading: "2.48 · Elevated",
        tone: "teal",
      },
      {
        id: "dgb-dem",
        title: "SRTM DEM Lineaments",
        source: "SRTM 30 m · Hillshade",
        description: "Shallow gradient pit floor with moderate structural control on ore limits.",
        reading: "Slope 6.8° · Density moderate",
        tone: "slate",
      },
    ],
    mapBeacons: [
      {
        id: "dgb-beacon-risk",
        tone: "amber",
        label: "Bench 4 · HIGH (-1,400 T)",
        xPct: 55,
        yPct: 46,
        coordinates: { lat: 21.3861, lon: 79.6203 },
      },
      {
        id: "dgb-beacon-prospect",
        tone: "emerald",
        label: "South-east pit margin · Score 0.83",
        xPct: 30,
        yPct: 64,
        coordinates: { lat: 21.3795, lon: 79.6124 },
      },
    ],
  },

  chikla: {
    id: "chikla",
    label: "Chikla Mine",
    district: "Bhandara",
    state: "Maharashtra",
    type: "underground",
    depthMeters: 180,
    oreProfile: "Manganese ore (Sausar Group)",
    officialSource: MOIL_OFFICIAL_SOURCE,
    operationalNote: null,
    monthlyTargetTonnes: 9500,
    coordinates: { lat: 21.25, lon: 79.65 },
    gridResolution: "10 m × 10 m",
    beltName: "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: 0.72,
    prospectivityVariance: 0.09,
    trend: buildTrend(
      9500,
      [9200, 9400, 8600, 7900, 7500, 8400, 9100, 9300, 9600, 9500, 9200, 8900],
    ),
    riskAlerts: [
      {
        id: "chk-blast-window",
        severity: "MEDIUM",
        title: "Blasting Window Deferred",
        cause: "Statutory clearance delay — 2 rounds pushed to next shift",
        impactTonnes: 450,
        detectedAt: "11:30 IST",
      },
    ],
    confidenceBands: [
      { band: "Top 5%", mean: 0.83, lo: 0.73, hi: 0.92 },
      { band: "Top 10%", mean: 0.74, lo: 0.63, hi: 0.84 },
      { band: "Top 20%", mean: 0.6, lo: 0.48, hi: 0.71 },
      { band: "Top 30%", mean: 0.44, lo: 0.32, hi: 0.55 },
      { band: "Top 50%", mean: 0.21, lo: 0.12, hi: 0.3 },
    ],
    spectralLayers: [
      {
        id: "chk-iron",
        title: "Iron Oxide Index",
        source: "Sentinel-2 · Band 4 / Band 2",
        description: "Moderate gossan expression, partly masked by seasonal vegetation cover.",
        reading: "1.52 · Moderate anomaly",
        tone: "ochre",
      },
      {
        id: "chk-clay",
        title: "Clay Alteration Ratio",
        source: "Sentinel-2 · Band 11 / Band 12",
        description: "Alteration signature consistent with the regional host sequence.",
        reading: "1.94 · Favourable",
        tone: "teal",
      },
      {
        id: "chk-dem",
        title: "SRTM DEM Lineaments",
        source: "SRTM 30 m · Hillshade",
        description: "Cross-cutting lineament set suggests localised ore body segmentation.",
        reading: "Slope 11.4° · Density moderate",
        tone: "slate",
      },
    ],
    mapBeacons: [
      {
        id: "chk-beacon-risk",
        tone: "amber",
        label: "Blast window slip · MEDIUM (-450 T)",
        xPct: 58,
        yPct: 40,
        coordinates: { lat: 21.2534, lon: 79.6541 },
      },
      {
        id: "chk-beacon-prospect",
        tone: "emerald",
        label: "West block · Score 0.76",
        xPct: 27,
        yPct: 62,
        coordinates: { lat: 21.2468, lon: 79.6441 },
      },
    ],
  },

  kandri: {
    id: "kandri",
    label: "Kandri Mine",
    district: "Nagpur",
    state: "Maharashtra",
    type: "underground",
    depthMeters: 160,
    oreProfile: "Manganese ore (Sausar Group)",
    officialSource: MOIL_OFFICIAL_SOURCE,
    operationalNote: null,
    monthlyTargetTonnes: 6800,
    coordinates: { lat: 21.3167, lon: 79.15 },
    gridResolution: "10 m × 10 m",
    beltName: "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: 0.66,
    prospectivityVariance: 0.11,
    trend: buildTrend(
      6800,
      [6600, 6750, 6200, 5700, 5400, 6100, 6550, 6700, 6900, 6800, 6600, 6350],
    ),
    riskAlerts: [
      {
        id: "kdr-rope-ndt",
        severity: "LOW",
        title: "Winder Rope Inspection Due",
        cause: "Scheduled non-destructive testing within 96 h",
        impactTonnes: 180,
        detectedAt: "09:15 IST",
      },
    ],
    confidenceBands: [
      { band: "Top 5%", mean: 0.78, lo: 0.66, hi: 0.89 },
      { band: "Top 10%", mean: 0.69, lo: 0.56, hi: 0.81 },
      { band: "Top 20%", mean: 0.55, lo: 0.42, hi: 0.68 },
      { band: "Top 30%", mean: 0.4, lo: 0.27, hi: 0.52 },
      { band: "Top 50%", mean: 0.18, lo: 0.09, hi: 0.27 },
    ],
    spectralLayers: [
      {
        id: "kdr-iron",
        title: "Iron Oxide Index",
        source: "Sentinel-2 · Band 4 / Band 2",
        description: "Subdued surface response — limited outcrop, heavier soil cover.",
        reading: "1.28 · Low anomaly",
        tone: "ochre",
      },
      {
        id: "kdr-clay",
        title: "Clay Alteration Ratio",
        source: "Sentinel-2 · Band 11 / Band 12",
        description: "Patchy alteration; prospectivity leans on drilling records over spectra.",
        reading: "1.61 · Marginal",
        tone: "teal",
      },
      {
        id: "kdr-dem",
        title: "SRTM DEM Lineaments",
        source: "SRTM 30 m · Hillshade",
        description: "Low relief terrain weakens DEM-derived structural discrimination.",
        reading: "Slope 4.9° · Density low",
        tone: "slate",
      },
    ],
    mapBeacons: [
      {
        id: "kdr-beacon-risk",
        tone: "emerald",
        label: "Winder NDT · LOW (-180 T)",
        xPct: 60,
        yPct: 42,
        coordinates: { lat: 21.3198, lon: 79.1538 },
      },
      {
        id: "kdr-beacon-prospect",
        tone: "emerald",
        label: "North-west lead · Score 0.69",
        xPct: 26,
        yPct: 60,
        coordinates: { lat: 21.3229, lon: 79.1442 },
      },
    ],
  },

  ukwa: {
    id: "ukwa",
    label: "Ukwa Mine",
    district: "Balaghat",
    state: "Madhya Pradesh",
    type: "underground",
    depthMeters: 150,
    oreProfile: "Manganese ore (Sausar Group)",
    officialSource: MOIL_OFFICIAL_SOURCE,
    operationalNote: "Underground slope (incline) mine",
    monthlyTargetTonnes: 7200,
    coordinates: { lat: 21.9333, lon: 80.4167 },
    gridResolution: "10 m × 10 m",
    beltName: "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: 0.88,
    prospectivityVariance: 0.05,
    trend: buildTrend(
      7200,
      [7000, 7150, 6600, 6000, 5700, 6450, 6950, 7100, 7300, 7200, 7000, 6750],
    ),
    riskAlerts: [
      {
        id: "ukw-belt-align",
        severity: "HIGH",
        title: "Incline Haulage Belt Misalignment",
        cause: "Tracking fault on drive pulley — throughput derated",
        impactTonnes: 1250,
        detectedAt: "04:50 IST",
      },
      {
        id: "ukw-compressor-2",
        severity: "LOW",
        title: "Compressor #2 On Standby",
        cause: "Preventive maintenance rotation",
        impactTonnes: 150,
        detectedAt: "08:00 IST",
      },
    ],
    confidenceBands: [
      { band: "Top 5%", mean: 0.95, lo: 0.9, hi: 0.99 },
      { band: "Top 10%", mean: 0.89, lo: 0.83, hi: 0.94 },
      { band: "Top 20%", mean: 0.76, lo: 0.68, hi: 0.83 },
      { band: "Top 30%", mean: 0.59, lo: 0.5, hi: 0.67 },
      { band: "Top 50%", mean: 0.32, lo: 0.24, hi: 0.4 },
    ],
    spectralLayers: [
      {
        id: "ukw-iron",
        title: "Iron Oxide Index",
        source: "Sentinel-2 · Band 4 / Band 2",
        description: "Strongest gossan response in the portfolio — extensive weathered exposure.",
        reading: "2.21 · Very high anomaly",
        tone: "ochre",
      },
      {
        id: "ukw-clay",
        title: "Clay Alteration Ratio",
        source: "Sentinel-2 · Band 11 / Band 12",
        description: "Broad, coherent alteration envelope over the eastern lease boundary.",
        reading: "2.64 · Optimal",
        tone: "teal",
      },
      {
        id: "ukw-dem",
        title: "SRTM DEM Lineaments",
        source: "SRTM 30 m · Hillshade",
        description: "Dense lineament intersections coincide with the highest scoring cells.",
        reading: "Slope 18.6° · Density very high",
        tone: "slate",
      },
    ],
    mapBeacons: [
      {
        id: "ukw-beacon-risk",
        tone: "amber",
        label: "Incline belt · HIGH (-1,250 T)",
        xPct: 64,
        yPct: 36,
        coordinates: { lat: 21.9366, lon: 80.4211 },
      },
      {
        id: "ukw-beacon-prospect",
        tone: "emerald",
        label: "Ukwa deposit core · Score 0.88",
        xPct: 22,
        yPct: 60,
        coordinates: { lat: 21.9401, lon: 80.4082 },
      },
    ],
  },
};

/** Selector options in display order. */
export const MINE_OPTIONS: ReadonlyArray<{ id: MineId; label: string }> = MINE_IDS.map((id) => ({
  id,
  label: MINE_PROFILES[id].label,
}));

export function isMineId(value: unknown): value is MineId {
  return typeof value === "string" && (MINE_IDS as readonly string[]).includes(value);
}

/**
 * Always returns a usable profile. An unknown id falls back to the default mine
 * rather than throwing, so a stale URL or bad persisted value can't blank the
 * dashboard.
 */
export function getMineProfile(id: unknown): MineProfile {
  return isMineId(id) ? MINE_PROFILES[id] : MINE_PROFILES[DEFAULT_MINE_ID];
}

export function describeMineDepth(mine: MineProfile): string {
  return `${mine.depthMeters} m ${mine.type}`;
}

/**
 * Operational fields sourced from the database. Structural on purpose so this
 * module does not have to import from the service layer.
 */
export type MineOverride = {
  id: string;
  name: string;
  district: string;
  state: string;
  mineType: MineType;
  depthMeters: number;
  latitude: number;
  longitude: number;
  monthlyTargetTonnes: number;
  oreProfile: string;
  officialSource: string;
  operationalNote: string | null;
};

/**
 * Merges a database row over the local profile.
 *
 * The database is authoritative for operational fields (name, depth, target,
 * coordinates) while this module keeps supplying the presentation scaffolding
 * (trend, alerts, confidence bands, spectral layers) until those tables exist.
 *
 * Zero or missing numerics do NOT override — an unpopulated `depth_m` column
 * must not wipe a known 385 m shaft depth. A mine with no local profile is
 * synthesised with empty collections, which every panel already renders as an
 * explicit "no data" state rather than as zeroes.
 */
export function composeMineProfile(override: MineOverride): MineProfile {
  const base = isMineId(override.id) ? MINE_PROFILES[override.id] : null;

  const depthMeters = override.depthMeters > 0 ? override.depthMeters : (base?.depthMeters ?? 0);
  const monthlyTargetTonnes =
    override.monthlyTargetTonnes > 0
      ? override.monthlyTargetTonnes
      : (base?.monthlyTargetTonnes ?? 0);

  // Keep the local trend aligned with whichever target won, or the chart's
  // target line will contradict the KPI strip.
  const trend =
    base === null ? [] : base.trend.map((point) => ({ ...point, target: monthlyTargetTonnes }));

  return {
    id: override.id,
    label: override.name,
    district: override.district,
    state: override.state,
    type: override.mineType,
    depthMeters,
    oreProfile: override.oreProfile,
    officialSource: override.officialSource,
    operationalNote: override.operationalNote,
    monthlyTargetTonnes,
    coordinates: { lat: override.latitude, lon: override.longitude },
    gridResolution: base?.gridResolution ?? "10 m × 10 m",
    beltName: base?.beltName ?? "Nagpur – Bhandara – Balaghat Manganese Belt",
    prospectivityScore: base?.prospectivityScore ?? 0,
    prospectivityVariance: base?.prospectivityVariance ?? 0,
    trend,
    riskAlerts: base?.riskAlerts ?? [],
    confidenceBands: base?.confidenceBands ?? [],
    spectralLayers: base?.spectralLayers ?? [],
    mapBeacons: base?.mapBeacons ?? [
      {
        id: `${override.id}-beacon`,
        tone: "emerald",
        label: `${override.name} · no survey data`,
        xPct: 48,
        yPct: 46,
        coordinates: { lat: override.latitude, lon: override.longitude },
      },
    ],
  };
}
