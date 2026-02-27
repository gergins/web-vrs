# ADR-002: Frontend Strategy (Core vs Real-Time Consoles)

## Status
Accepted (Planning Baseline)

## Context
The platform needs:
- structured, scalable core product surfaces (user/admin)
- rapid iteration for real-time interpreter experiences
- strict control over enabled technology choices

Single-framework enforcement can slow UI-heavy real-time experimentation, while all-in on lightweight tooling can reduce long-term structure and procurement readiness.

## Decision
Adopt a dual frontend strategy:
1. Next.js is the default for core platform apps.
2. Vite is allowed for scoped real-time/experimental/internal consoles.
3. Tooling choice is capability-level only and not auto-enabled.
4. Any activation must pass feature, ethics, and release gates.

## Scope Mapping
- Next.js default scope:
  - primary web app
  - admin and governance portals
  - documentation-facing product surfaces

- Vite scoped scope:
  - interpreter real-time console
  - ops/internal tooling
  - rapid UX experimentation surfaces

## Rationale
- preserves long-term structure in core product flows
- maximizes development speed for real-time UI iteration
- aligns with capability-first governance (supported != enabled)

## Positive Consequences
- clearer framework boundaries
- faster iteration in real-time interfaces
- reduced framework lock-in risk

## Trade-Offs
- dual frontend toolchain maintenance
- shared design system discipline required
- stronger integration/testing contracts needed

## Guardrails
- no framework activation without explicit approval
- no bypass of `npm run verify`
- country/workforce/ethics gates still apply to feature behavior

## Alternatives Considered
1. Next.js only
- simpler stack
- slower experimentation for high-frequency real-time UI changes

2. Vite only
- faster for UI iteration
- weaker default structure for core, procurement-facing surfaces

## Implementation Note
This ADR is architecture guidance only.
No framework migration or new app scaffolding is implied by this decision.
