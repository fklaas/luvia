# Luvia konsolidierte Arbeitsplanung

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

Stand 4. September 2026. Maßgeblich sind der gemeinsame Statusabschnitt und der Paketkatalog. Frühere Gegenbelege und anschließende begrenzte Reparaturnachweise bleiben im B1-Abnahmebericht datiert erhalten.

- [Masterfahrplan v6](MASTERFAHRPLAN-v6.md): konsolidierter gültiger Umfang und Gesamtweg bis M22, alle P01–P50 und detaillierte bestehende M18-Blueprints.
- [Statusplan](STATUSPLAN-2026-09-04.md): einzelne Paketstände, Grenzen und nächste Abschlussnachweise.
- [Statusdaten](status-plan.v1.json): dieselben 50 Pakete als maschinenlesbare Daten.
- [Aktuelle sichtbare B1-Abnahme](B1-END-TO-END-ACCEPTANCE-2026-09-04.md): datierte Belege für Suche, Favorisieren, Planen, Reservierungsweg und P09-Zeitänderung mit Rücknahme; vollständige B1-Abnahme offen.
- [Quellenherkunft](source-provenance-2026-09-04.json): vier Nutzerquellen unverändert erhalten, mit SHA-256 und ursprünglicher Master-Kapitelübersicht.
- [Vorheriger aktiver Dokumentstand](archive/2026-09-04-before-consolidation/README.md): zwölf unveränderte Repository-Dokumente vor der Konsolidierung.

Datiert ausgelieferte Word-/ZIP-Dateien im Arbeitsverzeichnis outputs bleiben historische Snapshots. Die bisherigen Pakete LUVIA_Planstand_2026-09-04 und LUVIA_B1_Planstand_2026-09-04 bilden frühere Abnahmen ab und sind keine aktuelle .46-Lesefassung. Neue Word-Ausgaben werden aus den synchronisierten Markdown-Quellen mit scripts/export-masterplan-docx.py erzeugt und separat visuell geprüft.

Die Vollständigkeitsprüfung vergleicht alle 50 Pakete, technischen Umfänge, Statusbelege und nächsten Abschlussnachweise zwischen JSON, Statusplan und Master. 16 Archivquellen sind per Hash geprüft. Die Werte 210/210 und 18/18 sind ausdrücklich frühere .37-Runtime-Belege; es wurde keine neue volle Runtime-Regression für reine Dokumentänderungen behauptet.

Pflege: zuerst Fakten, currentWork und betroffene Pakete in status-plan.v1.json aktualisieren; anschließend `node scripts/sync-planning-status.cjs --write` und `node tests/planning-current-status.test.cjs` ausführen. Die 16 aktiven Einstiege erhalten denselben aktuellen Stand und genau einen nächsten Schritt. Auch umgebende Texte auf veraltete Aussagen prüfen. Neue Exporte verwenden diese Quellen; bestehende datierte Ausgaben und Archive bleiben historisch. Jeder Fortschrittsbericht nennt Stand, Ergebnis, offenen Umfang und nächsten Schritt.
