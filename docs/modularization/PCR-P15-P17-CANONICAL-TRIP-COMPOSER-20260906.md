# PCR P15/P17 — Kanonischer Trip Composer

Datum: 2026-09-06  
Status: vor Implementierung erfasst  
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
