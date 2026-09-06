# Sichtbare B1 Abnahme am 4 September 2026

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.106**, Core **4.82.225**. M16.5 Schritte 15–18 aktiv. App .106 / Core .225 schließt den internen P09/P10-Owner- und AI-Chat-Weg für bestätigte Besuche als korrigierten, mit 233/233 geprüften Integrationskandidaten. P09 und P10 stehen auf BELEGT_BEGRENZT; offen bleiben nur die ausdrücklich getrennten physischen Geräte- und externen Providerbelege.

**Zuletzt geliefert:** Bestätigte Besuche lassen sich in Timeline und AI Chat über denselben Places Visit Owner korrigieren, entfernen und per dauerhaftem Recovery-Beleg wiederherstellen. Unicode-sichere deutsche Befehle wie „Ändere“, „Lösche“ und „Zurückholen“ werden als bestätigungspflichtige Änderung erkannt. Fehlt ein bestätigter Visit-Owner-Datensatz, erscheint eine ehrliche Meldung und keine allgemeine Places-Suche. Der Katalog umfasst 333 semantische Aktionen, 30 typisierte Runtime-Aktionen, 249 öffentliche Owner-Bindungen und 2.764 Fehlerauswertungen.

**Nächster Schritt (AKTIV): Routenunsicherheit und bestätigten Zeitpuffer liefern.** Geh- und Fahrradrouten sind bereits providerübergreifend vorhanden. Der nächste klar abgrenzbare P-Block macht ihre zeitliche Unsicherheit, Quellenfrische und fehlende Live-Daten verständlich und lässt einen empfohlenen Puffer nur über einen bestätigten Journey-Befehl in die Timeline einfließen.

**Abnahme dieses Schritts:**

- Geh-, Fahrrad- und unterstützte ÖPNV-/Fahrtrouten zeigen erwartete Dauer, realistische Bandbreite, Quelle, Messzeit und Datenalter; fehlende Live-Daten werden als unbekannt ausgewiesen.
- Wetter, Saison, Tageszeit, Mobilitätsmodus und belegte Streckenmerkmale beeinflussen die Bandbreite nur mit sichtbarer Herkunft; Luvia erfindet weder Verkehr noch Barrierefreiheit.
- Ein Zeitpuffer wird zunächst als lesbare Vorher/Neu-Vorschau angeboten und erst nach ausdrücklicher Bestätigung idempotent über journey.v1 gespeichert; Ablehnung und veraltete Revision verändern die Timeline nicht.
- Timeline, Places-Karte und AI Chat verwenden denselben Routen- und Pufferbeleg sowie dieselbe Fehler- und Recovery-Sprache.
- Der Slice besteht gezielte Core-, Owner-, Fehler- und sichtbare mobile Browserabnahmen sowie Safe Regression und NFR-0.

**Danach:** Danach folgen P12 Tagesprobe und der gebündelte P12/P15/P17 Trip Composer mit tageweiser Reisepräsentation, Alternativen und bestätigter Übernahme.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10 sind intern belegt und nur für physische iOS-/Android-Abnahme begrenzt. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Kartenkontinuität .46 – aktueller Zusatznachweis

Integration App **13.82.168.46**, Quelle **a6bbb89896882b3c941e5007ed8e2f44023503d1**, Worker **06c66b30-b8db-4e45-9567-bc080b453dbc**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**.

Im sichtbaren Browser blieben die Rückwechsel im unveränderten 3-km-Bereich bei Shopping 46 und Natur 16. Ein gezielt unterbrochener Shopping-Abruf endete mit sichtbarer Retry-Aktion; nach Aufhebung der Netzsperre kamen über Retry 46 Pins zurück. Ein tatsächlicher Drag über freie Kartenfläche aktivierte sofort den sichtbaren Ausschnitt; die nachfolgenden Natur-/Shopping-Anfragen verwendeten dieselben neuen Rechteckgrenzen. Stays zeigte 49 Pins am Reiseziel und dieselbe gemeinsame Implementierung 1.31.0. Die Counts sind datierte Ergebnisse dieser Suchgebiete, keine Vollständigkeitsbehauptung über Scharbeutz.

Gezielte Regressionen belegen zusätzlich verspätete Antworten, Kategorie-Wechsel während Debounce, erneuten Abruf desselben fehlgeschlagenen Bereichs, gültige leere Ergebnisse sowie Geoapify-Rückfall bis maximal 15 Minuten. Dieser Rückfall bewahrt das ursprüngliche Beobachtungsdatum, gilt nur für identische Suche/Filter/Geografie und nicht für „Jetzt geöffnet“. Der sichtbare Netzausfall wurde nur vorübergehend simuliert und wieder aufgehoben. Keine Buchung oder Timeline wurde geändert. Physische Geräteabnahme bleibt offen.

Nachweise im Arbeitsverzeichnis outputs: places-continuity-browser46.json, places-continuity-error46.png, places-continuity-regression46-release.log und public-byte-proof46.json. Der nachfolgende P09-Abschnitt Entfernen/Wiederherstellen wurde mit .47 geliefert und separat belegt.

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration lief für diesen historischen Teilnachweis auf **13.82.168.47**, Core **4.82.169**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Belege: outputs/p09-baseline.json, p09-live-review44.txt, p09-saved44.json, p09-reload-undo44.txt, p09-restored44.json, p09-final-proof44.json, p09-touch/result.json, p09-regression44-release.log und public-byte-proof44.json. Die folgenden .37–.43-Abschnitte bleiben frühere Teilnachweise.

Stand: **BEGRENZTE POSITIVBELEGE — B1 BLEIBT AKTIV**. Die heute reproduzierten P03-Suchlücken, die versteckte Terminprüfung und die verlorene Dauer sind korrigiert. Die Reservierungsprüfung zeigt ihr Ergebnis am auslösenden Button; der zusätzlich entdeckte falsche Zimmerlink für das Restaurant ROOF ist im Booking-Resolver korrigiert. Keine vollständige Golden-Journey-, Partner- oder Hardwareabnahme.

## Veröffentlicht und geprüft

Frontend **13.82.168.43**, Core **4.82.168**, Quelle **466aaa9e38c116409b375ffe07020787a1c2465b**, Worker **3a431617-48ba-42cf-adfb-0e3fc27dd9fa**. 25/25 öffentliche Asset-Hashes stimmen mit dem unveränderlichen .43-Quellarchiv überein. Frontend Safe Regression: 212/212 PASS.

Booking-Resolver **2.8.0-venue-service-reservation-anchor**, bestehende Supabase-Funktion **booking-route-resolve v18**, Quelle **17749f8c654804d0656e2da914e302409789fb34**. Auch der abschließende Backend-Slice besteht 212/212 Safe Regression. Die gemeinsame Backend-Funktion wurde aktualisiert; das Main-Frontend wurde nicht veröffentlicht. Places-Gateway v161, Providerbudgets, Secrets und Schemas bleiben unverändert. Main-HEAD c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba bleibt unverändert.

## Sichtbare Produktnachweise

Testumgebung: vorhandene angemeldete Sitzung im sichtbaren Codex In-App-Browser. Aktive Reise Ostseeurlaub, Scharbeutz, 12.–19. Juni 2027; bestätigte vegetarische Profilvorliebe. Kein physisches iPhone-/Android-Gerät. Die öffentlichen Versionen .39, .41, .42 und .43 wurden im Verlauf bewusst einzeln nachgeladen.

| Ablauf | Beobachtung | Grenze |
|---|---|---|
| Freie vegetarische Anfrage am Wasser auf .39 | „Finde für unseren Ostseeurlaub in Scharbeutz ein vegetarisch geeignetes Restaurant am Wasser.“ liefert drei Vorschläge: Grande Beach Café, COAST, Diercksen. Der erste Gateway-Abruf berücksichtigt 50 Kandidaten. | Kein Beleg für jede Küche, Sprache oder Kategorie. |
| Ausschnittswechsel auf .39 | Nach weiterem Zoomen erscheinen Grande Beach Café, COAST und ROOF mit erhaltenem Suchauftrag und Aktionsangeboten. | Ein vorheriger Nachladeversuch scheitert vorübergehend; vorhandene Pins bleiben erhalten. Details liefern vereinzelt 503. Die Ausfallursachen sind noch nicht vollständig geklärt. |
| Einfache Anfrage auf .41 | „Zeige mir Restaurants in Scharbeutz.“ liefert drei Vorschläge und zeigt die Berücksichtigung gespeicherter Vorlieben. | Zwei reale Suchsätze schließen P03 nicht vollständig. |
| COAST Details und Favorit | Exakter Name, Adresse, Website und vegetarische Belege gelesen. Favorit nach Vorschau bestätigt, unabhängig über places.v1 gelesen, nach separater Rücknahmevorschau wieder entfernt. Ursprünglicher Favoritenstand nach Reload geprüft. | Positive Favorite-Reload-Phase, zweiter Nutzer und Offline-Reconcile fehlen. |
| Terminprüfung auf .41 | ROOF: sichtbarer Reisetag, Uhrzeit und Dauer; vor Bestätigung kein Schreiben. Datum auf 13.06.2027, Uhrzeit auf 13:00 geändert, 90 Minuten bestätigt. | Kein vollständiger Konflikt-, Verschieben- oder Gruppenabstimmungstest. |
| Dauer und Reload auf .42 | Unabhängiger journey.v1-Read zeigt 13.06.2027 11:00Z bis 12:30Z, entsprechend 13:00–14:30 lokal, 90 Minuten. Testplanung über places.v1 zurückgenommen; nach Reload ursprüngliche sechs Einträge erhalten. | Die Oberfläche für dauerhafte Rücknahme und sämtliche P09-Befehle bleiben offen. |
| Reservierung prüfen auf .43 | ROOF-Detailkarte per Pin geöffnet. Klick zeigt direkt am Button „Reservierungsseite von ROOF gefunden“ und fokussiert „Reservierungsseite öffnen“. Reisefarbe bleibt erhalten. | Gefundener Weg bedeutet keine Tischverfügbarkeit. |
| Richtiger Booking-Weg mit Resolver 2.8.0 | Live-Read bindet ROOF an https://www.bayside.de/restaurants-und-bars/roof/#teburio. Die echte Restaurantseite enthält dort den Bereich Tischreservierung. Prüfung benötigt eine Quellseite. | Keine Reservierung abgeschickt, kein verbindliches Angebot, kein positiver Partnervertrag belegt. |

## Behobene Ursachen

Der korrigierte Zielbereich wurde zusätzlich in einem sichtbaren Browsertab geöffnet. Dort lädt das echte Teburio-Widget mit „Online Reservierung“, Personen- und Datumsauswahl. Das Ziel wurde lesend geöffnet; weder das Formular abgesendet noch eine externe Übergabe als Buchung gespeichert. Beleg: b1-roof-reservation-section.txt.

Die Chat-Suche betrachtete zunächst nur 20 Rohkandidaten, obwohl geeignete Treffer außerhalb dieses Fensters lagen. Sichtbare Auswahl und Kandidatenfenster sind jetzt getrennt. Der lokale Suchkontext beträgt wie auf der Karte standardmäßig 3 km. Explizite Radien bleiben möglich. Allgemeine Suchwörter einschließlich des vom Chat verwendeten „anzeigen“ werden nicht als Merkmale eines konkreten Ortes behandelt. Profilabhängige Empfehlungen benötigen belegte Ernährungseignung; unbekannte Angaben werden nicht freigegeben.

Beim Ausschnittswechsel wurde der konkrete Suchauftrag durch eine allgemeine Kategorie ersetzt. Der öffentliche Runtime-Pfad führt jetzt dieselben Constraints, Kategorie und Aktionsangebote weiter und prüft die aktive Reise. Leere Ergebnisse melden keinen Erfolg und beweisen keine Nichtexistenz am Zielort.

Die Planoberfläche verwendete veraltete Tageshinweise und versteckte Terminangaben. Sie zeigt jetzt Tag, Uhrzeit und Dauer vor dem bestehenden Owner-Kommando. Vorgaben außerhalb der Reise werden korrigiert; der erste Klick öffnet die Prüfung. Die Dauer war zwar im Places-Datensatz gespeichert, ging aber in dessen bestehender Timeline-Projektion verloren. Diese Projektion reicht die belegten 90 Minuten jetzt korrekt an Journey weiter.

Der Booking-Aufruf war kein vollständiger No-op: Sein Ergebnis stand außerhalb des aktuellen Ausschnitts, während am Button eine alte Fortschrittsmeldung stehen blieb. Das Ergebnis steht jetzt am Auslöser und der nächste Schritt erhält den Fokus. Technische Fehler, manueller Kontakt und externe Übergabe erhalten unterscheidbare Texte. Ein blockiertes Anbieterfenster bleibt erneut bedienbar. Der Completion-State des E-Mail-Callbacks verweist wieder auf den gültigen Sheet-Zustand.

Der zusätzliche Live-Read zeigte einen schwereren Fehler: ROOF wurde über dieselbe Hausadresse an eine Junior-Suite-Seite gebunden. Booking prüft jetzt zusätzlich die Art des Angebots. Ein Restaurant darf keinen Zimmerbuchungsweg übernehmen; eine Unterkunft keinen Tischbuchungsweg. Gültige Reservierungsanker innerhalb der konkreten offiziellen Ortsseite werden gefunden und beim Öffnen erhalten. Ein allgemeiner Speisekartenlink im Footer macht einen tatsächlichen Reservierungsbereich nicht mehr ungültig.

## Automatisiert geprüfte Booking-Fälle

Bestehende Tests und zusätzliche Gegenbeispiele prüfen Ortsidentität, falsche Schwesterhotels, unpassende Zimmerwege für Restaurants, gültige Hotelwege, belegte Providerbindungen, echte Reservierungsanker und fehlende Anker. Ein unpassender Hotelweg verhindert den verifizierten E-Mail-Fallback nicht. Fehlende Wege bleiben manuell; technische Fehler behaupten nicht, dass kein Kontakt existiert. Der UI-Test prüft Ergebnisplatzierung, nicht mutierende Vorschau und Retry nach blockiertem Fenster. Das sind kontrollierte Testfälle und keine live versendeten E-Mails.

## Testdaten und Rücknahme

Der versehentlich aus dem alten Standardtag entstandene ROOF-Testplan wurde bereits vor der .40-Korrektur entfernt. Auch der bewusst bestätigte Termin am 13. Juni wurde nach der .42-Prüfung wieder über das Owner-Kommando entfernt. Die ursprünglichen sechs Journey-Einträge einschließlich ihrer Startzeiten sind erhalten; bestehende Altdaten vom 31. August 2026 wurden nicht bereinigt. Die bestehende Quelle liefert nun auch deren bereits gespeicherte Dauer korrekt.

DAS LEO bleibt der einzige ursprüngliche Favorit. COAST und ROOF bleiben als neu entdeckte, nicht favorisierte und nicht eingeplante Ortsdatensätze erhalten. Testchat-Verlauf und Pin-Verlauf sind ebenfalls nachvollziehbar. Deshalb wird keine vollständig unveränderte Datenbank behauptet. Keine E-Mail, kostenpflichtige Buchung oder echte Reservierungsanfrage wurde aus dieser Abnahme versendet.

## Nächste Arbeit

1. Offene A2-Fälle: positive Persistenz nach Reload, gezielte Konflikt-/Änderungsschritte und dauerhafte Rücknahme. Vorübergehende Provider-/Detailfehler gesondert lokalisieren.
2. A3/P09: add, edit, move, reorder, connect, delete und restore über journey.v1 jeweils mit sichtbarer Vorschau, Bestätigung und Readback schließen.
3. A4/P10: verständliche Begründungen für Planung, Änderungen, Konflikte und fehlende Belege. Technische Formulierungen in Place-Erklärungen und Singulartexte bleiben als konkrete Restpunkte erfasst.
4. A5: echte Ortsfotos und positive Booking-Partnerzugänge. Stays-Angebote, Mehrnutzer, Offline, vollständige Geräteprüfung und sämtliche Landes-/Spezialküchen benötigen eigene Nachweise.
5. A6: B1 erst nach den vollständigen Gates schließen. P01–P50 und M17–M22 bleiben im Masterfahrplan erhalten.

## Belegdateien

Belege liegen unter C:/Users/fabia/Documents/ChatGPT/Luvia/outputs: b1-generic-search41.txt, b1-viewport39.txt, b1-plan-review41.txt, b1-plan-read41.json, b1-plan-read42.json, b1-restored42.json, b1-booking43.txt, b1-booking43.png, b1-booking-route43.json (falscher alter Zielweg), b1-booking-route28.json (korrigierter Live-Weg), b1-final-browser-evidence.json, public-byte-proof43.json, b1-regression43.log und b1-regression-booking28-verified.log. Die ursprüngliche .37-Gegenbeobachtung bleibt im Git-Verlauf und in b1-chat-counterexample-20260904.txt dokumentiert.
