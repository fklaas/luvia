# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.95**, Core **4.82.214**. M16.5 Schritte 15–18 aktiv. P02 Passend läuft öffentlich fail-closed; App .95 / Core 4.82.214 schließt vor der öffentlichen P03-Abnahme den gefundenen Places/Timeline-profileFit-Widerspruch. Apple bleibt geparkt.

**Zuletzt geliefert:** App .94 verarbeitet den exakten AI-Satz öffentlich und verwendet dafür die aktive Places-Kohorte ohne neue Provider-Reads. Der sichtbare Gegenbeleg einer Timeline-Karte mit identischer Place-ID, aber widersprüchlichem blocked-Zustand ist in App .95 behoben. 230/230 Safe Regression, 3/3 NFR-0, Release-, Architektur-, Plan- und Inventurgates sind grün.

**Nächster Schritt (AKTIV): App .95 veröffentlichen und die eine Passend-Entscheidung sichtbar über Places, Timeline und AI belegen.** Der öffentliche AI-Fallback funktioniert bereits. Vor Abschluss muss der jetzt behobene Timeline-Gegenbeleg auf dem immutable Integration-Worker sichtbar verschwinden.

**Abnahme dieses Schritts:**

- Places zeigt ausschließlich vom Places-Owner als matched projizierte Passend-Pins; ein Steakhouse oder eine blockierte Altzeile bleibt ausgeschlossen.
- Timeline übernimmt mindestens eine identische kanonische Place-/Provider-ID mit profileFit=matched und demselben lesbaren vegetarischen Grund.
- AI Chat verarbeitet den exakten Satz „Zeig mir passende vegetarische Restaurants in Scharbeutz.“ und verwendet dieselbe aktive Place-Kohorte.
- Timeline und AI weisen für die Wiederverwendung Provider-Read-Zähler 0 aus.
- Safe Regression 230/230, NFR-0 3/3, Stable/Immutable-Asset-Identität und Rückfallarchiv sind grün.

**Danach:** Nach dem öffentlichen P03-Paritätsbeleg wird die offene P02/P03-Vollständigkeit für alle 14 Kategorien, 82 Zuordnungen, 19 Landesküchen, Sachfilter, echte Ortsbilder und Providerquoten geschlossen.

**Weiter offen:** P02 bleibt teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P03 ist bis zum öffentlichen Chat-Beleg aktiv. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert.

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
