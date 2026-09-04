# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.49**, Core **4.82.171**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** Releasekandidat .49 schließt die bisherige P09/P01-First-Paint-Lücke lokal: sechs Timeline-Datenquellen starten ohne serielle Place-Wartezeit; beim Reisewechsel werden alte Einträge sofort entfernt; während eines ungeklärten Owner-Reads erscheint kein falscher leerer Tag. Geplante Places, Buchungen, bestätigte Besuche und Memories erhalten eine lesbare Owner-Fähigkeitsmatrix. Direktbearbeitung bleibt auf zugelassene Place-Pläne begrenzt. Gezielte Core-, Browser-, Registry- und Visual-Gates sind grün; stabile Veröffentlichung und vollständige Regression laufen.

**Nächster Schritt (IN ABNAHME): Release .49 unveränderlich veröffentlichen und Timeline-First-Paint öffentlich abnehmen.** Die Laufzeitänderung ist lokal belegt. Vor dem Wechsel zum nächsten Sachblock müssen vollständige Regression, Quellidentität und der angemeldete stabile Reload denselben Stand bestätigen.

**Abnahme dieses Schritts:**

- Alle 217 zugelassenen Safe-Regression-Prüfungen einschließlich der neuen Core- und sichtbaren Mobile-Matrix bestehen.
- Integration wird ausschließlich aus dem festgeschriebenen .49-Quellarchiv veröffentlicht; Main, Datenbank, Functions und Secrets bleiben unverändert.
- Die ausgewählten öffentlichen Dateien stimmen bytegenau mit dem Archiv überein.
- Ein angemeldeter Reload zeigt sofort einen eindeutigen Ladezustand und danach die realen Owner-Einträge; kein falscher Zustand „0 Momente / Offen“ erscheint als fertiger Tag.

**Danach:** Unmittelbar danach P02/P03: die gemeldete Places-Kategorie- und Ausschnittskontinuität in sichtbaren Wiederholungszyklen für Shopping, Natur & Erholung und weitere Kategorien reproduzieren, Ursachen beheben und 0/3/45-Schwankungen ausschließen. Danach folgen die positiven delegierten P09-Wege für Booking, Visit und Memory.

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
