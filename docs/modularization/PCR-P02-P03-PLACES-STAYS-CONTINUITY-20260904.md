# PCR P02/P03 — Places- und Stays-Kontinuität

**Datum:** 04.09.2026  
**Status:** auf Integration begrenzt angenommen  
**Release:** App `13.82.168.51`, Core `4.82.173`  
**Runtime-Quelle:** `6da646bdd774b764cad9e868445a1c921a65c783`  
**Gateway:** `luvia-gateway` v163 ACTIVE  
**Worker:** `47496145-d13d-4a59-9e9c-b1785dd9f171`

## Beobachtetes Problem

Im selben Reise- und Kartenkontext wechselten Kategorien zeitweise zwischen null, wenigen und der vollständigen Trefferzahl. Shopping zeigte beispielsweise zunächst keine oder nur wenige Pins und später wieder ungefähr 45. Während der sichtbaren Abnahme von App `.50` endete Aktivitäten nach einem Wechsel im aktiven Scharbeutz-Ausschnitt nach rund 16 Sekunden mit „Orte konnten gerade nicht geladen werden“, obwohl Essen, Shopping und Natur zuvor echte Treffer geliefert hatten.

## Ursache

Zwei voneinander unabhängige Mechanismen verlängerten einen einzelnen Provider-Aussetzer:

1. Erfolgreiche leere Text- und Viewport-Antworten wurden fünf beziehungsweise fünfzehn Minuten gespeichert. Ein vorübergehender Nulltreffer wurde dadurch bei identischer Kategorie und Geometrie wiederverwendet.
2. Breite Kategorien wie Aktivitäten und Natur werden als ODER-Verknüpfung mehrerer Geoapify-Eltern gesucht. Fiel nur ein paralleler Ergänzungszweig wegen Minutenbudget, Transport oder Zeitlimit aus, verwarf der Gateway auch bereits erfolgreiche Geschwisterantworten. Der anschließende Anbieter-Fallback konnte länger dauern als das Browser-Zeitfenster.

Ein Diagnosefehler überschrieb bei Kategorieänderungen außerdem den Viewport-Schlüssel mit dem Kategorienamen. Die Kartenkoordinaten blieben korrekt, die sichtbare Suchspur war dadurch jedoch nicht eindeutig genug.

## Änderung

- Leere `places.text-search`- und `places.nearby-search`-Antworten werden weder im Gateway noch im lokalen Viewport-Cache gespeichert.
- Ein erzwungener Neuabruf umgeht beide Cachegrenzen und ersetzt bei Erfolg den normalen Cacheeintrag.
- Für unerwartet leere, ungefilterte Hauptkategorien ist genau ein cachefreier Neuversuch erlaubt. Dasselbe gilt für einen transienten Gesamtausfall. Gefilterte echte Leerstände bleiben endgültig und lösen keinen Zusatzverbrauch aus.
- Breite Geoapify-Kategorien verwenden fehlertolerante Teilantworten. Erfolgreiche Eltern bleiben erhalten, wenn ein paralleler Ergänzungszweig ausfällt; erst der Ausfall aller Eltern ist ein Gesamtfehler.
- Budget-RPC und Provider-Transport besitzen engere Zeitgrenzen, damit ein nicht antwortender Zweig schneller an die vorhandene Fallback-Logik übergibt.
- Kategorieänderungen behalten den echten geometrischen Viewport-Schlüssel. DOM-Diagnosen enthalten Suchart, Kategorie, Geometrie, Request-ID, Provider, Cache, Dauer, Ergebniszahl, Versuch und bei Fehlern den Fehlercode.
- Places und Stays nutzen denselben gehärteten Viewport-Reader, denselben Abbruchschutz gegen alte Antworten und dieselbe Diagnose.

## Automatisierte Abnahme

- `217/217` Safe Regression: PASS.
- Filtermatrix: `76` Kategorie-/Subtype-Zuordnungen einschließlich aller bekannten Landesküchen, Faktenfilter, Kombinationen und Reset: PASS.
- Unerwarteter Nulltreffer: genau ein erzwungener Neuversuch: PASS.
- Transienter Provider-Ausfall: genau ein erzwungener Neuversuch: PASS.
- Ausfall eines von drei Kategorie-Eltern bei zwei erfolgreichen Antworten: erfolgreiche Treffer bleiben erhalten: PASS.
- Stale-Response-Abbruch, ehrlicher gefilterter Leerstand und Hotel-Parität: PASS.
- Öffentliche Dateien gegen das unveränderliche Releasearchiv: `30/30 MATCH`.

## Sichtbare Integration-Abnahme

Die Abnahme lief angemeldet im sichtbaren In-App-Browser auf der stabilen Integration. Nach einem echten Zoom blieb derselbe Viewport `53.9921:10.6736:54.0714:10.8353` aktiv.

| Oberfläche | Schritt | Treffer | Dauer | Ergebnis |
|---|---|---:|---:|---|
| Places | Essen & Trinken | 50 | 1,734 s | bereit |
| Places | Shopping | 45 | 1,415 s | bereit |
| Places | Natur & Erholung | 18 | 1,209 s | bereit |
| Places | Aktivitäten | 7 | 4,987 s | bereit, keine Fehlermeldung |
| Places | Shopping → Aktivitäten wiederholt | 45 → 7 | Cachetreffer | stabil |
| Stays | Reiseziel Scharbeutz | 49 | Erstsuche | bereit |
| Stays | derselbe aktive Viewport nach Zoom | 48 | 1,091 s | bereit |

Die geringere Aktivitätenzahl ist eine ehrliche partielle Providerantwort innerhalb des aktiven Ausschnitts. Sie ersetzt den vorherigen falschen Gesamtausfall und wird durch die sichtbare Request-/Provider-Spur als solche reproduzierbar.

## Noch offen

P02 und P03 bleiben **TEILWEISE**. Der nächste Block prüft jede angebotene Filtermöglichkeit und jede Landesküche real und sichtbar, schließt `Alle/Passend` gegen gespeicherte Profilvorlieben und verfolgt für jede Detailkarte ein exakt zum Place gehörendes Bild mit Attribution. Die sichtbare Browserabnahme ist kein Ersatz für die noch ausstehende physische iPhone-/Android-Abnahme.

## Artefakte und Rückfall

- Archiv: `release51-6da646bdd774.zip`
- SHA-256: `11350A9DE522F4F2CC059AC8E2074DD116D96213845D109F2E6E18EA1FF5C0C1`
- Regression: `outputs/release51-safe-regression.txt`
- Bytebeleg: `outputs/public-byte-proof51.json`
- Sichtbare Abnahme: `outputs/p02-p03-visible-acceptance-51.json`
- Rückfall: App `.50`, Core `4.82.172`, Runtime `b5f14f7fa8fe`, Worker `1b4c5bda-8892-47e4-8426-3cd9c7937a92`, Gateway v162 aus `release50-b5f14f7fa8fe.zip`.
- `main` blieb unverändert auf `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.
