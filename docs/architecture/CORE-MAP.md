# Luvia Core Map

## Purpose

This document gives humans and coding agents a fast architectural map.

The machine-readable locked-core registry is `config/luvia-cores.json`.

## Locked domain roots

### Trip

Root: `core/trips/`

Owner stream: `feature/platform-core`

Role: canonical Trip truth.

Public boundary: `core/platform/trip-contract-adapter.js`

Consumers must not create independent Trip truth.

### Places

Root: `core/places/`

Owner stream: `feature/platform-core`

Role: canonical Places domain behavior and Place lifecycle infrastructure.

Public boundary: `core/platform/places-contract-adapter.js`

Long-term direction: declarative Category Registry plus shared category primitives.

### Booking

Root: `core/booking/`

Owner stream: `feature/booking-core`

Role: Booking truth, reservation lifecycle, mutations, provider integration and recovery.

## Foundation cores

### Experience

Root: `core/experience/`

Owner stream: `feature/experience-core`

Role: shared design and interaction architecture.

Domain truth ownership: none.

### Intelligence

Root: `core/intelligence/`

Owner stream: `feature/intelligence-core`

Role: reasoning, orchestration, AI capabilities, Intelligence-specific memory, recommendations and proactive intelligence.

Domain truth ownership: Intelligence-specific state only.

## Existing contracted domains

Media and Identity already have contract-adapter foundations under `core/platform/`.

Their full future core-root / stream topology is not redefined by M4.5.3.

Until a dedicated ownership migration locks those boundaries, file-level ownership remains authoritative through `docs/modularization/FILE-OWNERSHIP.csv`.

## Reserved architecture

### Journey / Timeline

Current file: `core/places/timeline-core.js`

Status: RESERVED.

Do not automatically move it with ordinary Places consumers.

Future work: Journey / Timeline Aggregation Architecture Audit.
