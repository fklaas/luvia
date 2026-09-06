# PCR P15/P17 — Kanonischer Trip Composer

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.114**, Core **4.82.233**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. P15/P17 besitzt mit App .114 / Core .233 nun die gemeinsame Composer- und Preference-Scope-Foundation. Stable Integration läuft nach der Abnahme wieder auf dem akzeptierten App-.104-Worker; der .114-Kandidat bleibt immutable. Main und Production blieben unverändert. P15/P17 ist weiterhin AKTIV, weil öffentliche Zielsuche, echter tageweiser Entwurf, Teilübernahme und Trip-Lifecycle noch geschlossen werden müssen.

**Zuletzt geliefert:** P15/P17 Foundation: Geführt, Schnellstart und Luvia AI verwenden denselben Trip Composer, dieselbe Trip-Wahrheit und dynamische 9/5/7-Schrittfolgen. Anfragefreitext bleibt receipt-only, Trip-Interessen und Budget bleiben reisebezogen, dauerhafte Profilwerte verlangen eine getrennte Identity-Bestätigung. Die AI-Vorschau erfindet keine Place-/Stay-, Medien-, Context-, Preis- oder Buchungsdaten. Der lokale sichtbare End-to-End-Lauf erreichte den idempotenten Trip-Command; öffentlich sind Einstieg und Schrittfolgen sichtbar, während die festhängende Zielsuche als offenes Gate dokumentiert ist. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): P15/P17 mit öffentlicher Zielsuche, echtem Tagesentwurf und Teilübernahme schließen.** Die gemeinsame Composer- und Scope-Foundation ist belegt. Für den Blockabschluss fehlen jetzt nur noch die zuverlässige öffentliche Zielauflösung, der ownergestützte Tagesentwurf und die einzeln bestätigten Übernahme- und Trip-Lifecycle-Aktionen.

**Abnahme dieses Schritts:**

- Die kanonische Zielsuche liefert im öffentlichen Desktop- und Mobilbrowser innerhalb einer begrenzten Ladezeit einen bestätigbaren Ort oder einen klaren Fehler mit Wiederholung; kein endloses „Suche läuft …“.
- Der AI-Entwurf zeigt reale Place-/Stay-Identitäten aus places.v1 tageweise auf derselben Karte wie Places und Timeline, bindet die P12-Tagesprobe ein und kennzeichnet unbelegte Medien-, Context-, Preis- und Buchungsdaten als unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erhalten jeweils eine eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner; Abbruch schreibt nichts.
- Trip archivieren, löschen und wiederherstellen zeigt Abhängigkeiten, verwendet trip.v1-Receipts und besteht Reload-Readback; eine dauerhafte Profilübergabe bleibt separat bestätigbar, korrigierbar und löschbar.
- Ein gebündelter sichtbarer Integrationslauf prüft den kompletten AI-Weg, Teilübernahme, Reload, Account-ohne-Reise, bestehende Reise, Desktop und mobiles Browserformat sowie erneut Safe Regression und NFR-0.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. P15/P17 besitzt die Foundation, bleibt aber bis zur öffentlichen Zielsuche, zum echten Tagesentwurf, zur Teilübernahme und zum Trip-Lifecycle teilweise. Danach folgen P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
