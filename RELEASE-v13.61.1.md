# Luvia v13.61.1 / Core 4.61.1

## Provider Availability Runtime V1 – Release Registry Hotfix

Fixes the failed v13.61.0 migration caused by referencing the non-existent `public.booking_core_releases` table. The availability schema/runtime itself is unchanged. Release metadata now uses the existing `public.booking_health_checks` registry used by the Booking Core.

Marker: `LUVIA_V13_61_1_PROVIDER_AVAILABILITY_RELEASE_REGISTRY_FIX_OK`
