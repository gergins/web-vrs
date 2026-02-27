const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CALLFLOW TEST FAILED: ${message}`);
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "schemas", "session-state.schema.json");
if (!fs.existsSync(schemaPath)) fail("Missing schemas/session-state.schema.json");

const schemaRaw = fs.readFileSync(schemaPath, "utf8").replace(/^\uFEFF/, "");
const schema = JSON.parse(schemaRaw);
const transitions = schema.transitions;
const expectedPath = [
  "request_received",
  "interpreter_assigned",
  "hearing_party_dialing",
  "relay_active",
  "call_ended"
];

for (let i = 0; i < expectedPath.length - 1; i++) {
  const from = expectedPath[i];
  const to = expectedPath[i + 1];
  const allowed = transitions[from] || [];
  if (!allowed.includes(to)) {
    fail(`Missing deterministic transition '${from}' -> '${to}'`);
  }
}

if ((transitions["call_ended"] || []).length !== 0) {
  fail("'call_ended' must be terminal with no outgoing transitions");
}

console.log("Callflow tests passed.");
