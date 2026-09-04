# Cuisine filters, map interaction and pins — 2026-09-04

Runtime 13.82.168.30, source cf2bb94c. Integration Worker
82409a73-9ec9-4649-a86e-c42da97c14af at 100%; Supabase luvia-gateway v149 ACTIVE
on project yiadkcxgyzdgyadnhyqe. Main was not changed or deployed.

## Confirmed defects and corrections

- The live map engine and canvas computed pointer-events:none. This caused the
  reported free-area drag/zoom failure while pin descendants still accepted input.
  The engine now has its own positioned rule with pointer-events:auto; the loading
  fallback stays noninteractive.
- Italian alone returned 4, German alone 2, Greek alone 3. Italian+German previously
  requested generic catering and returned its first 50 records, losing the exact union.
  Explicit cuisine categories now reach the provider as one OR query before the result
  limit. Dietary alternatives use separate bounded condition branches so selecting
  Vegan alongside Italian does not require every Italian result to be vegan-only.
- Provider cuisine evidence now includes catering.cuisine and cuisine arrays in addition
  to raw OSM cuisine. No kitchen type is inferred from a business name or its country.
- Pin composition now preserves the explicit preferenceDiscoveryMatch verdict used by
  the Passend control, rather than recomputing a different score/coverage-only decision.
- Selected MapLibre anchors have z-index 10, matching peers 7, other peers 6. Lifting
  only the nested button did not lift it over sibling marker anchors.
- Pin body and tip use one continuous silhouette. Matching pins have a subtle Passt
  badge and a 5-second rotating conic spectrum restricted to the entire pin outline.
  All 12 Compass colours are used. Reduced motion disables the rotation.

Provider references: https://apidocs.geoapify.com/docs/places/ (cuisine categories and
multi-category OR query), https://apidocs.geoapify.com/docs/place-details/ (catering.cuisine).

## Verification

- Full safe regression: 208/208 PASS, artifact regression-30.log.
- Enhanced executable filter matrix covers all 18 cuisine choices through generated
  provider parameters, normalization and local matching; 71 total category/subtype
  cases, native cuisine unions, type AND cuisine grouping, mixed dietary alternatives,
  structured cuisine sources and matching-pin verdict consistency.
- Public immutable assets: 16/16 SHA-256 matches, including composition, shared consumer,
  CSS, runtime bundles, loader and version. Artifact public-byte-proof-30.json.
- Final visible browser .30: Italian+German shows exactly six pins: Trattoria Martinello,
  Trattoria del Campo, Pfannkuchenhaus, Diercksen, Capolino, Sorrento.
- Matching badges were present on Diercksen and Sorrento. Clicking Passend retained
  exactly those two markers; Alle restored six. Animation computed lv-pin-spectrum;
  sampled custom angle changed from 29.83 to 195.52 degrees.
- Visible screenshot verified the continuous pin silhouette, top Passt label and
  selected pin in front of nearby peers. Computed anchor stacking 10/7/6 confirmed.
- After switching to Shopping, native mouse drag started on blank water at (1020,480),
  whose hit target was maplibregl-canvas, ending at (910,480). The live viewport request
  moved west/east bounds from 10.723345..10.804369 to 10.730920..10.811944 (HTTP 200).
  Clicking Zoom in produced a narrower rectangle, including a later extent
  10.755634..10.785703 / 54.011152..54.022567 (HTTP 200).
- Last visible check at normal 590x698: runtime .30, engine pointer-events:auto,
  selected Diercksen anchor z-index 10. Test tab handed back to the user.

Artifacts: C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/places-stays-quality/.
No secret values were logged, no provider plan changed, no booking or Timeline mutation.
The corrected consumer and CSS are shared by Places and Hotels. This release does not
claim that every cuisine exists in Scharbeutz or that every business has complete cuisine
metadata; unknown cuisine is not fabricated to create a matching result.
