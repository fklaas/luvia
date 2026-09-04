# Mobile map startup and trip theme: measured Integration acceptance

Date: 2026-09-04. App 13.82.168.36; Core 4.82.168.

## Release evidence

- Immutable runtime source: `314e149e726015c1fae7ed7eb38f350702d833ca`.
- Integration Worker: `f29f3790-790b-4453-bd89-c3a67e920ac4`.
- Gateway v151 unchanged. No Main or production deployment.
- Safe regression: 209/209 PASS, zero failures (`outputs/regression36-accepted.log`).
- Public SHA-256 verification: 18/18 files match immutable source (`outputs/public-byte-proof36.json`).
- Local evidence directory: `C:/Users/fabia/Documents/ChatGPT/Luvia/outputs`.

## Changes verified

PWA cleanup expected a different cache suffix from the active service worker. Both now use the same versioned local-recovery identity. Cache warming excludes redundant bundled source modules and unrelated marketing media and reuses cached entries. Required runtime resources begin downloading in parallel while execution order remains controlled.

Places and Stays share a scope-validated Geoapify destination projection cache. Results younger than five minutes can satisfy the initial destination load; older saved projections may display during background refresh, with a maximum accepted age of 24 hours. Changed destination coordinates, unrelated surface/category data and expired projections are rejected. Filtered or viewport-specific results cannot overwrite the broad destination projection. Passung is recalculated from current preferences. Concurrent identical discovery calls share their pending request.

Pins can be created before tile readiness. Pending discovery is distinguished from an empty completed result and from tile delay. Same-trip resume keeps the existing map where possible. Actual provider errors remain visible.

All five shared experience controls and primary actions use the active trip accent. Panels and inner cards use subtle trip-color gradients, borders and shadows. Observed trip accent #b96f8f equals the active button computed color rgb(185, 111, 143).

## Visible browser observations

- Places after upgrade: 50 pins and ready map.
- Stays: 49 coordinate-backed pins around Scharbeutz, with the preview inside the map.
- Warm Stays reload: pins first observed at 1391 ms after navigation; ready map first observed at 1761 ms. The map style request started at 1286 ms and took 7 ms on this warmed browser.
- First-upgrade resource observation: map style started at 2196 ms versus 5777 ms in the earlier .35 observation. These are individual browser observations, not a controlled device benchmark or a universal speed guarantee.
- At a 390-pixel viewport, the map right edge was 379.6 px and panel right edge 380.4 px. The visible day experience used the trip accent and tinted panel, and listed the selected travel day and actual Timeline stops.
- Screenshot: `outputs/map-mobile36.png`. Temporary viewport override reset after testing. The test tab remains available for inspection.

## Limits and follow-up

Tests ran in the visible desktop browser, including a responsive 390-pixel view. No physical phone, installed native binary or throttled mobile network was tested. No promise of instant pins on a never-visited destination or unavailable provider connection.

Fresh saved results suppress the initial provider search, not every subsequent request. Profile hydration/preference events may still trigger a silent background discovery; this was observed after the fast warm paint. Tile/resource lookups also remain. The independent loading paths prevent these from becoming a premature empty-results claim.

No new provider account, payment plan or backend secret was activated. The distributed, persistent, atomic free-budget router is specified in the onboarding document and remains an implementation step before automatic activation of additional providers. This release implements local reuse and concurrent request coalescing, not that entire router.

Full provider-by-provider instructions and the exact planned secret names are in [the onboarding guide](PROVIDER-ONBOARDING-AND-FREE-BUDGETS-20260904.md).
