const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CAPABILITY ROLLOUT VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const policyPath = path.join(process.cwd(), "config", "capabilities", "rollout-policy.json");
if (!fs.existsSync(policyPath)) fail("Missing config/capabilities/rollout-policy.json");

const p = loadJson(policyPath);
if (p.default_enablement !== "disabled") fail("default_enablement must be 'disabled'");

const required = [
  "feature_gate_approved",
  "ethics_policy_valid",
  "ethics_workflow_valid",
  "country_profile_valid",
  "workforce_profile_valid",
  "capability_policy_valid",
  "tests_passing"
];
if (!Array.isArray(p.required_pre_enable_checks)) fail("required_pre_enable_checks must be an array");
for (const item of required) {
  if (!p.required_pre_enable_checks.includes(item)) fail(`Missing required pre-enable check '${item}'`);
}

const allowedStrategies = ["off", "internal_only", "canary", "tenant_opt_in", "general_availability"];
if (!Array.isArray(p.allowed_rollout_strategies)) fail("allowed_rollout_strategies must be an array");
for (const s of allowedStrategies) {
  if (!p.allowed_rollout_strategies.includes(s)) fail(`Missing rollout strategy '${s}'`);
}

const hr = p.high_risk_features_require || {};
if (hr.human_override_confirmed !== true) fail("high_risk_features_require.human_override_confirmed must be true");
if (hr.incident_playbook_linked !== true) fail("high_risk_features_require.incident_playbook_linked must be true");
if (!Array.isArray(hr.additional_signoff_roles) || hr.additional_signoff_roles.length < 3) {
  fail("high_risk_features_require.additional_signoff_roles must have at least 3 roles");
}

console.log("Capability rollout policy validation passed.");
