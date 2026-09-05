# Luvia aktueller Integrationsstand

Integrationskandidat: **13.82.168.82**, Core **4.82.204**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Alle 14 Kategorien, 82 Typ-/Untertypabbildungen, 19 Landesküchen und die sichtbaren Faktenfilter werden aus einem gemeinsamen Vertrag für Karte, Timeline und AI Chat kompiliert. Die breite „Alle“-Menge bleibt auf dem kostenlosen Standardpfad. Ein bewusster Klick auf „Passend“ darf für den seltenen Ernährungsnachweis nach der freien Kaskade begrenzt Google und Foursquare verwenden; fehlende Evidenz bleibt ein verständlicher Nullfall. Fleischzentrierte Orte werden ohne dedizierten vegetarischen oder veganen Beleg verworfen. Transiente Providerfehler erhalten genau einen Wiederholungsversuch. Places und Stays teilen denselben Karten-, Pin-, Filter- und Providerpfad. Gateway **v196 / 4.64.20** bleibt unverändert auf Health-Build **13.82.168.79 / Core 4.82.201** aktiv; die Geoapify-Free-Reserve hält weiterhin 200 Credits zurück. Main und Production bleiben unverändert.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert. P02/P03 enthält jetzt zusätzlich die abgesicherte Apple-MapKit-Grundlage mit genau einem sichtbaren Kartenplatz; Apple bleibt bis Zugangsdaten und sichtbarer Parität deaktiviert. Google-Permission-Abgleich bleibt offen.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft unverändert auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2. Gateway v205 / 4.64.22 und Places 4.38.3-apple-renderer-contract sind ACTIVE. Apple-Ortssuche und Auto-/Fuß-/Fahrradrouten sind serverseitig vorbereitet, aber mit Remote-Policy enabled=false, Nullbudget, configured=false und automaticCascade=false gesperrt. Der Ein-Karten-Vertrag hält MapLibre als aktuellen Renderer und Apple MapKit als Zielrenderer im selben Kartenplatz fest. Der sichtbare Test belegte 1 MapLibre, 0 MapKit, 1 Canvas und 50 Pins vor/nach Zoom. 228/228 Safe Regression sind grün; Frontend, Main und Production blieben unverändert.

**Nächster Schritt (AKTIV): Apple-Zugang einrichten und MapKit JS als einzigen sichtbaren Integrationsrenderer abnehmen.** Serveradapter, Nullbudget-Policy und Ein-Karten-Vertrag sind bereit. Für einen echten Apple-Aufruf und den sichtbaren MapKit-JS-Prototyp fehlen Maps-Identifier, Team-ID, Key-ID und privater .p8-Schlüssel.

**Abnahme dieses Schritts:**

- Apple-Developer-Mitgliedschaft, Maps-Identifier und zugehöriger privater Maps-Schlüssel sind vorhanden.
- Team-ID, Key-ID und privater .p8-Schlüssel liegen ausschließlich als Supabase-Secrets vor; kein Secret erscheint in Client, Git, Logs oder Health.
- MapKit JS ersetzt MapLibre nur im bestehenden Kartenplatz; es existiert zu jedem Zeitpunkt höchstens ein sichtbarer Renderer.
- Places und Stay zeigen Suche, Kategorien, alle Filter, Alle/Passend, Pins, Detail-Sheet und Timeline-Aktionen mit demselben places.v1-Vertrag.
- Timeline-Vorschläge und AI Chat verwenden denselben Place-Bestand und dieselben belegten Passend-Gründe.
- Apple-Attribution sowie Anzeigerechte zusätzlicher Provider sind geprüft und dokumentiert.
- Desktop- und echter Mobiltest belegen MapKit-Interaktion sowie atomaren Rückfall auf MapLibre ohne verbliebene Apple-Daten.
- Safe Regression, öffentliche App-Identität und unveränderter Main-/Production-Stand sind erneut belegt.

**Danach:** Danach die offene Google-Key-Beschränkung für den positiven Ernährungsbeleg abschließen, anschließend der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; danach P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: Apple-Maps-Zugangsdaten, sichtbarer einzelner MapKit-Renderer, Provider-Lizenzmatrix und Rückfallabnahme; bestehende Google-Key-Beschränkung beziehungsweise Key-Projekt-/Billing-Zuordnung für positiven Ernährungsbeleg. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen: Die Supabase-Free-Plan-Schonfrist wegen des Egress-Overruns im vorherigen Zyklus endet am 07.09.2026; danach können eingeschränkte Anfragen HTTP 402 liefern. Der aktuelle Zyklus 23.08.–23.09.2026 steht bei 2,359/5 GB Egress (47 %, kein Overrun) und 63.540/500.000 Edge-Function-Aufrufen (13 %).

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
