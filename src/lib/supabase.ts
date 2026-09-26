/**
 * Supabase client.
 *
 * The project has to run with no backend configured at all, so this module never
 * throws on a missing or malformed config. When credentials are absent it exports
 * a stub whose query builders resolve to a normal Supabase-shaped error result
 * (`{ data: null, error }`) instead of rejecting. Callers therefore take the same
 * code path for "not configured" and "query failed", and neither one can produce
 * an unhandled rejection.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

export const SUPABASE_NOT_CONFIGURED = "supabase-not-configured";

/** True when both a valid HTTPS URL and an anon key are present. */
export const isSupabaseConfigured: boolean = env.supabase.url !== "" && env.supabase.anonKey !== "";

type QueryResult<T> = { data: T | null; error: { message: string; code: string } | null };

const notConfiguredError = {
  message: "Supabase is not configured.",
  code: SUPABASE_NOT_CONFIGURED,
};

/**
 * Minimal stand-in for the fragment of the client this app uses.
 *
 * `select()` is awaitable and also exposes the chainable methods we rely on, so
 * `from(...).select('*').order(...)` behaves identically to the real builder
 * right up to the point where it resolves to an error.
 */
function createDummyClient(): SupabaseClient {
  const result: QueryResult<never[]> = { data: null, error: notConfiguredError };

  const builder = {
    then: <TResult>(onfulfilled: (value: QueryResult<never[]>) => TResult | PromiseLike<TResult>) =>
      Promise.resolve(result).then(onfulfilled),
    catch: () => builder,
    finally: (onfinally: () => void) => {
      onfinally();
      return builder;
    },
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    single: () => builder,
    maybeSingle: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
  };

  const stub = {
    from: () => builder,
    // Present so a caller probing for realtime/auth does not hit `undefined`.
    channel: () => ({
      on: () => stub.channel(),
      subscribe: () => ({ unsubscribe: () => undefined }),
    }),
    removeAllChannels: () => Promise.resolve([]),
  };

  // The stub intentionally implements only the surface this app touches; the
  // cast keeps call sites honestly typed against the real client.
  return stub as unknown as SupabaseClient;
}

function createRealClient(): SupabaseClient {
  return createClient(env.supabase.url, env.supabase.anonKey, {
    auth: {
      // No login flow in this app: skip session persistence so the client is
      // safe to construct during SSR, where window/localStorage do not exist.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-application-name": "moil-reserve-intelligence" },
    },
  });
}

/**
 * Real client when configured, stub otherwise. Always defined — importing this
 * module can never crash the app.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createRealClient()
  : createDummyClient();

/** True when an error came from the stub rather than a real round trip. */
export function isNotConfiguredError(error: { code?: string } | null | undefined): boolean {
  return error?.code === SUPABASE_NOT_CONFIGURED;
}
