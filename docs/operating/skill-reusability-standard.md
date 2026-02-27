# Skill Reusability Standard

## Purpose
Define the minimum framework requirements for reusable skills in this repository.

## Required Layers
1. Manifest (identity and lifecycle metadata)
2. Context layer (authoritative sources and scope)
3. Execution workflow (deterministic steps)
4. Tool permissions (allowed/restricted capabilities)
5. Policy and guardrails (safety and compliance)
6. Observability (execution evidence and outcomes)
7. Versioning and evolution (backward-safe updates)

## Required Manifest Keys
- `name`
- `description`
- `domain`
- `owner`
- `version`
- `last_updated`

## Required Skill Sections
- Inputs Required
- Outputs Required
- Tool Permissions
- Policy and Guardrails
- Observability
- Skill Lifecycle
- Execution Workflow
- Verification Matrix
- Completion Quality Bar

## Repository Enforcement
- Validate skill structure with: `npm run validate:skill`
- Include skill validation in aggregate gate: `npm run verify`
- Refresh structure map after structural changes: `npm run structure:update`

## Change Policy
- Prefer additive updates.
- Preserve backward compatibility unless explicitly approved.
- Update skill changelog on each behavior change.
