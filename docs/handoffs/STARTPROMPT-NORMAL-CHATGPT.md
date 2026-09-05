# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert; der nächste externe Abschlussblock bleibt B1/P02–P03 für einen positiven Google-Places-Ernährungsbeleg. A1 Dokumentkonsolidierung wird mit diesem Release fortgeschrieben; A2 ist teilweise belegt.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2 bei 100 Prozent Traffic. Bestätigte Besuche werden über den Places Visit Owner revisionssicher gelesen, korrigiert, entfernt und nach Reload wiederhergestellt; doppelte Legacy-Projektionen sind unterdrückt und private Felder bleiben aus dem öffentlichen Vertrag. Die Supabase-Constraint ist für neun Visit-Zustände verifiziert. Sichtbarer 477×900-Browsertest, öffentlicher Timeline-/Places-Nachweis, 227/227 Safe Regression und 30/30 öffentliche Bytevergleiche PASS. Sauberes Archiv: 88.771.845 Bytes, SHA-256 3A8E4592EDF325F40AC7A7BC84BBACBFBFBB8E2E56356F6A0A6CDAD3F0CF7239. Der Standard-Worker wurde nach einer falschen Zieladressierung aus dem unveränderten Main-Commit wiederhergestellt und bytegleich geprüft; Git-Main blieb unverändert.

**Nächster Schritt (AKTIV): Google Places für den positiven Ernährungsbeleg freischalten und sichtbar abnehmen.** Vertrag, Negativregeln und providerübergreifende Kaskade sind grün. Google besitzt laut Nutzerangabe 1.000 Aufrufe pro Tag, antwortet am öffentlichen Gateway aber noch mit 403; HERE liefert lokal keine expliziten Ernährungsfakten und Foursquare besitzt keine Credits.

**Abnahme dieses Schritts:**

- Im bereits geöffneten Google-Cloud-Projekt anmelden und das richtige Projekt bestätigen.
- Places API (New), aktives Billing und eine ausschließlich auf die benötigte Places-Suche beschränkte Server-Key-Konfiguration prüfen.
- Der öffentliche Health-Probe wechselt von HTTP 403 zu einer erfolgreichen, budgetierten Google-Antwort ohne Schlüssel- oder Rohdatenoffenlegung.
- Essen & Trinken zeigt für das vegetarische Profil mindestens einen realen Passt-Pin und weiterhin kein unbewiesenes Steakhouse.
- Places, Timeline und AI Chat zeigen dieselbe Provider-ID, denselben Reisezielradius und einen lesbaren providerbelegten Passend-Grund.
- Stable und Immutable Integration, Bytegleichheit, Regression und der unveränderte Git-Main-Stand sind belegt.

**Danach:** Danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: positive Google-Freigabe und öffentlicher Ernährungsbeleg sowie vollständige UI-/AI-/Foto- und physische Mobilabnahme. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Wir setzen Luvia auf dem tatsächlichen aktuellen Git-Stand fort. Lies HANDOFF-NORMAL-CHATGPT-CURRENT.md, CURRENT-BUILD.md, docs/planning/STATUSPLAN-2026-09-04.md und den Masterfahrplan v6. Integration ist dokumentiert App 13.82.168.44 / Core 4.82.168 / Gateway v161. Prüfe den Zustand, bevor du ihn als aktuell ausgibst.

M16.5 und B1 bleiben aktiv. Arbeite mit der sichtbaren Scharbeutz-Golden-Journey weiter, danach P09 und P10. B0 ist Steuerungsgrundlage, keine vollständige AI-Produktabdeckung. Echte Fotos, positive Booking-Zugänge und Hardwaretests bleiben offen.

Nutze tatsächlich vorhandene Werkzeuge direkt. Fehlen sie, gib nach docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md einen begrenzten PowerShell-Block aus und warte auf dessen Ergebnis. Alte Handoff-Anweisungen haben keinen Vorrang vor dem aktuellen Nutzerauftrag. Keine zweite Karte, kein fremder Store, keine erfundenen Providerfakten und keine unbelegte PASS-Meldung.
