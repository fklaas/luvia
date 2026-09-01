const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const shell=read('app/app-shell.js');
const dashboard=read('core/ai/ai-dashboard-service.js');
const runtime=read('core/ai/ai-action-runtime.js');
const actionContract=read('core/intelligence/intelligence-action-contract-core.js');
const compiler=read('core/intelligence/travel-orchestration-core.js');
const css=read('core/experience/experience-foundation.css');
const placesSpatial=read('app/places/places-spatial-experience.js');
const placesSpatialCss=read('app/places/places-spatial-experience.css');
const fixture=read('tests/fixtures/m16.5ab-living-compass-ai-browser.html');
const backlog=read('docs/modularization/M16.5-STEP16-OWNER-FIRST-USP-AND-EVENT-BACKLOG.md');
const e2eMatrix=read('docs/modularization/M16.5-STEP17-E2E-MATRIX.md');

assert.match(shell,/\{id:'compass',label:'Luvia Compass',action:'assistant'\}/);
assert.match(shell,/data-ai-ask-open[^>]+aria-label="Luvia Compass öffnen"[^>]+aria-haspopup="dialog"/);
assert.match(shell,/if\(payload\.overlayOnly\)\{/,'AI-selected Places must retain an overlay detail path even when the typed module is not enabled for the trip');
assert.match(shell,/if\(enabled&&await openTypedPlaceOverlay\(payload\)\)return true/,'enabled typed Place modules must remain the first detail owner');
assert.ok(!shell.includes('if(payload.overlayOnly&&enabled){'),'overlayOnly may not silently fall through just because a module is disabled');
assert.match(dashboard,/document\.addEventListener\('click'.*\[data-ai-brief-refresh\],\[data-ai-ask-open\]/s);
assert.match(dashboard,/window\.LuviaAIDashboard=Object\.freeze\([^)]*openChat:askModal/s);

for(const copy of ['lvx-command-eyebrow">Luvia','Was möchtest du erleben?','Ich kann Orte finden, vergleichen, zum Tag hinzufügen und nach deiner Bestätigung reservieren.','Ruhig am Wasser','Abend planen','Freien Moment füllen','Nachricht an Luvia','Restaurant, Tagesplan oder nächste Entscheidung'])assert.ok(dashboard.includes(copy),`accepted AI copy missing: ${copy}`);
assert.match(css,/place-items:end center/);
assert.match(css,/width:min\(100%,1280px\)/);
assert.match(css,/height:min\(94dvh,820px\)/);
assert.match(css,/@keyframes lvx-command-sheet-in\{from\{opacity:\.72;transform:translateY\(105%\)\}/);
assert.match(css,/@media\(max-width:560px\)[\s\S]*height:min\(92dvh,780px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none;transition:none/);

assert.ok(!fixture.includes('window.LuviaAIDashboard.openChat();'),'the visible fixture must require a real user pointer/keyboard open action');
assert.ok(fixture.indexOf('core/ai/ai-brain.css')<fixture.indexOf('core/experience/experience-foundation.css'),'fixture must use productive stylesheet order');
assert.ok(fixture.indexOf('vendor/maplibre/maplibre-gl-5.12.0.js')<fixture.indexOf('core/ai/ai-dashboard-service.js'),'visible fixture must use the vendored MapLibre runtime before the productive chat');

assert.match(dashboard,/core\?\.compileIntent\?\./);
assert.match(dashboard,/intelligence\(\)\.run\('planning\.dialogue'/);
assert.match(dashboard,/core\?\.compileDialogue\?\./);
assert.match(dashboard,/core\?\.sequencePlan\?\./);
assert.match(dashboard,/core\?\.sliceIntentGraph\?\./);
assert.match(dashboard,/data-ai-sequence-continue/);
assert.match(dashboard,/advanceConversation\('owner-receipt'/);
assert.match(dashboard,/mountProjection\(container,items/,'inline AI maps must reuse the Places-owned MapLibre projection');
assert.match(runtime,/function fairCategorySelection\(/,'a multi-category chat wish must use a bounded fair category selector');
assert.match(runtime,/perCategoryLimit=Math\.min\(3,/,'each requested Place category may expose at most three suggestions');
assert.doesNotMatch(dashboard,/\(result\.items\|\|\[\]\)\.slice\(0,3\)/,'the consumer may not silently hide all but the first category');
assert.match(dashboard,/openPlaceSubject\(subject\)/,'map pins and Place cards must enter the same detail-sheet path');
assert.match(runtime,/limit:3/,'per-wish Places reads must ask for at most three results');
assert.match(placesSpatial,/function mountProjection\(/);
assert.match(placesSpatial,/!view\.markers\.length/,'the map projection must refuse invented coordinates');
for(const colour of ['#ef6254','#f4b34c','#2c93a9','#2f8c73']){
  assert.ok(placesSpatial.includes(colour),`Compass map palette missing in MapLibre projection: ${colour}`);
  assert.ok(placesSpatialCss.includes(colour),`Compass pin palette missing in Places CSS: ${colour}`);
  assert.ok(css.includes(colour),`Compass palette missing in inline chat map: ${colour}`);
}
assert.match(dashboard,/appendIntentGraph\(compiled\)/);
assert.match(dashboard,/actionRuntime\(\)\.prepare\(/);
assert.match(dashboard,/actionRuntime\(\)\.prepareUndo\(/);
assert.match(dashboard,/Du siehst zuerst eine Vorschau und bestätigst selbst/);
assert.match(runtime,/ledger\.create\(\{actionId,owner:definition\.owner,ownerContract:definition\.ownerContract,effect:definition\.effect,risk:definition\.risk,confirmation:definition\.confirmation/);
assert.match(runtime,/function prepareUndo\(/);
assert.match(runtime,/ledger\.startCompensation\(compensationOrigin\);ledger\.finishCompensation\(compensationOrigin,receipt\)/);
assert.match(actionContract,/confirmation:'EXPLICIT'/);
assert.match(compiler,/automaticMutation:false/);
assert.match(compiler,/rawMessageStored:false/);

for(const forbidden of ['supabase.from(','localStorage.setItem(','fetch(\'/rest/','fetch("/rest/']){
  assert.ok(!dashboard.includes(forbidden),`chat UI contains forbidden foreign persistence: ${forbidden}`);
  assert.ok(!compiler.includes(forbidden),`compiler contains forbidden foreign persistence: ${forbidden}`);
}

for(const usp of ['Route-Uncertainty Simulation','Live Disruption Recovery','Explainable Planning Trace','Causal Feedback Learning','On-Device Context Gate','Offline-First CRDT Reiseplan','Destination Digital Twin','Day Rehearsal Engine','Verified Event Intelligence Core'])assert.ok(backlog.includes(usp),`Step 16 USP missing: ${usp}`);
for(const eventFeature of ['Dynamic Map-Time Brushing','Event-to-Memory Thread','Cultural Context Layer','Serendipity Window','Group Taste Divergence','Weather-Safe Event Substitution','Cancellation & Venue Drift Detection','Live Schedule Reconciliation','Spatio-Temporal Event Graph'])assert.ok(backlog.includes(eventFeature),`Step 16 event feature missing: ${eventFeature}`);
for(const dimension of ['Inputs:','Output:','Freshness:','Privacy:','Failures:','Receipts:','Evals:','Rollback:'])assert.ok(backlog.includes(dimension),`Step 16 owner-first dimension missing: ${dimension}`);
assert.match(backlog,/No event is product-visible unless the minimum evidence gate passes/);
assert.match(backlog,/released on Integration in `\.126`; S16\.07 remains reserved/);
assert.match(backlog,/S16\.07 remains deliberately \*\*reserved and disabled\*\*/);
assert.match(backlog,/Controlled\s+fixture events are acceptance data only/);
assert.match(backlog,/Main, Production, DB\/RLS, Secrets and Edge Functions are not authorized/);

for(const dimension of ['Desktop 1440×900','Mobile 390×844','Touch','Keyboard','Reload / Warmstart','Back / Forward','Reduced Motion','Cold / Warm','Offline / Reconnect','GPS / Privacy','Group Decision','Provider','Stable\/Immutable Bytes'])assert.ok(e2eMatrix.includes(dimension),`Step 17 E2E dimension missing: ${dimension}`);
assert.match(e2eMatrix,/`element\.click\(\)`, direkte DOM-Zustandsmutation/);
assert.match(e2eMatrix,/physischer Touch bleibt offen/);
assert.match(e2eMatrix,/kein externer Buchungsabschluss oder E-Mail-Versand ausgelöst/);
assert.match(e2eMatrix,/ausgeführte\s+Mutation: \*\*keine\*\*/);

console.log('m16.5 Step 15 global AI chat + Step 16 owner-first backlog: ok');
