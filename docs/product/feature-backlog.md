# Feature Backlog

Purpose: Single place to track planned and in-progress product features before implementation.

Workflow rules:
- Evaluate every new feature against `docs/product/feature-gate-matrix.md` before coding.
- Keep changes additive and backward-compatible unless explicit approval exists.
- For AI capabilities, also complete `docs/ai/intake/capability-intake-template.md` and register in `config/capabilities/registry.json` with safe default rollout.

## Backlog Table

| ID | Feature | Problem | Users | Priority | Status | Gate Decision | Owner | Target Release | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FEAT-001 | Fullscreen stage with draggable self-preview | In-call visibility and control in fullscreen mode needed | Deaf user, Interpreter | High | Done | APPROVE |  |  | Implemented in web + interpreter layouts |
| FEAT-002 | Separate RTT field (not chat) | Need live text stream independent from persisted chat | Deaf user, Interpreter | High | Done | APPROVE |  |  | Implemented with `rtt-update` signaling |
| FEAT-003 | Chat typing indicator + timestamp + per-session persistence | Improve text relay clarity and continuity | Deaf user, Interpreter | Medium | Done | APPROVE |  |  | Implemented in both UIs |

## Feature Record Template

Copy this section for each new feature request.

```md
Feature ID:
Feature Name:
Owner:
Date:

Problem Statement:
Target Users:
Expected Outcome:

Scope:
- In Scope:
- Out of Scope:

Dependencies:

Feature Gate Result:
- Total Score: X/40
- Security/Compliance: X/5
- Reliability/Operations: X/5
- Integration Readiness: X/5
- Decision: APPROVE | DEFER | REJECT

Validation Plan:
- Unit/Integration:
- E2E/Manual:
- `npm run verify`:

Rollout Plan:
- Default state:
- Rollback:
- Observability:

Risks/Assumptions:
```

