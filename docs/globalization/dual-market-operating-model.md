# Dual-Market Operating Model (Sweden + United States)

## Purpose
Provide a reusable operating model that supports both:
- procurement-governed national service delivery (Sweden-style)
- regulated competitive provider delivery with usage reimbursement (U.S.-style)

## Core Principle
One platform, multiple operating profiles.
Do not fork product architecture by country; configure behavior by market profile.

## Market Structure Comparison
| Dimension | Sweden-Style | U.S.-Style | Platform Requirement |
|---|---|---|---|
| Governance model | Public procurement contract | Regulated competitive market | `governance_profile` switch |
| Funding model | Contract/SLA-based | Usage/per-minute reimbursement | Contract + usage analytics engine |
| User onboarding | Prescriber-mediated | Self-registration + eligibility verification | Dual enrollment workflows |
| Provider landscape | Often centralized operator | Multiple certified providers | Multi-tenant + interoperability |
| Oversight style | Contract KPI/SLA reviews | Regulatory audits/anti-fraud controls | Reporting + audit module |

## Required Cross-Market Modules
1. Regulatory & Contract Reporting Engine
- SLA, KPI, incident, and usage reporting
- export packs for audits and authority reviews

2. Enrollment Engine
- prescriber workflow path (assessment/configuration/training)
- self-registration path (identity/eligibility/numbering)

3. Numbering & Interop Layer
- E.164 management
- SIP/URI interoperability between providers/endpoints
- emergency routing policy adapter

4. Funding & Billing Layer
- contract performance metrics for procurement markets
- per-minute usage accounting for reimbursement markets

5. Compliance & Anti-Fraud Layer
- role-based access controls
- audit trails and anomaly detection
- market-specific anti-fraud controls

## Workflow Profiles
### Profile A: Procurement-Driven
1. Authority/region contract requirements loaded
2. Prescriber onboarding enabled
3. SLA governance dashboards active
4. Contract reporting cadence enforced

### Profile B: Regulated Competitive
1. Self-registration eligibility flow enabled
2. Numbering + provider portability paths enabled
3. Usage/reimbursement reporting enabled
4. Audit and fraud controls intensified

## Data Model Extensions (Planned)
- `governance_profile` (`procurement` | `regulated_competitive`)
- `funding_model` (`contract` | `usage_reimbursement`)
- `eligibility_path` (`prescriber` | `self_registration`)
- `regulatory_report_bundle_id`
- `reimbursement_claim_id`

## Go-Live Checklist by Market
1. Country profile validated (`npm run validate:country-profiles`)
2. Governance profile selected and tested
3. Enrollment path configured and tested
4. Emergency behavior profile approved
5. Reporting and audit exports validated
6. Full verification gate passed (`npm run verify`)

## Reuse Guidance for New Markets
1. Start from country profile template.
2. Choose governance profile first.
3. Map funding and enrollment requirements.
4. Add only market-specific deltas as configuration.
5. Avoid branching core call/session logic.
