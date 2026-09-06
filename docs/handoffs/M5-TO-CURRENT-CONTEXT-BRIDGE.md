# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.104**, Core **4.82.223**. M16.5 Schritte 15–18 aktiv. App .104 / Core .223 ist der vollständig getestete P02/P03-Kandidat für die komplette Kategorie-/Landesküchenmatrix und exakt identitätsgebundene Ortsbilder; der öffentliche Rückfallstand bleibt .103 bis zur abgeschlossenen Integration-Veröffentlichung.

**Zuletzt geliefert:** Kandidat .104 prüft alle 14 gemeinsamen Kategoriepfade und alle 19 Landesküchen über öffentliche, kostenfreie Diagnoseverträge. Die 82 sichtbaren Filterzuordnungen und sämtliche belegpflichtigen Sachfilter bleiben fail-closed. Beim ausgewählten Ort ergänzt Google Places nach strenger Namens- und Koordinatenidentität bis zu drei echte Fotoreferenzen; Wikimedia und Foursquare bleiben exakte Fallbacks. Google-Suche und Place Photos erhalten getrennte, serverseitig atomare 800/Monat-Reserven, und keine Kartenbewegung verbraucht Bildkontingent.

**Nächster Schritt (AKTIV): Reale Ortsbild- und Touchmatrix öffentlich abnehmen.** Die vollständigen Kategorie-, Küchen- und Filterverträge sowie der neue identitätsgebundene Bildpfad sind lokal grün. Offen sind die veröffentlichte Provider-Matrix, sichtbare kompakte Touchabnahme und der physische iOS-/Android-Kaltstart.

**Abnahme dieses Schritts:**

- Gatewaymigration, Funktion und Runtime werden auf Integration veröffentlicht; alle 14 Kategorieproben und 19 Landesküchen liefern einen ehrlichen positiven, leeren oder providerbedingt fehlgeschlagenen Status mit Anbieter- und Bildabdeckung.
- Ein ausgewählter Place und ein ausgewählter Stay laden ein echtes, exakt zugeordnetes Bild mit Herkunft; bei fehlendem exaktem Treffer bleibt der Zustand ehrlich bildlos. Google, Wikimedia und Foursquare dürfen keine räumlich nahen Fremdbilder übernehmen.
- Alle 82 Zuordnungen und Sachfilter bestehen auf Desktop und kompaktem Touch-Viewport positive, negative, leere, kombinierte und teilweise Providerfälle; Kategorienwechsel, Passend, Ziehen und Zoomen bleiben bedienbar.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand.
- Passend bleibt fail-closed und identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Budgetstatus, Safe Regression, NFR-0, sichtbare Browserabnahme und Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 sind technisch für 14 Kategorien, 19 Landesküchen, 82 Filterzuordnungen und den exakten Google/Wikimedia/Foursquare-Bildpfad erweitert. Offen bleiben die öffentliche reale Bildquote und der physische Mobil-Kaltstart. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert.

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
