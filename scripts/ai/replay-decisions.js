const assert = require("assert");
const { recommendInterpreter } = require("../../services/ai/src/assignment-recommender");

const context = {
  preferredLanguage: "ASL",
  urgency: "standard",
  interpreters: [
    { id: "i1", languages: ["ASL"], availability: "available", workload: 0.2 },
    { id: "i2", languages: ["ASL"], availability: "available", workload: 0.4 }
  ]
};

const run1 = recommendInterpreter(context);
const run2 = recommendInterpreter(context);
assert.strictEqual(run1.id, run2.id, "assignment replay must be deterministic");
console.log("AI decision replay passed.");
