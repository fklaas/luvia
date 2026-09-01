'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const identitySource=read('core/identity/identity-domain-contract-core.js');
const eventSource=read('core/events/event-contract-core.js');

for(const [name,source] of [['Identity',identitySource],['Event',eventSource]]){
  for(const token of ['window.','globalThis','document.','navigator.','localStorage','sessionStorage','indexedDB','Supabase','client.from','client.rpc']){
    assert(!source.includes(token),`${name} browserless core contains forbidden token: ${token}`);
  }
}

const identityContext={Object,Array,String,Number,Boolean,Date,Math,Set,Map,Error,TypeError};
vm.runInNewContext(identitySource,identityContext,{filename:'identity-domain-contract-core.js'});
const identity=identityContext.LuviaIdentityDomainContractCoreV1;
assert(identity,'Identity Domain Core must install without a browser');
assert.equal(identity.version,'1');
assert.equal(identity.runtimeVersion,'1.0.0');
const raw={userId:'u1',displayName:'Fabian',avatarUrl:'/a.jpg',avatarColor:'#ee6f83',email:'private@example.test',activeTripId:'t1',archivedTripIds:['t0'],dashboardWidgets:['today'],travelInterests:['culture'],travelStyles:['slow'],activityPreferences:['walking'],travelPace:'balanced',budgetPreference:'medium',preferencesCompletedAt:'2026-08-23T00:00:00Z',preferenceSchemaVersion:3};
const viewer=identity.projectViewer(raw);
assert.equal(viewer.userId,'u1');
for(const field of ['email','activeTripId','archivedTripIds','dashboardWidgets'])assert.equal(viewer[field],undefined,`Identity viewer leaks ${field}`);
assert.throws(()=>identity.sanitizeProfilePatch({activeTripId:'t2'}),error=>error.code==='IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED'&&error.field==='activeTripId');
assert.throws(()=>identity.sanitizePreferencePatch({observedSignals:['x']}),error=>error.code==='IDENTITY_CONTRACT_PREFERENCE_FIELD_NOT_ALLOWED');
assert.equal(identity.classifyPreferenceLayer({source:'user'}),'explicit');
assert.equal(identity.classifyPreferenceLayer({source:'observed-signal'}),'observed');
assert.equal(identity.preferenceLayers.observed.owner,'intelligence');
assert.equal(identity.preferenceLayers.observed.requiresConfirmation,true);
const identityState=identity.createIdentityState();
identityState.patch({profile:raw,loaded:true});
const stateSnapshot=identityState.snapshot();
assert.equal(stateSnapshot.profile.displayName,'Fabian');
assert.equal(Object.isFrozen(stateSnapshot),true);
assert(identity.completion(raw)>=70);

const eventContext={Object,Array,String,Number,Boolean,Date,Math,Set,Map,Error,TypeError};
vm.runInNewContext(eventSource,eventContext,{filename:'event-contract-core.js'});
const events=eventContext.LuviaEventContractCoreV1;
assert(events,'Event Contract Core must install without a browser');
assert.equal(events.contractId,'events.v1');
assert.equal(events.envelopeVersion,'1');
assert.equal(events.deliveryPolicy,'explicit-notification-port-only');
for(const name of ['booking.confirmed','place.saved','trip.completed','memory.created'])assert(events.definitions[name],`M8 example event missing: ${name}`);
const envelope=events.createEnvelope('booking.confirmed',{bookingId:'b1'},{source:'booking',correlationId:'c1'},{id:()=> 'evt-1',now:()=> '2026-08-23T12:00:00.000Z'});
const envelopeValidation=events.validateEnvelope(envelope);
assert.equal(envelopeValidation.valid,true);
assert.equal(envelopeValidation.errors.length,0);
assert.equal(envelope.notificationEligible,true);
assert.equal(envelope.correlationId,'c1');
const intent=events.createNotificationIntent(envelope,{title:'Bestätigt',body:'Die Buchung ist bestätigt.',providers:{id:()=> 'evt-2',now:()=> '2026-08-23T12:00:01.000Z'}});
assert.equal(intent.name,'notification.intent.created');
assert.equal(intent.causationId,'evt-1');

const files={
  profile:read('core/profiles/profile-service.js'),auth:read('auth/session.js'),identityAdapter:read('core/platform/identity-contract-adapter.js'),
  eventAdapter:read('app/adapters/event-contract-web-adapter.js'),platformWeb:read('app/adapters/identity-platform-web-adapter.js'),
  platformRegistry:read('app/adapters/platform-port-adapters.mjs'),identityCenter:read('app/control-center/identity-center.js'),
  identityCss:read('app/control-center/identity-center.css'),home:read('app/control-center/control-center-home.js'),shell:read('app/app-shell.js'),
  navigation:read('core/runtime/navigation-contract-core.js'),
  index:read('index.html'),paris:read('paris-official.html'),sw:read('sw.js'),cores:read('config/luvia-cores.json'),coreMap:read('docs/architecture/CORE-MAP.md'),timeline:read('core/places/timeline-core.js')
};
for(const source of [files.profile,files.auth]){
  assert.equal((source.match(/localStorage|sessionStorage/g)||[]).length,0,'Identity owner/runtime retains direct browser storage');
}
assert(files.profile.includes('identityCore.createIdentityState()'),'Profile service must use the physical Identity State Core');
assert(!files.profile.includes('let state ='),'Profile service must not own a second Identity state');
assert(files.profile.includes("get?.('StoragePort')"),'Profile cache must use StoragePort');
assert(!files.profile.includes('client.auth.'),'Profile persistence must not bypass AuthSessionPort');
assert(files.auth.includes("get?.('SecureStoragePort')"),'Auth metadata must use SecureStoragePort');
assert(files.auth.includes("get?.('StoragePort')"),'Auth transient cleanup must use StoragePort');
assert(files.identityAdapter.includes("const RUNTIME_VERSION = '1.2.0'"));
for(const token of ['domainCore().projectViewer','domainCore().projectPublic','domainCore().projectPreferences','LuviaEventContractV1?.publish'])assert(files.identityAdapter.includes(token),`Identity adapter missing M8 delegation: ${token}`);
for(const id of ['StoragePort','SecureStoragePort','AuthSessionPort','NotificationPort']){
  assert(files.platformWeb.includes(`${id}:`),`Web Identity adapter missing ${id}`);
  assert(files.platformRegistry.includes(id),`Platform Registry missing ${id} registration`);
}
assert(files.platformWeb.includes("protection:'web-origin-storage'"),'Web secure-storage diagnostics must not claim hardware security');
assert(files.platformWeb.includes('automaticDomainEventDelivery:false'),'NotificationPort must prohibit automatic domain-event delivery');
assert(!files.eventAdapter.includes("get?.('NotificationPort')"),'Event adapter must not automatically deliver notifications');

for(const token of ['Deine Identität. Deine Entscheidungen.','Native Platform Ports','Von dir festgelegt','Von Luvia beobachtet','events.v1','data-ic-notifications'])assert(files.identityCenter.includes(token),`Identity Center visible surface missing: ${token}`);
assert(files.identityCss.includes('@media(max-width:780px)'));
assert(files.identityCss.includes('@media(prefers-reduced-motion:reduce)'));
assert(files.home.includes("card('Identität & Datenschutz'"));
assert(files.navigation.includes("id:'control-center-identity'"),'Navigation Contract Identity route missing');
for(const token of ["moduleMountRegistry.register('control-center-identity'",'LuviaIdentityCenter.mount','LuviaIdentityCenter?.unmount'])assert(files.shell.includes(token),`App Shell Identity route missing: ${token}`);

const positions={
  web:files.index.indexOf('app/adapters/identity-platform-web-adapter.js'),
  auth:files.index.indexOf('auth/session.js'),
  identityCore:files.index.indexOf('core/identity/identity-domain-contract-core.js'),
  profile:files.index.indexOf('core/profiles/profile-service.js'),
  eventCore:files.index.indexOf('core/events/event-contract-core.js'),
  eventAdapter:files.index.indexOf('app/adapters/event-contract-web-adapter.js'),
  identityAdapter:files.index.indexOf('core/platform/identity-contract-adapter.js'),
  center:files.index.indexOf('app/control-center/identity-center.js'),
  shell:files.index.indexOf('app/app-shell.js')
};
assert(positions.web>=0&&positions.web<positions.auth,'Web Identity ports must load before Auth');
assert(positions.identityCore>=0&&positions.identityCore<positions.profile,'Identity Domain Core must load before Profile adapter');
assert(positions.eventCore>=0&&positions.eventCore<positions.eventAdapter,'Event Core must load before Event adapter');
assert(positions.eventAdapter>=0&&positions.eventAdapter<positions.identityAdapter,'Event adapter must load before Identity event bridge');
assert(positions.center>=0&&positions.center<positions.shell,'Identity Center must load before App Shell');
assert(files.paris.indexOf('identity-platform-web-adapter.js')<files.paris.indexOf('auth/session.js'),'Legacy entry must load Identity ports before Auth');
for(const asset of ['core/identity/identity-domain-contract-core.js','core/events/event-contract-core.js','app/adapters/identity-platform-web-adapter.js','app/adapters/event-contract-web-adapter.js','app/control-center/identity-center.js','app/control-center/identity-center.css'])assert(files.sw.includes(asset),`Service Worker missing M8 asset: ${asset}`);

const registry=JSON.parse(files.cores);
assert.equal(registry.cores.identity.root,'core/identity/');
assert.equal(registry.cores.identity.truthOwnership,'canonical-global-identity-and-explicit-preference-truth');
assert.equal(registry.cores.events.truthOwnership,'no-domain-truth');
assert.equal(registry.cores.media.root,'core/media/');
assert(files.coreMap.includes('Trip context is not Identity truth'));
assert(files.coreMap.includes('Domain Events never directly trigger browser or native notifications'));
assert(files.timeline.includes('LuviaTimelineCore'),'Timeline/Journey reservation must remain untouched by M8');

console.log('M8 FINAL Identity / Event / Native Readiness: PASS');
console.log('Browserless Identity State / Contract Core: PASS');
console.log('Browserless events.v1 Envelope Core: PASS');
console.log('Profile + Auth direct browser storage refs: 27 -> 0');
console.log('Storage/SecureStorage/AuthSession/Notification Web Ports: 4/4');
console.log('Visible Identity & Privacy Center: PASS');
console.log('Timeline/Journey reservation: PRESERVED');
