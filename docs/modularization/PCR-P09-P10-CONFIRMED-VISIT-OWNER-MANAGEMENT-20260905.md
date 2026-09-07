# PCR P09/P10 – bestätigte Besuche über den Places Visit Owner verwalten

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.131**, Core **4.82.250**. P15/P17 aktiv und teilweise: App .131 / Core .250 und Intelligence 4.37.0 sind auf Integration veröffentlicht. Der Composer verbindet drei Reisewege, kanonischen Globus, originalen Luvia-Compass, frei geführte Flugpfade, fünf Zielideen, semantische Zeitfenster und vollständige KI-Tagesplanung. Reise-DNA und Zeitreise sind integriert. trip.audit prüft jeden Entwurf unabhängig über Terra und erlaubt genau eine gezielte Reparatur; Sol bleibt dem Gesamtentwurf vorbehalten. 239/239 Regression, Intelligence-Health, Workerstatus, 8/8 öffentliche Dateihashes und der sichtbare mobile Einstieg sind belegt. Der authentifizierte vollständige Modell-Positivlauf bleibt offen. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Funktional geliefert sind neutrale Geografie mit dezenten Namen pro Ebene, drei fachlich getrennte Reiseergebnisse, fünf erneuerbare Zielideen, kanonische Zielidentitätsprüfung und semantische Reise- plus Profilpräferenzen. Ein grober Monatswunsch erzeugt drei konkrete Zeitfenster mit der erkannten Dauer; nach Auswahl beginnt ohne wiederholte Wunschabfrage direkt der vollständige rollenabhängige Entwurf. Das Structured-Output-Schema ist streng rekursiv geprüft, unvollständige Modellantworten werden vor der JSON-Auswertung erkannt und die Ladeanzeige erklärt die aktuelle Phase. trip.audit prüft Vollständigkeit, Zeit, Kategorien, Wiederholungen, Geografie, Gruppenbedarf, Budgetbelege, Reservierungen und Alternativen über Terra. Reise-DNA zeigt Herkunft und Wirkung der Merkmale; Zeitreise stellt frühere Entscheidungen ohne Domain-Mutation wieder her. Flugpfade starten am Compassrand, variieren und können eine Schleife fliegen. Kontextwellen, Gruppen-Sternbild, Reise-Schatten, Ziel-Zwillinge und Luvia Pulse bleiben offen.

**Nächster Schritt (AKTIV): Reiseversprechen, Unsicherheit und Buchungsabhängigkeiten in den vollständigen KI-Entwurf binden.** Zeitfenster, Kalenderbelege, vollständige Komposition und unabhängiger Audit besitzen jetzt einen gemeinsamen semantischen Vertrag. Als nächster zusammenhängender Qualitätsschritt muss die KI vor dem Entwurf ihr Reiseversprechen formulieren und danach Unsicherheiten sowie blockierende Buchungsentscheidungen sichtbar auf genau dieses Versprechen beziehen.

**Abnahme dieses Schritts:**

- Vor dem Plan ein kurzes, aus dem gesamten freien Wunsch abgeleitetes Reiseversprechen erzeugen; Ziel, Zeit, Gruppe, Kategorien, Rhythmus, Freiraum und Ausschlüsse müssen prüfbar enthalten sein.
- Jeden Planabschnitt als belastbar, modellierte Annahme oder offen kennzeichnen und Wetter, Preis, Öffnung, Route, Verfügbarkeit sowie Buchungsdaten nur mit Quelle und Abrufzeit als Fakt zeigen.
- Zeitkritische Fähren, Flüge, Veranstaltungen oder andere Blocker in einem erklärbaren Abhängigkeitsgraphen vor nachgelagerten Tageszeiten und Reservierungen anordnen.
- Mindestens zwei sehr unterschiedliche freie Reiseaufträge mit dem produktiven Modell bis zum vollständigen Entwurf und Audit positiv prüfen; Tokenkosten, Latenz, Reparaturbedarf und Providerzugriffe je Fähigkeit messen.

**Danach:** Nach professioneller Motion-Freigabe, vollständigem KI-Plan und Trip-Lifecycle die P15-Identity-Übernahme und physischen Gerätegates schließen; danach M18–M22 mit Mitreisendenverwaltung, Administration, Social und Intelligence II. Die Karten-, Composer- und sieben neu aufgenommenen USP-Ideen bleiben verbindlich.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17: professionelle visuelle Composer-Freigabe, echter vollständiger KI-Positivlauf, datierte Kontext-/Budgetqualität, Kontoübernahme, dauerhafte Identity-Übergabe, Lifecycle und physische Geräte. Von den sieben neuen Composer-USPs sind Reise-DNA und Zeitreise lokal umgesetzt; Kontextwellen, Gruppen-Sternbild, Reise-Schatten, Ziel-Zwillinge und Luvia Pulse bleiben offen. Die Geografie ist eine Übersicht, keine Zusage sämtlicher aktuellen Untergliederungen. Kein zusätzlicher P-Block wird als vollständig abgeschlossen markiert.

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

## Release `.111`: interner P09/P10-Abschluss mit eindeutiger Visit-Identität

App **13.82.168.111** / Core **4.82.230** veröffentlicht Runtime-Commit **1eeab2566f18980ebba6d8633597524c401a4cc8** als Integration-Worker **b42820f6-8e77-4866-b154-5c340d2db4a7**. Die Runtime verbindet generische Timeline-Titel ausschließlich über lokale `placeId`-, `tripPlaceId`- und `providerPlaceId`-Lesewege mit dem Places Owner. Dieser Weg startet keine Places Discovery und verbraucht kein Google-, Foursquare-, Geoapify-, TomTom- oder HERE-Kontingent.

Die reale Reise enthielt zwei unterschiedliche bestätigte Visits für **DAS LEO**. Der vorherige Kandidat `.110` belegte die lokale Namensauflösung, hätte bei diesem Gleichstand aber noch einen beliebigen der beiden Owner-Datensätze wählen können. `.111` schließt diese Lücke: Eine Anweisung ohne Ordinalangabe endet mit `AI_VISIT_TARGET_AMBIGUOUS` und fordert sichtbar **„erster“, „zweiter“ oder „letzter“**. Die Anweisung „Ändere den ersten bestätigten Besuch bei DAS LEO am 12.06.2027 um 18:15 Uhr auf 60 Minuten“ zeigte anschließend die korrekte Bestätigung mit Ort, deutschem Datum und Uhrzeit. Die Vorschau wurde bewusst abgebrochen; Luvia bestätigte sichtbar, dass nichts verändert wurde.

Der sichtbare Browser lud die `.111`-Pre- und Postcontext-Bundles. Die Timeline blieb ohne horizontalen Überlauf. Vollständige Safe Regression **233/233**, NFR-0 **3/3**, Releasekonsistenz, Recovery, visuelles Inventar und die gezielten Owner-/Orchestrierungs-/Null-Provider-Prüfungen sind grün. **30/30** releasekritische Dateien stimmen zwischen dem sauberen Deployment-Byte-Archiv, Stable und dem immutable Worker überein.

- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.111-1eeab256-public-bytes.zip`
- Archivgröße: `89.044.244` Bytes
- Archiv-SHA-256: `08225C7807215873A48BFE3C913FF0C952EB7CCEF9500710D7FB4797B50D520F`
- Immutable: `https://b42820f6-integration-luvia.njwnrvwbv5.workers.dev/`
- Exakter stabiler Rücksprungpunkt: Worker `.104`, `7cda6e20-3b33-442a-b5e6-1c2da8256faf`

## Restumfang

P09 und P10 sind **intern abgeschlossen** und bleiben im Gesamtstatus nur **BELEGT_BEGRENZT**, bis Langdruck, Wackelmodus, Verschieben, Korrektur, Entfernen und Wiederherstellen einmal auf realem iOS und Android physisch abgenommen wurden. Eine echte positive Providerbuchung gehört zu P07/P08 und blockiert diesen internen Owner-/Chat-Abschluss nicht. Der nächste aktive Produktblock ist P11: sichtbare Routenunsicherheit, Quellenalter und ein separat bestätigter Journey-Zeitpuffer.
