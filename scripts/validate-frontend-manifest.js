const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`FRONTEND MANIFEST VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const manifestPath = path.join(process.cwd(), "config", "frontend-apps.json");
if (!fs.existsSync(manifestPath)) {
  fail("Missing config/frontend-apps.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, ""));
if (manifest.schema_version !== "1.0.0") {
  fail("schema_version must be '1.0.0'");
}

if (!Array.isArray(manifest.apps)) {
  fail("apps must be an array");
}

for (const app of manifest.apps) {
  if (!app.id || typeof app.id !== "string") {
    fail("Each app must include a string id");
  }
  if (!app.path || typeof app.path !== "string") {
    fail(`App '${app.id}' must include a string path`);
  }
  if (!app.install_command || typeof app.install_command !== "string") {
    fail(`App '${app.id}' must include install_command`);
  }
  if (!app.build_command || typeof app.build_command !== "string") {
    fail(`App '${app.id}' must include build_command`);
  }
  if (!app.node_version || typeof app.node_version !== "string") {
    fail(`App '${app.id}' must include node_version`);
  }
}

console.log("Frontend manifest validation passed.");
