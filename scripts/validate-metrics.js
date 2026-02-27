const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`METRICS VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function readText(relPath) {
  const full = path.join(process.cwd(), relPath);
  if (!fs.existsSync(full)) fail(`Missing ${relPath}`);
  return fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
}

const domainSpec = readText("docs/domain/vrs-domain-spec.md").toLowerCase();
const requiredDomainMetrics = ["setup latency", "interpreter assignment delay", "call success/failure rate"];
for (const metric of requiredDomainMetrics) {
  if (!domainSpec.includes(metric)) {
    fail(`Domain spec missing metric phrase '${metric}'`);
  }
}

const registryPath = path.join(process.cwd(), "config", "skills", "registry.json");
if (!fs.existsSync(registryPath)) fail("Missing config/skills/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8").replace(/^\uFEFF/, ""));
for (const skill of registry.skills || []) {
  if (!Array.isArray(skill.metrics) || skill.metrics.length === 0) {
    fail(`Skill '${skill.skill_id}' must declare metrics`);
  }
}

console.log("Metrics validation passed.");
