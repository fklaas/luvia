# Luvia Statusplan 4 September 2026

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.97**, Core **4.82.216**. M16.5 Schritte 15–18 aktiv. Integrationskandidat App .96 / Core 4.82.216 erweitert P02 um eine gecachte OSM-Kontinuitätsebene für alle 14 Kategorien; die öffentliche Deployment- und Browserabnahme ist noch offen. P03-Owner-Parität bleibt über Places, Timeline und AI belegt. Apple bleibt geparkt.

**Zuletzt geliefert:** Der öffentliche Stand .95 hält Passend fail-closed und Places, Timeline sowie AI auf derselben Owner-Entscheidung. Kandidat .96 ergänzt die serverseitig begrenzte OSM-Kategoriesuche vor TomTom/HERE, 14 Kategorien, alle 19 Landesküchen, fail-closed Sachfilter und exakte OSM-Bildreferenzen. Safe Regression 231/231 und NFR-0 3/3 sind grün; Veröffentlichung und sichtbare Mobil-/Desktop-Abnahme folgen in diesem laufenden Abschnitt.

**Nächster Schritt (AKTIV): Kategorie-, Filter-, Foto- und Provider-Vollständigkeit schließen.** Die Owner-Parität ist öffentlich belegt. Jetzt muss dieselbe Verlässlichkeit über die gesamte Places- und Stays-Breite gelten, statt nur für den vegetarischen Restaurantpfad.

**Abnahme dieses Schritts:**

- Alle 14 sichtbaren Kategorien und 82 kanonischen Zuordnungen liefern auf Desktop und Mobile konsistente Ergebnisse; Zoomen, Ziehen und schneller Kategorienwechsel bleiben bedienbar.
- Jeder sichtbare Sachfilter und alle 19 Landesküchen werden gegen reale positive, negative, leere und teilweise Providerproben geprüft; UI-Label, aktive Kategorie und tatsächlich gefilterte Kohorte stimmen überein.
- Passend bleibt für jede Kategorie owner-basiert und fail-closed; widersprüchliche oder unbelegte Orte erscheinen nicht als passend.
- Detail-Sheets verwenden echte, dem exakten Place zuordenbare Bilder mit Herkunft; fehlende Bilder werden ehrlich und hochwertig behandelt, ohne irreführende Fremdort-Fotos.
- Provider-Kaskade, Cache, Deduplizierung, Timeouts und Quoten sind messbar; Google bleibt bei höchstens 1.000 Aufrufen pro Tag, begrenzte Anbieter werden erst nach Cache und kostenlosen Quellen beansprucht.
- Places und Stays bestehen dieselbe Karten-, Pin-, Such-, Filter-, Passend- und Mobilabnahme; Safe Regression, NFR-0, sichtbarer Browserbeleg und immutable Release-Identität sind grün.

**Danach:** Nach P02/P03-Vollständigkeit folgt P09/P10: gemeinsame Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert und über diese Blöcke sequenziert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

M0–M16 sind dokumentiert geschlossen. M16.5 bleibt aktiv: Schritte 01–14 geschlossen, Schritte 15–18 in Arbeit. B0 ist als Human↔AI-Steuerungsgrundlage auf .135 öffentlich geschlossen. Das ist kein Abschluss aller Bedienaktionen durch AI. B1 ist der aktive Produktblock. B2–B4 besitzen teils Grundlagen; die Gesamtblöcke sind nicht abgenommen. P40–P50 bleiben erhalten und folgen den jeweils erforderlichen späteren Roadmap-Gates.

## Historischer B1-Zwischenstand (.63 / v170)

Die Reservierungsprüfung zeigt ihren nächsten Schritt jetzt direkt unter dem auslösenden Button. Der zusätzliche Live-Read entdeckte einen falschen Zimmerlink für ROOF. Booking Resolver 2.8.0 (Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34) prüft nun auch die Art der Buchung und erhält gültige Reservierungsanker auf der offiziellen Ortsseite. ROOF führt zum Tischreservierungsbereich. Eine erreichbare Reservierungsseite bestätigt noch keine freien Zeiten; es wurde nichts versendet.

Integration läuft auf 13.82.168.63 / Core 4.82.185 mit Gateway v170. Die Places- und Stays-Karten suchen stabil im aktiven Reiseziel Scharbeutz; die sichtbare Kategoriefolge 50/21/12/21/50, Chinesisch mit zwei Treffern sowie die Alle/Passend-Wechsel sind belegt. Der Chat-Suchpfad erhält Zielort, Ausschnitt, Suchauftrag und Aktionsangebote. Leere Ergebnisse und Providerfehler werden getrennt und ehrlich erklärt.

Zusätzlich ist die Planprüfung wieder sichtbar: Reisetag, Uhrzeit und Dauer werden vor dem Speichern geprüft und können geändert werden. Veraltete Standardtage außerhalb der aktiven Reise werden verworfen. COAST-Favorit und Rücknahme sowie ein konkreter Testtermin mit unabhängigem Readback und anschließendem Reload sind begrenzt belegt. Die vollständige Golden Journey, P09/P10, Fotos, Partnerpfade und reale Hardware bleiben offen. Maßgeblich ist docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.
## Historischer Release-Nachweis (.52 / v163)

Integration: App **13.82.168.52**, Core **4.82.174**, Gateway **v163 ACTIVE**. Frontend-Quelle **6da646bdd774b764cad9e868445a1c921a65c783**, Worker **47496145-d13d-4a59-9e9c-b1785dd9f171**. Die bereits aktivierte HERE-Konfiguration bleibt erhalten. Safe Regression des aktuellen Runtime-Slice: **217/217 PASS**, öffentliche Byteidentität **30/30**. Leere Providerseiten werden nicht festgehalten; breite Kategorien behalten erfolgreiche Teilantworten und führen höchstens einen begrenzten transienten Neuversuch aus.

Main-HEAD **c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba** bleibt unverändert. Der dokumentierte Produktionsbuild ist .49; in diesem Dokumentlauf wurde kein neuer Production-HTTP-Beleg erhoben. Keine Produktionsfreigabe und kein übergreifender Design Freeze.

## Status richtig lesen

- BELEGT BEGRENZT: konkreter datierter öffentlicher Ablauf nachgewiesen; aktuelle Gesamtregression nicht dadurch automatisch abgenommen.
- TEILWEISE: produktive Teile vorhanden, benannte Abschlussnachweise fehlen.
- VORBEREITET: Architektur, Verträge oder Fixtures vorhanden; kein vollständiger Live-Produktnachweis.
- OFFEN: kein vollständiger Nachweis für das Arbeitspaket.
- EXTERN ABHÄNGIG: positive Umsetzung benötigt Partnerzugang; unabhängige Teile dürfen weitergehen.
- ERHALTUNGSGATE: bei jeder Lieferung erneut zu sichern, kein einmaliger Endzustand.
- SPÄTERES GATE: im Gesamtplan erhalten, Umsetzung erst nach abhängigen Owner-, Daten- und Infrastrukturentscheidungen.

Die Kennzeichnungen sind keine Prozentrechnung. Ein API-200 ist keine Produktabnahme; ein Fixture kein Anbieterbeleg; ein 390-px-Browser kein physischer Handytest.

## Die nächsten Arbeitsabschnitte

1. A1 Dokumentkonsolidierung — ABGESCHLOSSEN, laufende Pflege: ein Statusmodell, synchronisierte Fahrpläne/Handoffs und erhaltene historische Quellen.
2. A2 B1 Ende zu Ende — TEILWEISE BELEGT: reale Scharbeutz-Anfrage im AI-Chat → exakter Place → Pin → Details → Favorit → Tag/Zeit → Änderung → Rücknahme → Reload. Places und Stays teilen die räumliche Technik. Bilder, Vorlieben und Gruppenlücken werden ausdrücklich ausgewiesen.
3. A3 P09 — AKTIV: zunächst geplante Place-Einträge entfernen und nach Reload wiederherstellen. Danach Connect, Mehrfach-Reorder und weitere Eintragsarten; jeweils mit Version, Bestätigung und Beleg über journey.v1.
4. A4 P10 — TEILWEISE, BEGLEITEND: lesbare Begründung der Vorschläge und Änderungen. Quellen, Unsicherheit und Konflikte erklären; technische Diagnose nur auf Wunsch.
5. A5 — OFFEN, BEGLEITEND: echte Ortsfotos und positive Buchungspartnerpfade. Weder neue API-Schlüssel noch Affiliate-Zugang ersetzen Livepreise oder Reservierungsbelege.
6. A6 — AUSSTEHEND: B1 Gate bewerten; B2 erst nach den anwendbaren Produkt- und Nutzergates breiter ausrollen. Spätere M18-Owner werden nicht vorgezogen, um offene B1-Funktionen zu kaschieren.

## P01 bis P50

| Paket | Block | Stand | Ergebnis |
|---|---|---|---|
| P01 | B1 | ERHALTUNGSGATE | Integration und Rückfallstand |
| P02 | B1 | TEILWEISE | Anbieter und Datenqualität |
| P03 | B1 | TEILWEISE | Ortsentdeckung im AI Chat |
| P04 | B1 | BELEGT BEGRENZT | Favorisieren und zurücknehmen |
| P05 | B1 | BELEGT BEGRENZT | Planen und ausplanen |
| P06 | B1 | TEILWEISE | Buchungsbedarf und Weiterleitung |
| P07 | B1 | EXTERN ABHAENGIG | Buchung ausführen |
| P08 | B1 | EXTERN ABHAENGIG | Buchung ändern und stornieren |
| P09 | B1 | TEILWEISE | Timeline gezielt bearbeiten |
| P10 | B1 | TEILWEISE | Planung verständlich erklären |
| P11 | B2 | VORBEREITET | Unsicherheit von Wegen |
| P12 | B2 | VORBEREITET | Einen Tag vorab durchspielen |
| P13 | B2 | VORBEREITET | Bei Störungen umplanen |
| P14 | B2 | VORBEREITET | Standort bewusst freigeben |
| P15 | B2 | TEILWEISE | Vorlieben richtig speichern |
| P16 | B2 | VORBEREITET | Aus bewusstem Feedback lernen |
| P17 | B2 | TEILWEISE | Reise vollständig verwalten |
| P18 | B2 | VORBEREITET | Erinnerungen und Geschichten |
| P19 | B2 | VORBEREITET | Abgeleitetes Reisezielmodell |
| P20 | B2 | OFFEN | Verifizierte Veranstaltungsquellen |
| P21 | B3 | VORBEREITET | Veranstaltungen verlässlich normalisieren |
| P22 | B3 | VORBEREITET | Veranstaltungskalender |
| P23 | B3 | VORBEREITET | Zeit und Karte gemeinsam filtern |
| P24 | B3 | OFFEN | Vom Event zur Erinnerung |
| P25 | B3 | OFFEN | Kultureller Kontext |
| P26 | B3 | OFFEN | Freie Zeit sinnvoll entdecken |
| P27 | B3 | VORBEREITET | Gemeinsame und unterschiedliche Wünsche |
| P28 | B3 | VORBEREITET | Alternativen bei schlechtem Wetter |
| P29 | B3 | VORBEREITET | Änderungen bei Ort und Veranstaltung |
| P30 | B3 | VORBEREITET | Tagesplan mit Quellen abgleichen |
| P31 | B4 | VORBEREITET | Veranstaltungen räumlich und zeitlich verbinden |
| P32 | B4 | OFFEN | Veranstaltungsprodukt öffentlich abnehmen |
| P33 | B4 | OFFEN | Veranstaltungen vollständig im Chat |
| P34 | B4 | TEILWEISE | Mehrere Wünsche und Sprachen |
| P35 | B4 | TEILWEISE | Alle Bedienaktionen auch über AI |
| P36 | B4 | TEILWEISE | Unsichere Aktionen zuverlässig verhindern |
| P37 | B4 | OFFEN | Vollständige Bedienmatrix |
| P38 | B4 | OFFEN | Offline Konflikte verbindlich entscheiden |
| P39 | B4 | ERHALTUNGSGATE | Jeden Slice reproduzierbar veröffentlichen |
| P40 | B4 | SPAETERES GATE | Alternative Urlaubsverläufe vergleichen |
| P41 | B5 | SPAETERES GATE | Eigene Reiseregeln verbindlich machen |
| P42 | B5 | SPAETERES GATE | Jede wesentliche Aussage belegen |
| P43 | B5 | SPAETERES GATE | Mobilität und Energie berücksichtigen |
| P44 | B5 | SPAETERES GATE | Private Gruppenwünsche fair abstimmen |
| P45 | B5 | SPAETERES GATE | Reiseassistenz ohne Netz |
| P46 | B5 | SPAETERES GATE | Kamera und Audio in nächste Schritte übersetzen |
| P47 | B5 | SPAETERES GATE | Aktuelle Lage am Reiseziel verstehen |
| P48 | B5 | SPAETERES GATE | Auswirkungen von Reisevarianten vergleichen |
| P49 | B5 | SPAETERES GATE | Große Reiseunterbrechungen bewältigen |
| P50 | B5 | SPAETERES GATE | Reisenachweise und Anspruchsunterlagen |

## Ausführbarer Paketkatalog

### P01 Integration und Rückfallstand

**Stand:** ERHALTUNGSGATE. **Zuständig:** Platform und Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

Der letzte vollständig öffentlich belegte Stand ist App 13.82.168.95 / Core 4.82.214 auf Integration-Worker fd162519-c4de-487c-9800-2672b3bed937 aus Runtime-Commit 4230167d. 30/30 Release-Dateien stimmen auf Stable und immutable Worker mit dem Archiv luvia-integration-13.82.168.95-4230167d.zip (SHA-256 4C32CCFAEA10DBAE3C135BDA46F636AA1743408819CA0D325DE21DBAC42BA0BB) überein; Gateway v223 meldet 4.64.29. Kandidat .96 / Core 4.82.216 ist lokal gebaut und wartet auf den neuen öffentlichen Beleg. Main und Production bleiben unverändert.

**Nächster Abschlussnachweis:** Beim nächsten kohärenten Integration-Slice erneut sauberen Commit, immutable Release-Identität, Safe Regression, NFR-0, öffentliches Verhalten und Rückfallarchiv gemeinsam belegen.

**Erhaltener technischer Umfang:** Retain the current immutable release, source hashes, rollback compatibility and historical counterevidence. The old .126 lock is historical, not a current deployment target.

### P02 Anbieter und Datenqualität

**Stand:** TEILWEISE. **Zuständig:** Places und Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Der öffentliche Stand .95 hält vegetarische Passung fail-closed und schließt das Steakhouse aus. Kandidat .96 ergänzt vor den budgetierten TomTom-/HERE-Fallbacks eine authentifizierte, sechs Stunden gecachte OSM-Kontinuitätsebene für alle 14 Luvia-Kategorien. Der Worker akzeptiert keine freie Overpass-Abfrage, sondern nur eine Whitelist, maximal 15 km und 250 Zeilen. Alle 19 Landesküchen sind normalisiert; Sachfilter lassen fehlende Öffnungs-, Bewertungs-, Preis-, Reservierungs- oder Barrierefreiheitsfakten nicht passieren. Exakt verknüpfte OSM-/Wikimedia-Bilder behalten Identität und Herkunft. Öffentliche Deployment-, Browser- und Byteabnahme ist noch offen; Apple bleibt geparkt.

**Nächster Abschlussnachweis:** Alle 14 Kategorien, 82 Zuordnungen, sämtliche sichtbaren Sachfilter und 19 Landesküchen gegen reale Providerproben abnehmen; echte Place-Fotos samt Herkunft und das Providerbudget einschließlich des Google-Limits von 1.000 Aufrufen pro Tag belegen; dieselben Regeln auf Places und Stays prüfen.

**Erhaltener technischer Umfang:** Prove active provider readiness, bounded free-budget fallback, health, quota, timeout and offline semantics, freshness, result diversity, category-by-category completeness, exact spatial intent and real provider-linked photos. Geoapify, TomTom and HERE form the approved automatic search path. Google and Foursquare require explicit verified budget policies before cost-bearing calls. The same canonical candidate cohort feeds Places, Stays, Timeline suggestions, Trip Composer and AI Chat.

### P03 Ortsentdeckung im AI Chat

**Stand:** TEILWEISE. **Zuständig:** Intelligence und Places. **Einordnung:** M16.5 Schritte 15 bis 18.

Die öffentliche .95-Owner-Parität zwischen Places, Timeline und AI bleibt belegt. Kandidat .96 erweitert denselben places.v1-Kandidatenpfad um eine budgetschonende OSM-Kategorie- und Landesküchenkontinuität, ohne eine zweite Kartenlogik oder neue Consumer-Suche zu eröffnen. Fehlende Providerfakten bleiben unbekannt und können deshalb weder Passend noch strikte Sachfilter fälschlich erfüllen. Die öffentliche End-to-End-Abnahme dieses erweiterten Kandidaten steht noch aus.

**Nächster Abschlussnachweis:** Die nachgewiesene Owner-Parität auf alle 14 Kategorien, 82 Zuordnungen, sämtliche sichtbaren Filter und 19 Landesküchen erweitern; leere, teilweise und widersprüchliche Providerantworten sowie echte Ortsbilder prüfen und Places/Stays gleich abnehmen.

**Erhaltener technischer Umfang:** Accept multilingual requests, confirmed-profile fallback, missing/conflicting input questions, source-backed partial or complete suggestions per category, the shared places.v1 Compass-coloured MapLibre projection and bottom-up Place detail sheets. UI and Chat consume one Place candidate cohort rather than separate searches.

### P04 Favorisieren und zurücknehmen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Places. **Einordnung:** M16.5 Schritte 15 bis 18.

COAST im sichtbaren Chat favorisiert, über places.v1 unabhängig gelesen, nach erneuter Vorschau zurückgenommen und nach Reload ursprünglichen Favoritenstand verifiziert. Begrenzter aktueller Positivbeleg; kein vollständiger Mehrnutzer-/Offline-Abschluss.

**Nächster Abschlussnachweis:** Favorit über positive Reload-Phase, zweiten Nutzer und Offline/Reconcile abnehmen.

**Erhaltener technischer Umfang:** Close Preview, explicit confirmation, `places.v1` command, Receipt, recovery, persistence and separately confirmed Undo.

### P05 Planen und ausplanen

**Stand:** BELEGT BEGRENZT. **Zuständig:** Places und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Planprüfung und Zeitänderung bleiben erhalten. Seit .47 lassen sich geplante Places erst nach lesbarer Vorschau entfernen und über einen im Places-Owner-Datensatz gespeicherten Recovery-Beleg auch nach Reload wiederherstellen. Datum, Uhrzeit und Dauer werden erneut geprüft; Favorit, Ortsdetails und Booking-Zustand bleiben getrennt. Grande Beach Café wurde sichtbar entfernt, neu geladen, wiederhergestellt und nochmals neu geladen.

**Nächster Abschlussnachweis:** Weitere Unterkunfts-/Kategoriepfade und vollständige Konfliktfälle einschließlich echter Mehrnutzeränderungen abnehmen; dabei dieselben Owner-, Vorschau-, Reload- und Booking-Gates anwenden.

**Erhaltener technischer Umfang:** Close trip/day/time selection, conflict preview, `places.v1` command, Timeline projection, Receipt, recovery and Undo.

### P06 Buchungsbedarf und Weiterleitung

**Stand:** TEILWEISE. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

ROOF: Reservierungsprüfung reagiert direkt am auslösenden Button. Der Booking-Resolver verwirft Hotelzimmerwege für Tischreservierungen und findet den belegten Reservierungsbereich auf der offiziellen Restaurantseite. Live read-only geprüft; E-Mail-/manueller Fallback und Retry automatisiert geprüft. Keine Anfrage versendet; vollständige positive Partner- und Buchungslifecycle-Abnahme offen.

**Nächster Abschlussnachweis:** Restaurant, Aktivität und Unterkunft getrennt prüfen; weitergeleitet niemals als gebucht anzeigen.

**Erhaltener technischer Umfang:** Classify the visit through the Booking Owner; show a compact admission/reservation notice in Places, AI Chat and Journey/Timeline suggestions; show owner/provider status, evidence, price and terms; open only a verified official/provider/email route and never infer requirement, availability or partner connectivity.

### P07 Buchung ausführen

**Stand:** EXTERN ABHAENGIG. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Kein aktuell belegter vollständiger positiver Live-Buchungsabschluss.

**Nächster Abschlussnachweis:** Erst aktivierten Partner, echte Konditionen und Owner-Beleg testen; keine kostenpflichtige Testbuchung automatisch abschließen.

**Erhaltener technischer Umfang:** Execute only supported provider-backed creation with idempotency, refreshed terms, explicit confirmation and provider/owner receipts.

### P08 Buchung ändern und stornieren

**Stand:** EXTERN ABHAENGIG. **Zuständig:** Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Lifecycle und Fehlerbehandlung teilweise vorhanden; positive Anbieterabnahme offen.

**Nächster Abschlussnachweis:** Gebühren, unbekannten Ausgang, Wiederholung und unterstützte Kompensation mit Testangeboten prüfen.

**Erhaltener technischer Umfang:** Expose consequences and fees before confirmation; reconcile unknown provider outcomes and compensate only where supported.

### P09 Timeline gezielt bearbeiten

**Stand:** TEILWEISE. **Zuständig:** Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

App .44–.66 liefert Langdruck, Zeit-/Daueränderung, Entfernen/Wiederherstellen, Mehrfach-Reorder, Owner-Fähigkeitsmatrix, gemeinsame Places-Karte in freien Timeline-Fenstern und Chat-Routenparität. App .86 schließt zusätzlich den bestätigten Visit-Owner-Weg: Nur bestätigte visited/left-Besuche erscheinen; ein historisches place_visited-Event wird nicht doppelt projiziert. Besuchszeit und Dauer werden mit Vorher/Neu, Bestätigung, Operation-ID und Revision korrigiert. Entfernen setzt den Owner-Datensatz auf removed; Wiederherstellen nutzt den dauerhaften Recovery-Beleg und den aktuellen Owner-Stand. Place, Favorit, Buchung, Fotos und Memories bleiben erhalten. Der sichtbare 477×900-Chromium-Test, öffentlicher Timeline-Reload mit zwei realen Place-Momenten, 227/227 Regression und die verifizierte Supabase-Constraint belegen den Slice.

**Nächster Abschlussnachweis:** Eine echte Providerbuchung über den Booking Owner auf Integration positiv prüfen und, soweit der Providerzustand es erlaubt, ändern oder stornieren; anschließend Visit-Korrektur, Entfernen und Wiederherstellen im AI Chat spiegeln. Die physische iOS-/Android-Langdruckabnahme bleibt ein separates Gerätegate.

**Erhaltener technischer Umfang:** Project the shared Places map into day and free-window suggestions, then add, edit, move, reorder, connect, delete and restore Journey moments through `journey.v1`, preserving all owner truth. Long press enters a visible iOS-like movement mode while Reduced Motion remains still.

### P10 Planung verständlich erklären

**Stand:** TEILWEISE. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Zeitänderung, Entfernen/Wiederherstellen sowie Verbinden/Mehrfach-Reorder erklären bisherigen und beabsichtigten Zustand, Reihenfolge, Datum, Uhrzeit, Dauer, Konflikte, Wegefolge und Speicherstatus. App .86 erweitert dieselbe Sprache auf bestätigte Besuche: Vorher/Neu-Vorschau, lesbarer Nachweis, aktuelle Owner-Revision, Bestätigung, Ergebnis und dauerhafter Recovery-Beleg. Die öffentliche Projektion lässt interne Teilnehmer-IDs, freie Korrekturfelder und Gerätepositionen aus. Konflikte und veraltete Revisionen schreiben keinen lokalen Scheinzustand.

**Nächster Abschlussnachweis:** Den positiven Booking-Provider-Weg in derselben verständlichen Vorher/Neu-, Ergebnis-, Fehler- und Recovery-Sprache schließen und die gelieferten Visit-Kommandos danach über den AI Chat verfügbar machen.

**Erhaltener technischer Umfang:** Explain intent split, owner decisions, sources, freshness, assumptions, conflicts, rejected alternatives, proposed commands and resulting receipts without exposing private reasoning or sensitive raw input.

### P11 Unsicherheit von Wegen

**Stand:** VORBEREITET. **Zuständig:** Journey und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Reale Geh- und Fahrradrouten sind geliefert; Unsicherheitsprodukt ist damit nicht abgeschlossen.

**Nächster Abschlussnachweis:** Bandbreite und Quellenalter sichtbar; Puffer nur nach bestätigtem Journey-Befehl.

**Erhaltener technischer Umfang:** Real uncertainty bands, source age, missing live evidence and a separately confirmed Journey buffer command.

### P12 Einen Tag vorab durchspielen

**Stand:** VORBEREITET. **Zuständig:** Intelligence und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Tagesprojektionen und Kartenidee vorhanden; vollständige Tagesprobe offen.

**Nächster Abschlussnachweis:** Besten, erwarteten und ungünstigen Ablauf anhand belegter Grenzen vergleichen; die KI-Reisepräsentation tageweise mit Karte, Begründung, Alternativen und bestätigter Übernahme prüfen.

**Erhaltener technischer Umfang:** Simulate feasible best/expected/worst days and present a source-backed day-by-day Trip draft with maps, choices and alternatives; apply selected revisions only through confirmed owner commands.

### P13 Bei Störungen umplanen

**Stand:** VORBEREITET. **Zuständig:** Intelligence und betroffene Owner. **Einordnung:** M16.5 Schritte 15 bis 18.

Recovery-Grundlagen vorhanden; durchgängiger Live-Ausfallfall offen.

**Nächster Abschlussnachweis:** Sichtbare Änderungsvorschläge und getrennte Owner-Belege ohne stille Reparatur.

**Erhaltener technischer Umfang:** Generate evidence-backed recovery proposals and correlated per-owner receipts without silent repair.

### P14 Standort bewusst freigeben

**Stand:** VORBEREITET. **Zuständig:** Platform Location und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Deny-Pfad geprüft; echte Hardware- und Widerrufsmatrix offen.

**Nächster Abschlussnachweis:** Präzise, grob, manuell, verweigert, widerrufen und offline auf Geräten prüfen.

**Erhaltener technischer Umfang:** Prove precise/coarse/manual/denied/ revoked/expired location, purpose limitation, no implicit persistence and offline fallback.

### P15 Vorlieben richtig speichern

**Stand:** TEILWEISE. **Zuständig:** Identity und Trip. **Einordnung:** M16.5 Schritte 15 bis 18.

Profil und Reise sind getrennt; aktuelle Kartenpassung nutzt belegte Merkmale.

**Nächster Abschlussnachweis:** Anfrage, Reise und dauerhafte Vorliebe einschließlich Korrektur und Löschung über Places, Chat und alle drei Trip-Composer-Einstiege abnehmen.

**Erhaltener technischer Umfang:** Distinguish request-only, Trip-scoped and durable preferences across discovery and Trip creation; protect sensitive traits and confirm every durable write.

### P16 Aus bewusstem Feedback lernen

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Feedback-Konzept und Teilgrundlagen; vollständiger produktiver Lebenszyklus offen.

**Nächster Abschlussnachweis:** Explizites Ergebnis, Grund, Zweck, Ablauf, Korrektur und Vergessen prüfen.

**Erhaltener technischer Umfang:** Learn only from an explicit outcome and reason, with scope, expiry, correction and deletion.

### P17 Reise vollständig verwalten

**Stand:** TEILWEISE. **Zuständig:** Trip. **Einordnung:** M16.5 Schritte 15 bis 18.

Erstellung und aktive Auswahl vorhanden; Reload-Reparatur belegt.

**Nächster Abschlussnachweis:** Account-ohne-Reise-Zustand und einen gemeinsamen Trip Composer mit Geführt, Schnellstart und KI-Entwurf sowie Vormerken, Einplanen, Abhängigkeitsvorschau und Rücknahme schließen.

**Erhaltener technischer Umfang:** Read, create, update, switch, archive, delete and restore with dependency previews and Trip receipts. One Trip Composer serves guided, quick-start and AI-assisted draft entry modes without duplicating Trip truth.

### P18 Erinnerungen und Geschichten

**Stand:** VORBEREITET. **Zuständig:** Memory und Media. **Einordnung:** M16.5 Schritte 15 bis 18.

Getrennte Owner vorhanden; komplette neue Produktabnahme offen.

**Nächster Abschlussnachweis:** Erstellen bis Wiederherstellen mit Quellen und unveränderter Media-Zuständigkeit.

**Erhaltener technischer Umfang:** Create, edit, connect, share, archive, remove and restore source-labelled memories without copying Media truth.

### P19 Abgeleitetes Reisezielmodell

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Twin-Projektionen vorhanden; vollständiger belegter Lebenszyklus offen.

**Nächster Abschlussnachweis:** Ablauf, Provenienz und Invalidierung ohne zweite Ortswahrheit beweisen; Wetter, Saison, Feiertage, Events, Öffnung, Wege und Budget als getrennte datierte Belege projizieren.

**Erhaltener technischer Umfang:** Build an expiring, derived and fully provenance-labelled context matrix for destination, weather, season, special dates, events, opening, mobility and budget without becoming destination truth.

### P20 Verifizierte Veranstaltungsquellen

**Stand:** OFFEN. **Zuständig:** Places Event Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Quellen- und Lizenzfreigabe bleibt ein eigenes Gate.

**Nächster Abschlussnachweis:** Quellen, Attribution, Bilderrechte, Aktualität und erlaubtes Caching vor Ingestion festlegen.

**Erhaltener technischer Umfang:** Define accepted providers, licences, attribution, cache/freshness, image rights and any separately authorized infrastructure boundary before live event ingestion.

### P21 Veranstaltungen verlässlich normalisieren

**Stand:** VORBEREITET. **Zuständig:** Places und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Fixtures und fehlende-Quelle-Pfade vorhanden; positive Quelle offen.

**Nächster Abschlussnachweis:** Keine synthetischen Events; Feldquellen, Konflikte, Dubletten und Geometrie prüfen.

**Erhaltener technischer Umfang:** Normalize provider-native claims, field provenance, freshness, deduplication, conflicts and verified geometry with zero synthetic events.

### P22 Veranstaltungskalender

**Stand:** VORBEREITET. **Zuständig:** Journey und Experience. **Einordnung:** M16.5 Schritte 15 bis 18.

Kalender-/Eventgrundlagen vorhanden; kompletter öffentlicher Ablauf offen.

**Nächster Abschlussnachweis:** Tag, Woche und Reisezeitraum mit Karte, Details und Timeline testen.

**Erhaltener technischer Umfang:** Deliver day, week, Trip range, filters, Timeline, Compass-coloured MapLibre and bottom-up details.

### P23 Zeit und Karte gemeinsam filtern

**Stand:** VORBEREITET. **Zuständig:** Experience und Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Time-Brush-Teile lokal geprüft.

**Nächster Abschlussnachweis:** Zeitfenster, Kartenausschnitt und Liste per Maus, Touch und Tastatur synchron abnehmen.

**Erhaltener technischer Umfang:** Synchronize time range, map extent, pins, list, pointer, touch, keyboard and Reduced Motion.

### P24 Vom Event zur Erinnerung

**Stand:** OFFEN. **Zuständig:** Memory. **Einordnung:** M16.5 Schritte 15 bis 18.

Durchgängige echte Veranstaltungskette nicht belegt.

**Nächster Abschlussnachweis:** Besuch und Medien bewusst auswählen; Memory-Befehl mit bestätigtem Ergebnis.

**Erhaltener technischer Umfang:** Connect a verified event and explicitly selected visit/media evidence to a confirmed Memory command.

### P25 Kultureller Kontext

**Stand:** OFFEN. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Quellengebundener Produktumfang erhalten.

**Nächster Abschlussnachweis:** Attributierbare Informationen und ehrliches Fehlen von Wissen zeigen.

**Erhaltener technischer Umfang:** Provide attributable, source/version-bound context; unavailable evidence remains unavailable rather than generated.

### P26 Freie Zeit sinnvoll entdecken

**Stand:** OFFEN. **Zuständig:** Journey und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

90-Minuten-Kartenfunktion ist Grundlage, kein vollständiges Eventprodukt.

**Nächster Abschlussnachweis:** Nur verifizierte, saisonal und zeitlich passende Events oder Places anbieten; freie Zeit auch bewusst frei lassen und dieselbe Places-Karte verwenden.

**Erhaltener technischer Umfang:** Rank optional verified events and Places inside an open Journey window through the shared map, with weather, season, budget and an honest “keep free” outcome.

### P27 Gemeinsame und unterschiedliche Wünsche

**Stand:** VORBEREITET. **Zuständig:** Collaboration und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Für-uns-Lesemodell vorhanden; Mitreisenden-Owner-Ausbau ausstehend.

**Nächster Abschlussnachweis:** Einwilligung, Minderheiten und fehlende Profile ohne erfundene Gruppenfreigabe prüfen.

**Erhaltener technischer Umfang:** Explain consented common ground and minority impact while Collaboration writes remain owner-gated.

### P28 Alternativen bei schlechtem Wetter

**Stand:** VORBEREITET. **Zuständig:** Intelligence Booking Journey. **Einordnung:** M16.5 Schritte 15 bis 18.

Vorschlagsgrundlagen vorhanden; echter Event- und Wetterablauf offen.

**Nächster Abschlussnachweis:** Vorhersage von Absage unterscheiden; Buchung und Tagesplan separat bestätigen.

**Erhaltener technischer Umfang:** Distinguish forecast risk from official cancellation and require separate Booking/Journey confirmations.

### P29 Änderungen bei Ort und Veranstaltung

**Stand:** VORBEREITET. **Zuständig:** Places Event Gateway. **Einordnung:** M16.5 Schritte 15 bis 18.

Drift-Konzept und Fixtures vorhanden.

**Nächster Abschlussnachweis:** Belegte Orts-, Zeit- und Statusänderung von Quellenausfall unterscheiden.

**Erhaltener technischer Umfang:** Detect source-backed time, status, venue and coordinate changes; outage is unknown, not cancellation.

### P30 Tagesplan mit Quellen abgleichen

**Stand:** VORBEREITET. **Zuständig:** Journey und Booking. **Einordnung:** M16.5 Schritte 15 bis 18.

Reconciliation-Grundlagen vorhanden.

**Nächster Abschlussnachweis:** Sichtbare Differenz und getrennte bestätigte Befehle mit Versionskontrolle.

**Erhaltener technischer Umfang:** Reconcile verified schedules with Journey and Booking through visible diffs and separately confirmed commands.

### P31 Veranstaltungen räumlich und zeitlich verbinden

**Stand:** VORBEREITET. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Abgeleitete Graph-Grundlagen; vollständige Live-Evidenz offen.

**Nächster Abschlussnachweis:** Nur referenzierte Owner-Fakten; Ablauf und Invalidierung sämtlicher Kanten.

**Erhaltener technischer Umfang:** Derive expiring event/place/time/journey/ route/booking/weather/memory edges from owner/source evidence only.

### P32 Veranstaltungsprodukt öffentlich abnehmen

**Stand:** OFFEN. **Zuständig:** Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

Positive aktuelle S16.09 bis S16.12 Gesamtmatrix fehlt.

**Nächster Abschlussnachweis:** Live-Quellen, Bilder, Karte, Wetter, Drift und offline zusammen belegen.

**Erhaltener technischer Umfang:** Prove live sources, images, map, brushing, drift, weather recovery and offline/freshness states.

### P33 Veranstaltungen vollständig im Chat

**Stand:** OFFEN. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Einzelne Grundpfade; produktive Gesamtabdeckung offen.

**Nächster Abschlussnachweis:** Suchen, erklären, planen, buchen, vorschlagen und erinnern über richtige Owner.

**Erhaltener technischer Umfang:** Search, refine, explain, open, plan, book, propose to a group and save to Memory through the existing chat.

### P34 Mehrere Wünsche und Sprachen

**Stand:** TEILWEISE. **Zuständig:** Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

Semantische Routing-Grundlagen vorhanden; alle Owner nicht erschlossen.

**Nächster Abschlussnachweis:** Gemischte Sprache, Umgangssprache, relative Zeiten, Budget, freie Reisebeschreibung und widersprüchliche Wünsche im KI-Trip-Entwurf testen.

**Erhaltener technischer Umfang:** Preserve mixed-language, colloquial, relative, budget-bound and conflicting wishes across every owner, including free-text Trip Composer input.

### P35 Alle Bedienaktionen auch über AI

**Stand:** TEILWEISE. **Zuständig:** Intelligence und Domain Owner. **Einordnung:** M16.5 Schritte 15 bis 18.

330 Inventarzeilen; nur 7 als PUBLIC_E2E_PASS klassifiziert.

**Nächster Abschlussnachweis:** Inventarisierte Aktionen, einschließlich Timeline-Karte, Vormerken, Trip-Entwurf und Reiseplan-Übernahme, durch den AI-Chat vollständig prüfen oder explizit sperren; Registry-Zeilen allein sind kein Ausführungsnachweis.

**Erhaltener technischer Umfang:** Every supported user action has an owner command and the complete mutation protocol or an explicit block, including Place selection, Trip drafts, bookmarks and confirmed plan application.

### P36 Unsichere Aktionen zuverlässig verhindern

**Stand:** TEILWEISE. **Zuständig:** Domain Owner und Intelligence. **Einordnung:** M16.5 Schritte 15 bis 18.

B0-Sicherheitskontrollen belegt; laufendes Gate für jeden Ausbau.

**Nächster Abschlussnachweis:** Fremde Daten, veraltete Vorschau, Doppelklick, Teilausfall und verweigerte Rechte testen.

**Erhaltener technischer Umfang:** Cover foreign data, stale preview, duplicate execution, partial failure, offline and privacy denial.

### P37 Vollständige Bedienmatrix

**Stand:** OFFEN. **Zuständig:** Integration und Platform. **Einordnung:** M16.5 Schritte 15 bis 18.

Aktuelle Browser-Teilabnahmen vorhanden; physische Gesamtmatrix offen.

**Nächster Abschlussnachweis:** Desktop, iOS, Android, Tastatur, Offline, GPS, Gruppe und Reduced Motion schließen.

**Erhaltener technischer Umfang:** Real desktop/mobile/touch/keyboard/reload/back/ Reduced-Motion/cold-warm/offline-reconnect/GPS/group/provider evidence.

### P38 Offline Konflikte verbindlich entscheiden

**Stand:** OFFEN. **Zuständig:** Journey Collaboration Platform. **Einordnung:** M16.5 Schritte 15 bis 18.

Keine vollständige CRDT-Produktautorisierung aus einem Plan ableiten.

**Nächster Abschlussnachweis:** ADR mit Owner, Schema, Rechten und Konfliktstrategie vor Umsetzung.

**Erhaltener technischer Umfang:** Separately authorize the Journey/ Collaboration owner, schema, rights, conflict and reconciliation design.

### P39 Jeden Slice reproduzierbar veröffentlichen

**Stand:** ERHALTUNGSGATE. **Zuständig:** Integration. **Einordnung:** M16.5 Schritte 15 bis 18.

13.82.168.63 / Core 4.82.185: Frontend-Quelle fac7b348, unveränderliches Archiv release59-fac7b348.zip, SHA-256 DDEB817E23C3CA8DFDB832F75D29FD93C60B9AFA370F7E570A67F99AA145FE1F, Gateway v172 ACTIVE aus Quelle 7c288d89, Worker 563afd24, 220/220 Safe Regression und 30/30 öffentliche Asset-Hashes. Sichtbare Abnahme: Kategorie-Kontinuität 50/21/11/21/50, Food Passend 0 ohne Steakhouse-Falschpositiv und Stays 49/27/49. Main unverändert; exakter Rückfall auf .57 / Gateway v169 vorhanden.

**Nächster Abschlussnachweis:** Jeder neue Runtime-Slice erhält Tests, sichtbare Desktop-/Mobile-Abnahme, neue immutable Version, 30/30 öffentliche Byte-Gleichheit und einen passenden Frontend- und Gateway-Rückfall.

**Erhaltener technischer Umfang:** Commit, App/Core/cache/SW, archive/hash, Stable/Immutable byte equality and exact rollback.

### P40 Alternative Urlaubsverläufe vergleichen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence und Journey. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten; kein abgeschlossenes Produkt.

**Nächster Abschlussnachweis:** Probabilistische Szenarien, Randbedingungen und erklärbare Auswahl nach späteren Daten- und Owner-Gates.

**Erhaltener technischer Umfang:** Simulate alternative future Trip branches using probabilistic graphs, Monte Carlo, constraints and Pareto fronts; selection creates owner previews and never an automatic mutation.

### P41 Eigene Reiseregeln verbindlich machen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence und Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten.

**Nächster Abschlussnachweis:** Versionierte harte und weiche Regeln mit verständlichem Konfliktnachweis.

**Erhaltener technischer Umfang:** Compile user-authored hard and soft rules into a versioned policy DSL and expose understandable policy proof/violation results before every plan and command.

### P42 Jede wesentliche Aussage belegen

**Stand:** SPAETERES GATE. **Zuständig:** Platform und Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Bestehende Evidenzgrundlagen ersetzen noch kein vollständiges Mesh.

**Nächster Abschlussnachweis:** Quellenalter, Hash, Widerspruch und abhängige Invalidierung über Owner hinweg prüfen.

**Erhaltener technischer Umfang:** Track every material claim with owner, source, observation/freshness, evidence class, hash, contradiction and downstream dependency invalidation.

### P43 Mobilität und Energie berücksichtigen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence Identity Journey. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Sensibler Zukunftsumfang; keine implizite Gesundheitserfassung.

**Nächster Abschlussnachweis:** Mit ausdrücklicher Einwilligung Wege, Hitze, Pausen und Belastung modellieren; keine Diagnose.

**Erhaltener technischer Umfang:** With explicit consent, simulate mobility, surfaces, steps, lifts, heat, sensory load, rests and fatigue; never diagnose or silently infer sensitive traits.

### P44 Private Gruppenwünsche fair abstimmen

**Stand:** SPAETERES GATE. **Zuständig:** Collaboration und Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt echten Membership-Owner und Datenschutzmodell.

**Nächster Abschlussnachweis:** Verständliche Fairness und private Aggregation ohne Offenlegung einzelner Einschränkungen.

**Erhaltener technischer Umfang:** Use secure aggregation and explainable fairness objectives such as minimax regret and Nash welfare without disclosing private member constraints.

### P45 Reiseassistenz ohne Netz

**Stand:** SPAETERES GATE. **Zuständig:** Platform Intelligence Domain Owner. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt M19 und native Infrastruktur.

**Nächster Abschlussnachweis:** Verschlüsselte, ablaufende Ortskapseln mit Quellen und kontrolliertem späterem Abgleich.

**Erhaltener technischer Umfang:** Provide encrypted Destination Capsules containing a local intent model, owner projections, map/routing data, translations, verified snapshots and conflict-aware reconciliation.

### P46 Kamera und Audio in nächste Schritte übersetzen

**Stand:** SPAETERES GATE. **Zuständig:** Platform Media Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt native Ports und Zustimmung.

**Nächster Abschlussnachweis:** Menü, Fahrplan oder Ticket als belegte Aussage mit Owner-Vorschau; keine direkte Mutation.

**Erhaltener technischer Umfang:** Convert consented camera/audio input such as a menu, poster, timetable, ticket or announcement into redacted, verified claims and owner previews—not direct truth or mutation.

### P47 Aktuelle Lage am Reiseziel verstehen

**Stand:** SPAETERES GATE. **Zuständig:** Places und Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt lizenzierte aktuelle Felddaten.

**Nächster Abschlussnachweis:** Gemessen, vorhergesagt und unbekannt bei Andrang, Wetter und Zugänglichkeit unterscheiden.

**Erhaltener technischer Umfang:** Project measured, predicted and unknown crowd, transit, weather, wind, heat, noise and accessibility states as a source-labelled spatio-temporal MapLibre field.

### P48 Auswirkungen von Reisevarianten vergleichen

**Stand:** SPAETERES GATE. **Zuständig:** Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Frontier-Umfang erhalten; kein erfundener universeller Nachhaltigkeitsscore.

**Nächster Abschlussnachweis:** Komfort, Kosten, Zugang, lokale Wirkung und Umwelt als nachvollziehbare Zielkonflikte zeigen.

**Erhaltener technischer Umfang:** Compare comfort, price, accessibility, local benefit, crowd displacement and environmental impact as an auditable Pareto space without a fabricated universal score.

### P49 Große Reiseunterbrechungen bewältigen

**Stand:** SPAETERES GATE. **Zuständig:** Booking Journey Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt echte Providerkommandos und Kompensationen.

**Nächster Abschlussnachweis:** Befristete Optionen, korrelierte Belege und bestätigte providerabhängige Wiederherstellung.

**Erhaltener technischer Umfang:** Coordinate major disruptions through provider-aware saga orchestration, expiring options, correlated receipts and lawful compensating commands after explicit confirmation.

### P50 Reisenachweise und Anspruchsunterlagen

**Stand:** SPAETERES GATE. **Zuständig:** Travel Wallet Booking Intelligence. **Einordnung:** Nach zugehörigem M18 M19 M21 Gate.

Benötigt sichere Dokumenten- und Buchungsgrundlagen.

**Nächster Abschlussnachweis:** Verschlüsselte Belegchronik; Nutzer prüft und versendet Anträge selbst.

**Erhaltener technischer Umfang:** Build an encrypted, hash-linked evidence chronology from Booking/provider/owner receipts and prepare source-backed claim packages that the user must review and submit.

## Nachweise und Grenzen

Maßgebliche Messberichte im Repository sind PROVIDER-BUDGET-ACCEPTANCE-20260904, MAP-MOBILE-SPEED-ACCEPTANCE-20260904, TRIP-MAP-EXPERIENCES-ACCEPTANCE-20260904, CUISINE-MAP-PINS-ACCEPTANCE-20260904 und STAYS-SHARED-ACCEPTANCE-20260904 unter docs/modularization. Die älteren P04/P05-Belege stehen im archivierten B1-Handout und Ausführungsplan.

Lokale Belege liegen unter C:/Users/fabia/Documents/ChatGPT/Luvia/outputs: regression37-release.log, public-byte-proof37.json, provider-cuisine-audit37.json, here-live-activation37.json, here-final-activation37.json sowie stays-bicycle37.png, stays-walk37.png und places-mobile-bicycle37.png. Die Livebilder zeigen Wege, nicht die vollständige Versorgung mit Ortsfotos.

Vollständige echte Place-Fotos, positive Hotelpreise/Buchbarkeit, vollständige AI-Mutationsabdeckung, physische iOS/Android-Abnahme, echte Mehrnutzerprüfung und die vollständige Golden Journey bleiben offen. Die neue verknüpfte Bildanreicherung ist fixturegeprüft; beim letzten Holstentor-Versuch wurde kein neuer Livefotobeleg gewonnen.

Die bestehende AI-Registry enthält 330 semantische Aktionen und 24 Runtime-Aktionen. Sie klassifiziert 7 Zeilen PUBLIC_E2E_PASS, 58 REGISTERED_PARTIAL, 1 PARTIAL, 229 MISSING, 14 NATIVE_CHAT, 10 NOT_REQUIRED und 11 NOT_APPLICABLE. 246 öffentliche Owner-Bindungen und 947 Datenmarker haben andere Nenner. Neue Kartenaktionen müssen gegen dieses ältere Inventar abgeglichen werden; die Zahlen beweisen keine vollständige aktuelle Abdeckung.
