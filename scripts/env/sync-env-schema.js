const fs = require("fs");
const path = require("path");

const inPath = path.join(process.cwd(), "config", "env", "required-env.json");
if (!fs.existsSync(inPath)) {
  console.error("ENV SYNC FAILED: missing config/env/required-env.json");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(inPath, "utf8").replace(/^\uFEFF/, ""));
const outPath = path.join(process.cwd(), "docs", "operating", "env-required-vars.md");

const lines = ["# Required Environment Variables", "", `Schema version: ${manifest.schema_version || "unknown"}`, ""];
for (const [service, vars] of Object.entries(manifest.services || {})) {
  lines.push(`## ${service}`);
  for (const v of vars) lines.push(`- ${v}`);
  lines.push("");
}

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Environment schema synced to ${path.relative(process.cwd(), outPath)}`);
