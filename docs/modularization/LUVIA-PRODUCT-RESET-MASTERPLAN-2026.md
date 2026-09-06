# Aktueller Product Reset Arbeitsplan

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

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
