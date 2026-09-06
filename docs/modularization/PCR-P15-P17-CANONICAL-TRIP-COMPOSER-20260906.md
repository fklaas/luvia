# PCR P15/P17 — Kanonischer Trip Composer

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.117**, Core **4.82.236**. M16.5 Schritte 15–18: P09/P10/P11/P12 behalten ihre begrenzten internen Belege. P15/P17 ist aktiv und noch nicht produktfertig. App .117 ergänzt robuste Composer-Übernahme, Auswahl-/Reload-Schutz, Kategorieabdeckung und eine erste interaktive Gestaltungsrunde. Die frühere Aussage, es fehle nur noch Lifecycle, ist korrigiert. Stable Integration bleibt auf App .104; .117 ist ein unveränderlicher Prüfkandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** App .117 sichert getauschte Vorschläge, Auswahlarten, Uhrzeiten, Dauern und bestätigte Teilschritte über Reload. Feste Daten und Reisezeitzone werden geprüft; Vormerken und Weglassen fließen in die echte Journey-Tagesprüfung ein. Positive, identitätsgebundene Owner-Readbacks sind für eine erfolgreiche Übernahme erforderlich. Alle gewählten Kategorien nutzen den gemeinsamen Provider-Router; gecachte passende Kategorien sparen Anbieterabfragen. Der öffentliche Browserlauf zeigte fünf echte Scharbeutz-Orte aus Essen, Kultur und Aktivitäten, vier Pins nach Teilwahl und den nach Reload erhaltenen Stand 3 einplanen / 1 vormerken / 1 weglassen. Er endete vor der echten Kontomutation. Lokal bestätigte der sichtbare mobile Lauf fünf simulierte Schreibaktionen mit echten Vertragsregeln. 24 neue Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität sind grün. Reisefarbige Fortschrittsübersicht, erhaltene Karte, Kartenfokus, besser lesbare Karten und kurze Schrittübergänge wurden sichtbar auf Desktop und bei 390 × 844 Pixeln geprüft.

**Nächster Schritt (AKTIV): P15/P17: echten KI-Reiseauftrag mit bearbeitbarer Tagesplanung verbinden.** Der Nutzer verlangt eine lebendige interaktive Reiseerstellung und KI mit nachvollziehbarem Verständnis. Die aktuelle Vorschau verwendet gewählte Kategorien und höchstens drei Tage; Freitext wird noch nicht für eine vollständige Reiseplanung interpretiert. Dieser Produktnachweis muss vor einem P15/P17-Abschluss erbracht werden.

**Abnahme dieses Schritts:**

- Freitext, ausgewählte Schwerpunkte und bestätigte Profilrestriktionen werden über den Intelligence Owner zu einem sichtbaren Reiseauftrag aufgelöst. Widersprüche oder fehlende wesentliche Angaben lösen gezielte Rückfragen aus; unbelegte Eigenschaften werden nicht als passend behauptet.
- Die nötigen Kontextbelege aus P19/P20/P22/P23/P26 und P33/P34/P35 werden für Zeit, Wege, Budget, Öffnung und Saison angebunden. Eine vollständige Reise über den gewählten Zeitraum enthält tatsächliche Auswahlgründe, Freiraum und klar benannte unbekannte Faktoren.
- Eine interaktive tageweise Gesamtvorschau mit der gemeinsamen Places-Karte erlaubt Datum-/Zeitänderung, Alternativen, Vormerken und Teilübernahme. Die Gestaltung nutzt Reisefarbe und angemessene Bewegung; mobile Bedienung und Reduced Motion bleiben erhalten.
- Ein realer Konto-End-to-End-Lauf muss Trip-Erstellung und exakt gewählte Place-/Journey-Einträge samt Dauer, Reload und Teilfehler-Wiederaufnahme bestätigen. Fixture-Receipts allein gelten nicht als Produktfreigabe.

**Danach:** Danach werden innerhalb P15/P17 die getrennte dauerhafte Identity-Übergabe und Archivieren/Löschen/Wiederherstellen der Reise geschlossen. Die übrige Context Matrix und AI-Parität bleiben unter P19/P20/P22/P23/P26 und P33/P34/P35 verfolgt; M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: reale Booking-Provider. P09/P10/P11/P12: begrenzte interne Nachweise; physische iOS-/Android-Abnahme und bei P12 echte Context-Signale fehlen. P15/P17: tatsächliche Freitext-/Gesamtreiseplanung, finale Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle fehlen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund dieser Composer-Teilverbesserung als vollständig abgeschlossen markiert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Datum: 2026-09-06  
Status: Foundation als unveränderlicher Integrationskandidat belegt; Blockabschluss noch offen
Betroffene Verträge: `trip.v1` (additiv), `places.v1` (nur lesend), reservierte Übergabe an `identity.v1`

## Problem

Der bestehende First Trip Composer besitzt bereits die richtige Trip- und Places-Grenze, bietet aber nur einen langen geführten Ablauf. Schnellstart und AI-gestützter Einstieg fehlen. Außerdem werden Anfragewünsche, reisebezogene Vorlieben und mögliche dauerhafte Profilvorlieben noch nicht als drei verschiedene Geltungsbereiche durch den Trip-Entwurf getragen. Eine direkte Erweiterung nur in der Oberfläche würde eine zweite Wahrheit neben dem Trip-Core erzeugen.

## Owner und Vertragsänderung

`core/trips/` bleibt alleiniger Owner des Trip-Entwurfs und der bestätigten Reise. `trip.v1` erhält additiv eine Scope-Projektion für:

- flüchtigen Anfragekontext (`request-only`, nicht in der Reise gespeichert),
- reisebezogene Vorlieben (`trip`, im `firstTripComposer`-Teil der Trip-Einstellungen gespeichert),
- eine ausdrücklich bestätigungspflichtige Identity-Übergabe (`durable`, nicht automatisch ausgeführt).

Bestehende Aufrufer ohne diese Felder behalten ihr bisheriges Verhalten. Es gibt keine Vertragsumbenennung und keine Änderung an vorhandenen Trip-Events.

## Kompatibilität und Daten

Die Änderung ist abwärtskompatibel. Es ist keine Datenbankmigration und keine Function-Änderung nötig. Alte Reisen ohne `entryMode` oder `tripPreferences` werden als geführte Erstellung mit leeren reisebezogenen Vorlieben gelesen. Der rohe Freitext der Anfrage und vorgeschlagene dauerhafte Profilwerte werden weder in `moduleSettings` noch in die Trip-Zeile geschrieben.

## Dateien

- `core/trips/trip-draft-core.js`
- `core/platform/trip-contract-adapter.js`
- `core/trips/trip-creator.js`
- `app/first-trip-composer.js`
- `app/first-trip-composer.css`
- `tests/m16.5z-first-trip-composer.test.cjs`
- Planungs- und Build-Nachweise nach Abschluss des Slices

## Abnahme

1. Geführt, Schnellstart und Luvia-AI-Entwurf laufen über dieselbe Oberfläche und denselben `trip.v1`-Command.
2. Schnellstart verlangt ein kanonisches Ziel und einen Zeitraum; fehlender Titel wird aus dem bestätigten Ziel abgeleitet.
3. Der AI-Einstieg zeigt eine Vorschau und kennzeichnet unbelegte Place-, Stay-, Wetter-, Öffnungszeit-, Auslastungs- und Budgetdaten als noch offen.
4. Anfragekontext erscheint nur im unveränderlichen Command-Beleg; reisebezogene Vorlieben erscheinen im Trip-Readback; die dauerhafte Identity-Übergabe bleibt `required` und wird nicht automatisch geschrieben.
5. Abbruch schreibt keine Reise. Ein wiederholter Create-Command bleibt idempotent.
6. Quelltests, Safe Regression, NFR-0 und ein sichtbarer Desktop-/Mobil-Browserlauf müssen grün sein, bevor der Kandidat als belegt gilt.

## Rollout und Rollback

Der Slice wird ausschließlich als unveränderlicher Integration-Kandidat veröffentlicht. Stable Integration wird nach sichtbarer Abnahme auf den zuletzt akzeptierten Worker zurückgestellt. Production und Main werden nicht verändert. Rollback ist die erneute 100-Prozent-Zuweisung des akzeptierten App-`.104`-Workers.

## Ergebnis und Restumfang

App `13.82.168.114` / Core `4.82.233` aus Commit `f1f732e8ca9a2cc2a209e4c58eb07ae4c9c3effa` ist als Worker `cf8876f5-26b4-426a-bab8-24017a0cf2d6` unveränderlich veröffentlicht. Geführt, Schnellstart und Luvia AI teilen sichtbar den Composer und die dynamischen Schrittfolgen 9/5/7. Ein lokaler sichtbarer End-to-End-Lauf bestätigte den AI-Weg bis zum idempotenten `trip.first.create`-Command; die Scope- und Persistenztests belegen die Trennung der drei Vorliebenbereiche. Safe Regression `235/235`, NFR-0 `3/3` und öffentliche Byteidentität `30/30` sind grün. Das Archiv hat 88.911.199 Bytes und SHA-256 `8AD1359F3F3D2D3609E60A655B7767E446064FD26312CA945BBFEB840C26229D`. Stable Integration wurde danach auf App `.104` / Core `.223` zurückgestellt; Main und Production blieben unverändert.

P15/P17 ist damit noch nicht vollständig geschlossen: Im öffentlichen Lauf blieb die kanonische Zielsuche auf „Suche läuft …“ stehen. Außerdem fehlen der echte tageweise Place-/Stay-Entwurf, die einzeln bestätigte Teilübernahme, der Reload-Beleg sowie Archivieren, Löschen und Wiederherstellen über den Trip Owner. Diese Punkte bilden den einen aktiven Folgeschritt.

## Nachweis Zielsuche .115

App `13.82.168.115` / Core `4.82.234` aus Commit `72ba8604f3d747e4bb7a439f083c39966af2e4c6` schließt das öffentliche Zielsuche-Gate. Der Places-Vertragsadapter liest zuerst das aktive kanonische `LuviaDestination` und kann ein bekanntes Reiseziel ohne externen Autocomplete- oder Details-Aufruf anbieten und bestätigen. Der Providerpfad besitzt zusätzlich eine Backendfrist von sieben Sekunden; die Oberfläche beendet Erfolg, leeres Ergebnis und Fehler nach spätestens 8,5 Sekunden und bietet bei einem Fehler „Erneut suchen“ an.

Der sichtbare öffentliche Integrationslauf wechselte in den Einstieg „Mit Luvia AI“, öffnete den Schritt „Ort“, gab „Scharbeutz“ ein, erhielt sofort „Scharbeutz, Deutschland“ sowie „Vorschläge bereit“ und bestätigte anschließend den kanonischen Ort. Safe Regression `235/235`, NFR-0 `3/3` und öffentliche Byteidentität `30/30` sind grün. Das Archiv `luvia-integration-13.82.168.115-72ba8604-public-bytes.zip` enthält 3.409 Einträge, hat 89.329.871 Bytes und SHA-256 `C26955D158BCC00759C9B55EBD3EC459EF38A0FACC9DB8B9A082555FF0F8274C`. Worker `03e79ebf-5d71-422a-b6f8-45d3a661b26f` bleibt unveränderlich erreichbar. Stable Integration wurde nach der Abnahme auf App `.104` / Core `.223` zurückgestellt; Main und Production blieben unverändert.

Das Such-Gate ist geschlossen. Für den Abschluss von P15/P17 fehlen weiterhin der echte tageweise Place-/Stay-Entwurf, die einzeln bestätigte Teilübernahme, der separat bestätigte Identity-Lifecycle und Archivieren, Löschen sowie Wiederherstellen der Reise über den Trip Owner.

## Ergänzungsdesign Tagesentwurf und Teilübernahme

Der nächste additive Schnitt erweitert `trip.v1 composition` um einen browserlosen Tagesentwurf. Der Trip Owner ordnet ausschließlich bereits von `places.v1` gelieferte kanonische Place-Identitäten einem begrenzten Tagesraster zu; er sucht keine Orte selbst und speichert weder Place-Fakten noch Journey-Zustand. `journey.v1 reads.rehearseDay` ergänzt die P12-Tagesprobe als abgeleiteten Beleg. Die gemeinsame `LuviaPlacesSpatialExperience.mountProjection` rendert dieselben Place-Projektionen wie Places und Timeline.

Vormerken, Einplanen, Tauschen und Weglassen verändern zunächst nur den flüchtigen Composer-Entwurf. Die finale Schaltfläche zeigt die vollständige Auswahl und gilt als gemeinsame ausdrückliche Bestätigung. Erst nachdem `trip.v1 commands.createFirstTrip` die neue aktive Reise bestätigt hat, werden ausgewählte Place-Aktionen über die vorhandene Human-AI-Action-Runtime und damit über `places.v1` vorbereitet und ausgeführt. Jeder Eintrag erhält einen stabilen Idempotency-Key und einen Owner-Receipt. Abbruch vor der finalen Bestätigung schreibt weder Trip noch Place- oder Journey-Zustand. Ein fehlgeschlagener Teilbeleg bleibt sichtbar wiederholbar und wird nicht als vollständig übernommen dargestellt.

## Nachweis Tagesentwurf und Teilübernahme .116

App `13.82.168.116` / Core `4.82.235` aus Commit `f37608e9de51906becedb964b6f69726deeca286` setzt das Ergänzungsdesign um. `trip.v1 composition.composeDayDraft` übernimmt ausschließlich kanonische, koordinatenbelegte Place-Projektionen aus `places.v1`, verteilt höchstens sechs Kandidaten über höchstens drei konkrete Reisetage und trägt Alternativen sowie unbekannte Faktoren getrennt. Der Composer sucht zuerst im gültigen aktiven Places-Kandidatenbestand und nutzt andernfalls höchstens drei begrenzte, parallel ergänzende freie Providerabfragen. Exakte Medien werden nur für die höchstens sechs ausgewählten Identitäten nachgeladen; fehlende Bilder, Öffnungszeiten, Wetter, Auslastung, Störungen, Preise und Buchbarkeit bleiben ausdrücklich unbekannt.

Die Oberfläche rendert die gemeinsame `LuviaPlacesSpatialExperience`-Karte, einen Abschnitt pro Reisetag und die nicht mutierenden Aktionen Einplanen, Vormerken, Tauschen und Weglassen. Datierte Tage werden vorab über `journey.v1 reads.rehearseDay` geprüft. Eine fehlende eindeutige Zeitzonenauflösung bleibt als offene Zeitprüfung sichtbar und erzeugt keinen geratenen Zeitpunkt. Erst die letzte zusammengefasste Bestätigung erstellt die Reise über `trip.v1 commands.createFirstTrip` und führt die ausgewählten Place-Aktionen mit stabilen Idempotency-Keys über die Human-AI-Action-Runtime aus. Ein Fehler nach bereits bestätigter Reiseerstellung wird als Teilfehler ausgewiesen und nicht als vollständiger Abbruch dargestellt.

Der lokale sichtbare End-to-End-Lauf zeigte neun Fixture-Places, sechs Entwurfseinträge, drei Tagesproben und die vier Auswahlarten. Nach einer Tausch-, Vormerk- und Weglassentscheidung bestätigte die Endseite fünf ausgewählte Aktionen; Trip Owner und alle fünf Place-/Journey-Aktionen lieferten bestätigte Receipts. Der öffentliche sichtbare Lauf auf dem echten Kandidaten wählte „Mit Luvia AI“, bestätigte „Scharbeutz, Deutschland“, setzte den Zeitraum 12.–14.06.2027 und die Schwerpunkte Essen & Trinken, Kultur und Aktiv sein. Die aktuellen freien Provider lieferten vier reale `places.v1`-Orte. Alle vier erschienen auf derselben Karte, verteilt über drei Reisetage mit stimmiger P12-Probe. Die sichtbare Teilwahl endete bei 2 einplanen, 1 vormerken und 1 weglassen; die letzte Seite zeigte „Reise und 3 Vorschläge bestätigen“. Dort wurde gestoppt, damit der öffentliche Nachweis keine echte Benutzerreise anlegt.

Safe Regression `235/235`, NFR-0 `3/3`, Human-AI-Register `333` Aktionen / `1.021` aktive Quellmarker und öffentliche Byteidentität `30/30` sind grün. Das saubere Archiv `luvia-integration-13.82.168.116-f37608e9-public-bytes.zip` enthält 3.279 getrackte Dateien, hat 89.114.238 Bytes und SHA-256 `8B1D8AB5E41F3DF4419FDC2F5B88846A6D70DFFBE9B983246853AFCAE34597A0`. Worker `05db1373-83af-4e71-9815-134e1a4d5e51` bleibt unveränderlich erreichbar. Stable Integration läuft wieder auf App `.104` / Core `.223`; Main, Production, Gateway, Datenbank, Secrets und Nutzerdaten blieben unverändert.

Der Lauf belegt eine erste Tagesentwurf-Projektion und eine lokale Teilübernahme mit simulierten Ownern. Er belegt keine vollständige Produktreife oder reale Teilfehler-Wiederherstellung. P15/P17 bleibt teilweise.

## Ergänzungsdesign Produktreife und Wiederherstellung .117

Vor der Codeänderung festgelegt: Der Composer bleibt Consumer von trip.v1, places.v1, journey.v1 und identity.v1. Kein neuer Domain-Store, keine direkte Datenbankmutation. Die bestehende sessionbezogene StoragePort-Ablage erhält versionierte Entwurfs- und Fortschrittsbelege. Ein bereits bestätigter Trip und erfolgreich quittierte Einzelaktionen werden nach Teilfehler und Reload fortgesetzt. Nach Beginn der Bestätigung ist die Auswahl gesperrt; die Wiederholung darf den bestätigten Inhalt nicht verändern. Nur ein passendes positives Owner-Receipt zählt als Erfolg.

Gleichzeitig werden feste Kalenderdaten, Zielkoordinaten, explizite Reisezeitzone, Entwurfsfrische und editierte Termine geprüft. Tauschen, Vormerken und Weglassen fließen in dieselbe abgeleitete Tagesprobe ein. Asynchrone Antworten dürfen einen verlassenen oder überholten Composer nicht verändern. Die Vorschlagssuche verwendet den gemeinsamen Provider-Router und kanonische Kategorien; gewählte Kategorien, Profilrestriktionen und Teilfehler werden erhalten. Freitext-Orchestrierung und vollständige Reiseplanung gelten bis zu eigenständigen Belegen ausdrücklich weiterhin als offen.

Abnahme: Verhaltensprüfungen mit echten Trip-/Action-Vertragsfunktionen und kontrollierten Owner-Antworten für Validierung, Reload nach Tausch, Teilfehler, unbekannte Receipts, Doppelbestätigung und Navigation. Zusätzlich sichtbarer Desktop-/Mobil-Browserlauf, Safe Regression und Integrationsnachweis. Änderungen umfassen vorhandenen Composer JS/CSS, Trip-Draft-Core, Fixture/Tests, Release-Metadaten und synchronisierte Fahrpläne. Stabile Integration und Main werden erst bei entsprechend nachgewiesener Freigabe ersetzt.
## Ergänzungsdesign .119: KI-Ablehnung und bearbeitbarer Fehlerzustand

Öffentliche .118-Gegenprobe: Rom und Lissabon werden korrekt aufgelöst. Der echte `planning.dialogue`-Aufruf antwortet wiederholt mit HTTP 429; der Client zeigt die technische Supabase-Fehlermeldung. Nach einer Änderung des Freitexts bleibt außerdem der alte Fehlerzustand bestehen. Vor Änderung festgelegt: ausschließlich der Composer-Consumer erhält eine lesbare KI-Fehlerprojektion und verwirft einen Fehlerentwurf bei geänderten Eingaben. Ein unveränderter Fehler löst keine automatische Wiederholungsschleife aus. Profilfrische wird auch im Fehlerzustand erfasst. Keine Änderung von Providerquoten, Authentifizierung, Secrets oder serverseitiger Capability. Zwei zusätzliche Verhaltensprüfungen belegen gedrosselte KI ohne Place-/Trip-Schreibaktion sowie erneute Entwurfsfähigkeit nach Eingabekorrektur. Der öffentliche KI-Positivnachweis bleibt bis zu einer tatsächlichen Modellantwort offen.

## Nachweis .117: Wiederherstellung und interaktive Gestaltung, kein Produktabschluss

## Ergänzungsdesign .118: bestätigter KI-Reiseauftrag und ganzer Zeitraum

Ergänzung vor Zielsuche-Fix nach Benutzer-Screenshot: Neue Ziele dürfen nicht von der blockierten Google-Autovervollständigung abhängen. Der bestehende Places-Web-Provider erhält einen reinen `destination.resolve`-Read über den vorhandenen Gateway; `places.v1` projiziert und hält dessen exakte Zielantwort begrenzt im Speicher. Keine Nutzung des mutierenden Legacy-Destination-Resolvers und keine Änderung der aktiven Reise. Die Platform-Netzwerksperre erhält eine gedrosselte Probe ausschließlich für diesen öffentlichen Read, solange der Browser online ist; echte Offline-/Providerbudget-/Berechtigungssperren bleiben wirksam. Öffentliche Zielauflösung wartet nicht auf ein fremdes Auth-Refresh. Keine Function-/DB-/Secret-Änderung. Tests umfassen Rom ohne Google, Koordinaten/ID-Readback, Netz-Cooldown/echtes Offline und Parallel-Drosselung.

Benutzerkorrektur zur Gestaltung: Die Erzählweise des Einstiegs ist Vorbild, ausdrücklich keine Wiederholung seines Kompassrätsels. Der Composer-Auftakt wird als interaktive Reisegefühl-Szene gestaltet; der vorhandene Kompass bleibt lediglich Markenzeichen. Kleine Gesten und direkte visuelle Reaktionen ersetzen zusätzliche Pflichtklicks. Diese scoped Consumer-Änderung verändert keine Domain-Schreibgrenzen.

Vor Implementierung festgelegt: `intelligence.v1` erhält additiv `interpretTripBrief`. Der Adapter verwendet die bereits veröffentlichte READ-Capability `planning.dialogue` mit ausgeschaltetem Modell-Fallback und explizitem neuen Reise-Kontext; der browserlose Intelligence-Owner projiziert die strukturierte Antwort in einen begrenzten Reiseauftrag. Bestehende Aufrufer bleiben kompatibel. Der Auftrag zeigt Verständnis, angewandte Kategorien/Tempo/Zeitrahmen, offene Anforderungen und höchstens eine wesentliche Rückfrage. Vor der Recherche bestätigt der Benutzer den Auftrag. Unverarbeitete harte Anforderungen werden ausdrücklich als offen geführt und erlauben nur vorgemerkte Ideen, keine behauptet erfüllte automatische Tagesplanung. Profilrestriktionen werden ausschließlich durch strengere Anfrageanforderungen ergänzt, nie überschrieben. Rohtext und Auftrag bleiben im bestehenden konto- und sessiongebundenen Composer-Entwurf; keine neue dauerhafte Domain-Wahrheit.

`trip.v1 composition.composeDayDraft` erhält den bestätigten Auftrag als optionale Quelle und bildet alle Kalenderdaten des gewählten Zeitraums ab (bis 366 Tage, darüber explizite Validierung statt Abschneiden). Nur kanonische Places werden verteilt; fehlende Kandidaten bleiben sichtbarer Freiraum. Keine erfundenen Routen, Öffnungen, Preise oder saisonalen Events. Datumwechsel ändern dieselbe Auswahlprojektion und deren Journey-Tagesprobe. Consumer und bestehende Recovery-Receipts bleiben verantwortlich für ausdrückliche endgültige Übernahme.

Betroffene Streams/Dateien: Intelligence-Owner `trip-preference-resolution-core.js`, Platform-Adapter `intelligence-contract-adapter.js`, Trip-Draft-Owner, Composer/gezielte CSS-Ergänzungen, Tests/Fixture und Release-/Planungsnachweise. Keine DB-Migration, Secrets- oder Function-Änderung; vorhandene Modell-Capability bleibt serverseitig unverändert. Keine breite visuelle Neugestaltung gemeinsam mit der Vertragsänderung.

Abnahme: echte Owner-Verhaltensprüfungen für Modellantwort/Fallback/Ausfall, unbekannte harte Anforderungen, Profilrestriktionen, Kategorien/Tempo/Zeitfenster, gesamten Zeitraum, Datumwechsel, veraltete Antworten und bestätigten Suchstart; sichtbare lokale und öffentliche Browserläufe mit sauber getrennter Modell-/Fixture-Evidenz, Regression/NFR-0/Byteprüfung. Rollout bleibt unveränderlicher Integration-Kandidat; Stable wird nach Prüfung auf akzeptierte `.104` zurückgestellt. P15/P17 bleibt bis zu vollständigen Kontext- und realen Konto-Lifecycle-Belegen teilweise.

Quelle: `995dd47ca3a32626336697c06cbaf9d2935c4c7f`, App `13.82.168.117`, Core `4.82.236`, Worker `d67daa6d-c84e-401b-8478-f758abaa227b`. Der unveränderliche Kandidat ist unter https://d67daa6d-integration-luvia.njwnrvwbv5.workers.dev erreichbar.

Behoben: Der sessionbezogene Entwurf erhält die tatsächlich getauschten Orte, Auswahlarten, Uhrzeiten und Dauern über Reload. Positive identitätsgebundene Trip-/Place-Receipts und Place-Readback sind Voraussetzung eines Erfolgs. Vor der ersten Mutation wird der Wiederherstellungsbeleg gesichert. Bestätigte Teilschritte werden übersprungen, eindeutig fehlgeschlagene Aktionen gehen über den vorhandenen Retry-Pfad, unbekannte Ergebnisse werden nicht blind wiederholt. Bestätigte Inhalte sind während einer unvollständigen Übernahme gesperrt. Ein Navigationsfehler nach dem Speichern ist vom Speicherergebnis getrennt. Ein Kontowechsel verhindert weitere Fremdkontoaktionen; eine verlassene Oberfläche wird nicht nachträglich überschrieben.

Feste Daten, reale Kalenderdaten, geografische Koordinaten und die explizite Reisezeitzone werden geprüft. Die öffentliche Journey-Tagesprüfung arbeitet mit den tatsächlich eingeplanten Orten und bearbeiteten Dauern. Vormerken und Weglassen entfernen den betreffenden Moment aus der Zeitprüfung. Kategorieabfragen verwenden den bestehenden Places-Cache und Anbieter-Router, übergeben explizite Kategorien ohne falsche Freitext-Kategorieeinschränkung und berücksichtigen alle gewählten Kategorien mit höchstens drei gleichzeitigen Reads. Ein einzelner verifizierter Vorschlag wird angezeigt; Teilfehler werden je Kategorie ausgewiesen.

Gestaltung: fortlaufende Reiseübersicht, Reisefarbe in den Bestätigungsschaltflächen, besser lesbare Tageskarten, bearbeitbare Uhrzeit und Dauer, Karte-zu-Karte-Fokus, erhaltene Karteninstanz beim Bearbeiten und kurze Schrittübergänge. Reduced Motion bleibt berücksichtigt. Die neu angeforderten Gesamtgestaltung und echte KI-Planung sind im gemeinsamen Produktentscheid dokumentiert; diese erste Gestaltungsrunde ist keine finale Designfreigabe.

Gemessen: **24** Verhaltensprüfungen mit echten Trip-/Intelligence-/Journey-Regeln und kontrollierten Schreibadaptern; **236/236** Safe Regression; **3/3** NFR-0; **30/30** öffentliche Byteidentität. Der sichtbare lokale Mobil-Lauf bei **390 × 844** bestätigte fünf simulierte Schreibaktionen nach Tausch, Vormerken, Weglassen und einer Änderung auf **135 Minuten**. Der sichtbare öffentliche Lauf lieferte **Strand Creperie, Kurhaus Scharbeutz, Augustuspark, Lionspark und Kurpark Scharbeutz** aus den gewählten Bereichen Essen, Kultur und Aktivitäten. Nach Teilwahl sank die Karte von fünf auf vier Pins; nach Reload blieben **3 einplanen / 1 vormerken / 1 weglassen** erhalten. Die letzte Schaltfläche zeigte vier zu bestätigende Vorschläge. Erfasste Browserfehler: **0**. Vor einer echten Kontoänderung wurde gestoppt. Der reale Trip-/Timeline-Readback ist deshalb weiterhin offen.

Archiv: `luvia-integration-13.82.168.117-995dd47c-public-bytes.zip`, **3.280 Dateien**, **89.090.937 Bytes**, SHA-256 `A21B18943F219CBE2F55DC9CEEBDC9FE41A5772D04DDC52E3975D3D0D65A16FD`. Lokale Belege: `outputs/composer117-release-regression.log`, `outputs/public-byte-proof117-v233.json`, `outputs/composer117-public-mobile.png`. Stable Integration wird nach der Abnahme auf den akzeptierten `.104`-Worker zurückgestellt. Main, Production, Datenbank, Provider-Secrets und veröffentlichter Gateway bleiben unverändert.

**Noch offen:** Tatsächliche Freitextinterpretation, begründete Planung der gesamten Reisedauer, echte Wege-/Budget-/Öffnungs-/Saisonkontexte, breite Originalbildabdeckung, finale interaktive Gestaltung, echte Kontoübernahme einschließlich Teilfehler-Readback, getrennte dauerhafte Profilbestätigung sowie Trip archivieren/löschen/wiederherstellen. P15/P17 bleibt teilweise. Die .116-Formulierung eines abgeschlossenen Tagesentwurfs war weiter als der damals gemessene Nachweis und wird ausdrücklich korrigiert.
