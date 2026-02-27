import assert from "assert";
import { handleCallRequest } from "../../services/signaling/src/callflow-engine.js";

const stored = [];
const roleEvents = new Map();
const allEvents = [];

function emitToRole(role, payload) {
  if (!roleEvents.has(role)) roleEvents.set(role, []);
  roleEvents.get(role).push(payload);
}

function emitAll(payload) {
  allEvents.push(payload);
}

{
  const result = await handleCallRequest(
    {
      type: "call-request",
      caller: "deaf-user",
      preferredLanguage: "ASL"
    },
    {
      assignInterpreter: async () => ({ interpreterId: "demo-interpreter", eta: 5 }),
      storeSession: async (sessionId, session) => stored.push({ sessionId, session }),
      emitToRole,
      emitAll
    }
  );

  assert.ok(result.sessionId, "sessionId should be generated");
  assert.strictEqual(result.status, "interpreter_assigned");
  assert.strictEqual(stored.length, 1, "session should be stored");
  assert.strictEqual(roleEvents.get("interpreter")?.[0]?.type, "incoming-call");
  assert.strictEqual(allEvents[0]?.type, "session-updated");
}

{
  const queuedEvents = [];
  const queuedResult = await handleCallRequest(
    { type: "call-request", caller: "deaf-user" },
    {
      assignInterpreter: async () => null,
      storeSession: async () => {},
      emitToRole: (_role, payload) => queuedEvents.push(payload),
      emitAll: () => {}
    }
  );

  assert.strictEqual(queuedResult.status, "waiting_for_interpreter");
  assert.strictEqual(queuedEvents[0]?.type, "queue-waiting");
}

console.log("VRS callflow e2e test passed.");
