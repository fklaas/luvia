'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const shell=read('app/app-shell.js');
const profile=read('core/profiles/profile-foundation.js');
const attention=read('app/control-center/control-center-attention-service.js');
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
for(const token of ["get?.('AuthSessionPort')",'luvia:logout','luvia:runtime-action','session.deactivate','session.activate','refreshEpoch','sessionReady()'])assert(attention.includes(token),`Control Center Attention session guard missing ${token}`);
assert.doesNotMatch(attention,/LuviaAuth|ParisAuth|\.auth\.|supabase|localStorage|sessionStorage/,'Attention aggregation must use AuthSessionPort without private Auth or storage access');
assert(safeRunner.includes('tests/m9.6-authenticated-surface-session-exit-hygiene.test.cjs'),'M9.6 session-exit hygiene guard missing from Safe Regression');

const handlers=new Map();
let auth={authenticated:true,loading:false},bookingReads=0;
const window={
  LuviaAttentionContract:{normalize:value=>value},
  LuviaPlatformPorts:{get:id=>id==='AuthSessionPort'?{snapshot:()=>auth}:null},
  LuviaControlCenterTravelIdentity:{snapshot:()=>({hasActiveTrip:true,phase:'during',activeTrip:{id:'trip-1',title:'Testreise'}})},
  LuviaBookingIntegration:{async listForTrip(){bookingReads+=1;return[]}},
  addEventListener(type,listener){const values=handlers.get(type)||[];values.push(listener);handlers.set(type,values)},
  dispatchEvent(){}
};
vm.runInContext(attention,vm.createContext({window,CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail}},Object,Array,Set,Map,String,Boolean,Number,Date,JSON}));

(async()=>{
  await window.LuviaControlCenterAttention.refresh();
  assert.equal(bookingReads,1,'Authenticated attention refresh must read Booking projection once');
  handlers.get('luvia:logout')[0]();auth={authenticated:false,loading:false};
  handlers.get('luvia:control-center-travel-identity-changed')[0]();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(bookingReads,1,'Logout transition must suppress unauthenticated Booking reads');
  assert.equal(window.LuviaControlCenterAttention.snapshot().count,0,'Session exit must clear projected attention items');
  auth={authenticated:true,loading:false};handlers.get('luvia:runtime-action')[0]({detail:{type:'session.activate'}});
  handlers.get('luvia:control-center-travel-identity-changed')[0]();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(bookingReads,2,'Hydrated travel identity may refresh attention after session activation');
  console.log('M9.6 Authenticated Surface Session Exit Hygiene: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
