# Test v13.81.2

## Automated gate
`node tests/v13.81.2-mutation-state-fallback-mobile-action-safe-area.test.cjs`

Checks:
- state-not-modifiable/cancellable outcomes are safe fallback candidates
- fallback remains limited to explicit non-terminal booking states
- raw mutation errors have user-facing mappings
- action sheet z-index is higher than global Luvia shell navigation
- mobile sheet uses 100dvh, sticky footer and safe-area inset
- version/cache wiring is v13.81.2 / Core 4.81.2

## Live smoke
Use a real non-terminal booking with an existing conversation thread. Trigger Modify with a harmless real change only if intended. For Cancel, only use a booking that may actually be cancelled. Verify that direct-provider rejection no longer stops the fallback at `BOOKING_STATE_NOT_*`.
