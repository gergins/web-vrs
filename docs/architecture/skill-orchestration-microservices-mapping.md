# VRS Skill Orchestration to Microservices Mapping

## Goal
Map the orchestration pipeline to deployable microservices with clear ownership, communication paths, and governance controls.

## High-Level Topology
1. Client apps (web, mobile, operator console)
2. API gateway
3. Orchestration services
4. Domain services (skill-aligned bounded contexts)
5. Infrastructure services

## Orchestration Services
1. Context Service
- Aggregates request context, telemetry, session metadata, and policy signals.
- Suggested runtime: Node.js or Go.
- Suggested state: Redis for short-lived context, event bus for signal ingestion.

2. Intent Service
- Classifies intent from request and event patterns.
- Produces intent, domain, and priority.
- Input: context payload.
- Output example:
```json
{
  "intent": "incident",
  "domain": "realtime-media",
  "priority": "high"
}
```

3. Skill Orchestrator Service
- Scores and selects primary plus supporting skills.
- Resolves dependencies and safety constraints.
- Applies compliance override policies.

4. Execution Engine Service
- Executes composed workflows.
- Invokes domain services.
- Persists outcomes and execution state.

## Domain Service Mapping
| Skill | Service | Core Responsibilities |
|---|---|---|
| `realtime-communication` | `realtime-media` | Media topology policy, capacity APIs, performance modeling |
| `webrtc-operations` | `webrtc-ops` | QoS analytics, health diagnostics, scaling triggers |
| `interpreter-routing` | `routing` | Matching engine, queue management, availability prediction |
| `accessibility-ux` | `accessibility` | UX policy rules, layout templates, visual notification logic |
| `compliance-security` | `compliance` | Consent tracking, retention rules, encryption and audit enforcement |
| `ai-assistive` | `ai-assistive` | Caption assist, summaries, interpreter assist endpoints |
| `incident-response` | `incident` | Alert intake, runbook automation, RCA workflow, SLA tracking |

## Infrastructure Services
- `signaling`: SIP over WSS and session control.
- `media-cluster`: SFU/TURN media runtime.
- `identity`: auth, role policy, credentials.
- `data-platform`: operational DB, analytics, audit storage.

## End-to-End Flow Example (Quality Degradation)
1. Metrics event emitted to event bus.
2. Context service builds orchestration payload.
3. Intent service classifies as `incident`.
4. Orchestrator selects:
- primary: `webrtc-ops`
- supporting: `incident`, `realtime-media`
5. Execution engine runs diagnostics and mitigation steps.
6. Outcome and decision trace are persisted.

## Communication Pattern
- Event backbone: Kafka or NATS.
- Synchronous internal calls: gRPC for low-latency service-to-service paths.
- Public APIs: REST via gateway.

## Control Points
- Compliance service can veto non-compliant actions.
- Orchestrator logs all selection decisions.
- Incident service can escalate to human approval.

## Suggested Service Layout
```text
vrs-platform/
  gateway/
  orchestration/
    context-service/
    intent-service/
    orchestrator/
    execution-engine/
  services/
    realtime-media/
    webrtc-ops/
    routing/
    accessibility/
    compliance/
    ai-assistive/
    incident/
  infrastructure/
    signaling/
    media-cluster/
    identity/
```

## Operational Modes
- `advisory`: recommendations only.
- `assisted`: automated diagnostics.
- `autonomous`: automated remediation when explicitly allowed by policy.
