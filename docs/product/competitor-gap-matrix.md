# Competitor Gap Matrix (Public Feature Benchmark)

## Purpose
Track publicly observed VRS capabilities in mature providers and compare against this repository's current implementation status.

## Method
- Source set: public product/marketing pages only.
- Use this as product planning input, not as legal/compliance proof.
- Apply `docs/product/feature-gate-matrix.md` before implementation.

## Legend
- `Implemented`: available in current repository behavior
- `Partial`: scaffolded or planned, not end-to-end
- `Missing`: not implemented yet

## Matrix
| Capability | Publicly Observed in Mature VRS Providers | Current Status | Priority | Suggested Phase |
|---|---|---|---|---|
| Secure signaling and encrypted media | Yes | Partial | P0 | Phase 2-3 |
| Browser-based Deaf caller experience | Yes | Partial | P0 | Phase 2-3 |
| Interpreter role-specific console | Yes | Missing | P0 | Phase 4 |
| Deterministic queue + interpreter assignment | Yes | Partial | P0 | Phase 4 |
| Cross-device continuity (same identity across devices) | Yes | Missing | P1 | Phase 4-5 |
| Primary reachable number model | Yes | Missing | P1 | Phase 4-5 |
| Hearing-party companion video join experience | Yes | Missing | P1 | Phase 4-5 |
| Specialized user pathways (workplace/minors/DeafBlind/language variants) | Yes | Missing | P2 | Phase 5-6 |
| Interoperability with external videophones/SIP endpoints | Yes | Partial | P1 | Phase 3-5 |
| Emergency policy UX and disclosures | Yes | Missing | P0 | Phase 5-6 |
| Structured operations visibility (health/alerts/rollback) | Yes | Partial | P0 | Phase 5 |
| Customer support contact and escalation flows | Yes | Missing | P2 | Phase 5-6 |

## Current Strengths in This Repo
- Production policy and verification gates are enforced (`npm run verify`).
- Deterministic callflow and failure-path tests are in place.
- Signaling runtime includes readiness/liveness and drain behavior for live updates.
- AI assist modules are bounded by policy guardrails.

## Highest-Value Gaps (Procurement Impact)
1. Interpreter console and assignment workflow end-to-end.
2. Device/identity continuity and primary number model.
3. Compliance-facing emergency call policy UX and audit flows.
4. Full media runtime integration (TURN/STUN + SRTP enforcement at runtime).

## Decision Rule
Before implementing any item above:
1. Score it with `docs/product/feature-gate-matrix.md`.
2. Define acceptance tests and failure-path tests.
3. Add/update verification gates if behavior affects reliability/security.
