# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.177**, Core **4.82.296**. P17/P19 aktiv und teilweise: Der öffentliche .176-Valencia-Lauf belegt 72 passende Places und den sichtbaren Übergang in die Tageskomposition nach rund 30 Sekunden. Er endete nach 84 Sekunden konkret mit einem unvollständigen Tag 6; der bisherige Wiederholungsweg startete unnötig eine ganze Reise neu und traf das 50-Sekunden-Zeitlimit. App .177 / Core .296 bewahrt jetzt die gültigen Tage und repariert nur den einen fehlerhaften Tag auf der stärksten Qualitätsstufe einschließlich verlorener Wunschkategorien. 132 Composer-, 99/99 P19-, 240/240 Safe-Regression- und NFR-0 3/3-Prüfungen sind grün.

**Zuletzt geliefert:** Die Zahl sichtbarer Reiseaktivitäten ist vom Place-Bestand getrennt. Für 7/14/21 Tage gelten 42/84/126 als Recherche-Mindestziele; ein ergiebiger Stadtpool bleibt pro Sitzung bis 160 erhalten, während die KI nur 32/60/92 priorisierte Kandidaten erhält. Öffentlich wurden 87 Kandidaten in .175 und 72 Kandidaten plus korrekter Phasenwechsel nach rund 30 Sekunden in .176 belegt. .177 ergänzt eine gezielte starke Ein-Tages-Reparatur: gültige Tage bleiben erhalten, bereits verwendete Places werden ausgeschlossen und fehlende oder vom ersetzten Tag getragene Wunschkategorien werden im Reparaturkatalog und Auftrag priorisiert.

**Nächster Schritt (AKTIV): App .177 vollständig prüfen, ausschließlich auf Integration veröffentlichen und den gespeicherten Valencia-Tag gezielt reparieren.** Places-Breite und Phasenwechsel sind öffentlich belegt. Offen ist der konkrete Tag-6-Vertrag: Ein sichtbarer Wiederholungsversuch muss jetzt nur den fehlenden Tag stark reparieren, statt die gesamte Reise erneut in ein 50-Sekunden-Zeitlimit zu schicken.

**Abnahme dieses Schritts:**

- App .177 / Core .296 besteht Safe Regression, NFR-0 und alle fokussierten Composer-/P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der Valencia-Lauf zeigt bei einem reichen Pool ein erreichtes Mindestziel statt einer widersprüchlichen niedrigeren Zielzahl.
- Nach Ende der höchstens 44 Sekunden langen Places-Recherche erscheint die Tageskomposition sofort; ein langsamer Abschluss-Checkpoint blockiert den sichtbaren Phasenwechsel nicht.
- Ein größerer lokaler Recherchepool wird nicht durch einen kleineren Server-Katalog ersetzt und nur die begrenzte Kompositionsauswahl wird an Modell und Workflow übergeben.
- Bei genau einem unvollständigen Tag bleiben alle anderen Tage und der große Places-Pool erhalten.
- Die starke Wiederholung verwendet trip.compose-day-repair für den betroffenen Tag und priorisiert die durch diesen Tag fehlenden Wunschkategorien.
- Der Lauf erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler ohne erneute Vollkomposition.

**Danach:** Nach dem öffentlichen .177-Reparaturnachweis werden räumliche Streuung, Strandabdeckung und Kategorienmix der gewählten Valencia-Tage fachlich abgenommen. Anschließend wird der große Recherchepool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht und es folgen reale 14-/21-Tage-Proben. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .177 öffentlich bis Review oder konkretem terminalen Fehler vermessen; räumliche Streuung, Strandabdeckung und Kategorienmix prüfen; den erhaltenen Pool für Tausch- und Ergänzungsvorschläge öffnen; lange 14-/21-Tage-Pläne öffentlich prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
