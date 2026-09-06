# PCR P11 – Routenunsicherheit und bestätigter Zeitpuffer

## Ergebnis

P11 ist intern abgeschlossen und im Status **BELEGT BEGRENZT**. App
**13.82.168.112** und Core **4.82.231** zeigen für unterstützte Geh-,
Fahrrad-, Fahr- und ÖPNV-Wege eine erwartete Dauer, eine realistische
Bandbreite, Quelle, Messzeit, Datenalter und den belegten Live-Status. Eine
Pufferempfehlung wird nur bei vorhandenem zeitlichem Quellenbeleg als Aktion
angeboten. Sie verändert die Timeline ausschließlich nach einer eigenen,
ausdrücklichen Bestätigung über den öffentlichen Journey Owner.

Der verbleibende Umfang ist ein physisches Gerätegate: Der vollständige Ablauf
muss noch auf realem iOS und Android mit Touch und den vier unterstützten
Routenmodi abgenommen werden. Fehlende Live-Verkehrsdaten sind kein
Produktfehler. Luvia bezeichnet sie sichtbar als unbekannt und erfindet keine
Live-Aussage.

## Gemeinsame fachliche Wahrheit

`journey.resilience.v1` normalisiert die Routenbelege. Jeder Beleg enthält
Quelle, Beobachtungszeit, Alter, Art, unterstützte Aussage und Live-Status. Aus
dieser Wahrheit entstehen deterministisch:

- erwartete Dauer;
- untere und obere realistische Dauer;
- empfohlener zusätzlicher Puffer;
- lesbarer Quellen- und Altersbeleg;
- `Live-Daten belegt` oder `Live-Lage unbekannt`;
- eine stabile Belegsignatur für die spätere Bestätigung.

Wetter, Verkehrs- oder Störungslage, Saison und Tageszeit beeinflussen die
Bandbreite nur, wenn ein passender beobachteter Beleg vorhanden ist. Ein
unbelegter Risikowert wird nicht eingerechnet und erscheint in den Annahmen als
ignorierter Faktor. Der Core gibt keine Erfolgswahrscheinlichkeit aus und
verändert keine Planung automatisch.

Timeline, AI Chat und das Journey Suggestion Sheet lesen denselben Core. Ein
fehlender Provider-Zeitstempel wird nicht durch die aktuelle Uhrzeit ersetzt.
Dadurch kann ein alter oder unbekannter Stand nicht fälschlich frisch wirken.

## Bestätigter Journey-Owner-Weg

`journey.v1` stellt `previewRouteBuffer` und `applyRouteBuffer` bereit. Die
Vorschau enthält den bisherigen und den vorgeschlagenen Puffer, die erwartete
Revision und die erwartete Routenbelegsignatur. Das Anwenden verlangt:

1. eine ausdrückliche Bestätigung;
2. eine unveränderte Owner-Revision;
3. denselben Routenbeleg wie in der Vorschau;
4. eine eindeutige Operations-ID;
5. einen erfolgreichen Owner-Readback.

Eine Ablehnung schreibt nichts. Eine veraltete Revision oder eine veränderte
Belegsignatur wird vor dem Schreiben abgewiesen. Wiederholungen derselben
Operation liefern dasselbe fachliche Ergebnis. Der AI Chat verwendet dafür die
bereits registrierte Aktion `journey.entry.schedule` mit dem Änderungstyp
`route-buffer`; es entsteht kein zweiter Besitzer und kein lokaler
Timeline-Scheinzustand.

## Sichtbare Integrationsabnahme

Der saubere Kandidat lief sichtbar unter:

`https://integration-luvia.njwnrvwbv5.workers.dev/?screen=timeline&acceptance=p11-route-buffer-112`

Auf dem echten Reisetag Samstag, 12. Juni 2027 zeigte die Timeline den Weg
`Grande Beach Café → Restaurant Brechtmann in Scharbeutz-Schürsdorf` mit:

- **68 Minuten erwartet**;
- **66–77 Minuten realistisch**;
- **Places-Koordinaten** als Quelle;
- **vor sieben Tagen beobachtet**;
- **Live-Lage unbekannt**;
- **10 Minuten** aktuell gespeichertem Puffer;
- **12 Minuten** vorgeschlagenem Puffer.

Der Button `12 Min. Puffer prüfen` öffnete ein Journey-Sheet mit `Bisher 10
Minuten` und `Neu 12 Minuten`, Modus `zu Fuß`, derselben Bandbreite, Quelle und
Frische. `Abbrechen` schloss das Sheet. Nach einem vollständigen Reload waren
weiter 10 Minuten gespeichert und 12 Minuten lediglich als Vorschlag sichtbar.
Damit ist die Nullmutation öffentlich belegt.

Der AI Chat erhielt sichtbar die Anfrage `Zeige den Tagesplan und erkläre
Route, Tagesprobe und aktuelle Störung.` Seine Planungsdetails verwendeten
dieselbe Form aus Modus, erwarteter Dauer, Bandbreite, Quelle, Alter und
Live-Status. Bei einem Tag ohne belegte Routenquelle zeigte er `Keine
Routenquelle belegt · Alter unbekannt · Live-Lage unbekannt`. Obwohl der Core
die Unsicherheit erklärte, erschien dort wegen der fehlenden Quellenabdeckung
keine speicherbare Pufferaktion.

## Automatisierte Nachweise

Die vollständige Safe Regression ist **234/234 PASS**. NFR-0 ist **3/3 PASS**.
Der neue P11-Test belegt insbesondere:

- Normalisierung von Quelle, Messzeit, Alter und Live-Status;
- die vier unterstützten Routenmodi;
- wetter- und störungsabhängige Bandbreiten nur mit passendem Beleg;
- Vorschau ohne Schreiben;
- zwingende Bestätigung;
- Schutz gegen veraltete Revision und veränderten Routenbeleg;
- idempotenten Journey-Owner-Write und Replay;
- Owner-Readback;
- gemeinsame Projektion in Timeline, Suggestion Sheet und AI Chat.

Die Human↔AI-Registry umfasst weiter **333 semantische Aktionen**, **30
typisierte Runtime-Aktionen** und nun **1.009 bewusst klassifizierte aktive
`data-*`-Marker**. Alle 30 Runtime-Aktionen bleiben vor Ledger- oder Owner-Aufruf
typisiert geschützt. Die Fehlermatrix enthält weiter **2.764** erzeugte
Auswertungen und ist ohne Drift.

## Release- und Rückfallbeleg

- Runtime-Commit: `1e653b7bd8cfd7a6c4ec164be477447d5b076736`
- Worker-Version: `f3d48e97-e939-4a6d-a326-3c2da43c11fe`
- Immutable URL:
  `https://f3d48e97-integration-luvia.njwnrvwbv5.workers.dev/`
- Archiv:
  `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.112-1e653b7b-public-bytes.zip`
- Archivdateien: **3.275**
- Archivgröße: **89.057.894 Bytes**
- Archiv-SHA-256:
  `86F821FB0E454015444F4467CBE8A9A662C5D5ABCE340ABD08D0CAF08A43D0FE`
- Öffentliche Byteidentität: **30/30 MATCH** zwischen sauberem Archiv,
  Stable-Kandidat und immutable Worker.

Nach der Abnahme wurde Stable Integration auf den akzeptierten App-.104-Worker
`7cda6e20-3b33-442a-b5e6-1c2da8256faf` zurückgesetzt und als App
**13.82.168.104** / Core **4.82.223** erneut gelesen. Main blieb bei
`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`. Production, Supabase-Daten,
RLS, Edge Functions, Providerbudgets und Secrets wurden in diesem P11-Slice
nicht verändert.

## Nächster Schritt

P12 ist aktiv. Die Tagesprobe verwendet die P11-Wegefenster, um einen echten
Reisetag als günstigen, erwarteten und ungünstigen Ablauf zu zeigen. Sie nennt
für jede Abweichung den Beleg, hält unbekannte Wetter-, Verkehrs-, Öffnungs- und
Auslastungslagen unbekannt und bereitet Alternativen als einzelne Vorher/Neu-
Änderungen vor. Erst bestätigte Journey- oder Places-Befehle dürfen einen
Teilvorschlag übernehmen. Danach wird dieser Slice in derselben Arbeitswelle
mit P15 und P17 zum gemeinsamen Trip Composer verbunden.
