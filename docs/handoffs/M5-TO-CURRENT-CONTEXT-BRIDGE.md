# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.170**, Core **4.82.289**. P17/P19 aktiv und teilweise: App .169 / Core .288 und Intelligence v52 / 4.40.2 sind öffentlich auf Integration. App .170 / Core .289 mit Integration-Intelligence 4.41.0 ist der geprüfte lokale Kandidat. Er ergänzt fehlende Places genau einmal, begrenzt jeden OpenAI-Schritt serverseitig, reduziert die strukturierten Ausgabelimits, zeigt fünf reale Planungsphasen mit Laufzeit und nimmt denselben Auftrag nach Offline, Sperrbildschirm oder Tab-Wechsel wieder auf. Integration erhält dafür einen eigenen Edge-Function-Einstieg; Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag, Richtung A, Kategorienfarben, Kartenkopplung, räumliche Streuung, harte Interessenabdeckung, Tagesbalance, Freiraum, Unsicherheitskarte und Buchungsreihenfolge bleiben erhalten. .170 übernimmt zusätzlich einen lokal oder serverseitig vorhandenen Places-Katalog und führt bei knapper Kandidatenzahl genau eine checkpointete fokussierte Nachfüllung aus. Die vollständige KI-Planung zeigt Wünsche verstehen, passende Places finden, alle Tage komponieren, unabhängigen Audit und gezielte Verbesserung als echte Zustände mit laufender Zeit. Offline startet keine KI-Arbeit; Vordergrund und Page-Restore lesen denselben Workflow, dieselbe semantische Generation und dieselbe Idempotenz-ID. Fehlgeschlagene Jobs werden nicht mehr still erneut bezahlt. OpenAI-Aufrufe enden je nach Fähigkeit nach 28 bis 65 Sekunden mit einem sichtbaren Fehler, verwaiste Jobs werden nach 90 Sekunden abgeglichen. Die Tokenobergrenzen sinken auf 4.000 für den Reiseauftrag, 9.000 für den Gesamtplan, 4.500 für eine Tagesreparatur und 3.500 für den Audit.

**Nächster Schritt (AKTIV): App .170 und die getrennte Integration-Intelligence veröffentlichen und den vollständigen mobilen Plan öffentlich abnehmen.** Der letzte öffentliche Lauf nutzte noch .169 und konnte einen hängenden Modellaufruf mit spätem Lease-Recovery und stiller Fehljob-Wiederholung über mehrere Minuten ziehen. Der neue Kandidat beseitigt diese Ursache und hält gleichzeitig die fokussierte Places-Nachfüllung für den 20-von-22-Blocker bereit.

**Abnahme dieses Schritts:**

- App .170 / Core .289 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration ruft die separat veröffentlichte Function luvia-intelligence-integration mit Health 4.41.0 auf; die produktive Function luvia-intelligence und Main/Production bleiben unverändert.
- Die Warteansicht zeigt fünf verständliche reale Arbeitsphasen, verstrichene Zeit, ungewöhnlich lange Dauer, Offline-Zustand und den Abgleich nach Sperrbildschirm oder App-Wechsel.
- Vordergrund, Page-Restore und Netzrückkehr verwenden denselben Workflow und dieselbe Idempotenz-ID; ein fehlgeschlagener bezahlter Job wird ohne sichtbaren Nutzer-Neuversuch nicht erneut ausgeführt.
- Ein OpenAI-Hänger endet serverseitig nach höchstens 65 Sekunden pro Planungsfähigkeit; ein verwaister Job wird nach 90 statt 240 Sekunden wieder lesbar oder gezielt wiederaufgenommen.
- Der öffentliche vollständige Reiseplan erreicht den ungespeicherten Review oder zeigt innerhalb des begrenzten Ablaufs einen konkreten sichtbaren Fehler; eine zehnminütige stumme Wartephase ist ausgeschlossen.
- Der bisherige 20-von-22-Places-Fall übernimmt den vorhandenen Katalog und führt höchstens eine fokussierte Nachfüllung aus, bevor Plan und Schlussaudit starten.
- Tagespunkt und echter Places-Pin fokussieren sich gegenseitig; Kategorien behalten Compass-Farben und der aktive Eintrag zeigt den vollständigen Luvia-Spektrumrahmen.

**Danach:** Nach dem öffentlichen mobilen Positivlauf folgen autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung, danach die Abnahme von räumlicher Streuung, Strandabdeckung und Kategorienmix. Anschließend werden P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache sowie die modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .170 samt getrennter Integration-Intelligence öffentlich beweisen, reale Laufzeiten messen und den Gesamtplan bis zum ungespeicherten Review führen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
