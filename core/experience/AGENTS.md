# Experience Core Agent Instructions

Scope: `core/experience/**`

## Purpose

Build and maintain Luvia's shared visual and interaction system.

## Allowed ownership

- design tokens
- theme logic
- layout primitives
- reusable UI components
- shared interaction patterns
- states
- motion
- accessibility
- icon infrastructure
- experience diagnostics

## Forbidden ownership

Do not create or persist canonical Trip, Places, Booking, Media, Identity, Social or Intelligence truth here.

Do not move domain business logic into a visual primitive.

Do not make Experience Core a global application-state store.

## Dependency rule

Experience primitives should receive state through explicit inputs, stable projections or supported public contracts.

## Migration rule

Do not bulk-move existing CSS or UI files into this directory.

Classify shared primitive versus domain composition first.

## Design-system evolution

Large global visual changes should be built on shared tokens and primitives rather than repeated per-screen patches.

A broad visual redesign and a risky domain-core boundary migration should not be combined in the same release.
