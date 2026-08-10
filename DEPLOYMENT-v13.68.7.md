# Deployment – v13.68.7 / Core 4.68.7

1. Vollständigen Inhalt dieser ZIP als Frontend deployen.
2. Im Projektordner die neue Release-Migration anwenden:

```bash
npx supabase db push
```

3. Für v13.68.7 müssen **keine Edge Functions** neu deployed werden.
4. Falls ein Browser alte Assets hält: `https://myluvia.app/force-update.html` öffnen.

Service-Worker-Cache: `luvia-shell-v13.68.7`.

## Smoke Test

In einem InPrivate-/Inkognito-Fenster `https://myluvia.app` öffnen. Ohne Session muss der Luvia Public Entry sichtbar sein. Danach:

```js
await window.LuviaSupabaseClient.auth.getSession()
```

`session: null` ist korrekt. Außerdem:

```js
window.LuviaGuidedJourneyEntry.render()
document.querySelector('#app')?.children.length
```

Der zweite Ausdruck muss größer als `0` sein.
