# P17/P19 – Semantische Reiseplanung und fortsetzbarer KI-Auftrag

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.196**, Core **4.82.315**. P17/P19: A2 auf Integration .196; benannte Zielsuche öffentlich belegt, Aktivitätsquellen und vollständige Erlebnisqualität weiter offen.

**Zuletzt geliefert:** Integration .196 / Core 4.82.315 aus a70ad775 veröffentlicht. Vollständige kontrollierte Regression 243/243 PASS; 27/27 öffentliche Dateien auf Stable und Immutable byteidentisch. Benannte Ortsuchen behalten targetName bis zum Provider und im dauerhaften Pool; Freizeit-/Sport-Elternkategorien, Parks und Sportgeschäfte gelten nicht mehr allein als Aktivitätsbeleg. Öffentliche Namensprobe findet La Lonja de la Seda über TomTom nach leerem Geoapify-Ergebnis in 953 ms. Öffentliche Escape-Room-Probe bleibt ohne Treffer: Geoapify-Transportfehler, OSM-Cooldown, TomTom leer, HERE-Anfragefehler. Dies ist kein positiver Gesamtplan-Nachweis. Der bisherige .195-Entwurf mit sieben Tagen/18 Momenten ist nach öffentlichem Reload weiter vorhanden; seine Inhalte werden nicht als neu verbessert ausgegeben. Kein weiterer kostenpflichtiger Gesamtplan in diesem Slice.

**Nächster Schritt (AKTIV): Aktivitätsquellen bis zum echten passenden Treffer schließen.** Die benannte Zielsuche ist öffentlich korrigiert. Die Aktivitätsprobe fällt noch auf Providertransport und unzureichende Ersatz-Taxonomien zurück; ein weiterer Gesamtplan würde diese Datenlücke nur erneut verarbeiten.

**Abnahme dieses Schritts:**

- Den Geoapify-Transportfehler und die konkreten Ersatzproviderantworten unterscheiden; vorhandene Budgets und Cooldowns respektieren.
- Tatsächliche benannte Aktivitätsangebote in einem begrenzten öffentlichen Suchlauf nachweisen; keine Parks oder generischen Sportflächen als Ersatz zählen.
- Danach genau einen begrenzten echten Gesamtplan mit Strand/Hafen, lebendigen Abenden, Mitmachwunsch und räumlichem Mix beurteilen; keine Schleife bezahlter Gesamtneugenerierungen.
- P17/P19 erst nach weiteren Familien-/Gruppen-, Übernahme-/Recovery- und Geräte-Gates abschließen.

**Danach:** Nach qualitativer Rechercheabnahme den Familien-/Konfliktfall und die übrigen P17/P19-Gates schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE: Erlebnisrecherche, benannte Ortsidentität, gebietsferne Reserve, Interpretation lebendiger Abende, Familien-/Konfliktfall, breite Kaltstarts, endgültige Konto-/Timeline-Übernahme, Mehrnutzer-Beitritt und physische Geräte.

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


### 09.09.2026 – schneller Datumswechsel übernimmt laufende Auswertung

Öffentlich reproduziert: Der Nutzer bestätigt Termine während planning.dialogue noch läuft. prepareAiBrief akzeptierte sein Ergebnis ausschließlich im Schritt dates, während preview den brief-loading-Zustand als unvorbereiteten Entwurf darstellte. Kandidat .189 nimmt denselben Auftrag in dates und preview an, zeigt dessen echten Fortschritt und setzt Polling sowie Vordergrund-/Reload-Wiederaufnahme dort fort. Der neue kontrollierte Race-Test bestätigt, dass nur eine Wunschauswertung bezahlt wird, ihre verspätete Antwort ankommt und danach der Gesamtreview erreicht wird. 114/114 Transport-/Reserve-/Übergangsprüfungen und 133 Composer sind grün.


### 09.09.2026 – Modellverteilung anhand der echten Fehlversuche

Der .189-Lauf erhält 100 echte Kandidaten aus 21 Gebieten und setzt nach Reload fort, benötigt aber mehrere Luna-Korrekturen und endet im Audit-Timeout. .190 verwendet deshalb Terra für die eigentliche Abschnittskomposition; reine Begleitdetails und Reserveaktionen bleiben Luna. Automatische Tageskorrekturen bleiben auf Terra, Sol ist nur für einen ausdrücklich neu gestarteten einzelnen Problemfall vorgesehen. Der unabhängige Audit bleibt ein separater echter Terra-Aufruf mit denselben Prüffeldern, aber begrenzter Ausgabe von 2500 Tokens ohne zusätzliche Reasoning-Phase und zusammengefassten wesentlichen Hinweisen. Deterministische Identitäts-, Tages-, Zeit-, Überschneidungs- und Vollständigkeitsprüfungen bleiben unverändert. Diese Qualitäts-/Latenzentscheidung ersetzt die frühere pauschale schnelle Lane für jede Komposition.


### 09.09.2026 – Ortsfehler dürfen nicht zu Unsicherheit heruntergestuft werden

Die bisherige narrativ-reguläre Suche nach „nicht belegt“ traf auch einen tatsächlich falschen Altstadt-Ort und setzte dabei sogar promiseAssessment.kept auf wahr. Dieser Pfad ist entfernt. Nur ausdrücklich klassifizierte LIVE_DATA_MISSING-/Live-Fakten-Codes dürfen offen bleiben; das Reiseversprechen bleibt dann ungeprüft, niemals künstlich erfüllt. Echte Orts- und Strukturblocker werden unverändert übernommen. Der Auditkatalog enthält nun auch die in der Buchungsreihenfolge referenzierten tatsächlichen Reserveorte, damit gültige Kandidaten nicht wegen einer verkürzten Projektion fälschlich als unbekannt gelten. Ein gezielter Gegenbeweis mit ALTSTADT_WRONG_PLACE bleibt korrekt gesperrt. 117/117 neue Prüfungen, 133 Composer und 99/99 Workflow grün.


09.09.2026 – Kandidat App 13.82.168.191 / Core 4.82.310: Ein ausdrücklich gewähltes Ziel wird semantisch erkannt, über places.v1 geocodiert und direkt zur Reisezeit geführt. Offene Wünsche behalten fünf Ideen. Komposition und Audit bekommen ursprünglichen Nutzerwunsch, bestätigten Auftrag und sichtbare Annahmen; KI-Suchhypothesen bleiben außerhalb der verbindlichen Anforderungen. Der Audit prüft einen ehrlichen Entwurf und fordert keine erfundenen künftigen Fahrpläne. Tatsächlich fehlende Pflichtinhalte, falsche Places und nachgewiesene Zeitkonflikte bleiben blockierend. Reparaturanweisungen stammen nur aus Blockern. Der reale .190-Lauf lieferte zunächst 7 vollständige Tage aus 90 Kandidaten, wurde aber durch unnötige Auditreparaturen beschädigt: ausdrücklich kein Positivbeleg. 132/132 gezielte Prüfungen belegen die korrigierte Eingabe- und Wiederaufnahmesemantik; öffentliche .191-Abnahme folgt.

09.09.2026 – .192/.193 Ursachenfortsetzung: Relative Budgetstufen stoppen die Planung nicht mehr, konkrete harte Geldgrenzen bleiben streng. Ein unplanbarer gespeicherter Brief wird beim bewussten Retry erneut interpretiert. Echte .192-Recherche erreicht 100 Kandidaten; erster Audit beanstandet räumliche Konzentration. Die anschließende Übergabe offenbarte instabile pN-Aliase und unaufgelöste Referenzen in Modellprosa. .193 verwendet reihenfolgeunabhängige Aliase und ersetzt reine Textreferenzen durch den exakten Place-Namen. Komposition erhält explizite räumliche Zielwerte; keine erfundenen Stadtteilnamen. 139/139 fokussierte Prüfungen. Kein vorweggenommener öffentlicher Positivstatus.

### 09.09.2026: Kreditdiagnose und abhängige Angaben nach Tagesreparatur

Integration .193 (933cf480; Worker 69b4bd25-3de7-40e1-8a37-43cac55cc8a8) ist mit 22/22 Byteprüfungen belegt. Der reale Retry 543c19dc-a559-444b-a83e-94b2666f77b1 endet nach zwei Modellen und 20.621 ms Modellzeit an veralteten Hafenreferenzen in Buchungsreihenfolge und Unsicherheit. .194 erneuert deshalb nach Tagesreparaturen einmal die abhängigen Angaben und erhält die übrigen Tage. Kein Absenken des Audits.

API-Nutzungsabfrage nach Europe/Berlin: 08.09.2026 218 Aufrufe / 4.052.823 Tokens, 09.09. bis zur Abfrage 169 / 2.379.692. Davon heute 82 Dashboard-Briefings / 1.534.592 Tokens. Dies ist Telemetrie, keine Providerrechnung und keine Codex-Kreditmessung. Das globale Journey-Ereignis konnte unsichtbare automatische Briefings anstoßen; .194 erlaubt sie nur am sichtbaren Widget, nutzt fünf Minuten Wiederverwendung und ignoriert reine Graph-Ladeereignisse. Explizite Aktualisierung bleibt möglich. 145/145 Transport- und fünf Dashboard-Verhaltenstests bestehen.

### Öffentliche Abnahme des begrenzten .194-Reparaturschritts

Integration .194 / Core 4.82.313 aus 86084b13 ist unter Worker 87260e5a-f5c3-4437-8a8d-ab7f77818873 veröffentlicht; 22/22 Bytevergleiche zum sauberen Archiv PASS. Echter Workflow 1687ccc4-a24f-47a6-a451-85aa75edc5ca: ready_for_review, sieben Tage, 18 Orte, 100 behaltene Kandidaten, drei Plan-B-Alternativen, separater Audit 88 / Versprechen erfüllt. Wiederanlauf 44,38 Sekunden serverseitig, drei Modellaufrufe / 34.197 ms Modellzeit / 29.968 Tokens. Dies ist die Reparatur eines bestehenden Entwurfs, kein Kaltstart-Benchmark. Echter Reserveaustausch vom Museo Histórico Municipal de Valencia zur Galería de Arte Maika Sánchez und Reload samt vollständigem Pool positiv. Zwei auffällige TomTom-Koordinaten bleiben als Audit-Aufmerksamkeit offen; beim ersten Museum gab es keinen verfügbaren gebietsfernen Ersatz. Keine bestätigte Trip-/Timeline-Übernahme ausgeführt.

Regression: 240/241 im vollständigen kontrollierten Lauf; der verbleibende statische Exporttest nach deklarationsgleicher Korrektur separat PASS, ebenso die Dashboard-Verhaltensprüfung. Transport 145/145, Composer 133 und NFR-0 3/3 PASS. Keine erneute vollständige Suite oder bezahlte Trip-Generierung nach dieser ausreichend eingegrenzten Exportkorrektur.

Nächster Schritt: räumliche Ortsidentität und kategoriespezifische Reservequalität, einschließlich gleicher Nummerierung von Tageskarte und Pin. P17/P19 bleiben teilweise offen.

### 09.09.2026 – Tagesziel Erlebnisqualität und gewählte Richtung A2

Der Nutzer hat A2 „Route mit Fokus“ ausdrücklich ausgewählt. Der Web-Composer erhält kompakte Tageszeilen und genau einen separaten Bearbeitungsbereich; Austausch, Zeiten und Ablehnungsgrund erscheinen einzeln. Keine Änderung an der fachlichen Eigentümerschaft und keine Migration. Places-IDs, bestätigte Reisen, Buchungen und globale Profilvorlieben bleiben über ihre bisherigen Verträge verwaltet.

Die reale .194-Ausgabe enthält widersprüchliche Ortsklassifikationen (Km 0: Nachtleben und historisches Monument; eine Kirche als Park), übergewichtete passive Besuche und vom Profil geerbte Kinderwagen-/Kinderwünsche trotz expliziter Erwachsenenreise. Die nachgeladene Gateway-Quelle entspricht bis auf die Versionskennung dem Checkout; ein abweichender Gateway-Quellstand ist somit nicht die belegte Ursache. Direkte anonyme Detailabfragen wurden mit AUTH_REQUIRED abgewiesen; diese Grenze bleibt erhalten. Der gespeicherte Pool verliert bisher Originalkategorien und Beschreibungen. Diese Evidenz wird künftig vollständig bis zu Komposition, Reserve und Audit erhalten. Suchabsicht ist keine Ortsklassifikation. Widersprüche dürfen nicht als erfüllter Erlebniswunsch gelten.

Intelligence erweitert innerhalb seiner bestehenden Eigentümerschaft die semantische Reiseinterpretation, Priorität expliziter Reiseangaben, die Auswahl unterschiedlicher Erlebnisse und den unabhängigen Inhaltsaudit. Echte KI beurteilt Erlebnispassung, Dauer, Wiederholung und Gruppenwünsche; deterministische Kennzahlen liefern nachvollziehbare Gegenbeispiele und verhindern keine ausdrücklich gewünschte Wiederholung. Strukturierte, optionale Vorlieben ergänzen den Freitext. Später eingeladene Personen werden als noch nicht berücksichtigte Perspektiven ausgewiesen; ihre Zustimmung, Mitgliedschaft und Profile bleiben beim vorgesehenen Collaboration-/Identity-Vertrag. Keine Einladung wird automatisch versendet.

Prüfung: Regressionen aus den realen Gegenbeispielen, kein Profil-Write, kein Umdeuten einer Suchkategorie zu einer Place-Tatsache, stabile Reserve über Wiederaufnahme, identische Karten-/Routennummern, Bedienung A2 auf Desktop und Mobile sowie abschließend ein begrenzter echter Integration-Lauf. Kosten werden durch lokale Wiederholung und Wiederverwendung der bestehenden Modellaufrufe begrenzt. P17/P19 und M16.5 bleiben bis zur gesamten Abnahme teilweise offen. Veröffentlichung nur auf Integration; Rollback auf .194.

### 09.09.2026 – Suchidentität und tatsächliche Aktivitäten, nach öffentlichem .195-Gegenbeweis

Der öffentliche Workflow dca81147-2f1b-4127-801e-137f985568d2 meldet zwölf Ergebnisse für die benannte Lonja-Suche, enthält aber keinen entsprechenden Ort. Der Namensfilter wird bei längeren Suchtexten und bei strenger Typauswahl entfernt. Daneben werden allgemeine Freizeit-/Sportkategorien zu Aktivitäten und spanische Restaurants durch einen Teilworttreffer zu Spa. Der bewertete Gesamtplan ist deshalb trotz eines positiven Modell-Audits kein Qualitätsnachweis.

Der bestehende discovery.plan-Vertrag erhält additiv das optionale targetName: eine echte Ortsidentität ohne Beschreibung; offene Erlebnissuchen behalten null. Der ursprüngliche Nutzerwunsch erreicht dieselbe vorhandene KI-Recherche. Bis zu sechs unterschiedliche Recherchebedürfnisse werden im bereits bestehenden Aufruf behandelt. Places transportiert targetName unverändert bis zu den Provideradaptern, berücksichtigt es im Cache und entfernt den Filter auch bei leeren Antworten nicht. Namensbelege bleiben von Eignungs- und Live-Datenbelegen getrennt. Suchbezüge überleben das Zusammenführen doppelter Provider-IDs und die Workflow-Wiederaufnahme; Suchversion 3 erneuert alte ungenaue Zusatzsuchen.

Die fachlichen Eigentümer bleiben unverändert: Intelligence formuliert und beurteilt Suchabsichten, Places prüft Identität und Providerkategorien, Trip bestätigt erst nach Nutzeraktion. Deterministische Typkorrekturen verhindern falsche Tatsachen; sie ersetzen keine semantische Reiseentscheidung. Keine neue Domain-Tabelle oder direkte Domain-Mutation. Ein separat deploybarer Integration-Gateway importiert dieselbe kanonische Gateway-Implementierung, analog zur bestehenden Integration-Intelligence. Nur die Integration-Hosts verwenden ihn; der produktive Gateway bleibt auf seinem bisherigen Stand. Authentifizierung, CORS, Berechtigungen und Providerbudgets bleiben unverändert.

Prüfung: ausgeführte Provideranfragen mit langen Eigennamen, kein unbenannter Rückfall, falsche und passende Treffer, Browsertransport und Cachetrennung, tatsächliche Aktivitätsbelege gegenüber Parks/Sportgeschäften/spanischen Restaurants, erhaltene Suchbezüge sowie ein begrenzter öffentlicher Nachweis. Veröffentlichung auf Integration; Rollback auf Worker .195 und vorherige Integration-Intelligence, der neue Gateway kann ungenutzt bleiben. P17/P19 bleiben teilweise offen.
