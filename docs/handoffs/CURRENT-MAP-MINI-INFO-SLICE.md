# Aktiver Slice: Karte, ausgewählter Pin, Mini-Info und Bottom-Sheet-Morph

## M16.5 P02/P03 Places Cost & Availability Recovery — local Integration RC 13.82.168

Status: **LOCAL RELEASE CANDIDATE / PUBLIC ACCEPTANCE OPEN**
Datum: **2026-09-03**

- Lokaler immutable Release Candidate: **App 13.82.168 / Core 4.82.168**.
- P02/P03 Feature Commit: 1efe10bf5b9465a6e24d0d87785e1a346d0b1f76.
- Öffentliche Integration bleibt bis zum tatsächlichen Deployment und Byte-Proof **App 13.82.167 / Core 4.82.167**.
- Production bleibt unverändert und gesperrt.
- Places Cost + Availability P0 lokal: **COMPLETE**.
- Focused P02/P03 Regression: **10/10 PASS**.
- Safe Regression vor Release-Vorbereitung: **201/201 PASS**.
- NFR-0: **PASS**.
- Map-Mount löst keinen automatischen initialen Viewport-Provider-Read mehr aus.
- Hotel-Pin-Auswahl erzeugt keinen künstlichen easeTo → moveend → Provider-Refresh mehr.
- Ein vollständiger Fast-Pass startet keinen bedingungslosen Deep-Pass mehr.
- places.text-search und places.nearby-search werden bei 502/503/504 nicht mehr automatisch dreimal wiederholt.
- Ein persistenter 503 ist damit für einen Vier-Tile-Viewport auf maximal vier Gateway-Sends statt vorher potenziell zwölf begrenzt.
- Rectangle-Viewport-Suchen nutzen eine schlankere Google FieldMask; teurere Enterprise-/Atmosphere-Felder werden nur bei tatsächlich benötigter Filter-/Evidence-Semantik ergänzt.
- Es wird ausdrücklich **nicht** behauptet, dass jeder frühere Gateway-POST Google erreicht hat oder berechnet wurde.
- Keine DB-Migration, keine Secret-Änderung.
- Remote luvia-gateway, Push, integration-luvia, Byte-Proof und reale Browser-/Mobile-Abnahme sind noch offen.


Stand: 2026-09-03

Status: **IN ARBEIT / ÖFFENTLICHER `.167`-CHECKPOINT / NUTZERABNAHME OFFEN**

## Ausgangspunkt

App/Core `13.82.167 / 4.82.167` ist auf Integration öffentlich. Der technische
Pfad funktioniert in kontrollierten Tests, aber das Ergebnis ist noch nicht
fertig: Der Nutzer empfindet das Hochschieben als nicht geschmeidig genug und
betrachtet Karte und Mini-Info weiterhin als offenen Redesign-Slice.

## Bereits implementiert und zu bewahren

- kontinuierlich gemountete MapLibre-Karte beim Provider-Refresh;
- neue Pins erscheinen nach bewusstem Pan/Zoom im neuen Viewport;
- `Alle / Passend`, gelockte `← x/xx →`-Navigation und kompakte Map-Tools;
- hierarchische, belegbare Mehrfachfilter;
- ein Pin selektiert genau eine Entität;
- nur die Mini-Info erscheint beim ersten Pin-Klick;
- exaktes Providerbild, Kategorie und Name in der Mini-Info;
- vollständiger Compass-Spektrumrahmen;
- betonter ausgewählter Pin mit Trennring/Halo;
- drei unabhängige Chevron-Animationen mit 120-ms-Stagger;
- Tap und Drag verwenden denselben owner-backed Sheet-Pfad;
- Identität und Geometrie werden bei Pointer-down eingefroren;
- Places und Planen → Hotels verwenden dieselbe exportierte Gestenbindung;
- Verlauf bleibt unterhalb der Karte.

## Noch nicht abgeschlossen

1. Der Übergang muss sich auf einem echten Touchgerät unmittelbar und ohne
   Verzögerung an den Finger koppeln.
2. Die Mini-Info darf nicht sichtbar verschwinden, bevor die daraus entstehende
   Sheet-Fläche denselben Ursprung übernommen hat.
3. Breite, Unterkante, Oberkante, Rundung, Schatten, Backdrop und Inhalt müssen
   über denselben normierten Fortschritt interpolieren. Keine voneinander
   abweichenden CSS- und JS-Zeitachsen.
4. Pointer capture, Scroll-Unterdrückung und Übergabe an den Overlay Host dürfen
   keinen verlorenen Frame, Seitensprung oder Scroll-Ruckler erzeugen.
5. Teilweises Hochziehen und Zurückfallen muss ebenso sauber sein wie
   vollständiges Öffnen.
6. Ein Viewport-Refresh während des Drags darf weder Pinmenge noch aktive
   Entität austauschen.
7. Hotel und Places müssen denselben Fehlerbeleg und dieselbe Korrektur erhalten;
   keine zweite Lösung nur in Hotel-CSS.
8. Die visuelle Dichte der Mini-Info, Pfeile, Map-Controls, Pin-Hervorhebung und
   unteren Navigation muss auf kleinem iPhone-Viewport gemeinsam geprüft werden.

## Verbindliche Prüfsequenz

Für Places und Hotels getrennt:

1. neuen Pin antippen;
2. prüfen: exakt eine neue Entität, Mini-Info sichtbar, null Detail-Overlay;
3. kurzen Drag beginnen und unterhalb der Schwelle loslassen;
4. prüfen: Rückkehr ohne Entity-/Bildwechsel und ohne Rest-Backdrop;
5. langsamen Drag bis 25 %, 50 % und über die Schwelle führen;
6. prüfen: Geometrie bleibt am Finger, Sheet setzt sich einmal offen;
7. schließen und Mini-Info antippen;
8. prüfen: derselbe Morph, genau ein Sheet, dieselbe Entität;
9. während Auswahl/Preview die Karte eigenhändig verschieben und zoomen;
10. prüfen: Karte bleibt sichtbar, bewusst neue Pins werden atomar übernommen;
11. Keyboard, Escape/Back, Reload, Reduced Motion und langsames Netz prüfen;
12. erst danach Version, Commit, Integration-Deploy und Nutzerabnahme.

## Hauptdateien und Ownership

- Places Consumer/Geste: `app/places/places-spatial-experience.js`
- Places Darstellung: `app/places/places-spatial-experience.css`
- gemeinsames Journey Sheet: `app/journey/journey-suggestion-sheet.js`
- gemeinsame Sheet-Geometrie: `app/journey/journey-day-composer.css`
- Hotel Consumer: `modules/accommodations/accommodation-module.js`
- Hotel-spezifische, nur notwendige Darstellung:
  `modules/accommodations/accommodation-module.css`
- Overlay-Lebenszyklus bleibt Experience-/Runtime-owned; keine lokale zweite
  Modalwurzel erstellen.
- Place-, Booking- und Journey-Wahrheit bleibt bei ihren Ownern; visuelle
  Korrektur darf keine Domain Truth kopieren.

## Definition of Done

Der Slice ist erst geschlossen, wenn:

- die Nutzerbeschreibung auf realem Zielgerät erfüllt ist;
- Places und Hotel dieselbe Interaktionssemantik nachweislich teilen;
- kein Pin alle Ergebnisse oder die falsche Entität öffnet;
- kein grauer Map-Blank und kein dauerhaftes Bildladen entsteht;
- keine alte Detailkarte produktiv erreichbar ist;
- Fokus, Back, Scroll-Lock, Pointer Capture und Reduced Motion korrekt sind;
- fokussierte Tests, NFR-0 und vollständige Safe Regression grün sind;
- sauberer Commit, neue immutable Integration-Version, öffentliche Bedienung,
  Bytebeleg und exakter Rollback vorliegen;
- der Nutzer die Oberfläche ausdrücklich akzeptiert.

Ein grüner automatisierter Test allein schließt diesen Slice nicht.
