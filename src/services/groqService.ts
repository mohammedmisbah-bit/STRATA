/**
 * Groq (Llama-3.3-70B) mitigation directive synthesis.
 *
 * TRANSPORT — why this is not a plain browser fetch:
 *
 * Vite inlines every VITE_-prefixed variable into the client bundle as literal
 * text, so a `VITE_GROQ_API_KEY` is readable by anyone who opens the bundle.
 * Groq bills per token, so a leaked key is a billable account for strangers.
 *
 * Default path  : TanStack Start server function -> reads server-side
 *                 `GROQ_API_KEY`. The key never reaches the browser, and
 *                 `src/start.ts` already guards server functions with CSRF
 *                 middleware.
 * Opt-in path   : direct browser fetch using `VITE_GROQ_API_KEY`, enabled only
 *                 when `VITE_GROQ_ALLOW_CLIENT_KEY=true`. Use a disposable key.
 *
 * Both paths use the same endpoint, model, prompts and fallback string, so the
 * caller-visible behaviour is identical either way.
 *
 * Nothing here rejects. Every failure resolves to the deterministic fallback
 * directive, so a missing key or a dead network degrades the copy rather than
 * the page.
 */

import { createServerFn } from "@tanstack/react-start";

import { env } from "@/lib/env";

export const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Model selection.
 *
 * The brief specified `llama-3.3-70b-versatile`, but Groq retired it for free and
 * developer tiers on 16 August 2026 (requests now return 404). `openai/gpt-oss-120b`
 * is Groq's recommended replacement. Override with VITE_GROQ_MODEL.
 *
 * If the configured model returns 404, the next candidate is tried, so a future
 * retirement degrades to a sibling model instead of straight to the rule fallback.
 */
export const GROQ_MODEL = env.groq.model;

export const GROQ_MODEL_CANDIDATES: readonly string[] = [
  ...new Set([GROQ_MODEL, "openai/gpt-oss-120b", "openai/gpt-oss-20b"]),
];

export const GROQ_SYSTEM_PROMPT =
  "You are an expert mining shift supervisor at a MOIL manganese mine.";

/** Returned verbatim whenever Groq is unavailable. */
export const GROQ_FALLBACK_DIRECTIVE =
  "Reallocate secondary haulage equipment to offset delays. Shift blast schedule to off-peak dry windows.";

const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Reasoning models spend completion tokens thinking before they answer. Measured
 * against the live API: a 220-token cap left gpt-oss-120b with 203 reasoning tokens
 * and a truncated half-sentence. 1024 with low effort leaves ample headroom.
 */
const MAX_COMPLETION_TOKENS = 1024;

/** Only gpt-oss accepts these parameters; other models may reject them. */
function reasoningParams(model: string): Record<string, unknown> {
  return model.startsWith("openai/gpt-oss")
    ? { reasoning_effort: "low", include_reasoning: false }
    : {};
}

/**
 * gpt-oss typesets with non-breaking hyphens (U+2011) and narrow no-break spaces
 * (U+202F). IBM Plex has no glyph for the former, and both hurt the downstream
 * translation call, so they are normalised to plain ASCII equivalents.
 */
function normaliseTypography(text: string): string {
  return text
    .replace(/[\u2010\u2011\u2012\u2013]/g, "-")
    .replace(/[\u00A0\u202F\u2007]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export type MitigationDirectiveParams = {
  mineName: string;
  depthMeters: number;
  targetTonnes: number;
  predictedTonnes: number;
  hoistDowntimeHours: number;
  rainfallMm: number;
};

export type DirectiveSource = "groq" | "fallback";

export type DirectiveFailureReason =
  | "missing-key"
  /** Every model candidate returned 404 — retired or not enabled for this key. */
  | "model-unavailable"
  | "network"
  | "timeout"
  | "http-error"
  | "rate-limited"
  | "malformed-response"
  | "aborted";

export type MitigationDirective = {
  /** Always renderable: the model's directive, or the fallback. */
  text: string;
  source: DirectiveSource;
  /** Model id when the text came from Groq, otherwise null. */
  model: string | null;
  reason?: DirectiveFailureReason;
  /** Transport actually used. Surfaced so the UI can warn about key exposure. */
  transport: "server" | "client" | "none";
};

function fallback(
  reason: DirectiveFailureReason,
  transport: MitigationDirective["transport"],
): MitigationDirective {
  return { text: GROQ_FALLBACK_DIRECTIVE, source: "fallback", model: null, reason, transport };
}

/**
 * Reads `signal.aborted` through a function call.
 *
 * `AbortSignal.aborted` is a live getter, but TypeScript's control-flow analysis
 * narrows it to `false` after an early guard and then reports any later check as
 * unreachable — even though the value genuinely flips across an `await`. Routing
 * the read through a call boundary keeps the check honest.
 */
function isAborted(signal: AbortSignal | undefined): boolean {
  return signal !== undefined && signal.aborted;
}

function finiteOr(value: unknown, fallbackValue: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallbackValue;
}

function nonEmptyString(value: unknown, fallbackValue: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallbackValue;
}

/**
 * Coerces untrusted input into the parameter shape.
 *
 * Applied on both sides of the server-function boundary: the client sends
 * validated data, and the handler re-validates because a server function is a
 * public HTTP endpoint and cannot trust its caller.
 */
export function normalizeDirectiveParams(input: unknown): MitigationDirectiveParams {
  const raw = (input !== null && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    mineName: nonEmptyString(raw["mineName"], "Unspecified mine"),
    depthMeters: Math.max(0, Math.round(finiteOr(raw["depthMeters"], 0))),
    targetTonnes: Math.max(0, Math.round(finiteOr(raw["targetTonnes"], 0))),
    predictedTonnes: Math.max(0, Math.round(finiteOr(raw["predictedTonnes"], 0))),
    hoistDowntimeHours: Math.min(48, Math.max(0, finiteOr(raw["hoistDowntimeHours"], 0))),
    rainfallMm: Math.min(150, Math.max(0, finiteOr(raw["rainfallMm"], 0))),
  };
}

/** The user prompt, exactly as specified in the brief. */
export function buildUserPrompt(params: MitigationDirectiveParams): string {
  return (
    `Mine: ${params.mineName}, Depth: ${params.depthMeters}m. ` +
    `Target: ${params.targetTonnes}T, Predicted: ${params.predictedTonnes}T. ` +
    `Constraints: ${params.hoistDowntimeHours} hrs hoist downtime, ${params.rainfallMm} mm rain. ` +
    `Write a strict 2-sentence operational mitigation directive focusing on equipment redeployment ` +
    `or blast scheduling. Do not use pleasantries.`
  );
}

type ChatCompletionPayload = {
  choices?: Array<{
    message?: { content?: unknown } | null;
    finish_reason?: unknown;
  } | null> | null;
  model?: unknown;
  error?: { message?: unknown } | null;
};

/**
 * Keeps only complete sentences. A completion cut off by the token cap would
 * otherwise render as a half-instruction ("Due to the scheduled 12-hour ho"),
 * which is worse than the deterministic fallback.
 */
function completeSentencesOnly(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  return sentences
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .join(" ");
}

type AttemptOutcome =
  | { kind: "ok"; directive: MitigationDirective }
  | { kind: "model-missing" }
  | { kind: "failed"; directive: MitigationDirective };

async function attemptModel(
  model: string,
  apiKey: string,
  params: MitigationDirectiveParams,
  transport: "server" | "client",
  signal: AbortSignal,
): Promise<AttemptOutcome> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: GROQ_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(params) },
      ],
      // Low temperature: this is an operational instruction, not prose.
      temperature: 0.3,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      stream: false,
      ...reasoningParams(model),
    }),
  });

  // 404 is how Groq reports a retired or non-enabled model: try the next one.
  if (response.status === 404) return { kind: "model-missing" };

  if (!response.ok) {
    return {
      kind: "failed",
      directive: fallback(response.status === 429 ? "rate-limited" : "http-error", transport),
    };
  }

  const payload = (await response.json()) as ChatCompletionPayload;
  const choice = payload.choices?.[0];
  const content = choice?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    return { kind: "failed", directive: fallback("malformed-response", transport) };
  }

  let text = normaliseTypography(content);
  if (choice?.finish_reason === "length") {
    text = completeSentencesOnly(text);
    if (text.length === 0) {
      return { kind: "failed", directive: fallback("malformed-response", transport) };
    }
  }

  return {
    kind: "ok",
    directive: {
      text,
      source: "groq",
      model: typeof payload.model === "string" ? payload.model : model,
      transport,
    },
  };
}

/**
 * Groq round trip with model fallthrough. Shared by both transports so they
 * cannot drift. Resolves to a fallback on every failure rather than throwing.
 */
async function requestCompletion(
  apiKey: string,
  params: MitigationDirectiveParams,
  transport: "server" | "client",
  externalSignal?: AbortSignal | undefined,
): Promise<MitigationDirective> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort("external");

  if (externalSignal !== undefined) {
    if (externalSignal.aborted) {
      clearTimeout(timeout);
      return fallback("aborted", transport);
    }
    externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    for (const model of GROQ_MODEL_CANDIDATES) {
      const outcome = await attemptModel(model, apiKey, params, transport, controller.signal);
      if (outcome.kind === "ok" || outcome.kind === "failed") return outcome.directive;
    }
    return fallback("model-unavailable", transport);
  } catch (error) {
    if (isAborted(externalSignal)) return fallback("aborted", transport);
    const isAbort = error instanceof Error && error.name === "AbortError";
    return fallback(isAbort ? "timeout" : "network", transport);
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }
}

/**
 * Server-side key lookup.
 *
 * Read lazily inside the handler rather than at module scope so the value is
 * never captured into a bundle, and so a deployment can rotate the key without a
 * rebuild. `process` is guarded because it is absent in a Workers runtime.
 */
function serverApiKey(): string {
  const candidate = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process;
  const value = candidate?.env?.["GROQ_API_KEY"];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Server-only Groq call. The key stays on the server; only the directive text
 * crosses back to the browser.
 */
const generateDirectiveOnServer = createServerFn({ method: "POST" })
  .validator(normalizeDirectiveParams)
  .handler(async ({ data }): Promise<MitigationDirective> => {
    const apiKey = serverApiKey();
    if (apiKey === "") return fallback("missing-key", "server");
    return requestCompletion(apiKey, data, "server");
  });

export type GenerateDirectiveOptions = {
  signal?: AbortSignal | undefined;
};

/**
 * Produces a two-sentence mitigation directive for the current scenario.
 *
 * Never rejects. Returns the deterministic fallback directive when Groq is
 * unconfigured, unreachable, throttled or slow, so the caller needs no
 * try/catch to stay safe.
 */
export async function generateMitigationDirective(
  params: MitigationDirectiveParams,
  options: GenerateDirectiveOptions = {},
): Promise<MitigationDirective> {
  const normalized = normalizeDirectiveParams(params);
  const { signal } = options;

  if (isAborted(signal)) return fallback("aborted", "none");

  // Opt-in direct browser call. Only reachable when the operator has explicitly
  // accepted that the key is public.
  if (env.groq.allowClientKey && env.groq.publicApiKey !== "") {
    return requestCompletion(env.groq.publicApiKey, normalized, "client", signal);
  }

  try {
    const result = await generateDirectiveOnServer({ data: normalized });
    if (isAborted(signal)) return fallback("aborted", "server");
    return result;
  } catch {
    // The server function itself failed to reach the handler: offline, a 500,
    // or a rejected CSRF check.
    return fallback("network", "server");
  }
}

/** True when the key would be shipped to the browser. Drives a UI warning. */
export function isUsingClientSideKey(): boolean {
  return env.groq.allowClientKey && env.groq.publicApiKey !== "";
}
