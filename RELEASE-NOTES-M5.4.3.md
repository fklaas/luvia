# Luvia Release Notes — M5.4.3

## Active TripStore Consumer Isolation

M5.4.3 removes the remaining active direct private TripStore access from the four identified non-owner/runtime consumer surfaces while preserving TripStore as the sole Trip Truth owner.

### Runtime

- Runtime Commit: `cf4a6b32c0ef11f4ac798766a38996bd4973e5b3`
- Parent: `e62a7e99973306f787c9320b796935ce5a1bd9bf`
- App/Core: 13.82.12 / 4.82.12
- Version bump: none

### Architecture changes

- `core/trips/join-flow.js`: private `LuviaTripStore` 2 -> 0.
- `core/trips/trip-creator.js`: private `LuviaTripStore` 1 -> 0.
- `core/trips/trip-experience.js`: private `LuviaTripStore` 2 -> 0.
- `core/places/timeline-core.js`: private `LuviaTripStore` 1 -> 0.
- `core/platform/trip-contract-adapter.js`: added narrow owner-side `commitTripSnapshot` command.
- Join Flow now uses public Trip runtime and active-trip command boundaries.
- Trip Creator commits through the public owner command boundary.
- Trip Experience reads through public Trip reads and commits through the owner command.
- Timeline keeps Active Trip Context and removes the private Store fallback.
- NFR Browser Global Guardrail remained PASS without baseline widening.

### Validation

- Focused M5.4.3: PASS.
- M5.4.1 retention: PASS.
- M5.4.2 retention: PASS.
- NFR Browser Global Guardrail: PASS.
- Safe Regression: 37/37 PASS.

### Integration Preview

- GitHub / Cloudflare Check ID: `96763554901`.
- Build ID: `0d8bd601-e9d4-42d3-9c06-96a4dcc7eadd`.
- Version ID: `93b4036e-758e-43e2-b0b6-c347f213ad45`.
- Byte provenance: PASS.
- Static architecture: PASS.
- Static privacy: PASS.
- Authenticated Integration F5: PASS.

### Production

- GitHub / Cloudflare Check ID: `96765990927`.
- Build ID: `6eada0a8-055c-451a-aabb-5bb0fbbf9cfd`.
- Version ID: `5266a105-79c1-48a8-919d-2f75bc17bc71`.
- Byte provenance: PASS.
- Static architecture: PASS.
- Static privacy: PASS.
- Authenticated Production F5: PASS.
- Active Trip after F5: `Paris Hochzeitstag` / `Paris`.
- Session/Login, Trip Edit UI, Timeline and Booking Center: PASS.

### Retained / intentionally deferred

- `luvia-trip-context.js` remains an explicit Web compatibility binding.
- Compatibility `window.LuviaTripStore` remains available on Web.
- Geolocation user-gesture browser warning remains retained and is not classified as an M5.4.3 regression.
- Real Trip creation and real Join mutations were intentionally not executed during acceptance.

### Infrastructure

- DB migration: none.
- Edge Function change: none.
- Secret change: none.
- Manual Cloudflare change: none.

M5.4.3 is ready for closeout. M5.4 and M5 remain IN PROGRESS.
