const fs = require("fs");
const path = require("path");

const docPath = path.join(process.cwd(), "docs", "architecture", "system-architecture.md");
if (!fs.existsSync(docPath)) {
  console.error("TRACE CHECK FAILED: missing system architecture doc");
  process.exit(1);
}

const text = fs.readFileSync(docPath, "utf8").toLowerCase();
const required = ["correlation", "structured logs"];
for (const marker of required) {
  if (!text.includes(marker)) {
    console.error(`TRACE CHECK FAILED: missing '${marker}' in system architecture`);
    process.exit(1);
  }
}

console.log("Trace checks passed.");
