# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.105**, Core **4.82.224**. M16.5 Schritte 15–18 aktiv. App .105 / Core .224 schließt den internen P09/P10-Owner- und AI-Chat-Weg für bestätigte Besuche als Integrationskandidat. P09 und P10 steigen damit von TEILWEISE auf BELEGT_BEGRENZT; offen bleiben nur die ausdrücklich getrennten physischen Geräte- und externen Providerbelege.

**Zuletzt geliefert:** Bestätigte Besuche lassen sich nun in Timeline und AI Chat über denselben Places Visit Owner korrigieren, entfernen und per dauerhaftem Recovery-Beleg wiederherstellen. Natürliche Sprache schreibt nie automatisch: Vorher/Neu-Vorschau, ausdrückliche Bestätigung, Idempotenz, Revision, Owner-Readback und kompensierendes Undo sind durchgängig. Der Katalog umfasst jetzt 333 semantische Aktionen, 30 typisierte Runtime-Aktionen, 249 öffentliche Owner-Bindungen und 2.764 Fehlerauswertungen.

**Nächster Schritt (AKTIV): Routenunsicherheit und bestätigten Zeitpuffer liefern.** Geh- und Fahrradrouten sind bereits providerübergreifend vorhanden. Der nächste klar abgrenzbare P-Block macht ihre zeitliche Unsicherheit, Quellenfrische und fehlende Live-Daten verständlich und lässt einen empfohlenen Puffer nur über einen bestätigten Journey-Befehl in die Timeline einfließen.

**Abnahme dieses Schritts:**

- Geh-, Fahrrad- und unterstützte ÖPNV-/Fahrtrouten zeigen erwartete Dauer, realistische Bandbreite, Quelle, Messzeit und Datenalter; fehlende Live-Daten werden als unbekannt ausgewiesen.
- Wetter, Saison, Tageszeit, Mobilitätsmodus und belegte Streckenmerkmale beeinflussen die Bandbreite nur mit sichtbarer Herkunft; Luvia erfindet weder Verkehr noch Barrierefreiheit.
- Ein Zeitpuffer wird zunächst als lesbare Vorher/Neu-Vorschau angeboten und erst nach ausdrücklicher Bestätigung idempotent über journey.v1 gespeichert; Ablehnung und veraltete Revision verändern die Timeline nicht.
- Timeline, Places-Karte und AI Chat verwenden denselben Routen- und Pufferbeleg sowie dieselbe Fehler- und Recovery-Sprache.
- Der Slice besteht gezielte Core-, Owner-, Fehler- und sichtbare mobile Browserabnahmen sowie Safe Regression und NFR-0.

**Danach:** Danach folgen P12 Tagesprobe und der gebündelte P12/P15/P17 Trip Composer mit tageweiser Reisepräsentation, Alternativen und bestätigter Übernahme.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10 sind intern belegt und nur für physische iOS-/Android-Abnahme begrenzt. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
