# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.104**, Core **4.82.223**. M16.5 Schritte 15–18 aktiv. App .104 / Core .223 ist der vollständig veröffentlichte P02/P03-Kategorie-, Landesküchen- und identitätsgebundene Medienabschnitt. P02/P03 bleiben teilweise, bis Google serverseitig freigegeben, die breite reale Bildquote gemessen und die physische Touchabnahme geschlossen ist.

**Zuletzt geliefert:** Release .104 erweitert den gemeinsamen Places Owner um 14 Diagnosepfade, 19 Landesküchen und exakte ausgewählte Medien. 33/33 öffentliche Matrixpfade sind grün. Sichtbar funktionieren Food 48/9 ohne Steakhouse-Passung, Shopping 46/11, Chinesisch mit Hay-Cheng, 46 Pins nach Zoom und das echte Snykrode-Bild. 233/233 Regression, NFR-0 3/3 und 30/30 Byteidentität sind belegt.

**Nächster Schritt (AKTIV): Google-Berechtigung, reale Bildquote und physische Touchabnahme schließen.** Kategorie-, Küchen-, Passend- und Zoomlogik sind öffentlich grün. Der Google-Key erreicht places.googleapis.com, erhält aber PERMISSION_DENIED; deshalb fehlen bei vielen Orten weiterhin echte Fotos. Zudem fehlt noch der reproduzierbare Kaltstart auf realem iOS und Android.

**Abnahme dieses Schritts:**

- Der vorhandene Google-Key ist im richtigen Cloud-Projekt für Places API (New), Text Search (New) und Place Photos (New) serverseitig berechtigt; eine exakte Namens- und Koordinatenverknüpfung sowie der zugehörige Fotoload antworten positiv und bleiben in den getrennten 800/Monat-Budgets.
- Für alle 13 Places-Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild trägt exakte oder verifiziert verknüpfte Entitätsreferenz, Herkunft, Lizenz und Fallbackstatus. Fremd- und generische Stockbilder bleiben ausgeschlossen.
- Die 82 Zuordnungen, 19 Landesküchen und Sachfilter werden auf kompaktem Touch für positive, negative, leere, kombinierte und teilweise Providerfälle wiederholt; Kategorienwechsel, Passend, Pinvordergrund, Ziehen und Zoomen bleiben bedienbar.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand und laden ein exakt zugeordnetes Detailbild, sofern die Ortsquelle eines anbietet.
- Passend und Medien bleiben identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Safe Regression, NFR-0, sichtbare Browserabnahme, öffentliche Matrix und Byteidentität bleiben grün.

**Danach:** Danach folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert.

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
