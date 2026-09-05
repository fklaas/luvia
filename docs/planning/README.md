# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.62**, Core **4.82.184**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .62 / Core 4.82.184 veröffentlicht die gemeinsame Timeline-/Places-/Stays-Kartenprojektion. Ein belegter Teilstand bleibt bedienbar und wird im Hintergrund ergänzt; providerübergreifende IDs und übliche Namensvarianten desselben realen Orts werden zusammengeführt. Sichtbar bestanden Timeline vier eindeutige Karten/vier Pins, der 0,22-s-Bearbeitungsmodus sowie Places und Stays mit je 50 Pins, Alle/Passend und 3 km um Scharbeutz. 221/221 Safe Regression und 30/30 öffentliche Dateien sind belegt. Die gemeinsame Place-Intelligence-/Trip-Composer-Entscheidung ist in alle aktiven Fahrpläne aufgenommen.

**Nächster Schritt (AKTIV): Nachtleben und reale Filter-/Foto-Matrix providerübergreifend schließen.** Die gemeinsame Karte und Teilstandskontinuität sind jetzt öffentlich belegt. Offen bleiben die reale Vollständigkeit jeder Kategorie und Filteroption, besonders Nachtleben und Landesküchen, positive Passend-Evidenz, breite echte Place-Fotos sowie der mobile Kalt-/Warmstart und die deterministische Chat-Navigation zu Places und Stays.

**Abnahme dieses Schritts:**

- Nachtleben wird für Scharbeutz und Timmendorfer Strand providerübergreifend mit Bars, Pubs, Cocktail- und Weinbars, Lounges, Clubs, Diskotheken, Live-Musik und Casinos gesucht, dedupliziert, gerankt und sichtbar abgenommen.
- Alle 19 Landesküchen sowie jede sichtbare Kategorie-, Untertyp- und Faktenfilteroption werden über UI und AI Chat positiv oder als belegter Nullfall geprüft; Kombination, Reset, Budgetausfall und Wiederholung müssen funktionieren.
- Places, Stays, Timeline und AI Chat verwenden dieselben Place-Identitäten. „Öffne Places“, „Öffne Stays“ und „Öffne Hotels“ werden vor einem optionalen KI-Aufruf deterministisch geroutet.
- Alle und Passend verwenden dieselbe Kandidatenmenge und nur belegte Profilvorlieben. Das vegetarische Profil findet positive belegte Orte und markiert kein fleischzentriertes Steakhouse ohne konkrete vegetarische Angebotsevidenz.
- Jede Detailkarte versucht ein exakt zum realen Place gehörendes Foto mit Attribution; keine Medienquelle darf ein Bild eines nur benachbarten Orts übernehmen.
- Desktop, Mehrtab-Warmstart und physisches Mobilgerät werden mit erstem Kartenstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel, Cache-/Provider-Spur und Ladezeit sichtbar protokolliert.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend P12/P15/P17 den gemeinsamen Trip Composer mit Geführt, Schnellstart, KI-Entwurf und Vormerken als nächsten großen Produktblock umsetzen.

**Weiter offen:** P02/P03: Nachtleben, reale Vollabnahme aller Filter und Landesküchen über UI/AI Chat, positive vegetarische Profilevidenz, breite echte Place-Fotos, deterministische Places-/Stays-Navigation und mobile Startzeit. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
