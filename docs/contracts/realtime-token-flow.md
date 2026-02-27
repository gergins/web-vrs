# Real-Time Token Flow

## Purpose
Define secure token exchange for signaling/media/event channels.

## Flow
1. User authenticates via Auth Service and receives access token.
2. Frontend calls API Gateway for session creation with bearer token.
3. Session Service returns `session_id` and short-lived realtime token.
4. Frontend uses realtime token for:
- signaling channel (`/sipws`)
- event stream subscription
- media session authorization
5. Realtime tokens are audience-scoped and short-lived.

## Security Requirements
- access token and realtime token must be distinct
- realtime token TTL must be short (minutes)
- token claims include role + session scope
- rotation required on reconnect/resume flows
- all token exchanges logged with correlation id
