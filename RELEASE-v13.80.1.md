# RELEASE v13.80.1 / Core 4.80.1

## Booking Inbox Composer Send Reliability Fix

v13.80.1 fixes a production UX defect where clicking **Senden** could appear to do nothing.

### Changes
- Send button now has an explicit `data-bi-send` click route.
- Click and native form submit share the same `sendFromForm()` function.
- Transport progress is rendered inline: `Antwort wird versendet …`.
- Success is rendered inline.
- Backend/validation errors are rendered inline instead of relying only on transient toasts.
- Missing reply capability is surfaced explicitly.

### Architectural truth
No booking status, message or intelligence truth is duplicated. The actual transport remains `LuviaBooking.reply()` → `booking-email-reply`.
