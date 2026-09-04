# Luvia aktueller Integrationsstand

Stand 4. September 2026. App **13.82.168.44**, Core **4.82.168**, Channel **integration-preview**. Runtime-Familie: **M16.5 Places and Stays Quality**.

## Aktueller P09 Fortschritt

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Nächster zusammenhängender Abschnitt: Connect, Mehrfach-Reorder, weitere Eintragsarten und dauerhafte Delete/Restore-Wege; dazu Quellen, Konflikte und Resultate verständlich erklären. Fotos und echte Booking-Partner bleiben eigene offene Nachweise.

Maßgeblich sind docs/planning/status-plan.v1.json, docs/planning/STATUSPLAN-2026-09-04.md, docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.

Main bleibt bei c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba. Vorheriger Integration-Rollback: App .43, Quelle 466aaa9e38c116409b375ffe07020787a1c2465b. Bereits vorhandener gemeinsamer Booking-Resolver: 2.8.0-venue-service-reservation-anchor, Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34. Keine neue Function, Migration oder Secret-Änderung in diesem P09-Slice.
