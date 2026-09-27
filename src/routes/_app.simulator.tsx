import { createFileRoute } from "@tanstack/react-router";

import { RoutePending } from "@/components/layout/RoutePending";
import { SimulatorPage } from "@/components/pages/SimulatorPage";

const DESCRIPTION =
  "Test manganese mine rainfall and downtime scenarios, quantify output impact and generate mitigation guidance.";

export const Route = createFileRoute("/_app/simulator")({
  head: () => ({
    meta: [{ title: "Scenario Lab | STRATA" }, { name: "description", content: DESCRIPTION }],
  }),
  pendingComponent: RoutePending,
  component: SimulatorPage,
});
