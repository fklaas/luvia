# Luvia Masterfahrplan Version 6

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

Integration lief für diesen historischen Teilnachweis auf **13.82.168.47**, Core **4.82.169**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Arbeitsfassung vom 4. September 2026 für Fabian und die weiterführenden Entwicklungsaufgaben. Diese Fassung ersetzt die widersprüchlichen aktuellen Statusabschnitte des Masterfahrplans v5 und der bekannten Handoffs. Sie fasst den gültigen Umfang zusammen, erhält P01–P50 und den Gesamtweg bis M22 und trennt gelieferte Technik von noch ausstehender Produktabnahme.

Die umfangreichen Originale bleiben unverändert im Quellenarchiv erhalten. Ihre historischen Build-, Start- und Pending-Aussagen werden nicht als aktuelle Arbeitsanweisung übernommen. Der Quellenabgleich am Ende ordnet alle ursprünglichen Hauptkapitel und Fortschreibungen dieser Fassung zu. Es wird kein früheres Dokument rückwirkend als abgenommen umgeschrieben.

## Historischer B1-Zwischenstand (.63 / v170)

Die Reservierungsprüfung zeigt ihren nächsten Schritt jetzt direkt unter dem auslösenden Button. Der zusätzliche Live-Read entdeckte einen falschen Zimmerlink für ROOF. Booking Resolver 2.8.0 (Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34) prüft nun auch die Art der Buchung und erhält gültige Reservierungsanker auf der offiziellen Ortsseite. ROOF führt zum Tischreservierungsbereich. Eine erreichbare Reservierungsseite bestätigt noch keine freien Zeiten; es wurde nichts versendet.

Integration läuft auf 13.82.168.63 / Core 4.82.185 mit Gateway v170. Die Places- und Stays-Karten suchen stabil im aktiven Reiseziel Scharbeutz; die sichtbare Kategoriefolge 50/21/12/21/50, Chinesisch mit zwei Treffern sowie die Alle/Passend-Wechsel sind belegt. Der Chat-Suchpfad erhält Zielort, Ausschnitt, Suchauftrag und Aktionsangebote. Leere Ergebnisse und Providerfehler werden getrennt und ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.
## 1 Ausgangspunkt der Konsolidierung

Luvia befindet sich in M16.5, der laufenden Produktisierung und visuellen Überarbeitung auf der bereits modularisierten Architektur. M0–M16 sind dokumentiert geschlossen. Im stabilen 18-Schritte-Plan sind Schritte 01–14 geschlossen; Schritte 15–18 verbinden die verbleibenden Funktionen mit AI, sichtbarer Bedienung und reproduzierbarer Veröffentlichung.

Zum Zeitpunkt der ursprünglichen Konsolidierung lief Integration auf App 13.82.168.63 und Core 4.82.185 mit Gateway v170. Dieser Absatz bleibt als Ausgangsbeleg erhalten; der verbindliche heutige Stand steht im synchronisierten Statusabschnitt am Dokumentanfang. Die damaligen Kartenreparaturen waren ein Teil der aktiven B1-Arbeit. Geoapify, TomTom und HERE bildeten die aktive budgetbewusste Kaskade.

B0.01–B0.10 bilden die geschlossene Steuerungsgrundlage für Human↔AI-Aktionsparität. B1–B5 enthalten unverändert die Arbeitspakete P01–P50. P01–P39 gehören zu M16.5 Schritten 15–18. P40–P50 sind erhaltene Zukunftsfunktionen, deren konkrete Umsetzung an spätere Owner-, Daten-, Sicherheits- und native Gates gebunden ist. Diese Einordnung verhindert, dass M17 auf sämtliche langfristigen Frontier-Funktionen warten muss.

Der vollständige Status mit Zuständigkeit, Umfang und nächstem Abschlussnachweis folgt im Paketkatalog. Es gibt bewusst keine erfundene Gesamtprozentzahl und kein Enddatum ohne gemessenen Durchsatz und bestätigten Umfang.

## 2 Historische Reparaturbilanz bis zur Konsolidierung

Die aktive Reise bleibt beim Reload erhalten; die erste Places-Suche richtet sich nach dem festgelegten Reiseziel. Scharbeutz ist der aktuelle reale Prüffall. Verschieben und Zoomen verwenden begrenzte Ausschnittsabfragen, verwerfen überholte Antworten und ersetzen nicht bei jedem Abruf die gemountete Karte.

Places und Stays verwenden dieselbe räumliche Implementierung für Karten, Pins, Suche, Kategorien, Filter, Profilpassung, Verlauf und Detailübergang. Die Unterkunftsseite bleibt fachlich eine Unterkunftsansicht. POI-Ergebnisse sind kein Beleg für freie Zimmer, buchbare Tarife oder Reservierungen.

19 Küchenoptionen und 76 Kategorie-/Untertypfälle wurden gezielt geprüft. Eine fehlende belegte Eigenschaft bleibt unbekannt. Ein Steakhouse erhält keine vegetarische Eignung aus seinem Namen oder seiner allgemeinen Kategorie. Ein leerer Filter bedeutet keine bewiesene Nichtexistenz entsprechender Orte im gesamten Reiseziel.

Pin-Auswahl, Vordergrundreihenfolge, gemeinsame Kontur und markierte Passung wurden korrigiert. Die fünf Kartenfunktionen lauten: Wie wäre unser Urlaub von hier aus, Passt für uns, Wir haben noch 90 Minuten, Diesen Tag erleben und Heute lieber anders. Das 90-Minuten-Fenster bezieht bestehende Timeline-Termine ein. Diese Produktansätze sind keine vollständigen Abschlüsse von Day Rehearsal, Gruppenverhandlung oder Destination Digital Twin.

Die Karte verwendet eine zurückhaltende 35-Grad-Perspektive mit bleibender 2D-Umschaltung. Bedienelemente und Flächen folgen der Reisefarbe. Geh- und Fahrradwege sind aus echten Routengeometrien belegt. Bei der .37-Abnahme ergab derselbe Tagespfad 70 Minuten zu Fuß und 21 Minuten mit dem Rad. Das sind konkrete Prüfergebnisse, keine allgemeingültigen Reisezeiten.

Der damalige vollständige Safe-Regression-Lauf war 217/217 PASS; 30 öffentliche Dateien stimmten mit dem unveränderlichen .51-Quellarchiv überein. Im sichtbaren .51-Browserlauf lieferte derselbe Scharbeutz-Ausschnitt Essen 50, Shopping 45, Natur 18 und Aktivitäten 7; der direkte Wiederholungswechsel blieb stabil. Stays lieferte 49 Ergebnisse am Reiseziel und nach sichtbarem Zoom 48 Ergebnisse in 1091 ms. Das sind datierte historische Einzelmessungen und keine zugesicherte mobile Ladezeit oder Vollständigkeitsbehauptung. 390 × 844 ohne horizontalen Überlauf wurde damals geprüft; physische native iOS-/Android-Leistung bleibt ungemessen.

## 3 Was weiterhin offen ist

Echte Bilder für jeden Place sind nicht gelöst. Die verknüpfte Wikidata-/Commons-Anreicherung darf nur eine eindeutig zugeordnete Entität mit nutzbaren Rechten zeigen. Sie ist fixturegeprüft; beim letzten Holstentor-Versuch wurde kein neuer Livefotobeleg erzeugt. Generierte Illustrationen und fremde Symbolfotos dürfen nicht als tatsächlicher Ort erscheinen. Fehlt ein verifiziertes Foto, muss die Oberfläche das ehrlich und gestalterisch zurückhaltend behandeln.

Hotelpreise, Verfügbarkeit und Buchungsabschluss benötigen echte Booking-Provider. Duffel-Stays- und Booking-Affiliate-Anmeldungen sind als eingereicht dokumentiert; ein neuer Partnerentscheid wurde in der Konsolidierung nicht geprüft. Affiliate-Zulassung ist kein Demand-API-Zugang. Restaurantreservierung, Aktivitäts-/Kultureintritt sowie Create/Modify/Cancel bleiben getrennte positive Abnahmefälle.

Die Kette Suche → Place → Favorit beziehungsweise Planprüfung → unabhängiger Readback → Rücknahme → Reload ist an konkreten Restaurants begrenzt belegt. Zeitänderung und Rücknahme nach Reload sind seit .44 begrenzt belegt; Entfernen und Wiederherstellen nach Reload seit .47. Vollständige Mehrnutzer-Konfliktlösung und die übrigen Golden-Journey-Schritte bleiben offen. Granulare Journey-Befehle und konsistente verständliche Planungserklärungen bleiben P09/P10.

Die Action-Registry erfasst inzwischen auch die neuen Timeline-Marker; der vollständige positive AI-Ausführungsnachweis bleibt offen. Die Inventarisierung von 330 Aktionen bedeutet nicht, dass 330 Aktionen produktiv durch den Chat erledigt werden können. Die vollständige Geräte-, Mehrnutzer-, Offline-, GPS- und Reduced-Motion-Matrix sowie fünf unabhängige Nutzertests sind nicht belegt.

## 4 Verbindliche Reihenfolge der nächsten Arbeit

A1 Dokumentkonsolidierung ist abgeschlossen und wird nach jedem Arbeitsabschnitt gepflegt. A2 besitzt begrenzte sichtbare Scharbeutz-Belege; die vollständige Nutzerkette bleibt offen. A3/P09 ist aktiv: Entfernen/Wiederherstellen nach Reload ist begrenzt belegt; als Nächstes folgen Connect und Mehrfach-Reorder, danach die weiteren granularen Journey-Aktionen. A4/P10 begleitet diese Arbeit mit verständlichen Quellen-, Konflikt- und Änderungsbegründungen. A5 Fotos/Partner bleibt offen. A6 bewertet anschließend B1 anhand der tatsächlich erfüllten Gates.

Jeder Arbeitsabschnitt liefert einen begrenzten, überprüfbaren Nutzerablauf. Ein reproduzierter Fehler wird zuerst lokalisiert und in der zuständigen gemeinsamen Implementierung korrigiert. Der Browsergegenbeleg hat Vorrang vor einem grünen Quelltexttest. Große visuelle Umbauten und riskante Core-Grenzänderungen gehören in getrennte Lieferungen.

### Produktgates

G0 verlangt korrekte Entität, Herkunft und Ergebnisstatus. G1 verlangt die gemeinsame visuelle und räumliche Bedienbarkeit, einschließlich der echten Touch-Abnahme für den endgültigen Freeze. G2 verlangt eine vollständige Golden Journey. G3 verlangt fünf unabhängige Nutzerläufe vor breiterem Ausbau von B2. Externe Partnerblockaden dürfen als klar begrenzter Hold dokumentiert werden; sie dürfen keine unbenutzbare sichtbare Funktion als fertig erscheinen lassen und nicht alle unabhängige Arbeit blockieren.

### Der konkrete Golden Journey Ablauf

1. Aktive Reise und Daten aus dem Trip-Owner anzeigen und beim Reload erhalten.
2. Echte Places am Reiseziel aus einer nachvollziehbaren Quelle finden.
3. Im richtigen Kartenausschnitt den exakten Pin auswählen.
4. Details derselben Entität mit Foto oder ehrlicher Datenlücke öffnen.
5. Passung mit belegten Vorlieben und unbekannten Eigenschaften erklären.
6. Weg, Zeit und belegten Reservierungs-/Eintrittsbedarf prüfen.
7. Favorisieren und auf einen konkreten Reisetag mit Uhrzeit planen.
8. Nur eine verifizierte Anbieterroute öffnen; Kostenaktionen brauchen eigene konkrete Freigabe.
9. Weitergeleitet, ausstehend und bestätigt sauber unterscheiden.
10. Zurück, Reload und mobile Darstellung ohne Zustandsverlust prüfen.
11. Den nächsten sinnvollen Schritt aus dem echten Tagesplan anbieten.
12. Einen Besuch bewusst in einen Memory-Entwurf überführen.

## 5 Karten und Anbieter als gemeinsame Infrastruktur

Die Basiskarte und die Orts-, Routen-, Foto- und Buchungsdaten sind unterschiedliche Leistungen. Zehn Schlüssel bilden keine zehn austauschbaren Anbieter. Der Router wählt nach benötigter Fähigkeit, räumlicher und fachlicher Abdeckung, Belegqualität, zulässiger Nutzung, Budget und Fehlerzustand.

Discovery versucht Geoapify, dann TomTom, dann HERE, wenn zuvor kein geeigneter Treffer oder ein Fehler vorliegt. Sobald brauchbare Ergebnisse vorliegen, endet die Kaskade. Routing verwendet ORS, TomTom, Geoapify und HERE. WALK und BICYCLE sind in der Oberfläche angeboten; ein backendseitiger DRIVE-Modus ist kein abgenommener Fahrmodus im Produkt.

Atomare Reservierungen im Backend zählen die Anfrage vor dem Anbieteraufruf. Sie gelten über Instanzen hinweg, sind nur für den Service-Owner zugänglich und besitzen Tages-/Monats-/Minutengrenzen. Gleichzeitige identische Abrufe werden zusammengeführt; zulässige Zwischenspeicherung und ein begrenzter Ausschnitt schützen die Kontingente. Keine breite Anbieterabfrage bei jedem Kartenpixel.

| Dienst | Aktuelle interne Luvia Grenze | Zweck |
|---|---|---|
| Geoapify | 2200 Credits am Tag und 60 je Minute | Discovery und ergänzende Details oder Wege |
| TomTom Search v2 | 150 am Tag und 1500 im Monat und 25 je Minute | Alternative Ortsentdeckung |
| TomTom Routing | 1000 am Tag und 12000 im Monat und 25 je Minute | Alternative Wege |
| ORS von HeiGIT | 1200 am Tag und 20 je Minute | Gehwege und Fahrradwege |
| HERE gemeinsamer Pool | 500 am Tag und 10000 im Monat und 10 je Minute | Suche Details und Wege gemeinsam |
| Google und Foursquare | 0 per Policy | Bis zu ausdrücklicher Budgetentscheidung deaktiviert |

Geoapify-Abrechnung wird intern nach Operation gewichtet: Suchseiten ceil(limit/20), Details 5, Routing 2. Die Werte sind konservative Luvia-Konfiguration, keine Garantie über das tatsächliche Gratiskontingent des Kontos. Externe Nutzung desselben Schlüssels und der individuelle HERE-Abrechnungstarif sind nicht verifiziert. RPS-Anzeigen im HERE-Portal zeigen technische Raten; sie sind kein Gratisrestguthaben.

Die Migrationen 20260904160000 und 20260904170000 sind bereits ausgeführt und bleiben unverändert. Die zweite Migration vereinigt HERE unter einem Pool und erhält vorherige Zähler. Änderungen erhalten eine neue Migration. Ein Rückfall löscht keine Buchhaltung. Secrets stehen nur im Backend; sie werden weder in Handoffs noch in Diagnoseausgaben oder Frontend-Bundles kopiert.

Neue Anbieter werden erst nach Fähigkeitstest, Produktzugang, Nutzungs-/Cachingbedingungen, Kostenmodell, Normalisierung, Negativfällen und sichtbarer gemeinsamer Consumer-Abnahme aktiviert. Bilder brauchen einen eigenen Identitäts- und Rechtepfad. Preise und Reservierungen bleiben beim Booking-Owner. Die aktuelle Providerintegration ist somit eine erste belastbare Ergänzung, kein abgeschlossener Zehn-Anbieter-Ausbau.

## 6 Architektur und Zuständigkeiten

Eine fachliche Wahrheit hat genau einen Owner. Consumer und Experience verwenden öffentliche Verträge. Sie besitzen keine parallelen privaten Stores. Intelligence versteht und orchestriert, schreibt fremde Domänen aber nur durch deren öffentliche Commands. Native und Web verwenden dieselben fachlichen Verträge.

| Owner | Eigene Wahrheit oder Verantwortung |
|---|---|
| Platform | Runtime Ports Auth-Transport Navigation und Integrationsmechanik |
| Trip | Reise Lebenszyklus aktive Reise und Reiseziel |
| Places | Ortsentdeckung Kategorien Ortsidentität und belegte Ortsmerkmale |
| Booking | Angebote Reservierungen Eintritt Providerzustände und Buchungsbelege |
| Journey | Tagesgraph Reihenfolge Verbindungen Konflikte und Timeline |
| Identity | explizite persönliche Vorlieben und Identitätsprojektion |
| Media | Medienassets und deren Beschaffung Speicherung und Transfer |
| Memory | Erinnerung Erzählung und Lebenszyklus mit Media-Referenzen |
| Experience | gemeinsame visuelle und Interaktionsbausteine |
| Intelligence | Interpretation Planung eigene Modelle und sichere Orchestrierung |
| Events | gemeinsame versionierte Eventumschläge und Kompatibilität |
| Collaboration | künftig Mitgliedschaften Einladungen Rollen und Gruppenrechte |
| Social | künftig freigegebene Beziehungen Inspiration und Experience Graph |
| Attention | künftig Benachrichtigungsabsicht Priorisierung und Zustellung |
| Wallet | künftig sensible Reisedokumente Freigaben und Lebenszyklus |
| Reviews | künftig eigene Bewertungen Moderation und transparente Reputation |
| Admin | künftig administrative Rechte Governance und Audit |

Journey ist bereits eine eigenständige browserlose Grenze. core/places/timeline-core.js ist nur ein klassifizierter Kompatibilitätsprovider hinter journey.v1; neue Consumer greifen nicht direkt darauf zu. Bestehende Collaboration-Dateien sind Kompatibilität und kein fertig implementierter Membership-Core. Universal Search wird ein abgeleiteter Index, kein weiterer Domain-Owner.

Places-Kategorien bleiben deklarativ. Provider-Taxonomien und deutsche Oberflächenbegriffe werden nachvollziehbar normalisiert. Unbekannt, widersprüchlich und ausdrücklich negativ sind unterschiedliche Zustände. Mehrfachauswahl innerhalb und zwischen Filtergruppen muss dokumentierte Semantik besitzen; fehlt eine Anbieterfähigkeit, wird sie nicht über Namen geraten.

## 7 Vollständiger Weg bis zur Veröffentlichung

### M0 bis M16 Geschlossene Grundlagen

Die Modularisierung und Core-Grenzen einschließlich Platform, Trip, Places, Booking, Media, Identity, Intelligence, Experience, Journey und Memory sind dokumentiert abgeschlossen. Die historische Migration ist kein Anlass für einen Neustart. Konkrete neue Regressionen öffnen einen begrenzten Korrekturslice, nicht rückwirkend alle Meilensteine.

### M16 5 Produktisierung und gemeinsame Abnahme

Der laufende Schritt verbindet reale Nutzeraufgaben, konsistentes Design, AI-Aktionen und überprüfbare Quellen. Alle vorhandenen Bereiche, Landing/Auth, getrenntes Profil- und Trip-Onboarding, Places, Stays, Booking, Reise/Timeline, Erinnerungen und gemeinsame Navigation müssen die anwendbaren vertikalen Gates erfüllen. Living Compass und bereits geschlossene Shell-Geometrie bleiben geschützte Grundlagen. Content-Produktion und echte Medien werden quellen- und rechtegebunden geführt.

### M17 Gemeinsame Produktsprache vollständig ausrollen

Nach dem gemeinsamen Design Freeze werden freigegebene Tokens, Reisefarben, Typografie, Abstände, Zustände, Bewegung und Komponenten über die gesamte App ausgerollt. Die AI-Oberflächen übernehmen dieselbe Produktsprache. Es entsteht kein zweites Designsystem neben Experience. Jede vertikale Lieferung bleibt rückrollbar und auf Web sowie nativen Ports vorbereitbar.

### M18 Bestehende Domänen und neue Fähigkeiten ausbauen

Die folgenden acht Abschnitte bleiben vollständig im Gesamtplan. Neue fachliche Owner werden erst mit Contract, Zustandsmodell, Sicherheitsregeln und Tests produktiv. Datenbank- und native Adapter folgen derselben Grenze; ein UI-Prototyp ersetzt keine Mitgliedschaft, Benachrichtigungszustellung oder administrative Berechtigung.

M18.1 baut Collaboration und Membership: Einladen, annehmen, ablehnen, widerrufen, Rollen ändern, verlassen, entfernen und Owner-Transfer. M18.2 baut Attention mit Inbox, Ruhezeiten, Prioritäten, Deduplizierung und Zustellbelegen. M18.3 baut die sichere Travel Wallet mit Dokumenten, Versionen, Gültigkeit, Freigaben, OCR und bewusstem Export. M18.4 ergänzt Bewertungen, Moderation und nachvollziehbare Reputation.

M18.5 ist verpflichtende Administration: eng begrenzte Rollen und Rechte, Audit, Support, genehmigungspflichtige kritische Änderungen und zeitlich begrenzter Notfallzugang. M18.6 baut den Social Experience Graph mit Travel Twins, Social Compass, Echoes, Drops, Fork my Trip und verifizierten Erfahrungen. M18.7 ergänzt universelle Suche über erlaubte Owner-Projektionen. M18.8 vervollständigt Luvia Intelligence II als systemweite Orchestrierung.

### M19 Zuverlässigkeit und Synchronisation

Offline-/Reconnect-Verhalten, Versionskonflikte, Wiederherstellung, Last, Telemetrie und AI-Evals werden über alle beteiligten Streams gehärtet. Reale Unterschiede zwischen lokal gespeichert, synchronisiert, ausstehend und unbekannt müssen sichtbar bleiben. Eine CRDT-Entscheidung braucht definierte Owner und Rechte; sie ist kein allgemeiner Freibrief für fremde Datenkopien.

### M20 Native Auslieferungsgrundlage

Zuerst wird eine ADR für den konkreten nativen Ansatz getroffen. Danach folgen echte iOS-/Android-Builds, dieselben fachlichen Verträge, Auth-/SecureStorage-/Permission-/Location-/Media-/Push-Ports, Build-Pipelines, Signierung sowie TestFlight- und Play-Internal-Distribution. Ein schmaler Browser oder eine PWA allein erfüllt diesen Meilenstein nicht.

### M21 Native Produktqualität

Reale Geräte prüfen Start, Karten, Medien, Timeline, Synchronisation, Hintergrund-/Vordergrundwechsel, Akku, Speicher, Barrierefreiheit und Datenschutz. Voice, Kamera und native Assistenz verwenden die definierten Ports. Die Webfunktion darf nicht als zweites unabhängiges Fachsystem weiterlaufen.

### M21 5 Vollständige Funktionsabnahme

Jede sichtbare und konditionale Funktion wird in einer vollständigen Matrix inventarisiert. Zuerst erfolgen autonome reproduzierbare Tests, danach gezielte Nutzerabnahme der offenen Geräte- und Erlebnisfragen. Alle betroffenen Tabellen, RPCs, Edge Functions, Buckets, Provider und Berechtigungen erhalten ihren konkreten Beleg. HTTP 200 oder einzelne erfolgreiche Reads reichen dafür nicht.

### M22 Gestufte Veröffentlichung

Production, App Store und Play Store werden nach expliziter Releaseentscheidung gestuft freigegeben. Voraussetzungen sind vollständige kritische Gates, überprüfbare Builds, Monitoring, Datenschutz-/Storeangaben, Daten- und Backendkompatibilität sowie ein getesteter Rückfall. Der aktuelle Dokument- und Integrationsauftrag ist keine vorgezogene Production-Freigabe.

## 8 Die neue Luvia AI

Die vorhandene AI ist eine echte technische Grundlage mit Registry, öffentlichen Owner-Aktionen, Vorschauen, Bestätigungen, Belegen und Recovery. Sie ist noch nicht die vollständig orchestrierende Endausbaustufe. Der B0-Abschluss beschreibt die Steuerungsregeln, B1 die erste vollständige reale Handlungskette, P34–P36 die breitere Sprach-, Aktions- und Sicherheitsabdeckung und M18.8 die systemweite Evolution.

Intelligence II benötigt einen vollständigen Capability-Katalog über alle bestehenden und neuen Owner. Kontext umfasst die aktive Reise, Zeit, Wetter, freigegebene Gruppenmerkmale, explizite Vorlieben und zulässige Social-Projektionen. Tools werden nach Fähigkeit, Datenschutz, Kosten, Latenz und Zuverlässigkeit gewählt. Ergebnisse enthalten Quellen und Unsicherheit; dauerhafte Personalisierung ist korrigierbar und löschbar.

Proaktive Unterstützung erhält Zustimmung, einen nachvollziehbaren Anlass und eine einfache Abschaltmöglichkeit. Voice, Kamera und Dokumente liefern kontrollierte Eingaben statt direkter Datenbankänderungen. Große Planungen werden in getrennte Owner-Kommandos mit erwarteter Version, Idempotenz, Bestätigung und Beleg zerlegt. Eine Erklärung zeigt entscheidungsrelevante Fakten und Regeln, nicht private interne Gedankengänge.

Administrative Hochrisikobefehle, Dokumentfreigabe, Veröffentlichung, Beziehungen und Buchungen bleiben besonders kontrolliert. Das Modell darf sich keine Rechte erteilen, seine eigenen Vorschläge nicht selbst freigeben und fremde Tabellen oder Provider nicht direkt verändern. Evals prüfen Verständnis, Toolwahl, Planqualität, unbelegte Behauptungen, unerlaubte Aktionen, Wiederholungen, Latenz, Kosten und Nutzerkorrekturen.

## 9 Zusammenarbeit Social und Administration

Die Benutzer-/Mitreisendenverwaltung liegt bei Collaboration und bleibt von Identity getrennt. Ein Profil ist keine Mitgliedschaft, eine sichtbare Reise keine Schreibberechtigung. Einladungen benötigen Ablauf und Widerruf, Rollenwechsel nachvollziehbare Belege und konkurrierende Änderungen einen kontrollierten Versionskonflikt. Diese Grundlage kommt vor verbindlichen sozialen Gruppenaktionen.

Social bildet relevante Reiseerfahrungen ab. Travel Twins verwenden freigegebene Ähnlichkeitsprojektionen; private Modelle bleiben in Identity beziehungsweise Intelligence. Echoes verknüpfen freigegebene Erinnerungen mit Orten, Drops haben ein bewusstes Publikum. Fork my Trip erstellt durch Trip einen neuen Plan und bewahrt bei Social lediglich Herkunft und Verbindung. Buchungen und Provisionen bleiben Booking-Wahrheit. Eine Follower-/Like-Rangliste ist nicht das Ziel.

Admin ist eine Pflichtfunktion für einen sicher betreibbaren Dienst. Serverseitige Default-Deny-Regeln, minimale Rechte, Vier-Augen-Freigabe bei höchsten Risiken, Schutz des letzten Superadmins und unveränderliche Audit-Belege sind Bestandteil des Umfangs. Eine versteckte Adminroute ist keine Berechtigung. Offline sind administrative Daten höchstens redigierte Leseprojektionen; kritische Änderungen benötigen Online-Policy und Owner-Beleg.

Der detaillierte bestehende M18-Blueprint wird im technischen Anhang erhalten. Damit gehen die bereits ausgearbeiteten Vertrags-, Datenschutz-, Geräte- und Testanforderungen durch die kürzere neue Arbeitsfassung nicht verloren.

## 10 Arbeitsweise Daten und Veröffentlichungen

Vor Änderungen werden Branch, HEAD, Remote, Divergenz, Worktree und Datei-Ownership geprüft. Git ist die Entwicklungsbasis; DOCX und ZIP sind Übergabe-/Releaseartefakte. Die zwanzig Streams bleiben an den registrierten Core-Grenzen ausgerichtet. Es wird keine zweite Fachwahrheit aufgebaut und keine fremde laufende Arbeit überschrieben.

Ein sinnvoller Slice folgt Contract → Core → Adapter → Consumer → AI → Tests → sichtbare Abnahme → Commit → immutable Integration-Version → Bytebeleg → Rückfall. Mutationen folgen Vorschau → konkrete Bestätigung → Owner-Command → Owner-Receipt → Recovery; Rücknahme oder Kompensation wird separat und mit ihren Grenzen erklärt. Reine Dokumentänderungen brauchen keinen erfundenen App-Versionssprung.

Supabase-Migrationen sind nach Deployment unveränderlich. Neue Daten-/Rechtestrukturen werden additiv und mit RLS-Negativfällen geplant. Service-Secrets bleiben serverseitig; sensible Nutzerdaten erscheinen nicht in Logs oder Handoffs. Ein positives Gateway-Ergebnis beweist nur den tatsächlich ausgeführten Pfad, nicht die vollständige Cloud-Verkabelung.

Native First bedeutet browserlose Fachkerne und Plattformports für Netzwerk, Auth, Storage, Lifecycle, Benachrichtigungen, Ort, Geräteberechtigungen und Medien. Webadapter dürfen keine DOM-Abhängigkeit in den Core einschleusen. Offline-Ergebnisse erhalten Quelle, Alter und Status. Kritische nicht bestätigte Fremdmutationen bleiben ausstehend oder unbekannt.

Rollback verbindet Frontend, Gateway und Konfiguration. Für .37 verweist der Provider-Abnahmebericht auf .36 plus passenden Gateway-Quellstand beziehungsweise deaktivierbare neue Policies. Zähler und Migrationsevidenz bleiben erhalten. Ein bloßer Frontend-Rückfall ist keine Behauptung über wiederhergestellte Providerzustände.

## 11 Definition von fertig

Eine sichtbare Funktion erfüllt ihren echten Nutzerzweck, besitzt die richtige Owner-Grenze, nachvollziehbare Daten und verständliche Fehlerzustände. Maus, Touch, Tastatur, Reload, Rückweg, Berechtigungen, Offlinezustand und Reduced Motion werden soweit relevant geprüft. Neue UI-Aktionen erhalten eine Registry-Entscheidung und dieselben Regeln im Chat. Falsche Providerdaten werden weder ergänzt noch sprachlich als sicher umgedeutet.

Ein grüner technischer Test ist notwendig, aber nicht ausreichend. Ein Teilbeleg bleibt Teilbeleg. Physische Tests werden als solche bezeichnet. Externe Holds nennen konkret den fehlenden Zugang, dessen Wirkung und die weiter ausführbare Arbeit. Abschluss, Deploy, Push oder Production-Verifikation werden nur mit tatsächlichem Nachweis dokumentiert.

## 12 P01 bis P50 mit aktuellem Status

| Paket | Block | Stand | Ergebnis |
|---|---|---|---|
| P01 | B1 | ERHALTUNGSGATE | Integration und Rückfallstand |
| P02 | B1 | TEILWEISE | Anbieter und Datenqualität |
| P03 | B1 | TEILWEISE | Ortsentdeckung im AI Chat |
| P04 | B1 | BELEGT BEGRENZT | Favorisieren und zurücknehmen |
| P05 | B1 | BELEGT BEGRENZT | Planen und ausplanen |
| P06 | B1 | TEILWEISE | Buchungsbedarf und Weiterleitung |
| P07 | B1 | EXTERN ABHAENGIG | Buchung ausführen |
| P08 | B1 | EXTERN ABHAENGIG | Buchung ändern und stornieren |
| P09 | B1 | BELEGT BEGRENZT | Timeline gezielt bearbeiten |
| P10 | B1 | BELEGT BEGRENZT | Planung verständlich erklären |
| P11 | B2 | BELEGT BEGRENZT | Unsicherheit von Wegen |
| P12 | B2 | BELEGT BEGRENZT | Einen Tag vorab durchspielen |
| P13 | B2 | VORBEREITET | Bei Störungen umplanen |
| P14 | B2 | VORBEREITET | Standort bewusst freigeben |
| P15 | B2 | TEILWEISE | Vorlieben richtig speichern |
| P16 | B2 | VORBEREITET | Aus bewusstem Feedback lernen |
| P17 | B2 | TEILWEISE | Reise vollständig verwalten |
| P18 | B2 | VORBEREITET | Erinnerungen und Geschichten |
| P19 | B2 | VORBEREITET | Abgeleitetes Reisezielmodell |
| P20 | B2 | OFFEN | Verifizierte Veranstaltungsquellen |
| P21 | B3 | VORBEREITET | Veranstaltungen verlässlich normalisieren |
| P22 | B3 | VORBEREITET | Veranstaltungskalender |
| P23 | B3 | VORBEREITET | Zeit und Karte gemeinsam filtern |
| P24 | B3 | OFFEN | Vom Event zur Erinnerung |
| P25 | B3 | OFFEN | Kultureller Kontext |
| P26 | B3 | OFFEN | Freie Zeit sinnvoll entdecken |
| P27 | B3 | VORBEREITET | Gemeinsame und unterschiedliche Wünsche |
| P28 | B3 | VORBEREITET | Alternativen bei schlechtem Wetter |
| P29 | B3 | VORBEREITET | Änderungen bei Ort und Veranstaltung |
| P30 | B3 | VORBEREITET | Tagesplan mit Quellen abgleichen |
| P31 | B4 | VORBEREITET | Veranstaltungen räumlich und zeitlich verbinden |
| P32 | B4 | OFFEN | Veranstaltungsprodukt öffentlich abnehmen |
| P33 | B4 | OFFEN | Veranstaltungen vollständig im Chat |
| P34 | B4 | TEILWEISE | Mehrere Wünsche und Sprachen |
| P35 | B4 | TEILWEISE | Alle Bedienaktionen auch über AI |
| P36 | B4 | TEILWEISE | Unsichere Aktionen zuverlässig verhindern |
| P37 | B4 | OFFEN | Vollständige Bedienmatrix |
| P38 | B4 | OFFEN | Offline Konflikte verbindlich entscheiden |
| P39 | B4 | ERHALTUNGSGATE | Jeden Slice reproduzierbar veröffentlichen |
| P40 | B4 | SPAETERES GATE | Alternative Urlaubsverläufe vergleichen |
| P41 | B5 | SPAETERES GATE | Eigene Reiseregeln verbindlich machen |
| P42 | B5 | SPAETERES GATE | Jede wesentliche Aussage belegen |
| P43 | B5 | SPAETERES GATE | Mobilität und Energie berücksichtigen |
| P44 | B5 | SPAETERES GATE | Private Gruppenwünsche fair abstimmen |
| P45 | B5 | SPAETERES GATE | Reiseassistenz ohne Netz |
| P46 | B5 | SPAETERES GATE | Kamera und Audio in nächste Schritte übersetzen |
| P47 | B5 | SPAETERES GATE | Aktuelle Lage am Reiseziel verstehen |
| P48 | B5 | SPAETERES GATE | Auswirkungen von Reisevarianten vergleichen |
| P49 | B5 | SPAETERES GATE | Große Reiseunterbrechungen bewältigen |
| P50 | B5 | SPAETERES GATE | Reisenachweise und Anspruchsunterlagen |

## Ausführbarer Paketkatalog

### P01 Integration und Rückfallstand

**Stand:** ERHALTUNGSGATE. **Zuständig:** Platform und Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

App 13.82.168.104 / Core 4.82.223 ist auf Integration-Worker 7cda6e20-3b33-442a-b5e6-1c2da8256faf aus Runtime-Commit 5e8f37985eb5ae76c0247ecfb11410bcc107c677 veröffentlicht. Gateway v233 meldet 4.64.36 und Places 4.38.15-exact-google-media-category-matrix. 30/30 releasekritische Dateien stimmen im sauberen Deployment-Byte-Archiv, auf Stable und auf dem immutable Worker überein. Das Archiv luvia-integration-13.82.168.104-5e8f3798-public-bytes.zip hat 89.026.357 Bytes und SHA-256 713C216C53C71AE4A9D90B1BFEA8CC1679B1B5ABE6B05181646663F4AF34A8D6. Safe Regression 233/233 und NFR-0 3/3 sind grün. Main und Production bleiben unverändert. Backend-Ergänzung 06.09.: Gateway v234 / 4.64.37 und Intelligence v37 / 4.35.1 aus 975bdbd5 erlauben ausschließlich zusätzlich die eigenen Integration-Versionsadressen. 237/237 Regression und 32/32 normalisierte Function-Quellen geprüft; Frontendstände unverändert.

**Nächster Abschlussnachweis:** Beim nächsten kohärenten Integration-Slice erneut sauberen Commit, immutable Release-Identität, Safe Regression, NFR-0, öffentliches Verhalten und Rückfallarchiv gemeinsam belegen.

**Erhaltener technischer Umfang:** Retain the current immutable release, source hashes, rollback compatibility and historical counterevidence. The old .126 lock is historical, not a current deployment target.

### P02 Anbieter und Datenqualität

**Stand:** TEILWEISE. **Zuständig:** Places und Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Release .104 veröffentlicht die vollständige Diagnosematrix für 13 Places-Kategorien plus Stays und 19 Landesküchen sowie strikt identitätsgebundene Medienanreicherung. Öffentlich bestanden 33/33 automatische Kategorie- und Küchenproben ohne Providerfehler; 14 von 19 Küchen liefern im Scharbeutz-Radius Treffer, fünf bleiben ehrlich leer. Sichtbar schaltet Food zwischen 48 Alle und 9 Passend, Shopping zwischen 46 und 11, Kleines Steakhouse bleibt aus der vegetarischen Passendmenge ausgeschlossen und Chinesisch liefert Hay-Cheng. Nach Zoom bleiben 46 Shopping-Pins, Karte ready, Pointer bedienbar und der gewählte Pin vorn. Snykrode lädt ein 1342 x 736 Pixel großes, exakt verknüpftes Wikimedia-Ortsbild. Google-Suche und Place Photo sind getrennt auf je 25/Tag, 800/Monat und 4/Minute begrenzt; Google selbst antwortet weiterhin 403 PERMISSION_DENIED, Foursquare zuletzt 429. P02 bleibt teilweise für die breite reale Bildquote, die Google-Key-/Projektberechtigung und die physische iOS-/Android-Touchabnahme. Composer .118/.119: neue Ziele Rom und Lissabon öffentlich über den bestehenden Geoapify-Destination-Read bestätigt, ohne Google-Autocomplete oder Änderung des aktiven Reiseziels. Origin-Korrektur 06.09.: auch der unveränderliche Composer-Link kann jetzt Rom, Toskana und Lissabon über den gemeinsamen Places-Vertrag suchen und auswählen; vorheriger HTTP-403-Transportfehler behoben.

**Nächster Abschlussnachweis:** Google Places serverseitig positiv berechtigen und einen exakten Such- plus Fotoabruf belegen; danach für alle 13 Places-Kategorien und Stays die reale Bildquote providerweise messen, jeden fehlenden Treffer ehrlich kennzeichnen und den höchstens drei Sekunden langen Kaltstart sowie Kategorie-, Passend-, Filter-, Zieh- und Zoomfluss auf physischen iOS-/Android-Geräten bestätigen.

**Erhaltener technischer Umfang:** Prove active provider readiness, bounded free-budget fallback, health, quota, timeout and offline semantics, freshness, result diversity, category-by-category completeness, exact spatial intent and real provider-linked photos. Geoapify, TomTom and HERE form the approved automatic search path. Google and Foursquare require explicit verified budget policies before cost-bearing calls. The same canonical candidate cohort feeds Places, Stays, Timeline suggestions, Trip Composer and AI Chat.

### P03 Ortsentdeckung im AI Chat

**Stand:** TEILWEISE. **Zuständig:** Intelligence und Places. **Einordnung:** M16.5 Schritte 15 bis 18.

App .104 nutzt weiter denselben places.v1-Kandidaten-, Filter-, Passend-, Karten- und Medienweg für Places, Stays, Timeline-Vorschläge und AI Chat. Die 82 Zuordnungen, alle belegpflichtigen Sachfilter und 19 Landesküchen sind im Gate grün. Öffentlich sind 33/33 Kategorie-/Küchenpfade technisch grün; sichtbar sind Food 48/9 ohne Steakhouse-Passung, Shopping 46/11, Chinesisch mit Hay-Cheng, stabile Pins nach Zoom und das echte verknüpfte Snykrode-Bild. Die vollständige physische Touch-, Bild- und surfaceübergreifende Sichtabnahme bleibt offen.

**Nächster Abschlussnachweis:** Nach positiver Google-Berechtigung und breiter exakter Ortsbildquote dieselben Kandidaten, Sachfilter, Passungsgründe, Medien-, Frische- und Fehlerbelege auf physischem Touch in Places, Stays, Timeline-Vorschlägen und AI Chat sichtbar abnehmen.

**Erhaltener technischer Umfang:** Accept multilingual requests, confirmed-profile fallback, missing/conflicting input questions, source-backed partial or complete suggestions per category, the shared places.v1 Compass-coloured MapLibre projection and bottom-up Place detail sheets. UI and Chat consume one Place candidate cohort rather than separate searches.

### P04 Favorisieren und zurücknehmen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Places. **Einordnung:** M16.5 Schritte 15 bis 18.

COAST im sichtbaren Chat favorisiert, über places.v1 unabhängig gelesen, nach erneuter Vorschau zurückgenommen und nach Reload ursprünglichen Favoritenstand verifiziert. Begrenzter aktueller Positivbeleg; kein vollständiger Mehrnutzer-/Offline-Abschluss.

**Nächster Abschlussnachweis:** Favorit über positive Reload-Phase, zweiten Nutzer und Offline/Reconcile abnehmen.

**Erhaltener technischer Umfang:** Close Preview, explicit confirmation, `places.v1` command, Receipt, recovery, persistence and separately confirmed Undo.

### P05 Planen und ausplanen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Places und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Planprüfung und Zeitänderung bleiben erhalten. Seit .47 lassen sich geplante Places erst nach lesbarer Vorschau entfernen und über einen im Places-Owner-Datensatz gespeicherten Recovery-Beleg auch nach Reload wiederherstellen. Datum, Uhrzeit und Dauer werden erneut geprüft; Favorit, Ortsdetails und Booking-Zustand bleiben getrennt. Grande Beach Café wurde sichtbar entfernt, neu geladen, wiederhergestellt und nochmals neu geladen.

**Nächster Abschlussnachweis:** Weitere Unterkunfts-/Kategoriepfade und vollständige Konfliktfälle einschließlich echter Mehrnutzeränderungen abnehmen; dabei dieselben Owner-, Vorschau-, Reload- und Booking-Gates anwenden.

**Erhaltener technischer Umfang:** Close trip/day/time selection, conflict preview, `places.v1` command, Timeline projection, Receipt, recovery and Undo.

### P06 Buchungsbedarf und Weiterleitung

**Stand:** TEILWEISE. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

ROOF: Reservierungsprüfung reagiert direkt am auslösenden Button. Der Booking-Resolver verwirft Hotelzimmerwege für Tischreservierungen und findet den belegten Reservierungsbereich auf der offiziellen Restaurantseite. Live read-only geprüft; E-Mail-/manueller Fallback und Retry automatisiert geprüft. Keine Anfrage versendet; vollständige positive Partner- und Buchungslifecycle-Abnahme offen.

**Nächster Abschlussnachweis:** Restaurant, Aktivität und Unterkunft getrennt prüfen; weitergeleitet niemals als gebucht anzeigen.

**Erhaltener technischer Umfang:** Classify the visit through the Booking Owner; show a compact admission/reservation notice in Places, AI Chat and Journey/Timeline suggestions; show owner/provider status, evidence, price and terms; open only a verified official/provider/email route and never infer requirement, availability or partner connectivity.

### P07 Buchung ausführen

**Stand:** EXTERN ABHAENGIG. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Kein aktuell belegter vollständiger positiver Live-Buchungsabschluss.

**Nächster Abschlussnachweis:** Erst aktivierten Partner, echte Konditionen und Owner-Beleg testen; keine kostenpflichtige Testbuchung automatisch abschließen.

**Erhaltener technischer Umfang:** Execute only supported provider-backed creation with idempotency, refreshed terms, explicit confirmation and provider/owner receipts.

### P08 Buchung ändern und stornieren

**Stand:** EXTERN ABHAENGIG. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Lifecycle und Fehlerbehandlung teilweise vorhanden; positive Anbieterabnahme offen.

**Nächster Abschlussnachweis:** Gebühren, unbekannten Ausgang, Wiederholung und unterstützte Kompensation mit Testangeboten prüfen.

**Erhaltener technischer Umfang:** Expose consequences and fees before confirmation; reconcile unknown provider outcomes and compensate only where supported.

### P09 Timeline gezielt bearbeiten

**Stand:** BELEGT BEGRENZT. **Zuständig:** Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

App .44–.66 liefert Langdruck, iOS-ähnlichen Wackelmodus, Zeit-/Daueränderung, Entfernen/Wiederherstellen, Mehrfach-Reorder, Owner-Fähigkeitsmatrix, gemeinsame Places-Karte in freien Timeline-Fenstern und Chat-Routenparität. App .86 schloss bestätigte Visit-Owner-Verwaltung; App .111 schließt die vollständige AI-Chat-Parität: natürliche deutsche und englische Besuchsbefehle erzeugen nur eine Vorher/Neu-Vorschau, schreiben erst nach ausdrücklicher Bestätigung und verwenden für Korrektur, Entfernen sowie Wiederherstellen exakt places.v1 mit Revision, Idempotenz, Readback und dauerhaftem Recovery-Beleg. Unicode-Befehle fallen weder in Places Discovery noch in allgemeine Providerfehler. Generische Timeline-Titel werden kontingentfrei über lokale placeId-, tripPlaceId- und providerPlaceId-Lesewege mit dem Place-Namen verbunden. Mehrere bestätigte Besuche am selben Ort werden niemals willkürlich gewählt; „erster“, „zweiter“ oder „letzter“ adressiert den zeitlich sortierten Owner-Datensatz. Timeline und Chat erzeugen keinen zweiten Besitzer und keinen lokalen Scheinzustand. Die automatisierten Owner-, Browser-, Orchestrierungs- und Fehlergates sind grün. Finaler .111-Beleg: sichtbare Mehrdeutigkeitsverweigerung für zwei reale DAS-LEO-Besuche, positive Vorschau für „den ersten bestätigten Besuch“, Abbruch ohne Mutation, 233/233 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität.

**Nächster Abschlussnachweis:** Den Langdruck-, Wackel-, Verschiebe-, Korrektur-, Entfernungs- und Wiederherstellungsweg auf realem iOS und Android physisch abnehmen. Positive echte Providerbuchungen bleiben getrennt in P07/P08 und blockieren den belegten internen P09-Owner-/Chat-Abschluss nicht.

**Erhaltener technischer Umfang:** Project the shared Places map into day and free-window suggestions, then add, edit, move, reorder, connect, delete and restore Journey moments through `journey.v1`, preserving all owner truth. Long press enters a visible iOS-like movement mode while Reduced Motion remains still.

### P10 Planung verständlich erklären

**Stand:** BELEGT BEGRENZT. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Zeitänderung, Entfernen/Wiederherstellen sowie Verbinden/Mehrfach-Reorder erklären bisherigen und beabsichtigten Zustand, Reihenfolge, Datum, Uhrzeit, Dauer, Konflikte, Wegefolge und Speicherstatus. App .111 bringt dieselbe verständliche Vorher/Neu-, Ergebnis-, Fehler- und Recovery-Sprache in den AI Chat: bestätigte Besuche werden über drei typisierte Aktionen vorbereitet, separat bestätigt, ownerseitig gelesen und nach dem Schreiben erneut geprüft. Benannte Orte werden aus lokaler Places-Owner-Wahrheit aufgelöst; bei mehreren gleich benannten Besuchen nennt die Rückfrage ausdrücklich „erster“, „zweiter“ oder „letzter“. 333/333 Aktionen besitzen eine Verbraucherprojektion; 127 geschützte Änderungen, 22 ehrliche Undo-Wege und 2.764 erzeugte Fehlerauswertungen sind im Drift-Gate belegt. Private Teilnehmer-IDs, freie Korrekturfelder und Gerätepositionen bleiben aus der öffentlichen Projektion ausgeschlossen. Finaler .111-Beleg: die sichtbare Rückfrage nennt die drei zulässigen Ordinalangaben; die eindeutige Anfrage zeigt Ort, deutsches Datum und Uhrzeit vor jeder Mutation. 233/233 Safe Regression, NFR-0 3/3 und 30/30 Byteidentität sind grün.

**Nächster Abschlussnachweis:** P12 Tagesprobe auf dem gemeinsamen Journey-Beleg aufbauen und P11 anschließend auf physischen iOS-/Android-Geräten mit Geh-, Fahrrad-, Fahr- und unterstütztem ÖPNV-Modus abnehmen.

**Erhaltener technischer Umfang:** Explain intent split, owner decisions, sources, freshness, assumptions, conflicts, rejected alternatives, proposed commands and resulting receipts without exposing private reasoning or sensitive raw input.

### P11 Unsicherheit von Wegen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Journey und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

App .112 / Core .231 liefert einen gemeinsamen Route-Uncertainty-Beleg für Timeline und AI Chat: Geh-, Fahrrad-, Fahr- und unterstützte ÖPNV-Modi besitzen erwartete Dauer, realistische Bandbreite, Quelle, Messzeit, Datenalter und einen ehrlichen Live-Status. Wetter, Verkehr/Störung, Saison und Tageszeit beeinflussen die Bandbreite nur bei passendem beobachtetem Beleg; unbelegte Faktoren werden genannt und ignoriert. Eine Pufferänderung zeigt Bisher/Neu und schreibt erst nach ausdrücklicher Bestätigung über journey.v1 mit Revision, Belegsignatur, Idempotenz und Owner-Readback. Ablehnung, veraltete Revision oder veränderter Routenbeleg schreiben nichts. Sichtbar zeigte die echte Timeline Grande Beach Café → Restaurant Brechtmann: 68 Minuten erwartet, 66–77 Minuten realistisch, Places-Koordinaten, sieben Tage alt, Live-Lage unbekannt, bisher 10 und neu 12 Minuten. Abbruch plus Reload ließ 10 Minuten unverändert. Der AI Chat verwendete dieselbe Sprache und bot ohne belegte Quelle keine speicherbare Aktion. 234/234 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität sind grün. Kandidat f3d48e97 bleibt immutable; Stable wurde auf .104 zurückgesetzt.

**Nächster Abschlussnachweis:** P11 auf physischen iOS-/Android-Geräten mit Geh-, Fahrrad-, Fahr- und unterstütztem ÖPNV-Modus abnehmen; der aktive P15/P17-Composer verbraucht denselben Routenbeleg ohne zweite Wahrheit.

**Erhaltener technischer Umfang:** Real uncertainty bands, source age, missing live evidence and a separately confirmed Journey buffer command.

### P12 Einen Tag vorab durchspielen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Intelligence und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

App .113 / Core .232 liefert eine gemeinsame, nicht mutierende Tagesprobe für Timeline und Luvia AI. Ein realer Tag wird deterministisch als günstiger, erwarteter und ungünstiger Verlauf mit simulierten Zeiten, Wegezeit, Tagesende, Quellenhinweisen und unbekannten Einflüssen projiziert. Context-Signale wirken nur mit Quelle, Beobachtungszeit und passender Aussage; unbekanntes Wetter, Verkehr/Störungen, Öffnungszeiten und Auslastung bleiben unbekannt. Der Core setzt Erfolgswahrscheinlichkeit und automatische Mutation ausdrücklich aus. Sichtbar zeigten Timeline und AI am 12.06.2027 dieselben zwei Momente und die drei Verläufe 7/9/16 Minuten Wege, jeweils Ende 21:30 Uhr. Schließen und Reload ließen zwei Momente und zehn Minuten Routenpuffer unverändert. 235/235 Safe Regression, NFR-0 3/3 und 30/30 Byteidentität sind grün; Kandidat d3553403 bleibt immutable, Stable wurde auf .104 zurückgesetzt.

**Nächster Abschlussnachweis:** Die Tagesprobe auf realem iOS und Android physisch abnehmen und später mit echten zeitgestempelten Wetter-, Verkehrs-, Öffnungs- und Auslastungssignalen wiederholen; P15/P17 bindet den belegten Tagesentwurf jetzt in den kanonischen Trip Composer ein.

**Erhaltener technischer Umfang:** Simulate feasible best/expected/worst days and present a source-backed day-by-day Trip draft with maps, choices and alternatives; apply selected revisions only through confirmed owner commands.

### P13 Bei Störungen umplanen

**Stand:** VORBEREITET. **Zuständig:** Intelligence und betroffene Owner. **Einordnung:** M16.5 Schritte 15 bis 18.

Recovery-Grundlagen vorhanden; durchgängiger Live-Ausfallfall offen.

**Nächster Abschlussnachweis:** Sichtbare Änderungsvorschläge und getrennte Owner-Belege ohne stille Reparatur.

**Erhaltener technischer Umfang:** Generate evidence-backed recovery proposals and correlated per-owner receipts without silent repair.

### P14 Standort bewusst freigeben

**Stand:** VORBEREITET. **Zuständig:** Platform Location und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Deny-Pfad geprüft; echte Hardware- und Widerrufsmatrix offen.

**Nächster Abschlussnachweis:** Präzise, grob, manuell, verweigert, widerrufen und offline auf Geräten prüfen.

**Erhaltener technischer Umfang:** Prove precise/coarse/manual/denied/ revoked/expired location, purpose limitation, no implicit persistence and offline fallback.

### P15 Vorlieben richtig speichern

**Stand:** TEILWEISE. **Zuständig:** Identity und Trip. **Einordnung:** M16.5 Schritte 15 bis 18.

App .118/.119 liefert eine große wischbare Reisegefühl-Szene, einen bestätigungspflichtigen Intelligence-Reiseauftrag, alle gewählten Reisetage (bis 366), eine gemeinsame Places-Karte und bearbeitbare Tageszuordnung. Die neue Zielsuche verwendet den vorhandenen Geoapify-Gateway-Read ohne Google-Abhängigkeit; Rom und Lissabon wurden öffentlich gefunden und bestätigt. Der öffentliche Kategoriepfad zeigte fünf reale Lissabon-Orte über acht Reisetage. Yuki Ramen wurde vom ersten auf den achten Tag verschoben. Der echte KI-Aufruf antwortete dagegen wiederholt mit HTTP 429 / credit_balance_exhausted; ein erfolgreicher öffentlicher Modelllauf ist nicht belegt. .119 zeigt dafür eine lesbare Meldung und verwirft einen alten Fehler bei geänderten Wünschen ohne automatische Wiederholungsschleife. 45 gezielte Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 36/36 öffentliche Byteidentität sind grün. Die kontrollierte lokale KI-Antwort und sechs simulierte Schreibaktionen ersetzen keine echte KI-/Kontoabnahme. Serverkorrektur 06.09.2026: Der genaue .119-Composer-Link lieferte vor dem Fix für die Zielsuche NETWORK_UNAVAILABLE; Gateway und Intelligence lehnten seine Origin mit HTTP 403 ab, während Stable erlaubt war. Die auf den eigenen Integration-Worker begrenzte Freigabe ist jetzt in Gateway v234 / 4.64.37 und Intelligence v37 / 4.35.1 veröffentlicht. Rom, Toskana und Lissabon wurden danach über den tatsächlichen places.v1-Such- und Auswahlvertrag in der Browser-Origin des Kandidaten bestätigt (2.730 / 1.213 / 1.039 ms, gültige Place-ID und Koordinaten). Das ist ein echter Browser-Vertragsnachweis; kein neuer angemeldeter UI-Klicklauf oder physischer iPhone-Nachweis. 30/30 gezielte Origin-/Auth-Verhaltensproben und 237/237 kontrollierte Regression sind grün; 32/32 erneut heruntergeladene Function-Quellen entsprechen nach Zeilenenden-Normalisierung dem Deployment-Commit. Frontend .119 und Stable .104 bleiben unverändert. Der bisherige Slider ist vom Nutzer als Gestaltung abgelehnt; drei Reisewelt-Konzepte sind dokumentiert, noch nicht umgesetzt.

**Nächster Abschlussnachweis:** Die gewählte spielbare Reisewelt mobil ausarbeiten und am tatsächlichen Versionslink sichtbar abnehmen. Danach echte KI-/Kontextplanung, bestätigte Kontoübernahme samt Wiederaufnahme, getrennte Identity-Übergabe und Trip-Lifecycle positiv belegen. Der abgelehnte Slider schließt keinen Designblock.

**Erhaltener technischer Umfang:** Distinguish request-only, Trip-scoped and durable preferences across discovery and Trip creation; protect sensitive traits and confirm every durable write.

### P16 Aus bewusstem Feedback lernen

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Feedback-Konzept und Teilgrundlagen; vollständiger produktiver Lebenszyklus offen.

**Nächster Abschlussnachweis:** Explizites Ergebnis, Grund, Zweck, Ablauf, Korrektur und Vergessen prüfen.

**Erhaltener technischer Umfang:** Learn only from an explicit outcome and reason, with scope, expiry, correction and deletion.

### P17 Reise vollständig verwalten

**Stand:** TEILWEISE. **Zuständig:** Trip. **Einordnung:** M16.5 Schritte 15 bis 18.

App .118/.119 liefert eine große wischbare Reisegefühl-Szene, einen bestätigungspflichtigen Intelligence-Reiseauftrag, alle gewählten Reisetage (bis 366), eine gemeinsame Places-Karte und bearbeitbare Tageszuordnung. Die neue Zielsuche verwendet den vorhandenen Geoapify-Gateway-Read ohne Google-Abhängigkeit; Rom und Lissabon wurden öffentlich gefunden und bestätigt. Der öffentliche Kategoriepfad zeigte fünf reale Lissabon-Orte über acht Reisetage. Yuki Ramen wurde vom ersten auf den achten Tag verschoben. Der echte KI-Aufruf antwortete dagegen wiederholt mit HTTP 429 / credit_balance_exhausted; ein erfolgreicher öffentlicher Modelllauf ist nicht belegt. .119 zeigt dafür eine lesbare Meldung und verwirft einen alten Fehler bei geänderten Wünschen ohne automatische Wiederholungsschleife. 45 gezielte Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 36/36 öffentliche Byteidentität sind grün. Die kontrollierte lokale KI-Antwort und sechs simulierte Schreibaktionen ersetzen keine echte KI-/Kontoabnahme. Serverkorrektur 06.09.2026: Der genaue .119-Composer-Link lieferte vor dem Fix für die Zielsuche NETWORK_UNAVAILABLE; Gateway und Intelligence lehnten seine Origin mit HTTP 403 ab, während Stable erlaubt war. Die auf den eigenen Integration-Worker begrenzte Freigabe ist jetzt in Gateway v234 / 4.64.37 und Intelligence v37 / 4.35.1 veröffentlicht. Rom, Toskana und Lissabon wurden danach über den tatsächlichen places.v1-Such- und Auswahlvertrag in der Browser-Origin des Kandidaten bestätigt (2.730 / 1.213 / 1.039 ms, gültige Place-ID und Koordinaten). Das ist ein echter Browser-Vertragsnachweis; kein neuer angemeldeter UI-Klicklauf oder physischer iPhone-Nachweis. 30/30 gezielte Origin-/Auth-Verhaltensproben und 237/237 kontrollierte Regression sind grün; 32/32 erneut heruntergeladene Function-Quellen entsprechen nach Zeilenenden-Normalisierung dem Deployment-Commit. Frontend .119 und Stable .104 bleiben unverändert. Der bisherige Slider ist vom Nutzer als Gestaltung abgelehnt; drei Reisewelt-Konzepte sind dokumentiert, noch nicht umgesetzt.

**Nächster Abschlussnachweis:** Die gewählte spielbare Reisewelt mobil ausarbeiten und am tatsächlichen Versionslink sichtbar abnehmen. Danach echte KI-/Kontextplanung, bestätigte Kontoübernahme samt Wiederaufnahme, getrennte Identity-Übergabe und Trip-Lifecycle positiv belegen. Der abgelehnte Slider schließt keinen Designblock.

**Erhaltener technischer Umfang:** Read, create, update, switch, archive, delete and restore with dependency previews and Trip receipts. One Trip Composer serves guided, quick-start and AI-assisted draft entry modes without duplicating Trip truth.

### P18 Erinnerungen und Geschichten

**Stand:** VORBEREITET. **Zuständig:** Memory und Media. **Einordnung:** M16.5 Schritte 15 bis 18.

Getrennte Owner vorhanden; komplette neue Produktabnahme offen.

**Nächster Abschlussnachweis:** Erstellen bis Wiederherstellen mit Quellen und unveränderter Media-Zuständigkeit.

**Erhaltener technischer Umfang:** Create, edit, connect, share, archive, remove and restore source-labelled memories without copying Media truth.

### P19 Abgeleitetes Reisezielmodell

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Twin-Projektionen vorhanden; vollständiger belegter Lebenszyklus offen.

**Nächster Abschlussnachweis:** Ablauf, Provenienz und Invalidierung ohne zweite Ortswahrheit beweisen; Wetter, Saison, Feiertage, Events, Öffnung, Wege und Budget als getrennte datierte Belege projizieren.

**Erhaltener technischer Umfang:** Build an expiring, derived and fully provenance-labelled context matrix for destination, weather, season, special dates, events, opening, mobility and budget without becoming destination truth.

### P20 Verifizierte Veranstaltungsquellen

**Stand:** OFFEN. **Zuständig:** Places Event Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Quellen- und Lizenzfreigabe bleibt ein eigenes Gate.

**Nächster Abschlussnachweis:** Quellen, Attribution, Bilderrechte, Aktualität und erlaubtes Caching vor Ingestion festlegen.

**Erhaltener technischer Umfang:** Define accepted providers, licences, attribution, cache/freshness, image rights and any separately authorized infrastructure boundary before live event ingestion.

### P21 Veranstaltungen verlässlich normalisieren

**Stand:** VORBEREITET. **Zuständig:** Places und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Fixtures und fehlende-Quelle-Pfade vorhanden; positive Quelle offen.

**Nächster Abschlussnachweis:** Keine synthetischen Events; Feldquellen, Konflikte, Dubletten und Geometrie prüfen.

**Erhaltener technischer Umfang:** Normalize provider-native claims, field provenance, freshness, deduplication, conflicts and verified geometry with zero synthetic events.

### P22 Veranstaltungskalender

**Stand:** VORBEREITET. **Zuständig:** Journey und Experience. **Einordnung:** M16.5 Schritte 15 bis 18.

Kalender-/Eventgrundlagen vorhanden; kompletter öffentlicher Ablauf offen.

**Nächster Abschlussnachweis:** Tag, Woche und Reisezeitraum mit Karte, Details und Timeline testen.

**Erhaltener technischer Umfang:** Deliver day, week, Trip range, filters, Timeline, Compass-coloured MapLibre and bottom-up details.

### P23 Zeit und Karte gemeinsam filtern

**Stand:** VORBEREITET. **Zuständig:** Experience und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Time-Brush-Teile lokal geprüft.

**Nächster Abschlussnachweis:** Zeitfenster, Kartenausschnitt und Liste per Maus, Touch und Tastatur synchron abnehmen.

**Erhaltener technischer Umfang:** Synchronize time range, map extent, pins, list, pointer, touch, keyboard and Reduced Motion.

### P24 Vom Event zur Erinnerung

**Stand:** OFFEN. **Zuständig:** Memory. **Einordnung:** M16.5 Schritte 15 bis 18.

Durchgängige echte Veranstaltungskette nicht belegt.

**Nächster Abschlussnachweis:** Besuch und Medien bewusst auswählen; Memory-Befehl mit bestätigtem Ergebnis.

**Erhaltener technischer Umfang:** Connect a verified event and explicitly selected visit/media evidence to a confirmed Memory command.

### P25 Kultureller Kontext

**Stand:** OFFEN. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Quellengebundener Produktumfang erhalten.

**Nächster Abschlussnachweis:** Attributierbare Informationen und ehrliches Fehlen von Wissen zeigen.

**Erhaltener technischer Umfang:** Provide attributable, source/version-bound context; unavailable evidence remains unavailable rather than generated.

### P26 Freie Zeit sinnvoll entdecken

**Stand:** OFFEN. **Zuständig:** Journey und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

90-Minuten-Kartenfunktion ist Grundlage, kein vollständiges Eventprodukt.

**Nächster Abschlussnachweis:** Nur verifizierte, saisonal und zeitlich passende Events oder Places anbieten; freie Zeit auch bewusst frei lassen und dieselbe Places-Karte verwenden.

**Erhaltener technischer Umfang:** Rank optional verified events and Places inside an open Journey window through the shared map, with weather, season, budget and an honest “keep free” outcome.

### P27 Gemeinsame und unterschiedliche Wünsche

**Stand:** VORBEREITET. **Zuständig:** Collaboration und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Für-uns-Lesemodell vorhanden; Mitreisenden-Owner-Ausbau ausstehend.

**Nächster Abschlussnachweis:** Einwilligung, Minderheiten und fehlende Profile ohne erfundene Gruppenfreigabe prüfen.

**Erhaltener technischer Umfang:** Explain consented common ground and minority impact while Collaboration writes remain owner-gated.

### P28 Alternativen bei schlechtem Wetter

**Stand:** VORBEREITET. **Zuständig:** Intelligence Booking Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Vorschlagsgrundlagen vorhanden; echter Event- und Wetterablauf offen.

**Nächster Abschlussnachweis:** Vorhersage von Absage unterscheiden; Buchung und Tagesplan separat bestätigen.

**Erhaltener technischer Umfang:** Distinguish forecast risk from official cancellation and require separate Booking/Journey confirmations.

### P29 Änderungen bei Ort und Veranstaltung

**Stand:** VORBEREITET. **Zuständig:** Places Event Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Drift-Konzept und Fixtures vorhanden.

**Nächster Abschlussnachweis:** Belegte Orts-, Zeit- und Statusänderung von Quellenausfall unterscheiden.

**Erhaltener technischer Umfang:** Detect source-backed time, status, venue and coordinate changes; outage is unknown, not cancellation.

### P30 Tagesplan mit Quellen abgleichen

**Stand:** VORBEREITET. **Zuständig:** Journey und Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Reconciliation-Grundlagen vorhanden.

**Nächster Abschlussnachweis:** Sichtbare Differenz und getrennte bestätigte Befehle mit Versionskontrolle.

**Erhaltener technischer Umfang:** Reconcile verified schedules with Journey and Booking through visible diffs and separately confirmed commands.

### P31 Veranstaltungen räumlich und zeitlich verbinden

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Abgeleitete Graph-Grundlagen; vollständige Live-Evidenz offen.

**Nächster Abschlussnachweis:** Nur referenzierte Owner-Fakten; Ablauf und Invalidierung sämtlicher Kanten.

**Erhaltener technischer Umfang:** Derive expiring event/place/time/journey/ route/booking/weather/memory edges from owner/source evidence only.

### P32 Veranstaltungsprodukt öffentlich abnehmen

**Stand:** OFFEN. **Zuständig:** Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

Positive aktuelle S16.09 bis S16.12 Gesamtmatrix fehlt.

**Nächster Abschlussnachweis:** Live-Quellen, Bilder, Karte, Wetter, Drift und offline zusammen belegen.

**Erhaltener technischer Umfang:** Prove live sources, images, map, brushing, drift, weather recovery and offline/freshness states.

### P33 Veranstaltungen vollständig im Chat

**Stand:** OFFEN. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Einzelne Grundpfade; produktive Gesamtabdeckung offen.

**Nächster Abschlussnachweis:** Suchen, erklären, planen, buchen, vorschlagen und erinnern über richtige Owner.

**Erhaltener technischer Umfang:** Search, refine, explain, open, plan, book, propose to a group and save to Memory through the existing chat.

### P34 Mehrere Wünsche und Sprachen

**Stand:** TEILWEISE. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Semantische Routing-Grundlagen vorhanden; alle Owner nicht erschlossen.

**Nächster Abschlussnachweis:** Gemischte Sprache, Umgangssprache, relative Zeiten, Budget, freie Reisebeschreibung und widersprüchliche Wünsche im KI-Trip-Entwurf testen.

**Erhaltener technischer Umfang:** Preserve mixed-language, colloquial, relative, budget-bound and conflicting wishes across every owner, including free-text Trip Composer input.

### P35 Alle Bedienaktionen auch über AI

**Stand:** TEILWEISE. **Zuständig:** Intelligence und Domain Owner. **Einordnung:** M16.5 Schritte 15 bis 18.

330 Inventarzeilen; nur 7 als PUBLIC_E2E_PASS klassifiziert.

**Nächster Abschlussnachweis:** Inventarisierte Aktionen, einschließlich Timeline-Karte, Vormerken, Trip-Entwurf und Reiseplan-Übernahme, durch den AI-Chat vollständig prüfen oder explizit sperren; Registry-Zeilen allein sind kein Ausführungsnachweis.

**Erhaltener technischer Umfang:** Every supported user action has an owner command and the complete mutation protocol or an explicit block, including Place selection, Trip drafts, bookmarks and confirmed plan application.

### P36 Unsichere Aktionen zuverlässig verhindern

**Stand:** TEILWEISE. **Zuständig:** Domain Owner und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

B0-Sicherheitskontrollen belegt; laufendes Gate für jeden Ausbau.

**Nächster Abschlussnachweis:** Fremde Daten, veraltete Vorschau, Doppelklick, Teilausfall und verweigerte Rechte testen.

**Erhaltener technischer Umfang:** Cover foreign data, stale preview, duplicate execution, partial failure, offline and privacy denial.

### P37 Vollständige Bedienmatrix

**Stand:** OFFEN. **Zuständig:** Integration und Platform. **Einordnung:** M16.5 Schritte 15 bis 18.

Aktuelle Browser-Teilabnahmen vorhanden; physische Gesamtmatrix offen.

**Nächster Abschlussnachweis:** Desktop, iOS, Android, Tastatur, Offline, GPS, Gruppe und Reduced Motion schließen.

**Erhaltener technischer Umfang:** Real desktop/mobile/touch/keyboard/reload/back/ Reduced-Motion/cold-warm/offline-reconnect/GPS/group/provider evidence.

### P38 Offline Konflikte verbindlich entscheiden

**Stand:** OFFEN. **Zuständig:** Journey Collaboration Platform. **Einordnung:** M16.5 Schritte 15 bis 18.

Keine vollständige CRDT-Produktautorisierung aus einem Plan ableiten.

**Nächster Abschlussnachweis:** ADR mit Owner, Schema, Rechten und Konfliktstrategie vor Umsetzung.

**Erhaltener technischer Umfang:** Separately authorize the Journey/ Collaboration owner, schema, rights, conflict and reconciliation design.

### P39 Jeden Slice reproduzierbar veröffentlichen

**Stand:** ERHALTUNGSGATE. **Zuständig:** Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

App 13.82.168.104 / Core 4.82.223: Runtime-Commit 5e8f37985eb5ae76c0247ecfb11410bcc107c677, Worker 7cda6e20-3b33-442a-b5e6-1c2da8256faf, Gateway v233 / 4.64.36 / Places 4.38.15-exact-google-media-category-matrix, 233/233 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität. 33/33 öffentliche Kategorie-/Küchenproben und der sichtbare Food-, Shopping-, Chinesisch-, Zoom- und exakte Wikimedia-Bildpfad sind grün. Archiv: 89.026.357 Bytes, SHA-256 713C216C53C71AE4A9D90B1BFEA8CC1679B1B5ABE6B05181646663F4AF34A8D6. Main und Production unverändert.

**Nächster Abschlussnachweis:** Jeder neue Runtime-Slice erhält Tests, sichtbare Desktop-/Mobile-Abnahme, neue immutable Version, 30/30 öffentliche Byte-Gleichheit und einen passenden Frontend- und Gateway-Rückfall.

**Erhaltener technischer Umfang:** Commit, App/Core/cache/SW, archive/hash, Stable/Immutable byte equality and exact rollback.

### P40 Alternative Urlaubsverläufe vergleichen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence und Journey. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten; kein abgeschlossenes Produkt.

**Nächster Abschlussnachweis:** Probabilistische Szenarien, Randbedingungen und erklärbare Auswahl nach späteren Daten- und Owner-Gates.

**Erhaltener technischer Umfang:** Simulate alternative future Trip branches using probabilistic graphs, Monte Carlo, constraints and Pareto fronts; selection creates owner previews and never an automatic mutation.

### P41 Eigene Reiseregeln verbindlich machen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence und Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten.

**Nächster Abschlussnachweis:** Versionierte harte und weiche Regeln mit verständlichem Konfliktnachweis.

**Erhaltener technischer Umfang:** Compile user-authored hard and soft rules into a versioned policy DSL and expose understandable policy proof/violation results before every plan and command.

### P42 Jede wesentliche Aussage belegen

**Stand:** SPAETERES GATE. **Zuständig:** Platform und Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Bestehende Evidenzgrundlagen ersetzen noch kein vollständiges Mesh.

**Nächster Abschlussnachweis:** Quellenalter, Hash, Widerspruch und abhängige Invalidierung über Owner hinweg prüfen.

**Erhaltener technischer Umfang:** Track every material claim with owner, source, observation/freshness, evidence class, hash, contradiction and downstream dependency invalidation.

### P43 Mobilität und Energie berücksichtigen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence Identity Journey. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Sensibler Zukunftsumfang; keine implizite Gesundheitserfassung.

**Nächster Abschlussnachweis:** Mit ausdrücklicher Einwilligung Wege, Hitze, Pausen und Belastung modellieren; keine Diagnose.

**Erhaltener technischer Umfang:** With explicit consent, simulate mobility, surfaces, steps, lifts, heat, sensory load, rests and fatigue; never diagnose or silently infer sensitive traits.

### P44 Private Gruppenwünsche fair abstimmen

**Stand:** SPAETERES GATE. **Zuständig:** Collaboration und Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt echten Membership-Owner und Datenschutzmodell.

**Nächster Abschlussnachweis:** Verständliche Fairness und private Aggregation ohne Offenlegung einzelner Einschränkungen.

**Erhaltener technischer Umfang:** Use secure aggregation and explainable fairness objectives such as minimax regret and Nash welfare without disclosing private member constraints.

### P45 Reiseassistenz ohne Netz

**Stand:** SPAETERES GATE. **Zuständig:** Platform Intelligence Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt M19 und native Infrastruktur.

**Nächster Abschlussnachweis:** Verschlüsselte, ablaufende Ortskapseln mit Quellen und kontrolliertem späterem Abgleich.

**Erhaltener technischer Umfang:** Provide encrypted Destination Capsules containing a local intent model, owner projections, map/routing data, translations, verified snapshots and conflict-aware reconciliation.

### P46 Kamera und Audio in nächste Schritte übersetzen

**Stand:** SPAETERES GATE. **Zuständig:** Platform Media Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt native Ports und Zustimmung.

**Nächster Abschlussnachweis:** Menü, Fahrplan oder Ticket als belegte Aussage mit Owner-Vorschau; keine direkte Mutation.

**Erhaltener technischer Umfang:** Convert consented camera/audio input such as a menu, poster, timetable, ticket or announcement into redacted, verified claims and owner previews—not direct truth or mutation.

### P47 Aktuelle Lage am Reiseziel verstehen

**Stand:** SPAETERES GATE. **Zuständig:** Places und Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt lizenzierte aktuelle Felddaten.

**Nächster Abschlussnachweis:** Gemessen, vorhergesagt und unbekannt bei Andrang, Wetter und Zugänglichkeit unterscheiden.

**Erhaltener technischer Umfang:** Project measured, predicted and unknown crowd, transit, weather, wind, heat, noise and accessibility states as a source-labelled spatio-temporal MapLibre field.

### P48 Auswirkungen von Reisevarianten vergleichen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten; kein erfundener universeller Nachhaltigkeitsscore.

**Nächster Abschlussnachweis:** Komfort, Kosten, Zugang, lokale Wirkung und Umwelt als nachvollziehbare Zielkonflikte zeigen.

**Erhaltener technischer Umfang:** Compare comfort, price, accessibility, local benefit, crowd displacement and environmental impact as an auditable Pareto space without a fabricated universal score.

### P49 Große Reiseunterbrechungen bewältigen

**Stand:** SPAETERES GATE. **Zuständig:** Booking Journey Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt echte Providerkommandos und Kompensationen.

**Nächster Abschlussnachweis:** Befristete Optionen, korrelierte Belege und bestätigte providerabhängige Wiederherstellung.

**Erhaltener technischer Umfang:** Coordinate major disruptions through provider-aware saga orchestration, expiring options, correlated receipts and lawful compensating commands after explicit confirmation.

### P50 Reisenachweise und Anspruchsunterlagen

**Stand:** SPAETERES GATE. **Zuständig:** Travel Wallet Booking Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt sichere Dokumenten- und Buchungsgrundlagen.

**Nächster Abschlussnachweis:** Verschlüsselte Belegchronik; Nutzer prüft und versendet Anträge selbst.

**Erhaltener technischer Umfang:** Build an encrypted, hash-linked evidence chronology from Booking/provider/owner receipts and prepare source-backed claim packages that the user must review and submit.

## Nachweise und Grenzen

Maßgebliche Messberichte im Repository sind PROVIDER-BUDGET-ACCEPTANCE-20260904, MAP-MOBILE-SPEED-ACCEPTANCE-20260904, TRIP-MAP-EXPERIENCES-ACCEPTANCE-20260904, CUISINE-MAP-PINS-ACCEPTANCE-20260904 und STAYS-SHARED-ACCEPTANCE-20260904 unter docs/modularization. Die älteren P04/P05-Belege stehen im archivierten B1-Handout und Ausführungsplan.

Lokale Belege liegen unter C:/Users/fabia/Documents/ChatGPT/Luvia/outputs: regression37-release.log, public-byte-proof37.json, provider-cuisine-audit37.json, here-live-activation37.json, here-final-activation37.json sowie stays-bicycle37.png, stays-walk37.png und places-mobile-bicycle37.png. Die Livebilder zeigen Wege, nicht die vollständige Versorgung mit Ortsfotos.

Vollständige echte Place-Fotos, positive Hotelpreise/Buchbarkeit, vollständige AI-Mutationsabdeckung, physische iOS/Android-Abnahme, echte Mehrnutzerprüfung und die vollständige Golden Journey bleiben offen. Die neue verknüpfte Bildanreicherung ist fixturegeprüft; beim letzten Holstentor-Versuch wurde kein neuer Livefotobeleg gewonnen.

Die bestehende AI-Registry enthält 330 semantische Aktionen und 24 Runtime-Aktionen. Sie klassifiziert 7 Zeilen PUBLIC_E2E_PASS, 58 REGISTERED_PARTIAL, 1 PARTIAL, 229 MISSING, 14 NATIVE_CHAT, 10 NOT_REQUIRED und 11 NOT_APPLICABLE. 246 öffentliche Owner-Bindungen und 947 Datenmarker haben andere Nenner. Neue Kartenaktionen müssen gegen dieses ältere Inventar abgeglichen werden; die Zahlen beweisen keine vollständige aktuelle Abdeckung.

## 13 Erhaltener technischer M18 Blueprint

Der folgende technische Anhang erhält die detaillierten bestehenden Zielverträge. Seine Zukunftsformen sind Sollumfang, keine aktuelle Implementierungsbehauptung. Zahlen zur aktuellen Registry stehen ausschließlich im Statusabschnitt.

## M18 Core blueprints

All six new Cores follow the same owner-first delivery sequence: read-only
inventory and ADR; public Contract, Commands, Events and state machine;
browserless policy tests; explicitly scoped persistence/security changes under the applicable user authorization;
Web and native adapters; Experience/Intelligence integration; regression,
Preview, Production and twenty-stream closeout. Consumers never write private
owner persistence, and every mutation carries actor, scope, idempotency,
expected version, correlation and an owner receipt.

### M18.1 Collaboration / Membership Core

- Owns collaboration spaces, memberships, invitations, roles, grants, join
  requests and audit history; Identity, Trip, Journey, Booking and Media remain
  independent owners referenced only through IDs and Contracts.
- Publishes `collaboration.membership.v1`, membership projections and events;
  commands cover invite, accept/decline/revoke, role change, remove, leave and
  owner transfer with explicit risk/confirmation policy.
- Enforces deny-by-default server authorization, RLS, expiring hashed invite
  tokens, replay protection and auditable role transitions.
- Uses DeepLink, Sharing, Notification, Network, Lifecycle, SecureStorage and
  OfflineCache Ports. Offline state is a read model; critical changes remain
  pending until an owner receipt confirms them.
- Acceptance includes the complete role/permission matrix, RLS negative cases,
  invite expiry/revoke/replay, races/idempotency, offline/reconnect, deep-link
  F5, accessibility, browserless smoke and Production provenance.

### M18.2 Attention / Notification Intent Core

- Owns attention policies, channel preferences, quiet hours, semantic
  notification intents, scheduling, dedupe, Inbox/read/snooze state and
  delivery receipts; originating Domain facts remain with their owners.
- Publishes `attention.notification-intent.v1`. Domain owners request semantic
  intents with source, urgency, expiry, dedupe key and Deep-Link Intent instead
  of embedding provider-specific push behavior.
- Deterministic policy covers consent, local timezone/DST, quiet hours,
  frequency caps, grouping, suppression reason and security priority.
- Notification, Lifecycle, Network and DeepLink Ports isolate push, e-mail,
  in-app and future providers. Minimal lock-screen payloads, token rotation,
  retention and unknown-delivery recovery are mandatory.
- Acceptance includes timezone/DST, opt-in/out, multi-device, dedupe/retry,
  provider outage, offline/reconnect, deep links, rate limits, accessibility,
  browserless policy smoke and real delivery receipts.

### M18.3 Travel Wallet / Documents Core — priority

- Owns secure travel documents, versions, classification, validity,
  verification claims, share grants, expiry/checklist projections and encrypted
  asset references; Booking, Trip, Identity and Media keep their own Truth.
- Publishes `travel-wallet.documents.v1` with redacted snapshots and
  capability-based reads. Commands cover import/capture, classify, correct,
  replace, verify, link, share/revoke, archive and two-stage deletion.
- Covers ID/passport references, visa/entry material, tickets/boarding passes,
  confirmations, insurance and specially governed health evidence through a
  declarative document-type registry.
- Requires threat modelling and data classification, encryption/key rotation,
  short-lived signed URLs, MIME/size/malware checks, EXIF redaction, RLS,
  step-up authentication and absolute exclusion from logs/analytics/ledgers.
- Uses SecureStorage, MediaPicker/Capture/Storage, Permission, Device,
  OfflineCache, Network and Sharing Ports. Offline cache is encrypted,
  selective, expiring and remotely revocable; version/hash conflicts are
  explicit.
- OCR, extraction, translation and reminders require consent, field provenance
  and confidence. Raw documents do not go to external models by default;
  sharing, overwrite, revoke and deletion never execute autonomously.
- Acceptance includes IDOR/RLS, signed URL expiry, malware/MIME, log redaction,
  OCR confidence, version conflicts, offline/revoke, export/deletion proof,
  backup/restore, native protection capabilities, browserless state smoke and
  independent security/privacy approval.

### M18.4 Reviews / Reputation Core

- Owns Luvia reviews, revisions, rating dimensions, publication/moderation
  state, reports, appeals, helpful votes and transparent reputation
  projections. Places/Booking remain owners; provider reviews are attributed
  read models, never copied Luvia Truth.
- Publishes `reviews.reputation.v1`; commands cover draft, publish, edit,
  withdraw, report, vote, moderation and appeal. Verified visits are evidence,
  not a hidden requirement or global social score.
- Aggregates expose sample size, dimensions, recency and uncertainty.
  Moderation has reason codes, human review and appeal; AI may assist but not
  make final high-risk decisions.
- Privacy includes lawful attribution/pseudonymization, minimum Identity
  projection, media consent, blocking/reporting and protection against leaking
  sensitive travel or presence data.
- Acceptance includes RLS/ownership, revision history, aggregate correctness,
  spam/rate-limit/Sybil scenarios, moderation/appeal, deletion, offline drafts,
  media safety, accessibility, browserless policy smoke, load and Production
  rollback evidence.

### M18.5 Admin / Governance Core — mandatory

- Owns platform-administrative roles, capability grants, resource scopes,
  policy versions, delegations, approval requests, time-boxed break-glass
  sessions and immutable administrative audit receipts. Identity owns the
  person/authentication context; Collaboration owns trip/group membership;
  managed Domain Cores retain their own Truth and invariants.
- Publishes `admin.governance.v1` and `admin.audit.v1`. Canonical models include
  AdminPrincipalRef, AdminRole, Capability, ResourceScope, PolicyRule,
  RoleAssignment, Delegation, ApprovalRequest, BreakGlassSession, AuditEntry
  and AdminActionReceipt.
- Commands cover create/update/retire role, grant/revoke assignment, delegate,
  request/approve/deny high-risk change, suspend/reactivate subject, revoke
  sessions and open/close break-glass. Every command carries actor, purpose,
  scope, reason, idempotency key, expected version and correlation.
- Default deny, least privilege and separation of duties are server-enforced.
  Client visibility, cached projection, JWT convenience claim or hidden route
  is never sufficient authorization. Self-grant/self-escalation is forbidden;
  the last Superadmin cannot be removed or weakened without a recoverable,
  independently approved successor.
- Highest-risk changes require step-up authentication, explicit reason,
  dual control/four-eyes approval, expiry and immutable audit evidence.
  Break-glass is exceptional, time-boxed, narrowly scoped, alerted and reviewed;
  it is not a permanent Superadmin shortcut.
- Administrative UI is a dedicated Experience surface: overview, user and
  principal directory, roles, permission matrix, scopes, pending approvals,
  audit explorer, incident/break-glass console and system-health projections.
  The UI calls Admin commands and foreign owner commands; it never writes
  tables directly or becomes a second Domain owner.
- Intelligence may explain access, draft policy changes and flag anomalies.
  It may never grant/revoke Superadmin, approve its own proposal, open
  break-glass, suspend/delete accounts or autonomously perform highest-risk
  administrative actions.
- Native First uses AuthSession, SecureStorage, Device, Permission, Network,
  Lifecycle, Notification and DeepLink Ports. Offline Admin state is redacted
  read-only cache; mutation fails closed until online policy and owner receipts
  are available.
- Persistence/RLS/RPC/Edge work is a separately approved security migration.
  Acceptance includes full permission matrix, negative privilege-escalation
  and IDOR/RLS tests, concurrent grant/revoke, last-Superadmin protection,
  dual-control races, audit tamper evidence, break-glass expiry, session
  revocation, offline deny, reload/deep-link, accessibility, browserless policy
  smoke, Preview/Production provenance and independent security review.

### M18.6 Social / Experience Graph Core — strategic

- Product position: Luvia is not a classic feed/follower/like network. It is a
  Social Travel Intelligence Network that answers which consented experiences
  from trusted or behaviorally compatible people are relevant to the active
  trip and can be transformed into owner-confirmed action.
- Owns consented Experience Graph edges and lifecycle, circles/relationships,
  visibility and blocking, Travel Twin relationship state, Experience Drops,
  Echo eligibility/delivery state, Trip Fork provenance and inspiration
  signals. It does not copy Trip, Places, Booking, Memory, Media, Identity,
  Reviews, Collaboration, Attention or monetization truth.
- Publishes `social.experience-graph.v1`; `social.v1` remains the compatibility
  name. Public projections cover relevant experiences, relationship/circle
  state, privacy-safe compatibility evidence, Echo/Drop/Fork provenance and
  inspiration receipts—never a hidden global popularity score.
- Anti-vanity is a binding product invariant: no follower race, public like
  count, engagement feed or influencer override. Relevance is explained using
  trust, context, recency, verified evidence and similarity with uncertainty.
- Travel DNA remains split correctly: Identity owns explicit preferences;
  Intelligence owns inferred behavioral models and match calculation; Social
  consumes only a privacy-safe vector/projection and owns durable consented
  relationship state, not the private model.
- Travel Twins: Intelligence calculates explainable compatibility; Social
  governs discovery consent, candidate visibility, dismissal/blocking and any
  accepted connection. Match percentages include provenance, uncertainty and
  minimum-sample gates.
- Luvia Echoes: Memory owns source memories; Places owns location references;
  Social owns the consented person-to-experience connection and Echo lifecycle;
  Attention owns notification intent/delivery and Platform LocationPort owns
  device location access.
- Experience Drops: Social owns the message, audience and lifecycle while
  Places/Media/Identity are referenced by public IDs/projections. Audiences are
  private, family, friends, circle or moderated community; precise presence is
  never inferred or exposed without consent.
- Fork my Trip: Intelligence adapts an inspiration projection; Trip creates the
  new trip through its owner command; Social stores provenance/credit only.
  No booking, schedule or traveler truth is copied as Social truth.
- Social Compass and Social Booking combine Social relevance with Places,
  Booking and Journey public contracts. Booking owns availability,
  reservation, provider status, partner attribution and commission; Social
  supplies inspiration provenance and never calls providers or Booking tables.
- Verified Experience is an evidence-backed attestation referencing owner
  receipts with consent. Reviews owns authored review/moderation truth; Social
  may rank relevance but cannot convert evidence into an undisclosed rating.
- Group Intelligence remains Collaboration + Intelligence + Journey: members
  and votes are Collaboration truth, preference reasoning is Intelligence and
  the plan is committed through Journey/Trip owner commands.
- Safety/privacy requires explicit audience and reuse consent, purpose binding,
  blocking/reporting, child/minor protection, location minimization, retention,
  deletion propagation, export, anti-Sybil/rate limits, moderation and no raw
  private Identity/Memory/Booking payload in graph or model logs.
- M16.5 designs Social as relevant in-context cards, Compass explanations,
  Travel Twin evidence, Echoes, Drops and Fork provenance—never a generic
  Social tab or endless feed. Implementation starts only after the shared
  Corporate Design Freeze and a dedicated Social threat/consent model.
- Acceptance includes graph ownership/consent matrices, RLS/IDOR negatives,
  visibility/block/delete propagation, Twin evals and fairness, provenance,
  Echo geo/privacy gates, Fork idempotency, verified-evidence integrity,
  moderation, offline/reload, accessibility, browserless policy smoke,
  Production provenance and twenty-stream synchronization.

### M18.7 Universal Search / Projection Index

Universal Search is explicitly not a Domain owner. It consumes approved events
and stores source owner, entity ID, version, visibility and freshness. Search
returns owner references; authorization, details and commands resolve through
the owner. Reindex, tombstones, erasure propagation, ranking evals and offline
search projections are mandatory gates.

### M18.8 Luvia Intelligence Product Evolution II

M8.5-M16 already delivered a real Intelligence foundation, not merely a UI
mockup: browserless owner Core, capability/tool policy, model routing,
evidence, Rich Results, Action Ledger, R0-R3 confirmation/recovery and 24 typed runtime actions in the current registry. The restaurant/day/
Booking chat is the first production vertical slice.

Evolution II turns that foundation into the system-wide Luvia assistant after
the missing owners expose safe contracts:

- complete Capability/Tool Registry across Trip, Places, Booking, Journey,
  Memory, Identity, Collaboration, Social, Attention, Wallet, Reviews and
  authorized Admin explanation/draft tools;
- natural-language commands and multi-step plans with explicit owner,
  capability, risk, confirmation, idempotency, receipts and recovery for every
  action;
- context aggregation over public projections, active trip, time, weather,
  group constraints, Travel DNA projection and Social relevance without
  copying foreign Domain Truth;
- proactive but consented day, booking, conflict, document, attention and
  location-aware signals with explainable timing and easy suppression;
- controlled personalization and Intelligence Memory with provenance,
  correction, forgetting, export and privacy boundaries;
- model routing by capability, latency, privacy, cost and reliability plus
  deterministic fallback and unknown-outcome reconciliation;
- Voice and Multimodal input/output, camera/document handoff and native iOS/
  Android command surfaces through Platform Ports;
- cards, maps, media, comparisons, confirmations and owner receipts directly
  in the conversational surface instead of text-only answers;
- offline/degraded planning, resumable tasks and cross-device continuity
  without pretending that an unconfirmed foreign mutation succeeded;
- complete eval/telemetry for intent accuracy, tool selection, plan quality,
  hallucination, unsafe action, confirmation, latency, cost, accessibility,
  personalization and user correction.

Intelligence remains an orchestrator. High-risk Admin, Wallet, identity,
publication, relationship, booking and destructive actions remain owner- and
policy-controlled; no model receives direct foreign table/provider authority.


## 14 Quellenabgleich und Pflege

Diese Konsolidierung beruht auf Git-Stand c28621de, den gemessenen .37- und HERE-Abnahmen, den vorhandenen Architektur-/Owner-Registries und den vier vom Nutzer übergebenen Hauptquellen. Die Original-DOCX und eingefügten Handoffs werden unverändert als historische Referenz aufbewahrt. Dateihashes und Zuordnung werden im Quellennachweis geführt.

Die bisherigen Masterkapitel 1–3 zu Ziel, Grenzen und Status werden durch Kapitel 1–4 ersetzt. Kapitel 4–5 zur Architektur und zum Gesamtweg leben in Kapitel 6–9 fort. Kapitel 6–8 und 14–19 zu Builds, Git, Dokumentation, Tests, Streams, Legacy, Risiken, Zeit und Abschluss werden durch Kapitel 10–11 und die aktuelle Git-Evidenz geführt. Kapitel 9–12 zu Experience, AI, Places und Journey bleiben in Kapitel 2, 6, 8 und dem Paketkatalog erhalten. Kapitel 13 zu Supabase liegt in Kapitel 5 und 10. Kapitel 20 ist historischer M6-Einstieg. Kapitel 21 und Anhang E zu Native First liegen in Kapitel 7, 10 und den beibehaltenen Architektur-Guardrails.

Anhänge A–F bleiben als historische Versions-, Commit-, Kernprinzipien- und Übergabereferenz erhalten; aktuelle Einstiegspunkte stehen in den neuen Handoffs. Anhänge G–W dokumentieren frühere Meilensteinfortschreibungen und werden nicht als neue Starts wiederholt. Die in v5 zuletzt angehängten Roadmap-, Product-Reset-, P01–P50-, B0/B1- und Map-Abschnitte sind durch die aktuellen aktiven Dokumente ersetzt. Der vollständige ursprüngliche technische Text bleibt im Quellenarchiv auffindbar.

Aktuelle Statusdaten werden in docs/planning/status-plan.v1.json gepflegt. Der lesbare Statusplan, Masterfahrplan und die Handoffs dürfen nur Nachweise daraus oder aus ihren verlinkten Abnahmeberichten übernehmen. Historische Nachweise bleiben datiert. Bei jedem fachlichen Slice werden betroffene P-Pakete, nächste Abnahme, Providergrenzen und Releasebelege gemeinsam aktualisiert. Ein neuer Chat beginnt beim aktiven Handoff und prüft den tatsächlichen Git-Stand, statt einen alten Anhang als Gegenwart zu lesen.
