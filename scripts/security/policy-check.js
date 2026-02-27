const { spawnSync } = require("child_process");
const steps = ["npm run validate:config", "npm run validate:ethics", "npm run validate:state"];
for (const cmd of steps) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log("Security policy checks passed.");
