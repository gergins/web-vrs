# Callflow Sequence (Starter)

```text
Deaf User Web Client
        |
        | 1) Login + connect signaling
        v
Signaling Server
        |
        | 2) Request call
        v
Assignment Service -> finds interpreter
        |
        v
Interpreter Client
        |
        | 3) Accept call
        v
Signaling Server
        |
        | 4) Exchange WebRTC offer/answer + ICE
        v
WebRTC Media Session
        |
        | 5) Context service stores session in Redis
        v
Context Service -> Redis
        |
        | 6) SIP gateway bridges if external call
        v
External SIP Network
```
