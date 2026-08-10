# Luvia v13.68.8 / Core 4.68.8 – Deployment

## Ziel
App Bootstrap Render Guarantee & Auth Init Race Fix.

## Deployment
1. Vollständigen Inhalt dieser ZIP als Frontend deployen.
2. Im verlinkten Supabase-Projekt aus dem Projektordner ausführen:

```bash
npx supabase db push
```

Für v13.68.8 müssen keine Edge Functions neu deployed werden.

## Cache / frische Geräte
Der Service-Worker-Cache lautet `luvia-shell-v13.68.8`.
Bei einem Gerät mit alten Assets `https://myluvia.app/force-update.html` öffnen und anschließend neu laden.

## Smoke Test
In einem neuen InPrivate-/Inkognito-Fenster `https://myluvia.app` öffnen. Der öffentliche Luvia-Start-/Login-Screen muss ohne Console-Aufruf erscheinen.

Danach optional:

```js
window.LuviaApp.version
window.LuviaApp.diagnostics()
window.LuviaBootDiagnostics
await window.LuviaSupabaseClient.auth.getSession()
document.querySelector('#app')?.children.length
```

Erwartung: Version `13.68.8`, `session: null`, `error: null`, `#app.children.length >= 1`.
