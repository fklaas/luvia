const assert=require('node:assert/strict');
const fs=require('node:fs');

const dashboard=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const orchestration=fs.readFileSync('core/intelligence/travel-orchestration-core.js','utf8');

assert.match(dashboard,/version:3,goalTypes:/,'semantic compiler contract must be explicitly versioned');
assert.match(dashboard,/Interpret the meaning of the complete sentence in context/,'the model must classify complete meaning instead of isolated words');
assert.match(dashboard,/never guess a fallback domain/,'ambiguous meaning must become a question');
assert.match(dashboard,/semanticUsable/,'structured semantic output must be the primary online route');
assert.doesNotMatch(dashboard,/preservesDeterministicOwners/,'keyword owners must not overrule a confident semantic result');
assert.match(dashboard,/Kurze Rückfrage statt einer geratenen Aktion/,'the user must see a clarification instead of a guessed action');
assert.doesNotMatch(orchestration,/openPlaceWish\?\[/,'generic desire verbs must not silently route to Places');
assert.match(orchestration,/semanticLowConfidence/,'low-confidence semantic output must fail into clarification');
assert.match(orchestration,/andere\|nächste\|naechste/,'offline/safety fallback must still recognize trip selection without opening Places');

console.log('M16.5 Block 1 semantic-first AI routing: PASS');
