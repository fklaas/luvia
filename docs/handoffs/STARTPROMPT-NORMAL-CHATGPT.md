# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.93**, Core **4.82.212**. M16.5 Schritte 15–18 aktiv. Der positive P02-Passend-Slice ist öffentlich abgenommen; P03 Cross-Surface-Parität ist jetzt der einzige nächste Arbeitsblock. Apple bleibt geparkt.

**Zuletzt geliefert:** App .92, Gateway v220 und Places 4.38.7-osm-edge-proxy liefern verlässlich 11 belegte passende Orte im gleichen 3-km-Reisezielbereich wie Alle. Sichtbar wurden 50 Alle → 11 Passend → 52 Alle belegt; alle Passend-Pins waren markiert, das Steakhaus ausgeschlossen und Provider-Dubletten erhielten keinen zweiten Passend-Status. Der kostenlose signierte OSM-Pfad nutzt gestaffelte Ausweichinstanzen, Abbruch der Verlierer und sechs Stunden Cache. Stable und immutable Worker stimmen 30/30 mit dem ausgelieferten Commit überein. Safe Regression 229/229 und NFR-0 3/3 sind grün.

**Nächster Schritt (AKTIV): Denselben Passend-Ort in Timeline, AI Chat und Stay belegen.** Places ist wieder stabil. Jetzt muss die vorhandene zentrale Place Intelligence sichtbar beweisen, dass Karte, Timeline, Chat und Unterkunftssuche dieselbe Identität und dieselben Fakten verwenden.

**Abnahme dieses Schritts:**

- Einer der 11 Passend-Orte erscheint in Timeline-Vorschlägen und AI Chat mit derselben kanonischen Place-/Provider-ID.
- Profilfakten, 3-km-Reisezielbereich und lesbarer Passend-Grund stimmen flächenübergreifend überein.
- Timeline und AI Chat lösen keine abweichende parallele Place-Suche oder zweite Matching-Logik aus.
- Stay verwendet dieselbe Provider-, Cache-, Karten- und Fit-Diagnostik und erzeugt keine unbelegten passenden Unterkünfte.
- Safe Regression, NFR-0, öffentliche Asset-Identität und ein sichtbarer Browserbeleg bleiben grün.

**Danach:** Nach dem P03-Cross-Surface-Beleg wird die noch offene vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft aus P02/P03 weiter geschlossen.

**Weiter offen:** P02 bleibt im Gesamtumfang teilweise: vollständige Kategorien, Landes- und Sachfilter, echte Place-Fotos sowie weitere Provider- und Quotenpfade. P03 ist aktiv für Timeline-, AI-Chat- und Stay-Parität. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Apple MapKit bleibt als dokumentierte spätere Option geparkt.

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
