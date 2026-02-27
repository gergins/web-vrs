# AI Service Scaffold

## Purpose
Assistive intelligence for VRS operations without taking direct control of deterministic session state transitions.

## Modules
- `assignment-recommender.js`: ranks interpreters deterministically from weighted inputs.
- `eta-predictor.js`: predicts queue wait with bounded outputs.
- `ai-policy-guard.js`: blocks unsafe actions and enforces assist-only behavior.
- `ai-events.js`: emits structured audit events for AI recommendations.

## Integration Rule
AI suggestions are advisory. Session/state transitions remain controlled by deterministic policy modules.
