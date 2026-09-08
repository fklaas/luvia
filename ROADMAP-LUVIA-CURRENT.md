# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.174**, Core **4.82.293**. P17/P19 aktiv und teilweise: App .173 / Core .292, Worker fbc3fd6e-86a1-4e3d-83b2-cf7ace3b2a15 und Integration-Intelligence 4.42.0 sind öffentlich auf Integration; 22/22 Bytes stimmen. Der echte Valencia-Lauf blieb bei 21 Kandidaten, erreichte aber den vollständigen ungespeicherten Review. App .174 / Core .293 ist lokal vollständig geprüft und der aktive breite Recherchekandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der Composer kann einen unterbrochenen Auftrag fortsetzen, beendet verwaiste oder überlange Jobs sichtbar und bewahrt gültige Phasen. .174 löst die sachlich zu enge Places-Auswahl: ausdrückliche Wünsche steuern die Priorität, während acht Zielort-Grundkategorien das reale Inventar verbreitern. Kleinere, verteilte Stadtsektoren reduzieren überlappende Duplikate. Für 7/14/21 Tage wachsen die echten Rechercheziele auf 42/84/126; die KI erhält daraus nur 32/60/92 räumlich und fachlich priorisierte Kandidaten. Provider-IDs bleiben eindeutig und unbekannte Orte werden niemals erfunden.

**Nächster Schritt (AKTIV): App .174 ausschließlich auf Integration veröffentlichen und den vollständigen Valencia-Ablauf mit breitem Place-Pool abnehmen.** Der letzte öffentliche Lauf belegte, dass räumliche Sektoren allein den auf 21 Kandidaten beschnittenen Pool nicht lösen. .174 kombiniert Zielort-Grundkategorien, kleinere lokale Suchradien und reisedauerabhängige Rechercheziele; jetzt muss der öffentliche Providerlauf beweisen, dass Valencia deutlich mehr echte, räumlich und fachlich gemischte Kandidaten einschließlich Meer/Strand liefert, ohne den KI-Aufruf unnötig zu vergrößern.

**Abnahme dieses Schritts:**

- App .174 / Core .293 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration verwendet weiter die getrennte Intelligence 4.42.0; produktive Intelligence, Main und Production bleiben unverändert.
- Valencia recherchiert acht Zielort-Grundkategorien und priorisiert die ausdrücklichen Wünsche Meer/Strand, Shopping, Nachtleben und Restaurants.
- 7, 14 und 21 Tage besitzen echte wachsende Rechercheziele von 42, 84 und 126 eindeutigen Provider-Kandidaten; der gemeinsame Sicherheitsdeckel bleibt 160.
- Die Modellkomposition erhält daraus höchstens 32, 60 oder 92 fachlich und räumlich priorisierte Kandidaten, damit Modelllaufzeit und Kosten begrenzt bleiben.
- Lokale Sektorsuchen verwenden kleinere Radien; jeder Treffer wird weiterhin gegen den bestätigten globalen Bewegungsradius geprüft.
- Der öffentliche Valencia-Lauf zeigt deutlich mehr als 21 echte Kandidaten oder benennt eine reale Provider-Unterdeckung ehrlich, statt eine künstliche Produktgrenze vorzutäuschen.
- Der öffentliche Plan erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler innerhalb des begrenzten Ablaufs.
- Die sichtbare Tagesplanung deckt Meer/Strand sowie den gewünschten Kategorienmix ab und verteilt Places über nachvollziehbare Tagesgebiete.

**Danach:** Nach dem öffentlichen Valencia-Nachweis folgen die Laufzeitverkürzung des Gesamtplans, autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung. Danach werden räumliche Streuung, Strandabdeckung und Kategorienmix abgenommen sowie P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache und modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .174 öffentlich veröffentlichen und mit einem frischen Valencia-Auftrag bis zum Review messen; Gesamtlaufzeit deutlich verkürzen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
