# san-mcp-apps

MCP App widgets for Santiment. Each widget is a self-contained bundle served as an MCP UI resource.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the harness simulates Claude.ai host and sends mock data to the widget via postMessage.

## Build

```bash
npm run build
```

Output goes to `dist/`. Each widget is bundled separately:
- `dist/widgets/social-trends.html` + assets

## Architecture

- `src/widgets/<name>/` — widget entry points (receive data via MCP postMessage protocol)
- `src/harness/` — dev harness (simulates Claude.ai host, not included in production widgets)
- `src/lib/mcp-protocol.ts` — shared MCP App UI protocol helpers

## Deploying to sanbase2

Set `MCP_APPS_BASE_URL` to the deployed URL. Each MCP tool's `meta/0` returns an HTML stub pointing to the widget assets.
