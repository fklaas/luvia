# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.111**, Core **4.82.230**. M16.5 Schritte 15–18: P09/P10 sind intern abgeschlossen und als App .111 / Core .230 vor dem Rücksprung sichtbar sowie reproduzierbar belegt worden. Stable Integration läuft wieder auf dem akzeptierten App-.104-Worker; Main und Production blieben unverändert. Direkte Timeline und AI Chat teilen Places Visit Owner; generische Titel werden lokal aufgelöst und mehrere gleich benannte bestätigte Besuche verlangen eine explizite Ordinalauswahl. Nur die physische iOS-/Android-Abnahme bleibt als Gerätegate. P11 ist jetzt AKTIV.

**Zuletzt geliefert:** P09/P10: bestätigte Besuche lassen sich in Timeline und AI Chat über denselben Places Visit Owner korrigieren, entfernen und per dauerhaftem Recovery-Beleg wiederherstellen. Unicode-sichere Befehle, lokale Place-Identität ohne Providerkontingent, konkrete Fehlerprojektion, Visit-Deduplizierung und explizite Auswahl gleich benannter Besuche sind belegt. Sichtbar wurden Mehrdeutigkeitsfehler, positive Ordinal-Vorschau und abgebrochene Nullmutation geprüft. Der Katalog umfasst 333 semantische Aktionen, 30 typisierte Runtime-Aktionen, 249 öffentliche Owner-Bindungen und 2.764 Fehlerauswertungen. Safe Regression 233/233, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): Routenunsicherheit und bestätigten Zeitpuffer liefern.** Geh- und Fahrradrouten sind bereits providerübergreifend vorhanden. Der nächste klar abgrenzbare P-Block macht ihre zeitliche Unsicherheit, Quellenfrische und fehlende Live-Daten verständlich und lässt einen empfohlenen Puffer nur über einen bestätigten Journey-Befehl in die Timeline einfließen.

**Abnahme dieses Schritts:**

- Geh-, Fahrrad- und unterstützte ÖPNV-/Fahrtrouten zeigen erwartete Dauer, realistische Bandbreite, Quelle, Messzeit und Datenalter; fehlende Live-Daten werden als unbekannt ausgewiesen.
- Wetter, Saison, Tageszeit, Mobilitätsmodus und belegte Streckenmerkmale beeinflussen die Bandbreite nur mit sichtbarer Herkunft; Luvia erfindet weder Verkehr noch Barrierefreiheit.
- Ein Zeitpuffer wird zunächst als lesbare Vorher/Neu-Vorschau angeboten und erst nach ausdrücklicher Bestätigung idempotent über journey.v1 gespeichert; Ablehnung und veraltete Revision verändern die Timeline nicht.
- Timeline, Places-Karte und AI Chat verwenden denselben Routen- und Pufferbeleg sowie dieselbe Fehler- und Recovery-Sprache.
- Der Slice besteht gezielte Core-, Owner-, Fehler- und sichtbare mobile Browserabnahmen sowie Safe Regression und NFR-0.

**Danach:** Danach folgen P12 Tagesprobe und der gebündelte P12/P15/P17 Trip Composer mit tageweiser Reisepräsentation, Alternativen und bestätigter Übernahme.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10 sind intern belegt und nur für physische iOS-/Android-Abnahme begrenzt. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
