# Sichtbare B1 Abnahme am 4 September 2026

Stand: **BEGONNEN / NEUER GEGENBELEG / KEIN B1 ABSCHLUSS**. Öffentliche Integration App 13.82.168.37, bestehende Reise Ostseeurlaub in Scharbeutz, 12.–19. Juni 2027. Sichtbarer In-App-Browser, vorhandene angemeldete Sitzung. Kein physischer Gerätetest.

## Tatsächlich ausgeführt

| Schritt | Beobachtung | Einordnung |
|---|---|---|
| Places öffnen | Scharbeutz, 3 km, 50 koordinatenverifizierte Orte; einzelne belegte Passungen | Positiver aktueller Karten-Read |
| AI Chat öffnen | Echter Compass-Dialog sichtbar und bedienbar | PASS für diesen Einstieg |
| Freie Anfrage | „Finde für unseren Ostseeurlaub in Scharbeutz ein vegetarisch geeignetes Restaurant am Wasser.“ | Richtige sichtbare Wunschzusammenfassung |
| Erster Abruf | „Orte und Umgebung konnte ich nicht zuverlässig laden“ | Fehler sichtbar; Ursache des ersten Ausfalls nicht abschließend bestimmt |
| Einmal Erneut versuchen | Drei Gateway-Text-Search-Antworten HTTP 200, ok:true, jeweils 20 Geoapify-Orte und keine Providerfehler | Anbieterantwort vorhanden; kein vollständiger Sucherfolg im Consumer |
| Darstellung nach Retry | „Noch kein verlässlicher Ort gefunden“ bei gleichzeitigem Status „Die passenden Informationen sind da“ | Widersprüchliche Erfolgsmeldung; leerer Chat-Endpfad |
| Einfachere Vergleichsanfrage | „Zeige mir Restaurants in Scharbeutz.“ endet ebenfalls mit leerem Ergebnis | B1-Suche nicht als abgenommen markierbar |
| Unabhängiger Journey-Read | „Zeige mir den Tagesplan für den 12. Juni 2027.“ zeigt 2 echte Momente, Grande Beach Café 15:00 und Restaurant Brechtmann 20:00 | PASS für diesen lesenden Tagesplanpfad; keine Mutation |
| Normaler Reload | Ostseeurlaub bleibt aktiv; Scharbeutz und 50 Kartenorte wieder sichtbar | PASS für Reiseerhalt und erneuten Karten-Read; kein vollständiger Mutations-Reload-Beleg |

Die Diagnostik zeigt beim Retry einen 20-km-Default im Chat-Suchkontext, während die Karte 3 km zeigt. Außerdem enthält der Suchtext doppelte Orts-/Wunschbestandteile. Die drei Anbieterantworten enthalten dieselben 20 Ortsnamen. Das belegt Unterschiede in den Abrufpfaden; es beweist noch nicht die genaue Ursache der späteren leeren Auswahl. Die 20 Rohorte wurden nicht sämtlich auf vegetarische Eignung oder Lage am Wasser verifiziert. Die Lösung darf deshalb nicht einfach ungeprüfte Orte als passend freischalten.

## Unmittelbar nächster Korrekturslice

1. P03-Übergabe von Intelligence über places.v1 bis zur finalen Eignungs-/Kartenauswahl verfolgen. Request-Constraints, Providerfilter, Deduplizierung, Mindestbelege und ausgeschlossene IDs vergleichen.
2. Den gemeinsamen räumlichen und fachlichen Suchvertrag verwenden; gleiche konkrete Nutzeranforderung darf nicht still verschiedene Ortsradien oder veraltete Filterlogik erhalten.
3. Bei leerem Ergebnis ehrlich sagen, welche Belege fehlen. Keine pauschale Erfolgsmeldung „Informationen sind da“ aus einem abgeschlossenen Promise ableiten.
4. Danach denselben sichtbaren Satz und den einfachen Vergleich erneut testen. Erst bei einem belegten geeigneten Treffer Details, Favorit, Planen, Änderung und Undo fortsetzen.

## Noch nicht in diesem Lauf abgenommen

Favorit/Unfavorite, Plan/Unplan, granulare Timeline-Mutationen, Konfliktvorschau, unabhängiger Readback, Undo und vollständiger Reload-Endzustand sind nach dem gescheiterten Suchschritt **NICHT AUSGEFÜHRT**. Ihre .139-Belege bleiben historische Teilbelege. Keine Buchung, Nachricht an Anbieter, bezahlte Aktion oder Änderung an Reise-/Timeline-Daten wurde aus diesem Test vorgenommen.

Screenshot und sichtbarer Dialogtext: C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/b1-chat-counterexample-20260904.png und b1-chat-counterexample-20260904.txt. Die Gateway-Messung bezieht sich auf genau diesen Retry; sie ist keine allgemeine Aussage über alle Anbieter oder alle Anfragen. Keine Zugangsdaten sind im Beleg gespeichert.

Der positive Journey-Read ist separat in b1-journey-read-20260904.png und b1-journey-read-20260904.txt im selben Ausgabeverzeichnis dokumentiert. Die Testnachrichten wurden im realen Chat gesendet; Reise, Profil, Favoriten und Timeline wurden nicht verändert.

Dieser Gegenbeleg ordnet die Arbeit innerhalb des bereits akzeptierten A2-Abschnitts neu: zuerst P03-Lücke schließen, anschließend die vollständige Golden Journey sowie P09/P10. Der Dokument-Slice verändert keinen produktiven Runtime-Code und behauptet keinen neuen Deployment-Erfolg.
