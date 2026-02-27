# Capability Intake Template

## Purpose
Capture new capabilities as knowledge artifacts first, without enabling them by default.

## Rule
New capabilities enter as `catalog-only` and `disabled` until all gates pass.

## Intake Fields
- Capability ID:
- Name:
- Category:
- Problem solved:
- Stakeholders impacted:
- Maturity level (1-4):
- Risk level (low/medium/high):

## Enablement Preconditions
- feature gate approved
- ethics policy valid
- ethics workflow gate valid
- country profile compatibility confirmed
- workforce profile compatibility confirmed
- rollout policy strategy selected
- test plan defined

## Policy Constraints
- human override required: true/false
- consent required: true/false
- no automated interpretation output: true/false
- audit trace required: true/false

## Data & Privacy
- data inputs:
- retention requirements:
- privacy considerations:
- secondary use restrictions:

## UX/Operations
- interpreter controls:
- user visibility/transparency:
- failure fallback behavior:
- support and incident hooks:

## Validation Mapping
- config files affected:
- validation scripts affected:
- tests required:

## Decision
- status: `catalog_only` | `candidate_for_enablement` | `approved_for_rollout`
- approved rollout stage: `off` | `internal_only` | `canary` | `tenant_opt_in` | `general_availability`
- sign-off roles:
- assumptions:
