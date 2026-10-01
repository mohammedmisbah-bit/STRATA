import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Home, Mountain, RefreshCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { DashboardProvider } from "@/context/DashboardContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useQuietViewTransitions } from "@/lib/view-transitions";

import appCss from "../styles.css?url";

function StatePage({
  code,
  title,
  description,
  icon,
  children,
}: {
  code: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="app-shell-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div
        className="glow-teal absolute left-1/2 -top-24 h-[36rem] w-[56rem] -translate-x-1/2"
        aria-hidden="true"
      />
      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/80 bg-card/95 p-6 text-center shadow-[0_32px_90px_-40px_rgba(15,23,42,0.65)] ring-1 ring-slate-950/[0.025] sm:p-9">
        <span
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal via-amber-400 to-violet-500"
          aria-hidden="true"
        />
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#071b25] text-teal-200 shadow-[0_16px_35px_-18px_rgba(15,118,110,0.8)]">
          {icon}
        </span>
        <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
          STRATA · {code}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
      </section>
    </main>
  );
}

function NotFoundComponent() {
  return (
    <StatePage
      code="404"
      title="This workspace isn't on the map."
      description="The address may have changed. Return to the Command Center to continue with the selected operation."
      icon={<Mountain className="size-6" aria-hidden="true" />}
    >
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-[#0b3940] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f4b53] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Home className="size-3.5" aria-hidden="true" />
        Return to Command Center
      </Link>
    </StatePage>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <StatePage
      code="Recovery"
      title="This analysis didn't load."
      description="Your data has not been changed. Retry the workspace, or return to the overview and continue from there."
      icon={<TriangleAlert className="size-6" aria-hidden="true" />}
    >
      <button
        type="button"
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0b3940] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f4b53] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Try again
      </button>
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Home className="size-3.5" aria-hidden="true" />
        Go to overview
      </a>
    </StatePage>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STRATA · Manganese Intelligence" },
      {
        name: "description",
        content: "Manganese prospectivity, production, risk and scenario intelligence.",
      },
      { name: "author", content: "STRATA" },
      { property: "og:title", content: "STRATA Manganese Intelligence" },
      {
        property: "og:description",
        content: "Manganese prospectivity, production, risk and scenario intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#071b25" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useQuietViewTransitions();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DashboardProvider>
          <Outlet />
        </DashboardProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
