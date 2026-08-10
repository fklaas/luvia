# Luvia v13.68.7 / Core 4.68.7

## Public Entry Mount Contract & Signed-out Boot Fix

Dieser Patch schließt den reproduzierten White-Screen im unauthentifizierten Boot-Pfad.

### Ursache

Der Public Entry besitzt jetzt einen expliziten Mount-Contract. `render()` löst seinen Container defensiv selbst auf (`#app` als Default) und bricht mit einem eindeutigen Fehler ab, falls kein Mount-Ziel existiert. Der Signed-out-Boot übergibt das Mount-Ziel zusätzlich immer explizit und akzeptiert keinen vermeintlich erfolgreichen Join-Flow ohne tatsächlich erzeugtes DOM.

### Sicherheitsnetz

- `LuviaGuidedJourneyEntry.render()` funktioniert mit explizitem Container und ohne Argument.
- Fehlendes `#app` erzeugt `LUVIA_PUBLIC_ENTRY_CONTAINER_MISSING`.
- Fehlender Entry-DOM erzeugt `LUVIA_PUBLIC_ENTRY_MOUNT_FAILED`.
- JoinFlow darf den Signed-out-Boot nur übernehmen, wenn DOM entstanden ist.
- Der Login-Fallback aus v13.68.6 bleibt bestehen.
- Watchdog prüft zusätzlich, ob der sichtbare Marker tatsächlich im Viewport liegt.

Keine Auth-Sessions, Trip-Daten oder Booking-Runtimes werden verändert.
