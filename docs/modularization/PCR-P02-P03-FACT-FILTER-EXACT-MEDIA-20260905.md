# PCR P02/P03 – Faktenfilter, exakte Ortsmedien und robuster Kartenstart

Stand: 05.09.2026

Kanal: Integration
Status: technisch geliefert; P02/P03 bleiben bis zur vollständigen sichtbaren UI-/AI-Filtermatrix, breiten Fototrefferquote und physischen Mobilmessung **TEILWEISE**.

## Gelieferter Umfang

- Alle serverseitig unterstützten Faktenfilter werden nach der Providerantwort erneut strikt ausgewertet. Fehlende Evidenz erfüllt keinen Filter für Bewertung, Preis, geöffnet, reservierbar, barrierefrei, Ernährungsart, Mindestanzahl Bewertungen oder Entfernung.
- Vegetarisch und vegan verlangen positive dedizierte Evidenz. Ein fleischzentrierter Ort wird ohne einen konkreten Ernährungsbeleg nicht als passend eingestuft.
- Geoapify-Medien aus dem exakt verknüpften Ortseintrag werden bereits in der Suchantwort mit Provider-, Identitäts- und Verifikationsmetadaten übernommen. Detailabrufe trennen schlanke und medienangereicherte Cacheeinträge.
- Die gemeinsame Detaildarstellung bewahrt Bild, Attribution und sicheren Quellenlink. Fehlt ein identitätsgebundenes Bild, zeigt Luvia eine ehrliche Bildlücke statt eines fremden Stockfotos.
- Das reale Ortsbild bleibt nun über Pin-Kurzkarte, Ergebnisansicht und die anschließend geöffnete große Detailansicht erhalten.
- Der Runtime-Loader wiederholt neben klassischen Skripten auch dynamische Kernmodule einmal mit einer eindeutigen zweiten URL. Dadurch kann sich der Start nach einem einzelnen transienten Modulfehler selbst erholen.

## Sichtbares Gegenbeispiel und Korrektur

Der erste öffentliche Test von App 13.82.168.75 zeigte Snykrode mit einem realen Bild in Kurzkarte und Ergebnisansicht. Nach dem Klick auf **Details** fehlte das Bild in der großen Detailansicht. App 13.82.168.76 ergänzte deshalb die gemeinsame Medienprojektion in diesem Dialog.

Ein danach neu geöffneter Stays-Tab zeigte einmal den Bootstrap-Fallback. Die Browserdiagnose belegte den fehlgeschlagenen dynamischen Import von `app/adapters/platform-port-adapters.mjs`. Ein manueller Reload startete anschließend die 49-Pin-Unterkunftskarte. App 13.82.168.77 ergänzt den begrenzten automatischen Modul-Zweitversuch. Ein frischer öffentlicher Stays-Start lieferte danach 49 koordinatenverifizierte Unterkünfte ohne manuellen Reload und mit leerer Browserfehlerliste.

## Öffentliche sichtbare Abnahme

Finale URL: `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=places&acceptance=p02-p03-release77-photo-final`

- Places startete mit 50 koordinatenverifizierten Orten im Zielradius Scharbeutz.
- Sehenswürdigkeiten lieferte zwei koordinatenverifizierte Orte: Snykrode und Cap Arcona.
- Snykrode zeigte das identische Ortsbild in Pin-Kurzkarte, Ergebnisansicht und großer Detailansicht.
- Die große Detailansicht zeigte sichtbar **Bild aus dem verknüpften Ortseintrag** als Quellenlink zum Wikimedia-Medium des Snykrode-Eintrags.
- Die Browserfehlerliste blieb leer.

Finale Stays-URL: `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=hotels&acceptance=p02-p03-release77-cold-1`

- frischer Start ohne manuellen Reload;
- 49 koordinatenverifizierte Unterkünfte;
- gemeinsame Karten-, Pin-, Such-, Passend- und Filteroberfläche;
- leere Browserfehlerliste.

Bereits im vorherigen sichtbaren Lauf belegt: breite Places-Menge 50, Passend-Menge 9 mit neun Passt-Kennzeichnungen, vegetarische Menge 12 ohne Kleines Steakhouse und Shopping 46 mit funktionierendem Faktenfilter.

## Releasebeleg

- App: `13.82.168.77`
- Core: `4.82.199`
- Runtime-Commit: `240874bf0506d12076dadc43e6cb6e2d66cb7c53`
- Integration-Worker: `e47b5593-a586-4697-9d10-e6ca16e04089`, 100 Prozent Traffic
- Unveränderliche URL: `https://e47b5593-integration-luvia.njwnrvwbv5.workers.dev`
- Gateway: `v194 ACTIVE`, Software `4.64.18`, Health-Build `13.82.168.77`, Core `4.82.199`
- Git-Archiv: `luvia-integration-13.82.168.77-240874bf.zip`
- Archivgröße: `88.725.217` Bytes
- Archiv-SHA-256: `8C82FDF04B38BCED554EE6F85EC4D70FE4C3F374CFB8745B9605D87A7B61B4C5`
- Öffentlicher Bytebeleg: `30/30 MATCH` für stabile und unveränderliche URL
- Safe Regression: `224/224 PASS`
- NFR-0: `3/3 PASS`

## Kontrollierte Rückfälle

- Unmittelbarer Frontend-Rückfall: App 13.82.168.76 / Core 4.82.198 auf Worker `03c00d01-3a71-4983-8295-9fae4caecb78`. Dieser Stand enthält die Detailbildkorrektur, aber noch keinen automatischen Zweitversuch für dynamische Module.
- Unmittelbarer Gateway-Rückfall: v193. Die letzte Gatewayänderung zwischen v193 und v194 betrifft die gemeldete Build-/Core-Identität.
- Vollständiger Rückfall vor dem gesamten Filter-/Medienpaket: App 13.82.168.74 / Core 4.82.196 auf Worker `74816b52-0c5d-476a-81ed-85d67d72f387` und Gateway v191.
- Die Budgetreserve bleibt getrennt kontrollierbar: Geoapify 2.800 Credits pro Tag mit 200 Credits Reserve; der frühere Budgetstand beträgt 2.200 Credits pro Tag.

## Noch offen

- jede sichtbare Kategorie-, Untertyp-, Fakten- und Landesküchenoption über Places, Stays und AI Chat positiv oder mit providerbelegtem Nullfall abnehmen;
- identische Kandidatenmengen, Radius, Passend-Gründe und Providerbelege in Karte, Timeline-Vorschlägen und AI Chat nachweisen;
- reale Fototrefferquote über eine breite Ortsstichprobe messen und falsche beziehungsweise benachbarte Medien weiterhin verwerfen;
- Kaltstart, Warmstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel und sichtbare Pin-Zeit auf einem physischen Mobilgerät messen.

## Genau ein nächster Schritt

`P02-P03-filter-photo-mobile-acceptance`: die restliche sichtbare Filter-, Foto- und Mobilmatrix schließen.
