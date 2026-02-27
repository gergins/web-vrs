const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`OPS HEALTHCHECK FAILED: ${message}`);
  process.exit(1);
}

const required = [
  "infra/healthchecks/liveness.sh",
  "infra/healthchecks/readiness.sh",
  "services/signaling/src/server.js"
];

const missing = required.filter((rel) => !fs.existsSync(path.join(process.cwd(), rel)));
if (missing.length > 0) {
  fail(`Missing operational health assets -> ${missing.join(", ")}`);
}

console.log("Operational healthcheck validation passed.");
