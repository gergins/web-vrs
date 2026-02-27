# VRS Domain Ontology (Baseline)

## Core Entities
- User
- Interpreter
- Session
- Queue
- Capability
- Policy
- CountryProfile
- WorkforceProfile
- ComplianceRequirement

## Key Relationships
- User initiates Session
- Interpreter assigned_to Session
- Session governed_by Policy
- Policy constrained_by CountryProfile
- Assignment constrained_by WorkforceProfile
- Capability enabled_under Policy

## States
- request_received
- interpreter_assigned
- hearing_party_dialing
- relay_active
- call_ended

## Decisions
- assignment_decision
- capability_enablement_decision
- ethics_gate_decision

## Traceability Requirement
Every decision references:
- correlation_id
- policy_version
- context_version
- actor_role
