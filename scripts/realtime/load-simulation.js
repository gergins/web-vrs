const { spawnSync } = require("child_process");
const steps = ["npm run test:callflow", "npm run test:callflow:failures"];
for (const cmd of steps) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log("Call load simulation baseline passed.");
