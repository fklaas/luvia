# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.194**, Core **4.82.313**. P17/P19: Kandidat 13.82.168.195 / Core 4.82.314 mit A2 und Erlebnisqualität. Integration-Veröffentlichung in Arbeit.

**Zuletzt geliefert:** Integration .194 / Core 4.82.313 aus 86084b13 ist unter Worker 87260e5a-f5c3-4437-8a8d-ab7f77818873 veröffentlicht; 22/22 Bytevergleiche zum sauberen Archiv PASS. Echter Workflow 1687ccc4-a24f-47a6-a451-85aa75edc5ca: ready_for_review, sieben Tage, 18 Orte, 100 behaltene Kandidaten, drei Plan-B-Alternativen, separater Audit 88 / Versprechen erfüllt. Wiederanlauf 44,38 Sekunden serverseitig, drei Modellaufrufe / 34.197 ms Modellzeit / 29.968 Tokens. Dies ist die Reparatur eines bestehenden Entwurfs, kein Kaltstart-Benchmark. Echter Reserveaustausch vom Museo Histórico Municipal de Valencia zur Galería de Arte Maika Sánchez und Reload samt vollständigem Pool positiv. Zwei auffällige TomTom-Koordinaten bleiben als Audit-Aufmerksamkeit offen; beim ersten Museum gab es keinen verfügbaren gebietsfernen Ersatz. Keine bestätigte Trip-/Timeline-Übernahme ausgeführt.

**Nächster Schritt (AKTIV): A2 und Erlebnisqualität gebündelt auf Integration abnehmen.** Gewählte Variante A2 umsetzen und den inhaltlich unzureichenden Valencia-Plan ursächlich korrigieren; ein formaler Auditwert genügt nicht.

**Abnahme dieses Schritts:**

- Kontrollierte Regression und NFR-Gates des gemeinsamen Standes bestehen.
- A2 mit kompakten Austauschzeilen, getrennten Bearbeitungsmodi sowie synchronen Kartenpins auf Desktop und Handybreite bedienen.
- Commit, Integration-Deployment und öffentliche Byteidentität nachweisen.
- Einen begrenzten echten KI-Review und verbleibende räumliche Providerprobleme ehrlich dokumentieren.

**Danach:** Nach der öffentlichen Abnahme die offenen Provideridentitäten und den Familien-/Konfliktfall schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE. Öffentliche A2-Abnahme in Arbeit; widersprüchliche Ortsidentitäten, gebietsferne Reserve, Familien-/Konfliktfall, breite Kaltstarts, endgültige Konto-/Timeline-Übernahme, Mehrnutzer-Beitritt und physische Geräte bleiben offen.

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
