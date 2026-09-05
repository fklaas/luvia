# PCR P02/P03 – gemeinsamer Filtervertrag, Profilbelege und Karten-Kontinuität

**Datum:** 2026-09-05

**Status:** technisch und auf Integration geliefert. P02/P03 bleiben für positive Providerbreite, vollständige sichtbare UI-/AI-/Fotoabnahme und physische Mobilzeiten teilweise umgesetzt. P09/P10 kann als nächster aktiver Block beginnen.

**Umgebung:** ausschließlich Integration; Main und Production unverändert.

## Problem und Ursache

Places, Timeline-Vorschläge und AI Chat interpretierten Kategorie-, Untertyp-, Landesküchen- und Faktenfilter an mehreren Stellen. Die Kartenoberfläche filterte streng, während Chat-Anfragen Teile der Absicht erneut aus Freitext aufbauten. Für das vegetarische Profil konnte die breite Karte deshalb nur vorhandene Pins bewerten. Ein providerbelegter vegetarischer Ort außerhalb dieser ersten Menge gelangte nicht in den gemeinsamen Alle-/Passend-Bestand. Gleichzeitig konnten schnelle Providerfehler eine gerade gewechselte Kategorie leeren. Die sichtbare Abnahme reproduzierte nach vielen Wechseln einen temporären 503.

## Gelieferte Korrektur

- `LuviaGlobalPlaceContracts` besitzt einen gemeinsamen Filtervertrag für alle 14 kanonischen Kategorien, 82 sichtbare Typ-/Untertypabbildungen, 19 Landesküchen und die Fakten Öffnungszustand, Bewertung, Entfernung, Reservierbarkeit, Barrierefreiheit, Preis und Sortierung.
- Karte, Timeline-Vorschläge und AI Chat kompilieren daraus dieselben `includedType(s)`, Ernährungs-, Zugänglichkeits-, Reservierungs-, Öffnungs-, Bewertungs-, Preis-, Distanz- und Sortieranforderungen für `places.v1`.
- Timeline-Vorschläge übergeben denselben aktuellen Profil- und Reisekontext wie die Places-Karte.
- Eine dedizierte vegetarische oder vegane Providerentdeckung kann einen positiv belegten Ort in den gemeinsamen Alle-/Passend-Bestand aufnehmen. Identitäten werden nur über dieselbe Provider-ID oder exakt gleichen normalisierten Namen innerhalb 25 Metern verbunden.
- Ein allgemeines Merkmal `servesVegetarianFood=true` genügt bei einem fleischzentrierten Ort nicht. Erdmann's Kleines Steakhaus bleibt damit aus Passend ausgeschlossen.
- Normale Kartenabrufe bleiben auf der kostenlosen `auto`-Kaskade aus Geoapify, TomTom und HERE. Nur ein ausdrücklicher Profil-Ernährungsnachweis darf nach dieser Kaskade begrenzt Google und Foursquare als exakte Evidenzquellen nutzen.
- Ein leerer Kategorienwechsel wiederholt transiente 429/502/503/504-, Timeout-, Transport-, Circuit- und Providerfehler genau einmal. Validierungsfehler werden nicht wiederholt.
- Detailfotos bleiben an die exakt gewählte Provideridentität gebunden und werden erst bei Bedarf geladen.

## Sichtbare Integrationsabnahme

Auf der stabilen Integration mit der aktiven Reise **Ostseeurlaub** und Reiseziel **Scharbeutz** wurden folgende Ergebnisse sichtbar geprüft:

- Essen & Trinken: 50 Pins, `ready`, HERE.
- Shopping: 21 Pins, `ready`, HERE.
- Natur & Erholung: 11 Pins, `ready`, HERE.
- Nachtleben: 17 Pins, `ready`, HERE.
- Aktivitäten: 29 Pins, `ready`, HERE.
- Italienisch: 11 fachlich passende Pins, darunter Salentino, Capolino, Portobello und Trattoria Martinello.
- Chinesisch: zwei fachlich passende Pins, **Saigon Asia Bistro** und **China Restaurant Haycheng**.
- Stays: 49 Pins, `ready`, dieselbe MapLibre-/Places-Projektion; die Kurzinfo liegt innerhalb der Karte.
- Responsive Places und Stays bei 390 × 844: kein horizontaler Dokumentüberlauf, Hauptnavigation sichtbar, Kurzinfo innerhalb der Karte.
- Passend: Beim aktuellen vegetarischen Profil ist kein positiver Ernährungsbeleg verfügbar. Die Karte zeigt deshalb 0 statt eines erfundenen Treffers und erklärt die Evidenzlücke. Das Steakhouse erscheint nicht.

Die responsive Browsermessung ist ein sichtbarer Chromium-Nachweis. Kaltstart-, Warmstart-, Reisewechsel-, Zoom-, Zieh- und Pin-Zeiten auf einem physischen iPhone und Android-Gerät bleiben offen.

## Automatisierte und unveränderliche Belege

- App: `13.82.168.81`
- Core: `4.82.203`
- Runtime-Commit: `6503e700a583f9aabe49fd1f3733c8e97be7519d`
- Integration-Worker: `ffb176c3-0015-44d0-8a66-e59c68c16a63`, 100 Prozent Traffic
- Unveränderliche URL: `https://ffb176c3-integration-luvia.njwnrvwbv5.workers.dev`
- Gateway: `v196 ACTIVE`, Software `4.64.20`, unveränderter Health-Build `13.82.168.79`, Core `4.82.201`
- Safe Regression: `225/225 PASS`; darin NFR-0 `3/3 PASS`
- Filtervertrag: 14 Kategorien, 82 Typ-/Untertypabbildungen, 19 Landesküchen sowie sämtliche Fakten-, Kombinations-, Reset-, Distanz-, Budget- und Medienidentitätsprüfungen `PASS`
- Öffentliche Byte-Gleichheit: `30/30 MATCH`, je 15 kritische Dateien gegen stabile und unveränderliche Integration
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.81-6503e700.zip`
- Archivgröße: `88.742.067` Bytes
- Archiv-SHA-256: `4608310968FFD1DC160D59826D1461AD4D8CADCFFA18CF83A7DC3BC9C3D10B25`

## Rückfall und verbleibende Grenze

Unmittelbarer Frontend-Rückfall ist `.80` auf Worker `d18bca99-eee3-4807-a0ee-0b57474e0ba1`. Danach bleibt `.79` auf Worker `c572b36d-f8c7-4193-8022-b1a030101f25` erhalten. Gateway-Rückfall bleibt `v195 / 4.64.19`. Main steht weiterhin auf `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.

Offen bleiben eine nützliche positive Profilmenge aus realen Providerbelegen, die vollständige sichtbare Filtermatrix über Oberfläche und AI Chat mit identischen Place-IDs, echte ortsidentische Bilder für einen breiten Place-/Stays-Satz sowie physische Mobilzeiten. Diese Restnachweise bleiben P02/P03 zugeordnet und blockieren den Start des nächsten aktiven P09/P10-Produktblocks nicht.
