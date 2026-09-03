# Luvia — aktuelle Übergabe an den normalen ChatGPT-Chat

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

Status: **VERBINDLICHE TERMINAL-ÜBERGABE / ALTER CHATSTAND M5 IST VERALTET /
FORTSETZUNG BEI M16.5 B1 KARTE UND MINI-INFO / MAIN UND PRODUKTION GESPERRT**

## 1. Zweck dieser Übergabe

Diese Datei ist der kurze Einstieg für die Fortsetzung in einem normalen
ChatGPT-Chat ohne Codex-Zugriff. Der Nutzer führt jeden Befehl selbst in
PowerShell aus und kopiert die klar markierten Ergebnisse zurück in den Chat.
ChatGPT darf nie behaupten, einen Befehl, Test, Commit oder Deploy selbst
ausgeführt zu haben.

Der bisherige normale ChatGPT-Chat kennt als letzten Stand nur M5. Er darf an
dieser Stelle nicht weiterarbeiten. Vor jeder neuen Änderung muss er die
Kontextbrücke und den aktuellen offenen Slice aus `docs/handoffs/` übernehmen.

## 2. Kanonischer Arbeitsort

- Repository: `C:\Users\fabia\Documents\GitHub\luvia-integration`
- Branch: `integration`
- Runtime-Commit von App 13.82.167:
  `568d6e4c0796f87d3af377ce9e480386aea6892f`
- Upstream: `origin/integration`; die lokale Branch kann mehrere noch nicht
  gepushte Commits enthalten. Der aktuelle Abstand wird zu Beginn jeder
  Sitzung gemessen und nie geraten.
- Historische Arbeitsordner, ZIPs und Deploy-Exports unter
  `C:\Users\fabia\Documents\ChatGPT\Luvia` sind keine Entwicklungsbasis.

Bekannte bereits vorhandene unversionierte Dateien, die nicht gelöscht,
überschrieben oder versehentlich committed werden dürfen:

- `app/luvia-runtime-13.82.120.bundle.js`
- `app/luvia-runtime-postcontext-13.82.120.bundle.js`
- `app/luvia-runtime-precontext-13.82.120.bundle.js`
- `assets/public-landing/reel-cafe-moment.mp4`
- `assets/public-landing/reel-city-tram.mp4`
- `assets/public-landing/reel-coast-cycle.mp4`
- `supabase/.temp/cli-latest`

## 3. Verifizierter Laufzeitstand

| Ziel | App/Core | Worker-Version | Traffic | Bedeutung |
|---|---|---|---:|---|
| Integration | `13.82.167 / 4.82.167` | `b2ab956a-729f-402a-8d3d-56778614d61a` | 100 % | öffentlicher technischer Karten-Checkpoint; Nutzerabnahme offen |
| Produktion | `13.82.49 / 4.82.49` | `cc7d58fc-a5f8-4d5c-a63f-95782e34eabe` | 100 % | unverändert und gesperrt |

Integration-URL:
`https://integration-luvia.njwnrvwbv5.workers.dev/?screen=hotels&accept=13.82.167&qa=public-hotel-map-parity-final`

Für `.167` belegt:

- 201/201 kontrollierte Safe Regression;
- NFR-0 3/3;
- 330 semantische Aktionen;
- 246 öffentliche Owner-Bindungen;
- 24/24 typisierte Runtime-Aktionen;
- 124 geschützte Zustandsänderungen;
- 939 auditierte aktive `data-*`-Marker;
- 2.733 generierte Failure-Evals;
- öffentlicher 390×844-Pointer-/Drag-Lauf für Places und Hotels;
- zehn von zehn releasekritische Dateien byteidentisch zwischen sauberem
  Git-Archiv und öffentlicher Integration.

Diese Evidenz ist kein Design Freeze und keine Nutzerabnahme.

## 4. Unmittelbar aktive Arbeit

Die Arbeit wird genau bei der gemeinsamen Places-/Hotel-Karte fortgesetzt.
Karte und Mini-Info sind noch nicht fertig. Der Nutzer beanstandet insbesondere,
dass das Hochschieben mit dem Finger noch geschmeidiger und physisch
zusammenhängender werden muss.

Bindendes Verhalten:

1. Ein Pin-Klick wählt genau eine Provider-Entität und öffnet nur die kompakte
   Mini-Info, noch kein großes Sheet.
2. Die Mini-Info zeigt das exakte Providerbild, Kategorie und Namen in einem
   umlaufenden Luvia-Compass-Farbspektrum.
3. Der ausgewählte Pin ist größer und eindeutig hervorgehoben, ohne die Karte
   zu verdecken.
4. Drei kleine linienförmige Chevrons schweben unabhängig oberhalb der
   Mini-Info: oben zuerst, dann nach 120 ms Mitte, dann nach weiteren 120 ms
   unten. Beim Drag pausiert die Dekoration.
5. Tap auf die Mini-Info oder Drag nach oben öffnet exakt dasselbe Owner-backed
   Bottom Sheet für exakt dieselbe Entität.
6. Beim Drag muss die Oberfläche aus der Mini-Info herauswachsen: links/rechts
   bis zur Kartenbreite, nach unten bis zum Kartenboden und nach oben synchron
   mit dem Finger. Es darf keinen Sprung, keinen versteckten zweiten Sheet und
   keinen Identitätswechsel durch paralleles Nachladen geben.
7. Unterhalb der Öffnungsschwelle fällt das Sheet weich in die Mini-Info zurück;
   oberhalb beziehungsweise bei ausreichender Geschwindigkeit setzt es sich
   offen.
8. Die Karte bleibt während Pan/Zoom/Provider-Refresh sichtbar. Alte gültige
   Pins bleiben bis zur atomaren Ablösung stehen; Fehler werden nicht als
   falsches `0 Ergebnisse` dargestellt.
9. Dieselbe Implementierung gilt bis ins Detail für Places und
   `Planen → Hotels`. Keine kopierte zweite Gestenlogik und kein altes
   Place-Detail-System dürfen produktiv erreichbar sein.
10. Die bestehenden kompakten Map-Controls, `Alle / Passend`, gelockte
    `← x/xx →`-Navigation, hierarchische Mehrfachfilter und der Verlauf unter
    der Karte bleiben erhalten, sofern ein realer Test keine Regression belegt.

Aktuelle Hauptdateien:

- `app/places/places-spatial-experience.js`
- `app/places/places-spatial-experience.css`
- `app/journey/journey-suggestion-sheet.js`
- `app/journey/journey-day-composer.css`
- `modules/accommodations/accommodation-module.js`
- `modules/accommodations/accommodation-module.css`

## 5. Nächste Ausführungsreihenfolge

1. Öffentliche `.167`-Interaktion auf dem Zielgerät reproduzieren und konkrete
   Restfehler als beobachtete Zustände festhalten.
2. Den kleinsten gemeinsamen Ursachen-Slice in der vorhandenen Places-/Journey-
   Experience-Struktur ändern. Keine Parallelarchitektur erstellen.
3. Pin → Mini-Info → partieller Drag → Abbruch → vollständiger Drag → Tap für
   Places und Hotels prüfen.
4. Desktop, 390×844, echten Touch, Keyboard, Back/Reload, Reduced Motion,
   langsames Netz und Viewport-Refresh prüfen.
5. Erst nach grüner Regression eine neue App/Core-Version und saubere Runtime-
   Bundles erzeugen.
6. Committen; nur `integration-luvia` veröffentlichen; Stable/Immutable-/Archiv-
   Bytegleichheit und exakten Rollback auf `.167` beweisen.
7. Nutzer die öffentliche URL selbst bedienen lassen. Ohne ausdrückliche
   Zustimmung bleibt der Karten-Slice offen.
8. Danach B1 fortsetzen: echter Restaurant-Route-Beleg, echter
   Activity/Culture-Route-Beleg, P09 Journey-Kommandos, P10 Erklärbarkeit,
   restliche Step-17-Zeilen und G2/G3.
9. Erst dann B2 P11–P20; B3–B5 bleiben hinter ihren dokumentierten Gates.

## 6. Provider- und Produktwahrheit

- Google Places ist die primäre Place-Quelle.
- Foursquare ist nur Fallback und hatte zuletzt keine Credits.
- Duffel Stays wurde beantragt; Zugriff und Token sind nicht bestätigt.
- Booking.com Affiliate wurde beantragt; dies ist nicht Booking.com Demand API.
- Kein Hotel-Livepreisprovider ist als aktiv belegt.
- Affiliate-Links sind Handoffs, keine Livepreisquelle.
- Hotelpreisvergleich ist erst ab zwei vergleichbaren, aktuellen, echten
  Providerantworten erlaubt.
- Restaurant-/Ticket-/Hotelaktionen müssen exakte Entitätsidentität beweisen;
  ein sicher aussehender Link reicht nicht.

## 7. Sicherheits- und Releasegrenzen

- Keine Secrets, Tokens, Passwörter, Steuerdaten oder Partnerzugänge in Chat,
  Repository, Patch, Screenshot oder Terminalausgabe kopieren.
- Eine in einem früheren Chat versehentlich gepostete Zeichenfolge, die ein
  Zugangswert sein könnte, wird nicht in diese Übergabe übernommen und sollte
  beim betroffenen Dienst vorsorglich ersetzt werden.
- Keine `.env`-Dateien oder vollständigen Umgebungsvariablen ausgeben.
- Keine DB-, RLS-, Edge-, Secret-, Main- oder Produktionsänderung ohne
  ausdrückliche, gesonderte Autorisierung.
- Jeder Cloudflare-Befehl nennt den Worker explizit. Integration ist
  `--name integration-luvia`. Ein Befehl mit `--name luvia` ist ohne
  ausdrücklichen Produktionsauftrag verboten.
- Kein `git reset --hard`, kein Force Push und keine breite rekursive Löschung.
- Keine PASS-, Commit-, Push-, Deploy- oder Produktionsbehauptung ohne vom
  Nutzer zurückkopierte Terminal- beziehungsweise Browser-Evidenz.

## 8. Übergabemappe und Autorität

Zuerst lesen:

1. `docs/handoffs/STARTPROMPT-NORMAL-CHATGPT.md`
2. `docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md`
3. `docs/handoffs/M5-TO-CURRENT-CONTEXT-BRIDGE.md`
4. `docs/handoffs/CURRENT-MAP-MINI-INFO-SLICE.md`
5. `CURRENT-BUILD.md`
6. `docs/modularization/LUVIA-PRODUCT-RESET-MASTERPLAN-2026.md`
7. `docs/modularization/M16.5-BLOCK0-TO-BLOCK5-MASTER-HANDOUT.md`

Der normale ChatGPT-Chat beginnt mit dem Startprompt und gibt danach genau den
Bootstrap-Befehl aus dem Terminalprotokoll aus. Erst die zurückkopierte Ausgabe
bestätigt den tatsächlichen Arbeitszustand.
