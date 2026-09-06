# Kontext von M5 bis zum aktuellen Stand

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.114**, Core **4.82.233**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. P15/P17 besitzt mit App .114 / Core .233 nun die gemeinsame Composer- und Preference-Scope-Foundation. Stable Integration läuft nach der Abnahme wieder auf dem akzeptierten App-.104-Worker; der .114-Kandidat bleibt immutable. Main und Production blieben unverändert. P15/P17 ist weiterhin AKTIV, weil öffentliche Zielsuche, echter tageweiser Entwurf, Teilübernahme und Trip-Lifecycle noch geschlossen werden müssen.

**Zuletzt geliefert:** P15/P17 Foundation: Geführt, Schnellstart und Luvia AI verwenden denselben Trip Composer, dieselbe Trip-Wahrheit und dynamische 9/5/7-Schrittfolgen. Anfragefreitext bleibt receipt-only, Trip-Interessen und Budget bleiben reisebezogen, dauerhafte Profilwerte verlangen eine getrennte Identity-Bestätigung. Die AI-Vorschau erfindet keine Place-/Stay-, Medien-, Context-, Preis- oder Buchungsdaten. Der lokale sichtbare End-to-End-Lauf erreichte den idempotenten Trip-Command; öffentlich sind Einstieg und Schrittfolgen sichtbar, während die festhängende Zielsuche als offenes Gate dokumentiert ist. Safe Regression 235/235, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): P15/P17 mit öffentlicher Zielsuche, echtem Tagesentwurf und Teilübernahme schließen.** Die gemeinsame Composer- und Scope-Foundation ist belegt. Für den Blockabschluss fehlen jetzt nur noch die zuverlässige öffentliche Zielauflösung, der ownergestützte Tagesentwurf und die einzeln bestätigten Übernahme- und Trip-Lifecycle-Aktionen.

**Abnahme dieses Schritts:**

- Die kanonische Zielsuche liefert im öffentlichen Desktop- und Mobilbrowser innerhalb einer begrenzten Ladezeit einen bestätigbaren Ort oder einen klaren Fehler mit Wiederholung; kein endloses „Suche läuft …“.
- Der AI-Entwurf zeigt reale Place-/Stay-Identitäten aus places.v1 tageweise auf derselben Karte wie Places und Timeline, bindet die P12-Tagesprobe ein und kennzeichnet unbelegte Medien-, Context-, Preis- und Buchungsdaten als unbekannt.
- Vormerken, Einplanen, Tauschen, Weglassen und Teilübernahme erhalten jeweils eine eigene Vorher/Neu-Vorschau und schreiben erst nach Bestätigung idempotent über Trip, Journey oder Places Owner; Abbruch schreibt nichts.
- Trip archivieren, löschen und wiederherstellen zeigt Abhängigkeiten, verwendet trip.v1-Receipts und besteht Reload-Readback; eine dauerhafte Profilübergabe bleibt separat bestätigbar, korrigierbar und löschbar.
- Ein gebündelter sichtbarer Integrationslauf prüft den kompletten AI-Weg, Teilübernahme, Reload, Account-ohne-Reise, bestehende Reise, Desktop und mobiles Browserformat sowie erneut Safe Regression und NFR-0.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. P15/P17 besitzt die Foundation, bleibt aber bis zur öffentlichen Zielsuche, zum echten Tagesentwurf, zur Teilübernahme und zum Trip-Lifecycle teilweise. Danach folgen P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

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
