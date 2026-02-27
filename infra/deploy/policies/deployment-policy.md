# Deployment Policy

## Objectives
- zero/near-zero downtime updates
- no forced maintenance window for normal releases
- safe rollback path

## Strategies
1. Rolling update as default.
2. Canary release for risky changes.
3. Blue/green for major protocol/runtime changes.

## Mandatory Rules
- readiness must fail during drain mode
- new INVITE must be rejected while draining
- active sessions must be allowed to finish before shutdown
- rollback if error/latency threshold is exceeded
