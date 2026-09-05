# PCR P02/P03 – positiver Ernährungsbeleg für „Passend“

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert; der nächste externe Abschlussblock bleibt B1/P02–P03 für einen positiven Google-Places-Ernährungsbeleg. A1 Dokumentkonsolidierung wird mit diesem Release fortgeschrieben; A2 ist teilweise belegt.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2 bei 100 Prozent Traffic. Bestätigte Besuche werden über den Places Visit Owner revisionssicher gelesen, korrigiert, entfernt und nach Reload wiederhergestellt; doppelte Legacy-Projektionen sind unterdrückt und private Felder bleiben aus dem öffentlichen Vertrag. Die Supabase-Constraint ist für neun Visit-Zustände verifiziert. Sichtbarer 477×900-Browsertest, öffentlicher Timeline-/Places-Nachweis, 227/227 Safe Regression und 30/30 öffentliche Bytevergleiche PASS. Sauberes Archiv: 88.771.845 Bytes, SHA-256 3A8E4592EDF325F40AC7A7BC84BBACBFBFBB8E2E56356F6A0A6CDAD3F0CF7239. Der Standard-Worker wurde nach einer falschen Zieladressierung aus dem unveränderten Main-Commit wiederhergestellt und bytegleich geprüft; Git-Main blieb unverändert.

**Nächster Schritt (AKTIV): Google Places für den positiven Ernährungsbeleg freischalten und sichtbar abnehmen.** Vertrag, Negativregeln und providerübergreifende Kaskade sind grün. Google besitzt laut Nutzerangabe 1.000 Aufrufe pro Tag, antwortet am öffentlichen Gateway aber noch mit 403; HERE liefert lokal keine expliziten Ernährungsfakten und Foursquare besitzt keine Credits.

**Abnahme dieses Schritts:**

- Im bereits geöffneten Google-Cloud-Projekt anmelden und das richtige Projekt bestätigen.
- Places API (New), aktives Billing und eine ausschließlich auf die benötigte Places-Suche beschränkte Server-Key-Konfiguration prüfen.
- Der öffentliche Health-Probe wechselt von HTTP 403 zu einer erfolgreichen, budgetierten Google-Antwort ohne Schlüssel- oder Rohdatenoffenlegung.
- Essen & Trinken zeigt für das vegetarische Profil mindestens einen realen Passt-Pin und weiterhin kein unbewiesenes Steakhouse.
- Places, Timeline und AI Chat zeigen dieselbe Provider-ID, denselben Reisezielradius und einen lesbaren providerbelegten Passend-Grund.
- Stable und Immutable Integration, Bytegleichheit, Regression und der unveränderte Git-Main-Stand sind belegt.

**Danach:** Danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: positive Google-Freigabe und öffentlicher Ernährungsbeleg sowie vollständige UI-/AI-/Foto- und physische Mobilabnahme. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
- **Google Places:** Secret vorhanden, aber der öffentliche Suchaufruf endet mit HTTP 403 und „The caller does not have permission“. Die aktivierte API, Abrechnung oder Schlüsselbeschränkung im Google-Cloud-Projekt muss geprüft werden.
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
