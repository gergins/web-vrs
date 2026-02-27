# VRS Domain Specification

## Purpose
Define the domain rules and operational behavior for a production SIP/WebRTC Video Relay Service (VRS) where Deaf users communicate with hearing users through a live sign-language interpreter.

## Scope
This specification is the source of truth for:
- domain actors and responsibilities
- call lifecycle and deterministic state transitions
- interpreter routing and queue policy
- signaling/media security constraints
- failure handling and operational controls

## Primary Actors
- Deaf Caller: starts and participates in signed video conversation
- Interpreter: bridges signed and spoken language in real time
- Hearing Party: joins by phone or SIP endpoint
- Relay Platform: signaling, session orchestration, media routing, monitoring
- Operations Team: deployment, incident response, reliability management

## Core Service Objectives
- Accessibility first: low-friction call start, clear live status, readable UI
- Security by default: encrypted signaling and media
- Deterministic behavior: explicit state machine and transition rules
- Production reliability: health probes, metrics, alerting, rollback path
- Incremental evolution: additive and backward-compatible changes

## Session State Model
Canonical states:
1. request_received
2. interpreter_assigned
3. hearing_party_dialing
4. relay_active
5. call_ended

Allowed transitions:
- request_received -> interpreter_assigned
- interpreter_assigned -> hearing_party_dialing
- hearing_party_dialing -> relay_active
- relay_active -> call_ended

Rules:
- `call_ended` is terminal and has no outgoing transition.
- No implicit transition is allowed.
- Any undefined transition must be rejected and logged.

## Interpreter Routing Policy
Inputs:
- language/mode requirements
- priority class (standard/urgent)
- interpreter availability and workload
- optional compliance constraints (region/certification)

Deterministic decision order:
1. filter by required language/mode
2. filter by availability and max concurrent sessions
3. sort by priority class and wait time
4. tie-break using stable ordering key (for repeatability)

Failover behavior:
- if assignment fails, retry with next eligible interpreter
- if pool exhausted, keep caller in queue and emit queue-delay event
- all retries must preserve correlation IDs and audit trail


## Cultural and Religious Accommodation Policy
Accommodation constraints must be configuration-driven and tenant/country scoped.

Allowed preference examples:
- interpreter gender preference (`male`, `female`, `no_preference`)
- language/dialect preferences
- region-specific cultural accommodation flags

Hard rules:
- No global hardcoded rule that forces one interpreter gender for all users.
- Strict constraints may be applied only when legally permitted in the active country profile.
- User consent is required before applying strict accommodation filters.
- If strict filtering increases wait time or removes all candidates, explicit fallback consent is required.
- Assignment decisions must be auditable with requested/applied constraints and fallback outcome.
## Signaling Requirements
- External signaling must use secure transport (WSS/TLS).
- Plaintext SIP must be rejected on external edges.
- REGISTER/INVITE/BYE handling must include correlation IDs.
- Session identity must be consistent across signaling legs.

## Media Requirements
- Media must be encrypted (SRTP/DTLS-SRTP policy).
- TURN/STUN must be configurable for constrained networks.
- Codec negotiation must enforce allow-list policy.
- Negotiation must fail closed on policy violation.

## Security and Secrets
- No hardcoded credentials, secrets, API keys, or tokens in repo.
- Secrets must come from environment or secret manager.
- Security-sensitive config changes require verification gate pass.

## Observability Requirements
Structured logs must include:
- timestamp
- session_id
- correlation_id
- actor_role
- event_name
- state_from/state_to when applicable

Metrics:
- setup latency
- interpreter assignment delay
- call success/failure rate
- queue wait duration
- active sessions by language/priority

## Failure Handling
Failure workflow:
1. identify failing layer (client/signaling/media/session/routing/infra)
2. run layer-specific verification
3. apply deterministic correction
4. re-run full verification gate

Failure classes:
- interpreter unavailable
- signaling timeout
- media negotiation failure
- relay disconnect/recovery

## Non-Functional Expectations
- deterministic behavior under concurrency
- horizontal scalability for signaling and routing workers
- deployment safety via readiness/liveness checks
- backward-compatible schema and API evolution

## Verification Mapping
Domain rules map to repository gates:
- config and security constraints -> `npm run validate:config`
- state model determinism -> `npm run validate:state`
- canonical lifecycle correctness -> `npm run test:callflow`
- aggregate release gate -> `npm run verify`

## Change Control
Any change to this file must:
- document migration impact
- preserve backward compatibility unless explicitly approved
- update verification/tests when domain behavior changes

