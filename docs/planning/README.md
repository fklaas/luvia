# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.121**, Core **4.82.240**. M16.5 Schritte 15–18: P15/P17 aktiv und teilweise. Der konkrete Globus-Scrollfehler ist in Kandidat .121 öffentlich geprüft behoben. Die neue Kartenhierarchie, durchgehende räumliche Gestaltung und drei fachlichen Reisearten sind verbindlich dokumentiert und als Konzept durchspielbar, noch nicht vollständig implementiert. Vollständiger KI-Plan, Kontext-/Kontoabschluss und physische Mobilabnahme bleiben offen. Stable bleibt .104.

**Zuletzt geliefert:** App .121 korrigiert die Globus-Gestenfläche: Canvas und Ortsbeschriftungen teilen Ziehen/Pinch, Trackpadbewegungen drehen die Welt und scrollen den Composer nicht. Ein Marker-Drag wählt keinen Ort, Antippen öffnet weiterhin die bestehende Zielsuche. Im angemeldeten öffentlichen Browser bei 390 Pixeln blieb ScrollTop während Trackpadrotation bei 0 und beim Marker-Drag bei 100; außerhalb änderte Scrollen den Wert von 0 auf 100. Toskana wurde danach per Antippen an die Ortsuche übergeben. 33/33 Geometrie-/Gestenprüfungen, 50 Composer-Prüfungen, 238/238 Regression, NFR-0 3/3 und 38/38 öffentliche Byteidentität sind grün. Physische Touchabnahme bleibt offen. Die neue Produktvorgabe ist im kanonischen Konzept und einer durchspielbaren Bewegungsstudie festgehalten: Welt → Kontinent → Land → Region → Ort, danach dieselbe Bühne für Reisezeit, Wünsche und Tage; drei unterschiedliche Ergebnisse Nur anlegen / Mit Vorschlägen / Luvia plant. Diese Hierarchie und vollständige KI-Planung sind noch keine ausgelieferten Laufzeitfunktionen.

**Nächster Schritt (AKTIV): Kartenhierarchie und drei fachliche Reisearten im gemeinsamen Composer umsetzen.** Der Nutzer bestätigt das Weltprinzip, lehnt aber die Formularfortsetzung und die geringe Planvielfalt ab. Navigationsstufen und fachliche Ergebnisse müssen zusammenhängend auf dem kanonischen Auftrag aufbauen.

**Abnahme dieses Schritts:**

- Globus, Kontinent, Land, Region und Ort mit angemessener belegbarer Geometrie, Rückweg und Wiederaufnahme umsetzen. Gebietsauswahl bleibt Suchabsicht bis zur kanonischen Destination-Bestätigung; direkte Suche und Regionen als Ziele bleiben möglich. Kamerabewegung löst keine Provideranfragen aus.
- Die drei Produktwege im bestehenden Trip-Auftrag unterscheiden: Nur anlegen erzeugt null Places-/Timeline-/Vormerkungsaktionen; Mit Vorschlägen übernimmt ausschließlich explizite Auswahl; Luvia plant liefert einen getrennt prüfbaren strukturierten Gesamtentwurf. Alte guided/quick/ai-Einstiegslabels reichen nicht als Beleg.
- Reisezeit, Wünsche, Mitreisende, Tempo und Budget auf derselben räumlichen Bühne fortführen. Präzise Werte bleiben zugänglich, Bewegung unterstützt Orientierung, Reduced Motion sowie Tastatur-/Antippbedienung bleiben vollständig.
- KI-Vollständigkeit an gesamten Reisetagen, belegten Restriktionen, Interessenvielfalt, Wegen/Puffern, Pausen, Zeit-/Budgetrahmen und Quellenkontext prüfen. Der frühere Lauf fünf Orte/acht Tage und die Bewegungsstudie gelten nicht als vollständiger Plan oder positiver realer KI-Nachweis.
- Reale Modellantwort und bestätigte idempotente Übernahme über Trip/Places/Journey getrennt positiv belegen; Identity-Änderungen bleiben eigenständig bestätigt. Fehlende Modellverfügbarkeit oder Fakten dürfen keinen vollständigen KI-Erfolg ergeben.
- Rückkehr, Wiederaufnahme, mobile Gesten auf physischem iOS/Android, öffentliches Verhalten und Releasegates am tatsächlich ausgegebenen Versionslink prüfen. P15/P17 bleiben bis zum vollständigen Abschluss ihrer Produktgates teilweise.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
