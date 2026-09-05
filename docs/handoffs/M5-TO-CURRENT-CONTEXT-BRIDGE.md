# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert. P02/P03 enthält jetzt zusätzlich die abgesicherte Apple-MapKit-Grundlage mit genau einem sichtbaren Kartenplatz; Apple bleibt bis Zugangsdaten und sichtbarer Parität deaktiviert. Google-Permission-Abgleich bleibt offen.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft unverändert auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2. Gateway v205 / 4.64.22 und Places 4.38.3-apple-renderer-contract sind ACTIVE. Apple-Ortssuche und Auto-/Fuß-/Fahrradrouten sind serverseitig vorbereitet, aber mit Remote-Policy enabled=false, Nullbudget, configured=false und automaticCascade=false gesperrt. Der Ein-Karten-Vertrag hält MapLibre als aktuellen Renderer und Apple MapKit als Zielrenderer im selben Kartenplatz fest. Der sichtbare Test belegte 1 MapLibre, 0 MapKit, 1 Canvas und 50 Pins vor/nach Zoom. 228/228 Safe Regression sind grün; Frontend, Main und Production blieben unverändert.

**Nächster Schritt (AKTIV): Apple-Zugang einrichten und MapKit JS als einzigen sichtbaren Integrationsrenderer abnehmen.** Serveradapter, Nullbudget-Policy und Ein-Karten-Vertrag sind bereit. Für einen echten Apple-Aufruf und den sichtbaren MapKit-JS-Prototyp fehlen Maps-Identifier, Team-ID, Key-ID und privater .p8-Schlüssel.

**Abnahme dieses Schritts:**

- Apple-Developer-Mitgliedschaft, Maps-Identifier und zugehöriger privater Maps-Schlüssel sind vorhanden.
- Team-ID, Key-ID und privater .p8-Schlüssel liegen ausschließlich als Supabase-Secrets vor; kein Secret erscheint in Client, Git, Logs oder Health.
- MapKit JS ersetzt MapLibre nur im bestehenden Kartenplatz; es existiert zu jedem Zeitpunkt höchstens ein sichtbarer Renderer.
- Places und Stay zeigen Suche, Kategorien, alle Filter, Alle/Passend, Pins, Detail-Sheet und Timeline-Aktionen mit demselben places.v1-Vertrag.
- Timeline-Vorschläge und AI Chat verwenden denselben Place-Bestand und dieselben belegten Passend-Gründe.
- Apple-Attribution sowie Anzeigerechte zusätzlicher Provider sind geprüft und dokumentiert.
- Desktop- und echter Mobiltest belegen MapKit-Interaktion sowie atomaren Rückfall auf MapLibre ohne verbliebene Apple-Daten.
- Safe Regression, öffentliche App-Identität und unveränderter Main-/Production-Stand sind erneut belegt.

**Danach:** Danach die offene Google-Key-Beschränkung für den positiven Ernährungsbeleg abschließen, anschließend der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; danach P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: Apple-Maps-Zugangsdaten, sichtbarer einzelner MapKit-Renderer, Provider-Lizenzmatrix und Rückfallabnahme; bestehende Google-Key-Beschränkung beziehungsweise Key-Projekt-/Billing-Zuordnung für positiven Ernährungsbeleg. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten. Operativ offen ist außerdem die Supabase-Organisationswarnung zum vorherigen Kontingent und einer möglichen Einschränkung ab 07.09.2026.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
