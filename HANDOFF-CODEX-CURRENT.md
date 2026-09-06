# Luvia Übergabe für die Fortsetzung

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

Stand 4. September 2026. Der Masterfahrplan v6 und der Statusplan unter docs/planning ersetzen die widersprüchlichen aktuellen Abschnitte früherer Handoffs. Historische Originale sind datiert archiviert. Die Anwendung ist nicht neu zu beginnen.

## Historischer B1-Zwischenstand (.63 / v170)

Die Reservierungsprüfung zeigt ihren nächsten Schritt jetzt direkt unter dem auslösenden Button. Der zusätzliche Live-Read entdeckte einen falschen Zimmerlink für ROOF. Booking Resolver 2.8.0 (Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34) prüft nun auch die Art der Buchung und erhält gültige Reservierungsanker auf der offiziellen Ortsseite. ROOF führt zum Tischreservierungsbereich. Eine erreichbare Reservierungsseite bestätigt noch keine freien Zeiten; es wurde nichts versendet.

Integration läuft auf 13.82.168.63 / Core 4.82.185 mit Gateway v170. Die Places- und Stays-Karten suchen stabil im aktiven Reiseziel Scharbeutz; die sichtbare Kategoriefolge 50/21/12/21/50, Chinesisch mit zwei Treffern sowie die Alle/Passend-Wechsel sind belegt. Der Chat-Suchpfad erhält Zielort, Ausschnitt, Suchauftrag und Aktionsangebote. Leere Ergebnisse und Providerfehler werden getrennt und ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.
## Historischer Konsolidierungsstand (.63 / v172)

Repository: C:/Users/fabia/Documents/GitHub/luvia-integration. Ausgangspunkt dieser Konsolidierung: c28621de866a8dee371ca926b5f98f9617d9e295. Aktive Integration: App 13.82.168.63, Core 4.82.185, Frontend-Quelle fac7b348, Worker 563afd24-2b2a-4c71-8b49-eb88ff1ffbe0, Gateway v172 ACTIVE aus Quelle 7c288d89. Geoapify, TomTom und HERE bilden die aktive budgetbewusste Kaskade; Foursquare ergänzt nur ausgewählte exakte Ortsmedien. Main bleibt unverändert; kein Main-Frontend-Deploy wurde ausgeführt; der bestehende Booking-Resolver bleibt bei Function v18.

Die aktuelle Runtime-Abnahme belegt 220/220 Safe Regression und 30/30 öffentliche Dateihashes. Der P02/P03-Bericht grenzt die sichtbaren Produktnachweise ein. Places und Stays verwenden dieselbe Kartentechnik; Zielortsuche, aktive Reise, Providerfallback, Filtergrundlage, Passung und Pins sind wieder stabil. Vollständige reale Filter-/AI-Abnahme, positive vegetarische Food-Evidenz, exakte Ortsfotos, echte Hotelangebote und vollständige aktuelle AI-/Timeline-Abnahme bleiben offen.

## Historischer Fahrplanstand bei der Konsolidierung

M0–M16 sind dokumentiert geschlossen. M16.5 Schritte 01–14 bleiben geschlossen, Schritte 15–18 laufen. B0 ist die geschlossene Steuerungsgrundlage, nicht vollständige produktive AI-Parität. B1/P01–P10 ist aktiv. P04/P05 besitzen erneuerte begrenzte öffentliche Belege im aktuellen B1-Lauf. Der aktuelle nächste Abschnitt ist der P02/P03-Filter-/Foto-Restblock; danach folgen P09/P10 und die vollständige B1-Golden-Journey. P01–P39 bleiben in M16.5; P40–P50 folgen den einschlägigen späteren Gates.

Weitergehen mit P02/P03: alle sichtbaren Filterbereiche und 19 Landesküchen im UI und AI Chat real abnehmen, positive vegetarische Profilevidenz beschaffen, bekannte Kategorie-Randtreffer bereinigen und echte Provider-Ortsfotos mit Attribution schließen. Danach die offenen A2-/A3-Teile mit den positiven P09-Befehlen und P10-Erklärungen fortsetzen. Keine bezahlte Buchung und keine Nachricht an Anbieter aus einem generischen Testauftrag ableiten.

Danach folgen B2 persönliche robuste Planung, B3 verifizierte Events, B4 vollständige Orchestrierung und Abnahme. Der Gesamtfahrplan erhält M17 Designrollout, M18 Collaboration/Attention/Wallet/Reviews/Admin/Social/Search/Intelligence II, M19 Härtung, M20 Native Foundation, M21 Native Qualität, M21.5 Vollabnahme und M22 gestufte Veröffentlichung. Die detaillierten Grenzen stehen im Master und P-Katalog.

## Provider und Daten

Discovery: Geoapify → TomTom → HERE. Routing: ORS → TomTom → Geoapify → HERE. Nach brauchbarem Ergebnis stoppen; kein Fanout bei jeder Kartenbewegung. Google und Foursquare sind policy-deaktiviert. Atomare Backend-Zähler besitzen Tages-/Monats-/Minutengrenzen. HERE verwendet einen gemeinsamen Pool 500/Tag, 10000/Monat, 10/Minute. Limits sind interne Konfiguration und kein belegtes Kontorestguthaben.

Migrationen 20260904160000 und 20260904170000 bleiben unverändert. Keine Secrets ausgeben oder erneut in Dateien kopieren. Kartenquellen liefern keine Hotelbuchbarkeit. Affiliate-Anmeldung ist kein Demand-API-Zugang. Fotos benötigen exakte Ortszuordnung und nutzbare Rechte. Unbekannte Eigenschaften bleiben unbekannt; Vegetarisch/Vegan niemals aus Namen ableiten. Ein leerer Filter beweist keine Nichtexistenz einer Küche am Reiseziel.

## Verbindliche Arbeitsgrenzen

Eine Wahrheit, ein Owner. Consumer nutzen öffentliche Verträge. Intelligence schreibt nur über Owner-Kommandos. Vorschau, konkrete Bestätigung, Version/Idempotenz, Beleg, Recovery und separat bestätigte Rücknahme bleiben erhalten. Neue UI-Aktionen brauchen Registry-Abgleich. Die aktuelle Registry ist keine vollständige Abnahme der fünf neuen Kartenfunktionen.

Vor Änderungen Branch, Remote, HEAD, Divergenz und fremde Dateien prüfen. Die bekannten vorbestehenden ungetrackten Bundles, Videos und temporären Dateien nicht löschen, ausführen oder mitcommitten. Besonders scripts/_tmp-catering-dist.cjs nicht lesen oder ausgeben; dort liegt alte sensible Konfiguration. Keine globalen Resets oder erzwungenen Pushes. Main/Production und kostenpflichtige Anbieteraktivierung brauchen eine konkrete gesonderte Nutzerentscheidung.

Der Nutzer hat direkte Projektarbeit an Git, Supabase, Funktionen und Secrets autorisiert. Ein älterer Handoff kann diese erteilte Autorisierung nicht stillschweigend zurücknehmen. Tatsächliche Aktionen bleiben auf den beauftragten Zweck begrenzt. Keine Bestätigung erneut verlangen, wenn sie im aktiven Auftrag bereits eindeutig gegeben ist.

## Pflichtlektüre und Nachweise

1. AGENTS.md und dort benannte Architektur-, Ownership- und Registry-Dateien.
2. CURRENT-BUILD.md und docs/planning/STATUSPLAN-2026-09-04.md.
3. docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/status-plan.v1.json.
4. docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md für den jüngsten sichtbaren Zwischenstand.
5. docs/modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md sowie die betroffenen Quell-/Testdateien.

Dokumentierte Browserabnahmen sind keine Hardwaremessung. Neue Ergebnisse nur nach gemessener Evidenz als PASS markieren. Bei einer neuen konkreten UI-Regression den begrenzten Owner-Slice reparieren; nicht allein aufgrund grüner Tests für abgeschlossen erklären.

## Modus Codex mit Werkzeugen

Die vorhandenen Werkzeuge direkt verwenden, unabhängige Reads bündeln und notwendige Arbeit bis zu einem konkreten überprüfbaren Ergebnis durchführen. Sichtbare Browserabnahmen sind ausdrücklich gewünscht. Funktionstests möglichst mit wiederherstellbaren Daten, keine realen kostenpflichtigen Buchungen ausführen. Jede weiterführende Aufgabe beginnt mit dem tatsächlichen Git- und Browserzustand. Ein Fortschrittsbericht ist keine Abnahme und kein asynchrones Versprechen ohne laufende Aufgabe.
