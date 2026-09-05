# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.92**, Core **4.82.211**. M16.5 Schritte 15–18 aktiv. Der positive P02-Passend-Slice ist öffentlich abgenommen; P03 Cross-Surface-Parität ist jetzt der einzige nächste Arbeitsblock. Apple bleibt geparkt.

**Zuletzt geliefert:** App .92, Gateway v220 und Places 4.38.7-osm-edge-proxy liefern verlässlich 11 belegte passende Orte im gleichen 3-km-Reisezielbereich wie Alle. Sichtbar wurden 50 Alle → 11 Passend → 52 Alle belegt; alle Passend-Pins waren markiert, das Steakhaus ausgeschlossen und Provider-Dubletten erhielten keinen zweiten Passend-Status. Der kostenlose signierte OSM-Pfad nutzt gestaffelte Ausweichinstanzen, Abbruch der Verlierer und sechs Stunden Cache. Stable und immutable Worker stimmen 30/30 mit dem ausgelieferten Commit überein. Safe Regression 229/229 und NFR-0 3/3 sind grün.

**Nächster Schritt (AKTIV): Denselben Passend-Ort in Timeline, AI Chat und Stay belegen.** Places ist wieder stabil. Jetzt muss die vorhandene zentrale Place Intelligence sichtbar beweisen, dass Karte, Timeline, Chat und Unterkunftssuche dieselbe Identität und dieselben Fakten verwenden.

**Abnahme dieses Schritts:**

- Einer der 11 Passend-Orte erscheint in Timeline-Vorschlägen und AI Chat mit derselben kanonischen Place-/Provider-ID.
- Profilfakten, 3-km-Reisezielbereich und lesbarer Passend-Grund stimmen flächenübergreifend überein.
- Timeline und AI Chat lösen keine abweichende parallele Place-Suche oder zweite Matching-Logik aus.
- Stay verwendet dieselbe Provider-, Cache-, Karten- und Fit-Diagnostik und erzeugt keine unbelegten passenden Unterkünfte.
- Safe Regression, NFR-0, öffentliche Asset-Identität und ein sichtbarer Browserbeleg bleiben grün.

**Danach:** Nach dem P03-Cross-Surface-Beleg wird die noch offene vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft aus P02/P03 weiter geschlossen.

**Weiter offen:** P02 bleibt im Gesamtumfang teilweise: vollständige Kategorien, Landes- und Sachfilter, echte Place-Fotos sowie weitere Provider- und Quotenpfade. P03 ist aktiv für Timeline-, AI-Chat- und Stay-Parität. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Apple MapKit bleibt als dokumentierte spätere Option geparkt.

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
