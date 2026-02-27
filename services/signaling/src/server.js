const http = require("http");
const { routeSipRequest } = require("./signaling-router");
const { SessionStore } = require("./session-store");
const { newCorrelationId } = require("./correlation");
const { parseSipMessage } = require("./sip-parser");
const { acceptKey, decodeFrame, encodeTextFrame } = require("./websocket");

const PORT = Number(process.env.SIGNALING_PORT || 7070);
const DRAIN_TIMEOUT_MS = Number(process.env.DRAIN_TIMEOUT_MS || 15000);

const sessionStore = new SessionStore();
let draining = false;

function log(event, payload) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event, ...payload }));
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function isReady() {
  return !draining;
}

function startDrain() {
  draining = true;
  log("drain.enabled", { active_sessions: sessionStore.activeCount() });
}

function stopWhenDrained(server) {
  const started = Date.now();
  const timer = setInterval(() => {
    const active = sessionStore.activeCount();
    if (active === 0 || Date.now() - started > DRAIN_TIMEOUT_MS) {
      clearInterval(timer);
      log("drain.stop", { active_sessions: active });
      server.close(() => process.exit(0));
    }
  }, 500);
}

function processSipRequest(payload) {
  payload.correlationId = payload.correlationId || newCorrelationId();
  const result = routeSipRequest(payload, {
    sessionStore,
    isDraining: () => draining,
    log
  });
  return {
    status: result.status,
    action: result.action,
    correlation_id: payload.correlationId
  };
}

const server = http.createServer((req, res) => {
  if (req.url === "/health/liveness" && req.method === "GET") {
    return json(res, 200, { status: "ok" });
  }

  if (req.url === "/health/readiness" && req.method === "GET") {
    return json(res, isReady() ? 200 : 503, {
      status: isReady() ? "ready" : "draining",
      active_sessions: sessionStore.activeCount()
    });
  }

  if (req.url === "/admin/drain" && req.method === "POST") {
    startDrain();
    return json(res, 200, { status: "draining" });
  }

  if (req.url === "/sip" && req.method === "POST") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString("utf8");
    });
    req.on("end", () => {
      try {
        const payload = raw ? JSON.parse(raw.replace(/^\uFEFF/, "")) : {};
        const response = processSipRequest(payload);
        return json(res, response.status, response);
      } catch (err) {
        return json(res, 400, { error: "invalid_request", message: err.message });
      }
    });
    return;
  }

  return json(res, 404, { error: "not_found" });
});

server.on("upgrade", (req, socket) => {
  if (req.url !== "/sipws") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  if (draining) {
    socket.write("HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  const upgrade = String(req.headers.upgrade || "").toLowerCase();
  if (!key || upgrade !== "websocket") {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const accept = acceptKey(String(key));
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n"
  ];
  socket.write(headers.join("\r\n"));
  log("sipws.connected", { remote: req.socket.remoteAddress || "unknown" });

  let buffered = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    buffered = Buffer.concat([buffered, chunk]);
    while (true) {
      let frame;
      try {
        frame = decodeFrame(buffered);
      } catch (err) {
        socket.write(encodeTextFrame(JSON.stringify({ error: "bad_frame", message: err.message })));
        socket.destroy();
        return;
      }
      if (!frame) break;
      buffered = buffered.subarray(frame.consumed);

      if (frame.opcode === 0x8) {
        socket.end();
        return;
      }

      if (frame.opcode !== 0x1) continue;
      try {
        const sip = parseSipMessage(frame.payload.toString("utf8"));
        const response = processSipRequest(sip);
        socket.write(encodeTextFrame(JSON.stringify(response)));
      } catch (err) {
        socket.write(encodeTextFrame(JSON.stringify({ error: "invalid_sip", message: err.message })));
      }
    }
  });
});

process.on("SIGTERM", () => {
  startDrain();
  stopWhenDrained(server);
});

process.on("SIGINT", () => {
  startDrain();
  stopWhenDrained(server);
});

server.listen(PORT, () => {
  log("server.started", { port: PORT });
});

module.exports = { isReady, startDrain, sessionStore, processSipRequest };
