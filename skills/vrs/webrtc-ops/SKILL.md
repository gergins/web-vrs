---
name: vrs-webrtc-operations
description: Operates, monitors, and troubleshoots WebRTC infrastructure for production VRS workloads.
domain: vrs_skill_collection
owner: project-maintainers
version: 1.0.0
last_updated: 2026-02-20
---

# vrs-webrtc-operations

## Mission
Keep RTC service reliable under changing network and traffic conditions.

## Responsibilities
- Monitor packet loss, jitter, RTT, and call quality
- Define autoscaling and drain/failover operations
- Execute diagnostics and post-incident hardening

## Inputs
- Telemetry and traces
- Infrastructure state
- Incident timelines

## Outputs
- Runbooks
- Mitigation actions
- Reliability improvement backlog

## Guardrails
- Fail closed on unsafe media/signaling settings
- Use canary and drain-first operational changes
- Keep user-impacting actions auditable
