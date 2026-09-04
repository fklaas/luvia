# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.58**, Core **4.82.180**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .58 / Gateway v170 stabilisiert die Places- und Stays-Providerkaskade auf Integration. Erfolgreiche leere Antworten und Providerfehler sind getrennt; HERE übernimmt nach budgetbedingt abgewiesenen Geoapify-/TomTom-Vorrängen. Sichtbar: Food 50 → Shopping 21 → Natur 12 → Shopping 21 → Food 50, Chinesisch 2, Shopping Alle/Passend/Alle 21/6/21 und Stays 50/25/50. Food Passend markiert kein Steakhouse falsch. Gateway-Proben liefern Food 12, Chinesisch 2 und Natur 12 ohne Unterkunfts-/Spa-Typen. 220/220 Regression und 30/30 Byte-Gleichheit sind belegt.

**Nächster Schritt (GEPLANT): Reale Filtermatrix, positive Profilevidenz und echte Place-Fotos schließen.** Die Providerkaskade und Kategorie-Kontinuität sind stabilisiert. Offen sind die reale Abnahme jeder Filteroption über UI und AI Chat, belastbare positive vegetarische Treffer, zwei bekannte Kategorie-Randtreffer und exakt zugeordnete Ortsfotos.

**Abnahme dieses Schritts:**

- Jede sichtbare Places-Filteroption und jede Landesküche erhält einen providerübergreifenden Suchplan; positive Treffer, belegte Nulltreffer, Budgetausfall und Reset werden sichtbar sowie über den AI Chat geprüft.
- Geoapify, TomTom und HERE verwenden kompatible Küchen-/Kategorieevidenz und abgestufte Kosten. Die öffentliche Diagnose muss Food, Spezialküche und Kategorieausschlüsse weiterhin unabhängig von einem erschöpften Primärpool belegen.
- Alle und Passend verwenden dieselbe Place-Menge und ausschließlich belegte Profilvorlieben. Ein vegetarisches Profil darf ein fleischzentriertes Steakhouse ohne konkrete vegetarische Angebotsevidenz nicht als passend markieren.
- Jede Detailkarte versucht ein exakt zum Provider-Place gehörendes Foto mit Attribution zu laden. Fehlende Fotos bleiben ein sichtbarer Beschaffungszustand und werden nie als echtes Ortsfoto ausgegeben.
- Places und Stays werden auf sichtbarem Desktop und physischem Mobilgerät mit Reiseziel, Zoom, Ziehen, Filtern, Ladezeit, Cache-/Provider-Spur und Budgetzustand wiederholt abgenommen.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend physische iPhone-/Android- und echte Mehrnutzerkonflikte nachschärfen und die vollständige B1-Nutzerkette schließen.

**Weiter offen:** P02/P03: reale Vollabnahme aller Filter und Landesküchen über UI/AI Chat, positive vegetarische Profilevidenz, bekannte Kategorie-Randtreffer und echte Place-Fotos. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege. Reale Geräte und Mehrnutzerfälle bleiben offen; M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

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
