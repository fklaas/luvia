# PCR P02 — Filterbudget und ehrliche Kartenleerstände

**Datum:** 04.09.2026  
**Status:** auf Integration begrenzt angenommen  
**Release:** App `13.82.168.52`, Core `4.82.174`  
**Runtime-Quelle:** `b12996c4e3c3682fc50abb347986cc6b44d26f7c`  
**Gateway:** `luvia-gateway` v164 ACTIVE  
**Worker:** `3fb07cb9-85a3-49e2-ba88-2f65c1889d86`

## Beobachtetes Problem

Jede gewählte Landesküche startete bisher neben der präzisen strukturierten Küchenabfrage sofort eine allgemeine `catering`-Abfrage mit bis zu 500 Orten. Bei einem Ergebnislimit von 50 reservierte die präzise Abfrage drei lokale Geoapify-Budgeteinheiten, die allgemeine Kohorte weitere 25. Eine erfolgreiche Küchenauswahl konnte dadurch bis zu 28 Einheiten kosten. Mehrere schnelle Filterwechsel erschöpften das konservative Minuten- oder Tagesbudget unnötig.

Ein zweiter Fehler machte diesen Ausfall schwer erkennbar. Schlug ein neuer Filterabruf fehl, blieb der Kartenstatus auf „bereit“, sobald noch irgendein altes Rohresultat vorhanden war. Wenn der aktive Filter alle alten Resultate ausschloss, sah der Nutzer eine leere Karte ohne Leermeldung und ohne funktionierenden Wiederholungsweg.

## Änderung

- Eine erfolgreiche strukturierte Landesküchenabfrage verwendet genau einen präzisen Providerabruf. Bei 50 angefragten Treffern reserviert er drei Budgeteinheiten.
- Die große, für 30 Minuten gemeinsam gespeicherte `catering`-Kohorte wird erst nach einem echten strukturierten Nulltreffer angefragt. Sie bleibt ein begrenzter Rettungspfad für Küchenangaben, die nur im strukturierten `cuisine`-Feld des Ortsdatensatzes vorkommen.
- Ein fehlgeschlagener Abruf darf alte Pins nur erhalten, wenn diese den aktuell gewählten Filter tatsächlich erfüllen. Andernfalls wechselt die Karte in den sichtbaren Fehlerzustand mit „Erneut versuchen“.
- Ein abgeschlossener Roh-Nulltreffer wird auch ohne vorherige Rohresultate als ehrlicher Leerzustand veröffentlicht.
- Places und Stays verwenden weiterhin dieselbe Karten-, Pin-, Passungs- und Filterprojektion.

## Automatisierte Abnahme

- Vollständige Safe Regression: `217/217 PASS`.
- Filtermatrix: 76 Kategorie-/Untertyp-Zuordnungen, 19 Landesküchen, Faktenfilter, Kombinationen und Reset: PASS.
- Jede erfolgreiche strukturierte Landesküche: genau ein präziser Providerabruf und keine 500er-Kohorte: PASS.
- Echter strukturierter Nulltreffer: genau ein präziser Abruf plus eine begrenzte 500er-Rettungskohorte: PASS.
- Fehlgeschlagener Filterabruf mit alten, nicht passenden Rohresultaten: sichtbarer Fehler; keine scheinbar fertige leere Karte: PASS.
- Releaseversion, visuelles Inventar und alle 16 aktuellen Fahrplan-/Handoff-Dokumente: konsistent.
- Öffentliche Dateien gegen das unveränderliche Archiv: `30/30 MATCH`.

## Sichtbare Integration-Abnahme

Die Abnahme lief angemeldet im sichtbaren In-App-Browser auf Integration:

| Oberfläche | Auswahl | Beobachtung | Ergebnis |
|---|---|---|---|
| Places | Essen & Trinken · Alle | 50 Orte; „Kleines Steakhouse“ ohne `Passt`-Kennzeichnung | Profilurteil erfindet für das vegetarische Profil keine Steakhouse-Passung |
| Places | Italienisch | 7 koordinatenverifizierte Orte | positiver Filterpfad bereit |
| Places | Chinesisch, ungecacht | 0 Orte, sichtbarer Fehler und „Erneut versuchen“ | kein maskierter Leerstand |
| Gateway-Diagnose | Geoapify Minigolf Scharbeutz | `PROVIDER_BUDGET_DENIED` | das konservative Tagesbudget war bereits ausgeschöpft; dieser externe Zustand bleibt offen |
| Stays | Alle | 50 Unterkünfte | gemeinsamer Kartenpfad bereit |
| Stays | Passend | 14 belegte Treffer, jeder mit `Passt` | Passungsprojektion funktioniert |
| Stays | zurück zu Alle | wieder 50 Unterkünfte | Umschaltung verwendet dieselbe Ortsmenge |

Der erschöpfte Geoapify-Tagespool verhindert am Abend eine vollständige positive Live-Abnahme aller ungecachten Spezialküchen. App `.52` behauptet in diesem Zustand keinen Nulltreffer, sondern zeigt den Providerfehler mit Wiederholungsaktion. Die providerübergreifende positive Filterversorgung bleibt deshalb ausdrücklich Bestandteil des nächsten P02/P03-Abschnitts.

## Artefakte und Rückfall

- Archiv: `release52-b12996c4e3c3.zip`
- SHA-256: `6AAA01ADC05DDCDC7BB9A98099D6A74636D8548665E83010B412E2FBF3CE6265`
- Regression: `outputs/release52-safe-regression-rerun.txt`
- Bytebeleg: `outputs/public-byte-proof52.json`
- Sichtbare Abnahme: `outputs/p02-filter-budget-truth-visible-52.json`
- Gateway-Beleg: `outputs/release52-gateway-list.log`
- Rückfall: App `.51`, Core `4.82.173`, Runtime `6da646bdd774b764cad9e868445a1c921a65c783`, Worker `47496145-d13d-4a59-9e9c-b1785dd9f171`, Gateway v163 aus `release51-6da646bdd774.zip`.
- `main` blieb unverändert auf `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.

## Nächster verbindlicher Abschnitt

`P02-P03-filter-evidence-fit-photo-provider-closure`: Jede sichtbare Filteroption und jede Landesküche erhält einen providerübergreifenden, budgetbewussten Suchplan mit positiver oder belegbar ehrlicher Antwort. Danach werden `Alle/Passend` vollständig gegen Profil- und Place-Evidenz abgenommen und echte, exakt dem Place zugeordnete Fotos mit Attribution geschlossen.
