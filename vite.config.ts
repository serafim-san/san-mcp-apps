import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  plugins: [svelte()],

  // Absolute base URL for production builds so the MCP server can serve the
  // bundled HTML as-is — no path rewriting on the backend.
  // Leave empty/relative for dev (harness runs same-origin).
  base: process.env.PUBLIC_BASE_URL ?? "/",

  define: {
    "process.env.BACKEND_URL": JSON.stringify(
      process.env.BACKEND_URL || "https://api-stage.santiment.net",
    ),
    "process.env.GQL_SERVER_URL": JSON.stringify(
      process.env.GQL_SERVER_URL || "https://api-stage.santiment.net/graphql",
    ),
    "process.env.IS_DEV_MODE": true,
    "process.env.IS_PROD_MODE": false,
  },

  build: {
    rollupOptions: {
      input: {
        harness: resolve(__dirname, "index.html"),
        "social-trends": resolve(__dirname, "widgets/social-trends.html"),
      },
      output: {
        entryFileNames: "[name]/main-[hash].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
