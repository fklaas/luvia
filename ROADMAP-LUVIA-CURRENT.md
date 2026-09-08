# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.175**, Core **4.82.294**. P17/P19 aktiv und teilweise: App .175 / Core .294 ist lokal implementiert und mit 131 Composer-, 93/93 P19-, 240/240 Safe-Regression- sowie NFR-0 3/3-Prüfungen vollständig grün. Integration-Intelligence 4.42.1 ist öffentlich und führte den echten Valencia-Auftrag bis zu den Datumsvorschlägen; App .174 blieb danach mehr als 5:44 Minuten in der seriellen Places-Recherche. .175 begrenzt diese Recherche auf ein gemeinsames 44-Sekunden-Budget und beseitigt die künstliche Kappung am Zielwert. Main, Production und produktive Intelligence bleiben unverändert.

**Zuletzt geliefert:** Für Valencia und andere große Ziele sind 42/84/126 Kandidaten für 7/14/21 Tage nun Mindestziele. Liefert die Recherche mehr, bleiben bis zu 160 eindeutige Kandidaten in der Sitzung erhalten. Das ist eine technische Arbeitssicherheitsgrenze und keine Behauptung über den Gesamtbestand einer Stadt. Die kostenrelevante KI-Komposition bleibt getrennt auf 32/60/92 räumlich und fachlich priorisierte Kandidaten begrenzt. Im Review stehen die Zahl der eingeplanten Reisemomente und die Zahl der geprüften Places sichtbar nebeneinander. Die Places-Recherche arbeitet mit einer gemeinsamen 44-Sekunden-Frist, schneller Geoapify-Breite und Auto-Provider nur bei einer fehlenden ausdrücklich gewünschten Kategorie.

**Nächster Schritt (AKTIV): App .175 vollständig prüfen, nur auf Integration veröffentlichen und Valencia bis zum terminalen Ergebnis vermessen.** Der reale Auftrag erreicht mit Intelligence 4.42.1 die Places-Phase, blieb in App .174 dort aber länger als 5:44 Minuten. .175 muss öffentlich beweisen, dass der größere, nicht am Zielwert abgeschnittene Kandidatenpool innerhalb der gemeinsamen Recherchefrist in Komposition oder einen konkreten terminalen Fehler übergeht.

**Abnahme dieses Schritts:**

- App .175 / Core .294 besteht vollständige Safe Regression, NFR-0 und alle fokussierten Composer-/P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der frische Valencia-Auftrag verlässt die Places-Recherche innerhalb des gemeinsamen 44-Sekunden-Budgets zuzüglich Abschluss-Checkpoint oder zeigt einen konkreten terminalen Fehler statt endlos weiterzulaufen.
- Der Sieben-Tage-Lauf recherchiert deutlich mehr als 21 eindeutige Kandidaten oder benennt eine echte Provider-Unterdeckung; ein ergiebiger Pool wird nicht bei 42 abgeschnitten.
- Meer/Strand, Shopping, Nachtleben und Essen werden als ausdrückliche Wünsche priorisiert; acht Grundkategorien und räumliche Sektoren bleiben im Recherchevertrag.
- Der Review unterscheidet sichtbar zwischen eingeplanten Reisemomenten und geprüften Places und erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler.

**Danach:** Nach dem öffentlichen Valencia-Nachweis werden räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abgenommen und der große Pool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht. Danach folgen autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte. M17 friert die gemeinsame Produktsprache und modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .175 öffentlich bis zum Review oder konkreten terminalen Fehler vermessen; räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen; den erhaltenen Kandidatenpool für Tausch- und Ergänzungsvorschläge öffnen; lange 14-/21-Tage-Pläne öffentlich prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration läuft auf **13.82.168.52**, Core **4.82.174**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Die aktive konsolidierte Roadmap ist [Masterfahrplan v6](docs/planning/MASTERFAHRPLAN-v6.md), der messbare Paketstatus steht im [Statusplan](docs/planning/STATUSPLAN-2026-09-04.md).

M0–M16 geschlossen; M16.5 Schritte 15–18 aktiv. B0-Steuerungsgrundlage geschlossen, B1 in Arbeit. P01–P39 bleiben M16.5, P40–P50 späteren Gates zugeordnet. Es folgt M17 gemeinsamer Designrollout, M18 Collaboration/Attention/Wallet/Reviews/Admin/Social/Search/Intelligence II, M19 Zuverlässigkeit, M20 echte native Grundlage, M21 native Produktqualität, M21.5 Vollabnahme, M22 gestufter Release.

A1 konsolidiert; A2 besitzt aktuelle begrenzte Such-/Favorit-/Planbelege. Entfernen/Wiederherstellen nach Reload ist in P09 seit .47 begrenzt belegt. Nächster Abschnitt: Timeline-Momente verbinden und mehrere Einträge geordnet verschieben; danach weitere P09/P10-Lücken und die vollständige B1-Abnahme. Echte Bilder und Partnerzugang laufen begleitend. Main-Frontend unverändert; der bestehende gemeinsame Booking-Resolver ist Function v18. Die vollständigen M18-Blueprints und alle P-Pakete sind im neuen Master erhalten. Der [vorherige Roadmaptext](docs/planning/archive/2026-09-04-before-consolidation/ROADMAP-LUVIA-CURRENT.md) bleibt historische Evidenz.
