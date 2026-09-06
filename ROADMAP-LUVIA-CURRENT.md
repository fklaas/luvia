# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.119**, Core **4.82.238**. M16.5 Schritte 15–18: P15/P17 bleibt aktiv und teilweise. App .119 enthält den neuen interaktiven Auftakt, volle Zeitraumdarstellung, Zielsuche für neue Orte und KI-Fehlerwiederaufnahme. Die echte Freitext-KI ist öffentlich mit HTTP 429 blockiert. P09/P10/P11/P12 behalten ihre begrenzten Belege. Stable Integration bleibt auf App .104; .119 ist ein unveränderlicher Prüfkandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** App .118/.119 liefert eine große wischbare Reisegefühl-Szene, einen bestätigungspflichtigen Intelligence-Reiseauftrag, alle gewählten Reisetage (bis 366), eine gemeinsame Places-Karte und bearbeitbare Tageszuordnung. Die neue Zielsuche verwendet den vorhandenen Geoapify-Gateway-Read ohne Google-Abhängigkeit; Rom und Lissabon wurden öffentlich gefunden und bestätigt. Der öffentliche Kategoriepfad zeigte fünf reale Lissabon-Orte über acht Reisetage. Yuki Ramen wurde vom ersten auf den achten Tag verschoben. Der echte KI-Aufruf antwortete dagegen wiederholt mit HTTP 429 / credit_balance_exhausted; ein erfolgreicher öffentlicher Modelllauf ist nicht belegt. .119 zeigt dafür eine lesbare Meldung und verwirft einen alten Fehler bei geänderten Wünschen ohne automatische Wiederholungsschleife. 45 gezielte Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 36/36 öffentliche Byteidentität sind grün. Die kontrollierte lokale KI-Antwort und sechs simulierte Schreibaktionen ersetzen keine echte KI-/Kontoabnahme.

**Nächster Schritt (AKTIV): P15/P17: den echten KI-Reiseauftrag als interaktive Tagesgeschichte abschließen.** Die Erzählweise und Dynamik des Luvia-Einstiegs sind das Vorbild. Der Nutzer verlangt ausdrücklich keinen übernommenen Kompass und kein zusätzliches Pflicht-Rätsel. Der neue Auftakt ist der Anfang; alle weiteren Schritte brauchen dieselbe mobile Qualität. Vor dem Produktabschluss muss die serverseitige KI-Ablehnung geklärt und die tatsächliche Planung positiv belegt werden.

**Abnahme dieses Schritts:**

- Nach Wiederherstellung des KI-API-Guthabens einen echten strukturierten Modellauftrag mit Profilrestriktionen, Freitext, Rückfrage und ausdrücklicher Bestätigung erfolgreich im öffentlichen Browser belegen. Keine ungeprüfte Erhöhung von Kostenlimits und kein als KI ausgegebener Regelfallback.
- Ziel, Zeitraum, Wünsche und tageweise Reisevorschau zu einer zusammenhängenden mobilen Szene ausarbeiten: Wischen, direkte Auswahlreaktionen, gemeinsame Places-Karte, nachvollziehbare Übergänge, Reisefarbe und Reduced Motion. Die Gestaltung wird auf Desktop und anschließend physischem iOS/Android abgenommen.
- Vorhandene P19/P20/P22/P23/P26 und P33/P34/P35-Kontextbelege für Wege, Öffnungen, Budget, Saison und Wetter in den bestätigten Reiseauftrag und die Tagesprobe einbinden; unbekannte Faktoren ausdrücklich offen lassen.
- Einen echten Konto-End-to-End-Lauf für Trip-Erstellung und genau ausgewählte Place-/Journey-Aktionen samt Datum, Dauer, Reload und Teilfehler-Wiederaufnahme belegen; danach die getrennte dauerhafte Profilbestätigung und den Trip-Lifecycle schließen.

**Danach:** Innerhalb P15/P17 bleiben separat bestätigte dauerhafte Identity-Übergabe und Archivieren/Löschen/Wiederherstellen der Reise verbindlich. Die übrige Context Matrix und AI-Parität bleiben in ihren P-Paketen; M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
