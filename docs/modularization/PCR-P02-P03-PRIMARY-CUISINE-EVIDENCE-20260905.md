# PCR P02/P03 – Primäre Landesküchenbelege und Karten-Kontinuität

Datum: **05.09.2026**

Status: **INTEGRATION ABGENOMMEN; P02/P03 BLEIBEN BIS ZUR SICHTBAREN FILTER-/FOTO-/MOBILMATRIX TEILWEISE**

## Problem

Ein Landesküchenfilter darf einen Ort nur dann aufnehmen, wenn die aktive Ortsquelle diese Küche wirklich für den Ort belegt. Allgemeine Restaurantkategorien, Suchtexttreffer oder lokal abgeleitete Schlagwörter reichen dafür nicht. Andernfalls kann ein Steakhouse als vegetarisch passend erscheinen oder ein allgemeiner gastronomischer Ort ohne belastbaren Beleg einer Landesküche zugeordnet werden.

Im ersten sichtbaren Lauf nach der Härtung lieferte der Filter „Spanisch“ weiterhin sieben Orte. Eine ältere Gatewaydiagnose zeigte dagegen nur drei. Deshalb musste vor einer weiteren Filterausweitung geklärt werden, ob der Client alte Daten verwendet, der öffentliche Vertrag den Primärbeleg verliert oder HERE selbst die sieben Orte so klassifiziert.

## Owner und Verträge

- **Places/Gateway** besitzt Provider-Taxonomie, normalisierte Kategorien, Landesküchenbelege, Entfernung, Deduplizierung und Providerdiagnose.
- **places.v1** projiziert den normalisierten Primärbeleg für Consumer. Der Consumer darf den Beleg nicht neu erfinden oder aus dem Suchtext ableiten.
- **Places, Stays, Timeline-Vorschläge und AI Chat** konsumieren dieselbe kanonische Ortsmenge und dieselben Filterregeln.
- **Profile/Compass** besitzt Vorlieben. `Passend` darf nur positive, belegte Ortsmerkmale gegen diese Vorlieben auswerten.

Die Änderung erweitert den bestehenden Vertrag additiv. Sie erzeugt keine zweite Ortsliste, keine neue Datenbank-Truth und keinen neuen Provider-Endpunkt.

## Umsetzung

1. Der Gateway normalisiert die primären Food-Typen des Providers und führt sie als `providerPrimaryFoodTypes` bis zum Ortsvertrag.
2. Ein strikter Landesküchenfilter akzeptiert einen Treffer nur, wenn die angeforderte Küche in dieser primären Providerliste enthalten ist.
3. App **13.82.168.67** führte die strikte Prüfung ein. Dieser Zwischenstand wurde verworfen, weil die öffentliche Projektion das neue Feld noch nicht weitergab.
4. App **13.82.168.68** ergänzte die fehlende Projektion. Der sichtbare Spanischlauf blieb bei sieben Ergebnissen; damit war die Projektion allein noch kein ausreichender Abschlussbeleg.
5. App **13.82.168.69** wechselte auf den Cache-Namensraum `consumer:places-spatial:v7-primary-cuisine-evidence`. Ältere Kandidatenmengen ohne den Primärbeleg können damit nicht mehr in einen neuen Filterlauf übernommen werden.
6. Gateway **v182** gleicht die öffentliche Spanischdiagnose an die reale App-Anfrage an: gleicher Suchtext, fünf Kilometer Radius, strikter Typ `spanish_restaurant`, `forceRefresh` und `maxResultCount: 50`.

HERE dokumentiert `foodTypes[].primary` als Kennzeichen der primären Küchenart. Die Kennung `311-000` bezeichnet Spanisch; Browse akzeptiert außerdem den übergeordneten Wert `311`. Referenzen: `https://docs.here.com/geocoding-and-search/docs/food-types-category-system-full`, `https://docs.here.com/geocoding-and-search/docs/endpoint-browse-brief` und `https://docs.here.com/geocoding-and-search/docs/places-categories-and-cuisines`.

## Diagnose des Spanisch-Gegenbelegs

Der sichtbare `.69`-Client verwendete nach der Cache-Trennung keinen alten Bestand. Seine Diagnose zeigte:

- Suchart `destination`
- Kategorie `food`
- Provider `here`
- Ergebniszahl `7`
- Cache `false`

Die auf dasselbe 50er-Ergebnisfenster angeglichene Gatewaydiagnose lieferte dieselben sieben Orte und für jeden den primären HERE-Food-Typ `Spanish`:

1. La Vie - Wein & Mehr
2. Sunset Lounge
3. Taberna Española
4. Confiserie Leysieffer
5. Sudden Death Brewing Co.
6. Buddelbar
7. Restaurant Stäckers

Der frühere Diagnosewert drei war kein Qualitätsbeweis gegen diese Treffer. Er entstand, weil die Diagnose nur die ersten 20 allgemeinen Providerergebnisse untersuchte, während die reale App bis zu 50 Ergebnisse anforderte. Mit identischem Anfragefenster stimmen App und Gateway überein.

Damit ist belegt: Luvia erfindet die spanische Zuordnung in diesem Lauf nicht. HERE selbst liefert sie als primäre Küche. Diese technische Wahrheit ist noch keine endgültige redaktionelle Qualitätsaussage. Überraschende Providerklassifikationen werden im verbleibenden P02/P03-Block anhand exakter Place-Details oder einer zweiten Ortsquelle gegengeprüft.

## Sichtbare Browserabnahme

Der Browserlauf erfolgte auf der veröffentlichten Integration, angemeldet und mit echter Scharbeutz-Reise:

1. Kategorie „Essen & Trinken“ und Landesküche „Chinesisch“ gewählt.
2. Ergebnis: genau **Hay-Cheng**, Zähler **1/1**.
3. Die Karte über das sichtbare Zoom-Steuerelement in einen engeren Ausschnitt bewegt.
4. Suchmodus wechselte sichtbar auf „Im sichtbaren Kartenausschnitt“; Ergebnis **0/0**, weil in diesem Ausschnitt kein verifizierter chinesischer Ort lag.
5. „Zurück zum Reiseziel“ gewählt.
6. Der aktive Chinesischfilter blieb erhalten und **Hay-Cheng 1/1** erschien erneut.
7. Spanisch gewählt; der sichtbare Lauf lieferte reproduzierbar die sieben oben dokumentierten HERE-Treffer mit `searchCache false`.

Damit sind Filterauswahl, Karteninteraktion, live berechneter Viewport, ehrlicher Nullfall, Rezentrierung und Filterkontinuität für diesen sichtbaren Teilpfad belegt.

## Automatisierte Abnahme

- Sämtliche **19** konfigurierten Landesküchen durchlaufen die Provider-Orchestrierungs- und Filtertests.
- Die vorhandenen Filterabbildungen, Kategorie-Reinheit, Kombinationen, Reset, Stays-Parität und exakte Medienidentität bleiben grün.
- Vollständige Safe Regression: **222/222 PASS**.
- Öffentliche Byte-Gleichheit auf stabiler und unveränderlicher Worker-Adresse: **30/30 PASS**.
- Der fokussierte M16.5N-Koordinaten- und Kartenpfad bleibt grün.

Die automatisierte 19er-Matrix ersetzt nicht die ausstehende sichtbare Vollabnahme. In diesem Slice wurden Chinesisch und Spanisch sichtbar geprüft; die übrigen Landesküchen sowie alle Kategorie-, Untertyp-, Fakten-, Kombination- und Resetpfade bleiben Bestandteil des nächsten P02/P03-Abnahmeblocks.

## Releasebeleg

- App **13.82.168.69**, Core **4.82.191**
- Runtime-Commit **65829a9052c7181c46493f56f588d77aa6fc28fb**
- Integration Worker **1599c46c-0f9d-488c-ad38-86bf0356fed1**, 100 Prozent Traffic
- Gateway **v182 ACTIVE**
- Archiv `release69-65829a90.zip`, **88.698.732 Bytes**
- SHA-256 **14D9421ABB2C78725DC49FE5566CF1F058D7C6749B2E727484308C0DAD86E42F**
- Byte-Beleg `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\public-byte-proof69.json`
- Sichtbarer Browserbeleg `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release69-visible-primary-cuisine-evidence.json`
- Vollständiger Regressionsbeleg `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\p02-p03-primary-cuisine-release69-regression-pass.log`

## Verbleibender Umfang

P02/P03 bleiben **TEILWEISE**, bis folgende Punkte gemeinsam belegt sind:

- sichtbare positive oder providerbegründete Nullfall-Abnahme aller Landesküchen und jeder angebotenen Filteroption über UI und AI Chat;
- identische kanonische Place-IDs und Erklärungen in Places, Stays, Timeline-Vorschlägen und AI Chat;
- zweite Quellen- oder Detailprüfung überraschender Providerklassifikationen;
- positive vegetarische Profilevidenz und Ausschluss einer Steakhouse-Falschpassung ohne konkretes vegetarisches Angebot;
- deutlich breitere, exakt zum realen Ort gehörende Fotoabdeckung mit Attribution;
- reproduzierbare Kalt- und Warmstartzeiten auf Desktop, in mehreren Tabs und auf einem physischen Mobilgerät.

## Rollout und Rückfall

Der Slice wurde ausschließlich auf Integration veröffentlicht. Die öffentlich abgenommene App **.66** mit Worker **d608d9eb-e2b7-44b7-80ef-cf7be5a18e32** bleibt der App-Rückfall. Gateway **v181** bleibt der unmittelbare Rückfall für die reine Diagnoseänderung aus v182. Main **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba**, Production, Datenbank, RLS und Secrets blieben unverändert.
