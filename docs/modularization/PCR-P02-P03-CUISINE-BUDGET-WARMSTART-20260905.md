# PCR P02/P03 – Landesküchen-Budget und Karten-Warmstart

**Datum:** 2026-09-05

**Status:** technisch und auf Integration geliefert; P02/P03 bleiben bis zur vollständigen UI-/AI-/Foto-/Mobilmatrix teilweise umgesetzt.

**Umgebung:** ausschließlich Integration; Main und Production unverändert.

## Problem und Ursache

Der sichtbare Durchlauf aller 19 Landesküchen zeigte nach mehreren Wechseln zunächst korrekte Ergebnisse und anschließend unzuverlässige Null- oder Fehlerzustände. Eine präzise Geoapify-Landesküchensuche reservierte bis zu drei Such-Einheiten. Ein seltener Nullfall startete zusätzlich einen 500-Zeilen-Auffanglauf mit 25 Einheiten. Nach jedem Filterwechsel wurden außerdem der ausgewählte Ort und drei weitere Detailbilder vorab geladen. Damit konnte eine normale Filtersitzung das gemeinsame 60-Einheiten-Minutenlimit verbrauchen, obwohl die Nutzerin oder der Nutzer keine Details geöffnet hatte.

Ernährungs- und Profil-Evidenz lief teilweise über eine explizite Liste mit deaktivierten oder nicht budgetfreigegebenen Anbietern. Ein ehrlicher Nullfall konnte dadurch als technische Nichtverfügbarkeit erscheinen. Bei einem Stays-Warmstart waren 49 Pins bereits sichtbar, während der umgebende Bereich seinen technischen Ladezustand nicht beendete.

## Gelieferte Korrektur

- Präzise Landesküchen suchen höchstens 20 Ergebnisse und reservieren damit eine Such-Einheit. Breite Kategorien behalten ihre 50er-Seite.
- Der seltene gemeinsame Auffanglauf ist auf 200 Zeilen und zehn Einheiten begrenzt und wird pro Reiseziel, Filter und Sprache 30 Minuten geteilt.
- Sämtliche sichtbaren Filter sowie die nachgelagerte Profil-Evidenz verwenden dieselbe serverseitig freigegebene `auto`-Kaskade. Nicht freigegebene Anbieter können weder Kosten verursachen noch einen ehrlichen Nullfall in einen technischen Fehler verwandeln.
- Filterwechsel starten keine Detail- oder Foto-Fächerung mehr. Das exakte Detail und sein reales Bild werden erst für den tatsächlich gewählten Pin geladen. Ein wiederhergestellter Kartenstand wärmt höchstens die exakt ausgewählte Provider-Identität.
- Die harte Ernährungsprüfung bleibt erhalten: Fehlende Evidenz genügt nicht, und fleischzentrierte Orte werden ohne dedizierten vegetarischen oder veganen Beleg nicht als passend markiert.
- Ein fertig aktualisierter Warmstart schreibt `ready` und `aria-busy=false` auch dann zurück, wenn die MapLibre-Instanz ohne vollständigen Neuaufbau weiterverwendet wird.
- Lokale Testausgaben und temporäre Diagnosequellen sind aus der visuellen Bestandsaufnahme ausgeschlossen. Cloudflare wurde aus dem sauberen Git-Archiv veröffentlicht; fremde unversionierte Dateien gelangten nicht in diesen Release.

## Sichtbare Integrationsabnahme

Der erste vollständige Lauf über alle 19 sichtbaren Landesküchen reproduzierte den Budgetabfall. Im korrigierten `.78`-Lauf endeten Vietnamesisch und Koreanisch sauber mit `0/0`, statt einen nicht verfügbaren Kartenstand auszulösen. Nach derselben Folge lieferten Türkisch zwei, Italienisch elf, Asiatisch einen streng belegten und Chinesisch zwei koordinatenverifizierte Pins. Kein Schritt zeigte „Nachladen fehlgeschlagen“.

Der abschließende `.79`-Lauf bestätigte:

- Stays: 49 Unterkünfte am Reiseziel, `data-map-state=ready`, `data-state=ready`, `aria-busy=false`, keine sichtbare Fehlermeldung. Pins und Kurzinfo stehen innerhalb der Karte. Die Basiskarte erschien im beobachteten Desktoplauf später als die bereits bedienbaren Pins; die physische Mobilzeit bleibt deshalb offen.
- Places: Vietnamesisch endet als belegter Nullfall, der direkte Wechsel zu Türkisch liefert zwei Pins – Haffkrug Döner und Maxi-Döner – bei beendetem Ladezustand und ohne Alert.
- Passend: Das vegetarische Profil erzeugt unter der aktuell verfügbaren HERE-Evidenz keinen positiven Pin. Erdmann's Kleines Steakhaus wird nicht aufgenommen. Die Oberfläche erklärt: „Für diese Auswahl ist die Passung zu euren Vorlieben noch nicht belegt. ‚Alle‘ zeigt auch ungeprüfte Orte.“ Damit ist der gefährliche Falschpositivfall geschlossen; eine breite nützliche positive Passend-Menge bleibt ein offener P02/P03-Nachweis.

## Automatisierte und unveränderliche Belege

- App: `13.82.168.79`
- Core: `4.82.201`
- Runtime-Commit: `519f3e7d1141c5cf9f12ceffcfc17e6bbba1adda`
- Integration-Worker: `c572b36d-f8c7-4193-8022-b1a030101f25`, 100 Prozent Traffic
- Unveränderliche URL: `https://c572b36d-integration-luvia.njwnrvwbv5.workers.dev`
- Gateway: `v196 ACTIVE`, Software `4.64.20`, Health-Build `13.82.168.79`, Core `4.82.201`
- Safe Regression: `224/224 PASS`; darin NFR-0 `3/3 PASS`
- Filtervertrag: 82 Kategorie-/Untertypabbildungen, Faktenfilter, Kombination, Reset, Distanz und exakte Medienidentität `PASS`
- Öffentliche Byte-Gleichheit: `30/30 MATCH` zwischen sauberem Archiv, stabiler Integration und unveränderlicher Worker-Adresse
- Archiv: `C:\Users\fabia\Documents\GitHub\luvia-release-archives\luvia-integration-13.82.168.79-519f3e7d1141.zip`
- Archivgröße: `88.730.954` Bytes
- Archiv-SHA-256: `CA46C8E159F876EEB62DD9A41387A76E13E7B9F82007061E1AB55FA4C3F2D17A`
- Maschinenlesbarer Byte-Beleg: `C:\Users\fabia\Documents\ChatGPT\Luvia\outputs\public-byte-proof79-v196.json`
- Regression: `C:\Users\fabia\Documents\GitHub\luvia-integration\outputs\p02-p03-cuisine-budget-release79-regression.log`

## Rückfall und verbleibende Grenze

Unmittelbarer Frontend-Rückfall ist `.78` auf Worker `9fa9051a-dee1-4189-921f-d43638663c35`; unmittelbarer Gateway-Rückfall ist `v195 / 4.64.19`. Der davor belegte Stand `.77` bleibt auf Worker `e47b5593-a586-4697-9d10-e6ca16e04089` mit Gateway `v194 / 4.64.18` erhalten. Main steht weiterhin auf `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`.

Offen bleiben positive Profil-Evidenz in ausreichender Breite, die vollständige sichtbare Fakten- und Landesküchenmatrix über Oberfläche und AI Chat, echte ortsidentische Bilder für einen breiten Place-/Stays-Satz sowie Kaltstart-, Warmstart-, Reisewechsel-, Zoom-, Zieh- und Pin-Zeiten auf einem physischen iPhone und Android-Gerät.
