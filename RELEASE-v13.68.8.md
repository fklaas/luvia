# Luvia v13.68.8 / Core 4.68.8

## App Bootstrap Render Guarantee & Auth Init Race Fix

Der auf frischen Geräten reproduzierte White-Screen wurde auf den Bootstrap eingegrenzt: Der aktuelle Renderer war funktionsfähig, wurde beim initialen Start aber nicht zuverlässig erreicht. Ein manueller `window.LuviaApp.render()`-Aufruf stellte den Login sofort wieder her.

### Änderungen
- idempotenter kanonischer `startShell()`-Startpfad
- Start über `DOMContentLoaded` **oder sofort**, wenn das Dokument bereits bereit ist
- Post-Boot-Render-Garantie
- unabhängiger Empty-DOM-Recovery-Render nach 900 ms
- Auth-Init wird vor Recovery berücksichtigt
- `window.LuviaBootDiagnostics` für reproduzierbare Boot-Diagnose
- `window.LuviaApp.start()` und `window.LuviaApp.diagnostics()` verfügbar
- bestehender Public-Entry-Mount-Contract aus 13.68.7 bleibt unverändert erhalten
- keine Änderung an Auth-, Trip- oder Booking-Datenmodellen

### Versionen
- App: 13.68.8
- Core: 4.68.8
- Cache: luvia-shell-v13.68.8
