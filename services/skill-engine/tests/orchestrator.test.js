const assert = require("assert");
const { orchestrate, classifyIntent, buildContext, pickOperationalMode } = require("../src/orchestrator");

const SKILLS = [
  "realtime-communication",
  "webrtc-operations",
  "interpreter-routing",
  "accessibility-ux",
  "compliance-security",
  "ai-assistive",
  "incident-response"
];

{
  const ctx = buildContext({
    priority: "HIGH",
    signals: ["packet_loss_spike"],
    request_text: "Media degradation alert",
    auto_remediation_allowed: true
  });
  assert.strictEqual(ctx.priority, "high");
  assert.strictEqual(classifyIntent(ctx), "incident");
}

{
  const out = orchestrate(
    {
      request_text: "packet loss incident",
      signals: ["packet_loss_spike"],
      priority: "critical",
      auto_remediation_allowed: true
    },
    SKILLS
  );

  assert.strictEqual(out.intent, "incident");
  assert.strictEqual(out.mode, "autonomous");
  assert.strictEqual(out.selection.primary, "incident-response");
  assert.ok(out.selection.supporting.includes("webrtc-operations"));
}

{
  const out = orchestrate(
    {
      request_text: "new feature rollout architecture plan",
      priority: "normal"
    },
    SKILLS
  );

  assert.strictEqual(out.intent, "architecture");
  assert.strictEqual(out.selection.primary, "realtime-communication");
  assert.ok(out.selection.supporting.includes("accessibility-ux"));
}

{
  const out = orchestrate(
    {
      request_text: "queue delay and matching issues",
      signals: ["queue_delay"],
      priority: "high"
    },
    SKILLS
  );

  assert.strictEqual(out.intent, "matching");
  assert.strictEqual(out.selection.primary, "interpreter-routing");
  assert.ok(out.selection.supporting.includes("ai-assistive"));
}

{
  const out = orchestrate(
    {
      request_text: "design update",
      compliance_flags: ["gdpr_review"],
      priority: "high"
    },
    SKILLS
  );

  assert.strictEqual(out.selection.primary, "compliance-security");
}

{
  assert.strictEqual(pickOperationalMode({ execution_mode: "assisted" }, "incident"), "assisted");
  assert.strictEqual(pickOperationalMode({ priority: "critical", auto_remediation_allowed: true }, "incident"), "autonomous");
  assert.strictEqual(pickOperationalMode({ priority: "normal" }, "operations"), "advisory");
}

console.log("Orchestrator tests passed.");
