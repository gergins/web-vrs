---
name: vrs-interpreter-routing
description: Designs and validates interpreter matching, queueing, and handoff workflows for VRS.
domain: vrs_skill_collection
owner: project-maintainers
version: 1.0.0
last_updated: 2026-02-20
---

# vrs-interpreter-routing

## Mission
Route sessions to the best qualified interpreter with deterministic policies.

## Responsibilities
- Define skill-based routing and priority queues
- Design handoff and escalation paths
- Tune fairness, wait-time, and utilization tradeoffs

## Inputs
- Interpreter skills and availability
- User preferences and policy constraints
- Queue and SLA metrics

## Outputs
- Routing rules
- Queue policy updates
- SLA impact analysis

## Guardrails
- Human and policy constraints override optimization goals
- Emergency and safety routing must remain deterministic
- Avoid hidden routing heuristics
