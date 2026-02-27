const assert = require("assert");
const { upsertContext, getContext } = require("../src/context-store");
const { buildContextKey, validateContextPayload } = require("../src/context-service");

const key = buildContextKey("session", "abc");
validateContextPayload("session", { state: "request_received" });

const a = upsertContext(key, { state: "request_received" });
const b = upsertContext(key, { state: "relay_active" });

assert.strictEqual(a.version, 1);
assert.strictEqual(b.version, 2);
assert.strictEqual(getContext(key).payload.state, "relay_active");

console.log("Context service tests passed.");
