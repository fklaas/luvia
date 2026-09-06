# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.119**, Core **4.82.238**. M16.5 Schritte 15–18: P15/P17 bleibt aktiv und teilweise. Der Composer-Transportfehler ist für die exakte Kandidatenadresse serverseitig korrigiert. Die Zielsuche ist für Stadt und Region im Browser-Vertrag belegt. Der Slider ist keine abgenommene Gestaltung; die neue Reisewelt-Richtung liegt als Konzeptauswahl vor. Frontend .119 / Stable .104 bleiben unverändert; Gateway v234 und Intelligence v37 sind veröffentlicht.

**Zuletzt geliefert:** Serverkorrektur 06.09.2026: Der genaue .119-Composer-Link lieferte vor dem Fix für die Zielsuche NETWORK_UNAVAILABLE; Gateway und Intelligence lehnten seine Origin mit HTTP 403 ab, während Stable erlaubt war. Die auf den eigenen Integration-Worker begrenzte Freigabe ist jetzt in Gateway v234 / 4.64.37 und Intelligence v37 / 4.35.1 veröffentlicht. Rom, Toskana und Lissabon wurden danach über den tatsächlichen places.v1-Such- und Auswahlvertrag in der Browser-Origin des Kandidaten bestätigt (2.730 / 1.213 / 1.039 ms, gültige Place-ID und Koordinaten). Das ist ein echter Browser-Vertragsnachweis; kein neuer angemeldeter UI-Klicklauf oder physischer iPhone-Nachweis. 30/30 gezielte Origin-/Auth-Verhaltensproben und 237/237 kontrollierte Regression sind grün; 32/32 erneut heruntergeladene Function-Quellen entsprechen nach Zeilenenden-Normalisierung dem Deployment-Commit. Frontend .119 und Stable .104 bleiben unverändert. Der bisherige Slider ist vom Nutzer als Gestaltung abgelehnt; drei Reisewelt-Konzepte sind dokumentiert, noch nicht umgesetzt.

**Nächster Schritt (AKTIV): P15/P17: die Reisewelt-Richtung festlegen und als zusammenhängende mobile Szene ausarbeiten.** Der Nutzer verlangt eine kleine spielbare Weltkarte mit bedeutungsvollen Entscheidungen. Empfohlen ist Eure kleine Reisewelt mit direkter tageweiser Gestaltung; Alternativen sind Reisebauen und spielbare Reisegeschichte. Die Konzeptauswahl ist noch nicht als fertige Oberfläche oder Nutzerentscheidung zu behandeln.

**Abnahme dieses Schritts:**

- Die ausgewählte Richtung führt räumlich zusammenhängend von Welt/Region und überprüfbarer Zielauswahl über zwei Reiseentscheidungen zu realen Places und einem bearbeitbaren Tag. Eine sichtbare direkte Ortsuche bleibt jederzeit verfügbar.
- Jede Interaktion verändert den kanonischen Trip-Entwurf und dieselben Places-/Journey-Projektionen; Kamera, Dekoration und Animation lösen keine Anbieteranfragen aus. Keine kopierte Fachlogik und kein Pflicht-Minispiel.
- Touch, direkte Antipp-Alternative zu Ziehen, Tastatur, Reduced Motion, Reisefarbe und Wiederaufnahme auf kleinem Bildschirm abnehmen. Die öffentliche Abnahme prüft den tatsächlich ausgegebenen Versionslink, einschließlich seiner Origin, und anschließend echte iOS-/Android-Geräte.
- Echte KI-Planung bleibt ein getrenntes Produktgate innerhalb P15/P17: nach Klärung des zuvor belegten API-Guthabenproblems strukturierten Modellauftrag, Restriktionen, Kontextbelege und ausdrückliche Bestätigung positiv nachweisen. Szenische Effekte ersetzen diesen Nachweis nicht.

**Danach:** Nach der gewählten ersten Reisewelt-Szene den gesamten Composer in derselben Gestaltungslogik ausarbeiten: Zeitraum, Budget, Mitreisende und ganze Tagesvorschau. P15/P17 umfasst weiterhin vollständige KI-/Kontextplanung, echte Kontoübernahme, getrennte Identity-Bestätigung und Trip-Archivieren/Löschen/Wiederherstellen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

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
