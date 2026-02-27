const contexts = new Map();

function nowIso() {
  return new Date().toISOString();
}

function ensureVersioned(existing) {
  if (!existing) return { version: 1 };
  return { version: existing.version + 1 };
}

function upsertContext(key, payload) {
  if (!key) throw new Error("context key is required");
  const existing = contexts.get(key);
  const version = ensureVersioned(existing).version;
  const record = {
    key,
    version,
    payload,
    updated_at: nowIso()
  };
  contexts.set(key, record);
  return record;
}

function getContext(key) {
  return contexts.get(key) || null;
}

module.exports = { upsertContext, getContext };
