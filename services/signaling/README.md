# Signaling Service Scaffold

## Purpose
Minimal Phase 2 scaffold for SIP over WSS signaling logic with deterministic routing primitives.

## Files
- `src/signaling-router.js`: REGISTER/INVITE/BYE route stubs
- `src/session-store.js`: in-memory session tracking stub
- `src/correlation.js`: correlation ID helper
- `src/server.js`: runtime server with liveness/readiness and drain endpoints
- `tests/signaling-router.test.js`: signaling route unit tests
- `tests/signaling-drain.e2e.test.js`: end-to-end drain behavior test
- `Dockerfile`: container runtime for signaling service

## Notes
- This scaffold is intentionally dependency-light.
- It is not a full SIP stack yet.
- Next step is integrating with a real WSS transport and SIP parser.

## Run
- Local: `npm run run:signaling`
- Health checks:
  - `GET /health/liveness`
  - `GET /health/readiness`
- Signaling endpoints:
  - `POST /sip` (JSON payload)
  - `WS /sipws` (SIP text messages)
- Drain mode:
  - `POST /admin/drain`
