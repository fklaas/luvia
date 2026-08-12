# Current Luvia Build

- App: **v13.78.0**
- Core: **4.78.0**
- Title: **Booking Control Center Foundation**
- Previous stable build: v13.77.0 / Core 4.77.0
- DB migration: **No**
- Supabase Edge Function deployment: **No**
- New/changed secrets: **No**
- Static app deployment: **Yes**

## Source of truth
The Booking Control Center is a Control Center product surface. It does not own Booking truth and does not query the `bookings` table directly. It reads the existing Booking integration API and keeps the established consumer booking surface intact.
