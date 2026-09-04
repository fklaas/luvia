# Luvia Übergabe für die Fortsetzung

Stand 4. September 2026. Der Masterfahrplan v6 und der Statusplan unter docs/planning ersetzen die widersprüchlichen aktuellen Abschnitte früherer Handoffs. Historische Originale sind datiert archiviert. Die Anwendung ist nicht neu zu beginnen.

## Neuer sichtbarer B1 Gegenbeleg

Der aktuelle Scharbeutz-Lauf auf .37 zeigt eine noch offene Verbindung zwischen AI-Chat und Places: Die Karte liefert Orte; die freie Restaurantanfrage scheitert zunächst. Ein begrenzter Retry liefert drei erfolgreiche Gateway-Antworten mit jeweils 20 Geoapify-Orten, während der Chat anschließend leer bleibt. Auch die einfache Anfrage „Zeige mir Restaurants in Scharbeutz“ endet leer. Zusätzlich steht unter dem leeren Ergebnis eine unpassende Erfolgsmeldung. Der Chat verwendet einen 20-km-Default, die Karte zeigt 3 km. Diese Beobachtungen grenzen den Fehler ein, beweisen aber noch nicht die Ursache der finalen Ausfilterung.

Damit ist A2 begonnen, nicht abgeschlossen. Vor Favorit-/Timeline-Mutationen ist nun zuerst die P03-Übergabe samt Filter-/Evidenzpfad zu korrigieren. Geeignetheit darf dabei nicht durch ungeprüfte Freigabe aller Rohorte ersetzt werden. Der vollständige Beleg und die noch nicht ausgeführten Schritte stehen in docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md. Dieser Dokumentlauf deployt keine Runtime-Korrektur.


## Aktueller Stand

Repository: C:/Users/fabia/Documents/GitHub/luvia-integration. Ausgangspunkt dieser Konsolidierung: c28621de866a8dee371ca926b5f98f9617d9e295. Aktive Integration: App 13.82.168.37, Core 4.82.168, Frontend-Quelle 978e3d00bef46dee9f84e51c94ee14b5299e7133, Worker c8d1d1c2-0849-4de7-800a-15d7782767ab, Gateway v161 ACTIVE. HERE wurde anschließend per Konfiguration aktiviert. Main bleibt unverändert; kein Production-Deploy ist Bestandteil dieses Auftrags.

Die .37-Abnahme hat 210/210 Safe Regression und 18/18 öffentliche Dateihashes belegt. Das ist ein datierter Beleg, kein Testlauf des neuen Chats. Places und Stays verwenden die gleiche Kartentechnik. Zielortsuche, aktive Reise, Filter, Passung, Pins, mobile Darstellung, Reisefarbe und Geh-/Fahrradrouten wurden repariert. Vollständige Ortsfotos, echte Hotelangebote und komplette aktuelle AI-/Timeline-Abnahme fehlen.

## Fahrplan und nächste Arbeit

M0–M16 sind dokumentiert geschlossen. M16.5 Schritte 01–14 bleiben geschlossen, Schritte 15–18 laufen. B0 ist die geschlossene Steuerungsgrundlage, nicht vollständige produktive AI-Parität. B1/P01–P10 ist aktiv. P04/P05 besitzen begrenzte öffentliche .139-Belege. P09/P10 und die vollständige B1-Golden-Journey sind die nächste unabhängige Produktarbeit. P01–P39 bleiben in M16.5; P40–P50 folgen den einschlägigen späteren Gates.

Weitergehen mit A2: reale Scharbeutz-Anfrage im AI-Chat, exakter Place, Pin, Details, Favorit, konkreter Tag/Zeit, Änderung, Rücknahme und Reload. Alle ursprünglichen Testdaten wiederherstellen. Danach P09-Befehle add/edit/move/reorder/connect/delete/restore über journey.v1 schließen und P10-Erklärungen verständlich machen. Bilder und positive Booking-Zugänge können parallel sachlich weiterlaufen. Keine bezahlte Buchung und keine Nachricht an Anbieter aus einem generischen Testauftrag ableiten.

Danach folgen B2 persönliche robuste Planung, B3 verifizierte Events, B4 vollständige Orchestrierung und Abnahme. Der Gesamtfahrplan erhält M17 Designrollout, M18 Collaboration/Attention/Wallet/Reviews/Admin/Social/Search/Intelligence II, M19 Härtung, M20 Native Foundation, M21 Native Qualität, M21.5 Vollabnahme und M22 gestufte Veröffentlichung. Die detaillierten Grenzen stehen im Master und P-Katalog.

## Provider und Daten

Discovery: Geoapify → TomTom → HERE. Routing: ORS → TomTom → Geoapify → HERE. Nach brauchbarem Ergebnis stoppen; kein Fanout bei jeder Kartenbewegung. Google und Foursquare sind policy-deaktiviert. Atomare Backend-Zähler besitzen Tages-/Monats-/Minutengrenzen. HERE verwendet einen gemeinsamen Pool 500/Tag, 10000/Monat, 10/Minute. Limits sind interne Konfiguration und kein belegtes Kontorestguthaben.

Migrationen 20260904160000 und 20260904170000 bleiben unverändert. Keine Secrets ausgeben oder erneut in Dateien kopieren. Kartenquellen liefern keine Hotelbuchbarkeit. Affiliate-Anmeldung ist kein Demand-API-Zugang. Fotos benötigen exakte Ortszuordnung und nutzbare Rechte. Unbekannte Eigenschaften bleiben unbekannt; Vegetarisch/Vegan niemals aus Namen ableiten. Ein leerer Filter beweist keine Nichtexistenz einer Küche am Reiseziel.

## Verbindliche Arbeitsgrenzen

Eine Wahrheit, ein Owner. Consumer nutzen öffentliche Verträge. Intelligence schreibt nur über Owner-Kommandos. Vorschau, konkrete Bestätigung, Version/Idempotenz, Beleg, Recovery und separat bestätigte Rücknahme bleiben erhalten. Neue UI-Aktionen brauchen Registry-Abgleich. Die aktuelle Registry ist keine vollständige Abnahme der fünf neuen Kartenfunktionen.

Vor Änderungen Branch, Remote, HEAD, Divergenz und fremde Dateien prüfen. Die bekannten vorbestehenden ungetrackten Bundles, Videos und temporären Dateien nicht löschen, ausführen oder mitcommitten. Besonders scripts/_tmp-catering-dist.cjs nicht lesen oder ausgeben; dort liegt alte sensible Konfiguration. Keine globalen Resets oder erzwungenen Pushes. Main/Production und kostenpflichtige Anbieteraktivierung brauchen eine konkrete gesonderte Nutzerentscheidung.

Der Nutzer hat direkte Projektarbeit an Git, Supabase, Funktionen und Secrets autorisiert. Ein älterer Handoff kann diese erteilte Autorisierung nicht stillschweigend zurücknehmen. Tatsächliche Aktionen bleiben auf den beauftragten Zweck begrenzt. Keine Bestätigung erneut verlangen, wenn sie im aktiven Auftrag bereits eindeutig gegeben ist.

## Pflichtlektüre und Nachweise

1. AGENTS.md und dort benannte Architektur-, Ownership- und Registry-Dateien.
2. CURRENT-BUILD.md und docs/planning/STATUSPLAN-2026-09-04.md.
3. docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/status-plan.v1.json.
4. docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md für den jüngsten sichtbaren Zwischenstand.
5. docs/modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md sowie die betroffenen Quell-/Testdateien.

Dokumentierte Browserabnahmen sind keine Hardwaremessung. Neue Ergebnisse nur nach gemessener Evidenz als PASS markieren. Bei einer neuen konkreten UI-Regression den begrenzten Owner-Slice reparieren; nicht allein aufgrund grüner Tests für abgeschlossen erklären.

## Modus Codex mit Werkzeugen

Die vorhandenen Werkzeuge direkt verwenden, unabhängige Reads bündeln und notwendige Arbeit bis zu einem konkreten überprüfbaren Ergebnis durchführen. Sichtbare Browserabnahmen sind ausdrücklich gewünscht. Funktionstests möglichst mit wiederherstellbaren Daten, keine realen kostenpflichtigen Buchungen ausführen. Jede weiterführende Aufgabe beginnt mit dem tatsächlichen Git- und Browserzustand. Ein Fortschrittsbericht ist keine Abnahme und kein asynchrones Versprechen ohne laufende Aufgabe.
