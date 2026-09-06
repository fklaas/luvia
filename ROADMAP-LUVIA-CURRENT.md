# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.113**, Core **4.82.232**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. App .113 / Core .232 verbindet echte Timeline-Daten, P11-Routenfenster und eine nicht mutierende günstige, erwartete und ungünstige Tagesprobe in Timeline und Luvia AI. Stable Integration läuft wieder auf dem akzeptierten App-.104-Worker; Main und Production blieben unverändert. Nur die physische iOS-/Android-Abnahme und später reale zeitgestempelte Context-Signale bleiben als Gates. P15/P17 ist jetzt AKTIV.

**Zuletzt geliefert:** P12: Der echte Reisetag 12.06.2027 wird aus derselben Journey- und Places-Wahrheit in drei nachvollziehbaren Verläufen gezeigt. Wetter, Verkehr/Störungen, Öffnungszeiten und Auslastung bleiben ohne Beleg unbekannt; Luvia behauptet keine Erfolgswahrscheinlichkeit und schreibt nichts automatisch. Timeline und AI Chat zeigen dieselben Momente, Szenarien und Bestätigungsgrenzen. Sichtbar wurden die drei Verläufe, die ausdrücklich unbekannten Einflüsse und der Reload mit unveränderten zwei Momenten sowie zehn Minuten Puffer geprüft. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): Gemeinsamen Trip Composer für Geführt, Schnellstart und KI-Entwurf liefern.** P09 bis P12 liefern jetzt bestätigte Places-/Journey-Änderungen, Recovery, Quellenfenster und eine ehrliche Tagesprobe. P15 und P17 bündeln diese Fähigkeiten in einem einzigen Trip-Entwurf, ohne Vorlieben, Reiseentwurf oder Timeline-Wahrheit zu duplizieren.

**Abnahme dieses Schritts:**

- Account-ohne-Reise und bestehende Reise verwenden denselben Trip Composer mit den Einstiegen Geführt, Schnellstart und KI-Entwurf; Trip bleibt der einzige Owner des Entwurfs und der bestätigten Reise.
- Ziel, Zeitraum, Reisefarbe und Symbol sowie Anfrage-, reisebezogene und dauerhafte Vorlieben werden klar getrennt; eine dauerhafte Profiländerung verlangt eine eigene verständliche Bestätigung und bleibt korrigier- und löschbar.
- Der KI-Entwurf wird tageweise mit echten Place-/Stay-Identitäten, Karte, P12-Tagesprobe, Begründungen, Alternativen, Budget- und Context-Hinweisen präsentiert; unbelegte Angaben bleiben unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erscheinen jeweils als eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner.
- Ein gebündelter sichtbarer Integrationslauf prüft Geführt, Schnellstart, KI-Entwurf, Abbruch ohne Mutation, bestätigte Teilübernahme, Reload-Readback, bestehende Reise, Account-ohne-Reise, Desktop, mobiles Browserformat, Safe Regression und NFR-0.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. Jetzt folgen P15/P17 Trip Composer; danach P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
