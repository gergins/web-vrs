const assert = require("assert");
const { parseSipMessage } = require("../src/sip-parser");

const parsed = parseSipMessage(
  [
    "INVITE sip:user@example.com SIP/2.0",
    "Call-ID: session-123",
    "X-Correlation-ID: corr-456",
    "",
    "body"
  ].join("\r\n")
);

assert.strictEqual(parsed.method, "INVITE");
assert.strictEqual(parsed.sessionId, "session-123");
assert.strictEqual(parsed.correlationId, "corr-456");

console.log("SIP parser tests passed.");
