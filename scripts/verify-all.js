const { spawnSync } = require("child_process");

const steps = [
  "npm run env:check",
  "npm run config:validate",
  "npm run arch:validate",
  "npm run contracts:verify",
  "npm run test:unit",
  "npm run test:integration",
  "npm run test:e2e",
  "npm run ai:policy-check",
  "npm run accessibility:test",
  "npm run security:policy-check",
  "npm run metrics:verify"
];

for (const step of steps) {
  console.log(`\n▶ ${step}`);
  const result = spawnSync(step, { shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("\nFULL VERIFICATION PASSED");
