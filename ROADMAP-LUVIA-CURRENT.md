# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.83**, Core **4.82.205**. M16.5 Schritte 15–18 aktiv; B1/P09 und P10 sind der aktive Arbeitsblock. P02/P03 haben den gemeinsamen Filter-, Profil- und Kontinuitätsrelease geliefert und bleiben nur für positive Providerbreite, vollständige sichtbare UI-/AI-/Fotoabnahme und physische Mobilmessung teilweise offen. A1 Dokumentkonsolidierung wird nach jedem Slice fortgeschrieben; A2 ist teilweise belegt.

**Zuletzt geliefert:** App 13.82.168.83 / Core 4.82.205 läuft auf Integration über Worker ffb176c3-0015-44d0-8a66-e59c68c16a63 bei 100 Prozent Traffic; Gateway v196 / 4.64.20 bleibt auf Health-Build 13.82.168.79 unverändert aktiv. Der gemeinsame Filtercompiler deckt 14 Kategorien, 82 Typ-/Untertypabbildungen, 19 Landesküchen und alle Faktenfilter für Karte, Timeline und AI Chat ab. Sichtbar: Food 50, Shopping 21, Natur 11, Nachtleben 17, Aktivitäten 29, Italienisch 11, Chinesisch 2, Stays 49; Places und Stays bei 390 x 844 ohne horizontalen Überlauf. Passend erfindet keinen Steakhouse-Treffer. 225/225 Safe Regression, 3/3 NFR-0 und 30/30 öffentliche Bytevergleiche sind grün. Main und Production bleiben unverändert.

**Nächster Schritt (AKTIV): Booking-, Besuchs- und Memory-Momente positiv verwalten.** Der gebündelte P02/P03-Vertrag ist veröffentlicht und seine verbleibenden externen beziehungsweise breitebezogenen Nachweise sind klar abgegrenzt. Der nächste wertvollste Produktabschluss ist die bereits vorbereitete Timeline-Fähigkeitsmatrix mit echten positiven Owner-Verwaltungswegen.

**Abnahme dieses Schritts:**

- Ein gebuchter Timeline-Eintrag liest den aktuellen Booking-Owner-Stand und öffnet den passenden Ändern-/Stornieren-Weg; nicht unterstützte oder unbekannte Providerzustände bleiben ohne falsche Erfolgsmeldung stehen.
- Ein bestätigter Besuch lässt sich über den zuständigen Owner nachvollziehbar verwalten, ohne Booking- oder Places-Fakten umzudeuten.
- Memory- und Foto-Momente lassen sich mit lesbarer Vorschau bearbeiten, entfernen und nach Reload exakt wiederherstellen; Dateiverweise und Journey-Reihenfolge bleiben konsistent.
- Oberfläche und AI Chat verwenden für jede unterstützte Aktion dieselbe Eingabeprüfung, Vorschau, ausdrückliche Bestätigung, Owner-Readback, Receipt, Teilfehler- und Recovery-Sprache.
- Sichtbare Desktop- und responsive Mobilabnahme, vollständige Safe Regression, öffentliche Bytegleichheit, sauberes Archiv und unveränderter Main-Stand bilden das Releasegate.

**Danach:** Danach P12/P15/P17 mit dem gemeinsamen Trip Composer für Reisestart, Geführt, Schnellstart, KI-Entwurf und Vormerken; anschließend P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03-Rest: positive profilgerechte Providerbreite, vollständige sichtbare UI-/AI-Matrix, breite echte Place-/Stays-Fotos und physische Mobilzeiten. P09/P10 aktiv: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
