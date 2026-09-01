'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'core/ai/ai-dashboard-service.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'core/ai/ai-action-runtime.js'),'utf8');
const consumer=fs.readFileSync(path.join(root,'core/intelligence/human-ai-consumer-projection-core.js'),'utf8');
const consumerSurface=`${dashboard}\n${consumer}`;

for(const phrase of [
  'Explainable Planning Trace · S16.01',
  'Owner-Entscheidung',
  'belegte Quellen',
  'Kein Rohtext im Action Ledger',
  'Mindestens ein zuständiger Owner ist gerade nicht erreichbar',
  'OpenAI Intent Compiler · deterministisch geprüft',
  'Owner-Read erneut prüfen',
  'Owner Receipt',
  'Recovery-Receipt steht im Verlauf'
])assert.equal(dashboard.includes(phrase),false,`technical implementation copy leaked into the normal AI consumer surface: ${phrase}`);

assert.match(dashboard,/Nachvollziehbar ausgewählt/);
assert.match(dashboard,/Warum diese Treffer\?/);
assert.doesNotMatch(dashboard,/Mit den verfügbaren Reiseinformationen abgeglichen/);
assert.doesNotMatch(dashboard,/Die verwendeten Informationen sind ausreichend aktuell/);
assert.match(dashboard,/simpleResolved=.*compiled\.intents\.length===1/,'a single resolved wish must not receive a duplicate intent card');
assert.doesNotMatch(dashboard,/\$\{item\.reasons\?\.length\?`<ul>/,'raw ranking prose must not be repeated below every compact Place card');
assert.match(dashboard,/Ein Teil deiner Anfrage konnte gerade nicht geladen werden/);
assert.match(consumerSurface,/Erneut versuchen/);
assert.match(consumerSurface,/Wunsch anpassen/);
assert.match(consumerSurface,/Rückgängig machen/);
assert.match(dashboard,/data-ai-receipt-status/,'machine-verifiable receipts must remain inspectable without exposing internal jargon');
assert.match(dashboard,/data-ai-compiler/,'the compiler provenance must remain inspectable for evals');
assert.doesNotMatch(dashboard,/<details class="lvx-planning-trace" open/,'planning rationale must be optional instead of blocking the conversation');
assert.doesNotMatch(dashboard,/appendMessage\('assistant',error(?:\?\.)?\.message/,'raw implementation errors must not be printed into the chat');

for(const phrase of [
  'Trip Owner',
  'Journey Day Graph',
  'Konflikte und Reihenfolge bleiben Journey-owned',
  'Status und nächste Schritte stammen aus Booking v1',
  'Diese Stories sind Memory Truth',
  'Self-only-Projektion aus Identity v1',
  'Übernahme in Journey, Booking oder Memory bleibt ein getrennter Owner-Flow'
])assert.equal(runtime.includes(phrase),false,`technical result copy leaked into the AI chat: ${phrase}`);

assert.match(runtime,/Wähle die Reise aus, mit der du weiterarbeiten möchtest/);
assert.match(runtime,/an diesem Tag geplant\./);
assert.match(runtime,/includePlanningDetails/,'route, rehearsal and disruption details must remain available on explicit request');
assert.match(runtime,/Die bestätigte Buchungsänderung wurde übermittelt/);
assert.match(runtime,/Vermutungen werden nicht als deine Präferenzen gespeichert/);
assert.match(dashboard,/Keine erfundenen Veranstaltungen/);

console.log('M16.5 Block 1 consumer-ready AI language gate: PASS');
