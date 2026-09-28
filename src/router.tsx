import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

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
    // Chunks are also preloaded on idle (AppShell), so the skeleton should
    // almost never appear. Only show it on a genuinely slow network.
    defaultPendingMs: 700,
    defaultPendingMinMs: 300,
    // Cross-fades route content with the View Transitions API where supported;
    // other browsers switch instantly. Shell parts are pinned in styles.css.
    defaultViewTransition: true,
  });
};
