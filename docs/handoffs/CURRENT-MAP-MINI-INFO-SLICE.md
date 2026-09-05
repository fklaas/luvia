# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.88**, Core **4.82.210**. M16.5 Schritte 15–18 aktiv. P02/P03 ist der aktive Abschlussblock für den positiven Passend-Realbeleg. Apple ist ohne kostenpflichtige Mitgliedschaft geparkt und aus dem aktiven Plan entfernt.

**Zuletzt geliefert:** Gateway v206 / 4.64.23 ist auf Integration aktiv und liefert in der realen Scharbeutz-Diagnose 25 ausdrücklich vegetarisch oder vegan belegte OpenStreetMap-Orte. App 13.82.168.88 / Core 4.82.210 ist gebaut; sie bindet diese kostenlose Evidenz in denselben Alle-/Passend-Bestand ein und behält die strikte Steakhouse-Ausschlussregel. 229/229 Safe Regression und NFR-0 3/3 sind grün. Öffentlich läuft bis zur App-Abnahme weiterhin .87 auf Worker e0e393dd-701c-4fc6-afc2-58f88ee35996. Apple bleibt deaktiviert und geparkt.

**Nächster Schritt (AKTIV): App .88 veröffentlichen und OpenStreetMap-Passend sichtbar abnehmen.** Der reale Gateway-Beleg ist positiv; jetzt muss dieselbe providerbelegte Menge im angemeldeten Scharbeutz-UI als Pins erscheinen und bei Alle/Passend stabil umschalten.

**Abnahme dieses Schritts:**

- App 13.82.168.88 / Core 4.82.210 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle zeigt in Essen & Trinken weiterhin den breiten realen Place-Bestand ohne zusätzliche kostenpflichtige Ernährungsabfragen.
- Passend zeigt mehrere echte Orte mit ausdrücklicher vegetarischer oder veganer OpenStreetMap-Evidenz.
- Erdmann’s Kleines Steakhaus und andere fleischzentrierte Orte ohne dedizierten Ernährungstyp erscheinen nicht als passend.
- Ein sichtbarer Browserlauf belegt Quelle, Trefferzahl, Pin-Identität und Karteninteraktion; 229/229 Safe Regression und öffentliche Asset-Identität sind grün.
- Main, Production, Apple-Policy, Provider-Secrets und Nutzerdaten bleiben unverändert.

**Danach:** Nach dem positiven Places-Beleg dieselbe Place-ID und denselben Grund in Stay, Timeline-Vorschlägen und AI Chat abnehmen; danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme.

**Weiter offen:** P02/P03 aktiv: sichtbarer positiver Ernährungsevidenz-Beleg und danach Flächenparität; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist bis zu einem späteren ausdrücklichen Bezahl- und iOS-Veröffentlichungsentscheid geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen: Die Supabase-Free-Plan-Schonfrist wegen des Egress-Overruns im vorherigen Zyklus endet am 07.09.2026; der aktuelle Zyklus 23.08.–23.09.2026 lag zuletzt bei 2,359/5 GB Egress und 63.540/500.000 Edge-Function-Aufrufen.

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
