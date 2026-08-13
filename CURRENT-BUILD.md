# CURRENT BUILD

- App: **13.81.5**
- Core: **4.81.5**
- Name: **M3.1 Trip Contract Adapter Foundation**
- Channel: production
- Date: 2026-08-13

## Scope
- Additive runtime implementation of the M2 `trip.v1` contract.
- Immutable Trip read projections over the existing `LuviaTripStore` / `LuviaTripContext` truth.
- Owner-command delegation for active selection, create, update and join.
- Versioned Trip contract event envelope over existing DOM CustomEvent transport.
- Existing Trip APIs, legacy bridges and persistence remain unchanged.

## Deployment
- Database migration: NO
- SQL deployment: NO
- Edge Functions: NO
- New secrets: NO
- Static app: YES

## Core truth
M3.1 introduces no second Trip state or persistence path. `LuviaTripStore` remains frontend Trip state truth and Trip-owned use cases remain mutation owners.
