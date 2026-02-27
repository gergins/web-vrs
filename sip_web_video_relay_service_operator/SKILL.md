---
name: sip_web_video_relay_service_operator
description: Operational framework enabling Codex to architect, implement, validate, and evolve a SIP-based Web Video Relay Service using WebRTC, SRTP media bridging, interpreter routing, and scalable infrastructure.
---

# SIP-Based Web Video Relay Service Operator

## Purpose
Enable deterministic operation of a SIP/WebRTC Video Relay Service.

## System Context
Actors:
- WebRTC users
- Video interpreters
- SIP endpoints
- Relay orchestration services

Core Systems:
- SIP registrar/proxy
- WebSocket SIP transport
- RTP/SRTP relay
- Session state manager
- Interpreter allocator
- TURN/STUN servers
- Monitoring stack

Constraints:
- <300ms latency target
- TLS for signaling
- SRTP for media
- Deterministic state transitions
- Horizontal scaling

## Operational Model
Codex must:
1. Inspect repo before modification
2. Validate configs via scripts
3. Enforce TLS + SRTP
4. Validate state schema before edits
5. Run call flow tests before deployment

## Architecture
Client Layer ? WebRTC + SIP WS  
Signaling Layer ? REGISTER / INVITE routing  
Media Layer ? RTP bridge + SRTP enforcement  
Session Layer ? Dual dialog correlation  
Infra Layer ? Containers + health checks + metrics  

## Execution Rules
- Reject plaintext SIP
- Reject hardcoded credentials
- Enforce structured logging
- Validate codec policy before media changes
- Abort deployment if health checks fail

## Failure Handling
Identify layer ? Run validation script ? Apply deterministic correction ? Re-test.

## Evolution Strategy
Maintain backward compatibility.
Version templates.
Support distributed media nodes and QoS expansion.
