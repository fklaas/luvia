# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.206**, Core **4.82.325**. P17/P19: App .206 / Core 4.82.325 mit hartem POI-Evidenzgate und begrenzter Hybridrecherche auf Integration veröffentlicht.

**Zuletzt geliefert:** App .206 / Core 4.82.325 ist aus Commit de311c3f28cd1470a79acf02bbf618bd6e75f549 auf Integration-Worker d4a60923-691d-4225-8dd2-c42b20d088bd veröffentlicht. 245/245 Safe Regression und NFR-0 3/3 sind grün. 16 geänderte Laufzeitdateien stimmen auf Stable und Immutable jeweils bytegleich mit dem sauberen Archiv überein (32/32 Vergleiche, 9.708.830 geprüfte Bytes). Archiv 92.758.336 Bytes, SHA-256 A6237DB448316BBA3258E4D9150CCC8A9220AFF36021FD50764B858065631029. Der öffentliche Intelligence-Healthcheck meldet Webrecherche aktiv: Luna, maximal zwei Webaufrufe, ein Recherchelauf je Workflow, fünf je Nutzer/Tag und 100/Tag systemweit. Der echte Valencia-Pool-Replay verwirft Km 0, Local Tour Guide, Parking Ya! und unbelegte generische Kandidaten; Malvarosa-Strand sowie Heron City, Arena Multiespacio und Aqua Multiespacio bleiben korrekt nutzbar. Bereits bestätigte Reiseentwürfe werden nicht still überschrieben.

**Nächster Schritt (AKTIV): Neuen Qualitätsvertrag veröffentlichen und einen frischen Valencia-Gesamtplan belegen.** Die strukturellen Fehler sind im gemeinsamen Owner-Vertrag behoben. Jetzt muss derselbe Stand auf Integration zeigen, dass echte Kandidaten, Kategorienmix, räumliche Streuung, Essenszeiten, Wiederaufnahme und begrenzte Webkosten zusammen funktionieren.

**Abnahme dieses Schritts:**

- Safe Regression vollständig grün; sauberer Integration-Deploy mit immutable Version und Rollback; ein frischer echter Valencia-Lauf ohne Km 0, Touristeninformation, generische Entdeckungsorte oder ungewünschte Parkdominanz, mit Strand/Hafen/Altstadt/weiteren Vierteln sowie gewünschten Aktivitäten, Nachtleben, Einkaufszentrum und Restaurants; bezahlte Webrecherche höchstens einmal je Workflow und bei Wiederaufnahme wiederverwendet.

**Danach:** Den Familien-/Konfliktfall, Mitreisende, Geräte-Wiederaufnahme und die übrigen P17/P19-Gates schließen. M16.5 bleibt bis zu diesen Abnahmen offen; M17 ist die umfassende Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE bis zum frischen öffentlichen Gesamtplan: Familien-/Konfliktfall, Lernen über mehrere Reisen, eingeladene Mitreisende, gebietsferne Reserve im produktiven Tauschfluss, physische iOS-/Android-Abnahme sowie aktuelle Wetter-, Öffnungs-, Preis-, Buchbarkeits-, Event-, Einreise- und Verkehrsbelege. Der im Browser vorhandene teilweise bestätigte Altentwurf bleibt geschützt. M16.5 bleibt offen.

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
