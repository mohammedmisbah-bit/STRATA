/**
 * Keyless localisation via the MyMemory Translation API.
 *
 * No API key, no signup. In exchange the anonymous tier is small (roughly 5k
 * characters per IP per day) and it fails in an awkward way: a quota breach
 * still returns HTTP 200, with the warning text sitting in the
 * `responseData.translatedText` field where the translation should be. Render
 * that blindly and the UI shows "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE
 * TRANSLATIONS FOR TODAY" as a risk alert title.
 *
 * So this module treats translation as strictly best-effort:
 *   - nothing throws; every failure path returns the original English text
 *   - warning-shaped payloads are rejected, not displayed
 *   - results are cached in memory and in sessionStorage, because the quota is
 *     small enough that an uncached re-render loop would exhaust it
 *   - identical concurrent requests share one in-flight promise
 *
 * Configured via `.env`: VITE_TRANSLATION_ENABLED (kill switch),
 * VITE_MYMEMORY_CONTACT_EMAIL (quota uplift), VITE_MYMEMORY_BASE_URL.
 */

import { env } from "@/lib/env";

export const SUPPORTED_LANGUAGES = ["en", "hi", "mr"] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_META: Record<
  LanguageCode,
  { code: LanguageCode; short: string; endonym: string; label: string }
> = {
  en: { code: "en", short: "EN", endonym: "English", label: "English" },
  hi: { code: "hi", short: "HI", endonym: "हिन्दी", label: "Hindi" },
  mr: { code: "mr", short: "MR", endonym: "मराठी", label: "Marathi" },
};

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** MyMemory rejects `q` longer than this. */
const MAX_QUERY_LENGTH = 500;

const REQUEST_TIMEOUT_MS = 8_000;

/** Concurrent requests when translating a batch. Deliberately gentle. */
const BATCH_CONCURRENCY = 3;

const SESSION_CACHE_KEY = "moil.translations.v1";

export type TranslationFailureReason =
  | "empty-input"
  | "too-long"
  | "network"
  | "timeout"
  | "http-error"
  | "rate-limited"
  | "malformed-response"
  | "aborted"
  /** VITE_TRANSLATION_ENABLED is false — no request was attempted. */
  | "disabled";

export type TranslationOutcome = {
  /** Always safe to render: the translation, or the original text on failure. */
  text: string;
  /** False when `text` is the untranslated source. */
  translated: boolean;
  reason?: TranslationFailureReason;
};

/** Persists for the session so a reload does not re-spend the daily quota. */
const memoryCache = new Map<string, string>();
const inFlight = new Map<string, Promise<TranslationOutcome>>();

let sessionCacheLoaded = false;

function cacheKey(text: string, targetLang: LanguageCode): string {
  return `${targetLang}\u0000${text}`;
}

function loadSessionCache(): void {
  if (sessionCacheLoaded || typeof window === "undefined") return;
  sessionCacheLoaded = true;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (raw === null) return;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return;
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.length > 0) memoryCache.set(key, value);
    }
  } catch {
    // Corrupt or unavailable storage is not worth surfacing.
  }
}

function persistSessionCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify(Object.fromEntries(memoryCache)),
    );
  } catch {
    // Quota or private-mode failure; the in-memory cache still works.
  }
}

/**
 * Phrases MyMemory returns in the translation slot instead of a translation.
 * Matching any of these means the call did not actually succeed.
 */
const WARNING_PATTERNS = [
  /MYMEMORY WARNING/i,
  /YOU USED ALL AVAILABLE FREE TRANSLATIONS/i,
  /QUERY LENGTH LIMIT EXCEEDED/i,
  /LIMIT EXCEEDED/i,
  /INVALID LANGUAGE PAIR/i,
  /PLEASE SELECT TWO DISTINCT LANGUAGES/i,
  /NO QUERY SPECIFIED/i,
  /IS AN INVALID/i,
];

function looksLikeWarning(text: string): boolean {
  return WARNING_PATTERNS.some((pattern) => pattern.test(text));
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#34;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** MyMemory HTML-escapes its output; undo that before rendering as text. */
function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#34|#39);/g, (match) => HTML_ENTITIES[match] ?? match)
    .replace(/&#(\d+);/g, (_match, code: string) => {
      const point = Number.parseInt(code, 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : _match;
    });
}

type MyMemoryPayload = {
  responseData?: { translatedText?: unknown } | null;
  responseStatus?: unknown;
  responseDetails?: unknown;
};

function readStatus(payload: MyMemoryPayload): number | null {
  const { responseStatus } = payload;
  if (typeof responseStatus === "number") return responseStatus;
  if (typeof responseStatus === "string") {
    const parsed = Number.parseInt(responseStatus, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Single-string translation with full outcome detail.
 *
 * `en` short-circuits without a network call — the source copy is already
 * English, and asking MyMemory for en→en is both wasteful and an error.
 */
export async function translateTextDetailed(
  text: string,
  targetLang: LanguageCode,
  options: { signal?: AbortSignal | undefined } = {},
): Promise<TranslationOutcome> {
  const source = text.trim();

  if (source.length === 0) return { text, translated: false, reason: "empty-input" };
  if (targetLang === "en") return { text, translated: true };
  if (!env.translation.enabled) return { text, translated: false, reason: "disabled" };
  if (source.length > MAX_QUERY_LENGTH) {
    return { text, translated: false, reason: "too-long" };
  }

  loadSessionCache();
  const key = cacheKey(source, targetLang);

  const cached = memoryCache.get(key);
  if (cached !== undefined) return { text: cached, translated: true };

  const pending = inFlight.get(key);
  if (pending !== undefined) return pending;

  const request = performRequest(source, targetLang, text, options.signal).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, request);
  return request;
}

async function performRequest(
  source: string,
  targetLang: LanguageCode,
  original: string,
  externalSignal: AbortSignal | undefined,
): Promise<TranslationOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

  const forwardAbort = () => controller.abort("external");
  if (externalSignal !== undefined) {
    if (externalSignal.aborted) {
      clearTimeout(timeout);
      return { text: original, translated: false, reason: "aborted" };
    }
    externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  const params = new URLSearchParams({ q: source, langpair: `en|${targetLang}` });
  // `de` is MyMemory's optional contact address. Supplying one raises the
  // anonymous daily allowance; omitting it keeps the request fully anonymous.
  if (env.translation.contactEmail !== "") {
    params.set("de", env.translation.contactEmail);
  }
  const url = `${env.translation.baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      // 429 is the documented throttle; treat any 4xx/5xx as non-fatal.
      return {
        text: original,
        translated: false,
        reason: response.status === 429 ? "rate-limited" : "http-error",
      };
    }

    const payload = (await response.json()) as MyMemoryPayload;
    const raw = payload.responseData?.translatedText;

    if (typeof raw !== "string" || raw.trim().length === 0) {
      return { text: original, translated: false, reason: "malformed-response" };
    }

    const status = readStatus(payload);
    const details = typeof payload.responseDetails === "string" ? payload.responseDetails : "";

    if ((status !== null && status !== 200) || looksLikeWarning(raw) || looksLikeWarning(details)) {
      return { text: original, translated: false, reason: "rate-limited" };
    }

    const translated = decodeEntities(raw).trim();

    // A no-op echo is not worth caching as a success.
    if (translated.length === 0) {
      return { text: original, translated: false, reason: "malformed-response" };
    }

    memoryCache.set(cacheKey(source, targetLang), translated);
    persistSessionCache();

    return { text: translated, translated: true };
  } catch (error) {
    if (externalSignal?.aborted === true) {
      return { text: original, translated: false, reason: "aborted" };
    }
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      text: original,
      translated: false,
      reason: isAbort ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }
}

/**
 * The primary entry point.
 *
 * Resolves to the translated string, or to `text` unchanged if the API is rate
 * limited, offline, slow or malformed. Never rejects, so callers do not need a
 * try/catch to stay safe.
 */
export async function translateText(text: string, targetLang: LanguageCode): Promise<string> {
  const outcome = await translateTextDetailed(text, targetLang);
  return outcome.text;
}

export type BatchTranslation = {
  /** source text -> best available rendering */
  entries: Record<string, string>;
  /** True when at least one string came back translated. */
  anyTranslated: boolean;
  /** True when at least one string fell back to English. */
  anyFallback: boolean;
  /** Set when a fallback was caused by quota exhaustion or throttling. */
  rateLimited: boolean;
};

async function runPool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        const item = items[index];
        if (item === undefined) continue;
        await worker(item, index);
      }
    }),
  );
}

/**
 * Translates a set of strings with bounded concurrency, de-duplicating repeats.
 * Every source string is present in `entries`, translated or not.
 */
export async function translateBatch(
  texts: readonly string[],
  targetLang: LanguageCode,
  options: { signal?: AbortSignal | undefined } = {},
): Promise<BatchTranslation> {
  const unique = [...new Set(texts.filter((text) => text.trim().length > 0))];
  const entries: Record<string, string> = {};
  for (const text of texts) entries[text] = text;

  if (targetLang === "en" || unique.length === 0 || !env.translation.enabled) {
    return {
      entries,
      anyTranslated: targetLang === "en",
      anyFallback: targetLang !== "en" && unique.length > 0 && !env.translation.enabled,
      rateLimited: false,
    };
  }

  let anyTranslated = false;
  let anyFallback = false;
  let rateLimited = false;

  await runPool(unique, BATCH_CONCURRENCY, async (text) => {
    const outcome = await translateTextDetailed(text, targetLang, options);
    entries[text] = outcome.text;
    if (outcome.translated) {
      anyTranslated = true;
    } else {
      anyFallback = true;
      if (outcome.reason === "rate-limited") rateLimited = true;
    }
  });

  return { entries, anyTranslated, anyFallback, rateLimited };
}

/** Test/debug helper. Clears both cache tiers. */
export function clearTranslationCache(): void {
  memoryCache.clear();
  inFlight.clear();
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // ignored
  }
}
