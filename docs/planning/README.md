# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.195**, Core **4.82.314**. P17/P19: A2 auf Integration .195 ausgeliefert; echte Reisequalität wegen nachgewiesener Recherche-/Interpretationslücken weiter offen.

**Zuletzt geliefert:** Integration .195 / Core 4.82.314 aus 025f098b veröffentlicht; 242/242 kontrollierte Regression und 25/25 öffentliche Dateivergleiche PASS. A2 mit echter Places-Karte öffentlich bedient: genau ein Bearbeitungspanel, synchroner Pin und Spektrumrahmen, bei 1440 Pixeln getrennte Karte/Route ohne horizontalen Überlauf. Neuer realer Valencia-Hauptworkflow dca81147-2f1b-4127-801e-137f985568d2 erreicht nach 132,48 Sekunden ready_for_review: 7 Tage, 18 Orte, 77 Kandidaten, 6 Modellaufrufe / 70.007 Tokens im Hauptworkflow. Vorgelagerte Wunsch-/Zielinterpretation ist in dieser Summe nicht enthalten. Der formale Audit 88 ist KEINE inhaltliche Vollabnahme: keine Nachtleben-Kategorie, überwiegend Parks im Aktivitätspool und zu viele generische Kleinststopps. Keine bestätigte Trip-/Timeline-Übernahme.

**Nächster Schritt (AKTIV): Konkrete Erlebnisse und benannte Ziele als passende Providerquellen erschließen.** Der echte .195-Lauf liefert fast nur Parks unter Aktivitäten. Die Lonja-Suche liefert zwölf andere Sehenswürdigkeiten: Geoapify verwirft Namensfilter bei mehr als drei Wörtern und kann einen leeren Namenslauf zu allgemeiner Kategoriesuche erweitern. Diese Treffer wurden als spezifische Recherche gewertet. Der Wunsch nach lebendigen Abenden fehlt im Kategorienauftrag.

**Abnahme dieses Schritts:**

- Aktivitäten dürfen nicht allein durch generische leisure-/sport-Elternkategorien oder Parks als abgedeckt gelten.
- Benannte Zielsuche bleibt von generischer Kategoriesuche unterscheidbar; unpassende Treffer erfüllen keinen konkreten Rechercheauftrag.
- Wünsche einschließlich Abendgefühl und selbst ausprobieren erreichen Recherche und unabhängigen Audit vollständig.
- Erst die reproduzierten lokalen Quelle-/Kategoriefehler beheben, danach einen begrenzten echten Folgebeleg ohne wiederholte Gesamtplan-Schleifen.

**Danach:** Nach qualitativer Rechercheabnahme den Familien-/Konfliktfall und die übrigen P17/P19-Gates schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE: Erlebnisrecherche, benannte Ortsidentität, gebietsferne Reserve, Interpretation lebendiger Abende, Familien-/Konfliktfall, breite Kaltstarts, endgültige Konto-/Timeline-Übernahme, Mehrnutzer-Beitritt und physische Geräte.

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
