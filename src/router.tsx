import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { pickViewTransitionTypes } from "@/lib/view-transitions";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Warm a workspace chunk as soon as the pointer rests on its link.
    defaultPreload: "intent",
    defaultPreloadDelay: 40,
    defaultPreloadStaleTime: 0,
    // Chunks are also preloaded on idle (landing + AppShell), so the skeleton
    // should almost never appear. Only show it on a genuinely slow network.
    defaultPendingMs: 700,
    defaultPendingMinMs: 300,
    // Typed View Transitions: CSS choreographs landing ↔ app and
    // workspace ↔ workspace differently. See src/lib/view-transitions.ts.
    defaultViewTransition: { types: pickViewTransitionTypes },
  });
};
