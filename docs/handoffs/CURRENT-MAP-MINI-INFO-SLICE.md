# Aktueller gemeinsamer Places und Stays Slice

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

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md)
- [Ergänzender Nachweis und Status](../modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
