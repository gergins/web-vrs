const { spawnSync } = require("child_process");

const steps = [
  "npm ci",
  "npm run structure:update"
];

for (const cmd of steps) {
  const result = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("Developer setup complete.");
