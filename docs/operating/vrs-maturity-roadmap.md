# VRS Maturity Roadmap

## Stage 1: MVP Platform
Focus: functional baseline.

Capabilities:
- signaling and callflow baseline
- interpreter assignment baseline
- manual monitoring and troubleshooting

Primary scripts:
- `dev:setup`
- `env:check`
- `test:unit`

## Stage 2: Production Platform
Focus: reliability and consistency.

Capabilities:
- e2e callflow checks
- failure-path verification
- quality and metrics checks

Primary scripts:
- `test:e2e`
- `test:failure-paths`
- `metrics:verify`
- `release:prepare`

## Stage 3: Resilient Platform
Focus: uptime and graceful degradation.

Capabilities:
- load simulation
- incident simulation
- runbook alignment

Primary scripts:
- `simulate:call-load`
- `ops:incident-sim`
- `ops:runbook-check`

## Stage 4: Governed Platform
Focus: trust and accountability.

Capabilities:
- AI policy enforcement
- accessibility and compliance validation
- audit coverage

Primary scripts:
- `ai:policy-check`
- `accessibility:test`
- `compliance:gdpr-check`
- `audit:logs-verify`

## Stage 5: National Infrastructure
Focus: public reliability and transparency.

Capabilities:
- multi-region resilience operations
- synthetic runtime probing
- regulator-facing transparency workflows

Primary scripts and controls:
- `verify:all`
- `release:prepare`
- `deploy:dry-run`
- policy/governance controls in `docs/operating/vrs-national-safety-blueprint.md`
