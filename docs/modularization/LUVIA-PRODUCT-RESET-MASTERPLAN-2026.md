# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.181**, Core **4.82.300**. P17/P19 aktiv: Kandidat App 13.82.168.182 / Core 4.82.301 implementiert vollständige Workflow-Reserven, kompakte Wochenabschnitte, Wiederaufnahme und KI-Auswahl aus der Reserve. Der bisher öffentliche Stand bleibt .181, bis der Kandidat geprüft und veröffentlicht ist.

**Zuletzt geliefert:** Lokal belegt: 133 Composer-Prüfungen, 99/99 P19-Workflowprüfungen und 51/51 neue Tests über den tatsächlichen Client-/Server-Transport, 14/21/28-Tage-Reserven, gespeicherte Abschnitte, eindeutige Place-IDs über Abschnittsgrenzen, vollständigen Gesamtaudit und konkrete Edge-Fehler. Die generischen 50-/60-Element-Kürzungen waren trotz früherer Mock-Prüfungen noch wirksam und sind jetzt im Trip-Pfad beseitigt. Kein öffentlicher Erfolg von .182 wird daraus abgeleitet.

**Nächster Schritt (AKTIV): Den korrigierten KI-Reisepfad auf Integration bis zum echten Gesamtreview belegen.** Die tatsächliche Transportstrecke war bisher nicht durch die Composer-Mocks abgesichert. Jetzt muss der reale Providerlauf die lokale Korrektur bestätigen.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Nach .181 werden der erhaltene Reservepool für gezielten Tausch, Ergänzungen, spontane Vorschläge und Mehr-davon nutzbar gemacht sowie räumliche Streuung und Kategorienmix öffentlich abgenommen. Für sehr lange Reisen folgt anschließend die segmentierte KI-Komposition, damit nicht ein riesiger Prompt alle Wochen gleichzeitig tragen muss. Danach werden autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte abgeschlossen.

**Weiter offen:** Öffentlicher Integration-Nachweis des neuen Kandidaten mit realen Places, messbarer Dauer, semantischem Kategorienmix und vollständigem Audit; physischen Sperrbildschirm nicht mit Simulation gleichsetzen. Danach bleiben die übrigen P17/P19-Abnahmen zu Ferienfenstern, Konfliktmoderation, Konto-/Timeline-Übernahme und datierten Livebelegen offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
