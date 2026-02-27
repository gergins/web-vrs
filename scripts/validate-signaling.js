const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`SIGNALING VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) fail(`Missing ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const configPath = path.join(process.cwd(), "config", "vrs.config.json");
const featureFlagsPath = path.join(process.cwd(), "config", "feature-flags.json");
const serverPath = path.join(process.cwd(), "services", "signaling", "src", "server.js");
const dockerfilePath = path.join(process.cwd(), "services", "signaling", "Dockerfile");
const e2eTestPath = path.join(process.cwd(), "services", "signaling", "tests", "signaling-drain.e2e.test.js");

const config = readJson(configPath);
const flags = readJson(featureFlagsPath);

if (config?.signaling?.transport !== "wss") {
  fail("External signaling transport must be 'wss'");
}
if (config?.signaling?.tls_required !== true) {
  fail("TLS must be required for signaling");
}
if (!fs.existsSync(serverPath)) {
  fail("Missing services/signaling/src/server.js");
}
const serverText = fs.readFileSync(serverPath, "utf8");
if (!serverText.includes("/sipws")) {
  fail("Signaling server must expose /sipws websocket upgrade path");
}
if (!fs.existsSync(dockerfilePath)) {
  fail("Missing services/signaling/Dockerfile");
}
if (!fs.existsSync(e2eTestPath)) {
  fail("Missing services/signaling/tests/signaling-drain.e2e.test.js");
}
if (flags?.signaling?.reject_invite_when_draining !== true) {
  fail("Feature flag signaling.reject_invite_when_draining must be true");
}

console.log("Signaling validation passed.");
