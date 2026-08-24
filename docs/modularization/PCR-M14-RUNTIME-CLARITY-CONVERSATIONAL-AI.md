# PCR M14 - Runtime Clarity and Conversational Luvia AI

Date: 2026-08-24

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Problem and measured scope

The active App Shell repeated six nearly identical dynamic Booking asset
loaders, the repository still contained five unreachable archived UI copies,
and the global Luvia Intelligence dialog did not expose an explicit submit
control or a visible conversation history. The measured scope was limited to
runtime clarity, proof-based legacy retirement and the presentation-safe AI
conversation boundary. It did not authorize a Domain ownership change.

M14 changed 25 files relative to the M13 documentation marker, with **499
insertions and 8,043 deletions**. The deletion is dominated by archived UI
copies; no user data, database object or cloud configuration was deleted.

## Delivered architecture

### App Shell runtime assets

- Six duplicated Booking loader paths now use one declarative
  `bookingRuntimeAssets` registry and one generic `ensureRuntimeAsset` path.
- In-flight requests are deduplicated, release identity is current, failures
  have a bounded timeout and diagnostics remain observable.
- The loader composes Web runtime assets only; it owns no Booking, Trip or
  other Domain truth.

### Proof-based Paris retirement and target structure

The retirement manifest records reachability, replacement and original Git
blob for every deletion. M14 removed:

- `legacy/ui/index-v11.0.0.html`;
- `legacy/ui/luvia-app-shell.css`;
- `legacy/ui/luvia-dashboard.css`;
- `legacy/ui/luvia-dashboard.js`;
- `legacy/ui/luvia-v7-enhancements.js`.

Four files were byte-identical archived copies of surviving root assets; the
HTML was an unreachable v11 snapshot. All remain recoverable from Git.

The target structure is owner-first and applies to all eight synchronized
streams:

- `core/<domain>/`: canonical Domain truth and browserless rules;
- `core/runtime/`: platform-neutral runtime policy;
- `core/experience/`: shared design and interaction semantics, no Domain truth;
- `app/`: Web composition and adapters;
- `modules/`: category composition over contracts, no duplicate truth;
- `legacy/`: only explicitly reachable compatibility code with a named
  replacement and removal gate.

M14 intentionally retains `core/legacy/paris-migrator.js`,
`legacy/paris/cloud-adapter.js` and `paris-official.html`. Current Trip/Media
compatibility consumers still reach them. They are registered debt with exit
gates, not the target architecture. A broad directory move remains forbidden
until ownership, replacement and regression evidence exist.

### Conversational Intelligence and Experience

- The Luvia composer is a semantic form with a visible **Senden** control.
- Enter submits; Shift+Enter inserts a line break; IME composition, empty input
  and concurrent double-submit are guarded.
- User and assistant turns remain visible in a scrollable conversation thread.
- Contextual follow-ups can populate the composer without executing a command.
- Conversation scrolling is separate from the fixed composer/actions and
  remains reachable at desktop, laptop, mobile and simulated-keyboard heights.
- Dynamic viewport/safe-area sizing, reduced-motion handling and minimum
  44-pixel actions are part of the Experience boundary.
- Intelligence reads public projections. M14 adds no direct Domain mutation or
  Domain command authority. Future booking, itinerary or place actions must
  remain `Intelligence -> explicit Domain command -> owner confirmation and
  receipt`.

Timeline/Journey remains a separate cross-domain aggregator. It was not
reclassified as a normal Places, Trip or Intelligence consumer.

## Ownership map and future separation discipline

Established owner boundaries now include Platform, Trip, Places, Booking,
Media, Identity, Events, Intelligence, Experience, Journey and Memory. The
Social Experience Graph remains a dedicated stream and architectural domain
boundary while its durable subdomain truth is still being measured.

The strongest future Core candidates are Collaboration/Membership,
Preferences/Personalization, Notifications/Attention, Payments/Commerce and
Reviews/Reputation. Search/Discovery should remain a cross-domain query and
composition layer unless a future inventory proves independent durable truth.
Availability remains Booking-owned unless its rules and lifecycle prove a
separate bounded context. No candidate is created merely to make the folder
tree more symmetrical.

## Measured release result

- Runtime App/Core: **13.82.45 / 4.82.45**.
- Consumer feature: `5c5abb54885c3625a147be01064a11921ac082cb`.
- Intelligence features: `2794645e25a2303d76846efb6d3ecbd1aa7d3ce3`
  and `e3846cb9775e90a35829b12d37acdd7806bcee9f`.
- Experience features: `1c8730d48534e6c564af22f0f774ab42a32f1d0`
  and `6ede24b86ba89526ae4ff20faa4c3f611e0ec41e`.
- Runtime Integration/Main: `41a1b651c24dcc300454043fcca8d99bf515b6dc`.
- Safe Regression: **74/74 PASS**; NFR-0: **3/3 PASS**.
- Cross-Core DB guard: static **310**, mapped **30/30** (historical baseline
  **26**), unmapped **39/39**, dynamic **27/27**; no growth.

## Preview and Production acceptance

Integration Preview version `2225b653-d0b0-4154-b000-47d49266f513` and its
stable alias each served **9/9 byte-exact Git blobs**, **5/5 private-path SPA
fallbacks** and **5/5 retired-path SPA fallbacks**. Authenticated AI,
keyboard, focus, responsive and real-context acceptance passed. The final
authenticated F5 series was **25/25**, 3.552-4.789 seconds, average 4.150
seconds, with overlay depth zero and console **0/0**.

Production version `5ecb0362-579f-4c7d-a8b3-c50b12572823` is active at
100 percent in deployment `935193e9-ba4a-42e4-aee7-36909ba63b90`. Its
immutable URL and `myluvia.app` each served the same exact/fallback gates.
Authenticated conversational, responsive and focus acceptance passed; the
final F5 series was **25/25**, 4.553-7.932 seconds, average 5.725 seconds,
with overlay depth zero and console **0/0**.

The first ten Preview reload samples used a rejected browser predicate that
queried non-existent or isolated `window` runtime globals and returned
`trip:null`. The UI was stable. Those samples are retained as rejected test
evidence and are not rewritten as application failures or accepted passes.

## Infrastructure and rollback

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider change: NONE.
- Manual Cloudflare configuration or manual Cloudflare upload: NONE.
- Cloudflare causation is not inferred from chronology; the recorded
  version/deployment sources contain no Git commit annotation.

Rollback is code-only to the M13 documentation marker
`00e6e8c67757d9149ba8d5cbddbe6ef38db25313`. Deleted files are recoverable
from that history. No database, data or infrastructure compensation is
required.
