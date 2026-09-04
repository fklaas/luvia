# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.48**, Core **4.82.170**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** P09 Entfernen/Wiederherstellen ist in Runtime .47 begrenzt belegt: geplante Places werden erst nach lesbarer Vorschau und Bestätigung entfernt. Ein dauerhafter Recovery-Beleg im Places-Owner-Datensatz überlebt Reloads; die Wiederherstellung prüft ursprünglichen Termin, aktuellen Konfliktstand, Versionsstand und Booking-Gate erneut. Grande Beach Café wurde sichtbar entfernt → neu geladen → wiederhergestellt → erneut neu geladen; Termin, Dauer und Eintrag blieben korrekt. Favorit, Ortsdaten und Booking bleiben getrennt. 214/214 Safe Regression und 30/30 öffentliche Dateihashes stimmen.

**Nächster Schritt (GEPLANT): Timeline-Momente verbinden und mehrere Einträge geordnet verschieben.** Einzelne geplante Places können jetzt sicher geändert, entfernt und wiederhergestellt werden; für zusammengehörige Urlaubsmomente fehlen noch eine bewusste Verbindung und ein atomar erklärter Mehrfach-Reorder.

**Abnahme dieses Schritts:**

- Mindestens zwei geplante Places auswählen, ihre beabsichtigte Verbindung und die Vorher/Nachher-Reihenfolge mit Datum, Uhrzeit, Dauer und Wege-/Konfliktwirkung vor dem Schreiben zeigen.
- Erst nach Bestätigung über journey.v1 und die jeweiligen Owner speichern; veraltete Revision, Teilfehler, Booking-Abhängigkeit und wiederholte Befehle nachvollziehbar behandeln.
- Im sichtbaren Browser verbinden und mehrfach umordnen, reloaden und unabhängig lesen; Prüfänderungen vollständig zurücksetzen und gezielte Regression belegen.

**Danach:** Weitere P09-Eintragsarten schließen und P10-Erklärungen ergänzen; danach die vollständige B1-Nutzerkette sowie Human↔AI-Parität und die geltenden Freigabegates abnehmen.

**Weiter offen:** Vollständige P09/P10- und Human↔AI-Abnahme, physisches iPhone/Android und echte Mehrnutzerfälle; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
