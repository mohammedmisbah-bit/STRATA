/**
 * Typed, validated access to build-time configuration.
 *
 * Two rules this module enforces:
 *
 * 1. Bracket access, not dot access. `VITE_*` keys reach `ImportMetaEnv` through
 *    an index signature, and the project sets `noPropertyAccessFromIndexSignature`,
 *    so `import.meta.env.VITE_X` is a type error while `import.meta.env["VITE_X"]`
 *    is correct. Vite still statically inlines the value either way.
 *
 * 2. Every read has a fallback. A missing or malformed `.env` degrades to the
 *    documented default rather than producing `undefined` deep inside a service.
 *
 * Only `VITE_`-prefixed values are readable here, and they are all public — Vite
 * compiles them into the client bundle verbatim. Secrets (GROQ_API_KEY,
 * SUPABASE_SERVICE_ROLE_KEY) are deliberately absent: they belong to server-side
 * code and must never transit this module.
 */

function rawEnv(): Record<string, unknown> {
  // `import.meta.env` is replaced with a static object at build time, so this is
  // safe on both the server and the client.
  const source: unknown = import.meta.env;
  return source !== null && typeof source === "object" ? (source as Record<string, unknown>) : {};
}

/**
 * Secondary source for Node-hosted SSR and CLI tooling, where `import.meta.env`
 * is absent or unpopulated. Guarded because `process` exists in neither the
 * browser nor a Workers runtime.
 */
function processEnv(): Record<string, unknown> {
  const candidate = (globalThis as { process?: { env?: unknown } }).process;
  const source = candidate?.env;
  return source !== null && typeof source === "object" ? (source as Record<string, unknown>) : {};
}

function readString(key: string, fallback = ""): string {
  for (const source of [rawEnv(), processEnv()]) {
    const value = source[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return fallback;
}

/** Accepts true/1/yes/on (and their negatives), case-insensitively. */
function readBoolean(key: string, fallback: boolean): boolean {
  const value = readString(key).toLowerCase();
  if (value === "") return fallback;
  if (["true", "1", "yes", "on"].includes(value)) return true;
  if (["false", "0", "no", "off"].includes(value)) return false;
  return fallback;
}

function readInteger(key: string, fallback: number): number {
  const parsed = Number.parseInt(readString(key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Rejects anything that is not plausibly an email so it never reaches a query string. */
function readEmail(key: string): string {
  const value = readString(key);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? value : "";
}

/** Rejects non-HTTPS and malformed URLs rather than letting fetch fail later. */
function readHttpsUrl(key: string, fallback: string): string {
  const value = readString(key);
  if (value === "") return fallback;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : fallback;
  } catch {
    return fallback;
  }
}

export const DEFAULT_MYMEMORY_BASE_URL = "https://api.mymemory.translated.net/get";
export const DEFAULT_OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

export const env = {
  translation: {
    /** Master kill switch for outbound MyMemory requests. */
    enabled: readBoolean("VITE_TRANSLATION_ENABLED", true),
    baseUrl: readHttpsUrl("VITE_MYMEMORY_BASE_URL", DEFAULT_MYMEMORY_BASE_URL),
    /** Empty string means stay anonymous. */
    contactEmail: readEmail("VITE_MYMEMORY_CONTACT_EMAIL"),
  },
  weather: {
    baseUrl: readHttpsUrl("VITE_OPEN_METEO_BASE_URL", DEFAULT_OPEN_METEO_BASE_URL),
  },
  mockData: {
    seed: readInteger("VITE_MOCK_SEED", 20260925),
    recordCount: Math.max(0, readInteger("VITE_MOCK_RECORD_COUNT", 30)),
  },
  api: {
    /** FastAPI base URL. Empty means compute locally. */
    baseUrl: readHttpsUrl("VITE_API_BASE_URL", ""),
  },
  supabase: {
    url: readHttpsUrl("VITE_SUPABASE_URL", ""),
    /** Public by design — safe to expose ONLY with RLS enabled on every table. */
    anonKey: readString("VITE_SUPABASE_ANON_KEY"),
  },
  groq: {
    /**
     * Named "public" because that is what it is: a VITE_ variable is compiled
     * into the client bundle verbatim. Only read when `allowClientKey` is on.
     * The secure path uses a server-side GROQ_API_KEY, which never appears here.
     */
    publicApiKey: readString("VITE_GROQ_API_KEY"),
    /** Must be explicitly enabled to accept browser-side key exposure. */
    allowClientKey: readBoolean("VITE_GROQ_ALLOW_CLIENT_KEY", false),
    /**
     * Primary model. Public config, not a secret. Defaults to gpt-oss-120b because
     * llama-3.3-70b-versatile was retired on free/developer tiers in August 2026.
     */
    model: readString("VITE_GROQ_MODEL", "openai/gpt-oss-120b"),
  },
} as const;

/** True once a FastAPI base URL is configured. */
export function hasBackend(): boolean {
  return env.api.baseUrl !== "";
}

/** True once both Supabase values are present. */
export function hasSupabase(): boolean {
  return env.supabase.url !== "" && env.supabase.anonKey !== "";
}
