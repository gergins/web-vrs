# Skill Orchestration Spec

## Purpose
Define production-grade orchestration for VRS skills so selection is context-driven, composable, and safety-governed.

## High-Level Flow
1. Build context from request and runtime signals.
2. Classify intent.
3. Score available skills.
4. Select primary and supporting skills.
5. Execute according to operational mode.
6. Persist outcomes and state updates.

## Context Builder Inputs
- User request text or system event
- Priority and user type
- Telemetry signals (for example packet loss spikes, queue delays)
- Compliance flags
- Prior execution mode hints

## Intent Map
- `architecture` -> `realtime-communication`
- `operations` -> `webrtc-operations`
- `matching` -> `interpreter-routing`
- `ux` -> `accessibility-ux`
- `compliance` -> `compliance-security`
- `ai_tooling` -> `ai-assistive`
- `incident` -> `incident-response`
- `scale` -> `realtime-communication`

## Skill Scoring Model
`score = intent_match + domain_match + signal_match + priority_weight`

Scoring guidance:
- intent match: highest weight
- safety/compliance impact: highest weight
- user impact and system health: high weight
- optimization and exploration: lower weight

## Composition Rule
- Primary skill defines strategy.
- Supporting skills constrain and refine outputs.
- Typical compositions:
  - latency spike: `webrtc-operations` + `realtime-communication` + `incident-response`
  - feature rollout: `realtime-communication` + `accessibility-ux` + `compliance-security`
  - queue delay: `interpreter-routing` + `ai-assistive`

## Safety Override
When compliance flags are present, `compliance-security` becomes primary, regardless of baseline score.

## Operational Modes
- `advisory`: recommend actions only
- `assisted`: execute diagnostics automatically
- `autonomous`: execute remediation workflows (only when explicitly allowed)

## Governance Requirements
Human approval required for:
- policy changes
- AI capability rollouts
- external incident communications

## Current Implementation References
- `services/skill-engine/src/orchestrator.js`
- `services/skill-engine/src/registry.js`
- `services/skill-engine/src/workflow-runner.js`
- `services/skill-engine/tests/orchestrator.test.js`
