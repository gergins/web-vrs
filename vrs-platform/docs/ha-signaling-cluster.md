# High-Availability Signaling Cluster

## Architecture
- Stateless signaling nodes behind regional load balancer.
- Shared Redis cluster for session presence and pub/sub.
- Horizontal autoscaling based on active websocket sessions and CPU.

## Message Routing Flow
1. Client connects to any signaling node.
2. Node registers connection/session in Redis.
3. Session messages are published over Redis pub/sub.
4. Owning node (or subscribed peers) forwards signaling payload.

## Reliability Features
- Liveness/readiness probes and connection draining.
- Circuit breaker on downstream dependency failure.
- Session admission controls during overload.
- Canary rollout and rollback hooks.

## Failure Behavior
- Node failure: clients reconnect through load balancer.
- Redis degradation: degrade gracefully to local signaling path with warning.
- Region outage: route new sessions to secondary region.
