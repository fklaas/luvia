# P02/P03 — Gratisbudget und Ernährungs-Konfliktprüfung

Stand: 5. September 2026. Gültig für Integration **13.82.168.74**, Core **4.82.196**, Worker **74816b52-0c5d-476a-81ed-85d67d72f387** und Gateway **v191 / 4.64.17**. Main und Production wurden nicht verändert.

## Problem und Ergebnis

Die Providersteuerung lehnte am Tageslimit alle Places-Quellen ab. Nach einer Freigabe des Geoapify-Restbudgets lieferte der strikte Filter „Vegetarisch“ zwar wieder Ergebnisse, übernahm aber auch das **Kleine Steakhouse**, weil ein allgemeines Anbietermerkmal als ausreichend behandelt wurde.

Die aktive Geoapify-Policy nutzt nun höchstens **2.800 Credits pro Tag** und hält gegenüber dem dokumentierten Free-Plan von 3.000 Credits eine Reserve von 200 Credits. Google und Foursquare wurden durch diese Migration nicht aktiviert. Ihre Secrets können konfiguriert sein; ein kostenrelevanter Aufruf bleibt ohne geprüfte Konto-, Billing- und Kontingentfreigabe durch die Budgetpolicy gesperrt.

Der Gateway verwirft bei strikten vegetarischen oder veganen Suchen fleischzentrierte Orte wie Steak-, Grill-, Döner- oder BBQ-Häuser, solange keine dedizierte vegetarische beziehungsweise vegane Klassifikation vorliegt. Unbekannte Ernährungsangaben bleiben ausgeschlossen. Der neue Cache-Namespace verhindert, dass eine vor dem Fix gespeicherte Falschklassifikation weiter ausgeliefert wird. Budgetablehnungen tragen zusätzlich einen begrenzten maschinenlesbaren Grund in der Diagnose.

## Belege

- Datenbankmigration `20260905090000_geoapify_free_budget_reserve.sql` ist auf dem verknüpften Integrationsprojekt als lokal und remote angewendet verzeichnet.
- Supabase führt `luvia-gateway` als **v191 ACTIVE**, SHA-256 `45e86cf57a28dcc2eed177a35c41a4478066aba071ba74b35b5aeb27873751dc`.
- Öffentlicher Healthcheck: Gateway **4.64.17**, Places **4.37.6-dietary-conflict-guard**, HTTP 200.
- Der öffentliche Scharbeutz-Diagnoselauf lieferte 12 belegte vegetarische Ergebnisse über Geoapify, ohne Fallbackfehler und ohne **Kleines Steakhouse**.
- Sichtbarer Browser: „Essen & Trinken → Landesküche → Vegetarisch“ zeigte dieselben 12 koordinatenverifizierten Pins; 11 trugen einen belegten „Passt“-Hinweis. Die breite „Alle“-Menge blieb mit 50 Orten erhalten.
- Sichtbarer Stays-Kaltstart: 49 koordinatenverifizierte Unterkünfte im 3-km-Reisezielvertrag, innerhalb der Kartenfläche und mit denselben Karten-, Passend-, Such-, Filter-, 3D/2D- und Reisezielbedienelementen.
- Automatisierte Filtermatrix: 82 Kategorie- und Untertypabbildungen, alle Faktenfilter, Kombination, Reset, Entfernung und exakte Medienidentität bestanden.
- Safe Regression: **223/223 PASS**; NFR-0: **3/3 PASS**; öffentliche Frontenddateien: **30/30 MATCH** zwischen stabilem und unveränderlichem Worker.

Lokale Abnahmebelege:

- `outputs/release74-gateway-health-v191.json`
- `outputs/release74-vegetarian-health-v191.json`
- `outputs/release74-v191-visible-browser-evidence.json`
- `outputs/public-byte-proof74-v191.json`
- `outputs/p02-p03-dietary-budget-guard-release74-regression-pass.log`
- `outputs/release74-v191-a5079b1a.zip`, 88.723.200 Bytes, SHA-256 `6414EF77154DF08F057A2DAE5079362B47A18ED3FDF0EB44C088A71C09D2D4BF`

## Grenzen und Rückfall

Der Live-Nachweis schließt den konkreten vegetarischen Falschpositivfall und die akute Budgetblockade. Er ist noch kein Abschluss aller sichtbaren Kategorien, Filter, AI-Chat-Varianten, echten Ortsfotos oder physischen Mobilzeiten; P02 und P03 bleiben **TEILWEISE**.

Frontend-Rückfall bleibt App **.73**, Worker `88237a65-3175-4fe8-aad1-5ad29505b154`. Der unmittelbare Gateway-Rückfall vor diesem Hotfix ist v189. Für einen vollständigen Budgetrückfall muss die aktive Geoapify-Policy kontrolliert auf 2.200 Credits pro Tag zurückgesetzt werden; eine Änderung darf keine weitere Quelle aktivieren.
