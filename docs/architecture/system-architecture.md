# System Architecture: Production VRS

## Scope
Architecture for a production SIP/WebRTC Video Relay Service where Deaf callers communicate with hearing parties via interpreters.

## Layered Components
1. Client Layer
- Deaf caller web client (accessible UI)
- Interpreter console
- Browser signaling over WSS
- Browser media over WebRTC

2. Edge/API Layer
- HTTPS ingress
- auth/session bootstrap
- rate limiting + validation

3. Signaling Layer
- SIP over WSS endpoint
- REGISTER / INVITE / BYE processing
- dialog correlation IDs
- routing between caller/interpreter/hearing legs

4. Session Layer
- deterministic state machine
- transition guards
- persistent state store
- domain events

5. Interpreter Routing Layer
- availability registry
- language/skill matching
- queue policy (standard/urgent)
- deterministic tie-break and failover

6. Media Layer
- WebRTC relay/SFU path
- TURN/STUN integration
- SRTP/DTLS policy enforcement
- codec allow-list enforcement

7. Data Layer
- session state persistence
- interpreter presence data
- audit log store
- metrics backend

8. Operations Layer
- liveness/readiness/signaling health probes
- structured logs (session_id + correlation_id)
- alerts (latency, assignment delay, failure rate)
- release gate: `npm run verify`

## Canonical Call Flow
1. `request_received`
2. `interpreter_assigned`
3. `hearing_party_dialing`
4. `relay_active`
5. `call_ended`

No implicit transitions are allowed.

## Security Controls
- external signaling via WSS/TLS only
- media encryption required (SRTP/DTLS)
- no hardcoded secrets
- fail closed on policy violations

## Deployment Pattern
- independent scaling for signaling and allocator workers
- state/session services remain deterministic under concurrency
- health checks block rollout when degraded

## Initial Implementation Map (Current Repo)
- policy: `AGENTS.md`
- domain: `docs/domain/vrs-domain-spec.md`
- roadmap: `docs/production-plan.md`
- verification: `package.json`, `scripts/`, `tests/callflow/`
- phase 2 scaffold: `services/signaling/src/`
