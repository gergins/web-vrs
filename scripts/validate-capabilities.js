const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CAPABILITY VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const registryPath = path.join(process.cwd(), "config", "capabilities", "registry.json");
const policiesDir = path.join(process.cwd(), "config", "capabilities", "policies");

if (!fs.existsSync(registryPath)) fail("Missing config/capabilities/registry.json");
if (!fs.existsSync(policiesDir)) fail("Missing config/capabilities/policies directory");

const registry = loadJson(registryPath);
if (!Array.isArray(registry.capabilities) || registry.capabilities.length === 0) {
  fail("registry.capabilities must be a non-empty array");
}

const validModes = new Set(["off", "silent_assist", "guided_assist", "training_mode"]);
const ids = new Set();
for (const cap of registry.capabilities) {
  if (!cap.id) fail("Capability entry missing id");
  if (ids.has(cap.id)) fail(`Duplicate capability id '${cap.id}'`);
  ids.add(cap.id);
  if (typeof cap.human_override_required !== "boolean" || cap.human_override_required !== true) {
    fail(`Capability '${cap.id}' must require human_override_required=true`);
  }
  if (!validModes.has(cap.default_mode)) {
    fail(`Capability '${cap.id}' has invalid default_mode '${cap.default_mode}'`);
  }
}

const policyFiles = fs.readdirSync(policiesDir).filter((f) => f.endsWith(".json"));
if (policyFiles.length === 0) fail("No capability policy files found in config/capabilities/policies");

for (const file of policyFiles) {
  const policy = loadJson(path.join(policiesDir, file));
  if (!Array.isArray(policy.modes_allowed) || policy.modes_allowed.length === 0) {
    fail(`${file}: modes_allowed must be non-empty array`);
  }
  for (const mode of policy.modes_allowed) {
    if (!validModes.has(mode)) fail(`${file}: invalid mode '${mode}' in modes_allowed`);
  }

  if (!policy.capabilities || typeof policy.capabilities !== "object") {
    fail(`${file}: capabilities object is required`);
  }

  for (const id of Object.keys(policy.capabilities)) {
    if (!ids.has(id)) fail(`${file}: unknown capability id '${id}'`);
    const cfg = policy.capabilities[id];
    if (typeof cfg.enabled !== "boolean") fail(`${file}: capability '${id}' missing boolean enabled`);
    if (!validModes.has(cfg.mode)) fail(`${file}: capability '${id}' invalid mode '${cfg.mode}'`);
  }

  const g = policy.guardrails || {};
  if (g.human_override_always !== true) fail(`${file}: guardrails.human_override_always must be true`);
  if (g.no_automated_interpretation_output !== true) fail(`${file}: guardrails.no_automated_interpretation_output must be true`);
  if (g.audit_required !== true) fail(`${file}: guardrails.audit_required must be true`);
}

console.log("Capability registry validation passed.");
