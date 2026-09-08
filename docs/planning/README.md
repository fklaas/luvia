# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.144**, Core **4.82.263**. P17/P19 aktiv und teilweise: Intelligence v47 / 4.38.6 sowie der serverseitige P19-Reiseauftrag sind auf Integration aktiv; Frontend App .144 / Core .263 ist als Releasekandidat gebaut. Wunschdeutung, Kandidaten, Erstentwurf, Tagesreparatur und Audit hängen an einer fortsetzbaren Workflow-ID und an idempotenten Modelljobs. RLS und 24-Stunden-TTL sind belegt. Zwei echte vollständige Modell-Positivläufe und das Frontend-Deployment fehlen noch. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Zusätzlich zum semantischen Gesamtauftrag, Reiseversprechen, vollständigen Tagen, Freiraum, Tagesbalance, Unsicherheitskarte, Buchungsreihenfolge und Unterkunftsradius ist jetzt die technische Wiederaufnahme umgesetzt: derselbe Reiseauftrag übersteht Reload/App-Wechsel, erfolgreiche Modellstufen werden wiederverwendet, laufende oder verwaiste Stufen werden sicher fortgesetzt und Kosten je Workflow aggregiert. Erfolgreiche Roh-Eingaben werden gelöscht; Tabellenzugriff bleibt ausschließlich beim Intelligence-Owner.

**Nächster Schritt (AKTIV): Zwei unterschiedliche Reisen im fortsetzbaren KI-Auftrag vollständig positiv abnehmen.** Die Wiederaufnahme ist technisch und serverseitig aktiv. Jetzt muss die reale Planqualität mit echten OpenAI-Antworten, Places-Kandidaten und einem echten Reload statt nur kontrollierter Antworten bewiesen werden.

**Abnahme dieses Schritts:**

- Den bekannten Valencia-Auftrag für 12.–18.06.2027 authentifiziert bis Reiseversprechen, sieben vollständigen Tagen, Audit und Review-Freigabe abschließen.
- Einen deutlich anderen Familien-/Ferienauftrag mit echter Kalenderdeutung, altersgerechtem Rhythmus, bewussten Pausen und anderen Kategorien vollständig abschließen.
- Mindestens einen Lauf während einer aktiven Modellphase neu laden und belegen, dass dieselbe Workflow-/Job-ID fortgesetzt und kein bereits erfolgreicher Modellaufruf doppelt berechnet wird.
- Je Lauf Modell, Tokens, Kosten, Phasenlatenz, Audit, Reparaturanzahl und offene Providerunsicherheiten aus der serverseitigen Telemetrie erfassen.
- Erst nach beiden Positivläufen Konfliktmoderator und semantische Ablehnungsdiagnose auf denselben Teilreparaturpfad setzen.

**Danach:** Nach den zwei echten Positivläufen folgen Konfliktmoderator und semantische Ablehnungsdiagnose mit gezielter Teilreparatur. Danach schließen P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert anschließend Sprache, Design, Zustände, Motion und Komponenten global ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence Product Evolution II aus.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17/P19: zwei reale fortsetzbare Modell-Positivläufe, Kontoübernahme, Timeline-/Owner-Übernahme, Lifecycle und physische Geräte sowie produktive datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. P16: Konfliktmoderator, semantische Ablehnungsdiagnose und gezielte Teilreparatur. Reise-DNA und Zeitreise sind umgesetzt; Reise-Schatten, Kontextwellen, Luvia Pulse, Ziel-Zwillinge und Gruppen-Sternbild bleiben offen.

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
