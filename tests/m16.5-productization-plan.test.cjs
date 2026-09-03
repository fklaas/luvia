const assert = require('node:assert');
const fs = require('node:fs');

const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted && character === '"' && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ',') {
      row.push(field);
      field = '';
    } else if (!quoted && character === '\n') {
      row.push(field);
      if (row.some(value => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  assert.strictEqual(quoted, false, 'CSV contains an unterminated quoted field');
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...values] = rows;
  values.forEach((value, index) => {
    assert.strictEqual(value.length, header.length, `CSV row ${index + 2} has the wrong column count`);
  });
  return values.map(value => Object.fromEntries(header.map((name, index) => [name, value[index]])));
}

const plan = read('docs/modularization/M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md');
const productReset = read('docs/modularization/LUVIA-PRODUCT-RESET-MASTERPLAN-2026.md');
const fiftyPoint = read('docs/modularization/LUVIA-FIFTY-POINT-OWNER-FIRST-EXECUTION-PLAN.md');
const handout = read('docs/modularization/M16.5-BLOCK0-TO-BLOCK5-MASTER-HANDOUT.md');
const surfaces = parseCsv(read('docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv'));
const owners = parseCsv(read('docs/modularization/M16.5-CORE-OWNER-MATRIX.csv'));
const ownership = read('docs/modularization/FILE-OWNERSHIP.csv');
const roadmap = read('ROADMAP-LUVIA-CURRENT.md');
const current = read('CURRENT-BUILD.md');
const runner = read('tests/run-m4.3-safe-regression.cjs');

const allowedStatuses = new Set([
  'NOT CONNECTED',
  'SHELL-WIRED',
  'VISUAL PARITY',
  'FUNCTIONAL PARITY',
  'RESILIENCE COMPLETE',
  'PUBLIC VERIFIED',
  'USER ACCEPTED'
]);

assert.match(plan, /Places continuity[\s\S]*Public Landing and real Authentication[\s\S]*Identity\/Profile onboarding[\s\S]*First-Trip Composer[\s\S]*Places Golden Slice/);
assert.match(plan, /No functional acceptance is granted without a real visible E2E sequence/);
assert.match(plan, /Main and Production remain locked until the complete M16\.5 parity matrix/);
assert.match(plan, /accepted Living Compass interaction is frozen after M16\.5Q/);
assert.match(plan, /selected Place, exact[\s\S]*rail position, map marker\/viewport, filters, query, focus origin/);
assert.match(productReset, /Luvia turns a personal travel intention into an executable, live-adaptable[\s\S]*lasting memory/);
assert.match(productReset, /G2 — Golden Journey/);
assert.match(productReset, /B1 \/ P01–P10[\s\S]*B2 \/ P11–P20[\s\S]*B3 \/ P21–P30[\s\S]*B4 \/ P31–P40[\s\S]*B5 \/ P41–P50/);
assert.match(productReset, /Zero cross-venue and cross-property redirects/);
assert.match(productReset, /No parallel result list appears beside or below the map/);
assert.match(productReset, /five independent users/);
assert.match(productReset, /External provider delay does not stop the whole product/);
assert.match(productReset, /Continue directly from public Integration `\.167`; do not restart at M5/);
assert.match(productReset, /Finish the shared Places\/Hotels map interaction/);
assert.match(productReset, /explicit user acceptance for this surface/);
assert.match(fiftyPoint, /LUVIA-PRODUCT-RESET-MASTERPLAN-2026\.md/);
assert.match(handout, /PRODUCT RESET BINDING/);
assert.match(handout, /APP 13\.82\.167 PUBLIC INTEGRATION CHECKPOINT, MAP\/MINI-INFO USER ACCEPTANCE OPEN/);
assert.match(handout, /local Integration RC 13\.82\.168/);
assert.match(handout, /Lokaler immutable Release Candidate: \*\*App 13\.82\.168 \/ Core 4\.82\.168\*\*/);
assert.match(handout, /Öffentliche Integration bleibt bis zum tatsächlichen Deployment und Byte-Proof \*\*App 13\.82\.167 \/ Core 4\.82\.167\*\*/);

for (const file of [
  'HANDOFF-NORMAL-CHATGPT-CURRENT.md',
  'docs/handoffs/README.md',
  'docs/handoffs/STARTPROMPT-NORMAL-CHATGPT.md',
  'docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md',
  'docs/handoffs/M5-TO-CURRENT-CONTEXT-BRIDGE.md',
  'docs/handoffs/CURRENT-MAP-MINI-INFO-SLICE.md'
]) {
  assert(fs.existsSync(file), `current ChatGPT terminal handoff missing ${file}`);
}

const terminalProtocol = read('docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md');
const contextBridge = read('docs/handoffs/M5-TO-CURRENT-CONTEXT-BRIDGE.md');
const mapSlice = read('docs/handoffs/CURRENT-MAP-MINI-INFO-SLICE.md');
assert.match(terminalProtocol, /ERGEBNIS AB HIER KOPIEREN/);
assert.match(terminalProtocol, /--name integration-luvia/);
assert.match(contextBridge, /Nicht M5 fortsetzen\. Nicht B2 beginnen/);
assert.match(mapSlice, /ÖFFENTLICHER `\.167`-CHECKPOINT \/ NUTZERABNAHME OFFEN/);

assert.strictEqual(surfaces.length, 20, 'the Product Surface Matrix must retain all 20 controlled rows');
assert.strictEqual(owners.length, 18, 'the Core Owner Matrix must retain all 18 controlled owner rows');
surfaces.forEach(surface => assert(allowedStatuses.has(surface.current_status), `invalid surface status: ${surface.current_status}`));

const compass = surfaces.find(surface => surface.surface_id === 'living-compass');
const continuity = surfaces.find(surface => surface.surface_id === 'places-continuity');
const landing = surfaces.find(surface => surface.surface_id === 'public-landing');
const profile = surfaces.find(surface => surface.surface_id === 'profile-onboarding');
const trip = surfaces.find(surface => surface.surface_id === 'first-trip-composer');
assert.strictEqual(compass?.current_status, 'USER ACCEPTED');
assert.strictEqual(continuity?.priority, 'P0');
assert.strictEqual(landing?.priority, 'P0');
assert.strictEqual(profile?.priority, 'P0');
assert.strictEqual(trip?.priority, 'P0');

for (const file of [
  'docs/modularization/M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md',
  'docs/modularization/LUVIA-PRODUCT-RESET-MASTERPLAN-2026.md',
  'docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv',
  'docs/modularization/M16.5-CORE-OWNER-MATRIX.csv',
  'HANDOFF-NORMAL-CHATGPT-CURRENT.md',
  'docs/handoffs/README.md',
  'docs/handoffs/STARTPROMPT-NORMAL-CHATGPT.md',
  'docs/handoffs/CHATGPT-TERMINAL-PROTOCOL.md',
  'docs/handoffs/M5-TO-CURRENT-CONTEXT-BRIDGE.md',
  'docs/handoffs/CURRENT-MAP-MINI-INFO-SLICE.md',
  'tests/m16.5-productization-plan.test.cjs'
]) {
  assert(ownership.includes(file), `ownership registry missing ${file}`);
}

assert(roadmap.includes('M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md'));
assert(roadmap.includes('LUVIA-PRODUCT-RESET-MASTERPLAN-2026.md'));
assert(current.includes('M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md'));
assert(runner.includes('tests/m16.5-productization-plan.test.cjs'));

console.log('M16.5 Design Integration and Feature Productization Plan: PASS');
console.log(`Controlled surfaces / Core owners: ${surfaces.length} / ${owners.length}`);
console.log('Main / Production Design Freeze lock: ACTIVE');
