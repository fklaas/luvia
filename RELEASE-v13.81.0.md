# Luvia v13.81.0 / Core 4.81.0
## Booking Timeline + Modify + Cancel + Conversation Archive/Delete Lifecycle

### New
1. User-readable Booking Timeline combining booking events, status signals, messages/delivery evidence and mutation lifecycle.
2. Modify flow for date, time, party size and optional note.
3. Cancel flow with explicit confirmation and optional reason.
4. Provider-first mutation orchestration using the existing reservation mutation runtime.
5. Safe email-thread fallback when provider mutation is unsupported/not connected/not ready.
6. Evidence-driven final states: a click never directly marks a booking cancelled or a modification confirmed.
7. Persistent conversation Archive lifecycle.
8. Persistent per-user soft Delete lifecycle. Booking messages/events are never hard-deleted by this feature.
9. Persistent last-read state foundation in `booking_conversation_preferences`.
10. New product capabilities: `booking.timeline`, `booking.mutations`, `booking.conversation.lifecycle`.

### Safety invariants
- `cancelBooking()` never directly executes a local `cancelled` transition.
- Email mutation fallback leaves provider outcome unknown and awaits provider reply.
- Conversation Delete changes only personal visibility state.
- `booking_messages`, `booking_events`, status signals and mutation audit remain intact.
