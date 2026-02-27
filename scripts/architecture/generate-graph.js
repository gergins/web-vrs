const fs = require("fs");
const path = require("path");

const servicesDir = path.join(process.cwd(), "services");
if (!fs.existsSync(servicesDir)) {
  console.error("ARCH GRAPH FAILED: services/ not found");
  process.exit(1);
}

const services = fs.readdirSync(servicesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const lines = ["# Service Dependency Graph", "", "```mermaid", "graph TD"]; 
for (const s of services) {
  lines.push(`  gateway --> ${s.replace(/[^a-zA-Z0-9_]/g, "_")}`);
}
lines.push("```");

const out = path.join(process.cwd(), "docs", "architecture", "service-dependency-graph.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(process.cwd(), out)}`);
