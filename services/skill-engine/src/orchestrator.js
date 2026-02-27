const SKILL_DOMAIN = {
  "realtime-communication": "realtime-media",
  "webrtc-operations": "realtime-media",
  "interpreter-routing": "routing",
  "accessibility-ux": "ux",
  "compliance-security": "compliance",
  "ai-assistive": "ai",
  "incident-response": "operations"
};

const INTENT_TO_PRIMARY = {
  architecture: "realtime-communication",
  operations: "webrtc-operations",
  matching: "interpreter-routing",
  ux: "accessibility-ux",
  compliance: "compliance-security",
  ai_tooling: "ai-assistive",
  incident: "incident-response",
  scale: "realtime-communication"
};

const SIGNAL_HINTS = {
  "packet_loss_spike": ["webrtc-operations", "incident-response", "realtime-communication"],
  "queue_delay": ["interpreter-routing", "ai-assistive"],
  "audit_request": ["compliance-security"],
  "usability_feedback": ["accessibility-ux"],
  "assistive_feature_request": ["ai-assistive"]
};

function normalizePriority(priority) {
  const p = String(priority || "normal").toLowerCase();
  if (["low", "normal", "high", "critical"].includes(p)) return p;
  return "normal";
}

function buildContext(input) {
  const context = input || {};
  return {
    intent: context.intent || null,
    priority: normalizePriority(context.priority),
    domain: context.domain || null,
    signals: Array.isArray(context.signals) ? context.signals : [],
    user_type: context.user_type || "operator",
    request_text: context.request_text || "",
    compliance_flags: Array.isArray(context.compliance_flags) ? context.compliance_flags : [],
    execution_mode: context.execution_mode || null,
    auto_remediation_allowed: context.auto_remediation_allowed === true
  };
}

function classifyIntent(context) {
  if (context.intent) return String(context.intent).toLowerCase();

  const text = String(context.request_text || "").toLowerCase();
  if (text.includes("incident") || text.includes("outage") || text.includes("degradation")) return "incident";
  if (text.includes("design") || text.includes("architecture") || text.includes("plan")) return "architecture";
  if (text.includes("scale") || text.includes("region expansion")) return "scale";
  if (text.includes("routing") || text.includes("queue") || text.includes("matching")) return "matching";
  if (text.includes("ux") || text.includes("onboarding") || text.includes("usability")) return "ux";
  if (text.includes("compliance") || text.includes("audit") || text.includes("gdpr")) return "compliance";
  if (text.includes("ai") || text.includes("caption") || text.includes("assist")) return "ai_tooling";

  if (context.signals.includes("packet_loss_spike")) return "incident";
  if (context.signals.includes("queue_delay")) return "matching";
  if (context.signals.includes("audit_request")) return "compliance";
  if (context.signals.includes("usability_feedback")) return "ux";

  return "operations";
}

function scoreSkill(skillId, context, intent) {
  let score = 0;
  const primary = INTENT_TO_PRIMARY[intent];

  if (skillId === primary) score += 50;
  if (context.domain && SKILL_DOMAIN[skillId] === context.domain) score += 20;

  for (const signal of context.signals) {
    if ((SIGNAL_HINTS[signal] || []).includes(skillId)) score += 10;
  }

  if (context.priority === "high") score += 8;
  if (context.priority === "critical") score += 16;
  if (context.priority === "low") score -= 2;

  return score;
}

function pickOperationalMode(context, intent) {
  if (context.execution_mode) return context.execution_mode;

  if (intent === "incident") {
    if (context.priority === "critical" && context.auto_remediation_allowed) return "autonomous";
    return "assisted";
  }

  return "advisory";
}

function uniquePush(items, value) {
  if (!items.includes(value)) items.push(value);
}

function applyComposition(primarySkill, context, scoredSkillIds) {
  const supporting = [];

  if (primarySkill === "incident-response") {
    uniquePush(supporting, "webrtc-operations");
    uniquePush(supporting, "realtime-communication");
  } else if (primarySkill === "webrtc-operations") {
    uniquePush(supporting, "realtime-communication");
    uniquePush(supporting, "incident-response");
  } else if (primarySkill === "realtime-communication") {
    uniquePush(supporting, "accessibility-ux");
    uniquePush(supporting, "compliance-security");
  } else if (primarySkill === "interpreter-routing") {
    uniquePush(supporting, "ai-assistive");
    uniquePush(supporting, "compliance-security");
  } else if (primarySkill === "accessibility-ux") {
    uniquePush(supporting, "realtime-communication");
  } else if (primarySkill === "ai-assistive") {
    uniquePush(supporting, "interpreter-routing");
    uniquePush(supporting, "compliance-security");
  }

  if (context.compliance_flags.length > 0) {
    uniquePush(supporting, primarySkill);
    return {
      primary: "compliance-security",
      supporting: supporting.filter((s) => s !== "compliance-security")
    };
  }

  for (const skillId of scoredSkillIds) {
    if (skillId !== primarySkill && supporting.length < 2) uniquePush(supporting, skillId);
  }

  return {
    primary: primarySkill,
    supporting: supporting.filter((s) => s !== primarySkill).slice(0, 3)
  };
}

function orchestrate(input, availableSkills) {
  const skills = Array.isArray(availableSkills) && availableSkills.length > 0
    ? availableSkills
    : Object.keys(SKILL_DOMAIN);
  const context = buildContext(input);
  const intent = classifyIntent(context);

  const scored = skills
    .map((skillId) => ({ skill_id: skillId, score: scoreSkill(skillId, context, intent) }))
    .sort((a, b) => b.score - a.score || a.skill_id.localeCompare(b.skill_id));

  const defaultPrimary = scored[0]?.skill_id || INTENT_TO_PRIMARY[intent] || "webrtc-operations";
  const composition = applyComposition(defaultPrimary, context, scored.map((s) => s.skill_id));

  return {
    context,
    intent,
    mode: pickOperationalMode(context, intent),
    selection: {
      primary: composition.primary,
      supporting: composition.supporting
    },
    scores: scored
  };
}

module.exports = {
  buildContext,
  classifyIntent,
  scoreSkill,
  pickOperationalMode,
  orchestrate
};
