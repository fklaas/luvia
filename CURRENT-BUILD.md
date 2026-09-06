# Luvia aktueller Integrationsstand

Öffentliche Integration: **13.82.168.104**, Core **4.82.223**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Der gemeinsame Places Owner veröffentlicht 14 Kategorie-/Stays-Diagnosepfade, 19 Landesküchen und exakt identitätsgebundene ausgewählte Medien. Runtime-Commit **5e8f37985eb5ae76c0247ecfb11410bcc107c677**, Gateway **v233 / 4.64.36 / Places 4.38.15-exact-google-media-category-matrix** und Worker **7cda6e20-3b33-442a-b5e6-1c2da8256faf** bilden den öffentlichen Stand. Belegt sind **33/33** öffentliche Matrixpfade, Food **48 Alle / 9 Passend** ohne Steakhouse-Passung, Shopping **46 / 11**, Chinesisch mit **Hay-Cheng**, Zoomkontinuität und das echte verknüpfte Snykrode-Bild. Safe Regression **233/233**, NFR-0 **3/3** und **30/30** Byteidentität sind grün. Google Places bleibt extern mit **403 PERMISSION_DENIED** blockiert; Main und Production bleiben unverändert.

Intern angenommener, unveränderlicher P11-Kandidat: **13.82.168.112**, Core **4.82.231**, Worker **f3d48e97-e939-4a6d-a326-3c2da43c11fe**. Nach der sichtbaren Abnahme wurde die stabile Integration wieder auf den oben genannten App-.104-Stand gesetzt.

Intern angenommener, unveränderlicher P12-Kandidat: **13.82.168.113**, Core **4.82.232**, Worker **d3553403-3c27-4d79-9a4d-0d5021045c4a**. Timeline und Luvia AI teilen die beleggebundene Tagesprobe; nach sichtbarer Abnahme, 235/235 Safe Regression und 30/30 Byteidentität wurde Stable Integration wieder auf den oben genannten App-.104-Stand gesetzt.

Intern belegter, unveränderlicher P15/P17-Foundation-Kandidat: **13.82.168.114**, Core **4.82.233**, Commit **f1f732e8ca9a2cc2a209e4c58eb07ae4c9c3effa**, Worker **cf8876f5-26b4-426a-bab8-24017a0cf2d6**. Der gemeinsame Trip Composer besitzt die drei Einstiege Geführt, Schnellstart und Luvia AI mit 9/5/7 Schritten; Anfragekontext, reisebezogene Vorlieben und bestätigungspflichtige Profilübergabe werden getrennt. Der lokale sichtbare AI-End-to-End-Lauf, 235/235 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität sind grün. Archiv: 88.911.199 Bytes, SHA-256 **8AD1359F3F3D2D3609E60A655B7767E446064FD26312CA945BBFEB840C26229D**. Die öffentliche Zielsuche blieb auf „Suche läuft …“ stehen; echter Tagesentwurf, Teilübernahme und Trip-Lifecycle bleiben deshalb offen. Stable Integration wurde nach der Abnahme auf App .104 / Core .223 zurückgestellt.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.114**, Core **4.82.233**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. P15/P17 besitzt mit App .114 / Core .233 nun die gemeinsame Composer- und Preference-Scope-Foundation. Stable Integration läuft nach der Abnahme wieder auf dem akzeptierten App-.104-Worker; der .114-Kandidat bleibt immutable. Main und Production blieben unverändert. P15/P17 ist weiterhin AKTIV, weil öffentliche Zielsuche, echter tageweiser Entwurf, Teilübernahme und Trip-Lifecycle noch geschlossen werden müssen.

**Zuletzt geliefert:** P15/P17 Foundation: Geführt, Schnellstart und Luvia AI verwenden denselben Trip Composer, dieselbe Trip-Wahrheit und dynamische 9/5/7-Schrittfolgen. Anfragefreitext bleibt receipt-only, Trip-Interessen und Budget bleiben reisebezogen, dauerhafte Profilwerte verlangen eine getrennte Identity-Bestätigung. Die AI-Vorschau erfindet keine Place-/Stay-, Medien-, Context-, Preis- oder Buchungsdaten. Der lokale sichtbare End-to-End-Lauf erreichte den idempotenten Trip-Command; öffentlich sind Einstieg und Schrittfolgen sichtbar, während die festhängende Zielsuche als offenes Gate dokumentiert ist. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): P15/P17 mit öffentlicher Zielsuche, echtem Tagesentwurf und Teilübernahme schließen.** Die gemeinsame Composer- und Scope-Foundation ist belegt. Für den Blockabschluss fehlen jetzt nur noch die zuverlässige öffentliche Zielauflösung, der ownergestützte Tagesentwurf und die einzeln bestätigten Übernahme- und Trip-Lifecycle-Aktionen.

**Abnahme dieses Schritts:**

- Die kanonische Zielsuche liefert im öffentlichen Desktop- und Mobilbrowser innerhalb einer begrenzten Ladezeit einen bestätigbaren Ort oder einen klaren Fehler mit Wiederholung; kein endloses „Suche läuft …“.
- Der AI-Entwurf zeigt reale Place-/Stay-Identitäten aus places.v1 tageweise auf derselben Karte wie Places und Timeline, bindet die P12-Tagesprobe ein und kennzeichnet unbelegte Medien-, Context-, Preis- und Buchungsdaten als unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erhalten jeweils eine eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner; Abbruch schreibt nichts.
- Trip archivieren, löschen und wiederherstellen zeigt Abhängigkeiten, verwendet trip.v1-Receipts und besteht Reload-Readback; eine dauerhafte Profilübergabe bleibt separat bestätigbar, korrigierbar und löschbar.
- Ein gebündelter sichtbarer Integrationslauf prüft den kompletten AI-Weg, Teilübernahme, Reload, Account-ohne-Reise, bestehende Reise, Desktop und mobiles Browserformat sowie erneut Safe Regression und NFR-0.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. P15/P17 besitzt die Foundation, bleibt aber bis zur öffentlichen Zielsuche, zum echten Tagesentwurf, zur Teilübernahme und zum Trip-Lifecycle teilweise. Danach folgen P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
