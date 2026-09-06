# Luvia aktueller Integrationsstand

Öffentliche Integration: **13.82.168.100**, Core **4.82.219**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Places und Stays tragen die exakt ausgewählte Provider-Entität bis zum gemeinsamen Detail-Owner; dessen Cache trennt bildlose Abrufe von Anfragen mit konkretem Medienbeleg. OpenStreetMap-Medien stammen ausschließlich aus verknüpften Wikidata-/Wikimedia-Fakten oder aus einem streng identitätsgeprüften Foursquare-Treffer. Runtime-Commit **b9f32115d75780d9eb76ec03cb31afedf870af94**, Gateway **v228 / 4.64.33 / Places 4.38.11** und Worker **1dcf5de1-c743-4d4c-8d52-40cbac209b03** bilden den öffentlichen Stand. Sichtbar belegt sind Food `Passend 9` ohne Kleines Steakhouse, Shopping `Passend 11`, ein Shopping-Reload mit 46 Pins, Stays mit 47 eindeutigen Pins sowie Snykrode mit demselben echten Wikimedia-Ortsbild und sichtbarer Quellenverknüpfung in Kurzkarte, Ergebnis und Detail. Safe Regression **232/232**, NFR-0 **3/3** und **30/30** Byteidentität sind belegt. Main und Production bleiben unverändert.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.101**, Core **4.82.220**. M16.5 Schritte 15–18 aktiv. Der gebündelte P02/P03-Spezialtypen- und Provider-Medienabschnitt ist als App .101 / Core .220 öffentlich abgenommen. P02/P03 bleiben teilweise bis zur breiten echten Foto-, vollständigen Filter- und kalten Latenzabnahme. P09/P10 folgen danach mit Timeline-, Booking- und AI-Parität. Apple bleibt ohne kostenpflichtiges Developer-Programm geparkt.

**Zuletzt geliefert:** App .101 / Core .220 ist auf Integration veröffentlicht. Diagnose, Karte und AI Chat verwenden dieselbe automatische Provider-Kaskade; exakte Geoapify-Medienbelege bleiben erhalten, Foursquare search/photo ist streng auf 300/Monat, 12/Tag und 2/Minute begrenzt, und OSM-Spezialtypen bleiben kanonisch. Sichtbar: Food 48/9 ohne Steakhouse, Shopping 46/11, Natur 15, Stays 47/25. Öffentlich: Minigolf 2, chinesische Küche 1, strikter Reisebedarf 3. Releasekette: Runtime d00bdbf5, Gateway v230 / 4.64.34 / Places 4.38.13, Worker 6b964c97, 232/232 Regression, NFR-0 3/3 und 30/30 Byteidentität.

**Nächster Schritt (AKTIV): Reale Ortsbildabdeckung und kalte Providerlatenzen auf Zielwerte bringen.** Die gemeinsame Providerlogik, Spezialtypen, Kategorienkontinuität sowie Alle/Passend sind öffentlich reproduzierbar. Der größte sichtbare Qualitätsabstand bleibt, dass viele exakte Orte kein echtes Bild besitzen und der erste kalte Spezialpfad mit 5,58 Sekunden das Drei-Sekunden-Ziel verfehlt.

**Abnahme dieses Schritts:**

- Für alle 14 Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild gehört zur exakten Provider-Place-ID oder einer verifizierten offiziellen Ortsquelle und trägt Lizenz, Herkunft, Frische und Fallbackstatus.
- Fremde, nur räumlich nahe und generische Stockbilder bleiben ausgeschlossen. Bildlose Orte bleiben ehrlich gekennzeichnet, bis ein exakter Beleg verfügbar ist.
- Cache-Treffer zeigen Pins spätestens nach 1,0 Sekunden und kalte Providerpfade spätestens nach 3,0 Sekunden; Kategorienwechsel, Reload, Ziehen und Zoomen zeigen keinen falschen Leerzustand.
- Alle sichtbaren Kategorien, 82 Zuordnungen, 19 Landesküchen und Sachfilter bestehen anschließend auf Desktop und Touch positive, negative, leere und teilweise Providerfälle.
- Passend bleibt fail-closed und identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Google bleibt bei höchstens 1.000 Aufrufen pro Tag, alle Anbieterbudgets bleiben beobachtbar und Safe Regression, NFR-0, sichtbare Browserabnahme und Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für breite echte Fotoabdeckung, vollständige reale Kategorie-/Sachfiltermatrix, positive Google-/Foursquare-Livepfade und kalte Ziel-Latenzen. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert und über diese Blöcke sequenziert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Historischer Teilnachweis vom 4. September 2026: App **13.82.168.47**, Core **4.82.169**, Channel **integration-preview**. Runtime-Familie: **M16.5 Places and Stays Quality**.

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration läuft auf **13.82.168.47**, Core **4.82.169**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Maßgeblich sind docs/planning/status-plan.v1.json, docs/planning/STATUSPLAN-2026-09-04.md, docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.

Main bleibt bei c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba. Geprüfter Rückfallstand: App .46, Quelle a6bbb89896882b3c941e5007ed8e2f44023503d1. Bereits vorhandener gemeinsamer Booking-Resolver: 2.8.0-venue-service-reservation-anchor, Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34. Keine neue Function, Migration oder Secret-Änderung in diesem P09-Slice.
