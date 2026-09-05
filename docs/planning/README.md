# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.96**, Core **4.82.215**. M16.5 Schritte 15–18 aktiv. Integrationskandidat App .96 / Core 4.82.215 erweitert P02 um eine gecachte OSM-Kontinuitätsebene für alle 14 Kategorien; die öffentliche Deployment- und Browserabnahme ist noch offen. P03-Owner-Parität bleibt über Places, Timeline und AI belegt. Apple bleibt geparkt.

**Zuletzt geliefert:** Der öffentliche Stand .95 hält Passend fail-closed und Places, Timeline sowie AI auf derselben Owner-Entscheidung. Kandidat .96 ergänzt die serverseitig begrenzte OSM-Kategoriesuche vor TomTom/HERE, 14 Kategorien, alle 19 Landesküchen, fail-closed Sachfilter und exakte OSM-Bildreferenzen. Safe Regression 231/231 und NFR-0 3/3 sind grün; Veröffentlichung und sichtbare Mobil-/Desktop-Abnahme folgen in diesem laufenden Abschnitt.

**Nächster Schritt (AKTIV): Kategorie-, Filter-, Foto- und Provider-Vollständigkeit schließen.** Die Owner-Parität ist öffentlich belegt. Jetzt muss dieselbe Verlässlichkeit über die gesamte Places- und Stays-Breite gelten, statt nur für den vegetarischen Restaurantpfad.

**Abnahme dieses Schritts:**

- Alle 14 sichtbaren Kategorien und 82 kanonischen Zuordnungen liefern auf Desktop und Mobile konsistente Ergebnisse; Zoomen, Ziehen und schneller Kategorienwechsel bleiben bedienbar.
- Jeder sichtbare Sachfilter und alle 19 Landesküchen werden gegen reale positive, negative, leere und teilweise Providerproben geprüft; UI-Label, aktive Kategorie und tatsächlich gefilterte Kohorte stimmen überein.
- Passend bleibt für jede Kategorie owner-basiert und fail-closed; widersprüchliche oder unbelegte Orte erscheinen nicht als passend.
- Detail-Sheets verwenden echte, dem exakten Place zuordenbare Bilder mit Herkunft; fehlende Bilder werden ehrlich und hochwertig behandelt, ohne irreführende Fremdort-Fotos.
- Provider-Kaskade, Cache, Deduplizierung, Timeouts und Quoten sind messbar; Google bleibt bei höchstens 1.000 Aufrufen pro Tag, begrenzte Anbieter werden erst nach Cache und kostenlosen Quellen beansprucht.
- Places und Stays bestehen dieselbe Karten-, Pin-, Such-, Filter-, Passend- und Mobilabnahme; Safe Regression, NFR-0, sichtbarer Browserbeleg und immutable Release-Identität sind grün.

**Danach:** Nach P02/P03-Vollständigkeit folgt P09/P10: gemeinsame Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert und über diese Blöcke sequenziert.

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
