import express from "express";
import { WebSocketServer } from "ws";
import { handleCallRequest } from "./callflow-engine.js";

const app = express();
app.use(express.json());
const WS_OPEN = 1;

const ASSIGNMENT_URL = process.env.ASSIGNMENT_URL || "http://localhost:4003/assign";
const CONTEXT_URL = process.env.CONTEXT_URL || "http://localhost:4004/sessions";
const SIP_GATEWAY_DIAL_URL = process.env.SIP_GATEWAY_DIAL_URL || "http://localhost:4002/sip/dial";

const server = app.listen(4001, () => {
  console.log("Signaling server running on 4001");
});

const wss = new WebSocketServer({ server });
const roleConnections = new Map();
const recentEvents = [];
const sessionMeta = new Map();

function logEvent(type, data = {}) {
  const entry = { ts: new Date().toISOString(), type, ...data };
  recentEvents.push(entry);
  if (recentEvents.length > 100) recentEvents.shift();
  console.log(`[signaling] ${type}`, data);
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  logEvent("broadcast", { eventType: payload?.type, clients: wss.clients.size });
  for (const client of wss.clients) {
    if (client.readyState === WS_OPEN) client.send(msg);
  }
}

function emitToRole(role, payload) {
  const connections = roleConnections.get(role) || new Set();
  const msg = JSON.stringify(payload);
  logEvent("emit_to_role", { role, eventType: payload?.type, connections: connections.size });
  for (const ws of connections) {
    if (ws.readyState === WS_OPEN) ws.send(msg);
  }
}

async function assignInterpreter(payload) {
  try {
    const response = await fetch(ASSIGNMENT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    return response.json();
  } catch (err) {
    logEvent("assign_interpreter_failed", { message: err?.message || String(err) });
    return null;
  }
}

async function storeSession(sessionId, session) {
  try {
    await fetch(`${CONTEXT_URL}/${sessionId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(session)
    });
  } catch (err) {
    logEvent("store_session_failed", { sessionId, message: err?.message || String(err) });
  }
}

async function dialSipAddress(sessionId, from, to) {
  if (!to) return;
  try {
    const response = await fetch(SIP_GATEWAY_DIAL_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, from, to })
    });
    const result = response.ok ? await response.json() : { status: "failed" };
    logEvent("sip_dial_requested", { sessionId, from, to, status: result?.status || "unknown" });
    emitToRole("deaf-user", {
      type: "sip-dial-status",
      sessionId,
      to,
      status: result?.status || "unknown"
    });
  } catch (err) {
    logEvent("sip_dial_failed", { sessionId, to, message: err?.message || String(err) });
    emitToRole("deaf-user", { type: "sip-dial-status", sessionId, to, status: "failed" });
  }
}

wss.on("connection", (ws) => {
  logEvent("ws_connected", { totalClients: wss.clients.size + 1 });

  ws.on("message", async (msg) => {
    const text = msg.toString();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { type: "raw", payload: text };
    }

    if (payload.type === "join") {
      const role = payload.role || "deaf-user";
      if (!roleConnections.has(role)) roleConnections.set(role, new Set());
      roleConnections.get(role).add(ws);
      logEvent("join", { role, connections: roleConnections.get(role).size });
      ws.send(JSON.stringify({ type: "joined", role }));
      return;
    }

    if (payload.type === "call-request") {
      logEvent("call_request_received", { caller: payload.caller || "deaf-user", target: payload.target || "interpreter-queue" });
      try {
        const result = await handleCallRequest(payload, {
          assignInterpreter,
          storeSession,
          emitToRole,
          emitAll: broadcast
        });
        sessionMeta.set(result.sessionId, { sipAddress: result.sipAddress || null });
        if (result?.sipAddress) {
          void dialSipAddress(result.sessionId, result.caller || "deaf-user", result.sipAddress);
        }
        logEvent("call_request_processed", { sessionId: result.sessionId, status: result.status });
        ws.send(JSON.stringify({ type: "call-request-ack", sessionId: result.sessionId, status: result.status }));
      } catch (err) {
        logEvent("call_request_failed", { message: err?.message || String(err) });
        ws.send(JSON.stringify({ type: "call-request-ack", status: "failed" }));
      }
      return;
    }

    if (payload.type === "call-accept") {
      const sessionId = payload.sessionId;
      const acceptedBy = payload.acceptedBy || "interpreter";
      const sipAddress = sessionMeta.get(sessionId)?.sipAddress || null;
      logEvent("call_accept_received", { sessionId, acceptedBy });
      emitToRole("deaf-user", { type: "call-accepted", sessionId, acceptedBy, sipAddress });
      emitToRole("interpreter", { type: "call-accepted", sessionId, acceptedBy });
      broadcast({ type: "session-updated", sessionId, status: "relay_active" });
      return;
    }

    if (payload.type === "call-end") {
      const sessionId = payload.sessionId;
      const endedBy = payload.endedBy || "unknown";
      logEvent("call_end_received", { sessionId, endedBy });
      emitToRole("deaf-user", { type: "call-ended", sessionId, endedBy });
      emitToRole("interpreter", { type: "call-ended", sessionId, endedBy });
      broadcast({ type: "session-updated", sessionId, status: "call_ended" });
      sessionMeta.delete(sessionId);
      return;
    }

    if (payload.type === "chat-message") {
      const sessionId = payload.sessionId;
      const fromRole = payload.fromRole || "deaf-user";
      const targetRole = payload.targetRole || (fromRole === "deaf-user" ? "interpreter" : "deaf-user");
      const text = typeof payload.text === "string" ? payload.text.trim() : "";
      if (!sessionId || !text) return;

      const chatPayload = {
        type: "chat-message",
        sessionId,
        fromRole,
        targetRole,
        text: text.slice(0, 500),
        sentAt: new Date().toISOString()
      };

      logEvent("chat_message_forward", { sessionId, fromRole, targetRole });
      emitToRole(fromRole, chatPayload);
      emitToRole(targetRole, chatPayload);
      return;
    }

    if (payload.type === "chat-typing") {
      const sessionId = payload.sessionId;
      const fromRole = payload.fromRole || "deaf-user";
      const targetRole = payload.targetRole || (fromRole === "deaf-user" ? "interpreter" : "deaf-user");
      const isTyping = Boolean(payload.isTyping);
      if (!sessionId) return;

      const typingPayload = {
        type: "chat-typing",
        sessionId,
        fromRole,
        targetRole,
        isTyping,
        sentAt: new Date().toISOString()
      };

      logEvent("chat_typing_forward", { sessionId, fromRole, targetRole });
      emitToRole(targetRole, typingPayload);
      return;
    }

    if (payload.type === "rtt-update") {
      const sessionId = payload.sessionId;
      const fromRole = payload.fromRole || "deaf-user";
      const targetRole = payload.targetRole || (fromRole === "deaf-user" ? "interpreter" : "deaf-user");
      const text = typeof payload.text === "string" ? payload.text : "";
      const seq = Number.isInteger(payload.seq) ? payload.seq : 0;
      const isActive = Boolean(payload.isActive);
      if (!sessionId || seq <= 0) return;

      const rttPayload = {
        type: "rtt-update",
        sessionId,
        fromRole,
        targetRole,
        text: text.slice(0, 500),
        isActive,
        seq,
        sentAt: new Date().toISOString()
      };

      logEvent("rtt_update_forward", { sessionId, fromRole, targetRole, seq, isActive });
      emitToRole(targetRole, rttPayload);
      return;
    }

    if (payload.type === "webrtc-offer" || payload.type === "webrtc-answer" || payload.type === "webrtc-ice") {
      const fromRole = payload.fromRole || "deaf-user";
      const targetRole = payload.targetRole || (fromRole === "deaf-user" ? "interpreter" : "deaf-user");
      logEvent("webrtc_signal_forward", {
        signalType: payload.type,
        sessionId: payload.sessionId,
        fromRole,
        targetRole
      });
      emitToRole(targetRole, payload);
      return;
    }

    broadcast({ type: "signal-echo", payload });
  });

  ws.on("close", () => {
    for (const set of roleConnections.values()) set.delete(ws);
    logEvent("ws_closed", { totalClients: wss.clients.size - 1 });
  });

  ws.send(JSON.stringify({ type: "welcome" }));
});

app.post("/events", (req, res) => {
  const event = req.body;
  broadcast(event);
  res.json({ status: "forwarded" });
});

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/debug/state", (_, res) => {
  const roles = {};
  for (const [role, set] of roleConnections.entries()) roles[role] = set.size;
  res.json({
    status: "ok",
    clients: wss.clients.size,
    roles,
    recentEvents
  });
});
