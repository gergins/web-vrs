const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`ETHICS WORKFLOW VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const policyPath = path.join(process.cwd(), "config", "capabilities", "ethics-workflow-policy.json");
if (!fs.existsSync(policyPath)) fail("Missing config/capabilities/ethics-workflow-policy.json");

const p = loadJson(policyPath);

const requiredStages = [
  "problem_definition",
  "ethical_impact_assessment",
  "co_design",
  "ethical_requirements",
  "development_safeguards",
  "testing_validation",
  "ethical_review_gate",
  "deployment_transparency",
  "continuous_monitoring",
  "iteration_governance"
];

if (!Array.isArray(p.required_stages)) fail("required_stages must be an array");
for (const stage of requiredStages) {
  if (!p.required_stages.includes(stage)) fail(`Missing required stage '${stage}'`);
}

if (!Array.isArray(p.required_gate_outcomes)) fail("required_gate_outcomes must be an array");
for (const outcome of ["approve", "conditional", "redesign"]) {
  if (!p.required_gate_outcomes.includes(outcome)) {
    fail(`required_gate_outcomes must include '${outcome}'`);
  }
}

if (!Array.isArray(p.required_signoff_roles) || p.required_signoff_roles.length < 3) {
  fail("required_signoff_roles must include at least 3 roles");
}
for (const role of ["ai_ethics_lead", "accessibility_lead", "data_protection_officer"]) {
  if (!p.required_signoff_roles.includes(role)) fail(`Missing required signoff role '${role}'`);
}

if (!Array.isArray(p.required_artifacts) || p.required_artifacts.length < 5) {
  fail("required_artifacts must contain at least 5 entries");
}
for (const artifact of ["ethics_risk_register", "consent_log", "audit_trail"]) {
  if (!p.required_artifacts.includes(artifact)) fail(`Missing required artifact '${artifact}'`);
}

if (!Array.isArray(p.incident_response_required_steps)) {
  fail("incident_response_required_steps must be an array");
}
for (const step of ["detect", "contain", "notify", "investigate", "fix", "communicate", "update_safeguards"]) {
  if (!p.incident_response_required_steps.includes(step)) fail(`Missing incident step '${step}'`);
}

if (p.agile_checkpoints_required !== true) fail("agile_checkpoints_required must be true");
if (p.community_input_required !== true) fail("community_input_required must be true");

console.log("Ethics workflow validation passed.");
