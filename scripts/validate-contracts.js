const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CONTRACT VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const requiredFiles = [
  "docs/contracts/openapi/session-api.yaml",
  "docs/contracts/openapi/interpreter-api.yaml",
  "docs/contracts/asyncapi/event-stream.yaml",
  "docs/contracts/realtime-token-flow.md",
  "docs/architecture/frontend-backend-integration-map.md"
];

for (const file of requiredFiles) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) fail(`Missing required contract artifact: ${file}`);
}

function mustContain(file, text) {
  const content = fs.readFileSync(path.join(process.cwd(), file), "utf8").replace(/^\uFEFF/, "");
  if (!content.includes(text)) fail(`${file} must include '${text}'`);
}

mustContain("docs/contracts/openapi/session-api.yaml", "openapi: 3.0.3");
mustContain("docs/contracts/openapi/interpreter-api.yaml", "openapi: 3.0.3");
mustContain("docs/contracts/asyncapi/event-stream.yaml", "asyncapi:");
mustContain("docs/contracts/realtime-token-flow.md", "short-lived realtime token");

console.log("Contract validation passed.");
