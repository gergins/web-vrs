const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`AUDIT LOG CHECK FAILED: ${message}`);
  process.exit(1);
}

function loadJson(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}`);
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const accommodation = loadJson("config/interpreter-accommodation-policy.json");
if (!accommodation.assignment_decision_trace) {
  fail("interpreter-accommodation-policy missing assignment_decision_trace");
}

const workflow = loadJson("config/capabilities/ethics-workflow-policy.json");
const artifacts = workflow.required_artifacts || [];
if (!artifacts.includes("audit_trail")) {
  fail("ethics-workflow-policy must require audit_trail artifact");
}

const profilesDir = path.join(process.cwd(), "config", "country-profiles");
const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json") && !["schema.json", "template.json"].includes(f));
for (const f of files) {
  const profile = loadJson(path.join("config", "country-profiles", f));
  if (profile?.compliance?.audit_required !== true) {
    fail(`${f} must set compliance.audit_required=true`);
  }
}

console.log("Audit log coverage checks passed.");
