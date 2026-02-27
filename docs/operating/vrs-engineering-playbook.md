# VRS Engineering Playbook

## Daily Development
1. `npm run dev:setup`
2. Implement scoped change
3. `npm run test:unit`
4. `npm run arch:validate`

## Before Pull Request
Run:
- `npm run verify:all`

This covers:
- env/config checks
- architecture/contract checks
- unit/integration/e2e checks
- AI policy and accessibility checks
- baseline security policy and metrics checks

## Before Release
1. `npm run release:prepare`
2. `npm run deploy:dry-run`
3. `npm run release:notes`

## During Incident
1. `npm run ops:health`
2. `npm run ops:incident-sim`
3. `npm run test:failure-paths`
4. `npm run ops:runbook-check`

## Optional Diagnostic Commands
- `npm run media:quality-check`
- `npm run turn:verify`
- `npm run ai:replay`
- `npm run workforce:simulate-load`
