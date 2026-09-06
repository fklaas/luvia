# Luvia konsolidierte Arbeitsplanung

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

Stand 4. September 2026. Maßgeblich sind der gemeinsame Statusabschnitt und der Paketkatalog. Frühere Gegenbelege und anschließende begrenzte Reparaturnachweise bleiben im B1-Abnahmebericht datiert erhalten.

- [Masterfahrplan v6](MASTERFAHRPLAN-v6.md): konsolidierter gültiger Umfang und Gesamtweg bis M22, alle P01–P50 und detaillierte bestehende M18-Blueprints.
- [Statusplan](STATUSPLAN-2026-09-04.md): einzelne Paketstände, Grenzen und nächste Abschlussnachweise.
- [Statusdaten](status-plan.v1.json): dieselben 50 Pakete als maschinenlesbare Daten.
- [Aktuelle sichtbare B1-Abnahme](B1-END-TO-END-ACCEPTANCE-2026-09-04.md): datierte Belege für Suche, Favorisieren, Planen, Reservierungsweg und P09-Zeitänderung mit Rücknahme; vollständige B1-Abnahme offen.
- [Quellenherkunft](source-provenance-2026-09-04.json): vier Nutzerquellen unverändert erhalten, mit SHA-256 und ursprünglicher Master-Kapitelübersicht.
- [Vorheriger aktiver Dokumentstand](archive/2026-09-04-before-consolidation/README.md): zwölf unveränderte Repository-Dokumente vor der Konsolidierung.

Datiert ausgelieferte Word-/ZIP-Dateien im Arbeitsverzeichnis outputs bleiben historische Snapshots. Die bisherigen Pakete LUVIA_Planstand_2026-09-04 und LUVIA_B1_Planstand_2026-09-04 bilden frühere Abnahmen ab und sind keine aktuelle .46-Lesefassung. Neue Word-Ausgaben werden aus den synchronisierten Markdown-Quellen mit scripts/export-masterplan-docx.py erzeugt und separat visuell geprüft.

Die Vollständigkeitsprüfung vergleicht alle 50 Pakete, technischen Umfänge, Statusbelege und nächsten Abschlussnachweise zwischen JSON, Statusplan und Master. 16 Archivquellen sind per Hash geprüft. Die Werte 210/210 und 18/18 sind ausdrücklich frühere .37-Runtime-Belege; es wurde keine neue volle Runtime-Regression für reine Dokumentänderungen behauptet.

Pflege: zuerst Fakten, currentWork und betroffene Pakete in status-plan.v1.json aktualisieren; anschließend `node scripts/sync-planning-status.cjs --write` und `node tests/planning-current-status.test.cjs` ausführen. Die 16 aktiven Einstiege erhalten denselben aktuellen Stand und genau einen nächsten Schritt. Auch umgebende Texte auf veraltete Aussagen prüfen. Neue Exporte verwenden diese Quellen; bestehende datierte Ausgaben und Archive bleiben historisch. Jeder Fortschrittsbericht nennt Stand, Ergebnis, offenen Umfang und nächsten Schritt.
