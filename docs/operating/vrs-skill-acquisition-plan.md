# VRS Skill Acquisition Plan

## Purpose
Define the exact skill categories to collect from upstream ecosystems and how to map them to VRS production traits.

## Exact Skill Set to Collect
### Frontend
- UI architecture
- Accessibility review
- Component generation

### Backend
- Database schema design
- Query optimization
- Auth and RBAC

### Realtime and Infrastructure
- API design
- WebSocket and realtime messaging
- Observability

### DevOps and Quality
- CI/CD pipelines
- Testing strategy
- Incident runbooks

### AI and Automation
- Agent tooling orchestration
- Captioning and NLP assist
- Analytics insight

## VRS Skill Bundle Layout
```text
vrs-skill-bundle/
  foundation/
    api-design
    database-schema
    auth-rbac
  realtime/
    websocket
    observability
    performance
  product/
    accessibility-review
    ui-architecture
  operations/
    incident-runbook
    ci-cd
  ai-layer/
    captioning
    analytics
```

## Fork Strategy
### Keep (high ROI)
- architecture skills
- backend and database skills
- realtime and infra skills
- DevOps and observability skills
- security and compliance skills

### Optional
- product ideation
- generic writing and documentation helpers

### Trim
- non-technical creative skills
- irrelevant domain skills
- duplicate scaffolding skills

## VRS Trait Mapping
| Skill category | Primary VRS traits improved |
|---|---|
| Frontend | Deaf-first UX, visual clarity, operator ergonomics |
| Backend | session integrity, routing accuracy, data reliability |
| Realtime/Infra | low latency, stability, scalability |
| DevOps/Quality | release safety, incident response readiness |
| AI/Automation | assistive augmentation with human control |

## Adoption Rules
1. Import patterns as reference first.
2. Map each imported pattern to an existing local VRS skill before use.
3. Keep new/imported skills catalog-only by default.
4. Require passing gates before enabling any behavior:
- `npm run validate:skill`
- `npm run validate:skills`
- `npm run test:skills`
- `npm run verify`
