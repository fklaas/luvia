# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.195**, Core **4.82.314**. P17/P19: A2 auf Integration .195 ausgeliefert; echte Reisequalität wegen nachgewiesener Recherche-/Interpretationslücken weiter offen.

**Zuletzt geliefert:** Integration .195 / Core 4.82.314 aus 025f098b veröffentlicht; 242/242 kontrollierte Regression und 25/25 öffentliche Dateivergleiche PASS. A2 mit echter Places-Karte öffentlich bedient: genau ein Bearbeitungspanel, synchroner Pin und Spektrumrahmen, bei 1440 Pixeln getrennte Karte/Route ohne horizontalen Überlauf. Neuer realer Valencia-Hauptworkflow dca81147-2f1b-4127-801e-137f985568d2 erreicht nach 132,48 Sekunden ready_for_review: 7 Tage, 18 Orte, 77 Kandidaten, 6 Modellaufrufe / 70.007 Tokens im Hauptworkflow. Vorgelagerte Wunsch-/Zielinterpretation ist in dieser Summe nicht enthalten. Der formale Audit 88 ist KEINE inhaltliche Vollabnahme: keine Nachtleben-Kategorie, überwiegend Parks im Aktivitätspool und zu viele generische Kleinststopps. Keine bestätigte Trip-/Timeline-Übernahme.

**Nächster Schritt (AKTIV): Konkrete Erlebnisse und benannte Ziele als passende Providerquellen erschließen.** Der echte .195-Lauf liefert fast nur Parks unter Aktivitäten. Die Lonja-Suche liefert zwölf andere Sehenswürdigkeiten: Geoapify verwirft Namensfilter bei mehr als drei Wörtern und kann einen leeren Namenslauf zu allgemeiner Kategoriesuche erweitern. Diese Treffer wurden als spezifische Recherche gewertet. Der Wunsch nach lebendigen Abenden fehlt im Kategorienauftrag.

**Abnahme dieses Schritts:**

- Aktivitäten dürfen nicht allein durch generische leisure-/sport-Elternkategorien oder Parks als abgedeckt gelten.
- Benannte Zielsuche bleibt von generischer Kategoriesuche unterscheidbar; unpassende Treffer erfüllen keinen konkreten Rechercheauftrag.
- Wünsche einschließlich Abendgefühl und selbst ausprobieren erreichen Recherche und unabhängigen Audit vollständig.
- Erst die reproduzierten lokalen Quelle-/Kategoriefehler beheben, danach einen begrenzten echten Folgebeleg ohne wiederholte Gesamtplan-Schleifen.

**Danach:** Nach qualitativer Rechercheabnahme den Familien-/Konfliktfall und die übrigen P17/P19-Gates schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE: Erlebnisrecherche, benannte Ortsidentität, gebietsferne Reserve, Interpretation lebendiger Abende, Familien-/Konfliktfall, breite Kaltstarts, endgültige Konto-/Timeline-Übernahme, Mehrnutzer-Beitritt und physische Geräte.

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
