# Luvia v13.67.0 / Core 4.67.0 — Email Booking V2 Thread & Reply Runtime

## Ziel
Antworten des Restaurants werden zuverlässig einer Luvia-Buchung zugeordnet und in den bestehenden Status-Provenance-Core eingespeist.

## Neu
- `booking_email_threads` für einen stabilen Reply-Alias und Conversation-State.
- `booking_email_delivery_events` für idempotente Transport-Webhooks.
- `luvia_booking_match_inbound_v2(...)`: Korrelation über Reply Alias, `In-Reply-To`, `References` und Provider Message IDs.
- `luvia_booking_process_inbound_intelligence_v2(...)`: Reply-Klassifikation nutzt `email_reply` als Statusquelle und schreibt **nicht direkt** in `bookings.status`.
- `booking-email-inbound` verarbeitet Reply- und Delivery-Events idempotent.

## Statusautorität
Eine E-Mail-Antwort kann einen fachlichen Status vorschlagen. Die Anwendung erfolgt ausschließlich durch den bestehenden Booking Status Provenance Core.
