import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/pages/LandingPage";

const DESCRIPTION =
  "STRATA brings geology, production, operational risk and weather into one plain-language workspace for manganese mining.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STRATA · Manganese Intelligence" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "STRATA · Manganese Intelligence" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: LandingPage,
});
