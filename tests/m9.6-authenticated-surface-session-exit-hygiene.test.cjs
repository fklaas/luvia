'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const shell=read('app/app-shell.js');
const profile=read('core/profiles/profile-foundation.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

const start=shell.indexOf("if(action.type==='session.deactivate'){");
const end=shell.indexOf("\n    }",start);
assert(start>=0&&end>start,'App Shell session.deactivate branch missing');
const sessionExit=shell.slice(start,end);
const closeIndex=sessionExit.indexOf('window.LuviaProfileFoundation?.close?.()');
const unmountIndex=sessionExit.indexOf("await unmountCurrent('session.deactivate')");
const hydrateIndex=sessionExit.indexOf('await hydrateForAuth(client,authState)');

assert(closeIndex>0,'Session deactivation must close the authenticated Profile surface');
assert(unmountIndex>closeIndex,'Authenticated overlays must close before the current module is unmounted');
assert(hydrateIndex>unmountIndex,'Signed-out hydration must follow authenticated surface cleanup');
assert.match(sessionExit,/if\(authState\?\.authenticated\)return/,'A stale deactivation effect must not close an authenticated session');
assert.doesNotMatch(sessionExit,/\.auth\.|supabase|localStorage|sessionStorage/,'App Shell cleanup must not read private Auth or browser storage truth');
assert.match(profile,/LuviaProfileFoundation=Object\.freeze\(\{[^}]*close/,'Profile Foundation must expose its owner cleanup command');
assert(safeRunner.includes('tests/m9.6-authenticated-surface-session-exit-hygiene.test.cjs'),'M9.6 session-exit hygiene guard missing from Safe Regression');

console.log('M9.6 Authenticated Surface Session Exit Hygiene: PASS');
