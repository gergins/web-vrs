function enforceAiPolicy(decision) {
  if (!decision || typeof decision !== "object") {
    return { allowed: false, reason: "invalid_decision" };
  }

  if (decision.action === "force_state_transition") {
    return { allowed: false, reason: "ai_cannot_control_state_machine" };
  }

  if (decision.containsSecret === true) {
    return { allowed: false, reason: "secret_leak_risk" };
  }

  return { allowed: true, reason: "assist_only" };
}

module.exports = { enforceAiPolicy };
