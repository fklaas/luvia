# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.94**, Core **4.82.213**. M16.5 Schritte 15–18 aktiv. P02 Passend ist öffentlich stabil; der P03 Cross-Surface-Slice steht als App .94 / Core 4.82.213 unmittelbar vor seiner öffentlichen AI-Chat-Abnahme. Apple bleibt geparkt.

**Zuletzt geliefert:** Auf App .93 sind Places und Timeline sichtbar auf derselben aktiven Place-Kohorte: 11 vegetarisch belegte Passend-Pins, kein Steakhouse-Falschpositiv, dieselbe kanonische HERE-ID und derselbe lesbare Profilgrund bei null zusätzlichen Timeline-Provider-Reads. App .94 ergänzt den fehlenden lokalen Chat-Intent für den realen Satz mit flektiertem „vegetarische Restaurants“; fokussierte P03-, Semantik-, Orchestrierungs-, Release-, Inventur- und NFR-0-Gates sind grün.

**Nächster Schritt (AKTIV): App .94 veröffentlichen und dieselbe Passend-ID im AI Chat sichtbar belegen.** Der letzte reale Gegenbeleg lag nur noch im lokalen Fallback des Chats: Ohne Live-KI wurde „vegetarische Restaurants“ wegen deutscher Flexion nicht als Places-Read erkannt. Der Kandidat behebt genau diese Lücke.

**Abnahme dieses Schritts:**

- Der öffentliche Integration-Chat verarbeitet den exakten Satz „Zeig mir passende vegetarische Restaurants in Scharbeutz.“ auch bei nicht verfügbarer Live-KI als lokalen sicheren Places-Read.
- Places, Timeline und AI Chat zeigen mindestens eine identische kanonische Place-/Provider-ID und denselben lesbaren vegetarischen Passend-Grund.
- AI Chat weist für die wiederverwendete aktive Place-Kohorte Provider-Read-Zähler 0 aus.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; weder Chat noch Timeline erfinden eine Passung.
- Safe Regression 230/230, NFR-0 3/3, Stable/Immutable-Asset-Identität und Rückfallarchiv sind grün.

**Danach:** Nach dem öffentlichen P03-Beleg wird die offene P02/P03-Vollständigkeit für alle Kategorien, Landes- und Sachfilter, echte Ortsbilder und Providerquoten geschlossen.

**Weiter offen:** P02 bleibt teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P03 ist bis zum öffentlichen Chat-Beleg aktiv. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert.

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
