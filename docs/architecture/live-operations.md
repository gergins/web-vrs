# Live Operations Strategy

## Goal
Ship updates without forcing maintenance downtime for active users.

## Controls Implemented
1. Rolling update manifests (`infra/deploy/k8s/signaling-deployment.yaml`)
2. Canary manifest (`infra/deploy/k8s/signaling-canary.yaml`)
3. Health-gated traffic with readiness/liveness endpoints
4. Drain endpoint (`POST /admin/drain`) to reject new sessions
5. Session-aware shutdown (wait for active sessions or timeout)
6. Feature flags (`config/feature-flags.json`) for staged rollout
7. Runtime drain E2E verification (`npm run test:signaling:e2e`)

## Backward Compatibility Rule
All release changes must be additive and migration-safe by default.
Breaking changes require explicit approval and transition plan.

## Rollout Sequence
1. Deploy new version with feature flags disabled/default-safe.
2. Verify readiness/liveness and baseline metrics.
3. Enable canary traffic.
4. Observe error rate and setup latency.
5. Increase traffic gradually or rollback.

## Rollback Trigger
- increased call setup failure rate
- readiness instability
- policy validation failure
