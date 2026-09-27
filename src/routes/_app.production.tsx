import { createFileRoute } from "@tanstack/react-router";

import { RoutePending } from "@/components/layout/RoutePending";
import { ProductionPage } from "@/components/pages/ProductionPage";

const DESCRIPTION =
  "Analyse manganese mine production targets, monthly trends and deterministic daily operating records.";

export const Route = createFileRoute("/_app/production")({
  head: () => ({
    meta: [{ title: "Production | STRATA" }, { name: "description", content: DESCRIPTION }],
  }),
  pendingComponent: RoutePending,
  component: ProductionPage,
});
