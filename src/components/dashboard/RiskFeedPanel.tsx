import { AlertTriangle, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useMemo } from "react";

import { useDashboard } from "@/context/use-dashboard";
import { useLanguage } from "@/context/use-language";
import { useTranslatedTexts } from "@/hooks/use-translated-text";
import { env } from "@/lib/env";
import { RISK_BEACON_TONE, RISK_SURFACE_CLASSES, formatTonnes } from "@/lib/format";
import { LANGUAGE_META } from "@/services/translationService";
import { cn } from "@/lib/utils";

import { Beacon } from "./Beacon";
import { Panel } from "./Panel";
import { RiskBadge } from "./RiskBadge";

export function RiskFeedPanel() {
  const { mine, scenario, loggedAlertImpactTonnes } = useDashboard();
  const { language } = useLanguage();
  const alerts = mine.riskAlerts;

  // Alert titles and causes are the localised surface. Severity labels and
  // tonnages stay in English/numerals on purpose — they are operational codes.
  const sources = useMemo(() => alerts.flatMap((alert) => [alert.title, alert.cause]), [alerts]);

  const { t, isTranslating, hasFallback, isRateLimited } = useTranslatedTexts(sources);
  const isLocalised = language !== "en";
  const isTranslationEnabled = env.translation.enabled;

  return (
    <Panel
      title="Active Shortfall Risk Feed"
      right={
        <span className="flex items-center gap-2">
          {isLocalised && isTranslating ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              {LANGUAGE_META[language].label}
            </span>
          ) : null}
          {isLocalised && !isTranslating && hasFallback ? (
            <span
              className="flex items-center gap-1 text-[10px] font-medium text-ochre"
              title={
                !isTranslationEnabled
                  ? "Translation is switched off via VITE_TRANSLATION_ENABLED."
                  : isRateLimited
                    ? "MyMemory free quota reached — showing the original English text."
                    : "Translation unavailable — showing the original English text."
              }
            >
              <TriangleAlert className="size-3" aria-hidden="true" />
              {isTranslationEnabled ? "EN fallback" : "EN (off)"}
            </span>
          ) : null}
          <span className="rounded-full bg-coral-soft px-2 py-0.5 text-[10px] font-semibold text-coral">
            {alerts.length} open
          </span>
        </span>
      }
    >
      <div
        className={cn(
          "space-y-2.5 transition-opacity duration-300 ease-in-out",
          isLocalised && isTranslating ? "opacity-60" : "opacity-100",
        )}
        aria-busy={isLocalised && isTranslating}
      >
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            No open shortfall alerts logged for {mine.label}.
          </div>
        ) : (
          alerts.map((alert) => (
            <article
              key={alert.id}
              lang={language}
              className={cn(
                "rounded-md border p-3 transition-all duration-300 ease-in-out hover:shadow-md",
                RISK_SURFACE_CLASSES[alert.severity] ?? RISK_SURFACE_CLASSES.LOW,
                alert.severity === "CRITICAL" && "animate-breathe",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Beacon tone={RISK_BEACON_TONE[alert.severity]} />
                  <RiskBadge severity={alert.severity} />
                </span>
                <span className="font-mono text-[11px] font-semibold" lang="en">
                  −{formatTonnes(alert.impactTonnes)} T
                </span>
              </div>
              <h3 className="mt-1.5 text-sm font-semibold">{t(alert.title)}</h3>
              <p className="mt-0.5 text-[11px] opacity-80">
                {t(alert.cause)} · <span lang="en">{alert.detectedAt}</span>
              </p>
            </article>
          ))
        )}

        <div className="flex items-start gap-2 rounded-md border border-border bg-panel-grid p-3 text-[11px] text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-ochre" aria-hidden="true" />
          <span>
            Logged alerts account for{" "}
            <span className="font-mono font-semibold text-foreground">
              −{formatTonnes(loggedAlertImpactTonnes)} T
            </span>{" "}
            against a simulated shortfall of{" "}
            <span className="font-mono font-semibold text-coral">
              −{formatTonnes(scenario.shortfallTonnes)} T
            </span>{" "}
            at {mine.label}.
          </span>
        </div>
      </div>
    </Panel>
  );
}
