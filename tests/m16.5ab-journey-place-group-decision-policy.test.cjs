const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('app/collaboration/journey-place-proposals.js','utf8');
const events=[];
const sandbox={
  console,
  crypto:require('node:crypto').webcrypto,
  CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},
  dispatchEvent:event=>events.push(event)
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);

const api=sandbox.LuviaJourneyPlaceProposals;
assert.ok(api,'Journey place proposal API must be published');

const now=Date.parse('2026-08-30T10:00:00.000Z');
assert.deepEqual(
  {...api.decisionPolicy({trip:{startDate:'2026-09-20',endDate:'2026-09-27'},plannedAt:'2026-09-21T10:00:00Z',memberCount:1,now})},
  {mode:'owner_decides',hours:0,label:'Direkt einplanen'},
  'Solo journeys must never create a fake group vote'
);
assert.equal(api.decisionPolicy({trip:{startDate:'2026-09-20',endDate:'2026-09-27'},plannedAt:'2026-09-21T10:00:00Z',memberCount:3,now}).hours,24,'At least a week before departure the group gets 24 hours');
assert.equal(api.decisionPolicy({trip:{startDate:'2026-09-03',endDate:'2026-09-08'},plannedAt:'2026-09-04T10:00:00Z',memberCount:3,now}).hours,12,'Closer than a week before departure the group gets 12 hours');
assert.equal(api.decisionPolicy({trip:{startDate:'2026-08-29',endDate:'2026-09-02'},plannedAt:'2026-08-30T16:00:00Z',memberCount:3,now}).hours,1,'During the trip a non-imminent choice gets one hour');
assert.equal(api.decisionPolicy({trip:{startDate:'2026-08-29',endDate:'2026-09-02'},plannedAt:'2026-08-30T11:00:00Z',memberCount:3,now}).mode,'owner_decides','An imminent choice during the trip belongs to the trip owner');

const fixture=fs.readFileSync('tests/fixtures/m12-journey-day-composer-browser.html','utf8');
for(const boundary of ['vote:async(id,value)','claim:async id','finish:async(id,tripPlaceId,success=true)',"row.application_status=success?'applied':'failed'",'readFixtureProposals','persistFixtureProposals','proposalStoreKey']){
  assert.ok(fixture.includes(boundary),`Visible group E2E fixture is missing ${boundary}`);
}
assert.match(fixture,/globalThis\.__fixtureJourneyProposals=readFixtureProposals\(\)/,'visible group E2E must restore the proposal owner before Journey renders after reload');
assert.match(fixture,/globalThis\.__fixtureJourneyProposals\.push\(row\);persistFixtureProposals\(\)/,'visible group E2E must persist the created decision before emitting its local projection');

const sheet=fs.readFileSync('app/journey/journey-suggestion-sheet.js','utf8');
assert.match(sheet,/if\(total<=1\)return\{kind:'planned'/,'only a true solo journey may bypass the group decision owner');
assert.match(sheet,/GROUP_DECISION_OWNER_UNAVAILABLE/,'a missing group decision owner must block instead of silently committing a group choice');
assert.match(sheet,/const groupDecision=Number\(result\.input\.groupContext\?\.totalTravelers\|\|result\.input\.groupContext\?\.travelers\?\.length\|\|1\)>1;/,'the visible action must follow the actual traveler count, not adapter timing');

const diagnostics=api.diagnostics();
assert.equal(diagnostics.storage,'trip_activity_events');
assert.equal(diagnostics.schemaMutation,false);
assert.equal(diagnostics.placesMutation,false);
assert.equal(diagnostics.journeyMutation,false);
assert.equal(diagnostics.deterministicApplier,'proposer-only');

console.log('M16.5AB Journey place group decision policy: PASS');
