const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`ACCESSIBILITY TEST FAILED: ${message}`);
  process.exit(1);
}

function loadJson(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}`);
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const accessibilitySkill = path.join(process.cwd(), "skills", "vrs", "accessibility-ux", "SKILL.md");
if (!fs.existsSync(accessibilitySkill)) {
  fail("Missing skills/vrs/accessibility-ux/SKILL.md");
}

const ethics = loadJson("config/capabilities/ethics-policy.json");
if (ethics?.principles?.accessibility_equity !== true) {
  fail("ethics-policy must enforce principles.accessibility_equity=true");
}

const profilesDir = path.join(process.cwd(), "config", "country-profiles");
const profileFiles = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json") && !["schema.json", "template.json"].includes(f));
if (profileFiles.length === 0) fail("No country profiles found for accessibility checks");

for (const f of profileFiles) {
  const profile = loadJson(path.join("config", "country-profiles", f));
  const frameworks = profile?.regulatory?.accessibility_frameworks;
  if (!Array.isArray(frameworks) || frameworks.length === 0) {
    fail(`${f} missing regulatory.accessibility_frameworks`);
  }
  if (frameworks.some((x) => String(x).toLowerCase().includes("tbd"))) {
    fail(`${f} has unresolved accessibility framework placeholder`);
  }
}

console.log("Accessibility checks passed.");
