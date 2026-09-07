# P02 Apple MapKit Renderer Foundation

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.132**, Core **4.82.251**. P17/P19 aktiv und teilweise: App .132 / Core .251 sowie Intelligence v41 / 4.38.0 sind ausschließlich auf Integration veröffentlicht. Der Composer verbindet den semantischen Reiseauftrag mit Reiseversprechen, bewusstem Freiraum, Tagesbalance, belegpflichtiger Unsicherheitskarte, Buchungsreihenfolge und modelliertem Unterkunftsradius. trip.audit prüft das Versprechen unabhängig. 239/239 Safe Regression, 108 Composer-Prüfungen, Health, Workerstatus und 8/8 öffentliche Byteidentität sind belegt. Zwei authentifizierte Modell-Positivläufe, Kontoübernahme und physische Geräte bleiben im aktuellen Abnahmefenster. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Funktional vorbereitet sind der erweiterte strikte Structured-Output-Vertrag und seine sichtbare Composer-Projektion. Unbelegte Fakten können nicht als verifiziert passieren; fehlende Kernunsicherheiten bleiben sichtbar. Freie Zeit ist eine geplante Reiseentscheidung mit Zweck und Zeitfenster, nicht mehr ein leerer Tag. Die Buchungsreihenfolge beschreibt, welche Entscheidung andere Entscheidungen blockiert. Der Unterkunftsradius bleibt eine begründete, als modelliert ausgewiesene Ableitung. Das separate Unit-Economics-Dokument verbindet aktuelle Modell- und Providerpreise mit Paketvorschlag, Durchschnittsverbrauch und Break-even. Reise-DNA und Zeitreise bleiben integriert; Konfliktmoderation, Ablehnungsdiagnose, Reise-Schatten, Kontextwellen, Luvia Pulse, Ziel-Zwillinge und Gruppen-Sternbild bleiben als folgende Owner-Slices erhalten.

**Nächster Schritt (AKTIV): Den vollständigen P17/P19-KI-Plan mit zwei echten Reisen und Kostenmessung abnehmen.** Der Vertrag, die Regression und das Integration-Deployment sind belegt. Der verbleibende Abschlussbeleg muss jetzt zeigen, dass das produktive Modell den Vertrag bei zwei deutlich verschiedenen freien Wünschen innerhalb eines tragfähigen Kosten- und Latenzrahmens tatsächlich erfüllt.

**Abnahme dieses Schritts:**

- Einen siebentägigen Küsten-/Städtewunsch ab Münster und einen deutlich anderen Familien-/Ferienwunsch authentifiziert bis zum vollständigen Entwurf und unabhängigen Audit ausführen.
- Für beide Läufe Zielidentität, Zeitfenster, Reiseversprechen, jeden Reisetag, Tagesbalance, Freiraum, Unsicherheitszustände, Buchungsreihenfolge und Unterkunftsradius sichtbar prüfen.
- Capability, Modell, Input-, Cache- und Output-Token, End-to-End-Latenz, Reparaturbedarf und Places-/Kalenderzugriffe messen und mit dem Unit-Economics-Zielrouting vergleichen.
- Erst nach beiden Positivläufen P17/P19 weiter schließen oder die konkret betroffene Capability gezielt reparieren; keine pauschale Freigabe aus kontrollierten Fixtures ableiten.

**Danach:** Nach dem echten Modell- und Kostenbeleg die P15/P17-Kontoübernahme, Reload-, Timeline-, Archiv-/Wiederherstellungs- und physischen Gerätegates schließen. Danach folgt M17 als globaler Sprach-, Design-, Zustands- und Motion-Rollout; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17: professionelles visuelles Endgate, echter vollständiger KI-Positivlauf, Kontoübernahme, dauerhafte Identity-Übergabe, Lifecycle und physische Geräte. P16: semantische Ablehnungsdiagnose und gezielte Teilreparatur. P19+: produktive datierte Kontext-, Unterkunfts-, Routen-, Wetter-, Event- und Budgetbelege. Von den sieben neuen Composer-USPs sind Reise-DNA und Zeitreise umgesetzt; Reise-Schatten, Kontextwellen, Luvia Pulse, Ziel-Zwillinge und Gruppen-Sternbild bleiben in ihrer Owner-Reihenfolge offen. Die Geografie ist eine Übersicht, keine Zusage sämtlicher aktuellen Untergliederungen. Kein zusätzlicher P-Block wird als vollständig abgeschlossen markiert.

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
