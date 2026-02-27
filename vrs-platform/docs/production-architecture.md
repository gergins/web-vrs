# Production Architecture (Starter)

```mermaid
flowchart TD
  Users[Web + Interpreter Clients] --> Edge[CDN / WAF / Load Balancer]
  Edge --> Apps[Application Layer]
  Apps --> Signaling[Realtime Signaling Cluster]
  Apps --> SIP[SIP Gateway]
  Apps --> Assign[Assignment Service]
  Apps --> Context[Context Service]
  Apps --> WF[Workforce Forecasting Service]
  Apps --> AI[AI Assist Service]
  Context --> Redis[(Redis Session Store)]
  Assign --> Postgres[(PostgreSQL - future)]
  SIP --> External[External SIP Network]
  Signaling --> TURN[TURN/STUN]
  Apps --> Obs[Metrics / Logs / Tracing]
```

## Flow Summary
1. User authenticates and opens client.
2. Client connects to signaling and requests call.
3. Assignment service provides interpreter candidate.
4. AI assist service provides optional suggestions.
5. Workforce forecasting service emits staffing forecasts.
6. SIP gateway bridges external calls when needed.
7. Context service stores session state in Redis.
8. TURN supports NAT traversal for media connectivity.
