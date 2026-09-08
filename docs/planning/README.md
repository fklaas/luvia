# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.156**, Core **4.82.275**. P17/P19 aktiv und teilweise: App .156 / Core .275 und Intelligence v48 / 4.39.0 laufen auf Integration. Der reale Valencia-Auftrag belegt fünf semantische Richtungen, drei Zeitfenster, direkten Gesamtplanstart und tageweise Fehlerisolation. Der vollständige positive Entwurf ist noch durch einen Job-Fingerabdruckkonflikt blockiert. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Fortsetzbarer 24-Stunden-Reiseauftrag, ein aktiver Job je Fähigkeit, 8-Aufruf-/180.000-Token-Rahmen, inkrementelle Checkpoints, serverseitig erhaltene Reisebrief-Projektion, gezielte Kategorienachversorgung, datierte Tagesreparatur, Erhalt gültiger und teilweise reparierter Tage sowie evidenzbewusster Audit sind auf Integration aktiv. Der freie reale Wunsch erzeugte Palma, Málaga, Valencia, Nizza und Split, bot fünf neue Vorschläge, leitete drei Juni-Fenster ab und startete nach Zeitwahl ohne zusätzlichen Wunschschritt. 240/240 Regression und 16/16 öffentliche Byteidentität sind belegt.

**Nächster Schritt (AKTIV): Job-Fingerabdruck vereinheitlichen und Valencia bis zur Review-Freigabe abschließen.** Der reale Gesamtplan bewahrt inzwischen gültige Tage und begrenzt Provider-Nachversorgung. Die nächste konkrete Blockade ist ein reproduzierter AI_JOB_IDEMPOTENCY_CONFLICT zwischen clientseitiger Job-ID und serverseitig übertragener Eingabe.

**Abnahme dieses Schritts:**

- Client und Server bilden die Job-Identität aus exakt derselben kanonischen, tatsächlich übertragenen Eingabe; Änderungen an Kandidaten oder Reparaturtagen erzeugen eine neue Job-ID, identische Wiederaufnahmen verwenden dieselbe.
- Eine fehlende oder leere Kategorien-Coverage wird höchstens einmal nachversorgt; Reload startet keinen zweiten Providerlauf und vorhandene Kandidaten bleiben erhalten.
- Der frische Valencia-Auftrag 12.–18.06.2027 endet mit Reiseversprechen, sieben vollständigen Tagen, kontextuellen Zeiten, Freiraum, Tagesbalance, Unsicherheiten, Buchungsreihenfolge, Unterkunftsradius und Audit-Freigabe.
- Modell, Token, Kosten, Phasenlatenz und Reparaturzahl werden für den positiven Lauf aus der serverseitigen Telemetrie dokumentiert.

**Danach:** Nach dem positiven Valencia-Lauf folgt als zweiter P17/P19-Nachweis der Familien-/Ferienfall. Danach werden Konfliktmoderator und semantische Ablehnungsdiagnose auf den Teilreparaturpfad gesetzt; anschließend schließen P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert die gemeinsame Produktsprache ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: Job-Fingerabdruck, zwei reale Positivläufe, gemessene Kosten/Latenz, Konto- und Timeline-Übernahme, physische Geräte sowie datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. P16: Konfliktmoderator und Ablehnungsdiagnose. Reise-DNA und Bisherige Auswahl/Zeitreise sind umgesetzt; Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen. P02/P03, P07/P08 und P09–P12 behalten ihre dokumentierten Provider- und Gerätegates.

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
