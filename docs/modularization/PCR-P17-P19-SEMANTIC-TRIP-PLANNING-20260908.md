# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.175**, Core **4.82.294**. P17/P19 aktiv und teilweise: App .175 / Core .294 ist lokal implementiert und mit 131 Composer-, 93/93 P19-, 240/240 Safe-Regression- sowie NFR-0 3/3-Prüfungen vollständig grün. Integration-Intelligence 4.42.1 ist öffentlich und führte den echten Valencia-Auftrag bis zu den Datumsvorschlägen; App .174 blieb danach mehr als 5:44 Minuten in der seriellen Places-Recherche. .175 begrenzt diese Recherche auf ein gemeinsames 44-Sekunden-Budget und beseitigt die künstliche Kappung am Zielwert. Main, Production und produktive Intelligence bleiben unverändert.

**Zuletzt geliefert:** Für Valencia und andere große Ziele sind 42/84/126 Kandidaten für 7/14/21 Tage nun Mindestziele. Liefert die Recherche mehr, bleiben bis zu 160 eindeutige Kandidaten in der Sitzung erhalten. Das ist eine technische Arbeitssicherheitsgrenze und keine Behauptung über den Gesamtbestand einer Stadt. Die kostenrelevante KI-Komposition bleibt getrennt auf 32/60/92 räumlich und fachlich priorisierte Kandidaten begrenzt. Im Review stehen die Zahl der eingeplanten Reisemomente und die Zahl der geprüften Places sichtbar nebeneinander. Die Places-Recherche arbeitet mit einer gemeinsamen 44-Sekunden-Frist, schneller Geoapify-Breite und Auto-Provider nur bei einer fehlenden ausdrücklich gewünschten Kategorie.

**Nächster Schritt (AKTIV): App .175 vollständig prüfen, nur auf Integration veröffentlichen und Valencia bis zum terminalen Ergebnis vermessen.** Der reale Auftrag erreicht mit Intelligence 4.42.1 die Places-Phase, blieb in App .174 dort aber länger als 5:44 Minuten. .175 muss öffentlich beweisen, dass der größere, nicht am Zielwert abgeschnittene Kandidatenpool innerhalb der gemeinsamen Recherchefrist in Komposition oder einen konkreten terminalen Fehler übergeht.

**Abnahme dieses Schritts:**

- App .175 / Core .294 besteht vollständige Safe Regression, NFR-0 und alle fokussierten Composer-/P19-Gates.
- Nur Integration wird veröffentlicht; Main, Production und produktive Intelligence bleiben unverändert.
- Stable und immutable Integration liefern die geprüften Release-Dateien byteidentisch aus.
- Der frische Valencia-Auftrag verlässt die Places-Recherche innerhalb des gemeinsamen 44-Sekunden-Budgets zuzüglich Abschluss-Checkpoint oder zeigt einen konkreten terminalen Fehler statt endlos weiterzulaufen.
- Der Sieben-Tage-Lauf recherchiert deutlich mehr als 21 eindeutige Kandidaten oder benennt eine echte Provider-Unterdeckung; ein ergiebiger Pool wird nicht bei 42 abgeschnitten.
- Meer/Strand, Shopping, Nachtleben und Essen werden als ausdrückliche Wünsche priorisiert; acht Grundkategorien und räumliche Sektoren bleiben im Recherchevertrag.
- Der Review unterscheidet sichtbar zwischen eingeplanten Reisemomenten und geprüften Places und erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler.

**Danach:** Nach dem öffentlichen Valencia-Nachweis werden räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abgenommen und der große Pool als gezielte Tausch-, Ergänzungs- und Spontanreserve nutzbar gemacht. Danach folgen autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte. M17 friert die gemeinsame Produktsprache und modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .175 öffentlich bis zum Review oder konkreten terminalen Fehler vermessen; räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen; den erhaltenen Kandidatenpool für Tausch- und Ergänzungsvorschläge öffnen; lange 14-/21-Tage-Pläne öffentlich prüfen. Automatische autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
