# Release Notes — M2 Module Ownership & Contract Specification

Baseline remains **Luvia v13.81.4 / Core 4.81.4 / `aff59be`**. No runtime behavior was intentionally changed.

## Added

- persisted M1 architecture inventory and per-file ownership catalog;
- formal module/domain ownership map;
- Paris/legacy compatibility map with deletion gates;
- database/table/function/storage ownership boundary documentation;
- dependency and cross-core coupling register;
- parallel-development/PCR rules;
- baseline regression checklist;
- normative M2 public contract specification for Trip, Places, Booking, Media, Identity, Intelligence and future Social;
- seven machine-readable contract JSON skeletons plus a Platform Change Request template;
- machine-readable Contract, DB, file ownership and global-access inventories;
- signed M2 exit gate.

## Explicitly not changed

- no JavaScript/TypeScript/CSS/HTML runtime source;
- no App/Core version;
- no migration;
- no Edge Function;
- no secret/config;
- no Cloudflare deployment configuration;
- no production database/storage content.

## Commit title

`M2: module ownership and contract specification`

## Next

M3 — additive Contract Adapter Foundation. It must wrap current owners, not rewrite them.
