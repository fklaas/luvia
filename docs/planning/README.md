# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.49**, Core **4.82.171**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .49 schließt die P09/P01-First-Paint-Lücke auf stabiler Integration: sechs Timeline-Datenquellen starten ohne serielle Place-Wartezeit; beim Reisewechsel werden alte Einträge sofort entfernt; während eines ungeklärten Owner-Reads erscheint kein falscher leerer Tag. Geplante Places, Buchungen, bestätigte Besuche und Memories erhalten eine lesbare Owner-Fähigkeitsmatrix; Direktbearbeitung bleibt auf zugelassene Place-Pläne begrenzt. 217/217 Safe Regression, 30/30 Byte-Gleichheit und ein sichtbarer angemeldeter Reload mit zwei echten Ostseeurlaub-Momenten sind belegt.

**Nächster Schritt (GEPLANT): Places-Kategorie- und Ausschnittskontinuität unter echten Wiederholungen schließen.** Der zuletzt beobachtete Wechsel zwischen keinen, drei und ungefähr 45 Pins bei derselben Reise und Kategorie widerspricht der bereits vorhandenen lokalen Filtermatrix. Jetzt muss der reale asynchrone Browserpfad mit Provider-, Cache-, Kategorie- und Request-Identität reproduziert und stabilisiert werden.

**Abnahme dieses Schritts:**

- Auf der stabilen Integration mindestens fünf sichtbare Wechselzyklen zwischen Shopping, Natur & Erholung, Essen & Trinken und weiteren Kategorien am aktiven Reiseziel Scharbeutz ausführen; jede Runde protokolliert Kategorie, Ausschnitt, Request-ID, Provider/Cache-Herkunft, Dauer und Trefferzahl.
- Eine ältere, langsamere Antwort darf weder die aktuelle Kategorie noch deren Pins überschreiben; Abbruch, Zusammenführung, Retry und Cache-Freshness werden im echten Browserpfad belegt.
- Während Nachladen bleiben der letzte gültige Kartenstand und ein eindeutiger Ladehinweis sichtbar. Ein temporärer Providerfehler darf nicht als endgültiges „nichts gefunden“ erscheinen und ein echter leerer Filter bleibt trotzdem ehrlich leer.
- Mobile und Desktop, Ziehen und Zoomen sowie die gemeinsame technische Basis von Places und Stays sichtbar prüfen; alle Testzustände danach zurücksetzen und vollständige Regression plus öffentliche Byte-Gleichheit belegen.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend physische iPhone-/Android- und echte Mehrnutzerkonflikte nachschärfen und die vollständige B1-Nutzerkette schließen.

**Weiter offen:** Vollständige P02/P03- und P09/P10-Abnahme, reale Geräte und Mehrnutzerfälle; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

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
