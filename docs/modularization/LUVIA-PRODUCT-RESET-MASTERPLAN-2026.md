# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-08:** Integration **13.82.168.171**, Core **4.82.290**. P17/P19 aktiv und teilweise: App .170 / Core .289 und die getrennte Integration-Intelligence 4.41.0 sind öffentlich auf Integration. Der mobile Valencia-Lauf behielt den Auftrag nach Tabwechsel und zeigte die echten Planungsphasen, endete aber nach 2:42 Minuten sichtbar am 65-Sekunden-Limit des Gesamtplans. App .171 / Core .290 mit Integration-Intelligence 4.42.0 ist der Leistungskandidat gegen die verbliebene Wiederholungs- und Laufzeitursache. Main und Production bleiben unverändert.

**Zuletzt geliefert:** Der semantische Reiseauftrag, Richtung A, Kategorienfarben, Kartenkopplung, räumliche Streuung, harte Interessenabdeckung, Tagesbalance, Freiraum, Unsicherheitskarte und Buchungsreihenfolge bleiben erhalten. .170 ist auf Integration veröffentlicht, 22/22 releasekritische Dateien waren zwischen Archiv, Stable und Immutable byteidentisch, und der mobile Tabwechsel setzte denselben Auftrag ohne Verlust fort. Der reale Lauf belegte zugleich den Restfehler: trip.compose überschritt 65 Sekunden, und eine veraltete Lease-Regel konnte den laufenden bezahlten Job nach 90 Sekunden noch einmal einreihen. .171 entfernt diese stille Wiederholung vollständig. Ein verwaister Job wird nach 60 Sekunden als AI_JOB_INTERRUPTED sichtbar beendet. Der Luna-Erstentwurf arbeitet ohne zusätzliche Reasoning-Tokens, mit höchstens 5.200 Ausgabetokens und einem 50-Sekunden-Serverlimit. Die Warteansicht zeigt weiter fünf echte Phasen und ergänzt je Phase konkrete Arbeitsgegenstände wie Reisetage, Place-Kandidaten, Wege, Freiraum, Tagesbalance und offene Fakten; ab 45 Sekunden erscheint eine klare Laufzeiteskalation.

**Nächster Schritt (AKTIV): App .171 und Integration-Intelligence 4.42.0 ausschließlich auf Integration veröffentlichen und den vollständigen mobilen Valencia-Neuversuch messen.** Der veröffentlichte .170-Lauf hat Wiederaufnahme und sichtbare Fehler belegt, den Gesamtplan aber nicht schnell genug abgeschlossen. .171 muss nun zeigen, ob der kleinere Luna-Erstentwurf den ungespeicherten Review innerhalb des begrenzten Ablaufs erreicht; in jedem Fehlerfall darf genau ein bezahlter Compose-Lauf entstehen.

**Abnahme dieses Schritts:**

- App .171 / Core .290 wird aus einem sauberen Commit ausschließlich auf Integration veröffentlicht; releasekritische Dateien sind zwischen Archiv, Stable und Immutable byteidentisch.
- Integration ruft die getrennte Function luvia-intelligence-integration mit Health 4.42.0 auf; die produktive Function luvia-intelligence und Main/Production bleiben unverändert.
- Die Warteansicht zeigt fünf verständliche reale Arbeitsphasen, die verstrichene Gesamtzeit und konkrete aktive Arbeitsgegenstände; eine Phase über 45 Sekunden wird sichtbar erklärt.
- Vordergrund, Page-Restore und Netzrückkehr verwenden denselben Workflow und dieselbe Idempotenz-ID; ein fehlgeschlagener oder verwaister bezahlter Job wird ohne sichtbaren Nutzer-Neuversuch niemals erneut ausgeführt.
- Ein trip.compose-Hänger endet nach 50 Sekunden; ein verwaister Job wird nach 60 Sekunden mit AI_JOB_INTERRUPTED terminal sichtbar.
- Der öffentliche vollständige Reiseplan erreicht den ungespeicherten Review oder zeigt innerhalb des begrenzten Ablaufs einen konkreten sichtbaren Fehler; eine minutenlange unsichtbare Wiederholung ist ausgeschlossen.
- Der vorhandene Valencia-Brief und Places-Katalog werden beim sichtbaren Neuversuch wiederverwendet, damit nur der fachlich nötige Modellschritt neu läuft.
- Tagespunkt und echter Places-Pin fokussieren sich gegenseitig; Kategorien behalten Compass-Farben und der aktive Eintrag zeigt den vollständigen Luvia-Spektrumrahmen.

**Danach:** Nach dem gemessenen mobilen Positivlauf folgen autoritative Ferienfenster und die fachliche Konfliktmoderation vor der Planung, danach die Abnahme von räumlicher Streuung, Strandabdeckung und Kategorienmix. Anschließend werden P16-Ablehnungsdiagnose, P15/P17-Kontoübernahme, Timeline-/Owner-Receipts, Archiv/Wiederherstellung und physische Geräte geschlossen. M17 friert die gemeinsame Produktsprache sowie die modulübergreifenden Intelligence-Verträge ein; M18 baut Collaboration, Attention, Wallet/Dokumente, Reviews, Admin, Social, Suche und Intelligence II aus.

**Weiter offen:** P17/P19: .171 samt Integration-Intelligence 4.42.0 öffentlich messen und den Gesamtplan bis zum ungespeicherten Review führen; automatische autoritativ belegte Ferienfenster, Konfliktvarianten, räumliche Streuung, Strandabdeckung und Kategorienmix fachlich abnehmen. Konto- und Timeline-Übernahme, physische Geräte sowie echte datierte Unterkunfts-, Routen-, Wetter-, Event-, Preis-, Öffnungs- und Buchbarkeitsbelege bleiben offen. P16: semantische Ablehnungsdiagnose. Kontextwellen, Reise-Schatten, Ziel-Zwillinge, Luvia Pulse und Gruppen-Sternbild bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
