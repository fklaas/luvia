# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.122**, Core **4.82.241**. M16.5 Schritte 15–18: P15/P17 aktiv und teilweise. Die ausgewählte Chat-Gestaltung, zweistufige Kartenhierarchie und drei Reisewege laufen im echten Composer .122. Vollständige KI-Planqualität, Kontext-/Kontoabschluss und physische Mobilabnahme bleiben offen. Stable bleibt .104.

**Zuletzt geliefert:** App .122 liefert die vom Nutzer ausgewählte Chat-Gestaltung im echten Composer: Cremefläche, drei sichtbare Reisearten, geografische Bühne und untere Auswahlfläche. Globus → Kontinent → Land → Region ist lokal bedienbar. Der erste Klick wählt aus und zeigt eine bewegte Kontur mit neun Compass-Farbstopps; der zweite öffnet die Ebene. Welt/Europa/Deutschland/Schleswig-Holstein und der Anschluss an die echte Rom-Zielsuche sind öffentlich sichtbar geprüft. Die Übersicht nutzt 251 landweise ladbare Regionspakete; unbenannte Quellregionen werden nicht erfunden. Die Ortsstufe verwendet weiterhin die kanonische Zielsuche, keine flächendeckende neue Städtegeometrie. Reisezeit, Wünsche, Gestaltung und Bestätigung bleiben auf derselben Bühne; echte Vorschläge nutzen die vorhandene gemeinsame Places-Karte. Nur anlegen erzeugt im lokalen Browser null zusätzliche Orts-/Timeline-Aktionen. Mit Vorschlägen beginnt im Verhaltenstest ohne Auswahl und bestätigt nur ausdrücklich gewählte Owner-Aktionen. Der öffentliche 390-Pixel-Globus dreht bei ScrollTop 0 ohne Seitenbewegung oder horizontalen Überlauf. Reduced Motion behält die Kontur ohne Gradientanimation. 38 Geometrie-/Gesten-/Datenprüfungen, 53 Composer-Verhaltensprüfungen, 238/238 Regression und 43/43 öffentliche Dateihashes sind grün. Vollständige KI-Plangüte, echte Kontoübernahme und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): Den vollständigen KI-Reiseentwurf im ausgewählten Composer belastbar fertigstellen.** Die ausgewählte Oberfläche und die grundlegende Kartenhierarchie sind jetzt ausgeliefert. Der nächste Abschluss muss echte Planqualität über den ganzen Zeitraum und die sichere Übernahme belegen; mehr Animationen allein schließen P15/P17 nicht.

**Abnahme dieses Schritts:**

- Realen erfolgreichen Modelllauf belegen. Der zuletzt gemessene HTTP 429 bleibt bis zum positiven Gegenbeleg offen; fehlende Modellantwort darf keinen vollständigen KI-Erfolg ergeben.
- Alle Reisetage mit nachvollziehbarem Rhythmus, belegten Ernährungs-/Zugangsrestriktionen, Interessenvielfalt, realistischen Wegen/Puffern, Pausen und Budgetrahmen prüfen. Fünf Orte über acht Tage sind kein vollständiger Plan.
- Saison, Feiertage, Veranstaltungen und Wetter mit Quellen- und Zeitkontext einbeziehen; langfristige Saisonerwartung und kurzfristige Vorhersage getrennt behandeln.
- Den Entwurf auf derselben Kartenbühne Tag für Tag erlebbar präsentieren, Alternativen und Änderungen erhalten und nur die ausdrücklich bestätigte Auswahl idempotent über Trip/Places/Journey übernehmen. Dauerhafte Identity-Änderungen separat bestätigen.
- Wiederaufnahme, Moduswechsel, kanonische Zielauswahl, sichere Kontoübernahme und physische iOS-/Android-Gesten prüfen. Globale Städtestufen und weitere visuelle Ausarbeitung bleiben expliziter Restumfang; P15/P17 erst nach vollständigen Produktgates abschließen.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, weitere interaktive Ausarbeitung und globale Städtestufen, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
