# P02 Apple MapKit Renderer Foundation

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.146**, Core **4.82.265**. P17/P19 aktiv und teilweise: Intelligence v47 / 4.38.6 sowie der serverseitige P19-Reiseauftrag sind auf Integration aktiv. App .144 / Core .263 belegt die Wiederaufnahme öffentlich. Der reale Valencia-Reload deckte zwei Nachbesserungen auf: volatile Laufzeit im Job-Fingerabdruck und zu geringe Verschachtelungstiefe im Audit-Payload. App .146 / Core .265 entfernt den Zeitstempel aus der semantischen Job-Identität und übergibt vollständige Tagesmomente an den Audit; dieser geprüfte Hotfix-Releasekandidat folgt auf Integration. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Zusätzlich zum semantischen Gesamtauftrag, Reiseversprechen, vollständigen Tagen, Freiraum, Tagesbalance, Unsicherheitskarte, Buchungsreihenfolge und Unterkunftsradius ist jetzt die technische Wiederaufnahme umgesetzt: derselbe Reiseauftrag übersteht Reload/App-Wechsel, erfolgreiche Modellstufen werden wiederverwendet, laufende oder verwaiste Stufen werden sicher fortgesetzt und Kosten je Workflow aggregiert. Erfolgreiche Roh-Eingaben werden gelöscht; Tabellenzugriff bleibt ausschließlich beim Intelligence-Owner. Der erste reale Valencia-Lauf belegte drei passend abgeleitete Juni-Fenster und dieselbe Workflow-ID über Reload. Zwei im realen Lauf gefundene Fehler sind in .146 korrigiert: wechselnde live.now-Zeitstempel erzeugen keinen neuen semantisch identischen Job mehr; verschachtelte Tagesmomente, Zeiten, freie Minuten, Place-IDs und Evidence-Referenzen erreichen den unabhängigen Audit vollständig statt als [truncated].

**Nächster Schritt (AKTIV): Zwei unterschiedliche Reisen im fortsetzbaren KI-Auftrag vollständig positiv abnehmen.** Die Wiederaufnahme ist technisch und serverseitig aktiv. Jetzt muss die reale Planqualität mit echten OpenAI-Antworten, Places-Kandidaten und einem echten Reload statt nur kontrollierter Antworten bewiesen werden.

**Abnahme dieses Schritts:**

- Den bekannten Valencia-Auftrag für 12.–18.06.2027 authentifiziert bis Reiseversprechen, sieben vollständigen Tagen, Audit und Review-Freigabe abschließen.
- Einen deutlich anderen Familien-/Ferienauftrag mit echter Kalenderdeutung, altersgerechtem Rhythmus, bewussten Pausen und anderen Kategorien vollständig abschließen.
- Mindestens einen Lauf während einer aktiven Modellphase neu laden und belegen, dass dieselbe Workflow-/Job-ID fortgesetzt und kein bereits erfolgreicher Modellaufruf doppelt berechnet wird.
- Je Lauf Modell, Tokens, Kosten, Phasenlatenz, Audit, Reparaturanzahl und offene Providerunsicherheiten aus der serverseitigen Telemetrie erfassen.
- Erst nach beiden Positivläufen Konfliktmoderator und semantische Ablehnungsdiagnose auf denselben Teilreparaturpfad setzen.

**Danach:** Nach den zwei echten Positivläufen folgen Konfliktmoderator und semantische Ablehnungsdiagnose mit gezielter Teilreparatur. Danach schließen P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert anschließend Sprache, Design, Zustände, Motion und Komponenten global ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence Product Evolution II aus.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17/P19: zwei reale fortsetzbare Modell-Positivläufe, Kontoübernahme, Timeline-/Owner-Übernahme, Lifecycle und physische Geräte sowie produktive datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. P16: Konfliktmoderator, semantische Ablehnungsdiagnose und gezielte Teilreparatur. Reise-DNA und Zeitreise sind umgesetzt; Reise-Schatten, Kontextwellen, Luvia Pulse, Ziel-Zwillinge und Gruppen-Sternbild bleiben offen.

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
