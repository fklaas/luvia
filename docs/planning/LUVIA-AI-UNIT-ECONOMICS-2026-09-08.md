# Luvia AI: Kostenmodell, Pakete und Break-even

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.206**, Core **4.82.325**. P17/P19: App .206 / Core 4.82.325 als gebündelter Qualitäts- und Kostenkontroll-Releasekandidat gebaut.

**Zuletzt geliefert:** App .206 / Core 4.82.325 ist als Integration-Releasekandidat gebaut. Ein zentraler POI-Qualitätsvertrag verwirft Funktionsorte, generische Attraktions-/Aktivitätsbehauptungen und Kategorien ohne konkrete Provider- oder exakte Webbelege bereits vor der KI-Komposition. Allgemeines Shopping bedeutet Einkaufszentrum; einzelne Geschäfte werden nur bei entsprechendem Wunsch zugelassen. Restaurantmomente folgen der gewählten Mittag-/Abendpräferenz. Präsentationslabels stammen aus dem gemeinsamen Places-Owner. Unbestätigte ältere KI-Entwürfe werden einmalig auf Qualitätsversion 2 neu komponiert; bereits übernommene Reisen bleiben unverändert. OpenAI-Webrecherche bleibt auf Integration als begrenzte Ergänzung aktiv: ein Rechercheauftrag je Workflow, maximal zwei Webaufrufe und sechs Quellenangebote, immer Luna und Wiederverwendung bei Retry/Resume.

**Nächster Schritt (AKTIV): Neuen Qualitätsvertrag veröffentlichen und einen frischen Valencia-Gesamtplan belegen.** Die strukturellen Fehler sind im gemeinsamen Owner-Vertrag behoben. Jetzt muss derselbe Stand auf Integration zeigen, dass echte Kandidaten, Kategorienmix, räumliche Streuung, Essenszeiten, Wiederaufnahme und begrenzte Webkosten zusammen funktionieren.

**Abnahme dieses Schritts:**

- Safe Regression vollständig grün; sauberer Integration-Deploy mit immutable Version und Rollback; ein frischer echter Valencia-Lauf ohne Km 0, Touristeninformation, generische Entdeckungsorte oder ungewünschte Parkdominanz, mit Strand/Hafen/Altstadt/weiteren Vierteln sowie gewünschten Aktivitäten, Nachtleben, Einkaufszentrum und Restaurants; bezahlte Webrecherche höchstens einmal je Workflow und bei Wiederaufnahme wiederverwendet.

**Danach:** Den Familien-/Konfliktfall, Mitreisende, Geräte-Wiederaufnahme und die übrigen P17/P19-Gates schließen. M16.5 bleibt bis zu diesen Abnahmen offen; M17 ist die umfassende Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE bis zum echten öffentlichen Gesamtplan: Familien-/Konfliktfall, Lernen über mehrere Reisen, eingeladene Mitreisende, gebietsferne Reserve im produktiven Tauschfluss, physische iOS-/Android-Abnahme sowie aktuelle Wetter-, Öffnungs-, Preis-, Buchbarkeits-, Event-, Einreise- und Verkehrsbelege. M16.5 bleibt offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand: 8. September 2026. Dieses Dokument trennt gemessene technische Nutzung, aktuelle Anbieterpreise und Produktannahmen. Preise und Paketgrenzen sind keine bereits beschlossene Preisliste; sie werden nach echten P17/P19-Positivläufen mit Telemetrie neu kalibriert.

## 1. Was Luvia heute tatsächlich aufruft

Der produktive Integration-Router verwendet `gpt-5.6-luna` für die schnelle Stufe, `gpt-5.6-terra` für die Standardstufe und `gpt-5.6-sol` für die tiefe Rettungsstufe. Der Composer nutzt Luna für Wunschdeutung beziehungsweise den ersten kompakten Reiseentwurf, Terra für den unabhängigen Audit und die erste gezielte Tagesreparatur und Sol nur für die letzte begrenzte Reparaturstufe. Places, Geografie, Ferien, Routen, Wetter, Preise, Öffnungen und Buchbarkeit sind eigene Datenprovider; das Sprachmodell darf diese Fakten nicht erfinden.

Aktuelle OpenAI-API-Preise pro Million Texttokens:

| Modell | Eingabe | Cache-Lesezugriff | Ausgabe |
|---|---:|---:|---:|
| GPT-5.6 Luna | 0,20 USD | 0,02 USD | 1,20 USD |
| GPT-5.6 Terra | 2,00 USD | 0,20 USD | 12,00 USD |
| GPT-5.6 Sol | 4,00 USD | 0,40 USD | 20,00 USD |

Quellen: https://developers.openai.com/api/docs/models/gpt-5.6-luna und https://developers.openai.com/api/docs/models/compare. Sols ausgewiesener Preis ist am Stichtag ein befristeter Aktionspreis; vor einer finalen Kalkulation muss er erneut geprüft werden.

Die Kostenformel je Modellaufruf lautet:

`Kosten = Eingabetokens / 1.000.000 × Eingabepreis + Cachetokens / 1.000.000 × Cachepreis + Ausgabetokens / 1.000.000 × Ausgabepreis`

## 2. Was der reale Valencia-Debuglauf gemessen hat

Ein früher realer Lauf bis zum abgelehnten Audit verbrauchte fünf Modellaufrufe, 109.594 Eingabetokens, 1.212 davon als Cache-Lesezugriff, 16.750 Ausgabetokens und 126.344 Tokens insgesamt. Die Laufzeit der Modellphasen summierte sich auf 209.263 ms. Die damalige Aggregation enthält noch keine verlässliche Tokenaufteilung pro Modell. Deshalb ist nur eine belastbare Preisspanne möglich:

| Rechenannahme für alle gemessenen Tokens | Kosten des Laufs |
|---|---:|
| vollständig Luna | rund 0,042 USD |
| vollständig Terra | rund 0,418 USD |
| vollständig Sol | rund 0,769 USD |

Der reale Mischpreis liegt zwischen diesen Grenzen. Eine scheinbar präzisere Zahl wäre erfunden. Der aktuelle P19-Workflow misst Modell, Fähigkeit, Eingabe-, Ausgabe- und Cachetokens sowie Latenz je Aufruf; nach einem positiven Lauf kann der exakte Mischpreis aus den Einzelereignissen berechnet werden.

Jeder Workflow ist zurzeit auf acht Modellaufrufe und 180.000 Gesamttokens begrenzt. Das schützt vor endlosen Schleifen, ist aber noch kein eigener Dollar-Hard-Limit. Würden im theoretischen Extrem alle 180.000 Tokens als Ausgabe eines einzigen Modells berechnet, läge die reine Modellobergrenze bei 0,216 USD für Luna, 2,16 USD für Terra oder 3,60 USD für Sol. Der produktive Router mischt die Modelle und soll deutlich darunter bleiben. Zusätzlich braucht der Workflow vor Livegang ein konfigurierbares Kostenlimit in USD beziehungsweise EUR.

Das im Screenshot sichtbare Guthaben von 9,94 USD war nicht die Ursache der gemeldeten Fehler. Schemafehler, ungültiges JSON, Zeitüberschreitungen, zu große Checkpoints und Idempotenzkonflikte sind technische Fehler. Die erfolgreichen echten Ziel- und Zeitfensterantworten belegen, dass der API-Zugang grundsätzlich arbeitet. Das OpenAI-API-Guthaben ist getrennt von einem ChatGPT-Abonnement. Eine Dashboardanzeige mit null Anfragen kann aus einem anderen Projekt, einer anderen Organisation, einem Zeitfilter oder verzögerter Aggregation stammen.

## 3. Welches Modell für welche Aufgabe wirtschaftlich ist

Nur Luna für jede Funktion wäre günstig, hat aber im aktuellen Reisevertrag noch keine bewiesene Qualität für sieben vollständige, überschneidungsfreie Tage. Das sinnvolle Ziel ist deshalb eine evalgebundene Kaskade:

1. Luna deutet den Wunsch, erzeugt fünf Zielrichtungen, formuliert kurze Varianten und erstellt den ersten strukturierten Entwurf.
2. Deterministische Verträge prüfen ausschließlich Identitäten, Datums- und Zeitlogik, Duplikate, Owner-Grenzen, Belege und Vollständigkeit.
3. Terra prüft den Gesamtplan unabhängig und repariert nur konkret betroffene Tage.
4. Sol wird nur eingesetzt, wenn ein nachweislich komplexer Konflikt oder eine gescheiterte Terra-Reparatur die zusätzliche Qualität rechtfertigt.
5. Ein zweiter KI-Anbieter wird erst nach demselben mehrsprachigen Reise-Eval als ein klar definierter Fallback angebunden. Viele ungeprüfte Anbieter erhöhen Fehler-, Datenschutz-, Observability- und Wartungskosten.

Die größte Einsparung entsteht derzeit durch weniger Wiederholungen, kleinere Payloads, gespeicherte Phasen, gezielte Tagesreparaturen, Prompt-Caching und bessere Ersttreffer. Der Modellpreis allein löst die aktuelle Zuverlässigkeitslücke nicht.

## 4. Startvorschlag für die Pakete

Die Preise sollten den Produktwert und den laufenden Service finanzieren. Die Modellkosten im Centbereich rechtfertigen keine unbegrenzte Nutzung, weil Places, Karten, Routen, Wetter, Events, Buchungssuche, Medien, Speicher, Support und Missbrauchsschutz zusätzlich kosten.

| Paket | Startpreis brutto | Sinnvolle Grenzen zum Start |
|---|---:|---|
| Luvia Free | 0 EUR | manuelle Reise und geführte Vorschläge; fünf KI-Zielrichtungen in begrenzter Zahl; höchstens ein einmaliger vollständiger KI-Probeplan pro Konto; ein aktiver privater Trip |
| Luvia Premium | 9,99 EUR/Monat | zwei vollständige KI-Reisepläne pro Monat; begrenzte gezielte Änderungen; mehrere private Reisen; Reiseversprechen, Tagesbalance, Freiraum, Unsicherheiten und Plan-B-Prüfung |
| Luvia Plus | 17,99 EUR/Monat | acht vollständige KI-Reisepläne pro Monat; deutlich mehr Teilreparaturen; Gruppenfunktionen und erweiterte laufende Neuplanung, sobald diese Funktionen tatsächlich produktiv sind |
| Zusatzkontingent | etwa 1,99 EUR | ein weiterer vollständiger KI-Plan einschließlich begrenztem Audit- und Reparaturbudget |

Die Begriffe „vollständiger Plan“ und „gezielte Änderung“ müssen technisch gezählt werden. Ein Reload oder eine interne Reparatur desselben Workflows darf nicht erneut vom Nutzerkontingent abgezogen werden. Noch nicht implementierte Plus-Funktionen dürfen erst nach ihrer Abnahme beworben werden.

## 5. Beispielrechnung für Break-even

Die folgende Rechnung ist eine Planungsannahme, keine Buchhaltungsprognose. Sie verwendet 19 Prozent Umsatzsteuer, Direktvertrieb mit pauschal angenommenen drei Prozent Zahlungsgebühr plus 0,30 EUR pro Zahlung und Reserven für alle variablen Kosten. Für Premium werden 1,25 EUR, für Plus 3,00 EUR variable Monatskosten angenommen. Darin liegen mehr als die heute gemessenen reinen OpenAI-Kosten, damit auch Places, Karten, Speicher und Fehlerläufe Platz haben.

| Paket | Netto nach Umsatzsteuer | Zahlungsannahme | variable Reserve | Deckungsbeitrag |
|---|---:|---:|---:|---:|
| Premium 9,99 EUR | 8,39 EUR | 0,60 EUR | 1,25 EUR | 6,54 EUR |
| Plus 17,99 EUR | 15,12 EUR | 0,84 EUR | 3,00 EUR | 11,28 EUR |

Bei 70 Prozent Premium und 30 Prozent Plus ergibt das rund 7,97 EUR Deckungsbeitrag pro zahlendem Nutzer und Monat.

| gesamte monatliche Fixkosten | benötigte zahlende Nutzer |
|---:|---:|
| 1.000 EUR | 126 |
| 5.000 EUR | 628 |
| 15.000 EUR | 1.884 |
| 25.000 EUR | 3.139 |

Free-Nutzer verursachen ebenfalls Kosten. Bei angenommenen 0,10 EUR variablen Kosten pro nicht zahlendem monatlich aktivem Nutzer ergibt sich bei acht Prozent Conversion ein Netto-Beitrag von rund 0,545 EUR pro gesamtem MAU. Daraus folgen ungefähr 1.835 MAU für 1.000 EUR Fixkosten, 9.171 MAU für 5.000 EUR, 27.514 MAU für 15.000 EUR und 45.857 MAU für 25.000 EUR. Bei nur fünf Prozent Conversion werden ungefähr 3.298, 16.488, 49.464 beziehungsweise 82.440 MAU benötigt.

Bei Vertrieb über einen App Store fällt der Deckungsbeitrag je nach geltender Provision niedriger aus. Mit einer bloßen Szenarioannahme von 15 Prozent Store-Provision läge der gemischte Deckungsbeitrag pro zahlendem Nutzer bei rund 7,08 EUR. Bei acht Prozent Conversion und derselben Free-Reserve wären ungefähr 2.110 MAU pro 1.000 EUR monatlicher Fixkosten nötig. Aktuelle Storebedingungen, Erstattungen, Jahrespakete, Support und tatsächliche Providerpreise müssen vor einer Preisentscheidung ergänzt werden.

## 6. Was vor einer finalen Preisentscheidung gemessen werden muss

- Kosten pro erfolgreichem vollständigem Reiseplan, pro abgelehntem Entwurf und pro gezielter Reparatur.
- Verteilung von Luna-, Terra- und Sol-Nutzung sowie Cachequote.
- p50- und p95-Latenz je Phase, Abbruchquote, Wiederaufnahmerate und Anteil der Pläne, die ohne Reparatur bestehen.
- Places-, Karten-, Routen-, Wetter-, Event-, Preis-, Buchungs-, Medien-, Speicher- und E-Mail-Kosten pro MAU und zahlendem Nutzer.
- Nutzung je Paket, Free-zu-Paid-Conversion, Erstattung, Zahlungsgebühr, Supportzeit und Missbrauch.
- Deckungsbeitrag nach Umsatzsteuer und Vertriebskanal, nicht nur Umsatz minus OpenAI-Rechnung.

Die Paketgrenzen werden erst nach einem ausreichend großen Integration-/Beta-Datensatz final. Für die technische Beta gilt ein harter Monatsbetrag, ein Workflow-Limit, ein Kontingent pro Konto und ein Alarm bei ungewöhnlicher Reparatur- oder Sol-Nutzung.

## 09.09.2026: gezielte Webrecherche statt weiterer breiter Ortsabfragen

Die Nutzerfreigabe umfasst eine begrenzte OpenAI-Webrecherche im Integration-Reiseauftrag. Sie ersetzt weder Karte noch Ortsidentität. Vorhandene Places-Daten zuerst; Web nur bei fehlenden oder dünn belegten gewünschten Erlebniskategorien. Die Anfrage enthält höchstens zwei Recherchebedürfnisse und ein öffentliches Reiseziel, keine vollständigen Profile, Buchungen oder Rohkonversation.

Aktuell geprüfte USD-Listenpreise (Standard, ohne Steuern): OpenAI web_search 10 USD je 1.000 Tool-Aufrufe plus Modell-/Suchinhalt-Tokens; Luna 0,20 USD Eingabe und 1,20 USD Ausgabe je Million Tokens. Beispiel: zwei Web-Aufrufe + insgesamt 8.000 Eingabe- und 2.000 Ausgabetokens = 0,024 USD je Recherche. 100/1.000/10.000 solche Recherchen = 2,40/24/240 USD. Das sind Annahmen, keine gemessenen Durchschnittskosten und keine gesamten Reisekosten. [OpenAI-Preise](https://developers.openai.com/api/docs/pricing)

Google Text Search Pro bzw. Nearby Search Pro: jeweils 5.000 kostenlose Monatsaufrufe, danach erste Preisstufe 32 USD je 1.000. Zehn tatsächlich kostenpflichtige Suchabfragen wären 0,32 USD, vor weiteren Details. Eine Places-Abfrage liefert strukturierte Treffer; ein Web-Aufruf ist keine identische Leistung. [Google-Preisliste](https://developers.google.com/maps/billing-and-pricing/pricing)

Geoapify: 3.000 kostenlose Credits pro Tag, Einstieg API10 59 USD pro Monat für 10.000 Credits pro Tag. Places bis 20 Treffer kostet einen Credit; größere Abfragen kosten zusätzliche Credits. Solange das vorhandene Kontingent reicht, erzeugt Webrecherche zusätzliche Kosten und ist keine garantierte Ersparnis. Der tatsächliche Kontotarif ist hier nicht als Rechnungsbeleg geprüft. [Geoapify-Preise](https://www.geoapify.com/pricing/), [Credit-Regeln](https://www.geoapify.com/pricing-details/)

Umsetzung: ein Luna-Versuch je Reiseworkflow, höchstens zwei Web-Tool-Aufrufe, maximal sechs Hinweise und 2.400 Ausgabetokens, 30 Sekunden Serverzeitlimit, keine automatische Modelleskalation. Integration vorerst fünf neue Recherchen je Konto/UTC-Tag, 100 insgesamt/UTC-Tag, daher höchstens 2 USD Web-Tool-Gebühren je Integration-Tag plus Modellkosten. Diese Testkontingente sind keine späteren Abo-Paketdefinitionen. Die API bietet keinen exakten USD-Deckel für variable Eingabetokens; der technische Deckel begrenzt Aufrufe, Ausgabe und Kontextumfang.

Job-/Workflow-Nutzungsdaten erfassen beobachtete Webaufrufe, geschätzte reine Toolgebühr und unklare Abrechnung nach unterbrochenem Transport. Ausgabebegrenzung, Quellenbindung, serverseitige Idempotenz und SQL-Kontingent schützen auch bei mehreren Tabs. Ein Reload kauft keinen zweiten Recherchelauf. Eine neue Reise oder wesentlich geänderte Anfrage ist ein neuer Workflow und verbraucht gegebenenfalls erneut Kontingent.

### Gemessener Weblauf auf Integration .200

Am 09.09.2026 um 09:46 UTC führte der authentifizierte Workflow `30d9c722-6525-4385-a467-747a83d9b91f` den Webjob `df9bd8a3-c628-4aec-95f7-f401df6040e8` erfolgreich aus. Luna brauchte 9.229 ms, zwei Web-Tool-Aufrufe, 21.117 Eingabe- und 507 Ausgabetokens ohne Cachetreffer. Aus den obigen Standardpreisen folgen 0,02 USD Toolgebühr + 0,0048318 USD Modellkosten = **0,0248318 USD**, etwa 2,48 US-Cent. Das ist eine Berechnung aus gemeldeter Nutzung, kein Rechnungsabgleich und kein Durchschnittswert.

Sechs Angebotshinweise mit tatsächlich recherchierten Links wurden gespeichert. **Keine der sechs Ortsidentitäten wurde im anschließenden Places-Abgleich übernommen; der Gesamtplan bestand den Qualitätscheck nicht.** Die Kosten je erfolgreich nutzbarem Gesamtplan sind daher aus diesem Test nicht berechenbar. Die Webquellen sind vorhanden; als nächster Schritt müssen Ortszuordnung und konkrete Aktivitätsabdeckung geklärt werden, ohne denselben Recherchelauf neu zu bezahlen.

Ein reines Mengenszenario mit diesem einzelnen Messwert: 1.000 Recherchen kosten etwa 24,83 USD, 10.000 etwa 248,32 USD. Benötigen nur 20 Prozent von 1.000 Reiseplanungen diesen Zusatz, wären es etwa 4,97 USD zusätzliche Recherchekosten. Orte-/Karten-/Routenabfragen, Komposition, Audit und Reparaturen kommen gegebenenfalls hinzu. Das ist noch keine Kostenprognose für zahlende Nutzer oder ein finales Paketkontingent.
