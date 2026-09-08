# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.168**, Core **4.82.287**. P17/P19 aktiv und teilweise: App .167 / Core .286 ist öffentlich auf Integration; Intelligence v52 / 4.40.2 bleibt aktiv. Die gewählte Richtung A ist dort als kompakte Tagesroute mit echter Places-Karte, Kategorie-Farben und beidseitigem Pin-Fokus ausgeliefert. Der reale Familien-/Ferienlauf erzeugte fünf echte Richtungen und erreichte nach Ziel- und Datumswahl die Reparaturphase, überschritt dort aber den sicheren Rechenrahmen. App .168 / Core .287 ist der lokale Kandidat, der mehrere offene Tage in einem ganzheitlichen Reparaturlauf ausbalanciert. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag trennt Entscheidungen vor dem Plan, sichtbare änderbare Luvia-Annahmen und erst nach dem Entwurf zu belegende Livefakten. .164 priorisiert ausdrückliche Place-Wünsche und parallele Kategorien, .166 bewahrt beim manuellen Neustart bestätigten Reiseauftrag, echte Places, gültige Tage und exakte Reparaturdaten. .167 liefert Richtung A produktiv: kompakte Tagesroute, bewusster Freiraum, gegenseitiger Tagespunkt-/Pin-Fokus, fokussierte Kamerafahrt und feste Kategorienfarben aus dem zwölfstufigen Luvia-Kompass; der aktive Ort besitzt einen dezenten vollständigen Spektrumrahmen. Gründe, Bearbeitung und Plan B liegen am Ort auf Abruf, Reiseauftrag, Audit und technische Planungsdiagnosen wurden aus der Tagesroute entfernt. .168 ersetzt die teure Folge aus mehreren Ein-Tages-Reparaturen: Genau ein fehlerhafter Tag bleibt isoliert, mehrere beanstandete Tage werden in einem einzigen vollständigen KI-Lauf mit demselben Reiseauftrag und Kandidatenkatalog neu komponiert und anschließend unabhängig auditiert.

**Nächster Schritt (AKTIV): Mehrtagreparatur veröffentlichen und Familien-/Ferienplan bis zum ungespeicherten Review abschließen.** Der echte Den-Haag-Lauf hat Inspiration, Zielwahl, Zeitraum und Places-Recherche erfolgreich durchlaufen, aber in der Mehrtagreparatur das Workflowbudget ausgeschöpft. Der begrenzte Reparaturpfad ist lokal korrigiert und muss jetzt auf Integration beweisen, dass derselbe anspruchsvolle Auftrag den vollständigen Review erreicht.

**Abnahme dieses Schritts:**

- App .168 / Core .287 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind byteidentisch.
- Der freie deutsche Reiseauftrag enthält Kinder mit Altersangaben, Schleswig-Holstein als Schulregion, einen groben Zeitraum, widersprüchliche Wünsche, gewünschten Strand-/Meeresanteil und mehrere Place-Kategorien.
- Mehrere Auditblocker lösen genau einen gemeinsamen Reparaturentwurf aus; ein einzelner Auditblocker repariert weiterhin nur seinen Tag. Kein automatischer kostenpflichtiger Lauf überschreitet den festen Workflowrahmen.
- Der gewählte Zeitraum erzeugt einen vollständigen Plan für alle Tage über mehrere sinnvolle Stadt-/Küstengebiete; Meer/Strand und bestätigte Kategorien sind abgedeckt, höchstens zwei intensive Tage folgen aufeinander und Freiraum ist bewusst benannt.
- Tagespunkt und echter Places-Pin fokussieren sich gegenseitig; Kategorien behalten ihre Compass-Farbe und der aktive Eintrag zeigt den vollständigen Luvia-Spektrumrahmen.
- Fehlende automatische, autoritativ belegte Ferienfenster werden als eigener verbleibender P17-Datumsbaustein ausgewiesen und nicht als bereits gelöst behauptet.

**Danach:** Nach dem positiven ungespeicherten Gesamtplan folgen die autoritativen Ferienfenster und semantische Konfliktmoderation vor der Planung, dann räumliche Streuung, Strandabdeckung und Kategorienmix im Plan. Anschließend werden P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache sowie die modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .168 öffentlich beweisen und den Familien-/Ferien-/Konfliktlauf bis zum ungespeicherten Review abschließen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung, Kategorienmix, Latenz und Kosten messen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
