const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`STATE VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "schemas", "session-state.schema.json");
if (!fs.existsSync(schemaPath)) fail("Missing schemas/session-state.schema.json");

const schemaRaw = fs.readFileSync(schemaPath, "utf8").replace(/^\uFEFF/, "");
const schema = JSON.parse(schemaRaw);
const states = schema.states;
const transitions = schema.transitions;

if (!Array.isArray(states) || states.length < 2) fail("states must be an array with at least 2 states");
if (!transitions || typeof transitions !== "object") fail("transitions map is required");
if (!states.includes(schema.initial)) fail("initial state must exist in states");
if (!states.includes(schema.terminal)) fail("terminal state must exist in states");

for (const state of states) {
  if (!(state in transitions)) fail(`Missing transitions entry for state '${state}'`);
  const next = transitions[state];
  if (!Array.isArray(next)) fail(`Transitions for '${state}' must be an array`);
  for (const target of next) {
    if (!states.includes(target)) fail(`Transition '${state}' -> '${target}' points to unknown state`);
  }
  const unique = new Set(next);
  if (unique.size !== next.length) fail(`Duplicate transitions found for '${state}'`);
}

for (const key of Object.keys(transitions)) {
  if (!states.includes(key)) fail(`Transitions contains unknown source state '${key}'`);
}

console.log("State schema validation passed.");
