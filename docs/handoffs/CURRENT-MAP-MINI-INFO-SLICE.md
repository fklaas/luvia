# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.156**, Core **4.82.275**. P17/P19 aktiv und teilweise: App .156 / Core .275 und Intelligence v48 / 4.39.0 laufen auf Integration. Der reale Valencia-Auftrag belegt fünf semantische Richtungen, drei Zeitfenster, direkten Gesamtplanstart und tageweise Fehlerisolation. Der vollständige positive Entwurf ist noch durch einen Job-Fingerabdruckkonflikt blockiert. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Fortsetzbarer 24-Stunden-Reiseauftrag, ein aktiver Job je Fähigkeit, 8-Aufruf-/180.000-Token-Rahmen, inkrementelle Checkpoints, serverseitig erhaltene Reisebrief-Projektion, gezielte Kategorienachversorgung, datierte Tagesreparatur, Erhalt gültiger und teilweise reparierter Tage sowie evidenzbewusster Audit sind auf Integration aktiv. Der freie reale Wunsch erzeugte Palma, Málaga, Valencia, Nizza und Split, bot fünf neue Vorschläge, leitete drei Juni-Fenster ab und startete nach Zeitwahl ohne zusätzlichen Wunschschritt. 240/240 Regression und 16/16 öffentliche Byteidentität sind belegt.

**Nächster Schritt (AKTIV): Job-Fingerabdruck vereinheitlichen und Valencia bis zur Review-Freigabe abschließen.** Der reale Gesamtplan bewahrt inzwischen gültige Tage und begrenzt Provider-Nachversorgung. Die nächste konkrete Blockade ist ein reproduzierter AI_JOB_IDEMPOTENCY_CONFLICT zwischen clientseitiger Job-ID und serverseitig übertragener Eingabe.

**Abnahme dieses Schritts:**

- Client und Server bilden die Job-Identität aus exakt derselben kanonischen, tatsächlich übertragenen Eingabe; Änderungen an Kandidaten oder Reparaturtagen erzeugen eine neue Job-ID, identische Wiederaufnahmen verwenden dieselbe.
- Eine fehlende oder leere Kategorien-Coverage wird höchstens einmal nachversorgt; Reload startet keinen zweiten Providerlauf und vorhandene Kandidaten bleiben erhalten.
- Der frische Valencia-Auftrag 12.–18.06.2027 endet mit Reiseversprechen, sieben vollständigen Tagen, kontextuellen Zeiten, Freiraum, Tagesbalance, Unsicherheiten, Buchungsreihenfolge, Unterkunftsradius und Audit-Freigabe.
- Modell, Token, Kosten, Phasenlatenz und Reparaturzahl werden für den positiven Lauf aus der serverseitigen Telemetrie dokumentiert.

**Danach:** Nach dem positiven Valencia-Lauf folgt als zweiter P17/P19-Nachweis der Familien-/Ferienfall. Danach werden Konfliktmoderator und semantische Ablehnungsdiagnose auf den Teilreparaturpfad gesetzt; anschließend schließen P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert die gemeinsame Produktsprache ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: Job-Fingerabdruck, zwei reale Positivläufe, gemessene Kosten/Latenz, Konto- und Timeline-Übernahme, physische Geräte sowie datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. P16: Konfliktmoderator und Ablehnungsdiagnose. Reise-DNA und Bisherige Auswahl/Zeitreise sind umgesetzt; Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen. P02/P03, P07/P08 und P09–P12 behalten ihre dokumentierten Provider- und Gerätegates.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md)
- [Ergänzender Nachweis und Status](../modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
