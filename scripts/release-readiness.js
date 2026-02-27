const { spawnSync } = require("child_process");

const checks = [
  "npm run verify",
  "npm run arch:drift-check",
  "npm run ops:healthcheck",
  "npm run metrics:validate"
];

for (const cmd of checks) {
  const result = spawnSync(cmd, {
    shell: true,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    console.error(`RELEASE READINESS FAILED: '${cmd}' exited with code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log("Release readiness checks passed.");
