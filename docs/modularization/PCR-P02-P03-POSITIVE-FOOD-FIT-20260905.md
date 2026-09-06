# PCR P02/P03 – positiver Ernährungsbeleg für „Passend“

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.100**, Core **4.82.219**. M16.5 Schritte 15–18 aktiv. P02/P03 sind auf der öffentlichen Integration .100 bei Kategorienkontinuität, Passung, Property-Deduplizierung und exaktem Medien-Transport stabilisiert, bleiben aber teilweise bis zur vollständigen realen Foto-, Filter- und Latenzabnahme. P09/P10 folgen danach mit Timeline-, Booking- und AI-Parität. Apple bleibt geparkt.

**Zuletzt geliefert:** App .100 / Core .219 ist auf Integration veröffentlicht. Places und Stays tragen die exakt ausgewählte Provider-Entität zum gemeinsamen Detail-Owner; Detail-Caches unterscheiden konkrete Medienbelege, und OSM/Foursquare dürfen Bilder nur nach strenger Ortsidentität ergänzen. Öffentlich zeigt Snykrode dasselbe echte Wikimedia-Ortsbild in Kurzkarte, Ergebnis und Detail mit sichtbarer Quelle. Food Passend bleibt bei 9 belegten Treffern ohne Kleines Steakhouse; Shopping Passend 11 und nach Reload 46 Pins; Stays 47 eindeutige Pins. Releasekette: Runtime b9f32115, Gateway v228 / 4.64.33 / Places 4.38.11, Worker 1dcf5de1, 232/232 Regression, NFR-0 3/3 und 30/30 Byteidentität.

**Nächster Schritt (AKTIV): Echte Ortsbilder sowie vollständige Filter- und Latenzmatrix schließen.** Kategorienkontinuität, belegte Food-Passung, sichtbare Stay-Dubletten und der Transport exakter OSM-/Wikimedia-Bildbelege sind geschlossen. Der größte sichtbare Qualitätsabstand ist nun die geringe reale Bildabdeckung vieler Orte; parallel müssen alle Sachfilter und kalten Ladepfade real belegt werden.

**Abnahme dieses Schritts:**

- Jede angezeigte Aufnahme gehört nachweisbar zur exakten Provider-Place-ID oder zu einer verifizierten offiziellen Ortsquelle; Lizenz, Herkunft, Frische und Fallbackstatus bleiben maschinenlesbar. Fremde oder nur räumlich nahe Bilder bleiben ausgeschlossen.
- Alle 14 sichtbaren Kategorien, 82 kanonischen Zuordnungen, 19 Landesküchen und sämtliche sichtbaren Sachfilter bestehen auf Desktop und Touch positive, negative, leere und teilweise Providerfälle; Label, aktive Kategorie, Filter und Kohorte stimmen überein.
- Cache-Treffer zeigen Pins spätestens nach 1,0 Sekunden, kalte Providerpfade spätestens nach 3,0 Sekunden. Kategorienwechsel, Reload, Ziehen und Zoomen zeigen keinen falschen Leerzustand und bleiben jederzeit bedienbar.
- Passend bleibt owner-basiert und fail-closed. Das vegetarische Profil enthält belegte positive Orte, niemals ein unbelegtes Steakhouse; dieselbe Entscheidung und derselbe Grund erscheinen in Places, Stays, Timeline-Vorschlägen und AI Chat.
- Google bleibt auf höchstens 1.000 Aufrufen pro Tag begrenzt; Cache, OSM, Geoapify, TomTom und HERE werden anhand dokumentierter Fähigkeiten und Budgets gesteuert. Safe Regression, NFR-0, sichtbare Browserabnahme und immutable Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für echte Fotoabdeckung, die vollständige reale Kategorie-/Sachfiltermatrix und gemessene Ziel-Latenzen. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich inventarisiert und über diese Blöcke sequenziert. Operativer Hinweis: Das Supabase-Dashboard meldet eine Überschreitung im vorigen Abrechnungszyklus und eine mögliche Projekteinschränkung ab 7. September; Nutzung und Billing müssen unabhängig vom Code beobachtet werden.

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

Gateway **v206 ACTIVE** stellt Software-Build `4.64.23`, App-Build `13.82.168.89`, Core `4.82.218` und Places-Health `4.38.4-osm-dietary-evidence` bereit. Der öffentliche `vegetarian-osm-scharbeutz`-Probe antwortet im Modus `free_osm_dietary_evidence` mit 25 Treffern und ohne Providerfehler.

## Öffentlicher Integrationsrelease

- App: `13.82.168.89`
- Core: `4.82.218`
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

## Kontinuitätserweiterung und öffentlicher Release .97

Der positive Ernährungsbeleg wurde am 6. September 2026 auf die gemeinsame Kategorie- und Landesküchenkontinuität erweitert. Die öffentliche Integration läuft auf App `13.82.168.99`, Core `4.82.218`, Runtime-Commit `706f76928ac4cb96d48fea3416cf7abb7538d7b6`, Gateway v225 / `4.64.30` und Worker `47bc75d4-f2f1-4266-9091-2a22baddb328`.

Der Worker-Endpunkt für OSM-Orte akzeptiert nur die 14 festen Luvia-Kategorien, höchstens 15 Kilometer Radius und höchstens 250 Datensätze. Alle 19 kanonischen Landesküchen werden im Gateway normalisiert. Direkte Overpass-Aufrufe behalten das enge Kontingent von 6 pro Minute und 500 pro Tag. Authentifizierte, sechs Stunden gecachte Proxy-Lookups verwenden nach Migration `20260905235500_openstreetmap_cached_proxy_budget.sql` die getrennte Budgetspur `openstreetmap-cache/lookup` mit 300 pro Minute und 20.000 pro Tag. Cache-Zugriffe verbrauchen damit nicht mehr das Kontingent der tatsächlichen Upstream-Suche.

Öffentliche Health-Proben lieferten Food, Shopping, Natur, Nachtleben und Stays ohne Providerfehler. Der ausdrücklich auf OSM begrenzte vegetarische Probeweg lieferte zehn positive Treffer im Modus `free_osm_dietary_evidence`; der chinesische Probeweg lieferte einen streng belegten Treffer. Im sichtbaren Browser zeigte Essen & Trinken 50 Orte und neun `Passend`-Pins. Das Kleine Steakhouse war nur in `Alle` enthalten und fehlte korrekt in `Passend`. Shopping zeigte elf passende Orte, Natur sechzehn passende Orte, Nachtleben 23 Orte unter `Alle` und Stays 49 koordinatenverifizierte Pins. Zoomen blieb nach dem Kategorienwechsel bedienbar.

Safe Regression `231/231` und NFR-0 `3/3` sind grün. Das offizielle Rollback-Archiv `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.99-706f76928ac4-public-bytes.zip` enthält 3.270 getrackte Dateien, ist 89.272.284 Bytes groß und hat SHA-256 `FF5177D4812F1C6E1943B727B3685105EF3C10CA302CF18E28722DB00FD14C51`. Für 30 releasekritische Dateien sind Archiv, Stable und immutable Worker byteidentisch. Das frühere Git-Archiv ohne den Zusatz `public-bytes` bleibt als Quellarchiv erhalten, wird wegen abweichender Windows-Zeilenenden aber nicht als öffentlicher Bytebeleg verwendet.

P02 und P03 bleiben **TEILWEISE**. Ein sichtbarer Natur-Kaltstart benötigte ungefähr 6,8 Sekunden, mehrere Detail-Sheets besitzen noch kein echtes Bild des Ortes und in Stays sind sichtbare Dubletten vorhanden. Der nächste Abschluss prüft deshalb die reale positive, negative, leere und teilweise Matrix für alle 14 Kategorien, 82 Zuordnungen, 19 Landesküchen und sämtliche Sachfilter. Cache-Treffer müssen Pins innerhalb einer Sekunde und kalte Providerpfade innerhalb von drei Sekunden ohne falschen Leerzustand zeigen. Fotos müssen zur exakten Provider-Place-ID gehören; Places und Stays benötigen dieselbe kanonische Deduplizierung.

## Persistente Kategorienkohorten und Property-Deduplizierung in Release .99

Die Zwischenversion `.98` ergänzte einen begrenzten Session-Cache pro Reise, Oberfläche, Radius und Kategorie. Bereits geladene, sachlich projizierte Ergebnisse stehen nach einem Reload sofort zur Verfügung und werden anschließend über den gemeinsamen Gateway-Pfad aktualisiert. Eine sichtbare Folgefahrt Food → Shopping → Natur → Shopping zeigte beim Rückwechsel wieder die richtige Shopping-Kohorte statt des zuvor beobachteten falschen Leerzustands. Nach einem Reload waren 46 Shopping-Pins 700 Millisekunden nach Abschluss der Navigation sichtbar; diese Messung ist ein Nachweis für die Darstellung aus dem Cache und keine Behauptung über die gesamte Browsernavigation.

Die sichtbare Stays-Abnahme von `.98` lieferte zugleich einen echten Gegenbeleg zu den automatisierten Tests: Unter 49 Pins erschienen **Hotel Strandgrün Golf & Spa Resort** und **Appartementhaus Miramar** jeweils doppelt. `.99` schließt genau diesen Fall. Der gemeinsame Gateway- und Clientvertrag führt allgemeine Orte mit gleichem normalisiertem Namen nur bei identischer normalisierter Volladresse oder höchstens 25 Metern Entfernung zusammen. Ausschließlich für Unterkunftsidentitäten mit exakt gleichem Namen gilt eine Property-Grenze von 350 Metern, weil verschiedene Provider bei Hotelanlagen unterschiedliche Gebäude- oder Flächengeometrien liefern können. Andere Kategorien bleiben bei der strengen 25-Meter-Regel.

Die sichtbare Abschlussfahrt auf `.99` ergab:

- **Food Passend 9:** Strand Creperie, Grande Beach Café, Stranddüne, COAST, Gosch, Janny’s EisCafé, Diercksen, ROOF und Das Leo. Das Kleine Steakhouse fehlt korrekt.
- **Shopping Passend 11:** Die Kategorienkohorte bleibt nach Wechseln erhalten und wird nicht mehr vorzeitig durch einen leeren Zwischenstand ersetzt.
- **Shopping nach Reload 46:** Die gespeicherte Kohorte war unmittelbar nach abgeschlossener Navigation wieder sichtbar.
- **Stays 47:** Hotel Strandgrün Golf & Spa Resort und Appartementhaus Miramar erscheinen jeweils genau einmal.

Der öffentliche Release besteht aus App `13.82.168.99`, Core `4.82.218`, Runtime-Commit `b528182e5833cf8715fc3e9f7967bd124c198419`, Gateway v227 / `4.64.32` / Places `4.38.10-persistent-category-stays-dedupe` und Integration-Worker `4b32f3a4-c318-4a40-a553-6e95f126875e`. Safe Regression `232/232` und NFR-0 `3/3` sind grün.

Das offizielle, aus dem exakten sauberen Deployment-Worktree erzeugte Public-Byte-Archiv `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.99-b528182e-public-bytes.zip` ist 89.013.269 Bytes groß und hat SHA-256 `9292403D895286ADC1E49A0179FC598BE845110BED4A606265320D6CCBFB0C4E`. Dreißig releasekritische Vergleiche stimmen zwischen Archivquelle, Stable und immutable Worker überein.

P02/P03 bleiben **TEILWEISE**. Der nächste gebündelte Abschluss liefert eine lizenzierte Bildkaskade mit exakter Place-ID, nimmt alle 14 Kategorien, 82 Zuordnungen, 19 Landesküchen und sichtbaren Sachfilter real in positiven, negativen, leeren und teilweisen Providerfällen ab und belegt Cache-/Kaltlatenzen von höchstens 1,0 beziehungsweise 3,0 Sekunden. Places, Stays, Timeline-Vorschläge und AI Chat müssen dabei dieselbe Kandidatenmenge, Passungsentscheidung und Begründung verwenden.

Main und Production bleiben unverändert auf Commit `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.
