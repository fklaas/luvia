# PCR P02/P03 – Landesküchen-Suchring, Providerkontinuität und Kartenstart

Datum: **05.09.2026**

Status: **INTEGRATION ABGENOMMEN; P02/P03 BLEIBEN BIS PASSEND-, FILTER-, FOTO- UND MOBILABNAHME TEILWEISE**

## Problem

Spezielle Landesküchen konnten im normalen Fünf-Kilometer-Radius einen echten Nullfall liefern. Die Oberfläche erklärte diesen Zustand bislang nicht ausreichend und bot keinen klar abgegrenzten nächsten Suchschritt. Gleichzeitig konnte eine während rascher Folgeabfragen gedrosselte Ortsquelle eine kleinere Fallback-Menge liefern. Ohne Kontinuitätsregel durfte diese degradierte Menge einen kurz zuvor vollständigen Bestand ersetzen; dadurch entstanden die vom Nutzer beobachteten Sprünge zwischen wenigen und vielen Pins.

Bei der sichtbaren Abnahme des Nachfolgereleases blieb ein neuer Stays-Tab einmal auf dem Startbild hängen. Die Browserdiagnose zeigte einen einmalig fehlgeschlagenen Abruf des klassischen Identity-Web-Adapters. Der Loader besaß weder einen begrenzten Wiederholungsversuch noch einen sichtbaren endgültigen Fehlerzustand.

## Verbindliche Grenzen

- Der normale Reisezielvertrag bleibt drei Kilometer; strikte Landesküchen verwenden zunächst fünf Kilometer.
- Eine Erweiterung auf zehn Kilometer erfolgt ausschließlich nach einem bewussten Klick und erhält eine eigene Cache- und Anfrageidentität.
- Ein Kategorien- oder Modulwechsel stellt Filter und normalen Reisezielradius wieder her.
- Providerfehler, Kontingentdrosselung und Teilantworten bleiben sichtbar degradierte Zustände. Sie dürfen einen jüngeren, vollständigeren Bestand nicht sofort verdrängen.
- Places, Stays, Timeline-Vorschläge und AI Chat konsumieren dieselbe `places.v1`-Ortsmenge, Filterlogik und Profilprojektion.
- Ein klassisches Runtime-Script wird nach einem Fehler höchstens einmal erneut angefordert. Bereits erfolgreich ausgeführte Scripts werden nicht wiederholt.
- Main, Production, Datenbank, RLS, Secrets und Nutzerdaten liegen außerhalb dieses Slices.

## Umsetzung

1. Alle 19 Landesküchen verwenden denselben strikten Fünf-Kilometer-Diagnosevertrag mit maximal 50 Ergebnissen und wiederverwendbarem Cache.
2. Ein verständlicher Nullfall erklärt, dass fehlende Providerangaben nicht die Nichtexistenz eines Ortes beweisen. Er bietet einen expliziten Zehn-Kilometer-Schritt sowie bei einzelnen asiatischen Küchen eine breitere asiatische Suche an.
3. Der Zehn-Kilometer-Schritt wird nur durch die Nutzeraktion aktiviert und im sichtbaren Scope als „einschließlich Umgebung“ ausgewiesen.
4. Der Discovery-Adapter schützt einen höchstens 15 Minuten alten, vollständigeren exakten Bestand vor einer kleineren, wegen Providerfehler oder Drosselung degradierten Antwort.
5. Gesunde positive Mengen werden drei Minuten gehalten; degradierte positive Mengen nur 30 Sekunden; degradierte Nullmengen werden nicht zwischengespeichert.
6. Der Runtime-Loader entfernt nach einem klassischen Scriptfehler den fehlgeschlagenen Knoten, wartet 250 Millisekunden und stellt genau eine zweite Anfrage mit `runtimeAttempt=2`.
7. Scheitert auch der zweite Abruf oder ein späteres Modul endgültig, ersetzt eine verständliche Meldung das endlose Startbild und bietet die nutzerinitiierte Aktion „Luvia neu laden“ an. Der technische Fehler bleibt separat diagnostizierbar.

## Landesküchenbeleg

Die sichtbare reale Matrix betätigte alle 19 angebotenen Landesküchen. Dreizehn lieferten im Fünf-Kilometer-Vertrag bestätigte Treffer. Sechs lieferten einen verständlichen Nullfall: Thailändisch, Koreanisch, Mexikanisch, Nahöstlich, Libanesisch und Vegan.

Diese Nullfälle sind keine Aussage, dass es in der Region sicher keine passenden Orte gibt. Eine schnelle Gateway-Folgeprüfung antwortete zwar für alle 19 Anfragen mit HTTP 200, erreichte während der Serie aber eine Budgetablehnung bei Geoapify; TomTom und HERE antworteten weiter. Deshalb wird die Matrix als Bedien- und Kontinuitätsbeleg gewertet, nicht als providerübergreifender Vollständigkeitsbeweis für jeden Nullfall.

Artefakte:

- `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release69-visible-cuisine-matrix.json`
- `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\gateway-v184-cuisine-matrix.json`

## Sichtbare Browserabnahme des finalen Releases

Die Abnahme erfolgte in zwei frischen sichtbaren Tabs auf der stabilen Integration-Origin:

1. Stays verließ das Startbild und zeigte die aktive Ostseeurlaub-Reise mit dem Scope „3 km um Scharbeutz“ und 49 koordinatenverifizierten Unterkünften.
2. „Zoom in“ reagierte unmittelbar und wechselte sichtbar auf „Im sichtbaren Kartenausschnitt“; die Browser-Fehlerliste blieb leer.
3. Places verließ in einem zweiten frischen Tab das Startbild und zeigte zunächst 50 koordinatenverifizierte Food-Orte im Drei-Kilometer-Radius.
4. Der Landesküchenfilter „Thailändisch“ wechselte auf fünf Kilometer, lieferte einen ehrlichen Nullfall und bot „Im 10-km-Umkreis suchen“ an.
5. Erst der Klick auf diese Aktion änderte den Scope auf „10 km um Scharbeutz · einschließlich Umgebung“.
6. Der anschließende Kategorienwechsel zu Shopping löschte den Landesküchenfilter, stellte drei Kilometer her und zeigte 48 Pins.
7. Auch die Places-Fehlerliste blieb leer.

Der zuerst beobachtete Stays-Fehler ist damit als transienter Asset-Abruffehler eingegrenzt. Der korrigierte Loader und zwei neue reale Starts belegen den Recovery-Pfad beziehungsweise den normalen erfolgreichen Start. Reproduzierbare Zeitmessungen auf einem physischen Mobilgerät bleiben offen.

Sichtbares Artefakt: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release71-visible-places-stays-acceptance.json`

## Automatisierte Abnahme

- Vollständige Safe Regression: **222/222 PASS**
- NFR-0 innerhalb der Safe Regression: **3/3 PASS**
- Runtime-Loader-, Release-, Start-, Visual- und Human-/AI-Paritätsgates: **PASS**
- Human-/AI-Register: **330** semantische Aktionen, **24** Runtime-Aktionen, **984** aktive Quellmarker
- Öffentliche Byte-Gleichheit zwischen sauberem Archiv, Stable und Immutable: **30/30 PASS**
- Gateway-Livehealth: **4.64.12**, App **13.82.168.71**, Core **4.82.193**, Status **ok**

## Releasebeleg

- App **13.82.168.71**, Core **4.82.193**
- Runtime-Commit **ad0a5c3c47daf53dc8f82919204841864d3c6325**
- Gateway **v186 ACTIVE**, Function-ID **ae8f0801-2325-4125-b1a9-4c57f81770ce**
- Integration Worker **e56752e2-78a8-41ba-b488-1e2d0f0e5a8e**, 100 Prozent Traffic
- Deployment **eea8ff70-ef89-402a-8d10-a8c096765534** vom **05.09.2026, 05:05:54 UTC**
- Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable `https://e56752e2-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\release71-ad0a5c3c.zip`, **88.708.847 Bytes**
- Archiv-SHA-256 **CA3357A6F656025E48FBC6B4ABD6E5B868F4EB5A1EDF8652B202AC96FE324337**
- Regression `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\p02-p03-cuisine-continuity-release71-regression-pass.log`
- Byte-Beleg `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\public-byte-proof71.json`

## Rückfall

Der unmittelbare App-Rückfall ist **13.82.168.70**:

`npx wrangler versions deploy f51fffd3-7d03-4b1a-bfbc-93c88d6f9f1c@100 --name integration-luvia --message "Rollback App 13.82.168.71 to 13.82.168.70" --yes`

Der unmittelbare Gateway-Rückfall ist **v185**. Main bleibt auf Commit **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba**; Production erhielt keinen Traffic- oder Codewechsel.

## Genau ein nächster Schritt

**P02/P03 – Passend, echte Place-Fotos und mobile Startzeiten schließen.** Zuerst werden `Alle` und `Passend` auf derselben realen Kandidatenmenge mit positiver vegetarischer Profilevidenz und ohne unbelegte Steakhouse-Passung geprüft. Im selben Paket folgen die vollständige sichtbare Filtermatrix über UI und AI Chat, exakt identifizierte echte Ortsfotos mit Attribution sowie reproduzierbare Kalt- und Warmstartzeiten auf einem physischen Mobilgerät.
