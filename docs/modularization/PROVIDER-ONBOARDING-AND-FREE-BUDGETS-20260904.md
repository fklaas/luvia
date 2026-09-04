# Luvia: Anbieter einrichten und Gratis-Budgets gemeinsam nutzen

**Update Integration .37:** TomTom Search v2 und Routing, HeiGIT-Fuß-/Fahrradrouten und die zentrale Budgetreservierung sind implementiert. HERE ist nach erfolgreichen Live-Tests für Suche, Details, Unterkünfte und Fuß-/Fahrradrouten aktiviert: gemeinsamer lokaler Deckel 500/Tag, 10.000/Monat, 10/Minute. Die Screenshots zeigen technische Raten; das individuelle kostenlose Abrechnungsvolumen ist dadurch nicht bestätigt. Der tatsächliche TomTom-Adapter nutzt Search v2 mit öffentlich 2.500 kostenlosen Suchaufrufen pro Monat, nicht die unten als ursprüngliche Option beschriebene Orbis-API. Die früheren Implementierungsschritte unten sind als Onboarding-Plan zu lesen; der verbindliche aktuelle Stand und die lokalen Limits stehen in der [Provider-Abnahme](PROVIDER-BUDGET-ACCEPTANCE-20260904.md).

Stand: 04.09.2026. Diese Anleitung trennt vorhandene Anbindungen, neue Konten und offene Datenimporte. Ein hinterlegter Schlüssel aktiviert allein noch keine neue Integration. Die hier vorgeschlagenen neuen Secret-Namen werden beim jeweiligen Adapter verwendet. Kein bezahlter Tarif wurde durch diese Anleitung aktiviert.

## Einmalig: Schlüssel übergeben

1. [Supabase öffnen](https://supabase.com/dashboard/project/yiadkcxgyzdgyadnhyqe/functions/secrets), das Luvia-Projekt wählen und zu **Edge Functions → Secrets** gehen.
2. **Add new secret** wählen. Den unten genannten Namen und den Schlüssel eintragen, dann speichern. Bestehende Schlüssel nur bei einer bewussten Rotation ersetzen.
3. Im Chat genügt: **„TOMTOM_API_KEY ist hinterlegt; im Konto stehen diese kostenlosen Limits: …“**. Schlüssel nicht in Chat, Screenshots, Git oder Frontend-Code kopieren. Kontingent-/Tarifansichten können ohne Schlüssel geteilt werden.
4. Codex verbindet den serverseitigen Adapter, prüft Authentifizierung und konkrete Funktionen, erfasst die tatsächlich verfügbaren Gratis-Grenzen und testet die Integration sichtbar. Eine reine Budgetwarnung beim Anbieter ist kein harter Kostenstopp.

[Supabase-Anleitung für Secrets](https://supabase.com/docs/guides/functions/secrets).

## A — TomTom: als ersten zusätzlichen Live-Anbieter einrichten

1. Bei [MyTomTom](https://my.tomtom.com/) registrieren und E-Mail bestätigen.
2. **API & SDK Keys** öffnen. Den vorhandenen Schlüssel **My first API key** auswählen oder einen eigenen Schlüssel für Luvia erstellen.
3. Die Berechtigung für **Orbis Places Search Discover/Details** und bei Bedarf Routing prüfen. Für unseren Serverzugriff müssen die gewählten Restriktionen passen; ein Browser-Referer ist kein Ersatz für eine Serverberechtigung.
4. Schlüssel als **TOMTOM_API_KEY** in Supabase speichern. Im Konto angezeigte Limits/Reset-Zeiträume mitteilen. Keinen kostenpflichtigen Plan für diesen Schritt buchen.
5. Codex implementiert Suche, Kategorien/Küchen-Normalisierung, genaue Ortszuordnung und Fehlerbehandlung. Danach folgen vergleichbare Scharbeutz-Abfragen, Budgetgrenztests und Places/Stays-Browsertests. Erst dann nimmt die gemeinsame Steuerung TomTom auf.

Die öffentliche Preisseite nennt aktuell monatlich 5.000 Discover-, 5.000 Details- und 20.000 Routing-Anfragen im jeweiligen Freikontingent. Maßgeblich für die Aktivierung bleibt das konkrete Konto. Die gesonderte Points of Interest API für Fotos ist dort als Automotive-Angebot ausgewiesen; daher keine pauschale TomTom-Fotogarantie.

[Schlüssel-Anleitung](https://docs.tomtom.com/platform/documentation/my-tomtom/how-to-get-a-tomtom-api-key) · [Preise und APIs](https://docs.tomtom.com/pricing).

## B — HERE: ergänzende Suche und Routing

1. Über [HERE](https://www.here.com/get-started/pricing) ein Konto für den geeigneten kostenlosen Einstieg anlegen. Die tatsächlich angebotenen Nutzungsrechte und Limits notieren.
2. In der Plattform **Access Manager → Apps** öffnen und eine App **Luvia** anlegen.
3. In dieser App **Credentials → API Keys → Create API key** wählen.
4. Als **HERE_API_KEY** in Supabase speichern; vorhandene Freigaben für Search/Geocoding und Routing mitteilen.
5. Codex prüft den Zugang und bindet nur die für dieses Konto verfügbaren Dienste ein. Kategorieabdeckung, Fußgängerrouten, Lizenzregeln und Limits werden vor Freischaltung überprüft.

[Offizielle Schlüsselschritte](https://docs.here.com/identity-and-access-management/docs/plat-using-apikeys). Historische pauschale Monatskontingente werden nicht als aktuelle Zusage übernommen.

## C — Geoapify: bereits angebunden, vorhandenes Konto verwenden

1. Im bestehenden [Geoapify-Projekt](https://myprojects.geoapify.com/) anmelden. Keine zweite Registrierung nötig.
2. Tarif und Nutzung prüfen. Aktuell nennt die öffentliche Free-Preisliste 3.000 Credits pro Tag.
3. Der bestehende Server nutzt **GEOAPIFY_API_KEY** (alternativ GEOAPIFY_KEY). Einen funktionierenden Schlüssel nicht unnötig austauschen.
4. Codex übernimmt den tatsächlichen Verbrauch in die gemeinsame Zählung. Places wird nach Ergebnisumfang berechnet: je 20 Ergebnisse ein Credit; 500 Ergebnisse können daher 25 Credits verbrauchen. Ein großer gemeinsam genutzter Abruf lohnt sich nur bei entsprechender Wiederverwendung.
5. Suche und Routing behalten getrennte Kostenmodelle, obwohl sie dasselbe Konto belasten.

[Projektstart](https://www.geoapify.com/get-started-with-maps-api/) · [Places-Kosten](https://apidocs.geoapify.com/docs/places/).

## D — Foursquare API: vorhandenes Konto und Entitlements prüfen

1. In der [Foursquare-Konsole](https://foursquare.com/developers/) das bestehende Luvia-Projekt öffnen. Der zuletzt getestete Zugang meldete keine verbleibenden Credits.
2. Nutzungs- und Tarifansicht prüfen. Die API-Dokumentation nennt seit Juni 2026 500 kostenlose Pro-Aufrufe; Foto-/Premium-Berechtigungen daraus nicht ableiten.
3. Falls ein neuer oder passender Schlüssel erforderlich ist: **Project Settings → API Keys → Generate API Key**, mit erkennbarem Namen für Luvia.
4. Als **FOURSQUARE_API_KEY** in Supabase speichern. Vorher klären, ob der neue Schlüssel zum bereits verwendeten API-Produkt und den benötigten Endpunkten passt.
5. Codex prüft Migration, Suche und gegebenenfalls Fotos separat. Die Quelle wird nur für freigegebene Funktionen mit verfügbarem Budget aktiviert. Ein neuer Schlüssel vergrößert das Kontingent desselben Kontos nicht.

[Schlüsselverwaltung](https://docs.foursquare.com/developer/docs/manage-api-keys) · [Preis-/API-Änderungen](https://docs.foursquare.com/developer/reference/upcoming-changes).

## E — Google Maps Platform: bestehendes Projekt, gezielte Nutzung

1. Im bestehenden [Google-Cloud-Projekt](https://console.cloud.google.com/) anmelden; vorhandene Maps-Konfiguration prüfen.
2. **APIs & Services → Credentials** öffnen. Bestehenden Server-Schlüssel und dessen API-Beschränkungen prüfen. **GOOGLE_PLACES_API_KEY** wird bereits vom Gateway unterstützt.
3. Benötigte API, Kontingente pro abrechenbarer Funktion und Rechnungsland feststellen. Budgetwarnungen verhindern keine Ausgaben; providerseitige Quoten und unsere eigenen harten Grenzen sind getrennt einzurichten.
4. Codex prüft vor weiterer Karten-/Foto-Nutzung die konkret anwendbaren Bedingungen. Für EWR-Abrechnung enthalten die Places-Bedingungen Beschränkungen für Kartenverwendung und eine Ausnahme für Places UI Kit.
5. Erst danach entscheidet sich, welche Google-Funktion in welchem UI und mit welchem Budget genutzt werden kann. Kein automatisches Einspeisen sämtlicher Google-Inhalte in den gemeinsamen offenen Ortsbestand.

[Google-EWR-Bedingungen](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms).

## F — openrouteservice / HeiGIT: optionaler Fußweg-Anbieter

1. Über die [HeiGIT-API-Seite](https://api.heigit.org/) ein Konto anlegen und bestätigen.
2. Im Konto den geeigneten Plan und dessen Nutzungsbedingungen prüfen, anschließend einen API-Schlüssel erstellen.
3. Als **OPENROUTESERVICE_API_KEY** speichern und die angezeigten Directions-/Matrix-Limits mitteilen.
4. Codex prüft insbesondere Fußgängerrouting, kommerzielle Zulässigkeit des gewählten Plans und Limits. Bei erfolgreicher Prüfung ergänzt der Adapter die Routensteuerung. Er liefert keine Restaurantfotos oder Hotelpreise.

## G — OpenFreeMap: bereits aktiv, kein Schlüssel nötig

Fabian muss kein Konto eröffnen. Die Kartenbasis ist bereits eingebaut. Codex hält Attribution, Stil und Fehlerbehandlung aktuell. Die öffentliche Instanz nennt keine Request-/View-Limits, bietet derzeit aber keine SLA-Garantie. [OpenFreeMap](https://openfreemap.org/).

## H — Overture Places: offener Import, kein API-Schlüssel nötig

1. Fabian braucht für den öffentlichen Datensatz keinen neuen Anbieter-Schlüssel.
2. Codex lädt einen begrenzten regionalen Ausschnitt, zunächst Scharbeutz plus Umgebung, anhand der [offiziellen Zugriffsmöglichkeiten](https://docs.overturemaps.org/guides/places/).
3. Vor produktivem Import werden Herkunft, Lizenz, Stand, Kategorien, Identität und Dubletten geprüft. Overture-GERS-IDs werden als Quellreferenzen erhalten.
4. Der freigegebene regionale Bestand wird hinter dem bestehenden Places-Owner bereitgestellt und aktualisiert. Speicherung, Importjobs und Auslieferung verbrauchen eigene Infrastruktur; offene Daten bedeuten nicht unbegrenzte kostenlose Serverleistung.

## I — Foursquare Open Source Places: ebenfalls kein Places-API-Key nötig

Fabian braucht hierfür kein zweites Foursquare-API-Kontingent. Codex nutzt die [öffentlichen Datensatz-Zugänge](https://docs.foursquare.com/data-products/docs/access-fsq-os-places), prüft den zusätzlichen Nutzen gegenüber Overture und importiert passende regionale Daten. Enthaltene Foursquare-Referenzen verhindern doppelte Orte. Ein offener POI-Datensatz umfasst nicht automatisch die kommerzielle Fotobibliothek.

## J — Wikimedia/Wikidata: ergänzende belegte Bilder

Für öffentliche Lesezugriffe ist keine normale kostenpflichtige Kartenregistrierung vorgesehen. Codex erweitert die bereits vorhandene Commons-Zuordnung nur anhand eindeutig passender Ortsreferenzen. Bildautor, Lizenz und Quelle bleiben am Bild. Kein beliebiges Bild eines ähnlich benannten Restaurants. Vollständige Bildabdeckung kann diese Quelle allein nicht liefern.

## K — Open Data Germany / touristische Daten

1. [Zugang für Datennutzer](https://open-data-germany.org/en/test-access-for-data-retrieval/) öffnen.
2. Laut aktueller Anleitung per E-Mail an **open-data@germany.travel** mit Unternehmen, Kontaktname und E-Mail-Adresse den API-Zugang anfragen. Fabian versendet diese Anfrage selbst; es wurde keine E-Mail durch Codex gesendet.
3. Erhaltene Zugangsdaten als **GERMANY_TOURISM_API_KEY** in Supabase speichern; zugehörige Endpoint-/Zugangsinformationen ohne Schlüssel mitteilen.
4. Codex prüft regionale Abdeckung und Rechte auf Datensatz- und Bildebene. Anschließend werden touristische Orte, Beschreibungen und passende Bilder ergänzt. Weitere regionale Tourismusschnittstellen werden nach demselben Muster geprüft.

## Die gemeinsame Logik: verbindlicher Implementierungsablauf

Die mobile Reparatur enthält bereits aktuelle lokale Ortsprojektionen und das Zusammenfassen identischer laufender Suchanfragen. Ein vollständiger verteilter Gratis-Budgetrouter für neue Anbieter ist damit noch nicht live. Er wird vor deren automatischer Nutzung im bestehenden Gateway und Places-Owner ergänzt:

1. **Fähigkeiten und Freigaben:** Registry pro Anbieter/Endpunkt mit Such-, Detail-, Bild- und Routing-Fähigkeiten, Region, Tarif, Reset-Zeitzone, Kostenmodell, Quellenanzeige und Speicherregeln. Neue Anbieter starten deaktiviert. Unbekanntes Restkontingent heißt nicht unbegrenzt.
2. **Atomare Reservierung:** Persistenter serverseitiger Zähler reserviert den geschätzten Verbrauch vor dem Aufruf. Alle Nutzer und Edge-Instanzen teilen ihn. Parallelität kann das Limit nicht mehrfach ausgeben. Ein reiner JavaScript-Zähler in einer Edge-Instanz reicht nicht.
3. **Kostenfreie Auswahl:** Zuerst zulässige aktuelle gespeicherte Daten, dann geeigneter Anbieter mit freiem reservierbarem Budget. Standard ist keine bezahlte Überschreitung. Bei erreichtem Limit/429/Fehler übernimmt ein geeigneter Ersatz mit begrenzten Versuchen. Fallback-Schleifen sind ausgeschlossen.
4. **Reale Abrechnung:** Credits, Requests und Matrixelemente werden nicht gleichgesetzt. Fehlgeschlagene/abgebrochene Requests können bereits berechnet sein; sie werden konservativ gezählt, bis eine sichere Abrechnung vorliegt. Gemeinsam außerhalb Luvias verwendete Keys brauchen Reserve und Abgleich mit dem Providerkonto.
5. **Datenqualität:** Einheitliche Ortsidentität und Feldherkunft. Eine Quelle kann Standort liefern, eine andere belegte Küche oder ein Foto. Widersprüche bleiben Konflikte. Zehn APIs mit denselben Grunddaten zählen nicht als zehn unabhängige Bestätigungen.
6. **Cache und Privatsphäre:** Regionen-/Sprach-/Filter-/Quellabhängige Schlüssel; keine falsche Vollständigkeit bei abgeschnittenen Ergebnissen. Gemeinsamer Cache enthält zulässige Ortsfakten, keine privaten Reiseprofile. Passung wird pro Reise/Profil neu berechnet. Google-Inhalte werden nach eigener Policy getrennt behandelt.
7. **Sichtbare Abnahme:** Verbrauchsübersicht ohne Schlüssel, konkrete Ausfall-/Limit-/Reset-Tests, Test gleichzeitiger Anfragen und Places/Stays-Browsertests. Nach Erschöpfung bleiben gespeicherte Daten verwendbar, soweit erlaubt; fehlende Aktualität wird angezeigt.

Empfohlene Konto-Reihenfolge: **TomTom → HERE → vorhandene Geoapify/Foursquare-Konditionen prüfen → optional HeiGIT und touristischer API-Zugang**. OpenFreeMap, Overture, Foursquare Open Source und öffentliche Commons-Lesezugriffe benötigen keine vergleichbare Schlüsselübergabe. Erst wenn diese Quellen nachweislich laufen, werden weitere Anbieter nach Abdeckung und Kosten hinzugefügt.
