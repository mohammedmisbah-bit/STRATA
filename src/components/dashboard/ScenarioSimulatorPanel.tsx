import {
  BrainCircuit,
  CloudDownload,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDashboard } from "@/context/use-dashboard";
import { useLanguage } from "@/context/use-language";
import { useTranslatedText } from "@/hooks/use-translated-text";
import { formatPercent, formatTonnes } from "@/lib/format";
import { SIMULATOR_LIMITS } from "@/lib/simulation";
import { cn } from "@/lib/utils";
import {
  GROQ_MODEL,
  generateMitigationDirective,
  isUsingClientSideKey,
  type MitigationDirective,
} from "@/services/groqService";
import { LANGUAGE_META } from "@/services/translationService";
import { fetchMineWeather, type RainfallImpact } from "@/services/weatherService";

import { Panel } from "./Panel";
import { RiskBadge } from "./RiskBadge";
import { ScenarioSlider } from "./ScenarioSlider";

const DRIVER_LABEL = {
  hoist: "Hoist downtime dominant",
  rainfall: "Rainfall dominant",
  balanced: "Drivers balanced",
} as const;

type LiveRainfallState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "ready";
      mm: number;
      date: string;
      timezone: string;
      impact: RainfallImpact;
      weekTotalMm: number;
      rainyDays: number;
      currentMm: number | null;
    }
  | { kind: "unavailable" };

export function ScenarioSimulatorPanel() {
  const {
    mine,
    scenario,
    hoistDowntimeHours,
    rainfallMm,
    setHoistDowntimeHours,
    setRainfallMm,
    resetScenario,
  } = useDashboard();

  const hoistLimits = SIMULATOR_LIMITS.hoistDowntimeHours;
  const rainfallLimits = SIMULATOR_LIMITS.rainfallMm;

  const isDefault =
    hoistDowntimeHours === hoistLimits.default && rainfallMm === rainfallLimits.default;

  const { language } = useLanguage();

  const [liveRainfall, setLiveRainfall] = useState<LiveRainfallState>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const [directive, setDirective] = useState<MitigationDirective | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const directiveAbortRef = useRef<AbortController | null>(null);
  const directiveRequestRef = useRef(0);

  // The English directive is the translation source; the hook re-runs whenever
  // the header language changes, so the callout retoggles without regenerating.
  const translatedDirective = useTranslatedText(directive?.text ?? null);

  // A stale response for the previous mine must not overwrite the slider.
  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLiveRainfall({ kind: "idle" });
  }, [mine.id]);

  // A directive is only valid for the mine it was generated against.
  useEffect(() => {
    directiveAbortRef.current?.abort();
    directiveAbortRef.current = null;
    directiveRequestRef.current += 1;
    setIsGenerating(false);
    setDirective(null);
  }, [mine.id]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      directiveAbortRef.current?.abort();
    },
    [],
  );

  const generateDirective = useCallback(async () => {
    directiveAbortRef.current?.abort();
    const controller = new AbortController();
    directiveAbortRef.current = controller;

    const requestId = directiveRequestRef.current + 1;
    directiveRequestRef.current = requestId;
    setIsGenerating(true);

    // generateMitigationDirective never rejects, so there is no catch to write —
    // a failure arrives as a resolved fallback directive.
    const result = await generateMitigationDirective(
      {
        mineName: mine.label,
        depthMeters: mine.depthMeters,
        targetTonnes: scenario.targetTonnes,
        predictedTonnes: scenario.projectedTonnes,
        hoistDowntimeHours,
        rainfallMm,
      },
      { signal: controller.signal },
    );

    if (controller.signal.aborted || directiveRequestRef.current !== requestId) return;
    setDirective(result);
    setIsGenerating(false);
  }, [
    mine.label,
    mine.depthMeters,
    scenario.targetTonnes,
    scenario.projectedTonnes,
    hoistDowntimeHours,
    rainfallMm,
  ]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadLiveRainfall = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLiveRainfall({ kind: "loading" });

    // Queried at the active mine's own coordinates, not a regional default.
    const snapshot = await fetchMineWeather(mine, {
      pastDays: 7,
      forecastDays: 1,
      signal: controller.signal,
    });

    if (controller.signal.aborted) return;

    if (snapshot === null || snapshot.latest === null) {
      setLiveRainfall({ kind: "unavailable" });
      return;
    }

    const { precipitationMm, date } = snapshot.latest;
    setRainfallMm(precipitationMm);
    setLiveRainfall({
      kind: "ready",
      mm: precipitationMm,
      date,
      timezone: snapshot.timezone,
      impact: snapshot.impact,
      weekTotalMm: snapshot.totalMm,
      rainyDays: snapshot.rainyDays,
      currentMm: snapshot.current?.precipitationMm ?? null,
    });
  }, [mine, setRainfallMm]);

  return (
    <Panel
      title="Scenario Simulator & Action Console"
      provenance="modelled"
      description="Adjust two operational drivers, see the output impact, then generate a practical mitigation plan."
      right={
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetScenario}
            disabled={isDefault}
            className="flex items-center gap-1 rounded-md border border-slate-line bg-card px-2 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Reset
          </button>
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Sparkles className="size-3" aria-hidden="true" />
            Deterministic rules
          </span>
        </span>
      }
    >
      <div className="space-y-2.5">
        <ScenarioSlider
          id="sim-hoist-downtime"
          label="Shaft Hoist Downtime"
          value={hoistDowntimeHours}
          min={hoistLimits.min}
          max={hoistLimits.max}
          step={hoistLimits.step}
          unit={hoistLimits.unit}
          accentColor="#D97706"
          valueClassName="text-ochre"
          contributionLabel={`−${formatTonnes(scenario.hoistLossTonnes)} T · ${formatPercent(scenario.hoistSharePct, 0)}`}
          onChange={setHoistDowntimeHours}
        />

        <ScenarioSlider
          id="sim-rainfall"
          label="Monsoon Rainfall"
          value={rainfallMm}
          min={rainfallLimits.min}
          max={rainfallLimits.max}
          step={rainfallLimits.step}
          unit={rainfallLimits.unit}
          accentColor="#0F766E"
          valueClassName="text-teal"
          contributionLabel={`−${formatTonnes(scenario.rainfallLossTonnes)} T · ${formatPercent(scenario.rainfallSharePct, 0)}`}
          onChange={setRainfallMm}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-border px-2.5 py-2">
          <button
            type="button"
            onClick={() => void loadLiveRainfall()}
            disabled={liveRainfall.kind === "loading"}
            className="flex items-center gap-1.5 rounded-md border border-slate-line bg-card px-2 py-1 text-[10px] font-semibold text-teal transition-colors hover:bg-teal-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {liveRainfall.kind === "loading" ? (
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <CloudDownload className="size-3" aria-hidden="true" />
            )}
            Use live rainfall
          </button>

          <span className="font-mono text-[10px] text-muted-foreground" role="status">
            {liveRainfall.kind === "ready"
              ? `Open-Meteo · ${liveRainfall.mm} mm on ${liveRainfall.date} (${liveRainfall.timezone})`
              : liveRainfall.kind === "loading"
                ? `Fetching Open-Meteo for ${mine.label}…`
                : liveRainfall.kind === "unavailable"
                  ? "Open-Meteo unavailable — slider value retained"
                  : "Keyless Open-Meteo feed · no API key required"}
          </span>

          {liveRainfall.kind === "ready" ? (
            <dl className="grid w-full grid-cols-2 gap-x-3 gap-y-1 border-t border-border pt-1.5 font-mono text-[10px] sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Impact</dt>
                <dd
                  className={cn(
                    "font-semibold",
                    liveRainfall.impact.level === "SEVERE"
                      ? "text-coral"
                      : liveRainfall.impact.level === "ELEVATED"
                        ? "text-ochre"
                        : "text-teal",
                  )}
                  title={liveRainfall.impact.summary}
                >
                  {liveRainfall.impact.level} · −{formatTonnes(liveRainfall.impact.lossTonnes)} T
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Now (15 min)</dt>
                <dd className="font-semibold">
                  {liveRainfall.currentMm === null ? "—" : `${liveRainfall.currentMm} mm`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">8-day total</dt>
                <dd className="font-semibold">{liveRainfall.weekTotalMm} mm</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rainy days ≥2.5 mm</dt>
                <dd className="font-semibold">{liveRainfall.rainyDays}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Projected", value: `${formatTonnes(scenario.projectedTonnes)} T` },
            { label: "Shortfall", value: `−${formatTonnes(scenario.shortfallTonnes)} T` },
            { label: "Attainment", value: formatPercent(scenario.attainmentPct) },
            { label: "Target", value: `${formatTonnes(scenario.targetTonnes)} T` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-border bg-panel-grid px-2 py-1.5"
            >
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="font-mono text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-panel-grid px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Risk level
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              {DRIVER_LABEL[scenario.dominantDriver]}
            </span>
            <RiskBadge severity={scenario.riskLevel} />
          </span>
        </div>

        <div className="rounded-md border border-border bg-console p-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recommended actions · {mine.label}
          </p>
          <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-foreground">
            {scenario.directives.map((line, index) => (
              <li key={`${index}-${line.slice(0, 24)}`} className="flex gap-1.5">
                <span aria-hidden="true">›</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- AI Directive ------------------------------------------------- */}
        <div className="rounded-md border border-teal/30 bg-teal-soft/40 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
                <BrainCircuit className="size-3.5" aria-hidden="true" />
                AI Directive
              </span>
              {/* Surfaced before generation, not after, so the exposure is
                  noticed during development rather than in production. */}
              {isUsingClientSideKey() ? (
                <span
                  className="flex items-center gap-1 rounded-full bg-coral-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-coral"
                  title="VITE_GROQ_ALLOW_CLIENT_KEY is on, so the Groq key is compiled into the public client bundle and is readable by anyone. Switch to the server-side GROQ_API_KEY before deploying."
                >
                  <ShieldAlert className="size-2.5" aria-hidden="true" />
                  Client key
                </span>
              ) : null}
            </span>

            <span className="flex flex-wrap items-center gap-2">
              {directive !== null ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
                    directive.source === "groq"
                      ? "bg-teal text-primary-foreground"
                      : "bg-amber-100 text-amber-900",
                  )}
                  title={
                    directive.source === "groq"
                      ? `Generated by ${directive.model ?? GROQ_MODEL}`
                      : `Groq unavailable (${directive.reason ?? "unknown"}) — deterministic fallback shown.`
                  }
                >
                  {directive.source === "groq" ? (directive.model ?? GROQ_MODEL) : "Rule fallback"}
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => void generateDirective()}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-md bg-teal px-2.5 py-1 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-teal/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="size-3" aria-hidden="true" />
                )}
                {isGenerating ? "Generating…" : "Generate AI Mitigation"}
              </button>
            </span>
          </div>

          <div aria-live="polite" aria-busy={isGenerating}>
            {directive === null ? (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Generate a two-sentence mitigation directive for {mine.label} from the current
                downtime and rainfall inputs. Falls back to a deterministic directive if Groq is
                unreachable.
              </p>
            ) : (
              <blockquote
                lang={language}
                className={cn(
                  "border-l-2 border-teal pl-2.5 text-[12px] leading-relaxed text-foreground transition-opacity duration-300 ease-in-out",
                  translatedDirective.isTranslating ? "opacity-60" : "opacity-100",
                )}
              >
                {translatedDirective.text}
              </blockquote>
            )}
          </div>

          {directive !== null ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
              <span className="font-mono">
                {formatTonnes(scenario.targetTonnes)} T target ·{" "}
                {formatTonnes(scenario.projectedTonnes)} T predicted · {hoistDowntimeHours} hrs ·{" "}
                {rainfallMm} mm
              </span>

              {language !== "en" ? (
                <span className="flex items-center gap-1 font-medium">
                  {translatedDirective.isTranslating ? (
                    <>
                      <Loader2 className="size-2.5 animate-spin" aria-hidden="true" />
                      {LANGUAGE_META[language].label}
                    </>
                  ) : translatedDirective.hasFallback ? (
                    <span className="flex items-center gap-1 text-ochre">
                      <TriangleAlert className="size-2.5" aria-hidden="true" />
                      EN fallback
                    </span>
                  ) : (
                    <span className="text-teal">{LANGUAGE_META[language].endonym}</span>
                  )}
                </span>
              ) : null}

              {directive.transport === "client" ? (
                <span
                  className="flex items-center gap-1 font-semibold text-coral"
                  title="VITE_GROQ_ALLOW_CLIENT_KEY is enabled, so the Groq key is compiled into the public client bundle. Move to the server-side GROQ_API_KEY before deploying."
                >
                  <ShieldAlert className="size-2.5" aria-hidden="true" />
                  Key exposed in bundle
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
