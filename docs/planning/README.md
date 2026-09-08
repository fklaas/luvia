# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.170**, Core **4.82.289**. P17/P19 aktiv und teilweise: App .169 / Core .288 und Intelligence v52 / 4.40.2 sind öffentlich auf Integration. App .170 / Core .289 mit Integration-Intelligence 4.41.0 ist der geprüfte lokale Kandidat. Er ergänzt fehlende Places genau einmal, begrenzt jeden OpenAI-Schritt serverseitig, reduziert die strukturierten Ausgabelimits, zeigt fünf reale Planungsphasen mit Laufzeit und nimmt denselben Auftrag nach Offline, Sperrbildschirm oder Tab-Wechsel wieder auf. Integration erhält dafür einen eigenen Edge-Function-Einstieg; Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag, Richtung A, Kategorienfarben, Kartenkopplung, räumliche Streuung, harte Interessenabdeckung, Tagesbalance, Freiraum, Unsicherheitskarte und Buchungsreihenfolge bleiben erhalten. .170 übernimmt zusätzlich einen lokal oder serverseitig vorhandenen Places-Katalog und führt bei knapper Kandidatenzahl genau eine checkpointete fokussierte Nachfüllung aus. Die vollständige KI-Planung zeigt Wünsche verstehen, passende Places finden, alle Tage komponieren, unabhängigen Audit und gezielte Verbesserung als echte Zustände mit laufender Zeit. Offline startet keine KI-Arbeit; Vordergrund und Page-Restore lesen denselben Workflow, dieselbe semantische Generation und dieselbe Idempotenz-ID. Fehlgeschlagene Jobs werden nicht mehr still erneut bezahlt. OpenAI-Aufrufe enden je nach Fähigkeit nach 28 bis 65 Sekunden mit einem sichtbaren Fehler, verwaiste Jobs werden nach 90 Sekunden abgeglichen. Die Tokenobergrenzen sinken auf 4.000 für den Reiseauftrag, 9.000 für den Gesamtplan, 4.500 für eine Tagesreparatur und 3.500 für den Audit.

**Nächster Schritt (AKTIV): App .170 und die getrennte Integration-Intelligence veröffentlichen und den vollständigen mobilen Plan öffentlich abnehmen.** Der letzte öffentliche Lauf nutzte noch .169 und konnte einen hängenden Modellaufruf mit spätem Lease-Recovery und stiller Fehljob-Wiederholung über mehrere Minuten ziehen. Der neue Kandidat beseitigt diese Ursache und hält gleichzeitig die fokussierte Places-Nachfüllung für den 20-von-22-Blocker bereit.

**Abnahme dieses Schritts:**

- App .170 / Core .289 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration ruft die separat veröffentlichte Function luvia-intelligence-integration mit Health 4.41.0 auf; die produktive Function luvia-intelligence und Main/Production bleiben unverändert.
- Die Warteansicht zeigt fünf verständliche reale Arbeitsphasen, verstrichene Zeit, ungewöhnlich lange Dauer, Offline-Zustand und den Abgleich nach Sperrbildschirm oder App-Wechsel.
- Vordergrund, Page-Restore und Netzrückkehr verwenden denselben Workflow und dieselbe Idempotenz-ID; ein fehlgeschlagener bezahlter Job wird ohne sichtbaren Nutzer-Neuversuch nicht erneut ausgeführt.
- Ein OpenAI-Hänger endet serverseitig nach höchstens 65 Sekunden pro Planungsfähigkeit; ein verwaister Job wird nach 90 statt 240 Sekunden wieder lesbar oder gezielt wiederaufgenommen.
- Der öffentliche vollständige Reiseplan erreicht den ungespeicherten Review oder zeigt innerhalb des begrenzten Ablaufs einen konkreten sichtbaren Fehler; eine zehnminütige stumme Wartephase ist ausgeschlossen.
- Der bisherige 20-von-22-Places-Fall übernimmt den vorhandenen Katalog und führt höchstens eine fokussierte Nachfüllung aus, bevor Plan und Schlussaudit starten.
- Tagespunkt und echter Places-Pin fokussieren sich gegenseitig; Kategorien behalten Compass-Farben und der aktive Eintrag zeigt den vollständigen Luvia-Spektrumrahmen.

**Danach:** Nach dem öffentlichen mobilen Positivlauf folgen autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung, danach die Abnahme von räumlicher Streuung, Strandabdeckung und Kategorienmix. Anschließend werden P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache sowie die modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .170 samt getrennter Integration-Intelligence öffentlich beweisen, reale Laufzeiten messen und den Gesamtplan bis zum ungespeicherten Review führen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
