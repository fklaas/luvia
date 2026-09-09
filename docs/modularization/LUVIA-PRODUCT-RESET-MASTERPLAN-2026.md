# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-09:** Integration **13.82.168.184**, Core **4.82.303**. P17/P19 Priorität: verlässliche vollständige KI-Reise. Kandidat App 13.82.168.185 / Core 4.82.304 ergänzt die fachlich korrekte Tagesabdeckung für lange Strand-/Aktivitätsaufenthalte und automatische gezielte Korrekturen nach kompletter Wiederholung.

**Zuletzt geliefert:** Integration .182: Quelle COMMIT_569e642836f25b1e02c439472c4d4ef65a6d531f, Worker 1fbf6e16-b328-44bb-9284-5413383e6b17, Archiv 92.650.447 Bytes / SHA256 8E60A0A356EBF564E35B34CA67BDEE67670EDC6221FFE15CCDC8D2C9ADBAE540 und 22/22 öffentliche Bytevergleiche. 241/241 Regression, NFR-0 3/3, Composer 133, P19 99/99 und 51/51 Transport-/Abschnittsprüfungen bestanden. Echter Providerbeleg: planning.dialogue erfolgreich in 16.203 ms; trip.compose und Reparaturen liefen real. Der letzte Audit blockierte fehlende gültige Backup-Referenzen. Ein bis zwei abweichende Zeichen in echten 113- bis 125-stelligen Provider-IDs sind als Ursache belegt. Der neue Referenzpfad ist mit 60/60 Transport-/Abschnittsprüfungen und 133 Composer-Prüfungen geprüft; sein öffentlicher Review folgt noch.

**Nächster Schritt (AKTIV): Den korrigierten KI-Reisepfad auf Integration bis zum echten Gesamtreview belegen.** Die tatsächliche Transportstrecke war bisher nicht durch die Composer-Mocks abgesichert. Jetzt muss der reale Providerlauf die lokale Korrektur bestätigen.

**Abnahme dieses Schritts:**

- Vollständige Regression und sauberes Releasearchiv.
- Integration-Function und Worker aus nachvollziehbarer Quelle veröffentlichen.
- Echter Valencia-Lauf mit belegtem Pool, Laufzeit, terminalem Providerergebnis und vollständigem Gesamtaudit.
- Reserveaktionen und Wiederaufnahme auf dem öffentlichen Kandidaten prüfen.

**Danach:** Reserveaktionen, messbare Poolqualität, vollständiger Transport und segmentierte Langreisen sind umgesetzt und kontrolliert geprüft. Nach dem echten öffentlichen Gesamtreview folgen die noch offenen P17/P19-Gates: autoritative Ferienfenster, Konfliktmoderation, P16-Ablehnungsdiagnose, Konto-/Timeline-Übernahme und physische Geräte.

**Weiter offen:** Öffentlichen Gesamtreview mit kurzen Modellreferenzen und tatsächlich akzeptierten Reserveoptionen abschließen. Sehr lange Reisen und App-Wechsel sind kontrolliert geprüft; die physische iOS-/Android-Abnahme bleibt gesondert offen. Übrige P17/P19-Abnahmen und datierte Livebelege bleiben im Plan.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
