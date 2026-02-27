const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`ETHICS VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const policyPath = path.join(process.cwd(), "config", "capabilities", "ethics-policy.json");
if (!fs.existsSync(policyPath)) fail("Missing config/capabilities/ethics-policy.json");

const policy = loadJson(policyPath);

const principleKeys = [
  "human_primacy",
  "accessibility_equity",
  "transparency_explainability",
  "privacy_confidentiality",
  "non_replacement_commitment",
  "fairness_bias_mitigation",
  "safety_reliability",
  "accountability_governance"
];

for (const key of principleKeys) {
  if (policy?.principles?.[key] !== true) fail(`principles.${key} must be true`);
}

if (policy?.rights?.user?.right_to_human_service !== true) fail("user right_to_human_service must be true");
if (policy?.rights?.user?.right_to_opt_out_of_ai !== true) fail("user right_to_opt_out_of_ai must be true");
if (policy?.rights?.interpreter?.right_to_control_assistance_level !== true) fail("interpreter right_to_control_assistance_level must be true");

if (policy?.guardrails?.human_override_always !== true) fail("guardrails.human_override_always must be true");
if (policy?.guardrails?.no_automated_interpretation_output !== true) fail("guardrails.no_automated_interpretation_output must be true");
if (policy?.guardrails?.consent_management_required !== true) fail("guardrails.consent_management_required must be true");
if (policy?.guardrails?.bias_audit_required !== true) fail("guardrails.bias_audit_required must be true");

if (policy?.oversight?.ethics_board_required !== true) fail("oversight.ethics_board_required must be true");
if (!Array.isArray(policy?.oversight?.required_roles) || policy.oversight.required_roles.length < 3) {
  fail("oversight.required_roles must contain at least 3 entries");
}
if (policy?.oversight?.community_advisory_group_required !== true) fail("oversight.community_advisory_group_required must be true");

if (!Array.isArray(policy?.kpis?.required) || policy.kpis.required.length < 4) {
  fail("kpis.required must contain at least 4 metrics");
}

console.log("Ethics policy validation passed.");
