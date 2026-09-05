# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.85**, Core **4.82.207**. M16.5 Schritte 15–18 aktiv; B1/P02 und P03 sind für den positiven Passend-Realbeleg erneut der aktive Abschlussblock. P09/P10 bleiben teilweise geliefert und werden nach diesem externen Gate fortgesetzt. A1 Dokumentkonsolidierung wird nach jedem Slice fortgeschrieben; A2 ist teilweise belegt.

**Zuletzt geliefert:** App 13.82.168.85 / Core 4.82.207 läuft auf Integration über Worker 154aa828-e9bd-4dbc-993f-87e34ac40176 bei 100 Prozent Traffic; Gateway v203 / 4.64.20 meldet Places-Health 4.38.1-here-dietary-evidence. HERE-, Google- und Foursquare-Ernährungsbelege, strenge Identitätsverbindung, Steakhouse-Ausschluss und begrenzte Providerbudgets sind implementiert. Sichtbar: Essen & Trinken 50 über HERE; Profil Vegetarisch; Passend 0/0; keine falsche Positivmarkierung. 226/226 Safe Regression und 30/30 öffentliche Bytevergleiche PASS. Sauberes Archiv: 88.755.996 Bytes, SHA-256 5723DC228D90E9689EF9632D126293F5015ACEF627D1D0B1439CC42D34E1F588. Main und Production bleiben unverändert.

**Nächster Schritt (AKTIV): Google Places für den positiven Ernährungsbeleg freischalten und sichtbar abnehmen.** Die Anwendung, der gemeinsame Filtervertrag und die Negativregeln sind grün; aktuell verhindert die Google-403-Berechtigung den praktisch breitesten positiven servesVegetarianFood-Nachweis, während HERE keine lokalen Fakten liefert und Foursquare keine Credits besitzt.

**Abnahme dieses Schritts:**

- Google Places API (New), aktives Billing und API-Key-Beschränkungen im richtigen Google-Cloud-Projekt sind geprüft; der bestehende Server-Key darf ausschließlich die benötigte Places-Suche ausführen.
- Der öffentliche Health-Probe wechselt von HTTP 403 zu einer erfolgreichen, begrenzten Google-Antwort ohne Schlüssel- oder Rohdatenoffenlegung.
- Essen & Trinken zeigt für das vegetarische Profil mindestens einen realen „Passt“-Pin und weiterhin kein unbewiesenes Steakhouse.
- Places, Timeline und AI Chat zeigen für den Treffer dieselbe Provider-ID, denselben Reisezielradius und einen lesbaren providerbelegten Passend-Grund.
- Stable und Immutable Integration, Bytegleichheit, Regression und unveränderter Main-Stand sind belegt.

**Danach:** Danach P09/P10 mit positiven Booking-, Visit- und Memory-Verwaltungswegen; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: positiver Google-Realbeleg sowie vollständige UI-/AI-/Foto- und physische Mobilabnahme. P09/P10 bleiben teilweise: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
