import { createFileRoute } from "@tanstack/react-router";

import { RoutePending } from "@/components/layout/RoutePending";
import { ProspectivityPage } from "@/components/pages/ProspectivityPage";

const DESCRIPTION =
  "Explore manganese prospectivity with geological overlays, remote sensing indicators and confidence intervals.";

export const Route = createFileRoute("/_app/prospectivity")({
  head: () => ({
    meta: [{ title: "Prospectivity | STRATA" }, { name: "description", content: DESCRIPTION }],
  }),
  pendingComponent: RoutePending,
  component: ProspectivityPage,
});
