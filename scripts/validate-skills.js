const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`SKILL REGISTRY VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const registryPath = path.join(process.cwd(), "config", "skills", "registry.json");
const schemaPath = path.join(process.cwd(), "schemas", "skills", "skill-registry.schema.json");
const runnerPath = path.join(process.cwd(), "services", "skill-engine", "src", "workflow-runner.js");

if (!fs.existsSync(registryPath)) fail("Missing config/skills/registry.json");
if (!fs.existsSync(schemaPath)) fail("Missing schemas/skills/skill-registry.schema.json");
if (!fs.existsSync(runnerPath)) fail("Missing services/skill-engine/src/workflow-runner.js");

const registry = loadJson(registryPath);
if (registry.schema_version !== "1.0.0") fail("schema_version must be 1.0.0");
if (!Array.isArray(registry.skills) || registry.skills.length === 0) fail("skills must be non-empty array");

for (const s of registry.skills) {
  if (!s.skill_id || !s.version) fail("each skill must include skill_id and version");
  if (typeof s.enabled !== "boolean") fail(`skill '${s.skill_id}' must include boolean enabled`);
  if (!Array.isArray(s.inputs) || s.inputs.length === 0) fail(`skill '${s.skill_id}' must declare inputs`);
  const steps = s.workflow?.steps;
  if (!Array.isArray(steps) || steps.length === 0) fail(`skill '${s.skill_id}' must declare workflow steps`);
  for (const st of steps) {
    if (!["decision", "action"].includes(st.type)) fail(`skill '${s.skill_id}' has unsupported step type '${st.type}'`);
  }
  const checks = s.guardrails?.required_checks;
  if (!Array.isArray(checks) || checks.length === 0) fail(`skill '${s.skill_id}' must declare guard checks`);
}

console.log("Skill registry validation passed.");
