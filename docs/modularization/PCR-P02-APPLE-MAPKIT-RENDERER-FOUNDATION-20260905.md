# P02 Apple MapKit Renderer Foundation

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.120**, Core **4.82.239**. M16.5 Schritte 15–18: P15/P17 bleibt aktiv und teilweise. Die vom Nutzer gewählte Mischung aus Reisewelt und direktem Reisebauen ist als bedienbarer .120-Kandidat umgesetzt und öffentlich geprüft. Welt-/Zielauswahl und gemeinsame Tageskarte sind belegt; Zeitraum, Wünsche und Budget brauchen die vollständige gestalterische Fortsetzung. Echte KI, Kontext- und Kontoabschluss bleiben offen. Stable Integration bleibt .104; Gateway v234 und Intelligence v37 behalten den reparierten Zieltransport.

**Zuletzt geliefert:** Die ausdrücklich gewählte Mischung aus kleiner Reisewelt und direktem Reisebauen ist als erster bedienbarer Slice in App .120 umgesetzt. Ein lokal gerenderter Globus mit geografischen Ländern/Regionen, Licht und Schatten, Kamerafahrten und direkter Ortsuche ersetzt den abgelehnten Slider. Globusrotation und Tageszuordnung lösen keine neue Places-Suche aus. Im angemeldeten öffentlichen Browser wurden Toskana und Lissabon gesucht und bestätigt; in der exakten neuen Kandidaten-Origin wurde Rom über places.v1 gesucht und kanonisch ausgewählt. Der reale Kategorienpfad lieferte fünf Lissabon-Orte über acht Reisetage. Yuki Ramen wurde auf den 19.06.2027 (Tag 8) gelegt: Die gemeinsame MapLibre-Karte wechselte von fünf Pins auf genau einen. Nach Reload blieb das neue Datum erhalten. Eine teilweise nicht erreichbare Kulturquelle wird offen ausgewiesen. Lokale Bedienbelege umfassen Globusauswahl, Tastatur, Antippen, Abbrechen, Zeiger-Langdruck und Ziehen, Reduced Motion sowie 390-Pixel-Geometrie ohne horizontalen Überlauf. Die vollständige gestalterische Fortsetzung, echte KI und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): P15/P17: Reisezeit, Wünsche und Budget in dieselbe interaktive Reisewelt integrieren.** Die Mischung A+B ist entschieden und ihr erster Globus-/Tages-Slice ist bedienbar. Die mittleren Schritte müssen nun dieselbe räumliche, mobile Gestaltung erhalten; der bestehende Formularstil dort ist noch keine vollständige Umsetzung der gewählten Reisegeschichte.

**Abnahme dieses Schritts:**

- Reisezeit, Interessen und Budget als zusammenhängende Szenen mit unmittelbarer sichtbarer Auswirkung auf den bestehenden Trip-Auftrag ausarbeiten. Die direkte Texteingabe und überspringbare Inszenierung bleiben verfügbar; keine zweite Planungs- oder Places-Wahrheit.
- Jede Auswahl erhält eine zugängliche Antipp- und Tastaturbedienung, eine Version mit reduzierter Bewegung und nachvollziehbare Rückkehr/Wiederaufnahme. Reiseakzent, Tageskarte und Entwurf bleiben konsistent; reine Kamerabewegungen verbrauchen keine Places-/Routing-Kontingente.
- Die Szene am tatsächlich ausgegebenen Versionslink auf kleinem Bildschirm prüfen; anschließend physisches iOS/Android gesondert belegen. Die heutige CDP-Bildaufnahme ist bei Windows-Skalierung zugeschnitten; DOM-Geometrie ist belegt, ein nativer Touchbeleg wird daraus nicht abgeleitet.
- Den KI-Auftrag weiterhin ehrlich führen: nach Wiederherstellung des zuvor fehlenden API-Guthabens einen realen strukturierten Modellauftrag mit Restriktionen, Rückfrage, Quellenkontext und ausdrücklicher Bestätigung positiv prüfen. Der Kategorienpfad und visuelle Effekte gelten nicht als KI-Positivnachweis.

**Danach:** P15/P17 enthält weiterhin die vollständige Tagespräsentation, Kontextplanung aus den zugeordneten P-Paketen, bestätigte echte Kontoübernahme, getrennte dauerhafte Identity-Übergabe und Archivieren/Löschen/Wiederherstellen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
