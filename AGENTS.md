# Luvia Repository Agent Guide

This repository is a modular production application. Do not treat it as a single undifferentiated codebase.

## Read before changing code

1. `ARCHITECTURE.md`
2. `config/luvia-streams.json`
3. `config/luvia-cores.json`
4. `docs/architecture/CORE-MAP.md`
5. `docs/architecture/DEPENDENCY-RULES.md`
6. `docs/architecture/CONTRACT-MAP.md`
7. `docs/architecture/MIGRATION-STATE.md`
8. `docs/modularization/FILE-OWNERSHIP.csv`
9. `docs/modularization/PARALLEL-DEVELOPMENT-RULES.md`
10. `CURRENT-BUILD.md`

Directory-specific `AGENTS.md` files add stricter rules for their subtree.

## Core rules

- One domain truth must have one canonical owner.
- Consumers use public contracts instead of private stores or duplicate truth.
- Cross-core database access is forbidden unless explicitly documented by ownership rules.
- Do not create parallel replacement systems beside an existing canonical core.
- Preserve recovery, idempotency, migration and regression behavior.
- Do not move a file merely because its current directory name is misleading; classify ownership first.
- Do not combine a risky core-boundary change with a large visual redesign in the same release.
- `core/journey/` owns the browserless Journey Day Graph and conflict policy. `core/places/timeline-core.js` is only the classified Web/DB compatibility provider behind `journey.v1` and must not be used directly by consumers.

## Experience Core

`core/experience/` owns shared visual and interaction infrastructure.

It does not own Trip, Places, Booking, Media, Identity, Social or Intelligence truth.

Domain-specific product composition may consume Experience primitives while remaining owned by its domain or product stream.

## Intelligence Core

`core/intelligence/` owns Intelligence-specific infrastructure and Intelligence-specific state.

**Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.**

Domain information must be consumed through public contracts.

Domain actions must follow:

`Intelligence -> Domain Contract / Command -> Domain Core`

Never:

`Intelligence -> direct private domain Store / DB mutation`

## Git and release discipline

Feature work flows through Integration before Main.

Do not claim PASS, COMPLETE, clean, pushed, deployed or production-verified without measured evidence.

Before mutation, verify worktree, branch, HEAD, tracking, live remote, divergence and scope.

After mutation, verify exact changed files, syntax, targeted tests, controlled regression and relevant guardrails.

Do not use force push, hard reset or broad destructive cleanup as normal recovery mechanisms.
