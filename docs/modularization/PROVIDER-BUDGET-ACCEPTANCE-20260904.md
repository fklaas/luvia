# Provider budgets and routing — 13.82.168.37

Baseline: 523dff103b4eb4ac30c3a28f7d6c5b636ed9ac37 (Integration .36).
Core remains 4.82.168. Main is outside this release.

## Implemented behavior

Places and Stays share automatic discovery, scoped category/cuisine normalization, provider-prefixed details and route selection. Search tries Geoapify first, then TomTom and eligible HERE when the previous source has no eligible result or fails. It stops on a useful result; it does not fan out every map movement to every provider. Rectangular results are clipped after retrieval. A nonempty response is not a promise of exhaustive area coverage.

Walking/cycling use openrouteservice, then TomTom, Geoapify and eligible HERE. The shared "Von hier aus", time-window and day experiences expose walking/cycling selection through places.v1. Driving is supported in the route contract/backend, not exposed in this picker. No transit, live traffic or booking-price promise. Returned paths must have finite coordinates, distance and duration. Concurrent identical requests are coalesced within an instance; route cache is 30 minutes. Reference taxonomies are shipped with the adapter rather than fetched for each cuisine.

All commercial requests pass through service-role atomic database reservations. Search/details and route operations use the appropriate account bucket. Daily/monthly/minute windows are checked before any increment; denied reservations make no outbound API call. HTTP failures consume the reserved allowance conservatively. 401/403, 429 and temporary transport/server failures have bounded cooldowns. Authenticated `providers.status` exposes policy and local counters, never keys; `providers.catalog` exposes reference category IDs. Tables and mutation RPCs are inaccessible to anonymous/authenticated clients.

| Provider / bucket | Local daily ceiling | Local monthly ceiling | Per minute | Activation |
| --- | ---: | ---: | ---: | --- |
| Geoapify shared credits | 2,200 | — | 60 | Active |
| TomTom Search v2 / details | 150 | 1,500 | 25 | Active |
| TomTom routing | 1,000 | 12,000 | 25 | Active |
| HeiGIT openrouteservice | 1,200 | — | 20 | Active |
| HERE search / routing | 0 | 0 | 10, inactive | Disabled: account verification and allowance unconfirmed |
| Google / Foursquare | 0 | 0 | 10, inactive | Disabled pending product/credit/entitlement confirmation |

These are conservative Luvia limits, not readings from provider billing systems. Shared keys used outside Luvia still require reconciliation. UTC windows are configured. Geoapify reserves ceil(limit/20) search credits, 5 for details and 2 for routing. The deployed TomTom adapter uses Search v2 (public free allowance 2,500/month), not Orbis Discover (a different product/allowance). Routing public allowance is 20,000/month. HeiGIT Standard was visibly confirmed as 0 EUR, Directions 2,000/day and 40/minute. No paid plan was activated.

## Cuisine and media evidence

All 19 kitchen controls have native category normalization and live TomTom requests around Scharbeutz, radius 5 km. Bounded pages are not complete inventories. Examples: Italian 10, German 20 (page cap), Greek 7, Mediterranean 1, Indian 1, Chinese 1 (Hay-Cheng), Japanese 1, Vietnamese 1, Asian 5. Zero results in a source mean no verified match returned in this scope, not that a cuisine does not exist. The final audit found and fixed TomTom's missing vegan taxonomy falling back to a broad restaurant search. Unsupported cuisine mappings return no unverified results; no API cost is incurred for this unsupported mapping. Selected cuisine evidence also filters unrelated provider rows. A business name cannot establish vegan or vegetarian suitability.

Photo enrichment uses an exact linked Wikidata P18 / Commons file and requires image URL, attribution and license. No stock picture, nearby business or same-name venue is substituted. An unlinked place causes no speculative image-name search. TomTom/HERE search keys are not a general free photo library. Full photo coverage remains unresolved and needs suitable licensed venue/tourism sources. HERE query shaping is fixture-tested; HERE credentials are not live-verified while policy is disabled.

## Verification

- Safe regression: final release rerun 210/210 PASS, including the final taxonomy guard (`regression37-release.log`).
- Deno check of the complete gateway entry point: PASS.
- Provider tests: denied allowance, 429 cooldown, two concurrent identical bike calls using one provider request, warm cache, all 19 native cuisine mappings, unsupported vegan handling, HERE browse/foodTypes request, unrelated result rejection, exact linked media/license and no speculative lookup: PASS.
- Database acceptance in BEGIN/ROLLBACK: shared operation pool, denied reservation leaves all windows unchanged, remaining quota, cooldown, disabled policy and role privileges: PASS.
- A separate five-process Supabase CLI concurrency probe timed out while initializing CLI login roles. Temporary policy/usage rows were removed and absence verified. This experiment is not claimed as a passed database concurrency test. Reservation serialization is implemented by PostgreSQL row locks.
- Live TomTom search/category and real walking/cycling geometry: PASS. HeiGIT live mode results, visible consumer acceptance and immutable public asset verification are recorded in the release addendum.

## Deployed release and visible acceptance

Runtime source 978e3d00bef46dee9f84e51c94ee14b5299e7133, archived from Git into `release37-clean`; Worker c8d1d1c2-0849-4de7-800a-15d7782767ab. Gateway v161 ACTIVE from the same source. All 18 public asset hashes match that immutable archive (`public-byte-proof37.json`).

Visible Stays and Places tests used the existing Ostseeurlaub trip and its June 12 Timeline stops, without changing the trip or Timeline. Stays WALK: one verified route, 70 minutes. Stays and Places BICYCLE: one verified route, 21 minutes. Both show openrouteservice/HeiGIT/OSM attribution. The 390x844 responsive view retains the route picker and trip-colored controls; document width is exactly 390, no page overflow. The temporary viewport override was reset. Screenshots: `stays-bicycle37.png`, `stays-walk37.png`, `places-mobile-bicycle37.png`. These are browser tests, not measurements on physical native iOS/Android devices.

Direct HeiGIT probe: 373.3 m / 268.8 s WALK and 368.2 m / 133.3 s BICYCLE, both verified LineStrings. TomTom returned independent walking/cycling geometry. The final vegan retest returns zero places and no provider errors, rather than unverified generic restaurants. `provider-modes37.json`, `provider-cuisine-audit37.json` and `provider-budget37.json` record these results.

The attempted bounded Holstentor discovery did not retrieve the exact landmark, so it did not establish a live image proof. Linked-image enrichment has unit/fixture acceptance, not a new live photograph acceptance. No full image coverage claim is made.

Evidence artifacts are in C:/Users/fabia/Documents/ChatGPT/Luvia/outputs: provider-cuisine-audit37.json, regression37-final.log and subsequent release proof files. No API keys are stored in these artifacts.

## Sources

- [TomTom pricing and separate API products](https://docs.tomtom.com/pricing)
- [TomTom nearby search](https://docs.tomtom.com/search-api/documentation/search-service/nearby-search)
- [HERE food taxonomy](https://docs.here.com/geocoding-and-search/docs/food-types-category-system-full)
- [HERE browse](https://docs.here.com/geocoding-and-search/docs/endpoint-browse-brief)
- [HeiGIT plans](https://account.heigit.org/info/plans)
- [Openrouteservice restrictions](https://openrouteservice.org/restrictions/)

Rollback: return frontend to .36 and redeploy its gateway source, or disable the new provider policies. Keep accounting rows; no destructive migration rollback.
