const fs = require("fs");
const path = require("path");

const p = path.join(process.cwd(), "config", "env", "required-env.json");
if (!fs.existsSync(p)) {
  console.error("TURN CHECK FAILED: missing config/env/required-env.json");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const signalingVars = manifest.services?.signaling || [];
const needed = ["TURN_URL", "TURN_USERNAME", "TURN_PASSWORD"];
for (const key of needed) {
  if (!signalingVars.includes(key)) {
    console.error(`TURN CHECK FAILED: required signaling env '${key}' not declared`);
    process.exit(1);
  }
}

console.log("TURN/STUN declaration checks passed.");
