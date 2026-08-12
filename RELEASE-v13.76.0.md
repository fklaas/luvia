# Release v13.76.0 / Core 4.76.0
## Luvia Control Center Architecture & Global Product Module Foundation

This release adds a platform-level modular architecture without redesigning the Consumer UI or changing Booking truth.

### Added
- `LuviaProductModuleRegistry` for complete product surfaces.
- `LuviaCapabilityRegistry` for machine-readable provider/consumer relationships.
- `LuviaGlobalContracts` for shared runtime, design, auth, profile, trip, navigation, events and realtime contracts.
- `LuviaDesignSystemContract` plus global semantic CSS aliases.
- `LuviaAttentionContract`, separating events, notifications, unread state, attention and action-required concepts.
- Control Center manifest with planned Home, Booking, Inbox, Wallet and Trip Command submodules.
- Control Center Shell that inherits global contexts and owns no domain truth.
- Consumer and Developer Console product manifests.
- Product Module diagnostics in Developer Console.

### Architecture guarantees
- Existing `LuviaModuleRegistry` remains intact and continues to own trip/domain module registration.
- Booking Core remains the source of truth for reservation lifecycle.
- Control Center can be enabled/disabled independently without disabling Consumer Experience.
- No separate Control Center auth, trip, booking, realtime or design truth is introduced.
- Product modules inherit the global Luvia design contract rather than creating a design fork.

### No UI redesign
This is a foundation release. It intentionally does not replace navigation, Today, Trips, Places, Memories or existing Booking UI.
