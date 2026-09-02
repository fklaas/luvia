'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = file => fs.readFileSync(file, 'utf8');
const events = [];
const context = {
  console, Object, Array, Map, Set, WeakSet, Error, TypeError, String, Boolean, Number, Math, JSON, Date, RegExp, Promise, Intl,
  CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
  dispatchEvent(event) { events.push(event); },
  LuviaTripContractV1: {
    getActiveTrip: () => ({ id: 'trip-nav', title: 'Aktuelle Reise', timezone: 'Europe/Berlin' }),
    listTrips: () => [
      { id: 'trip-nav', title: 'Aktuelle Reise', timezone: 'Europe/Berlin' },
      { id: 'trip-next', title: 'Nächste Reise', timezone: 'Europe/Berlin' },
    ],
  },
};
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of [
  'core/runtime/navigation-contract-core.js',
  'core/intelligence/intelligence-action-contract-core.js',
  'core/intelligence/intelligence-action-ledger-core.js',
  'core/ai/ai-action-runtime.js',
]) vm.runInContext(read(file), context, { filename: file });

(async () => {
  const actions = context.LuviaIntelligenceActionContractCoreV1;
  const runtime = context.LuviaAIActionRuntime;
  const navigation = actions.getAction('navigation.route.open');
  assert.equal(navigation.ownerContract, 'navigation.v1');
  assert.equal(navigation.ownerMethod, 'createIntent');
  assert.equal(navigation.effect, 'NAVIGATION');
  assert.equal(navigation.confirmation, 'USER_GESTURE');

  const direct = await runtime.runMessage('Öffne bitte Hotels und Unterkünfte', { surface: 'global-chat' });
  assert.equal(direct.handled, true);
  assert.equal(direct.results[0].kind, 'receipt');
  assert.equal(direct.results[0].evidence.status, 'opened');
  assert.equal(events.find(event => event.type === 'luvia:navigate-request').detail.intent.route, 'hotels');

  events.length = 0;
  const typo = await runtime.runMessage('offne den Bereich Unterkunfte', { surface: 'global-chat' });
  assert.equal(typo.handled, true);
  assert.equal(events.find(event => event.type === 'luvia:navigate-request').detail.intent.route, 'hotels');

  events.length = 0;
  const tripSelection = await runtime.runMessage('Ich will eine andere Reise auswählen.', {
    surface: 'global-chat',
    compiledIntent: {
      contractId: 'intelligence.travel-orchestration.v1',
      status: 'compiled',
      intents: [{
        domain: 'trip', mode: 'read', semanticOperation: 'switch',
        clause: 'Andere Reise auswählen · Reise wechseln', missingInputs: [],
      }],
    },
  });
  assert.equal(tripSelection.handled, true);
  assert.equal(tripSelection.results[0].kind, 'trip_collection','trip selection must list trips inside the chat');
  assert.equal(tripSelection.results[0].items.length, 2);
  assert.equal(tripSelection.results[0].items[1].actions[0].actionId, 'trip.active.select');
  assert.equal(events.some(event => event.type === 'luvia:navigate-request'), false,'semantic trip selection must not leave the chat');

  const invalid = actions.validateActionInput('navigation.route.open', { route: 'https://attacker.invalid' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.issues.some(issue => issue.code === 'enum' && issue.path === 'route'));
  assert.throws(() => runtime.prepare('navigation.route.open', { route: 'https://attacker.invalid' }, { userGesture: true }), /keine fremde Seite geöffnet/);
  assert.throws(() => runtime.prepare('navigation.route.open', { route: 'hotels' }), /direkte Nutzerauswahl/);

  const snapshot = runtime.capabilitySnapshot();
  const routeCapability = snapshot.actions.find(action => action.actionId === 'navigation.route.open');
  assert.equal(routeCapability.available, true);
  console.log('M16.5 Block 1 chat navigation parity: PASS');
  console.log('Hotel navigation, typo tolerance, route allow-list and user-gesture gate: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
