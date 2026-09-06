# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.113**, Core **4.82.232**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. App .113 / Core .232 verbindet echte Timeline-Daten, P11-Routenfenster und eine nicht mutierende günstige, erwartete und ungünstige Tagesprobe in Timeline und Luvia AI. Stable Integration läuft wieder auf dem akzeptierten App-.104-Worker; Main und Production blieben unverändert. Nur die physische iOS-/Android-Abnahme und später reale zeitgestempelte Context-Signale bleiben als Gates. P15/P17 ist jetzt AKTIV.

**Zuletzt geliefert:** P12: Der echte Reisetag 12.06.2027 wird aus derselben Journey- und Places-Wahrheit in drei nachvollziehbaren Verläufen gezeigt. Wetter, Verkehr/Störungen, Öffnungszeiten und Auslastung bleiben ohne Beleg unbekannt; Luvia behauptet keine Erfolgswahrscheinlichkeit und schreibt nichts automatisch. Timeline und AI Chat zeigen dieselben Momente, Szenarien und Bestätigungsgrenzen. Sichtbar wurden die drei Verläufe, die ausdrücklich unbekannten Einflüsse und der Reload mit unveränderten zwei Momenten sowie zehn Minuten Puffer geprüft. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): Gemeinsamen Trip Composer für Geführt, Schnellstart und KI-Entwurf liefern.** P09 bis P12 liefern jetzt bestätigte Places-/Journey-Änderungen, Recovery, Quellenfenster und eine ehrliche Tagesprobe. P15 und P17 bündeln diese Fähigkeiten in einem einzigen Trip-Entwurf, ohne Vorlieben, Reiseentwurf oder Timeline-Wahrheit zu duplizieren.

**Abnahme dieses Schritts:**

- Account-ohne-Reise und bestehende Reise verwenden denselben Trip Composer mit den Einstiegen Geführt, Schnellstart und KI-Entwurf; Trip bleibt der einzige Owner des Entwurfs und der bestätigten Reise.
- Ziel, Zeitraum, Reisefarbe und Symbol sowie Anfrage-, reisebezogene und dauerhafte Vorlieben werden klar getrennt; eine dauerhafte Profiländerung verlangt eine eigene verständliche Bestätigung und bleibt korrigier- und löschbar.
- Der KI-Entwurf wird tageweise mit echten Place-/Stay-Identitäten, Karte, P12-Tagesprobe, Begründungen, Alternativen, Budget- und Context-Hinweisen präsentiert; unbelegte Angaben bleiben unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erscheinen jeweils als eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner.
- Ein gebündelter sichtbarer Integrationslauf prüft Geführt, Schnellstart, KI-Entwurf, Abbruch ohne Mutation, bestätigte Teilübernahme, Reload-Readback, bestehende Reise, Account-ohne-Reise, Desktop, mobiles Browserformat, Safe Regression und NFR-0.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. Jetzt folgen P15/P17 Trip Composer; danach P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
