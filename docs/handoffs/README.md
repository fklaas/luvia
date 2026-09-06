# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.112**, Core **4.82.231**. M16.5 Schritte 15–18: P09, P10 und P11 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. App .112 / Core .231 verbindet Routenbandbreite, Quellenfrische, ehrlichen Live-Status und bestätigten Zeitpuffer über denselben Journey Owner in Timeline und AI Chat. Stable Integration läuft wieder auf dem akzeptierten App-.104-Worker; Main und Production blieben unverändert. Nur die physische iOS-/Android-Abnahme bleibt für P09–P11 als Gerätegate. P12 ist jetzt AKTIV.

**Zuletzt geliefert:** P11: vier Routenmodi, realistische Zeitbandbreite, Quelle, Messzeit, Datenalter und Live-Status werden aus einem deterministischen Journey-Beleg projiziert. Unbelegtes Wetter, Verkehr, Saison oder Tageszeit verändert die Schätzung nicht. Eine Pufferänderung zeigt Bisher/Neu und schreibt ausschließlich nach Bestätigung mit Revision, Belegsignatur, Idempotenz und Owner-Readback. Timeline und AI Chat teilen Sprache und Daten; ohne Quelle entsteht keine Aktion. Sichtbar wurden echte Timeline-Daten, 10→12-Minuten-Vorschau und Abbruch plus Reload ohne Mutation geprüft. Safe Regression 234/234, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): Tagesprobe mit belegten Grenzen liefern.** P11 liefert jetzt belastbare Wegefenster und Quellenalter. P12 verwendet diese Wahrheit, um einen Reisetag vor der Übernahme als erwarteten, günstigen und ungünstigen Ablauf durchzuspielen und konkrete Konflikte oder freie Momente verständlich zu machen.

**Abnahme dieses Schritts:**

- Ein realer Reisetag wird in günstiger, erwarteter und ungünstiger Ausprägung mit Zeiten, Wegen, Puffern, Öffnungszeiten und konkreten Konflikten dargestellt; jede Abweichung nennt ihren Beleg.
- Unbekannte Wetter-, Verkehrs-, Öffnungs- oder Auslastungslagen bleiben sichtbar unbekannt und werden nicht als Wahrscheinlichkeit oder sichere Vorhersage ausgegeben.
- Timeline, Places-Karte und AI Chat verwenden denselben Tagesentwurf, dieselben Place-Identitäten und dieselben P11-Routenbelege.
- Alternativen, Zeitverschiebungen und Weglassen erscheinen als einzelne Vorher/Neu-Vorschauen; erst bestätigte Journey-/Places-Befehle verändern den Tag und lassen sich über vorhandene Recovery-Wege zurücknehmen.
- Der sichtbare Integrationslauf prüft Desktop und mobiles Browserformat, Abbruch ohne Mutation, bestätigte Teilübernahme, Reload-Readback, Safe Regression und NFR-0.

**Danach:** Danach wird P12 in derselben Arbeitswelle mit P15/P17 zum gemeinsamen Trip Composer verbunden: Geführt, Schnellstart und KI-Entwurf, tageweise Präsentation, Vormerken, Alternativen und bestätigte Teilübernahme.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11 sind intern belegt und nur für physische iOS-/Android-Abnahme begrenzt. Danach folgen P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
