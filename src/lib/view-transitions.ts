import { useEffect } from "react";

/**
 * View Transition choreography.
 *
 * Every route change is classified so CSS can animate it differently:
 *
 *   strata-enter-app   landing → any workspace   (shell slides in, page rises)
 *   strata-exit-app    workspace → landing       (shell slides out, landing rises)
 *   strata-workspace   workspace → workspace     (shell pinned, content cross-fades)
 *
 * Same-path changes (e.g. #hash jumps on the landing page) return `false`, so
 * the router skips the transition entirely and never freezes a smooth scroll.
 *
 * Browsers without transition-type support fall back to the untyped rules in
 * styles.css (a plain root cross-fade); browsers without the API switch instantly.
 */
export type StrataTransitionType = "strata-enter-app" | "strata-exit-app" | "strata-workspace";

const LANDING_PATH = "/";

export function pickViewTransitionTypes(info: {
  fromLocation?: { pathname: string } | undefined;
  toLocation: { pathname: string };
  pathChanged: boolean;
}): StrataTransitionType[] | false {
  if (!info.pathChanged) return false;
  const fromLanding = info.fromLocation?.pathname === LANDING_PATH;
  const toLanding = info.toLocation.pathname === LANDING_PATH;
  if (fromLanding && !toLanding) return ["strata-enter-app"];
  if (!fromLanding && toLanding) return ["strata-exit-app"];
  return ["strata-workspace"];
}

/**
 * A new transition skips any still-running one, and the browser then rejects
 * that transition's promises. The router doesn't observe them, so a quick
 * double-click logged an uncaught "Transition was skipped" AbortError. Marking
 * them handled keeps the console clean without changing behaviour.
 *
 * Mounted once at the root so it covers the landing page as well as the app.
 */
export function useQuietViewTransitions() {
  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    const original = document.startViewTransition.bind(document);
    const quiet = ((...args: unknown[]) => {
      const transition = (original as (...a: unknown[]) => ViewTransition)(...args);
      for (const promise of [
        transition.ready,
        transition.finished,
        transition.updateCallbackDone,
      ]) {
        promise.catch(() => undefined);
      }
      return transition;
    }) as typeof document.startViewTransition;
    document.startViewTransition = quiet;
    return () => {
      document.startViewTransition = original;
    };
  }, []);
}

/** Runs `task` when the browser is idle (or after a short delay as a fallback). */
export function whenIdle(task: () => void, timeout = 2500): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(task, 1200);
  return () => window.clearTimeout(handle);
}
