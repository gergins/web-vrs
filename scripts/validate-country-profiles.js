const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`COUNTRY PROFILE VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const dir = path.join(process.cwd(), "config", "country-profiles");
if (!fs.existsSync(dir)) fail("Missing config/country-profiles directory");

const schemaPath = path.join(dir, "schema.json");
if (!fs.existsSync(schemaPath)) fail("Missing config/country-profiles/schema.json");
const schema = loadJson(schemaPath);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "schema.json");
if (files.length === 0) fail("No country profile JSON files found");

function requireKeys(obj, keys, label) {
  for (const key of keys) {
    if (!(key in obj)) fail(`${label} missing required key '${key}'`);
  }
}

for (const file of files) {
  const full = path.join(dir, file);
  const profile = loadJson(full);

  requireKeys(profile, schema.required, file);

  if (!schema.classification_strategy_allowed.includes(profile.classification_strategy)) {
    fail(`${file} has invalid classification_strategy '${profile.classification_strategy}'`);
  }

  requireKeys(profile.regulatory, schema.regulatory_required, `${file}.regulatory`);
  requireKeys(profile.emergency, schema.emergency_required, `${file}.emergency`);
  requireKeys(profile.numbering, schema.numbering_required, `${file}.numbering`);
  requireKeys(profile.interpreter, schema.interpreter_required, `${file}.interpreter`);
  requireKeys(profile.operations, schema.operations_required, `${file}.operations`);
  requireKeys(profile.compliance, schema.compliance_required, `${file}.compliance`);

  if (!Array.isArray(profile.regulatory.accessibility_frameworks) || profile.regulatory.accessibility_frameworks.length === 0) {
    fail(`${file}.regulatory.accessibility_frameworks must be a non-empty array`);
  }
  if (!Array.isArray(profile.compliance.privacy_frameworks) || profile.compliance.privacy_frameworks.length === 0) {
    fail(`${file}.compliance.privacy_frameworks must be a non-empty array`);
  }
}

console.log("Country profile validation passed.");
