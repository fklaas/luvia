# Luvia v13.57.0 / Core 4.57.0
## Provider Activation Gates V1 + Venue Contact Ownership Guard

Booking Core:
- Provider connection runtime gains explicit activation_state, activation_reason and probe_state.
- Credentials being configured never marks a provider as connected. It only permits ready_to_activate/ready_to_connect.
- Providers without a verified credential schema remain blocked/partner_required.
- Health checks are audited in booking_provider_connection_events without storing secret values.
- New readiness view: booking_provider_connection_readiness_v3.

Booking contact safety:
- Generic booking-platform addresses (e.g. @zenchef.com) are rejected as venue contact addresses.
- Existing stale provider-domain email candidates are invalidated during migration.
- Existing booking.contact.email values on known provider domains are removed safely.
- Official venue pages may still publish an external-domain venue address (e.g. Gmail); it remains usable when explicitly present on the venue source page.
- No email addresses are guessed.
