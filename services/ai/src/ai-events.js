function buildAiAuditEvent({ sessionId, correlationId, modelVersion, decision, overridden }) {
  return {
    timestamp: new Date().toISOString(),
    session_id: sessionId || null,
    correlation_id: correlationId || null,
    model_version: modelVersion || "unknown",
    decision: decision || "none",
    overridden: Boolean(overridden)
  };
}

module.exports = { buildAiAuditEvent };
