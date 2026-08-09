# Luvia v13.61.2 / Core 4.61.2

## Availability Client Shell Integration Fix

Fixes the browser-side integration gap where the Availability Runtime existed in the build but `window.LuviaBookingAvailability` could be absent in the active shell.

- Canonical `booking-availability.js` script is explicitly marked in `index.html`.
- App shell has a safe one-shot fallback loader when the global is missing.
- Service worker pre-caches the Availability client and uses a new shell cache generation.
- Existing Availability backend/database semantics remain unchanged.
- No fake slots and no provider activation changes.

Marker: `LUVIA_V13_61_2_AVAILABILITY_CLIENT_SHELL_INTEGRATION_OK`
