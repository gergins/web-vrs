const assert = require("assert");
const { predictQueueEta } = require("../src/eta-predictor");
const { enforceAiPolicy } = require("../src/ai-policy-guard");

const eta = predictQueueEta({ queueDepth: 12, availableInterpreters: 3, avgSessionMinutes: 8 });
assert.ok(eta.etaMinutes > 0);
assert.ok(["high", "medium", "low"].includes(eta.confidence));

const blocked = enforceAiPolicy({ action: "force_state_transition" });
assert.strictEqual(blocked.allowed, false);

const allowed = enforceAiPolicy({ action: "rank_candidates" });
assert.strictEqual(allowed.allowed, true);

console.log("AI policy/ETA tests passed.");
