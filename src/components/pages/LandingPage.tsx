import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  CircleCheck,
  CloudRain,
  Database,
  Gauge,
  Hourglass,
  Layers3,
  Mountain,
  Pickaxe,
  Rocket,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type MouseEvent } from "react";

import { LanguageSwitcher } from "@/components/dashboard/LanguageSwitcher";
import { ProvenanceBadge, type Provenance } from "@/components/dashboard/ProvenanceBadge";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { useDashboard } from "@/context/use-dashboard";
import type { UiKey } from "@/i18n/ui-strings";
import { useUiText, type UiTranslate } from "@/i18n/use-ui-text";
import { APP_NAVIGATION, type NavId } from "@/lib/app-navigation";
import { formatPercent, formatTonnes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { whenIdle } from "@/lib/view-transitions";

const SECTIONS = [
  { id: "challenge", key: "landing.nav.challenge" },
  { id: "approach", key: "landing.nav.approach" },
  { id: "how", key: "landing.nav.how" },
  { id: "trust", key: "landing.nav.trust" },
] as const satisfies ReadonlyArray<{ id: string; key: UiKey }>;

const CHALLENGES: ReadonlyArray<{ n: "1" | "2" | "3" | "4"; icon: LucideIcon; tone: string }> = [
  { n: "1", icon: Pickaxe, tone: "bg-rose-50 text-rose-700 ring-rose-100" },
  { n: "2", icon: CloudRain, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
  { n: "3", icon: Layers3, tone: "bg-violet-50 text-violet-700 ring-violet-100" },
  { n: "4", icon: Hourglass, tone: "bg-amber-50 text-amber-700 ring-amber-100" },
];

type ApproachId = Exclude<NavId, "overview">;

const APPROACH_TONE: Record<ApproachId, string> = {
  prospectivity: "from-violet-500/12 text-violet-700",
  production: "from-sky-500/12 text-sky-700",
  risk: "from-rose-500/12 text-rose-700",
  simulator: "from-amber-500/12 text-amber-700",
};

const STEPS: ReadonlyArray<{ n: "1" | "2" | "3"; icon: LucideIcon }> = [
  { n: "1", icon: Database },
  { n: "2", icon: Workflow },
  { n: "3", icon: Rocket },
];

const PROVENANCE: readonly Provenance[] = ["official", "modelled", "simulated", "synthetic"];

/**
 * Smooth-scrolls to a section and moves focus to it (for keyboard and screen
 * reader users) without touching the URL, so the router never sees a
 * navigation. Honours prefers-reduced-motion.
 */
function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (target === null) return;
  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

function StrataLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
    >
      <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        <Mountain className="size-[18px] text-teal-200" aria-hidden="true" />
      </span>
      <span className="font-display text-base font-semibold tracking-[-0.04em] text-white">
        STRATA
      </span>
    </Link>
  );
}

function DashboardButton({ t, large = false }: { t: UiTranslate; large?: boolean }) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-300 font-extrabold text-slate-950 shadow-[0_12px_30px_-14px_rgba(94,234,212,0.9)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-teal-200 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-teal-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061620] focus-visible:outline-none",
        large ? "px-5 py-3 text-sm" : "px-3.5 py-2 text-xs",
      )}
    >
      <Gauge className={large ? "size-4" : "size-3.5"} aria-hidden="true" />
      {large ? t("landing.hero.cta") : t("landing.dashboard")}
      <ArrowRight
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
  dark?: boolean;
}) {
  return (
    <div className="landing-reveal max-w-3xl">
      <p
        className={cn(
          "font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
          dark ? "text-teal-300" : "text-teal",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-balance",
          dark ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-7",
            dark ? "text-slate-300" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Live numbers from the shared scenario, so the landing page isn't a static mock. */
function ScenarioPreview({ t }: { t: UiTranslate }) {
  const { mine, scenario } = useDashboard();
  const attainment = Math.min(100, Math.max(0, scenario.attainmentPct));

  return (
    <div className="landing-rise relative [--rise-delay:200ms]">
      <div className="glow-teal absolute -inset-16 -z-10" aria-hidden="true" />
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-200/80">
            {t("landing.preview.title")}
          </p>
          <ProvenanceBadge kind="modelled" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-white">
          {mine.label}
        </p>
        <p className="text-[11px] text-slate-400">
          {mine.district}, {mine.state} · ~{mine.depthMeters} m {mine.type}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-[#051118]/70 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t("kpi.forecastOutput")}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tracking-[-0.04em] text-white tabular-nums">
              {formatTonnes(scenario.projectedTonnes)} T
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#051118]/70 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t("kpi.projectedDeficit")}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tracking-[-0.04em] text-rose-300 tabular-nums">
              −{formatTonnes(scenario.shortfallTonnes)} T
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{t("common.attainment")}</span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-semibold text-teal-200 tabular-nums">
                {formatPercent(scenario.attainmentPct)}
              </span>
              <RiskBadge severity={scenario.riskLevel} />
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-white/8"
            role="progressbar"
            aria-label={t("common.attainment")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(attainment)}
          >
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-teal-400 to-teal-200"
              style={{ transform: `scaleX(${attainment / 100})` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-[10px] leading-4 text-slate-500">{t("landing.preview.caption")}</p>
          <Link
            to="/simulator"
            className="group inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-teal-200 hover:text-teal-100 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
          >
            {t("landing.preview.open")}
            <ArrowRight
              className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const t = useUiText();
  const { mines } = useDashboard();
  const router = useRouter();

  // The transition freezes the old frame until the new route has rendered, so
  // an un-fetched chunk would show up as a stall. Warm it while the user reads.
  useEffect(
    () =>
      whenIdle(() => {
        void router.preloadRoute({ to: "/dashboard" }).catch(() => undefined);
      }),
    [router],
  );
  const workspaces = APP_NAVIGATION.filter(
    (item): item is (typeof APP_NAVIGATION)[number] & { id: ApproachId } => item.id !== "overview",
  );

  const stats = [
    { value: "~90%", label: t("landing.stat.steel") },
    { value: "~385 m", label: t("landing.stat.depth") },
    { value: String(mines.length), label: t("landing.stat.mines") },
    { value: "3", label: t("landing.stat.languages") },
  ];

  return (
    <div className="strata-landing min-h-screen bg-background font-sans text-foreground">
      <a
        href="#landing-main"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-transform focus:translate-y-0"
      >
        {t("shell.skip")}
      </a>

      {/* ---- Top bar ------------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#061620]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <StrataLogo />
          <nav
            aria-label={t("landing.nav.label")}
            className="ml-6 hidden items-center gap-1 lg:flex"
          >
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => scrollToSection(event, section.id)}
                className="rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-300 transition-colors duration-200 hover:bg-white/6 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
              >
                {t(section.key)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-xl bg-white p-1 sm:block">
              <LanguageSwitcher />
            </div>
            <DashboardButton t={t} />
          </div>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1} className="outline-none">
        {/* ---- Hero ------------------------------------------------------ */}
        <section className="relative isolate overflow-hidden bg-[#061620] text-white">
          <div className="strata-contours absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
          <div
            className="glow-teal absolute -left-56 -top-20 -z-10 size-[48rem]"
            aria-hidden="true"
          />
          <div
            className="glow-violet absolute -bottom-40 -right-48 -z-10 size-[40rem]"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:py-28">
            <div>
              <p className="landing-rise inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/8 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-200">
                <span className="size-1.5 rounded-full bg-teal-300" aria-hidden="true" />
                {t("landing.hero.eyebrow")}
              </p>
              <h1 className="landing-rise mt-6 font-display text-[clamp(2.3rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-balance [--rise-delay:60ms]">
                {t("landing.hero.title")}
              </h1>
              <p className="landing-rise mt-6 max-w-2xl text-base leading-8 text-slate-300 [--rise-delay:120ms] sm:text-lg">
                {t("landing.hero.desc")}
              </p>
              <div className="landing-rise mt-9 flex flex-wrap items-center gap-3 [--rise-delay:180ms]">
                <DashboardButton t={t} large />
                <a
                  href="#challenge"
                  onClick={(event) => scrollToSection(event, "challenge")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/6 px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                >
                  {t("landing.hero.secondary")}
                </a>
              </div>
              <div className="mt-6 sm:hidden">
                <div className="inline-block rounded-xl bg-white p-1">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
            <ScenarioPreview t={t} />
          </div>

          {/* Context strip */}
          <div className="border-t border-white/8 bg-[#051118]/80">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col px-2 py-6 sm:px-4">
                  <dt className="order-2 mt-1 text-[12px] leading-5 text-slate-400">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---- The challenge ------------------------------------------------ */}
        <section id="challenge" tabIndex={-1} className="scroll-mt-16 py-20 outline-none sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("landing.challenge.eyebrow")}
              title={t("landing.challenge.title")}
              description={t("landing.challenge.desc")}
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {CHALLENGES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.n} className="landing-reveal">
                    <article className="lift-card relative h-full overflow-hidden rounded-2xl border border-white/80 bg-card p-6 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/[0.03]">
                      <span
                        className={cn(
                          "grid size-11 place-items-center rounded-2xl ring-1",
                          item.tone,
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <p className="mt-5 font-mono text-[10px] font-bold text-slate-400">
                        0{item.n}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold leading-snug tracking-[-0.02em]">
                        {t(`landing.challenge.${item.n}.title`)}
                      </h3>
                      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                        {t(`landing.challenge.${item.n}.desc`)}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Our approach -------------------------------------------------- */}
        <section
          id="approach"
          tabIndex={-1}
          className="scroll-mt-16 border-y outline-none border-border/70 bg-white/70 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("landing.approach.eyebrow")}
              title={t("landing.approach.title")}
              description={t("landing.approach.desc")}
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {workspaces.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="landing-reveal">
                    <Link
                      to={item.path}
                      className={cn(
                        "lift-card group relative isolate flex h-full gap-5 overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br to-white p-6 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/[0.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-7",
                        APPROACH_TONE[item.id],
                      )}
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-current/10">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                          {t(`nav.${item.id}.label`)}
                        </span>
                        <span className="mt-2 block font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground">
                          {t(`landing.approach.${item.id}.q`)}
                        </span>
                        <span className="mt-2 block text-[13px] leading-6 text-muted-foreground">
                          {t(`landing.approach.${item.id}.a`)}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-extrabold">
                          {t("overview.openWorkspace")}
                          <ArrowRight
                            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- How it works -------------------------------------------------- */}
        <section id="how" tabIndex={-1} className="scroll-mt-16 py-20 outline-none sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={t("landing.how.eyebrow")} title={t("landing.how.title")} />
            <ol className="relative mt-12 grid gap-6 lg:grid-cols-3">
              <span
                className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-teal/40 via-teal/20 to-transparent lg:block"
                aria-hidden="true"
              />
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.n} className="landing-reveal relative">
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-[#0b3940] text-teal-200 shadow-[0_14px_30px_-14px_rgba(11,57,64,0.9)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-teal">
                      {t("common.step")} {step.n}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">
                      {t(`landing.how.${step.n}.title`)}
                    </h3>
                    <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted-foreground">
                      {t(`landing.how.${step.n}.desc`)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ---- Data trust ---------------------------------------------------- */}
        <section
          id="trust"
          tabIndex={-1}
          className="relative isolate scroll-mt-16 outline-none overflow-hidden bg-[#061620] py-20 text-white sm:py-28"
        >
          <div className="strata-contours absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <SectionHeading
                eyebrow={t("landing.trust.eyebrow")}
                title={t("landing.trust.title")}
                description={t("landing.trust.desc")}
                dark
              />
              <p className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-[12px] leading-5 text-amber-100">
                {t("landing.trust.note")}
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {PROVENANCE.map((kind) => (
                <li
                  key={kind}
                  className="landing-reveal rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <ProvenanceBadge kind={kind} />
                  <p className="mt-3 text-[13px] leading-6 text-slate-300">
                    {t(`landing.trust.${kind}`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Accessibility + CTA ------------------------------------------ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionHeading
                eyebrow={t("landing.access.eyebrow")}
                title={t("landing.access.title")}
              />
              <ul className="mt-8 space-y-4">
                {(["1", "2", "3"] as const).map((n) => (
                  <li key={n} className="flex items-start gap-3 text-[15px] leading-6">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
                    <span>{t(`landing.access.${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="landing-reveal relative isolate overflow-hidden rounded-[2rem] bg-[#0b3940] p-8 text-white shadow-[0_40px_90px_-40px_rgba(11,57,64,0.9)] sm:p-10">
              <div
                className="strata-contours absolute inset-0 -z-10 opacity-60"
                aria-hidden="true"
              />
              <div
                className="glow-teal absolute -right-32 -top-32 -z-10 size-96"
                aria-hidden="true"
              />
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-tight tracking-[-0.035em]">
                {t("landing.cta.title")}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-teal-50/80">{t("landing.cta.desc")}</p>
              <div className="mt-8">
                <DashboardButton t={t} large />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---- Footer ---------------------------------------------------------- */}
      <footer className="border-t border-border/70 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-[12px] text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <Mountain className="size-4 text-teal" aria-hidden="true" />
            <span className="font-display font-semibold text-foreground">STRATA</span>
            <span>· {t("landing.footer.tag")}</span>
          </div>
          <p className="leading-5">
            <span className="font-semibold text-foreground">{t("landing.footer.sources")}:</span>{" "}
            MOIL SEBI / NSE filings · GSI Bhukosh · NGDR · Open-Meteo · OpenStreetMap
          </p>
          <a
            href="#landing-main"
            onClick={(event) => scrollToSection(event, "landing-main")}
            className="inline-flex items-center gap-1 font-semibold text-teal hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowUp className="size-3.5" aria-hidden="true" />
            {t("landing.backToTop")}
          </a>
        </div>
      </footer>
    </div>
  );
}
