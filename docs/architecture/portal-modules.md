# Portal Modules Architecture

## Purpose
Define procurement and prescriber modules as reusable platform capabilities for Sweden-style delivery and future country adaptation.

## Module Set
1. Procurement Portal
- audience: regulator/procurement/governance teams
- core: SLA, compliance, incidents, contract reporting, audits

2. Prescriber Portal
- audience: accessibility/clinical prescriber roles
- core: assessment, enrollment, training, follow-up, case management

3. Shared Services
- identity and RBAC
- reporting engine
- audit event pipeline
- localization and country policy profile resolver

## Integration Points
- session and call analytics store
- compliance/profile engine
- interpreter allocation and operations dashboards
- support and incident systems

## Reuse Pattern for New Markets
1. keep module structure constant
2. localize forms, policies, and required fields per country profile
3. map regulatory reporting outputs to local procurement requirements
4. validate with country profile and feature-gate matrix before release

## Implementation Order
1. data model and APIs (assessment, contract, reporting records)
2. role-based UI screens for each portal
3. reporting exports and dashboard widgets
4. country-specific profile adapters
