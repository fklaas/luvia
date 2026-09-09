# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.180**, Core **4.82.299**. P17/P19 aktiv und teilweise: Valencia verwendet öffentlich 72 belegte Kandidaten. App .179 nahm den echten Tag-6-Ersatz an, erreichte den Audit, reparierte den belegten zeitlichen Wegekonflikt und erhielt danach die positive Bestätigung für Ziel, Zeitraum, Strand, Shopping, Nachtleben, Erholungspuffer und Wellnessoption. Offen waren nur nicht ausreichend nachgewiesene Vegetarisch-, Kinderwagen- und Bus-/Bahn-Fakten. App .180 / Core .299 stuft diese fehlenden Belege als sichtbare Aufmerksamkeit ein und lässt den strukturell gültigen Entwurf in den Review.

**Zuletzt geliefert:** Die Zahl sichtbarer Reiseaktivitäten ist vom Place-Bestand getrennt. Für 7/14/21 Tage gelten 42/84/126 als Recherche-Mindestziele; ein ergiebiger Stadtpool bleibt pro Sitzung bis 160 erhalten, während die KI nur 32/60/92 priorisierte Kandidaten erhält. Öffentlich wurden 87 Kandidaten in .175 und 72 Kandidaten im aktuellen Valencia-Auftrag belegt. .177 stellte die gezielte starke Ein-Tages-Reparatur her, .178 die eindeutige Datumszuordnung und .179 den fehlenden browserlosen trip_day_repair-Ausgabevalidator. Der öffentliche .179-Lauf hat Tag 6 sowie einen konkreten Wegekonflikt erfolgreich repariert. .180 verhindert, dass bloß fehlende Nachweise den vollständigen Plan erneut regenerieren.

**Nächster Schritt (AKTIV): App .180 vollständig prüfen, ausschließlich auf Integration veröffentlichen und den vorhandenen Valencia-Entwurf in den Review führen.** Der strukturelle Plan und die gezielte Reparatur funktionieren öffentlich. Nur die Formulierung nicht ausreichend nachgewiesen wurde noch als harter Planfehler statt als offene Providerunsicherheit behandelt. Das vollständige lokale Gate ist bestanden.

**Abnahme dieses Schritts:**

- App .180 / Core .299 besteht Safe Regression, NFR-0 und alle fokussierten Schema-, Composer-, M16.5Z- und P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der Valencia-Lauf behält 72 belegte Kandidaten und sieben Reisetage.
- Strand, Shopping, Nachtleben, Erholung und der reparierte Wegekonflikt bleiben im Entwurf erhalten.
- Fehlende Vegetarisch-, Kinderwagen- und Verkehrsnachweise erscheinen als offene Hinweise und lösen keine Neugenerierung aus.
- Der Lauf erreicht den ungespeicherten Review oder einen neuen konkreten terminalen Fehler.

**Danach:** Nach dem öffentlichen .180-Review werden räumliche Streuung und Kategorienmix der sieben Valencia-Tage fachlich abgenommen. Danach wird der große Recherchepool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht. Für 14/21 Tage folgen reale Proben; für 28 Tage und länger folgt eine seitenweise Nachbeschaffung statt eines immer größeren Modellprompts. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .180 öffentlich bis Review oder neuem konkreten terminalen Fehler vermessen; räumliche Streuung und Kategorienmix prüfen; den erhaltenen Pool für Tausch- und Ergänzungsvorschläge öffnen; reale 14-/21-Tage-Pläne und rollende Nachbeschaffung für 28+ Tage prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

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
