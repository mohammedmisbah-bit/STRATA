import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Activity,
  ChevronRight,
  Database,
  Menu,
  Mountain,
  Radio,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { LanguageSwitcher } from "@/components/dashboard/LanguageSwitcher";
import { MineSelector } from "@/components/dashboard/MineSelector";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText, type UiTranslate } from "@/i18n/use-ui-text";
import {
  APP_NAVIGATION,
  isNavigationActive,
  navigationForPath,
  type AppNavigationItem,
} from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

function StrataMark({ t }: { t: UiTranslate }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_35px_-15px_rgba(45,212,191,0.8)]">
        <span className="absolute inset-x-1 bottom-1 h-2 rounded-full bg-teal-300/20 blur" />
        <Mountain className="relative size-5 text-teal-200" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg font-semibold tracking-[-0.04em] text-white">
          STRATA
        </span>
        <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {t("shell.tagline")}
        </span>
      </span>
    </div>
  );
}

function NavEntry({
  item,
  pathname,
  t,
  mobile = false,
  onNavigate,
}: {
  item: AppNavigationItem;
  pathname: string;
  t: UiTranslate;
  mobile?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const active = isNavigationActive(pathname, item.path);
  const Icon = item.icon;
  const label = t(`nav.${item.id}.label`);
  const description = t(`nav.${item.id}.desc`);

  if (mobile) {
    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none",
          active
            ? "border-teal-300/25 bg-teal-300/12 text-white"
            : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white",
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
            active ? "bg-teal-300 text-slate-950" : "bg-white/8 text-slate-300",
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{description}</span>
        </span>
        <ChevronRight className="size-4 text-slate-500" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      title={description}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100",
      )}
    >
      {/* Transform + opacity only, so the active indicator animates on the compositor. */}
      <span
        className={cn(
          "absolute -left-2 h-8 w-1 origin-center rounded-r-full bg-teal-300 shadow-[0_0_16px_rgba(94,234,212,0.8)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors duration-200",
          active
            ? "border-teal-200/20 bg-teal-300 text-slate-950"
            : "border-white/5 bg-white/5 text-slate-400 group-hover:border-white/10 group-hover:text-teal-200",
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="mt-0.5 block truncate text-[10px] text-slate-500 group-hover:text-slate-400">
          {t(`nav.${item.id}.eyebrow`)}
        </span>
      </span>
    </Link>
  );
}

function Navigation({
  pathname,
  t,
  mobile = false,
  onNavigate,
}: {
  pathname: string;
  t: UiTranslate;
  mobile?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <nav aria-label={t("shell.primaryNav")} className={mobile ? "space-y-1" : "space-y-1.5"}>
      {APP_NAVIGATION.map((item) => (
        <NavEntry
          key={item.path}
          item={item}
          pathname={pathname}
          t={t}
          mobile={mobile}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function DataTrustCard({ t }: { t: UiTranslate }) {
  const { mineSource, isFetchingMines, mine } = useDashboard();
  const isLive = mineSource === "supabase";
  const Icon = isLive ? Database : WifiOff;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.045] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <span className="absolute -right-8 -top-8 size-20 rounded-full bg-teal-300/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
          <Icon className="size-3.5 text-teal-300" aria-hidden="true" />
          {t("shell.dataTrust")}
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-teal-200">
          <span className="relative flex size-1.5">
            {isFetchingMines ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-300 opacity-60" />
            ) : null}
            <span className="relative inline-flex size-1.5 rounded-full bg-teal-300" />
          </span>
          {isFetchingMines ? t("shell.syncing") : t("shell.ready")}
        </span>
      </div>
      <div className="mt-3 space-y-2 text-[10px] leading-4 text-slate-400">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-3 shrink-0 text-teal-300" aria-hidden="true" />
          <span>
            {t("shell.mineParams")}:{" "}
            <strong className="font-semibold text-slate-200">{t("shell.moilFilings")}</strong>
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Activity className="mt-0.5 size-3 shrink-0 text-amber-300" aria-hidden="true" />
          <span>
            {t("shell.analytics")}:{" "}
            <strong className="font-semibold text-slate-200">{t("shell.modelledSynthetic")}</strong>
          </span>
        </p>
      </div>
      <p className="mt-3 border-t border-white/8 pt-2.5 font-mono text-[9px] text-slate-500">
        {mine.label} · {isLive ? t("shell.rosterSupabase") : t("shell.rosterLocal")}
      </p>
    </div>
  );
}

function MobileMenu({ pathname, t }: { pathname: string; t: UiTranslate }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card shadow-sm transition-colors duration-200 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
        aria-label={t("shell.openMenu")}
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </button>
      <SheetContent
        side="left"
        className="w-[min(88vw,360px)] border-r border-white/10 bg-[#07151f] p-5 text-white shadow-2xl"
      >
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-white">
            <StrataMark t={t} />
          </SheetTitle>
          <SheetDescription className="text-slate-400">{t("shell.menuHint")}</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <Navigation pathname={pathname} t={t} mobile onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-5 border-t border-white/8 pt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t("shell.language")}
          </p>
          <div className="rounded-2xl bg-white p-2 text-slate-900">
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileBottomNavigation({ pathname, t }: { pathname: string; t: UiTranslate }) {
  return (
    <nav
      aria-label={t("shell.mobileNav")}
      className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-5 gap-1 rounded-[1.35rem] border border-white/10 bg-[#07151f]/97 p-1.5 shadow-[0_20px_60px_-18px_rgba(2,8,23,0.85)] lg:hidden"
    >
      {APP_NAVIGATION.map((item) => {
        const active = isNavigationActive(pathname, item.path);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none active:scale-95",
              active
                ? "bg-teal-300 text-slate-950"
                : "text-slate-400 hover:bg-white/7 hover:text-white",
            )}
          >
            <Icon className="size-[17px]" aria-hidden="true" />
            <span className="truncate text-[9px] font-bold">{t(`nav.${item.id}.short`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Warms every workspace chunk once the browser is idle, so the first click on
 * any tab is instant instead of waiting on a network round trip.
 */
/**
 * A new route transition skips any still-running one; the browser then rejects
 * that transition's promises. The router doesn't observe them, so each quick
 * double-click logged an uncaught "Transition was skipped" AbortError. Marking
 * them handled keeps the console clean without changing behaviour.
 */
function useQuietViewTransitions() {
  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    const original = document.startViewTransition.bind(document);
    const quiet: typeof document.startViewTransition = (...args: unknown[]) => {
      const transition = (original as (...a: unknown[]) => ViewTransition)(...args);
      for (const promise of [
        transition.ready,
        transition.finished,
        transition.updateCallbackDone,
      ]) {
        promise.catch(() => undefined);
      }
      return transition;
    };
    document.startViewTransition = quiet;
    return () => {
      document.startViewTransition = original;
    };
  }, []);
}

function usePreloadWorkspaces() {
  const router = useRouter();
  useEffect(() => {
    const preload = () => {
      for (const item of APP_NAVIGATION) {
        void router.preloadRoute({ to: item.path }).catch(() => undefined);
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(preload, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(preload, 1200);
    return () => window.clearTimeout(handle);
  }, [router]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const current = navigationForPath(pathname);
  const CurrentIcon = current.icon;
  const { mine, mineSource } = useDashboard();
  const t = useUiText();
  usePreloadWorkspaces();
  useQuietViewTransitions();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Fixed ambient backdrop on its own compositor layer — unlike
          `background-attachment: fixed`, it never repaints while scrolling. */}
      <div className="app-shell-bg pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />

      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-transform focus:translate-y-0"
      >
        {t("shell.skip")}
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-hidden border-r border-white/8 bg-[#07151f] [view-transition-name:strata-sidebar] lg:flex lg:flex-col">
        <div className="strata-contours absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative flex h-full flex-col p-5">
          <div className="border-b border-white/8 pb-5">
            {/* The logo returns to the public landing page. */}
            <Link
              to="/"
              className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
            >
              <StrataMark t={t} />
            </Link>
          </div>
          <p className="mb-2 mt-5 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {t("shell.workspaces")}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            <Navigation pathname={pathname} t={t} />
          </div>
          <div className="mt-4">
            <DataTrustCard t={t} />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-background/92 [view-transition-name:strata-header] supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md">
          <div className="mx-auto flex min-h-[72px] max-w-[1700px] items-center gap-3 px-3 sm:px-5 lg:px-7">
            <MobileMenu pathname={pathname} t={t} />
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden size-10 place-items-center rounded-xl border border-border bg-card text-teal shadow-sm sm:grid">
                <CurrentIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate font-display text-sm font-semibold tracking-[-0.02em]">
                  {t(`nav.${current.id}.label`)}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {t(`nav.${current.id}.eyebrow`)} · {mine.label}
                </p>
              </div>
            </div>

            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              <MineSelector />
              {/* Visible from 768px up; below that it lives in the menu sheet. */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <span
                className={cn(
                  "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] 2xl:flex",
                  mineSource === "supabase"
                    ? "border-teal/20 bg-teal-soft text-teal"
                    : "border-amber-200 bg-amber-50 text-amber-800",
                )}
              >
                {mineSource === "supabase" ? (
                  <Radio className="size-3" aria-hidden="true" />
                ) : (
                  <Database className="size-3" aria-hidden="true" />
                )}
                {mineSource === "supabase" ? t("shell.liveRoster") : t("shell.curatedRoster")}
              </span>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1700px] px-3 pb-28 pt-4 [view-transition-name:strata-main] sm:px-5 sm:pt-5 lg:px-7 lg:pb-8 lg:pt-6"
        >
          {children}
        </main>

        <footer className="hidden border-t border-border/70 px-7 py-3 text-[10px] text-muted-foreground lg:block">
          <div className="mx-auto flex max-w-[1644px] flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-teal" aria-hidden="true" />
              {t("shell.footer")}
            </span>
            <span className="font-mono">
              {mine.label} · {mine.district}, {mine.state} · {mine.officialSource}
            </span>
          </div>
        </footer>
      </div>

      <MobileBottomNavigation pathname={pathname} t={t} />
    </div>
  );
}
