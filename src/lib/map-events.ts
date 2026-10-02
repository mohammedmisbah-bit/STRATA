/**
 * Lets panels outside the map ask it to fly somewhere (e.g. "Show on map" in
 * the greenfield target list) without threading a map ref through context.
 */
export const MAP_FOCUS_EVENT = "strata:map-focus";

export type MapFocusDetail = { lat: number; lon: number; zoom?: number };

export function requestMapFocus(detail: MapFocusDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MapFocusDetail>(MAP_FOCUS_EVENT, { detail }));
}
