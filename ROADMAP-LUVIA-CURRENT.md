# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.112**, Core **4.82.231**. M16.5 Schritte 15–18: P09, P10 und P11 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. App .112 / Core .231 verbindet Routenbandbreite, Quellenfrische, ehrlichen Live-Status und bestätigten Zeitpuffer über denselben Journey Owner in Timeline und AI Chat. Stable Integration läuft wieder auf dem akzeptierten App-.104-Worker; Main und Production blieben unverändert. Nur die physische iOS-/Android-Abnahme bleibt für P09–P11 als Gerätegate. P12 ist jetzt AKTIV.

**Zuletzt geliefert:** P11: vier Routenmodi, realistische Zeitbandbreite, Quelle, Messzeit, Datenalter und Live-Status werden aus einem deterministischen Journey-Beleg projiziert. Unbelegtes Wetter, Verkehr, Saison oder Tageszeit verändert die Schätzung nicht. Eine Pufferänderung zeigt Bisher/Neu und schreibt ausschließlich nach Bestätigung mit Revision, Belegsignatur, Idempotenz und Owner-Readback. Timeline und AI Chat teilen Sprache und Daten; ohne Quelle entsteht keine Aktion. Sichtbar wurden echte Timeline-Daten, 10→12-Minuten-Vorschau und Abbruch plus Reload ohne Mutation geprüft. Safe Regression 234/234, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): Tagesprobe mit belegten Grenzen liefern.** P11 liefert jetzt belastbare Wegefenster und Quellenalter. P12 verwendet diese Wahrheit, um einen Reisetag vor der Übernahme als erwarteten, günstigen und ungünstigen Ablauf durchzuspielen und konkrete Konflikte oder freie Momente verständlich zu machen.

**Abnahme dieses Schritts:**

- Ein realer Reisetag wird in günstiger, erwarteter und ungünstiger Ausprägung mit Zeiten, Wegen, Puffern, Öffnungszeiten und konkreten Konflikten dargestellt; jede Abweichung nennt ihren Beleg.
- Unbekannte Wetter-, Verkehrs-, Öffnungs- oder Auslastungslagen bleiben sichtbar unbekannt und werden nicht als Wahrscheinlichkeit oder sichere Vorhersage ausgegeben.
- Timeline, Places-Karte und AI Chat verwenden denselben Tagesentwurf, dieselben Place-Identitäten und dieselben P11-Routenbelege.
- Alternativen, Zeitverschiebungen und Weglassen erscheinen als einzelne Vorher/Neu-Vorschauen; erst bestätigte Journey-/Places-Befehle verändern den Tag und lassen sich über vorhandene Recovery-Wege zurücknehmen.
- Der sichtbare Integrationslauf prüft Desktop und mobiles Browserformat, Abbruch ohne Mutation, bestätigte Teilübernahme, Reload-Readback, Safe Regression und NFR-0.

**Danach:** Danach wird P12 in derselben Arbeitswelle mit P15/P17 zum gemeinsamen Trip Composer verbunden: Geführt, Schnellstart und KI-Entwurf, tageweise Präsentation, Vormerken, Alternativen und bestätigte Teilübernahme.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11 sind intern belegt und nur für physische iOS-/Android-Abnahme begrenzt. Danach folgen P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
