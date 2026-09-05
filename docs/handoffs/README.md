# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.62**, Core **4.82.184**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .62 / Core 4.82.184 veröffentlicht die gemeinsame Timeline-/Places-/Stays-Kartenprojektion. Ein belegter Teilstand bleibt bedienbar und wird im Hintergrund ergänzt; providerübergreifende IDs und übliche Namensvarianten desselben realen Orts werden zusammengeführt. Sichtbar bestanden Timeline vier eindeutige Karten/vier Pins, der 0,22-s-Bearbeitungsmodus sowie Places und Stays mit je 50 Pins, Alle/Passend und 3 km um Scharbeutz. 221/221 Safe Regression und 30/30 öffentliche Dateien sind belegt. Die gemeinsame Place-Intelligence-/Trip-Composer-Entscheidung ist in alle aktiven Fahrpläne aufgenommen.

**Nächster Schritt (AKTIV): Nachtleben und reale Filter-/Foto-Matrix providerübergreifend schließen.** Die gemeinsame Karte und Teilstandskontinuität sind jetzt öffentlich belegt. Offen bleiben die reale Vollständigkeit jeder Kategorie und Filteroption, besonders Nachtleben und Landesküchen, positive Passend-Evidenz, breite echte Place-Fotos sowie der mobile Kalt-/Warmstart und die deterministische Chat-Navigation zu Places und Stays.

**Abnahme dieses Schritts:**

- Nachtleben wird für Scharbeutz und Timmendorfer Strand providerübergreifend mit Bars, Pubs, Cocktail- und Weinbars, Lounges, Clubs, Diskotheken, Live-Musik und Casinos gesucht, dedupliziert, gerankt und sichtbar abgenommen.
- Alle 19 Landesküchen sowie jede sichtbare Kategorie-, Untertyp- und Faktenfilteroption werden über UI und AI Chat positiv oder als belegter Nullfall geprüft; Kombination, Reset, Budgetausfall und Wiederholung müssen funktionieren.
- Places, Stays, Timeline und AI Chat verwenden dieselben Place-Identitäten. „Öffne Places“, „Öffne Stays“ und „Öffne Hotels“ werden vor einem optionalen KI-Aufruf deterministisch geroutet.
- Alle und Passend verwenden dieselbe Kandidatenmenge und nur belegte Profilvorlieben. Das vegetarische Profil findet positive belegte Orte und markiert kein fleischzentriertes Steakhouse ohne konkrete vegetarische Angebotsevidenz.
- Jede Detailkarte versucht ein exakt zum realen Place gehörendes Foto mit Attribution; keine Medienquelle darf ein Bild eines nur benachbarten Orts übernehmen.
- Desktop, Mehrtab-Warmstart und physisches Mobilgerät werden mit erstem Kartenstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel, Cache-/Provider-Spur und Ladezeit sichtbar protokolliert.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend P12/P15/P17 den gemeinsamen Trip Composer mit Geführt, Schnellstart, KI-Entwurf und Vormerken als nächsten großen Produktblock umsetzen.

**Weiter offen:** P02/P03: Nachtleben, reale Vollabnahme aller Filter und Landesküchen über UI/AI Chat, positive vegetarische Profilevidenz, breite echte Place-Fotos, deterministische Places-/Stays-Navigation und mobile Startzeit. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../../HANDOFF-CODEX-CURRENT.md)
- [Ergänzender Nachweis und Status](../../HANDOFF-NORMAL-CHATGPT-CURRENT.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Zuerst den zum tatsächlichen Werkzeugzugriff passenden Handoff lesen. STARTPROMPT-NORMAL-CHATGPT.md ist kopierbar. CHATGPT-TERMINAL-PROTOCOL.md gilt nur für Sitzungen ohne eigene Werkzeuge. Quellen und Master-Pakete stehen unter docs/planning.
