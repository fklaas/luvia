# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.117**, Core **4.82.236**. M16.5 Schritte 15–18: P09/P10/P11/P12 behalten ihre begrenzten internen Belege. P15/P17 ist aktiv und noch nicht produktfertig. App .117 ergänzt robuste Composer-Übernahme, Auswahl-/Reload-Schutz, Kategorieabdeckung und eine erste interaktive Gestaltungsrunde. Die frühere Aussage, es fehle nur noch Lifecycle, ist korrigiert. Stable Integration bleibt auf App .104; .117 ist ein unveränderlicher Prüfkandidat. Main und Production bleiben unverändert.

**Zuletzt geliefert:** App .117 sichert getauschte Vorschläge, Auswahlarten, Uhrzeiten, Dauern und bestätigte Teilschritte über Reload. Feste Daten und Reisezeitzone werden geprüft; Vormerken und Weglassen fließen in die echte Journey-Tagesprüfung ein. Positive, identitätsgebundene Owner-Readbacks sind für eine erfolgreiche Übernahme erforderlich. Alle gewählten Kategorien nutzen den gemeinsamen Provider-Router; gecachte passende Kategorien sparen Anbieterabfragen. Der öffentliche Browserlauf zeigte fünf echte Scharbeutz-Orte aus Essen, Kultur und Aktivitäten, vier Pins nach Teilwahl und den nach Reload erhaltenen Stand 3 einplanen / 1 vormerken / 1 weglassen. Er endete vor der echten Kontomutation. Lokal bestätigte der sichtbare mobile Lauf fünf simulierte Schreibaktionen mit echten Vertragsregeln. 24 neue Verhaltensprüfungen, 236/236 Safe Regression, NFR-0 3/3 und 30/30 öffentliche Byteidentität sind grün. Reisefarbige Fortschrittsübersicht, erhaltene Karte, Kartenfokus, besser lesbare Karten und kurze Schrittübergänge wurden sichtbar auf Desktop und bei 390 × 844 Pixeln geprüft.

**Nächster Schritt (AKTIV): P15/P17: echten KI-Reiseauftrag mit bearbeitbarer Tagesplanung verbinden.** Der Nutzer verlangt eine lebendige interaktive Reiseerstellung und KI mit nachvollziehbarem Verständnis. Die aktuelle Vorschau verwendet gewählte Kategorien und höchstens drei Tage; Freitext wird noch nicht für eine vollständige Reiseplanung interpretiert. Dieser Produktnachweis muss vor einem P15/P17-Abschluss erbracht werden.

**Abnahme dieses Schritts:**

- Freitext, ausgewählte Schwerpunkte und bestätigte Profilrestriktionen werden über den Intelligence Owner zu einem sichtbaren Reiseauftrag aufgelöst. Widersprüche oder fehlende wesentliche Angaben lösen gezielte Rückfragen aus; unbelegte Eigenschaften werden nicht als passend behauptet.
- Die nötigen Kontextbelege aus P19/P20/P22/P23/P26 und P33/P34/P35 werden für Zeit, Wege, Budget, Öffnung und Saison angebunden. Eine vollständige Reise über den gewählten Zeitraum enthält tatsächliche Auswahlgründe, Freiraum und klar benannte unbekannte Faktoren.
- Eine interaktive tageweise Gesamtvorschau mit der gemeinsamen Places-Karte erlaubt Datum-/Zeitänderung, Alternativen, Vormerken und Teilübernahme. Die Gestaltung nutzt Reisefarbe und angemessene Bewegung; mobile Bedienung und Reduced Motion bleiben erhalten.
- Ein realer Konto-End-to-End-Lauf muss Trip-Erstellung und exakt gewählte Place-/Journey-Einträge samt Dauer, Reload und Teilfehler-Wiederaufnahme bestätigen. Fixture-Receipts allein gelten nicht als Produktfreigabe.

**Danach:** Danach werden innerhalb P15/P17 die getrennte dauerhafte Identity-Übergabe und Archivieren/Löschen/Wiederherstellen der Reise geschlossen. Die übrige Context Matrix und AI-Parität bleiben unter P19/P20/P22/P23/P26 und P33/P34/P35 verfolgt; M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: reale Booking-Provider. P09/P10/P11/P12: begrenzte interne Nachweise; physische iOS-/Android-Abnahme und bei P12 echte Context-Signale fehlen. P15/P17: tatsächliche Freitext-/Gesamtreiseplanung, finale Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle fehlen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund dieser Composer-Teilverbesserung als vollständig abgeschlossen markiert.

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
