# Trip map experiences and complete filter-control audit — 2026-09-04

Runtime source: 29bc27a96515385a3c0bbb61a7b3b7134a57252e, App 13.82.168.35, Core 4.82.168.
Integration Worker: 97236e26-56ef-4f3b-8303-98521d85bbea. Gateway v151 ACTIVE (backend source 2b5a3009).
Baseline: ceae8799f0c9da668fec523a483f4915fc98472d. Main remains c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba.

## Delivered behavior

- Places and Stays mount the same five experience controls through the shared spatial consumer.
- **Von hier aus:** compare the selected place/stay using actual walking routes to up to four explicit targets; planned Timeline stops take priority. A retained cohort makes subsequent origin comparisons meaningful. Same-name venues within 100 m are deduplicated across providers in these suggestions.
- **Für uns:** reuse existing deterministic traveler assessment and canonical profile match. Every covered traveler must meet the evidence threshold; missing members and facts prevent a blanket group recommendation. Explicit negative dietary evidence survives normalization. Unknown access requirements remain disclosed.
- **90 Minuten:** select a real trip day/start time and 30/45/60-minute visit. The next Timeline event caps the window at at most 90 minutes. Outbound route, visit, route to the next event (or back to origin), and ten minutes' buffer must fit. Existing visits are excluded. Unresolved events/locations fail honestly. Planning uses the existing domain sheet, never a parallel Timeline store.
- **Tag erleben:** select any real trip date, see its actual entries, step through their markers and request verified walking routes. Legacy memories outside the trip do not become extra travel days.
- **Plan B:** request different, calmer or indoor-category ideas for a selected trip day. This is a user-selected scenario, not a weather forecast or automatic booking replacement.
- Map presentation: gentle 35-degree default pitch, persistent 2D/3D switch, lighter building extrusion, destination return, larger map controls and source-backed route overlays. The final narrow-grid correction constrains the new host so the map is not widened by tab min-content size.

## Filters and provider cost

All 19 cuisine controls and the complete 76-case category/subtype matrix were checked. Selected type unions reach the provider before result pagination; explicit cuisine evidence from tagged cafés and takeaways is included. Existing strict restaurant filtering is preserved. Viewport queries now forward accessibility and reservation requirements. Raw diet negatives override generic positives; raw fine-dining, trailhead and concert evidence is retained.

A scoped catering cohort (up to 500 rows) supplements exact cuisine queries and is shared across cuisine choices. Instance caches and request coalescing are bounded. Exact cuisine requests remain necessary beyond that cohort; this is not a promise of zero provider requests. Walking routes use the configured Geoapify path with client/server coalescing and 30-minute caches. No new paid plan or provider account was created.

## Measured verification

- Final safe regression: **209/209 PASS**, `regression35-release.log`.
- All 19 cuisine mappings, all 76 category/subtype cases, fact filters, combinations, resets and viewport forwarding covered by regression.
- Real Geoapify audit: **62 distinct category/cuisine queries, 63 requests, zero API errors**. This checks API compatibility and sample coverage, not the existence of every cuisine in every radius. `live-filter-audit32.json`.
- Visible browser: all 19 cuisine buttons were operated and reached settled results (`browser-cuisine-proof33.json`). Some late empty-result checks were repeated after shell/dialog interruptions and a retained multi-selection; the separate isolated provider audit and filter matrix are the individual-control evidence. No claim that every UI batch was uninterrupted.
- Visible positive local examples: Italian (Trattoria Martinello, Salentino, Capolino), German (Pfannkuchenhaus, Diercksen), Greek (Mykonos, Taverna Rhodos, the greek), Asian (Ostsee-Oase), Turkish (Döndü's).
- Chinese at the saved 3 km destination scope: honest empty state. Explicit 5 km expansion: **Hay-Cheng**, with the scope labeled as including surrounding areas. It is in Timmendorfer Strand, not evidence of a Chinese restaurant within Scharbeutz municipality. `chinese-5km-visible.png`.
- Stays uses Scharbeutz and the same five controls; 49 verified-coordinate accommodations were visible. From Gästehaus Nina 2, final suggestion logic shows four distinct targets: Grande Beach Café (11 minutes), Brechtmann (75), Strand Creperie (11), Essbar (7). `stays-base-routes.png`.
- Timeline example, 12 June 2027, 14:00 before a 15:00 Grande Beach Café event: **60 minutes available**. Three tested options including Strand Creperie fit using 11 + 30 + 4 + 10 = 55 minutes. The already planned café was not proposed again.
- All eight trip dates 12–19 June 2027 selectable; actual first-day entries shown at 15:00 and 20:00. Their verified walking leg was 82 minutes. Last day can correctly be empty.
- Plan B / Mehr Ruhe returned Augustuspark, Kurpark Scharbeutz, Lionspark and Scharbeutzer Strand among its candidates.
- 2D/3D controls visibly toggle both directions. Final live .35 at 390 px: map right edge 379.6 px, experience panel right edge 380.4 px, all five tabs 46 px high; no temporary test stylesheet remains. Mobile screenshot: `trip-map-mobile35.png`. The emulated viewport was reset afterward.
- Public bytes: **17/17 SHA-256 matches** to immutable `release35-clean`; `public-byte-proof35.json`. Browser reports 13.82.168.35.

Artifacts are in `C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/`.

## Practical limits and unchanged guarantees

Provider facts remain incomplete: cuisine labels, price, ratings, opening-now status, access and real venue photos are not universally available. Unknown evidence is not converted into a positive match or a fictional venue image. An empty filter means no confirmed result in the displayed search scope, never proof of nonexistence. This release repairs the filter paths, not worldwide source completeness.

Walking-route ideas require verified routing data and known endpoint coordinates. When the trip supplies no timezone, the device timezone is explicitly stated. Indoor-category ideas do not establish real-time opening or weather suitability. Origin comparisons describe only the listed target cohort, not an invented comprehensive neighborhood score.

No user Timeline entries, bookings, database schema, secrets or billing were changed during browser acceptance. Existing untracked workspace artifacts were preserved. Main/production was not deployed. Rollback is the prior Integration runtime plus gateway v150 if the additive backend path also requires rollback; no data migration is involved.
