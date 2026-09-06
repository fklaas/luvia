# Aktueller Ausführungsplan P01 bis P50

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-06:** Integration **13.82.168.119**, Core **4.82.238**. M16.5 Schritte 15–18: P15/P17 bleibt aktiv und teilweise. Der Composer-Transportfehler ist für die exakte Kandidatenadresse serverseitig korrigiert. Die Zielsuche ist für Stadt und Region im Browser-Vertrag belegt. Der Slider ist keine abgenommene Gestaltung; die neue Reisewelt-Richtung liegt als Konzeptauswahl vor. Frontend .119 / Stable .104 bleiben unverändert; Gateway v234 und Intelligence v37 sind veröffentlicht.

**Zuletzt geliefert:** Serverkorrektur 06.09.2026: Der genaue .119-Composer-Link lieferte vor dem Fix für die Zielsuche NETWORK_UNAVAILABLE; Gateway und Intelligence lehnten seine Origin mit HTTP 403 ab, während Stable erlaubt war. Die auf den eigenen Integration-Worker begrenzte Freigabe ist jetzt in Gateway v234 / 4.64.37 und Intelligence v37 / 4.35.1 veröffentlicht. Rom, Toskana und Lissabon wurden danach über den tatsächlichen places.v1-Such- und Auswahlvertrag in der Browser-Origin des Kandidaten bestätigt (2.730 / 1.213 / 1.039 ms, gültige Place-ID und Koordinaten). Das ist ein echter Browser-Vertragsnachweis; kein neuer angemeldeter UI-Klicklauf oder physischer iPhone-Nachweis. 30/30 gezielte Origin-/Auth-Verhaltensproben und 237/237 kontrollierte Regression sind grün; 32/32 erneut heruntergeladene Function-Quellen entsprechen nach Zeilenenden-Normalisierung dem Deployment-Commit. Frontend .119 und Stable .104 bleiben unverändert. Der bisherige Slider ist vom Nutzer als Gestaltung abgelehnt; drei Reisewelt-Konzepte sind dokumentiert, noch nicht umgesetzt.

**Nächster Schritt (AKTIV): P15/P17: die Reisewelt-Richtung festlegen und als zusammenhängende mobile Szene ausarbeiten.** Der Nutzer verlangt eine kleine spielbare Weltkarte mit bedeutungsvollen Entscheidungen. Empfohlen ist Eure kleine Reisewelt mit direkter tageweiser Gestaltung; Alternativen sind Reisebauen und spielbare Reisegeschichte. Die Konzeptauswahl ist noch nicht als fertige Oberfläche oder Nutzerentscheidung zu behandeln.

**Abnahme dieses Schritts:**

- Die ausgewählte Richtung führt räumlich zusammenhängend von Welt/Region und überprüfbarer Zielauswahl über zwei Reiseentscheidungen zu realen Places und einem bearbeitbaren Tag. Eine sichtbare direkte Ortsuche bleibt jederzeit verfügbar.
- Jede Interaktion verändert den kanonischen Trip-Entwurf und dieselben Places-/Journey-Projektionen; Kamera, Dekoration und Animation lösen keine Anbieteranfragen aus. Keine kopierte Fachlogik und kein Pflicht-Minispiel.
- Touch, direkte Antipp-Alternative zu Ziehen, Tastatur, Reduced Motion, Reisefarbe und Wiederaufnahme auf kleinem Bildschirm abnehmen. Die öffentliche Abnahme prüft den tatsächlich ausgegebenen Versionslink, einschließlich seiner Origin, und anschließend echte iOS-/Android-Geräte.
- Echte KI-Planung bleibt ein getrenntes Produktgate innerhalb P15/P17: nach Klärung des zuvor belegten API-Guthabenproblems strukturierten Modellauftrag, Restriktionen, Kontextbelege und ausdrückliche Bestätigung positiv nachweisen. Szenische Effekte ersetzen diesen Nachweis nicht.

**Danach:** Nach der gewählten ersten Reisewelt-Szene den gesamten Composer in derselben Gestaltungslogik ausarbeiten: Zeitraum, Budget, Mitreisende und ganze Tagesvorschau. P15/P17 umfasst weiterhin vollständige KI-/Kontextplanung, echte Kontoübernahme, getrennte Identity-Bestätigung und Trip-Archivieren/Löschen/Wiederherstellen. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: öffentlicher KI-Positivlauf wegen HTTP 429, vollständige Kontextplanung, finale interaktive Gestaltung, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im aktuellen Zyklus sind 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
