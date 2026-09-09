# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.181**, Core **4.82.300**. P17/P19 aktiv: Die öffentliche .180-Ausgabe ist byteidentisch, der gespeicherte Valencia-Entwurf bleibt erhalten, aber zwei Wiederanläufe meldeten die Integration-Intelligence unmittelbar als nicht verfügbar. Parallel beseitigt App .181 / Core .300 die feste 160-Places-Grenze. Recherchepool, erhaltene Reserve und KI-Arbeitsauswahl skalieren nun mit 7/14/21/28/42 Tagen; ein kontrollierter 28-Tage-Lauf hält 240 unterschiedliche Places und verarbeitet 180 Kandidaten im Intelligence-Vertrag.

**Zuletzt geliefert:** App .180 ist ausschließlich auf Integration veröffentlicht: Commit 27c47eb985a898acc89ea72b8c72541eabe6c4dd, Worker c0257fad-70be-46c3-a333-6ca6fb5194fe, Archiv 92.644.697 Bytes, SHA-256 6AA9F78ECEDD597054BFBAE687AF039B97CAEB69E088ECCBA9551A8CDC5D4E80 und 22/22 öffentliche Dateien byteidentisch. .180 behandelt nicht ausreichend nachgewiesene Live-Fakten als Aufmerksamkeit. App .181 entfernt zusätzlich die feste 160er-Grenze, führt dauerabhängige räumliche Seiten ein und kennzeichnet die Zahlen im Review als Entwurfsmenge statt Stadtbestand.

**Nächster Schritt (AKTIV): App .181 vollständig prüfen, ausschließlich auf Integration veröffentlichen und lange Place-Pools öffentlich belegen.** 17 eingeplante Reisemomente wurden als mutmaßlicher Valencia-Gesamtbestand verstanden; zusätzlich schnitt die Sitzung längere Reisen technisch bei 160 Kandidaten ab.

**Abnahme dieses Schritts:**

- Der Review trennt eingeplante Reisemomente, den reisespezifisch recherchierten Pool und den nicht behaupteten Gesamtbestand des Reiseziels.
- 7/14/21/28/42 Tage skalieren auf 42/84/126/168/252 recherchierte Kandidatenziele.
- Mindestens ein 28-Tage-Test hält mehr als 160 eindeutige Places und übergibt mehr als 160 Kandidaten durch den Intelligence-Vertrag.
- Räumliche Folgeseiten schließen bereits gefundene Provider-IDs aus und erweitern die Gebietsabdeckung.
- App .181 / Core .300 besteht Safe Regression, NFR-0, Composer-, P19-, Structured-Output-, Planungs- und Visual-Gates.
- Nur Integration wird veröffentlicht; Stable und immutable liefern die geprüften Dateien byteidentisch.
- Der öffentliche Valencia-Lauf erreicht Review oder dokumentiert einen neuen konkreten terminalen Providerfehler, ohne den gespeicherten Plan zu verlieren.

**Danach:** Nach .181 werden der erhaltene Reservepool für gezielten Tausch, Ergänzungen, spontane Vorschläge und Mehr-davon nutzbar gemacht sowie räumliche Streuung und Kategorienmix öffentlich abgenommen. Für sehr lange Reisen folgt anschließend die segmentierte KI-Komposition, damit nicht ein riesiger Prompt alle Wochen gleichzeitig tragen muss. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** P17/P19: .181 öffentlich prüfen; die derzeit nicht verfügbare Integration-Intelligence erneut vermessen; Reservepool als echte Tausch-/Ergänzungsquelle öffnen; räumliche Streuung und Kategorienmix abnehmen; sehr lange Reisen in Wochenabschnitte komponieren und anschließend ganzheitlich auditieren. Autoritativ belegte Ferienfenster, Konfliktvarianten, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose.

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
