import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
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
  plugins: [
    TanStackRouterVite(),
    devtools(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    netlify(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
