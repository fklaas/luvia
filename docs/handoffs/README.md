# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.206**, Core **4.82.325**. P17/P19: App .206 / Core 4.82.325 mit hartem POI-Evidenzgate und begrenzter Hybridrecherche auf Integration veröffentlicht.

**Zuletzt geliefert:** App .206 / Core 4.82.325 ist aus Commit de311c3f28cd1470a79acf02bbf618bd6e75f549 auf Integration-Worker d4a60923-691d-4225-8dd2-c42b20d088bd veröffentlicht. 245/245 Safe Regression und NFR-0 3/3 sind grün. 16 geänderte Laufzeitdateien stimmen auf Stable und Immutable jeweils bytegleich mit dem sauberen Archiv überein (32/32 Vergleiche, 9.708.830 geprüfte Bytes). Archiv 92.758.336 Bytes, SHA-256 A6237DB448316BBA3258E4D9150CCC8A9220AFF36021FD50764B858065631029. Der öffentliche Intelligence-Healthcheck meldet Webrecherche aktiv: Luna, maximal zwei Webaufrufe, ein Recherchelauf je Workflow, fünf je Nutzer/Tag und 100/Tag systemweit. Der echte Valencia-Pool-Replay verwirft Km 0, Local Tour Guide, Parking Ya! und unbelegte generische Kandidaten; Malvarosa-Strand sowie Heron City, Arena Multiespacio und Aqua Multiespacio bleiben korrekt nutzbar. Bereits bestätigte Reiseentwürfe werden nicht still überschrieben.

**Nächster Schritt (AKTIV): Neuen Qualitätsvertrag veröffentlichen und einen frischen Valencia-Gesamtplan belegen.** Die strukturellen Fehler sind im gemeinsamen Owner-Vertrag behoben. Jetzt muss derselbe Stand auf Integration zeigen, dass echte Kandidaten, Kategorienmix, räumliche Streuung, Essenszeiten, Wiederaufnahme und begrenzte Webkosten zusammen funktionieren.

**Abnahme dieses Schritts:**

- Safe Regression vollständig grün; sauberer Integration-Deploy mit immutable Version und Rollback; ein frischer echter Valencia-Lauf ohne Km 0, Touristeninformation, generische Entdeckungsorte oder ungewünschte Parkdominanz, mit Strand/Hafen/Altstadt/weiteren Vierteln sowie gewünschten Aktivitäten, Nachtleben, Einkaufszentrum und Restaurants; bezahlte Webrecherche höchstens einmal je Workflow und bei Wiederaufnahme wiederverwendet.

**Danach:** Den Familien-/Konfliktfall, Mitreisende, Geräte-Wiederaufnahme und die übrigen P17/P19-Gates schließen. M16.5 bleibt bis zu diesen Abnahmen offen; M17 ist die umfassende Design-/Produktsprache, Intelligence II folgt in M18.8.

**Weiter offen:** P17/P19 bleiben TEILWEISE bis zum frischen öffentlichen Gesamtplan: Familien-/Konfliktfall, Lernen über mehrere Reisen, eingeladene Mitreisende, gebietsferne Reserve im produktiven Tauschfluss, physische iOS-/Android-Abnahme sowie aktuelle Wetter-, Öffnungs-, Preis-, Buchbarkeits-, Event-, Einreise- und Verkehrsbelege. Der im Browser vorhandene teilweise bestätigte Altentwurf bleibt geschützt. M16.5 bleibt offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../../HANDOFF-CODEX-CURRENT.md)
- [Ergänzender Nachweis und Status](../../HANDOFF-NORMAL-CHATGPT-CURRENT.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Zuerst den zum tatsächlichen Werkzeugzugriff passenden Handoff lesen. STARTPROMPT-NORMAL-CHATGPT.md ist kopierbar. CHATGPT-TERMINAL-PROTOCOL.md gilt nur für Sitzungen ohne eigene Werkzeuge. Quellen und Master-Pakete stehen unter docs/planning.
