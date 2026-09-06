# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.123**, Core **4.82.242**. P15/P17 aktiv und teilweise: feste Kartenbühne, Bottom Sheets, Reise-Wunschpipeline und automatische Ortszeit sind in .123 ausgeliefert. Reale KI wegen fehlendem API-Guthaben blockiert. Stable bleibt .104; Gateway v235 aktiv.

**Zuletzt geliefert:** App .123 setzt den Composer als feste Kartenbühne mit ein-/ausklappbarem Bottom Sheet um. Freitext-Reisewünsche stehen vor den drei Reisearten; KI-Zielhypothesen werden ausschließlich nach kanonischer Places-Geokodierung angezeigt. Die Pipeline und der automatische Flug über Kontinent/Land/Region sind mit kontrollierten Modellantworten geprüft. Öffentlich ist der echte Modellzugang weiter mit HTTP 429 credit_balance_exhausted blockiert; die Meldung ist jetzt korrekt, Angaben bleiben erhalten, der manuelle Weg bleibt nutzbar. Kein falscher KI-Erfolg. Geografische Ebenen überblenden mit 900 ms; erste Auswahl und zweiter Klick behalten die neun Compass-Farben. Herauszoomen geht genau eine Ebene zurück. Die aktive Zielsuche, Reisezeit und gruppierten Reisebedürfnisse liegen im Sheet. Datumseingaben sind bei 390 px nur 46 px hoch. Ernährung, Mobilität und Zugang gelangen in die kanonische Empfehlung; strengere Reiseangaben verwenden keine zuvor nur fürs Profil geprüfte Ergebnismenge. Die Zielzeitzone wird aus derselben Geoapify-Antwort übernommen und alte Entwürfe werden nur bei passender Ortsidentität ergänzt. Scharbeutz, Rom und Lissabon sind live mit korrekter IANA-Zone bestätigt. Quoten-/Payloadfehler sind getrennt, neue Reisewünsche erben keinen aktiven Reise-Kontext. 59 Composer-Verhaltensprüfungen, 42 Geografie-/Gestenprüfungen, 40 Origin-/Fehler-/Zeitzonenprüfungen und 238/238 Gesamtregression bestanden. 45/45 öffentliche Dateihashes stimmen mit dem sauberen Deployment überein. Echter KI-Positivlauf, vollständige Tagesplangüte, Kontoübernahme und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): Vollständigen KI-Reiseentwurf nach wiederhergestelltem Modellzugang abnehmen.** Die feste Bühne und die Wunsch-/Zielpipeline sind ausgeliefert. Der reale Anbieter meldet verbrauchtes API-Guthaben; erst ein echter erfolgreicher Modelllauf ermöglicht die abschließende Prüfung der Planqualität.

**Abnahme dieses Schritts:**

- Modellzugang mit verfügbarem API-Guthaben wiederherstellen und einen echten erfolgreichen Wunsch- sowie Reiseplanungslauf belegen. Keine Zahlung oder Planänderung ohne Nutzerauftrag; keine Ersatzdaten als KI-Erfolg.
- Alle Reisetage mit nachvollziehbarer Vielfalt, Ernährungs-/Zugangsanforderungen, realistischen Wegen und Puffern, Freiraum und Budgetrahmen prüfen.
- Saison, Feiertage, Events und Wetter mit datierten Quellen einbeziehen; Saisonerwartung bleibt von kurzfristiger Vorhersage getrennt.
- Den Entwurf auf derselben Kartenbühne Tag für Tag präsentieren, Änderungen erhalten und nur bestätigte Auswahlen idempotent über Trip/Places/Journey übernehmen.
- Echte Kontoübernahme, Wiederaufnahme und physische iOS-/Android-Bedienung prüfen. Globale Stadtdetails, interaktiver Reisefilm, dauerhafte Identity-Übergabe und Trip-Lifecycle bleiben explizite Produktgates; P15/P17 erst danach abschließen.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: echter KI-Positivlauf wegen HTTP 429 credit_balance_exhausted, vollständige Kontextplanung, weitere interaktive Ausarbeitung und globale Städtestufen, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im damaligen Snapshot waren 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

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
