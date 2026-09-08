# Luvia AI: Kostenmodell, Pakete und Break-even

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.163**, Core **4.82.282**. P17/P19 aktiv und teilweise: App .162 / Core .281 und Intelligence v49 / 4.40.0 sind öffentlich auf Integration; der reale Familien-/Ferien-/Konflikttest deckte dort einen zu frühen Abbruch der Zielinspiration auf. App .163 / Core .282 und Intelligence v50 / 4.40.1 beheben diesen Befund mit Luna, kleinem Structured Output und 30 Sekunden Transportbudget. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Öffentlich aktiv sind der echte Konfliktmoderator, Bewegungsradius, räumliche Vielfalt, harte Interessenabdeckung, sichtbare Planungsannahmen und getrennte Live-Prüfungen. Der erste reale .162-Familienlauf bewahrte die Eingabe, brach die Fünfer-Zielidee aber nach dem zu kurzen 20-Sekunden-Budget ab. .163 routet genau diese leichte Aufgabe auf Luna mit niedriger Denkleistung und 1.200 Ausgabetokens; Gesamtplan und unabhängiger Audit behalten ihre getrennten Qualitätsstufen. Der kompakte Planungscheck, das seitliche Desktoplayout und drei klickbare Tageskartenrichtungen bleiben enthalten.

**Nächster Schritt (AKTIV): Familien-, Ferien-, Mobilitäts- und Wunschkonflikte im zweiten realen Gesamtplan prüfen.** Der erste reale Gesamtplan funktioniert technisch, bündelt seine Places aber zu stark im Zentrum und deckt einen ausdrücklich gewünschten Meeresmoment nicht ab. Der zweite Positivlauf muss deshalb zugleich semantische Konfliktmoderation, autoritative Schulferien, räumliche Vielfalt, Mobilitätsradius und ausgewogenen Kategorienmix beweisen.

**Abnahme dieses Schritts:**

- Ein freier deutscher Reiseauftrag enthält Kinder mit Altersangaben, Schleswig-Holstein als Schulregion, einen groben Zeitraum, widersprüchliche Wünsche, gewünschten Strand-/Meeresanteil und mehrere Place-Kategorien.
- Luvia fragt nur fehlende hochwirksame Angaben, insbesondere den Bewegungsradius nah zu Fuß, Stadt mit Bus/Bahn oder weitläufig mit Taxi/Pkw, und schlägt ausschließlich autoritativ belegte Zeitfenster innerhalb der zuständigen Schulferien vor.
- Der echte Konfliktmoderator benennt die Spannung und bietet mindestens zwei sinnvoll priorisierte Varianten mit Folgen an, statt einen stillen Mittelwert oder ein Keyword-Schema zu verwenden.
- Der gewählte Zeitraum erzeugt einen vollständigen Plan für alle Tage über mehrere sinnvolle Stadt-/Küstengebiete; Meer/Strand und bestätigte Kategorien sind als überprüfbare Abdeckung enthalten, fünf anstrengende Tage in Folge sind ausgeschlossen und Freiraum ist bewusst benannt.
- Unterkunftsradius und Nachbarschaft folgen aus dem fertigen Tagesnetz und Mobilitätswunsch. Audit, Unsicherheitskarte und Buchungsreihenfolge bleiben ehrlich; Modell, Tokens, Latenz, Kosten und Reparaturen werden je Phase gemessen.

**Danach:** Nach Veröffentlichung von .163 wird derselbe reale Familien-/Ferien-/Konfliktlauf erneut ausgeführt: fünf Richtungen, autoritatives Ferienfenster, Konfliktentscheidung, Bewegungsradius und vollständiger Mehrgebietsplan ohne Speichern. Danach folgen semantische Ablehnungsdiagnose und gezielte Teilreparatur, anschließend P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. Die produktive Tageskartenrichtung wird aus dem klickbaren A/B/C-Prototyp gewählt. M17 friert danach die gemeinsame Produktsprache ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .163/v50 veröffentlichen und denselben öffentlichen Familien-/Ferien-/Konfliktlauf vollständig bis zum ungespeicherten Review abschließen; Kosten/Latenz je Modell messen; Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. P16: semantische Ablehnungsdiagnose. Die produktive kompakte Tageskarten-Gestaltung wartet auf die Auswahl aus drei sichtbaren Designrichtungen; Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
