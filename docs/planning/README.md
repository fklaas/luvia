# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.181**, Core **4.82.300**. P17/P19 aktiv: Die öffentliche .180-Ausgabe ist byteidentisch, der gespeicherte Valencia-Entwurf bleibt erhalten, aber zwei Wiederanläufe meldeten die Integration-Intelligence unmittelbar als nicht verfügbar. Parallel beseitigt App .181 / Core .300 die feste 160-Places-Grenze. Recherchepool, erhaltene Reserve und KI-Arbeitsauswahl skalieren nun mit 7/14/21/28/42 Tagen; ein kontrollierter 28-Tage-Lauf hält 240 unterschiedliche Places und verarbeitet 180 Kandidaten im Intelligence-Vertrag.

**Zuletzt geliefert:** App .180 ist ausschließlich auf Integration veröffentlicht: Commit 27c47eb985a898acc89ea72b8c72541eabe6c4dd, Worker c0257fad-70be-46c3-a333-6ca6fb5194fe, Archiv 92.644.697 Bytes, SHA-256 6AA9F78ECEDD597054BFBAE687AF039B97CAEB69E088ECCBA9551A8CDC5D4E80 und 22/22 öffentliche Dateien byteidentisch. .180 behandelt nicht ausreichend nachgewiesene Live-Fakten als Aufmerksamkeit. App .181 entfernt zusätzlich die feste 160er-Grenze, führt dauerabhängige räumliche Seiten ein und kennzeichnet die Zahlen im Review als Entwurfsmenge statt Stadtbestand.

**Nächster Schritt (AKTIV): App .181 vollständig prüfen, ausschließlich auf Integration veröffentlichen und lange Place-Pools öffentlich belegen.** 17 eingeplante Reisemomente wurden als mutmaßlicher Valencia-Gesamtbestand verstanden; zusätzlich schnitt die Sitzung längere Reisen technisch bei 160 Kandidaten ab.

**Abnahme dieses Schritts:**

- Der Review trennt eingeplante Reisemomente, den reisespezifisch recherchierten Pool und den nicht behaupteten Gesamtbestand des Reiseziels.
- 7/14/21/28/42 Tage skalieren auf 42/84/126/168/252 recherchierte Kandidatenziele.
- Mindestens ein 28-Tage-Test hält mehr als 160 eindeutige Places und übergibt mehr als 160 Kandidaten durch den Intelligence-Vertrag.
- Räumliche Folgeseiten schließen bereits gefundene Provider-IDs aus und erweitern die Gebietsabdeckung.
- App .181 / Core .300 besteht Safe Regression, NFR-0, Composer-, P19-, Structured-Output-, Planungs- und Visual-Gates.
- Nur Integration wird veröffentlicht; Stable und immutable liefern die geprüften Dateien byteidentisch.
- Der öffentliche Valencia-Lauf erreicht Review oder dokumentiert einen neuen konkreten terminalen Providerfehler, ohne den gespeicherten Plan zu verlieren.

**Danach:** Nach .181 werden der erhaltene Reservepool für gezielten Tausch, Ergänzungen, spontane Vorschläge und Mehr-davon nutzbar gemacht sowie räumliche Streuung und Kategorienmix öffentlich abgenommen. Für sehr lange Reisen folgt anschließend die segmentierte KI-Komposition, damit nicht ein riesiger Prompt alle Wochen gleichzeitig tragen muss. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .181 öffentlich prüfen; die derzeit nicht verfügbare Integration-Intelligence erneut vermessen; Reservepool als echte Tausch-/Ergänzungsquelle öffnen; räumliche Streuung und Kategorienmix abnehmen; sehr lange Reisen in Wochenabschnitte komponieren und anschließend ganzheitlich auditieren. Autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

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
