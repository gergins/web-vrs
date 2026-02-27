const { spawnSync } = require("child_process");
const steps = ["npm run test:context", "npm run test:skills", "npm run test:signaling:e2e"];
for (const cmd of steps) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log("Integration tests passed.");
