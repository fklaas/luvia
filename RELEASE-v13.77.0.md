# Luvia v13.77.0 / Core 4.77.0
## Control Center Home & Travel Identity Integration

v13.77 turns the v13.76 product-module foundation into the first user-visible Control Center surface without creating a second application runtime.

### Delivered
- User-visible Control Center Home mounted through `LuviaProductModuleRegistry`.
- Header entry point without replacing the established consumer navigation.
- `LuviaControlCenterTravelIdentity` reads active/upcoming trip identity from global TripStore/TripContext/TravelContext only.
- `LuviaControlCenterAttention` aggregates first trip and booking attention signals without owning booking truth.
- Capability-aware cards for Booking, Inbox, Wallet and Trip Command.
- Responsive Control Center Home using global design-system semantic tokens.
- Control Center manifest home route promoted from planned to available.
- Service worker app shell extended for the Control Center surface.

### Architecture invariants
- No duplicate trip state.
- No duplicate booking state.
- No new auth or realtime runtime.
- Control Center remains independently enableable.
- Consumer Experience remains functional if Control Center is disabled.
