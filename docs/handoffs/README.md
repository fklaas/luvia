# Luvia aktive Handoffs

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.122**, Core **4.82.241**. M16.5 Schritte 15–18: P15/P17 aktiv und teilweise. Die ausgewählte Chat-Gestaltung, zweistufige Kartenhierarchie und drei Reisewege laufen im echten Composer .122. Vollständige KI-Planqualität, Kontext-/Kontoabschluss und physische Mobilabnahme bleiben offen. Stable bleibt .104.

**Zuletzt geliefert:** App .122 liefert die vom Nutzer ausgewählte Chat-Gestaltung im echten Composer: Cremefläche, drei sichtbare Reisearten, geografische Bühne und untere Auswahlfläche. Globus → Kontinent → Land → Region ist lokal bedienbar. Der erste Klick wählt aus und zeigt eine bewegte Kontur mit neun Compass-Farbstopps; der zweite öffnet die Ebene. Welt/Europa/Deutschland/Schleswig-Holstein und der Anschluss an die echte Rom-Zielsuche sind öffentlich sichtbar geprüft. Die Übersicht nutzt 251 landweise ladbare Regionspakete; unbenannte Quellregionen werden nicht erfunden. Die Ortsstufe verwendet weiterhin die kanonische Zielsuche, keine flächendeckende neue Städtegeometrie. Reisezeit, Wünsche, Gestaltung und Bestätigung bleiben auf derselben Bühne; echte Vorschläge nutzen die vorhandene gemeinsame Places-Karte. Nur anlegen erzeugt im lokalen Browser null zusätzliche Orts-/Timeline-Aktionen. Mit Vorschlägen beginnt im Verhaltenstest ohne Auswahl und bestätigt nur ausdrücklich gewählte Owner-Aktionen. Der öffentliche 390-Pixel-Globus dreht bei ScrollTop 0 ohne Seitenbewegung oder horizontalen Überlauf. Reduced Motion behält die Kontur ohne Gradientanimation. 38 Geometrie-/Gesten-/Datenprüfungen, 53 Composer-Verhaltensprüfungen, 238/238 Regression und 43/43 öffentliche Dateihashes sind grün. Vollständige KI-Plangüte, echte Kontoübernahme und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): Den vollständigen KI-Reiseentwurf im ausgewählten Composer belastbar fertigstellen.** Die ausgewählte Oberfläche und die grundlegende Kartenhierarchie sind jetzt ausgeliefert. Der nächste Abschluss muss echte Planqualität über den ganzen Zeitraum und die sichere Übernahme belegen; mehr Animationen allein schließen P15/P17 nicht.

**Abnahme dieses Schritts:**

- Realen erfolgreichen Modelllauf belegen. Der zuletzt gemessene HTTP 429 bleibt bis zum positiven Gegenbeleg offen; fehlende Modellantwort darf keinen vollständigen KI-Erfolg ergeben.
- Alle Reisetage mit nachvollziehbarem Rhythmus, belegten Ernährungs-/Zugangsrestriktionen, Interessenvielfalt, realistischen Wegen/Puffern, Pausen und Budgetrahmen prüfen. Fünf Orte über acht Tage sind kein vollständiger Plan.
- Saison, Feiertage, Veranstaltungen und Wetter mit Quellen- und Zeitkontext einbeziehen; langfristige Saisonerwartung und kurzfristige Vorhersage getrennt behandeln.
- Den Entwurf auf derselben Kartenbühne Tag für Tag erlebbar präsentieren, Alternativen und Änderungen erhalten und nur die ausdrücklich bestätigte Auswahl idempotent über Trip/Places/Journey übernehmen. Dauerhafte Identity-Änderungen separat bestätigen.
- Wiederaufnahme, Moduswechsel, kanonische Zielauswahl, sichere Kontoübernahme und physische iOS-/Android-Gesten prüfen. Globale Städtestufen und weitere visuelle Ausarbeitung bleiben expliziter Restumfang; P15/P17 erst nach vollständigen Produktgates abschließen.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, weitere interaktive Ausarbeitung und globale Städtestufen, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

## Nachweis der P09-Lieferung .44

Integration läuft auf **13.82.168.44**, Quelle **bc642a06a23e82165648d6a43738430f83b145d6**, Worker **093456be-4963-4578-8468-390c3f80ec04**. **213/213 Safe Regression**, **30/30 öffentliche Dateihashes**. Gateway v161 und Booking Resolver 2.8.0 / Function v18 bleiben unverändert; kein Main-Frontend-Deploy.

Langes Drücken aktiviert bei geplanten Places einen sichtbaren Verschiebemodus. Ziehen in einen anderen Zeitabschnitt öffnet die Prüfung; Pfeile und „Tag und Uhrzeit“ bieten eine alternative Bedienung. Tag, Uhrzeit, Dauer und konkrete Überschneidungen erscheinen vor der Bestätigung. Speichern erfolgt über journey.v1 → places.v1 mit Prüfung des ursprünglichen Datenstands. Eine echte Buchung führt weiter über Booking. Die letzte Zeitänderung ist direkt am Eintrag auch nach Reload zurücknehmbar.

Sichtbarer Browsernachweis: Grande Beach Café wurde vom 12.06.2027, 15:00 Uhr / 90 Minuten auf den 13.06.2027, 15:15 Uhr / 105 Minuten geändert. Nach Reload blieben Termin und Rücknahme erhalten. Danach wurden alle sechs ursprünglichen Timeline-Zeiten und Dauern wiederhergestellt. Das ist keine unveränderte Datenbank: Aktualisierungszeit und Recovery-Metadaten des geprüften Datensatzes wurden geschrieben. Der Touch-Test lief sichtbar in Edge mit Chromium-Toucheingaben bei 477 × 900; kein physischer iPhone-Test.

P09 und P10 bleiben **TEILWEISE**. Die aktuelle Reihenfolge und der nächste konkrete Abschlussnachweis stehen im gemeinsamen Statusabschnitt am Dokumentanfang.

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../../HANDOFF-CODEX-CURRENT.md)
- [Ergänzender Nachweis und Status](../../HANDOFF-NORMAL-CHATGPT-CURRENT.md)

Integration App 13.82.168.44 / Core 4.82.168 / Gateway v161 ACTIVE. B0-Steuerungsgrundlage geschlossen, B1 aktiv. P04/P05 begrenzt öffentlich belegt; aktuelle komplette Golden Journey und P09/P10 offen. Fotos, positive Buchungspartner und physische Hardware bleiben benannte Lücken. Main/Production unverändert.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Zuerst den zum tatsächlichen Werkzeugzugriff passenden Handoff lesen. STARTPROMPT-NORMAL-CHATGPT.md ist kopierbar. CHATGPT-TERMINAL-PROTOCOL.md gilt nur für Sitzungen ohne eigene Werkzeuge. Quellen und Master-Pakete stehen unter docs/planning.
