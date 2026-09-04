# PCR — Trip map experiences and complete filter evidence

User authorization: implement five map experiences, shared Places/Stays visuals and verify every cuisine and filter. Integration only; Main remains unchanged.

Baseline: integration ceae8799f0c9da668fec523a483f4915fc98472d, runtime 13.82.168.31, remote equal, ten existing untracked files preserved.

Ownership: a Consumer composition in app/places reads journey.v1, places.v1 and the existing shared preference consumer. It owns only ephemeral UI state, no trips, bookings, preferences or timeline records. Planning uses the existing Journey suggestion sheet and its owner commands. No database migration or foreign-domain direct access.

Additive Platform change: places.v1 reads.getRoute delegates to the existing routes.compute gateway. Explicit Geoapify walking mode adds bounded, cached GeoJSON routes; existing Google callers retain their behavior. This foundation is independently testable before the consumer/visual increment. No replacement domain core or risky boundary migration.

Gateway Places owns provider normalization and cached cuisine coverage. Country cuisines remain evidence-based, including explicitly tagged cafés/takeaways. Missing facts are unknown; negative dietary evidence must survive. Type OR, cuisine OR, cross-group AND. No inference from business names. Provider errors remain distinct from empty results.

Consumer behavior: all trip dates, timeline-derived free time, explicit group coverage, selected Stay as origin, user-selected alternative scenario, route geometry only from routing provider. Actual venue photos retain source attribution; no fictional venue images. No automatic Timeline replacement. Persist only presentation preference through OfflineCachePort. Respect reduced motion.

Verification: all cuisine/type/fact matrix, route cache/failure validation, timeline overlap and free-window bounds, missing traveler data, lifecycle/trip isolation, runtime and ownership guards, visible authenticated Places/Stays browser checks at desktop/mobile widths. Record actual gaps; do not claim universal provider completeness.
