# P02 Apple MapKit Renderer Foundation

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.165**, Core **4.82.284**. P17/P19 aktiv und teilweise: App .164 / Core .283 und Intelligence v50 / 4.40.1 sind öffentlich auf Integration. Der echte Familien-/Ferienlauf liefert fünf passende Zielrichtungen, ein autoritatives Ferienfenster und erreicht nun die Tagesreparatur ohne Places-Timeout; die gemeinsame Mehrtages-Reparatur ließ Tag 4 und Tag 6 jedoch leer und wurde sicher ohne Speicherung abgebrochen. App .165 / Core .284 plus Intelligence 4.40.2 ist der Kandidat für einzeln fortsetzbare Tagesreparaturen. Gateway v235, Main und Production bleiben funktional unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag trennt drei Ebenen. Vor dem Plan müssen echte Zielkonflikte, Bewegungsradius, feste Termine sowie harte Gesundheits- und Budgetgrenzen entschieden sein. Luvia darf einen ausgewogenen Tagesrhythmus, 20 bis 25 Prozent sichtbaren Freiraum, eine Unterkunftsbasis und höchstens zwei intensive Tage in Folge vorbelegen; diese Annahmen sind sichtbar und mit einem Klick änderbar. Erst nach dem Entwurf folgen aktuelle Prüfungen für Öffnungen, Wetter, Preise, Buchbarkeit, Veranstaltungen, Einreise und Verkehr in Unsicherheitskarte und Buchungsreihenfolge. .164 startet alle expliziten Place-Kategorien parallel, wiederholt nur fehlende Nutzerwünsche und lässt reine Profilergänzungen den ersten Gesamtplan nicht blockieren. .165 repariert mehrere fehlerhafte Tage über getrennte, fortsetzbare Ein-Tages-Aufträge, übernimmt jeden gültigen Tag unverändert, schließt bereits verwendete Places im jeweils nächsten Auftrag aus und verlangt per Structured Output genau einen Ersatztag. Automatische Wiederaufnahme verwendet weiterhin denselben Auftrag; ein ausdrücklich geklicktes Erneut-Suchen verlässt dagegen einen erschöpften Workflow und startet mit neuer Idempotenz. Konfliktmoderator, Bewegungsradius, räumliche Vielfalt, harte Interessenabdeckung, kompakter Planungscheck und seitliches Desktoplayout bleiben enthalten. Für die produktive Tageskarten-Neuausrichtung ist Richtung A – Tagesroute gewählt; die echte Earth-Karte, Pin-Fokus und ein synchroner Luvia-Spektrum-Rahmen werden im getrennten visuellen Folgeslice umgesetzt.

**Nächster Schritt (AKTIV): Familien-, Ferien-, Mobilitäts- und Wunschkonflikte im zweiten realen Gesamtplan prüfen.** Der erste reale Gesamtplan funktioniert technisch, bündelt seine Places aber zu stark im Zentrum und deckt einen ausdrücklich gewünschten Meeresmoment nicht ab. Der zweite Positivlauf muss deshalb zugleich semantische Konfliktmoderation, autoritative Schulferien, räumliche Vielfalt, Mobilitätsradius und ausgewogenen Kategorienmix beweisen.

**Abnahme dieses Schritts:**

- Ein freier deutscher Reiseauftrag enthält Kinder mit Altersangaben, Schleswig-Holstein als Schulregion, einen groben Zeitraum, widersprüchliche Wünsche, gewünschten Strand-/Meeresanteil und mehrere Place-Kategorien.
- Vor der Planung stoppt Luvia ausschließlich für echte Zielkonflikte, einen fehlenden Bewegungsradius, feste Termine sowie harte gesundheitliche oder finanzielle Grenzen und schlägt ausschließlich autoritativ belegte Zeitfenster innerhalb der zuständigen Schulferien vor.
- Der echte Konfliktmoderator benennt die Spannung und bietet mindestens zwei sinnvoll priorisierte Varianten mit Folgen an, statt einen stillen Mittelwert oder ein Keyword-Schema zu verwenden.
- Der Reiseauftrag belegt sichtbar einen ausgewogenen Tagesrhythmus, 20 bis 25 Prozent Freiraum, eine Unterkunftsbasis und höchstens zwei intensive Tage in Folge vor; jede Annahme ist vor der Generierung mit einem Klick änderbar.
- Der gewählte Zeitraum erzeugt einen vollständigen Plan für alle Tage über mehrere sinnvolle Stadt-/Küstengebiete; Meer/Strand und bestätigte Kategorien sind als überprüfbare Abdeckung enthalten, fünf anstrengende Tage in Folge sind ausgeschlossen und Freiraum ist bewusst benannt.
- Unterkunftsradius und Nachbarschaft folgen aus dem fertigen Tagesnetz und Mobilitätswunsch. Öffnungen, Wetter, Preise, Buchbarkeit, Events, Einreise und aktuelle Verbindungen werden erst nach der Generierung mit echten Quellen geprüft und ehrlich in Unsicherheitskarte und Buchungsreihenfolge getrennt; Modell, Tokens, Latenz, Kosten und Reparaturen werden je Phase gemessen.

**Danach:** Nach Veröffentlichung von .165 wird der fehlgeschlagene öffentliche Familien-/Ferienlauf über seine vorhandenen gültigen Tage fortgesetzt und bis zum ungespeicherten Review geprüft. Danach setzt der getrennte visuelle Folgeslice Richtung A – Tagesroute auf der echten Earth-Karte um: Tagespunkt zu realem Pin, weicher Kartenfokus, Luvia-Spektrum-Rahmen, kompakter Routenfaden und reduzierte Bewegung. Danach folgen semantische Ablehnungsdiagnose und gezielte Teilreparatur, P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert anschließend die gemeinsame Produktsprache ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .165 samt Intelligence 4.40.2 veröffentlichen und den öffentlichen Familien-/Ferien-/Konfliktlauf vollständig bis zum ungespeicherten Review abschließen; räumliche Streuung, Strandabdeckung, Kategorienmix, Latenz und Kartenbeschnitt am fertigen Plan messen. Anschließend Richtung A – Tagesroute produktiv auf der echten Karte umsetzen und öffentlich zeigen. Kosten/Latenz je Modell, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand: 5. September 2026

## Ergebnis dieses Abschnitts

Luvia behält genau einen sichtbaren Kartenplatz. MapLibre bleibt für die kostenlose Providerstrategie der aktive und geplante Hauptrenderer. Apple MapKit JS ist ein optionaler kostenpflichtiger Kandidat, der erst nach einer ausdrücklichen Entscheidung für das Apple Developer Program, vollständiger Einrichtung, fachlicher Gleichwertigkeit und sichtbarer Desktop-/Mobilabnahme im selben Kartenplatz erprobt werden darf. MapLibre bleibt dabei der Rückfall; beide Renderer dürfen nie gleichzeitig sichtbar oder aktiv sein.

Die verbindliche Maschinenkonfiguration liegt in `config/luvia-map-renderers.v1.json`. Sie hält den aktuellen und den geplanten Renderer, die Aktivierungsgates und den atomaren Rückfall fest. Der Rückfall entfernt zuerst alle Apple-Kartendaten aus dem Arbeitsspeicher und lädt danach den für MapLibre zulässigen Providerbestand bei erhaltenem Kartenausschnitt und erhaltener Kategorie.

## Architektur

```mermaid
flowchart LR
  C[Places v1 Vertrag] --> S[Ein Kartenplatz]
  S -->|heute aktiv| M[MapLibre]
  S -->|optional nach bezahlter Freigabe| A[Apple MapKit JS]
  P[Places Provider Core] --> C
  R[Routing Provider Core] --> C
  T[Places · Stay · Timeline · AI Chat] --> C
  A -. Ausfall: Apple-Daten entfernen .-> M
```

Apple wird nicht als zweites Kartenfenster ergänzt. Die Luvia-Navigation, Suche, Filter, Pins, Passend-Markierung, Detail-Sheet und Timeline-Aktionen bleiben Produktoberfläche; nur die Karte darunter wird über den gemeinsamen Renderer-Vertrag ausgewählt.

## Vorbereiteter Serveradapter

`supabase/functions/luvia-gateway/_shared/apple-maps.ts` bereitet Apple Maps Server API für Folgendes vor:

- Suche nach Orten innerhalb des Zielgebiets,
- Abruf eines konkreten Apple-Orts,
- Auto-, Fuß- und Fahrradrouten,
- serverseitig signierte ES256-Tokens aus Supabase-Secrets,
- zentrale Provider-Budgetreservierung vor jedem Apple-Aufruf,
- normalisierte Luvia-Orts- und Routenantworten mit Apple-Attribution.

Der Adapter ist absichtlich noch nicht in der automatischen Providerkaskade aktiv. Seine Policy `apple-maps-services` wird mit `enabled=false` und Nullbudget angelegt. Er akzeptiert Aufrufe nur mit `renderer=apple-mapkit` und `storage=transient`.

## Daten- und Darstellungsregeln

Apple-Ortsdaten dürfen in diesem Entwurf nur vorübergehend in der Apple-Kartenansicht gehalten werden. Sie werden nicht in den dauerhaften Luvia-Ortsbestand geschrieben, nicht mit MapLibre dargestellt und nicht zu einer abgeleiteten Ortsdatenbank zusammengeführt.

Apple-Ortsergebnisse liefern belastbar Name, Adresse, Koordinaten und Apple-POI-Kategorie. Sie liefern für Luvias fachliche Zusagen keine verlässliche Quelle für echte Place-Fotos, Bewertungen, Landesküche oder vegetarische beziehungsweise vegane Eignung. Deshalb gilt:

- kein Apple-Ort wird allein aufgrund eines allgemeinen Restauranttyps als `Passend` markiert,
- keine Landesküche wird aus Namen oder Vermutungen erfunden,
- Apple ist keine Lösung für den Anspruch „immer ein echtes Place-Bild“,
- fremde Providerdaten dürfen erst nach Prüfung ihrer Lizenzbedingungen auf Apple MapKit erscheinen.

## Apple-Kontingent

Apple dokumentiert für eine Apple-Developer-Program-Mitgliedschaft derzeit 250.000 Kartenaufrufe und 25.000 Serviceaufrufe pro Tag. Die Maps-ID und der private MapKit-Schlüssel stehen nur eingeschriebenen Mitgliedern oder berechtigten Mitgliedern eines eingeschriebenen Teams zur Verfügung. Das Apple Developer Program kostet derzeit 99 USD pro Mitgliedschaftsjahr beziehungsweise den regionalen Betrag. Maps Server API verwendet einen Maps-Identifier, Team-ID, Key-ID und privaten `.p8`-Schlüssel. Diese Werte fehlen; ohne sie meldet der Health-Endpunkt `configured=false` und kein Apple-Aufruf wird versucht. Für Luvias Free-first-Strategie bleibt Apple deshalb geparkt, bis die Mitgliedschaft ohnehin für eine native iOS-Veröffentlichung benötigt oder ausdrücklich separat beschlossen wird.

## Aktivierungsgates

Apple darf nur nach einer ausdrücklichen bezahlten Produktentscheidung als optionaler Renderer erprobt werden. Vor einer Aktivierung müssen alle Punkte erfüllt sein:

1. Eine aktive Apple-Developer-Program-Mitgliedschaft oder berechtigter Teamzugang ist belegt.
2. Maps-Identifier, Team-ID, Key-ID und privater Schlüssel liegen ausschließlich als Supabase-Secrets vor.
3. MapKit JS lädt auf Integration im Desktop-Browser und auf einem echten Mobilgerät.
4. Places und Stay zeigen dieselben Luvia-Pins, Filter, `Alle`/`Passend`, Detail-Sheets und Aktionen.
5. Timeline-Vorschläge und AI Chat konsumieren denselben `places.v1`-Bestand.
6. Attribution und Apple-Nutzungsbedingungen sind sichtbar eingehalten.
7. Die Anzeigeerlaubnis aller zusätzlich eingeblendeten Provider ist dokumentiert.
8. Der atomare Rückfall auf MapLibre ist sichtbar getestet, ohne zweite Karte und ohne verbliebene Apple-Daten.
9. Die vollständige Safe Regression ist grün.

## Offizielle Grundlagen

- Apple Maps Server API: https://developer.apple.com/documentation/applemapsserverapi
- Apple-Mitgliedschaften und Kosten: https://developer.apple.com/support/compare-memberships/
- Tokens für Maps Server API: https://developer.apple.com/documentation/applemapsserverapi/creating-and-using-tokens-with-maps-server-api
- Maps-Identifier und privater Schlüssel: https://developer.apple.com/help/account/capabilities/create-a-maps-identifier-and-private-key
- Apple-Ortssuche: https://developer.apple.com/documentation/applemapsserverapi/-v1-search
- Apple-Routen: https://developer.apple.com/documentation/applemapsserverapi/-v1-directions
- MapKit JS auf dem Web: https://developer.apple.com/maps/web/
- Apple Developer Program License Agreement, Attachment 6: https://developer.apple.com/support/terms/apple-developer-program-license-agreement/
