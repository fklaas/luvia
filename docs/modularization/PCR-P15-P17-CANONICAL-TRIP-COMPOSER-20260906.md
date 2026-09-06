# PCR P15/P17 — Kanonischer Trip Composer

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.115**, Core **4.82.234**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. P15/P17 besitzt mit App .114 die gemeinsame Composer- und Preference-Scope-Foundation; App .115 schließt nun auch die öffentliche kanonische Zielsuche. Stable Integration läuft nach der Abnahme wieder auf dem akzeptierten App-.104-Worker; die .114- und .115-Kandidaten bleiben immutable. Main und Production blieben unverändert. P15/P17 ist weiterhin AKTIV, weil echter tageweiser Entwurf, Teilübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle noch geschlossen werden müssen.

**Zuletzt geliefert:** P15/P17 Zielsuche: Der Composer liest zuerst das aktive kanonische Reiseziel aus derselben Destination-/Places-Wahrheit und verbraucht dafür kein externes Providerkontingent. Externe Autocomplete-Aufrufe sind begrenzt; die Oberfläche beendet jeden Ladezustand mit Vorschlägen, leerem Ergebnis oder Fehler samt Wiederholung. Der öffentliche sichtbare AI-Lauf bestätigte Scharbeutz vollständig. Die 9/5/7-Schrittfolgen, Preference-Scope-Grenzen und ehrlichen Unbekannt-Zustände aus .114 bleiben erhalten. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): P15/P17 mit echtem Tagesentwurf, Teilübernahme und Trip-Lifecycle schließen.** Composer, Preference-Scopes und öffentliche Zielauflösung sind belegt. Für den Blockabschluss fehlen jetzt der ownergestützte Tagesentwurf, die einzeln bestätigten Übernahmeaktionen, die getrennte dauerhafte Identity-Übergabe und der vollständige Trip-Lifecycle.

**Abnahme dieses Schritts:**

- Der AI-Entwurf zeigt reale Place-/Stay-Identitäten aus places.v1 tageweise auf derselben Karte wie Places und Timeline, bindet die P12-Tagesprobe ein und kennzeichnet unbelegte Medien-, Context-, Preis- und Buchungsdaten als unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erhalten jeweils eine eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner; Abbruch schreibt nichts.
- Trip archivieren, löschen und wiederherstellen zeigt Abhängigkeiten, verwendet trip.v1-Receipts und besteht Reload-Readback; eine dauerhafte Profilübergabe wird separat bestätigt und über identity.v1 gelesen, korrigiert und gelöscht.
- Ein gebündelter sichtbarer Integrationslauf prüft den kompletten AI-Weg, Teilübernahme, Reload, Account ohne Reise, bestehende Reise, Desktop und mobiles Browserformat sowie erneut Safe Regression, NFR-0 und öffentliche Byteidentität.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. P15/P17 hat Composer, Preference-Scopes und öffentliche Zielsuche belegt, bleibt aber bis zum echten Tagesentwurf, zur Teilübernahme, zur dauerhaften Identity-Übergabe und zum Trip-Lifecycle teilweise. Danach folgen P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
