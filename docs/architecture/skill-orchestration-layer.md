# Skill Orchestration Layer

## Purpose
Convert skill definitions into executable, testable workflow units with policy guardrails.

## Current Scope
- versioned skill registry
- guarded workflow execution
- pluggable decision hooks
- context-driven orchestration module (`services/skill-engine/src/orchestrator.js`)

## Guardrails
- skill execution requires explicit guard checks
- declarative step types only (`decision`, `action`)
- versioned skill metadata and traceable execution output

## Next Steps
- event-driven trigger integration
- decision logging to context/audit store
- rollout states (`catalog_only`, `candidate`, `enabled`)

## Related Docs
- orchestration model spec: `orchestration/skill-orchestration-spec.md`
- microservices mapping: `docs/architecture/skill-orchestration-microservices-mapping.md`
