# Aktueller Ausführungsplan P01 bis P50

<!-- LUVIA-CURRENT-STATUS:START -->
## Aktueller Stand und nächster Schritt

**Stand 2026-09-07:** Integration **13.82.168.123**, Core **4.82.242**. P15/P17 aktiv und teilweise: .123 mit fester Kartenbühne, Bottom Sheets, Wunschpipeline und automatischer Ortszeit ist ausgeliefert. Nächstes gebündeltes Paket sind Reisespur, Jahreszeitenstimmung, Ankunft und Tagesfilm. Diese Umsetzung wartet nicht auf KI-Guthaben; nur der echte KI-Positivlauf bleibt dadurch blockiert. Stable .104; Gateway v235 aktiv.

**Zuletzt geliefert:** App .123 setzt den Composer als feste Kartenbühne mit ein-/ausklappbarem Bottom Sheet um. Freitext-Reisewünsche stehen vor den drei Reisearten; KI-Zielhypothesen werden ausschließlich nach kanonischer Places-Geokodierung angezeigt. Die Pipeline und der automatische Flug über Kontinent/Land/Region sind mit kontrollierten Modellantworten geprüft. Öffentlich ist der echte Modellzugang weiter mit HTTP 429 credit_balance_exhausted blockiert; die Meldung ist jetzt korrekt, Angaben bleiben erhalten, der manuelle Weg bleibt nutzbar. Kein falscher KI-Erfolg. Geografische Ebenen überblenden mit 900 ms; erste Auswahl und zweiter Klick behalten die neun Compass-Farben. Herauszoomen geht genau eine Ebene zurück. Die aktive Zielsuche, Reisezeit und gruppierten Reisebedürfnisse liegen im Sheet. Datumseingaben sind bei 390 px nur 46 px hoch. Ernährung, Mobilität und Zugang gelangen in die kanonische Empfehlung; strengere Reiseangaben verwenden keine zuvor nur fürs Profil geprüfte Ergebnismenge. Die Zielzeitzone wird aus derselben Geoapify-Antwort übernommen und alte Entwürfe werden nur bei passender Ortsidentität ergänzt. Scharbeutz, Rom und Lissabon sind live mit korrekter IANA-Zone bestätigt. Quoten-/Payloadfehler sind getrennt, neue Reisewünsche erben keinen aktiven Reise-Kontext. 59 Composer-Verhaltensprüfungen, 42 Geografie-/Gestenprüfungen, 40 Origin-/Fehler-/Zeitzonenprüfungen und 238/238 Gesamtregression bestanden. 45/45 öffentliche Dateihashes stimmen mit dem sauberen Deployment überein. Echter KI-Positivlauf, vollständige Tagesplangüte, Kontoübernahme und physische Geräteabnahme bleiben offen.

**Nächster Schritt (AKTIV): Reisespur, Jahreszeitenstimmung, Ankunft und Tagesfilm als gemeinsames Composer-Paket umsetzen.** Die vier vom Nutzer bestätigten Erlebnisfunktionen bauen auf der ausgelieferten .123-Bühne auf. Ihre Darstellung und Bedienung können unabhängig vom Modellguthaben umgesetzt werden. Der reale KI-Gesamtplan bleibt ein gesondertes offenes Abnahmegate.

**Abnahme dieses Schritts:**

- Mitwachsende Reisespur: Geografische Auswahl zeichnet einen feinen Faden; nach der Ortsauswahl verbindet er die tatsächlich gewählten Stationen und Reisetage. Rückschritte und Alternativen aktualisieren dieselbe Spur. Geografische Verbindungen und providerberechnete Wege sind eindeutig unterscheidbar; Animation erzeugt keine zusätzlichen Routing-Anfragen.
- Jahreszeitenstimmung: Zielkoordinaten und Reisezeit steuern eine weiche atmosphärische Licht-/Farbstimmung mit passender Hemisphäre. Offene Daten bleiben neutral. Die Gestaltung behauptet weder aktuelles Wetter noch Schneelage; echte Vorhersagen benötigen eigene datierte Quellen.
- Ankunftsmoment: Die Kamerafahrt endet am kanonisch bestätigten Ziel. Wenige Bilder erscheinen ausschließlich bei belegter Zuordnung zum Ziel oder benannten Place. Erste passende Möglichkeiten kommen aus derselben places.v1-Empfehlung. Fehlende Bilder oder Belege führen zu einer bewusst gestalteten Ankunft ohne erfundene Medien oder Passend-Zusage.
- Interaktiver Tagesfilm: Der vorhandene Entwurf wird mit Tag vor/zurück, Wiedergabe/Pause, Kartenfokus und verständlichen Stationen präsentiert. Tauschen, Tag/Uhrzeit ändern und Details greifen auf die bestehenden Composer-/Trip-/Places-/Journey-Verträge zu. Interaktion pausiert den Ablauf; leere Tage bleiben erkennbar; nur bestätigte Übernahmen schreiben Domain-Daten.
- Ein gemeinsamer Zustand für Welt, Sheet, Spur und Entwurf; Eingaben, Wiederaufnahme, Zurücknavigation und Moduswechsel erhalten die Auswahl. Keine zweite Planungslogik neben den kanonischen Domain-Ownern.
- Mobile Gesten, erreichbare Sheets und Tastatur, Reduced Motion sowie begrenzte Render-/Netzlast prüfen. Bewegung darf eine Entscheidung erklären, aber keine Eingabe verzögern oder erzwingen.
- Bedienung des Tagesfilms mit bestehenden bzw. kontrollierten Entwürfen prüfen und als solchen Nachweis kennzeichnen. Ein vollständig erfolgreicher realer KI-Entwurf über alle Reisetage, Kontoübernahme und physische Geräteabnahme bleiben ausdrücklich offen; kein P15/P17-Gesamtabschluss durch diese Teilabnahme.

**Danach:** Danach den vollständigen echten KI-Reiseentwurf bei verfügbarem Modellzugang und die weiteren P15/P17-Produktgates abnehmen: Tagesvielfalt, Wege/Puffer, Kontext/Budget, echte Kontoübernahme, Identity-Übergabe, Lifecycle und physische Geräte. M18–M22 behalten Mitreisendenverwaltung, Administration, Social und Intelligence II; die 17 Karten-USPs bleiben verbindlich.

**Weiter offen:** P02/P03: Google-Berechtigung, breite echte Ortsbilder und physischer Mobil-Kaltstart. P07/P08: echte Booking-Provider. P09/P10/P11/P12: begrenzte interne Belege, physische Abnahme und echte Context-Signale fehlen. P15/P17: echter KI-Positivlauf wegen HTTP 429 credit_balance_exhausted, vollständige Kontextplanung, weitere interaktive Ausarbeitung und globale Städtestufen, echte Kontoübernahme, dauerhafte Identity-Übergabe und Trip-Lifecycle offen. Die 17 Karten-USPs bleiben verbindlich; kein weiterer P-Block wird aufgrund des Teilnachweises als vollständig abgeschlossen markiert. Zusätzlich zeigte Supabase am 06.09. eine Fair-Use-Warnung wegen Egress im vorigen Abrechnungszyklus, Schonfrist bis 07.09.; im damaligen Snapshot waren 2,517 von 5 GB genutzt. Keine Zahlung oder Planänderung vorgenommen.

Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.
<!-- LUVIA-CURRENT-STATUS:END -->

Stand 4. September 2026. Dieser Einstieg verweist auf die konsolidierte aktive Fassung statt einen weiteren widersprüchlichen Status zu führen.

- [Aktiver Arbeitsumfang](../planning/STATUSPLAN-2026-09-04.md)
- [Ergänzender Nachweis und Status](../planning/status-plan.v1.json)

Der gemeinsame Statusabschnitt am Dokumentanfang ist verbindlich. P04/P05 sind begrenzt öffentlich belegt; die komplette Nutzerkette und die vollständige P09/P10-Abnahme bleiben offen.

Die alten Ausführungs- und Evidenztexte bleiben unter docs/planning/archive/2026-09-04-before-consolidation mit ursprünglichem relativen Dateipfad erhalten. Ihre historischen Versionen, Providerreihenfolgen und lokalen Pending-Aussagen sind keine aktuelle Steuerung.
