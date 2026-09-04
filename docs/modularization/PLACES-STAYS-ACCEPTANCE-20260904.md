# Places / Stays recovery acceptance — 2026-09-04

Integration runtime 13.82.168.27, source 079d07aa3ca5d807c211d90f6f41a20eb4d4e48d.
Worker 610b6d75-d8df-4017-ae0e-db235c46e08b at 100%; gateway v148 ACTIVE.
Release deployed from a clean Git archive, excluding the ten unrelated local
untracked files. Main / Production was not changed.

## Measured validation

- Final controlled regression: 207/207 PASS.
- Public byte comparison: 15/15 active assets match the immutable archive.
- Executable filter matrix covers 66 category/subtype occurrences, all fact
  predicates, OR within one group, AND across groups, reset, distance references,
  hotel subtype normalization and the actual Places transport payload.
- Negative fixtures: steakhouse + generic vegetarian/vegan flags is not a profile
  match; manual vegetarian filtering excludes it. A cafe/bakery does not become
  a restaurant through generic parent metadata. A theme park is not a nature park.
- Cache tests cover concurrent request coalescing, exact repeat, contained-region
  reuse only with complete coverage, category isolation and capped pages.

Visible browser checks used the real Integration app and the user's existing
Ostseeurlaub / Scharbeutz trip and vegetarian profile. No planning or booking was
submitted. Both open Integration tabs were reloaded to .27; the active trip stayed
Ostseeurlaub. Navigation and opening pins can update the local viewing history.

Observed counts depend on viewport and provider data, and are not coverage claims:

| Check | Observed result |
| --- | --- |
| Food All / profile Fit | .26: 50 / 9; final .27: 50 / 10. Kleines Steakhouse absent from Fit, COAST present |
| Manual vegetarian (.27) | 11; steakhouse absent |
| Vegetarian AND wheelchair entrance (.27) | 8; active count 2, both reset together |
| Food subtype (.27) | Bakery 7, Cafe 12, Restaurant 34; bakery names absent from restaurant subset |
| Shopping (.26) | 42 All, Mode 23, Kaufhaus 1: Kaufhaus Stolz; Center and Markt empty in tested region |
| Accommodation (.26) | 49 All / 27 Fit; Hotel 20, Apartment 16, Ferienhaus 13, Hostel 2, Camping 2 |
| Hotel viewport + filter (.27) | Zoom 49 -> 4; Apartment then yields 1 BEACH INN in that viewport, not the initial 16-apartment destination cohort |
| COAST / BEACH INN detail (.26, shared code retained) | 12.06.2027, one Timeline CTA, exact venue retained, neutral missing-photo state |
| COAST readable details | Dietary options, phone, website and unresolved stroller requirement; no wheelchair/catering tokens in cuisine |

Browser screenshots were displayed through the visible browser tool. Network
payload checks on .26 confirmed userQuery/filter fields and enrichMedia reach the
gateway. Later network event capture was incomplete; no final live claim of zero
provider calls or quantified first-paint latency is made from that capture.

## Explicit remaining limitations

The user-requested universal real-photo coverage is NOT achieved. A real COAST
photo read and a direct Foursquare diagnosis returned no usable image. Foursquare
responded: "Your account has no API credits remaining." Geoapify had no linked
photo for COAST or the tested BEACH INN. Existing keys are configured. No credits
were purchased and automatic payments were not enabled. Budget errors no longer
trigger the three-level field fallback retry.

The rejected generated category atlas has been removed. Only exact-entity media
is accepted (Geoapify image/Commons file reference, or Foursquare exact normalized
name and coordinates within 120 m). Missing images remain explicitly unavailable.
Photo reads occur on detail open; they are not performed for every viewport pin.

Ratings, price levels and open-now are unavailable for the tested Geoapify cohort.
Their controls explain missing facts rather than inventing results. Fine Dining,
hiking and concert-hall subtypes lack a reliable mapping in the current source.
Thus full user acceptance of every advertised filter remains dependent on a
source with these facts. No claim is made that disabling an unsupported filter
completes that product requirement.

Hotel live prices / availability still depend on Booking provider activation;
the UI reports Duffel Stays approval pending. They were not purchased or booked.
No universal instantaneous pin-loading or complete regional coverage is claimed.
The next product work should prioritize real-media/source coverage, regional
shared caching, overlapping-pin clustering and a common Places/Stays acceptance
matrix. The German label Unterkünfte is proposed, not yet renamed globally.

## Artifacts

Local audit directory:
`C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/places-stays-quality/`

Final logs: `regression-27-final.log`, `public-byte-proof-27.json`,
`release-27.zip` and extracted `release-27/`.

Rollback baseline: Worker bf58124e-df60-4a0f-aa22-bc38f0b26219 (.22), gateway source
v144 backup in the audit directory. The .23–.26 candidates were superseded during
the same recovery and are not the recommended rollback target.
