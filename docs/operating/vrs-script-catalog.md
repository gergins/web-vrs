# VRS Script Catalog

## Purpose
Provide a GitHub-style script taxonomy for full-stack VRS workflows, mapped to current repository commands.

## Current Script Taxonomy
### 1. Setup and Bootstrap
- `dev:setup`: install dependencies and refresh structure map.

### 2. Environment and Configuration
- `env:check` -> `env:validate`
- `config:validate` -> `validate:config`

### 3. Architecture and Code Integrity
- `arch:validate` -> `arch:drift-check`
- `contracts:verify` -> `validate:contracts`

### 4. Realtime and Media
- `webrtc:test` -> `test:signaling:e2e`
- `test:signaling` for signaling parser/router behavior

### 5. AI and Decision Logic
- `ai:test` -> `test:ai`
- `ai:policy-check` -> `validate:ethics` + `validate:ethics-workflow`

### 6. Functional and Failure Testing
- `test:e2e` -> `test:callflow`
- `test:failure-paths` -> `test:callflow:failures`
- `test:skills` for skill-engine behavior

### 7. Operational Readiness
- `ops:health` -> `ops:healthcheck`
- `ops:runbook-check` -> runbook coverage verification
- `metrics:verify` -> `metrics:validate`
- `release:prepare` -> `release:readiness`

### 8. Compliance and Accessibility
- `accessibility:test` -> policy/profile accessibility conformance checks
- `compliance:gdpr-check` -> GDPR policy/profile checks
- `audit:logs-verify` -> audit-trail coverage checks

### 9. Aggregate Gate
- `verify`: core validation and test baseline

## Notes
- Aliases are additive and backward-compatible.
- No runtime capability is enabled by adding aliases.
- Release flow can use either canonical names (`validate:*`, `test:*`) or GitHub-style aliases.

## Related
- `docs/operating/vrs-control-stack.md`
- `docs/operating/vrs-artifact-pack.md`
- `docs/operating/vrs-engineering-playbook.md`
- `docs/operating/vrs-maturity-roadmap.md`
