# PCR P03/P09 – Gemeinsame Place-Projektion für Timeline, Places, Stays und AI Chat

Datum: **05.09.2026**

Status: **AUF INTEGRATION VERÖFFENTLICHT UND SICHTBAR ABGENOMMEN**

## Problem und gewünschtes Verhalten

Die Timeline-Vorschläge verwendeten zwar den Places-Owner, verhielten sich aber noch nicht wie die produktive Places-Karte. Ein gültiger Teilstand mit weniger als drei Vorschlägen wurde als vollständiger Fehler dargestellt. Außerdem konnten verschiedene Provider-IDs desselben realen Orts mehrere Karten und Pins erzeugen. Die Timeline brauchte dieselbe Kartenprojektion wie Places und Stays, ohne eine zweite Ortswahrheit anzulegen.

Der mobile Bearbeitungsmodus sollte nach Langdruck beziehungsweise über „Timeline bearbeiten“ sichtbar werden. Verschiebbare Einträge sollten sich dabei dezent wie iOS-App-Symbole bewegen, während Reduced Motion still bleibt.

## Zuständigkeiten

- **Places** besitzt Provider-Fakten, Place-Identitäten, Koordinaten, Kategorie, Medien und die öffentliche `places.v1`-Projektion.
- **Journey** besitzt Reisetage, Zeitfenster, Reihenfolge und Timeline-Mutationen.
- **Booking** besitzt Buchungsweg, Anfrage, Status und externe Übergabe.
- **Intelligence** gewichtet und erklärt die öffentlichen Projektionen, ohne Place- oder Journey-Truth zu duplizieren.

Die Timeline bindet `LuviaPlacesSpatialExperience.mountProjection` ein. Sie implementiert keine zweite Karte und speichert keine zweite Place-Liste.

## Gelieferte Änderungen

1. Ein bis zwei belegte Provider-Ergebnisse bleiben sofort bedienbar. Der Hinweis beschreibt den sicheren Teilstand und die laufende Ergänzung, statt einen Totalfehler zu behaupten.
2. Erfolgreiche Anbieterantworten werden im Hintergrund weiter zusammengeführt. Das Sheet kann vom ersten belegten Ort auf mehrere echte Vorschläge wachsen.
3. Provider-Datensätze werden zunächst nach Provider-ID und anschließend nach realer Entität zusammengeführt. Gleicher normalisierter Name und höchstens 350 Meter Entfernung gelten als dieselbe Entität. Übliche führende Artikel wie „Die“, „Der“, „Das“ und entsprechende internationale Varianten werden für den Identitätsvergleich entfernt. Die angezeigten Provider-Fakten bleiben unverändert.
4. Pin-Auswahl und Vorschlagskarte bleiben in beide Richtungen synchron. Die Attributionen für OpenFreeMap, OpenMapTiles, OpenStreetMap, Geoapify, TomTom und HERE bleiben sichtbar.
5. Der Timeline-Bearbeitungsmodus verwendet `lvjt-edit-wiggle` mit 0,22 Sekunden. Gezogene Einträge stoppen ihre eigene Animation; Reduced Motion deaktiviert sie vollständig.
6. Die Produktentscheidung für eine gemeinsame Place Intelligence und einen gemeinsamen Trip Composer wurde in `docs/planning/UNIFIED-PLACE-INTELLIGENCE-TRIP-COMPOSER-2026-09-05.md` verbindlich in P02/P03/P09/P10/P12/P15/P17/P19/P20/P22/P23/P26/P33/P34/P35 und die späteren Intelligence-II-Gates eingeordnet.

## Release-Provenienz

- App: **13.82.168.62**
- Core: **4.82.184**
- Runtime-Commit: **afe2251aaf609b99d06d92e9b101de0f2f6b31ea**
- Sauberes Git-Archiv: `release62-afe2251a.zip`
- SHA-256: **BD72DFF2E26C252F0E6B02F8AC70646A277B2B778976B5453CE3467BBA248465**
- Integration Worker: **011f96cd-488b-437e-b465-5ad74e8c7e20**
- Stable: `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable: `https://011f96cd-integration-luvia.njwnrvwbv5.workers.dev/`
- Gateway: **v172 ACTIVE** aus Quelle **7c288d89**; in diesem Slice unverändert
- Main: **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba**; unverändert
- Datenbank, RLS, Edge Functions, Provider-Secrets und Production: unverändert

## Automatisierte Abnahme

- Safe Regression: **221/221 PASS**
- NFR-0: **3/3 PASS** innerhalb der Safe Regression
- Öffentliche Dateiidentität: **30/30 MATCH** zwischen Archiv, Stable und Immutable
- `tests/journey-suggestion-partial-continuity.test.cjs`: belegter Teilstand, Hintergrundkontinuität und providerübergreifende Entitätszusammenführung
- `tests/m16.5ab-unified-places-journey-sheet.test.cjs`: gemeinsame Places-/Journey-Projektion
- `tests/p09-timeline-touch-browser.test.cjs`: Langdruck, Drag-Vorschau, Scroll, Abbruch, Commit und Undo
- `tests/p09-timeline-connect-reorder-browser.test.cjs`: Verbinden, Mehrfach-Reorder, Reload-Recovery und exakte Wiederherstellung
- `tests/places-filter-matrix.test.cjs`: 76 Kategorie-/Untertyp-Zuordnungen, Faktenfilter, Kombinationen, Reset, Distanz und exakte Medien
- `tests/stays-shared-spatial.test.cjs`: gemeinsame Stays-/Places-Karte, Reiseziel, Cache, Lebenszyklus und mobile Einbettung

Vollständiges Log: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release62-safe-regression-221.log`

Bytebeleg: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\public-byte-proof62.json`

## Sichtbare Browser-Abnahme

Der angemeldete öffentliche Browserlauf erfolgte auf Stable Integration mit der aktiven Reise **Ostseeurlaub** und dem Reiseziel **Scharbeutz**.

### Timeline-Vorschläge

- Der erste belegte Ort erschien als bedienbarer Teilstand mit ehrlichem Hinweis.
- Die Hintergrundsuche erweiterte das Sheet auf vier Möglichkeiten.
- Vier Vorschlagskarten und vier Pins verwendeten dieselbe `places.v1`-Karte.
- Sichtbare eindeutige Namen: **Stranddüne**, **Waldhochseilgarten Scharbeutz**, **Reetkate**, **Yacht Club Scharbeutz/Ostsee**.
- Die kanonische Namensprüfung meldete keine Dublette.
- Der frühere vollständige Fehlerhinweis war nicht sichtbar.

Messwerte und Gegenbelege: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release62-visible-browser-evidence.json`

### Timeline-Bearbeitung

- „Timeline bearbeiten“ wechselte sichtbar zu „Fertig“.
- Zwei bearbeitbare Karten meldeten `animation-name: lvjt-edit-wiggle`, `animation-duration: 0.22s` und `animation-play-state: running`.
- Das Browserprofil hatte Reduced Motion nicht aktiviert. Der automatisierte Reduced-Motion-Gate belegt den stillen Gegenpfad.

Messwerte und Gegenbelege: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release62-visible-browser-evidence.json`

### Places

- aktive Reise: **Ostseeurlaub**
- Zielgebiet: **3 km um Scharbeutz**
- sichtbare koordinatenverifizierte Pins: **50**
- `Alle` und `Passend`, 3D-/2D-Umschalter, Zielort-Rückkehr und Kartenaktionen sichtbar
- kein Kartenfehler

Messwerte und Gegenbelege: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release62-visible-browser-evidence.json`

### Stays

- aktive Reise: **Ostseeurlaub**
- Zielgebiet: **3 km um Scharbeutz**
- sichtbare koordinatenverifizierte Pins: **50**
- `Alle` und `Passend` sichtbar
- Kurzvorschau liegt innerhalb der Kartenoberfläche
- kein Kartenfehler

Messwerte und Gegenbelege: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release62-visible-browser-evidence.json`

## Ehrliche Restbefunde

1. Die natürliche Chat-Navigation „Öffne Stays für unsere Reise in Scharbeutz“ und „Öffne Hotels für unsere Reise in Scharbeutz“ fiel in diesem Lauf auf den ehrlichen Live-Antwort-Fehler zurück. Die vorhandene Hotel-/Places-Navigation ist automatisiert belegt, diese Formulierungen benötigen aber einen deterministischen Alias vor einem optionalen KI-Aufruf. Das bleibt P03/P35.
2. Zwei zusätzlich parallel geöffnete In-App-Browser-Tabs blieben in der bereits stark belegten Mehrtab-Sitzung am Startbild stehen. Ein anderer frisch geöffneter .62-Tab bootete vollständig und navigierte Timeline, Places und Stays erfolgreich. Der Befund ist deshalb als offener Mehrtab-/Warmstart-Test erfasst und noch nicht als physischer Einzeltab-Fehler klassifiziert. Der mobile Kaltstart bleibt Teil des nächsten P02/P03-Abnahmeblocks.
3. Timeline, Places und Stays zeigen weiterhin zu wenige echte Ortsfotos. Fehlende Bilder bleiben ehrlich; breite providerverknüpfte Medienabdeckung ist weiter offen.
4. Kategorie- und Filtervollständigkeit ist automatisiert breit belegt, aber noch nicht für jede sichtbare Filteroption und jede Landesküche im realen öffentlichen UI und AI Chat positiv beziehungsweise als belegter Nullfall abgenommen.

## Rückfall

Ein App-only-Rückfall auf den unmittelbaren .61-Zwischenstand ist möglich:

```powershell
npx wrangler versions deploy 4ee6b9c4-122b-4fc6-bff5-04b9705a0eb0@100 --name integration-luvia --message "Rollback App 13.82.168.62 to 13.82.168.61 shared Timeline map checkpoint" --yes
```

Dieser Rückfall wird nur bei einem tatsächlichen .62-Defekt ausgeführt. .61 enthält noch die bekannte Namensvarianten-Dublette „Die Stranddüne“/„Stranddüne“. Gateway, Datenbank, RLS, Edge Functions, Secrets, Main und Production benötigen für diesen App-only-Rückfall keine Änderung.
