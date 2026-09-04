# Luvia aktueller Integrationsstand

Veröffentlicht **13.82.168.52**, Core **4.82.174**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**: kontinuierliche Places- und Stays-Suchen am Reiseziel und im sichtbaren Kartenausschnitt, erfolgreiche Teilantworten bei breiten Kategorien und genau ein begrenzter Neuversuch bei vorübergehenden Providerfehlern. **.51** bleibt der direkte getestete Code-Rückfallstand.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.52**, Core **4.82.174**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .51 stabilisiert P02/P03 auf Integration: leere Providerseiten werden nicht mehr festgehalten; breite Kategorien behalten erfolgreiche Teilantworten, statt wegen eines ausgefallenen Ergänzungszweigs auf null zu fallen; genau ein begrenzter cachefreier Neuversuch bleibt möglich. Der sichtbare gleiche Scharbeutz-Ausschnitt lieferte Essen 50, Shopping 45, Natur 18 und Aktivitäten 7, auch beim direkten Wiederholungswechsel. Stays lieferte 49 am Reiseziel und 48 nach Zoom in 1,09 s über dieselbe Technik. Gateway v163, Worker 47496145, 217/217 Regression und 30/30 Byte-Gleichheit sind belegt.

**Nächster Schritt (GEPLANT): Alle Filter, Landesküchen, Alle/Passend und echte Place-Fotos schließen.** Die asynchrone Kategorie- und Viewport-Kontinuität ist auf Integration belegt. Der nächste offene Nutzerwert liegt jetzt in der inhaltlichen Richtigkeit jedes angebotenen Filters, der Profilpassung und der echten Bildquelle je Place.

**Abnahme dieses Schritts:**

- Jede sichtbare Filtermöglichkeit in Places und die entsprechenden Stays-Filter einzeln, kombiniert und nach Reset gegen reale Providerantworten prüfen; alle Landesküchen erhalten positive oder belastbar ehrliche Leerbelege.
- Alle und Passend verwenden dieselbe Place-Menge und ausschließlich belegte Profilvorlieben. Ein vegetarisches Profil darf ein fleischzentriertes Steakhouse ohne konkrete vegetarische Angebotsevidenz nicht als passend markieren.
- Jede Detailkarte versucht ein exakt zum Provider-Place gehörendes Foto mit Attribution zu laden. Fehlende Fotos werden als offener Beschaffungszustand protokolliert; Kategorieplatzhalter werden nicht als echtes Place-Foto ausgegeben.
- Places und Stays auf sichtbarem Desktop und Mobilgerät mit Reiseziel, Zoom, Ziehen, Kategorie-/Filterwechsel, Ladezeit, Provider-/Cache-Spur und Kontingentverbrauch wiederholt abnehmen.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend physische iPhone-/Android- und echte Mehrnutzerkonflikte nachschärfen und die vollständige B1-Nutzerkette schließen.

**Weiter offen:** P02/P03: vollständige Filter-, Landesküchen-, Alle/Passend- und echte Place-Foto-Abnahme. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege. Reale Geräte und Mehrnutzerfälle bleiben offen; M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

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
