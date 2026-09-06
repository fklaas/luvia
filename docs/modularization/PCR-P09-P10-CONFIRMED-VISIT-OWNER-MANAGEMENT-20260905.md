# PCR P09/P10 – bestätigte Besuche über den Places Visit Owner verwalten

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.122**, Core **4.82.241**. M16.5 Schritte 15–18: P15/P17 aktiv und teilweise. Die ausgewählte Chat-Gestaltung, zweistufige Kartenhierarchie und drei Reisewege laufen im echten Composer .122. Vollständige KI-Planqualität, Kontext-/Kontoabschluss und physische Mobilabnahme bleiben offen. Stable bleibt .104.

**Zuletzt geliefert:** App .122 liefert die vom Nutzer ausgewählte Chat-Gestaltung im echten Composer: Cremefläche, drei sichtbare Reisearten, geografische Bühne und untere Auswahlfläche. Globus → Kontinent → Land → Region ist lokal bedienbar. Der erste Klick wählt aus und zeigt eine bewegte Kontur mit neun Compass-Farbstopps; der zweite öffnet die Ebene. Welt/Europa/Deutschland/Schleswig-Holstein und der Anschluss an die echte Rom-Zielsuche sind öffentlich sichtbar geprüft. Die Übersicht nutzt 251 landweise ladbare Regionspakete; unbenannte Quellregionen werden nicht erfunden. Die Ortsstufe verwendet weiterhin die kanonische Zielsuche, keine flächendeckende neue Städtegeometrie. Reisezeit, Wünsche, Gestaltung und Bestätigung bleiben auf derselben Bühne; echte Vorschläge nutzen die vorhandene gemeinsame Places-Karte. Nur anlegen erzeugt im lokalen Browser null zusätzliche Orts-/Timeline-Aktionen. Mit Vorschlägen beginnt im Verhaltenstest ohne Auswahl und bestätigt nur ausdrücklich gewählte Owner-Aktionen. Der öffentliche 390-Pixel-Globus dreht bei ScrollTop 0 ohne Seitenbewegung oder horizontalen Überlauf. Reduced Motion behält die Kontur ohne Gradientanimation. 38 Geometrie-/Gesten-/Datenprüfungen, 53 Composer-Verhaltensprüfungen, 238/238 Regression und 43/43 öffentliche Dateihashes sind grün. Vollständige KI-Plangüte, echte Kontoübernahme und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): Den vollständigen KI-Reiseentwurf im ausgewählten Composer belastbar fertigstellen.** Die ausgewählte Oberfläche und die grundlegende Kartenhierarchie sind jetzt ausgeliefert. Der nächste Abschluss muss echte Planqualität über den ganzen Zeitraum und die sichere Übernahme belegen; mehr Animationen allein schließen P15/P17 nicht.

**Abnahme dieses Schritts:**

- Realen erfolgreichen Modelllauf belegen. Der zuletzt gemessene HTTP 429 bleibt bis zum positiven Gegenbeleg offen; fehlende Modellantwort darf keinen vollständigen KI-Erfolg ergeben.
- Alle Reisetage mit nachvollziehbarem Rhythmus, belegten Ernährungs-/Zugangsrestriktionen, Interessenvielfalt, realistischen Wegen/Puffern, Pausen und Budgetrahmen prüfen. Fünf Orte über acht Tage sind kein vollständiger Plan.
- Saison, Feiertage, Veranstaltungen und Wetter mit Quellen- und Zeitkontext einbeziehen; langfristige Saisonerwartung und kurzfristige Vorhersage getrennt behandeln.
- Den Entwurf auf derselben Kartenbühne Tag für Tag erlebbar präsentieren, Alternativen und Änderungen erhalten und nur die ausdrücklich bestätigte Auswahl idempotent über Trip/Places/Journey übernehmen. Dauerhafte Identity-Änderungen separat bestätigen.
- Wiederaufnahme, Moduswechsel, kanonische Zielauswahl, sichere Kontoübernahme und physische iOS-/Android-Gesten prüfen. Globale Städtestufen und weitere visuelle Ausarbeitung bleiben expliziter Restumfang; P15/P17 erst nach vollständigen Produktgates abschließen.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, weitere interaktive Ausarbeitung und globale Städtestufen, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
