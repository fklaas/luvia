# Shared Stays / Places acceptance — 2026-09-04

Integration runtime 13.82.168.29, source 11249e1ce40cf69c51473f6d4d4ad2a627218a9a.
Worker 92d3e3b3-3afc-4487-aece-5de4815f6760 deployed at 100%. Gateway v148 unchanged.
Main was not deployed. No provider, secret, database or billing changes.

## Result

The Hotels discovery route mounts LuviaPlacesSpatialExperience with the accommodation
surface. It no longer starts the legacy Hotel discovery or automatic stay-offer search.
The active consumer, initial trip-destination query, preference evaluation, filtering,
viewport cache, map renderer, pins, history and result sheet are shared with Places.
Surface-specific cache keys prevent cross-category result contamination.

The page contains the heading, map and viewed-pin history. The old stay form and extra
result/planning panels are absent. Accommodation types are Hotel, Apartment, Ferienhaus,
Hostel and Camping. Both type-selection entry points share the same state, including reset.

The mobile preview is absolute within its map, not fixed to the browser viewport.
Mobile map height leaves space for the shell navigation. The expanded detail sheet
clamps its final height and bottom offset to the visible viewport after scrolling.

## Measured verification

- Controlled safe regression: 208/208 PASS (`regression-29.log`).
- Public immutable source comparison: 15/15 SHA-256 matches (`public-byte-proof-29.json`).
- Real module-mount VM test: exactly one initial accommodation recommendation, destination
  Scharbeutz coordinates, 3000 m bound, Geoapify fast path; no parallel legacy or price search.
- Executable checks cover lifecycle teardown, cache isolation, both type-selection states,
  reset and expanded-sheet geometry for partially scrolled maps and maps taller than the screen.
- Filter matrix covers 71 category/subtype occurrences, including all five accommodation types.
- Visible in-app browser: Ostseeurlaub remains active after reload; Hotel map shows Scharbeutz.
  Initial cohort 49; Apartment filters immediately to 16 pins. Final .29 shows Apartment active
  and Alle Unterkünfte inactive; reset reverses those states. Filter header is Unterkünfte.
- Named Bayside search returns one hotel at Strandallee 130a, 23683 Scharbeutz. Clicking its pin
  adds exactly that hotel to viewed history. Zoom remains in the shared map path.
- Alle/Passend controls switch their selected state; accommodation details use hotel context
  and display 12.06.2027. The BEACH INN detail retains the apartment classification.
- Switching from Hotels to Places restores food results and the Places heading, without hotel
  markers. The browser reports surface=places/category=food after that navigation.
- Final .29 mobile 390 x 844: map bounds y=217.775..731.775; preview y=649.63..716.83;
  navigation starts y=761. Preview is inside map and above navigation. Mobile close button
  y=66.2..110.2 is visible; clicking it removes the result overlay.
- Final .29 desktop 1280 x 720, scrolled 470.4 px: expanded sheet y=0..610,
  close button y=18.8..66.8. This replaces the reproduced .28 off-screen close button.

Browser automation device emulation was cleared after checks; the visible Hotels tab remains open.
Artifacts are in `C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/places-stays-quality/`.

## Limits

This accepts shared discovery behavior and the reported placement defect; it does not assert
completion of the master roadmap or universal provider data coverage. Real photos, live prices,
ratings and accessibility facts remain subject to the already documented provider limits.
No booking or Timeline mutation was submitted in these browser checks. Network event capture
was unavailable for reliable request counting in the visible browser; the one-request assertion
is from the executable real-mount test, not a fabricated live-network measurement.
