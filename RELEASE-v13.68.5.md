# Luvia v13.68.5 / Core 4.68.5

## Placeholder Email Detection & Verified Candidate Ranking Fix

- Blocks documentation/example email addresses before candidate promotion and before Email Booking V2 readiness/send.
- Invalidates previously persisted placeholder candidates (`rejected`, `auto_usable=false`).
- Prefers an independently rediscovered legacy venue email when multiple candidates have the same channel priority.
- Repairs bookings whose selected `contact.email` was a placeholder by selecting the strongest remaining verified official email candidate.
- Preserves provider-domain and asset/file recipient guards.
