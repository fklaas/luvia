# Aktueller Ausführungsplan P01 bis P50

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.176**, Core **4.82.295**. P17/P19 aktiv und teilweise: App .176 / Core .295 ist lokal implementiert und mit 132 Composer-, 99/99 P19-, 240/240 Safe-Regression- sowie NFR-0 3/3-Prüfungen vollständig grün. Der öffentliche .175-Valencia-Lauf fand in rund 21 Sekunden 87 passende Places, blieb danach jedoch länger als 3:16 Minuten an einem Workflow-Checkpoint hängen. .176 rendert die Tageskomposition sofort nach abgeschlossener Places-Recherche, behandelt langsame Checkpoints als fortsetzbaren Hintergrundhinweis und schützt den größeren lokalen Kandidatenpool vor einem kleineren Server-Zwischenstand.

**Zuletzt geliefert:** Die Zahl sichtbarer Reiseaktivitäten ist jetzt ausdrücklich vom Place-Bestand getrennt. Für 7/14/21 Tage gelten 42/84/126 als Recherche-Mindestziele; ein ergiebiger Stadtpool bleibt pro Sitzung bis 160 erhalten, während die kostenrelevante KI nur 32/60/92 räumlich und fachlich priorisierte Kandidaten erhält. App .175 belegte öffentlich 87 Valencia-Kandidaten nach rund 21 Sekunden. .176 korrigiert die Fortschrittsanzeige, zeigt nach erreichtem Mindestziel sofort die Tageskomposition, begrenzt Workflow-Lesen, -Anlegen und -Checkpointen von außen und speichert serverseitig nur den Kompositionskatalog.

**Nächster Schritt (AKTIV): App .176 vollständig prüfen, ausschließlich auf Integration veröffentlichen und Valencia erneut bis zum terminalen Ergebnis vermessen.** Die breite Places-Recherche ist öffentlich schnell und mit 87 Kandidaten belegt. Der danach blockierende Workflow-Checkpoint muss in .176 sichtbar begrenzt sein, damit die Tageskomposition innerhalb einer nachvollziehbaren Zeit beginnt und bis Review oder konkretem Fehler fortgesetzt wird.

**Abnahme dieses Schritts:**

- App .176 / Core .295 besteht Safe Regression, NFR-0 und alle fokussierten Composer-/P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der Valencia-Lauf zeigt bei einem reichen Pool ein erreichtes Mindestziel statt einer widersprüchlichen niedrigeren Zielzahl.
- Nach Ende der höchstens 44 Sekunden langen Places-Recherche erscheint die Tageskomposition sofort; ein langsamer Abschluss-Checkpoint blockiert den sichtbaren Phasenwechsel nicht.
- Ein größerer lokaler Recherchepool wird nicht durch einen kleineren Server-Katalog ersetzt und nur die begrenzte Kompositionsauswahl wird an Modell und Workflow übergeben.
- Der Lauf erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler ohne verborgenen Dauerzustand.

**Danach:** Nach dem öffentlichen .176-Nachweis werden räumliche Streuung, Strandabdeckung und Kategorienmix der gewählten Valencia-Tage fachlich abgenommen. Anschließend wird der große Recherchepool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht und es folgen reale 14-/21-Tage-Proben. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .176 öffentlich bis Review oder konkretem terminalen Fehler vermessen; räumliche Streuung, Strandabdeckung und Kategorienmix prüfen; den erhaltenen Pool für Tausch- und Ergänzungsvorschläge öffnen; lange 14-/21-Tage-Pläne öffentlich prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
