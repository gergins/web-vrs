const fs = require("fs");
const path = require("path");

const targets = ["node_modules/.cache", ".turbo", "dist", "build", "tmp", "coverage"];
for (const rel of targets) {
  const p = path.join(process.cwd(), rel);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
console.log("Developer clean complete.");
