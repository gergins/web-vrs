# Global Readiness Plan

## Purpose
Prepare the VRS platform for multi-country adoption without rewrite.

## Principles
- Keep one core platform with country-specific policy profiles.
- Preserve deterministic call/session behavior across all regions.
- Use additive, backward-compatible changes for expansion.

## Globalization Pillars
1. Tenant and Region Model
- Multi-tenant architecture with per-tenant country profile.
- Region-aware deployment and data residency controls.
- Configurable home region for signaling and data storage.

2. Localization and Accessibility
- UI i18n for labels, notifications, and support messages.
- Locale-aware time/date/number formatting.
- Region-specific accessibility guidance and onboarding copy.

3. Numbering and Routing
- Canonical internal number format (E.164 normalization).
- Country-specific dial plan adapters at ingress/egress.
- SIP URI and phone number dual-routing support.

4. Compliance Profiles
- Per-country policy packs for retention, privacy, audit fields, and emergency behavior.
- Central baseline controls: TLS/WSS, SRTP, RBAC, audit events.
- Compliance profile selected per tenant at provisioning.

5. Interpreter Capacity Model
- Language-pair and certification attributes in allocator.
- Regional eligibility filters for assignments.
- Capacity forecasting per region and time band.

6. Operations and Reliability
- Regional health checks and alerting.
- Canary-by-region rollout strategy.
- Session drain and graceful shutdown policies preserved globally.


7. Cultural and Religious Accommodation Controls
- Support user-configurable interpreter accommodation preferences per tenant/country profile.
- Keep accommodations opt-in and consent-driven.
- Enforce legal-profile checks before strict constraints are applied.
- Preserve explicit fallback prompts when strict constraints reduce match availability.
- Require assignment audit trace for accommodation-influenced decisions.
## Deployment Strategy
- Phase G1: Single region with global-ready abstractions.
- Phase G2: Second region deployment with regional policy profile.
- Phase G3: Multi-region traffic strategy and failover playbooks.
- Phase G4: Country-specific emergency/compliance extensions.

## Data Model Additions (Planned)
- `tenant_id`
- `country_profile`
- `home_region`
- `data_residency_policy`
- `language_pair`
- `regional_eligibility`

## Procurement Readiness Outputs
- Region/country capability matrix.
- Security and compliance control mapping per profile.
- SLA/SLO reporting by tenant and region.
- Audit export format for enterprise reviews.

## Verification Expectations
Before enabling a new country profile:
1. Config validation for profile constraints.
2. State/callflow regression tests in target locale/profile.
3. Signaling runtime and drain E2E tests.
4. Feature-gate matrix approval (`docs/product/feature-gate-matrix.md`).

## Out of Scope (Current)
- Full legal interpretation of country telecom law.
- Country-specific emergency integration implementation details.
- Billing/tax localization.

## Next Actions
1. Add `country_profile` to config schema.
2. Add dial-plan adapter interface in signaling layer.
3. Add interpreter regional eligibility fields in allocator model.
4. Add global capability matrix document for sales/procurement.

