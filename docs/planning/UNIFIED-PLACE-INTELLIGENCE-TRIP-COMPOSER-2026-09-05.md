# Luvia Unified Place Intelligence und Trip Composer

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.89**, Core **4.82.211**. M16.5 Schritte 15–18 aktiv. P02/P03 bleibt der aktive Abschlussblock; der positive Passend-Pfad steht, der sichtbare Mengen-/Radiusvertrag wird gerade geschlossen. Apple ist geparkt.

**Zuletzt geliefert:** App .88, Gateway v206 und der kostenlose OSM-Evidenzpfad liefern öffentlich 25 vegetarisch oder vegan belegte Treffer ohne Steakhouse-Falschpositiv. Der sichtbare Test zeigte Alle 50, Passend 25, Passt-Pins, Zoom und Pinwechsel. Als letzte Wahrheitslücke wurde erkannt, dass die Evidenzsuche bis 8 km reichen konnte, während die Seite 3 km auswies. Kandidat .89 verwendet nun für beide Modi denselben `geography.searchRadiusMeters`-Wert. 229/229 Safe Regression und NFR-0 3/3 sind für den korrigierten Kandidaten grün.

**Nächster Schritt (AKTIV): App .89 veröffentlichen und den identischen Alle-/Passend-Radius sichtbar belegen.** Passend ist positiv, darf aber keinen größeren Suchraum verwenden als die sichtbare Alle-Menge. Der Code ist angeglichen; jetzt fehlt nur der öffentliche Bedienbeleg.

**Abnahme dieses Schritts:**

- App 13.82.168.89 / Core 4.82.211 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle und Passend verwenden denselben angezeigten Reisezielradius von 3 km.
- Passend zeigt mehrere echte, ausdrücklich vegetarisch oder vegan belegte Orte innerhalb dieses Bereichs.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; Pinwechsel und Kartenzoom bleiben bedienbar.
- 229/229 Safe Regression, NFR-0 und öffentliche Asset-Identität sind grün; Main und Production bleiben unverändert.

**Danach:** Nach dem Radiusbeleg folgt als ein gemeinsamer P03-Slice die identische Provider-ID und Begründung in Timeline-Vorschlägen und AI Chat sowie die technische Stay-Parität.

**Weiter offen:** P02/P03 aktiv: 3-km-Mengenvertrag, danach Flächenparität in Timeline, AI Chat und Stay sowie vollständige Kategorie-/Filtermatrix; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Status: **VERBINDLICHE PRODUKT- UND ARCHITEKTURENTSCHEIDUNG**

Aufgenommen: **2026-09-05**

Geltungsbereich: Places, Stays, Journey/Timeline, AI Chat, Trip-Erstellung, Booking, Events, Wetter und spätere Intelligence-II-Ausbaustufen

## 1. Produktentscheidung

Luvia verwendet für alle ortsbezogenen Erlebnisse eine gemeinsame **Place Intelligence**. Places, Stays, Timeline-Vorschläge, Reiseerstellung und AI Chat dürfen keine eigenen Kandidatenlisten, Profilregeln, Providerstrategien oder Ortsdetails entwickeln. Sie konsumieren dieselbe belegte Place-Menge und zeigen sie in ihrem jeweiligen Nutzungskontext.

Die Karte wird ebenfalls nicht kopiert. Die bestehende `places.v1`-Kartenprojektion wird in mehreren Oberflächen gemountet:

- Places und Stays als vollständige Discovery-Oberfläche;
- Journey/Timeline als Vorschlagskarte für einen Tag oder ein freies Zeitfenster;
- AI Chat als eingebettetes Rich Result für eine Such- oder Planungsaussage;
- Trip Composer als Auswahlfläche während der Reiseerstellung;
- später Events, Alternativen und Störungsplanung mit denselben Ortsidentitäten.

Ein Place bleibt über alle Oberflächen derselbe Place. Favorit, Vormerkung, Timeline-Planung, Besuch, Buchungsweg, Bild, Providerbeleg und Profilpassung dürfen sich deshalb nicht widersprechen.

## 2. Owner-Grenzen

```mermaid
flowchart LR
    I[Identity<br/>Profilvorlieben] --> X[Place Intelligence<br/>belegter Kandidatensatz]
    T[Trip<br/>Reiseziel, Zeitraum, Reisefarbe] --> X
    C[Context<br/>Wetter, Saison, Events, Öffnung, Budget] --> X
    P[Places Provider Gateway<br/>Geoapify, TomTom, HERE, Medienquellen] --> X
    X --> M[Gemeinsame places.v1<br/>Karten- und Ergebnisprojektion]
    M --> PL[Places / Stays]
    M --> TL[Journey / Timeline]
    M --> AI[AI Chat]
    M --> TC[Trip Composer]
    TL --> J[Journey Owner<br/>Tag, Zeit, Reihenfolge, Konflikte]
    AI --> J
    TC --> J
    PL --> B[Booking Owner<br/>Buchungsweg, Status, Beleg]
    TL --> B
    AI --> B
    TC --> B
```

Die Zuständigkeiten bleiben strikt:

- **Places** besitzt reale Ortsidentität, Discovery, Providerfakten, Kategorien, Filter, Geometrie und Medienreferenzen.
- **Identity** besitzt dauerhafte Profilvorlieben und deren bewusste Korrektur oder Löschung.
- **Trip** besitzt Reiseziel, Zeitraum, Teilnehmende, Reisefarbe, Reisesymbol und reisebezogene Wünsche.
- **Journey** besitzt Tage, Zeiten, Reihenfolge, freie Fenster, Konflikte und die abgeleitete Timeline.
- **Booking** besitzt Buchungs-, Reservierungs- und Einlasswege sowie Providerstatus und Belege.
- **Intelligence** gewichtet und erklärt öffentliche Owner-Projektionen. Sie erzeugt keine zweite Orts-, Reise-, Timeline- oder Buchungswahrheit.
- **Experience** stellt gemeinsame Karte, Karten, Sheets, Auswahlmuster und Animationen bereit.

## 3. Eine gemeinsame Place-Pipeline

Jede Oberfläche verwendet dieselbe fachliche Kette:

1. Aktive Reise und eindeutiges Reiseziel laden.
2. Relevanten Raum bestimmen: Reiseziel, sichtbarer Kartenausschnitt, Tagesroute oder bewusst freigegebener Standort.
3. Eine providerübergreifende Place-Kandidatenmenge laden.
4. Kategorien und sämtliche Filter mit Providerbelegen anwenden.
5. Harte Anforderungen wie Ernährung, Barrierefreiheit, Zeitraum und Budget fail-closed prüfen.
6. Profil-, Gruppen-, Reise- und Tagespassung auf derselben Kandidatenmenge berechnen.
7. Wetter, Saison, besondere Tage, Öffnungszeiten, Wege und Events als datierte Kontextbelege einbeziehen.
8. Ergebnis über dieselbe Karten- und Kartendarstellung ausgeben.
9. Favorisieren, Vormerken, Planen oder Buchen ausschließlich über den zuständigen Owner ausführen.
10. Ergebnis, Fehler, Teilstand, Herkunft, Aktualität und Rücknahme sichtbar machen.

`Alle` und `Passend` sind zwei Projektionen derselben Kandidatenmenge. `Passend` darf niemals eine getrennte Suche mit anderen Ortsidentitäten sein.

## 4. Timeline-Vorschläge

Die Timeline-Vorschlagsoberfläche wird als kontextgebundene Places-Karte aufgebaut:

- Der Reisetag oder das freie Zeitfenster setzt Datum, Start, Ende und vorhandene Timeline-Einträge.
- Die Karte startet am Reiseziel oder an der vorherigen bestätigten Station.
- Die sichtbaren Pins stammen aus `places.v1` und behalten Kategorie, Bild, Profilbeleg und Booking-Fähigkeit.
- Ein Pin fokussiert dieselbe Detailkarte wie in Places.
- Horizontales Wischen oder ein Pinwechsel synchronisiert Kartenfokus und Vorschlagskarte.
- Ein oder zwei belegte Treffer bleiben sichtbar; ein starres Soll von drei Treffern darf keinen falschen Gesamtausfall erzeugen.
- „Alle Richtungen entdecken“ öffnet dieselbe vollständige Places-Discovery im aktuellen Reise-, Tag- und Zeitkontext.
- „Zur Timeline“ erzeugt erst eine Journey-Vorschau. Ohne Bestätigung wird nichts gespeichert.

Timeline-Einträge wechseln auf Mobilgeräten durch längeres Drücken in den Bearbeitungsmodus. Bearbeitbare Einträge bewegen sich dann leicht wie iOS-App-Symbole. Reduced Motion deaktiviert die Animation. Ziehen, Pfeile und direkte Datum-/Uhrzeitwahl bleiben gleichwertige Bedienwege.

## 5. Nachtleben und Kategorie-Vollständigkeit

Die geringe Nachtleben-Abdeckung wird nicht als reale Ortslage akzeptiert, bevor die Provider- und Kategorienmatrix belegt ist. Die Prüfung erfolgt Kategorie für Kategorie und umfasst mindestens:

- Bars, Pubs, Cocktailbars und Weinbars;
- Clubs, Diskotheken und Tanzlokale;
- Lounges, Beachbars und Abendorte;
- Live-Musik, Musikvenues und Konzertorte;
- Casinos und ausdrücklich abendbezogene Entertainment-Orte;
- korrekte Abgrenzung zu Restaurants, Cafés, Hotels und allgemeinem Entertainment.

Für Timmendorfer Strand und Scharbeutz werden sichtbare UI-, AI-Chat- und Gateway-Proben mit Treffermenge, Provider, Radius, Dubletten, Kategoriebeleg und bewusstem Nullergebnis geführt. Ranking darf fehlende Providersegmente nicht verdecken.

## 6. Zustand nach Registrierung ohne Reise

Ein Account darf ohne aktive Reise existieren. Nach Abschluss des Profil-Onboardings zeigt Luvia einen leichten **Reisestart-Zustand** mit drei klaren Wegen:

1. **Meine erste Reise planen** – primäre Aktion zum Trip Composer.
2. **Luvia kennenlernen** – interaktive, unverbindliche Beispielreise ohne eigene Trip-Wahrheit.
3. **Mit Luvia sprechen** – AI Chat erklärt Möglichkeiten und kann nach Zustimmung den Trip Composer öffnen.

Die App erfindet keine aktive Reise und wechselt nicht automatisch in einen fremden oder historischen Trip. Inhalte ohne Reise bleiben Demonstration oder allgemeine Inspiration und werden deutlich als solche markiert.

## 7. Drei Einstiege, ein Trip Composer

Technisch gibt es genau einen Trip Composer mit drei Eingangsmodi. Die Modi verwenden dieselben Trip-, Identity-, Places-, Journey- und Booking-Contracts.

### 7.1 Geführt

Der vollständige bestehende Reise-Dialog wird ausgebaut:

- Reiseziel und eindeutige Ortsauflösung;
- Reisename;
- Reisefarbe und Reisesymbol;
- Reisezeitraum;
- Teilnehmende und Reisestil;
- Tempo, Mobilität, Interessen und harte Anforderungen;
- Budgetrahmen und gewünschte Ausgabenverteilung;
- Vorschlagsphase aus derselben Place Intelligence;
- Abschlussvorschau vor dem Anlegen oder Planen.

Nach Eingabe des Zeitraums zeigt Luvia erste belegte Vorschläge. Vorgeschlagene Bereiche richten sich nach Profil und Reisewunsch und umfassen unter anderem Essen und Trinken, Sehenswürdigkeiten, Natur, Aktivitäten, Shopping und Nachtleben.

### 7.2 Schnellstart

Der Schnellstart verlangt nur Reiseziel, Zeitraum und optional Teilnehmende. Luvia legt eine unvollständige, ehrlich gekennzeichnete Reise an und führt später schrittweise durch fehlende Angaben. Er ist sinnvoll für Menschen, die sofort speichern oder entdecken wollen, ohne das vollständige Onboarding zu durchlaufen.

### 7.3 Mit Luvia entwerfen

Der KI-gestützte Modus kombiniert Einfachauswahl, Mehrfachauswahl und Freitext. Mögliche Angaben sind:

- gewünschte Zahl und Art von Mahlzeiten, Cafés und Abendorten;
- Sehenswürdigkeiten, Natur, Kultur, Shopping und Aktivitäten;
- Ruhe, Dichte, spontane Zeit und Wegepräferenzen;
- Budget gesamt, pro Tag oder pro Kategorie;
- feste Termine, Muss-Orte und Ausschlüsse;
- Barrierefreiheit, Ernährung und Bedürfnisse der Gruppe;
- gewünschte Buchungsbereitschaft;
- persönliche Formulierungen wie „Wir möchten keinen durchgetakteten Urlaub“.

Die KI übersetzt diese Angaben in erklärbare Constraints. Harte und sensible Anforderungen werden deterministisch und quellengebunden geprüft. Das Ergebnis ist zunächst immer eine Vorschau, kein automatisch gespeicherter Reiseplan.

## 8. Vormerken und frühe Place-Auswahl

Vorschläge im Trip Composer haben drei sichere Aktionen:

- **Einplanen** – Tag, Uhrzeit und Dauer wählen; anschließend Journey-Vorschau und optional Booking-Prüfung.
- **Vormerken** – den Place ohne Datum als reisebezogene Merkliste speichern.
- **Nicht für diese Reise** – nur diese Vorschlagsrunde beeinflussen; dauerhaftes Lernen erfordert eine getrennte bewusste Bestätigung.

„Vorgemerkte Places“ erscheinen oberhalb der datierten Timeline in einem eigenen, einklappbaren Bereich. Sie bleiben Places-Owner-Wahrheit mit Trip-Bezug. Erst eine bestätigte Journey-Aktion erzeugt einen datierten Timeline-Eintrag.

## 9. KI-Reisepräsentation

Die vollautomatische Planung endet in einer visuellen Reisepräsentation:

- ein Tag nach dem anderen mit ruhigem Fade und der jeweiligen Reisefarbe;
- Karte, Route, Bilder und zentrale Tagesmomente;
- verständliche Begründung pro Auswahl;
- sichtbare Zeit-, Wege-, Öffnungs-, Budget-, Wetter- und Gruppenbelege;
- Alternativen und Unsicherheiten;
- bestätigte Buchungen getrennt von noch zu prüfenden Wegen.

Für jeden Tag und für die Gesamtreise gibt es vier Entscheidungen:

1. **So übernehmen** – erzeugt eine zusammenhängende Owner-Vorschau und speichert erst nach Bestätigung.
2. **Vorher anpassen** – Zeiten, Reihenfolge, Orte und freie Fenster bearbeiten.
3. **Alternative zeigen** – ersetzt noch nichts und nennt den Grund der Alternative.
4. **Diesen Teil verwerfen** – entfernt nur den Vorschlag aus dem Entwurf.

Die Präsentation darf nie behaupten, eine Buchung, Öffnung oder Eignung sei sicher, wenn der zuständige Owner dafür keinen aktuellen Beleg besitzt.

## 10. Äußere Einflüsse als Context Matrix

Luvia berücksichtigt äußere Einflüsse überall dort, wo sie eine Empfehlung oder Planung verändern. Jeder Kontext besitzt Quelle, Ort, Gültigkeitszeit, Aktualität und Unsicherheit.

### Zeit und Kalender

- Jahreszeit und Tageslicht;
- Wochentag und Uhrzeit;
- Schulferien und lokale Feiertage;
- Ostern, Weihnachten, Silvester, Halloween und weitere relevante Anlässe;
- Reisephase, Anreise, Abreise und Erholungstage.

### Wetter und Umwelt

- Temperatur, Niederschlag, Wind, Hitze, Kälte und Sicht;
- Sonnenaufgang und Sonnenuntergang;
- Strand-, Wasser-, Wander- und Fahrradbedingungen;
- wetterfeste Alternativen und bewusst freie Zeit.

### Reiseziel und Betrieb

- aktuelle Öffnungszeiten und saisonale Schließungen;
- verifizierte Veranstaltungen und temporäre Märkte;
- erwartete oder gemessene Auslastung, wenn eine lizenzierte Quelle existiert;
- Wege, Verkehr, ÖPNV, Fuß- und Fahrradrouten;
- lokale Besonderheiten, Distanzen und Tageslogik.

### Menschen und Reise

- Profil- und Trip-Vorlieben;
- Gruppenkonflikte und faire Abstimmung;
- Ernährung, Zugänglichkeit und Mobilität;
- Budget und Preisbelege;
- Tempo, Ruhe, Spontaneität und bereits geplante Momente.

Fehlt ein Beleg, markiert Luvia den Faktor als unbekannt. Die KI darf keine saisonalen Events, Öffnungszeiten, Preise oder Wetterlagen erfinden.

## 11. AI-Chat-Parität

Der AI Chat verwendet dieselben öffentlichen Reads und Commands wie die sichtbaren Oberflächen:

- dieselbe Destination und aktive Reise;
- dieselbe Place-Kandidatenmenge;
- dieselben Kategorien und Filter;
- dieselbe `Alle`-/`Passend`-Entscheidung;
- dieselbe Kartenprojektion und Detailkarte;
- dieselbe Vormerkliste und Timeline-Vorschau;
- denselben Booking-Koordinator;
- dieselben Kontextbelege für Wetter, Saison, Events, Öffnung, Budget und Wege.

Ein Chat-Ergebnis kann eine Karte öffnen oder ein Map-Rich-Result zeigen. Es darf kein Place-Ergebnis erzeugen, das in Places oder Timeline mit denselben Eingaben nicht nachvollzogen werden kann.

## 12. Einordnung in den bestehenden Fahrplan

### Unmittelbar: P02/P03

- Vollständige Kategorien- und Filtermatrix einschließlich Nachtleben.
- Providerübergreifende Place-Menge und identische UI-/AI-Chat-Ergebnisse.
- Korrekte `Alle`-/`Passend`-Projektion.
- Echte, exakt identifizierte Ortsbilder und belegte Teilzustände.

### Danach im laufenden B1: P09/P10

- gemeinsame Places-Karte in Timeline-Vorschlägen;
- Karten-/Kartensynchronisation;
- iOS-artiger Langdruck-Bearbeitungsmodus;
- verständliche Vorschau, Konflikte, Booking-Weitergabe, Ergebnis und Rücknahme.

### B2: P12, P15 und P17

- ein gemeinsamer Trip Composer mit geführt, Schnellstart und KI-Entwurf;
- Account-ohne-Reise-Zustand;
- Profil-, Reise- und Anfragevorlieben sauber trennen;
- Vormerken, Einplanen und Reiseentwurf mit Owner-Belegen;
- visuelle Tages- und Gesamtreisevorschau.

### B2/B3: P19, P20, P22, P23 und P26

- ablaufendes Destination-Modell;
- verifizierte Eventquellen;
- Veranstaltungskalender und Karten-/Zeitfilter;
- freie Zeitfenster und saisonale Vorschläge;
- Wetter-, Event- und Zeitkontext ohne synthetische Fakten.

### B4: P33, P34 und P35

- vollständige Chat-Integration;
- Freitext und mehrere Wünsche;
- sichere AI-Aktionsabdeckung für Entwurf, Vormerken, Planen und Booking-Handoff.

### Nach den Owner-Gates: P40, P44 und P47 sowie M18 Intelligence II

- alternative Reiseverläufe;
- faire Gruppenplanung;
- Destination Pulse;
- systemweite proaktive, aber zustimmungsgebundene Orchestrierung.

## 13. Lieferreihenfolge

1. Aktuellen P02/P03-Filter-, Kategorie-, Passend- und Fotoabschluss liefern; Nachtleben erhält eine eigene reale Abnahme.
2. Den begonnenen P09/P10-Slice für Timeline-Vorschlagskarte, Teilstands-Recovery und mobilen Wackelmodus veröffentlichen und sichtbar testen.
3. Positive Booking-, Visit- und Memory-Owner-Wege in P09/P10 schließen.
4. P17 Trip-Capability und Account-ohne-Reise-Zustand abschließen.
5. Trip Composer v1 mit geführt und Schnellstart sowie Vormerkliste liefern.
6. KI-Entwurfsmodus mit Preview, Tagespräsentation und bestätigten Journey-Befehlen aufbauen.
7. Wetter-, Saison- und Eventmatrix nach den P20/P22-Quellengates zuschalten.
8. AI-Chat-Parität und vollständige Aktionsmatrix in P33/P34/P35 schließen.
9. Gruppen-, Social-, Administration- und Intelligence-II-Funktionen ab M18 anbinden.

## 14. Abnahmevertrag

Der Gesamtansatz ist erst erfüllt, wenn:

- derselbe Testfall in Places, Stays, Timeline, Trip Composer und AI Chat dieselben Place-Identitäten und belegten Filterentscheidungen liefert;
- ein kleiner echter Provider-Teilstand sichtbar bleibt und später ohne Zustandsverlust erweitert werden kann;
- Timeline-Vorschläge auf der gemeinsamen Places-Karte erscheinen;
- Nachtleben und jede weitere Kategorie reale Providerproben und nachvollziehbare Nullfälle besitzt;
- ein neuer Account ohne Reise einen klaren Reisestart erhält;
- alle drei Trip-Composer-Einstiege denselben Trip-Entwurf und dieselben Owner-Befehle nutzen;
- Vormerken und datiertes Planen fachlich getrennt sind;
- Wetter, Saison, Events, Budget und Öffnung nur mit datiertem Beleg einfließen;
- die KI-Reisepräsentation jede Übernahme oder Änderung als bestätigte Owner-Vorschau ausführt;
- physisches iPhone und Android, Desktop, Tastatur, Touch, Reduced Motion, Reload, Offline und Reisewechsel abgenommen sind.
