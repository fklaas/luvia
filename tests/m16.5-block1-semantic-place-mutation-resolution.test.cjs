'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = file => fs.readFileSync(file, 'utf8');
const ownerCalls = [];
let forceStaleFavoriteReadback = false;
const activeTrip = { id: 'trip-scharbeutz', title: 'Ostsee', timeZone: 'Europe/Berlin', destination: { name: 'Scharbeutz' } };
const timelineEntry = {
  id: 'entry-minigolf', tripId: activeTrip.id, tripPlaceId: 'trip-place-minigolf',
  providerPlaceId: 'provider-minigolf', placeId: 'place-minigolf', entityType: 'activity',
  title: 'Minigolf Timmendorfer Strand', startAt: '2027-06-14T12:00:00.000Z', durationMinutes: 120,
};
let timelineEntries = [timelineEntry];
const saved = [
  { tripId: activeTrip.id, tripPlaceId: 'trip-place-cafe', providerPlaceId: 'provider-cafe', placeId: 'place-cafe', primaryType: 'cafe', name: 'Küsten Café', isFavorite: true },
  { tripId: activeTrip.id, tripPlaceId: 'trip-place-minigolf', providerPlaceId: 'provider-minigolf', placeId: 'place-minigolf', primaryType: 'activity', name: timelineEntry.title, isFavorite: false },
];
const context = {
  console, Object, Array, Map, Set, WeakSet, Error, TypeError, String, Boolean, Number, Math, JSON, Date, Intl, RegExp, Promise,
  crypto: { randomUUID: () => `semantic-mutation-${ownerCalls.length + 1}` },
  CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
  dispatchEvent() {},
  LuviaTripContractV1: { getActiveTrip: () => activeTrip, listTrips: () => [activeTrip] },
  LuviaPlacesContractV1: {
    reads: { listSaved: async () => saved.map(place => forceStaleFavoriteReadback && place.providerPlaceId === 'provider-cafe' ? { ...place, isFavorite: true } : place), recommend: async () => ({ places: [] }) },
    commands: {
      async favorite(payload) { ownerCalls.push(['favorite', payload]); const place = saved.find(item => item.providerPlaceId === payload.providerPlaceId); if (place) place.isFavorite = true; return { tripPlaceId: payload.tripPlaceId || 'trip-place-created', isFavorite: true }; },
      async unfavorite(payload) { ownerCalls.push(['unfavorite', payload]); const place = saved.find(item => item.providerPlaceId === payload.providerPlaceId); if (place) place.isFavorite = false; return { tripPlaceId: payload.tripPlaceId, isFavorite: false }; },
      async importPlace(providerPlaceId) { ownerCalls.push(['importPlace', providerPlaceId]); return { placeId: 'place-created', tripPlaceId: 'trip-place-created', providerPlaceId }; },
      async plan(payload) { ownerCalls.push(['plan', payload]); timelineEntries = timelineEntries.filter(entry => entry.tripPlaceId !== payload.tripPlaceId).concat({ ...timelineEntry, tripPlaceId: payload.tripPlaceId, providerPlaceId: payload.providerPlaceId, startAt: payload.fields?.planned_at }); return { tripPlaceId: payload.tripPlaceId, plannedAt: payload.fields?.planned_at }; },
      async unplan(payload) { ownerCalls.push(['unplan', payload]); timelineEntries = timelineEntries.filter(entry => entry.tripPlaceId !== payload.tripPlaceId); return { tripPlaceId: payload.tripPlaceId }; },
      async updateLifecycle(tripPlaceId, status) { ownerCalls.push(['updateLifecycle', tripPlaceId, status]); return { tripPlaceId, status }; },
    },
  },
  LuviaJourneyContractV1: {
    reads: { snapshot: () => ({ entries: [...timelineEntries], days: [{ date: '2027-06-14', label: 'Montag', entries: [...timelineEntries], conflicts: [] }], summary: { entryCount: timelineEntries.length } }) },
  },
};
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of [
  'core/intelligence/travel-orchestration-core.js',
  'core/intelligence/intelligence-action-contract-core.js',
  'core/intelligence/intelligence-action-ledger-core.js',
  'core/ai/ai-action-runtime.js',
]) vm.runInContext(read(file), context, { filename: file });

const compiler = context.LuviaTravelOrchestrationCoreV1;
const runtime = context.LuviaAIActionRuntime;
const dialogue = ({ type, label, operation, target, start = null }) => ({
  confidence: 0.97,
  goals: [{
    type, label,
    timeWindow: start ? { start } : undefined,
    hardConstraints: [
      { key: 'operation', value: operation, label: operation },
      { key: 'target_place', value: target, label: target },
    ],
  }],
});

(async () => {
  const unplanSentence = 'Nimm bitte Minigolf Timmendorfer Strand wieder aus meiner Timeline heraus.';
  const unplanCompiled = compiler.compileDialogue(unplanSentence, dialogue({
    type: 'journey', label: 'Minigolf Timmendorfer Strand aus der Timeline entfernen', operation: 'remove', target: timelineEntry.title,
  }), { trip: activeTrip, locale: 'de-DE', online: true, now: '2026-09-02T12:00:00.000Z' });
  assert.equal(unplanCompiled.status, 'compiled');
  assert.equal(unplanCompiled.intents[0].semanticOperation, 'remove');
  assert.equal(unplanCompiled.intents[0].entityHints.targetName, timelineEntry.title.toLowerCase());
  assert.deepEqual([...unplanCompiled.intents[0].missingInputs], [], 'removing a unique existing entry must not demand a new date/time');

  const unplanPreview = await runtime.runMessage(unplanSentence, { compiledIntent: unplanCompiled, sourceMessage: unplanSentence, surface: 'global-chat' });
  assert.equal(unplanPreview.results.length, 1);
  assert.equal(unplanPreview.results[0].kind, 'confirmation');
  assert.equal(unplanPreview.results[0].evidence.actionId, 'places.place.unplan');
  assert.equal(unplanPreview.results[0].evidence.preview.name, timelineEntry.title);
  assert.equal(ownerCalls.length, 0, 'whole-sentence understanding may prepare only; it must not auto-mutate');

  const unplanReceipt = await runtime.execute('places.place.unplan', {}, { ledgerId: unplanPreview.results[0].evidence.ledgerId, userGesture: true, confirmed: true });
  assert.equal(unplanReceipt.evidence.status, 'completed');
  assert.equal(unplanReceipt.evidence.reference.readbackVerified, true);
  assert.equal(unplanReceipt.evidence.reference.readbackState, 'not_planned');
  assert.equal(ownerCalls.filter(call => call[0] === 'unplan').length, 1);
  const undoUnplan = runtime.prepareUndo(unplanPreview.results[0].evidence.ledgerId, { userGesture: true });
  assert.equal(undoUnplan.result.evidence.actionId, 'places.place.plan');
  const restored = await runtime.execute('places.place.plan', {}, { ledgerId: undoUnplan.ledgerId, userGesture: true, confirmed: true });
  assert.equal(restored.evidence.status, 'compensated');
  assert.equal(restored.evidence.reference.readbackVerified, true);
  assert.equal(ownerCalls.find(call => call[0] === 'plan')[1].fields.planned_at, timelineEntry.startAt, 'Undo must restore the exact owner time');

  const unfavoriteSentence = 'Entferne das Küsten Café bitte aus meinen Favoriten.';
  const unfavoriteCompiled = compiler.compileDialogue(unfavoriteSentence, dialogue({
    type: 'place', label: 'Küsten Café nicht mehr als Favorit führen', operation: 'remove', target: 'Küsten Café',
  }), { trip: activeTrip, locale: 'de-DE', online: true, now: '2026-09-02T12:00:00.000Z' });
  const unfavoritePreview = await runtime.runMessage(unfavoriteSentence, { compiledIntent: unfavoriteCompiled, sourceMessage: unfavoriteSentence, surface: 'global-chat' });
  assert.equal(unfavoritePreview.results[0].evidence.actionId, 'places.place.unfavorite');
  assert.equal(ownerCalls.filter(call => call[0] === 'unfavorite').length, 0, 'unfavorite also requires explicit confirmation');
  const unfavoriteReceipt = await runtime.execute('places.place.unfavorite', {}, { ledgerId: unfavoritePreview.results[0].evidence.ledgerId, userGesture: true, confirmed: true });
  assert.equal(unfavoriteReceipt.evidence.status, 'completed');
  assert.equal(unfavoriteReceipt.evidence.reference.readbackVerified, true);
  assert.equal(unfavoriteReceipt.evidence.reference.readbackState, 'not_favorite');
  const undoUnfavorite = runtime.prepareUndo(unfavoritePreview.results[0].evidence.ledgerId, { userGesture: true });
  const favoritedAgain = await runtime.execute('places.place.favorite', {}, { ledgerId: undoUnfavorite.ledgerId, userGesture: true, confirmed: true });
  assert.equal(favoritedAgain.evidence.status, 'compensated');
  assert.equal(favoritedAgain.evidence.reference.readbackVerified, true);

  const planSentence = 'Trage Minigolf Timmendorfer Strand am 14.06.2027 gegen 14 Uhr in meine Timeline ein.';
  const planCompiled = compiler.compileDialogue(planSentence, dialogue({
    type: 'place', label: 'Minigolf Timmendorfer Strand in die Timeline eintragen', operation: 'plan', target: timelineEntry.title, start: '2027-06-14T14:00:00',
  }), { trip: activeTrip, locale: 'de-DE', online: true, now: '2026-09-02T12:00:00.000Z' });
  const planPreview = await runtime.runMessage(planSentence, { compiledIntent: planCompiled, sourceMessage: planSentence, knownPlaceSubjects: [saved[1]], surface: 'global-chat' });
  assert.equal(planPreview.results[0].evidence.actionId, 'places.place.plan');
  assert.equal(planPreview.results[0].evidence.preview.date, '2027-06-14');
  assert.equal(planPreview.results[0].evidence.preview.time, '14:00');

  const dayRead = await runtime.runMessage('Zeige meinen Tagesplan.', {
    compiledIntent: compiler.compileIntent('Zeige meinen Tagesplan.', { trip: activeTrip, online: true }), surface: 'global-chat',
  });
  assert.equal(dayRead.results[0].kind, 'day_plan');
  assert.equal(dayRead.results[0].items[0].entries[0].actions[0].actionId, 'places.place.unplan');
  assert.equal(dayRead.results[0].items[0].entries[0].actions[0].payload.fields.planned_at, timelineEntry.startAt);

  const uncertainPreview = await runtime.runMessage(unfavoriteSentence, { compiledIntent: unfavoriteCompiled, sourceMessage: unfavoriteSentence, surface: 'global-chat' });
  forceStaleFavoriteReadback = true;
  const uncertainReceipt = await runtime.execute('places.place.unfavorite', {}, { ledgerId: uncertainPreview.results[0].evidence.ledgerId, userGesture: true, confirmed: true });
  assert.equal(uncertainReceipt.evidence.status, 'outcome_unknown', 'a successful command response without matching Owner readback must not claim completion');
  assert.equal(uncertainReceipt.evidence.reference.readbackVerified, false);
  assert.equal(runtime.recoveryPlan(uncertainPreview.results[0].evidence.ledgerId).kind, 'owner-reconciliation');
  await assert.rejects(runtime.retry(uncertainPreview.results[0].evidence.ledgerId, { userGesture: true }), error => error.code === 'INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED', 'an unconfirmed Owner outcome must block blind retry');

  console.log('M16.5 Block 1 semantic Places mutation resolution: PASS');
  console.log('Whole sentence -> exact Owner entity -> Preview -> confirmation -> Receipt -> separately confirmed Undo: PASS');
  console.log('Favorite / Unfavorite / Plan / Unplan remain non-automatic and Chat-operable: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
