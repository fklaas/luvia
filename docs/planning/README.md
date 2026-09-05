# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.87**, Core **4.82.209**. M16.5 Schritte 15–18 aktiv. P02/P03 ist der aktive Abschlussblock für den positiven Passend-Realbeleg. Apple ist ohne kostenpflichtige Mitgliedschaft geparkt und aus dem aktiven Plan entfernt.

**Zuletzt geliefert:** Der Integrationskandidat 13.82.168.87 / Core 4.82.209 ist gebaut. Er nutzt Geoapify/OSM zuerst für belegte vegetarische und vegane Passung und greift erst bei einem echten Nullergebnis auf HERE sowie die begrenzten Google-/Foursquare-Wege zurück. Alle bleibt breit; Steakhouse- und Identitätsregeln bleiben streng. Die gezielten Tests und die aktualisierten statischen Inventargates sind grün. Öffentlich läuft bis zur Abnahme weiterhin App .86 auf Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2; Gateway v205 bleibt aktiv. Apple bleibt deaktiviert und auf späteren ausdrücklichen Entscheid geparkt.

**Nächster Schritt (AKTIV): Kostenlose Passend-Evidenz veröffentlichen und sichtbar abnehmen.** Der gemeinsame Datenpfad ist korrigiert; jetzt muss der echte angemeldete Scharbeutz-Fall beweisen, dass Geoapify/OSM einen positiven, belastbaren Treffer liefert und keine falschen Orte zulässt.

**Abnahme dieses Schritts:**

- App 13.82.168.87 / Core 4.82.209 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle zeigt in Essen & Trinken weiterhin den breiten realen Place-Bestand ohne zusätzliche kostenpflichtige Ernährungsabfragen.
- Passend zeigt mindestens einen echten Ort mit vegetarischer oder veganer Provider-Evidenz oder weist einen realen lokalen Nullbestand mitsamt verwendeter Quellen eindeutig aus.
- Erdmann’s Kleines Steakhaus und andere fleischzentrierte Orte ohne dedizierten Ernährungsbeleg erscheinen nicht als passend.
- Ein sichtbarer Browserlauf belegt Quelle, Trefferzahl, Pin-Identität und Karteninteraktion; Safe Regression und öffentliche Asset-Identität sind grün.
- Main, Production, Apple-Policy, Provider-Secrets und Nutzerdaten bleiben unverändert.

**Danach:** Nach dem positiven Places-Beleg dieselbe Place-ID und denselben Grund in Stay, Timeline-Vorschlägen und AI Chat abnehmen; danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme.

**Weiter offen:** P02/P03 aktiv: sichtbarer positiver Ernährungsevidenz-Beleg und danach Flächenparität; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist bis zu einem späteren ausdrücklichen Bezahl- und iOS-Veröffentlichungsentscheid geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen: Die Supabase-Free-Plan-Schonfrist wegen des Egress-Overruns im vorherigen Zyklus endet am 07.09.2026; der aktuelle Zyklus 23.08.–23.09.2026 lag zuletzt bei 2,359/5 GB Egress und 63.540/500.000 Edge-Function-Aufrufen.

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
