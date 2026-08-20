# PCR — NFR-0 Native First Ready

Date: 2026-08-20

## Purpose

NFR-0 was introduced between M5.2 closeout and M5.3 runtime mutation to prevent newly isolated Trip Core work from being rebuilt around browser-only dependencies.

NFR-0 is project-wide and not Trip-only.

## Canonical baseline

Source files scanned: 546.

Browser dependency findings: 8008.

Domain-relevant files with browser coupling: 186.

Domain-relevant findings: 3149.

Candidate classification baseline:

DOMAIN_VIOLATION_CANDIDATE: 68 files / 480 findings.

WEB_ADAPTER_CANDIDATE: 24 files / 153 findings.

WEB_EXPERIENCE_CANDIDATE: 11 files / 216 findings.

BOOTSTRAP_COMPATIBILITY_CANDIDATE: 39 files / 1133 findings.

LEGACY_DEBT: 44 files / 1167 findings.

## Platform Ports

The Native First Ready architecture defines 16 platform ports:

StoragePort

SecureStoragePort

AuthSessionPort

LocationPort

MediaPickerPort

MediaCapturePort

MediaStoragePort

NotificationPort

NetworkPort

LifecyclePort

SharingPort

DeepLinkPort

ExternalNavigationPort

DevicePort

PermissionPort

OfflineCachePort

## Critical classifications

core/trips/trip-store.js remains real Domain Browser Coupling debt.

core/services/travel-context-service.js remains a priority Port Migration / Domain browser coupling target for M5.3.

core/platform/trip-contract-adapter.js remains Bootstrap Compatibility debt and a priority M5.3 boundary.

core/runtime/boot-coordinator.js and runtime.js remain current Web Bootstrap Compatibility boundaries.

join-flow.js, trip-creator.js and trip-experience.js are primarily Web Experience with placement and boundary debt for later M5.4 work.

timeline-core.js remains cross-domain / compatibility debt and must not silently become a new truth-owning core.

Legacy core/ai and intelligence roots remain registered legacy intelligence debt. The new core/intelligence foundation remains native-clean.

window.LuviaTripContractV1 remains an allowed temporary Web Runtime Compatibility Binding. It is not the final native transport.

## Guardrails

Existing browser debt may remain equal or shrink.

New domain-browser coupling or growth beyond the registered baseline is forbidden without explicit architecture baseline review.

Native-clean roots must remain browserless.

Browserless Foundation tests run in Node without requiring window or document.

The Node host may expose navigator; browserless tests therefore forbid module dependency on navigator rather than incorrectly assuming the host global is undefined.

## Static Asset Exposure

A real Static Asset Exposure was found during Integration Preview acceptance.

config/luvia-native-readiness-debt.json was publicly served byte-exact.

Main promotion was correctly stopped.

The repair was test-first and limited to .assetsignore plus the Native First Foundation regression.

Repair commit: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27.

The final hardening excludes only the two internal NFR config artifacts rather than blocking the whole config directory.

Preview privacy result: 5 / 5 PASS.

Production privacy result: 5 / 5 PASS.

## Evidence and harness incidents retained

Early PowerShell inventory attempts failed at harness / summary level and were not recorded as inventory PASS.

The canonical inventory was produced by the robust Node-backed runner.

The first browserless smoke assumed global.navigator was undefined. Modern Node exposed navigator. The host assumption was removed while retaining the actual module browser-dependency prohibition.

A PowerShell porcelain parser previously misread dirty paths after trimming. Scope proof was changed to git diff --name-only plus git ls-files --others --exclude-standard.

Initial Preview byte comparison used Windows working-copy bytes and therefore saw a CRLF/LF mismatch. Git commit blob comparison proved the deployed Preview module byte-exact.

These incidents remain evidence and are not rewritten as successful original executions.

## Production

Production App/Core: 13.82.11 / 4.82.11.

Production accepted architecture/runtime head: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27.

Production NFR module Git-blob provenance: PASS.

Production Static Asset Privacy: 5 / 5 PASS.

Authenticated Production Browser Smoke: PASS.

## M5.3 readiness

NFR-0 does not itself rewrite all browser debt.

M5.3 consumes this foundation with priority on Active Trip Context, runtime-neutral Trip access and subscriptions, Trip Store browser coupling, travel-context-service, Trip Contract runtime binding and boot/runtime compatibility boundaries.

M5.4 continues physical isolation and Web Experience / compatibility cleanup.

M5.3 remains blocked until the exact NFR-0 Docs Marker has completed final 8/8 stream synchronization.

After that gate NFR-0 is COMPLETE / CLOSED and M5.3 becomes UNBLOCKED / READY.
