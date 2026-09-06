# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.103**, Core **4.82.222**. M16.5 Schritte 15–18 aktiv. App .103 / Core .222 ist der geprüfte nächste P02/P03-Kartenstart- und Medienprovenienzabschnitt; der öffentliche Vorgänger .102 bleibt bis zur abgeschlossenen Integration-Veröffentlichung der Rückfallstand. P02/P03 bleiben teilweise, bis der erste sichtbare Kartenaufbau, die breite exakte Fotoquote und die vollständige Desktop-/Touch-Filtermatrix geschlossen sind.

**Zuletzt geliefert:** Kandidat .103 startet MapLibre und die Verbindung zum aktiven OpenFreeMap-Kartenstil bereits im Dokumentkopf und gibt vorhandene exakte Pins unmittelbar frei, während externe Kartendaten im Hintergrund laden. Die gemeinsame Places-/Stays-Projektion trägt Provider, Lizenz, exakte Entitätsreferenz, verknüpfte Ortsquelle und Verifikationsstatus bis zur Karte und stellt eine lesbare Medienabdeckungsdiagnose bereit. Alle bisherigen .102-Kaltlatenz-, Commons-Medien-, Filter- und Passend-Grenzen bleiben erhalten.

**Nächster Schritt (AKTIV): Ersten Kartenaufbau unter drei Sekunden und exakte Ortsbildmatrix schließen.** Die Providerdaten erreichen warme Pfade jetzt deutlich unter einer Sekunde und den kalten Spezialpfad fast im Ziel. Der sichtbare Erstaufbau benötigt bis zu rund 5,8 Sekunden, und die reale Bildabdeckung ist noch nicht kategorieübergreifend gemessen.

**Abnahme dieses Schritts:**

- Beim ersten Öffnen von Places und Stays sind Karte und Pins auf Desktop und Touch spätestens nach 3,0 Sekunden bedienbar; es erscheint kein falscher Leerzustand und Kategorienwechsel, Reload, Ziehen und Zoomen bleiben stabil.
- Für alle 14 Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild gehört zur exakten Provider-Place-ID oder einer verifizierten offiziellen Ortsquelle und trägt Lizenz, Herkunft, Frische und Fallbackstatus.
- Fremde, nur räumlich nahe und generische Stockbilder bleiben ausgeschlossen. Bildlose Orte bleiben ehrlich gekennzeichnet, bis ein exakter Beleg verfügbar ist.
- Alle 82 Zuordnungen, 19 Landesküchen und sichtbaren Sachfilter bestehen auf Desktop und Touch positive, negative, leere und teilweise Providerfälle.
- Passend bleibt fail-closed und identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Anbieterbudgets bleiben beobachtbar und Safe Regression, NFR-0, sichtbare Browserabnahme und Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für sichtbaren Erstaufbau unter drei Sekunden, breite exakte Fotoabdeckung, vollständige reale Kategorie-/Sachfiltermatrix und positive Google-/Foursquare-Livepfade. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert und über diese Blöcke sequenziert.

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
