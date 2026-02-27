# Context and Integrity Platform

## Purpose
Prevent drift and uncontrolled behavior by centralizing state context and integrity checks.

## Components
- `services/context/`: unified context service scaffold
- `schemas/context/context-schema.json`: context model schema
- `config/context-integrity.json`: integrity policy baseline
- `scripts/validate-context-integrity.js`: enforceable validation

## Design Principle
Stateless domain services, stateful context platform.

## Context Types
- session context
- user context
- interpreter context
- conversation context

## Integrity Controls
- versioned context updates
- immutable audit requirement
- role-based access requirement
- schema validation requirement
