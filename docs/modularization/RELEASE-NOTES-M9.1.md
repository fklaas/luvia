# Release Notes — M9.1 Navigation Contract Foundation

Date: 2026-08-23
Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Release identity

- App / Core: `13.82.26 / 4.82.26`
- Feature: `5248eccdbb2d8616a1b8248ec065bfc56bc41b7c`
- Runtime release: `8a538e395aadf361fe9c2d360e258ecad35de880`
- Previous Production runtime: `240968cd81d13610fa24a7c79892415df0871067`

## User-visible and architectural result

M9.1 introduces one browserless `navigation.v1` meaning for Web, future iOS/Android clients and authorized Luvia Intelligence tools. Fifteen routes, five top-level dock items, aliases, immutable navigation intents, sanitized parameters, Deep Link parsing/serialization and declarative module-mount descriptors now have a single Platform owner.

The existing Web App Shell remains backward-compatible. `DeepLinkPort` publishes a versioned navigation intent and no longer calls `LuviaApp.show()` directly. Navigation remains separate from Domain Commands: opening a screen never implies changing Domain Truth.

## Quality evidence

- Focused M9.1 regression: PASS
- NFR-0: `3/3 PASS`
- Safe Regression: `50/50 PASS` on Platform, Integration and Main
- DB ownership debt: unchanged (`26` mapped, `39` unmapped, `27` dynamic)
- Integration Preview: `11/11` exact assets, `5/5` privacy, `25/25` authenticated F5, active Trip, navigation PASS, console `0/0`
- Production: `11/11` exact assets, `5/5` privacy, `25/25` authenticated F5, active Trip, Planen -> Places, ten categories, console `0/0`

## Runtime provenance

- Integration version: `43c5bdbb-569a-417c-9d69-9428abd5b86e`
- Integration build/check: `99bf67e7-f36e-4d0c-93cc-6791b34d8baf` / `97191761126` — SUCCESS
- Production version: `7e41749e-23ee-41e6-b67d-b0a3379c3969` at 100%
- Production deployment: `a1310844-e263-4c96-903c-50eace9f39da`
- Production build: `a855c3b3-cb97-478a-873a-aa6bb58be7dc`
- Production GitHub check: `97193079285` remained `in_progress` without error/conclusion at closeout. No success conclusion is invented; exact Production assets, authenticated UI/F5 acceptance and Cloudflare's 100% deployment independently prove the deployed state.

## Scope exclusions and rollback

There was no database/schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move, Consumer App Shell rewrite or Journey/Timeline reclassification.

Rollback is code-only to M8.5 runtime `240968cd81d13610fa24a7c79892415df0871067` and Production version `af037f55-89b6-48a8-a441-7c747d08064a`; no data rollback is required.

M9.1 is closed. M9 remains in progress, with staged boot and explicit module mounting next.
