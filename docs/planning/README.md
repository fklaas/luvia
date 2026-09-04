# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.48**, Core **4.82.170**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** P09 Verbinden und Mehrfach-Reorder ist in Runtime .48 begrenzt belegt. Zwei geplante Places lassen sich nach Auswahl und lesbarer Vorher/Nachher-Prüfung als gemeinsamer Weg ordnen. Owner-Revisionen, Booking-Gate, Konfliktzustimmung, ehrlicher Teilfehler und eine reloadfeste Rücknahme sind umgesetzt. Der sichtbare 477×900-Browsertest und der angemeldete Live-Zyklus auf der stabilen Integration bestanden einschließlich zweier Reloads und exakter Wiederherstellung. 216/216 Safe Regression und 30/30 öffentliche Dateihashes stimmen. Beim ersten echten Reload erschien die Timeline kurz leer, bevor die zwei Owner-Einträge eintrafen; dieser First-Paint bleibt offen.

**Nächster Schritt (GEPLANT): Weitere Timeline-Eintragstypen sicher bearbeiten und den kurz leeren First-Paint schließen.** Place-Einträge besitzen jetzt sichere Einzel- und Gruppenänderungen. Buchungen, bestätigte Besuche und Memory-/Foto-Momente brauchen dieselbe sichtbare Fähigkeitslogik über ihre jeweiligen Owner; zugleich darf die Timeline beim Reload nicht vorübergehend wie ein wirklich leerer Reisetag wirken.

**Abnahme dieses Schritts:**

- Für Booking-, Visit- und Memory-/Foto-Einträge pro Aktion sichtbar festlegen, was erlaubt, nur weiterleitbar oder bewusst gesperrt ist; keine Owner-Wahrheit in Journey kopieren.
- Erlaubte Bearbeitung, Verbindung, Reihenfolge, Entfernen und Wiederherstellen jeweils mit Vorher/Nachher, aktueller Revision, Abhängigkeiten, Bestätigung, Readback und reloadfester Rücknahme ausführen.
- Beim Reload sofort den letzten verlässlichen Tagesstand oder einen eindeutigen Ladezustand zeigen; niemals kurz „0 Momente / Offen“ als scheinbaren Endzustand anzeigen, wenn Owner-Daten noch geladen werden.
- Den kombinierten Ablauf sichtbar bei mobiler Breite und Desktop prüfen, Teständerungen vollständig zurücksetzen und Safe Regression sowie öffentliche Byte-Gleichheit erneut belegen.

**Danach:** P09/P10 mit physischem iPhone/Android und echten Mehrnutzerkonflikten nachschärfen; danach die vollständige B1-Nutzerkette samt Human↔AI-Parität und geltenden Freigabegates schließen.

**Weiter offen:** Vollständige P09/P10- und Human↔AI-Abnahme, reale Geräte und Mehrnutzerfälle; die gemeldete Places-Kategorie-/Ausschnittskontinuität bleibt als P02/P03-Wiederholungsmatrix aktiv; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

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
