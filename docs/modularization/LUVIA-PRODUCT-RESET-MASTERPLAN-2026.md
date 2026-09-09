# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.193**, Core **4.82.312**. P17/P19: Kandidat App 13.82.168.194 / Core 4.82.313 repariert veraltete Buchungs- und Unsicherheitsreferenzen nach Tagesaustausch und verhindert unsichtbare automatische Dashboard-Briefings.

**Zuletzt geliefert:** Integration .193 ist mit 22/22 identischen öffentlichen Dateien belegt. Der echte Wiederanlauf hält 100 Places und sieben Tage, scheitert jedoch konkret an einer nach Tagesreparatur veralteten Hafen-Buchungsreferenz (Workflow 543c19dc-a559-444b-a83e-94b2666f77b1, zwei Modellaufrufe, 20.621 ms Modellzeit). .194 baut abhängige Planungsangaben einmal anhand der aktuellen Route neu auf, ohne andere Tage umzuschreiben. 145/145 Transportprüfungen und fünf Verhaltenstests für ausschließlich sichtbare automatische Dashboard-Aufrufe bestehen. Ein echter positiver Gesamtaudit steht weiter aus.

**Nächster Schritt (AKTIV): Den korrigierten öffentlichen KI-Reisepfad inklusive Reserveaktionen inhaltlich abnehmen.** Die konkrete veraltete Hafenreferenz muss im bestehenden öffentlichen Entwurf behoben werden. Keine weitere unbegründete Vollgenerierung oder bezahlte Testschleife.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Öffentlichen Gesamtaudit und eine echte Reservewahl mit Reload auf .194 abschließen. Weitere P17/P19-Gates und physische Geräte bleiben offen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
