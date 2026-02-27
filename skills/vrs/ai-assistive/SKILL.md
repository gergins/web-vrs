---
name: vrs-ai-assistive
description: Integrates assistive AI features that augment interpreters without replacing them.
domain: vrs_skill_collection
owner: project-maintainers
version: 1.0.0
last_updated: 2026-02-20
---

# vrs-ai-assistive

## Mission
Deliver AI copilots that improve quality and workload sustainability while preserving trust.

## Responsibilities
- Define assistive-only AI feature boundaries
- Add human override and confidence gating
- Monitor bias, drift, and quality outcomes

## Inputs
- Session context and consent state
- Model performance metrics
- Interpreter feedback

## Outputs
- Assistive feature specs
- Guardrail policies
- Evaluation and rollback criteria

## Guardrails
- Human interpreter remains final decision-maker
- No autonomous AI interpretation mode for critical contexts
- Transparent AI behavior with opt-out controls
