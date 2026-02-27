# Skill Engine

## Purpose
Minimal orchestration scaffold for versioned skill definitions and guarded execution.

## Components
- `registry.js`: load and query skills from config registry
- `workflow-runner.js`: execute declarative skill steps with guard checks
- `decision-hooks.js`: pluggable decision interfaces
- `orchestrator.js`: context-driven intent classification, skill scoring, and composition

## Safety
- Skills are metadata-driven and disabled by default.
- Execution requires explicit enabled state and guard checks.
- Compliance and safety context can override selection order.
