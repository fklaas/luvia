# LUVIA NATIVE FIRST READY ARCHITECTURE

Status: NFR-0 Foundation

Baseline marker: `9a5872540168d86610c43baaa9d92d55e5798ba3`

## 1. Normative target

Luvia is not a browser-only product.

The target is shared Domain Cores, shared Contracts, Commands, Events, Models and Rules, runtime-neutral Platform Ports and separate Web, iOS and Android adapters and clients.

## 2. Domain boundary

New Domain architecture must not directly depend on window, document, navigator, browser storage, Service Worker, browser navigation or other Web-only APIs.

Existing coupling is recorded in `config/luvia-native-readiness-debt.json`.

The baseline is a freeze line, not approval of existing debt.

Existing debt may shrink.

Existing debt may not silently grow.

## 3. Classification

NFR-0 uses these architecture classifications:

DOMAIN_VIOLATION

OWNER_INTERNAL

WEB_ADAPTER

WEB_EXPERIENCE

BOOTSTRAP_COMPATIBILITY

LEGACY_DEBT

LEGACY_CROSS_DOMAIN_DEBT

A browser-token hit alone is not a violation. Responsibility determines classification.

## 4. WEB RUNTIME COMPATIBILITY BINDING

`window.LuviaTripContractV1` remains an allowed WEB RUNTIME COMPATIBILITY BINDING during migration.

It is not the final Native First contract transport.

The target is imported contracts, dependency injection or a runtime-neutral registry/container.

`window.LuviaTripStore` and `window.LuviaTripContext` remain migration debt.

## 5. Platform Ports

The authoritative NFR-0 target registry is `config/luvia-platform-ports.json`.

Domain code consumes runtime-neutral ports.

Web, iOS and Android provide adapters.

## 6. Trip relationship

M5.2 is closed.

NFR-0 is between M5.2 and M5.3.

M5.3 remains blocked until NFR-0 closes.

M5.3 uses this foundation for runtime-neutral Active Trip Context and Boot/Runtime separation.

M5.4 reduces remaining Web compatibility and placement debt.

## 7. Browserless foundation

`core/platform/native/` is runtime-neutral and must remain importable without window, document or navigator.

The first NFR-0 browserless smoke proves this registry boundary.

A real browserless Trip Core smoke becomes a later M5 exit requirement after Trip runtime neutralization.

## 8. Exit requirements

NFR-0 requires:

Browser Dependency Audit.

Architecture Classification.

Platform Port Registry.

Native Readiness Debt Baseline.

Browser Global Domain Guardrail.

Browserless Core Smoke Foundation.

Controlled Safe Regression registration.

Regression preservation.

Final repository promotion and eight-stream synchronization.

Only then may M5.3 runtime mutation start.
