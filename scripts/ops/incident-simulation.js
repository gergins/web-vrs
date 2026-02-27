const { spawnSync } = require("child_process");
const r = spawnSync("npm run test:callflow:failures", { shell: true, stdio: "inherit" });
if (r.status !== 0) process.exit(r.status || 1);
console.log("Incident simulation passed.");
