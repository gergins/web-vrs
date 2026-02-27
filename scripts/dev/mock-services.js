const fs = require("fs");
const path = require("path");

const required = [
  "services/signaling/src/server.js",
  "services/ai/src/assignment-recommender.js",
  "services/context/src/context-service.js"
];

for (const rel of required) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.error(`MOCK SERVICES FAILED: missing ${rel}`);
    process.exit(1);
  }
}

console.log("Mock service dependencies are present.");
console.log("Use run:signaling and service tests as local mocks.");
