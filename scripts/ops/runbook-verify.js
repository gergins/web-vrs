const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`RUNBOOK VERIFY FAILED: ${message}`);
  process.exit(1);
}

function read(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}`);
  return fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
}

const liveOps = read("docs/architecture/live-operations.md");
const requiredLiveOps = ["## Rollout Sequence", "## Rollback Trigger", "/admin/drain"];
for (const marker of requiredLiveOps) {
  if (!liveOps.includes(marker)) fail(`live-operations missing '${marker}'`);
}

const procurement = read("docs/workflows/sweden-procurement-workflow.md");
if (!procurement.toLowerCase().includes("incident")) {
  fail("sweden-procurement-workflow must include incident flow references");
}

const checklist = read("docs/globalization/global-vrs-execution-checklist.md");
if (!checklist.toLowerCase().includes("incident response baseline runbook")) {
  fail("global-vrs-execution-checklist missing incident runbook baseline");
}

console.log("Runbook coverage checks passed.");
