/**
 * Mine master data access.
 *
 * Reads the Supabase `mines` table when configured, and falls back to a
 * hardcoded roster of MOIL's five mines on any failure — missing credentials,
 * missing table, RLS denial, network loss or malformed rows. `fetchMines()`
 * therefore always resolves with a usable roster and never rejects, so the mine
 * selector can never render empty.
 *
 * The table does not exist yet, so row mapping is deliberately tolerant: several
 * plausible column spellings are accepted for each field. Tighten
 * `normalizeRow` once the real schema is fixed.
 */

import { isNotConfiguredError, supabase } from "@/lib/supabase";
import { MINE_IDS, type MineId, type MineType } from "@/lib/mine-data";

export const MINES_TABLE = "mines";

/** Operational record for one mine. Mirrors the intended `mines` table. */
export type MineRecord = {
  /** Slug. Matches a local MineId when the mine is one of the known five. */
  id: string;
  name: string;
  district: string;
  state: string;
  mineType: MineType;
  depthMeters: number;
  latitude: number;
  longitude: number;
  monthlyTargetTonnes: number;
};

export type MineSource = "supabase" | "fallback";

export type FetchMinesResult = {
  mines: MineRecord[];
  source: MineSource;
  /** Populated only when `source` is "fallback". */
  error: string | null;
};

/**
 * Hardcoded MOIL roster. The guaranteed floor for the UI.
 *
 * ⚠️ Coordinates, depths and targets are the same placeholder figures used
 * elsewhere in the project — plausible, not authoritative. Supabase overrides
 * them once populated.
 */
export const FALLBACK_MINES: readonly MineRecord[] = [
  {
    id: "balaghat",
    name: "Balaghat Mine",
    district: "Balaghat",
    state: "Madhya Pradesh",
    mineType: "underground",
    depthMeters: 500,
    latitude: 21.8083,
    longitude: 80.1833,
    monthlyTargetTonnes: 25000,
  },
  {
    id: "dongri-buzurg",
    name: "Dongri Buzurg Mine",
    district: "Bhandara",
    state: "Maharashtra",
    mineType: "opencast",
    depthMeters: 120,
    latitude: 21.3833,
    longitude: 79.6167,
    monthlyTargetTonnes: 18000,
  },
  {
    id: "chikla",
    name: "Chikla Mine",
    district: "Bhandara",
    state: "Maharashtra",
    mineType: "underground",
    depthMeters: 180,
    latitude: 21.25,
    longitude: 79.65,
    monthlyTargetTonnes: 9500,
  },
  {
    id: "kandri",
    name: "Kandri Mine",
    district: "Nagpur",
    state: "Maharashtra",
    mineType: "underground",
    depthMeters: 210,
    latitude: 21.3167,
    longitude: 79.15,
    monthlyTargetTonnes: 6800,
  },
  {
    id: "ukwa",
    name: "Ukwa Mine",
    district: "Balaghat",
    state: "Madhya Pradesh",
    mineType: "underground",
    depthMeters: 165,
    latitude: 21.9333,
    longitude: 80.4167,
    monthlyTargetTonnes: 7200,
  },
];

function fallbackResult(error: string | null): FetchMinesResult {
  return { mines: [...FALLBACK_MINES], source: "fallback", error };
}

type RawRow = Record<string, unknown>;

function pickString(row: RawRow, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function pickNumber(row: RawRow, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    // Postgres numerics arrive as strings through some client configurations.
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bmine\b/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Picks the slug that links a row to its local profile.
 *
 * The live `mines` table keys rows by UUID, and a UUID slug matches no local
 * profile — the mine would silently lose its trend, alerts, spectral layers and
 * target. So surrogate keys (UUIDs, bare integers) are ignored in favour of the
 * name-derived slug, and a known MineId always wins whichever field produced it.
 */
function resolveMineId(rawId: string | null, name: string): string {
  const fromName = slugify(name);
  if (isKnownMineId(fromName)) return fromName;

  if (rawId !== null && !UUID_PATTERN.test(rawId) && !/^\d+$/.test(rawId)) {
    const fromId = slugify(rawId);
    if (fromId.length > 0) return fromId;
  }
  return fromName;
}

/**
 * Converts one raw row into a MineRecord, or null if it lacks a usable name or
 * coordinates. A partially broken row is skipped rather than allowed to render
 * as "undefined" in the selector.
 */
function normalizeRow(row: RawRow): MineRecord | null {
  const name = pickString(row, ["name", "mine_name", "label", "title"]);
  if (name === null) return null;

  const latitude = pickNumber(row, ["latitude", "lat", "centre_lat", "center_lat"]);
  const longitude = pickNumber(row, ["longitude", "lon", "lng", "centre_lon", "center_lon"]);
  if (latitude === null || longitude === null) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  const id = resolveMineId(pickString(row, ["slug", "code", "mine_id", "id"]), name);

  const rawType = pickString(row, ["mine_type", "type", "category"])?.toLowerCase() ?? "";
  const mineType: MineType = rawType.includes("open") ? "opencast" : "underground";

  return {
    id,
    name,
    district: pickString(row, ["district", "region"]) ?? "—",
    state: pickString(row, ["state", "province"]) ?? "—",
    mineType,
    depthMeters: Math.max(0, pickNumber(row, ["depth_m", "depth_meters", "depth"]) ?? 0),
    latitude,
    longitude,
    monthlyTargetTonnes: Math.max(
      0,
      pickNumber(row, ["monthly_target_tonnes", "target_tonnes", "monthly_target", "target"]) ?? 0,
    ),
  };
}

/** Preserves the canonical five-mine order; unknown mines follow alphabetically. */
function sortByCanonicalOrder(mines: MineRecord[]): MineRecord[] {
  const rank = new Map<string, number>(MINE_IDS.map((id, index) => [id, index]));
  return [...mines].sort((a, b) => {
    const rankA = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const rankB = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Fetches the mine roster.
 *
 * Never rejects. Never resolves with an empty list. `source` tells the caller
 * whether it is looking at live or fallback data so the UI can say so.
 */
export async function fetchMines(): Promise<FetchMinesResult> {
  try {
    const { data, error } = await supabase.from(MINES_TABLE).select("*");

    if (error !== null) {
      return fallbackResult(
        isNotConfiguredError(error) ? "Supabase is not configured." : error.message,
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
      return fallbackResult("The mines table returned no rows.");
    }

    const mines = sortByCanonicalOrder(
      data
        .filter((row): row is RawRow => row !== null && typeof row === "object")
        .map(normalizeRow)
        .filter((record): record is MineRecord => record !== null),
    );

    if (mines.length === 0) {
      return fallbackResult("No rows in the mines table had a usable name and coordinates.");
    }

    return { mines, source: "supabase", error: null };
  } catch (cause) {
    // Covers DNS failure, CORS rejection, an aborted request, or anything the
    // client throws rather than returning as an error result.
    return fallbackResult(cause instanceof Error ? cause.message : "Unknown error.");
  }
}

export function isKnownMineId(id: string): id is MineId {
  return (MINE_IDS as readonly string[]).includes(id);
}
