const assert = require("assert");
const { getSkill } = require("../src/registry");
const { runWorkflow } = require("../src/workflow-runner");
const hooks = require("../src/decision-hooks");

const skill = getSkill("interpreter_matching", "1.0.0");
assert.ok(skill, "interpreter_matching skill should exist");
const enabledSkill = { ...skill, enabled: true };

const result = runWorkflow(
  enabledSkill,
  {
    checks: {
      contract_valid: true,
      ethics_valid: true,
      context_integrity_valid: true
    },
    candidates: [
      { interpreter_id: "i2", score: 20 },
      { interpreter_id: "i1", score: 30 }
    ]
  },
  {
    scoreInterpreterCandidates: hooks.scoreInterpreterCandidates
  }
);

assert.strictEqual(result.skill_id, "interpreter_matching");
assert.strictEqual(result.executed_steps.length, 3);
assert.strictEqual(result.executed_steps[0].output[0].interpreter_id, "i1");

console.log("Skill engine tests passed.");
