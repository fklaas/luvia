'use strict';

/**
 * Reproduces real UI category failures observed on Integration (Scharbeutz).
 * Collects every failing case so one red run documents the full gap vs user-visible truth.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const check = (name, fn) => {
  try {
    fn();
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
};

const sandbox = { Object, Array, Map, Set, Date, Math, Number, String, Boolean, RegExp, JSON, Promise, console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('core/places/places-domain-contract-core.js'), sandbox);
vm.runInContext(read('core/places/global-place-contracts.js'), sandbox);
const C = sandbox.LuviaGlobalPlaceContracts;

function place(partial) {
  return {
    providerPlaceId: partial.id || partial.providerPlaceId || partial.name,
    provider: 'geoapify',
    ...partial
  };
}

check('Fall A food purity', () => {
  const foodCohort = [
    place({ id: 'r1', name: 'Capolino', primaryType: 'restaurant', types: ['catering', 'restaurant', 'catering.restaurant'] }),
    place({ id: 'c1', name: 'Café Köster', primaryType: 'cafe', types: ['catering', 'cafe', 'catering.cafe'] }),
    place({ id: 'b1', name: 'Strandbar', primaryType: 'bar', types: ['catering', 'bar', 'catering.bar'] }),
    place({ id: 'shop1', name: 'Modehaus', primaryType: 'store', types: ['commercial', 'store', 'commercial.clothing'] }),
    place({ id: 'opt1', name: 'Optik Meyer', primaryType: 'store', types: ['commercial', 'commercial.optician'] }),
    place({ id: 'm1', name: 'Museum', primaryType: 'museum', types: ['entertainment', 'museum', 'entertainment.museum'] }),
    place({ id: 's1', name: 'Sportplatz', primaryType: 'sport', types: ['sport', 'activity'] })
  ];
  const foodVisible = foodCohort.filter((p) => C.accepts(p, 'food', '', {}) === true).map((p) => p.name).sort();
  assert.deepEqual(foodVisible, ['Café Köster', 'Capolino', 'Strandbar'].sort());
});

check('Fall B activities purity keep/drop', () => {
  const activityCohort = [
    place({ id: 'r2', name: 'La Vie', primaryType: 'catering', types: ['catering', 'restaurant', 'catering.restaurant'] }),
    place({ id: 'c2', name: 'Grande Beach Café', primaryType: 'cafe', types: ['catering', 'cafe', 'catering.cafe'] }),
    place({ id: 'sport1', name: 'Rodelberg', primaryType: 'sport', types: ['sport', 'activity'] }),
    place({ id: 'play1', name: 'Spielplatz Hafen', primaryType: 'playground', types: ['leisure', 'leisure.playground', 'activity'] }),
    place({ id: 'ent1', name: 'Kino', primaryType: 'movie_theater', types: ['entertainment', 'entertainment.cinema', 'activity'] }),
    place({ id: 'attr1', name: 'Leuchtturm', primaryType: 'tourist_attraction', types: ['tourism', 'tourism.sights', 'tourist_attraction'] }),
    place({ id: 'shop2', name: 'Boutique', primaryType: 'store', types: ['commercial', 'store'] })
  ];
  const activityVisible = activityCohort.filter((p) => C.accepts(p, 'activities', '', {}) === true).map((p) => p.name).sort();
  assert.deepEqual(activityVisible.sort(), ['Kino', 'Leuchtturm', 'Rodelberg', 'Spielplatz Hafen'].sort());
});

check('Fall B+ reject street-fallback activity pin', () => {
  const ostpreussen = place({
    id: 'ostpreussen',
    name: 'Ostpreußenstraße',
    primaryType: 'sport',
    types: ['sport', 'activity'],
    providerNativeTypes: ['sport']
  });
  // Current accepts() returns true — UI shows this exact pin. Spec: reject unnamed / street-only activity shells.
  assert.equal(C.accepts(ostpreussen, 'activities', '', {}), false);
});

check('Fall C multi-category exclusivity', () => {
  const hybrid = place({
    id: 'hybrid',
    name: 'Hybrid',
    primaryType: 'leisure',
    types: ['leisure', 'activity', 'catering.restaurant', 'restaurant'],
    providerNativeTypes: ['leisure', 'catering.restaurant']
  });
  assert.equal(C.accepts(hybrid, 'activities', '', {}), false);
  assert.equal(C.accepts(hybrid, 'food', '', {}), true);
});

check('Fall D spatial category switch contracts', () => {
  const spatial = read('app/places/places-spatial-experience.js');
  assert.match(spatial, /subjectText:state\.userQuery\|\|''/);
  assert.match(spatial, /const restored=restoreCategoryCohort\(def\.key,def\.query\)/);
  assert.match(spatial, /replaceCategory:!restored/);
  assert.match(spatial, /clearVisibleCategoryResults/);
  assert.match(spatial, /!event\?\.originalEvent/);
});

check('Fall B provider: split one Geoapify category per request', () => {
  const gateway = read('supabase/functions/luvia-gateway/_shared/places.ts');
  assert.match(gateway, /splitGeoapifyCategories/, 'gateway must document split category fetches');
  assert.match(gateway, /categories\.length>1\?categories\.map\(category=>\[category\]\)/, 'multi-category allowlists must not be joined into one CSV request');
});

check('Primary type must prefer catering.restaurant over building', () => {
  const gateway = read('supabase/functions/luvia-gateway/_shared/places.ts');
  assert.match(gateway, /function preferChildCategory/, 'gateway needs preferChildCategory');
  assert.match(gateway, /preferChildCategory\(mappedTypes,nativeEvidence\)/, 'primaryType must use preferChildCategory');
  assert.match(gateway, /if\(!geoapifyHasProviderName\(props\)\)return null/, 'unnamed OSM features must not become pins');
});

if (failures.length) {
  console.error('m16.5 category UI reality regressions: FAIL');
  for (const item of failures) console.error(` - ${item}`);
  console.error(`\n${failures.length} failing reality check(s). No product fix applied in this step.`);
  process.exitCode = 1;
} else {
  console.log('m16.5 category UI reality regressions: PASS');
}
