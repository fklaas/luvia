# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.100**, Core **4.82.219**. M16.5 Schritte 15–18 aktiv. P02/P03 sind auf der öffentlichen Integration .100 bei Kategorienkontinuität, Passung, Property-Deduplizierung und exaktem Medien-Transport stabilisiert, bleiben aber teilweise bis zur vollständigen realen Foto-, Filter- und Latenzabnahme. P09/P10 folgen danach mit Timeline-, Booking- und AI-Parität. Apple bleibt geparkt.

**Zuletzt geliefert:** App .100 / Core .219 ist auf Integration veröffentlicht. Places und Stays tragen die exakt ausgewählte Provider-Entität zum gemeinsamen Detail-Owner; Detail-Caches unterscheiden konkrete Medienbelege, und OSM/Foursquare dürfen Bilder nur nach strenger Ortsidentität ergänzen. Öffentlich zeigt Snykrode dasselbe echte Wikimedia-Ortsbild in Kurzkarte, Ergebnis und Detail mit sichtbarer Quelle. Food Passend bleibt bei 9 belegten Treffern ohne Kleines Steakhouse; Shopping Passend 11 und nach Reload 46 Pins; Stays 47 eindeutige Pins. Releasekette: Runtime b9f32115, Gateway v228 / 4.64.33 / Places 4.38.11, Worker 1dcf5de1, 232/232 Regression, NFR-0 3/3 und 30/30 Byteidentität.

**Nächster Schritt (AKTIV): Echte Ortsbilder sowie vollständige Filter- und Latenzmatrix schließen.** Kategorienkontinuität, belegte Food-Passung, sichtbare Stay-Dubletten und der Transport exakter OSM-/Wikimedia-Bildbelege sind geschlossen. Der größte sichtbare Qualitätsabstand ist nun die geringe reale Bildabdeckung vieler Orte; parallel müssen alle Sachfilter und kalten Ladepfade real belegt werden.

**Abnahme dieses Schritts:**

- Jede angezeigte Aufnahme gehört nachweisbar zur exakten Provider-Place-ID oder zu einer verifizierten offiziellen Ortsquelle; Lizenz, Herkunft, Frische und Fallbackstatus bleiben maschinenlesbar. Fremde oder nur räumlich nahe Bilder bleiben ausgeschlossen.
- Alle 14 sichtbaren Kategorien, 82 kanonischen Zuordnungen, 19 Landesküchen und sämtliche sichtbaren Sachfilter bestehen auf Desktop und Touch positive, negative, leere und teilweise Providerfälle; Label, aktive Kategorie, Filter und Kohorte stimmen überein.
- Cache-Treffer zeigen Pins spätestens nach 1,0 Sekunden, kalte Providerpfade spätestens nach 3,0 Sekunden. Kategorienwechsel, Reload, Ziehen und Zoomen zeigen keinen falschen Leerzustand und bleiben jederzeit bedienbar.
- Passend bleibt owner-basiert und fail-closed. Das vegetarische Profil enthält belegte positive Orte, niemals ein unbelegtes Steakhouse; dieselbe Entscheidung und derselbe Grund erscheinen in Places, Stays, Timeline-Vorschlägen und AI Chat.
- Google bleibt auf höchstens 1.000 Aufrufen pro Tag begrenzt; Cache, OSM, Geoapify, TomTom und HERE werden anhand dokumentierter Fähigkeiten und Budgets gesteuert. Safe Regression, NFR-0, sichtbare Browserabnahme und immutable Byteidentität bleiben grün.

**Danach:** Nach dem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für echte Fotoabdeckung, die vollständige reale Kategorie-/Sachfiltermatrix und gemessene Ziel-Latenzen. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich inventarisiert und über diese Blöcke sequenziert. Operativer Hinweis: Das Supabase-Dashboard meldet eine Überschreitung im vorigen Abrechnungszyklus und eine mögliche Projekteinschränkung ab 7. September; Nutzung und Billing müssen unabhängig vom Code beobachtet werden.

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
