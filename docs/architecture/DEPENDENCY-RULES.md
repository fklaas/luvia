# Luvia Dependency Rules

## 1. Canonical truth

Each business domain has one canonical truth owner.

Consumers must not duplicate that truth in parallel stores, fallback databases or private snapshots.

## 2. Contract-first cross-core access

A consumer outside a domain core should use that domain's public contract.

Private implementation details are not stable integration APIs.

## 3. Database ownership

A core must not directly read or mutate another core's database objects unless an explicit ownership exception exists.

Existing repository guardrails remain authoritative.

## 4. Experience Core boundary

Experience Core may provide visual and interaction infrastructure.

It must not own or persist Trip, Places, Booking, Media, Identity, Social or Intelligence domain truth.

Experience components receive state through public inputs, domain projections or supported contracts.

## 5. Intelligence Core boundary

Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.

Allowed pattern:

`Intelligence -> Domain Contract -> Context / Projection`

Allowed action pattern:

`Intelligence -> Domain Contract / Command -> Domain Core`

Forbidden pattern:

`Intelligence -> private Domain Store`

Forbidden pattern:

`Intelligence -> direct foreign Domain DB mutation`

## 6. Migration over duplication

When legacy and new architecture overlap, migrate through adapters and compatibility layers.

Do not create an unrelated replacement implementation beside the canonical system.

## 7. Owner / bridge classification

Files with write responsibility, bootstrap responsibility or compatibility responsibility must not be migrated as ordinary consumers.

Classify before moving.

## 8. Timeline boundary

`core/places/timeline-core.js` is reserved for a later Journey / Timeline Aggregation Architecture Audit.

Do not classify it as an ordinary Places consumer solely because of its current path.

## 9. Experience changes versus core changes

Do not combine a broad visual redesign with a risky domain-core boundary change in the same build.

The future Experience Core exists specifically so global redesign work can later proceed against stable domain contracts.

## 10. Tests

Every migration slice must have targeted regression coverage.

Repository-wide safe regression and ownership guardrails remain mandatory at release gates.
