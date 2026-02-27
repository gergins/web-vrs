# VRS Skill Pattern Alignment

## Purpose
Apply only VRS-relevant skill patterns from upstream agent-skill ecosystems to this repository.

## In Scope
- `SKILL.md` as the canonical per-skill contract
- optional `references/` for domain evidence (regulatory, telecom, accessibility)
- optional `scripts/` for deterministic checks and repeatable workflow actions
- minimal skill composition (primary + supporting skills)
- explicit guardrails and verification gates

## Selected Upstream Sources (VRS-Relevant Only)
Use these as pattern sources, not as blind imports:
- curated multi-skill ecosystems (for structure and workflow patterns)
- backend/database skill sets (for schema, performance, security patterns)
- workflow-oriented skill examples (for delivery automation and engineering loops)

Selection filter before adoption:
1. Must improve VRS reliability, accessibility, routing, compliance, or incident response.
2. Must not introduce non-VRS product drift.
3. Must remain compatible with repository verification gates.

## Out of Scope
- generic non-VRS demo skills
- marketplace/distribution features not needed for production VRS delivery
- autonomous behavior without policy and compliance gating

## Required Per-Skill Structure
1. Frontmatter: `name`, `description`, `domain`, `owner`, `version`, `last_updated`
2. Mission and responsibilities
3. Inputs and outputs
4. Guardrails and policy constraints
5. Verification hooks or linked gates

## Repository Mapping
- Project operator skill:
  - `skills/vrs_project_operator/SKILL.md`
- VRS domain collection:
  - `skills/vrs/COLLECTION.md`
  - `skills/vrs/*/SKILL.md`
- Skill execution logic:
  - `services/skill-engine/src/orchestrator.js`
  - `services/skill-engine/src/workflow-runner.js`
- Skill validation gates:
  - `scripts/validate-skill.js`
  - `scripts/validate-skills.js`
  - `npm run test:skills`

## Category to VRS Trait Mapping
| Upstream category | VRS trait improved | Target local skills |
|---|---|---|
| Frontend and accessibility patterns | Deaf-first UX and visual clarity | `accessibility-ux`, `realtime-communication` |
| Backend and data patterns | Session integrity, routing data quality, analytics reliability | `interpreter-routing`, `compliance-security` |
| Realtime and infra patterns | Call stability, low-latency operations, scaling | `webrtc-ops`, `realtime-communication`, `incident-response` |
| DevOps and quality patterns | Release safety, incident readiness, operational consistency | `incident-response`, `compliance-security` |
| AI workflow patterns | Assistive-only AI with human control and guardrails | `ai-assistive`, `compliance-security` |

## Adoption Rules
- Keep new skills `catalog-only` by default unless explicitly enabled.
- Additive updates only; no breaking skill schema changes without version bump.
- Every skill-related change must pass:
  - `npm run validate:skill`
  - `npm run validate:skills`
  - `npm run test:skills`
  - `npm run verify`

## VRS-Only Priority
Prioritize patterns that improve:
- relay reliability
- interpreter routing quality
- accessibility outcomes
- compliance and audit readiness
- incident recovery speed

## Related
- acquisition and fork strategy: `docs/operating/vrs-skill-acquisition-plan.md`
