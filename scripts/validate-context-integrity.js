const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CONTEXT INTEGRITY VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const schemaPath = path.join(process.cwd(), "schemas", "context", "context-schema.json");
const configPath = path.join(process.cwd(), "config", "context-integrity.json");
const serviceFile = path.join(process.cwd(), "services", "context", "src", "context-service.js");
const storeFile = path.join(process.cwd(), "services", "context", "src", "context-store.js");
const testFile = path.join(process.cwd(), "services", "context", "tests", "context-service.test.js");

if (!fs.existsSync(schemaPath)) fail("Missing schemas/context/context-schema.json");
if (!fs.existsSync(configPath)) fail("Missing config/context-integrity.json");
if (!fs.existsSync(serviceFile)) fail("Missing services/context/src/context-service.js");
if (!fs.existsSync(storeFile)) fail("Missing services/context/src/context-store.js");
if (!fs.existsSync(testFile)) fail("Missing services/context/tests/context-service.test.js");

const config = loadJson(configPath);
if (!Array.isArray(config.kinds) || config.kinds.length < 4) {
  fail("context-integrity.kinds must include at least 4 context kinds");
}
if (config?.versioning?.required !== true) {
  fail("context-integrity.versioning.required must be true");
}
if (!Array.isArray(config.integrity_rules) || config.integrity_rules.length < 3) {
  fail("context-integrity.integrity_rules must include at least 3 rules");
}

console.log("Context integrity validation passed.");
