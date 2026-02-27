const fs = require("fs");
const path = require("path");

const docPath = path.join(process.cwd(), "docs", "architecture", "system-architecture.md");
const text = fs.readFileSync(docPath, "utf8").toLowerCase();
const required = ["session_id", "correlation_id"];
for (const marker of required) {
  if (!text.includes(marker)) {
    console.error(`LOG LINT FAILED: missing '${marker}' logging requirement`);
    process.exit(1);
  }
}
console.log("Log lint checks passed.");
