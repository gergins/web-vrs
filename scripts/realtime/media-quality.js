const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`MEDIA QUALITY CHECK FAILED: ${message}`);
  process.exit(1);
}

const checklistPath = path.join(process.cwd(), "docs", "globalization", "global-vrs-execution-checklist.md");
if (!fs.existsSync(checklistPath)) fail("missing globalization checklist");
const text = fs.readFileSync(checklistPath, "utf8").toLowerCase();

const required = ["latency", "packet-loss", "qos/qoe dashboards"];
for (const marker of required) {
  if (!text.includes(marker)) fail(`checklist missing '${marker}' guidance`);
}

console.log("Media quality baseline checks passed.");
