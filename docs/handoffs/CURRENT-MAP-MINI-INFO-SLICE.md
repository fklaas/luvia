# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.86**, Core **4.82.208**. M16.5 Schritte 15–18 aktiv. P09/P10 Visit- und Memory-Verwaltung sind geliefert; B1/P02–P03 bleibt für den positiven Google-Places-Ernährungsbeleg aktiv. Die API selbst ist laut Nutzerbestätigung bereits aktiv; der aktuelle Abschlussblock liegt jetzt bei Key-Beschränkung, Key-Projekt-/Billing-Zuordnung und anschließendem Realbeleg.

**Zuletzt geliefert:** App 13.82.168.86 / Core 4.82.208 läuft auf Integration über Worker 1d936ac3-fd72-40ca-a5f4-513f414b74d2. Gateway v204 / 4.64.21 ist ACTIVE und reduziert Google-Permission-Fehler sicher auf Status, Grund und Dienst. Das unveränderte Supabase-Secret ist vorhanden. Nach kontrolliertem Cooldown-Reset erreichte der Live-Probe places.googleapis.com und belegte HTTP 403 / PERMISSION_DENIED. Alle zeigt 50 reale Essen-&-Trinken-Pins; Passend bleibt ohne erfundenen Positivbeleg 0/0. Visit-/Memory-Owner, Supabase-Visit-Constraint, sichtbarer 477×900-Browsertest, 30/30 öffentliche Bytevergleiche, 227/227 Safe Regression nach der Diagnose und der unveränderte Main-Inhalt bleiben belegt.

**Nächster Schritt (AKTIV): Bestehenden Google-Key mit Places API (New) und Supabase-Serveraufruf abgleichen.** Places API (New) ist laut Nutzerbestätigung aktiv und das unveränderte Secret erreicht Google. Der echte Search-Aufruf wird jedoch von places.googleapis.com mit HTTP 403 / PERMISSION_DENIED abgewiesen.

**Abnahme dieses Schritts:**

- Im Projekt des bestehenden Schlüssels die API-Beschränkung auf Places API (New) prüfen.
- Die Anwendungseinschränkung muss einen serverseitigen Aufruf aus Supabase Edge Functions zulassen; eine reine Browser-Referrer-Beschränkung ist dafür ungeeignet.
- Projektzugehörigkeit des Schlüssels und aktives Billing dieses Schlüsselprojekts sind bestätigt.
- Der öffentliche Health-Probe antwortet ohne PERMISSION_DENIED und ohne Offenlegung des Schlüssels oder von Consumer-Metadaten.
- Essen & Trinken zeigt mindestens einen realen vegetarischen Passt-Pin; Places, Timeline und AI Chat teilen Provider-ID, Reisezielradius und Passend-Grund.
- Safe Regression, Stable/Immutable-Identität und unveränderter Git-Main-Stand sind erneut belegt.

**Danach:** Danach der positive Booking-Provider-Weg und die physische iOS-/Android-Langdruckabnahme; anschließend P12/P15/P17 Trip Composer, P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität.

**Weiter offen:** P02/P03 aktiv: bestehende Google-Key-Beschränkung beziehungsweise Key-Projekt-/Billing-Zuordnung korrigieren und positiven öffentlichen Ernährungsbeleg abnehmen. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

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
