# Luvia v13.58.0 / Core 4.58.0

## Provider Credential Activation + Live Probe Runtime V1

Diese Version erweitert den Booking Core um eine sichere Aktivierungs-Pipeline zwischen konfigurierten Provider-Zugangsdaten und dem Zustand `connected`.

### Kernpunkte

- Credentials alleine schalten keinen Provider auf `connected`.
- Provider-Verbindungen erhalten eine explizite Live-Probe-Phase.
- Probe-Ergebnisse werden ohne Secret-Werte auditiert.
- `booking_provider_probe_runs` protokolliert Zustand, Reason, HTTP-Klasse, Latenz und sanitisiertes Evidence.
- `booking_provider_connection_readiness_v4` bündelt Connection-, Credential-, Contract-, Activation- und Probe-Zustände.
- `booking-provider-connection-health` unterstützt jetzt `health`, `probe` und `activate`.
- `probe` und `activate` sind ausschließlich über Service Role zulässig und verlangt zusätzlich `confirmActivation=true`.
- Für Provider ohne öffentlich verifizierten Probe-/Auth-Vertrag bleibt die Aktivierung bewusst blockiert.
- Quandoo besitzt den ersten verifizierten, read-only Live-Probe-Pfad über Merchant Reservation Settings. Dafür wird zusätzlich `QUANDOO_PROBE_MERCHANT_ID` benötigt.
- Timeout: 5 Sekunden; keine mutierenden Requests im Probe-Pfad.
- Secret-Inhalte werden nie in DB, Logs oder Client-Antworten geschrieben.

### Sicherheitsmodell

`credentials configured` -> `probe ready` -> `live probe healthy` -> `ready_to_activate` -> explizite Service-Role-Aktivierung -> `connected`

Kein Schritt darf übersprungen werden.

### Commit

`feat(booking): add credential activation gates and verified live provider probes`
