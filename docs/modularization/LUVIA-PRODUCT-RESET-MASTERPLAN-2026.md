# Aktueller Product Reset Arbeitsplan

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

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
