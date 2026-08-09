# Luvia v13.61.0 / Core 4.61.0

## Provider Availability Runtime V1

- Adds one canonical availability request contract for connected booking providers.
- Input: provider, venue reference, date, optional time, party size, optional timezone/trip/booking context.
- Adds `booking_provider_availability_readiness_v1` so availability is only attempted when the provider is active, connected, availability-capable, transport-active, and healthy.
- Adds audited `booking_availability_requests` and immutable normalized `booking_availability_snapshots`.
- Adds Edge Function `booking-provider-availability` as the single client-facing availability router.
- Normalizes provider slots into one Luvia shape without fabricating missing time/slot data.
- Partner-required / transport-not-ready states remain expected HTTP-200 business states.
- Provider calls use a bounded timeout and preserve provider venue/slot references.
- No provider is marked connected and no fake availability is returned by this release.

This release is the runtime foundation for Reservation Creation Runtime V1; real slots only appear after a provider has passed the existing connection/activation gates and its live availability transport is enabled.
