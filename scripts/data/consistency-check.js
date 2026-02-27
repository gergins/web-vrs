const fs = require("fs");
const path = require("path");

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), "utf8").replace(/^\uFEFF/, ""));
}

const skills = load("config/skills/registry.json");
const workforceDir = path.join(process.cwd(), "config", "workforce-profiles");
const workforceFiles = fs.readdirSync(workforceDir).filter((f) => f.endsWith(".json") && f !== "schema.json");

if ((skills.skills || []).length === 0) {
  console.error("DATA CONSISTENCY FAILED: no skills configured");
  process.exit(1);
}

if (workforceFiles.length === 0) {
  console.error("DATA CONSISTENCY FAILED: no workforce profiles configured");
  process.exit(1);
}

console.log("Data consistency checks passed.");
