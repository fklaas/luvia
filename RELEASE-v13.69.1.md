# Luvia v13.69.1 / Core 4.69.1
## Official Website Monetization Profile Normalization Fix

Runtime finding from the v13.69.0 Chez Funda smoke test:
- the route resolver correctly emitted `official_website`;
- the monetization seed used legacy id `official`;
- missing-profile fallback incorrectly snapshotted `partner_required / unknown / contract_defined`.

Fixes:
- canonical `official_website` monetization profile = `unavailable / none / none / manual`;
- keeps `official` only as a non-commercial compatibility alias;
- monetized handoff normalizes `official` -> `official_website`;
- unknown provider IDs/domains now fail closed to `unavailable / none / none / manual`;
- runtime view uses safe non-commercial fallback when no profile exists;
- repairs already captured v13.69.0 `official_website` snapshots;
- commercial signals remain unable to confirm reservations.

No Email Booking V2, reservation mutation, recovery or status-provenance behavior was changed.
