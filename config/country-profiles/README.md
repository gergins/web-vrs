# Country Profiles

## Purpose
Reusable per-country requirement packs for global VRS rollout.

## Files
- `schema.json`: required structure and field definitions.
- `template.json`: starter template for a new market.
- `*.json`: country-specific profiles.

## Usage
1. Copy `template.json` to `<country-code>-<name>.json`.
2. Fill legal/compliance, emergency, routing, and operational fields.
3. Run `npm run validate:country-profiles`.
4. Run `npm run verify` before enabling market rollout.

## Notes
- These profiles are product configuration, not legal advice.
- Final legal interpretation must be reviewed by local counsel/regulatory experts.
