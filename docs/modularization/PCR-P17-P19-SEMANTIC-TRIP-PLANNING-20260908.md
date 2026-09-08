# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

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

Stand: 8. September 2026. Status: **TEILWEISE**. Integration: App **13.82.168.156**, Core **4.82.275**, Worker **134479df-b026-48ad-b6eb-e7b1fa02a363**, Quelle **16f295d24e6339833788b257e816840900ba36fd**. Main und Production blieben unverändert.

## Geliefert

- Ein nutzergebundener 24-Stunden-Workflow speichert Wunschdeutung, Kandidaten, Mehrtagesentwurf, gezielte Tagesreparatur und unabhängigen Audit als fortsetzbare Phasen.
- Pro Workflow und Fähigkeit existiert höchstens ein aktiver Modellauftrag. Acht Aufrufe und 180.000 Tokens bilden den sicheren Rechenrahmen.
- Große Kandidatenmengen werden nicht in jeden Checkpoint kopiert. Checkpoint-Deltas bleiben unter der Edge-Grenze.
- Der bestätigte semantische Reiseauftrag wird vor der Places-Suche wieder in den Composerzustand projiziert. Kategorien wie Shopping, Nachtleben, Wasser, Ernährung, Mobilität und Zugang werden nicht durch lokale Profilgrundwerte ersetzt.
- Gewünschte Kategorien ohne Coverage-Zeile werden erkannt. Eine ergänzende Kategorienachversorgung wird vor ihrem Start markiert, auf 50 Sekunden begrenzt und nach Reload nicht erneut gestartet.
- Ungültige Zeiten, Dauern, unbekannte oder doppelte Places, Überschneidungen und zu dünne Tage werden als datierte Vertragsprobleme erfasst. Gültige Tage bleiben erhalten.
- Teilweise gelieferte Mehrtagesreparaturen werden übernommen. Nur noch fehlende Tage werden erneut angefordert.
- Ein fehlender aktueller Wetter-, Preis-, Öffnungs-, Routen-, Verfügbarkeits- oder Buchungsbeleg bleibt sichtbare Unsicherheit und erzwingt keine sinnlose Neugenerierung.
- Reiseversprechen, bewusster Freiraum, reiseweite Tagesbalance, Unsicherheitskarte, Buchungsreihenfolge, Unterkunftsradius und Plan-B-Orte liegen im strukturierten Vertrag. Die Übernahme schreibt erst nach der abschließenden Bestätigung in die Domain-Owner.

## Reale Integrationsergebnisse

Der frische freie Auftrag „Meer, Juni 2027, Ausland, keine langen Flüge, Shopping, Nachtleben, Restaurants, sieben Tage, Abflug Münster, bewusste Pausen“ erzeugte fünf unterscheidbare und nachvollziehbar begründete Richtungen: Palma, Málaga, Valencia, Nizza und Split. „Fünf neue Vorschläge“ war verfügbar. Nach Valencia erschienen drei konkrete siebentägige Juni-Fenster; die Auswahl startete direkt den vollständigen Plan ohne erneute Wunscheingabe oder zusätzliche Planbestätigung.

Der vollständige positive End-to-End-Nachweis ist noch nicht erbracht. Der erste frische Entwurf erhielt sechs Tage und ließ Tag 4 unvollständig. Die neue Teilreparatur bewahrte den übrigen Entwurf und benannte ausschließlich Tag 4. Bei einer weiteren Wiederaufnahme geriet die ergänzende Kategorienachversorgung zunächst in einen langen Providerlauf. App .156 begrenzt und entdoppelt diesen Lauf. Danach zeigte der reale Auftrag einen `AI_JOB_IDEMPOTENCY_CONFLICT`: dieselbe clientseitige Job-ID traf serverseitig auf einen abweichenden Eingabefingerabdruck. Dieser Fehler ist der nächste konkrete P19-Blocker. P17 und P19 sind deshalb nicht abgeschlossen und der Composer ist noch nicht für eine verlässliche Livefreigabe bereit.

Ein früherer Messlauf benötigte fünf Modellaufrufe, 109.594 Eingabetokens, 16.750 Ausgabetokens, 1.212 Cachetokens und 209.263 ms Modelllatenz. Die Kosten liegen mit den Preisen vom 8. September 2026 je nach Modellverteilung zwischen etwa 0,042 und 0,769 USD. Details und Break-even-Szenarien stehen in `docs/planning/LUVIA-AI-UNIT-ECONOMICS-2026-09-08.md`.

## Prüfungen und Releasebeleg

- Safe Regression: **240/240**.
- Composer: **116** Verhaltens-, Recovery-, Vertrags-, Kategorie- und Receipt-Prüfungen.
- P19-Workflowvertrag: **44/44**.
- Visuelles Inventar: 3.548 Dateien, 993 visuelle Kandidaten, 65 CSS-Dateien.
- Öffentliches Releasearchiv: `outputs/release156-20260908-123621.zip`, 92.572.966 Bytes, SHA-256 `9A4B7870C5B7D4B1DBCBC147AE0E6CB72052CC6D262B87E586A9CA188EA15284`.
- Acht releasekritische Dateien stimmen auf Stable und dem unveränderlichen Worker bytegenau mit dem sauberen Archiv überein: **16/16**.

## Noch offen

1. Den Job-Fingerabdruckkonflikt zwischen clientseitiger kanonischer Job-ID und serverseitig tatsächlich übertragenem Payload beseitigen und mit veränderter Kandidatenabdeckung reproduzierbar prüfen.
2. Den Valencia-Auftrag ohne Wiederholung erfolgreicher Phasen bis zu Reiseversprechen, sieben vollständigen Tagen, unabhängiger Freigabe und sichtbarer Gesamtreise positiv abschließen.
3. Danach einen deutlich anderen Familien-/Ferienfall mit Altersrhythmus, Ferienbeleg, Pausen und anderen Kategorien positiv abschließen.
4. Kontoübernahme, Timeline-/Places-Owner-Receipts, Archiv/Wiederherstellung und physische iOS-/Android-Abnahme schließen.
5. Produktive datierte Wetter-, Öffnungs-, Routen-, Event-, Preis-, Unterkunfts- und Buchbarkeitsbelege anbinden und ihre Invalidierung in der Unsicherheitskarte prüfen.
6. Konfliktmoderator und Ablehnungsdiagnose auf denselben gezielten Teilreparaturpfad setzen.

## Sieben verbindliche Composer-USPs

Reise-DNA und die als „Bisherige Auswahl“ verständlich bezeichnete Composer-Zeitreise sind umgesetzt. Kontextwellen, Reise-Schatten, Ziel-Zwillinge und Luvia Pulse bleiben in P19/P20/P22/P23/P26 beziehungsweise P33–P35 offen. Das Gruppen-Sternbild benötigt die bestätigte Collaboration-, Rollen- und Zustimmungsgrundlage aus M18 und ist ebenfalls offen. Diese sieben Punkte bleiben verbindlich; der aktuelle P19-Blocker ersetzt oder streicht keinen davon.

## Nächster Schritt

Als genau nächster Schritt wird `AI_JOB_IDEMPOTENCY_CONFLICT` mit einem gemeinsamen kanonischen Client-/Server-Fingerabdruck behoben und derselbe frische Valencia-Workflow bis zur Review-Freigabe wiederholt. Erst dieser positive Nachweis erlaubt den zweiten Familien-/Ferienlauf.
