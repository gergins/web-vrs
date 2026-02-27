const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`WORKFORCE PROFILE VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const dir = path.join(process.cwd(), "config", "workforce-profiles");
if (!fs.existsSync(dir)) fail("Missing config/workforce-profiles directory");

const schemaPath = path.join(dir, "schema.json");
if (!fs.existsSync(schemaPath)) fail("Missing config/workforce-profiles/schema.json");
const schema = loadJson(schemaPath);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "schema.json");
if (files.length === 0) fail("No workforce profile JSON files found");

for (const file of files) {
  const full = path.join(dir, file);
  const profile = loadJson(full);

  for (const key of schema.required) {
    if (!(key in profile)) fail(`${file} missing required key '${key}'`);
  }

  if (!schema.employment_model_allowed.includes(profile.employment_model)) {
    fail(`${file} has invalid employment_model '${profile.employment_model}'`);
  }
  if (!schema.kpi_mode_allowed.includes(profile.kpi_mode)) {
    fail(`${file} has invalid kpi_mode '${profile.kpi_mode}'`);
  }
  if (!Array.isArray(profile.scheduling_modes) || profile.scheduling_modes.length === 0) {
    fail(`${file}.scheduling_modes must be a non-empty array`);
  }
  if (typeof profile.reporting_required !== "boolean") {
    fail(`${file}.reporting_required must be boolean`);
  }

  const wb = profile.wellbeing_controls || {};
  if (typeof wb.structured_breaks !== "boolean") {
    fail(`${file}.wellbeing_controls.structured_breaks must be boolean`);
  }
  if (typeof wb.max_continuous_minutes !== "number" || wb.max_continuous_minutes <= 0) {
    fail(`${file}.wellbeing_controls.max_continuous_minutes must be positive number`);
  }
  if (typeof wb.fatigue_alerts !== "boolean") {
    fail(`${file}.wellbeing_controls.fatigue_alerts must be boolean`);
  }

  const cert = profile.certification_tracking || {};
  if (typeof cert.required !== "boolean") {
    fail(`${file}.certification_tracking.required must be boolean`);
  }
  if (typeof cert.renewal_tracking !== "boolean") {
    fail(`${file}.certification_tracking.renewal_tracking must be boolean`);
  }
  if (typeof cert.continuing_education_tracking !== "boolean") {
    fail(`${file}.certification_tracking.continuing_education_tracking must be boolean`);
  }
}

console.log("Workforce profile validation passed.");
