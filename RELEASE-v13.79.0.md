# Luvia v13.79.0 / Core 4.79.0
## Booking Inbox & Conversations

### Goal
Make the existing Booking communication runtime visible to users as a calm, provider-independent conversation experience inside the modular Control Center.

### Delivered
1. New `control-center-inbox` product surface.
2. Booking Inbox with trip filter and priority filters: All, Unread, Action required.
3. Conversation list built from existing Booking rows plus Booking Core conversation state.
4. Unified timeline for outbound, inbound and system messages.
5. Luvia Intelligence cards rendered after classified inbound messages.
6. Booking context header inside each conversation.
7. Local unread presentation foundation using a best-effort last-seen timestamp. This is UI state only and is not Booking/Message truth.
8. Composer UI foundation. It intentionally does not fake successful replies; actual free reply transport is reserved for v13.80.
9. Booking Integration extended with `messages`, `messageIntelligence`, `emailThread`, `conversation` read APIs.
10. Control Center Home Inbox card now opens the new surface.
11. Booking Control Center detail can open the Inbox.
12. Product Module Diagnostics include Booking Inbox.
13. Service Worker cache bumped to v13.79.0.

### Architecture guarantees
- Booking Inbox does not call Supabase tables directly.
- Booking and Message truth remain in Booking Core / Booking Integration.
- The same conversation renderer is domain-neutral for restaurants, hotels, activities, transport and future booking types.
- Provider/channel is transport metadata, not a separate product experience.
- No DB migration, Edge Function change or new secret is required.
