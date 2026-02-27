# VRS Execution Model

## Purpose
Define how commands are executed from user request to validated implementation.

## Command Grammar
Use this request grammar to trigger consistent execution:

`ACTION + TARGET + DOMAIN + CAPABILITIES + CONSTRAINTS + OUTPUT`

Supported actions:
- `build`: generate scaffold and baseline code
- `design`: generate architecture only
- `simulate`: run scenario and failure flows
- `validate`: run checks/gates only
- `extend`: add new capability to existing system

Capability keywords:
- `sip`
- `webrtc`
- `interpreter-assignment`
- `queue-management`
- `accessibility`
- `ai-assist`
- `compliance`
- `multi-region`

Examples:
- `Build web client for VRS with SIP`
- `Design architecture for VRS signaling with high availability`
- `Build VRS web platform with SIP gateway, interpreter queue, accessibility AA, deployable on Kubernetes`

## Build Request Spec Template
Use this when detailed and deterministic execution is required.

```yaml
id: vrs-web-sip
goal: Provide web-based VRS with SIP connectivity

users:
  - deaf-user
  - interpreter
  - operator

capabilities:
  - webrtc-client
  - sip-gateway
  - interpreter-assignment
  - call-queue

non_functional:
  availability: 99.9
  latency_target_ms: 150
  accessibility_standard: WCAG-AA

deployment:
  environment: cloud
  regions: 1
  scaling: auto

output:
  - architecture
  - repo-scaffold
  - initial-services
```

Template file:
- `docs/operating/templates/build-request-spec.yaml`

## Trigger Modes
### 1. Expectation-Driven
Example:
- "Build web for VRS with SIP support"

Flow:
1. Parse intent and scope.
2. Expand into system modules.
3. Map to relevant skill domains.
4. Generate architecture and scaffolding.
5. Generate implementation baseline.
6. Run validation and tests.

### 2. Catalog-Driven
Example:
- "Use VRS skill catalog to build SIP web client"

Flow:
1. Load skill catalog.
2. Select applicable capabilities.
3. Compose modules into architecture.
4. Generate code templates and wiring.
5. Run integration and policy checks.

### 3. Reference-Driven
Example:
- "Build like <reference product> for Deaf users"

Flow:
1. Extract reference feature set.
2. Map features to VRS domain requirements.
3. Identify gaps and constraints.
4. Generate implementation design and plan.
5. Run validation gates before merge.

## Unified Execution Flow
All modes converge to:
1. requirements normalization
2. capability mapping
3. architecture generation
4. code scaffolding/implementation
5. validation and testing
6. deployment pipeline readiness

## Capability Mapping Matrix
| Capability | Modules | Skill focus | Validation scripts |
|---|---|---|---|
| WebRTC | media path, client media controls | realtime reliability | `webrtc:test`, `media:quality-check` |
| SIP | signaling and protocol adaptation | signaling resilience | `test:signaling`, `webrtc:test` |
| Interpreter assignment | assignment and policy logic | AI governance and workforce | `ai:test`, `ai:policy-check` |
| Queue management | session orchestration and queue state | callflow reliability | `test:e2e`, `test:failure-paths` |
| Accessibility | UI and interaction policy | accessibility UX | `accessibility:test` |
| Compliance | consent, retention, audit path | compliance-security | `compliance:gdpr-check`, `audit:logs-verify` |
| Observability | metrics, traces, structured logs | operations and diagnostics | `metrics:verify`, `trace:check`, `logs:lint` |

## Decision Engine
Selection logic:
- High-level request -> expectation-driven mode
- Skill/catalog request -> catalog-driven mode
- Reference product request -> reference-driven mode
- Detailed implementation spec -> direct build mode

## Module Expansion Baseline (SIP VRS Web)
- web client
- signaling service
- SIP/WebRTC adaptation path
- interpreter assignment API
- session state manager
- observability hooks

## Live Example: Build VRS Web with SIP
Input:
- `Build VRS web with SIP and interpreter queue`

Parsed request:
- domain: `VRS`
- interface: `Web`
- protocol: `SIP`
- core flows: call initiation, interpreter assignment, relay session

Resulting modules:
- frontend: web UI with call controls and interpreter status
- realtime: WebRTC media and signaling runtime
- SIP layer: SIP-to-session adaptation path
- backend: assignment API, queue/session state, context service

Baseline scaffold targets:
- `apps/web`
- `services/signaling`
- `services/sip-gateway`
- `services/assignment`
- `services/context`
- `packages/shared-types`

Starter reference implementation in this repository:
- `vrs-platform/apps/web`
- `vrs-platform/services/signaling`
- `vrs-platform/services/sip-gateway`
- `vrs-platform/services/assignment`
- `vrs-platform/packages/shared-types`

Validation path:
1. `npm run test:signaling`
2. `npm run test:e2e`
3. `npm run media:quality-check`
4. `npm run accessibility:test`
5. `npm run verify:all`

## Required Guardrails
Execution is blocked unless:
- architecture checks pass
- accessibility baseline is present
- callflow and failure-path tests are present
- observability requirements are included

## Owner Role
AI platform orchestrator:
- structures incoming requests
- selects skill capabilities
- routes build path
- enforces validation gates

## Execution Roles
| Role | Responsibility |
|---|---|
| Request owner | defines goal and constraints |
| AI orchestrator | converts request to structured build plan |
| Architect | validates module boundaries and NFR fit |
| Engineers | implement/extend generated baseline |
| QA | executes validation matrix and failure paths |
| Ops | validates readiness and deployment safety |
