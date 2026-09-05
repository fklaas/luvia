# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv; B1/P02 und P03 sind für den positiven Passend-Realbeleg erneut der aktive Abschlussblock. P09/P10 bleiben teilweise geliefert und werden nach diesem externen Gate fortgesetzt. A1 Dokumentkonsolidierung wird nach jedem Slice fortgeschrieben; A2 ist teilweise belegt.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft auf Integration über Worker 154aa828-e9bd-4dbc-993f-87e34ac40176 bei 100 Prozent Traffic; Gateway v203 / 4.64.20 meldet Places-Health 4.38.1-here-dietary-evidence. HERE-, Google- und Foursquare-Ernährungsbelege, strenge Identitätsverbindung, Steakhouse-Ausschluss und begrenzte Providerbudgets sind implementiert. Sichtbar: Essen & Trinken 50 über HERE; Profil Vegetarisch; Passend 0/0; keine falsche Positivmarkierung. 226/226 Safe Regression und 30/30 öffentliche Bytevergleiche PASS. Sauberes Archiv: 88.755.996 Bytes, SHA-256 5723DC228D90E9689EF9632D126293F5015ACEF627D1D0B1439CC42D34E1F588. Main und Production bleiben unverändert.

**Nächster Schritt (AKTIV): Google Places für den positiven Ernährungsbeleg freischalten und sichtbar abnehmen.** Die Anwendung, der gemeinsame Filtervertrag und die Negativregeln sind grün; aktuell verhindert die Google-403-Berechtigung den praktisch breitesten positiven servesVegetarianFood-Nachweis, während HERE keine lokalen Fakten liefert und Foursquare keine Credits besitzt.

**Abnahme dieses Schritts:**

- Google Places API (New), aktives Billing und API-Key-Beschränkungen im richtigen Google-Cloud-Projekt sind geprüft; der bestehende Server-Key darf ausschließlich die benötigte Places-Suche ausführen.
- Der öffentliche Health-Probe wechselt von HTTP 403 zu einer erfolgreichen, begrenzten Google-Antwort ohne Schlüssel- oder Rohdatenoffenlegung.
- Essen & Trinken zeigt für das vegetarische Profil mindestens einen realen „Passt“-Pin und weiterhin kein unbewiesenes Steakhouse.
- Places, Timeline und AI Chat zeigen für den Treffer dieselbe Provider-ID, denselben Reisezielradius und einen lesbaren providerbelegten Passend-Grund.
- Stable und Immutable Integration, Bytegleichheit, Regression und unveränderter Main-Stand sind belegt.

**Danach:** Danach P09/P10 mit positiven Booking-, Visit- und Memory-Verwaltungswegen; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: positiver Google-Realbeleg sowie vollständige UI-/AI-/Foto- und physische Mobilabnahme. P09/P10 bleiben teilweise: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
