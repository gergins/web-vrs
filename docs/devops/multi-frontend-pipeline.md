# Multi Frontend Pipeline

## Purpose
Provide a reusable CI build pipeline for multiple frontend apps without enabling any app by default.

## Configuration
Frontend build targets are defined in `config/frontend-apps.json`.

Example entry:
```json
{
  "id": "interpreter-console",
  "path": "apps/interpreter-console",
  "node_version": "20",
  "install_command": "npm ci",
  "build_command": "npm run build",
  "test_command": "npm run test",
  "enabled": false
}
```

## Workflow
1. Validate full platform (`npm run verify`).
2. Read frontend manifest and create CI matrix.
3. Build enabled frontend apps only.

## Safety Rules
- Default manifest is empty (`apps: []`).
- Frontend capability available does not mean enabled.
- Enablement requires explicit manifest entry and `enabled: true`.
