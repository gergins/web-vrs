const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`GDPR CHECK FAILED: ${message}`);
  process.exit(1);
}

function loadJson(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}`);
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const targetCodes = new Set(["EU", "FR", "SE", "GB"]);
const profilesDir = path.join(process.cwd(), "config", "country-profiles");
const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json") && !["schema.json", "template.json"].includes(f));

for (const f of files) {
  const profile = loadJson(path.join("config", "country-profiles", f));
  const code = String(profile.country_code || "").toUpperCase();
  if (!targetCodes.has(code)) continue;

  const frameworks = profile?.compliance?.privacy_frameworks || [];
  const hasGdpr = Array.isArray(frameworks) && frameworks.some((x) => String(x).toLowerCase().includes("gdpr"));
  if (!hasGdpr) {
    fail(`${f} (${code}) missing GDPR-related privacy framework`);
  }
}

const ethics = loadJson("config/capabilities/ethics-policy.json");
if (ethics?.guardrails?.consent_management_required !== true) {
  fail("ethics-policy must enforce guardrails.consent_management_required=true");
}

const requiredKpis = ethics?.kpis?.required || [];
if (!Array.isArray(requiredKpis) || !requiredKpis.includes("data_retention_compliance")) {
  fail("ethics-policy must require data_retention_compliance KPI");
}

console.log("GDPR compliance checks passed.");
