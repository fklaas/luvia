# PCR P02/P03 – positiver Ernährungsbeleg für „Passend“

**Datum:** 2026-09-05`r`n**Umgebung:** ausschließlich Integration`r`n**Status:** technisch abgesichert; sichtbarer positiver Realbeleg durch externe Providerfreigaben blockiert

## Auslöser

Beim Profil mit der harten Vorgabe **Vegetarisch** lieferte „Essen & Trinken“ weiterhin 50 reale Orte, „Passend“ jedoch keinen Pin. Der frühere Fehler, ein Steakhaus allein wegen allgemeiner oder unsicherer Restaurantmerkmale als passend zu markieren, darf dabei nicht wieder eingeführt werden.

## Ergebnis der Ursachenanalyse

Profil, Kategorieumschaltung, gemeinsamer Alle-/Passend-Bestand und Negativprüfung arbeiten korrekt. Ein Ort gelangt nur dann nach „Passend“, wenn ein Provider einen positiven vegetarischen oder veganen Fakt liefert. Fehlende Angaben bleiben unbekannt und werden nicht als passend interpretiert. Fleischzentrierte Orte benötigen zusätzlich eine dedizierte vegetarische oder vegane Klassifikation.

Die öffentliche Providerdiagnose ergab:

- **HERE:** technisch erreichbar. Die offizielle vegetarische Food-Type `800-077` und vegane Food-Type `800-076` werden jetzt als positive Fakten abgebildet. Eine Scharbeutz-Suche lieferte im Radius von 8 km und 15 km jeweils null explizit vegetarisch klassifizierte Orte.
- **Google Places:** Secret vorhanden, aber der öffentliche Suchaufruf endet mit HTTP 403 und „The caller does not have permission“. Die aktivierte API, Abrechnung oder Schlüsselbeschränkung im Google-Cloud-Projekt muss geprüft werden.
- **Foursquare:** Secret vorhanden und die offizielle Kategorie „Vegan and Vegetarian Restaurant“ (`4bf58dd8d48988d1d3941735`) wird jetzt als positiver Ernährungsbeleg abgebildet. Der öffentliche Aufruf endet mit HTTP 429 und der Providerantwort, dass das Konto keine API-Credits mehr besitzt.
- **Geoapify:** Ernährungs-Tags wie `diet:vegetarian=yes|only` und `diet:vegan=yes|only` werden bereits als positive Fakten ausgewertet. Im aktuell verfügbaren breiten Live-Bestand war kein solcher positiver Fakt vorhanden; die bestehende Gratisreserve bleibt erhalten.

## Gelieferte Änderung

- Der seltene, belegpflichtige Profilnachweis nutzt die Reihenfolge **HERE → Google → Foursquare**. HERE wird als kostenlose Quelle zuerst befragt; die begrenzten Quellen werden nur benötigt, wenn HERE keinen positiven Treffer liefert.
- HERE darf eine sekundäre vegetarische oder vegane Food-Type als positiven Verfügbarkeitsfakt verwenden. Nationale Landesküchen bleiben weiterhin an den primären HERE-Food-Type gebunden, damit beispielsweise ein sekundärer spanischer Tag keinen deutschen Haupttyp überschreibt.
- Foursquare verwendet seine offizielle Vegan-/Vegetarisch-Kategorie sowohl im Suchfilter als auch bei der Normalisierung. Ein allgemeines Restaurant bleibt ohne positiven Ernährungsfakt unbekannt.
- Google ist ausschließlich für `search` als Ernährungsbeleg freigegeben: höchstens 4 Aufrufe pro Minute, 25 pro Tag und 800 pro Monat.
- Foursquare ist ausschließlich für `search` freigegeben: höchstens 2 Aufrufe pro Minute, 12 pro Tag und 300 pro Monat. 200 der angekündigten 500 monatlichen Gratisaufrufe bleiben als Reserve unberührt. Details und Fotos bleiben in dieser Kostenregel deaktiviert.
- Providerfehler enthalten in der öffentlichen, begrenzten Diagnose den äußeren HTTP-Status, jedoch keine Schlüssel oder vollständigen Providerantworten.
- Ein separat gefundener positiver Ort wird nur über dieselbe Provider-ID oder über exakt gleichen normalisierten Namen in höchstens 25 Metern mit dem sichtbaren Alle-Bestand verbunden. Danach verwenden Pins, „Alle“, „Passend“, Timeline und AI Chat denselben Ort und denselben Beleg.

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

Gateway **v203 ACTIVE** stellt Software-Build `4.64.20`, App-Build `13.82.168.86`, Core `4.82.208` und Places-Health `4.38.1-here-dietary-evidence` bereit. Relevante Gateway-Quellcommits sind `d9d8d355`, `bb986d67`, `e432c186` und `afe694f5`.

## Öffentlicher Integrationsrelease

- App: `13.82.168.86`
- Core: `4.82.208`
- Runtime-Commit: `790ee03ca952a75799c4f7178a3478878dabbc8a`
- Integration-Worker: `154aa828-e9bd-4dbc-993f-87e34ac40176`, 100 Prozent Traffic
- Stable: `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable: `https://154aa828-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.86-790ee03c.zip`
- Archivgröße: `88.755.996` Bytes
- Archiv-SHA-256: `5723DC228D90E9689EF9632D126293F5015ACEF627D1D0B1439CC42D34E1F588`
- Öffentliche Bytegleichheit: `30/30 MATCH`, je 15 releasekritische Dateien auf Stable und Immutable gegen das saubere Archiv
- Sichtbarer Browserlauf: Essen & Trinken `50`, Suchprovider `HERE`, Profilfokus `Vegetarisch`, „Passend“ `0/0`; Evidenzkaskade `here,google,foursquare`, `returned=0`, `eligible=0`, `before=0`, `after=0`
- Safe Regression: `226/226 PASS`

## Wahrheitsgrenze und Abschlusskriterium

Der technische Weg für positive Treffer ist vorhanden und vollständig getestet. Der sichtbare Scharbeutz-Nachweis bleibt dennoch leer, solange HERE keinen expliziten Datensatz liefert, Google den Aufruf mit 403 abweist und Foursquare keine Credits besitzt. Luvia darf diese Lücke nicht durch Namensraten, Küchenannahmen oder ein Steakhouse-Falschpositiv verdecken.

P02/P03 bleiben deshalb **TEILWEISE**. Der Abschluss verlangt mindestens einen realen, providerbelegten vegetarisch passenden Ort auf der öffentlichen Integration sowie dieselbe Provider-ID und denselben lesbaren Passend-Grund in Karte, Timeline und AI Chat.

Main und Production bleiben unverändert auf Commit `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.
