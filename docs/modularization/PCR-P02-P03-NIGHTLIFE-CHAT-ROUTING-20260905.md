# PCR P02/P03 – Nachtleben-Breite und deterministische Chat-Navigation

Datum: **05.09.2026**

Status: **INTEGRATION ABGENOMMEN; P02/P03 BLEIBEN BIS ZUR REALEN FILTER-/FOTO-/MOBILMATRIX TEILWEISE**

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

## Belegtes Ergebnis

- App **13.82.168.66**, Core **4.82.188**, Runtime-Commit **296f28b9987c6befdc702bd9609ad6c8d80d00ae**.
- Worker **d608d9eb-e2b7-44b7-80ef-cf7be5a18e32** auf Integration mit 100 Prozent Traffic; Gateway **v173 ACTIVE**.
- Unveränderliches Archiv `release66-296f28b9.zip`, 88.697.245 Bytes, SHA-256 **5B903DE9F0F9A0E0678AC49B446F0A3D7E904AF0A723A925AB80893428E74770**.
- Safe Regression **222/222 PASS** und öffentliche Byte-Gleichheit **30/30 PASS** auf stabiler und unveränderlicher Worker-Adresse.
- Sichtbarer, angemeldeter Browserlauf: Nachtleben in Scharbeutz lieferte **23** koordinatenverifizierte Orte; der Chat-Befehl „Öffne Stays für unsere Reise in Scharbeutz.“ wechselte zu **49** Unterkünften; „Öffne Places für unsere Reise in Scharbeutz.“ stellte dieselbe Nachtleben-Kategorie mit **23** Orten wieder her. Nach weiteren acht Sekunden blieb die Menge bei 23.
- Frühere sichtbare Stichproben auf demselben Kategorienstand: Shopping **46**, Natur und Erholung **16**.

Während der Abnahme wurden zwei reale Gegenbeispiele gefunden und vor Freigabe geschlossen. Im ersten Zwischenstand erreichte der Navigationsalias zwar den Action-Runtime-Vertrag, wurde aber zuvor vom Dashboard-Compile-Gate abgefangen. Im zweiten Zwischenstand zeigte der Live-Lauf zunächst 23 Nachtleben-Orte, stellte nach einem Routenwechsel jedoch nur die acht Geoapify-Orte aus dem lokalen Cache wieder her. Der finale Stand führt die deterministische Navigation vor dem optionalen Compile-Gate aus, speichert den vollständigen Geoapify-/TomTom-/HERE-Verbund und verwendet einen neuen Cache-Namensraum, sodass alte unvollständige Ein-Anbieter-Datensätze nicht fortgeschrieben werden.

Maschinenlesbare Belege liegen in `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\public-byte-proof66.json`, `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release66-visible-browser-evidence.json` und `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\p02-p03-nightlife-chat-release66-regression.log`.

## Rollout und Rückfall

Frontend und Gateway werden auf Integration getrennt versioniert. Der vorherige App-Worker **21be60e2-c3b0-4f1f-866c-d74da64bf85e** mit App **13.82.168.65** und Gateway **v172** bleiben als unmittelbare schichtweise Rückfallpunkte erhalten. Der aktuell verwendete Gateway v173 verändert weder Datenbank noch Secrets. Main, Production, Datenbank und RLS blieben während dieses Slices unverändert.
