const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`ENV VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const manifestPath = path.join(process.cwd(), "config", "env", "required-env.json");
if (!fs.existsSync(manifestPath)) {
  fail("Missing config/env/required-env.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, ""));
if (manifest.schema_version !== "1.0.0") {
  fail("schema_version must be 1.0.0");
}

const services = manifest.services || {};
const missing = [];

for (const [service, vars] of Object.entries(services)) {
  if (!Array.isArray(vars)) {
    fail(`Service '${service}' must map to an array of env var names`);
  }
  for (const key of vars) {
    if (typeof key !== "string" || key.trim() === "") {
      fail(`Invalid env var key under service '${service}'`);
    }
    if (!process.env[key]) {
      missing.push(`${service}:${key}`);
    }
  }
}

if (missing.length > 0) {
  fail(`Missing required env vars -> ${missing.join(", ")}`);
}

console.log("Environment validation passed.");
