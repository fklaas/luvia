# PCR P02/P03 – Provider-Kontinuität und Kartenwahrheit

Stand: 5. September 2026. Dieser Bericht belegt den angenommenen Integrationsstand der Places- und Stays-Karten nach der Wiederherstellung des Mehranbieter-Fallbacks. Er ersetzt keine noch offene Vollabnahme aller sichtbaren Filter und Ortsfotos.

## Veröffentlichter Stand

- App `13.82.168.58`, Core `4.82.180`, Integration Worker `4c6b1b02-aba9-4ddc-b3b8-08f000b7b4a9`.
- Frontend-Runtime `2a1889ee459f4cd9dbb4843880dc8bde06d8a81b`.
- Gateway v170 ACTIVE, Health-Version `4.34.9-broad-food-cascade`, Gateway-Quelle `542608355893aa8813aa9d82d77d679fb7a5e26f`.
- Unveränderliches Archiv `release58-2a1889ee459f.zip`, SHA-256 `77BE6D483B4697576EA105262B288E0D1D354CD80D5D97961E7BA582ABB485C2`.
- Main blieb bei `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.

## Was repariert wurde

Geoapify, TomTom und HERE unterscheiden nun zwischen einem Providerfehler und einer erfolgreichen Suche ohne Treffer. Ein verfügbarer Alternativanbieter übernimmt nach budgetbedingt abgewiesenen Vorranganbietern. Provider-Ausschlüsse werden vor Rückgabe und Cache erzwungen. Natur schließt Unterkünfte und Spa aus; Wellness bleibt separat. Ausdrücklich gewählte Landesküchen verwenden eine begrenzte 5-km-Suche. Die breite Kategorie Essen und Trinken bleibt eine 3-km-Suche über die gesamte Restaurantfamilie und wird nicht durch die standardmäßig mitgeführten Typen Vegetarisch und Vegan zu einer Spezialküchensuche verengt.

## Öffentliche Gateway-Belege

Die begrenzten Diagnoseproben liefen über den veröffentlichten Gateway v170. Geoapify und TomTom wurden budgetbewusst versucht; HERE antwortete und lieferte die verwendeten Daten.

- `food-scharbeutz`: 12 Orte, breite Food-Suche erfolgreich.
- `chinese-scharbeutz`: 2 belegte Treffer – China Restaurant Haycheng und Saigon Asia Bistro.
- `nature-scharbeutz`: 12 Orte; kein zurückgegebener Unterkunfts-, Camping- oder Spa-Typ.

Maschinenlesbare Belege:

- `outputs/release58-gateway170-food-scharbeutz.json`
- `outputs/release58-gateway170-chinese-scharbeutz.json`
- `outputs/release58-gateway170-nature-scharbeutz.json`

## Sichtbare Browserabnahme

Die veröffentlichte Integration wurde in einem sichtbaren Browser mit der aktiven Reise Ostseeurlaub und dem Ziel Scharbeutz geprüft.

- Kategorienfolge: Essen und Trinken 50 → Shopping 21 → Natur und Erholung 12 → Shopping 21 → Essen und Trinken 50. Food blieb nach weiteren sechs Sekunden bei 50; kein nachträglicher Nullzustand.
- Chinesisch: 5 km um Scharbeutz, 2 Pins, keine Providerfehlermeldung.
- Natur: 12 Pins; in den sichtbaren Markern keine Hotels, Apartments, Ferienunterkünfte, Campingplätze oder Spas.
- Shopping: Alle 21 → Passend 6 → Alle 21.
- Essen und Trinken: Alle 50 → Passend 0 → Alle 50. Das Steakhouse wird nicht als passend ausgegeben. Der Nullstand ist gegenwärtig ehrlich, weil die geladenen Food-Datensätze keine belastbare positive vegetarische Profilevidenz enthalten.
- Stays: Alle 50 → Passend 25 → Alle 50; Zielort Scharbeutz. Die Kurzvorschau ist ein Nachfahre des geografischen Kartencontainers.

## Automatisierte Abnahme und Releaseidentität

- Safe Regression: 220/220 PASS nach Gateway-Quelle v170.
- Frontend-Release .58: 30/30 öffentliche Dateien bytegleich; immutable Worker-Präfix `4c6b1b02`.
- Vollständige Provider-Orchestrierung belegt Budgetreservierung, Fallback, 19 Landesküchen, native Küchenevidenz und exakte Bildzuordnung als Vertrag.

## Verbleibende Grenzen

P02/P03 bleiben TEILWEISE. Jede sichtbare Filteroption muss noch einmal über das reale UI und den AI-Chat positiv oder ehrlich leer abgenommen werden. Positive vegetarische Food-Evidenz muss providerübergreifend beschafft werden, damit Passend nicht nur Falschpositive verhindert, sondern geeignete Orte zuverlässig findet. Echte, exakt zum Provider-Place gehörende Fotos mit Attribution bleiben der wichtigste Datenblock. Sichtbar aufgefallene Randtreffer – Gemeindeverwaltung in Natur und eine Strandkorbvermietung bei Stays – werden in der nächsten Taxonomie-Runde bereinigt. Wiederholte physische Mobiltests für Zoom, Ziehen, Ladezeit und Cachezustand bleiben erforderlich.

## Nächster verbindlicher Schritt

P02/P03 schließen als Nächstes die reale Filter- und Foto-Matrix: alle Filterbereiche und 19 Landesküchen über UI und AI-Chat, positive vegetarische Profilevidenz ohne Steakhouse-Falschpassung, bekannte Kategorie-Randtreffer sowie echte Ortsfotos mit Entity- und Attributionsbeleg. Danach folgen die positiven P09/P10-Verwaltungswege für Booking, bestätigte Besuche und Memories.
