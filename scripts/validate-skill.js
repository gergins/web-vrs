const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`SKILL VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const skillPath = path.join(process.cwd(), "skills", "vrs_project_operator", "SKILL.md");
if (!fs.existsSync(skillPath)) {
  fail("Missing skills/vrs_project_operator/SKILL.md");
}

const text = fs.readFileSync(skillPath, "utf8").replace(/^\uFEFF/, "");

const requiredFrontmatter = [
  "name:",
  "description:",
  "domain:",
  "owner:",
  "version:",
  "last_updated:"
];

for (const key of requiredFrontmatter) {
  if (!text.includes(key)) fail(`Missing frontmatter key '${key}'`);
}

const requiredHeadings = [
  "## Inputs Required",
  "## Outputs Required",
  "## Tool Permissions",
  "## Policy and Guardrails",
  "## Observability",
  "## Skill Lifecycle",
  "## Execution Workflow",
  "## Verification Matrix",
  "## Completion Quality Bar"
];

for (const heading of requiredHeadings) {
  if (!text.includes(heading)) fail(`Missing required section '${heading}'`);
}

console.log("Skill validation passed.");
