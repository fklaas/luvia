# Luvia v13.62.0 / Core 4.62.0 — Reservation Creation Runtime V1

Adds the canonical provider reservation-creation runtime on top of Availability Runtime V1.

- Connected-provider readiness gate before any mutation.
- RLS-backed booking ownership check.
- Idempotent create requests per booking.
- Provider venue, slot and reservation references remain separate.
- Provider reservation reference is mandatory for success.
- Provider API responses enter the existing status provenance pipeline through `provider_api`.
- No fake confirmation IDs and no automatic confirmation from handoff/affiliate signals.
- Partner-required and transport-not-ready states remain expected HTTP-200 responses.
