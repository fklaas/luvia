# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.94**, Core **4.82.213**. M16.5 Schritte 15–18 aktiv. P02 Passend ist öffentlich stabil; der P03 Cross-Surface-Slice steht als App .94 / Core 4.82.213 unmittelbar vor seiner öffentlichen AI-Chat-Abnahme. Apple bleibt geparkt.

**Zuletzt geliefert:** Auf App .93 sind Places und Timeline sichtbar auf derselben aktiven Place-Kohorte: 11 vegetarisch belegte Passend-Pins, kein Steakhouse-Falschpositiv, dieselbe kanonische HERE-ID und derselbe lesbare Profilgrund bei null zusätzlichen Timeline-Provider-Reads. App .94 ergänzt den fehlenden lokalen Chat-Intent für den realen Satz mit flektiertem „vegetarische Restaurants“; fokussierte P03-, Semantik-, Orchestrierungs-, Release-, Inventur- und NFR-0-Gates sind grün.

**Nächster Schritt (AKTIV): App .94 veröffentlichen und dieselbe Passend-ID im AI Chat sichtbar belegen.** Der letzte reale Gegenbeleg lag nur noch im lokalen Fallback des Chats: Ohne Live-KI wurde „vegetarische Restaurants“ wegen deutscher Flexion nicht als Places-Read erkannt. Der Kandidat behebt genau diese Lücke.

**Abnahme dieses Schritts:**

- Der öffentliche Integration-Chat verarbeitet den exakten Satz „Zeig mir passende vegetarische Restaurants in Scharbeutz.“ auch bei nicht verfügbarer Live-KI als lokalen sicheren Places-Read.
- Places, Timeline und AI Chat zeigen mindestens eine identische kanonische Place-/Provider-ID und denselben lesbaren vegetarischen Passend-Grund.
- AI Chat weist für die wiederverwendete aktive Place-Kohorte Provider-Read-Zähler 0 aus.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; weder Chat noch Timeline erfinden eine Passung.
- Safe Regression 230/230, NFR-0 3/3, Stable/Immutable-Asset-Identität und Rückfallarchiv sind grün.

**Danach:** Nach dem öffentlichen P03-Beleg wird die offene P02/P03-Vollständigkeit für alle Kategorien, Landes- und Sachfilter, echte Ortsbilder und Providerquoten geschlossen.

**Weiter offen:** P02 bleibt teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P03 ist bis zum öffentlichen Chat-Beleg aktiv. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert.

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
