# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.126**, Core **4.82.245**. P15/P17 aktiv und teilweise: .126 liefert globale Geografie- und Auswahlkorrekturen sowie Tageswege-/Pufferprüfung. Die nächste Abschlusslücke ist ausreichend vielfältige Tagesabdeckung; kein vollständiger KI-Reiseplan belegt. Stable .104; Gateway v235 / Intelligence v37 unverändert.

**Zuletzt geliefert:** App .126 korrigiert sieben falsch orientierte Inselringe in vier Regionspaketen; Hawaii übermalt keine anderen US-Staaten mehr. Die US-Übersicht zeigt 50 Staaten plus Washington, D.C., mit Alaska/Hawaii als Nebenkarte. Die Länderbasis wächst von 177 auf 258 geografische Einheiten des Natural-Earth-Datensatzes, alle über sieben Kontinente erreichbar; kleine Inselstaaten und Kleinstaaten bleiben auswählbar. 10.197 Ringe und 4.589 Regionen in 251 Paketen werden mit der echten D3-Projektion geprüft. Nach einer Regionswahl öffnet die vorhandene kanonische Zielsuche automatisch; öffentlich wurde Hawaii, lokal Schleswig-Holstein inklusive korrekter Ebene und Überschrift abgenommen. Keine neue flächendeckende Kreis-/Stadtgeometrie. Ernährung, Mobilität und Barrierefreiheit sind getrennt. Mehrfachauswahl aktualisiert bestehende Chips ohne Sheet-Neuaufbau; sechsmaliges Umschalten, Profileigentum und Wiederaufnahme sind geprüft. Die missverständliche Mittelpunktlinie auf der geografischen Bühne ist entfernt; ein Compass-Faden begleitet die Auswahlfolge. Der Tagesfilm bleibt nach den Vorschlägen erreichbar und folgt der zeitlichen Reihenfolge. Neu: explizite Fuß-/Radwegeprüfung für bis zu acht Verbindungen des sichtbaren Tages über places.v1, Weitergabe belegter Wegezeiten an journey.v1 und verständliche Puffer-/Budget-/Abdeckungshinweise. Keine künstliche Blockade aus unbelegten Wegezeiten; belegte Konflikte bleiben auch bei teilweiser Routenabdeckung blockierend. Öffentlich lieferte OpenRouteService auf einer Scharbeutz-Teststrecke 6 Minuten zu Fuß und 3 Minuten per Rad. Die kombinierte Route-UI ist kontrolliert geprüft; der öffentliche Vorschlagslauf lieferte nur Strand Creperie über drei Tage. Filmstart, manuelle Pause und freier Tag mit null Pins sind öffentlich belegt. Damit ist noch kein vollständiger Reiseplan abgenommen.

**Nächster Schritt (AKTIV): Tagesabdeckung und Vielfalt zu einem vollständigen Reiseentwurf ausbauen.** Die Geografie-/Bedienkorrekturen und die erste explizite Tageswegeprüfung sind geliefert. Der öffentliche Lauf mit nur einem Place über drei Tage zeigt die nächste fachliche Lücke konkret. P15/P17 bleiben bis zu ihren vollständigen Produktgates teilweise.

**Abnahme dieses Schritts:**

- Über places.v1 ausreichend unterschiedliche, belegte Kandidaten für alle Reisetage finden; Kategorieabdeckung, Wiederholungen, Reise-/Profilvorgaben und freie Zeit prüfen. Keine gelockerten Sachfilter, erfundenen Places oder verdeckte Kontingentvervielfachung, um einen vollen Plan vorzutäuschen.
- Den vollständigen öffentlichen Weg zwischen mindestens zwei echten Entwurfsstationen per UI abnehmen; berechnete Wegegeometrie mit eindeutiger Darstellung und Quellenbeleg in die Tageskarte übernehmen. Zeitpuffer und Konflikte weiterhin durch journey.v1, einschließlich gemischter Fortbewegung und veralteter Quellen.
- Öffnungen, Saison, Feiertage, Events und Wetter über gemeinsame datierte Owner-/Intelligence-Kontexte einbeziehen. Budgetgefühl, Preisbelege und harte Budgetgrenzen getrennt behandeln; Lichtstimmung bleibt Atmosphäre.
- Nach verfügbarem Modellzugang einen echten vollständigen Wunsch-/KI-Plan-Lauf positiv abnehmen. Der zuletzt dokumentierte Kontingentblocker bleibt offen; keine Zahlung oder Konfigurationsänderung ohne Auftrag.
- Vor P15/P17-Gesamtabschluss bestätigte Kontoübernahme, dauerhafte Identity-Übergabe, Trip-Lifecycle und Wiederaufnahme auf physischen iOS-/Android-Geräten nachweisen. Gemeinsamen Status und alle aktiven Fahrpläne synchronisieren.

**Danach:** Nach belastbarer vollständiger Tagesplanung die verbleibenden P15/P17-Konto-/Lifecycle-/Gerätegates abschließen; danach M18–M22 mit Mitreisendenverwaltung, Administration, Social und Intelligence II. Die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17: vollständige Tagesvielfalt, Kontext/Budget, kombiniertes öffentliches Route-UI-Gate, echter KI-Positivlauf (zuletzt Kontingentblocker), Kontoübernahme, dauerhafte Identity-Übergabe, Lifecycle und physische Geräte. Die Geografie ist eine Übersicht, keine Zusage sämtlicher aktuellen Untergliederungen. Kein zusätzlicher P-Block wird als vollständig abgeschlossen markiert.

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
