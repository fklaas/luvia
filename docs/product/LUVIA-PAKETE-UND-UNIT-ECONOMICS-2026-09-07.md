# Luvia Pakete und Unit Economics

**Arbeitsstand:** 8. September 2026

**Zweck:** belastbare Startannahme für Produktpakete, KI-Budget und Break-even.
**Status:** Entscheidungsgrundlage, noch keine veröffentlichte Preisliste. Paketgrenzen und Preise werden nach mindestens 100 erfolgreich übernommenen KI-Reisen beziehungsweise 200 bis 500 echten monatlich aktiven Nutzern anhand der anonymisierten Capability-Telemetrie neu kalibriert.

## 1. Die wichtigste Produktentscheidung

Luvia darf Qualität, Belegpflicht und Schutz vor erfundenen Fakten nicht nach Tarif staffeln. Free bekommt weniger Generierungen und weniger laufende Aktualisierungen, aber keinen schlechteren Wahrheitsstandard. Reiseversprechen, Unsicherheitskarte, Quellenzustand, Bestätigung vor Speicherung und ein blockierender Qualitätscheck gelten in allen Paketen.

Die Staffelung erfolgt über **Volumen, Aktualität, Komfort und Zusammenarbeit**:

| Leistung | Luvia Free | Luvia Plus | Luvia Premium |
|---|---:|---:|---:|
| Preisvorschlag | 0 € | 7,99 €/Monat oder 69,99 €/Jahr | 14,99 €/Monat oder 129,99 €/Jahr |
| Manuelle Reisen | 3 aktive Reisen | unbegrenzt | unbegrenzt |
| Vollständige KI-Entwürfe | 1 pro Monat | 5 pro Monat | 20 pro Monat |
| Gezielte KI-Reparaturen/Neuplanungen | 3 pro Monat | 20 pro Monat | 60 pro Monat, Fair Use |
| Fünf passende Reiserichtungen | 3 Suchen pro Monat | 20 Suchen pro Monat | 60 Suchen pro Monat |
| Reiseversprechen, Tagesbalance, Freiraum, Unsicherheitskarte | ja | ja | ja |
| Reise-DNA und Zeitreise | ja | ja | ja |
| Reise-Schatten / Was-wäre-wenn-Vergleich | Vorschau einmal pro Reise | vollständig | vollständig und mehrere parallele Schatten |
| Kontextwellen und erneute Faktenprüfung | vor finaler Übernahme | zusätzlich auf Wunsch | automatisch zu sinnvollen Zeitpunkten |
| Luvia Pulse | – | wichtige Reiseänderungen | laufende priorisierte Reisebegleitung |
| Ziel-Zwillinge | – | 2 Alternativen | mehrere Alternativen mit erklärtem Trade-off |
| Gruppen-Sternbild | – | bis 5 Mitreisende, sobald Collaboration fertig ist | größere Gruppen, Rollen und Konfliktmoderation |
| Dokumente, Offline, Export | Basis | erweitert | vollständig, sobald die Owner-Blöcke fertig sind |

Für Menschen, die nur ein- oder zweimal im Jahr reisen, sollte zusätzlich ein **Luvia Reisepass für 4,99 €** angeboten werden: ein vollständiger KI-Entwurf, bis zu zehn gezielte Reparaturen und 14 Tage Kontextaktualisierung für genau eine Reise. Ein reines Abonnement passt nicht zu jedem saisonalen Nutzungsmuster.

Die Preisposition ist bewusst oberhalb einfacher Reiseorganizer angesetzt. TripIt Pro nennt aktuell 49 US-Dollar pro Jahr; Wanderlog nennt für Pro 39,99 US-Dollar pro Jahr. Luvia soll dafür nicht nur vorhandene Buchungen sortieren, sondern einen vollständigen, erklärbaren und reparierbaren Reiseentwurf mit mehreren Ownern liefern. Quellen: [TripIt Pro](https://www.tripit.com/web/pro/pricing), [Wanderlog Pro](https://wanderlog.com/blog/2024/09/12/the-19-best-travel-planning-apps-for-every-type-of-traveler-2/).

## 2. Was ein vollständiger KI-Entwurf kostet

Die Integration nutzt seit App 13.82.168.143 und Intelligence 4.38.5 einen kompakten kanonischen Reisevertrag. Luna deutet den Wunsch und erzeugt den ersten strukturierten Entwurf. Terra prüft ihn unabhängig. Eine gezielte Terra-Reparatur folgt nur bei konkreten Blockern; Sol ist die begrenzte letzte Rettungsstufe. Der Vertrag leitet redundante technische Felder selbst ab, während die KI weiterhin Reiseorte, Reihenfolge, Zeiten, Tagesrhythmus, Freiraum, Unsicherheiten, Buchungsreihenfolge, Unterkunftsradius und Alternativen entscheidet.

Die folgenden Werte sind eine Modellrechnung ohne Prompt-Cache. Sie sind noch keine gemessenen Durchschnittswerte echter Nutzer.

| Stufe | Modell | angenommener Input | angenommener Output | geschätzte Kosten |
|---|---|---:|---:|---:|
| Wunsch semantisch verstehen | Luna | 2.000 Token | 800 Token | 0,0014 $ |
| fünf passende Richtungen | Luna | 2.500 Token | 1.000 Token | 0,0017 $ |
| kompakter vollständiger Reiseentwurf | Luna | 10.000 Token | 6.000 Token | 0,0092 $ |
| unabhängiger Reise-Audit | Terra | 10.000 Token | 1.500 Token | 0,0380 $ |
| **erfolgreicher erster Durchlauf** |  | **24.500** | **9.300** | **ca. 0,050 $** |

Eine Terra-Reparatur mit erneutem Audit erhöht diese Modellrechnung um ungefähr **0,134 $**. Eine anschließende Sol-Rettung mit erneutem Audit kann weitere ungefähr **0,206 $** kosten. Daraus ergibt sich derzeit eine sinnvolle Planungsbandbreite:

- etwa **0,05 $**, wenn der erste Entwurf den Audit besteht;
- etwa **0,18 $**, wenn eine Terra-Reparatur nötig ist;
- bis ungefähr **0,39 $**, wenn zusätzlich Sol eingreifen muss.

Der letzte echte Valencia-Lauf auf Integration hat gezeigt, dass diese Reparaturquote noch nicht stabil genug ist: Schema, Datumslogik, Budgetsemantik und Audit wurden korrekt verarbeitet, aber nach den begrenzten Reparaturstufen blieb Tag 2 unter der verbindlichen Mindestdichte. Deshalb wird für die Paketkalkulation vorerst mit **0,08 bis 0,20 $ pro erfolgreich übernommener vollständiger Reise** gerechnet. Die technische Zielarchitektur erzeugt und repariert künftig einzelne Reisetage fortsetzbar, damit nicht wegen eines schwachen Tages der ganze Reiseplan erneut bezahlt werden muss.

Die Modellpreise am 7. September 2026 lauten:

| Modell | Input je 1 Mio. Token | gecachter Input | Output je 1 Mio. Token |
|---|---:|---:|---:|
| Luna | 0,20 $ | 0,02 $ | 1,20 $ |
| Terra | 2,00 $ | 0,20 $ | 12,00 $ |
| Sol | 4,00 $ | 0,40 $ | 20,00 $ |

Quellen: [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

### Verbindliches Zielrouting und Qualitätsgrenze

Das günstigste Modell reicht für viele Arbeitsschritte, aber noch nicht nachgewiesen für jeden vollständigen Reiseplan. Deshalb wird nicht blind alles auf Luna umgestellt. Der richtige Zielzustand ist:

1. Luna interpretiert den Wunsch, erzeugt fünf Richtungen und baut den ersten strukturierten Entwurf beziehungsweise künftig die einzelnen Tagessegmente.
2. Terra prüft den Entwurf unabhängig gegen Reiseversprechen, Belege, Tagesbalance, Geografie und harte Anforderungen.
3. Terra repariert nur die vom Audit benannten Tage oder Felder.
4. Sol wird nur bei einem belegten komplexen Konflikt oder nach einer gescheiterten Terra-Reparatur eingesetzt.
5. Das Ergebnis erreicht den Nutzer nur, wenn derselbe Qualitätsvertrag erfüllt ist. Ein günstiger Tarif erhält weniger Aufrufe, aber keine schlechter geprüfte Reise.

Ein reiner Luna-Pfad wäre am billigsten, ist für komplexe Gesamtpläne aber nicht als qualitativ gleichwertig belegt. Luna eignet sich bereits für Wunschdeutung, Zielrichtungen, einfache strukturierte Aufgaben und den ersten Entwurf. Terra bleibt die unabhängige Qualitätsinstanz. Sol gehört nicht in den Normalfall.

Das auf dem Screenshot sichtbare Guthaben von 9,94 $ reicht damit überschlägig für:

- etwa 198 erste Durchläufe zu je 0,05 $;
- etwa 55 erfolgreiche Reisen zu je 0,18 $ mit einer Terra-Reparatur;
- etwa 25 schwierige Reisen zu je 0,39 $ mit zusätzlicher Sol-Rettung;
- bei der vorläufigen Kalkulationsspanne von 0,08 bis 0,20 $ ungefähr 50 bis 124 erfolgreich übernommene Reisen.

Die ebenfalls sichtbaren 100 $ sind das monatliche Ausgabenlimit und kein vorhandenes Guthaben.

Die im Composer beobachteten Fehler `invalid JSON`, `invalid response_format schema` und `timeout` beweisen kein zu geringes Guthaben. Ein leeres Guthaben erzeugt einen eigenen Credit-/Quota-Fehler. Ein 400-Schemafehler entsteht vor einer erfolgreichen Modellgenerierung; ungültige oder unvollständige generierte Antworten und wiederholte Timeouts können dagegen bereits Token und damit Geld verbrauchen.

## 3. Weitere laufende technische Kosten

| Dienst | belastbarer öffentlicher Stand | Luvia-Annahme für den Start |
|---|---|---|
| Cloudflare Workers | Paid ab 5 $/Monat, 10 Mio. Requests enthalten; statische Assets kostenlos | 5 bis 15 €/Monat |
| Supabase | Pro 25 $/Monat mit 100.000 MAU, 8 GB Datenbank und 250 GB Egress | rund 25 €/Monat, später nach realer Last |
| Geoapify | 59 $/Monat für 10.000 Requests pro Tag | rund 55 bis 60 €/Monat |
| OpenHolidays | kostenlos, auch kommerziell nutzbar | 0 €, mit eigener Ausfall- und Cachebehandlung |
| Karten | OpenFreeMap öffentliche Instanz kostenlos und ohne SLA | für Produktion später eigener belastbarer Tile-Vertrag einplanen |
| Wetter, Events, Routing, Monitoring, Domain, Backups | Anbieterentscheidung beziehungsweise Messung offen | vorläufig 50 bis 70 €/Monat Reserve |

Quellen: [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/), [Supabase](https://supabase.com/pricing), [Geoapify](https://www.geoapify.com/pricing/), [OpenHolidays](https://www.openholidaysapi.org/en/faq/), [OpenFreeMap](https://openfreemap.org/).

Google und Foursquare gehören nicht in den automatischen Standardpfad jeder Kartenbewegung. Nach den aktuellen Preislisten kann Google Nearby/Text Search nach der Freimenge 32 $ je 1.000 Aufrufe kosten; Foursquare nennt nach 500 kostenlosen Pro-Aufrufen 15 $ je 1.000 Aufrufe. Diese Anbieter werden nur für Fähigkeiten eingesetzt, deren Mehrwert und Budget ausdrücklich feststehen. Quellen: [Google Maps Platform](https://developers.google.com/maps/billing-and-pricing/pricing), [Foursquare Places](https://docs.foursquare.com/developer/reference/upcoming-changes).

Für die frühe technische Basis wird mit **150 € Fixkosten pro Monat** gerechnet. Diese Zahl enthält keine Löhne, Rechts- oder Steuerberatung, Marketing, Support, Versicherungen, Rückerstattungen und keine Buchungsprovisionen.

## 4. Erwarteter Verbrauch pro aktivem Nutzer und Monat

| Nutzertyp | angenommene Nutzung | Zielrouting | heutiges Routing |
|---|---|---:|---:|
| Free aktiv | im Mittel 0,25 vollständige Pläne, eine Zielsuche und eine kleine Korrektur | ca. 0,04–0,08 € | **0,08 € Kalkulation** |
| Plus aktiv | im Mittel 1,5 vollständige Pläne, etwa fünf Zielsuchen, sechs gezielte Reparaturen und normale Kontextnutzung | ca. 0,35–0,70 € | **0,70 € Kalkulation** |
| Premium aktiv | im Mittel vier vollständige Pläne, etwa zwölf Zielsuchen, zwanzig Reparaturen und häufigere Kontextprüfungen | ca. 1,20–2,20 € | **2,20 € Kalkulation** |

Das sind Kosten eines **monatlich aktiven** Nutzers. Registrierte, aber inaktive Konten verursachen nahezu keine KI-Kosten und nur einen kleinen Speicheranteil. Ein durchschnittlicher zahlender Nutzer wird wegen der saisonalen Natur von Reisen meist deutlich unter seinem Paketlimit bleiben. Limits schützen vor Automatisierung und Missbrauch; sie sind keine erwartete Normalnutzung.

## 5. Deckungsbeitrag pro zahlendem Nutzer

Für eine konservative mobile Rechnung werden 19 Prozent deutsche Umsatzsteuer und 15 Prozent Store-Gebühr angesetzt. Apple nennt für qualifizierte Teilnehmer des Small Business Program 15 Prozent; Google nennt für den entsprechenden Umsatzbereich ebenfalls eine reduzierte Stufe. Quellen: [Apple App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/), [Google Play Service Fee](https://support.google.com/googleplay/android-developer/answer/10632485?hl=en).

| Paket | Bruttopreis | nach 19 % USt. | nach 15 % Store-Gebühr | variable Technik | Deckungsbeitrag vor Personal/Marketing |
|---|---:|---:|---:|---:|---:|
| Plus | 7,99 € | 6,71 € | 5,71 € | 0,70 € | **5,01 €** |
| Premium | 14,99 € | 12,60 € | 10,71 € | 2,20 € | **8,51 €** |

Bei 70 Prozent Plus und 30 Prozent Premium ergibt sich ein gewichteter Deckungsbeitrag von rund **6,06 € pro zahlendem aktivem Nutzer**. Web-Direktzahlungen können günstiger sein; die Geschäftsplanung sollte zunächst mit dem konservativeren Store-Fall arbeiten.

## 6. Break-even

### Nur technische Grundkosten

Bei 150 € monatlichen Fixkosten, 0,08 € je aktivem Free-Nutzer und 6,06 € Deckungsbeitrag je zahlendem Nutzer ergibt sich:

| Bezahlquote | benötigte zahlende Nutzer | gesamte monatlich aktive Nutzer | Bedeutung |
|---:|---:|---:|---|
| 5 % | ca. 34 | ca. 670 | technische Basis ungefähr gedeckt |
| 3 % | ca. 44 | ca. 1.450 | technische Basis ungefähr gedeckt |
| 2 % | ca. 71 | ca. 3.550 | technische Basis ungefähr gedeckt |

Formel: `zahlende Nutzer = Fixkosten / (gewichteter Deckungsbeitrag − Free-Nutzer je Zahler × Free-Kosten)`.

### Mit echten Unternehmensfixkosten

| gesamte monatliche Fixkosten | bei 5 % Bezahlquote benötigte Zahler | gesamte monatlich aktive Nutzer |
|---:|---:|---:|
| 5.000 € | ca. 1.102 | ca. 22.100 |
| 10.000 € | ca. 2.203 | ca. 44.100 |

Diese zweite Tabelle ist die geschäftlich relevante. Die erste zeigt nur, wann Hosting, Daten und KI getragen werden. Gründerlohn, Entwicklung, Support und Wachstum werden erst in der zweiten Größenordnung bezahlt.

Zwei Beispielszenarien:

- **1.000 MAU, 5 % zahlend:** rund 303 € Deckungsbeitrag der 50 Zahler, 76 € Free-Verbrauch und 150 € frühe Fixkosten ergeben etwa **77 € technischen Überschuss**, noch vor Personal und Marketing.
- **10.000 MAU, 5 % zahlend:** rund 3.030 € Deckungsbeitrag der 500 Zahler, 760 € Free-Verbrauch und beispielhaft 400 € gewachsene Plattformfixkosten ergeben etwa **1.870 €**, weiterhin vor Personal und Marketing.

## 7. Messplan vor der endgültigen Preisentscheidung

Luvia erfasst bereits Capability, Modell, Input-, gecachte Input- und Output-Token, Latenz sowie Erfolg oder Fehler, ohne Rohprompts zu protokollieren. Für die echte Unit-Economics-Auswertung kommen hinzu:

- erfolgreiche vollständige Pläne pro aktivem Nutzer;
- Reparaturen und erneute Vorschläge pro Plan;
- Kosten je Capability und je erfolgreich übernommener Reise;
- Places-, Routing-, Wetter-, Event- und Bildaufrufe je Plan;
- Abbruchquote je Composer-Schritt und Zeit bis zum ersten brauchbaren Entwurf;
- Anteil der Pläne, die der unabhängige Audit beim ersten Lauf freigibt;
- Free-zu-Plus-, Plus-zu-Premium- und Reisepass-Konversion;
- Erstattungen, Store-Anteil, Umsatzsteuer und Supportkosten je Paket.

Die erste verbindliche Preisprüfung erfolgt nach **30 Tagen mit mindestens 200 monatlich aktiven Nutzern**. Eine belastbarere Paketentscheidung folgt ab etwa **500 MAU oder 100 erfolgreich übernommenen KI-Reisen**. Bis dahin sind Paketgrenzen Feature-Flags und keine langfristige Zusage.

## 8. Entscheidung für den Fahrplan

1. Das Luna-first-Routing mit Terra-Audit, gezielter Terra-Reparatur und begrenzter Sol-Eskalation bleibt auf Integration aktiv.
2. P17/P19 teilen die vollständige Komposition in fortsetzbare serverseitige Arbeitsschritte mit tageweiser Vollständigkeitsgarantie. App .144 / Intelligence v47 setzt dies technisch um: Wunschdeutung, Kandidatenstand, Erstentwurf, Tagesreparatur und Audit gehören zu einem 24 Stunden gültigen Reiseauftrag; jede Modellstufe ist idempotent. Ein Reload startet keine bereits erfolgreiche Modellstufe erneut, und ein einzelner schwacher Tag darf nicht den vollständigen Plan neu erzeugen.
3. Für jede erfolgreiche Reise werden tatsächliche Kosten, Latenz, Auditquote und Reparaturpfad gemessen.
4. Die Paketgrenzen bleiben bis zu mindestens 100 erfolgreichen Reisen konfigurierbar.
5. Ein zweiter Modellanbieter wird erst über denselben kanonischen Vertrag und Eval-Satz angebunden. Viele Anbieter ohne gemessenen Mehrwert würden Kosten, Fehlerbilder und Datenschutzarbeit erhöhen, aber die Reise nicht automatisch besser machen.

Der neue Auftrag senkt vor allem vermeidbare Fehlerkosten. Bislang konnte ein abgebrochener Browser-Request dieselbe kostenpflichtige Komposition beim nächsten Versuch noch einmal auslösen. Jetzt speichert Intelligence Status, Modell, Token, Latenz und Ergebnis je Phase; derselbe semantische Auftrag liest das vorhandene Ergebnis. Das ändert den Listenpreis eines einzelnen Modellaufrufs nicht, verringert aber die Zahl unbeabsichtigter Doppelaufrufe. Der konkrete Euroeffekt wird erst nach den zwei echten Abnahmereisen und danach aus mindestens 100 erfolgreichen Reisen belastbar in die Paketkalkulation übernommen.

