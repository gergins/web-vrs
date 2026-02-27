# Country Intake Questionnaire Template

## Purpose
Collect all required inputs to configure and launch a new country profile without forking core platform logic.

## 1. Regulatory and Classification
- Country:
- Primary regulator(s):
- Service classification target:
  - telecom operator
  - software platform
  - marketplace
- Licensing requirements summary:
- Procurement or market model:
  - contract/procurement
  - regulated competitive market
  - hybrid

## 2. Service Scope
- Required relay modes:
  - video relay
  - text relay
  - speech-to-speech
  - RTT/captions
- Required service hours:
- Priority user groups:
- Mandatory accessibility standards:

## 3. Emergency Communications
- Emergency number(s):
- Emergency relay obligations:
- Required location handling behavior:
- Maximum response-time requirement:

## 4. Enrollment and Eligibility
- Onboarding model:
  - prescriber
  - self-registration
  - hybrid
- Identity verification requirements:
- Eligibility proof requirements:
- Numbering assignment/portability rules:

## 5. Interpreter Policy
- Certification/accreditation requirements:
- Language and dialect requirements:
- Cross-border interpreting constraints:
- Accommodation policy constraints (cultural/religious/legal):

## 6. Privacy, Data, and Compliance
- Privacy law baseline:
- Data residency requirements:
- Data retention periods:
- Recording and consent requirements:
- Audit/reporting obligations:

## 7. Operations and SLA
- Availability target:
- KPI/SLA targets (wait time, answer speed, uptime):
- Incident escalation obligations:
- Reporting cadence and format:

## 8. Funding and Commercial Model
- Funding model:
  - contract
  - reimbursement
  - mixed
- Required billing/claim fields:
- Reimbursement evidence required:

## 9. Interoperability and Integrations
- SIP/PSTN interconnect requirements:
- External provider interoperability requirements:
- Public-sector integration requirements:

## 10. Localization and Support
- Required UI languages:
- Legal text localization requirements:
- Support channel requirements:
- Country-specific onboarding/training requirements:

## 11. Delivery Decision
- Launch readiness decision:
  - ready for profile creation
  - needs legal clarification
  - needs technical discovery
- Key blockers:
- Owner and target date:

## Conversion to Implementation Artifacts
After completion, create/update:
1. `config/country-profiles/<country>.json`
2. market notes doc under `docs/globalization/`
3. feature-gate record using `docs/product/feature-gate-matrix.md`
4. validation evidence (`npm run validate:country-profiles`, `npm run verify`)
