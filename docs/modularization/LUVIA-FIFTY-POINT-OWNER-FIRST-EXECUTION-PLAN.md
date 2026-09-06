# Aktueller Ausführungsplan P01 bis P50

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.97**, Core **4.82.216**. M16.5 Schritte 15–18 aktiv. P02/P03 sind auf der öffentlichen Integration .97 wieder kontinuierlich, bleiben aber teilweise bis zur vollständigen realen Filter-, Foto-, Deduplizierungs- und Latenzabnahme. P09/P10 folgen danach mit Timeline-, Booking- und AI-Parität. Apple bleibt geparkt.

**Zuletzt geliefert:** App .97 / Core .216 ist auf Integration veröffentlicht. Food zeigt 50 Orte und neun belegte Passend-Treffer; das Kleine Steakhouse fehlt korrekt. Shopping Passend 11, Natur Passend 16, Nachtleben Alle 23 und Stays 49 wurden im sichtbaren Browser geprüft; Zoom blieb nach dem Kategorienwechsel bedienbar. Die neue OSM-Kontinuität deckt 14 Kategorien und 19 Landesküchen ab, trennt Cache-Lookups von direkten Overpass-Budgets und besteht öffentliche Health-Proben. Releasekette: Runtime 706f7692, Gateway v225, Worker 47bc75d4, 231/231 Regression, NFR-0 3/3 und 30/30 Byteidentität.

**Nächster Schritt (AKTIV): Reale Filter-, Foto-, Deduplizierungs- und Latenzmatrix schließen.** Die unmittelbare Ausfallursache und der vegetarische Falschpositiv sind behoben. Für den P02/P03-Abschluss muss die nachgewiesene Kontinuität jetzt über jede Kategorie, jeden Filter, echte Ortsbilder und schnelle Wechsel gelten.

**Abnahme dieses Schritts:**

- Alle 14 sichtbaren Kategorien, 82 kanonischen Zuordnungen und 19 Landesküchen bestehen auf Desktop und Touch dieselbe positive, negative, leere und teilweise Provider-Matrix; UI-Label, aktive Kategorie, Filter und sichtbare Kohorte stimmen überein.
- Passend bleibt owner-basiert und fail-closed. Das vegetarische Profil enthält belegte positive Orte, niemals ein unbelegtes Steakhouse; dieselbe Entscheidung erscheint in Places, Stays, Timeline-Vorschlägen und AI Chat.
- Cache-Treffer zeigen Pins spätestens nach 1,0 Sekunden, kalte Providerpfade spätestens nach 3,0 Sekunden. Kategorienwechsel, Ziehen und Zoomen zeigen keinen falschen Leerzustand und bleiben jederzeit bedienbar.
- Detail-Sheets verwenden echte Bilder der exakten Provider-Place-ID mit sichtbarer Herkunft. Fehlt ein belegtes Bild, bleibt der Zustand ehrlich; fremde Place-Fotos sind ausgeschlossen.
- Kanonische Provider-ID, Name, Adresse und Koordinate deduplizieren Places und Stays, ohne verschiedene Orte zusammenzulegen.
- Google bleibt auf höchstens 1.000 Aufrufen pro Tag begrenzt; Cache, OSM, Geoapify, TomTom und HERE werden anhand dokumentierter Fähigkeiten und Budgets gesteuert. Safe Regression, NFR-0, sichtbare Browserabnahme und immutable Byteidentität bleiben grün.

**Danach:** Nach diesem P02/P03-Abschluss folgt P09/P10: dieselbe Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für die vollständige reale Kategorie-/Filtermatrix, echte Fotoabdeckung, Deduplizierung und Ziel-Latenzen. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich inventarisiert und über diese Blöcke sequenziert. Operativer Hinweis: Das Supabase-Dashboard meldet eine Überschreitung im vorigen Abrechnungszyklus und eine mögliche Projekteinschränkung ab 7. September; Nutzung und Billing müssen unabhängig vom Code beobachtet werden.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
