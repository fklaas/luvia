# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.194**, Core **4.82.313**. P17/P19: Öffentlicher Wiederanlauf mit Gesamtaudit, echter Reservewahl und Reload positiv; räumliche Orts- und Reservequalität bleibt offen.

**Zuletzt geliefert:** Integration .194 / Core 4.82.313 aus 86084b13 ist unter Worker 87260e5a-f5c3-4437-8a8d-ab7f77818873 veröffentlicht; 22/22 Bytevergleiche zum sauberen Archiv PASS. Echter Workflow 1687ccc4-a24f-47a6-a451-85aa75edc5ca: ready_for_review, sieben Tage, 18 Orte, 100 behaltene Kandidaten, drei Plan-B-Alternativen, separater Audit 88 / Versprechen erfüllt. Wiederanlauf 44,38 Sekunden serverseitig, drei Modellaufrufe / 34.197 ms Modellzeit / 29.968 Tokens. Dies ist die Reparatur eines bestehenden Entwurfs, kein Kaltstart-Benchmark. Echter Reserveaustausch vom Museo Histórico Municipal de Valencia zur Galería de Arte Maika Sánchez und Reload samt vollständigem Pool positiv. Zwei auffällige TomTom-Koordinaten bleiben als Audit-Aufmerksamkeit offen; beim ersten Museum gab es keinen verfügbaren gebietsfernen Ersatz. Keine bestätigte Trip-/Timeline-Übernahme ausgeführt.

**Nächster Schritt (AKTIV): Räumliche Ortsidentität und kategoriespezifische Reservequalität schließen.** Der reale Review hat zwei auffällige Ortskoordinaten markiert; die gebietsferne Kulturreserve blieb trotz insgesamt 100 Places leer. Die Karten-Pinnummern müssen außerdem der Tagesreihenfolge entsprechen.

**Abnahme dieses Schritts:**

- Die zwei benannten TomTom-Orte über den kanonischen Places-Vertrag räumlich prüfen und fehlerhafte Quellzuordnungen beheben.
- Kultur-/Museumsalternativen außerhalb des aktuellen Innenstadtgebiets aus tatsächlich passenden Providerergebnissen erschließen.
- Aktivitätskarte und Kartenpin zeigen denselben Ort und dieselbe Tagesnummer.
- Vor einer weiteren bezahlten Gesamtkomposition die betroffenen Providerdaten und Reparaturpfade lokal absichern.

**Danach:** Danach den zweiten Familien-/Ferien-/Konfliktfall und die verbleibenden P17/P19-Gates einschließlich physischer Geräte schließen. M16.5 ist nicht insgesamt abgeschlossen.

**Weiter offen:** P17/P19 bleiben TEILWEISE. Offen sind auffällige Koordinaten, gebietsferne Kulturreserve, Karten-Pinnummern gegenüber der Tagesreihenfolge, breiter Kaltstart-Nachweis, Familien-/Ferien-/Konfliktfall, Konto-/Timeline-Übernahme und physische iOS-/Android-Prüfung. 14-/21-/28-Tage-Transport und abschnittsweise Wiederaufnahme sind kontrolliert geprüft, nicht auf physischen Geräten abgenommen.

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
