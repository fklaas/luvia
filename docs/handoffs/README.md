# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.103**, Core **4.82.222**. M16.5 Schritte 15–18 aktiv. App .103 / Core .222 ist der vollständig veröffentlichte und reproduzierbar belegte P02/P03-Kartenstart- und Medienprovenienzabschnitt. P02/P03 bleiben teilweise, bis breite exakte Fotoabdeckung, physischer Mobil-Kaltstart und die vollständige Desktop-/Touch-Filtermatrix geschlossen sind.

**Zuletzt geliefert:** App .103 gibt exakte bekannte Pins frei, während OpenFreeMap im Hintergrund lädt, und beginnt MapLibre sowie Kartenverbindung im Dokumentkopf. Im sichtbaren öffentlichen Browser stehen Places nach 1,731 Sekunden mit 48 Pins und Stays nach 1,615 Sekunden mit 47 Pins bereit. Food 48 Alle / 9 Passend ohne Steakhouse-Passung und Stays 47/25 sind belegt. Provider, Lizenz, Entitätsverknüpfung und Verifikation erreichen die gemeinsame Karte. 232/232 Regression, NFR-0 3/3 und 30/30 Byteidentität sind grün.

**Nächster Schritt (AKTIV): Exakte Ortsbildquote und reale Filter-/Touchmatrix schließen.** Der sichtbare Browser-Erstaufbau liegt jetzt klar unter drei Sekunden. Offen bleiben die kategorieübergreifende Quote wirklicher Ortsbilder, die vollständige reale Filtermatrix und die Bestätigung des Kaltstarts auf physischen Mobilgeräten.

**Abnahme dieses Schritts:**

- Für alle 14 Kategorien und Stays wird die reale Bildtrefferquote providerweise gemessen; jedes Bild gehört zur exakten Provider-Place-ID oder einer verifizierten offiziellen Ortsquelle und trägt Lizenz, Herkunft, Frische und Fallbackstatus.
- Fehlende Bilder lösen nur identitätsgebundene Provider- oder offizielle Ortsquellenreads aus; räumlich nahe Fremdbilder und generische Stockbilder bleiben ausgeschlossen.
- Alle 82 Zuordnungen, 19 Landesküchen und Sachfilter bestehen auf Desktop und Touch positive, negative, leere, kombinierte und teilweise Providerfälle.
- Places und Stays erreichen auf physischen iOS-/Android-Geräten beim Kaltstart innerhalb von höchstens drei Sekunden eine bedienbare Karte mit ehrlichem Zwischenzustand; Wechsel, Ziehen und Zoomen bleiben stabil.
- Passend bleibt fail-closed und identisch in Places, Stays, Timeline-Vorschlägen und AI Chat; Anbieterbudgets bleiben beobachtbar und Safe Regression, NFR-0, sichtbare Browserabnahme und Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für breite exakte Fotoabdeckung, vollständige reale Kategorie-/Sachfiltermatrix, physischen Mobil-Kaltstart und positive Google-/Foursquare-Livepfade. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich im Produktentscheid PD-2026-09-05 inventarisiert und über diese Blöcke sequenziert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../../HANDOFF-CODEX-CURRENT.md)
- [Ergänzender Nachweis und Status](../../HANDOFF-NORMAL-CHATGPT-CURRENT.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Zuerst den zum tatsächlichen Werkzeugzugriff passenden Handoff lesen. STARTPROMPT-NORMAL-CHATGPT.md ist kopierbar. CHATGPT-TERMINAL-PROTOCOL.md gilt nur für Sitzungen ohne eigene Werkzeuge. Quellen und Master-Pakete stehen unter docs/planning.
