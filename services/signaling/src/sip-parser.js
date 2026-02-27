function parseSipMessage(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "").trim();
  if (!text) throw new Error("Empty SIP message");

  const lines = text.split(/\r?\n/);
  const startLine = lines[0] || "";
  const method = startLine.split(" ")[0]?.toUpperCase();
  if (!method) throw new Error("Missing SIP method");

  const headers = {};
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) break;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[key] = value;
  }

  return {
    method,
    sessionId: headers["call-id"] || null,
    correlationId: headers["x-correlation-id"] || null
  };
}

module.exports = { parseSipMessage };
