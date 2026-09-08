# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

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
