import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CircleGauge, Compass, Database, Sparkles } from "lucide-react";

import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { MineGroundTruthPanel } from "@/components/dashboard/MineGroundTruthPanel";
import { Panel } from "@/components/dashboard/Panel";
import { ProductionTrendPanel } from "@/components/dashboard/ProductionTrendPanel";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { RiskFeedPanel } from "@/components/dashboard/RiskFeedPanel";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { APP_NAVIGATION } from "@/lib/app-navigation";
import { formatPercent, formatTonnes } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACCENT_STYLES = {
  violet: "from-violet-500/16 text-violet-700 bg-violet-50",
  sky: "from-sky-500/16 text-sky-700 bg-sky-50",
  rose: "from-rose-500/16 text-rose-700 bg-rose-50",
  amber: "from-amber-500/16 text-amber-700 bg-amber-50",
  teal: "from-teal/16 text-teal bg-teal-soft",
} as const;

export function OverviewPage() {
  const { mine, scenario, mineSource } = useDashboard();
  const t = useUiText();
  const detailPages = APP_NAVIGATION.filter((item) => item.path !== "/");

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={t("overview.eyebrow")}
        title={t("overview.title")}
        description={t("overview.desc", { mine: mine.label })}
        icon={CircleGauge}
        badges={
          <>
            <HeroBadge tone="teal">{mine.label}</HeroBadge>
            <HeroBadge>
              ~{mine.depthMeters} m · {mine.type}
            </HeroBadge>
            <HeroBadge tone={scenario.riskLevel === "CRITICAL" ? "rose" : "amber"}>
              {t("overview.scenarioRisk", { level: scenario.riskLevel })}
            </HeroBadge>
            <HeroBadge>
              {mineSource === "supabase" ? t("overview.liveRoster") : t("overview.curatedRoster")}
            </HeroBadge>
          </>
        }
        actions={
          <>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-[0_12px_30px_-14px_rgba(94,234,212,0.8)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-teal-200 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-teal-100 focus-visible:outline-none"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {t("overview.testScenario")}
            </Link>
            <Link
              to="/prospectivity"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              <Compass className="size-3.5" aria-hidden="true" />
              {t("overview.exploreGeology")}
            </Link>
          </>
        }
      />

      <KpiStrip />

      <section aria-labelledby="overview-focus" className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <ProductionTrendPanel />
        <Panel
          title={t("overview.decisionBrief")}
          provenance="modelled"
          description={t("overview.decisionBriefDesc")}
          right={<RiskBadge severity={scenario.riskLevel} />}
        >
          <div className="rounded-2xl bg-[#0a202a] p-4 text-white shadow-inner">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-200/70">
              {t("overview.forecastOutcome")}
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-2xl font-semibold tracking-[-0.05em] tabular-nums">
                  {formatTonnes(scenario.projectedTonnes)} T
                </p>
                <p className="mt-1 text-[10px] text-slate-400">{t("overview.projectedMonthly")}</p>
              </div>
              <p className="rounded-full bg-white/8 px-2.5 py-1 font-mono text-[10px] text-teal-200">
                {t("overview.attainmentBadge", { pct: formatPercent(scenario.attainmentPct) })}
              </p>
            </div>
          </div>

          <h2 id="overview-focus" className="mt-4 text-xs font-bold text-foreground">
            {t("overview.nextMoves")}
          </h2>
          <ol className="mt-2.5 space-y-2.5">
            {scenario.directives.slice(0, 3).map((directive, index) => (
              <li
                key={directive}
                className="flex gap-3 text-[11px] leading-5 text-muted-foreground"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal-soft font-mono text-[9px] font-bold text-teal">
                  {index + 1}
                </span>
                <span lang="en">{directive}</span>
              </li>
            ))}
          </ol>
          <Link
            to="/simulator"
            className="group mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-teal hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t("overview.openLab")}
            <ArrowRight
              className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Panel>
      </section>

      <section aria-labelledby="workspaces-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-teal">
              {t("overview.workspacesEyebrow")}
            </p>
            <h2
              id="workspaces-heading"
              className="mt-1 font-display text-xl font-semibold tracking-[-0.03em]"
            >
              {t("overview.workspacesTitle")}
            </h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-muted-foreground">
            {t("overview.workspacesDesc")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {detailPages.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "lift-card group relative isolate min-h-48 overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br to-white p-5 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/[0.025] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  ACCENT_STYLES[item.accent],
                )}
              >
                <span className="absolute right-4 top-4 font-mono text-[9px] font-semibold text-slate-400">
                  0{index + 1}
                </span>
                <span className="grid size-11 place-items-center rounded-2xl bg-current/10">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold tracking-[-0.02em] text-foreground">
                  {t(`nav.${item.id}.label`)}
                </h3>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  {t(`nav.${item.id}.desc`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-extrabold">
                  {t("overview.openWorkspace")}
                  <ArrowRight
                    className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <RiskFeedPanel />
        <MineGroundTruthPanel />
      </section>

      <aside className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-[10px] leading-4 text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-start gap-2">
          <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
          {t("overview.footnote")}
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="size-3" aria-hidden="true" />
          {t("overview.activeSite", { mine: mine.label })}
        </span>
      </aside>
    </div>
  );
}
