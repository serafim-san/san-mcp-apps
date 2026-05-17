// MCP App UI protocol (2026-01-26)

const PROTOCOL_VERSION = "2026-01-26";
let reqId = 0;
const pending: Record<number, { resolve: Function; reject: Function }> = {};

export function send(msg: object) {
  window.parent.postMessage(msg, "*");
}

export function request(method: string, params: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++reqId;
    pending[id] = { resolve, reject };
    send({ jsonrpc: "2.0", id, method, params });
  });
}

export function onToolResult(callback: (data: any) => void) {
  window.addEventListener("message", (e) => {
    const msg = e.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.id != null && pending[msg.id]) {
      pending[msg.id].resolve(msg.result ?? msg);
      delete pending[msg.id];
      return;
    }

    if (msg.method === "ui/notifications/tool-result") {
      callback(msg.params?.structuredContent);
    }
  });
}

export async function initMcpApp() {
  await request("ui/initialize", {
    appInfo: { name: "santiment-mcp-app", version: "1.0.0" },
    appCapabilities: { availableDisplayModes: ["inline"] },
    protocolVersion: PROTOCOL_VERSION,
  });

  send({
    jsonrpc: "2.0",
    method: "ui/notifications/sandbox-proxy-ready",
    params: {},
  });
  send({ jsonrpc: "2.0", method: "ui/notifications/initialized", params: {} });
}

export function sendSizeChanged() {
  const h = document.body.scrollHeight;
  send({
    jsonrpc: "2.0",
    method: "ui/notifications/size-changed",
    params: { height: h },
  });
}
