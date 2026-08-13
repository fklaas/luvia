# Deployment — M2

## Deployment status

**NO DEPLOYMENT REQUIRED.** M2 is documentation/contract specification only.

### Supabase
- DB migrations: **none**
- `npx supabase db push`: **DO NOT RUN**
- migration repair: **DO NOT RUN**
- Edge Function deploys: **none**
- secrets: **none changed**

### Cloudflare / Worker
- `npx wrangler deploy`: **DO NOT RUN for M2**
- `wrangler.jsonc`: unchanged
- production Worker: unchanged

### Git integration
After extracting/copying this build onto the verified local repository, confirm the only intended changes are the M2 documentation artifacts:

```powershell
git status --short
git diff --stat
git diff -- docs/modularization RELEASE-NOTES-M2.md TEST-RESULTS-M2.md DEPLOYMENT-M2.md CHANGED-FILES-M2.txt
```

Then commit with:

```powershell
git add docs/modularization RELEASE-NOTES-M2.md TEST-RESULTS-M2.md DEPLOYMENT-M2.md CHANGED-FILES-M2.txt
git commit -m "M2: module ownership and contract specification"
```

Do not deploy the application merely to publish documentation. Push the commit only after verifying the diff.
