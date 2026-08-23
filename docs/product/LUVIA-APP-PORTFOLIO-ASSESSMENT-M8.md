# Luvia App Portfolio Assessment — M8 Closeout

Date: 2026-08-23

Baseline: App **13.82.23**, Core **4.82.23**, M0-M8 **COMPLETE / CLOSED**

## Rating model

Scores are architectural/product judgments on the measured M8 code and runtime, not marketing claims:

- **Product value (PV):** usefulness and differentiation for travelers;
- **technical maturity (TM):** ownership, contracts, tests, runtime reliability and maintainability;
- **native readiness (NR):** reuse potential for iOS/Android without rewriting Domain rules;
- **decision:** `KEEP`, `EVOLVE`, `REBUILD`, `REPLACE`, or `ADD`.

`REBUILD` means retain the capability and replace its implementation/composition. `REPLACE` means retire the current concept or legacy path after proven parity. A low score does not authorize deletion without reachability, data and rollback evidence.

## Current capability and component portfolio

| Capability / component | PV | TM | NR | Decision | Product/architecture direction |
|---|---:|---:|---:|---|---|
| Trip Core / active Trip / participants | 10 | 9 | 9 | KEEP + EVOLVE | Strong owner and browserless state core; add richer commands, roles and conflict-safe collaboration without weakening `trip.v1`. |
| Today / active-trip dashboard | 9 | 6 | 5 | REBUILD in M11 | High-value entry point, but composition and state handling should become contract-driven Experience patterns with offline/attention states. |
| Journey / Timeline | 10 | 5 | 5 | REBUILD after ownership audit | Strategic cross-domain narrative and itinerary surface; create an explicit projection owner, never hide it inside Trip or Places. |
| Places Core / saved/search/lifecycle | 9 | 9 | 9 | KEEP + EVOLVE | Physical state/projection cores and routing boundary are strong; evolve declarative categories, provider adapters and offline search. |
| Category discovery modules | 8 | 6 | 6 | REBUILD incrementally | Consolidate duplicated module mechanics into declarative category definitions while preserving category-specific capabilities. |
| Maps, mobility and route context | 9 | 5 | 5 | EVOLVE, possible future subdomain | Use Places + Journey + Intelligence contracts; only split a Routing/Mobility Core when durable route/transport truth exists. |
| Booking Core / provider state / recovery | 9 | 8 | 7 | KEEP + EVOLVE | Mature ownership and Control Center integration; add normalized provider capabilities, change/cancel policy and offline recovery. |
| Booking Inbox / provider conversations | 8 | 7 | 6 | EVOLVE | Preserve Booking ownership for provider threads; split general traveler messaging only if it gains independent truth and lifecycle. |
| Control Center | 9 | 7 | 7 | EVOLVE | Excellent operational hub; move to reusable Experience patterns and unify attention, privacy, booking and notification intents. |
| Media Core / upload / Realtime / offline queue | 10 | 9 | 9 | KEEP + EVOLVE | Browserless rules and adapter boundaries are strong; add native background transfer and robust resumable upload later. |
| Gallery | 9 | 7 | 7 | REBUILD in M13/M17 | Keep public Media Contract usage; redesign information architecture, selection, search and memory creation as an Experience surface. |
| Albums, Cards, Memory Worlds and export | 9 | 6 | 6 | EVOLVE, audit Memory Core | Valuable differentiation; separate narrative Memory truth from raw Media only when its independent persistence/lifecycle is explicit. |
| Smart Photo Moments / clustering | 8 | 6 | 6 | EVOLVE under Intelligence + Media | Keep evidence in Media and ranking/reasoning in Intelligence; add explanations and user confirmation for durable narratives. |
| Identity Core / profile / explicit preferences | 9 | 9 | 9 | KEEP + EVOLVE | M8 establishes clean truth and native ports; add privacy receipts, preference history and confirmed signal promotion. |
| Identity & Privacy Center | 8 | 8 | 8 | KEEP + EVOLVE | Visible, trustworthy foundation; grow into a full signal review, consent and connected-device center. |
| Auth/session/security adapter | 10 | 8 | 8 | KEEP + HARDEN | Provider ownership is clean; add native Keychain/Keystore adapters, session device list, revocation and passkeys when scheduled. |
| Cross-Core Events v1 | 9 | 8 | 9 | KEEP + EVOLVE | Stable envelope foundation; next add producer adoption, schema compatibility tests, durable intent handling only where required. |
| Platform Port registry and Web adapters | 10 | 9 | 9 | KEEP + EXPAND | Core native-readiness leverage; add complete native implementations and contract tests rather than platform branches inside Domain code. |
| Notifications | 9 | 4 | 7 | ADD durable intent experience | Current explicit delivery policy is correct but product-light; add Notification Intent Center before APNs/FCM delivery. |
| Offline/PWA/service worker | 9 | 6 | 6 | REBUILD as platform capability | Keep Web delivery but unify cache policy, owner command queues, conflict strategy and diagnostics behind Offline/Sync infrastructure. |
| Intelligence landscape / AI Brain / backend orchestration | 10 | 5 | 4 | REBUILD in M8.5 | High value but physically fragmented; classify first, establish browserless Intelligence Contract/Core, model/tool policy and context aggregation. |
| Recommendations / planning assistance | 9 | 6 | 6 | EVOLVE under Intelligence | Ranking and explanations belong to Intelligence; accepted actions cross Domain Commands and never mutate foreign DB truth directly. |
| Luvia conversational assistant | 9 | 5 | 5 | REBUILD in M16/M17 | Move from chat-shaped feature to context-aware orchestration with visible plans, confirmation, provenance and reversible actions. |
| Experience Core / design semantics | 10 | 4 | 5 | REBUILD in M10.5 | Stream and boundary exist, but shared tokens, component/state semantics and renderer-neutral contracts remain foundational work. |
| App Shell / boot / navigation | 10 | 6 | 4 | REBUILD in M9-M10 | Keep product shell; replace implicit global/DOM orchestration with staged boot, Navigation Contract, module mounting and platform lifecycle. |
| Accessibility / reduced motion / focus | 10 | 6 | 6 | EVOLVE to release gate | Good local patterns exist; establish cross-platform semantics and automated screen-level gates in Experience Core. |
| Social Experience Graph / collaboration | 9 | 5 | 5 | EVOLVE; core candidate | Dedicated stream exists; promote to explicit Core only after graph, visibility, relationship and collaboration truth are measured. |
| Legacy Paris route and compatibility paths | 4 | 3 | 2 | REPLACE after parity proof | Valuable historical evidence but architectural debt; retire only after usage, data, URL and visual parity gates in M14. |
| Diagnostics / readiness / release provenance | 8 | 9 | 8 | KEEP + EVOLVE | Strong engineering differentiator; add machine-readable architecture health, contract versions and native adapter conformance. |
| Travel Wallet / documents / confirmations | 9 | 1 | 4 | ADD | Create secure, offline-capable document and entitlement lifecycle; do not bury it in generic Booking UI. |
| Budget / shared expenses | 8 | 1 | 3 | ADD later | Candidate Finance Core only when monetary truth, currencies, participants, settlements and audit rules are defined. |
| Universal cross-domain search | 9 | 2 | 6 | ADD | Build a read-only projection/index with owner links; search infrastructure must not become a second Domain database. |
| Checklists / shared travel tasks | 8 | 2 | 5 | ADD | Start as Trip-owned commands and projections; split only if task workflows gain independent ownership/lifecycle. |
| Weather, disruption and live travel signals | 8 | 2 | 6 | ADD via provider adapters | Intelligence contextualizes signals; source facts remain external projections and user actions cross owner commands. |

## Priority product evolution

### P0 — next architecture/product blocks

1. **M8.5 Intelligence Isolation & Unification:** one browserless `intelligence.v1` surface, context aggregator, model/tool registry, policy/output validation, Intelligence Memory and recommendation boundaries.
2. **M9 App Shell Runtime & Navigation:** staged boot, Navigation Contract, explicit module mounting, deep-link intents and lifecycle-aware shell state.
3. **Notification Intent Center:** visible user-controlled inbox for event-derived intents, permission state, delivery preference and provenance; no automatic event-to-notification shortcut.
4. **Identity Signal Review:** allow users to inspect, accept, reject or forget observed Intelligence signals before they become explicit Identity preferences.

### P1 — marked product upgrades

1. **Journey Graph:** a daily itinerary plus lived-trip narrative that composes Trip, Places, Booking, Media and event projections without copying their truth.
2. **Offline Command Center:** per-owner queue health, conflicts, retry and last-sync state with truthful Web/native capability labels.
3. **Shared Trip Roles:** owner, co-planner, contributor and viewer capabilities with explicit command authorization and audit events.
4. **Travel Wallet:** confirmations, tickets, documents, expiry/offline state, sensitive-field protection and provider provenance.
5. **Itinerary Conflict Resolver:** explain time, distance, booking and opening-hour conflicts; apply only confirmed Domain Commands.
6. **Universal Search:** people, trips, places, bookings, media and memories through sanitized projections.
7. **Accessibility baseline:** keyboard/focus, screen-reader semantics, dynamic type, contrast, reduced motion and native-equivalent patterns as release gates.

### P2 — differentiation after structural isolation

- native capture with background transfer and offline-first media review;
- Live Activities/widgets and APNs/FCM delivery through NotificationPort implementations;
- privacy-preserving on-device context and Intelligence where suitable;
- collaborative memory stories, export and print-ready trip books;
- multilingual trip briefings and traveler-aware translation;
- disruption assistance, weather context and proactive replanning with confirmation;
- optional device-health/steps context behind explicit permission and purpose limitation.

## Current separations and future logical Core decisions

### Already physically or contractually separated

- **Trip Core:** canonical Trip truth, active Trip and Trip Context;
- **Places Core:** Place truth, lifecycle, saved/search/discovery primitives;
- **Media Core:** media truth, asset delivery, Realtime and upload command state;
- **Identity Core:** global viewer identity and explicit preference truth;
- **Booking Core:** booking/provider/message/mutation truth;
- **Events Core foundation:** versioned envelope semantics, no business truth;
- **Platform Runtime + Ports:** device/runtime capabilities, registries and Web adapters, no Domain truth;
- **Experience Core foundation:** design/interaction semantics, no Domain truth;
- **Intelligence Core foundation:** reserved owner for reasoning and Intelligence-specific state; physical unification remains M8.5;
- **Consumer and Control Center:** contract-based Experience composition, no Domain truth;
- **Social Experience Graph stream:** dedicated ownership stream, explicit Core decision still pending;
- **Journey/Timeline:** explicitly reserved cross-domain aggregator, not silently classified as Trip or Places.

### Strong Core candidates requiring a measured ownership audit

1. **Journey Core:** strong candidate for itinerary/narrative projection truth, temporal composition and day-state—only after its write model and source-of-truth policy are explicit.
2. **Social/Collaboration Core:** strong candidate when graph, visibility, invitations, roles and relationship truth are demonstrably cohesive and independent.
3. **Memory Core:** candidate if curated stories, albums, cards and narrative state become durable truth distinct from Media assets and Intelligence ranking.
4. **Travel Wallet Core:** candidate when documents, entitlements, sensitive metadata, expiry and offline access form an independent lifecycle.
5. **Finance Core:** candidate only with real budgets, expenses, settlements, currencies and audit semantics.
6. **Messaging Core:** candidate only if traveler-to-traveler/general communication expands beyond Booking-provider conversations.

### Keep as infrastructure or existing-owner subdomains for now

- Notification delivery remains **Platform**, while durable notification intents may become a focused product projection—not a business-truth Core by default.
- Search/indexing remains a **read projection/infrastructure service**, never a second Domain truth.
- Offline queue/sync, permissions, storage, deep links, navigation and device access remain **Platform Ports/infrastructure**.
- Recommendations, ranking, planning and tool orchestration remain **Intelligence**, not separate Cores.
- Category modules remain **Places + Experience** until a category proves an independent lifecycle.
- Checklists stay **Trip-owned** initially; routing/mobility stays **Places/Journey/Intelligence-composed** until independent truth is measured.

The anti-fragmentation rule is binding: create a Core only for cohesive durable truth, commands, invariants and an independently testable lifecycle. A large folder, screen, provider or technical mechanism is not sufficient.
