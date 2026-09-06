# PCR P12 – Belegte Tagesprobe ohne automatische Änderung

## Ergebnis

P12 ist intern abgeschlossen und im Status **BELEGT BEGRENZT**. App
**13.82.168.113** und Core **4.82.232** spielen einen realen Reisetag als
günstigen, erwarteten und ungünstigen Verlauf durch. Timeline und Luvia AI
verwenden dafür dieselben Journey-Einträge, Place-Identitäten, Routenbelege,
Zeitfenster und unbekannten Einflussfaktoren. Die Probe verändert keinen
Termin. Eine konkrete Anpassung bleibt ein eigener, bestätigungspflichtiger
Journey- oder Places-Befehl mit den vorhandenen Recovery-Grenzen.

Der verbleibende Umfang ist das physische Gerätegate auf iOS und Android sowie
eine spätere Wiederholung mit echten, zeitgestempelten Wetter-, Verkehrs-,
Öffnungs- und Auslastungssignalen. Fehlende Signale sind kein verdeckter
Ersatzwert: Luvia nennt sie als unbekannt und gibt weder eine erfundene
Erfolgswahrscheinlichkeit noch eine sichere Prognose aus.

## Gemeinsame fachliche Wahrheit

`journey.resilience.v1` erzeugt aus dem ausgewählten Tag deterministisch drei
Szenarien:

- **Günstiger Verlauf:** untere belegte Wegegrenzen;
- **Erwarteter Verlauf:** erwartete Wegezeiten;
- **Ungünstiger Verlauf:** obere belegte Wegegrenzen und ausschließlich
  tatsächlich belegte Verzögerungen.

Jedes Szenario enthält die simulierten Zeitpunkte, gesamte Wegezeit,
beleggestützte Verzögerung, voraussichtliches Tagesende, Quellenhinweise und
explizite Unbekannte. Der Core liefert eine stabile Szenariosignatur,
`successProbability: null`, `probabilityClaim: false` und
`automaticMutation: false`. Ein unbekannter oder alter Einfluss wird dadurch
nicht zu einer vermeintlich aktuellen Tatsache.

Öffnungszeiten, Kapazität/Auslastung, Wetter und Verkehr/Störungen gelangen nur
als normalisierte Context-Signale in die Probe. Ein Signal muss Quelle,
Beobachtungszeit und eine zum behaupteten Effekt passende Aussage besitzen.
Ohne diese Herkunft bleibt es sichtbar unbekannt und verändert weder Zeiten
noch Empfehlung.

## Einheitliche Projektion in Timeline und Luvia AI

Die Timeline zeigt die Tagesprobe in einem eigenen, lesbaren Bereich neben dem
echten Tagesverlauf. Luvia AI projiziert dieselben drei Szenarien in die
aufklappbaren Planungsdetails eines natürlich formulierten Tagesplanbefehls.
Beide Oberflächen nennen:

- die drei Verläufe mit Wegezeit und Tagesende;
- belegte Verzögerungen oder einen planmäßigen Verlauf;
- die Routenlage beziehungsweise ihren unbekannten Zustand;
- unbekanntes Wetter, Verkehr/Störungen, Öffnungszeiten und Auslastung;
- die Anzahl bestätigungspflichtiger Prüfhinweise;
- den Grundsatz, dass die Probe nichts automatisch verändert.

Die vorhandenen Änderungen bleiben getrennte Vorher/Neu-Flows: Route-Puffer,
Zeitänderung, Alternative sowie Entfernen/Wiederherstellen laufen weiter über
den kanonischen Journey- beziehungsweise Places-Owner. Der Tagesproben-Core
schreibt selbst weder in lokale UI-Zustände noch in einen Owner.

## Sichtbare Integrationsabnahme

Der saubere Kandidat lief sichtbar unter:

`https://integration-luvia.njwnrvwbv5.workers.dev/?screen=timeline&acceptance=p12-public-113`

Auf dem echten Reisetag **Samstag, 12. Juni 2027** zeigte die Timeline die zwei
bestätigten Momente **Grande Beach Café** um 15:00 Uhr und **Restaurant
Brechtmann in Scharbeutz-Schürsdorf** um 20:00 Uhr. Die Route blieb mit 68
Minuten erwarteter und 66–77 Minuten realistischer Dauer, Places-Koordinaten,
sieben Tagen Datenalter und unbekannter Live-Lage sichtbar. Daneben zeigte die
Tagesprobe:

- günstig: **7 Minuten Wege**, planmäßig, Ende 21:30 Uhr;
- erwartet: **9 Minuten Wege**, planmäßig, Ende 21:30 Uhr;
- ungünstig: **16 Minuten Wege**, planmäßig, Ende 21:30 Uhr;
- unbekannt: Wetter, Verkehr und Störungen, Öffnungszeiten und Auslastung;
- **keinen** belegten Änderungsbedarf und keine automatische Änderung.

Die sichtbare Luvia-AI-Anfrage lautete:

`Zeige den Tagesplan am 12.06.2027 und erkläre Route, Tagesprobe und aktuelle Störung.`

Luvia AI las genau den 12.06.2027 mit denselben zwei Momenten. Die geöffneten
Planungsdetails zeigten dieselben drei Verläufe, dieselben unbekannten
Einflüsse, keine bestätigte aktuelle Störung und null bestätigungspflichtige
Prüfhinweise. Nach dem Schließen und einem vollständigen Reload enthielt der
Tag weiterhin genau zwei Momente und den unveränderten gespeicherten
Routenpuffer von zehn Minuten. Damit ist die Nullmutation öffentlich belegt.

## Automatisierte Nachweise

Die vollständige Safe Regression ist **235/235 PASS**. NFR-0 ist **3/3 PASS**.
Der neue P12-Test belegt insbesondere:

- drei deterministische Verläufe aus derselben Tages- und Routenwahrheit;
- günstige, erwartete und ungünstige Zeitprojektion ohne Owner-Mutation;
- Context-Signale nur mit Quelle, Zeitstempel, Frische und passender Aussage;
- sichtbare Unbekannte statt erfundener Live-Daten;
- keine Erfolgswahrscheinlichkeit und keine automatische Übernahme;
- stabile Szenariosignatur;
- dieselbe Projektion in Timeline und Luvia AI;
- weiterhin bestätigte, idempotente Owner-Wege für tatsächliche Änderungen.

Die Human↔AI-Registry umfasst weiter **333 semantische Aktionen**, **30
typisierte Runtime-Aktionen** und **1.009 bewusst klassifizierte aktive
`data-*`-Marker**. Alle Runtime-Aktionen bleiben vor Ledger- oder Owner-Aufruf
typisiert geschützt. Die Visual-Inventur umfasst **984 visuelle Kandidaten**
und ist konsistent.

## Release- und Rückfallbeleg

- Runtime-Commit: `6d2b5cc01c1d186dda55d778a379fd7ba19c0c6f`
- Worker-Version: `d3553403-3c27-4d79-9a4d-0d5021045c4a`
- Immutable URL:
  `https://d3553403-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv:
  `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.113-6d2b5cc0-public-bytes.zip`
- Versionierte Archivdateien: **3.277**
- Archivgröße: **88.892.904 Bytes**
- Archiv-SHA-256:
  `45819061A7783B83061F167AD65EAA88C5232CFA5ADDE1F12C5EE42A74DC0860`
- Öffentliche Byteidentität: **30/30 MATCH** zwischen sauberem Archiv,
  Stable-Kandidat und immutable Worker.

Nach der Abnahme wurde Stable Integration auf den akzeptierten App-.104-Worker
`7cda6e20-3b33-442a-b5e6-1c2da8256faf` zurückgesetzt und als App
**13.82.168.104** / Core **4.82.223** erneut gelesen. Main blieb bei
`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`. Production, Supabase-Daten,
RLS, Edge Functions, Providerbudgets und Secrets wurden in diesem P12-Slice
nicht verändert.

## Nächster Schritt

P15/P17 ist als ein gemeinsamer Trip-Composer-Abschnitt aktiv. Ein kanonischer
Trip-Entwurf soll die drei Einstiege **Geführt**, **Schnellstart** und
**KI-Entwurf** bedienen. Anfrage-, reisebezogene und dauerhafte Vorlieben
werden klar getrennt; dauerhafte Änderungen brauchen eine eigene Bestätigung.
Der Entwurf wird tageweise mit Places, Stays, Karten, P12-Tagesprobe,
Alternativen, Vormerken und einzelnen Vorher/Neu-Übernahmen präsentiert. Trip
bleibt der einzige Besitzer des Reiseentwurfs und der bestätigten Reise.
