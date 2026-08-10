# Deployment – v13.68.6 / Core 4.68.6

## 1. Frontend
Die vollständige ZIP wie gewohnt deployen.

## 2. Supabase Migration
Vom Projektordner aus:

```bash
npx supabase db push
```

Alternativ kann die Migration `supabase/migrations/20260810083600_core_v4_68_6_auth_login_boot_recovery_luvia_namespace_phase1.sql` im SQL Editor ausgeführt werden.

## 3. Edge Functions
Für v13.68.6 müssen **keine Edge Functions** neu deployed werden.

## 4. Cache
Der Service-Worker-Cache lautet `luvia-shell-v13.68.6`.
Bei einem Gerät mit hartnäckigem Altstand `/force-update.html` öffnen.

## 5. Unmittelbarer Smoke-Test
1. Bestehende eingeloggte Sitzung öffnen – App muss unverändert starten.
2. Inkognito öffnen – Public Entry/Login muss sichtbar sein.
3. Console: `await window.LuviaSupabaseClient.auth.getSession()` → `session: null` im Inkognito ist korrekt.
4. Console: `window.LuviaAuth`, `window.LuviaAuthUI`, `window.LuviaSupabaseClient` müssen vorhanden sein.
5. Login durchführen und Session-Restore nach Reload testen.

Bestehende funktionierende Geräte vor erfolgreichem Smoke-Test nicht absichtlich ausloggen.
