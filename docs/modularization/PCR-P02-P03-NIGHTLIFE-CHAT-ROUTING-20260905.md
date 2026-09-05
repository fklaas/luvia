# PCR P02/P03 – Nachtleben-Breite und deterministische Chat-Navigation

Datum: **05.09.2026**

Status: **FÜR DEN AKTIVEN INTEGRATION-SLICE FREIGEGEBEN**

## Problem

Die gemeinsame Places-Projektion ist veröffentlicht, aber zwei reale Gegenbelege bleiben: Eine ausdrückliche Chat-Anweisung zum Öffnen von Places, Stays oder Hotels kann durch einen nachgelagerten, blockierten KI-Compile-Zustand abgefangen werden. Außerdem beendet die kostenlose Providerkaskade eine Nachtleben-Suche bereits nach einem kleinen erfolgreichen Geoapify-Teilstand. Dadurch bleiben belegte Bars, Pubs, Clubs, Live-Musik-Orte und Casinos aus TomTom und HERE unsichtbar.

## Owner und Verträge

- **Navigation** besitzt die registrierte App-Route und erzeugt ausschließlich einen `navigation.v1`-Intent.
- **Intelligence** darf eine ausdrückliche Navigationsformulierung erkennen und an `navigation.v1` delegieren. Sie speichert dabei keine Places-, Trip- oder Navigation-Truth.
- **Places** besitzt Kategorien, Provider-Taxonomie, Deduplizierung und die öffentliche `places.v1`-Projektion.
- Der vorhandene Gateway bleibt der einzige serverseitige Provider-Koordinator. Es entsteht keine zweite Ortsliste.

Die Änderungen sind additiv und rückwärtskompatibel. `navigation.route.open` bleibt auf registrierte interne Routen und eine direkte Nutzergeste beschränkt. `places.v1` behält seinen öffentlichen Major-Contract.

## Betroffene Dateien und Streams

- Intelligence: `core/intelligence/intelligence-action-contract-core.js`, `core/ai/ai-action-runtime.js`
- Places: `core/places/places-domain-contract-core.js`, `core/places/global-place-contracts.js`
- Consumer/Experience: `app/places/places-spatial-experience.js`
- Gateway: `supabase/functions/luvia-gateway/_shared/places.ts`, `supabase/functions/luvia-gateway/_shared/additional-places.ts`
- Tests und Release-/Fahrplandokumentation

Die Umsetzung erfolgt als kontrollierter Integration-Slice auf dem vorhandenen Codex-Branch. Main und Production bleiben unberührt.

## Verhalten

1. Eine ausdrückliche Anweisung wie „Öffne Places“, „Öffne Stays“ oder „Öffne Hotels für unsere Reise in Scharbeutz“ wird vor einem optionalen KI-Compile-Ergebnis deterministisch auf eine registrierte Route abgebildet.
2. Suchformulierungen wie „Finde Hotels“ bleiben Booking-/Places-Suchen und werden nicht zu Navigation umgedeutet.
3. Nachtleben umfasst providerbelegt Bars, Pubs, Cocktail- und Weinbars, Lounges, Clubs und Diskotheken, Live-Musik, Jazz, Comedy, Karaoke und Casinos.
4. Geoapify bleibt der günstige Primäranbieter. Nur wenn eine automatische Nachtleben-Suche unter dem begrenzten Breitenziel bleibt, ergänzen TomTom und danach HERE den Teilstand innerhalb ihrer bestehenden serverseitigen Budgets und Caches.
5. Jeder Provider kann ausfallen oder sein Budget ablehnen, ohne belegte Ergebnisse der anderen Anbieter zu löschen. Providerherkunft und Ergänzungsgrund bleiben in der Diagnose sichtbar.

## Datenbank, Functions und Secrets

- Keine Migration und keine Datenbankänderung.
- Eine neue Version der bestehenden Edge Function `luvia-gateway`; kein neuer Endpunkt.
- Keine neuen Secrets und keine Ausgabe vorhandener Schlüssel.

## Abnahme

- Browserloser Test für Places/Stays/Hotels-Navigation trotz blockiertem oder konfliktbehaftetem KI-Compile-Zustand.
- Taxonomie- und Filtertest für sämtliche neuen Nachtleben-Untertypen gegen Geoapify-, TomTom- und HERE-Fakten.
- Orchestrierungstest: kleiner Geoapify-Teilstand wird providerübergreifend ergänzt; ausreichender Primärbestand verursacht keine Zusatzaufrufe; Fehler eines Ergänzungsproviders löscht keine Treffer.
- Bestehende Kategorie-Reinheit, Landesküchen, Alle/Passend und exakte Fotoidentität bleiben grün.
- Vollständige Safe Regression, unveränderliches Archiv und öffentliche Byte-Gleichheit vor Veröffentlichung.
- Sichtbare Integration-Abnahme in Chat und Places-Karte für Scharbeutz/Timmendorfer Strand.

## Rollout und Rückfall

Frontend und Gateway werden auf Integration getrennt versioniert. Der vorherige App-Worker **011f96cd-488b-437e-b465-5ad74e8c7e20** und Gateway **v172** bleiben als unmittelbare Rückfallpunkte erhalten. Ein Rückfall betrifft nur die fehlerhafte Schicht; Main, Production, Datenbank, RLS und Secrets bleiben unverändert.
