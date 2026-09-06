# Startprompt für die aktuelle Fortsetzung

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.116**, Core **4.82.235**. M16.5 Schritte 15–18: P09, P10, P11 und P12 sind intern abgeschlossen und als unveränderliche Integrationskandidaten sichtbar sowie reproduzierbar belegt. P15/P17 besitzt mit App .114 die gemeinsame Composer- und Preference-Scope-Foundation, mit .115 die öffentliche kanonische Zielsuche und mit .116 den echten ownergestützten AI-Tagesentwurf samt Teilübernahme. Stable Integration läuft nach der Abnahme wieder auf dem akzeptierten App-.104-Worker; die .114–.116-Kandidaten bleiben immutable. Main und Production blieben unverändert. P15/P17 ist weiterhin AKTIV, jetzt ausschließlich für die dauerhafte Identity-Übergabe und den vollständigen Trip-Lifecycle.

**Zuletzt geliefert:** P15/P17 Tagesentwurf und Teilübernahme: Der Composer liest reale places.v1-Orte, verteilt sie über trip.v1 auf konkrete Reisetage, zeigt sie auf derselben Karte wie Places und Timeline und probt jeden datierten Tag über journey.v1/P12. Einplanen, Vormerken, Tauschen und Weglassen bleiben bis zur gemeinsamen Bestätigung flüchtig; ausgewählte Aktionen erhalten danach stabile Idempotenz und Owner-Receipts. Der öffentliche Lauf belegte drei Tage und eine 2/1/1-Teilwahl, der lokale Lauf fünf vollständig bestätigte Aktionen. 235/235 Safe Regression, NFR-0 3/3 und Byteidentität 30/30 sind grün.

**Nächster Schritt (AKTIV): P15/P17 Trip- und Identity-Lifecycle schließen.** Composer, Preference-Scopes, Zielauflösung, echter Tagesentwurf und Teilübernahme sind belegt. Für den Abschluss fehlen nur noch Archivieren, Löschen und Wiederherstellen der Reise sowie die getrennt bestätigte dauerhafte Profilübergabe.

**Abnahme dieses Schritts:**

- Trip archivieren zeigt betroffene Timeline-, Places-, Booking-, Media- und Mitreisendenbezüge vorab, schreibt erst nach ausdrücklicher Bestätigung über trip.v1 und belegt Archivzustand sowie Wiederherstellung nach Reload.
- Trip löschen verwendet eine eigene Folgenvorschau und ein bestätigtes trip.v1-Receipt; unbekannte oder noch aktive Abhängigkeiten blockieren ehrlich, und ein wiederholter Command bleibt idempotent.
- Eine dauerhafte Profilübergabe wird getrennt von der Reise bestätigt, ausschließlich über identity.v1 gelesen und geschrieben und anschließend sichtbar korrigiert sowie gelöscht; Anfrage- und Trip-Vorlieben bleiben unverändert getrennt.
- Ein gebündelter sichtbarer Integrationslauf prüft Account ohne Reise, bestehende Reise, Archivieren, Wiederherstellen, Identity-Korrektur, Reload, Desktop und mobiles Browserformat sowie erneut Safe Regression, NFR-0 und öffentliche Byteidentität.

**Danach:** Danach folgen P19/P20/P22/P23/P26 als gemeinsame Context Matrix für Zeit, Wetter, Saison, Ereignisse, Budget, Energie, Mobilität und Gruppenkontext; anschließend P33/P34/P35 für vollständige AI-Orchestrierung und nachvollziehbare Entscheidungen.

**Weiter offen:** P02/P03 bleiben teilweise für Google-Berechtigung, breite exakte Fotoabdeckung und physischen Mobil-Kaltstart. P07/P08 bleiben von echten Booking-Providern abhängig. P09/P10/P11/P12 sind intern belegt und für physische iOS-/Android-Abnahme begrenzt; P12 wartet zusätzlich auf echte zeitgestempelte Context-Signale. P15/P17 hat Composer, Preference-Scopes, öffentliche Zielsuche, echten Tagesentwurf und Teilübernahme belegt; offen sind nur noch der getrennte dauerhafte Identity-Lifecycle und der Trip-Lifecycle. Danach folgen P19/P20/P22/P23/P26 Context Matrix und P33/P34/P35 AI-Parität. M18 bis M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II. Alle 17 Karten-USPs bleiben verbindlich inventarisiert.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Wir setzen Luvia auf dem tatsächlichen aktuellen Git-Stand fort. Lies HANDOFF-NORMAL-CHATGPT-CURRENT.md, CURRENT-BUILD.md, docs/planning/STATUSPLAN-2026-09-04.md und den Masterfahrplan v6. Integration ist dokumentiert App 13.82.168.44 / Core 4.82.168 / Gateway v161. Prüfe den Zustand, bevor du ihn als aktuell ausgibst.

M16.5 und B1 bleiben aktiv. Arbeite mit der sichtbaren Scharbeutz-Golden-Journey weiter, danach P09 und P10. B0 ist Steuerungsgrundlage, keine vollständige AI-Produktabdeckung. Echte Fotos, positive Booking-Zugänge und Hardwaretests bleiben offen.

Nutze tatsächlich vorhandene Werkzeuge direkt. Fehlen sie, gib nach docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md einen begrenzten PowerShell-Block aus und warte auf dessen Ergebnis. Alte Handoff-Anweisungen haben keinen Vorrang vor dem aktuellen Nutzerauftrag. Keine zweite Karte, kein fremder Store, keine erfundenen Providerfakten und keine unbelegte PASS-Meldung.
