# Luvia konsolidierte Arbeitsplanung

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

Stand 4. September 2026. Maßgeblich sind der gemeinsame Statusabschnitt und der Paketkatalog. Frühere Gegenbelege und anschließende begrenzte Reparaturnachweise bleiben im B1-Abnahmebericht datiert erhalten.

- [Masterfahrplan v6](MASTERFAHRPLAN-v6.md): konsolidierter gültiger Umfang und Gesamtweg bis M22, alle P01–P50 und detaillierte bestehende M18-Blueprints.
- [Statusplan](STATUSPLAN-2026-09-04.md): einzelne Paketstände, Grenzen und nächste Abschlussnachweise.
- [Statusdaten](status-plan.v1.json): dieselben 50 Pakete als maschinenlesbare Daten.
- [Aktuelle sichtbare B1-Abnahme](B1-END-TO-END-ACCEPTANCE-2026-09-04.md): datierte Belege für Suche, Favorisieren, Planen, Reservierungsweg und P09-Zeitänderung mit Rücknahme; vollständige B1-Abnahme offen.
- [Quellenherkunft](source-provenance-2026-09-04.json): vier Nutzerquellen unverändert erhalten, mit SHA-256 und ursprünglicher Master-Kapitelübersicht.
- [Vorheriger aktiver Dokumentstand](archive/2026-09-04-before-consolidation/README.md): zwölf unveränderte Repository-Dokumente vor der Konsolidierung.

Datiert ausgelieferte Word-/ZIP-Dateien im Arbeitsverzeichnis outputs bleiben historische Snapshots. Die bisherigen Pakete LUVIA_Planstand_2026-09-04 und LUVIA_B1_Planstand_2026-09-04 bilden frühere Abnahmen ab und sind keine aktuelle .46-Lesefassung. Neue Word-Ausgaben werden aus den synchronisierten Markdown-Quellen mit scripts/export-masterplan-docx.py erzeugt und separat visuell geprüft.

Die Vollständigkeitsprüfung vergleicht alle 50 Pakete, technischen Umfänge, Statusbelege und nächsten Abschlussnachweise zwischen JSON, Statusplan und Master. 16 Archivquellen sind per Hash geprüft. Die Werte 210/210 und 18/18 sind ausdrücklich frühere .37-Runtime-Belege; es wurde keine neue volle Runtime-Regression für reine Dokumentänderungen behauptet.

Pflege: zuerst Fakten, currentWork und betroffene Pakete in status-plan.v1.json aktualisieren; anschließend `node scripts/sync-planning-status.cjs --write` und `node tests/planning-current-status.test.cjs` ausführen. Die 16 aktiven Einstiege erhalten denselben aktuellen Stand und genau einen nächsten Schritt. Auch umgebende Texte auf veraltete Aussagen prüfen. Neue Exporte verwenden diese Quellen; bestehende datierte Ausgaben und Archive bleiben historisch. Jeder Fortschrittsbericht nennt Stand, Ergebnis, offenen Umfang und nächsten Schritt.
