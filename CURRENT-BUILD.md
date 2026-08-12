# Current Build

**Luvia v13.81.2 / Core 4.81.2**

## Name
Booking Timeline + Modify + Cancel – Mutation State Fallback & Mobile Action Safe-Area Fix

## Status
Patch release for v13.81.x. Fixes two production issues found during live testing: expected `BOOKING_STATE_NOT_MODIFIABLE` / `BOOKING_STATE_NOT_CANCELLABLE` provider outcomes now continue into the safe existing-thread fallback for eligible non-terminal bookings, and the mobile Modify/Cancel action sheet now renders above the global Luvia bottom navigation with a sticky safe-area-aware action footer.

## Backend
No new DB migration. No new Edge Function. Existing v13.81.0 migration and the already deployed v13.80.x `booking-email-reply` remain prerequisites.
