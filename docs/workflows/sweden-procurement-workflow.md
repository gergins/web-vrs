# Sweden Procurement Workflow (Upphandling)

## Purpose
Define operational workflow requirements for public-sector procurement governance in a relay-service context.

## Primary Actors
- Procurement authority team
- Contract governance officers
- Service provider operations lead
- Security/compliance reviewers

## Workflow Stages
1. Requirement Planning
- needs analysis by user segment and region
- accessibility and standards requirements definition
- risk and dependency analysis
- service-volume and budget planning

2. Tender Cycle
- request publication
- bidder Q&A and clarifications
- evidence collection and bid scoring
- award and contract finalization

3. Contract Activation
- KPI/SLA baseline agreed
- reporting channels enabled
- incident/escalation paths confirmed
- service coverage map approved

4. Ongoing Governance
- monthly SLA/KPI review
- incident review and corrective actions
- financial/usage audit review
- service-improvement backlog updates

5. Renewal or Re-tender
- performance trend evaluation
- gap analysis and new requirements
- renewal decision or re-procurement start

## Procurement Portal Requirements (Regulator Cockpit)
1. SLA Dashboard
- uptime, response time, wait time, failure rate

2. Compliance Dashboard
- policy conformance status
- unresolved compliance findings

3. Incident & Corrective Actions
- incident timeline
- RCA and mitigation status

4. Contract Reporting
- volume and cost analytics
- regional coverage and equity metrics

5. Audit Exports
- immutable activity logs
- downloadable reporting bundles

## Required Data Fields
- `contract_id`
- `region`
- `service_type`
- `sla_target`
- `sla_actual`
- `incident_id`
- `compliance_status`
- `reporting_period`

## Go/No-Go Signals
No-go for expansion/renewal if:
- SLA misses exceed threshold
- unresolved critical incidents remain open
- required compliance evidence is missing
