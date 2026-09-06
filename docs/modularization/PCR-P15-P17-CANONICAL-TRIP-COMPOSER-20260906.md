# PCR P15/P17 — Kanonischer Trip Composer

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.119**, Core **4.82.238**. M16.5 Schritte 15–18: P15/P17 bleibt aktiv und teilweise. App .119 enthält den neuen interaktiven Auftakt, volle Zeitraumdarstellung, Zielsuche für neue Orte und KI-Fehlerwiederaufnahme. Die echte Freitext-KI ist öffentlich mit HTTP 429 blockiert. P09/P10/P11/P12 behalten ihre begrenzten Belege. Stable Integration bleibt auf App .104; .119 ist ein unveränderlicher Prüfkandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** App .118/.119 liefert eine große wischbare Reisegefühl-Szene, einen bestätigungspflichtigen Intelligence-Reiseauftrag, alle gewählten Reisetage (bis 366), eine gemeinsame Places-Karte und bearbeitbare Tageszuordnung. Die neue Zielsuche verwendet den vorhandenen Geoapify-Gateway-Read ohne Google-Abhängigkeit; Rom und Lissabon wurden öffentlich gefunden und bestätigt. Der öffentliche Kategoriepfad zeigte fünf reale Lissabon-Orte über acht Reisetage. Yuki Ramen wurde vom ersten auf den achten Tag verschoben. Der echte KI-Aufruf antwortete dagegen wiederholt mit HTTP 429 / credit_balance_exhausted; ein erfolgreicher öffentlicher Modelllauf ist nicht belegt. .119 zeigt dafür eine lesbare Meldung und verwirft einen alten Fehler bei geänderten Wünschen ohne automatische Wiederholungsschleife. 45 gezielte Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 36/36 öffentliche Byteidentität sind grün. Die kontrollierte lokale KI-Antwort und sechs simulierte Schreibaktionen ersetzen keine echte KI-/Kontoabnahme.

**Nächster Schritt (AKTIV): P15/P17: den echten KI-Reiseauftrag als interaktive Tagesgeschichte abschließen.** Die Erzählweise und Dynamik des Luvia-Einstiegs sind das Vorbild. Der Nutzer verlangt ausdrücklich keinen übernommenen Kompass und kein zusätzliches Pflicht-Rätsel. Der neue Auftakt ist der Anfang; alle weiteren Schritte brauchen dieselbe mobile Qualität. Vor dem Produktabschluss muss die serverseitige KI-Ablehnung geklärt und die tatsächliche Planung positiv belegt werden.

**Abnahme dieses Schritts:**

- Nach Wiederherstellung des KI-API-Guthabens einen echten strukturierten Modellauftrag mit Profilrestriktionen, Freitext, Rückfrage und ausdrücklicher Bestätigung erfolgreich im öffentlichen Browser belegen. Keine ungeprüfte Erhöhung von Kostenlimits und kein als KI ausgegebener Regelfallback.
- Ziel, Zeitraum, Wünsche und tageweise Reisevorschau zu einer zusammenhängenden mobilen Szene ausarbeiten: Wischen, direkte Auswahlreaktionen, gemeinsame Places-Karte, nachvollziehbare Übergänge, Reisefarbe und Reduced Motion. Die Gestaltung wird auf Desktop und anschließend physischem iOS/Android abgenommen.
- Vorhandene P19/P20/P22/P23/P26 und P33/P34/P35-Kontextbelege für Wege, Öffnungen, Budget, Saison und Wetter in den bestätigten Reiseauftrag und die Tagesprobe einbinden; unbekannte Faktoren ausdrücklich offen lassen.
- Einen echten Konto-End-to-End-Lauf für Trip-Erstellung und genau ausgewählte Place-/Journey-Aktionen samt Datum, Dauer, Reload und Teilfehler-Wiederaufnahme belegen; danach die getrennte dauerhafte Profilbestätigung und den Trip-Lifecycle schließen.

**Danach:** Innerhalb P15/P17 bleiben separat bestätigte dauerhafte Identity-Übergabe und Archivieren/Löschen/Wiederherstellen der Reise verbindlich. Die übrige Context Matrix und AI-Parität bleiben in ihren P-Paketen; M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Datum: 2026-09-06  
Status: Foundation als unveränderlicher Integrationskandidat belegt; Blockabschluss noch offen
Betroffene Verträge: `trip.v1` (additiv), `places.v1` (nur lesend), reservierte Übergabe an `identity.v1`

## Problem

Der bestehende First Trip Composer besitzt bereits die richtige Trip- und Places-Grenze, bietet aber nur einen langen geführten Ablauf. Schnellstart und AI-gestützter Einstieg fehlen. Außerdem werden Anfragewünsche, reisebezogene Vorlieben und mögliche dauerhafte Profilvorlieben noch nicht als drei verschiedene Geltungsbereiche durch den Trip-Entwurf getragen. Eine direkte Erweiterung nur in der Oberfläche würde eine zweite Wahrheit neben dem Trip-Core erzeugen.

## Owner und Vertragsänderung

`core/trips/` bleibt alleiniger Owner des Trip-Entwurfs und der bestätigten Reise. `trip.v1` erhält additiv eine Scope-Projektion für:

- flüchtigen Anfragekontext (`request-only`, nicht in der Reise gespeichert),
- reisebezogene Vorlieben (`trip`, im `firstTripComposer`-Teil der Trip-Einstellungen gespeichert),
- eine ausdrücklich bestätigungspflichtige Identity-Übergabe (`durable`, nicht automatisch ausgeführt).

Bestehende Aufrufer ohne diese Felder behalten ihr bisheriges Verhalten. Es gibt keine Vertragsumbenennung und keine Änderung an vorhandenen Trip-Events.

## Kompatibilität und Daten

Die Änderung ist abwärtskompatibel. Es ist keine Datenbankmigration und keine Function-Änderung nötig. Alte Reisen ohne `entryMode` oder `tripPreferences` werden als geführte Erstellung mit leeren reisebezogenen Vorlieben gelesen. Der rohe Freitext der Anfrage und vorgeschlagene dauerhafte Profilwerte werden weder in `moduleSettings` noch in die Trip-Zeile geschrieben.

## Dateien

- `core/trips/trip-draft-core.js`
- `core/platform/trip-contract-adapter.js`
- `core/trips/trip-creator.js`
- `app/first-trip-composer.js`
- `app/first-trip-composer.css`
- `tests/m16.5z-first-trip-composer.test.cjs`
- Planungs- und Build-Nachweise nach Abschluss des Slices

## Abnahme

1. Geführt, Schnellstart und Luvia-AI-Entwurf laufen über dieselbe Oberfläche und denselben `trip.v1`-Command.
2. Schnellstart verlangt ein kanonisches Ziel und einen Zeitraum; fehlender Titel wird aus dem bestätigten Ziel abgeleitet.
3. Der AI-Einstieg zeigt eine Vorschau und kennzeichnet unbelegte Place-, Stay-, Wetter-, Öffnungszeit-, Auslastungs- und Budgetdaten als noch offen.
4. Anfragekontext erscheint nur im unveränderlichen Command-Beleg; reisebezogene Vorlieben erscheinen im Trip-Readback; die dauerhafte Identity-Übergabe bleibt `required` und wird nicht automatisch geschrieben.
5. Abbruch schreibt keine Reise. Ein wiederholter Create-Command bleibt idempotent.
6. Quelltests, Safe Regression, NFR-0 und ein sichtbarer Desktop-/Mobil-Browserlauf müssen grün sein, bevor der Kandidat als belegt gilt.

## Rollout und Rollback

Der Slice wird ausschließlich als unveränderlicher Integration-Kandidat veröffentlicht. Stable Integration wird nach sichtbarer Abnahme auf den zuletzt akzeptierten Worker zurückgestellt. Production und Main werden nicht verändert. Rollback ist die erneute 100-Prozent-Zuweisung des akzeptierten App-`.104`-Workers.

## Ergebnis und Restumfang

App `13.82.168.114` / Core `4.82.233` aus Commit `f1f732e8ca9a2cc2a209e4c58eb07ae4c9c3effa` ist als Worker `cf8876f5-26b4-426a-bab8-24017a0cf2d6` unveränderlich veröffentlicht. Geführt, Schnellstart und Luvia AI teilen sichtbar den Composer und die dynamischen Schrittfolgen 9/5/7. Ein lokaler sichtbarer End-to-End-Lauf bestätigte den AI-Weg bis zum idempotenten `trip.first.create`-Command; die Scope- und Persistenztests belegen die Trennung der drei Vorliebenbereiche. Safe Regression `235/235`, NFR-0 `3/3` und öffentliche Byteidentität `30/30` sind grün. Das Archiv hat 88.911.199 Bytes und SHA-256 `8AD1359F3F3D2D3609E60A655B7767E446064FD26312CA945BBFEB840C26229D`. Stable Integration wurde danach auf App `.104` / Core `.223` zurückgestellt; Main und Production blieben unverändert.

P15/P17 ist damit noch nicht vollständig geschlossen: Im öffentlichen Lauf blieb die kanonische Zielsuche auf „Suche läuft …“ stehen. Außerdem fehlen der echte tageweise Place-/Stay-Entwurf, die einzeln bestätigte Teilübernahme, der Reload-Beleg sowie Archivieren, Löschen und Wiederherstellen über den Trip Owner. Diese Punkte bilden den einen aktiven Folgeschritt.

## Nachweis Zielsuche .115

App `13.82.168.115` / Core `4.82.234` aus Commit `72ba8604f3d747e4bb7a439f083c39966af2e4c6` schließt das öffentliche Zielsuche-Gate. Der Places-Vertragsadapter liest zuerst das aktive kanonische `LuviaDestination` und kann ein bekanntes Reiseziel ohne externen Autocomplete- oder Details-Aufruf anbieten und bestätigen. Der Providerpfad besitzt zusätzlich eine Backendfrist von sieben Sekunden; die Oberfläche beendet Erfolg, leeres Ergebnis und Fehler nach spätestens 8,5 Sekunden und bietet bei einem Fehler „Erneut suchen“ an.

Der sichtbare öffentliche Integrationslauf wechselte in den Einstieg „Mit Luvia AI“, öffnete den Schritt „Ort“, gab „Scharbeutz“ ein, erhielt sofort „Scharbeutz, Deutschland“ sowie „Vorschläge bereit“ und bestätigte anschließend den kanonischen Ort. Safe Regression `235/235`, NFR-0 `3/3` und öffentliche Byteidentität `30/30` sind grün. Das Archiv `luvia-integration-13.82.168.115-72ba8604-public-bytes.zip` enthält 3.409 Einträge, hat 89.329.871 Bytes und SHA-256 `C26955D158BCC00759C9B55EBD3EC459EF38A0FACC9DB8B9A082555FF0F8274C`. Worker `03e79ebf-5d71-422a-b6f8-45d3a661b26f` bleibt unveränderlich erreichbar. Stable Integration wurde nach der Abnahme auf App `.104` / Core `.223` zurückgestellt; Main und Production blieben unverändert.

Das Such-Gate ist geschlossen. Für den Abschluss von P15/P17 fehlen weiterhin der echte tageweise Place-/Stay-Entwurf, die einzeln bestätigte Teilübernahme, der separat bestätigte Identity-Lifecycle und Archivieren, Löschen sowie Wiederherstellen der Reise über den Trip Owner.

## Ergänzungsdesign Tagesentwurf und Teilübernahme

Der nächste additive Schnitt erweitert `trip.v1 composition` um einen browserlosen Tagesentwurf. Der Trip Owner ordnet ausschließlich bereits von `places.v1` gelieferte kanonische Place-Identitäten einem begrenzten Tagesraster zu; er sucht keine Orte selbst und speichert weder Place-Fakten noch Journey-Zustand. `journey.v1 reads.rehearseDay` ergänzt die P12-Tagesprobe als abgeleiteten Beleg. Die gemeinsame `LuviaPlacesSpatialExperience.mountProjection` rendert dieselben Place-Projektionen wie Places und Timeline.

Vormerken, Einplanen, Tauschen und Weglassen verändern zunächst nur den flüchtigen Composer-Entwurf. Die finale Schaltfläche zeigt die vollständige Auswahl und gilt als gemeinsame ausdrückliche Bestätigung. Erst nachdem `trip.v1 commands.createFirstTrip` die neue aktive Reise bestätigt hat, werden ausgewählte Place-Aktionen über die vorhandene Human-AI-Action-Runtime und damit über `places.v1` vorbereitet und ausgeführt. Jeder Eintrag erhält einen stabilen Idempotency-Key und einen Owner-Receipt. Abbruch vor der finalen Bestätigung schreibt weder Trip noch Place- oder Journey-Zustand. Ein fehlgeschlagener Teilbeleg bleibt sichtbar wiederholbar und wird nicht als vollständig übernommen dargestellt.

## Nachweis Tagesentwurf und Teilübernahme .116

App `13.82.168.116` / Core `4.82.235` aus Commit `f37608e9de51906becedb964b6f69726deeca286` setzt das Ergänzungsdesign um. `trip.v1 composition.composeDayDraft` übernimmt ausschließlich kanonische, koordinatenbelegte Place-Projektionen aus `places.v1`, verteilt höchstens sechs Kandidaten über höchstens drei konkrete Reisetage und trägt Alternativen sowie unbekannte Faktoren getrennt. Der Composer sucht zuerst im gültigen aktiven Places-Kandidatenbestand und nutzt andernfalls höchstens drei begrenzte, parallel ergänzende freie Providerabfragen. Exakte Medien werden nur für die höchstens sechs ausgewählten Identitäten nachgeladen; fehlende Bilder, Öffnungszeiten, Wetter, Auslastung, Störungen, Preise und Buchbarkeit bleiben ausdrücklich unbekannt.

Die Oberfläche rendert die gemeinsame `LuviaPlacesSpatialExperience`-Karte, einen Abschnitt pro Reisetag und die nicht mutierenden Aktionen Einplanen, Vormerken, Tauschen und Weglassen. Datierte Tage werden vorab über `journey.v1 reads.rehearseDay` geprüft. Eine fehlende eindeutige Zeitzonenauflösung bleibt als offene Zeitprüfung sichtbar und erzeugt keinen geratenen Zeitpunkt. Erst die letzte zusammengefasste Bestätigung erstellt die Reise über `trip.v1 commands.createFirstTrip` und führt die ausgewählten Place-Aktionen mit stabilen Idempotency-Keys über die Human-AI-Action-Runtime aus. Ein Fehler nach bereits bestätigter Reiseerstellung wird als Teilfehler ausgewiesen und nicht als vollständiger Abbruch dargestellt.

Der lokale sichtbare End-to-End-Lauf zeigte neun Fixture-Places, sechs Entwurfseinträge, drei Tagesproben und die vier Auswahlarten. Nach einer Tausch-, Vormerk- und Weglassentscheidung bestätigte die Endseite fünf ausgewählte Aktionen; Trip Owner und alle fünf Place-/Journey-Aktionen lieferten bestätigte Receipts. Der öffentliche sichtbare Lauf auf dem echten Kandidaten wählte „Mit Luvia AI“, bestätigte „Scharbeutz, Deutschland“, setzte den Zeitraum 12.–14.06.2027 und die Schwerpunkte Essen & Trinken, Kultur und Aktiv sein. Die aktuellen freien Provider lieferten vier reale `places.v1`-Orte. Alle vier erschienen auf derselben Karte, verteilt über drei Reisetage mit stimmiger P12-Probe. Die sichtbare Teilwahl endete bei 2 einplanen, 1 vormerken und 1 weglassen; die letzte Seite zeigte „Reise und 3 Vorschläge bestätigen“. Dort wurde gestoppt, damit der öffentliche Nachweis keine echte Benutzerreise anlegt.

Safe Regression `235/235`, NFR-0 `3/3`, Human-AI-Register `333` Aktionen / `1.021` aktive Quellmarker und öffentliche Byteidentität `30/30` sind grün. Das saubere Archiv `luvia-integration-13.82.168.116-f37608e9-public-bytes.zip` enthält 3.279 getrackte Dateien, hat 89.114.238 Bytes und SHA-256 `8B1D8AB5E41F3DF4419FDC2F5B88846A6D70DFFBE9B983246853AFCAE34597A0`. Worker `05db1373-83af-4e71-9815-134e1a4d5e51` bleibt unveränderlich erreichbar. Stable Integration läuft wieder auf App `.104` / Core `.223`; Main, Production, Gateway, Datenbank, Secrets und Nutzerdaten blieben unverändert.

Der Lauf belegt eine erste Tagesentwurf-Projektion und eine lokale Teilübernahme mit simulierten Ownern. Er belegt keine vollständige Produktreife oder reale Teilfehler-Wiederherstellung. P15/P17 bleibt teilweise.

## Ergänzungsdesign Produktreife und Wiederherstellung .117

Vor der Codeänderung festgelegt: Der Composer bleibt Consumer von trip.v1, places.v1, journey.v1 und identity.v1. Kein neuer Domain-Store, keine direkte Datenbankmutation. Die bestehende sessionbezogene StoragePort-Ablage erhält versionierte Entwurfs- und Fortschrittsbelege. Ein bereits bestätigter Trip und erfolgreich quittierte Einzelaktionen werden nach Teilfehler und Reload fortgesetzt. Nach Beginn der Bestätigung ist die Auswahl gesperrt; die Wiederholung darf den bestätigten Inhalt nicht verändern. Nur ein passendes positives Owner-Receipt zählt als Erfolg.

Gleichzeitig werden feste Kalenderdaten, Zielkoordinaten, explizite Reisezeitzone, Entwurfsfrische und editierte Termine geprüft. Tauschen, Vormerken und Weglassen fließen in dieselbe abgeleitete Tagesprobe ein. Asynchrone Antworten dürfen einen verlassenen oder überholten Composer nicht verändern. Die Vorschlagssuche verwendet den gemeinsamen Provider-Router und kanonische Kategorien; gewählte Kategorien, Profilrestriktionen und Teilfehler werden erhalten. Freitext-Orchestrierung und vollständige Reiseplanung gelten bis zu eigenständigen Belegen ausdrücklich weiterhin als offen.

Abnahme: Verhaltensprüfungen mit echten Trip-/Action-Vertragsfunktionen und kontrollierten Owner-Antworten für Validierung, Reload nach Tausch, Teilfehler, unbekannte Receipts, Doppelbestätigung und Navigation. Zusätzlich sichtbarer Desktop-/Mobil-Browserlauf, Safe Regression und Integrationsnachweis. Änderungen umfassen vorhandenen Composer JS/CSS, Trip-Draft-Core, Fixture/Tests, Release-Metadaten und synchronisierte Fahrpläne. Stabile Integration und Main werden erst bei entsprechend nachgewiesener Freigabe ersetzt.
## Ergänzungsdesign .119: KI-Ablehnung und bearbeitbarer Fehlerzustand

Öffentliche .118-Gegenprobe: Rom und Lissabon werden korrekt aufgelöst. Der echte `planning.dialogue`-Aufruf antwortet wiederholt mit HTTP 429; der Client zeigt die technische Supabase-Fehlermeldung. Nach einer Änderung des Freitexts bleibt außerdem der alte Fehlerzustand bestehen. Vor Änderung festgelegt: ausschließlich der Composer-Consumer erhält eine lesbare KI-Fehlerprojektion und verwirft einen Fehlerentwurf bei geänderten Eingaben. Ein unveränderter Fehler löst keine automatische Wiederholungsschleife aus. Profilfrische wird auch im Fehlerzustand erfasst. Keine Änderung von Providerquoten, Authentifizierung, Secrets oder serverseitiger Capability. Zwei zusätzliche Verhaltensprüfungen belegen gedrosselte KI ohne Place-/Trip-Schreibaktion sowie erneute Entwurfsfähigkeit nach Eingabekorrektur. Der öffentliche KI-Positivnachweis bleibt bis zu einer tatsächlichen Modellantwort offen.

Öffentliche Gegenprüfung des ersten .119-Pakets: Die separate Composer-Datei war aktualisiert, das ausgeführte Postcontext-Bundle enthielt noch .118. Vor Abschluss wurde das Bundle aus denselben 262 Quellen neu gebaut. Das bestehende Runtime-Bridge-Gate prüft jetzt jede eingebettete Quelle gegen ihren aktuellen kanonischen Inhalt; es schlug am alten Paket nachweislich fehl. Der endgültige .119-Kandidat erhält einen eigenen Runtime-Commit, Worker und Archivhash. Eine ausschließlich lesende Serverabfrage belegt außerdem `credit_balance_exhausted` bei den letzten sechs `planning.dialogue`-Anfragen. Das API-Guthaben ist damit der konkrete externe KI-Blocker.

## Nachweis .117: Wiederherstellung und interaktive Gestaltung, kein Produktabschluss

Quelle: `995dd47ca3a32626336697c06cbaf9d2935c4c7f`, App `13.82.168.117`, Core `4.82.236`, Worker `d67daa6d-c84e-401b-8478-f758abaa227b`. Der unveränderliche Kandidat ist unter https://d67daa6d-integration-luvia.njwnrvwbv5.workers.dev erreichbar.

Behoben: Der sessionbezogene Entwurf erhält die tatsächlich getauschten Orte, Auswahlarten, Uhrzeiten und Dauern über Reload. Positive identitätsgebundene Trip-/Place-Receipts und Place-Readback sind Voraussetzung eines Erfolgs. Vor der ersten Mutation wird der Wiederherstellungsbeleg gesichert. Bestätigte Teilschritte werden übersprungen, eindeutig fehlgeschlagene Aktionen gehen über den vorhandenen Retry-Pfad, unbekannte Ergebnisse werden nicht blind wiederholt. Bestätigte Inhalte sind während einer unvollständigen Übernahme gesperrt. Ein Navigationsfehler nach dem Speichern ist vom Speicherergebnis getrennt. Ein Kontowechsel verhindert weitere Fremdkontoaktionen; eine verlassene Oberfläche wird nicht nachträglich überschrieben.

Feste Daten, reale Kalenderdaten, geografische Koordinaten und die explizite Reisezeitzone werden geprüft. Die öffentliche Journey-Tagesprüfung arbeitet mit den tatsächlich eingeplanten Orten und bearbeiteten Dauern. Vormerken und Weglassen entfernen den betreffenden Moment aus der Zeitprüfung. Kategorieabfragen verwenden den bestehenden Places-Cache und Anbieter-Router, übergeben explizite Kategorien ohne falsche Freitext-Kategorieeinschränkung und berücksichtigen alle gewählten Kategorien mit höchstens drei gleichzeitigen Reads. Ein einzelner verifizierter Vorschlag wird angezeigt; Teilfehler werden je Kategorie ausgewiesen.

Gestaltung: fortlaufende Reiseübersicht, Reisefarbe in den Bestätigungsschaltflächen, besser lesbare Tageskarten, bearbeitbare Uhrzeit und Dauer, Karte-zu-Karte-Fokus, erhaltene Karteninstanz beim Bearbeiten und kurze Schrittübergänge. Reduced Motion bleibt berücksichtigt. Die neu angeforderten Gesamtgestaltung und echte KI-Planung sind im gemeinsamen Produktentscheid dokumentiert; diese erste Gestaltungsrunde ist keine finale Designfreigabe.

Gemessen: **24** Verhaltensprüfungen mit echten Trip-/Intelligence-/Journey-Regeln und kontrollierten Schreibadaptern; **236/236** Safe Regression; **3/3** NFR-0; **30/30** öffentliche Byteidentität. Der sichtbare lokale Mobil-Lauf bei **390 × 844** bestätigte fünf simulierte Schreibaktionen nach Tausch, Vormerken, Weglassen und einer Änderung auf **135 Minuten**. Der sichtbare öffentliche Lauf lieferte **Strand Creperie, Kurhaus Scharbeutz, Augustuspark, Lionspark und Kurpark Scharbeutz** aus den gewählten Bereichen Essen, Kultur und Aktivitäten. Nach Teilwahl sank die Karte von fünf auf vier Pins; nach Reload blieben **3 einplanen / 1 vormerken / 1 weglassen** erhalten. Die letzte Schaltfläche zeigte vier zu bestätigende Vorschläge. Erfasste Browserfehler: **0**. Vor einer echten Kontoänderung wurde gestoppt. Der reale Trip-/Timeline-Readback ist deshalb weiterhin offen.

Archiv: `luvia-integration-13.82.168.117-995dd47c-public-bytes.zip`, **3.280 Dateien**, **89.090.937 Bytes**, SHA-256 `A21B18943F219CBE2F55DC9CEEBDC9FE41A5772D04DDC52E3975D3D0D65A16FD`. Lokale Belege: `outputs/composer117-release-regression.log`, `outputs/public-byte-proof117-v233.json`, `outputs/composer117-public-mobile.png`. Stable Integration wird nach der Abnahme auf den akzeptierten `.104`-Worker zurückgestellt. Main, Production, Datenbank, Provider-Secrets und veröffentlichter Gateway bleiben unverändert.

**Noch offen:** Tatsächliche Freitextinterpretation, begründete Planung der gesamten Reisedauer, echte Wege-/Budget-/Öffnungs-/Saisonkontexte, breite Originalbildabdeckung, finale interaktive Gestaltung, echte Kontoübernahme einschließlich Teilfehler-Readback, getrennte dauerhafte Profilbestätigung sowie Trip archivieren/löschen/wiederherstellen. P15/P17 bleibt teilweise. Die .116-Formulierung eines abgeschlossenen Tagesentwurfs war weiter als der damals gemessene Nachweis und wird ausdrücklich korrigiert.

## Ergänzungsdesign .118: bestätigter KI-Reiseauftrag und ganzer Zeitraum

Ergänzung vor Zielsuche-Fix nach Benutzer-Screenshot: Neue Ziele dürfen nicht von der blockierten Google-Autovervollständigung abhängen. Der bestehende Places-Web-Provider erhält einen reinen `destination.resolve`-Read über den vorhandenen Gateway; `places.v1` projiziert und hält dessen exakte Zielantwort begrenzt im Speicher. Keine Nutzung des mutierenden Legacy-Destination-Resolvers und keine Änderung der aktiven Reise. Die Platform-Netzwerksperre erhält eine gedrosselte Probe ausschließlich für diesen öffentlichen Read, solange der Browser online ist; echte Offline-/Providerbudget-/Berechtigungssperren bleiben wirksam. Öffentliche Zielauflösung wartet nicht auf ein fremdes Auth-Refresh. Keine Function-/DB-/Secret-Änderung. Tests umfassen Rom ohne Google, Koordinaten/ID-Readback, Netz-Cooldown/echtes Offline und Parallel-Drosselung.

Benutzerkorrektur zur Gestaltung: Die Erzählweise des Einstiegs ist Vorbild, ausdrücklich keine Wiederholung seines Kompassrätsels. Der Composer-Auftakt wird als interaktive Reisegefühl-Szene gestaltet; der vorhandene Kompass bleibt lediglich Markenzeichen. Kleine Gesten und direkte visuelle Reaktionen ersetzen zusätzliche Pflichtklicks. Diese scoped Consumer-Änderung verändert keine Domain-Schreibgrenzen.

Vor Implementierung festgelegt: `intelligence.v1` erhält additiv `interpretTripBrief`. Der Adapter verwendet die bereits veröffentlichte READ-Capability `planning.dialogue` mit ausgeschaltetem Modell-Fallback und explizitem neuen Reise-Kontext; der browserlose Intelligence-Owner projiziert die strukturierte Antwort in einen begrenzten Reiseauftrag. Bestehende Aufrufer bleiben kompatibel. Der Auftrag zeigt Verständnis, angewandte Kategorien/Tempo/Zeitrahmen, offene Anforderungen und höchstens eine wesentliche Rückfrage. Vor der Recherche bestätigt der Benutzer den Auftrag. Unverarbeitete harte Anforderungen werden ausdrücklich als offen geführt und erlauben nur vorgemerkte Ideen, keine behauptet erfüllte automatische Tagesplanung. Profilrestriktionen werden ausschließlich durch strengere Anfrageanforderungen ergänzt, nie überschrieben. Rohtext und Auftrag bleiben im bestehenden konto- und sessiongebundenen Composer-Entwurf; keine neue dauerhafte Domain-Wahrheit.

`trip.v1 composition.composeDayDraft` erhält den bestätigten Auftrag als optionale Quelle und bildet alle Kalenderdaten des gewählten Zeitraums ab (bis 366 Tage, darüber explizite Validierung statt Abschneiden). Nur kanonische Places werden verteilt; fehlende Kandidaten bleiben sichtbarer Freiraum. Keine erfundenen Routen, Öffnungen, Preise oder saisonalen Events. Datumwechsel ändern dieselbe Auswahlprojektion und deren Journey-Tagesprobe. Consumer und bestehende Recovery-Receipts bleiben verantwortlich für ausdrückliche endgültige Übernahme.

Betroffene Streams/Dateien: Intelligence-Owner `trip-preference-resolution-core.js`, Platform-Adapter `intelligence-contract-adapter.js`, Trip-Draft-Owner, Composer/gezielte CSS-Ergänzungen, Tests/Fixture und Release-/Planungsnachweise. Keine DB-Migration, Secrets- oder Function-Änderung; vorhandene Modell-Capability bleibt serverseitig unverändert. Keine breite visuelle Neugestaltung gemeinsam mit der Vertragsänderung.

Abnahme: echte Owner-Verhaltensprüfungen für Modellantwort/Fallback/Ausfall, unbekannte harte Anforderungen, Profilrestriktionen, Kategorien/Tempo/Zeitfenster, gesamten Zeitraum, Datumwechsel, veraltete Antworten und bestätigten Suchstart; sichtbare lokale und öffentliche Browserläufe mit sauber getrennter Modell-/Fixture-Evidenz, Regression/NFR-0/Byteprüfung. Rollout bleibt unveränderlicher Integration-Kandidat; Stable wird nach Prüfung auf akzeptierte `.104` zurückgestellt. P15/P17 bleibt bis zu vollständigen Kontext- und realen Konto-Lifecycle-Belegen teilweise.


## Nachweis .118/.119: interaktiver Auftakt, Zielsuche und ehrliche KI-Grenze

App .118/.119 liefert eine große wischbare Reisegefühl-Szene, einen bestätigungspflichtigen Intelligence-Reiseauftrag, alle gewählten Reisetage (bis 366), eine gemeinsame Places-Karte und bearbeitbare Tageszuordnung. Die neue Zielsuche verwendet den vorhandenen Geoapify-Gateway-Read ohne Google-Abhängigkeit; Rom und Lissabon wurden öffentlich gefunden und bestätigt. Der öffentliche Kategoriepfad zeigte fünf reale Lissabon-Orte über acht Reisetage. Yuki Ramen wurde vom ersten auf den achten Tag verschoben. Der echte KI-Aufruf antwortete dagegen wiederholt mit HTTP 429 / credit_balance_exhausted; ein erfolgreicher öffentlicher Modelllauf ist nicht belegt. .119 zeigt dafür eine lesbare Meldung und verwirft einen alten Fehler bei geänderten Wünschen ohne automatische Wiederholungsschleife. 45 gezielte Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 36/36 öffentliche Byteidentität sind grün. Die kontrollierte lokale KI-Antwort und sechs simulierte Schreibaktionen ersetzen keine echte KI-/Kontoabnahme.

Runtime **f8384a38eec543c1a5f24a3fb82cfb5d477a07ab**, App **13.82.168.119**, Core **4.82.238**, Worker **6433ad04-a862-4ee0-879c-da982a13c230**. https://6433ad04-integration-luvia.njwnrvwbv5.workers.dev bleibt unveränderlich erreichbar. 36/36 öffentliche Dateien entsprechen dem sauberen Deployment-Commit. Archiv: `luvia-integration-13.82.168.119-f8384a38-public-bytes.zip`, 3280 Dateien, 89118337 Bytes, SHA-256 `95CAA8C60C871A9A7E5CCAD19BEF036DC98FEC02B5930182F3B1E94CCA5C7555`. Stable ist nach dem Prüffenster wieder auf Worker `7cda6e20-3b33-442a-b5e6-1c2da8256faf` / App .104 / Core .223.

Die neue Reisegefühl-Szene wurde bei 390 × 844 Pixeln sichtbar geprüft. Freitextinterpretation, harte Tagesgrenzen, vegetarische/vegane Schutzregeln, eine Rückfrage, Auftragsbestätigung vor Recherche und volle Reisedauer wurden mit den echten Ownern und kontrollierten Modell-/Schreibadaptern getestet. Der öffentliche Dienst lehnt `planning.dialogue` dagegen mit HTTP 429 ab. Die anschließende ausschließlich lesende Abfrage von ai_usage_events belegt bei den letzten sechs planning.dialogue-Aufrufen jeweils credit_balance_exhausted. Ein erfolgreicher neuer Modelllauf setzt verfügbares API-Guthaben voraus. Es wurde kein Limit angehoben und keine kostenpflichtige Aufstockung vorgenommen. Die Ausgabe wurde nicht durch einen behaupteten KI-Erfolg ersetzt.

Öffentlich funktionierte nach ausdrücklichem Entfernen des Freitexts die kategoriale Suche mit Essen/Kultur: Yuki Ramen, Edifício dos Leões-Espaço Santander, A.space, Fado & Fado und Castille de São Jorge. Dies ist der belegte Kategorienpfad, kein erfolgreicher KI-Freitextlauf. Acht Reisetage bleiben sichtbar; fehlende Vorschläge sind Freiraum. Provider-Teilausfälle und fehlende Originalfotos bleiben offen. Eine echte Reiseübernahme wurde nicht durchgeführt.

Belege: `outputs/composer119-release-regression-final.log`, `outputs/public-byte-proof119-v233.json`, `outputs/composer118-public-ai-error.json`, `outputs/composer118-public-day8.png` und `outputs/composer118-mobile-opening.png`. P15/P17 bleibt teilweise; die noch fehlenden öffentlichen KI-, Kontext-, vollständigen Gestaltungs-, physischen Mobil- und realen Konto-/Lifecycle-Belege werden nicht als erledigt markiert.

## Korrektur 2026-09-06: Origin-Freigabe des tatsächlich ausgelieferten Composers

Der Nutzer meldet weiterhin eine defekte Orts-/Regionsauswahl und lehnt den Slider als finale Gestaltung ab. Gegenprobe am veröffentlichten Kandidaten `6433ad04-integration-luvia.njwnrvwbv5.workers.dev`: Gateway und Intelligence antworten auf den Browser-Preflight mit HTTP 403; die stabile Integrationsadresse erhält jeweils HTTP 204. Die vorherige Zielsuche-Abnahme auf Stable deckte diese Origin-Abweichung nicht ab.

Scope vor Implementierung: Platform/Gateway und Intelligence ergänzen ausschließlich die HTTPS-Versionsadressen des eigenen Workers `integration-luvia` im eigenen Cloudflare-Account `njwnrvwbv5` um eine begrenzte Origin-Freigabe. Keine Wildcard, keine Freigabe anderer Accounts; bestehende Authentifizierung, Domain-Commands, Budgets und Provider bleiben unverändert. Die Produktaufteilung wird nicht geändert. Die bereits autorisierte Backend-Reparatur wird in beiden vorhandenen Functions veröffentlicht; vorher werden die aktuellen Serverquellen gesichert und mit Git verglichen. Abweichende Live-Implementierungen dürfen nicht mit älteren lokalen Quellen überschrieben werden. Rollback: gesicherte Quellen Gateway v233 / Intelligence v36 erneut veröffentlichen. Frontend .119, Stable .104, Main und Production-Frontend bleiben auf ihren bisherigen Versionen.

Abnahme: ausführbare Origin-/Preflight-Gegenproben einschließlich fremder Accounts, Lookalike-Hosts und weiterhin geschützter Aktionen; kontrollierte Regression; reale öffentliche Zielauflösung aus der exakten Kandidaten-Origin im Browser. Positive KI-Planung bleibt separat durch das zuvor belegte API-Guthabenproblem blockiert.

Gestaltung: Der bisherige Slider ist eine verworfene Gestaltungsrichtung, kein abgenommener interaktiver Auftakt. Als nächster gestalterischer Schritt werden mehrere Konzepte einer mobilen spielbaren Reisewelt zur Auswahl ausgearbeitet. Erst die gewählte Richtung wird als zusammenhängende Szene umgesetzt.
