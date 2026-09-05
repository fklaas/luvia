# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.88**, Core **4.82.210**. M16.5 Schritte 15–18 aktiv. Der positive P02-Passend-Realbeleg ist geliefert; P02/P03 bleiben für vollständige Filter- und Flächenparität aktiv. Apple ist ohne kostenpflichtige Mitgliedschaft geparkt.

**Zuletzt geliefert:** App 13.82.168.88 / Core 4.82.210 läuft aus Commit 51a2f174 auf Integration-Worker 81e43a21. Gateway v206 liefert über den kostenlosen, budgetierten OpenStreetMap-Evidenzpfad 25 vegetarisch oder vegan belegte Scharbeutz-Orte. Sichtbar wurden Alle 50, Passend 25, Passt-Pins, Zoom, Pinwechsel und Detail-Score bedient; Erdmann’s Kleines Steakhaus fehlt korrekt. 229/229 Safe Regression, NFR-0 3/3 und 30/30 Bytebelege sind grün. Apple, Main und Production blieben unverändert.

**Nächster Schritt (AKTIV): Passend-ID und Begründung in Timeline und AI Chat sichtbar angleichen.** Die Places-Karte liefert den positiven Realbeleg; jetzt müssen alle Place-verwendenden Oberflächen nachweisen, dass sie exakt denselben Kandidaten und denselben providerbelegten Profilgrund verwenden.

**Abnahme dieses Schritts:**

- Ein öffentlich sichtbarer Passend-Ort aus Places erscheint in Timeline-Vorschlägen und AI Chat mit derselben kanonischen Provider-ID.
- Der vegetarische oder vegane Passend-Grund bleibt providerbelegt und wird in allen drei Oberflächen gleich und verständlich formuliert.
- Timeline und AI Chat starten keine getrennte Place-Suche und verändern weder Kategorie, Entfernung noch Profilfakten.
- Stay belegt dieselbe technische Provider-, Karten-, Filter-, Cache- und Kostenschutzarchitektur für Unterkunftsmerkmale.
- Safe Regression, NFR-0, öffentliche Bytegleichheit und sichtbare Bedienung bleiben grün; Main und Production bleiben unverändert.

**Danach:** Danach folgt die vollständige öffentliche Kategorie-/Filtermatrix für P02/P03; anschließend der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme.

**Weiter offen:** P02/P03 aktiv: Flächenparität in Timeline, AI Chat und Stay sowie vollständige Kategorie-/Filtermatrix; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist bis zu einem späteren ausdrücklichen Bezahl- und iOS-Veröffentlichungsentscheid geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen: Die Supabase-Free-Plan-Schonfrist wegen des Egress-Overruns im vorherigen Zyklus endet am 07.09.2026; der aktuelle Zyklus 23.08.–23.09.2026 lag zuletzt bei 2,359/5 GB Egress und 63.540/500.000 Edge-Function-Aufrufen.

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
