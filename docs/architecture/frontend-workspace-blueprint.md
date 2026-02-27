# Frontend Workspace Blueprint

## Status
Scaffolded structure only. No app initialized or enabled by default.

## Apps
- `frontend/apps/web-app` (Next.js target)
- `frontend/apps/interpreter-console` (Vite target)
- `frontend/apps/admin-portal` (Next.js target)
- `frontend/apps/ops-tools` (Vite target)

## Shared Packages
- `frontend/packages/ui`
- `frontend/packages/accessibility`
- `frontend/packages/rtc`
- `frontend/packages/api-client`
- `frontend/packages/design-tokens`
- `frontend/packages/config`

## Enablement Rule
Enable any app only after:
1. feature-gate approval
2. ethics + rollout checks
3. explicit `enabled: true` in `config/frontend-apps.json`
4. successful `npm run verify`
