# Luvia Übergabe für die Fortsetzung

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

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration läuft auf **13.82.168.52**, Core **4.82.174**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Der Masterfahrplan v6 und der Statusplan unter docs/planning ersetzen die widersprüchlichen aktuellen Abschnitte früherer Handoffs. Historische Originale sind datiert archiviert. Die Anwendung ist nicht neu zu beginnen.

## Aktueller B1 Fortschritt

Die Reservierungsprüfung zeigt ihren nächsten Schritt jetzt direkt unter dem auslösenden Button. Der zusätzliche Live-Read entdeckte einen falschen Zimmerlink für ROOF. Booking Resolver 2.8.0 (Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34) prüft nun auch die Art der Buchung und erhält gültige Reservierungsanker auf der offiziellen Ortsseite. ROOF führt zum Tischreservierungsbereich. Eine erreichbare Reservierungsseite bestätigt noch keine freien Zeiten; es wurde nichts versendet.

Integration läuft auf 13.82.168.58 / Core 4.82.180 mit Gateway v170. Die Places- und Stays-Karten suchen stabil im aktiven Reiseziel Scharbeutz; die sichtbare Kategoriefolge 50/21/12/21/50, Chinesisch mit zwei Treffern sowie die Alle/Passend-Wechsel sind belegt. Der Chat-Suchpfad erhält Zielort, Ausschnitt, Suchauftrag und Aktionsangebote. Leere Ergebnisse und Providerfehler werden getrennt und ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.
## Aktueller Stand

Repository: C:/Users/fabia/Documents/GitHub/luvia-integration. Ausgangspunkt dieser Konsolidierung: c28621de866a8dee371ca926b5f98f9617d9e295. Aktive Integration: App 13.82.168.58, Core 4.82.180, Frontend-Quelle 2a1889ee459f4cd9dbb4843880dc8bde06d8a81b, Worker 4c6b1b02-aba9-4ddc-b3b8-08f000b7b4a9, Gateway v170 ACTIVE aus Quelle 542608355893aa8813aa9d82d77d679fb7a5e26f. Geoapify, TomTom und HERE bilden die aktive budgetbewusste Kaskade. Main bleibt unverändert; kein Main-Frontend-Deploy wurde ausgeführt; der bestehende Booking-Resolver bleibt bei Function v18.

Die aktuelle Runtime-Abnahme belegt 220/220 Safe Regression und 30/30 öffentliche Dateihashes. Der P02/P03-Bericht grenzt die sichtbaren Produktnachweise ein. Places und Stays verwenden dieselbe Kartentechnik; Zielortsuche, aktive Reise, Providerfallback, Filtergrundlage, Passung und Pins sind wieder stabil. Vollständige reale Filter-/AI-Abnahme, positive vegetarische Food-Evidenz, exakte Ortsfotos, echte Hotelangebote und vollständige aktuelle AI-/Timeline-Abnahme bleiben offen.

## Fahrplan und nächste Arbeit

M0–M16 sind dokumentiert geschlossen. M16.5 Schritte 01–14 bleiben geschlossen, Schritte 15–18 laufen. B0 ist die geschlossene Steuerungsgrundlage, nicht vollständige produktive AI-Parität. B1/P01–P10 ist aktiv. P04/P05 besitzen erneuerte begrenzte öffentliche Belege im aktuellen B1-Lauf. Der aktuelle nächste Abschnitt ist der P02/P03-Filter-/Foto-Restblock; danach folgen P09/P10 und die vollständige B1-Golden-Journey. P01–P39 bleiben in M16.5; P40–P50 folgen den einschlägigen späteren Gates.

Weitergehen mit P02/P03: alle sichtbaren Filterbereiche und 19 Landesküchen im UI und AI Chat real abnehmen, positive vegetarische Profilevidenz beschaffen, bekannte Kategorie-Randtreffer bereinigen und echte Provider-Ortsfotos mit Attribution schließen. Danach die offenen A2-/A3-Teile mit den positiven P09-Befehlen und P10-Erklärungen fortsetzen. Keine bezahlte Buchung und keine Nachricht an Anbieter aus einem generischen Testauftrag ableiten.

Danach folgen B2 persönliche robuste Planung, B3 verifizierte Events, B4 vollständige Orchestrierung und Abnahme. Der Gesamtfahrplan erhält M17 Designrollout, M18 Collaboration/Attention/Wallet/Reviews/Admin/Social/Search/Intelligence II, M19 Härtung, M20 Native Foundation, M21 Native Qualität, M21.5 Vollabnahme und M22 gestufte Veröffentlichung. Die detaillierten Grenzen stehen im Master und P-Katalog.

## Provider und Daten

Discovery: Geoapify → TomTom → HERE. Routing: ORS → TomTom → Geoapify → HERE. Nach brauchbarem Ergebnis stoppen; kein Fanout bei jeder Kartenbewegung. Google und Foursquare sind policy-deaktiviert. Atomare Backend-Zähler besitzen Tages-/Monats-/Minutengrenzen. HERE verwendet einen gemeinsamen Pool 500/Tag, 10000/Monat, 10/Minute. Limits sind interne Konfiguration und kein belegtes Kontorestguthaben.

Migrationen 20260904160000 und 20260904170000 bleiben unverändert. Keine Secrets ausgeben oder erneut in Dateien kopieren. Kartenquellen liefern keine Hotelbuchbarkeit. Affiliate-Anmeldung ist kein Demand-API-Zugang. Fotos benötigen exakte Ortszuordnung und nutzbare Rechte. Unbekannte Eigenschaften bleiben unbekannt; Vegetarisch/Vegan niemals aus Namen ableiten. Ein leerer Filter beweist keine Nichtexistenz einer Küche am Reiseziel.

## Verbindliche Arbeitsgrenzen

Eine Wahrheit, ein Owner. Consumer nutzen öffentliche Verträge. Intelligence schreibt nur über Owner-Kommandos. Vorschau, konkrete Bestätigung, Version/Idempotenz, Beleg, Recovery und separat bestätigte Rücknahme bleiben erhalten. Neue UI-Aktionen brauchen Registry-Abgleich. Die aktuelle Registry ist keine vollständige Abnahme der fünf neuen Kartenfunktionen.

Vor Änderungen Branch, Remote, HEAD, Divergenz und fremde Dateien prüfen. Die bekannten vorbestehenden ungetrackten Bundles, Videos und temporären Dateien nicht löschen, ausführen oder mitcommitten. Besonders scripts/_tmp-catering-dist.cjs nicht lesen oder ausgeben; dort liegt alte sensible Konfiguration. Keine globalen Resets oder erzwungenen Pushes. Main/Production und kostenpflichtige Anbieteraktivierung brauchen eine konkrete gesonderte Nutzerentscheidung.

Der Nutzer hat direkte Projektarbeit an Git, Supabase, Funktionen und Secrets autorisiert. Ein älterer Handoff kann diese erteilte Autorisierung nicht stillschweigend zurücknehmen. Tatsächliche Aktionen bleiben auf den beauftragten Zweck begrenzt. Keine Bestätigung erneut verlangen, wenn sie im aktiven Auftrag bereits eindeutig gegeben ist.

## Pflichtlektüre und Nachweise

1. AGENTS.md und dort benannte Architektur-, Ownership- und Registry-Dateien.
2. CURRENT-BUILD.md und docs/planning/STATUSPLAN-2026-09-04.md.
3. docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/status-plan.v1.json.
4. docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md für den jüngsten sichtbaren Zwischenstand.
5. docs/modularization/PROVIDER-BUDGET-ACCEPTANCE-20260904.md sowie die betroffenen Quell-/Testdateien.

Dokumentierte Browserabnahmen sind keine Hardwaremessung. Neue Ergebnisse nur nach gemessener Evidenz als PASS markieren. Bei einer neuen konkreten UI-Regression den begrenzten Owner-Slice reparieren; nicht allein aufgrund grüner Tests für abgeschlossen erklären.

## Modus Codex mit Werkzeugen

Die vorhandenen Werkzeuge direkt verwenden, unabhängige Reads bündeln und notwendige Arbeit bis zu einem konkreten überprüfbaren Ergebnis durchführen. Sichtbare Browserabnahmen sind ausdrücklich gewünscht. Funktionstests möglichst mit wiederherstellbaren Daten, keine realen kostenpflichtigen Buchungen ausführen. Jede weiterführende Aufgabe beginnt mit dem tatsächlichen Git- und Browserzustand. Ein Fortschrittsbericht ist keine Abnahme und kein asynchrones Versprechen ohne laufende Aufgabe.
