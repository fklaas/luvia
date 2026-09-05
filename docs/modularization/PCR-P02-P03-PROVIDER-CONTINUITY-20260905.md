# PCR P02/P03 – Provider-Kontinuität, Kartenwahrheit und exakte Ortsmedien

Stand: 5. September 2026. Dieser Bericht belegt den aktuellen Integrationsstand der Places- und Stays-Karten nach der Wiederherstellung des Mehranbieter-Fallbacks, der Bereinigung bekannter Kategorie-Randtreffer und der ersten exakten Ortsmedienkette. Er ersetzt keine noch offene Vollabnahme aller sichtbaren Filter und Ortsfotos.

## Veröffentlichter Stand

- App `13.82.168.59`, Core `4.82.181`, Integration Worker `563afd24-2b2a-4c71-8b49-eb88ff1ffbe0`.
- Frontend-Runtime `fac7b348` und Gateway-Quelle `7c288d89`.
- Gateway v172 ACTIVE, Health-Version `4.35.1-exact-photo-endpoint`.
- Unveränderliches Frontend-Archiv `release59-fac7b348.zip`, SHA-256 `DDEB817E23C3CA8DFDB832F75D29FD93C60B9AFA370F7E570A67F99AA145FE1F`.
- Main blieb bei `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.

## Was repariert wurde

Geoapify, TomTom und HERE unterscheiden nun zwischen einem Providerfehler und einer erfolgreichen Suche ohne Treffer. Ein verfügbarer Alternativanbieter übernimmt nach budgetbedingt abgewiesenen Vorranganbietern. Provider-Ausschlüsse werden vor Rückgabe und Cache erzwungen. Natur schließt Unterkünfte, Spa und Verwaltungsstellen aus; Wellness bleibt separat. Stays verwirft Strandkorbvermietungen. Ausdrücklich gewählte Landesküchen verwenden eine begrenzte 5-km-Suche. Die breite Kategorie Essen und Trinken bleibt eine 3-km-Suche über die gesamte Restaurantfamilie und wird nicht durch die standardmäßig mitgeführten Typen Vegetarisch und Vegan zu einer Spezialküchensuche verengt.

Für die ausgewählte Detailkarte fragt die App Medien nur bei Bedarf ab. Gateway v172 darf Foursquare genau einmal nach dem normalisierten identischen Namen und höchstens 120 Metern Distanz als Bildquelle ergänzen. Falls die Suche kein Foto enthält, folgt nach dieser Identitätsprüfung genau ein Abruf des beliebtesten Fotos über den aktuellen Place-Photos-Endpunkt. Der ursprüngliche Provider-Ort, seine Referenz und seine Evidenz bleiben erhalten; ein nahes Bild mit abweichendem Ortsnamen wird verworfen. Geoapify-eigene, mit dem exakten Ortseintrag verknüpfte Wikimedia-Medien bleiben ebenfalls zulässig.

## Öffentliche Gateway-Belege

Die folgenden begrenzten Diagnoseproben liefen nach dem sichtbaren Browsertest über den veröffentlichten Gateway v172. Geoapify beantwortete alle drei Proben selbst; TomTom und HERE wurden deshalb nicht verbraucht.

- `food-scharbeutz`: 12 Orte, breite Food-Suche erfolgreich.
- `chinese-scharbeutz`: 1 belegter enger Treffer – Hay-Cheng. Der historische v170/HERE-Beleg mit 2 Treffern bleibt als providerabhängige Momentaufnahme erhalten.
- `nature-scharbeutz`: 12 Orte; kein zurückgegebener Unterkunfts-, Camping- oder Spa-Typ.

Maschinenlesbare Belege:

- `outputs/release59-gateway172-food-scharbeutz.json`
- `outputs/release59-gateway172-chinese-scharbeutz.json`
- `outputs/release59-gateway172-nature-scharbeutz.json`

## Sichtbare Browserabnahme

Die veröffentlichte Integration wurde in einem sichtbaren Browser mit der aktiven Reise Ostseeurlaub und dem Ziel Scharbeutz geprüft.

- Kategorienfolge auf .59: Essen und Trinken 50 → Shopping 21 → Natur und Erholung 11 → Shopping 21 → Essen und Trinken 50. Kein Wechsel erzeugte einen vorübergehenden oder dauerhaften Nullzustand.
- Natur: 11 sichtbare Pins; keine Gemeindeverwaltung, kein Rathaus sowie keine Unterkunft oder Spa in den sichtbaren Markern.
- Essen und Trinken: Alle 50 → Passend 0. Das Steakhouse besitzt weder die bevorzugte Pin-Klasse noch die zugängliche Passend-Kennzeichnung. Der Nullstand ist gegenwärtig ehrlich, weil die geladenen Food-Datensätze keine belastbare positive vegetarische Profilevidenz enthalten.
- Stays: Alle 49 → Passend 27 → Alle 49; Zielort Scharbeutz und keine Strandkorbvermietung in den sichtbaren Markern.
- Medien-Stichprobe: Der ausgewählte Food-Ort sowie fünf von sechs nacheinander geöffneten Stays blieben ohne Foto. Bei einem Stay wurde ein providerverknüpftes Wikimedia-Foto geladen. Die Kette funktioniert, die Abdeckung ist noch klar unzureichend.

## Automatisierte Abnahme und Releaseidentität

- Frontend-Release .59: 30/30 öffentliche Dateien bytegleich; immutable Worker-Präfix `563afd24`.
- Fokussierte Abnahmen belegen Filtermatrix, Provider-Orchestrierung, Budgetkaskade, 19 Landesküchen, native Küchenevidenz, Kategorie-Reinheit, Stays-Parität und die exakte Bildzuordnung einschließlich des eigenen Photo-Endpunkts.
- Safe Regression: 220/220 PASS auf dem konsolidierten .59/v172-Stand. Ein früherer Lauf mit erwarteten veralteten Status-/Inventargates wurde nicht als Schlussbeleg verwendet.

## Verbleibende Grenzen

P02/P03 bleiben TEILWEISE. Jede sichtbare Filteroption muss noch einmal über das reale UI und den AI-Chat positiv oder ehrlich leer abgenommen werden. Positive vegetarische Food-Evidenz muss providerübergreifend beschafft werden, damit Passend nicht nur Falschpositive verhindert, sondern geeignete Orte zuverlässig findet. Echte, exakt zum Provider-Place gehörende Fotos mit Attribution bleiben der wichtigste Datenblock; die aktuelle Stichprobe reicht dafür noch nicht. Die sichtbare Shopping-Abdeckung von 21 Orten ist stabil, liegt aber unter dem früher berichteten Sollwert 45 und bleibt deshalb fachlich offen. Wiederholte physische Mobiltests für Zoom, Ziehen, Ladezeit und Cachezustand bleiben erforderlich.

## Nächster verbindlicher Schritt

P02/P03 schließen als Nächstes die reale Filter- und Foto-Matrix: alle Filterbereiche und 19 Landesküchen über UI und AI-Chat, positive vegetarische Profilevidenz ohne Steakhouse-Falschpassung, bekannte Kategorie-Randtreffer sowie echte Ortsfotos mit Entity- und Attributionsbeleg. Danach folgen die positiven P09/P10-Verwaltungswege für Booking, bestätigte Besuche und Memories.
