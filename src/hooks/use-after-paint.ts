import { useEffect, useState } from "react";

/**
 * `false` on the server and the first client render, `true` one painted frame
 * later.
 *
 * Route transitions freeze the old page until the new route has rendered, so
 * every millisecond of render time is a visible stall. Heavy, layout-dependent
 * widgets (Recharts) render nothing useful on the server anyway, so they can
 * wait one frame: the page arrives immediately with correctly sized empty
 * containers, and the charts draw in as the transition plays.
 */
export function useAfterPaint(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  return ready;
}
