import crypto from "crypto";

export async function handleCallRequest(payload, deps) {
  const sessionId = payload.sessionId || crypto.randomUUID();
  const caller = payload.caller || "deaf-user";
  const sipAddress = payload.sipAddress || null;
  const callerRole = caller === "interpreter" ? "interpreter" : "deaf-user";
  const calleeRole = callerRole === "deaf-user" ? "interpreter" : "deaf-user";

  const assignment = await deps.assignInterpreter({
    sessionId,
    caller,
    target: payload.target || "interpreter-queue",
    preferredLanguage: payload.preferredLanguage || "ASL"
  });

  if (!assignment || !assignment.interpreterId) {
    const queued = {
      type: "queue-waiting",
      sessionId,
      caller,
      status: "waiting_for_interpreter"
    };
    deps.emitToRole(callerRole, queued);
    Promise.resolve(
      deps.storeSession(sessionId, {
      sessionId,
      status: "waiting_for_interpreter",
      caller,
      sipAddress
    })
    ).catch(() => {});
    return queued;
  }

  const session = {
    sessionId,
    caller,
    interpreterId: assignment.interpreterId,
    status: "interpreter_assigned",
    eta: assignment.eta ?? null,
    sipAddress
  };

  deps.emitToRole(calleeRole, {
    type: "incoming-call",
    sessionId,
    caller,
    interpreterId: assignment.interpreterId,
    sipAddress
  });

  deps.emitAll({
    type: "session-updated",
    sessionId,
    status: session.status
  });

  Promise.resolve(deps.storeSession(sessionId, session)).catch(() => {});

  return session;
}
