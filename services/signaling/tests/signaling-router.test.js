const assert = require("assert");
const { routeSipRequest } = require("../src/signaling-router");
const { SessionStore } = require("../src/session-store");

const logs = [];
const depsBase = {
  sessionStore: new SessionStore(),
  log: (event, payload) => logs.push({ event, payload }),
  isDraining: () => false
};

const invite = routeSipRequest({ method: "INVITE", sessionId: "s1", correlationId: "c1" }, depsBase);
assert.strictEqual(invite.status, 200);
assert.strictEqual(invite.action, "invite_accepted");
assert.strictEqual(depsBase.sessionStore.get("s1").state, "request_received");

const bye = routeSipRequest({ method: "BYE", sessionId: "s1", correlationId: "c2" }, depsBase);
assert.strictEqual(bye.status, 200);
assert.strictEqual(depsBase.sessionStore.get("s1").state, "call_ended");

const unsupported = routeSipRequest({ method: "OPTIONS", correlationId: "c3" }, depsBase);
assert.strictEqual(unsupported.status, 405);

const depsDraining = {
  sessionStore: new SessionStore(),
  log: () => undefined,
  isDraining: () => true
};
const drainingInvite = routeSipRequest({ method: "INVITE", sessionId: "s2", correlationId: "c4" }, depsDraining);
assert.strictEqual(drainingInvite.status, 503);
assert.strictEqual(drainingInvite.action, "draining_reject");

console.log("Signaling router tests passed.");
