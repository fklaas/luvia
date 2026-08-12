# Current Luvia Build

- App: **v13.79.0**
- Core: **4.79.0**
- Title: **Booking Inbox & Conversations**
- Previous stable build: v13.78.0 / Core 4.78.0
- DB migration: **No**
- Supabase Edge Function deployment: **No**
- New/changed secrets: **No**
- Static app deployment: **Yes**

## Source of truth
The Booking Inbox is a Control Center product surface. It owns neither Booking nor Message truth. It reads conversations only through the existing `LuviaBooking` integration API. Database access to `booking_messages`, `booking_message_intelligence` and `booking_email_threads` remains behind the Booking integration seam.

## v13.79 product boundary
- Conversation list: available
- Provider-independent message timeline: available
- Intelligence cards: read-only available
- Local unread presentation foundation: available
- Composer UI foundation: available
- Free bidirectional reply transport: **not activated until v13.80**
- Intelligence actions / review resolution: **v13.80**
