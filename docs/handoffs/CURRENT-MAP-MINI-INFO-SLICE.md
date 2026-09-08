# Aktueller gemeinsamer Places und Stays Slice

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.165**, Core **4.82.284**. P17/P19 aktiv und teilweise: App .164 / Core .283 und Intelligence v50 / 4.40.1 sind öffentlich auf Integration. Der echte Familien-/Ferienlauf liefert fünf passende Zielrichtungen, ein autoritatives Ferienfenster und erreicht nun die Tagesreparatur ohne Places-Timeout; die gemeinsame Mehrtages-Reparatur ließ Tag 4 und Tag 6 jedoch leer und wurde sicher ohne Speicherung abgebrochen. App .165 / Core .284 plus Intelligence 4.40.2 ist der Kandidat für einzeln fortsetzbare Tagesreparaturen. Gateway v235, Main und Production bleiben funktional unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag trennt drei Ebenen. Vor dem Plan müssen echte Zielkonflikte, Bewegungsradius, feste Termine sowie harte Gesundheits- und Budgetgrenzen entschieden sein. Luvia darf einen ausgewogenen Tagesrhythmus, 20 bis 25 Prozent sichtbaren Freiraum, eine Unterkunftsbasis und höchstens zwei intensive Tage in Folge vorbelegen; diese Annahmen sind sichtbar und mit einem Klick änderbar. Erst nach dem Entwurf folgen aktuelle Prüfungen für Öffnungen, Wetter, Preise, Buchbarkeit, Veranstaltungen, Einreise und Verkehr in Unsicherheitskarte und Buchungsreihenfolge. .164 startet alle expliziten Place-Kategorien parallel, wiederholt nur fehlende Nutzerwünsche und lässt reine Profilergänzungen den ersten Gesamtplan nicht blockieren. .165 repariert mehrere fehlerhafte Tage über getrennte, fortsetzbare Ein-Tages-Aufträge, übernimmt jeden gültigen Tag unverändert, schließt bereits verwendete Places im jeweils nächsten Auftrag aus und verlangt per Structured Output genau einen Ersatztag. Automatische Wiederaufnahme verwendet weiterhin denselben Auftrag; ein ausdrücklich geklicktes Erneut-Suchen verlässt dagegen einen erschöpften Workflow und startet mit neuer Idempotenz. Konfliktmoderator, Bewegungsradius, räumliche Vielfalt, harte Interessenabdeckung, kompakter Planungscheck und seitliches Desktoplayout bleiben enthalten. Für die produktive Tageskarten-Neuausrichtung ist Richtung A – Tagesroute gewählt; die echte Earth-Karte, Pin-Fokus und ein synchroner Luvia-Spektrum-Rahmen werden im getrennten visuellen Folgeslice umgesetzt.

**Nächster Schritt (AKTIV): Familien-, Ferien-, Mobilitäts- und Wunschkonflikte im zweiten realen Gesamtplan prüfen.** Der erste reale Gesamtplan funktioniert technisch, bündelt seine Places aber zu stark im Zentrum und deckt einen ausdrücklich gewünschten Meeresmoment nicht ab. Der zweite Positivlauf muss deshalb zugleich semantische Konfliktmoderation, autoritative Schulferien, räumliche Vielfalt, Mobilitätsradius und ausgewogenen Kategorienmix beweisen.

**Abnahme dieses Schritts:**

- Ein freier deutscher Reiseauftrag enthält Kinder mit Altersangaben, Schleswig-Holstein als Schulregion, einen groben Zeitraum, widersprüchliche Wünsche, gewünschten Strand-/Meeresanteil und mehrere Place-Kategorien.
- Vor der Planung stoppt Luvia ausschließlich für echte Zielkonflikte, einen fehlenden Bewegungsradius, feste Termine sowie harte gesundheitliche oder finanzielle Grenzen und schlägt ausschließlich autoritativ belegte Zeitfenster innerhalb der zuständigen Schulferien vor.
- Der echte Konfliktmoderator benennt die Spannung und bietet mindestens zwei sinnvoll priorisierte Varianten mit Folgen an, statt einen stillen Mittelwert oder ein Keyword-Schema zu verwenden.
- Der Reiseauftrag belegt sichtbar einen ausgewogenen Tagesrhythmus, 20 bis 25 Prozent Freiraum, eine Unterkunftsbasis und höchstens zwei intensive Tage in Folge vor; jede Annahme ist vor der Generierung mit einem Klick änderbar.
- Der gewählte Zeitraum erzeugt einen vollständigen Plan für alle Tage über mehrere sinnvolle Stadt-/Küstengebiete; Meer/Strand und bestätigte Kategorien sind als überprüfbare Abdeckung enthalten, fünf anstrengende Tage in Folge sind ausgeschlossen und Freiraum ist bewusst benannt.
- Unterkunftsradius und Nachbarschaft folgen aus dem fertigen Tagesnetz und Mobilitätswunsch. Öffnungen, Wetter, Preise, Buchbarkeit, Events, Einreise und aktuelle Verbindungen werden erst nach der Generierung mit echten Quellen geprüft und ehrlich in Unsicherheitskarte und Buchungsreihenfolge getrennt; Modell, Tokens, Latenz, Kosten und Reparaturen werden je Phase gemessen.

**Danach:** Nach Veröffentlichung von .165 wird der fehlgeschlagene öffentliche Familien-/Ferienlauf über seine vorhandenen gültigen Tage fortgesetzt und bis zum ungespeicherten Review geprüft. Danach setzt der getrennte visuelle Folgeslice Richtung A – Tagesroute auf der echten Earth-Karte um: Tagespunkt zu realem Pin, weicher Kartenfokus, Luvia-Spektrum-Rahmen, kompakter Routenfaden und reduzierte Bewegung. Danach folgen semantische Ablehnungsdiagnose und gezielte Teilreparatur, P15/P17 Kontoübernahme, Timeline, Archiv/Wiederherstellung und physische Geräte. M17 friert anschließend die gemeinsame Produktsprache ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .165 samt Intelligence 4.40.2 veröffentlichen und den öffentlichen Familien-/Ferien-/Konfliktlauf vollständig bis zum ungespeicherten Review abschließen; räumliche Streuung, Strandabdeckung, Kategorienmix, Latenz und Kartenbeschnitt am fertigen Plan messen. Anschließend Richtung A – Tagesroute produktiv auf der echten Karte umsetzen und öffentlich zeigen. Kosten/Latenz je Modell, Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

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
