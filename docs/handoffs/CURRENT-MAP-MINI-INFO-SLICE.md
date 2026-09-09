# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.197**, Core **4.82.316**. P17/P19: Integration .197 veröffentlicht; Kandidat App 13.82.168.198 / Core 4.82.317 ergänzt begrenzte Webrecherche.

**Zuletzt geliefert:** Integration .197 / Core 4.82.316 aus 2d4796ce veröffentlicht. Explizite Erlebniswünsche steuern Recherche, Kompositionsauswahl, Reserve und Audit; ungefragte Basiskategorien entfallen. Shopping sucht standardmäßig Einkaufszentren, besondere Geschäfte sind tripbezogen wählbar. Ein positiver Modellscore kann fehlende tatsächliche Erlebnisbereiche nicht mehr überstimmen. 244/244 vollständige kontrollierte Regression; anschließend 133 Composer, 145 Transport sowie die 27 Intentprüfungen nach der kleinen Annahmen-UI-Ergänzung erneut grün. 27/27 Stable-/Immutable-Dateien stimmen mit dem sauberen Archiv überein. A2 lokal bedient; der alte .195-Entwurf bleibt nach öffentlichem Reload als sieben Tage und 18 Momente erhalten. Keine neue kostenpflichtige Gesamtgenerierung und kein neuer Provider in diesem Slice; die Quellenlücke ist noch kein positiver Gesamtplan-Nachweis.

**Nächster Schritt (AKTIV): Budgetierte Webrecherche veröffentlichen und mit einem echten Reiseauftrag prüfen.** Explizite Reisewünsche dürfen keine ungefragten Basiskategorien auslösen. Mehr Recherchequellen helfen erst, wenn Reiseabsicht, Ortsbelege und tatsächlicher Plan übereinstimmen.

**Abnahme dieses Schritts:**

- Maximal zwei Webaufrufe pro Workflow, belegte Quellen, echte Ortsidentität, Wiederaufnahme ohne neue Recherche, serverseitiges Tageskontingent; vollständige Regression und öffentlicher Provider-Nachweis. P17/P19 bleiben bis zum passenden Gesamtplan und der weiteren Lern-/Gruppenabnahme teilweise offen.

**Danach:** Nach qualitativer Rechercheabnahme den Familien-/Konfliktfall und die übrigen P17/P19-Gates schließen. M16.5 insgesamt offen; M17 ist Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE: zuverlässige Aktivitätsquellen und konkrete Angebote, semantische Unterteilung allgemeiner Aktivitäten, Positivlauf des neuen Gesamtplans, Lernen über mehrere Reisen, Familien-/Konfliktfall, gebietsferne Reserve, Übernahme-/Recovery-Gates und physische Geräte. M16.5 bleibt offen.

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
