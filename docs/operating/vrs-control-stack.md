# VRS Control Stack

## Purpose
Define what scripts can cover and what additional controls are required for mission-critical VRS operations.

## Layer 1: Scripted Controls
- `npm run verify`: baseline validation and test gates
- `npm run env:validate`: required runtime environment variable checks
- `npm run arch:drift-check`: architecture path consistency checks
- `npm run ops:healthcheck`: operational health asset checks
- `npm run metrics:validate`: required metric definition checks
- `npm run release:readiness`: aggregate release gate

## Script Limits and Required Non-Script Controls
| Risk area | Scripts cannot fully prevent | Required non-script controls |
|---|---|---|
| Architecture violations | runtime coupling and intentional boundary bypass | architecture ownership, code owners, review policy |
| Realtime failures | regional outages, unpredictable network quality | synthetic call probes, failover routing, QoS adaptation |
| AI harm or bias | novel model behavior after deployment | human override, immutable decision logs, policy governance |
| State corruption | distributed race conditions and partial writes | idempotent workflows, state reconciliation, event journaling |
| Security incidents | zero-day and credential abuse | runtime defense, secrets rotation, threat modeling |
| Accessibility regressions | real-user comprehension issues | Deaf user panel, release acceptance criteria, UX telemetry |
| Incident chaos | cross-team confusion under pressure | incident command model, escalation matrix, drills |
| Regulatory drift | legal interpretation changes over time | compliance cadence, policy registry, legal sign-off |

## Rule of Thumb
- deterministic risk -> script checks
- runtime risk -> monitoring and failover
- human risk -> process controls
- ethical risk -> governance controls
- systemic risk -> architecture and ownership controls

## Related
- `docs/operating/vrs-national-safety-blueprint.md`
