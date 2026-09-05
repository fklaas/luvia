# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.69**, Core **4.82.191**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung ist abgeschlossen und wird nach jedem Slice fortgeschrieben; A2 Ende-zu-Ende-Abnahme ist teilweise belegt; A3/P09 und A4/P10 bleiben teilweise umgesetzt.

**Zuletzt geliefert:** App .69 / Core 4.82.191 und Gateway v182 schließen den aktuellen Primärküchen-Belegs- und Cache-Slice. Strikte Landesküchenfilter akzeptieren nur die primäre Küchenart des Providers; der Beleg erreicht places.v1 und alte Kandidatenmengen werden über Cache v7 verworfen. Automatisiert sind alle 19 Landesküchen grün. Sichtbar bestanden Chinesisch mit Hay-Cheng 1/1, Zoom in einen engeren Ausschnitt mit ehrlichem 0/0-Nullfall und die Rückkehr zum Reiseziel mit wiederhergestelltem 1/1-Filterzustand. Spanisch liefert reproduzierbar sieben HERE-Treffer; die auf das reale 50er-App-Fenster angeglichene Gatewaydiagnose belegt dieselben sieben primären HERE-Küchenarten und widerlegt die frühere 3er-Annahme aus einem abgeschnittenen 20er-Fenster. 222/222 Safe Regression, 30/30 öffentliche Dateien und das unveränderliche Releasearchiv sind belegt. Der gemeinsame Place-Intelligence-/Trip-Composer-Entwurf bleibt in allen aktiven Fahrplänen verankert.

**Nächster Schritt (AKTIV): Reale Vollmatrix aller Filter, Fotos und mobilen Startzeiten schließen.** Primäre Providerbelege, die automatisierte 19er-Landesküchenmatrix sowie die sichtbare Chinesisch-/Spanisch-/Viewport-Kontinuität sind öffentlich belegt. Offen sind die positive sichtbare Vollabnahme der übrigen Filter und Landesküchen, die zweite Quellenprüfung überraschender Providerklassifikationen, korrekte Passend-Begründungen, eine deutlich breitere echte Bildabdeckung sowie reproduzierbare Kalt- und Warmstartzeiten auf mobilen Geräten.

**Abnahme dieses Schritts:**

- Alle 19 Landesküchen sowie jede sichtbare Kategorie-, Untertyp- und Faktenfilteroption funktionieren über UI und AI Chat positiv oder liefern einen providerbelegten, verständlichen Nullfall; Kombination und Reset werden mitgeprüft.
- Alle und Passend verwenden dieselbe Kandidatenmenge und ausschließlich belegte Profilmerkmale. Ein vegetarisches Profil erhält positive passende Orte; ein fleischzentriertes Steakhouse wird ohne konkrete vegetarische Angebotsevidenz nicht als passend markiert.
- Places, Stays, Timeline-Vorschläge und AI Chat erklären bei denselben Eingaben dieselben kanonischen Place-Identitäten, Filter und Providerbelege.
- Jede Detailkarte versucht ein exakt zum realen Ort gehörendes Bild mit Attribution; Trefferquote, ehrliche Bildlücke und Ablehnung benachbarter oder namensfremder Medien werden protokolliert.
- Desktop, Mehrtab-Warmstart und physisches Mobilgerät werden für ersten Kartenstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel, Cache-/Provider-Spur und sichtbare Pin-Zeit reproduzierbar gemessen.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit den positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente schließen; anschließend P12/P15/P17 den gemeinsamen Trip Composer mit Reisestart, Geführt, Schnellstart, KI-Entwurf und Vormerken umsetzen.

**Weiter offen:** P02/P03: sichtbare Vollabnahme der noch offenen Landesküchen und aller Filter über UI/AI Chat, zweite Quellenprüfung überraschender Providerklassifikationen, positive vegetarische Profilevidenz, breite echte Place-Fotos und mobile Startzeiten. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
