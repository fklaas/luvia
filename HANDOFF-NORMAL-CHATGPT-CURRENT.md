# Luvia Übergabe für die Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-04:** Integration **13.82.168.49**, Core **4.82.171**. M16.5, Schritte 15–18 aktiv; B1 in Arbeit. A1 Dokumentkonsolidierung abgeschlossen und fortlaufend gepflegt; A2 Ende-zu-Ende-Abnahme teilweise belegt; A3/P09 und A4/P10 weiter teilweise umgesetzt.

**Zuletzt geliefert:** App .49 schließt die P09/P01-First-Paint-Lücke auf stabiler Integration: sechs Timeline-Datenquellen starten ohne serielle Place-Wartezeit; beim Reisewechsel werden alte Einträge sofort entfernt; während eines ungeklärten Owner-Reads erscheint kein falscher leerer Tag. Geplante Places, Buchungen, bestätigte Besuche und Memories erhalten eine lesbare Owner-Fähigkeitsmatrix; Direktbearbeitung bleibt auf zugelassene Place-Pläne begrenzt. 217/217 Safe Regression, 30/30 Byte-Gleichheit und ein sichtbarer angemeldeter Reload mit zwei echten Ostseeurlaub-Momenten sind belegt.

**Nächster Schritt (GEPLANT): Places-Kategorie- und Ausschnittskontinuität unter echten Wiederholungen schließen.** Der zuletzt beobachtete Wechsel zwischen keinen, drei und ungefähr 45 Pins bei derselben Reise und Kategorie widerspricht der bereits vorhandenen lokalen Filtermatrix. Jetzt muss der reale asynchrone Browserpfad mit Provider-, Cache-, Kategorie- und Request-Identität reproduziert und stabilisiert werden.

**Abnahme dieses Schritts:**

- Auf der stabilen Integration mindestens fünf sichtbare Wechselzyklen zwischen Shopping, Natur & Erholung, Essen & Trinken und weiteren Kategorien am aktiven Reiseziel Scharbeutz ausführen; jede Runde protokolliert Kategorie, Ausschnitt, Request-ID, Provider/Cache-Herkunft, Dauer und Trefferzahl.
- Eine ältere, langsamere Antwort darf weder die aktuelle Kategorie noch deren Pins überschreiben; Abbruch, Zusammenführung, Retry und Cache-Freshness werden im echten Browserpfad belegt.
- Während Nachladen bleiben der letzte gültige Kartenstand und ein eindeutiger Ladehinweis sichtbar. Ein temporärer Providerfehler darf nicht als endgültiges „nichts gefunden“ erscheinen und ein echter leerer Filter bleibt trotzdem ehrlich leer.
- Mobile und Desktop, Ziehen und Zoomen sowie die gemeinsame technische Basis von Places und Stays sichtbar prüfen; alle Testzustände danach zurücksetzen und vollständige Regression plus öffentliche Byte-Gleichheit belegen.

**Danach:** Danach P09/P10 mit positiven delegierten Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente fortsetzen; anschließend physische iPhone-/Android- und echte Mehrnutzerkonflikte nachschärfen und die vollständige B1-Nutzerkette schließen.

**Weiter offen:** Vollständige P02/P03- und P09/P10-Abnahme, reale Geräte und Mehrnutzerfälle; verifizierte Ortsfotos und positive Booking-Partnerpfade. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt im Gesamtplan bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration läuft auf **13.82.168.49**, Core **4.82.171**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

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

Integration läuft auf 13.82.168.49. Der zuvor leere Chat-Suchpfad wurde repariert: Kandidatenfenster und sichtbare Auswahl sind getrennt, der lokale Zielortkontext bleibt erhalten, allgemeine Suchverben werden nicht als Ortsmerkmale behandelt und vegetarische Empfehlungen benötigen belegte Eignung. Beim Ausschnittswechsel bleiben Suchauftrag und Aktionsangebote erhalten. Leere Ergebnisse werden ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.
## Aktueller Stand

Repository: C:/Users/fabia/Documents/GitHub/luvia-integration. Ausgangspunkt dieser Konsolidierung: c28621de866a8dee371ca926b5f98f9617d9e295. Aktive Integration: App 13.82.168.49, Core 4.82.171, Frontend-Quelle 8eeba9ada79488760fc55d0de042c107630a7002, Worker 020f04e8-677c-4027-8cbb-0c5b1847ff38, Gateway v161 ACTIVE. Die vorherige HERE-Aktivierung bleibt erhalten. Main bleibt unverändert; kein Main-Frontend-Deploy wurde ausgeführt; die bestehende gemeinsame Booking-Funktion wurde aktualisiert.

Die aktuelle Runtime-Abnahme belegt 214/214 Safe Regression und 30/30 öffentliche Dateihashes. Der B1-Bericht grenzt die sichtbaren Produktnachweise ein. Places und Stays verwenden die gleiche Kartentechnik. Zielortsuche, aktive Reise, Filter, Passung, Pins, mobile Darstellung, Reisefarbe und Geh-/Fahrradrouten wurden repariert. Vollständige Ortsfotos, echte Hotelangebote und komplette aktuelle AI-/Timeline-Abnahme fehlen.

## Fahrplan und nächste Arbeit

M0–M16 sind dokumentiert geschlossen. M16.5 Schritte 01–14 bleiben geschlossen, Schritte 15–18 laufen. B0 ist die geschlossene Steuerungsgrundlage, nicht vollständige produktive AI-Parität. B1/P01–P10 ist aktiv. P04/P05 besitzen erneuerte begrenzte öffentliche Belege im aktuellen B1-Lauf. P09/P10 und die vollständige B1-Golden-Journey sind die nächste unabhängige Produktarbeit. P01–P39 bleiben in M16.5; P40–P50 folgen den einschlägigen späteren Gates.

Weitergehen mit den offenen A2-Teilen und A3: gezielte Änderung und Konfliktlösung, dauerhafte Rücknahme sowie P09-Befehle add/edit/move/reorder/connect/delete/restore über journey.v1 schließen und P10-Erklärungen verständlich machen. Bilder und positive Booking-Zugänge können parallel sachlich weiterlaufen. Keine bezahlte Buchung und keine Nachricht an Anbieter aus einem generischen Testauftrag ableiten.

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

## Modus normaler ChatGPT Chat

Wenn diese Sitzung keine Datei-, Terminal- oder Browserwerkzeuge besitzt, führt Fabian begrenzte PowerShell-Blöcke aus und kopiert die Ausgabe zurück. Es gilt das Format aus docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md. Vor einer Rückmeldung keine Ergebnisse behaupten. Verfügt die Sitzung tatsächlich über geeignete Werkzeuge, dürfen diese unter der vorhandenen Nutzerautorisierung direkt verwendet werden; die alte Aussage „ChatGPT hat niemals Zugriff“ ist keine technische Tatsache für jede Sitzung.
