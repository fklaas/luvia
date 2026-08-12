# Test Results – Luvia v13.78.0 / Core 4.78.0

## Local automated results

| Test | Result |
|---|---|
| v13.78 Booking Control Center Foundation | PASS |
| v13.78 Product Module Regression | PASS |
| v13.77 Control Center Home / Travel Identity | PASS |
| TheFork adapter regression | PASS |
| Quandoo adapter regression | PASS |
| OpenTable adapter regression | PASS |
| SevenRooms adapter regression | PASS |
| Resy adapter regression | PASS |
| Tock adapter regression | PASS |
| Syntax – Booking Control Center | PASS |
| Syntax – Attention service | PASS |
| Syntax – Control Center Home | PASS |
| Syntax – Control Center manifest | PASS |
| Syntax – App Shell | PASS |
| Syntax – Product Module diagnostics | PASS |
| Syntax – Kernel version | PASS |
| Syntax – Service Worker | PASS |

## Release markers observed

```text
LUVIA_V13_78_0_BOOKING_CONTROL_CENTER_FOUNDATION_OK
LUVIA_V13_78_0_PRODUCT_MODULE_REGRESSION_OK
LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK
LUVIA_V13_41_0_THEFORK_ADAPTER_FOUNDATION_OK
LUVIA_V13_42_0_QUANDOO_ADAPTER_FOUNDATION_OK
LUVIA_V13_44_0_OPENTABLE_ADAPTER_FOUNDATION_OK
LUVIA_V13_45_0_SEVENROOMS_ADAPTER_FOUNDATION_OK
LUVIA_V13_46_0_RESY_ADAPTER_FOUNDATION_OK
LUVIA_V13_47_0_TOCK_ADAPTER_FOUNDATION_OK
```

## Not locally verified
- production Supabase authentication/session
- production `booking_integration_summary` data
- real booking status distribution for the user's trips
- production trip switching through the UI
- Cloudflare Service Worker replacement in the user's browser
- visual rendering on the user's actual desktop/mobile devices

Those remain explicit post-deployment checks, not claimed as locally tested.
