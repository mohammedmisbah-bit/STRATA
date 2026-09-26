// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

/**
 * Server-only secrets read by TanStack Start server functions via `process.env`.
 *
 * Vite loads `.env` into `import.meta.env` for VITE_* keys only, and never copies
 * anything into `process.env`, so without this a server function running under
 * `vite dev` would see GROQ_API_KEY as undefined.
 *
 * Deliberately an allowlist, and deliberately `process.env` rather than `define`:
 * these values live in the Node process that runs SSR and server functions, and
 * are never substituted into any client bundle. Values already present in the
 * real environment (a deployment platform's secrets) always win over `.env`.
 */
const SERVER_ONLY_KEYS = ["GROQ_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

const fileEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
for (const key of SERVER_ONLY_KEYS) {
  const value = fileEnv[key];
  if (process.env[key] === undefined && value !== undefined && value !== "") {
    process.env[key] = value;
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
