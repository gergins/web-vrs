import crypto from "crypto";
import dgram from "dgram";
import express from "express";
import { translateSipInvite } from "./bridge";

const app = express();
app.use(express.json());

const signalingUrl = process.env.SIGNALING_HTTP_URL || "http://localhost:4001/events";
const sipProxyHost = process.env.SIP_PROXY_HOST || "";
const sipProxyPort = Number(process.env.SIP_PROXY_PORT || "5060");
const sipTransport = (process.env.SIP_TRANSPORT || "udp").toLowerCase();
const sipFromUri = process.env.SIP_FROM_URI || "";
const sipContactHost = process.env.SIP_CONTACT_HOST || "127.0.0.1";
const sipContactPort = Number(process.env.SIP_CONTACT_PORT || "5080");
const sipAuthUsername = process.env.SIP_AUTH_USERNAME || "";
const sipAuthPassword = process.env.SIP_AUTH_PASSWORD || "";
const sipAuthRealm = process.env.SIP_AUTH_REALM || "";
const sipInviteTimeoutMs = Number(process.env.SIP_INVITE_TIMEOUT_MS || "30000");

function normalizeSipUri(uri: string): string {
  const trimmed = (uri || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("sip:") ? trimmed : `sip:${trimmed}`;
}

function parseSipStatus(message: string): { code: number; reason: string } | null {
  const firstLine = message.split(/\r?\n/)[0] || "";
  const match = firstLine.match(/^SIP\/2.0\s+(\d{3})\s*(.*)$/i);
  if (!match) return null;
  return { code: Number(match[1]), reason: match[2] || "" };
}

function getHeaderValue(message: string, headerName: string): string {
  const regex = new RegExp(`^${headerName}\\s*:\\s*(.+)$`, "im");
  const match = message.match(regex);
  return match?.[1]?.trim() || "";
}

function buildDigestAuthorization(params: {
  method: string;
  uri: string;
  username: string;
  password: string;
  realm: string;
  nonce: string;
}): string {
  const ha1 = crypto.createHash("md5").update(`${params.username}:${params.realm}:${params.password}`).digest("hex");
  const ha2 = crypto.createHash("md5").update(`${params.method}:${params.uri}`).digest("hex");
  const response = crypto.createHash("md5").update(`${ha1}:${params.nonce}:${ha2}`).digest("hex");
  return `Digest username="${params.username}", realm="${params.realm}", nonce="${params.nonce}", uri="${params.uri}", response="${response}", algorithm=MD5`;
}

function buildInvite(params: {
  callId: string;
  cseq: number;
  branch: string;
  fromTag: string;
  toUri: string;
  fromUri: string;
  contactUri: string;
  authHeader?: string;
}): string {
  const lines = [
    `INVITE ${params.toUri} SIP/2.0`,
    `Via: SIP/2.0/UDP ${sipContactHost}:${sipContactPort};branch=${params.branch};rport`,
    "Max-Forwards: 70",
    `From: <${params.fromUri}>;tag=${params.fromTag}`,
    `To: <${params.toUri}>`,
    `Call-ID: ${params.callId}`,
    `CSeq: ${params.cseq} INVITE`,
    `Contact: <${params.contactUri}>`,
    "Allow: INVITE, ACK, CANCEL, BYE, OPTIONS",
    "Supported: replaces",
    "Content-Type: application/sdp",
    "Content-Length: 0"
  ];
  if (params.authHeader) lines.splice(7, 0, `Authorization: ${params.authHeader}`);
  return `${lines.join("\r\n")}\r\n\r\n`;
}

function buildAck(params: { toUri: string; fromUri: string; callId: string; cseq: number; branch: string; fromTag: string; toTag: string }) {
  const lines = [
    `ACK ${params.toUri} SIP/2.0`,
    `Via: SIP/2.0/UDP ${sipContactHost}:${sipContactPort};branch=${params.branch};rport`,
    "Max-Forwards: 70",
    `From: <${params.fromUri}>;tag=${params.fromTag}`,
    `To: <${params.toUri}>;tag=${params.toTag}`,
    `Call-ID: ${params.callId}`,
    `CSeq: ${params.cseq} ACK`,
    "Content-Length: 0"
  ];
  return `${lines.join("\r\n")}\r\n\r\n`;
}

async function emitDialStatus(payload: { sessionId?: string; to: string; status: string; code?: number; reason?: string }) {
  try {
    await fetch(signalingUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "sip-dial-status",
        sessionId: payload.sessionId,
        to: payload.to,
        status: payload.status,
        code: payload.code,
        reason: payload.reason
      })
    });
  } catch (err) {
    console.error("Failed to emit SIP dial status", err);
  }
}

async function runSipInvite(params: { sessionId?: string; from: string; to: string }): Promise<{ status: string; code?: number; reason?: string }> {
  if (sipTransport !== "udp") return { status: "failed", reason: "Only UDP transport is currently implemented" };

  const toUri = normalizeSipUri(params.to);
  const fromUri = normalizeSipUri(params.from || sipFromUri);
  if (!toUri || !fromUri) return { status: "failed", reason: "Missing to/from SIP URI" };

  const proxyHost = sipProxyHost || (toUri.split("@")[1] || "").replace(/[>;].*$/, "");
  if (!proxyHost) return { status: "failed", reason: "Missing SIP proxy host and cannot infer from target URI" };

  const socket = dgram.createSocket("udp4");
  const callId = `${crypto.randomUUID()}@${sipContactHost}`;
  const fromTag = crypto.randomBytes(6).toString("hex");
  let cseq = 1;
  let branch = `z9hG4bK-${crypto.randomBytes(8).toString("hex")}`;
  let finished = false;
  let authAttempted = false;

  await emitDialStatus({ sessionId: params.sessionId, to: params.to, status: "dialing" });

  return new Promise((resolve) => {
    const finish = async (result: { status: string; code?: number; reason?: string }) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      try {
        socket.close();
      } catch {}
      await emitDialStatus({
        sessionId: params.sessionId,
        to: params.to,
        status: result.status,
        code: result.code,
        reason: result.reason
      });
      resolve(result);
    };

    const sendInvite = (authHeader?: string) => {
      const contactUri = `sip:vrs-gateway@${sipContactHost}:${sipContactPort};transport=udp`;
      const invite = buildInvite({
        callId,
        cseq,
        branch,
        fromTag,
        toUri,
        fromUri,
        contactUri,
        authHeader
      });
      socket.send(Buffer.from(invite), sipProxyPort, proxyHost, (err) => {
        if (err) void finish({ status: "failed", reason: err.message });
      });
    };

    socket.on("message", (buf) => {
      const raw = buf.toString("utf8");
      const sipStatus = parseSipStatus(raw);
      if (!sipStatus) return;

      if (sipStatus.code === 100) {
        void emitDialStatus({ sessionId: params.sessionId, to: params.to, status: "trying", code: sipStatus.code, reason: sipStatus.reason });
        return;
      }

      if (sipStatus.code === 180 || sipStatus.code === 183) {
        void emitDialStatus({ sessionId: params.sessionId, to: params.to, status: "ringing", code: sipStatus.code, reason: sipStatus.reason });
        return;
      }

      if ((sipStatus.code === 401 || sipStatus.code === 407) && !authAttempted && sipAuthUsername && sipAuthPassword) {
        authAttempted = true;
        const challengeHeader = sipStatus.code === 401 ? "WWW-Authenticate" : "Proxy-Authenticate";
        const challenge = getHeaderValue(raw, challengeHeader);
        const nonce = (challenge.match(/nonce="([^"]+)"/i) || [])[1] || "";
        const realm = (challenge.match(/realm="([^"]+)"/i) || [])[1] || sipAuthRealm;
        if (!nonce || !realm) {
          void finish({ status: "failed", code: sipStatus.code, reason: "SIP auth challenge missing nonce/realm" });
          return;
        }
        cseq += 1;
        branch = `z9hG4bK-${crypto.randomBytes(8).toString("hex")}`;
        const authHeader = buildDigestAuthorization({
          method: "INVITE",
          uri: toUri,
          username: sipAuthUsername,
          password: sipAuthPassword,
          realm,
          nonce
        });
        sendInvite(authHeader);
        return;
      }

      if (sipStatus.code >= 200 && sipStatus.code < 300) {
        const toTag = (getHeaderValue(raw, "To").match(/;tag=([^;>\s]+)/i) || [])[1] || "";
        const ack = buildAck({
          toUri,
          fromUri,
          callId,
          cseq,
          branch: `z9hG4bK-${crypto.randomBytes(8).toString("hex")}`,
          fromTag,
          toTag
        });
        socket.send(Buffer.from(ack), sipProxyPort, proxyHost);
        void finish({ status: "answered", code: sipStatus.code, reason: sipStatus.reason });
        return;
      }

      if (sipStatus.code >= 300) {
        void finish({ status: "failed", code: sipStatus.code, reason: sipStatus.reason });
      }
    });

    socket.on("error", (err) => {
      void finish({ status: "failed", reason: err.message });
    });

    const timeout = setTimeout(() => {
      void finish({ status: "failed", reason: "SIP INVITE timeout" });
    }, sipInviteTimeoutMs);

    sendInvite();
  });
}

app.post("/sip/invite", async (req, res) => {
  const { sessionId, from } = req.body as { sessionId?: string; from?: string };

  console.log("Incoming SIP invite", sessionId);

  const eventPayload = translateSipInvite({ sessionId, from });

  try {
    const response = await fetch(signalingUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      return res.status(502).json({ status: "signaling_unavailable", sessionId });
    }
  } catch (error) {
    console.error("Failed to forward SIP invite to signaling", error);
    return res.status(502).json({ status: "signaling_error", sessionId });
  }

  res.json({ status: "accepted", sessionId });
});

app.post("/sip/dial", async (req, res) => {
  const { sessionId, from, to } = req.body as { sessionId?: string; from?: string; to?: string };
  if (!to) return res.status(400).json({ status: "invalid_target" });

  const resolvedFrom = from || sipFromUri;
  if (!resolvedFrom) return res.status(400).json({ status: "invalid_source", reason: "Missing from SIP URI" });

  console.log("SIP dial requested", { sessionId, from: resolvedFrom, to });
  void runSipInvite({ sessionId, from: resolvedFrom, to }).catch((err) => {
    console.error("SIP invite execution failed", err);
  });
  return res.json({ status: "dialing", sessionId, from: resolvedFrom, to });
});

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    sip: {
      transport: sipTransport,
      proxyHost: sipProxyHost || null,
      proxyPort: sipProxyPort,
      fromConfigured: Boolean(sipFromUri),
      authConfigured: Boolean(sipAuthUsername && sipAuthPassword)
    }
  });
});

app.listen(4002, () => {
  console.log("SIP gateway running on 4002");
});
