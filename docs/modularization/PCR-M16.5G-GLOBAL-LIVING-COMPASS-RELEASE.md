# PCR M16.5G — Global Living Compass Platform Release

Date: 2026-08-25

Status: IMPLEMENTATION ACTIVE / PLATFORM FEATURE / INTEGRATION PREVIEW PENDING

## Purpose

M16.5G adopts the M16.5E official Living Compass asset family as the global
Luvia runtime identity and packages the productive M16.5F Signed-in Living
Product slice as App 13.82.50 / Core 4.82.50. The former heart-route logo is
retired from all active mounts that resolve through the canonical root logo,
favicon and PWA icon files.

This is a Platform release gate. It does not broaden Consumer composition,
change an owner contract or declare the full M16.5 Design Freeze complete.

## Locked asset adoption

- `luvia-logo.svg` and `favicon.svg` are byte-equivalent projections of the
  shadow-free official Compact Living Compass vector.
- `favicon.ico`, `icon-192.png` and `icon-512.png` come from the official
  professional asset set v2.0 dated 2026-08-25.
- Browser, PWA, boot, App Shell, public entry, Trip Creator and retained legacy
  mounts continue to use their existing stable file paths and therefore adopt
  the new mark without duplicate per-screen logo implementations.
- The neutral Corporate Compass keeps North/Red, East/Orange, South/Blue and
  West/Green. Active-Trip personalization remains a semantic Experience
  projection; the Platform does not read Trip state.

## Release and cache boundary

- App/Core: 13.82.50 / 4.82.50.
- Active `index.html` runtime assets use the 13.82.50 cache key.
- Service Worker cache ID is `luvia-shell-v13.82.50` and retains the five
  canonical logo/icon assets exactly once.
- `force-update.html`, media readiness and the Web Trip Context import follow
  the same release key.
- Historical M16.5C release notes and test evidence remain immutable at
  13.82.49 / 4.82.49.

## Architecture and infrastructure

Experience owns brand geometry and semantic presentation. Platform owns the
global entry, manifest, cache and release provenance. Neither layer owns Trip
Truth, and this release introduces no private Store or direct database path.

No schema, RPC, RLS, bucket, Edge Function or secret mutation is part of this
release. No manual Cloudflare configuration change is authorized. Integration
Preview is uploaded only after the feature and full Safe Regression are green.
Main and Production remain gated by authenticated desktop/mobile visual
acceptance and explicit M16.5 joint review.

## Rollback

Rollback is a normal revert of the Platform feature commit followed by a new
cache-key release. No data rollback is required.
