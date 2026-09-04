# PCR — P09 Timeline owner capabilities and truthful first paint

Date: 2026-09-04
Status: bounded Integration acceptance complete

## Problem

The Timeline combines planned Places, bookings, confirmed visits and memories in one chronological view. Until this slice, the consumer did not explain which area owns each entry and could expose generic edit or delete controls for records that Journey must not mutate. During an authenticated reload, the view could also briefly describe an Owner day as empty before all Timeline sources had finished loading.

## Owner and boundaries

- Journey owns the chronological projection, loading readiness, capability descriptions and the safe routing decision for each entry.
- Places owns planned Place links and confirmed visit records.
- Booking owns reservations, provider conditions, booking time changes and cancellation.
- Media owns photos and memories.
- The consumer renders only actions that the owning contract has admitted. It does not convert an unavailable owner command into a local Timeline mutation.

## Product behavior

Every Timeline entry receives an explicit capability matrix. An ordinary planned Place remains directly editable, connectable, removable and recoverable through the accepted Places owner path. A booked Place points to Booking management and protects its time, group order and removal. A confirmed visit points to its Places visit history. A photo memory points to the Memory/Media area. The card shows the responsible owner and why an action is available, delegated or protected.

While initial Owner reads are unresolved, the Timeline shows a truthful loading surface instead of `0 Momente`, `Offen` or an empty-day invitation. If an already rendered day refreshes, the current entries stay visible with a subtle refresh status. A switch to another trip clears the previous trip entries immediately, so they cannot flash under the new trip identity.

## Contract impact

`journey.v1` receives the additive read `entryCapabilities`. The public projection receives the additive immutable `readiness` object with `hydrated`, `loading`, `lastError` and `lastUpdatedAt`. The major contract version stays unchanged.

The capability read describes admitted routes; it does not create new Booking, Visit or Media mutations. Positive delegated owner actions remain separate acceptance work.

## Database, Functions and secrets

No migration, table, RLS, Edge Function, provider, secret or authorization change. This is an App/Core projection and consumer change.

## Safety and concurrency

- Booked records never expose Timeline deletion or connected group reordering.
- Confirmed visits and memories never expose local time editing or deletion.
- Planned Place edits continue to use the existing revision, conflict, active-trip and recovery guards.
- Hydration starts the Place-data, schedule, event, visit, trip-place and member reads together.
- A changed trip identity clears stale projected entries before the new Owner reads resolve.
- A refresh of the same trip retains the last accepted entries until replacement data arrives.

## Test and acceptance plan

1. Behavioral VM test against the real Timeline core: switch trips, hold the Place-data promise, verify the previous entries are gone, all five Supabase reads have started in parallel and `hydrate-start` reaches consumers.
2. Visible headed mobile Edge test at 477×900: verify the truthful loading surface, publish one planned Place, one booked Place, one confirmed visit and one memory, then verify the owner labels and available/delegated/protected controls.
3. Existing Journey schedule, removal, connected reorder, Human↔AI registry, failure-matrix, visual-inventory and release gates.
4. Controlled Safe Regression with the new test in the evergreen allowlist.
5. Authenticated stable Integration reload: the real Owner day must never be described as empty while loading, and the accepted planned Places must return without stale cross-trip content.

## Rollout and rollback

Published on stable Integration as App `13.82.168.51`, Core `4.82.173`, Worker `71ad570f-e4a3-42ed-b13f-0f504bfea4e5`, immutable runtime source `8ed41a3e250a82fe6bb9c9a0d37fe399f797712b` and archive SHA-256 `FF650D1A9BFED36E0855D2FCDC7AE99F78A6638F21B308D1B43E12B20A65B9EE`. Main/Production, database, Functions and secrets remained unchanged. Exact code rollback is App `13.82.168.48`, Core `4.82.170`, Worker `42df591a-d2d2-4075-b315-003f1499431c`, source `7eacedc32e997de27d781adbf51d14bb55486907`.

## Acceptance evidence

- Safe Regression: `217/217` PASS.
- Public stable Integration bytes: `30/30` match the immutable `.49` archive.
- Visible headed Edge test at 477×900: truthful loading state plus planned Place, Booking, confirmed Visit and Memory capability cases; no browser errors.
- Authenticated stable Integration reload on `Ostseeurlaub`: two real entries returned at Grande Beach Café 15:00 and Restaurant Brechtmann 20:00, both showed `Plan direkt bearbeitbar`, and the completed page did not contain `0 Momente`.
- The live reload proves the final stable owner projection. The transient loading surface itself is visibly covered by the headed mobile test because the public navigation completed before an intermediate frame could be captured.
