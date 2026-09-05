# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert; B1/P02–P03 bleibt für den positiven Google-Places-Ernährungsbeleg aktiv. Die API selbst ist laut Nutzerbestätigung bereits aktiv; der aktuelle Abschlussblock liegt jetzt bei Key-Beschränkung, Key-Projekt-/Billing-Zuordnung und anschließendem Realbeleg.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2. Gateway v204 / 4.64.21 ist ACTIVE und reduziert Google-Permission-Fehler sicher auf Status, Grund und Dienst. Das unveränderte Supabase-Secret ist vorhanden. Nach kontrolliertem Cooldown-Reset erreichte der Live-Probe places.googleapis.com und belegte HTTP 403 / PERMISSION_DENIED. Alle zeigt 50 reale Essen-&-Trinken-Pins; Passend bleibt ohne erfundenen Positivbeleg 0/0. Visit-/Memory-Owner, Supabase-Visit-Constraint, sichtbarer 477×900-Browsertest, 30/30 öffentliche Bytevergleiche, 227/227 Safe Regression nach der Diagnose und der unveränderte Main-Inhalt bleiben belegt.

**Nächster Schritt (AKTIV): Bestehenden Google-Key mit Places API (New) und Supabase-Serveraufruf abgleichen.** Places API (New) ist laut Nutzerbestätigung aktiv und das unveränderte Secret erreicht Google. Der echte Search-Aufruf wird jedoch von places.googleapis.com mit HTTP 403 / PERMISSION_DENIED abgewiesen.

**Abnahme dieses Schritts:**

- Im Projekt des bestehenden Schlüssels die API-Beschränkung auf Places API (New) prüfen.
- Die Anwendungseinschränkung muss einen serverseitigen Aufruf aus Supabase Edge Functions zulassen; eine reine Browser-Referrer-Beschränkung ist dafür ungeeignet.
- Projektzugehörigkeit des Schlüssels und aktives Billing dieses Schlüsselprojekts sind bestätigt.
- Der öffentliche Health-Probe antwortet ohne PERMISSION_DENIED und ohne Offenlegung des Schlüssels oder von Consumer-Metadaten.
- Essen & Trinken zeigt mindestens einen realen vegetarischen Passt-Pin; Places, Timeline und AI Chat teilen Provider-ID, Reisezielradius und Passend-Grund.
- Safe Regression, Stable/Immutable-Identität und unveränderter Git-Main-Stand sind erneut belegt.

**Danach:** Danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: bestehende Google-Key-Beschränkung beziehungsweise Key-Projekt-/Billing-Zuordnung korrigieren und positiven öffentlichen Ernährungsbeleg abnehmen. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
