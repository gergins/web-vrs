# Production Plan: SIP/WebRTC Video Relay Service (VRS)

## Goal
Deliver a production-ready, incrementally deployable VRS platform for Deaf users to communicate with hearing users via qualified sign-language interpreters.

## Product Principles (Industry-Proven)
- Accessibility-first UX with clear live status and low-friction call start.
- 24/7 interpreter routing with deterministic assignment/failover.
- Secure-by-default signaling and media (WSS/TLS + SRTP/DTLS).
- Deterministic session state machine (no ambiguous transitions).
- Operational visibility: health checks, metrics, structured logs, alerting.
- Backward-compatible growth (no rewrite-first strategy).
- Feature intake discipline using `docs/product/feature-gate-matrix.md` before implementation.

## Architecture Scope
- Client Layer: Web app for Deaf caller, interpreter console, status surfaces.
- Signaling Layer: SIP over WSS gateway, REGISTER/INVITE/BYE flows.
- Media Layer: WebRTC session orchestration, TURN/STUN, SRTP policy.
- Session Layer: Persistent call state machine + dual-leg correlation.
- Routing Layer: Interpreter availability, skill matching, queue priority.
- Infra Layer: Containerized deployment, probes, metrics, dashboards.

## Phased Delivery

### Phase 1: Foundation and Safety Gates
Deliverables:
- Repository verification pipeline (`validate:config`, `validate:state`, `test:callflow`, `verify`).
- Baseline VRS config and state schema.
- Deterministic happy-path callflow tests.

Acceptance:
- `npm run verify` passes in CI and local.
- Config rejects insecure transport/media settings.
- State schema validates strict transition rules.

### Phase 2: Signaling Backbone (SIP over WSS)
Deliverables:
- WSS signaling service scaffold.
- REGISTER/INVITE/BYE route handlers.
- Session IDs and correlation IDs in structured logs.

Acceptance:
- Inbound signaling only on secure transport.
- Request/response traces include stable correlation IDs.
- Basic end-to-end signaling test passes.

### Phase 3: Media and Relay Session Control
Deliverables:
- WebRTC offer/answer exchange with policy checks.
- TURN/STUN integration and connectivity fallback.
- SRTP-required media session enforcement.

Acceptance:
- Calls fail closed if SRTP policy is violated.
- Negotiation chooses allowed codecs only.
- Media-path validation tests pass.

### Phase 4: Interpreter Routing and Queueing
Deliverables:
- Interpreter allocator service (availability + language skills + priority).
- Queue policy (standard/urgent) with deterministic dispatch.
- Reassignment/failover logic.

Acceptance:
- Deterministic assignment under repeated runs.
- Failure tests: no-interpreter, timeout, reassignment pass.
- Queue telemetry emitted for wait time and abandonment.

### Phase 5: Reliability and Production Ops
Deliverables:
- Liveness/readiness checks for signaling/session/media services.
- Metrics + alerting (latency, assignment delay, failure rates).
- Deployment manifests with safe rollout strategy.

Acceptance:
- Health checks gate deployment.
- Alerts fire on defined SLA/SLO thresholds.
- Rollback path documented and tested.

### Phase 6: Security and Compliance Hardening
Deliverables:
- Secrets via environment/secret manager only.
- Audit events for session lifecycle and interpreter actions.
- Threat controls for abuse/rate-limits.

Acceptance:
- Secret scanning passes.
- Security checks block hardcoded secrets and insecure transport.
- Audit logs retain required fields.

## Test Strategy
- Unit: config/state/routing logic.
- Contract: signaling payload and state transition contracts.
- Callflow: happy path + failure paths.
- Integration: browser client <-> signaling <-> media path.
- Operational: probes, restart behavior, degraded mode.

## Non-Functional Targets
- Signaling and state actions deterministic under concurrency.
- p95 end-to-end setup latency within defined SLA target.
- Horizontal scaling for signaling and allocator workers.
- Zero plaintext SIP on external edges.

## Release Gate (Must Pass)
- `npm run verify`
- Failure-path callflow tests
- Health checks green
- No hardcoded secrets
- TLS/SRTP enforcement confirmed

## Next Implementation Order
1. Add failure-path callflow tests and wire into `npm run verify`.
2. Implement signaling service scaffold (WSS + SIP route stubs).
3. Add session state persistence and correlation logging.
4. Add interpreter allocator module with deterministic policy.
5. Add healthchecks + metrics endpoint + CI workflow.
