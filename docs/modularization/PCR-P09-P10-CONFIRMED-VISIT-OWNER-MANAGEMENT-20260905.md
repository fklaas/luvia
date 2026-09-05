# PCR P09/P10 – bestätigte Besuche über den Places Visit Owner verwalten

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.89**, Core **4.82.211**. M16.5 Schritte 15–18 aktiv. P02/P03 bleibt der aktive Abschlussblock; der positive Passend-Pfad steht, der sichtbare Mengen-/Radiusvertrag wird gerade geschlossen. Apple ist geparkt.

**Zuletzt geliefert:** App .88, Gateway v206 und der kostenlose OSM-Evidenzpfad liefern öffentlich 25 vegetarisch oder vegan belegte Treffer ohne Steakhouse-Falschpositiv. Der sichtbare Test zeigte Alle 50, Passend 25, Passt-Pins, Zoom und Pinwechsel. Als letzte Wahrheitslücke wurde erkannt, dass die Evidenzsuche bis 8 km reichen konnte, während die Seite 3 km auswies. Kandidat .89 verwendet nun für beide Modi denselben `geography.searchRadiusMeters`-Wert. 229/229 Safe Regression und NFR-0 3/3 sind für den korrigierten Kandidaten grün.

**Nächster Schritt (AKTIV): App .89 veröffentlichen und den identischen Alle-/Passend-Radius sichtbar belegen.** Passend ist positiv, darf aber keinen größeren Suchraum verwenden als die sichtbare Alle-Menge. Der Code ist angeglichen; jetzt fehlt nur der öffentliche Bedienbeleg.

**Abnahme dieses Schritts:**

- App 13.82.168.89 / Core 4.82.211 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle und Passend verwenden denselben angezeigten Reisezielradius von 3 km.
- Passend zeigt mehrere echte, ausdrücklich vegetarisch oder vegan belegte Orte innerhalb dieses Bereichs.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; Pinwechsel und Kartenzoom bleiben bedienbar.
- 229/229 Safe Regression, NFR-0 und öffentliche Asset-Identität sind grün; Main und Production bleiben unverändert.

**Danach:** Nach dem Radiusbeleg folgt als ein gemeinsamer P03-Slice die identische Provider-ID und Begründung in Timeline-Vorschlägen und AI Chat sowie die technische Stay-Parität.

**Weiter offen:** P02/P03 aktiv: 3-km-Mengenvertrag, danach Flächenparität in Timeline, AI Chat und Stay sowie vollständige Kategorie-/Filtermatrix; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

**Datum:** 2026-09-05
**Umgebung:** Integration und bestehende Supabase-Instanz
**Status:** geliefert; physische iOS-/Android-Langdruckabnahme und positive Booking-Provider-Abnahme bleiben offen

## Auslöser

Die Timeline konnte einen bestätigten Besuch bisher anzeigen, verwies für seine Verwaltung aber nur allgemein auf den Places-Owner. Korrektur, bewusstes Entfernen und Wiederherstellen waren nicht als vollständiger, revisionssicherer Nutzerweg verbunden. Daneben erlaubte die ursprüngliche Datenbank-Constraint nur frühe GPS-Zustände, obwohl der Runtime-Core bereits bestätigungspflichtige, verworfene und abgelehnte Zustände speichert.

## Geliefertes Verhalten

- Die Timeline liest bestätigte Besuche aus `place_visits` als kanonischer Places-Wahrheit. Nur `is_confirmed = true` mit `visited` oder `left`, mindestens fünf Minuten Dauer und einem verknüpften Reiseort wird projiziert.
- Ein zusätzliches historisches `place_visited`-Event wird nicht als zweiter Timeline-Moment gerendert. Damit kann derselbe Besuch nicht doppelt erscheinen und ein entferntes Owner-Objekt nicht über den Ereignisweg wieder auftauchen.
- „Besuch verwalten“ zeigt Besuchszeit, Dauer, Teilnehmerdarstellung, lesbaren Nachweis und aktuellen Place-Lifecycle. Interne Teilnehmer-IDs, rohe Korrekturfelder und Gerätepositionen werden über den öffentlichen Vertrag nicht ausgegeben.
- Datum, Uhrzeit und Dauer lassen sich mit Vorher/Neu-Vorschau ändern. Die Mutation verlangt ausdrückliche Bestätigung, Operation-ID und die zuletzt gelesene Revision.
- Entfernen setzt den Owner-Datensatz auf `removed`; Place, Favorit, Buchung, Fotos und Memories bleiben erhalten. Ein Recovery-Beleg bleibt nach Reload sichtbar.
- Wiederherstellen liest Recovery-ID und aktuelle Revision erneut, verlangt eine eigene Bestätigung und stellt den ursprünglichen bestätigten Status, Beginn und die Dauer idempotent wieder her.
- Frühes Rendern bleibt belastbar, wenn der Places-Visit-Owner noch nicht initialisiert ist. Die Timeline zeigt dann keine falsche Recovery-Sektion und bricht nicht ab.
- Der öffentliche `places.v1`-Adapter stellt die Visit-Reads und -Commands bereit und sendet `place.visit.changed`, ohne private Owner-Felder zu veröffentlichen.

## Datenbanknachweis

Die additive Migration `20260905200000_place_visit_owner_management.sql` erweitert `place_visits_state_check` auf:

`nearby`, `arrived`, `stay_detected`, `pending_confirmation`, `discarded_unconfirmed`, `visited`, `left`, `rejected`, `removed`.

Die Änderung wurde über den angemeldeten Supabase SQL Editor ausgeführt. Eine direkte Abfrage von `pg_constraint` gab anschließend exakt diese neun Zustände zurück. Der lokale CLI-Push wurde nicht erzwungen, weil das verknüpfte CLI-Profil keine gültige Datenbank-Passwortauthentifizierung hatte und die lokale Migrationshistorie zusätzliche ältere Einträge meldete.

## Vertrags- und Datenschutznachweis

- Places Contract Runtime: `1.6.0-visit-owner-management`.
- Presence Visit Core: `4.4.0-owner-management`.
- Journey Day Composer: `1.18.0-visit-owner-management`.
- Neun neue sichtbare `data-*`-Marker sind ausdrücklich im Human/AI-Quellinventar klassifiziert; die bestehende Matrix bleibt bei 330 semantischen Aktionen und 2.733 Fehlerfällen.
- Die öffentliche Visit-Projektion enthält keine `participantId` und kein freies `correction`-Objekt. Die Revision wird nur ausgegeben, wenn ein belegbarer Owner-Stand vorhanden ist.

## Sichtbarer und automatisierter Nachweis

- Mobiler, sichtbarer Chromium-Test bei 477 × 900: Visit-Sheet öffnen, „Besuchszeit korrigieren“, 18:15 Uhr und 60 Minuten eingeben, Vorher/Neu-Vorschau anzeigen und genau einen bestätigten revisionsgebundenen Owner-Write ausführen.
- Screenshot: `test-results/p09-owner-capabilities-first-paint/visit-owner-correction-preview.png`.
- Öffentliche Timeline: Ostseeurlaub lädt Samstag, 12. Juni 2027 mit zwei realen Place-Momenten und wahrheitsgemäßem Besitzerhinweis; kein falscher fertiger Leerzustand.
- Öffentliche Places-Gegenprobe: Essen & Trinken liefert 50 reale Pins; beim vegetarischen Profil bleibt „Passend“ 0/0, solange kein Provider positive Ernährungsfakten belegt. Das Steakhaus bleibt ausgeschlossen.
- Safe Regression: **227/227 PASS** nach Abschluss aller generierten Vertrags-, Inventar- und Drift-Artefakte.

## Integrationsrelease

- App: `13.82.168.89`
- Core: `4.82.211`
- Runtime-Commit: `2e613197b7b44a83c79b592bda45ae2e8a39d51a`
- Integration-Worker: `1d936ac3-fd72-40ca-a5f4-513f414b74d2`
- Stable: `https://integration-luvia.njwnrvwbv5.workers.dev/`
- Immutable: `https://1d936ac3-integration-luvia.njwnrvwbv5.workers.dev/`
- Stable und Immutable: `30/30 MATCH` gegen 15 releasekritische lokale Dateien
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.89-2e613197.zip`
- Archivgröße: `88.771.845` Bytes
- Archiv-SHA-256: `3A8E4592EDF325F40AC7A7BC84BBACBFBFBB8E2E56356F6A0A6CDAD3F0CF7239`

## Veröffentlichungsgrenze

Wrangler verwendete beim ersten Aufruf den Standardnamen `luvia`. Dieser falsche Zielalias wurde unmittelbar erkannt. Weil Cloudflare die zuvor aktive Version zwar in der Deployment-Historie nannte, ihr Asset-Paket aber nicht mehr zur direkten Rücknahme bereitstellte, wurde der Standard-Worker aus einem isolierten Checkout des unveränderten Main-Commits `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba` neu veröffentlicht. `index.html` auf dem Standard-Worker war danach bytegleich mit diesem Main-Checkout. Der neue Kandidat wurde anschließend ausdrücklich als `integration-luvia` veröffentlicht. Das temporäre Wiederherstellungs-Worktree wurde danach entfernt.

Main Git und der wiederhergestellte Standard-Worker enthalten keine P09/P10-Änderung dieses Slices.

## Restumfang

P09/P10 bleiben **TEILWEISE**. Visit- und Memory-Verwaltung sind geliefert. Offen bleiben die positive Verwaltung einer echten Providerbuchung auf Integration, die physische iOS-/Android-Langdruckabnahme und die spätere vollständige AI-Chat-Parität für Visit-Korrektur, Entfernen und Wiederherstellen.
