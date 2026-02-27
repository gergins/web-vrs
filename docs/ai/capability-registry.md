# AI Capability Registry

## Purpose
Define expandable AI/human collaboration features as controlled capabilities, not hardcoded behavior.

## Core Principles
- Human interpreter remains decision-maker.
- AI is assistive only.
- All AI behavior is policy-driven and auditable.

## Files
- `config/capabilities/registry.json`: capability catalog and constraints.
- `config/capabilities/policies/*.json`: tenant/country-scoped capability policies.

## Capability Modes
- `off`
- `silent_assist`
- `guided_assist`
- `training_mode`

## Required Guardrails
- human override always available
- no automated interpretation output to end users
- consent checks for sensitive AI features
- policy and country legal checks before enablement
- full audit trace for assist suggestions and overrides

## Maturity Levels
1. Assistive Tools
- captions and pre-call support
2. Context Intelligence
- guided prompts and summaries
3. Adaptive Collaboration
- fatigue/workload optimization
4. Ecosystem Intelligence
- system-level planning and forecasting

## Procurement Readiness Signals
- feature usage transparency
- opt-in/opt-out controls
- safety and override evidence
- measurable quality impact without opaque scoring

## Intake Workflow
- Use docs/ai/intake/capability-intake-template.md for every new capability.
- Default decision is catalog_only and disabled.

