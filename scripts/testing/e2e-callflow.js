const { spawnSync } = require("child_process");
const r = spawnSync("npm run test:callflow", { shell: true, stdio: "inherit" });
if (r.status !== 0) process.exit(r.status || 1);
console.log("E2E callflow tests passed.");
