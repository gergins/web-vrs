# Repository Operating Policy

## Project Directive
- Production-bound repository
- Incremental hardening only
- No rebuild unless explicitly requested
- Backward-compatible changes only
- Migration-safe schema/config/API evolution

## Engineering Mode
- Additive modifications
- Minimal targeted edits
- Preserve behavior unless breakage requested

## Deployment Readiness Gate
Before merge:
- Show inspected-file evidence
- Apply minimal edits
- Run verify
- Report residual risks

## Security & Reliability Baseline
- No plaintext SIP for external signaling
- No hardcoded credentials/secrets
- Deterministic session state transitions
- Fail fast on invalid config/state

## Assistant Response Contract
All technical responses must include:
Evidence
Change
Validation
Assumptions
Residual Risks

This policy is default for this repository.
