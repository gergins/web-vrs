function routeSipRequest(request, deps) {
  const method = String(request?.method || "").toUpperCase();
  const sessionId = request?.sessionId || null;

  if (!deps || !deps.sessionStore || !deps.log) {
    throw new Error("Missing signaling dependencies");
  }

  const isDraining = Boolean(deps.isDraining && deps.isDraining());

  switch (method) {
    case "REGISTER":
      deps.log("register.received", {
        session_id: sessionId,
        correlation_id: request.correlationId
      });
      return { status: 200, action: "registered" };
    case "INVITE":
      if (isDraining) {
        deps.log("invite.rejected.draining", {
          session_id: sessionId,
          correlation_id: request.correlationId
        });
        return { status: 503, action: "draining_reject" };
      }
      deps.sessionStore.ensure(sessionId, "request_received");
      deps.log("invite.received", {
        session_id: sessionId,
        correlation_id: request.correlationId
      });
      return { status: 200, action: "invite_accepted" };
    case "BYE":
      deps.sessionStore.transition(sessionId, "call_ended");
      deps.log("bye.received", {
        session_id: sessionId,
        correlation_id: request.correlationId
      });
      return { status: 200, action: "session_ended" };
    default:
      deps.log("method.unsupported", {
        method,
        correlation_id: request.correlationId
      });
      return { status: 405, action: "unsupported_method" };
  }
}

module.exports = { routeSipRequest };
