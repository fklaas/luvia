# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.48**, Core **4.82.170**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** P09 Verbinden und Mehrfach-Reorder ist in Runtime .48 begrenzt belegt. Zwei geplante Places lassen sich nach Auswahl und lesbarer Vorher/Nachher-Prüfung als gemeinsamer Weg ordnen. Owner-Revisionen, Booking-Gate, Konfliktzustimmung, ehrlicher Teilfehler und eine reloadfeste Rücknahme sind umgesetzt. Der sichtbare 477×900-Browsertest und der angemeldete Live-Zyklus auf der stabilen Integration bestanden einschließlich zweier Reloads und exakter Wiederherstellung. 216/216 Safe Regression und 30/30 öffentliche Dateihashes stimmen. Beim ersten echten Reload erschien die Timeline kurz leer, bevor die zwei Owner-Einträge eintrafen; dieser First-Paint bleibt offen.

**Nächster Schritt (GEPLANT): Weitere Timeline-Eintragstypen sicher bearbeiten und den kurz leeren First-Paint schließen.** Place-Einträge besitzen jetzt sichere Einzel- und Gruppenänderungen. Buchungen, bestätigte Besuche und Memory-/Foto-Momente brauchen dieselbe sichtbare Fähigkeitslogik über ihre jeweiligen Owner; zugleich darf die Timeline beim Reload nicht vorübergehend wie ein wirklich leerer Reisetag wirken.

**Abnahme dieses Schritts:**

- Für Booking-, Visit- und Memory-/Foto-Einträge pro Aktion sichtbar festlegen, was erlaubt, nur weiterleitbar oder bewusst gesperrt ist; keine Owner-Wahrheit in Journey kopieren.
- Erlaubte Bearbeitung, Verbindung, Reihenfolge, Entfernen und Wiederherstellen jeweils mit Vorher/Nachher, aktueller Revision, Abhängigkeiten, Bestätigung, Readback und reloadfester Rücknahme ausführen.
- Beim Reload sofort den letzten verlässlichen Tagesstand oder einen eindeutigen Ladezustand zeigen; niemals kurz „0 Momente / Offen“ als scheinbaren Endzustand anzeigen, wenn Owner-Daten noch geladen werden.
- Den kombinierten Ablauf sichtbar bei mobiler Breite und Desktop prüfen, Teständerungen vollständig zurücksetzen und Safe Regression sowie öffentliche Byte-Gleichheit erneut belegen.

**Danach:** P09/P10 mit physischem iPhone/Android und echten Mehrnutzerkonflikten nachschärfen; danach die vollständige B1-Nutzerkette samt Human↔AI-Parität und geltenden Freigabegates schließen.

**Weiter offen:** Vollständige P09/P10- und Human↔AI-Abnahme, reale Geräte und Mehrnutzerfälle; die gemeldete Places-Kategorie-/Ausschnittskontinuität bleibt als P02/P03-Wiederholungsmatrix aktiv; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
