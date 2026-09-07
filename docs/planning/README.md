# Luvia konsolidierte Arbeitsplanung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.143**, Core **4.82.262**. P17/P19 aktiv und teilweise: App .143 / Core .262 und Intelligence v46 / 4.38.5 sind auf Integration veröffentlicht. Der echte Valencia-Fall wird semantisch korrekt bis zur Gesamtplanung geführt. Falsche Dauer-, Budget-, Rollen-, Duplikat-, JSON-, Schema- und Auditblocker sind beseitigt. Der zuvor zu dünne Tag 2 besitzt jetzt einen gezielten KI-Reparaturpfad: Nur das betroffene Datum wird neu komponiert, gültige Tage und deren Places bleiben erhalten. 239/239 Regression und 112 Composer-Prüfungen sind grün. Ein erneuter echter Vollplan sowie dauerhafte serverseitige Wiederaufnahme fehlen noch; der Composer ist deshalb weiterhin nicht final abgenommen. Gateway v235, Main und Production bleiben unverändert.

**Zuletzt geliefert:** Auf Integration belegt sind fünf individuell begründete Ziele, drei passende konkrete Zeitfenster bei grobem Monatswunsch, direkte Gesamtplanung nach Zeitwahl, ein kompakter semantischer Reisevertrag, Reiseversprechen, geplante Freiräume, reiseweite Tagesbalance, Unsicherheitskarte, Buchungsreihenfolge, modellierter Unterkunftsradius, kanonische Tagesrollen, fortgesetzte Duplikatreparatur und ein Audit, der nur echte Blocker sperrt. Die Qualitätskaskade nutzt Luna, Terra und nur als letzte Stufe Sol. Reise-DNA und Zeitreise bleiben sichtbar. Die Unit-Economics-Grundlage enthält vorläufige Free-, Plus-, Premium- und Reisepass-Pakete sowie eine konservative Break-even-Rechnung. Der neue gezielte Tagesreparaturpfad ersetzt bei einem datierten Blocker nur den betroffenen Tag und sperrt die bereits in gültigen Tagen verwendeten Places.

**Nächster Schritt (AKTIV): Den tageweisen KI-Plan als fortsetzbaren serverseitigen Auftrag persistent machen und echt abnehmen.** Die gezielte Tagesreparatur vermeidet bereits vollständige Neugenerierungen. Der Auftrag lebt während der Modellaufrufe aber noch im Browser. App-Wechsel, Reload und lange Antwortzeiten müssen ohne Verlust oder Doppelberechnung überstanden werden.

**Abnahme dieses Schritts:**

- Wunschdeutung, Kandidatenrecherche, Erstentwurf, tageweise Reparatur, globalen Audit und Freigabe unter einer idempotenten serverseitigen Auftrags-ID fortsetzen.
- Zwischenstände und Kosten je Phase serverseitig speichern; ein Reload liest denselben Auftrag und startet keine bereits erfolgreiche Modellstufe erneut.
- Den Valencia-Fall und einen deutlich anderen Familien-/Ferienfall authentifiziert vollständig durchlaufen lassen und Kosten, Token, Latenz, Auditquote und Reparaturpfad messen.
- Konfliktmoderator und semantische Ablehnungsdiagnose danach auf denselben gezielten Reparaturpfad setzen.
- Erst nach zwei vollständigen Positivläufen P17/P19 weiter schließen; keine kontrollierte Fixture als Ersatz für den echten Modellbeleg verwenden.

**Danach:** Nach dem fortsetzbaren P19-Kompositionsauftrag folgen Konfliktmoderator, semantische Ablehnungsdiagnose und gezielte Teilreparatur sowie die P15/P17-Kontoübernahme-, Reload-, Timeline-, Archiv-/Wiederherstellungs- und physischen Gerätegates. M17 ist anschließend der globale Rollout und Freeze von Sprache, Design, Zuständen, Motion und Komponenten. M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence Product Evolution II aus.

**Weiter offen:** P02/P03: breite exakte Ortsbilder, Google-Berechtigung und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09–P12: physische Abnahme und echte Context-Signale. P15/P17: professionelles visuelles Endgate, Kontoübernahme, dauerhafte Identity-Übergabe, Lifecycle und physische Geräte. P16: Konfliktmoderator, semantische Ablehnungsdiagnose und gezielte Teilreparatur. P19: fortsetzbare serverseitige Mehrtageskomposition, zwei echte Positivläufe sowie produktive datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege. Von den sieben Composer-USPs sind Reise-DNA und Zeitreise umgesetzt; Reise-Schatten, Kontextwellen, Luvia Pulse, Ziel-Zwillinge und Gruppen-Sternbild bleiben in ihrer Owner-Reihenfolge offen. Kein zusätzlicher P-Block wird als vollständig abgeschlossen markiert.

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
