const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "config", "workforce-profiles");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "schema.json");
if (files.length === 0) {
  console.error("WORKFORCE LOAD SIM FAILED: no profiles");
  process.exit(1);
}

let score = 0;
for (const f of files) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8").replace(/^\uFEFF/, ""));
  score += p.kpi_mode ? 1 : 0;
}

if (score === 0) {
  console.error("WORKFORCE LOAD SIM FAILED: workforce profile KPI modes missing");
  process.exit(1);
}

console.log("Workforce load simulation baseline passed.");
