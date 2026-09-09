# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.184**, Core **4.82.303**. P17/P19 Priorität: verlässliche vollständige KI-Reise. Kandidat App 13.82.168.185 / Core 4.82.304 ergänzt die fachlich korrekte Tagesabdeckung für lange Strand-/Aktivitätsaufenthalte und automatische gezielte Korrekturen nach kompletter Wiederholung.

**Zuletzt geliefert:** Integration .182: Quelle COMMIT_569e642836f25b1e02c439472c4d4ef65a6d531f, Worker 1fbf6e16-b328-44bb-9284-5413383e6b17, Archiv 92.650.447 Bytes / SHA256 8E60A0A356EBF564E35B34CA67BDEE67670EDC6221FFE15CCDC8D2C9ADBAE540 und 22/22 öffentliche Bytevergleiche. 241/241 Regression, NFR-0 3/3, Composer 133, P19 99/99 und 51/51 Transport-/Abschnittsprüfungen bestanden. Echter Providerbeleg: planning.dialogue erfolgreich in 16.203 ms; trip.compose und Reparaturen liefen real. Der letzte Audit blockierte fehlende gültige Backup-Referenzen. Ein bis zwei abweichende Zeichen in echten 113- bis 125-stelligen Provider-IDs sind als Ursache belegt. Der neue Referenzpfad ist mit 60/60 Transport-/Abschnittsprüfungen und 133 Composer-Prüfungen geprüft; sein öffentlicher Review folgt noch.

**Nächster Schritt (AKTIV): Den korrigierten KI-Reisepfad auf Integration bis zum echten Gesamtreview belegen.** Die tatsächliche Transportstrecke war bisher nicht durch die Composer-Mocks abgesichert. Jetzt muss der reale Providerlauf die lokale Korrektur bestätigen.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Öffentlichen Gesamtreview mit kurzen Modellreferenzen und tatsächlich akzeptierten Reserveoptionen abschließen. Sehr lange Reisen und App-Wechsel sind kontrolliert geprüft; die physische iOS-/Android-Abnahme bleibt gesondert offen. Übrige P17/P19-Abnahmen und datierte Livebelege bleiben im Plan.

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

## Erweiterung 2026-09-09: vollständiger Reservepool und begrenzte Komposition

Der Nutzer priorisiert die funktionierende vollständige KI-Reise, kurze nachvollziehbare Wartezeit und Wiederaufnahme. Die Prüfung der tatsächlichen Übergaben findet generische Array-Kürzungen auf 50/60 Elemente und doppelten Reisekontext. Die vorhandenen Composer-Mocks deckten diese Transportstrecke nicht ab. Die öffentliche Freigabe bleibt bis zum echten Review offen.

Intelligence bleibt Eigentümer der vorläufigen Workflows, Modellaufträge und Prüfungen; Places liefert verifizierte Ortsidentitäten, Trip/Journey bleiben alleinige Eigentümer bestätigter Reisen. Die öffentlichen bestehenden Adapter werden additiv erweitert: vollständige begrenzte Workflow-Payloads, kompakte abschnittsweise Modelleingaben, persistierte Abschnitte, messbare Poolabdeckung und Reservevorschläge. Generische Sanitizer anderer Module bleiben unverändert. Keine Domain-Mutation und keine neue Datenbanktabelle sind erforderlich.

Betroffen sind Composer, Intelligence-Adapter/Core, AI-Transport/Context/Policy sowie die Integration-Edge-Implementierung. Prüfungen umfassen echte serialisierte Client-/Server-Payloads für 14/21/28 Tage, Kategorien und Gebiete, Abschnittswiederaufnahme, unveränderte Nachbartage, sichtbare Fehler samt Request-ID, öffentliche Providerdiagnose und vollständigen Review. Nur Integration wird veröffentlicht; Production bleibt unberührt. Rollback erfolgt auf den vorherigen Integration-Worker und die vorherige Integration-Function. Bestandsworkflows bleiben lesbar; neue Payload-Fingerabdrücke werden versioniert.

## Nächster Schritt

Der aktuelle nächste Schritt steht im synchronisierten Statusplan: den vollständigen öffentlichen Gesamtreview und echte Reserveaktionen nach den Transport-, Referenz-, Laufzeit- und Tagesabdeckungsfixes belegen. Der frühere Idempotenzfehler ist bereits behoben.


### 09.09.2026 – messbarer Provider-Timeout und schnelle Gesamtkomposition

Öffentlicher .183-Wiederaufnahmelauf: Job 287a467c-5a27-48a7-9669-ee516e47f0f4 endet bei OpenAI mit OPENAI_TIMEOUT nach 50.006 ms, Modell gpt-5.6-sol. Pool und Fehler bleiben erhalten; kein Guthabenfehler. Ganze Abschnitte einschließlich globaler Wiederholungen nutzen deshalb die schnelle Luna-Lane. Terra bleibt unabhängiger Audit und erste Tagesreparatur; Sol bleibt auf gezielte Tagesreparaturen begrenzt. Keine Validierung, harte Vorgabe oder unabhängige Prüfung wird entfernt. Kurze exakte Ortsreferenzen aus .183 bleiben aktiv. Technische Timeouttexte erscheinen nur in Fehlerdetails. Der neue öffentliche Positivlauf ist noch zu belegen.


### 09.09.2026 – bewusster langer Aufenthalt statt starrer Stationsanzahl

Die echte Luna-Komposition benötigte 30.088 ms und lieferte sieben Tage sowie drei gültige Backups. Tag 3 umfasste 180 Minuten Platja del Cabanyal, einen zweiten 60-Minuten-Ort und ausdrückliche freie Strandzeit. Die bisherige Zählregel wies diesen erfüllten Strandwunsch wegen nur zwei Stationen ab. Tagespolicies erlauben daher eine explizite, vom Modell und unabhängigen Audit gemeinsam verwendete Alternative: mindestens ein 180-Minuten-Anker, höchstens eine Station unter dem normalen Minimum, ausreichende geplante Gesamtdauer und mindestens 90 Minuten benannter, nicht mit Besuchen überlappender Freiraum. Kurze unzureichende Tage bleiben abgewiesen. Vollständige Wiederholungen erhalten innerhalb ihres begrenzten Laufs Raum für anschließende Tageskorrekturen statt eines weiteren manuellen Retry-Klicks. 69/69 Transport-/Abschnittsprüfungen, einschließlich Gegenprobe für zu kurze Besuche und Wiederholung mit tatsächlicher Tagesreparatur, sind grün.
