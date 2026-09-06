# Luvia aktueller Integrationsstand

Öffentliche Integration: **13.82.168.97**, Core **4.82.216**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. `places.v1` entscheidet die belegte Passung weiterhin einmalig für Karte, Timeline und AI Chat. Der veröffentlichte Stand trennt häufige, authentifizierte Edge-Cache-Lookups von den streng begrenzten direkten Overpass-Aufrufen, damit schnelles Zoomen und Kategorienwechsel nicht mehr Luvias eigene OSM-Sperre auslösen. Die sechs Stunden gecachte Kontinuitätsebene deckt alle 14 Kategorien und 19 Landesküchen ab; freie Overpass-Abfragen sind ausgeschlossen, Sachfilter bleiben bei fehlenden Fakten fail-closed und verknüpfte Bilder müssen zur exakten Place-ID gehören. Runtime-Commit **706f76928ac4cb96d48fea3416cf7abb7538d7b6**, Gateway **v225 / 4.64.30** und Worker **47bc75d4-f2f1-4266-9091-2a22baddb328** bilden den öffentlichen Stand. Safe Regression **231/231**, NFR-0 **3/3** und **30/30** Byteidentität zwischen sauberem Rollback-Archiv, Stable und immutable Worker sind belegt. Main und Production bleiben unverändert.

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

Historischer Teilnachweis vom 4. September 2026: App **13.82.168.47**, Core **4.82.169**, Channel **integration-preview**. Runtime-Familie: **M16.5 Places and Stays Quality**.

## Nachweis P09 Entfernen/Wiederherstellen .47

Integration läuft auf **13.82.168.47**, Core **4.82.169**, Quelle **8eeba9ada79488760fc55d0de042c107630a7002**, Worker **020f04e8-677c-4027-8cbb-0c5b1847ff38**. **214/214 Safe Regression** und **30/30 öffentliche Dateihashes** sind belegt. Gateway v161, Main-Frontend und der vorhandene Booking-Resolver 2.8.0 / Function v18 blieben unverändert; keine Function, Migration oder Secret-Änderung in diesem Slice.

Geplante Places werden erst nach einer lesbaren Vorschau entfernt. Diese nennt Termin und Dauer sowie die getrennt erhaltenen Ortsdetails, Favoriten und Booking-Fakten. Der Recovery-Beleg liegt im bestehenden Places-Owner-Datensatz und bleibt nach einem Reload sichtbar. Wiederherstellen liest den aktuellen Owner-Stand erneut, prüft Revision, Tageskonflikte und Booking-Gate und schreibt erst nach einer weiteren Bestätigung. Wiederholte Befehle liefern dasselbe fachliche Ergebnis.

Sichtbarer Integrationsnachweis: **Grande Beach Café** am 12.06.2027 um 15:00 Uhr / 90 Minuten wurde entfernt. Nach Reload blieb „Zuletzt entfernt“ verfügbar. Die Wiederherstellung zeigte den ursprünglichen Termin und den aktuellen konfliktfreien Tagesstand. Nach Bestätigung und erneutem Reload stand der Eintrag wieder am ursprünglichen Termin; der Recovery-Hinweis war verschwunden. Belege: `docs/modularization/PCR-P09-TIMELINE-REMOVE-RESTORE-20260904.md`, `tests/p09-timeline-remove-restore.test.cjs`, `outputs/p09-remove-restore-release47-regression-214.log` und `outputs/public-byte-proof47.json`.

P09 und P10 bleiben **TEILWEISE**. Der nächste verbindliche Abschnitt verbindet Timeline-Momente und ordnet mehrere Einträge mit einer bestätigten Vorher/Nachher-Vorschau um.

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Maßgeblich sind docs/planning/status-plan.v1.json, docs/planning/STATUSPLAN-2026-09-04.md, docs/planning/MASTERFAHRPLAN-v6.md und docs/planning/B1-END-TO-END-ACCEPTANCE-2026-09-04.md.

Main bleibt bei c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba. Geprüfter Rückfallstand: App .46, Quelle a6bbb89896882b3c941e5007ed8e2f44023503d1. Bereits vorhandener gemeinsamer Booking-Resolver: 2.8.0-venue-service-reservation-anchor, Function v18, Quelle 17749f8c654804d0656e2da914e302409789fb34. Keine neue Function, Migration oder Secret-Änderung in diesem P09-Slice.
