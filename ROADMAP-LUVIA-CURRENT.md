# Luvia aktueller Gesamtfahrplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.127**, Core **4.82.246**. P15/P17 aktiv und teilweise: .127 schließt die drei fachlich getrennten Composer-Wege, neutrale stabile Geografie, wirksame Reise-/Profilpräferenzen, breitere Places und Owner-Readback-Recovery. Der nächste Abschlussblock ist der echte vollständige KI-Mehrtagesentwurf samt Konto-/Lifecycle-/Gerätebeleg. Stable .104; Gateway v235 / Intelligence v37 unverändert.

**Zuletzt geliefert:** App .127 startet ohne geografische Vorauswahl, zeigt sieben dunkle Kontinentkonturen und hält Welt und Zielstatus über Schrittwechsel flackerfrei. Leere Reise, Vorschlagsreise und vollständige KI-Reise sind getrennte Composer-Ergebnisse. Im Vorschlagsweg stehen Reisegefühl, Tempo, Ernährung und Budget jeweils allein. Reise- und Profilvorlieben steuern gemeinsame belegpflichtige places.v1-Anfragen und Ranking; sichtbare Kriterien erklären die Auswahl. Der öffentliche Scharbeutz-Lauf lieferte acht Orte über vier Tage. Der Tagesfilm wurde zur laufenden Kartenreise mit Tageslicht, Stationen und Spur. Eine unvollständige Übernahme wird per Owner-Readback abgeglichen, ohne Mutation blind zu wiederholen. 238/238 Regression, 95 Composer-, 60 Geografie- und 21/21 öffentliche Byteprüfungen sind grün.

**Nächster Schritt (AKTIV): Vollständigen KI-Mehrtagesentwurf und Trip-Lifecycle öffentlich schließen.** Die drei Reisewege, breitere Places, sichtbare Präferenzwirkung, Live-Reiseprobe und sichere Übernahme-Recovery sind geliefert. Offen ist jetzt der positive echte Modelllauf mit ausreichender Tagesabdeckung sowie die dauerhafte Übernahme bis Timeline und Reload. P15/P17 bleiben bis zu diesen Produktgates teilweise.

**Abnahme dieses Schritts:**

- Einen echten vollständigen Wunsch-/KI-Plan über mehrere Tage mit ausreichend unterschiedlichen, belegten places.v1-Kandidaten erzeugen; Kategorien, Wiederholungen, Reise-/Profilvorgaben und freie Zeit prüfen. Keine gelockerten Sachfilter, erfundenen Places oder verdeckte Kontingentvervielfachung.
- Den vollständigen öffentlichen Weg zwischen mindestens zwei echten Entwurfsstationen per UI abnehmen; berechnete Wegegeometrie mit eindeutiger Darstellung und Quellenbeleg in die Tageskarte übernehmen. Zeitpuffer und Konflikte weiterhin durch journey.v1, einschließlich gemischter Fortbewegung und veralteter Quellen.
- Öffnungen, Saison, Feiertage, Events und Wetter über gemeinsame datierte Owner-/Intelligence-Kontexte einbeziehen. Budgetgefühl, Preisbelege und harte Budgetgrenzen getrennt behandeln; Lichtstimmung bleibt Atmosphäre.
- Den zuletzt dokumentierten Modell-Kontingentblocker erneut prüfen und den positiven Modelllauf erst bei tatsächlichem Zugang als bestanden markieren; keine Zahlung oder Konfigurationsänderung ohne Auftrag.
- Vor P15/P17-Gesamtabschluss bestätigte Kontoübernahme, dauerhafte Identity-Übergabe, Trip-Lifecycle und Wiederaufnahme auf physischen iOS-/Android-Geräten nachweisen. Gemeinsamen Status und alle aktiven Fahrpläne synchronisieren.

**Danach:** Nach vollständigem KI-Plan und Trip-Lifecycle die P15-Identity-Übernahme und physischen Gerätegates schließen; danach M18–M22 mit Mitreisendenverwaltung, Administration, Social und Intelligence II. Die Karten- und Composer-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17: echter vollständiger KI-Positivlauf (zuletzt Kontingentblocker), datierte Kontext-/Budgetqualität, Kontoübernahme, dauerhafte Identity-Übergabe, Lifecycle und physische Geräte. Die Geografie ist eine Übersicht, keine Zusage sämtlicher aktuellen Untergliederungen. Kein zusätzlicher P-Block wird als vollständig abgeschlossen markiert.

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
