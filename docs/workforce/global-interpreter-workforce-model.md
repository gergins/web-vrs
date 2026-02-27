# Global Interpreter Workforce Model

## Purpose
Define configurable interpreter workforce patterns so one platform can support public-service, market, and hybrid operating models.

## Workforce Model Families
1. Public-Service Model
- stable scheduled workforce
- equity and coverage metrics priority
- public-sector governance alignment

2. Market-Driven Model
- mixed employment (full-time + remote + contractor)
- efficiency and availability metrics priority
- higher utilization and speed-of-answer focus

3. Hybrid Contract Model
- core employed staff + flexible contractor pool
- compliance + cost/coverage balance

4. Emerging Expansion Model
- smaller pools and remote-first operations
- training/certification and access growth priority

## Required Workforce Capabilities
- multi-employment-type support
- credential and certification tracking
- scheduling (shift, on-demand, appointment)
- skill and language tagging
- deterministic routing + preference constraints
- fatigue and wellbeing safeguards
- training and continuing education tracking
- performance analytics by workforce profile

## KPI Modes
1. Equity/Coverage Mode
- geographic coverage
- user satisfaction
- fairness distribution

2. Efficiency/Availability Mode
- speed of answer
- utilization
- calls handled per interval

## Platform Rule
Workforce behavior must be profile-driven via config files under `config/workforce-profiles/`.
No country-wide hardcoded workforce logic in core routing modules.

## Validation
- `npm run validate:workforce-profiles`
- included in `npm run verify`
