# Luvia aktueller Integrationsstand

Integrationskandidat: **13.82.168.94**, Core **4.82.213**, Channel **integration-preview**, Runtime-Familie **M16.5 Places and Stays Quality**. Places veröffentlicht seinen aktiven, providerbelegten Kandidatensatz jetzt über `places.v1`. Timeline-Vorschläge und AI Chat verwenden dadurch dieselbe kanonische Place-ID, denselben Profilbeleg und denselben lesbaren Passend-Grund, ohne dafür eine zweite Provider-Suche auszulösen. Vegetarische und vegane Passung bleibt fail-closed; ein fleischzentrierter Ort wird ohne dedizierte vegetarische oder vegane Klassifikation nicht als passend markiert. Stay nutzt dieselbe technische Projektion mit eigener Unterkunftskategorie, sodass Ernährungsfakten nicht in Unterkünfte auslaufen. Der Kandidat ist vor der öffentlichen Integration-Veröffentlichung; Gateway- und Worker-Identität werden nach dem Deploy in den gemeinsamen Status geschrieben. Main und Production bleiben unverändert.

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.94**, Core **4.82.213**. M16.5 Schritte 15–18 aktiv. P02 Passend ist öffentlich stabil; der P03 Cross-Surface-Slice steht als App .94 / Core 4.82.213 unmittelbar vor seiner öffentlichen AI-Chat-Abnahme. Apple bleibt geparkt.

**Zuletzt geliefert:** Auf App .93 sind Places und Timeline sichtbar auf derselben aktiven Place-Kohorte: 11 vegetarisch belegte Passend-Pins, kein Steakhouse-Falschpositiv, dieselbe kanonische HERE-ID und derselbe lesbare Profilgrund bei null zusätzlichen Timeline-Provider-Reads. App .94 ergänzt den fehlenden lokalen Chat-Intent für den realen Satz mit flektiertem „vegetarische Restaurants“; fokussierte P03-, Semantik-, Orchestrierungs-, Release-, Inventur- und NFR-0-Gates sind grün.

**Nächster Schritt (AKTIV): App .94 veröffentlichen und dieselbe Passend-ID im AI Chat sichtbar belegen.** Der letzte reale Gegenbeleg lag nur noch im lokalen Fallback des Chats: Ohne Live-KI wurde „vegetarische Restaurants“ wegen deutscher Flexion nicht als Places-Read erkannt. Der Kandidat behebt genau diese Lücke.

**Abnahme dieses Schritts:**

- Der öffentliche Integration-Chat verarbeitet den exakten Satz „Zeig mir passende vegetarische Restaurants in Scharbeutz.“ auch bei nicht verfügbarer Live-KI als lokalen sicheren Places-Read.
- Places, Timeline und AI Chat zeigen mindestens eine identische kanonische Place-/Provider-ID und denselben lesbaren vegetarischen Passend-Grund.
- AI Chat weist für die wiederverwendete aktive Place-Kohorte Provider-Read-Zähler 0 aus.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; weder Chat noch Timeline erfinden eine Passung.
- Safe Regression 230/230, NFR-0 3/3, Stable/Immutable-Asset-Identität und Rückfallarchiv sind grün.

**Danach:** Nach dem öffentlichen P03-Beleg wird die offene P02/P03-Vollständigkeit für alle Kategorien, Landes- und Sachfilter, echte Ortsbilder und Providerquoten geschlossen.

**Weiter offen:** P02 bleibt teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P03 ist bis zum öffentlichen Chat-Beleg aktiv. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert.

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
