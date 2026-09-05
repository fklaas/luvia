# Luvia aktueller Integrationsstand

Aktiv auf Integration: **13.82.168.73**, Core **4.82.195**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Die breite „Alle“-Menge bleibt erhalten und wird nach dem ersten Kartenbild durch genau eine begrenzte, cachefähige Profil-Evidenzsuche ergänzt. Nur identische Provider-IDs dürfen belegte Ernährungsmerkmale in bestehende Places übernehmen. Der sichtbare Landesküchenfilter „Vegetarisch“ sucht nach nachgewiesenem vegetarischem Angebot und nicht nur nach ausschließlich vegetarischen Betrieben; „Vegan“ bleibt separat. Fleischzentrierte Namen werden durch allgemeine Vegetarisch-Metadaten weiterhin nicht als passend freigegeben. Places und Stays teilen denselben Karten-, Pin-, Filter- und Providerpfad. Gateway **v188** gehört zu diesem Integrationsrelease; Datenbank, Secrets, Main und Production bleiben unverändert.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.73**, Core **4.82.195**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung ist abgeschlossen und wird nach jedem Slice fortgeschrieben; A2 Ende-zu-Ende-Abnahme ist teilweise belegt; A3/P09 und A4/P10 bleiben teilweise umgesetzt.

**Zuletzt geliefert:** App .71 / Core 4.82.195 und Gateway v186 schließen den expliziten Landesküchen-Suchring, die Kontinuität bei Providerdrosselung und den beim sichtbaren Stays-Kaltstart gefundenen Runtime-Asset-Fehler. Alle 19 Landesküchen wurden sichtbar betätigt: 13 positiv, sechs ehrlich null im 5-km-Vertrag. Die 10-km-Erweiterung erfolgt nur auf Nutzerklick; Kategorieänderungen setzen auf 3 km zurück. Frische .71-Tabs belegten Stays mit 49 Unterkünften und Places mit 50 Food- beziehungsweise nach dem Reset 48 Shopping-Pins, funktionsfähigen Zoom und leere Browserfehlerlisten. Die schnelle Gateway-Matrix erreichte 19/19 HTTP 200, ihre Nullfälle sind wegen einer während des Laufs eingetretenen Geoapify-Budgetablehnung bewusst nicht als providerübergreifend vollständig gewertet. 222/222 Safe Regression, 30/30 öffentliche Dateien und das unveränderliche Releasearchiv sind belegt. Der gemeinsame Place-Intelligence-/Trip-Composer-Entwurf bleibt in allen aktiven Fahrplänen verankert.

**Nächster Schritt (AKTIV): Passend, echte Place-Fotos und mobile Startzeiten schließen.** Die Suche ist nach Providerdrosselung stabiler, alle 19 Landesküchen wurden sichtbar ausgelöst und Places sowie Stays starten im korrigierten Release zuverlässig. Als nächstes müssen dieselben realen Kandidaten über Alle/Passend fachlich korrekt gewichtet, die vollständigen Filter über UI und AI Chat nachgewiesen, echte Place-Fotos verbreitert und die Startzeiten auf einem physischen Mobilgerät gemessen werden.

**Abnahme dieses Schritts:**

- Alle und Passend verwenden dieselbe Kandidatenmenge und ausschließlich belegte Profilmerkmale. Ein vegetarisches Profil erhält positive passende Orte; ein fleischzentriertes Steakhouse wird ohne konkrete vegetarische Angebotsevidenz nicht als passend markiert.
- Alle 19 Landesküchen sowie jede sichtbare Kategorie-, Untertyp- und Faktenfilteroption funktionieren über UI und AI Chat positiv oder liefern einen providerbelegten, verständlichen Nullfall; Kombination und Reset werden mitgeprüft.
- Places, Stays, Timeline-Vorschläge und AI Chat erklären bei denselben Eingaben dieselben kanonischen Place-Identitäten, Filter, Passend-Gründe und Providerbelege.
- Jede Detailkarte versucht ein exakt zum realen Ort gehörendes Bild mit Attribution; Trefferquote, ehrliche Bildlücke und Ablehnung benachbarter oder namensfremder Medien werden protokolliert.
- Desktop, Mehrtab-Warmstart und physisches Mobilgerät werden für ersten Kartenstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel, Cache-/Provider-Spur und sichtbare Pin-Zeit reproduzierbar gemessen.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit den positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente schließen; anschließend P12/P15/P17 den gemeinsamen Trip Composer mit Reisestart, Geführt, Schnellstart, KI-Entwurf und Vormerken umsetzen.

**Weiter offen:** P02/P03: korrekte Alle/Passend-Begründungen, vollständige sichtbare Filtermatrix über UI/AI Chat, zweite Quellenprüfung überraschender Klassifikationen, breite echte Place-Fotos und physische Mobilzeiten. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
