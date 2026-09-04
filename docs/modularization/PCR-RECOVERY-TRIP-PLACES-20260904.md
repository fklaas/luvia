# Recovery of active trip and local Places discovery

Authorized by the user on 2026-09-04. Baseline: integration 1f4115dd,
runtime 13.82.168.20. Implementation branch: codex/recovery-trip-places-20260904.

Problem: selecting Ostseeurlaub then reloading publicly selects Jfjd again.
Places also show wrong categories, distant candidates and inconsistent fit mode.

Owners: Platform owns boot orchestration and release artifacts; Trip retains
active-trip truth; Identity retains profile persistence; Places owns category
validation and discovery; Consumer owns the spatial presentation. This is an
explicit cross-owner recovery slice integrated through Integration.

Contracts remain backward compatible. No new domain store or public major
version. Changes are limited to the proven boot/Places paths, their behavioral
tests and generated runtime. No schema migration or secret rotation is planned.
The existing gateway Function is deployed only if its mapping needs correction.

Validation: reproduce on visible Integration, executable delayed-hydration
regressions, category/locality/fit regressions, controlled Safe Regression and
visible before/after trip reload plus Scharbeutz category switching. Preserve
unknown provider evidence and cost guards. Record measured results separately.

Rollout: coherent source commits, generated versioned runtime, clean Git archive,
Integration only, public byte proof and visible acceptance. Main/Production
promotion is outside this recovery release. Rollback is the captured preceding
Integration Worker version plus the preceding gateway source if changed; never
a destructive reset of the working tree. Existing untracked files are excluded.


## Public acceptance — 2026-09-04

- Runtime source: e910f799 (13.82.168.22 / Core 4.82.168), preceded by
  fe268e85 (Trip hydration) and 88c4aebc (Places/release recovery).
- Integration Worker: bf58124e-df60-4a0f-aa22-bc38f0b26219 at 100%.
- Supabase luvia-gateway: version 144 ACTIVE. Downloaded v143 before deployment;
  comparison confirmed only _shared/places.ts differed from the deployed baseline.
- Controlled Safe Regression: 205/205 PASS on final source.
- Clean archive SHA-256: c9f636457d7769cdfe56b4ca588c41561b3df92ec55bf26ec323b89db7b0ef92.
- Public critical asset verification: 14/14 byte-identical to the clean archive.
- Visible browser: Ostseeurlaub retained on reload; switching to Jfjd and reloading
  retained Jfjd; switching back and reloading retained Ostseeurlaub. Final .22 also
  retained Ostseeurlaub. No storage clear or sign-out was used.
- Scharbeutz initial Food: 50 Geoapify results, 226–2031 m from the destination;
  zero results outside the 3000 m initial scope. Initial request 200 in 1338 ms.
- Activities: 11 local results including Parkgolf, Waldhochseilgarten, Dünengolf.
  Themeparks: Waldhochseilgarten and Ostseetherme. Water: Ostseetherme.
  Wellness: BREEZE SPA, no Augustuspark. Sights: Snykrode/Cap Arcona. Shopping: 42.
- Wellness response 200 in 3914 ms: provider latency remains measurable; no claim
  of instant search or a general performance benchmark is made.
- Empty fit selection remains pressed; readable evidence hint and 0/0 appear;
  All restores the complete candidate cohort. Verified at desktop and 390 px.
- Pin arrow: one observed click advanced 38/50 to 39/50; selected marker and
  Taverna Rhodos preview agreed. Previous malformed counter attribute is fixed.
- Real Zoom-in: zoomend + moveend caused exactly one rectangle search, max 50;
  36 provider rows returned and all 36 fell within requested bounds.
- Browser instrumentation restored; no provider credentials or domain records
  were altered. Normal pin-view history and active-trip preference reflect testing.

Artifacts: C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/recovery-review-2026-09-04/
contains both release archives, v143 Edge backup, controlled test logs and JSON
byte proof. Rollback Worker baseline: d5ffec6d-01b4-4d43-adc9-07b83fcb2e1a.
If needed, restore v143 Edge source from edge-v143-backup with the same function
configuration. Do not roll back Trip data or delete user caches.
