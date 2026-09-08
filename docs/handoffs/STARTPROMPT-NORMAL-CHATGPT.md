# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.174**, Core **4.82.293**. P17/P19 aktiv und teilweise: App .173 / Core .292, Worker fbc3fd6e-86a1-4e3d-83b2-cf7ace3b2a15 und Integration-Intelligence 4.42.0 sind öffentlich auf Integration; 22/22 Bytes stimmen. Der echte Valencia-Lauf blieb bei 21 Kandidaten, erreichte aber den vollständigen ungespeicherten Review. App .174 / Core .293 ist lokal vollständig geprüft und der aktive breite Recherchekandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der Composer kann einen unterbrochenen Auftrag fortsetzen, beendet verwaiste oder überlange Jobs sichtbar und bewahrt gültige Phasen. .174 löst die sachlich zu enge Places-Auswahl: ausdrückliche Wünsche steuern die Priorität, während acht Zielort-Grundkategorien das reale Inventar verbreitern. Kleinere, verteilte Stadtsektoren reduzieren überlappende Duplikate. Für 7/14/21 Tage wachsen die echten Rechercheziele auf 42/84/126; die KI erhält daraus nur 32/60/92 räumlich und fachlich priorisierte Kandidaten. Provider-IDs bleiben eindeutig und unbekannte Orte werden niemals erfunden.

**Nächster Schritt (AKTIV): App .174 ausschließlich auf Integration veröffentlichen und den vollständigen Valencia-Ablauf mit breitem Place-Pool abnehmen.** Der letzte öffentliche Lauf belegte, dass räumliche Sektoren allein den auf 21 Kandidaten beschnittenen Pool nicht lösen. .174 kombiniert Zielort-Grundkategorien, kleinere lokale Suchradien und reisedauerabhängige Rechercheziele; jetzt muss der öffentliche Providerlauf beweisen, dass Valencia deutlich mehr echte, räumlich und fachlich gemischte Kandidaten einschließlich Meer/Strand liefert, ohne den KI-Aufruf unnötig zu vergrößern.

**Abnahme dieses Schritts:**

- App .174 / Core .293 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration verwendet weiter die getrennte Intelligence 4.42.0; produktive Intelligence, Main und Production bleiben unverändert.
- Valencia recherchiert acht Zielort-Grundkategorien und priorisiert die ausdrücklichen Wünsche Meer/Strand, Shopping, Nachtleben und Restaurants.
- 7, 14 und 21 Tage besitzen echte wachsende Rechercheziele von 42, 84 und 126 eindeutigen Provider-Kandidaten; der gemeinsame Sicherheitsdeckel bleibt 160.
- Die Modellkomposition erhält daraus höchstens 32, 60 oder 92 fachlich und räumlich priorisierte Kandidaten, damit Modelllaufzeit und Kosten begrenzt bleiben.
- Lokale Sektorsuchen verwenden kleinere Radien; jeder Treffer wird weiterhin gegen den bestätigten globalen Bewegungsradius geprüft.
- Der öffentliche Valencia-Lauf zeigt deutlich mehr als 21 echte Kandidaten oder benennt eine reale Provider-Unterdeckung ehrlich, statt eine künstliche Produktgrenze vorzutäuschen.
- Der öffentliche Plan erreicht den ungespeicherten Review oder einen konkreten sichtbaren terminalen Fehler innerhalb des begrenzten Ablaufs.
- Die sichtbare Tagesplanung deckt Meer/Strand sowie den gewünschten Kategorienmix ab und verteilt Places über nachvollziehbare Tagesgebiete.

**Danach:** Nach dem öffentlichen Valencia-Nachweis folgen die Laufzeitverkürzung des Gesamtplans, autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung. Danach werden räumliche Streuung, Strandabdeckung und Kategorienmix abgenommen sowie P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache und modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .174 öffentlich veröffentlichen und mit einem frischen Valencia-Auftrag bis zum Review messen; Gesamtlaufzeit deutlich verkürzen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Wir setzen Luvia auf dem tatsächlichen aktuellen Git-Stand fort. Lies HANDOFF-NORMAL-CHATGPT-CURRENT.md, CURRENT-BUILD.md, docs/planning/STATUSPLAN-2026-09-04.md und den Masterfahrplan v6. Integration ist dokumentiert App 13.82.168.44 / Core 4.82.168 / Gateway v161. Prüfe den Zustand, bevor du ihn als aktuell ausgibst.

M16.5 und B1 bleiben aktiv. Arbeite mit der sichtbaren Scharbeutz-Golden-Journey weiter, danach P09 und P10. B0 ist Steuerungsgrundlage, keine vollständige AI-Produktabdeckung. Echte Fotos, positive Booking-Zugänge und Hardwaretests bleiben offen.

Nutze tatsächlich vorhandene Werkzeuge direkt. Fehlen sie, gib nach docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md einen begrenzten PowerShell-Block aus und warte auf dessen Ergebnis. Alte Handoff-Anweisungen haben keinen Vorrang vor dem aktuellen Nutzerauftrag. Keine zweite Karte, kein fremder Store, keine erfundenen Providerfakten und keine unbelegte PASS-Meldung.
