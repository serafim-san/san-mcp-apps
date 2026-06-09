import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

const lib = (file: string) => resolve(__dirname, "lib", file);

export default defineConfig({
  plugins: [svelte()],

  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "static"),

  resolve: {
    alias: [
      {
        find: /^\$app\/(state|navigation)$/,
        replacement: lib("sveltekit-noop.ts"),
      },
      { find: "$app/stores", replacement: lib("sveltekit-stores.ts") },
      { find: "@sentry/sveltekit", replacement: lib("sveltekit-noop.ts") },
    ],
  },

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
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        harness: resolve(__dirname, "src/index.html"),
        "social-trends": resolve(__dirname, "src/widgets/social-trends.html"),
        chart: resolve(__dirname, "src/widgets/chart.html"),
      },
      output: {
        entryFileNames: "[name]/main-[hash].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
