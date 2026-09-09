# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.181**, Core **4.82.300**. P17/P19 aktiv: App .181 / Core .300 ist öffentlich auf Integration und beseitigt die feste 160-Places-Grenze. Recherchepool, erhaltene Reserve und KI-Arbeitsauswahl skalieren mit 7/14/21/28/42 Tagen; ein kontrollierter 28-Tage-Lauf hält 240 unterschiedliche Places und verarbeitet 180 Kandidaten im Intelligence-Vertrag. Zwei öffentliche Valencia-Wiederanläufe starteten sichtbar mit 7 Tagen und 72 gespeicherten Kandidaten, endeten aber nach etwa 30–35 Sekunden erneut in der Integration-Intelligence-Nichtverfügbarkeit.

**Zuletzt geliefert:** App .181 ist ausschließlich auf Integration veröffentlicht: Commit a9321f6c08fe6dad5acf7f011f19e5d9d66da29e, Worker 40a40b02-4140-41f4-aadd-b5c130600361, Archiv 92.645.896 Bytes, SHA-256 4EA450605706A25ECA44BE145EFBDA27EE46C3ADD28F3DA6032E0E4ACE094A22 und 22/22 öffentliche Dateien auf Stable und Immutable byteidentisch. .181 entfernt die feste 160er-Sitzungsgrenze, führt dauerabhängige räumliche Seiten ein, skaliert den Intelligence-Arbeitskatalog und kennzeichnet die Review-Zahlen als Entwurfsmenge statt Stadtbestand. 240/240 Safe Regression, 3/3 NFR-0, 133 Composer- und 99/99 P19-Prüfungen sind grün.

**Nächster Schritt (AKTIV): Den größeren Place-Reservepool für Tausch, Ergänzungen und lange Reisen produktiv nutzbar machen.** Die feste technische Grenze ist beseitigt; als nächstes muss die größere, reisedauerabhängige Reserve sichtbaren Produktnutzen liefern, ohne hunderte Places in einen einzigen Modellaufruf oder in die Tagesansicht zu drücken.

**Abnahme dieses Schritts:**

- Tausch, Mehr davon und spontane Ergänzung wählen aus der erhaltenen Reserve, ohne dieselben Providerseiten erneut zu bezahlen.
- Räumliche Streuung und gewünschter Kategorienmix werden vor der Komposition als messbare Akzeptanz geprüft.
- 14-, 21- und 28-Tage-Reisen behalten ihre dauerabhängigen Pools über Recovery und App-Wechsel.
- Sehr lange Reisen werden abschnittsweise komponiert und anschließend als Gesamtreise auf Tagesbalance, Dopplungen und harte Vorgaben auditiert.
- Der Integration-Intelligence-Ausfall erhält einen konkreten terminalen Fehlerbeleg oder ein erfolgreiches öffentliches Review; der gespeicherte Entwurf bleibt in beiden Fällen erhalten.

**Danach:** Nach .181 werden der erhaltene Reservepool für gezielten Tausch, Ergänzungen, spontane Vorschläge und Mehr-davon nutzbar gemacht sowie räumliche Streuung und Kategorienmix öffentlich abgenommen. Für sehr lange Reisen folgt anschließend die segmentierte KI-Komposition, damit nicht ein riesiger Prompt alle Wochen gleichzeitig tragen muss. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: die weiterhin nicht verfügbare Integration-Intelligence bis zu einem konkreten Providerbeleg oder erfolgreichen Review verfolgen; Reservepool als echte Tausch-/Ergänzungsquelle öffnen; räumliche Streuung und Kategorienmix abnehmen; sehr lange Reisen in Wochenabschnitte komponieren und anschließend ganzheitlich auditieren. Autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

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
