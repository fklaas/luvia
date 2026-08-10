# Luvia v13.68.6 / Core 4.68.6

## Auth Login Boot Recovery & Paris→Luvia Namespace Migration Phase 1

### Behoben
- Frische Browser-/Inkognito-Sitzungen mit `session: null` können nicht mehr in einem leeren App-Hintergrund hängen bleiben.
- Der Public Entry aktiviert nun zuerst einen sichtbaren Screen und bindet erst danach Interaktionen.
- Die App Shell überwacht den Signed-out-Mount und rendert bei unvollständigem Entry automatisch ein unabhängiges Login-Fallback.
- Beim Wechsel von Public Entry zu einer authentifizierten App werden Entry-spezifische CSS-Klassen vollständig entfernt.

### Namespace Phase 1
Neue kanonische Runtime-Globals:
- `window.LuviaAuth`
- `window.LuviaAuthUI`
- `window.LuviaSupabaseConfig`
- `window.LuviaSupabaseClient`

Bestehende Namen bleiben in Phase 1 als Compatibility-Aliase erhalten:
- `window.ParisAuth`
- `window.ParisAuthUI`
- `window.ParisSupabaseConfig`
- `window.ParisSupabaseClient`

Der zentrale Core verwendet ab diesem Release bevorzugt die Luvia-Namen. Reisebezogene Paris-Daten werden nicht umbenannt.

### Persistente Auth-Keys
Neue kanonische Keys:
- `luviaAuthPendingUpgradeV2`
- `luviaAuthExplicitlySignedOutV1`

Alte `parisAuth*`-Keys werden beim Start übernommen und in Phase 1 weiterhin gespiegelt. Supabase-Session-Storage wird nicht verändert.

### Auth Events
Kanonisch: `luvia:auth-changed`.
`paris:auth-changed` wird vorübergehend zusätzlich emittiert, damit noch nicht migrierte Module kompatibel bleiben.

### Nicht Teil von Phase 1
- Keine Umbenennung realer Paris-Reisedaten.
- Keine Änderung bestehender Supabase Auth User/Sessions.
- Keine Tabellen-/RLS-/Storage-Bucket-Renames.
- `legacy/paris/*` bleibt bewusst als Legacy-/Migrationsbereich bestehen.
