# Startprompt für den normalen ChatGPT-Chat

Den gesamten folgenden Text als erste Nachricht in den bisherigen normalen
ChatGPT-Chat kopieren:

---

Wir setzen die Entwicklung von Luvia fort. Dein letzter verlässlicher
Projektstand war M5 und ist inzwischen stark veraltet. Du darfst nicht beim
alten M5-Fahrplan weiterarbeiten und nicht aus deinem alten Chatgedächtnis auf
den heutigen Stand schließen.

Der kanonische Arbeitsort ist:
`C:\Users\fabia\Documents\GitHub\luvia-integration`

Der Nutzer führt alle PowerShell-Befehle selbst aus. Du hast keinen direkten
Terminal-, Datei-, Browser-, Cloudflare- oder Supabase-Zugriff. Du gibst immer
nur den nächsten begrenzten PowerShell-Block aus, wartest auf die vollständig
zurückkopierte Ausgabe und behauptest vorher kein Ergebnis.

Jeder Befehlsblock muss außen exakt mit diesen sichtbaren Zeilen markiert sein:

`TERMINAL — AB HIER KOPIEREN`

und

`TERMINAL — BIS HIER KOPIEREN`

Im PowerShell-Code selbst müssen die Befehle die beiden Ausgabemarker drucken:

`===== ERGEBNIS AB HIER KOPIEREN =====`

und

`===== ERGEBNIS BIS HIER KOPIEREN =====`

Der Nutzer kopiert die komplette Ausgabe zwischen diesen beiden inneren
Markern zurück. Gib nicht mehrere voneinander abhängige Terminalblöcke im
Voraus. Erkläre nach jeder Ausgabe kurz die konkrete Evidenz und gib dann nur
den nächsten Schritt.

Aktueller bekannter Stand vor dem Bootstrap:

- Branch `integration`;
- Runtime-Commit von App 13.82.168:
  `568d6e4c0796f87d3af377ce9e480386aea6892f`;
- öffentliche Integration: App/Core `13.82.168 / 4.82.168`, Worker
  `b2ab956a-729f-402a-8d3d-56778614d61a` bei 100 %;
- Produktion unverändert: App/Core `13.82.49 / 4.82.49`, Worker
  `cc7d58fc-a5f8-4d5c-a63f-95782e34eabe` bei 100 %;
- `.167`: 201/201 Safe Regression, NFR-0 3/3, 10/10 Bytebeleg;
- M0–M16 sind geschlossen;
- M16.5 Redesign und Product Reset laufen;
- B0 Human↔AI Control Plane ist öffentlich geschlossen;
- fünf 10er-Blöcke B1–B5/P01–P50 sind bindend;
- B1 ist aktiv, B2–B5 sind gegated;
- `.167` ist ein öffentlicher technischer Karten-Checkpoint, aber keine
  Nutzerabnahme und kein Design Freeze.

Die unmittelbar offene Arbeit ist nicht ein neues Feature. Karte und Mini-Info
sind noch nicht fertig. Das Bottom Sheet muss beim Hochziehen noch
geschmeidiger direkt am Finger hängen und aus der Mini-Info als eine einzige
Fläche zur vollen Kartenbreite, zum Kartenboden und nach oben wachsen. Ein Pin
öffnet zuerst nur genau eine Mini-Info; Tap oder Drag darauf öffnet genau ein
Sheet für dieselbe Provider-Entität. Places und Planen → Hotels müssen exakt
dasselbe System verwenden. Drei kleine Chevron-Linien schweben unabhängig mit
120-ms-Abständen von oben nach unten. Karte, Pins und Bilder dürfen beim
Viewport-Refresh nicht verschwinden oder die Entität wechseln.

Du arbeitest owner-first und evidence-first wie bisher: keine parallelen
Stores/Cores/Maps/Sheets, keine erfundene Provider- oder Preiswahrheit, keine
Mutation ohne passende Owner-Grenze, kein Abschluss ohne sichtbare
Nutzerabnahme. Eine grüne Automation widerlegt kein reales UI-Gegenbeispiel.

Du musst zuerst den Bootstrap-Befehl aus
`docs\handoffs\CHATGPT-TERMINAL-PROTOCOL.md` ausgeben. Seine Ausgabe liefert dir
`HANDOFF-NORMAL-CHATGPT-CURRENT.md` und den vollständigen aktiven Karten-Slice.
Danach liest du über weitere begrenzte Terminalblöcke mindestens `AGENTS.md`,
die dort vorgeschriebenen Architekturdateien, `CURRENT-BUILD.md`, den Product
Reset Masterplan und die tatsächlich betroffenen Quell-/Testdateien, bevor du
eine Änderung formulierst.

Wichtig:

- vorhandene unversionierte Nutzerdateien bewahren;
- keine Secrets oder `.env`-Inhalte ausgeben;
- kein `git reset --hard`, kein Force Push, keine breite Löschung;
- nicht mit `git add .` fremde Dateien aufnehmen;
- ohne ausdrücklichen Auftrag kein Deploy;
- bei Integration immer `--name integration-luvia` angeben;
- niemals `--name luvia` verwenden, außer ich beauftrage ausdrücklich ein
  Produktionsdeployment;
- Main, Produktion, DB, RLS, Edge und Secrets bleiben bis zu einer gesonderten
  Freigabe unverändert;
- nach jedem Slice Fahrplan, Current Build, Step-17-Evidenz, Recovery Ledger und
  diese Übergabe aktualisieren.

Beginne jetzt ausschließlich mit dem einen read-only Bootstrap-Terminalblock.

---
