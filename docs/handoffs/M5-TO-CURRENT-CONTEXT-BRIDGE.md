# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.179**, Core **4.82.298**. P17/P19 aktiv und teilweise: Der öffentliche Valencia-Lauf belegt 72 passende Places, den Übergang in die Tageskomposition nach rund 30 Sekunden und die gezielte starke Tag-6-Reparatur. Der öffentliche .178-Nachtest zeigte nach rund 20 Sekunden Details verbessern, endete nach rund 56 Sekunden aber erneut mit Tag 6 nicht geliefert. Die Root-Cause ist nun im Browser-Validator belegt: trip_day_repair fiel mangels eigenem Validierungszweig in das allgemeine Antwortschema und verlor days. App .179 / Core .298 erhält diese Tagesdaten vollständig; das vollständige lokale Gate mit 240/240 Safe Regression und NFR-0 3/3 ist grün.

**Zuletzt geliefert:** Die Zahl sichtbarer Reiseaktivitäten ist vom Place-Bestand getrennt. Für 7/14/21 Tage gelten 42/84/126 als Recherche-Mindestziele; ein ergiebiger Stadtpool bleibt pro Sitzung bis 160 erhalten, während die KI nur 32/60/92 priorisierte Kandidaten erhält. Öffentlich wurden 87 Kandidaten in .175 und 72 Kandidaten plus korrekter Phasenwechsel nach rund 30 Sekunden in .176 belegt. .177 stellte die gezielte starke Ein-Tages-Reparatur her, .178 die eindeutige Datumszuordnung. .179 ergänzt den fehlenden browserlosen trip_day_repair-Ausgabevalidator, damit der echte strukturierte Ersatz-Tag nicht mehr vor der Datumszuordnung verloren geht.

**Nächster Schritt (AKTIV): App .179 vollständig prüfen, ausschließlich auf Integration veröffentlichen und Valencia bis Review oder neuem konkreten Fehler verfolgen.** Der öffentliche .178-Lauf hat den fehlenden Browser-Validator für trip_day_repair als Root-Cause offengelegt. .179 erhält das strukturierte days-Array und reicht es an die eindeutige Tag-6-Normalisierung weiter.

**Abnahme dieses Schritts:**

- App .179 / Core .298 besteht Safe Regression, NFR-0 und alle fokussierten Schema-, Intelligence-Core-, Composer-, M16.5Z- und P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der Valencia-Lauf behält den reichen 72er-Pool und alle bereits gültigen Tage.
- Die sichtbare Wiederholung nutzt nur trip.compose-day-repair für Tag 6.
- Der Browser-Validator erhält den einen strukturierten Ersatz-Tag samt Einträgen und Freiraum.
- Ein fehlendes oder abweichendes Datum wird nur bei genau einem angeforderten und genau einem gelieferten Reparaturtag normalisiert.
- Der Lauf erreicht den ungespeicherten Review oder einen neuen konkreten sichtbaren terminalen Fehler ohne erneute Vollkomposition.

**Danach:** Nach dem öffentlichen .179-Reparaturnachweis werden räumliche Streuung, Strandabdeckung und Kategorienmix der gewählten Valencia-Tage fachlich abgenommen. Danach wird der große Recherchepool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht. Für 14/21 Tage folgen reale Proben; für 28 Tage und länger folgt eine seitenweise Nachbeschaffung statt eines immer größeren Modellprompts. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .179 öffentlich bis Review oder neuem konkreten terminalen Fehler vermessen; räumliche Streuung, Strandabdeckung und Kategorienmix prüfen; den erhaltenen Pool für Tausch- und Ergänzungsvorschläge öffnen; reale 14-/21-Tage-Pläne und rollende Nachbeschaffung für 28+ Tage prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

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
