# Luvia v13.68.0 / Core 4.68.0 — Email Booking V2 Completion & Recovery

## Ziel
Email Booking V2 wird als vollständiger Runtime-Block abgeschlossen: Outbound, Thread, Reply, Delivery, Review und Recovery sind sichtbar und auditiert.

## Neu
- `booking_email_runtime_v2` als zusammengeführter Laufzeitstatus pro Booking.
- `booking_email_recovery_queue_v2` für `delivery_attention`, `review_required` und `reply_overdue`.
- `luvia_booking_email_mark_delivery(...)` verarbeitet Delivery-/Bounce-/Complaint-Zustände idempotent.
- Neue Edge Function `booking-email-runtime` mit `readiness`, `get`, `history`, `queue`.
- Neuer Browser Client `window.LuviaBookingEmailV2` mit `readiness()`, `get()`, `history()`, `queue()`, `send()`.
- Shell-/PWA-Integration und Cache-Bump auf `luvia-shell-v13.68.0`.

## Bewusste Grenze
Die Recovery Queue sendet **keine E-Mail automatisch erneut**. Ein fehlender Reply oder ein Delivery-Fehler bleibt sichtbar und benötigt einen bewussten nächsten Schritt. Das verhindert Doppelanfragen an Restaurants.

## Roadmap
Mit v13.66–v13.68 ist Email Booking V2 abgeschlossen. Nächster Block: v13.69–v13.71 Booking Monetization + Attribution & Commission Production.
