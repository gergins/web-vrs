function buildContextKey(kind, id) {
  if (!kind || !id) throw new Error("kind and id are required");
  return `${kind}:${id}`;
}

function validateContextPayload(kind, payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload must be an object");
  }

  if (kind === "session") {
    if (!payload.state) throw new Error("session payload requires state");
  }

  if (kind === "user") {
    if (!payload.user_id) throw new Error("user payload requires user_id");
  }

  if (kind === "interpreter") {
    if (!payload.interpreter_id) throw new Error("interpreter payload requires interpreter_id");
  }

  return true;
}

module.exports = { buildContextKey, validateContextPayload };
