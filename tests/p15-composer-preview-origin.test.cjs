'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const root = path.resolve(__dirname, '..');
const candidate = 'https://6433ad04-integration-luvia.njwnrvwbv5.workers.dev';
let checks = 0;

async function checkFunction(name) {
  const base = path.join(root, 'supabase/functions', name);
  const corsSource = fs.readFileSync(path.join(base, '_shared/cors.ts'), 'utf8');
  const httpSource = fs.readFileSync(path.join(base, '_shared/http.ts'), 'utf8');
  const handlerSource = fs.readFileSync(path.join(base, 'index.ts'), 'utf8');
  const env = new Map();
  let serve;
  const context = vm.createContext({
    Deno: { env: { get: key => env.get(key) }, serve: handler => { serve = handler; } },
    Request, Response, Headers, TextEncoder, crypto: globalThis.crypto, performance,
    enforceRateLimit: () => ({ allowed: true }),
    createClient: () => { throw Error('No authenticated action should run in this test'); }
  });
  const sources = [corsSource, httpSource];
  if (name === 'luvia-intelligence') sources.push(fs.readFileSync(path.join(base, 'policies/privacy.ts'), 'utf8'));
  sources.push(handlerSource);
  for (const source of sources) {
    const executable = stripTypeScriptTypes(source.replace(/^import .*;\r?\n/gm, '').replace(/\bexport /g, ''));
    vm.runInContext(executable, context);
  }
  const allowed = [candidate, 'https://deadbeef-integration-luvia.njwnrvwbv5.workers.dev',
    'https://integration-luvia.njwnrvwbv5.workers.dev', 'https://myluvia.app'];
  const rejected = ['https://6433ad04-integration-luvia.other-account.workers.dev',
    'https://6433ad04-integration-luvia.njwnrvwbv5.workers.dev.evil.test',
    'https://6433ad04-integration-luvia.njwnrvwbv5.workers.dev@evil.test',
    'https://6433ad04-another-worker.njwnrvwbv5.workers.dev',
    'http://6433ad04-integration-luvia.njwnrvwbv5.workers.dev',
    'https://6433ad04-integration-luvia.njwnrvwbv5.workers.dev:444',
    'https://arbitrary-integration-luvia.njwnrvwbv5.workers.dev', 'null'];
  for (const origin of [...allowed, ...rejected]) {
    const permitted = allowed.includes(origin);
    const response = await serve(new Request('https://edge.test', { method: 'OPTIONS', headers: {
      origin, 'access-control-request-method': 'POST',
      'access-control-request-headers': 'apikey,content-type,x-luvia-build'
    }}));
    assert.equal(response.status, permitted ? 204 : 403, `${name}: ${origin}`);
    if (permitted) assert.equal(response.headers.get('access-control-allow-origin'), origin);
    else if (origin !== 'null') assert.notEqual(response.headers.get('access-control-allow-origin'), origin);
    assert.notEqual(response.headers.get('access-control-allow-origin'), '*');
    assert.equal(response.headers.get('vary'), 'Origin');
    checks++;
  }
  env.set('LUVIA_ALLOWED_ORIGINS', 'https://explicit.example');
  assert.equal(context.resolveOrigin('https://explicit.example'), 'https://explicit.example'); checks++;
  // A successful preflight must not grant access to protected Places or AI actions.
  for (const origin of [candidate, rejected[0]]) {
    const response = await serve(new Request('https://edge.test', { method: 'POST', headers: {
      origin, 'content-type': 'application/json'
    }, body: JSON.stringify({ action: name === 'luvia-gateway' ? 'places.text-search' : 'brain.run', payload: {} }) }));
    assert.equal(response.status, origin === candidate ? 401 : 403);
    const body = await response.json();
    assert.equal(body.error.code, origin === candidate ? 'AUTH_REQUIRED' : 'ORIGIN_NOT_ALLOWED'); checks++;
  }
}
async function checkProviderErrors(){
  for(const [status,code] of [[429,'credit_balance_exhausted'],[429,'rate_limit_exceeded'],[413,'AI_PAYLOAD_TOO_LARGE']]){
    let calls=0;const context=vm.createContext({TextEncoder,setTimeout,clearTimeout,console,window:{LuviaSupabaseService:{start:async()=>({functions:{invoke:async()=>{calls++;return {error:{message:'Non-2xx',context:new Response(JSON.stringify({error:{code,message:'controlled provider error'}}),{status})}}}}})}}});
    vm.runInContext(fs.readFileSync(path.join(root,'core/ai/providers/openai-provider.js'),'utf8'),context);
    await assert.rejects(context.window.LuviaOpenAIProvider.run({}),e=>e.code===code&&e.status===status);checks++;
    await assert.rejects(context.window.LuviaOpenAIProvider.run({}),e=>e.code===(status===413?'AI_PAYLOAD_CIRCUIT_OPEN':code));assert.equal(calls,1,'A quota/payload pause must not call the provider again');checks++;
  }
  const context=vm.createContext({window:{LuviaAICapabilities:{get:()=>({})},LuviaAIPolicy:{sanitize:x=>x},LuviaAITools:{collect:()=>{throw Error('New trip must not inherit active-trip tools')}}}});
  vm.runInContext(fs.readFileSync(path.join(root,'core/ai/ai-context-service.js'),'utf8'),context);
  const result=await context.window.LuviaAIContext.assemble('discovery.plan',{currentMoment:{surface:'trip-destination-inspiration',userGoal:'Meer und Natur',globalPreferences:{dietaryPreferences:['vegan']}}});assert.equal(result.trip,null);assert.equal(result.currentMoment.userGoal,'Meer und Natur');checks++;
}
async function checkTimezone(){
  const full=fs.readFileSync(path.join(root,'supabase/functions/luvia-gateway/_shared/places.ts'),'utf8'),source=full.slice(full.indexOf('async function resolveDestination('),full.indexOf('export async function placesAction('));
  let zone='Europe/Rome',calls=0;const cachedValues=new Map();const context=vm.createContext({hash:JSON.stringify,cached:key=>cachedValues.get(key),store:(key,value)=>cachedValues.set(key,value),metrics:{resolutions:0},COUNTRY_META:{IT:{languages:['it'],currency:'EUR'}},viewportRadius:()=>5000,flagEmoji:()=>'',geoapifyGeocode:async()=>{calls++;return {features:[{properties:{lat:41.893,lon:12.483,city:'Rom',country_code:'it',place_id:'rom',timezone:zone?{name:zone}:undefined}}]}}});
  vm.runInContext(stripTypeScriptTypes(source),context);
  const result=await context.resolveDestination({query:'Rom'});assert.equal(result.data.destination.timezone,'Europe/Rome');assert.equal(result.data.destination.timezoneStatus,'resolved');checks++;
  await context.resolveDestination({query:'Rom'});assert.equal(calls,1,'Timezone must use the same geocoding response and cache');checks++;
  zone='';const unknown=await context.resolveDestination({query:'A region',refresh:true});assert.equal(unknown.data.destination.timezone,'');assert.equal(unknown.data.destination.timezoneStatus,'unknown');checks++;
}
(async () => {
  await checkFunction('luvia-gateway');
  await checkFunction('luvia-intelligence');
  await checkProviderErrors();
  await checkTimezone();
  console.log(`P15 composer preview origin: ${checks}/${checks} behavioral checks PASS`);
})().catch(error => { console.error(error); process.exitCode = 1; });
