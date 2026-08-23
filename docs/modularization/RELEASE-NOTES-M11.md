# M11 Premium Today and Attention Composition

## Release identity

- App / Core: `13.82.42 / 4.82.42`
- Runtime commit: `e1e642409b65576f92f9f2521d43d1766754ec92`
- Starting documentation marker / rollback: `5067332492fca8a7df79bb6584c891c973550180`
- Owner stream: `feature/consumer-experience`

## Delivered

- Browserless `consumer.today-composition.v1` with deterministic greeting, travel phase, trip-day, attention priority, safe navigation, connectivity and immutable provenance.
- Consumer Web adapter over read-only Trip, Travel Identity, Attention, Experience and Network projections; no private Store, DB/RPC/Supabase or foreign-domain command path.
- Visible premium Today hero with active-trip identity, travel phase, connectivity, action hierarchy and attention state.
- Existing Luvia AI Command Surface reused through the canonical Overlay Host; no second assistant stack and no autonomous mutation authority.
- Existing Dashboard Widget Registry preserved.
- Journey/Timeline remains a separately owned cross-domain aggregator behind the explicit `reserved-read-only` marker.
- Responsive and accessible Experience-v1 adoption with 48 px measured primary actions, focus-visible behavior and reduced-motion support.

## Architecture and native readiness

- Consumer owns view-model composition and presentation only.
- Trip, Booking, Places, Media and Identity truth ownership is unchanged.
- Intelligence reads approved projections and produces explanations/proposals; it owns no foreign truth and executes no foreign command in M11.
- Platform browser/device behavior remains behind established ports and adapters.
- The composition core contains no browser globals, storage, navigation globals, Supabase or private domain stores.
- Timeline/Journey was not absorbed into Consumer, Trip, Places or Intelligence.

## Measured gates

- Focused M11 guard: **PASS**.
- Controlled Safe Regression: **68/68 PASS** on Feature, Integration and Main.
- NFR-0: **3/3 PASS**.
- Cross-Core DB guardrail: static **316**; mapped debt **26/26**; unmapped object debt **39/39**; dynamic **27/27**; no growth.
- Integration Preview: **10/10 exact changed runtime assets**, **5/5 privacy**, authenticated desktop/mobile/AI/navigation/Journey acceptance and **25/25 F5** at **3.980-8.077 seconds** (average **4.401 seconds**).
- Production version `57d3bb86-0d50-457f-b405-edf8c0b01c60` at **100%**: version URL and `myluvia.app` each **10/10 exact Git blobs** and **5/5 privacy**.
- Production authenticated final series: **25/25 F5**, **3.629-4.163 seconds**, average **3.853 seconds**; App/Core, Paris Trip, Today, Attention and Journey boundary present on every sample.
- Production AI open, textarea focus, Escape dismissal/focus restoration, safe Plan navigation and 390 x 844 layout without horizontal overflow: **PASS**.

The canonical static proof compares HTTP payloads to Git object IDs. A first comparison against a Windows-extracted archive was rejected because extraction added CRLF to the working copy; the deployed HTTP bytes match the canonical Git blobs exactly.

An earlier high-frequency Production stress series reached **6/8** inside a 10-second locator window, and a diagnostic sample settled correctly at **14.727 seconds**. That evidence remains rejected. After cooldown and one uncounted **3.856-second** warm-up, an independent paced 25-sample series supplied the accepted final gate. No failed observation was rewritten as PASS.

## Infrastructure

- Database/schema/RPC/RLS/bucket migration: none.
- Edge Function change: none.
- Secret/provider change: none.
- Manual Cloudflare configuration: none.
- Manual Cloudflare upload/deploy: none. Cloudflare reports the active version source as `Unknown`; chronology is recorded without asserting unproven deployment causation.

## Rollback

Code-only rollback to `5067332492fca8a7df79bb6584c891c973550180`. No persisted-data or infrastructure compensation is required.

M11 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**.
