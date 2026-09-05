# Aktueller Product Reset Arbeitsplan

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-05:** Integration **13.82.168.89**, Core **4.82.211**. M16.5 Schritte 15–18 aktiv. P02/P03 bleibt der aktive Abschlussblock; der positive Passend-Pfad steht, der sichtbare Mengen-/Radiusvertrag wird gerade geschlossen. Apple ist geparkt.

**Zuletzt geliefert:** App .88, Gateway v206 und der kostenlose OSM-Evidenzpfad liefern öffentlich 25 vegetarisch oder vegan belegte Treffer ohne Steakhouse-Falschpositiv. Der sichtbare Test zeigte Alle 50, Passend 25, Passt-Pins, Zoom und Pinwechsel. Als letzte Wahrheitslücke wurde erkannt, dass die Evidenzsuche bis 8 km reichen konnte, während die Seite 3 km auswies. Kandidat .89 verwendet nun für beide Modi denselben `geography.searchRadiusMeters`-Wert. 229/229 Safe Regression und NFR-0 3/3 sind für den korrigierten Kandidaten grün.

**Nächster Schritt (AKTIV): App .89 veröffentlichen und den identischen Alle-/Passend-Radius sichtbar belegen.** Passend ist positiv, darf aber keinen größeren Suchraum verwenden als die sichtbare Alle-Menge. Der Code ist angeglichen; jetzt fehlt nur der öffentliche Bedienbeleg.

**Abnahme dieses Schritts:**

- App 13.82.168.89 / Core 4.82.211 stammt aus einem sauberen Git-Commit und läuft ausschließlich auf Integration.
- Alle und Passend verwenden denselben angezeigten Reisezielradius von 3 km.
- Passend zeigt mehrere echte, ausdrücklich vegetarisch oder vegan belegte Orte innerhalb dieses Bereichs.
- Erdmann’s Kleines Steakhaus bleibt ausgeschlossen; Pinwechsel und Kartenzoom bleiben bedienbar.
- 229/229 Safe Regression, NFR-0 und öffentliche Asset-Identität sind grün; Main und Production bleiben unverändert.

**Danach:** Nach dem Radiusbeleg folgt als ein gemeinsamer P03-Slice die identische Provider-ID und Begründung in Timeline-Vorschlägen und AI Chat sowie die technische Stay-Parität.

**Weiter offen:** P02/P03 aktiv: 3-km-Mengenvertrag, danach Flächenparität in Timeline, AI Chat und Stay sowie vollständige Kategorie-/Filtermatrix; Google HTTP 403 bleibt nur als nachrangiger Fallback offen. Apple ist geparkt. P09/P10 teilweise: positiver Booking-Provider-Weg, Visit-AI-Parität und physische Langdruckabnahme. Danach P12/P15/P17 Trip Composer; P19/P20/P22/P23/P26 Context Matrix; P33/P34/P35 AI-Parität. M18 mit Mitreisendenverwaltung, Administration, Social und Intelligence II bleibt bis M22 erhalten.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/MASTERFAHRPLAN-v6.md)
- [Ergänzender Nachweis und Status](../planning/STATUSPLAN-2026-09-04.md)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.

Die Produktgates bleiben bestehen: G0 korrekte Entität und Status, G1 gemeinsame visuelle Bedienung, G2 vollständige Golden Journey, G3 fünf unabhängige Nutzerläufe vor breiterem B2-Ausbau. Ein eindeutig begrenzter externer Provider-Hold darf unabhängige P09/P10-Arbeit nicht stoppen. Der Master Kapitel 4 enthält den vollständigen Ablauf.
