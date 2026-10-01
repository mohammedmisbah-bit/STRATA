/**
 * Sausar Group manganese belt: lithology and structural overlay.
 *
 * ⚠️ SIMULATED GEOMETRY. The polygons and lineaments below are hand-drawn
 * approximations of the Nagpur – Bhandara – Balaghat belt. They follow the
 * belt's published ENE–WSW trend and enclose the five MOIL mines, but they
 * are NOT digitised from GSI Bhukosh or NGDR vectors. Do not use them for
 * lease, drilling or survey decisions.
 *
 * To use the real layers, download the 1:50k lithology / structure shapefiles
 * from GSI Bhukosh (bhukosh.gsi.gov.in) or NGDR (geodataindia.gov.in), convert
 * to GeoJSON (EPSG:4326), and swap `NGDR_GEOLOGY_LAYER` for that file. The
 * `kind` / `unit` / `color` / `opacity` properties are what the map styles on.
 *
 * Coordinates are [longitude, latitude].
 */

import type { Feature, FeatureCollection, LineString, Polygon } from "geojson";

export type GeologyFeatureKind = "lithology" | "lineament";

export type GeologyFeatureProperties = {
  kind: GeologyFeatureKind;
  /** Stable key used for the legend. */
  unit: string;
  name: string;
  description: string;
  /** Fill (lithology) or stroke (lineament) colour. */
  color: string;
  /** Fill opacity for lithology polygons. Ignored for lineaments. */
  opacity: number;
};

export type GeologyFeature = Feature<Polygon | LineString, GeologyFeatureProperties>;

/** Legend entries in draw order (bottom to top). */
export const GEOLOGY_LEGEND = [
  {
    unit: "sausar-group",
    name: "Sausar Group (undifferentiated)",
    color: "#2DD4BF",
    kind: "lithology",
  },
  {
    unit: "tirodi-gneiss",
    name: "Tirodi Gneiss (basement)",
    color: "#A78BFA",
    kind: "lithology",
  },
  {
    unit: "mn-horizon",
    name: "Mn-bearing horizon (Mansar Fm.)",
    color: "#F59E0B",
    kind: "lithology",
  },
  {
    unit: "fault-lineament",
    name: "Fault / shear lineament",
    color: "#FB7185",
    kind: "lineament",
  },
] as const satisfies ReadonlyArray<{
  unit: string;
  name: string;
  color: string;
  kind: GeologyFeatureKind;
}>;

type LegendUnit = (typeof GEOLOGY_LEGEND)[number]["unit"];

function legendFor(unit: LegendUnit) {
  const entry = GEOLOGY_LEGEND.find((item) => item.unit === unit);
  // Unreachable: `unit` is typed from the legend itself.
  if (entry === undefined) throw new Error(`Unknown geology unit: ${unit}`);
  return entry;
}

function polygon(
  unit: LegendUnit,
  opacity: number,
  description: string,
  ring: Array<[number, number]>,
): GeologyFeature {
  const legend = legendFor(unit);
  return {
    type: "Feature",
    properties: {
      kind: "lithology",
      unit,
      name: legend.name,
      description,
      color: legend.color,
      opacity,
    },
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

function lineament(
  name: string,
  description: string,
  path: Array<[number, number]>,
): GeologyFeature {
  const legend = legendFor("fault-lineament");
  return {
    type: "Feature",
    properties: {
      kind: "lineament",
      unit: legend.unit,
      name,
      description,
      color: legend.color,
      opacity: 1,
    },
    geometry: { type: "LineString", coordinates: path },
  };
}

export const NGDR_GEOLOGY_LAYER: FeatureCollection<Polygon | LineString, GeologyFeatureProperties> =
  {
    type: "FeatureCollection",
    features: [
      polygon(
        "sausar-group",
        0.1,
        "Metasedimentary envelope of the Nagpur – Bhandara – Balaghat belt.",
        [
          [78.95, 21.18],
          [79.4, 21.12],
          [79.85, 21.15],
          [80.2, 21.45],
          [80.55, 21.78],
          [80.62, 22.02],
          [80.3, 22.05],
          [80.0, 21.92],
          [79.6, 21.8],
          [79.3, 21.48],
          [78.95, 21.42],
          [78.95, 21.18],
        ],
      ),
      polygon("tirodi-gneiss", 0.14, "Basement gneiss exposed along the northern margin.", [
        [79.25, 21.52],
        [79.55, 21.56],
        [79.58, 21.8],
        [79.35, 21.74],
        [79.25, 21.52],
      ]),
      polygon("mn-horizon", 0.3, "Nagpur segment: Kandri.", [
        [79.05, 21.28],
        [79.4, 21.22],
        [79.55, 21.26],
        [79.55, 21.42],
        [79.4, 21.42],
        [79.05, 21.37],
        [79.05, 21.28],
      ]),
      polygon("mn-horizon", 0.3, "Bhandara (Tumsar) segment: Chikla, Dongri Buzurg and Tirodi.", [
        [79.62, 21.48],
        [79.84, 21.5],
        [79.86, 21.72],
        [79.66, 21.74],
        [79.62, 21.48],
      ]),
      polygon("mn-horizon", 0.3, "Balaghat segment: Balaghat and Ukwa.", [
        [80.08, 21.74],
        [80.35, 21.82],
        [80.52, 21.9],
        [80.5, 21.99],
        [80.32, 21.97],
        [80.08, 21.86],
        [80.08, 21.74],
      ]),
      lineament("Southern boundary shear", "ENE-trending shear bounding the belt to the south.", [
        [78.95, 21.14],
        [79.45, 21.08],
        [79.9, 21.12],
        [80.3, 21.42],
        [80.65, 21.74],
      ]),
      lineament("Axial lineament", "Belt-parallel structure along the Mn-bearing horizon.", [
        [79.0, 21.33],
        [79.5, 21.3],
        [79.8, 21.35],
        [80.1, 21.7],
        [80.5, 21.92],
      ]),
      lineament("Bhandara cross-fault", "NNW-trending cross-fault segmenting the ore horizon.", [
        [79.55, 21.55],
        [79.7, 21.2],
      ]),
      lineament("Balaghat cross-fault", "NNW-trending cross-fault near the Ukwa block.", [
        [80.25, 22.02],
        [80.4, 21.7],
      ]),
    ],
  };
