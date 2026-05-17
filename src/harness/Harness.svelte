<script lang="ts">
  import Button from "san-webkit-next/ui/core/Button";
  import { MOCK_DATA } from "./mock-data";

  let iframeEl = $state<HTMLIFrameElement>();
  let widgetUrl = $state("/widgets/social-trends.html");
  let iframeHeight = $state(0);

  function sendToolResult(data: object) {
    iframeEl?.contentWindow?.postMessage(
      {
        jsonrpc: "2.0",
        method: "ui/notifications/tool-result",
        params: { structuredContent: data },
      },
      "*",
    );
  }

  window.addEventListener("message", (e) => {
    const msg = e.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.method === "ui/initialize" && msg.id != null) {
      iframeEl?.contentWindow?.postMessage(
        {
          jsonrpc: "2.0",
          id: msg.id,
          result: { protocolVersion: "2026-01-26", hostCapabilities: {} },
        },
        "*",
      );
    }

    if (msg.method === "ui/notifications/initialized") {
      sendToolResult(MOCK_DATA);
    }

    if (msg.method === "ui/notifications/size-changed" && msg.params?.height) {
      iframeHeight = msg.params.height;
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
      onclick={() => sendToolResult(MOCK_DATA)}
    >
      ↺ Resend mock data
    </Button>

    <Button
      variant="border"
      class="w-full justify-start text-rhino focus:outline-none"
      onclick={() => sendToolResult({ ...MOCK_DATA, trending_stories: [] })}
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
