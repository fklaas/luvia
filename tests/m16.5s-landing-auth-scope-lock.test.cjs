'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const read=file=>fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const referenceRoot='C:/Users/fabia/Documents/ChatGPT/Luvia/m16.5-design-foundation/prototype-rq';
const reference=Object.freeze({
  'landing.html':'3e25d9fd8027ede08d8eb4b323a4a1d9c8de0f114cb19d6796db2625a5bd5d83',
  'landing.css':'a7f1ac1f6d8fd17f1d4d0852f1cc06915e1971095500a9eff4e09ad9bc260d40',
  'landing.js':'119e0bcb1dc4a01ca1e62682a71321ca4749f21c68edb7badabd93b8dca6c288',
  'experience-motion.css':'fa3666704882b18544011782b5a9bcda071dab37fccbe560c6a78c516a2a05a0',
  'experience-motion.js':'23c8a076cbd5bd771ee2b0547e0b8cdbe85c6710db20e2bfc280c59d49e475ad'
});
for(const [file,expected] of Object.entries(reference)){
  const target=path.join(referenceRoot,file);
  assert(fs.existsSync(target),`accepted Landing reference missing: ${file}`);
  assert.equal(sha(target),expected,`accepted Landing reference changed: ${file}`);
}

const scope=read('docs/modularization/M16.5S-LANDING-AUTH-BASELINE-AND-SCOPE-LOCK.md');
const session=read('auth/session.js');
const authUi=read('auth/ui.js');
const shell=read('app/app-shell.js');
const matrix=read('docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const runner=read('tests/run-m4.3-safe-regression.cjs');

for(const state of [
  'BOOT_LOADING','LANDING_READY','LOGIN_IDLE','LOGIN_INVALID','LOGIN_PENDING','LOGIN_ERROR','LOGIN_SUCCESS',
  'REGISTER_IDLE','REGISTER_PENDING','REGISTER_CONFIRM_EMAIL','REGISTER_ERROR',
  'RECOVERY_REQUEST_IDLE','RECOVERY_REQUEST_PENDING','RECOVERY_REQUEST_SENT','RECOVERY_CALLBACK_VALID','RECOVERY_CALLBACK_INVALID',
  'OAUTH_PENDING','OAUTH_ERROR','SESSION_RESTORE','SESSION_EXPIRED','SIGNOUT_RETURN','INVITE_PENDING','OFFLINE_OR_TIMEOUT'
])assert(scope.includes(`\`${state}\``),`mandatory Landing/Auth state missing: ${state}`);

assert.match(scope,/one-to-one visual and motion target/);
assert.match(scope,/existing Supabase Auth session remains[\s\S]*only authentication owner/);
assert.match(scope,/no second auth\/session store/);
assert.match(scope,/Profile\/Trip onboarding[\s\S]*Gate 3/);
assert.match(scope,/No functional acceptance is granted without the real visible E2E sequence/);
assert.match(scope,/Main and Production remain unchanged/);

assert.match(session,/auth\.signInWithPassword/);
assert.match(session,/auth\.signUp/);
assert.match(session,/resetPasswordForEmail/);
assert.match(session,/auth\.updateUser\(\{ password:/);
assert.match(session,/auth\.signInWithOAuth/);
assert.match(session,/auth\.onAuthStateChange/);
assert.match(session,/auth\.signOut\(\{ scope: 'local' \}\)/);
assert.match(authUi,/renderAuthForm/);
assert.match(shell,/renderIfPending/);
assert.match(shell,/fallbackLogin/);
assert.match(shell,/session\.deactivate/);

assert.match(matrix,/public-landing,[^\n]*,PUBLIC VERIFIED,[^\n]*complete accepted Landing/);
assert.match(matrix,/authentication,[^\n]*,PUBLIC VERIFIED,[^\n]*real Supabase/);
for(const file of [
  'docs/modularization/M16.5S-LANDING-AUTH-BASELINE-AND-SCOPE-LOCK.md',
  'tests/m16.5s-landing-auth-scope-lock.test.cjs'
])assert(ownership.includes(file),`ownership registry missing ${file}`);
assert(runner.includes('tests/m16.5s-landing-auth-scope-lock.test.cjs'));

console.log('M16.5S Public Landing and Real Authentication Scope Lock: PASS');
console.log('Pinned accepted reference artifacts: 5 / 5');
console.log('Mandatory Landing/Auth states: 23 / 23');
console.log('Runtime mutation: NONE; Main / Production lock: ACTIVE');
