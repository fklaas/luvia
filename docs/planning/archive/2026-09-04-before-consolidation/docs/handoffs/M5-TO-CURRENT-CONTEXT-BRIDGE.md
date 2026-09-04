# Kontextbrücke: vom alten M5-Chat zum aktuellen Luvia-Stand

Stand: 2026-09-03

## Warum diese Brücke nötig ist

Der normale ChatGPT-Chat kennt Luvia nur bis zum damaligen M5-Arbeitsstand. Seit
diesem Stand wurden nicht lediglich UI-Details ergänzt. Architektur,
Produktstrategie, Releaseverfahren und die aktuelle Ausführungsreihenfolge
haben sich wesentlich weiterentwickelt. Alte M5-Vorschläge dürfen deshalb nicht
ungeprüft fortgesetzt werden.

## Geschlossene Architekturmeilensteine nach M5

| Meilenstein | Geschlossener Kern |
|---|---|
| M5 | Trip Core, aktiver Trip-Kontext und Abgrenzung fremder Trip-Wahrheit |
| M6 | Places Core und öffentliche Places-Verträge |
| M7 | Media Core und native-fähige Media-Ports |
| M8 | Identity Core und versionierte Event-Verträge |
| M8.5 | Intelligence Core, Policy, Tools und owner-gesteuerte Orchestrierung |
| M9 | App Shell, Navigation, Verlauf und Runtime-Lebenszyklus |
| M10 | zentraler Overlay Host statt konkurrierender Modal-Lebenszyklen |
| M10.5 | Experience Core, Design-/Interaktionssemantik und Web-Adapter |
| M11 | produktive Today-/Attention-Komposition |
| M12 | eigenständiger Journey Day Graph und Konfliktpolitik |
| M13 | Memory-/Narrative-Owner und erste Story-Komposition |
| M14 | Runtime-Klarheit und Conversational-AI-Grenzen |
| M15 | owner-backed Rich Results in der Intelligence-Oberfläche |
| M16 | bestätigte Owner-Aktionen mit Risiko, Preview, Receipt und Recovery |

M0–M16 sind geschlossen. Sie werden nur durch ein konkret reproduziertes
Gegenbeispiel wieder geöffnet.

## Was M16.5 verändert hat

M16.5 ist kein einzelnes Feature. Es umfasst:

- die Core-aligned 20-Stream-Topologie;
- das helle Living-/Compass-Redesign;
- die Trennung von Domain Truth, Experience und Consumer-Komposition;
- den zentralen Luvia-Kompass und die fünf Hauptziele Heute, Planen, Luvia,
  Reise und Erinnern;
- produktive Landing/Auth-, Identity-Onboarding- und First-Trip-Slices;
- Places-/Booking-/Journey-/Hotel-Recovery mit realer Gegenbelegführung;
- B0 als Human↔AI-Aktionskontrollschicht;
- den Product Reset mit fünf verbindlichen 10er-Blöcken B1–B5/P01–P50.

Das Redesign ist weiterhin nicht vollständig. Es gibt keinen globalen Design
Freeze. Eine neue helle Hülle um eine alte oder unvollständige Funktion zählt
nicht als Abschluss.

## Die sechs Ausführungsblöcke

- **B0.01–B0.10:** Human↔AI Control Plane. Öffentlich geschlossen auf `.135`;
  bleibt permanentes Gate.
- **B1/P01–P10:** produktive AI, Places, erste Agency, Booking-/Admission- und
  Kartenwahrheit. **Aktiv.**
- **B2/P11–P20:** persönliche robuste Planung. Hinter B1 gegated.
- **B3/P21–P30:** verifizierte Events, Kalender und Ticketing. Hinter einer
  rechtmäßig autorisierten Eventquelle gegated.
- **B4/P31–P40:** vollständige Orchestrierung, Sicherheit, Hardware-/Provider-
  Matrix und klassischer Intent-to-Memory-Loop.
- **B5/P41–P50:** Frontier Travel Operating System. Keine Vorabautorisierung.

## Wichtige öffentliche Zwischenstände

- `.135`: B0 Control Plane.
- `.136`: semantische Admission-/fail-closed Hotel-Foundation.
- `.138`: Chat-native Trip-Auswahl.
- `.139`: Favorite/Unfavorite/Plan/Unplan mit Preview, Bestätigung, Receipt und
  Undo.
- `.143`: Booking-Lifecycle und exakte Place-/Provider-Identität.
- `.147`: akzeptierte Places-/Hotel-Recovery-Baseline.
- `.148`: verworfen; ein Pin öffnete alle Ergebnisse.
- `.149`: verworfen; Karte wurde beim Nachladen grau.
- `.152`: öffentlich akzeptierter Kontextkarten-/Detail-Zwischenstand.
- `.153`–`.163`: schrittweise Booking-Grenze, Pin-Navigation, Ranking,
  Map-Controls, Mehrfachfilter und Preview-Geste; als Implementierungs- und
  Gegenbelegkette erhalten.
- `.167`: aktueller öffentlicher Places-/Hotel-Kartencheckpoint; automatisiert
  und im Browser geprüft, aber Mini-Info/Drag vom Nutzer noch nicht akzeptiert.

## Unmittelbarer Wiedereinstieg

Nicht M5 fortsetzen. Nicht B2 beginnen. Nicht Hotelpreise, Eventkalender,
Community oder Media-Editor als nächsten großen Slice öffnen.

Zuerst `CURRENT-MAP-MINI-INFO-SLICE.md` bearbeiten und die gemeinsame
Places-/Hotel-Karte sichtbar abschließen. Danach folgt die restliche B1-
Reihenfolge aus dem Product Reset Masterplan.
