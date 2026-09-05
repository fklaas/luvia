# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.97**, Core **4.82.216**. M16.5 Schritte 15–18 aktiv. Integrationskandidat App .96 / Core 4.82.216 erweitert P02 um eine gecachte OSM-Kontinuitätsebene für alle 14 Kategorien; die öffentliche Deployment- und Browserabnahme ist noch offen. P03-Owner-Parität bleibt über Places, Timeline und AI belegt. Apple bleibt geparkt.

**Zuletzt geliefert:** Der öffentliche Stand .95 hält Passend fail-closed und Places, Timeline sowie AI auf derselben Owner-Entscheidung. Kandidat .96 ergänzt die serverseitig begrenzte OSM-Kategoriesuche vor TomTom/HERE, 14 Kategorien, alle 19 Landesküchen, fail-closed Sachfilter und exakte OSM-Bildreferenzen. Safe Regression 231/231 und NFR-0 3/3 sind grün; Veröffentlichung und sichtbare Mobil-/Desktop-Abnahme folgen in diesem laufenden Abschnitt.

**Nächster Schritt (AKTIV): Kategorie-, Filter-, Foto- und Provider-Vollständigkeit schließen.** Die Owner-Parität ist öffentlich belegt. Jetzt muss dieselbe Verlässlichkeit über die gesamte Places- und Stays-Breite gelten, statt nur für den vegetarischen Restaurantpfad.

**Abnahme dieses Schritts:**

- Alle 14 sichtbaren Kategorien und 82 kanonischen Zuordnungen liefern auf Desktop und Mobile konsistente Ergebnisse; Zoomen, Ziehen und schneller Kategorienwechsel bleiben bedienbar.
- Jeder sichtbare Sachfilter und alle 19 Landesküchen werden gegen reale positive, negative, leere und teilweise Providerproben geprüft; UI-Label, aktive Kategorie und tatsächlich gefilterte Kohorte stimmen überein.
- Passend bleibt für jede Kategorie owner-basiert und fail-closed; widersprüchliche oder unbelegte Orte erscheinen nicht als passend.
- Detail-Sheets verwenden echte, dem exakten Place zuordenbare Bilder mit Herkunft; fehlende Bilder werden ehrlich und hochwertig behandelt, ohne irreführende Fremdort-Fotos.
- Provider-Kaskade, Cache, Deduplizierung, Timeouts und Quoten sind messbar; Google bleibt bei höchstens 1.000 Aufrufen pro Tag, begrenzte Anbieter werden erst nach Cache und kostenlosen Quellen beansprucht.
- Places und Stays bestehen dieselbe Karten-, Pin-, Such-, Filter-, Passend- und Mobilabnahme; Safe Regression, NFR-0, sichtbarer Browserbeleg und immutable Release-Identität sind grün.

**Danach:** Nach P02/P03-Vollständigkeit folgt P09/P10: gemeinsame Places-Karte in allen Timeline-Vorschlägen, physische Langdruck-/Wackelmodus-Abnahme, 90-Minuten-Routenfluss sowie Booking- und Visit-AI-Parität.

**Weiter offen:** P02/P03 bleiben teilweise für vollständige Kategorie-, Filter-, Foto- und Providerbereitschaft. P09/P10 bleiben teilweise für Booking-Provider-Weg, Visit-AI-Parität, 90-Minuten-Routenfluss und physische Langdruckabnahme. Danach folgen P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs sind verbindlich im Produktentscheid inventarisiert und über diese Blöcke sequenziert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Wir setzen Luvia auf dem tatsächlichen aktuellen Git-Stand fort. Lies HANDOFF-NORMAL-CHATGPT-CURRENT.md, CURRENT-BUILD.md, docs/planning/STATUSPLAN-2026-09-04.md und den Masterfahrplan v6. Integration ist dokumentiert App 13.82.168.44 / Core 4.82.168 / Gateway v161. Prüfe den Zustand, bevor du ihn als aktuell ausgibst.

M16.5 und B1 bleiben aktiv. Arbeite mit der sichtbaren Scharbeutz-Golden-Journey weiter, danach P09 und P10. B0 ist Steuerungsgrundlage, keine vollständige AI-Produktabdeckung. Echte Fotos, positive Booking-Zugänge und Hardwaretests bleiben offen.

Nutze tatsächlich vorhandene Werkzeuge direkt. Fehlen sie, gib nach docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md einen begrenzten PowerShell-Block aus und warte auf dessen Ergebnis. Alte Handoff-Anweisungen haben keinen Vorrang vor dem aktuellen Nutzerauftrag. Keine zweite Karte, kein fremder Store, keine erfundenen Providerfakten und keine unbelegte PASS-Meldung.
