# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.182**, Core **4.82.301**. P17/P19 aktiv: App .182 / Core .301 ist auf Integration veröffentlicht. Der echte Valencia-Lauf liefert ein räumlich breites 57-Places-Reservoir und sieben Tage einschließlich Strand, braucht aber Reparaturen wegen vom Modell falsch abgeschriebener langer Geoapify-IDs. Kandidat App 13.82.168.183 / Core 4.82.302 ersetzt Modell-IDs durch kurze, exakt rückgebundene Referenzen.

**Zuletzt geliefert:** Integration .182: Quelle COMMIT_569e642836f25b1e02c439472c4d4ef65a6d531f, Worker 1fbf6e16-b328-44bb-9284-5413383e6b17, Archiv 92.650.447 Bytes / SHA256 8E60A0A356EBF564E35B34CA67BDEE67670EDC6221FFE15CCDC8D2C9ADBAE540 und 22/22 öffentliche Bytevergleiche. 241/241 Regression, NFR-0 3/3, Composer 133, P19 99/99 und 51/51 Transport-/Abschnittsprüfungen bestanden. Echter Providerbeleg: planning.dialogue erfolgreich in 16.203 ms; trip.compose und Reparaturen liefen real. Der letzte Audit blockierte fehlende gültige Backup-Referenzen. Ein bis zwei abweichende Zeichen in echten 113- bis 125-stelligen Provider-IDs sind als Ursache belegt. Der neue Referenzpfad ist mit 60/60 Transport-/Abschnittsprüfungen und 133 Composer-Prüfungen geprüft; sein öffentlicher Review folgt noch.

**Nächster Schritt (AKTIV): Den korrigierten KI-Reisepfad auf Integration bis zum echten Gesamtreview belegen.** Die tatsächliche Transportstrecke war bisher nicht durch die Composer-Mocks abgesichert. Jetzt muss der reale Providerlauf die lokale Korrektur bestätigen.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Öffentlichen Gesamtreview mit kurzen Modellreferenzen und tatsächlich akzeptierten Reserveoptionen abschließen. Sehr lange Reisen und App-Wechsel sind kontrolliert geprüft; die physische iOS-/Android-Abnahme bleibt gesondert offen. Übrige P17/P19-Abnahmen und datierte Livebelege bleiben im Plan.

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
