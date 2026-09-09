# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.187**, Core **4.82.306**. P17/P19 Priorität: verlässliche vollständige KI-Reise. Kandidat App 13.82.168.188 / Core 4.82.307 / Integration-Intelligence 4.43.3 ergänzt Alternativen separat und erhält bereits gültige Tagesrouten.

**Zuletzt geliefert:** Integration .187 / c08f7cb5: 241/241 Regression und 22/22 öffentliche Bytevergleiche. Frischer öffentlicher Auftrag 15138a8c-8549-40e8-a0c0-5ba3cf258bf8: 72 Kandidaten aus elf Gebieten, drei echte Hafenorte, räumliche Konzentration 36,1 Prozent; echter KI-Audit bestätigt Strand, Hafen, Altstadt, Shopping und Nachtleben. Drei modellierte Backups waren bereits im Hauptplan verwendet und wurden korrekt verworfen. Eine dadurch ausgelöste unnötige Gesamtneukomposition erzeugte neue Tagesfehler. Kandidat .188 ergänzt stattdessen nur die fehlenden Begleitangaben per KI; bereits gültige Tage bleiben unveränderlich.

**Nächster Schritt (AKTIV): Den korrigierten öffentlichen KI-Reisepfad inklusive Reserveaktionen inhaltlich abnehmen.** Ein echter unabhängiger Review ist erreicht; die darin gefundenen Recherche- und Freiraummängel müssen in einem neuen tatsächlichen Lauf behoben sein.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Kandidat .188 öffentlich bis zur tatsächlich nutzbaren Tagesroute und Reserveaktion abnehmen. Physische Geräte, übrige P17/P19-Gates und datierte Livebelege bleiben offen.

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


### 09.09.2026 – konkrete Wunschorte vor der Komposition recherchieren

Der echte .185-Audit deckt eine fehlende Hafenidentität im bisherigen Valencia-Pool auf. Das ist eine Recherche-, keine weitere Kompositionsaufgabe. Intelligence leitet nun über den vorhandenen discovery.plan-Vertrag bis zu drei spezifische Zusatzsuchen aus dem semantischen Auftrag ab; zulässige Typen kommen aus places.v1.categories. Places führt sie über recommend mit expliziten includedTypes, Bewegungsradius und denselben harten Präferenzen aus. Diese Suche läuft parallel zur allgemeinen Poolrecherche. Echte Treffer ergänzen die dauerhafte Reserve, bleiben als gezielte Suchtreffer beim Modellshortlisting berücksichtigt, und Suchabdeckung geht in die Poolqualität ein. Der Audit erhält auch den belegten primaryType. Es gibt keine fest codierte Hafenlösung und keinen erfundenen Ersatzort. Kontrolliert 72/72 Transport-/Abschnitts-/Suchprüfungen; der öffentliche Review steht bis zum tatsächlichen Positivnachweis aus.


### 09.09.2026 – echter Review und konkrete Inhaltskorrekturen

Integration .186 erreicht im echten Workflow 60c3cf17-5123-4f96-8341-fddd9038c2b6 ready_for_review mit 69 Kandidaten, sieben Tagen und 62/100. Die letzten zwei Modellschritte brauchen zusammen 32.212 ms; das ist keine Messung des gesamten kalten Nutzerablaufs. Der Audit benennt fehlende Hafenabdeckung, offene vegetarische Eignung und überlappende Freiraumzeiten. Kandidat .187 trennt modellgenerierte Suchhypothesen vom harten Ortsnamen-Textfilter, erneuert ältere Zusatzsuchen durch Suchversion 2 und erhält deren Status im fertigen Entwurf. Spezifische Wünsche ohne eindeutige Grobkategorie werden nicht künstlich der Kategorie Aktivitäten zugeordnet. Freiraum wird gegen tatsächliche Besuchszeiten und bereits berücksichtigte Pausen geschnitten; unbelegte Zeiten entstehen nicht. 74/74 Transport-/Abschnittsprüfungen einschließlich Überschneidungsgegenprobe und Suchmigration, 133 Composer und 99/99 Workflow-Prüfungen sind grün. Ein neuer öffentlicher Inhalts- und Reserveaktionsnachweis bleibt der nächste Schritt.


### 09.09.2026 – Begleitkorrekturen bewahren gültige Tagesrouten

Der frische .187-Lauf liefert 72 Places aus elf Gebieten, darunter drei Hafenorte. Der echte Audit bestätigt sämtliche gewünschten Erlebnisbereiche. Alle drei vom Modell genannten Backup-Orte waren aber bereits im Hauptplan eingeplant und wurden korrekt verworfen. Die bislang anschließende Gesamtneukomposition war unnötig und erzeugte neue Lücken. Kandidat .188 ergänzt fehlende Begleitangaben durch einen kompakten echten KI-Auftrag mit fixierten Tagen und ausschließlich ungenutzten Backup-Kandidaten. Selbst vom Modell gelieferte geänderte Tage werden in diesem Pfad nicht übernommen. Backup-Bezüge werden auch gegen ihren konkreten Tag validiert. Explizites Nachtleben erweitert einen nicht vom Nutzer gesetzten Abendrahmen bis 23:59; gesetzte Grenzen bleiben bindend. Belegte Ernährungs-/Zugänglichkeitsfelder und Typen erreichen nun auch den Audit. Tests 109/109 inklusive aller fünf Reserveaktionen und Wiederherstellung ihrer Auswahl, Support-Unveränderlichkeit sowie früher expliziter Abendgrenze. Nur Integration wird veröffentlicht; tatsächliche Freigabe bleibt an den öffentlichen Positivlauf gebunden.
