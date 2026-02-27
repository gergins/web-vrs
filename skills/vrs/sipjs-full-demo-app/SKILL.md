---
name: sipjs-full-demo-app
description: Build and harden a real SIP.js webphone flow for browser-based SIP registration, INVITE handling, call state events, and media attachment for VRS-style relay clients. Use when implementing or debugging SIP-over-WebRTC client behavior, SIP account registration, call progress states, or SIP endpoint reachability.
domain: vrs_skill_collection
owner: project-maintainers
version: 1.0.0
last_updated: 2026-02-20
---

# sipjs-full-demo-app

## Mission
Implement real SIP.js client behavior (register, call, answer, end) with deterministic status reporting and production-safe defaults.

## Primary Source
- Official repository: https://github.com/onsip/sip.js/
- Use this as canonical behavior reference before third-party examples.

## Inputs
- SIP account config: websocket server, AOR, auth username/password, outbound proxy
- call target (SIP URI)
- UI role context (deaf user or interpreter)

## Outputs
- deterministic SIP registration and call workflows
- clear user-facing call states (`dialing`, `trying`, `ringing`, `answered`, `failed`, `ended`)
- media stream attachment rules for local/remote video elements

## Workflow
1. Validate config exists and reject empty/placeholder credentials.
2. Initialize `UserAgent` and `Registerer` with explicit transport and auth.
3. On startup, register and expose registration state in UI.
4. For outgoing calls:
   - create inviter/session
   - wire state listeners before `invite()`
   - map SIP progress responses to UI states
5. For incoming calls:
   - show high-visibility incoming banner
   - allow accept/reject explicitly
   - attach remote media only after session established
6. On terminate/failure:
   - cleanup peer/media tracks
   - keep reason codes available for logs/diagnostics

## Guardrails
- Do not mark call as connected before SIP 2xx or established session callback.
- Keep SIP and media status separate; interpreter-leg connected is not equal to external SIP answered.
- Never hardcode SIP credentials in source.
- Persist selected camera and camera on/off state per role.
- Emit structured status events so backend and UI remain consistent.

## Reference Usage
Use `references/sipjs-full-demo-flow.md` for implementation shape and event mapping.
