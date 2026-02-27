const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "seed-summary.json");

const summary = {
  seeded_at: new Date().toISOString(),
  interpreters_seed_source: "config/workforce-profiles",
  country_profiles_source: "config/country-profiles"
};

fs.writeFileSync(out, JSON.stringify(summary, null, 2), "utf8");
console.log(`Data seed summary written to ${path.relative(process.cwd(), out)}`);
