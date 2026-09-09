# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.200**, Core **4.82.319**. P17/P19: Integration .200 / Core 4.82.319 veröffentlicht; begrenzte Webrecherche echt belegt, passende Ortszuordnung noch offen.

**Zuletzt geliefert:** Integration .198 ergänzt begrenzte OpenAI-Webrecherche für fehlende Erlebnisbereiche: maximal zwei Toolaufrufe, sechs Quellenangebote, ein Rechercheauftrag pro Workflow, fünf pro Nutzer/UTC-Tag und 100 insgesamt. Echte URL-Belege werden durch Places auf Identität und Koordinaten aufgelöst. Veröffentlichte App .199 korrigiert den im öffentlichen Test gemessenen Verlust später genannter Ziele und der Konfliktbewertung im Dialogue-Vertrag. App .200 unterscheidet qualitative Budgetvorlieben von harten Geldsummen, erhält die konkrete Kategorieabsicht in Recherchefragen und bewahrt echte Ausgabengrenzen.

**Nächster Schritt (AKTIV): Gespeicherte Webangebote verlässlich Orten zuordnen und konkrete Aktivitäten belegen.** Der echte Webprovider funktioniert; die sechs Hinweise scheitern an der Ortszuordnung. Vorhandene generische Sportstätten erfüllen Escape Room/Bowling nicht. Wiederholte Gesamtkomposition kann diese Quellenlücke nicht beheben.

**Abnahme dieses Schritts:**

- Die sechs gespeicherten Nachtleben-Hinweise über denselben authentifizierten Places-Vertrag mit konkreten Anbieter-/Filterbelegen auflösen; qualifizierte Escape-Room-/Bowling-Quellen ermitteln; Quellenrecherche bei Wiederaufnahme nicht erneut bezahlen. Danach passender Gesamtplan mit tatsächlichen Aktivitäten, Gastronomie, Abendleben und Strand sowie nachvollziehbarer Streuung. P17/P19 bis zu sämtlichen Gates TEILWEISE.

**Danach:** Nach qualitativer Rechercheabnahme den Familien-/Konfliktfall und die übrigen P17/P19-Gates schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE: zuverlässige Aktivitätsquellen und konkrete Angebote, semantische Unterteilung allgemeiner Aktivitäten, Positivlauf des neuen Gesamtplans, Lernen über mehrere Reisen, Familien-/Konfliktfall, gebietsferne Reserve, Übernahme-/Recovery-Gates und physische Geräte. M16.5 bleibt offen.

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
