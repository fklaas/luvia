# P17/P19 – A2 und Erlebnisqualität

Stand: 09.09.2026. Die Produktentscheidung lautet **A2 – Route mit Fokus**. Maßgeblich für den tatsächlich veröffentlichten Build und die verbleibenden Abnahmen ist `status-plan.v1.json`; dieser Bericht beschreibt den fachlichen Umfang.

## Präzisierte Erlebnisabsicht, 09.09.2026, Kandidat .197

Die automatisch ergänzten acht Zielkategorien widersprachen konkreten Nutzerwünschen. Bei expliziten Interessen werden nun ausschließlich diese recherchiert; weiche Profilinteressen fügen keine Parks oder Kultur hinzu. Der semantische Interpreter muss positive Wünsche und Ausschlüsse unterscheiden. Die bisherige Textteil-Suche im Composer, die selbst „keine täglichen Parks“ als Naturwunsch lesen konnte, entfällt. Shopping wird standardmäßig als Einkaufszentrum gesucht; besondere Geschäfte erfordern eine entsprechende Angabe. Diese Voreinstellung ist im Reiseauftrag sichtbar und tripbezogen änderbar.

Eine gemeinsame browserlose Intelligence-Richtlinie verbindet Reiseauftrag, belegt passende Kandidaten, Reserve und Audit. Die Menge für die Komposition wird nach echten Ortsarten eingeschränkt; der vollständige gespeicherte Pool und bereits referenzierte Orte bleiben für Wiederaufnahme und Reparatur erhalten. Der Audit sieht belegte Abdeckung statt nur Suchkategorien. Ein positives Modellurteil kann fehlendes Nachtleben, fehlende Einkaufszentren oder falsch als Aktivitäten deklarierte Parks nicht mehr als erfülltes Reiseversprechen ausgeben. Bei einer weiterhin fehlenden Quellenkategorie endet die erneute Kompositionsschleife; der Entwurf bleibt für gezielte Recherche erhalten.

Kontrollierte Prüfung: **244/244** Safe Regression einschließlich **27/27** neuer Intent-/Shopping-/Auditprüfungen, **133** Composer, **145/145** Transport, **32/32** Erlebnis-/A2-Prüfungen und **24/24** Recherchebelege. Die lokale Browserfixture hatte einen Strand als tourist_attraction deklariert; die neue Prüfung wies ihn korrekt zurück. Die isolierte Fixture wurde auf beach beziehungsweise shopping_mall berichtigt und die betroffenen Verhaltenstests erneut geprüft. Diese Testdaten sind ausdrücklich kein echter Valencia-Qualitätsnachweis. Veröffentlichung und öffentliche Dateibelege werden im aktuellen Status nachgetragen.

### Quellen und Lernen: nächste zusammenhängende Arbeit

Google oder Apify sind keine zwingende Abhängigkeit. Geoapify, das bereits genutzt wird, ist von Apify zu unterscheiden. Der aktuelle Trip-Recherchepfad lässt die KI Suchaufträge erstellen und Ortsprovider abfragen; er hat noch keinen allgemeinen autonomen Web-Recherchelauf. Eine budgetierte Ergänzung soll gezielt offizielle Angebote für Kurse, Touren, Shows und Veranstaltungen finden und Quellenzeitpunkt, Ortsidentität und tatsächlich belegtes Angebot erhalten. Eine Adresse beweist weder einen angebotenen Kurs noch dessen Verfügbarkeit. Weitere Anbieter werden nach messbarer Abdeckung, Latenz und Kosten ausgewählt.

Die gewünschte Verbesserung bei der zweiten und folgenden Reise benötigt bestätigte Rückmeldungen über den vorhandenen Lern-/Identity-Vertrag. Tagesbezogene Ablehnungen, reisespezifische Wünsche und dauerhafte Vorlieben müssen getrennt bleiben. Das ist keine automatische Neuschulung des Basismodells nach jedem Klick. Später eingeladene Mitreisende bekommen eine kenntlich gemachte, noch nicht berücksichtigte Perspektive; bestätigte oder gebuchte Planteile werden nicht stillschweigend ersetzt. Dieser Lernkreislauf über mehrere echte Reisen ist noch nicht abgenommen.

## Gemessene Veröffentlichung und Gegenbeleg

Integration **13.82.168.195 / Core 4.82.314**, Quelle `025f098bd77f2e6c4516f7d00523221c47211ae9`, Worker `5f352a2b-7954-4a8d-af3e-2989c51e0a4a`, ist veröffentlicht. **242/242** kontrollierte Tests einschließlich NFR-0 und **25/25** Vergleiche der Stable-/Immutable-Dateien mit dem sauberen Releasearchiv bestehen. A2 wurde mit echten Places öffentlich bedient: ausgewählte Kartenpin-/Eintragsidentität, siebenfarbiger Rahmen, getrennte Zeitbearbeitung und getrennte Karte/Route bei 1440 Pixeln ohne horizontalen Überlauf. Der lokale Austausch über kleine Alternativzeilen bleibt nach Reload erhalten. Die UI-Auswahl wurde nicht als neue Reise endgültig gespeichert.

Der echte Hauptworkflow `dca81147-2f1b-4127-801e-137f985568d2` erreichte nach **132,48 Sekunden** einen überprüfbaren Entwurf: sieben Tage, 18 Orte, 77 Kandidaten, sechs Modellaufrufe, 70.007 Tokens und 111.535 ms aufsummierte Modelllatenz. Die vorgelagerte Wunsch-/Zielinterpretation ist in dieser Hauptworkflow-Summe nicht enthalten. Der Prüfauftrag enthielt ausdrücklich zwei Erwachsene, keine Kinder, Bus/Bahn, einen langen Strandtag, lokale Küche, Mitmachen sowie keine täglichen Parks/Galerien.

**Inhaltlich bleibt der Lauf Gegenbeleg, keine vollständige Qualitätsabnahme.** Die Reise enthält jetzt den langen Strandtag, keine täglichen Parks und keine Galerientage. Sie enthält aber weiterhin generische kleine Sehenswürdigkeiten und unpassende Shoppingauswahl. Der Audit von 88 Punkten akzeptiert noch zu viel: räumliche und erlebnisbezogene Schwächen erscheinen lediglich als Aufmerksamkeit. Alle 77 Kandidaten besitzen inzwischen ursprüngliche Kategorien; dadurch wird sichtbar, dass die 15 Aktivitäten überwiegend Parks bzw. allgemeine Freiflächen sind. Der Abendwunsch wurde nicht als eigene Kategorie interpretiert.

Ein zusätzlicher konkreter Recherchefehler ist lokal nachgewiesen: Die KI fragte nach der Lonja de la Seda, bekam zwölf allgemeine Sehenswürdigkeiten und die Recherche galt als erfolgreich. Der Geoapify-Namensfilter verwirft Suchtexte mit mehr als drei Wörtern; ein leerer Namenslauf kann zudem in eine allgemeine Kategoriesuche wechseln. Benannte Zielsuche und allgemeine Entdeckung müssen deshalb im Vertrag unterscheidbar werden. Als nächster Schritt wird diese Quelle korrigiert und mit passenden Aktivitäten verbunden, bevor weitere bezahlte Gesamtkompositionen laufen.

## Produktänderung

Die Tagesroute zeigt kleine Einträge mit Uhrzeit, Kategorie, Name und Aufenthaltsdauer. Der ausgewählte Eintrag erhält das Luvia-Farbspektrum; die Kategoriefarbe verbindet Symbol und Kartenpin. Die Nummern folgen der sichtbaren Reihenfolge des Tages. Auf großen Bildschirmen steht die Bearbeitung neben der Route, auf kleinen direkt unter dem ausgewählten Eintrag. Sie zeigt jeweils nur Austauschen, Zeit/Tag oder die Ablehnungsgründe. Alternativen sind kurze Zeilen, keine großen zusätzlichen Ortskarten. Karte und Route verwenden weiterhin den gemeinsamen Places-Kartenvertrag; die lokale Gestaltungsstudie enthält eine gekennzeichnete illustrative Karte.

Die Reserve verwendet die tatsächlich behaltenen Places. Eine Ablehnung wird mit Grund gespeichert und an die bestehende KI-Rangfolge übergeben. „Kein Interesse“ darf einen anderen Erlebnistyp vorschlagen. Die ursprüngliche Auswahl bleibt erhalten, bis ein Ersatz gewählt oder der Eintrag ausdrücklich herausgenommen wird. Die lokale Wiederaufnahme erhält Auswahl, Reserve und Ablehnungen. Ein geräteübergreifender Abgleich der nachträglichen lokalen Bearbeitung ist damit noch nicht belegt.

## Warum die bisherige Valencia-Woche nicht genügte

Der öffentliche Entwurf enthielt 100 Kandidaten und 18 eingeplante Orte. Ein formal erfolgreicher Gesamtaudit von 88 Punkten war kein hinreichender Nachweis einer guten Reise: Ein als „Km 0“ bezeichneter Treffer hatte gleichzeitig Nachtleben- und Denkmaltypen, eine Kirche erschien als Park und ein vermeintlicher Strand lag laut Koordinaten im Inland. Dazu kamen wiederholte Park-/Galerieerlebnisse, die nicht aus dem Reisewunsch folgten. Die konkrete reale Identität dieser widersprüchlichen Providerdatensätze ist noch nicht unabhängig bestätigt.

Ursächliche Korrekturen im aktuellen Slice:

- Strand/Meer und Sehenswürdigkeiten werden getrennt von allgemeiner Natur bzw. Kultur verstanden. Ein Strandwunsch darf nicht durch beliebige Parks erfüllt werden.
- Explizite Angaben zur aktuellen Reise haben Vorrang vor allgemeinen Familien-, Budget- und Tempovorlieben. Zwei Erwachsene und null Kinder entfernen nur die unpassenden Kinderannahmen aus dieser Anfrage. Medizinische, Zugänglichkeits- und Ernährungsangaben sowie das gespeicherte Profil bleiben erhalten.
- Ursprüngliche Providerkategorien und Beschreibungen bleiben durch Normalisierung, Pool, Komposition und Reserve erhalten. Bereits normalisierte Kategorien werden nicht nochmals mit breiten Wortmustern umgedeutet; beispielsweise wird ein Wasserpark dadurch nicht zu einem gewöhnlichen Park.
- Komposition und unabhängiger Audit erhalten die tatsächlich vertretenen Erlebnistypen, deren Verteilung über alle Tage sowie Identitätswidersprüche. Verschiedene Parknamen sind keine ausreichende Abwechslung. Ausdrücklich gewünschte Strand- oder Museumsreisen dürfen dennoch Wiederholungen enthalten.
- Die KI soll reale Erlebnisse und plausible Aufenthaltsdauern wählen. Sie darf aus einem Ortsnamen keine Tour, Veranstaltung, Vermietung oder Buchbarkeit erfinden. Ein fehlendes Erlebnis ist ein konkreter Recherchebedarf.

Diese Erweiterungen nutzen die bestehenden Modellaufrufe. Es wird kein zusätzliches Modell pro Ortskarte abgefragt. Ein positiver neuer öffentlicher Plan und eine breite Qualitätsserie sind separat nachzuweisen; lokale Vertragsprüfungen ersetzen sie nicht.

## Eingaben und später eingeladene Mitreisende

Beide Planungswege brauchen belastbare Grundlagen. Vor dem Plan werden echte Zielkonflikte, Bewegungsradius, feste Termine und harte Grenzen geklärt. Sichtbare, änderbare Annahmen betreffen Tagesrhythmus, etwa 20–25 Prozent Freiraum, Unterkunftsbasis und anstrengende Tage. Aktuelle Öffnungen, Wetter, Preise, Buchbarkeit, Veranstaltungen, Einreise und Verkehrsverbindungen gehören in die nachgelagerte Prüfung.

Zum Freitext kommen optionale Erlebnisrichtungen: selbst ausprobieren, Essen entdecken, Stadtleben/Geschichten, draußen sein, lebendige Abende und gemeinsame Spiele/Abenteuer. Erwachsene und Kinder lassen sich auch vor Einladungen angeben. Die KI behandelt Angaben des Organisators als solche; sie kennt dadurch noch nicht die individuellen Wünsche aller Mitreisenden.

Für spätere Einladungen ist die Planungsregel dokumentiert: neue Wünsche als gezielte Änderungsvorschläge, bereits bestätigte oder gebuchte Anker erhalten, Konflikte erklären, keine automatische Komplettneuerstellung. Der vollständige Beitritts- und Mehrnutzerprozess gehört zum Collaboration/Membership-Owner und bleibt eine offene Abnahme. Im aktuellen Slice werden keine Einladungen versendet und keine fremden Profile erfunden.

## Einordnung in den Masterfahrplan

| Abschnitt | Inhalt und ehrlicher Stand |
|---|---|
| M16.5 | Aktuelle Produktabnahmen und P-Pakete. P17/P19 bleiben teilweise; der Composer ist ein großer Teil davon, aber nicht ihr gesamter Umfang. |
| M17 | Gemeinsame Produkt- und Designsprache über die Oberflächen hinweg. |
| M18.1–M18.7 | Collaboration/Membership, Attention, Travel Wallet, Reviews, Admin, Social Graph, Universal Search. |
| M18.8 | Intelligence II und weitere gemeinsame KI-Fähigkeiten. |
| M19 | Zuverlässigkeit, Offline, Synchronisation, Last und Qualitätsauswertungen. |
| M20 | Native Architekturentscheidung und echte iOS-/Android-Builds einschließlich Plattformanbindungen. |
| M21 / M21.5 | Gerätequalität und vollständige Funktionsabnahme. |
| M22 | Gestufte Veröffentlichung und Storefreigabe. |

Die gemeinsame Intelligence wird auch durch diesen Slice ausgebaut; die semantische Reiseplanung bleibt ein fachlicher Verbraucher. Verbesserte ursprüngliche Places-Evidenz kann anderen Places-Verbrauchern zugutekommen. Reisespezifische Auditregeln werden nicht automatisch zu einem global trainierten Gedächtnis oder still auf alle Module übertragen.

## Veröffentlichung und native Umsetzung

Es gibt noch keinen belastbaren Termin für den vollständigen Masterumfang. Ein bezahlter, bewusst begrenzter Webpilot ist ein eigenes mögliches Releaseziel: zuverlässige Reiseerstellung, nachvollziehbare Auswahl, Speichern/Wiederaufnahme, Konto, Zahlung/Entitlements, Kostenlimits, erforderliche Administration und Support müssen dafür positiv abgenommen sein. Eine konkrete Empfehlung ist, diesen Umfang festzulegen, statt Umsatz von allen späteren Social-/Wallet-Funktionen abhängig zu machen. Das ist eine Empfehlung, keine stillschweigende Änderung des Masterfahrplans.

Als grober Planungskorridor bei konzentrierter Weiterarbeit sind für einen solchen begrenzten Pilot **mehrere Wochen, etwa 4–8**, anzusetzen. Für einen breiteren nativen Start sind danach **zusätzliche Monate, grob 2–4**, plausibel. Beides sind unsichere Aufwandsszenarien, keine Zusagen: Umfang, echte Nutzer-/Gerätefehler, Zahlungen und gewählte native Architektur können sie wesentlich verändern. Ein Full-Master-Release lässt sich aus der bisherigen Composer-Arbeit nicht seriös auf ein fixes Datum ableiten.

Die browserlosen Cores und Backendverträge sind wiederverwendbar. Die heutige DOM-Oberfläche ist jedoch kein bereits fertiges natives UI. Karten, Navigation, Sperrbildschirm/Wiederaufnahme, sichere Anmeldung, Offlinekonflikte, Benachrichtigungen, Medien und Storezahlungen brauchen Plattformarbeit und echte Geräte. Der Umbau ist gut strukturierbar, aber kein Exportknopf. Apple verlangt bei Mindestfunktionalität mehr als eine bloß neu verpackte Website: [App Review Guidelines, 4.2](https://developer.apple.com/app-store/review/guidelines/de/). Für bestimmte neue persönliche Google-Play-Entwicklerkonten gilt vor Produktionszugang ein geschlossener Test mit mindestens zwölf Testern über vierzehn aufeinanderfolgende Tage; ob das Konto darunter fällt, ist noch offen: [Google Play Testanforderungen](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB).

## Nächste Abnahme

A2 ist mit .195 auf Integration ausgeliefert und öffentlich bedient. Die inhaltliche Prüfung dieses Stands bleibt negativ: Der tatsächliche Valencia-Plan erhält zwar einen formalen Audit von 88, enthält aber einen zu schwachen Erlebnismix. Keine Freigabe von ganz P17/P19 aus dieser Modellbewertung ableiten.

## Nachgewiesene Suchursachen und Kandidat .196

Der gespeicherte .195-Lauf zeigt zwölf Treffer für „Lonja de la Seda de València monumento histórico“, ohne dass der gesuchte Ort enthalten ist. Der Gateway entfernt den Namensfilter bei langen Suchtexten und bei strenger Typauswahl; ein leerer Namenslauf konnte außerdem in eine allgemeine Kategoriesuche übergehen. Beim Zusammenführen mit dem allgemeinen Pool ging der gezielte Suchbezug desselben Places verloren. Diese drei Pfade sind im Kandidaten korrigiert.

Der vorhandene KI-Rechercheaufruf erhält den ursprünglichen Wunsch und bis zu sechs unterschiedliche Recherchebedürfnisse. Ein separates targetName kennzeichnet einen benannten Ort; offene Erlebnissuchen verwenden passende Kategorien. Die Provider erhalten den Namen unverändert. Leere Antworten bleiben leer oder gehen mit demselben Namen zum nächsten freigeschalteten Provider. Eine Namensprüfung berücksichtigt echte Provider-Aliasnamen, aber keine Adresse als Ersatz für die Ortsidentität. Suchversion 3 erneuert alte Zusatzsuchen; bei doppelten IDs bleiben alle Recherchebezüge im dauerhaft gespeicherten Pool erhalten.

Providerkategorien werden präziser abgebildet: ein spanisches Restaurant ist kein Spa, ein Sportgeschäft keine Sportaktivität, und ein Park beziehungsweise ein allgemeiner Freizeit-/Sportbereich kein Beleg für eine Mitmachaktivität. Konkrete Typen wie Escape Room, Bowling, Minigolf, Aquarium und Sportstätte bleiben erreichbar. Die unterstützten Providerkategorien und der Namensparameter sind anhand der [offiziellen Geoapify-Dokumentation](https://apidocs.geoapify.com/docs/places/) geprüft. Eine Ortskategorie bestätigt weiterhin weder ein bestimmtes buchbares Angebot noch dessen Verfügbarkeit.

24 gezielte Verhaltenstests führen die tatsächliche Provider-Suchstrecke mit kontrollierten Antworten aus. Sie prüfen falsche und richtige Namen, Aliasnamen, den Providerwechsel ohne unbenannte Erweiterung, konkrete Aktivitätsbelege, den Browsertransport und die Integration-Isolierung. Bestehende Transport-/Reserveprüfungen: 145/145. Dies sind lokale Gegenbelege gegen die früheren Fehler, noch kein positiver öffentlicher Reiseplan.

Ein separat deploybarer Integration-Gateway importiert die vorhandene kanonische Implementierung. Die produktive Function wird dadurch nicht ersetzt. Authentifizierung, CORS und Providerbudgets gelten auch im Integration-Endpunkt. Bestehende .195-Entwürfe werden durch einen UI-Reload nicht als inhaltlich verbessert ausgegeben.

### Öffentlicher Stand .196

Veröffentlicht aus Commit a70ad77542e6377e8d6be7079d4975d9b6247ad9: App 13.82.168.196 / Core 4.82.315, Worker ed360fd7-1457-4053-ada1-7f2a01a271fc. Vollständige Safe Regression 243/243, öffentliche Dateivergleiche 27/27. Archiv 225590906 Bytes, SHA-256 EFBF76F90086C906E2FB0028A513034C4E6CF7ACD88A608DF3B8B0E12A6E66AD.

Integration-Gateway 4.64.39 / Revision 1 und Integration-Intelligence 4.43.7 / Revision 11 sind aktiv. Die produktiven Functions bleiben bei Gateway Revision 235 beziehungsweise Intelligence Revision 52. Der öffentliche A2-Editor öffnet weiterhin genau den ausgewählten Moment; sieben Tage und 18 bestehende Momente bleiben nach Reload erhalten.

Die öffentliche Namensprobe liefert nach einer leeren Geoapify-Antwort den tatsächlichen TomTom-Ort **La Lonja de la Seda**, gemessen in 953 ms. Sie liefert keine anderen Sehenswürdigkeiten als vermeintlichen Treffer. Die Aktivitätsprobe bleibt dagegen ohne Ergebnis: Geoapify-Transportfehler, OSM-Cooldown, leere TomTom-Antwort und HERE-Anfragefehler. Ein begrenzter Wiederholungsversuch nach Ablauf des Geoapify-Cooldowns bestätigt denselben Fehler. Read-only Providerstatus zeigt Geoapify-Transportstatus 0 und HERE-HTTP-Status 400; die Ersatzprovider-Taxonomien enthalten keine explizite Escape-Room-Kategorie. Daraus folgt noch nicht, dass Valencia keine solchen Angebote hat.

Deshalb wurde in diesem Slice kein neuer kostenpflichtiger Gesamtplan erzeugt. Nächster konkreter Schritt ist die Unterscheidung des Geoapify-Timeouts von einem Transportfehler und die Prüfung der unzureichenden Ersatz-Taxonomien. Erst danach kann ein neuer tatsächlicher Gesamtplan die gewünschte Erlebnisqualität belegen. P17/P19 bleiben teilweise offen.
