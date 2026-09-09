# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.196**, Core **4.82.315**. P17/P19: A2 auf Integration .196; benannte Zielsuche öffentlich belegt, Aktivitätsquellen und vollständige Erlebnisqualität weiter offen.

**Zuletzt geliefert:** Integration .196 / Core 4.82.315 aus a70ad775 veröffentlicht. Vollständige kontrollierte Regression 243/243 PASS; 27/27 öffentliche Dateien auf Stable und Immutable byteidentisch. Benannte Ortsuchen behalten targetName bis zum Provider und im dauerhaften Pool; Freizeit-/Sport-Elternkategorien, Parks und Sportgeschäfte gelten nicht mehr allein als Aktivitätsbeleg. Öffentliche Namensprobe findet La Lonja de la Seda über TomTom nach leerem Geoapify-Ergebnis in 953 ms. Öffentliche Escape-Room-Probe bleibt ohne Treffer: Geoapify-Transportfehler, OSM-Cooldown, TomTom leer, HERE-Anfragefehler. Dies ist kein positiver Gesamtplan-Nachweis. Der bisherige .195-Entwurf mit sieben Tagen/18 Momenten ist nach öffentlichem Reload weiter vorhanden; seine Inhalte werden nicht als neu verbessert ausgegeben. Kein weiterer kostenpflichtiger Gesamtplan in diesem Slice.

**Nächster Schritt (AKTIV): Aktivitätsquellen bis zum echten passenden Treffer schließen.** Die benannte Zielsuche ist öffentlich korrigiert. Die Aktivitätsprobe fällt noch auf Providertransport und unzureichende Ersatz-Taxonomien zurück; ein weiterer Gesamtplan würde diese Datenlücke nur erneut verarbeiten.

**Abnahme dieses Schritts:**

- Den Geoapify-Transportfehler und die konkreten Ersatzproviderantworten unterscheiden; vorhandene Budgets und Cooldowns respektieren.
- Tatsächliche benannte Aktivitätsangebote in einem begrenzten öffentlichen Suchlauf nachweisen; keine Parks oder generischen Sportflächen als Ersatz zählen.
- Danach genau einen begrenzten echten Gesamtplan mit Strand/Hafen, lebendigen Abenden, Mitmachwunsch und räumlichem Mix beurteilen; keine Schleife bezahlter Gesamtneugenerierungen.
- P17/P19 erst nach weiteren Familien-/Gruppen-, Übernahme-/Recovery- und Geräte-Gates abschließen.

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
