class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  ensure(sessionId, initialState) {
    if (!sessionId) throw new Error("sessionId is required");
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { state: initialState });
    }
    return this.sessions.get(sessionId);
  }

  transition(sessionId, nextState) {
    const current = this.ensure(sessionId, "request_received");
    current.state = nextState;
    return current;
  }

  activeCount() {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.state !== "call_ended") count += 1;
    }
    return count;
  }

  get(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
}

module.exports = { SessionStore };
