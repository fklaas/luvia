# Deployment v13.81.4

## 0. Ziel
Deploy **Luvia v13.81.4 / Core 4.81.4 – Mutation Thread Bootstrap, Mobile Mutation Surface & Discovery Fetch Hardening** auf Basis des vollständigen ZIP-Builds.

Wichtig: Dieser Patch enthält **keine Datenbankmigration**. Wegen der historisch nicht vollständig sauberen Migration-History für diesen Build **kein** `npx supabase db push` ausführen.

## 1. Lokalen Projektordner vorbereiten
Die neue vollständige v13.81.4-ZIP in einen frischen Ordner entpacken und dort ein Terminal öffnen.

Optional zuerst die Version prüfen:

```bash
node -e "const fs=require('fs'); console.log(fs.readFileSync('CURRENT-BUILD.md','utf8'))"
```

Erwartet:
- App 13.81.4
- Core 4.81.4

## 2. Supabase-Projekt prüfen
Die bestehenden Supabase-CLI-Kommandos immer über `npx` ausführen.

```bash
npx supabase projects list
```

Falls der lokale Ordner noch nicht mit dem Luvia-Projekt verknüpft ist:

```bash
npx supabase link --project-ref yiadkcxgyzdgyadnhyqe
```

Danach **nicht** `npx supabase db push` ausführen.

## 3. Datenbank / SQL
### Deployment-Status
- DB-Migration: **NEIN**
- neues Schema: **NEIN**
- SQL zur Installation: **NEIN**

Die vorhandenen Tabellen/RPCs werden wiederverwendet:
- `bookings`
- `booking_email_threads`
- `booking_messages`
- `booking_email_delivery_events`
- `booking_contact_candidates`
- `booking_discovery_runs`
- `booking_mutations`
- `booking_status_signals`
- `booking_events`
- `luvia_booking_email_verified_candidate(...)`
- `luvia_booking_record_mutation_fallback(...)`

`SMOKE-v13.81.4.sql` ist ausschließlich für **read-only Production-Smoke-Checks** gedacht und wird nicht als Migration ausgeführt.

## 4. Edge Functions deployen
Drei Functions haben sich geändert und müssen in dieser Reihenfolge deployed werden:

```bash
npx supabase functions deploy booking-contact-resolve
npx supabase functions deploy booking-route-resolve
npx supabase functions deploy booking-email-reply
```

Warum diese Reihenfolge:
1. Contact Resolver zuerst, damit Mutation-Fallbacks den gehärteten Verifikationspfad verwenden können.
2. Route Resolver danach, damit Routing-/Google-Diagnostics auf demselben Fetch-Contract stehen.
3. Reply Function zuletzt, damit der Thread-Bootstrap erst live geht, wenn Contact Verification bereits aktuell ist.

`supabase/config.toml` behält für alle drei Functions `verify_jwt = true`. Kein `--no-verify-jwt` ergänzen.

## 5. Secrets prüfen
Neue Secrets sind **nicht** erforderlich.

Der Build verwendet weiterhin die bestehenden Function-Umgebungswerte, insbesondere:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `BOOKING_EMAIL_FROM`
- optionaler Legacy-Fallback `BOOKING_FROM`
- `BOOKING_INBOUND_DOMAIN`
- `BOOKING_MODE`
- in Test-Mode ggf. `BOOKING_TEST_RECIPIENT`

Secrets nicht neu setzen, wenn sie bereits korrekt produktiv vorhanden sind.

## 6. Statische App deployen
Der ZIP enthält keinen eigenen Wrangler-Projekt-Config-File und kein `package.json`. Deshalb keine erfundene Cloudflare-Projekt-ID verwenden.

### Variante A – bestehender GitHub → Cloudflare Pages Workflow
Wenn das Luvia-Repository wie bisher über GitHub an Cloudflare angebunden ist:

```bash
git status
git add .
git commit -m "fix(luvia): bootstrap mutation threads and harden booking discovery v13.81.4"
git push
```

Danach in GitHub/Cloudflare kontrollieren, dass der Commit tatsächlich als Production Deployment gebaut und veröffentlicht wurde.

### Variante B – direkter Cloudflare Pages Upload
Wenn du direkt mit Wrangler deployest, lautet der aktuelle Pages-Befehl:

```bash
npx wrangler pages deploy . --project-name <DEIN_CLOUDFLARE_PAGES_PROJEKT>
```

`<DEIN_CLOUDFLARE_PAGES_PROJEKT>` muss durch den tatsächlich vorhandenen Luvia-Pages-Projektnamen ersetzt werden. Nicht raten.

## 7. Service Worker / Cache
Neuer Cache-Key:

```text
luvia-shell-v13.81.4
```

Nach erfolgreichem Static Deployment:
1. alle offenen Luvia-Tabs schließen
2. Luvia erneut öffnen
3. bei auffälligem Altstand DevTools → Application → Service Workers prüfen
4. notfalls einmal `force-update.html` bzw. den etablierten Cache-Clear-Weg verwenden
5. anschließend hart neu laden

Browser Console:

```js
LuviaKernelVersion
```

Erwartet:

```js
{
  core: '4.81.4',
  build: '13.81.4',
  name: 'Mutation Thread Bootstrap, Mobile Mutation Surface & Discovery Fetch Hardening',
  channel: 'production'
}
```

## 8. Green Farmer's – Resolver Production Smoke
Echte Booking-ID:

```text
046bcb5c-0942-48f7-b8e1-292eb4de60c7
```

In der eingeloggten Luvia-Browser-Console:

```js
await LuviaBookingIntegration.resolveContact('046bcb5c-0942-48f7-b8e1-292eb4de60c7')
```

Prüfen:
- kein bloßes `OFFICIAL_WEBSITE_FETCH_FAILED` ohne Diagnostics
- `fetchDiagnostics` vorhanden
- `finalUrl` gesetzt, wenn die Website erreichbar ist
- Redirect Chain nachvollziehbar, falls Domainwechsel stattfindet
- `pagesChecked > 0`
- venue-spezifischer Kandidat kann verifiziert werden
- generische Provider-Mail wird nicht akzeptiert

Danach:

```js
await LuviaBookingIntegration.resolveRoute('046bcb5c-0942-48f7-b8e1-292eb4de60c7')
```

Auch hier Diagnostics auf `httpStatus`, `finalUrl`, `fetchDiagnostics`, `existingContactPresent` und `existingContactVerified` prüfen.

## 9. Green Farmer's – Mutation Thread Bootstrap
Vorher über `SMOKE-v13.81.4.sql` prüfen, ob bereits ein `booking_email_thread` existiert.

### Erwarteter Bootstrap-Fall
Wenn **kein** Thread existiert, aber der Kontakt als sicher verifiziert wurde:
1. Control Center → Buchungen
2. Green Farmer's öffnen
3. `Ändern`
4. auf Mobile muss eine echte Fullscreen-Seite erscheinen
5. Bottom Navigation darf nicht sichtbar sein
6. der Hauptbutton muss vollständig oberhalb der Safe Area sichtbar sein
7. eine ungefährliche, höfliche Änderungs-/Rückfrage nur dann tatsächlich senden, wenn der Live-Test beim realen Anbieter vertretbar ist
8. danach SQL-Smoke erneut ausführen

Erwartet nach echtem Versand:
- neuer `booking_email_threads`-Datensatz
- `reply_alias` gesetzt
- Thread `awaiting_reply`
- outbound `booking_messages`-Eintrag
- `correlation_method = outbound_mutation_thread_bootstrap`
- Mutation/Audit-Eintrag vorhanden
- Booking nicht allein wegen Versand `confirmed` oder `cancelled`
- `provider_outcome_known = false` im Mutation-Fallback-Kontext

### Cancel
Die UI und der Bootstrap-Code für `cancel` werden lokal/strukturell getestet. **Keine echte Stornierungsnachricht an einen realen Anbieter senden**, sofern es sich nicht ausdrücklich um eine entbehrliche Testbuchung handelt. Für einen normalen Production-Smoke reicht: Stornierungs-Surface öffnen, Footer prüfen, dann `Zurück`.

## 10. Mobile UI Smoke
Auf einem echten iPhone oder Chrome Device Emulation mit schmalem Viewport:

### Modify
- Control Center → Buchungen → Buchung → Ändern
- eigener Header `← Buchung`
- Seite füllt `100dvh`
- Body scrollbar
- Footer bleibt eigener unterer Layoutbereich
- `.luvia-shell-nav` und `.lv-dock-wrap` nicht sichtbar
- kein Button unter der globalen Navigation
- Zurück führt wieder zur Booking Detail Surface

### Cancel
Dasselbe mit `Stornieren` wiederholen.

Desktop zusätzlich prüfen:
- Modify/Cancel bleiben als Modal erhalten
- globale Desktop-Navigation bleibt unverändert

## 11. Google Reserve Production Smoke
Ein reales Restaurant in Google Maps wählen, bei dem `Tisch reservieren` angeboten wird. Den tatsächlichen Google-Reserve-/Handoff-Link und – soweit im Browser sichtbar – den Zielpartner notieren.

Dann mit Luvia denselben Handoff prüfen, z. B.:

```js
await LuviaBookingIntegration.resolvePlaceRoute({
  name: 'RESTAURANTNAME',
  type: 'restaurant',
  website: 'OFFIZIELLE_WEBSITE',
  reservationUrl: 'GOOGLE_RESERVE_ODER_HANDOFF_URL'
})
```

Erwartete Diagnostics:
- `googleReserveDetected === true`, wenn der Input tatsächlich Google Reserve ist
- `googlePartnerIdentified` enthält z. B. `thefork` oder `opentable`, wenn der finale Handoff eindeutig darauf endet
- `googleExternalBookingLink` enthält den erreichbaren Handoff/finalen Link
- `googleDirectIntegration === false` **immer**
- `provider`/`channel` entsprechen dem tatsächlich validierten Handoff

Kein Actions-Center-Partnerzugang wird durch diesen Smoke-Test simuliert.

## 12. Console Checks
Während aller Smokes die Browser Console offen halten.

Nicht akzeptabel:
- ungefangene JavaScript Exceptions
- `booking-email-reply` 500/502 ohne verständliche UI-Rückmeldung
- Resolver 500 durch Redirect-Handling
- wiederholte Auth-401 bei normal eingeloggtem Nutzer
- `EMAIL_THREAD_REQUIRED` bei einem validen Modify/Cancel-Bootstrap-Fall
- `[object Object]` im Nutzer-UI

Akzeptabel/erwartbar:
- kontrollierte `expected` Providerzustände, die in den sicheren Fallback gehen
- `googleDirectIntegration: false`
- technische Diagnostics in Developer Console, nicht als Consumer-Fehlercode

## 13. SQL-Smoke
Im Supabase SQL Editor `SMOKE-v13.81.4.sql` abschnittsweise ausführen.

Wichtig:
- das File führt keine Writes aus
- vor und nach einem echten Mutation-Smoke vergleichen
- besonders Booking Status, Thread, Messages, Candidates, Mutations, Status Signals und Events prüfen

## 14. Post-Deployment-Abnahme
v13.81.4 erst als vollständig produktiv bestätigt markieren, wenn:
- App 13.81.4 / Core 4.81.4 sichtbar
- alle drei Edge Functions deployed
- Mobile Modify/Cancel auf echtem Mobile nicht mehr von Bottom Nav verdeckt
- Green Farmer's Resolver aus Supabase Edge Runtime mindestens Seiten laden/diagnostizieren kann
- verifizierter Venue-Kontakt entsteht bzw. bestehender verifizierter Candidate wiederverwendet wird
- fehlender Thread bei einem sicheren Mutation-Fall gebootstrapped werden kann
- Nachricht/Audit/Thread miteinander korrelieren
- Booking Truth nicht fake-finalisiert wird
- Google Smoke `googleDirectIntegration: false` bestätigt

## 15. Nicht lokal real testbar
Der lokale Build kann nicht beweisen:
- dass die produktive Supabase Edge Runtime jede externe Venue-Website abrufen darf
- dass Resend die konkrete nächste Live-Nachricht tatsächlich `Delivered` meldet
- dass ein realer Anbieter antwortet
- welches aktuelle Restaurant bei Google Maps welchen Reserve-Partner verwendet
- wie Cloudflare den Build auf dem tatsächlichen Produktiv-Account ausliefert

Diese Punkte gehören ausdrücklich in den Production-Smoke nach Deployment.
