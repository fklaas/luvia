# Luvia v13.81.2 / Core 4.81.2

## Booking Mutation State Fallback & Mobile Action Safe-Area Fix

### Root cause 1 – mutation fallback stopped too early
The provider mutation runtime correctly rejects direct mutation for booking states outside its direct mutable set. The Control Center integration previously treated `BOOKING_STATE_NOT_MODIFIABLE` and `BOOKING_STATE_NOT_CANCELLABLE` as terminal errors, although the UI explicitly promises a safe existing-thread fallback. v13.81.2 classifies those expected outcomes as fallback candidates, but only allows the thread request for explicitly eligible non-terminal booking states. Terminal bookings remain blocked.

### Root cause 2 – global navigation was above the modal
`.luvia-shell-nav` uses `z-index: 12000`; the v13.81 action sheet used `z-index: 1200`. Therefore the global mobile navigation could physically cover the primary Modify/Cancel CTA. The action sheet now uses a higher overlay layer and a mobile sticky action footer with `env(safe-area-inset-bottom)`.

### UX hardening
Raw technical mutation codes are mapped to clear German messages when a safe fallback still cannot be executed, for example when no existing provider thread is available.
