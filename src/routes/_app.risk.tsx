import { createFileRoute } from "@tanstack/react-router";

import { RoutePending } from "@/components/layout/RoutePending";
import { RiskPage } from "@/components/pages/RiskPage";

const DESCRIPTION =
  "Prioritise operational manganese mine risks and compare logged alerts with scenario-driven output impact.";

export const Route = createFileRoute("/_app/risk")({
  head: () => ({
    meta: [{ title: "Risk Monitor | STRATA" }, { name: "description", content: DESCRIPTION }],
  }),
  pendingComponent: RoutePending,
  component: RiskPage,
});
