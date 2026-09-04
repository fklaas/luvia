# P09 Release Candidate 13.82.168.44

In Prüfung: bestätigte Zeitänderung, Langdruck-Verschiebemodus und dauerhafte Rücknahme. Noch kein neuer öffentlicher Release-Nachweis.

Runtime-Familie: M16.5 Places and Stays Quality.

# Luvia aktueller Integrationsstand

Stand 4. September 2026. B1 verbindet die gemeinsame Places-Suche mit dem Chat und einer sichtbaren Prüfung von Tag und Uhrzeit vor der Planung.

- App: **13.82.168.43**
- Core: **4.82.168**
- Channel: **integration-preview**
- Runtime source: **466aaa9e38c116409b375ffe07020787a1c2465b**
- Worker: **3a431617-48ba-42cf-adfb-0e3fc27dd9fa**
- Gateway: **v161 ACTIVE**, unverändert
- Safe Regression: **212/212 PASS**
- Öffentliche Asset-Identität: **25/25 MATCH** gegen das unveränderliche Releasearchiv
- Main: **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba**, unverändert

## Aktueller B1 Fortschritt

Die Reservierungsprüfung zeigt ihren nächsten Schritt jetzt direkt unter dem auslösenden Button. Der zusätzliche Live-Read entdeckte einen falschen Zimmerlink für ROOF. Booking Resolver 2.8.0 (Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34) prüft nun auch die Art der Buchung und erhält gültige Reservierungsanker auf der offiziellen Ortsseite. ROOF führt zum Tischreservierungsbereich. Eine erreichbare Reservierungsseite bestätigt noch keine freien Zeiten; es wurde nichts versendet.

Integration läuft auf 13.82.168.43. Der zuvor leere Chat-Suchpfad wurde repariert: Kandidatenfenster und sichtbare Auswahl sind getrennt, der lokale Zielortkontext bleibt erhalten, allgemeine Suchverben werden nicht als Ortsmerkmale behandelt und vegetarische Empfehlungen benötigen belegte Eignung. Beim Ausschnittswechsel bleiben Suchauftrag und Aktionsangebote erhalten. Leere Ergebnisse werden ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.


Places und Stays teilen die räumliche Technik. Neben dem Frontend wurde die bestehende gemeinsame Funktion booking-route-resolve aktualisiert. Providerbudgets, Secrets und Datenbankschemas bleiben unverändert. Discovery verwendet Geoapify → TomTom → HERE; Routing ORS → TomTom → Geoapify → HERE. Grenzen sind interne Limits, kein Kontorestguthaben.

Aktive Steuerung: [Statusplan](docs/planning/STATUSPLAN-2026-09-04.md), [Masterfahrplan](docs/planning/MASTERFAHRPLAN-v6.md) und [sichtbare Abnahme](docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md). Der [historische Buildtext](docs/planning/archive/2026-09-04-before-consolidation/CURRENT-BUILD.md) bleibt unverändert.

Rückfall: Integration auf das Quellarchiv der letzten kompatiblen Frontend-Version zurücksetzen; Backend v161 und Budgetzähler erhalten. Kein Main-Frontend-Deploy; die oben benannte Booking-Funktion gehört zum gemeinsamen Backend. B1 bleibt aktiv; P09/P10 und die vollständige Golden Journey sind nicht geschlossen.
