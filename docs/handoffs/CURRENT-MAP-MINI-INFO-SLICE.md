# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.62**, Core **4.82.184**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .59 / Gateway v172 stabilisiert Kategorie-Reinheit und ausgewählte echte Ortsmedien auf Integration. Sichtbar blieb Food 50 → Shopping 21 → Natur 11 → Shopping 21 → Food 50 stabil; Food Passend 0 markiert das Steakhouse nicht, Natur enthält keine Verwaltung und Stays 49/27/49 keine Strandkorbvermietung. Der Exact-Photo-Pfad verlangt identischen Namen und höchstens 120 Meter, ruft danach höchstens ein beliebtes Foto ab und übernimmt kein nahes Fremdbild. Eine von sechs geprüften Unterkünften erhielt ein providerverknüpftes Bild. 220/220 Safe Regression und 30/30 öffentliche Dateien sind belegt.

**Nächster Schritt (AKTIV): Reale Filtermatrix, positive Profilevidenz und echte Place-Fotos schließen.** Providerkaskade, Kategorienwechsel, bekannte Randtreffer und ein sicherer Exact-Photo-Pfad sind stabilisiert. Offen sind die reale Abnahme jeder Filteroption über UI und AI Chat, positive vegetarische Treffer, die Differenz Shopping 21 gegenüber dem früheren Soll 45 sowie ausreichend echte Bilder.

**Abnahme dieses Schritts:**

- Jede sichtbare Places-Filteroption und jede Landesküche erhält einen providerübergreifenden Suchplan; positive Treffer, belegte Nulltreffer, Budgetausfall und Reset werden sichtbar sowie über den AI Chat geprüft.
- Geoapify, TomTom und HERE verwenden kompatible Küchen-/Kategorieevidenz und abgestufte Kosten. Die öffentliche Diagnose muss Food, Spezialküche und Kategorieausschlüsse weiterhin unabhängig von einem erschöpften Primärpool belegen.
- Alle und Passend verwenden dieselbe Place-Menge und ausschließlich belegte Profilvorlieben. Ein vegetarisches Profil darf ein fleischzentriertes Steakhouse ohne konkrete vegetarische Angebotsevidenz nicht als passend markieren und muss belegte positive Orte finden.
- Die stabile Shopping-Menge wird gegen das frühere Soll 45 analysiert; fehlende Provider-Segmente werden ergänzt, ohne Fremdkategorien oder unkontrollierten Anfragefächer.
- Jede Detailkarte versucht ein exakt zum Provider-Place gehörendes Foto mit Attribution zu laden. Weitere Medienquellen dürfen nur nach belegter Entity-Zuordnung ergänzen; ein fehlendes Bild bleibt ehrlich sichtbar.
- Places und Stays werden auf sichtbarem Desktop und physischem Mobilgerät mit Reiseziel, Zoom, Ziehen, Filtern, Ladezeit, Cache-/Provider-Spur und Budgetzustand wiederholt abgenommen.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-/Gateway-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend physische iPhone-/Android- und echte Mehrnutzerkonflikte nachschärfen und die vollständige B1-Nutzerkette schließen.

**Weiter offen:** P02/P03: reale Vollabnahme aller Filter und Landesküchen über UI/AI Chat, positive vegetarische Profilevidenz, Shopping-Vollständigkeit und breite echte Place-Fotos. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege. Reale Geräte und Mehrnutzerfälle bleiben offen; M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

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
