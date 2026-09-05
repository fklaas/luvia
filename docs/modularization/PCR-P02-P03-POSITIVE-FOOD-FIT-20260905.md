# PCR P02/P03 – positiver Ernährungsbeleg für „Passend“

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.92**, Core **4.82.211**. M16.5 Schritte 15–18 aktiv. Der positive P02-Passend-Slice ist öffentlich abgenommen; P03 Cross-Surface-Parität ist jetzt der einzige nächste Arbeitsblock. Apple bleibt geparkt.

**Zuletzt geliefert:** App .92, Gateway v220 und Places 4.38.7-osm-edge-proxy liefern verlässlich 11 belegte passende Orte im gleichen 3-km-Reisezielbereich wie Alle. Sichtbar wurden 50 Alle → 11 Passend → 52 Alle belegt; alle Passend-Pins waren markiert, das Steakhaus ausgeschlossen und Provider-Dubletten erhielten keinen zweiten Passend-Status. Der kostenlose signierte OSM-Pfad nutzt gestaffelte Ausweichinstanzen, Abbruch der Verlierer und sechs Stunden Cache. Stable und immutable Worker stimmen 30/30 mit dem ausgelieferten Commit überein. Safe Regression 229/229 und NFR-0 3/3 sind grün.

**Nächster Schritt (AKTIV): Denselben Passend-Ort in Timeline, AI Chat und Stay belegen.** Places ist wieder stabil. Jetzt muss die vorhandene zentrale Place Intelligence sichtbar beweisen, dass Karte, Timeline, Chat und Unterkunftssuche dieselbe Identität und dieselben Fakten verwenden.

**Abnahme dieses Schritts:**

- Einer der 11 Passend-Orte erscheint in Timeline-Vorschlägen und AI Chat mit derselben kanonischen Place-/Provider-ID.
- Profilfakten, 3-km-Reisezielbereich und lesbarer Passend-Grund stimmen flächenübergreifend überein.
- Timeline und AI Chat lösen keine abweichende parallele Place-Suche oder zweite Matching-Logik aus.
- Stay verwendet dieselbe Provider-, Cache-, Karten- und Fit-Diagnostik und erzeugt keine unbelegten passenden Unterkünfte.
- Safe Regression, NFR-0, öffentliche Asset-Identität und ein sichtbarer Browserbeleg bleiben grün.

**Danach:** Nach dem P03-Cross-Surface-Beleg wird die noch offene vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft aus P02/P03 weiter geschlossen.

**Weiter offen:** P02 bleibt im Gesamtumfang teilweise: vollständige Kategorien, Landes- und Sachfilter, echte Place-Fotos sowie weitere Provider- und Quotenpfade. P03 ist aktiv für Timeline-, AI-Chat- und Stay-Parität. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Apple MapKit bleibt als dokumentierte spätere Option geparkt.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

**Datum:** 2026-09-05
**Umgebung:** ausschließlich Integration
**Status:** positiver Places-Realbeleg auf Integration geliefert; Flächenparität offen

## Auslöser

Beim Profil mit der harten Vorgabe **Vegetarisch** lieferte „Essen & Trinken“ weiterhin 50 reale Orte, „Passend“ jedoch keinen Pin. Der frühere Fehler, ein Steakhaus allein wegen allgemeiner oder unsicherer Restaurantmerkmale als passend zu markieren, darf dabei nicht wieder eingeführt werden.

## Ergebnis der Ursachenanalyse

Profil, Kategorieumschaltung, gemeinsamer Alle-/Passend-Bestand und Negativprüfung arbeiten korrekt. Ein Ort gelangt nur dann nach „Passend“, wenn ein Provider einen positiven vegetarischen oder veganen Fakt liefert. Fehlende Angaben bleiben unbekannt und werden nicht als passend interpretiert. Fleischzentrierte Orte benötigen zusätzlich eine dedizierte vegetarische oder vegane Klassifikation.

Die öffentliche Providerdiagnose ergab:

- **HERE:** technisch erreichbar. Die offizielle vegetarische Food-Type `800-077` und vegane Food-Type `800-076` werden jetzt als positive Fakten abgebildet. Eine Scharbeutz-Suche lieferte im Radius von 8 km und 15 km jeweils null explizit vegetarisch klassifizierte Orte.
- **Google Places:** Secret vorhanden, aber der öffentliche Suchaufruf endet mit HTTP 403 und „The caller does not have permission“. Der Nutzer hat bestätigt, dass Places API (New) bereits aktiv ist. Damit verbleiben die konkrete API- und Anwendungseinschränkung des bestehenden Schlüssels, seine Projektzugehörigkeit und das Billing dieses Schlüsselprojekts als externe Prüfpunkte.
- **Foursquare:** Secret vorhanden und die offizielle Kategorie „Vegan and Vegetarian Restaurant“ (`4bf58dd8d48988d1d3941735`) wird jetzt als positiver Ernährungsbeleg abgebildet. Der öffentliche Aufruf endet mit HTTP 429 und der Providerantwort, dass das Konto keine API-Credits mehr besitzt.
- **Geoapify:** Ernährungs-Tags wie `diet:vegetarian=yes|only` und `diet:vegan=yes|only` werden als positive Fakten ausgewertet. Das interne Tagesbudget war beim Fehlerbild bereits ausgeschöpft.
- **OpenStreetMap/Overpass:** Der neue eng begrenzte Evidenzpfad liest ausschließlich ausdrücklich gesetzte `diet:vegetarian`- und `diet:vegan`-Tags. Der öffentliche Scharbeutz-Probe liefert 25 belegte Orte; Erdmann’s Kleines Steakhaus wird trotz eines problematischen allgemeinen Tags durch die bestehende fleischzentrierte Ausschlussregel verworfen.

## Gelieferte Änderung

- Der seltene, belegpflichtige Profilnachweis nutzt die Reihenfolge **Geoapify → OpenStreetMap/Overpass → HERE → Google → Foursquare**. OpenStreetMap springt nur bei vegetarischem oder veganem Evidenzbedarf ein; die begrenzten kommerziellen Quellen folgen erst bei einem echten Nullergebnis.
- OpenStreetMap ist ausschließlich für `search` als Ernährungsbeleg freigegeben: 6 Aufrufe pro Minute, 500 pro Tag, sechs Stunden Gateway-Cache, keine allgemeine Discovery, keine Details, Fotos oder Routen.
- HERE darf eine sekundäre vegetarische oder vegane Food-Type als positiven Verfügbarkeitsfakt verwenden. Nationale Landesküchen bleiben weiterhin an den primären HERE-Food-Type gebunden, damit beispielsweise ein sekundärer spanischer Tag keinen deutschen Haupttyp überschreibt.
- Foursquare verwendet seine offizielle Vegan-/Vegetarisch-Kategorie sowohl im Suchfilter als auch bei der Normalisierung. Ein allgemeines Restaurant bleibt ohne positiven Ernährungsfakt unbekannt.
- Google ist ausschließlich für `search` als Ernährungsbeleg freigegeben: höchstens 4 Aufrufe pro Minute, 25 pro Tag und 800 pro Monat.
- Das im Google-Cloud-Projekt gemeldete verfügbare Kontingent beträgt nach Nutzerangabe 1.000 Aufrufe pro Tag. Luvia startet trotzdem mit dem engeren internen Sicherheitsbudget von 25 Suchaufrufen pro Tag; Cache-Treffer, zusammengeführte Suchanfragen und freie Provider werden zuerst verwendet. Das interne Budget darf erst nach sichtbarer Nutzungs- und Kostenbeobachtung angehoben werden.
- Foursquare ist ausschließlich für `search` freigegeben: höchstens 2 Aufrufe pro Minute, 12 pro Tag und 300 pro Monat. 200 der angekündigten 500 monatlichen Gratisaufrufe bleiben als Reserve unberührt. Details und Fotos bleiben in dieser Kostenregel deaktiviert.
- Providerfehler enthalten in der öffentlichen, begrenzten Diagnose den äußeren HTTP-Status, jedoch keine Schlüssel oder vollständigen Providerantworten.
- Ein separat gefundener positiver Ort wird nur über dieselbe Provider-ID oder über exakt gleichen normalisierten Namen in höchstens 25 Metern mit dem sichtbaren Alle-Bestand verbunden. Danach verwenden Pins, „Alle“, „Passend“, Timeline und AI Chat denselben Ort und denselben Beleg.

## Nachdiagnose des unveränderten Supabase-Secrets

Der unveränderte Schlüssel ist weiterhin unter `GOOGLE_PLACES_API_KEY` in den Supabase Edge-Function-Secrets vorhanden. Places-Suche und Routen lesen diesen Namen serverseitig; der Schlüsselwert wird weder in der Oberfläche noch in der Diagnose ausgegeben.

Der erste öffentliche Wiederholungs-Probe wurde noch vor Google mit `PROVIDER_BUDGET_DENIED` und Grund `cooldown` abgewiesen. Die Datenbank zeigte als Ursache den zuvor gespeicherten HTTP-Status 403 und `blocked_until = 2026-09-06T14:53:03.294338+00:00`. Nach einem eng auf die aktive Google-Search-Policy begrenzten Reset wurde genau ein neuer Provideraufruf zugelassen. Google antwortete erneut mit HTTP 403.

Gateway v204 / `4.64.21` und Places-Health `4.38.2-google-permission-diagnostics` reduzieren Google-Fehler nun auf HTTP-Status, Google-Status, maschinenlesbaren Grund und Dienstname. Schlüssel, vollständige Providerantwort, Anfrageinhalt und Consumer-Metadaten bleiben verborgen. Der öffentliche Realbefund lautet:

- `status = 403`
- `providerStatus = PERMISSION_DENIED`
- `reason = PERMISSION_DENIED`
- `service = places.googleapis.com`
- `message = The caller does not have permission`

Damit sind ein fehlendes Supabase-Secret, ein erschöpftes internes Budget und eine versehentliche Legacy-API-Anfrage ausgeschlossen. Da Places API (New) laut Nutzerbestätigung aktiv ist, muss der bestehende Schlüssel im zugehörigen Google-Cloud-Projekt auf API-Beschränkung, Anwendungseinschränkung, Projektzugehörigkeit und Billing geprüft werden.

## Sicherheits- und Regressionsbeleg

- Safe Regression: **229/229 PASS**.
- NFR-0: **3/3 PASS**.
- Der neue OSM-Test prüft Normalisierung, ausdrückliche Diet-Tags, Attribution, Budget, Google-Detailisolierung und Provider-Allowlist.
- Der Filtervertrag für 14 Kategorien, 82 Typ-/Untertypen, 19 Landesküchen und alle sichtbaren Faktenfilter bleibt grün.
- Ein allgemeines Restaurant mit ausdrücklich positivem Google-Fakt gelangt in „Passend“.
- Ein HERE-Ort mit sekundärem vegetarischem Food-Type gelangt in „Passend“.
- Die offizielle Foursquare Vegan-/Vegetarisch-Kategorie gelangt in „Passend“.
- Ein allgemeines Foursquare-Restaurant ohne Ernährungsfakt bleibt unbekannt.
- Ein Steakhaus mit einem bloßen allgemeinen vegetarischen Merkmal wird weiterhin abgelehnt.
- Places, Stays, Timeline, Booking, Kartenbewegung, Kategorien und Owner-Verträge bleiben in der vollständigen Regression grün.

## Datenbank- und Gatewaybeleg

Angewendete additive Policy-Migrationen:

- `20260905153000_google_verified_profile_evidence_budget.sql`
- `20260905170000_google_fit_diagnostic_cooldown_reset.sql`
- `20260905173000_foursquare_verified_dietary_evidence_budget.sql`
- `20260905174500_foursquare_dietary_diagnostic_cooldown_reset.sql`
- `20260905210000_openstreetmap_dietary_evidence_budget.sql`

Gateway **v206 ACTIVE** stellt Software-Build `4.64.23`, App-Build `13.82.168.89`, Core `4.82.211` und Places-Health `4.38.4-osm-dietary-evidence` bereit. Der öffentliche `vegetarian-osm-scharbeutz`-Probe antwortet im Modus `free_osm_dietary_evidence` mit 25 Treffern und ohne Providerfehler.

## Öffentlicher Integrationsrelease

- App: `13.82.168.89`
- Core: `4.82.211`
- Runtime-Commit: `51a2f1743e5c6296699d9525f5ddb9e9e0e84a7c`
- Integration-Worker: `81e43a21-667a-4e60-bb81-1ab946e4a482`, 100 Prozent Traffic
- Stable: `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable: `https://81e43a21-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.89-51a2f174.zip`
- Archivgröße: `88.794.857` Bytes
- Archiv-SHA-256: `ED3C9A332F8A538343F4BE0BF6874A99A4BAC5060C2E3B7F47F922B97A88A623`
- Öffentliche Bytegleichheit: `30/30 MATCH`, je 15 releasekritische Dateien auf Stable und Immutable gegen das saubere Archiv
- Sichtbarer Browserlauf: Essen & Trinken `Alle 50`, Profilfokus `Vegetarisch`, `Passend 25`; Passt-Pins mit Luvia-Farbrahmen, Zoom, Pinwechsel `1/25 → 2/25` und persönlicher Detail-Score funktionieren.
- Sichtbare Beispiele: Strand-Creperie, Grande Beach Café, Gosch, COAST, Foodrunner, ROOF und Saigon. Erdmann’s Kleines Steakhaus fehlt korrekt.
- Safe Regression: `229/229 PASS`; NFR-0: `3/3 PASS`.

## Wahrheitsgrenze und Abschlusskriterium

Der positive Places-Beleg ist erfüllt: Die öffentliche Integration zeigt 25 reale, providerbelegte vegetarische oder vegane Treffer und keinen Steakhouse-Falschpositiv. Fehlende Providerangaben bleiben unbekannt; Namen, Küchenannahmen und KI-Texte erzeugen keine Passung.

P02/P03 bleiben **TEILWEISE**, weil die vollständige Kategorie-/Filtermatrix und die Flächenparität noch offen sind. Der nächste Abschluss verlangt dieselbe kanonische Provider-ID und denselben verständlichen Passend-Grund in Timeline-Vorschlägen und AI Chat sowie die gleiche technische Providerdiagnostik in Stay.

Main und Production bleiben unverändert auf Commit `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.
