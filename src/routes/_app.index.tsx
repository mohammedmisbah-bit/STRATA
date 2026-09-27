import { createFileRoute } from "@tanstack/react-router";

import { RoutePending } from "@/components/layout/RoutePending";
import { OverviewPage } from "@/components/pages/OverviewPage";

const DESCRIPTION =
  "A clear operational overview of manganese prospectivity, production, risk and scenario planning across MOIL mines.";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Command Center | STRATA" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "STRATA Manganese Intelligence" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  pendingComponent: RoutePending,
  component: OverviewPage,
});
