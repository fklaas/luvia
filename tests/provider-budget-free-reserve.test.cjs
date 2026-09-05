'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const migration=read('supabase/migrations/20260905090000_geoapify_free_budget_reserve.sql');
const googleEvidence=read('supabase/migrations/20260905153000_google_verified_profile_evidence_budget.sql');
const googleDiagnosticReset=read('supabase/migrations/20260905170000_google_fit_diagnostic_cooldown_reset.sql');
const budget=read('supabase/functions/luvia-gateway/_shared/provider-budget.ts');
const places=read('supabase/functions/luvia-gateway/_shared/places.ts');

assert.match(migration,/daily_limit\s*=\s*2800/,'Geoapify local daily ceiling must retain a reserve below the documented 3000-credit Free plan');
assert.match(migration,/daily_limit\s*<\s*2800/,'the migration may only raise an older conservative ceiling and must not lower a future policy');
assert.match(migration,/GEOAPIFY_FREE_BUDGET_POLICY_NOT_UPDATED/,'migration must fail closed if the intended active policy is absent');
assert.doesNotMatch(migration,/google[\s\S]{0,120}enabled\s*=\s*true|foursquare[\s\S]{0,120}enabled\s*=\s*true/i,'raising the Geoapify free reserve must not silently enable billable or unverified providers');
assert.match(googleEvidence,/operations\s*=\s*array\['search'\]::text\[\]/,'the Google policy may expose only the one bounded evidence search operation');
assert.match(googleEvidence,/enabled\s*=\s*true/,'the verified profile-evidence search must be explicitly enabled');
assert.match(googleEvidence,/daily_limit\s*=\s*25/,'the local Google daily ceiling must remain bounded');
assert.match(googleEvidence,/monthly_limit\s*=\s*800/,'the local Google monthly ceiling must retain 200 events below the documented 1000-event Atmosphere allowance');
assert.match(googleEvidence,/minute_limit\s*=\s*4/,'profile evidence must not fan out into a request burst');
assert.match(googleEvidence,/GOOGLE_PROFILE_EVIDENCE_POLICY_NOT_UPDATED/,'the activation must fail closed when the intended provider policy is absent');
assert.doesNotMatch(googleEvidence,/delete\s+from\s+public\.places_provider_usage/i,'activation must retain every previously reserved provider unit');
assert.doesNotMatch(googleEvidence,/provider\s*=\s*'foursquare'/i,'Google activation must not silently activate the unverified Foursquare allowance');
assert.match(googleDiagnosticReset,/blocked_until\s*=\s*null/,'the one-time diagnostic reset must clear only the active cooldown');
assert.match(googleDiagnosticReset,/operations\s*=\s*array\['search'\]::text\[\]/,'the diagnostic reset must remain scoped to the search-only Google policy');
assert.doesNotMatch(googleDiagnosticReset,/delete\s+from\s+public\.places_provider_usage/i,'the diagnostic reset must retain every reserved unit');
assert.match(googleDiagnosticReset,/GOOGLE_FIT_DIAGNOSTIC_COOLDOWN_NOT_RESET/,'the diagnostic reset must fail closed when the intended policy is absent');
assert.match(budget,/reason:reservation\?\.reason\|\|'unknown'/,'budget denial must retain a bounded machine-readable reason');
assert.match(places,/reason:String\(item\?\.reason\|\|'unknown'\)\.slice\(0,80\)/,'public bounded diagnostics must disclose why an attempted provider was denied');
assert.match(places,/'vegetarian-google-scharbeutz'[\s\S]{0,700}providers:Object\.freeze\(\['google'\]\)/,'the signed-in fit lane must have an exact bounded Google-only health probe');
assert.match(places,/version:'4\.37\.9-google-fit-diagnostic'/,'the deployed gateway must identify the fit-diagnostic source');
assert.match(places,/status:Number\(item\?\.status\)\|\|null/,'the public diagnostic must expose the bounded provider HTTP status');

console.log('Provider budget free reserve and diagnostic truth: PASS');
