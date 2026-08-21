# PCR – M5.4.1 Active Foreign Trip Truth Isolation / Destination Service

## Decision

M5.4.1 is accepted as **COMPLETE / CLOSED**.

## Problem

`intelligence/destination-service.js` was an active runtime consumer with direct access to private `window.LuviaTripStore`. This violated the target dependency direction for a non-owner consumer and prevented the Destination Service from being cleanly portable into the Native First Ready architecture.

The existing generic `updateTrip` contract command was not an acceptable replacement for this use case because its implementation routes through `TripExperience.update`, whose destination patch includes the `luvia_save_trip_profile` Supabase RPC. Reusing that path would have changed the existing local/offline destination resolution semantics.

## Chosen architecture

A narrow Trip-owned command boundary was introduced:

`applyResolvedDestination(tripId, destination)`

The command:

1. resolves the canonical owned Trip from TripStore;
2. creates the next canonical Trip state with the resolved destination model, destination name and updated timestamp;
3. performs one local TripStore upsert;
4. does not call `TripExperience.update`;
5. does not introduce `luvia_save_trip_profile`.

Destination Service now performs Trip reads and subscription through the public Trip Contract and sends the resolved-destination mutation through this Trip-owned command.

## Truth / ownership result

- TripStore remains the sole Trip Truth.
- No duplicate Destination Trip Truth was created.
- No foreign DB mutation was introduced.
- Destination Service private TripStore references moved from 8 to 0.
- The public Trip Contract remains the cross-boundary interface.
- Legacy destination compatibility behavior remains available for the current Web runtime.

## Guardrail decision

The M5.1j Trip Contract test originally treated the command surface as an exact frozen list. M5.4.1 proved that this prevented valid additive owner-command evolution. The guardrail was changed to require the existing commands while allowing additive public commands. This is a test-contract correction, not a weakening of Trip ownership.

## Native First Ready assessment

This slice materially improves Native readiness because the active Destination Service no longer depends directly on private Web TripStore access.

It does **not** claim full browser-global removal. Current Web compatibility bindings such as `window.LuviaTripStore`, `window.LuviaTripContext` and `window.LuviaTripContractV1` remain permitted where still required and are explicit debt for subsequent M5.4 work.

## Exit evidence

- Focused owner-command test: PASS.
- Focused Destination Service boundary test: PASS.
- Integration Safe Regression: 35/35 PASS.
- Main Safe Regression: 35/35 PASS.
- Integration Preview byte provenance: PASS.
- Integration authenticated browser/F5 acceptance: PASS.
- Main FF-only promotion: PASS.
- Production byte provenance: PASS.
- Production authenticated browser/F5 acceptance: PASS.
- DB/Function/Secret/manual Cloudflare changes: NONE.

## Remaining M5.4 direction

M5.4 remains IN PROGRESS. The next work should continue reducing active runtime/global Trip dependencies by architecture boundary rather than by arbitrary individual file. Boot/runtime dependencies, Trip-owned browser coupling and Travel Context/platform-port coupling remain candidates for the next bundled M5.4 block.
