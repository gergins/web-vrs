const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const date = new Date().toISOString();
let commits = "(git log unavailable)";
const result = spawnSync("git log --oneline -n 20", { shell: true, encoding: "utf8" });
if (result.status === 0 && result.stdout) commits = result.stdout.trim();

const lines = ["# Release Notes", "", `Generated: ${date}`, "", "## Recent Commits", "", "```text", commits, "```", ""];
const out = path.join(process.cwd(), "docs", "release-notes-latest.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Release notes written to ${path.relative(process.cwd(), out)}`);
