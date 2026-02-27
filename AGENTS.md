# AGENTS.md

## Mission
This repository is production-bound. Build by incremental hardening and extension of a live-deployable system.
Do not rebuild from scratch unless explicitly requested by the user.

## Non-Negotiable Rules
- Prefer additive, backward-compatible changes.
- Preserve existing behavior unless breaking change is explicitly approved.
- No plaintext SIP for external signaling paths.
- No hardcoded credentials, API keys, passwords, or tokens.
- Keep call/session state transitions deterministic.
- Fail fast on invalid config or invalid state schema.

## Required Workflow (Every Technical Task)
1. Inspect relevant files before edits and cite them.
2. Run baseline verification before edits.
3. For new features, evaluate against `docs/product/feature-gate-matrix.md` before implementation.
4. For new capabilities, complete `docs/ai/intake/capability-intake-template.md` and keep default status `catalog_only`.
5. Make minimal targeted edits.
6. If folder/file structure changed, run `npm run structure:update`.
7. Re-run full verification after edits.
8. Report residual risks and assumptions.

## Verification Gates
Use project-native equivalents if stack differs, but keep gate intent identical.

Required commands:
- `npm run validate:skill` (skill manifest/framework integrity checks)
- `npm run validate:config` (TLS/SRTP/signaling/codec policy checks)
- `npm run validate:frontend-manifest` (multi-frontend build target manifest integrity checks)
- `npm run validate:contracts` (OpenAPI/AsyncAPI/realtime token-flow contract artifact integrity checks)
- `npm run validate:country-profiles` (global market profile pack integrity checks)
- `npm run validate:workforce-profiles` (interpreter workforce profile pack integrity checks)
- `npm run validate:capabilities` (AI/feature capability registry and policy integrity checks)
- `npm run validate:capability-rollout` (capability rollout policy integrity checks; features disabled by default)
- `npm run validate:ethics` (AI ethics framework and guardrail integrity checks)
- `npm run validate:ethics-workflow` (ethics-by-design lifecycle workflow integrity checks)
- `npm run validate:context-integrity` (context memory model and integrity policy checks)
- `npm run validate:skills` (skill registry/workflow guardrail integrity checks)
- `npm run validate:signaling` (WSS/TLS signaling + drain policy checks)
- `npm run validate:state` (state schema + deterministic transition graph)
- `npm run test:signaling` (REGISTER/INVITE/BYE and drain-mode behavior)
- `npm run test:signaling:e2e` (runtime liveness/readiness + drain flow verification)
- `npm run test:ai` (assist-only AI behavior and policy guard tests)
- `npm run test:context` (context service versioning and integrity behavior tests)
- `npm run test:skills` (skill engine workflow execution behavior tests)
- `npm run test:callflow` (happy path + failure paths)
- `npm run verify` (aggregate gate; must include all checks above)

If these scripts do not exist yet, create them before claiming production readiness.

## Deployment Block Conditions
Deployment must be blocked if any is true:
- Any verification command fails.
- TLS/SRTP enforcement is missing or downgraded.
- Hardcoded secret detected.
- Call-flow tests are failing or missing for changed behavior.
- Health checks are failing for deployment-bound changes.

## Required Evidence in Responses
For technical responses, use exactly these sections:
- Evidence
- Change
- Validation
- Assumptions

Evidence must include:
- File paths inspected/edited.
- Commands run.
- Pass/fail outcomes.
- Explicit note when something was not verified.

## Expected Project Paths (When Present)
- `config/`
- `schemas/`
- `tests/callflow/`
- `infra/healthchecks/`
- `docs/product/feature-gate-matrix.md`
- `docs/ai/intake/capability-intake-template.md`
- `docs/architecture/repo-structure.md`
- `AGENTS.md`

## Change Safety
- Never remove existing production behavior without explicit approval.
- Prefer feature flags, additive configs, and migration-safe schema/API changes.
- Keep observability stable (structured logs + stable event names).

## Scope and Persistence
This policy is the default operating contract for this repository.
If instructions conflict, explicit user instructions take precedence for that task.











