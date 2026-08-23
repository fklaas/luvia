# PCR – M10.5 Experience Contract and Premium AI Pilot

Status: APPROVED FOR IMPLEMENTATION BY MEASURED SCOPE LOCK

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
