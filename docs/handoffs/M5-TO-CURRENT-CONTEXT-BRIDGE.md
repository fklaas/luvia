# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.172**, Core **4.82.291**. P17/P19 aktiv und teilweise: App .171 / Core .290, Worker e1b49cef-2ff4-45e0-af21-26048004b28a und Integration-Intelligence 4.42.0 sind öffentlich auf Integration; 22/22 Bytes stimmen. Der mobile Hintergrundwechsel setzte denselben Auftrag fort. Der reale Valencia-Lauf belegte danach den nächsten frühen Blocker: 17 echte Places wurden von einer starren 19er-Mindestmenge abgelehnt. App .172 / Core .291 ist der aktive adaptive Planungskandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** Die .171-Laufzeit beendet trip.compose nach 50 Sekunden, verwaiste Jobs nach 60 Sekunden sichtbar und startet ohne ausdrücklichen Nutzer-Neuversuch keinen bezahlten Lauf erneut. Die öffentliche Warteansicht zeigt fünf reale Phasen, verstrichene Zeit und aktive Arbeitsgegenstände. Der Hintergrundwechsel ist öffentlich ohne Auftragsverlust belegt. Der folgende Valencia-Lauf scheiterte nicht mehr minutenlang, sondern früh an 17 statt 19 belegten Orten. .172 korrigiert diesen neu belegten Vertragsfehler: Ein kleiner belegter Katalog wird über bewusst leichtere volle Tage verteilt. Jeder aktive Tag behält mindestens einen echten Place, zusätzliche freie Zeit bleibt erkennbar, und unbekannte Orte werden weiterhin niemals erfunden. Der neue Fall ist im Composer verhaltensgeprüft.

**Nächster Schritt (AKTIV): App .172 ausschließlich auf Integration veröffentlichen und den vollständigen mobilen Valencia-Neuversuch bis zum ungespeicherten Review messen.** Der öffentliche .171-Lauf hat Wiederaufnahme, Kostenbegrenzung und sichtbare Fehler bestätigt, wurde aber vor dem Modell durch die starre Forderung nach 19 unterschiedlichen Places blockiert. .172 muss belegen, dass 17 echte Orte zu sieben vollständigen, bewusst gelockerten Tagen werden und die begrenzte Kompositionsphase anschließend Review oder klaren Fehler erreicht.

**Abnahme dieses Schritts:**

- App .172 / Core .291 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration verwendet weiter die getrennte Intelligence 4.42.0; produktive Intelligence, Main und Production bleiben unverändert.
- 17 belegte Valencia-Places dürfen sieben Tage tragen: einzelne volle Tage werden auf zwei Orte gelockert, jeder aktive Tag behält mindestens einen belegten Place und Freiraum ist sichtbar.
- Die Warteansicht zeigt reale Phasen, Gesamtzeit und aktive Arbeitsgegenstände; Vordergrund und Page-Restore verwenden denselben Auftrag.
- Ein trip.compose-Hänger endet nach 50 Sekunden; ein verwaister Job wird nach 60 Sekunden sichtbar terminal und ohne Nutzer-Neuversuch nicht erneut bezahlt.
- Der öffentliche Plan erreicht den ungespeicherten Review oder einen konkreten sichtbaren Fehler innerhalb des begrenzten Ablaufs.
- Tagespunkt und echter Places-Pin fokussieren sich gegenseitig; Kategorien behalten Compass-Farben und der aktive Eintrag zeigt den vollständigen Luvia-Spektrumrahmen.

**Danach:** Nach dem gemessenen mobilen Positivlauf folgen autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung, danach die Abnahme von räumlicher Streuung, Strandabdeckung und Kategorienmix. Anschließend werden P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache sowie die modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .171 samt Integration-Intelligence 4.42.0 öffentlich messen und den Gesamtplan bis zum ungespeicherten Review führen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
