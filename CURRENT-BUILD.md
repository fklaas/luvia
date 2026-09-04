# Luvia aktueller Integrationsstand

Releasekandidat **13.82.168.47**, Core **4.82.169**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**: Geplante Places sicher aus der Timeline entfernen und über einen Cloud-Beleg auch nach Reload wiederherstellen. .46 bleibt bis zur Abnahme der veröffentlichte Integrationsstand.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.46**, Core **4.82.168**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 teilweise umgesetzt.

**Zuletzt geliefert:** Places und Stays verwenden den sofort gewählten Kartenbereich; verspätete Antworten überschreiben ihn nicht. Fehlgeschlagene Kategorieabfragen beenden den Ladezustand und bieten Retry. Kürzlich verifizierte Geoapify-Treffer derselben Suche können bei Ausfall markiert wiederangezeigt werden. Sichtbarer Test: Shopping 46 / Natur 16 bei gleichem 3-km-Bereich; unterbrochener Abruf → Retry → 46 Shopping-Pins; Stays 49. Runtime .46: 213/213 Regression, 30/30 öffentliche Dateihashes. Die zuvor gelieferte P09-Zeitänderung mit Rücknahme nach Reload bleibt erhalten.

**Nächster Schritt (GEPLANT): Geplante Place-Einträge entfernen und nach Reload wiederherstellen.** Die letzte Zeitänderung besitzt bereits dauerhafte Rücknahme; Entfernen bietet bisher nur eine kurze Rücknahme-Meldung.

**Abnahme dieses Schritts:**

- Entfernen erst nach lesbarer Vorschau und Bestätigung; Favorit, Ortsdaten und echte Buchungen bleiben fachlich getrennt.
- Nach Reload Wiederherstellung anbieten, ursprünglichen Termin prüfen und erst nach Bestätigung speichern; veraltete Änderungen und Konflikte berücksichtigen.
- Sichtbar im Browser entfernen → reloaden → wiederherstellen → erneut reloaden; Ergebnis unabhängig lesen, Prüfdaten zurücksetzen und gezielte Regression belegen.

**Danach:** Weitere P09-Lücken schließen: Einträge verbinden, mehrere Einträge umordnen und weitere Eintragsarten. P10-Erklärungen dabei ergänzen; anschließend die vollständige B1-Nutzerkette und die geltenden Freigabegates abnehmen.

**Weiter offen:** Vollständige P09/P10- und Human↔AI-Abnahme, physisches iPhone/Android und echte Mehrnutzerfälle; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. App **13.82.168.46**, Core **4.82.168**, Channel **integration-preview**. Runtime-Familie: **M16.5 Places and Stays Quality**.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Maßgeblich sind docs/planning/status-plan.v1.json, docs/planning/STATUSPLAN-2026-09-04.md, docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.

Main bleibt bei c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba. Geprüfter Rückfallstand: App .44, Quelle bc642a06a23e82165648d6a43738430f83b145d6. Bereits vorhandener gemeinsamer Booking-Resolver: 2.8.0-venue-service-reservation-anchor, Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34. Keine neue Function, Migration oder Secret-Änderung in diesem P09-Slice.
