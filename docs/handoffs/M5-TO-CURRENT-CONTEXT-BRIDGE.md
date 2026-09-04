# Kontext von M5 bis zum aktuellen Stand

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
