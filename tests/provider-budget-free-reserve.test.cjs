'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const migration=read('supabase/migrations/20260905090000_geoapify_free_budget_reserve.sql');
const budget=read('supabase/functions/luvia-gateway/_shared/provider-budget.ts');
const places=read('supabase/functions/luvia-gateway/_shared/places.ts');

assert.match(migration,/daily_limit\s*=\s*2800/,'Geoapify local daily ceiling must retain a reserve below the documented 3000-credit Free plan');
assert.match(migration,/daily_limit\s*<\s*2800/,'the migration may only raise an older conservative ceiling and must not lower a future policy');
assert.match(migration,/GEOAPIFY_FREE_BUDGET_POLICY_NOT_UPDATED/,'migration must fail closed if the intended active policy is absent');
assert.doesNotMatch(migration,/google[\s\S]{0,120}enabled\s*=\s*true|foursquare[\s\S]{0,120}enabled\s*=\s*true/i,'raising the Geoapify free reserve must not silently enable billable or unverified providers');
assert.match(budget,/reason:reservation\?\.reason\|\|'unknown'/,'budget denial must retain a bounded machine-readable reason');
assert.match(places,/reason:String\(item\?\.reason\|\|'unknown'\)\.slice\(0,80\)/,'public bounded diagnostics must disclose why an attempted provider was denied');

console.log('Provider budget free reserve and diagnostic truth: PASS');
