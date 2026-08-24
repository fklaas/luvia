# M12 Journey Core, Day Graph and Day Composer

## Release identity

- App / Core: `13.82.43 / 4.82.43`
- Runtime commit: `32ecd52aa79af007d54a3fb675e2feccdf86df5a`
- Starting marker / code rollback: `06b6c069471cd0c744390553c3dbecbf9b7b0c0b`
- Owner stream: `feature/platform-core`
- Public contract: `journey.v1`

## Delivered

- Physical browserless Journey Domain/Contract Core with deterministic immutable Day Graph composition.
- Cross-source ordering, grouping, conflict/temporal-integrity policy and explicit source-owner provenance.
- Public `LuviaJourneyContractV1` with separate `reads` and `commands` over one compatibility provider.
- Active runtime consumers migrated off private `LuviaTimelineCore` access.
- Legacy Timeline runtime explicitly classified as `journey-web-compatibility-adapter`, not Places truth and not a second Journey truth.
- Visible premium Day Composer on Today with trip days, free-space states, owner provenance, conflict diagnostics, AI proposals and owner-routed action descriptors.
- Overlay Host day sheet with focus/Escape semantics, responsive 390 x 844 behavior, 48 px controls, reduced-motion support and no horizontal overflow.

## Ownership and native readiness

- Journey owns only derived Day Graph/order/conflict/provenance policy.
- Trip, Places, Booking, Media, Identity, Social and Intelligence remain the sole owners of their records and commands.
- Consumer and Experience own presentation only; Intelligence may propose but does not autonomously mutate Journey or foreign truth.
- The physical core contains no DOM, browser storage, navigation, navigator/geolocation, Supabase or persistence dependency.
- Current Web DB/realtime behavior stays behind the compatibility adapter pending a later persistence-boundary migration.
- The NFR-0 debt baseline remains historical and unchanged.

## Measured gates

- Focused M12 guard and browserless Journey tests: **PASS**.
- Controlled Safe Regression: **69/69 PASS** on Platform, Integration and Main.
- NFR-0: **3/3 PASS**.
- Cross-Core DB guardrail: static **316**; mapped **30/30**, consisting of historical baseline **26** plus four exact approved Journey owner-reclassification entries; unmapped **39/39**; dynamic **27/27**.
- Local data-free browser fixture: desktop and 390 x 844, no horizontal overflow, all eight measured mobile actions 48 px, conflict overlay and inferred explicit-end duration: **PASS**, console **0/0**.
- Integration Preview: **32/32 exact changed runtime Git blobs**, **5/5 private-path SPA fallback**, authenticated App/Core, active Paris Trip, Journey composition, provenance and conflict dialog: **PASS**.
- Integration authenticated F5: **25/25**, **3.275–4.215 seconds**, average **3.717 seconds**, console **0/0**.
- Production version/deployment `2e1019c3-80a4-4304-981a-8044c5122e2e` / `d5bdf394-bad6-4c3b-a22f-a02da2eb956e`: **100%**.
- Production version URL and `myluvia.app`: each **32/32 exact Git blobs** and **5/5 private-path SPA fallback**.
- Production authenticated App/Core, Paris Trip, Day Composer, owner provenance and conflict dialog: **PASS**.
- Production authenticated F5: **25/25**, **2.999–5.152 seconds**, average **3.342 seconds**, console **0/0**.

Two preliminary Integration probes were rejected: one incorrectly expected modular contracts to be browser globals; the next sampled before authenticated hydration. Read-only diagnosis established the correct stable UI boundary, and a new independent 25-sample series supplied the accepted gate. No failed observation was rewritten as PASS.

## Infrastructure

- Database/schema/RPC/RLS/bucket migration: none.
- Supabase Edge Function change: none.
- Secret/provider change: none.
- Manual Cloudflare configuration: none.
- Manual Cloudflare upload/deploy: none.

Cloudflare reports the automatically observed active version source as `Unknown`. The release records chronology, 100% traffic, exact Git-byte equality and authenticated behavior without inventing deployment causation.

## Rollback

Code-only rollback to `06b6c069471cd0c744390553c3dbecbf9b7b0c0b`. No persisted-data or infrastructure compensation is required.

M12 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**.
