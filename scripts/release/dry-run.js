const fs = require("fs");
const path = require("path");

const required = [
  "infra/deploy/k8s/signaling-deployment.yaml",
  "infra/deploy/k8s/signaling-canary.yaml",
  "infra/deploy/policies/deployment-policy.md"
];

for (const rel of required) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.error(`DEPLOY DRY RUN FAILED: missing ${rel}`);
    process.exit(1);
  }
}

console.log("Deployment dry-run checks passed.");
