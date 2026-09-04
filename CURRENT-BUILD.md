# Luvia aktueller Integrationsstand

Lokaler B1 Release Candidate **13.82.168.41** – M16.5 Places and Stays Quality. Öffentliche Abnahme noch ausstehend. Der folgende Block beschreibt den zuletzt veröffentlichten Stand.

Stand 4. September 2026. Die vorherigen Current-Abschnitte sind unverändert im [Dokumentarchiv](docs/planning/archive/2026-09-04-before-consolidation/CURRENT-BUILD.md) erhalten. Sie sind keine weiteren aktiven Build-Zeiger.

- App: **13.82.168.37**
- Core: **4.82.168**
- Channel: **integration-preview**
- Runtime source: **978e3d00bef46dee9f84e51c94ee14b5299e7133**
- Worker: **c8d1d1c2-0849-4de7-800a-15d7782767ab**
- Gateway: **v161 ACTIVE**
- Nachfolgende HERE-Konfiguration: **c28621de866a8dee371ca926b5f98f9617d9e295**
- Letzte gemessene Runtime-Regressionsabnahme: **210/210 PASS**; öffentliche Asset-Identität **18/18**.
- Main bleibt **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba**; keine Production-Änderung durch diesen Dokument-Slice.

Places und Stays verwenden dieselbe aktive räumliche Technik. Aktive Reise, Zielortsuche, Kategorie-/Küchenfilter, belegte Passung, Pin-Auswahl, Kartenbedienung und mobile Layouts wurden gezielt repariert. Fünf gemeinsame Kartenfunktionen und Geh-/Fahrradrouten sind öffentlich teilabgenommen. Reale Hardware-Abnahme und volle Ortsfotoabdeckung bleiben offen.

Discovery: Geoapify → TomTom → HERE. Routing: ORS → TomTom → Geoapify → HERE. Atomare Backend-Budgetreservierungen verhindern eine unkontrollierte Kaskade. Google und Foursquare sind policy-deaktiviert. Anbietergrenzen sind Luvia-eigene Limits, kein verifiziertes Restguthaben.

Die gemessenen Details und Einschränkungen stehen im [Provider-Abnahmebericht](docs/modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md). Der [Statusplan](docs/planning/STATUSPLAN-2026-09-04.md) steuert P01–P50. Der [Masterfahrplan v6](docs/planning/MASTERFAHRPLAN-v6.md) steuert M0–M22.

B0 ist als Steuerungsgrundlage geschlossen. B1 bleibt aktiv; P09/P10 und die vollständige Golden Journey sind offen. Weder ein Buchungsanbieter noch ein vollständiger Design Freeze wird durch den Karten-Release behauptet.
