# P17/P19 – A2 und Erlebnisqualität

Stand: 09.09.2026. Die Produktentscheidung lautet **A2 – Route mit Fokus**. Maßgeblich für den tatsächlich veröffentlichten Build und die verbleibenden Abnahmen ist `status-plan.v1.json`; dieser Bericht beschreibt den fachlichen Umfang.

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

A2 und die Evidenzkorrekturen als gebündelten Integration-Stand veröffentlichen; den tatsächlichen Build, Austausch/Reload und einen begrenzten echten KI-Review belegen. Danach die offenen räumlichen Identitäten, die gebietsferne Reserve und den Familien-/Konfliktfall bearbeiten. Keine Freigabe von ganz P17/P19 aus einem einzelnen positiven Valencia-Test ableiten.
