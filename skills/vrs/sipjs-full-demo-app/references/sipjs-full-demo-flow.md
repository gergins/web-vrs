# SIP.js Full Demo Flow (VRS Adaptation)

## Purpose
Provide a concise implementation map for using SIP.js browser client behavior in VRS web clients.

## Canonical Upstream
- Official SIP.js repository: https://github.com/onsip/sip.js/
- Prefer upstream API names and release notes when behavior differs from older examples.

## Core Objects
- `UserAgent`: SIP transport/session root
- `Registerer`: SIP registration lifecycle
- `Inviter`: outgoing call session
- incoming invitation/session handler: incoming call lifecycle

## Registration Baseline
1. Build `UserAgent` with:
   - websocket transport server(s)
   - URI (AOR)
   - authorization username/password
2. Start user agent.
3. Register using `Registerer`.
4. Track registration success/failure in UI and logs.

## Outgoing Call Baseline
1. Validate target SIP URI.
2. Create `Inviter`.
3. Attach state listeners before `invite()`.
4. Start invite and map provisional/final responses:
   - 100 -> `trying`
   - 180/183 -> `ringing`
   - 2xx -> `answered`
   - 3xx-6xx -> `failed`
5. Attach remote media after established state.

## Incoming Call Baseline
1. Detect incoming invitation.
2. Show incoming visual alert.
3. Accept/reject explicitly.
4. On accept, attach local/remote streams and track established state.

## End Call Baseline
1. Send BYE/terminate session.
2. Stop local media tracks.
3. Clear remote stream.
4. Emit `ended` state.

## Event Mapping Contract
Use stable event names for UI + observability:
- `sip-registering`
- `sip-registered`
- `sip-register-failed`
- `sip-dialing`
- `sip-trying`
- `sip-ringing`
- `sip-answered`
- `sip-failed`
- `sip-ended`

## Production Notes
- Keep SIP auth and transport in environment configuration only.
- Add retry/backoff around registration.
- Surface final SIP code/reason in status panel and logs.
- Separate internal relay status and external SIP endpoint status.
