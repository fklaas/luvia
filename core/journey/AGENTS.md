# Journey Core Rules

`core/journey/` owns only the derived Day Graph, temporal ordering, conflict policy and source-owner provenance.

- Keep the domain core browserless and platform-neutral.
- Consume Trip, Places, Booking, Media, Identity, Social and Intelligence information only through public projections.
- Never persist or duplicate foreign Domain Truth.
- Expose stable reads, commands and events through `journey.v1`.
- Route Web, Supabase, DOM, navigation and device behavior through adapters or Platform Ports.
- Treat `core/places/timeline-core.js` as a temporary Web/DB compatibility provider; do not add new active consumers of `LuviaTimelineCore`.
- Journey-specific presentation may use Experience and Overlay Host contracts but must not own the global modal stack.
