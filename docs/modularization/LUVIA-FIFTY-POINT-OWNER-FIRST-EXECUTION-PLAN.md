# Aktueller Ausführungsplan P01 bis P50

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

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
