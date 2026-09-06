# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.121**, Core **4.82.240**. M16.5 Schritte 15–18: P15/P17 aktiv und teilweise. Der konkrete Globus-Scrollfehler ist in Kandidat .121 öffentlich geprüft behoben. Die neue Kartenhierarchie, durchgehende räumliche Gestaltung und drei fachlichen Reisearten sind verbindlich dokumentiert und als Konzept durchspielbar, noch nicht vollständig implementiert. Vollständiger KI-Plan, Kontext-/Kontoabschluss und physische Mobilabnahme bleiben offen. Stable bleibt .104.

**Zuletzt geliefert:** App .121 korrigiert die Globus-Gestenfläche: Canvas und Ortsbeschriftungen teilen Ziehen/Pinch, Trackpadbewegungen drehen die Welt und scrollen den Composer nicht. Ein Marker-Drag wählt keinen Ort, Antippen öffnet weiterhin die bestehende Zielsuche. Im angemeldeten öffentlichen Browser bei 390 Pixeln blieb ScrollTop während Trackpadrotation bei 0 und beim Marker-Drag bei 100; außerhalb änderte Scrollen den Wert von 0 auf 100. Toskana wurde danach per Antippen an die Ortsuche übergeben. 33/33 Geometrie-/Gestenprüfungen, 50 Composer-Prüfungen, 238/238 Regression, NFR-0 3/3 und 38/38 öffentliche Byteidentität sind grün. Physische Touchabnahme bleibt offen. Die neue Produktvorgabe ist im kanonischen Konzept und einer durchspielbaren Bewegungsstudie festgehalten: Welt → Kontinent → Land → Region → Ort, danach dieselbe Bühne für Reisezeit, Wünsche und Tage; drei unterschiedliche Ergebnisse Nur anlegen / Mit Vorschlägen / Luvia plant. Diese Hierarchie und vollständige KI-Planung sind noch keine ausgelieferten Laufzeitfunktionen.

**Nächster Schritt (AKTIV): Kartenhierarchie und drei fachliche Reisearten im gemeinsamen Composer umsetzen.** Der Nutzer bestätigt das Weltprinzip, lehnt aber die Formularfortsetzung und die geringe Planvielfalt ab. Navigationsstufen und fachliche Ergebnisse müssen zusammenhängend auf dem kanonischen Auftrag aufbauen.

**Abnahme dieses Schritts:**

- Globus, Kontinent, Land, Region und Ort mit angemessener belegbarer Geometrie, Rückweg und Wiederaufnahme umsetzen. Gebietsauswahl bleibt Suchabsicht bis zur kanonischen Destination-Bestätigung; direkte Suche und Regionen als Ziele bleiben möglich. Kamerabewegung löst keine Provideranfragen aus.
- Die drei Produktwege im bestehenden Trip-Auftrag unterscheiden: Nur anlegen erzeugt null Places-/Timeline-/Vormerkungsaktionen; Mit Vorschlägen übernimmt ausschließlich explizite Auswahl; Luvia plant liefert einen getrennt prüfbaren strukturierten Gesamtentwurf. Alte guided/quick/ai-Einstiegslabels reichen nicht als Beleg.
- Reisezeit, Wünsche, Mitreisende, Tempo und Budget auf derselben räumlichen Bühne fortführen. Präzise Werte bleiben zugänglich, Bewegung unterstützt Orientierung, Reduced Motion sowie Tastatur-/Antippbedienung bleiben vollständig.
- KI-Vollständigkeit an gesamten Reisetagen, belegten Restriktionen, Interessenvielfalt, Wegen/Puffern, Pausen, Zeit-/Budgetrahmen und Quellenkontext prüfen. Der frühere Lauf fünf Orte/acht Tage und die Bewegungsstudie gelten nicht als vollständiger Plan oder positiver realer KI-Nachweis.
- Reale Modellantwort und bestätigte idempotente Übernahme über Trip/Places/Journey getrennt positiv belegen; Identity-Änderungen bleiben eigenständig bestätigt. Fehlende Modellverfügbarkeit oder Fakten dürfen keinen vollständigen KI-Erfolg ergeben.
- Rückkehr, Wiederaufnahme, mobile Gesten auf physischem iOS/Android, öffentliches Verhalten und Releasegates am tatsächlich ausgegebenen Versionslink prüfen. P15/P17 bleiben bis zum vollständigen Abschluss ihrer Produktgates teilweise.

**Danach:** Danach die offenen P15/P17-Produktgates und erforderlichen Kontext-/Intelligence-Abhängigkeiten schließen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
