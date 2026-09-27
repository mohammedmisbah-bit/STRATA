import { Link, useLocation } from "@tanstack/react-router";
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
import { useState, type ReactNode } from "react";

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
import {
  APP_NAVIGATION,
  isNavigationActive,
  navigationForPath,
  type AppNavigationItem,
} from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

function StrataMark({ compact = false }: { compact?: boolean | undefined }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_35px_-15px_rgba(45,212,191,0.8)]">
        <span className="absolute inset-x-1 bottom-1 h-2 rounded-full bg-teal-300/20 blur" />
        <Mountain className="relative size-5 text-teal-200" aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="min-w-0">
          <span className="block font-display text-lg font-semibold tracking-[-0.04em] text-white">
            STRATA
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Manganese Intelligence
          </span>
        </span>
      )}
    </div>
  );
}

function NavEntry({
  item,
  pathname,
  mobile = false,
  onNavigate,
}: {
  item: AppNavigationItem;
  pathname: string;
  mobile?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const active = isNavigationActive(pathname, item.path);
  const Icon = item.icon;

  if (mobile) {
    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none",
          active
            ? "border-teal-300/25 bg-teal-300/12 text-white"
            : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white",
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            active ? "bg-teal-300 text-slate-950" : "bg-white/8 text-slate-300",
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{item.label}</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
            {item.description}
          </span>
        </span>
        <ChevronRight className="size-4 text-slate-500" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      title={item.description}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none",
        active
          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_-22px_rgba(45,212,191,0.65)]"
          : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100",
      )}
    >
      {active ? (
        <span className="absolute -left-2 h-8 w-1 rounded-r-full bg-teal-300 shadow-[0_0_16px_rgba(94,234,212,0.8)]" />
      ) : null}
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border transition-all",
          active
            ? "border-teal-200/20 bg-teal-300 text-slate-950"
            : "border-white/5 bg-white/5 text-slate-400 group-hover:border-white/10 group-hover:text-teal-200",
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{item.label}</span>
        <span className="mt-0.5 block truncate text-[10px] text-slate-500 group-hover:text-slate-400">
          {item.eyebrow}
        </span>
      </span>
    </Link>
  );
}

function Navigation({
  pathname,
  mobile = false,
  onNavigate,
}: {
  pathname: string;
  mobile?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <nav aria-label="Primary navigation" className={mobile ? "space-y-1" : "space-y-1.5"}>
      {APP_NAVIGATION.map((item) => (
        <NavEntry
          key={item.path}
          item={item}
          pathname={pathname}
          mobile={mobile}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function DataTrustCard() {
  const { mineSource, isFetchingMines, mine } = useDashboard();
  const isLive = mineSource === "supabase";
  const Icon = isLive ? Database : WifiOff;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.045] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <span className="absolute -right-8 -top-8 size-20 rounded-full bg-teal-300/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
          <Icon className="size-3.5 text-teal-300" aria-hidden="true" />
          Data trust
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-teal-200">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-300 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-teal-300" />
          </span>
          {isFetchingMines ? "Syncing" : "Ready"}
        </span>
      </div>
      <div className="mt-3 space-y-2 text-[10px] leading-4 text-slate-400">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-3 shrink-0 text-teal-300" aria-hidden="true" />
          <span>
            Mine parameters: <strong className="font-semibold text-slate-200">MOIL filings</strong>
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Activity className="mt-0.5 size-3 shrink-0 text-amber-300" aria-hidden="true" />
          <span>
            Analytics:{" "}
            <strong className="font-semibold text-slate-200">modelled / synthetic</strong>
          </span>
        </p>
      </div>
      <p className="mt-3 border-t border-white/8 pt-2.5 font-mono text-[9px] text-slate-500">
        {mine.label} · roster {isLive ? "Supabase" : "local fallback"}
      </p>
    </div>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card shadow-sm transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </button>
      <SheetContent
        side="left"
        className="w-[min(88vw,360px)] border-r border-white/10 bg-[#07151f] p-5 text-white shadow-2xl"
      >
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-white">
            <StrataMark />
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Choose a workspace. Your mine and scenario stay selected as you move.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <Navigation pathname={pathname} mobile onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-5 border-t border-white/8 pt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Language
          </p>
          <div className="rounded-2xl bg-white p-2 text-slate-900">
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileBottomNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-5 gap-1 rounded-[1.35rem] border border-white/10 bg-[#07151f]/95 p-1.5 shadow-[0_20px_60px_-18px_rgba(2,8,23,0.85)] backdrop-blur-xl lg:hidden"
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
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center transition focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none",
              active
                ? "bg-teal-300 text-slate-950"
                : "text-slate-400 hover:bg-white/7 hover:text-white",
            )}
          >
            <Icon className="size-[17px]" aria-hidden="true" />
            <span className="truncate text-[9px] font-bold">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const current = navigationForPath(pathname);
  const CurrentIcon = current.icon;
  const { mine, mineSource } = useDashboard();

  return (
    <div className="app-shell-bg min-h-screen bg-background font-sans text-foreground">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-hidden border-r border-white/8 bg-[#07151f] lg:flex lg:flex-col">
        <div className="strata-contours absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative flex h-full flex-col p-5">
          <div className="border-b border-white/8 pb-5">
            <StrataMark />
          </div>
          <p className="mb-2 mt-5 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Workspaces
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            <Navigation pathname={pathname} />
          </div>
          <div className="mt-4">
            <DataTrustCard />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
          <div className="mx-auto flex min-h-[72px] max-w-[1700px] items-center gap-3 px-3 sm:px-5 lg:px-7">
            <MobileMenu pathname={pathname} />
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden size-10 place-items-center rounded-xl border border-border bg-card text-teal shadow-sm sm:grid">
                <CurrentIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate font-display text-sm font-semibold tracking-[-0.02em]">
                  {current.label}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {current.eyebrow} · {mine.label}
                </p>
              </div>
            </div>

            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              <MineSelector />
              <div className="hidden xl:block">
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
                {mineSource === "supabase" ? "Live roster" : "Curated roster"}
              </span>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1700px] px-3 pb-28 pt-4 sm:px-5 sm:pt-5 lg:px-7 lg:pb-8 lg:pt-6"
        >
          <div className="page-enter">{children}</div>
        </main>

        <footer className="hidden border-t border-border/70 px-7 py-3 text-[10px] text-muted-foreground lg:block">
          <div className="mx-auto flex max-w-[1644px] flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-teal" aria-hidden="true" />
              Ground truth, geospatial context and scenario intelligence in one workspace.
            </span>
            <span className="font-mono">
              {mine.label} · {mine.district}, {mine.state} · {mine.officialSource}
            </span>
          </div>
        </footer>
      </div>

      <MobileBottomNavigation pathname={pathname} />
    </div>
  );
}
