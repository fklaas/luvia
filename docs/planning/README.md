# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.104**, Core **4.82.223**. M16.5 Schritte 15–18 aktiv. App .104 / Core .223 ist der vollständig veröffentlichte P02/P03-Kategorie-, Landesküchen- und identitätsgebundene Medienabschnitt. P02/P03 bleiben teilweise, bis Google serverseitig freigegeben, die breite reale Bildquote gemessen und die physische Touchabnahme geschlossen ist.

**Zuletzt geliefert:** Release .104 erweitert den gemeinsamen Places Owner um 14 Diagnosepfade, 19 Landesküchen und exakte ausgewählte Medien. 33/33 öffentliche Matrixpfade sind grün. Sichtbar funktionieren Food 48/9 ohne Steakhouse-Passung, Shopping 46/11, Chinesisch mit Hay-Cheng, 46 Pins nach Zoom und das echte Snykrode-Bild. 233/233 Regression, NFR-0 3/3 und 30/30 Byteidentität sind belegt.

**Nächster Schritt (AKTIV): Google-Berechtigung, reale Bildquote und physische Touchabnahme schließen.** Kategorie-, Küchen-, Passend- und Zoomlogik sind öffentlich grün. Der Google-Key erreicht places.googleapis.com, erhält aber PERMISSION_DENIED; deshalb fehlen bei vielen Orten weiterhin echte Fotos. Zudem fehlt noch der reproduzierbare Kaltstart auf realem iOS und Android.

**Abnahme dieses Schritts:**

- Der vorhandene Google-Key ist im richtigen Cloud-Projekt für Places API (New), Text Search (New) und Place Photos (New) serverseitig berechtigt; eine exakte Namens- und Koordinatenverknüpfung sowie der zugehörige Fotoload antworten positiv und bleiben in den getrennten 800/Monat-Budgets.
- Für alle 13 Places-Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild trägt exakte oder verifiziert verknüpfte Entitätsreferenz, Herkunft, Lizenz und Fallbackstatus. Fremd- und generische Stockbilder bleiben ausgeschlossen.
- Die 82 Zuordnungen, 19 Landesküchen und Sachfilter werden auf kompaktem Touch für positive, negative, leere, kombinierte und teilweise Providerfälle wiederholt; Kategorienwechsel, Passend, Pinvordergrund, Ziehen und Zoomen bleiben bedienbar.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand und laden ein exakt zugeordnetes Detailbild, sofern die Ortsquelle eines anbietet.
- Passend und Medien bleiben identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Safe Regression, NFR-0, sichtbare Browserabnahme, öffentliche Matrix und Byteidentität bleiben grün.

**Danach:** Danach folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert.

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
