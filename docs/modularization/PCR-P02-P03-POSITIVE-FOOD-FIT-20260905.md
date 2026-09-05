# PCR P02/P03 – positiver Ernährungsbeleg für „Passend“

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.87**, Core **4.82.209**. M16.5 Schritte 15–18 aktiv. P02/P03 ist der aktive Abschlussblock für den positiven Passend-Realbeleg. Apple ist ohne kostenpflichtige Mitgliedschaft geparkt und aus dem aktiven Plan entfernt.

**Zuletzt geliefert:** Der Integrationskandidat 13.82.168.87 / Core 4.82.209 ist gebaut. Er nutzt Geoapify/OSM zuerst für belegte vegetarische und vegane Passung und greift erst bei einem echten Nullergebnis auf HERE sowie die begrenzten Google-/Foursquare-Wege zurück. Alle bleibt breit; Steakhouse- und Identitätsregeln bleiben streng. Die gezielten Tests und die aktualisierten statischen Inventargates sind grün. Öffentlich läuft bis zur Abnahme weiterhin App .86 auf Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2; Gateway v205 bleibt aktiv. Apple bleibt deaktiviert und auf späteren ausdrücklichen Entscheid geparkt.

**Nächster Schritt (AKTIV): Kostenlose Passend-Evidenz veröffentlichen und sichtbar abnehmen.** Der gemeinsame Datenpfad ist korrigiert; jetzt muss der echte angemeldete Scharbeutz-Fall beweisen, dass Geoapify/OSM einen positiven, belastbaren Treffer liefert und keine falschen Orte zulässt.

**Abnahme dieses Schritts:**

- App 13.82.168.87 / Core 4.82.209 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle zeigt in Essen & Trinken weiterhin den breiten realen Place-Bestand ohne zusätzliche kostenpflichtige Ernährungsabfragen.
- Passend zeigt mindestens einen echten Ort mit vegetarischer oder veganer Provider-Evidenz oder weist einen realen lokalen Nullbestand mitsamt verwendeter Quellen eindeutig aus.
- Erdmann’s Kleines Steakhaus und andere fleischzentrierte Orte ohne dedizierten Ernährungsbeleg erscheinen nicht als passend.
- Ein sichtbarer Browserlauf belegt Quelle, Trefferzahl, Pin-Identität und Karteninteraktion; Safe Regression und öffentliche Asset-Identität sind grün.
- Main, Production, Apple-Policy, Provider-Secrets und Nutzerdaten bleiben unverändert.

**Danach:** Nach dem positiven Places-Beleg dieselbe Place-ID und denselben Grund in Stay, Timeline-Vorschlägen und AI Chat abnehmen; danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme.

**Weiter offen:** P02/P03 aktiv: sichtbarer positiver Ernährungsevidenz-Beleg und danach Flächenparität; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist bis zu einem späteren ausdrücklichen Bezahl- und iOS-Veröffentlichungsentscheid geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen: Die Supabase-Free-Plan-Schonfrist wegen des Egress-Overruns im vorherigen Zyklus endet am 07.09.2026; der aktuelle Zyklus 23.08.–23.09.2026 lag zuletzt bei 2,359/5 GB Egress und 63.540/500.000 Edge-Function-Aufrufen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

**Datum:** 2026-09-05
**Umgebung:** ausschließlich Integration
**Status:** technisch abgesichert; sichtbarer positiver Realbeleg durch externe Providerfreigaben blockiert

## Auslöser

Beim Profil mit der harten Vorgabe **Vegetarisch** lieferte „Essen & Trinken“ weiterhin 50 reale Orte, „Passend“ jedoch keinen Pin. Der frühere Fehler, ein Steakhaus allein wegen allgemeiner oder unsicherer Restaurantmerkmale als passend zu markieren, darf dabei nicht wieder eingeführt werden.

## Ergebnis der Ursachenanalyse

Profil, Kategorieumschaltung, gemeinsamer Alle-/Passend-Bestand und Negativprüfung arbeiten korrekt. Ein Ort gelangt nur dann nach „Passend“, wenn ein Provider einen positiven vegetarischen oder veganen Fakt liefert. Fehlende Angaben bleiben unbekannt und werden nicht als passend interpretiert. Fleischzentrierte Orte benötigen zusätzlich eine dedizierte vegetarische oder vegane Klassifikation.

Die öffentliche Providerdiagnose ergab:

- **HERE:** technisch erreichbar. Die offizielle vegetarische Food-Type `800-077` und vegane Food-Type `800-076` werden jetzt als positive Fakten abgebildet. Eine Scharbeutz-Suche lieferte im Radius von 8 km und 15 km jeweils null explizit vegetarisch klassifizierte Orte.
- **Google Places:** Secret vorhanden, aber der öffentliche Suchaufruf endet mit HTTP 403 und „The caller does not have permission“. Der Nutzer hat bestätigt, dass Places API (New) bereits aktiv ist. Damit verbleiben die konkrete API- und Anwendungseinschränkung des bestehenden Schlüssels, seine Projektzugehörigkeit und das Billing dieses Schlüsselprojekts als externe Prüfpunkte.
- **Foursquare:** Secret vorhanden und die offizielle Kategorie „Vegan and Vegetarian Restaurant“ (`4bf58dd8d48988d1d3941735`) wird jetzt als positiver Ernährungsbeleg abgebildet. Der öffentliche Aufruf endet mit HTTP 429 und der Providerantwort, dass das Konto keine API-Credits mehr besitzt.
- **Geoapify:** Ernährungs-Tags wie `diet:vegetarian=yes|only` und `diet:vegan=yes|only` werden bereits als positive Fakten ausgewertet. Im aktuell verfügbaren breiten Live-Bestand war kein solcher positiver Fakt vorhanden; die bestehende Gratisreserve bleibt erhalten.

## Gelieferte Änderung

- Der seltene, belegpflichtige Profilnachweis nutzt die Reihenfolge **HERE → Google → Foursquare**. HERE wird als kostenlose Quelle zuerst befragt; die begrenzten Quellen werden nur benötigt, wenn HERE keinen positiven Treffer liefert.
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

- Safe Regression: **226/226 PASS**.
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

Gateway **v203 ACTIVE** stellt Software-Build `4.64.20`, App-Build `13.82.168.87`, Core `4.82.209` und Places-Health `4.38.1-here-dietary-evidence` bereit. Relevante Gateway-Quellcommits sind `d9d8d355`, `bb986d67`, `e432c186` und `afe694f5`.

## Öffentlicher Integrationsrelease

- App: `13.82.168.87`
- Core: `4.82.209`
- Runtime-Commit: `790ee03ca952a75799c4f7178a3478878dabbc8a`
- Integration-Worker: `154aa828-e9bd-4dbc-993f-87e34ac40176`, 100 Prozent Traffic
- Stable: `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable: `https://154aa828-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.87-790ee03c.zip`
- Archivgröße: `88.755.996` Bytes
- Archiv-SHA-256: `5723DC228D90E9689EF9632D126293F5015ACEF627D1D0B1439CC42D34E1F588`
- Öffentliche Bytegleichheit: `30/30 MATCH`, je 15 releasekritische Dateien auf Stable und Immutable gegen das saubere Archiv
- Sichtbarer Browserlauf: Essen & Trinken `50`, Suchprovider `HERE`, Profilfokus `Vegetarisch`, „Passend“ `0/0`; Evidenzkaskade `here,google,foursquare`, `returned=0`, `eligible=0`, `before=0`, `after=0`
- Safe Regression: `226/226 PASS`

## Wahrheitsgrenze und Abschlusskriterium

Der technische Weg für positive Treffer ist vorhanden und vollständig getestet. Der sichtbare Scharbeutz-Nachweis bleibt dennoch leer, solange HERE keinen expliziten Datensatz liefert, Google den Aufruf mit 403 abweist und Foursquare keine Credits besitzt. Luvia darf diese Lücke nicht durch Namensraten, Küchenannahmen oder ein Steakhouse-Falschpositiv verdecken.

P02/P03 bleiben deshalb **TEILWEISE**. Der Abschluss verlangt mindestens einen realen, providerbelegten vegetarisch passenden Ort auf der öffentlichen Integration sowie dieselbe Provider-ID und denselben lesbaren Passend-Grund in Karte, Timeline und AI Chat.

Main und Production bleiben unverändert auf Commit `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.
