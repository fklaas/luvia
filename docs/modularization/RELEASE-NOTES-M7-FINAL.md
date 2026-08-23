# Release Notes — M7 FINAL Media Core Isolation

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

Runtime: **App 13.82.22 / Core 4.82.22**

## Commits

- source-lock marker: `a44e95c3ba5a7e144652f90e95e9bc6f04c20526`;
- feature: `48e496aec0605d2dc8650f25692539010b67ca10`;
- runtime release: `2e87a9fcce31d15fa73c2abf2c183b413154c606`.

## Architecture result

M7 closes with one Media truth owner and a platform-neutral rules layer. The new browserless Media Domain Contract Core owns canonical/public/Realtime projection rules and upload-task transitions. Web object storage and durable upload staging sit behind MediaStoragePort; network and lifecycle transitions sit behind their existing Platform Ports. The same Domain rules can therefore be consumed by future iOS and Android adapters without importing DOM, browser storage, Supabase, or Web navigation into the Media Core.

The canonical Media owner no longer calls Supabase Storage directly (**7 -> 0**), and the canonical portion of the legacy Gallery bridge no longer calls the private Media Core (**10 -> 0**). Public reads, subscriptions, signed asset delivery, download, legacy update, and commands cross `media.v1` 1.2.0 while Contract major v1 remains stable.

Gallery, Memory Experience, Smart Photo, and AI Memory own no Media truth. Media Clustering and Memory Album/Card/Journey services remain same-owner internals. Timeline/Journey remains a separately classified cross-domain aggregator, is unchanged, and retains exactly two measured direct Media references.

## Native and offline behavior

- browserless Media Domain Core: **PASS**;
- MediaStoragePort Web adapter: Supabase object operations plus IndexedDB pending-command queue;
- NetworkPort: online state plus transition subscription;
- LifecyclePort: foreground/background transition source;
- offline uploads: staged as owner commands and drained on eligible online/foreground transitions;
- online uploads: existing visible behavior preserved;
- Web background claim: limited to an active Web runtime; no false closed-browser/native-OS execution claim;
- native path: iOS/Android adapters may bind the same coordinator to native background-transfer facilities.

IndexedDB contains pending command payloads only. It is not an authoritative Media database and becomes Media truth only through canonical owner persistence.

## Verification

- focused M7 FINAL guard: **PASS**;
- browserless Media Core smoke: **PASS**;
- NFR-0 Foundation Regression: **3/3 PASS**;
- Safe Regression on Platform, Integration, and Main: **47/47 PASS**;
- Integration Preview: **15/15 byte-exact runtime assets**, **5/5 privacy**, authenticated F5/Gallery, App/Core 13.82.22/4.82.22, active Trip, 51 photos, 10 photo moments, Realtime active, native acquisition actions, console **0 entries**;
- Production: the same acceptance boundary is **PASS**.

## Deployment provenance

- Integration Preview version: `689f9a78-f0b9-46ac-a690-78ac7678d797`, alias `integration`, `has_preview=true`;
- Integration build/check: `64bfe8b8-2f64-4634-9b04-3b9071fdf2ef` / `97173988989`, **SUCCESS**;
- Production version: `e1477e68-d8d1-4cfd-a7a4-c28a73f905dd`, **100% traffic**;
- Production deployment: `83b155fc-58a5-4d4f-a12d-1e3347333d29`;
- Production build/check: `c2fed981-7394-44d5-8af5-1107dadd8687` / `97174286216`, **SUCCESS**.

## Infrastructure and rollback

No database migration, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred.

Rollback is code-only: restore the former Media owner Web-storage calls and legacy compatibility calls, remove the new Domain/Storage adapters and focused guard, and restore `media.v1` runtime 1.1.0. Pending IndexedDB commands may be retained for a forward fix or explicitly cleared by the Web adapter. No canonical Media data rollback is required.

M7 is **COMPLETE / CLOSED**. M8 starts from a fresh read-only baseline after the eight-stream closeout synchronization.
