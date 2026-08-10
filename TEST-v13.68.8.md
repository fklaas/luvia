# Test v13.68.8

Automatisch geprüft:

- `LUVIA_V13_68_8_APP_BOOTSTRAP_RENDER_GUARANTEE_OK`
- `LUVIA_V13_54_4_ATOMIC_STATUS_SIGNAL_RETRY_FIX_OK`
- `Place detail capability routing: OK`
- `node --check app/app-shell.js`
- `node --check app/public-entry.js`
- `node --check sw.js`

Manueller Production-Smoke-Test nach Deployment:

1. neues Inkognito-Fenster
2. `https://myluvia.app` öffnen
3. Start-/Login-Screen muss ohne Eingriff erscheinen
4. `window.LuviaBootDiagnostics` prüfen
5. `#app.children.length >= 1`
