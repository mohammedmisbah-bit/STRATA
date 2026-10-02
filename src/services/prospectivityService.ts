/**
 * Reads the satellite prospectivity grid from Supabase `prospectivity_grid`.
 *
 * The pipeline uploads one row per 500 m cell (~49k rows for the belt). The
 * app never downloads the whole table: the map asks for the cells around a
 * clicked point, and the validation panel asks only for a row count.
 *
 * Like `fetchMines`, nothing here rejects. Failures come back as a result the
 * UI can describe.
 */
import { isNotConfiguredError, supabase } from "@/lib/supabase";

export const PROSPECTIVITY_TABLE = "prospectivity_grid";

/** Half the 500 m cell size in degrees, with a little slack. */
const SEARCH_RADIUS_DEG = 0.004;

export type GridCell = {
  latitude: number;
  longitude: number;
  score: number;
  lower: number;
  upper: number;
  /** Ferric iron index × clay ratio, averaged over the cell. */
  ironClay: number | null;
  slopeDegrees: number | null;
};

export type GridCellResult =
  { status: "found"; cell: GridCell } | { status: "empty" } | { status: "error"; message: string };

type GridRow = {
  latitude: unknown;
  longitude: unknown;
  prospectivity_score: unknown;
  confidence_lower: unknown;
  confidence_upper: unknown;
  iron_clay_ratio: unknown;
  dem_slope: unknown;
};

function toNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalize(row: GridRow): GridCell | null {
  const latitude = toNumber(row.latitude);
  const longitude = toNumber(row.longitude);
  const score = toNumber(row.prospectivity_score);
  const lower = toNumber(row.confidence_lower);
  const upper = toNumber(row.confidence_upper);
  if (
    latitude === null ||
    longitude === null ||
    score === null ||
    lower === null ||
    upper === null
  ) {
    return null;
  }
  return {
    latitude,
    longitude,
    score,
    lower,
    upper,
    ironClay: toNumber(row.iron_clay_ratio),
    slopeDegrees: toNumber(row.dem_slope),
  };
}

/** The grid cell nearest to a point, if one exists within ~400 m. */
export async function fetchNearestGridCell(lat: number, lon: number): Promise<GridCellResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { status: "empty" };
  try {
    const { data, error } = await supabase
      .from(PROSPECTIVITY_TABLE)
      .select(
        "latitude,longitude,prospectivity_score,confidence_lower,confidence_upper,iron_clay_ratio,dem_slope",
      )
      .gte("latitude", lat - SEARCH_RADIUS_DEG)
      .lte("latitude", lat + SEARCH_RADIUS_DEG)
      .gte("longitude", lon - SEARCH_RADIUS_DEG)
      .lte("longitude", lon + SEARCH_RADIUS_DEG)
      .limit(16);

    if (error !== null) {
      return {
        status: "error",
        message: isNotConfiguredError(error) ? "Supabase is not configured." : error.message,
      };
    }
    const cells = (Array.isArray(data) ? (data as GridRow[]) : [])
      .map(normalize)
      .filter((cell): cell is GridCell => cell !== null);
    if (cells.length === 0) return { status: "empty" };

    const cosLat = Math.cos((lat * Math.PI) / 180);
    const distance = (cell: GridCell) =>
      Math.hypot(cell.latitude - lat, (cell.longitude - lon) * cosLat);
    const nearest = cells.reduce((best, cell) => (distance(cell) < distance(best) ? cell : best));
    return { status: "found", cell: nearest };
  } catch (cause) {
    return { status: "error", message: cause instanceof Error ? cause.message : "Unknown error." };
  }
}

/** Row count of the live grid, or null when the database can't be reached. */
export async function fetchGridCellCount(): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from(PROSPECTIVITY_TABLE)
      .select("id", { count: "exact", head: true });
    if (error !== null || typeof count !== "number") return null;
    return count;
  } catch {
    return null;
  }
}
