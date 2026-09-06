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

## Nachtrag 06.09.2026 – App 13.82.168.100 / exakter Medien-Seed

Die weitere öffentliche Abnahme zeigte, dass ein echtes Bild bereits in der
Suchentität vorhanden sein konnte, diese exakte Provider-Entität aber nicht bis
zum gemeinsamen Detail-Owner transportiert wurde. Insbesondere konnte ein
OpenStreetMap-Treffer dadurch seine verknüpften Wikidata-/Wikimedia-Fakten beim
Detailabruf verlieren. Zusätzlich unterschied der Detail-Cache nicht zwischen
einer bildlosen Anfrage und derselben Place-ID mit einem konkreten Medienbeleg.

App 13.82.168.100 schließt beide Grenzen:

- Places übergibt die ausgewählte Search-Entität als `seedPlace`; der gemeinsame
  Detail-Owner transportiert sie nur bei übereinstimmender normalisierter
  Provider-Place-ID als `providerPlaceSeed` zum Gateway.
- Der Detail-Cache-Schlüssel enthält eine begrenzte Signatur der exakten
  Provider-ID, Wikidata-ID, Wikimedia-Kategorie, Bildreferenz und vorhandener
  Providerfotos. Ein früher bildloser Abruf kann einen späteren belegten Abruf
  daher nicht mehr verdecken.
- OSM-Details übernehmen Medien nur aus der exakt ausgewählten OSM-Entität.
  Fehlt dort ein Bild, darf Foursquare nur nach der bestehenden strengen
  Ortsidentität helfen: normalisierter Name und höchstens 120 Meter oder eine
  markante enthaltene Namensform und höchstens 25 Meter. Erst danach wird genau
  ein populäres Foto der bestätigten Entität geladen.
- Fremde, nur räumlich nahe oder aus einer allgemeinen Kategoriesuche stammende
  Bilder bleiben ausgeschlossen. Ein Place ohne sicheren Bildbeleg bleibt
  sichtbar und ehrlich bildlos.

### Öffentliche sichtbare Abnahme

- URL Places: `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=places&acceptance=p02-p03-100-media-fit`
- URL Stays: `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=hotels&acceptance=p02-p03-100-stays-media`
- URL Sehenswürdigkeiten: `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=places&acceptance=p02-p03-100-sights-media`
- Food `Passend` zeigte neun belegte Orte; Kleines Steakhouse war nicht enthalten.
- Shopping `Passend` zeigte elf Orte. Nach Wechsel zu `Alle` und einem echten
  Browser-Reload waren 46 koordinatenverifizierte Shopping-Pins vorhanden.
- Stays zeigte 47 eindeutige Unterkünfte. Hotel Strandgrün Golf & Spa Resort und
  Appartementhaus Miramar erschienen jeweils einmal.
- Snykrode zeigte dasselbe reale Foto in Karten-Kurzvorschau, Ergebnis-Sheet und
  vollständiger Detailansicht. Die Detailansicht kennzeichnete die Herkunft als
  `Bild aus dem verknüpften Ortseintrag` und verlinkte die konkrete Wikimedia-
  Datei `Scharbeutz_-_Burg_Snykrode_-_Snikrode.jpg`.
- Hotel Strandgrün blieb ohne sicheren Bildbeleg korrekt bildlos. Dieser
  Gegenfall belegt die Fail-closed-Grenze; er belegt zugleich, dass die breite
  Fotoabdeckung noch nicht abgeschlossen ist.

### Releasebeleg

- App: `13.82.168.100`
- Core: `4.82.219`
- Runtime-Commit: `b9f32115d75780d9eb76ec03cb31afedf870af94`
- Gateway: `v228 ACTIVE`, Software `4.64.33`, Places
  `4.38.11-exact-media-seed-bridge`
- Integration-Worker: `1dcf5de1-c743-4d4c-8d52-40cbac209b03`, 100 Prozent Traffic
- Unveränderliche URL: `https://1dcf5de1-integration-luvia.njwnrvwbv5.workers.dev`
- Byteidentisches Deployment-Archiv:
  `luvia-integration-13.82.168.100-b9f32115-public-bytes.zip`, 89.015.942 Bytes,
  SHA-256 `56D8ED1D6F2B92D52F2B8A310921BF7888AB7E0F8F18340D82BB35F868D9C06D`
- Öffentlicher Bytebeleg: `30/30 MATCH` zwischen Archiv, Stable und immutable Worker
- Safe Regression: `232/232 PASS`
- NFR-0: `3/3 PASS`
- Release-, Planstatus-, Inventar-, Filter-, Ernährungs-, Medien- und
  Deduplizierungs-Gates: PASS
- Main und Production: unverändert

Unmittelbarer App-Rückfall ist
`npx wrangler versions deploy 4b32f3a4-c318-4a40-a553-6e95f126875e@100 --name integration-luvia --message "Rollback App 13.82.168.100 exact-media seed bridge to accepted App 13.82.168.99" --yes`.
Ein Gateway-Rückfall würde den akzeptierten Gateway-Quellstand aus Runtime-Commit
`b528182e5833cf8715fc3e9f7967bd124c198419` erneut als `luvia-gateway`
veröffentlichen.

P02/P03 bleiben **TEILWEISE**. Der nächste Schritt bleibt
`P02-P03-exact-media-filter-latency-matrix`: reale Bildtrefferquote und
Quellenkaskade providerweise messen und erweitern, danach alle sichtbaren
Kategorie-, Landesküchen- und Sachfilterfälle sowie Cache- und Kaltlatenzen auf
Desktop und Touch vollständig abnehmen.

## Nachtrag 06.09.2026 – App 13.82.168.101 / Provider- und Spezialtypenkaskade

App 13.82.168.101 führt den gemeinsamen Providerpfad über Karten, Diagnose und
AI Chat fort und schließt zwei reale Datenverluste:

- `leisure=miniature_golf` bleibt als kanonischer Typ
  `miniature_golf_course` erhalten, anstatt in den zu breiten Typ
  `amusement_center` zu fallen. Golfplätze bleiben ebenfalls eigenständig.
- Sport-, Outdoor-, Surf-, Fahrrad- und Spielwarenläden werden in strikte
  Bedarfsarten überführt. Die Strandbedarfsdiagnose liefert dadurch keine
  allgemeinen Supermärkte mehr.
- Geoapify bewahrt weiterhin den exakten Medien-Seed der ausgewählten Entität.
  Fehlt ein Bild, darf Foursquare ausschließlich nach strenger Ortsidentität
  ein Foto ergänzen. Die produktive Budgetrichtlinie erlaubt dort nur `search`
  und `photo`, begrenzt auf 300 Aufrufe pro Monat, 12 pro Tag und 2 pro Minute.
  Nutzungszähler, Cooldown und letzter Providerstatus wurden bei der Migration
  nicht zurückgesetzt.

### Öffentliche Providerproben

Die Proben liefen gegen Gateway v230 und die stabile öffentliche Integration:

- Minigolf Scharbeutz: zwei Treffer, `Strandgolfer` und
  `Schwarzlicht Minigolf`, beide aus OpenStreetMap;
- dieselbe Minigolfanfrage aus dem AI-Chat-Pfad: dieselben zwei Treffer;
- chinesische Küche: ein konkreter Treffer, `Hay-Cheng`;
- strikter Strand- und Reisebedarf: drei Treffer, ohne die vorherigen breiten
  Supermarkt-Falschpositiven;
- Essen und Trinken: zwölf Treffer in der begrenzten Gatewayprobe;
- Stays: zwölf Treffer in der begrenzten Gatewayprobe, davon ein Treffer mit
  sicherem Foto.

Die warme Minigolf-, Bedarfs-, Food-, Küchen- und Stays-Kaskade benötigte 0,32
bis 0,49 Sekunden. Der erste kalte Minigolfpfad benötigte 5,58 Sekunden und
verfehlt damit weiterhin das Ziel von höchstens drei Sekunden. Dieser Wert wird
nicht als abgeschlossen gewertet.

### Sichtbare Browserabnahme

- Places-URL:
  `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=places&acceptance=p02-p03-101-visible`
- Stays-URL:
  `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=hotels&acceptance=p02-p03-101-visible`
- Essen und Trinken zeigte 48 koordinatenverifizierte Orte unter `Alle` und
  neun belegte Orte unter `Passend`. `Kleines Steakhouse` war unter `Alle`
  sichtbar, trug dort keinen Passungsbeleg und erschien nicht unter `Passend`.
- Shopping zeigte 46 Orte unter `Alle` und elf unter `Passend`.
- Natur und Erholung wechselte ohne falschen Leerzustand auf 15 Orte.
- Stays zeigte im gleichen Kartenaufbau 47 Unterkünfte unter `Alle` und
  reproduzierbar 25 unter `Passend`. Die Kurzvorschau lag innerhalb der Karte.

Die Abnahme belegt die aktuelle Passend-Funktion und die gemeinsame
Places-/Stays-Technik. Sie belegt noch keine vollständige positive Fotoquote
und keine vollständige Desktop-/Touch-Matrix aller 14 Kategorien,
82 Zuordnungen, 19 Landesküchen und Sachfilter.

### Releasebeleg

- App: `13.82.168.101`
- Core: `4.82.220`
- Runtime-Commit: `d00bdbf50b4d95b72e3782f798ba52625fca2e6c`
- Gateway: `v230 ACTIVE`, Software `4.64.34`, Places
  `4.38.13-specialty-type-purity`
- Integration-Worker: `6b964c97-fe50-4fd2-a02a-18b3ce99f7da`, 100 Prozent
  Traffic
- Unveränderliche URL:
  `https://6b964c97-integration-luvia.njwnrvwbv5.workers.dev`
- Byteidentisches Deployment-Archiv:
  `luvia-integration-13.82.168.101-d00bdbf5-public-bytes.zip`, 89.020.403 Bytes,
  SHA-256 `327318E704DD388A82F700801B3DD8C9BCADAC509FA2CB1DF8276AB5C854DF20`
- Öffentlicher Bytebeleg: `30/30 MATCH` zwischen Archiv, Stable und immutable
  Worker
- Safe Regression: `232/232 PASS`
- NFR-0: `3/3 PASS`
- Main und Production: unverändert

Der letzte reale Foursquarezustand war weiterhin HTTP 429 mit gespeichertem
Cooldown; Google lieferte zuletzt real HTTP 403. Die freigeschaltete
Foursquare-Fotofähigkeit und das Google-Tagesbudget sind deshalb noch kein
positiver Providerbeleg. Apple bleibt ohne kostenpflichtiges Developer-Programm
geparkt.

Unmittelbarer Frontend-Rückfall:

`npx wrangler versions deploy 1dcf5de1-c743-4d4c-8d52-40cbac209b03@100 --name integration-luvia --message "Rollback App 13.82.168.101 provider specialty cascade to accepted App 13.82.168.100" --yes`

Ein Gateway-Rückfall veröffentlicht den akzeptierten Gateway-Quellstand aus
Runtime-Commit `b9f32115d75780d9eb76ec03cb31afedf870af94` erneut. Falls ausschließlich
die Foursquare-Medienfreigabe zurückgenommen werden muss, wird die Operation in
`provider_limits` wieder auf `["search"]` begrenzt; Nutzungszähler, Cooldown und
letzter Status bleiben dabei erhalten.

P02/P03 bleiben **TEILWEISE**.

## Genau ein nächster Schritt

`P02-P03-real-photo-cold-latency-closure`: reale Ortsbildabdeckung und kalte
Providerlatenzen auf die Zielwerte bringen; danach die vollständige sichtbare
Filtermatrix abnehmen.

## Nachtrag 06.09.2026 – App 13.82.168.102 / kalte Spezialpfade und Commons-Kategorien

App 13.82.168.102 bündelt den nächsten P02/P03-Abschnitt aus Erstlatenz,
Spezialtypen und exakten Ortsmedien:

- Strikte Spezialtypen verwenden direkt die Provider-Taxonomie. Ein leerer
  erster Namenslauf blockiert den Kategorienpfad nicht mehr.
- Für echte Spezialtypen beginnt die kostenlose, authentifizierte und
  cachegestützte OSM-Kategoriesuche neben Geoapify. Breite Kategorien wie
  Nachtleben oder Stays lösen diesen zusätzlichen Fächer nicht aus.
- Geoapify-, OSM- und Overpass-Wartezeiten sind begrenzt; verlorene parallele
  Anfragen werden abgebrochen und erfolgreiche Ergebnisse sechs Stunden
  zwischengespeichert.
- Der exakte Medienresolver akzeptiert jetzt auch eine unmittelbar am
  Provider-Ort hinterlegte Wikimedia-Commons-Kategorie. Er liest nur Dateien,
  verlangt Autor und Lizenz und verwirft SVG, PDF, DjVu, TIFF sowie Logos,
  Symbole, Wappen, Flaggen, Karten, Pläne, Diagramme und Grundrisse.
- Die gewählte Provider-Entität und die konkrete Commons-/Wikidata-Verknüpfung
  bleiben getrennt als Medienherkunft erhalten. Eine Namens- oder
  Umgebungssuche nach beliebigen Bildern findet nicht statt.

### Öffentliche Provider- und Latenzproben

Die Proben liefen gegen Gateway v231 und die stabile öffentliche Integration:

- Kaltes Minigolf: zwei konkrete OSM-Orte; 2,44 Sekunden Gatewayzeit und 3,29
  Sekunden gesamte öffentliche Antwort. Der vorherige kalte Gatewaypfad lag
  bei 5,58 Sekunden.
- Minigolf aus dem Chat-Pfad: dieselben zwei Orte; 0,18 Sekunden Gatewayzeit.
- Chinesische Küche: `Hay-Cheng`; 0,20 Sekunden Gatewayzeit.
- Strikter Strandbedarf: drei konkrete Bedarfsorte; 0,24 Sekunden Gatewayzeit.
- Essen und Trinken: zwölf begrenzte Gatewaytreffer; 0,15 Sekunden Gatewayzeit.
- Stays: zwölf begrenzte Gatewaytreffer; 0,21 Sekunden Gatewayzeit, ein Treffer
  mit sicherem Foto.

Der kalte Spezialpfad liegt im Gateway jetzt unter drei Sekunden. Die gesamte
Antwort verfehlt das Ziel mit 3,29 Sekunden noch knapp. Beim sichtbaren kalten
Kartenaufruf war die Kohorte nach 3,6 Sekunden vorhanden; alle Pins waren nach
rund 5,8 Sekunden sichtbar. Der Erstaufbau bleibt deshalb offen.

### Sichtbare Browserabnahme

- Places-URL:
  `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=places&acceptance=p02-p03-102-visible`
- Stays-URL:
  `https://integration-luvia.njwnrvwbv5.workers.dev/?screen=hotels&acceptance=p02-p03-102-visible`
- Essen und Trinken zeigte 48 koordinatenverifizierte Orte unter `Alle` und
  neun belegte Orte unter `Passend`. `Kleines Steakhouse` war ausschließlich
  unter `Alle` vorhanden und erschien nicht unter `Passend`.
- Stays zeigte im identischen Kartenaufbau 47 Unterkünfte unter `Alle` und 25
  unter `Passend`. Die Kurzvorschau blieb innerhalb der Karte.

### Releasebeleg

- App: `13.82.168.102`
- Core: `4.82.221`
- Runtime-Commit: `71a697adcbf1549c6ee78f379743983689a95276`
- Gateway: `v231 ACTIVE`, Software `4.64.35`, Places
  `4.38.14-cold-hedge-commons-category`
- Integration-Worker: `b73732a6-26f4-4280-9d0d-88eb0429094a`, 100 Prozent
  Traffic
- Unveränderliche URL:
  `https://b73732a6-integration-luvia.njwnrvwbv5.workers.dev`
- Byteidentisches Deployment-Archiv:
  `luvia-integration-13.82.168.102-71a697ad-public-bytes.zip`, 89.020.093 Bytes,
  SHA-256 `54148CE5ECB50751B055B8B5D270918BA6C34EF864A467FBA8A9F34FD59D71C3`
- Öffentlicher Bytebeleg: `30/30 MATCH` zwischen Archiv, Stable und immutable
  Worker
- Safe Regression: `232/232 PASS`
- NFR-0: `3/3 PASS`
- Main und Production: unverändert

Unmittelbarer Frontend-Rückfall:

`npx wrangler versions deploy 6b964c97-fe50-4fd2-a02a-18b3ce99f7da@100 --name integration-luvia --message "Rollback App 13.82.168.102 cold hedge and Commons media to accepted App 13.82.168.101" --yes`

Ein Gateway-Rückfall veröffentlicht den akzeptierten Gateway-Quellstand aus
Runtime-Commit `d00bdbf50b4d95b72e3782f798ba52625fca2e6c` erneut.

P02/P03 bleiben **TEILWEISE**.

## Genau ein nächster Schritt

`P02-P03-map-first-render-photo-matrix`: den sichtbaren Erstaufbau von Places
und Stays auf höchstens drei Sekunden bringen, danach die exakte Bildquote und
die vollständige Desktop-/Touch-Filtermatrix schließen.
