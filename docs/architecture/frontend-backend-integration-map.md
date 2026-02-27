# Frontend-Backend Integration Map

## Purpose
Define service boundaries and interaction contracts for independent frontend and backend development.

## Frontend Applications and Primary Service Integrations
1. User Web App
- Auth Service (login/token refresh)
- User Service (profile/preferences)
- Session Service (start/end call)
- Notification Service
- Reporting Service (history)

2. Interpreter Console
- Auth Service
- Queue Service
- Session Service
- AI Assist Service
- Workforce Service

3. Admin Portal
- User Management Service
- Compliance Service
- Reporting Service
- Billing Service
- Audit Log Service

4. Ops Tools
- Monitoring Service
- Session Debug Service
- Incident Service

## Integration Rules
- Frontend APIs go through API Gateway only.
- Real-time media/signaling may use direct secure channels where latency requires it.
- No frontend direct DB access.
- All cross-service events must be observable and auditable.

## Protocol Map
- REST/OpenAPI: standard request/response APIs
- AsyncAPI/WebSocket/SSE: event distribution
- WebRTC: media transport
- gRPC/WebSocket: low-latency AI assist streaming

## Contract-First Policy
- REST contracts defined under `docs/contracts/openapi/`
- Event contracts defined under `docs/contracts/asyncapi/`
- Runtime token model documented under `docs/contracts/realtime-token-flow.md`

## Test Expectations
1. Contract tests
2. Integration tests
3. End-to-end call simulation
4. Load/performance tests
