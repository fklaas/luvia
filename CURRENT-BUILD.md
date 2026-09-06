# Luvia aktueller Integrationsstand

Öffentliche Integration: **13.82.168.104**, Core **4.82.223**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Der gemeinsame Places Owner veröffentlicht 14 Kategorie-/Stays-Diagnosepfade, 19 Landesküchen und exakt identitätsgebundene ausgewählte Medien. Runtime-Commit **5e8f37985eb5ae76c0247ecfb11410bcc107c677**, Gateway **v233 / 4.64.36 / Places 4.38.15-exact-google-media-category-matrix** und Worker **7cda6e20-3b33-442a-b5e6-1c2da8256faf** bilden den öffentlichen Stand. Belegt sind **33/33** öffentliche Matrixpfade, Food **48 Alle / 9 Passend** ohne Steakhouse-Passung, Shopping **46 / 11**, Chinesisch mit **Hay-Cheng**, Zoomkontinuität und das echte verknüpfte Snykrode-Bild. Safe Regression **233/233**, NFR-0 **3/3** und **30/30** Byteidentität sind grün. Google Places bleibt extern mit **403 PERMISSION_DENIED** blockiert; Main und Production bleiben unverändert.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.104**, Core **4.82.223**. M16.5 Schritte 15–18 aktiv. App .104 / Core .223 ist der vollständig veröffentlichte P02/P03-Kategorie-, Landesküchen- und identitätsgebundene Medienabschnitt. P02/P03 bleiben teilweise, bis Google serverseitig freigegeben, die breite reale Bildquote gemessen und die physische Touchabnahme geschlossen ist.

**Zuletzt geliefert:** Release .104 erweitert den gemeinsamen Places Owner um 14 Diagnosepfade, 19 Landesküchen und exakte ausgewählte Medien. 33/33 öffentliche Matrixpfade sind grün. Sichtbar funktionieren Food 48/9 ohne Steakhouse-Passung, Shopping 46/11, Chinesisch mit Hay-Cheng, 46 Pins nach Zoom und das echte Snykrode-Bild. 233/233 Regression, NFR-0 3/3 und 30/30 Byteidentität sind belegt.

**Nächster Schritt (AKTIV): Google-Berechtigung, reale Bildquote und physische Touchabnahme schließen.** Kategorie-, Küchen-, Passend- und Zoomlogik sind öffentlich grün. Der Google-Key erreicht places.googleapis.com, erhält aber PERMISSION_DENIED; deshalb fehlen bei vielen Orten weiterhin echte Fotos. Zudem fehlt noch der reproduzierbare Kaltstart auf realem iOS und Android.

**Abnahme dieses Schritts:**

- Der vorhandene Google-Key ist im richtigen Cloud-Projekt für Places API (New), Text Search (New) und Place Photos (New) serverseitig berechtigt; eine exakte Namens- und Koordinatenverknüpfung sowie der zugehörige Fotoload antworten positiv und bleiben in den getrennten 800/Monat-Budgets.
- Für alle 13 Places-Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild trägt exakte oder verifiziert verknüpfte Entitätsreferenz, Herkunft, Lizenz und Fallbackstatus. Fremd- und generische Stockbilder bleiben ausgeschlossen.
- Die 82 Zuordnungen, 19 Landesküchen und Sachfilter werden auf kompaktem Touch für positive, negative, leere, kombinierte und teilweise Providerfälle wiederholt; Kategorienwechsel, Passend, Pinvordergrund, Ziehen und Zoomen bleiben bedienbar.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand und laden ein exakt zugeordnetes Detailbild, sofern die Ortsquelle eines anbietet.
- Passend und Medien bleiben identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Safe Regression, NFR-0, sichtbare Browserabnahme, öffentliche Matrix und Byteidentität bleiben grün.

**Danach:** Danach folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert.

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
