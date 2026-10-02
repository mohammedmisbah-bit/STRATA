"""
STRATA prospectivity pipeline: Sentinel-2 L2A + Copernicus DEM -> manganese prospectivity.

What it does
------------
1. Pulls a cloud-masked, dry-season median Sentinel-2 L2A composite and the
   Copernicus GLO-90 DEM for the Nagpur-Bhandara-Balaghat belt from the
   Copernicus Data Space Ecosystem (Sentinel Hub Process API), on a ~100 m grid.
2. Derives spectral indices (ferric iron, ferrous iron, clay/hydroxyl, NDVI,
   albedo) and terrain features (elevation, slope, local relief, topographic
   position).
3. Trains a presence-background Random Forest (positive-unlabelled setup) on
   known MOIL mine neighbourhoods versus random background.
4. Validates it honestly with leave-one-mine-out (LOMO): each mine is hidden
   from training in turn and we measure where the model ranks it. A simple
   knowledge-driven index is scored the same way as a baseline.
5. Repeats training on a mine-level block bootstrap to get per-cell 95%
   intervals.
6. Writes `public/prospectivity/heatmap.png` and
   `src/data/prospectivity-summary.json` for the dashboard and uploads a 500 m
   grid into Supabase `prospectivity_grid`.

Caveats (also surfaced in the UI)
---------------------------------
- Six labelled deposits is a very small training set. Scores are a *relative*
  ranking of how much a cell resembles known mine surroundings, not a
  probability of an economic deposit.
- The immediate mine footprint (< 400 m) is excluded from training so the
  model does not simply learn "open pit / waste dump".
- Underground ore bodies have limited surface expression; satellite evidence
  is a screening tool to prioritise field mapping and drilling, not a substitute.

Usage
-----
    pipeline\\.venv\\Scripts\\python pipeline\\strata_pipeline.py            # full run
    pipeline\\.venv\\Scripts\\python pipeline\\strata_pipeline.py --no-upload

Reads COPERNICUS_CLIENT_ID / COPERNICUS_CLIENT_SECRET / VITE_SUPABASE_URL /
SUPABASE_SERVICE_ROLE_KEY from the repo-root `.env`. Secrets are never printed.
"""

from __future__ import annotations

import argparse
import io
import json
import math
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import requests
import tifffile
from PIL import Image
from scipy import ndimage
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path(__file__).resolve().parent / "cache"
OUT = ROOT / "public" / "prospectivity"
SUMMARY = ROOT / "src" / "data" / "prospectivity-summary.json"

TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"

# Belt extent (lon/lat). Covers Kandri in the west to Ukwa in the east.
BBOX = (79.15, 21.25, 80.55, 22.05)
WIDTH, HEIGHT = 1450, 890  # ~100 m cells at this latitude
TILES_X, TILES_Y = 2, 2

# Dry season: leaf-off deciduous forest and the fewest clouds.
TIME_FROM = "2026-01-15T00:00:00Z"
TIME_TO = "2026-04-30T23:59:59Z"

SEED = 20260925
N_BOOTSTRAP = 30
POS_INNER_M = 400  # skip the pit / dump footprint itself
POS_OUTER_M = 1500
BACKGROUND_MIN_M = 3000
BACKGROUND_N = 30000
LOMO_EXCLUSION_M = 5000
LOMO_GROUP_M = 10_000
BROWNFIELD_M = 3000  # targets closer than this to a known mine are "brownfield"
HEATMAP_THRESHOLD = 0.35


@dataclass(frozen=True)
class Mine:
    id: str
    label: str
    lat: float
    lon: float
    source: str


# Known MOIL deposits used as labels. Balaghat and Chikla are mapped OSM
# features operated by MOIL; Tirodi is a named OSM mine; the rest are the
# approximate centroids used by the dashboard roster.
MINES = [
    Mine("balaghat", "Balaghat", 21.8502, 80.2274, "OpenStreetMap (MOIL-operated quarry)"),
    Mine("dongri-buzurg", "Dongri Buzurg", 21.5583, 79.7167, "Approximate centroid"),
    Mine("chikla", "Chikla", 21.5385, 79.7523, "OpenStreetMap (MOIL Chikala Mines)"),
    Mine("kandri", "Kandri", 21.3667, 79.2667, "Approximate centroid"),
    Mine("ukwa", "Ukwa", 21.9667, 80.4667, "Approximate centroid"),
    Mine("tirodi", "Tirodi", 21.6835, 79.7246, "OpenStreetMap (Tirodi Mine)"),
]

FEATURES = [
    ("ferric", "Ferric iron (B4/B2)"),
    ("ferrous", "Ferrous iron (B11/B8)"),
    ("clay", "Clay / hydroxyl (B11/B12)"),
    ("ndvi", "Vegetation (NDVI)"),
    ("albedo", "Surface albedo"),
    ("ferric_ctx", "Ferric iron, 500 m context"),
    ("clay_ctx", "Clay, 500 m context"),
    # Absolute elevation is deliberately left out: it acts as a location proxy
    # (it topped feature importance and pulled scores towards mine altitudes).
    ("slope", "Slope"),
    ("relief", "Local relief (1 km)"),
    ("tpi", "Topographic position (1 km)"),
    ("tpi_5km", "Ridge position (5 km)"),
]


# --------------------------------------------------------------------------- env


def load_env() -> dict[str, str]:
    values: dict[str, str] = {}
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def require(env: dict[str, str], key: str) -> str:
    value = env.get(key, "")
    if not value:
        sys.exit(f"Missing {key} in .env")
    return value


# ------------------------------------------------------------------- data access


def get_token(env: dict[str, str]) -> str:
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": require(env, "COPERNICUS_CLIENT_ID"),
            "client_secret": require(env, "COPERNICUS_CLIENT_SECRET"),
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["access_token"]


S2_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B03", "B04", "B08", "B11", "B12", "SCL"], units: "DN" }],
    output: { bands: 7, sampleType: "UINT16" },
    mosaicking: "ORBIT"
  };
}
// Keep vegetation (4), bare soil (5), water (6) and unclassified (7).
// Drops cloud shadow, medium/high cloud, cirrus, snow and saturated pixels.
function isClear(scl) { var c = Math.round(scl); return c >= 4 && c <= 7; }
function median(values) {
  values.sort(function (a, b) { return a - b; });
  var m = Math.floor(values.length / 2);
  return values.length % 2 ? values[m] : (values[m - 1] + values[m]) / 2;
}
function evaluatePixel(samples) {
  var keys = ["B02", "B03", "B04", "B08", "B11", "B12"];
  var stacks = [[], [], [], [], [], []];
  for (var i = 0; i < samples.length; i++) {
    var s = samples[i];
    if (!isClear(s.SCL) || s.B04 === 0) continue;
    for (var k = 0; k < keys.length; k++) stacks[k].push(s[keys[k]]);
  }
  var n = stacks[0].length;
  if (n === 0) return [0, 0, 0, 0, 0, 0, 0];
  var out = [];
  for (var k = 0; k < keys.length; k++) out.push(median(stacks[k]));
  out.push(n);
  return out;
}
"""

DEM_EVALSCRIPT = """
//VERSION=3
function setup() {
  return { input: ["DEM"], output: { bands: 1, sampleType: "FLOAT32" } };
}
function evaluatePixel(s) { return [s.DEM]; }
"""


def tile_bboxes():
    w, s, e, n = BBOX
    tw, th = WIDTH // TILES_X, HEIGHT // TILES_Y
    for ty in range(TILES_Y):
        for tx in range(TILES_X):
            x0, x1 = tx * tw, (tx + 1) * tw if tx < TILES_X - 1 else WIDTH
            y0, y1 = ty * th, (ty + 1) * th if ty < TILES_Y - 1 else HEIGHT
            bbox = (
                w + (e - w) * x0 / WIDTH,
                n - (n - s) * y1 / HEIGHT,
                w + (e - w) * x1 / WIDTH,
                n - (n - s) * y0 / HEIGHT,
            )
            yield (x0, x1, y0, y1), bbox


def process_request(token: str, bbox, width: int, height: int, data: list, evalscript: str) -> np.ndarray:
    body = {
        "input": {
            "bounds": {
                "bbox": list(bbox),
                "properties": {"crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"},
            },
            "data": data,
        },
        "output": {
            "width": width,
            "height": height,
            "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}],
        },
        "evalscript": evalscript,
    }
    for attempt in range(6):
        try:
            response = requests.post(
                PROCESS_URL,
                json=body,
                headers={"Authorization": f"Bearer {token}", "Accept": "image/tiff"},
                timeout=300,
            )
        except requests.exceptions.RequestException as error:
            wait = 10 * (attempt + 1)
            print(f"    network error ({type(error).__name__}), retrying in {wait}s")
            time.sleep(wait)
            continue
        if response.status_code == 429 or response.status_code >= 500:
            wait = 10 * (attempt + 1)
            print(f"    HTTP {response.status_code}, retrying in {wait}s")
            time.sleep(wait)
            continue
        if response.status_code != 200:
            sys.exit(f"Process API error {response.status_code}: {response.text[:500]}")
        array = tifffile.imread(io.BytesIO(response.content))
        return array if array.ndim == 3 else array[..., None]
    sys.exit("Process API kept failing; try again later.")


def fetch_raster(token: str, name: str, data: list, evalscript: str, bands: int, dtype) -> np.ndarray:
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"{name}_{WIDTH}x{HEIGHT}.npy"
    if cached.exists():
        print(f"  {name}: cached")
        return np.load(cached)
    out = np.zeros((HEIGHT, WIDTH, bands), dtype=dtype)
    for (x0, x1, y0, y1), bbox in tile_bboxes():
        # Per-tile cache so a dropped connection resumes instead of restarting.
        tile_cache = CACHE / f"{name}_{WIDTH}x{HEIGHT}_{x0}_{y0}.npy"
        if tile_cache.exists():
            out[y0:y1, x0:x1] = np.load(tile_cache)
            continue
        print(f"  {name}: tile x{x0}-{x1} y{y0}-{y1}")
        started = time.time()
        tile = process_request(token, bbox, x1 - x0, y1 - y0, data, evalscript)
        np.save(tile_cache, tile)
        out[y0:y1, x0:x1] = tile
        print(f"    done in {time.time() - started:.0f}s")
    np.save(cached, out)
    for tile_file in CACHE.glob(f"{name}_{WIDTH}x{HEIGHT}_*_*.npy"):
        tile_file.unlink()
    return out


def fetch_inputs(env: dict[str, str]):
    token = get_token(env)
    s2 = fetch_raster(
        token,
        "s2_median",
        [
            {
                "type": "sentinel-2-l2a",
                "dataFilter": {
                    "timeRange": {"from": TIME_FROM, "to": TIME_TO},
                    "maxCloudCoverage": 40,
                },
                "processing": {"upsampling": "BILINEAR", "downsampling": "BILINEAR"},
            }
        ],
        S2_EVALSCRIPT,
        7,
        np.uint16,
    )
    dem = fetch_raster(
        token,
        "cop_dem90",
        [
            {
                "type": "dem",
                # GLO-30 needs a CCM-authorised account on CDSE. GLO-90 is open
                # and matches the ~100 m analysis grid anyway.
                "dataFilter": {"demInstance": "COPERNICUS_90"},
                "processing": {"upsampling": "BILINEAR", "downsampling": "BILINEAR"},
            }
        ],
        DEM_EVALSCRIPT,
        1,
        np.float32,
    )
    return s2, dem[..., 0]


# ---------------------------------------------------------------------- features


def cell_size_m() -> tuple[float, float]:
    w, s, e, n = BBOX
    lat0 = math.radians((s + n) / 2)
    dx = (e - w) / WIDTH * 111_320 * math.cos(lat0)
    dy = (n - s) / HEIGHT * 110_574
    return dx, dy


def pixel_centres():
    w, s, e, n = BBOX
    lons = w + (np.arange(WIDTH) + 0.5) * (e - w) / WIDTH
    lats = n - (np.arange(HEIGHT) + 0.5) * (n - s) / HEIGHT
    return lats, lons


def build_features(s2: np.ndarray, dem: np.ndarray):
    reflect = s2[..., :6].astype(np.float32) / 10_000.0
    b2, b3, b4, b8, b11, b12 = (reflect[..., i] for i in range(6))
    clear_count = s2[..., 6]
    eps = 1e-4

    ndvi = (b8 - b4) / (b8 + b4 + eps)
    ndwi = (b3 - b8) / (b3 + b8 + eps)
    # Exposed reservoir banks look like fresh bare ground, so mask a ~300 m
    # buffer around open water as well as the water itself.
    water = ndimage.binary_dilation(ndwi >= 0.05, iterations=3)
    valid = (clear_count >= 4) & ~water & np.isfinite(dem) & (b4 > 0)

    ferric = np.clip(b4 / (b2 + eps), 0, 5)
    ferrous = np.clip(b11 / (b8 + eps), 0, 5)
    clay = np.clip(b11 / (b12 + eps), 0, 5)
    albedo = reflect.mean(axis=-1)

    def smooth(a: np.ndarray, size: int) -> np.ndarray:
        filled = np.where(valid, a, np.nan)
        mean_fill = np.nanmean(filled)
        filled = np.where(np.isnan(filled), mean_fill, filled)
        return ndimage.uniform_filter(filled, size=size, mode="nearest")

    dx, dy = cell_size_m()
    dem_f = np.where(np.isfinite(dem), dem, np.nanmean(dem)).astype(np.float64)
    gy, gx = np.gradient(dem_f, dy, dx)
    slope = np.degrees(np.arctan(np.hypot(gx, gy)))
    mean_1km = ndimage.uniform_filter(dem_f, size=11, mode="nearest")
    sq_1km = ndimage.uniform_filter(dem_f**2, size=11, mode="nearest")
    relief = np.sqrt(np.maximum(sq_1km - mean_1km**2, 0))
    tpi = dem_f - mean_1km
    # Regional ridge position: Sausar Mn horizons weather out as resistant ridges.
    tpi_5km = dem_f - ndimage.uniform_filter(dem_f, size=51, mode="nearest")

    stack = {
        "ferric": ferric,
        "ferrous": ferrous,
        "clay": clay,
        "ndvi": ndvi,
        "albedo": albedo,
        "ferric_ctx": smooth(ferric, 5),
        "clay_ctx": smooth(clay, 5),
        "elevation": dem_f,
        "slope": slope,
        "relief": relief,
        "tpi": tpi,
        "tpi_5km": tpi_5km,
    }
    X = np.stack([stack[key].astype(np.float32) for key, _ in FEATURES], axis=-1)
    return X, valid, stack, clear_count


def distance_grids():
    """Distance in metres from every cell to every mine, shape (mines, H, W)."""
    lats, lons = pixel_centres()
    lat_grid, lon_grid = np.meshgrid(lats, lons, indexing="ij")
    out = []
    for mine in MINES:
        dlat = (lat_grid - mine.lat) * 110_574
        dlon = (lon_grid - mine.lon) * 111_320 * np.cos(np.radians(mine.lat))
        out.append(np.hypot(dlat, dlon).astype(np.float32))
    return np.stack(out)


# ------------------------------------------------------------------------- model


def make_model(seed: int) -> RandomForestClassifier:
    return RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_leaf=4,
        max_features="sqrt",
        class_weight="balanced",
        n_jobs=-1,
        random_state=seed,
    )


def baseline_index(X: np.ndarray, mu: np.ndarray, sd: np.ndarray) -> np.ndarray:
    """Knowledge-driven evidence score: iron + clay alteration + rugged ridges."""
    idx = {key: i for i, (key, _) in enumerate(FEATURES)}
    z = (X - mu) / sd
    return (
        z[..., idx["ferric"]] + z[..., idx["clay"]] + z[..., idx["ferrous"]] + z[..., idx["relief"]]
    ) / 4.0


def run(upload: bool):
    rng = np.random.default_rng(SEED)
    env = load_env()

    print("1/6 Fetching Sentinel-2 L2A median composite + Copernicus DEM")
    s2, dem = fetch_inputs(env)

    print("2/6 Building features")
    X, valid, stack, clear_count = build_features(s2, dem)
    dists = distance_grids()
    nearest = dists.min(axis=0)
    flat_valid = valid.ravel()
    Xf = X.reshape(-1, X.shape[-1])
    print(f"    valid cells: {flat_valid.sum():,} / {flat_valid.size:,}; "
          f"median clear observations: {int(np.median(clear_count[valid]))}")

    positives = {
        mine.id: np.flatnonzero(
            (flat_valid) & (dists[i].ravel() >= POS_INNER_M) & (dists[i].ravel() <= POS_OUTER_M)
        )
        for i, mine in enumerate(MINES)
    }
    for mine in MINES:
        print(f"    {mine.label}: {positives[mine.id].size} positive cells")
    background_pool = np.flatnonzero(flat_valid & (nearest.ravel() > BACKGROUND_MIN_M))
    eval_pool = rng.choice(np.flatnonzero(flat_valid), size=60_000, replace=False)

    mu = Xf[flat_valid].mean(axis=0)
    sd = Xf[flat_valid].std(axis=0) + 1e-6

    print("3/6 Spatially grouped leave-one-mine-out validation")
    # Mines closer than LOMO_GROUP_M (e.g. Dongri Buzurg and Chikla, ~4 km)
    # are held out together, otherwise the neighbour's training cells leak the
    # answer and inflate the score.
    def mine_km(a: Mine, b: Mine) -> float:
        return math.hypot((a.lat - b.lat) * 110.574, (a.lon - b.lon) * 111.32 * math.cos(math.radians(a.lat)))

    lomo = []
    for i, held in enumerate(MINES):
        fold = [m for m in MINES if mine_km(m, held) * 1000 <= LOMO_GROUP_M]
        fold_ids = {m.id for m in fold}
        train_pos = np.concatenate([positives[m.id] for m in MINES if m.id not in fold_ids])
        fold_dist = np.min([dists[j] for j, m in enumerate(MINES) if m.id in fold_ids], axis=0).ravel()
        far_from_held = background_pool[fold_dist[background_pool] > LOMO_EXCLUSION_M]
        train_bg = rng.choice(far_from_held, size=min(BACKGROUND_N, far_from_held.size), replace=False)
        model = make_model(SEED + i)
        model.fit(
            np.concatenate([Xf[train_pos], Xf[train_bg]]),
            np.concatenate([np.ones(train_pos.size), np.zeros(train_bg.size)]),
        )
        eval_bg = eval_pool[fold_dist[eval_pool] > LOMO_EXCLUSION_M]
        held_pos = positives[held.id]
        p_pos = model.predict_proba(Xf[held_pos])[:, 1]
        p_bg = model.predict_proba(Xf[eval_bg])[:, 1]
        b_pos = baseline_index(Xf[held_pos], mu, sd)
        b_bg = baseline_index(Xf[eval_bg], mu, sd)
        labels = np.concatenate([np.ones(p_pos.size), np.zeros(p_bg.size)])
        auc = roc_auc_score(labels, np.concatenate([p_pos, p_bg]))
        base_auc = roc_auc_score(labels, np.concatenate([b_pos, b_bg]))
        # Share of the belt that scores above the held-out mine's median cell.
        top_pct = float((p_bg >= np.median(p_pos)).mean() * 100)
        lomo.append(
            {
                "id": held.id,
                "label": held.label,
                "auc": round(float(auc), 3),
                "baselineAuc": round(float(base_auc), 3),
                "topPercent": round(top_pct, 1),
                "heldOutWith": sorted(fold_ids - {held.id}),
            }
        )
        print(f"    hold out {held.label:<14} AUC {auc:.3f}  baseline {base_auc:.3f}  "
              f"median cell in top {top_pct:.1f}% of belt")

    print(f"4/6 Final model with mine-level block bootstrap (n={N_BOOTSTRAP})")
    preds = np.full((N_BOOTSTRAP, flat_valid.sum()), np.nan, dtype=np.float32)
    importances = np.zeros(len(FEATURES))
    valid_idx = np.flatnonzero(flat_valid)
    for b in range(N_BOOTSTRAP):
        while True:
            draw = rng.choice(len(MINES), size=len(MINES), replace=True)
            if np.unique(draw).size >= 3:
                break
        train_pos = np.concatenate([positives[MINES[j].id] for j in draw])
        train_bg = rng.choice(background_pool, size=BACKGROUND_N, replace=True)
        model = make_model(SEED + 100 + b)
        model.fit(
            np.concatenate([Xf[train_pos], Xf[train_bg]]),
            np.concatenate([np.ones(train_pos.size), np.zeros(train_bg.size)]),
        )
        importances += model.feature_importances_
        preds[b] = model.predict_proba(Xf[valid_idx])[:, 1]
        print(f"    bootstrap {b + 1}/{N_BOOTSTRAP}", end="\r")
    print()
    importances /= N_BOOTSTRAP

    score = np.full(flat_valid.size, np.nan, dtype=np.float32)
    lo = score.copy()
    hi = score.copy()
    score[valid_idx] = preds.mean(axis=0)
    lo[valid_idx] = np.percentile(preds, 2.5, axis=0)
    hi[valid_idx] = np.percentile(preds, 97.5, axis=0)
    score, lo, hi = (a.reshape(HEIGHT, WIDTH) for a in (score, lo, hi))

    print("5/6 Writing heatmap + summary")
    OUT.mkdir(parents=True, exist_ok=True)
    write_heatmap(score)
    summary = build_summary(score, lo, hi, stack, valid, dists, nearest, lomo, importances, clear_count)
    # The summary is bundled with the app (static import), so it lives in src.
    SUMMARY.write_text(json.dumps(summary, indent=1) + "\n", encoding="utf-8")
    print(f"    {len(summary['targets'])} greenfield targets; mean LOMO AUC "
          f"{summary['validation']['meanAuc']} vs baseline {summary['validation']['baselineMeanAuc']}")

    if upload:
        print("6/6 Uploading 500 m grid to Supabase prospectivity_grid")
        upload_grid(env, score, lo, hi, stack, valid)
    else:
        print("6/6 Skipped Supabase upload (--no-upload)")


# ------------------------------------------------------------------------ output


def colour_ramp(value: np.ndarray) -> np.ndarray:
    """Teal -> amber -> rose, matching the dashboard palette."""
    stops = np.array([0.35, 0.55, 0.75, 0.95])
    colours = np.array(
        [[45, 212, 191], [250, 204, 21], [251, 146, 60], [244, 63, 94]], dtype=np.float32
    )
    out = np.zeros(value.shape + (3,), dtype=np.float32)
    for c in range(3):
        out[..., c] = np.interp(value, stops, colours[:, c])
    return out


def write_heatmap(score: np.ndarray):
    s = np.nan_to_num(score, nan=0.0)
    rgb = colour_ramp(s)
    alpha = np.clip((s - HEATMAP_THRESHOLD) / 0.35, 0, 1) * 215
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(OUT / "heatmap.png", optimize=True)


def round_or_none(value, digits=3):
    return None if value is None or not np.isfinite(value) else round(float(value), digits)


def build_summary(score, lo, hi, stack, valid, dists, nearest, lomo, importances, clear_count):
    lats, lons = pixel_centres()
    belt_scores = score[valid]

    mines_out = {}
    for i, mine in enumerate(MINES):
        near = valid & (dists[i] <= POS_OUTER_M)
        district = valid & (dists[i] <= 10_000)
        local = score[district]
        bands = []
        for pct in (5, 10, 20, 30, 50):
            cut = np.percentile(local, 100 - pct)
            sel = district & (score >= cut)
            bands.append(
                {
                    "band": f"Top {pct}%",
                    "mean": round_or_none(score[sel].mean()),
                    "lo": round_or_none(lo[sel].mean()),
                    "hi": round_or_none(hi[sel].mean()),
                }
            )
        mine_score = float(np.nanmean(score[near]))
        mines_out[mine.id] = {
            "label": mine.label,
            "coordinateSource": mine.source,
            "score": round_or_none(mine_score),
            "lo": round_or_none(np.nanmean(lo[near])),
            "hi": round_or_none(np.nanmean(hi[near])),
            "beltPercentile": round_or_none((belt_scores <= mine_score).mean() * 100, 1),
            "ferric": round_or_none(np.mean(stack["ferric"][near])),
            "ferrous": round_or_none(np.mean(stack["ferrous"][near])),
            "clay": round_or_none(np.mean(stack["clay"][near])),
            "ndvi": round_or_none(np.mean(stack["ndvi"][near])),
            "slope": round_or_none(np.mean(stack["slope"][near]), 1),
            "relief": round_or_none(np.mean(stack["relief"][near]), 1),
            "elevation": round_or_none(np.mean(stack["elevation"][near]), 0),
            "beltFerricPercentile": round_or_none(
                (stack["ferric"][valid] <= np.mean(stack["ferric"][near])).mean() * 100, 0
            ),
            "beltClayPercentile": round_or_none(
                (stack["clay"][valid] <= np.mean(stack["clay"][near])).mean() * 100, 0
            ),
            "confidenceBands": bands,
        }

    # Greenfield targets: contiguous clusters in the top 1% of the belt, away
    # from known mines.
    cut = np.nanpercentile(belt_scores, 99)
    mask = valid & (score >= cut) & (nearest > BROWNFIELD_M)
    labels, count = ndimage.label(mask)
    cell_km2 = np.prod(cell_size_m()) / 1e6
    targets = []
    for k in range(1, count + 1):
        rows, cols = np.nonzero(labels == k)
        if rows.size < 8:
            continue
        weights = score[rows, cols]
        lat = float(np.average(lats[rows], weights=weights))
        lon = float(np.average(lons[cols], weights=weights))
        mine_dist = [
            (math.hypot((lat - m.lat) * 110.574, (lon - m.lon) * 111.32 * math.cos(math.radians(m.lat))), m)
            for m in MINES
        ]
        dist_km, closest = min(mine_dist, key=lambda item: item[0])
        targets.append(
            {
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "score": round_or_none(weights.mean()),
                "peak": round_or_none(weights.max()),
                "lo": round_or_none(lo[rows, cols].mean()),
                "hi": round_or_none(hi[rows, cols].mean()),
                "areaKm2": round(rows.size * cell_km2, 2),
                "nearestMine": closest.id,
                "nearestMineKm": round(dist_km, 1),
            }
        )
    targets.sort(key=lambda t: (t["score"] or 0) * math.sqrt(t["areaKm2"]), reverse=True)
    targets = targets[:12]
    for rank, target in enumerate(targets, start=1):
        target["id"] = f"T{rank:02d}"

    w, s, e, n = BBOX
    dx, dy = cell_size_m()
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sources": {
            "imagery": "Sentinel-2 L2A (ESA Copernicus) via Copernicus Data Space Ecosystem",
            "imageryWindow": [TIME_FROM[:10], TIME_TO[:10]],
            "composite": "Per-pixel median of SCL-cloud-masked observations",
            "medianClearObservations": int(np.median(clear_count[valid])),
            "dem": "Copernicus DEM GLO-90",
            "labels": [{"id": m.id, "label": m.label, "source": m.source} for m in MINES],
        },
        "grid": {
            "bbox": list(BBOX),
            "width": WIDTH,
            "height": HEIGHT,
            "cellMeters": round((dx + dy) / 2),
            "validCells": int(valid.sum()),
        },
        "heatmap": {
            "url": "/prospectivity/heatmap.png",
            "coordinates": [[w, n], [e, n], [e, s], [w, s]],
            "threshold": HEATMAP_THRESHOLD,
        },
        "model": {
            "type": "Presence-background Random Forest (positive-unlabelled)",
            "trees": 120,
            "bootstrap": N_BOOTSTRAP,
            "bootstrapUnit": "mine (block bootstrap)",
            "interval": "95% bootstrap interval",
            "positiveRingMeters": [POS_INNER_M, POS_OUTER_M],
            "backgroundCells": BACKGROUND_N,
        },
        "features": sorted(
            (
                {"id": key, "label": label, "importance": round(float(imp), 3)}
                for (key, label), imp in zip(FEATURES, importances)
            ),
            key=lambda f: f["importance"],
            reverse=True,
        ),
        "validation": {
            "method": "Spatially grouped leave-one-mine-out (mines within 10 km held out together)",
            "mines": lomo,
            "meanAuc": round(float(np.mean([m["auc"] for m in lomo])), 3),
            "baselineMeanAuc": round(float(np.mean([m["baselineAuc"] for m in lomo])), 3),
            "baselineDescription": "Equal-weight z-score of ferric, ferrous, clay and relief",
        },
        "mines": mines_out,
        "targets": targets,
    }


def upload_grid(env, score, lo, hi, stack, valid, block=5):
    url = require(env, "VITE_SUPABASE_URL").rstrip("/") + "/rest/v1/prospectivity_grid"
    key = require(env, "SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    lats, lons = pixel_centres()
    rows = []
    for y in range(0, HEIGHT - block + 1, block):
        for x in range(0, WIDTH - block + 1, block):
            v = valid[y : y + block, x : x + block]
            if v.sum() < (block * block) // 2:
                continue
            sl = (slice(y, y + block), slice(x, x + block))
            iron_clay = stack["ferric"][sl][v] * stack["clay"][sl][v]
            rows.append(
                {
                    "latitude": round(float(lats[y : y + block].mean()), 5),
                    "longitude": round(float(lons[x : x + block].mean()), 5),
                    "iron_clay_ratio": round(float(iron_clay.mean()), 4),
                    "dem_slope": round(float(stack["slope"][sl][v].mean()), 2),
                    "prospectivity_score": round(float(np.nanmean(score[sl][v])), 4),
                    "confidence_lower": round(float(np.nanmean(lo[sl][v])), 4),
                    "confidence_upper": round(float(np.nanmean(hi[sl][v])), 4),
                }
            )
    # Replace the previous run.
    response = requests.delete(url + "?id=not.is.null", headers=headers, timeout=120)
    if response.status_code not in (200, 204):
        sys.exit(f"Supabase delete failed {response.status_code}: {response.text[:300]}")
    for start in range(0, len(rows), 2000):
        chunk = rows[start : start + 2000]
        response = requests.post(url, headers=headers, data=json.dumps(chunk), timeout=120)
        if response.status_code not in (200, 201, 204):
            sys.exit(f"Supabase insert failed {response.status_code}: {response.text[:300]}")
        print(f"    uploaded {min(start + 2000, len(rows)):,}/{len(rows):,}", end="\r")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--no-upload", action="store_true", help="skip the Supabase upload")
    args = parser.parse_args()
    run(upload=not args.no_upload)
