const assert = require("assert");
const { recommendInterpreter } = require("../src/assignment-recommender");

const ranked = recommendInterpreter({
  language: "ASL",
  priority: "urgent",
  interpreters: [
    { id: "i2", available: true, languages: ["ASL"], activeSessions: 2, experience: 5 },
    { id: "i1", available: true, languages: ["ASL"], activeSessions: 0, experience: 4 }
  ]
});

assert.strictEqual(ranked[0].id, "i1");
assert.ok(ranked[0].score > ranked[1].score);
console.log("AI assignment recommender tests passed.");
