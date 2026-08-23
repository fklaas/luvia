# PCR – M10.5 Experience Contract and Premium AI Pilot

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

Owner: Experience Core

Owner stream: `feature/experience-core`

## Problem

Luvia has a mature domain/runtime boundary but no platform-neutral Experience contract. Shared visual semantics are split between legacy CSS variables, a minimal browser global and Web-only helpers. This prevents deterministic SwiftUI/Compose mapping and makes visible product evolution unnecessarily repetitive.

## Impacted contracts

- New additive public contract: `experience.v1`.
- Existing `LuviaDesignSystemContract`: retained as a backwards-compatible Web facade.
- Existing `overlay-host.v1`: consumed unchanged by the premium pilot.
- Existing `intelligence.v1`: consumed unchanged; no capability or command authority is added.

## Backward compatibility

- Existing `--lv-*`, Trip accent and Product Module variables remain supported.
- Existing Design System facade fields remain available.
- Existing AI trigger selectors and dialog open behavior remain available.
- Existing M10 overlay lifecycle, focus, dismiss and session cleanup semantics remain authoritative.

## Affected streams and files

- Experience: `core/experience/*`, shared design compatibility and Experience documentation/tests.
- Platform/Web adapter: `app/adapters/experience-web-adapter.js`, `index.html`, `sw.js`, release metadata.
- Consumer: existing App Shell global trigger markup only.
- Intelligence: existing assistant dialog presentation/adoption only.

## Data and infrastructure impact

None. No database, migration, RPC, RLS, bucket, Edge Function, secret, provider or Cloudflare configuration change.

## Test plan

- Browserless VM execution and forbidden-token scan for the physical Experience core.
- Contract schema, immutability, component/state/motion/accessibility and native mapping checks.
- Web adapter and legacy facade checks.
- M10 Overlay Host and global AI pilot adoption checks.
- Controlled Safe Regression and NFR-0 regression.
- Browser acceptance for signed-out and authenticated App Shell, trigger, dialog, focus, prompt, answer/error state, Escape and console.

## Rollout and rollback

Ship as one versioned static runtime bundle. Roll back to the M10 documentation marker if a gate fails. No data rollback is required.

## Measured release evidence

- Runtime implementation/Main commit: `8f70dca88d18488e908b6a2f56c2d76eabdef643`.
- App/Core: **13.82.41 / 4.82.41**.
- Focused M10.5, NFR-0 and controlled Safe Regression: **PASS / 3/3 PASS / 67/67 PASS**.
- Integration Preview version `a6c98e88-4d28-4fdd-8264-0c8f4a7d0c5b`: **13/13 changed deployable assets byte-exact**, **5/5 private-path SPA fallback**, authenticated Trip/version/Experience retention, premium trigger/dialog/prompt/focus/Escape acceptance, **25/25 authenticated F5** at **3.158–3.985 seconds** (average **3.507 seconds**), console **0/0**.
- Production version `f0df5811-3543-49f2-aa44-d53fe7df396f`, deployment `5470e8ac-ec82-4ef3-8bcb-62c0450071aa`: **100% traffic**; version URL and `myluvia.app` each **13/13 byte-exact** and **5/5 privacy**.
- Production product acceptance: active Paris Trip and App/Core identity retained; Experience `v1`, themed semantic action token, 44 px minimum touch target, global Luvia trigger, Restaurant prompt, Overlay Host Escape and focus restoration PASS; final overlay depth zero; console **0/0**.
- Final independent Production F5 series: **25/25 PASS**, **3.047–3.601 seconds**, average **3.202 seconds**.
- Main promotion: fast-forward only.

One earlier Production sample exceeded the initial 12-second locator window after 17 successful reloads. The page subsequently settled correctly with no console error. That sample is retained as rejected evidence and is not part of the accepted independent 25-sample series.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration, Domain Truth move or Timeline/Journey reassignment occurred. Rollback remains code-only to `f789f481876f4fc9dbf2abf8957e0cc6741ef07d`.
