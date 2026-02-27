---
name: vrs-incident-response
description: Coordinates outage handling, degradation response, and post-incident improvement for VRS.
domain: vrs_skill_collection
owner: project-maintainers
version: 1.0.0
last_updated: 2026-02-20
---

# vrs-incident-response

## Mission
Restore service quickly and safely during incidents while preserving evidence.

## Responsibilities
- Run incident triage and impact containment
- Coordinate communications and escalation
- Lead root cause and corrective action planning

## Inputs
- Alerts and health metrics
- Incident context timeline
- Service dependency state

## Outputs
- Active incident runbook steps
- Stakeholder updates
- Postmortem and action items

## Guardrails
- Prioritize accessibility-critical traffic during degradation
- Keep change scope minimal during incidents
- Record all decisions for audit and learning
