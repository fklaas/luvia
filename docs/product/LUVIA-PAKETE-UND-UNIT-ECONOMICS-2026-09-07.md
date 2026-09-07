# Luvia Pakete und Unit Economics

**Arbeitsstand:** 7. September 2026

**Zweck:** belastbare Startannahme für Produktpakete, KI-Budget und Break-even.
**Status:** Entscheidungsgrundlage, noch keine veröffentlichte Preisliste. Alle Verbrauchswerte werden nach den ersten 200 bis 500 echten aktiven Nutzern anhand der anonymisierten Capability-Telemetrie neu kalibriert.

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

Die folgenden Werte sind eine konservative Schätzung ohne Prompt-Cache. Sie entsprechen dem heutigen Luvia-Ablauf und sind noch keine gemessenen Durchschnittswerte echter Nutzer.

| Capability | Modell heute | angenommener Input | angenommener Output | geschätzte Kosten |
|---|---|---:|---:|---:|
| Wunsch verstehen | Terra | 2.000 Token | 800 Token | 0,0136 $ |
| fünf Reiseziele ableiten | Terra | 2.500 Token | 1.000 Token | 0,0170 $ |
| vollständige Reise komponieren | Sol | 10.000 Token | 8.000 Token | 0,2000 $ |
| unabhängiger Reise-Audit | Terra | 12.000 Token | 2.000 Token | 0,0480 $ |
| **Normaler Gesamtentwurf heute** |  | **26.500** | **11.800** | **0,2786 $** |

Ein zusätzlicher Sol-Reparaturlauf mit erneutem Terra-Audit kostet in dieser Annahme weitere rund 0,256 $. Ein schwieriger Entwurf mit Reparatur liegt damit bei etwa **0,535 $**.

Die Modellpreise am 7. September 2026 lauten:

| Modell | Input je 1 Mio. Token | gecachter Input | Output je 1 Mio. Token |
|---|---:|---:|---:|
| Luna | 0,20 $ | 0,02 $ | 1,20 $ |
| Terra | 2,00 $ | 0,20 $ | 12,00 $ |
| Sol | 4,00 $ | 0,40 $ | 20,00 $ |

Quellen: [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

### Empfohlenes Zielrouting nach Eval

Das günstigste Modell reicht für viele Arbeitsschritte, aber noch nicht nachgewiesen für jeden vollständigen Reiseplan. Deshalb wird nicht blind alles auf Luna umgestellt. Der richtige Zielzustand ist:

1. Luna interpretiert den Wunsch, erzeugt fünf Richtungen und baut den ersten Gesamtentwurf.
2. Terra prüft diesen Entwurf unabhängig gegen Reiseversprechen, Belege, Tagesbalance, Geografie und harte Anforderungen.
3. Sol wird nur bei einem vom Audit belegten komplexen Konflikt oder einer gescheiterten Reparatur eingesetzt.
4. Das Ergebnis erreicht den Nutzer nur, wenn derselbe Qualitätsvertrag erfüllt ist.

Unter denselben Tokenannahmen kostet **Luna für Planung und ersten Entwurf plus Terra-Audit etwa 0,0627 $**. Bei zehn Prozent Sol-Reparaturen entstehen im Mittel etwa **0,0883 $ pro erfolgreichem vollständigen Entwurf**. Würde alles ausschließlich auf Luna laufen, läge die rechnerische Untergrenze bei etwa 0,0195 $, jedoch ohne belegte Qualitätsparität.

Das vorhandene Guthaben von 9,94 $ reicht damit überschlägig für:

- etwa 35 normale Entwürfe im heutigen qualitätsorientierten Routing;
- etwa 18 Entwürfe, wenn jeder einzelne einen vollständigen Reparaturlauf braucht;
- etwa 112 Entwürfe beim empfohlenen Zielrouting einschließlich zehn Prozent Sol-Reparaturen;
- rein rechnerisch etwa 510 vollständige Luna-Ausgaben ohne Qualitätsnachweis.

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
| Free aktiv | im Mittel 0,25 vollständige Pläne, wenige Zielideen und Korrekturen | ca. 0,05 € | ca. 0,10 € |
| Plus aktiv | 1,5 vollständige Pläne, 15 bis 20 Teilkorrekturen, normale Places-/Kontextnutzung | ca. 0,32 € | ca. 0,60 € |
| Premium aktiv | 5 vollständige Pläne, 40 bis 60 Teilkorrekturen, häufigere Kontextprüfungen | ca. 1,02 € | ca. 1,98 € |

Das sind Kosten eines **monatlich aktiven** Nutzers. Registrierte, aber inaktive Konten verursachen nahezu keine KI-Kosten und nur einen kleinen Speicheranteil. Ein durchschnittlicher zahlender Nutzer wird wegen der saisonalen Natur von Reisen meist deutlich unter seinem Paketlimit bleiben. Limits schützen vor Automatisierung und Missbrauch; sie sind keine erwartete Normalnutzung.

## 5. Deckungsbeitrag pro zahlendem Nutzer

Für eine konservative mobile Rechnung werden 19 Prozent deutsche Umsatzsteuer und 15 Prozent Store-Gebühr angesetzt. Apple nennt für qualifizierte Teilnehmer des Small Business Program 15 Prozent; Google nennt für den entsprechenden Umsatzbereich ebenfalls eine reduzierte Stufe. Quellen: [Apple App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/), [Google Play Service Fee](https://support.google.com/googleplay/android-developer/answer/10632485?hl=en).

| Paket | Bruttopreis | nach 19 % USt. | nach 15 % Store-Gebühr | variable Technik | Deckungsbeitrag vor Personal/Marketing |
|---|---:|---:|---:|---:|---:|
| Plus | 7,99 € | 6,71 € | 5,71 € | 0,32 € | **5,39 €** |
| Premium | 14,99 € | 12,60 € | 10,71 € | 1,02 € | **9,69 €** |

Bei 70 Prozent Plus und 30 Prozent Premium ergibt sich ein gewichteter Deckungsbeitrag von rund **6,68 € pro zahlendem aktivem Nutzer**. Web-Direktzahlungen können günstiger sein; die Geschäftsplanung sollte zunächst mit dem konservativeren Store-Fall arbeiten.

## 6. Break-even

### Nur technische Grundkosten

Bei 150 € monatlichen Fixkosten, 0,05 € je aktivem Free-Nutzer und 6,68 € Deckungsbeitrag je zahlendem Nutzer ergibt sich:

| Bezahlquote | benötigte zahlende Nutzer | gesamte monatlich aktive Nutzer | Bedeutung |
|---:|---:|---:|---|
| 5 % | ca. 27 | ca. 540 | technische Basis ungefähr gedeckt |
| 3 % | ca. 30 | ca. 1.000 | technische Basis ungefähr gedeckt |
| 2 % | ca. 36 | ca. 1.800 | technische Basis ungefähr gedeckt |

Formel: `zahlende Nutzer = Fixkosten / (gewichteter Deckungsbeitrag − Free-Nutzer je Zahler × Free-Kosten)`.

### Mit echten Unternehmensfixkosten

| gesamte monatliche Fixkosten | bei 5 % Bezahlquote benötigte Zahler | gesamte monatlich aktive Nutzer |
|---:|---:|---:|
| 5.000 € | ca. 873 | ca. 17.500 |
| 10.000 € | ca. 1.746 | ca. 35.000 |

Diese zweite Tabelle ist die geschäftlich relevante. Die erste zeigt nur, wann Hosting, Daten und KI getragen werden. Gründerlohn, Entwicklung, Support und Wachstum werden erst in der zweiten Größenordnung bezahlt.

Zwei Beispielszenarien:

- **1.000 MAU, 5 % zahlend:** rund 334 € Deckungsbeitrag der 50 Zahler, 47,50 € Free-Verbrauch und 150 € frühe Fixkosten ergeben etwa **136 € technischen Überschuss**, noch vor Personal und Marketing.
- **10.000 MAU, 5 % zahlend:** rund 3.340 € Deckungsbeitrag der 500 Zahler, 475 € Free-Verbrauch und beispielhaft 400 € gewachsene Plattformfixkosten ergeben etwa **2.465 €**, weiterhin vor Personal und Marketing.

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

1. Das heutige Sol/Terra-Routing bleibt bis zum vergleichenden Qualitäts-Eval aktiv.
2. P17/P19 liefern den vollständigen prüfbaren Planvertrag: Reiseversprechen, Freiraum, Tagesbalance, Unsicherheit, Belege, Buchungsreihenfolge und Unterkunftsradius.
3. Danach wird derselbe Eval-Satz mit Luna-first, Terra-Audit und gezielter Sol-Eskalation ausgeführt.
4. Erst bei gleicher fachlicher Annahmequote wird die günstigere Route auf Integration aktiviert.
5. Ein zweiter Modellanbieter wird erst über denselben kanonischen Vertrag und Eval-Satz angebunden. Viele Anbieter ohne gemessenen Mehrwert würden Kosten, Fehlerbilder und Datenschutzarbeit erhöhen, aber die Reise nicht automatisch besser machen.
