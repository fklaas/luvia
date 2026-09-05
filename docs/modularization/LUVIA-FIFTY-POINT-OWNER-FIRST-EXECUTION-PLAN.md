# Aktueller Ausführungsplan P01 bis P50

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.77**, Core **4.82.199**. M16.5, Schritte 15–18 aktiv; B1/P02 und P03 in Arbeit. A1 Dokumentkonsolidierung wird nach jedem Slice fortgeschrieben; A2 Ende-zu-Ende-Abnahme ist teilweise belegt; P09 und P10 bleiben teilweise umgesetzt.

**Zuletzt geliefert:** App 13.82.168.77 / Core 4.82.199 läuft auf Integration über Worker e47b5593-a586-4697-9d10-e6ca16e04089 bei 100 Prozent Traffic; Gateway v194 / 4.64.18 meldet denselben Build. Faktenfilter werden an der Providergrenze strikt ausgewertet, identitätsgebundene Bilder bleiben mit sichtbarer Quelle bis in die große Detailansicht erhalten. Der sichtbare .76-Kaltstart deckte einen transienten dynamischen Modulfehler auf; .77 wiederholt Kernmodule einmal automatisch und startete Places mit 50 sowie Stays mit 49 Pins ohne Browserfehler. 224/224 Safe Regression, 3/3 NFR-0 und 30/30 öffentliche Dateihashes sind grün. Main und Production bleiben unverändert.

**Nächster Schritt (AKTIV): Restliche Filter-, Foto- und Mobilmatrix schließen.** Der akute Provider-Budgetstopp und der konkrete Steakhouse-Falschpositivfall sind behoben und sichtbar belegt. Offen bleiben die vollständige positive beziehungsweise providerbelegte Nullfall-Abnahme jeder Filteroption über Oberfläche und AI Chat, die breite exakte Fotoabdeckung und Messwerte von einem physischen Mobilgerät.

**Abnahme dieses Schritts:**

- Jede sichtbare Kategorie-, Untertyp-, Fakten- und Landesküchenoption wird über Places und Stays betätigt; Kombination und Reset liefern reproduzierbar dieselben kanonischen Place-Identitäten oder einen providerbelegten verständlichen Nullfall.
- Dieselben Anfragen über den AI Chat verwenden dieselbe Kandidatenmenge, denselben Reisezielradius, dieselben Passend-Gründe und dieselben Providerbelege wie die Kartenoberfläche und die Timeline-Vorschläge.
- Überraschende Landesküchen- und Profilklassifikationen werden mit einer zweiten Quelle oder einer dedizierten Providerklassifikation gegengeprüft; fleischzentrierte Orte erhalten ohne konkrete Ernährungsbelege kein vegetarisches oder veganes Passt.
- Jede Detailkarte versucht ein exakt zum realen Ort gehörendes Bild mit Attribution; Trefferquote, ehrliche Bildlücke und Ablehnung benachbarter oder namensfremder Medien werden protokolliert.
- Kaltstart, Warmstart, Reisewechsel, Zoom, Ziehen, Kategorienwechsel und sichtbare Pin-Zeit werden auf einem physischen Mobilgerät gemessen und gegen die Desktop-Abnahme gehalten.
- Vollständige Safe Regression, 30/30 Byte-Gleichheit, unveränderliches Archiv und exakter Frontend-, Gateway- und Budget-Rückfall bleiben Releasegate.

**Danach:** Danach P09/P10 mit den positiven Verwaltungswegen für Booking, bestätigte Besuche und Memory-/Foto-Momente schließen; anschließend P12/P15/P17 den gemeinsamen Trip Composer mit Reisestart, Geführt, Schnellstart, KI-Entwurf und Vormerken umsetzen.

**Weiter offen:** P02/P03: restliche sichtbare Filtermatrix über UI/AI Chat, zweite Quellenprüfung überraschender Klassifikationen, breite echte Place-Fotos und physische Mobilzeiten. P09/P10: positive Booking-/Visit-/Memory-Owner-Wege und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
