# san-mcp-apps

Interactive UI widgets for Santiment's MCP server, rendered inside MCP-enabled hosts (Claude, etc.) per the [MCP Apps spec](https://modelcontextprotocol.io/extensions/apps/overview).

Each widget is a self-contained bundle served as an MCP UI resource (`text/html;profile=mcp-app`). The MCP server (Elixir, `sanbase2`) returns a `_meta.ui.resourceUri` from its tool — the host fetches the resource, renders it in a sandboxed iframe, and pushes tool results to it via postMessage.

## Repository layout

```
src/
  widgets/
    social-trends/
      App.svelte       — UI component
      StoryCard.svelte
      contract.ts      — shape of data exchanged with the server (single source of truth)
      main.ts          — Svelte mount entry
  harness/
    Harness.svelte     — simulates an MCP host for local dev
    mock-data.ts
widgets/
  social-trends.html   — entry HTML, bundled by Vite
```

## Development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. The harness is a fake MCP host: it answers `ui/initialize`, then pushes `ui/notifications/tool-input` + `ui/notifications/tool-result` to the widget — same shape Claude sends.

## Build

```bash
pnpm build
```

Output: `dist/`. Each entry produces hashed asset filenames so the browser cache cannot serve stale code after deploy.

```
dist/
  widgets/social-trends.html              — entry HTML with hashed asset references
  social-trends/main-<hash>.js            — entry script
  chunks/bundle-mjs-<hash>.js             — shared chunk
  assets/bundle-mjs-<hash>.css            — styles
  assets/ProximaNova-*.woff2              — fonts
```

`dist/widgets/social-trends.html` is the **canonical artifact** — the Elixir server should read this file verbatim and return it as the `resources/read` body. Do not hand-construct the HTML on the server.

## Deployment

Host `dist/` as plain static files on any HTTPS endpoint (S3+CloudFront, GCS, Vercel, nginx, …). Requirements:

- **HTTPS** with a valid certificate
- Correct MIME types: `application/javascript` for `.js`, `text/css` for `.css`
- `Cache-Control: public, max-age=31536000, immutable` for hashed assets (under `social-trends/`, `chunks/`, `assets/`)
- `Cache-Control: no-cache` for `widgets/social-trends.html`
- CORS headers are **not** required — all data flows through MCP's postMessage transport

## Contract with the Elixir server

The widget and the server agree on **two** things:

### 1. Data shape (`structuredContent` of tool result)

See [`src/widgets/social-trends/contract.ts`](src/widgets/social-trends/contract.ts) — `TrendingStoriesData`. Any change here must be mirrored in `lib/sanbase/mcp/trending_stories_tool.ex` (and, ideally, the tool's `output_schema` callback).

### 2. Resource HTML wiring (server side)

The Elixir resource module (`lib/sanbase/mcp/social_trends_ui.ex`) must:

1. Return the canonical bundled HTML in `Response.text(...)`. Read `dist/widgets/social-trends.html` verbatim or fetch it from the deployed URL — do not hand-construct.
2. Declare CSP allowlist in `_meta.ui.csp.resourceDomains` (and `connectDomains` if the widget ever does `fetch`). Without this, the default CSP (`default-src 'none'; script-src 'self' 'unsafe-inline'`) blocks **all** asset loading from the deployment domain.
3. Set `prefersBorder: true` (or `false`, but explicit) in `_meta.ui` so hosts render a consistent boundary.

Minimal Elixir snippet:

```elixir
_meta = %{
  "ui" => %{
    "csp" => %{"resourceDomains" => [base_url]},
    "prefersBorder" => true
  }
}
```

## Testing in a real Claude

The harness fakes Claude well enough for UI iteration, but the real host applies origin rewriting and strict CSP. Always do a final check against actual Claude:

```bash
# 1. Run sanbase2 (Phoenix) locally on :4000 with the MCP endpoint exposed
cd ../sanbase2 && ./dev_tunnel.sh

# 2. Add the tunnel URL as a custom connector in Claude
#    (Settings → Connectors → Add custom connector)

# 3. Invoke the tool from a chat: "Show me the trending stories"
```

If the widget loads but assets 404 → CSP is missing the deployment domain.
If the widget loads but data never arrives → server returns `content` only, not `structuredContent`.
If `sendMessage` from the widget does nothing → Claude declined; check the host log.

## Why not bundle into a single file

Official ext-apps templates use `vite-plugin-singlefile` and ship the entire HTML+JS+CSS as one inline bundle. We deliberately keep external assets to:

- decouple UI deploys from Elixir releases
- enable CDN edge caching
- iterate on widgets in this repo independently

This costs us one extra mandatory step: the `_meta.ui.csp.resourceDomains` declaration on the server side. Without it, nothing loads.
