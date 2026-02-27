---
name: vrs_project_operator
description: Project-local operating skill for building and evolving a production SIP/WebRTC Video Relay Service with deterministic behavior and strict verification gates.
domain: vrs_fullstack_engineering
owner: project-maintainers
version: 1.15.0
last_updated: 2026-02-19
---

# VRS Project Operator Skill

## When To Use
Use for technical changes in this repository affecting VRS UI, signaling, media policy, state/session logic, interpreter routing, reliability, or deployment readiness.

## When Not To Use
- unrelated tasks outside this repository
- purely creative writing with no engineering change
- disposable prototypes explicitly marked as non-production

## Authoritative Sources (Priority Order)
1. `AGENTS.md`
2. `docs/domain/vrs-domain-spec.md`
3. `docs/production-plan.md`
4. `docs/architecture/system-architecture.md`
5. `package.json` scripts and repository tests

## Context Layer
Ground all actions in:
- repository files and command outputs
- domain state model and routing rules
- active workflow and verification gates

Do not infer missing behavior when file evidence is absent; declare assumptions explicitly.

## Inputs Required
- current repository state
- user task scope and acceptance criteria
- relevant files in `config/`, `schemas/`, `tests/`, `services/`, `infra/healthchecks/`

## Outputs Required
- minimal targeted changes
- response with `Evidence`, `Change`, `Validation`, `Assumptions`
- passing required verification gates, or explicit blocker

## Tool Permissions
Allowed:
- read/write within repository
- run local verification/test commands
- update architecture and structure docs

Restricted:
- destructive repo actions unless explicitly requested
- external deployment actions without explicit approval

## Policy and Guardrails
- no rebuild-from-scratch unless explicitly requested
- preserve backward compatibility unless breakage is approved
- reject plaintext external signaling
- no hardcoded credentials/secrets
- enforce deterministic state transitions
- fail fast on invalid config/schema/test results

## Execution Workflow
1. Inspect relevant files and cite them.
2. Run baseline verification: `npm run verify`.
3. For new features, apply `docs/product/feature-gate-matrix.md` and document decision.
4. Apply minimal scoped edits.
5. If files/folders changed, run `npm run structure:update`.
6. Re-run verification and targeted tests.
7. Report risks, assumptions, and any unverified items.

## Verification Matrix
- skill structure compliance -> `npm run validate:skill`
- transport/media/security policy -> `npm run validate:config`
- multi-frontend manifest integrity -> `npm run validate:frontend-manifest`
- integration contract integrity -> `npm run validate:contracts`
- country profile pack integrity -> `npm run validate:country-profiles`
- workforce profile pack integrity -> `npm run validate:workforce-profiles`
- capability registry/policy integrity -> `npm run validate:capabilities`
- capability rollout policy integrity -> `npm run validate:capability-rollout`
- ethics framework integrity -> `npm run validate:ethics`
- ethics workflow lifecycle integrity -> `npm run validate:ethics-workflow`
- context memory integrity -> `npm run validate:context-integrity`
- skill registry/workflow guardrail integrity -> `npm run validate:skills`
- signaling deployment safety -> `npm run validate:signaling`
- state determinism -> `npm run validate:state`
- signaling route behavior -> `npm run test:signaling`
- signaling runtime drain behavior -> `npm run test:signaling:e2e`
- ai assist-mode policy -> `npm run test:ai`
- context service behavior -> `npm run test:context`
- skill engine workflow execution behavior -> `npm run test:skills`
- canonical call lifecycle -> `npm run test:callflow`
- failure behavior -> `npm run test:callflow:failures`
- aggregate release gate -> `npm run verify`

## Deployment Block Rules
Block completion/deploy when any is true:
- verification command fails
- TLS/SRTP policy missing/downgraded
- hardcoded secret detected
- changed behavior lacks matching tests
- health checks fail for deployment-bound changes

## Failure Playbooks
- interpreter unavailable -> deterministic end/requeue path, then retest failure suite
- signaling timeout -> deterministic termination/retry path, preserve correlation IDs, retest
- media negotiation failure -> fail closed, log policy reason, retest config + callflow suites

## Observability
Track per task:
- commands executed and pass/fail outcomes
- files touched and structural changes
- verification duration and failure cause
- user overrides or unresolved assumptions

## Skill Lifecycle
1. Design
2. Validate
3. Deploy (to repo workflow)
4. Monitor outcomes
5. Improve incrementally
6. Deprecate only with replacement guidance

## Completion Quality Bar
Complete only when:
- requested scope is implemented
- required gates pass
- response sections are present and evidence-based
- assumptions are explicit and minimal

## Versioning and Change Log
- `1.15.0` (2026-02-19): Added skill registry/workflow validation and skill-engine behavior tests to release gates.
- `1.14.0` (2026-02-19): Added context-integrity platform validation and context service tests to release gates.
- `1.13.0` (2026-02-19): Added frontend-backend integration contract validation (OpenAPI/AsyncAPI/token-flow) to release gates.
- `1.12.0` (2026-02-19): Added multi-frontend build manifest validation and CI pipeline readiness controls.
- `1.11.0` (2026-02-19): Added enforceable capability rollout policy (supported vs enabled controls) to release gates.
- `1.10.0` (2026-02-19): Added enforceable ethics-by-design lifecycle workflow validation and release-gate integration.
- `1.9.0` (2026-02-19): Added enforceable AI ethics policy validation and verify-gate integration.
- `1.8.0` (2026-02-19): Added capability-registry policy validation and verify-gate enforcement for admin-controlled feature expansion.
- `1.7.0` (2026-02-19): Added reusable workforce-profile validation and verify-gate enforcement for interpreter workforce models.
- `1.6.0` (2026-02-19): Added reusable country-profile pack validation and verify-gate enforcement for global rollout readiness.
- `1.5.0` (2026-02-19): Added mandatory feature-gate matrix step for new feature decisions (`docs/product/feature-gate-matrix.md`).
- `1.4.0` (2026-02-19): Added signaling runtime E2E drain test and container/runtime validation hooks.
- `1.3.0` (2026-02-19): Added signaling/AI verification gates and live-operations deployment alignment (drain/readiness/canary support).
- `1.2.0` (2026-02-19): Added full reusable skill framework sections (domain/owner, context, tools, guardrails, observability, lifecycle) and linked `validate:skill`.
- `1.1.0` (2026-02-19): Added mandatory structure refresh step (`npm run structure:update`) after structural changes.
- `1.0.0` (2026-02-19): Initial project-local skill extracted from repository policy, domain spec, and production plan.








