function applyGuards(skill, context) {
  if (!skill || skill.enabled !== true) {
    throw new Error("Skill is not enabled");
  }

  const required = skill.guardrails?.required_checks || [];
  const checks = context?.checks || {};
  for (const c of required) {
    if (checks[c] !== true) {
      throw new Error(`Guard check failed: ${c}`);
    }
  }
}

function runWorkflow(skill, context, hooks) {
  applyGuards(skill, context);
  const steps = skill.workflow?.steps || [];
  const results = [];

  for (const step of steps) {
    if (step.type === "decision") {
      const hook = hooks?.[step.hook];
      if (typeof hook !== "function") throw new Error(`Missing decision hook: ${step.hook}`);
      const out = hook(context);
      results.push({ step_id: step.step_id, output: out });
      continue;
    }

    if (step.type === "action") {
      results.push({ step_id: step.step_id, output: { action: step.action } });
      continue;
    }

    throw new Error(`Unsupported step type: ${step.type}`);
  }

  return {
    skill_id: skill.skill_id,
    version: skill.version,
    executed_steps: results
  };
}

module.exports = { runWorkflow };
