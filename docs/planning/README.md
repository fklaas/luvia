# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.190**, Core **4.82.309**. P17/P19 Priorität: vollständige KI-Reise. Kandidat App 13.82.168.191 / Core 4.82.310 korrigiert feste Zielwahl und unnötige semantische Reparaturschleifen.

**Zuletzt geliefert:** Public .190 / 39eba77a: 241/241 Regression, 117 Transport/Reserve, 133 Composer, 22/22 Bytes. Echter Valencia-Lauf 890500cb-0279-4149-8be3-bdde6fc6f779: 90 reale Kandidaten in 29 Rastergebieten, größter Anteil 24,4 %, erste vollständige Komposition 30.399 ms, erster Audit 13.960 ms. Keine inhaltliche Abnahme: Audit verwechselte offene künftige Verkehrsverbindungen und eine eigene Markt-Suchhypothese mit unerfüllten Nutzerpflichten; unnötige Neuplanungen verschlechterten gültige Tage. .191 trennt diese Eingaben, behält echte harte Blocker, übernimmt feste Ziele direkt und gibt Budgetniveau/Bewegung vollständig weiter. 132/132 gezielte Verhaltensprüfungen bestanden; neue öffentliche Abnahme steht aus.

**Nächster Schritt (AKTIV): Den korrigierten öffentlichen KI-Reisepfad inklusive Reserveaktionen inhaltlich abnehmen.** Der öffentliche Fehler ist bis zu den konkreten Audit- und Vertragsentscheidungen verfolgt. Der neue Stand muss einen vollständigen echten Plan liefern, bevor dieser Slice abgenommen wird.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Neuen vollständigen öffentlichen Lauf einschließlich benanntem Reiseziel, Laufzeit, echtem Gesamtaudit, Reservewahl und Reload abschließen. Langreise-Transport kontrolliert geprüft; physische iOS-/Android-Abnahme sowie weitere P17/P19-Gates bleiben offen.

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
