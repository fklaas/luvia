# PCR P09/P10 – bestätigte Besuche über den Places Visit Owner verwalten

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.104**, Core **4.82.223**. M16.5 Schritte 15–18 aktiv. App .104 / Core .223 ist der vollständig getestete P02/P03-Kandidat für die komplette Kategorie-/Landesküchenmatrix und exakt identitätsgebundene Ortsbilder; der öffentliche Rückfallstand bleibt .103 bis zur abgeschlossenen Integration-Veröffentlichung.

**Zuletzt geliefert:** Kandidat .104 prüft alle 14 gemeinsamen Kategoriepfade und alle 19 Landesküchen über öffentliche, kostenfreie Diagnoseverträge. Die 82 sichtbaren Filterzuordnungen und sämtliche belegpflichtigen Sachfilter bleiben fail-closed. Beim ausgewählten Ort ergänzt Google Places nach strenger Namens- und Koordinatenidentität bis zu drei echte Fotoreferenzen; Wikimedia und Foursquare bleiben exakte Fallbacks. Google-Suche und Place Photos erhalten getrennte, serverseitig atomare 800/Monat-Reserven, und keine Kartenbewegung verbraucht Bildkontingent.

**Nächster Schritt (AKTIV): Reale Ortsbild- und Touchmatrix öffentlich abnehmen.** Die vollständigen Kategorie-, Küchen- und Filterverträge sowie der neue identitätsgebundene Bildpfad sind lokal grün. Offen sind die veröffentlichte Provider-Matrix, sichtbare kompakte Touchabnahme und der physische iOS-/Android-Kaltstart.

**Abnahme dieses Schritts:**

- Gatewaymigration, Funktion und Runtime werden auf Integration veröffentlicht; alle 14 Kategorieproben und 19 Landesküchen liefern einen ehrlichen positiven, leeren oder providerbedingt fehlgeschlagenen Status mit Anbieter- und Bildabdeckung.
- Ein ausgewählter Place und ein ausgewählter Stay laden ein echtes, exakt zugeordnetes Bild mit Herkunft; bei fehlendem exaktem Treffer bleibt der Zustand ehrlich bildlos. Google, Wikimedia und Foursquare dürfen keine räumlich nahen Fremdbilder übernehmen.
- Alle 82 Zuordnungen und Sachfilter bestehen auf Desktop und kompaktem Touch-Viewport positive, negative, leere, kombinierte und teilweise Providerfälle; Kategorienwechsel, Passend, Ziehen und Zoomen bleiben bedienbar.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand.
- Passend bleibt fail-closed und identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Budgetstatus, Safe Regression, NFR-0, sichtbare Browserabnahme und Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 sind technisch für 14 Kategorien, 19 Landesküchen, 82 Filterzuordnungen und den exakten Google/Wikimedia/Foursquare-Bildpfad erweitert. Offen bleiben die öffentliche reale Bildquote und der physische Mobil-Kaltstart. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert.

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
- Core: `4.82.218`
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
