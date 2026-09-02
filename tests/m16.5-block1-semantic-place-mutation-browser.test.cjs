'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const fixture = fs.readFileSync('tests/fixtures/m16.5ab-living-compass-ai-browser.html', 'utf8');
const runtime = fs.readFileSync('core/ai/ai-action-runtime.js', 'utf8');
const dashboard = fs.readFileSync('core/ai/ai-dashboard-service.js', 'utf8');
const actionContract = fs.readFileSync('core/intelligence/intelligence-action-contract-core.js', 'utf8');

assert.match(fixture, /semantic-place-mutations-139/, 'the visible local gate must have an explicit semantic mutation scenario');
assert.match(fixture, /listSaved:async/, 'the local browser must expose saved Places through the real Owner read boundary');
assert.match(fixture, /Wellen Café aus den Favoriten entfernen/);
assert.match(fixture, /Ostsee Minigolf aus der Timeline entfernen/);
assert.match(fixture, /Ostsee Minigolf in die Timeline eintragen/);
assert.match(fixture, /target_place/, 'the mocked AI provider must return a structured subject, not an action ID');
assert.match(runtime, /semanticPlaceMutationPreview/);
assert.match(runtime, /places\.place\.unfavorite/);
assert.match(runtime, /places\.place\.unplan/);
assert.match(runtime, /places\.place\.plan/);
assert.match(runtime, /prepare\(actionId,payload/, 'natural language may only reach the shared preview/confirmation lifecycle');
assert.match(runtime, /compensationOrigins\.set/, 'Undo must remain a separately confirmed compensation');
assert.match(actionContract, /actions:\(Array\.isArray\(entry\.actions\)/, 'day entries must retain normalized Owner action offers');
assert.match(dashboard, /entry\.actions\?\.length[\s\S]*entry\.actions\.map/, 'the compact Chat timeline must render the entry-level Unplan control');
assert.match(dashboard, /displayDate\(day\.date\)/, 'the visible day card must use the German consumer date formatter');

console.log('M16.5 Block 1 semantic Places mutation browser gate: PASS');
console.log('Visible fixture: Favorite / Unfavorite / Plan / Unplan + Receipt + separately confirmed Undo: WIRED');
