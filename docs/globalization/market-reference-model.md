# Market Reference Model

## Purpose
Provide reusable market-reference traits for planning country profiles and phased rollout.

## Reference Markets
| Market | Strong Requirement Traits | Profile Focus |
|---|---|---|
| Sweden | national accessibility procurement model, emergency accessibility expectations, telecom-grade reporting | `SE` profile with compliance-first rollout |
| France | emergency accessibility pathway via 114, RGAA public-service accessibility baseline, regulator-governed telecom context | `FR` profile with emergency + accessibility conformance focus |
| United States | detailed TRS/VRS operational standards, numbering/registration, emergency obligations | `US` profile with scale + audit controls |
| United Kingdom | emergency video relay obligations, telecom accessibility regulation | `GB` profile with emergency pathway rigor |
| EU Baseline | GDPR + accessibility directives + country-specific regulatory overlays | `EU` baseline with member-state overrides |
| Canada | public-interest relay governance, administrator/oversight model | country profile with governance reporting emphasis |
| Australia | national relay service model, operational delivery controls | country profile with service-window and operations controls |
| New Zealand | government-contracted relay model and service delivery constraints | country profile with contract/SLA alignment |

## Reuse Pattern
1. Start from `config/country-profiles/template.json`.
2. Fill legal/compliance and emergency fields from market profile.
3. Keep routing/numbering/interpreter policies configurable.
4. Validate with `npm run validate:country-profiles`.
5. Approve via `docs/product/feature-gate-matrix.md`.
