const fs = require("fs");
const path = require("path");

const roots = ["config", "docs", "services", "scripts"];
const patterns = [/AKIA[0-9A-Z]{16}/, /-----BEGIN (RSA|EC|DSA) PRIVATE KEY-----/];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

const hits = [];
for (const root of roots) {
  for (const file of walk(path.join(process.cwd(), root))) {
    const text = fs.readFileSync(file, "utf8");
    for (const pat of patterns) {
      if (pat.test(text)) {
        hits.push(path.relative(process.cwd(), file));
        break;
      }
    }
  }
}

if (hits.length > 0) {
  console.error(`SECRETS CHECK FAILED: suspicious patterns in ${[...new Set(hits)].join(", ")}`);
  process.exit(1);
}

console.log("Secrets scan passed.");
