# VRS Platform Starter

Starter vertical slice scaffold for:
- web client with WebRTC bootstrap and login hook
- interpreter console client
- signaling service with WebSocket + event bridge
- SIP gateway invite translation and forwarding
- assignment service stub
- context service with Redis-backed session state
- workforce forecasting service
- AI assist service
- shared types

## Quick Start (local process mode)
1. Install dependencies:
   - `cd services/signaling && npm i`
   - `cd ../sip-gateway && npm i`
   - `cd ../assignment && npm i`
   - `cd ../context && npm i`
   - `cd ../workforce-forecasting && npm i`
   - `cd ../ai-assist && npm i`
   - `cd ../../apps/web && npm i`
   - `cd ../interpreter && npm i`
2. Start all:
   - `cd ../../ && npm run dev:start-all`

## Quick Start (docker)
- `docker compose up --build`

## Service Ports
- Web client: `3000`
- Interpreter client: `3004`
- Signaling: `4001`
- SIP gateway: `4002`
- Assignment: `4003`
- Context: `4004`
- Workforce forecasting: `4010`
- AI assist: `4011`
- Redis: `6379`

## TURN Environment (web client)
Set in compose or local env:
- `NEXT_PUBLIC_TURN_URL`
- `NEXT_PUBLIC_TURN_USERNAME`
- `NEXT_PUBLIC_TURN_PASSWORD`

## Auth Flow (starter)
- Login button calls `/api/auth/login`.
- Starter route supports mock login (`?mock_auth=1`) and stores a demo `id_token`.
- Context service supports optional bearer auth (`AUTH_REQUIRED=true`).

## Example Flow
1. Web and interpreter clients connect to signaling.
2. SIP invite posted to gateway (`POST /sip/invite`) is translated to `incoming-call`.
3. Signaling forwards event to connected clients.
4. Interpreter accepts call in console.
5. Context service stores/retrieves session state in Redis.
6. Forecast and assist APIs provide staffing and interpreter-support signals.

See:
- `docs/executive-summary.md`
- `docs/master-blueprint.md`
- `docs/implementation-roadmap.md`
- `docs/go-live-readiness-checklist.md`
- `docs/vrs-maturity-model.md`
- `docs/callflow-sequence.md`
- `docs/production-architecture.md`
- `docs/multi-region-deployment-strategy.md`
- `docs/ha-signaling-cluster.md`
- `docs/regulatory-sla-dashboard-spec.md`
- `docs/incident-response-model.md`
- `docs/scaling-playbook.md`
- `docs/system-lifecycle.md`
- `docs/governance-operating-model.md`
- `docs/procurement-technical-spec-outline.md`
- `docs/risk-register.md`
