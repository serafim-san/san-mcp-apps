<script lang="ts">
  import Button from "san-webkit-next/ui/core/Button";
  import { MOCK_DATA } from "./mock-data";
  import type { TrendingStoriesData } from "../widgets/social-trends/contract";

  let iframeEl = $state<HTMLIFrameElement>();
  let widgetUrl = $state("/widgets/social-trends.html");
  let iframeHeight = $state(0);

  function postToWidget(method: string, params: object) {
    iframeEl?.contentWindow?.postMessage({ jsonrpc: "2.0", method, params }, "*");
  }

  function deliverToolResult(data: TrendingStoriesData) {
    // Real Claude sends tool-input first, then tool-result.
    postToWidget("ui/notifications/tool-input", { arguments: { time_period: data.time_period } });
    postToWidget("ui/notifications/tool-result", {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: data,
      isError: false,
    });
  }

  window.addEventListener("message", (e) => {
    const msg = e.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.method === "ui/initialize" && msg.id != null) {
      iframeEl?.contentWindow?.postMessage(
        {
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            protocolVersion: "2026-01-26",
            hostCapabilities: {},
            hostInfo: { name: "san-mcp-apps-harness", version: "0.0.0" },
            hostContext: {},
          },
        },
        "*",
      );
    }

    if (msg.method === "ui/notifications/initialized") {
      deliverToolResult(MOCK_DATA);
    }

    if (msg.method === "ui/notifications/size-changed" && msg.params?.height) {
      iframeHeight = msg.params.height;
    }

    if (msg.method === "ui/message" && msg.id != null) {
      // Acknowledge sendMessage from widget so its promise resolves.
      iframeEl?.contentWindow?.postMessage(
        { jsonrpc: "2.0", id: msg.id, result: {} },
        "*",
      );
      console.info("[harness] widget sent message:", msg.params);
    }
  });
</script>

<div class="night-mode flex h-screen bg-white overflow-hidden">
  <aside
    class="w-64 shrink-0 p-5 bg-athens border-r border-porcelain flex flex-col gap-3"
  >
    <h2 class="text-base font-semibold text-rhino">MCP App Harness</h2>
    <p class="text-xs text-waterloo leading-relaxed">
      Simulates Claude.ai host. Widget receives data via postMessage.
    </p>

    <Button
      variant="fill"
      class="w-full justify-start focus:outline-none"
      onclick={() => deliverToolResult(MOCK_DATA)}
    >
      ↺ Resend mock data
    </Button>

    <Button
      variant="border"
      class="w-full justify-start text-rhino focus:outline-none"
      onclick={() => deliverToolResult({ ...MOCK_DATA, trending_stories: [] })}
    >
      Send empty data
    </Button>

    <label class="flex flex-col gap-1 text-xs text-waterloo">
      Widget URL
      <input
        bind:value={widgetUrl}
        class="px-2 py-1.5 bg-white border border-porcelain rounded text-xs text-rhino focus:outline-none focus:border-green"
      />
    </label>
  </aside>

  <main class="flex-1 flex items-center justify-center bg-athens overflow-auto">
    <div
      class="w-[700px] border border-porcelain rounded-lg overflow-hidden shadow-sm"
    >
      <iframe
        bind:this={iframeEl}
        src={widgetUrl}
        title="Widget preview"
        sandbox="allow-scripts allow-same-origin"
        class="w-full border-none block"
        style:height="{iframeHeight}px"
        style:visibility={iframeHeight ? "visible" : "hidden"}
      ></iframe>
    </div>
  </main>
</div>
