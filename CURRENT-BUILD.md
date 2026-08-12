# Current Luvia Build

- App: **v13.80.0**
- Core: **4.80.0**
- Title: **Booking Actions & Intelligence**
- Base: confirmed v13.79.0 / Core 4.79.0
- Release type: Booking Core + Control Center product increment

## Production changes
- new Booking Intelligence review/action persistence migration
- new authenticated `booking-email-reply` Edge Function
- real bidirectional replies over existing Email V2 threads
- Alternatives accept / decline
- `requires_action` / `review_required` response and review flows
- no second Booking or Message truth in Control Center
