import { spawn } from "child_process";

const services = [
  ["npm", ["run", "start"], { cwd: "services/signaling" }],
  ["npm", ["run", "start"], { cwd: "services/sip-gateway" }],
  ["npm", ["run", "start"], { cwd: "services/assignment" }],
  ["npm", ["run", "start"], { cwd: "services/context" }],
  ["npm", ["run", "start"], { cwd: "services/workforce-forecasting" }],
  ["npm", ["run", "start"], { cwd: "services/ai-assist" }],
  ["npm", ["run", "dev"], { cwd: "apps/web" }],
  ["npm", ["run", "dev"], { cwd: "apps/interpreter" }]
];

services.forEach(([cmd, args, opts]) => {
  spawn(cmd, args, { stdio: "inherit", ...opts });
});
