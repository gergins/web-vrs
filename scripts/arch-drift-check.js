const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`ARCH DRIFT CHECK FAILED: ${message}`);
  process.exit(1);
}

const mapPath = path.join(process.cwd(), "config", "architecture", "service-map.json");
if (!fs.existsSync(mapPath)) {
  fail("Missing config/architecture/service-map.json");
}

const map = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, ""));
if (map.schema_version !== "1.0.0") {
  fail("schema_version must be 1.0.0");
}

const requiredPaths = map.required_paths;
if (!Array.isArray(requiredPaths) || requiredPaths.length === 0) {
  fail("required_paths must be a non-empty array");
}

const missing = requiredPaths.filter((rel) => !fs.existsSync(path.join(process.cwd(), rel)));
if (missing.length > 0) {
  fail(`Missing required architecture paths -> ${missing.join(", ")}`);
}

console.log("Architecture drift check passed.");
