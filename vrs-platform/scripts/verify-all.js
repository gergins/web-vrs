import { execSync } from "child_process";

const steps = [
  "npm run test:e2e"
];

for (const step of steps) {
  console.log(`Running ${step}`);
  execSync(step, { stdio: "inherit" });
}

console.log("Starter verification sequence passed");
