# Luvia Release Notes — NFR-0 Native First Ready

Date: 2026-08-20

## Release identity

Runtime App: 13.82.11

Core: 4.82.11

Runtime version bump: NONE

NFR Foundation Commit: a64e6c0fd3bd5954fe29571f8c4ea128f265a201

Static Asset Hardening Repair Commit: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27

Closeout Docs Marker: the commit containing this document.

## Status

NFR-0 Native First Ready Foundation is complete when the closeout marker is synchronized to all eight active streams.

M5 remains IN PROGRESS.

Next implementation milestone: M5.3 Active Trip Context and runtime-neutral Trip access.

M5.3 must not begin before the final 8/8 closeout synchronization gate has passed.

## Delivered architecture foundation

NFR-0 established the project-wide Native First Ready architecture contract.

The browser is the current Web client, not the sole product runtime.

The target architecture is shared Domain Cores, shared Contracts, shared Models and Rules, runtime-neutral Platform Ports, and separate Web, iOS and Android clients.

The Platform Port Registry defines 16 runtime-neutral platform boundaries:

StoragePort, SecureStoragePort, AuthSessionPort, LocationPort, MediaPickerPort, MediaCapturePort, MediaStoragePort, NotificationPort, NetworkPort, LifecyclePort, SharingPort, DeepLinkPort, ExternalNavigationPort, DevicePort, PermissionPort and OfflineCachePort.

The project now has a browser-dependency debt baseline and a regression guardrail preventing unreviewed growth of domain-browser coupling.

The temporary window.LuviaTripContractV1 binding remains classified as a Web Runtime Compatibility Binding. It is not the final native contract transport.

## Canonical inventory baseline

Source files scanned: 546

Browser dependency findings: 8008

Domain-relevant browser-coupled files: 186

Domain-relevant findings: 3149

Native-clean foundation roots include Identity, Social, core/intelligence, core/experience and core/platform/native.

## Static Asset Privacy repair

Integration Preview discovered that config/luvia-native-readiness-debt.json was publicly served byte-exact.

This was treated as a real release-blocking Static Asset Privacy finding.

The repair commit c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27 added exact .assetsignore exclusions for:

config/luvia-native-readiness-debt.json

config/luvia-platform-ports.json

No blanket config/ exclusion was introduced.

Preview Static Asset Privacy subsequently passed 5 / 5.

Production Static Asset Privacy subsequently passed 5 / 5.

## Production acceptance

Production origin: https://myluvia.app

Production App/Core identity: 13.82.11 / 4.82.11

NFR Platform Port Registry: live and byte-exact against the Git commit blob.

Production Root: HTTP 200.

Production Service Worker: HTTP 200 and registered in authenticated browser runtime.

Authenticated Production Browser Smoke: PASS.

Login session preserved: YES.

Active Trip loaded: YES.

Booking Center loads: YES.

Bookings and content visible: YES.

F5 reload preserved session and active trip: YES.

Red runtime exception observed: NO.

Auth/API 401, 403 or 500 observed: NO.

## Regression

NFR Foundation Regression: 3 / 3 PASS.

Safe Regression: 33 / 33 PASS.

M5.2 Remaining Trip Consumer Isolation: 7 / 7 PASS.

Static Asset Privacy Preview: 5 / 5 PASS.

Static Asset Privacy Production: 5 / 5 PASS.

## Infrastructure status

Database migration: NONE.

Supabase Edge Function change: NONE.

Secret change: NONE.

Manual Cloudflare deployment: NONE.

Deployment used the existing Git-triggered Cloudflare flow.

## Retained warnings

Browser Tracking Prevention warnings remain observable and are not classified as NFR-0 runtime failures.

global-location-bootstrap.js may emit the browser warning "Only request geolocation information in response to a user gesture."

This warning was observed without a red runtime exception and without observed Auth/API 401, 403 or 500 responses.

## Next

After this Docs Marker is synchronized Local = Tracking = Live across all eight active streams with divergence 0/0 and clean worktrees, NFR-0 is formally COMPLETE / CLOSED and M5.3 is UNBLOCKED / READY.
