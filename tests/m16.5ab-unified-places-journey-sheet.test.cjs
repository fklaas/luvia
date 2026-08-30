'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=file=>fs.readFileSync(file,'utf8');
const exists=file=>fs.existsSync(file);
const places=read('app/places/places-spatial-experience.js');
const placesCss=read('app/places/places-spatial-experience.css');
const sheet=read('app/journey/journey-suggestion-sheet.js');
const composer=read('app/journey/journey-day-composer.js');
const proposals=read('app/collaboration/journey-place-proposals.js');
const management=read('app/booking/booking-management-sheet.js');
const ui=read('core/ui/ui-manager.js');
const index=read('index.html');
const worker=read('sw.js');

for(const asset of [
  'app/booking/booking-management-sheet.js',
  'app/booking/booking-management-sheet.css',
  'app/journey/journey-offline-pack.js',
  'app/collaboration/journey-place-proposals.js'
]){
  assert.ok(exists(asset),`missing unified owner-flow asset: ${asset}`);
  assert.ok(index.includes(`${asset}?v=13.82.116`),`index misses ${asset}`);
  assert.ok(worker.includes(`'${asset}'`),`service worker misses ${asset}`);
}

assert.match(ui,/if\(effect\.entry\.kind==='sheet'\)overlay\.classList\.add\('luvia-living-sheet-overlay'\)/);
assert.match(ui,/animation:luvia-living-sheet-enter \.62s cubic-bezier\(\.16,1,\.3,1\)/);
assert.match(ui,/html\.luvia-ui-open,body\.luvia-ui-open\{overflow:hidden/);
assert.match(ui,/@media\(prefers-reduced-motion:reduce\)/);

assert.match(places,/if\(focus\)openResultSheet\(\)/,'an explicit Places search must open the shared result sheet');
assert.match(places,/LuviaJourneySuggestions\?\.openResults/);
assert.match(places,/onSelectionChange:id=>select\(id,false,true\)/,'sheet swipes and selections must keep the original map marker and result card synchronized');
assert.match(places,/data-places-plan=/);
assert.match(places,/Zur Timeline hinzufügen/);
assert.match(places,/Beste Bewertung/);
assert.match(places,/Kürzeste Entfernung/);
assert.match(places,/Persönliche Passung/);
assert.match(sheet,/Wischt seitlich/,'the unified result sheet must disclose its touch gesture');
assert.match(places,/restaurant\|cafe\|café\|bakery\|food\|meal\|bar/);
assert.doesNotMatch(places,/restaurant\|cafe\|café\|food\|bar\|accommodation\|hotel/,'the current restaurant Booking Core must not be offered for accommodation');
assert.match(placesCss,/scrollbar-width: none !important/);
assert.match(read('app/journey/journey-day-composer.css'),/\.lvjs-choice-scheduler/,'each card must own its scheduling and primary-action surface');
assert.match(read('app/journey/journey-day-composer.css'),/grid-template-rows:auto auto minmax\(0,1fr\) auto/,'mobile sheet tracks must no longer reserve a global white confirmation bar');

assert.match(sheet,/async function openResults\(/);
assert.match(sheet,/Ein Tipp wählt/);
assert.match(sheet,/const selectedIds=new Set/);
assert.match(sheet,/scheduleFor\(chosen,plans,result\.input\)/);
assert.match(sheet,/transferBetween\(previous,place\)/);
assert.match(sheet,/nearestAlternative\(place,choices=\[\]\)/);
assert.match(sheet,/Nahe Alternative zeigen/);
assert.match(sheet,/function openingAt\(place,start,end\)/,'provider opening periods must be checked against each card-local plan');
assert.match(sheet,/openingConflict=opening\.known&&opening\.open===false/,'a provider-proven closed window must block Timeline confirmation');
assert.match(sheet,/Wetterreaktion:/,'real same-day weather must be able to warn an outdoor proposal');
assert.match(sheet,/travelerInsights/);
assert.match(sheet,/Passt besonders zu/);
assert.match(sheet,/Tisch reservieren/);
assert.match(sheet,/data-lvjs-booking="\$\{esc\(id\)\}"/,'only the selected gastronomic card may expose its Booking action');
assert.match(sheet,/openBooking\(place,bookingButton,form/,'Booking must act on the exact card-local Place and schedule');
assert.match(sheet,/data-lvjs-plan="\$\{esc\(id\)\}"/,'each card must bind its own explicit Timeline action for real pointer and touch input');
assert.match(sheet,/<form class="lvjs-choice-scheduler"/,'the card-local Booking adapter must pass a real HTMLFormElement to the unchanged Booking Core');
assert.match(sheet,/commands\.importPlace/);
assert.match(sheet,/commands\.plan/);
assert.match(sheet,/journey\?\.commands\?\.hydrate\?\.\(tid\)/,'a confirmed card-local plan must rehydrate the Journey owner');

assert.match(proposals,/LuviaCollaboration/,'group decisions must reuse the existing collaboration owner');
assert.match(proposals,/groupFit:clone\(place\?\.groupFit\|\|null\)/,'the evidenced deterministic group fit must survive the vote handoff');
assert.match(proposals,/aiScoreUsed:false/);
assert.doesNotMatch(proposals,/aiMatchScore:Number\.isFinite/,'AI ranking percentages must never become collaboration truth');
assert.match(proposals,/trip_activity_events/,'proposal truth must remain event-sourced in the existing trip activity stream');
assert.match(proposals,/hours:24/);
assert.match(proposals,/hours:12/);
assert.match(proposals,/hours:1/);
assert.match(proposals,/mode:'owner_decides'/);
assert.match(proposals,/luvia_list_trip_members/,'the collaboration coordinator may read the existing member projection');
assert.doesNotMatch(proposals,/\.from\(/,'the proposal coordinator must not create a private table or direct persistence boundary');
assert.equal(exists('supabase/migrations/20260829090000_journey_place_proposals.sql'),false,'Integration may not mutate the shared Production schema for this UI flow');

assert.match(composer,/LuviaBookingManagementSheet\.open/);
assert.match(composer,/lvjt-proposal-entry/,'group decisions must live at their proposed time inside the Timeline flow');
assert.match(composer,/data-proposal-vote="yes"/);
assert.match(composer,/data-visit-confirm/,'GPS moments remain pending until explicit confirmation');
assert.match(management,/commands\.modifyBooking/);
assert.match(management,/commands\.cancelBooking/);
assert.match(management,/commands\.reply/);
assert.match(management,/kind:'sheet'/);

console.log('M16.5AB Unified Places → Journey Living Sheet: PASS');
