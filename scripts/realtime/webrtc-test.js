const { spawnSync } = require("child_process");
const result = spawnSync("npm run test:signaling:e2e", { shell: true, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status || 1);
console.log("WebRTC/signal runtime test passed.");
