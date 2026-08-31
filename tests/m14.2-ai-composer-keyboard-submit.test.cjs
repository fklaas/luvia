'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const ownership=fs.readFileSync('docs/modularization/FILE-OWNERSHIP.csv','utf8');
const safeRunner=fs.readFileSync('tests/run-m4.3-safe-regression.cjs','utf8');

for(const needle of [
  'data-ai-command-form',
  'class="lvx-command-scroll"',
  'class="lvx-command-composer-panel"',
  'role="log" aria-live="polite" aria-relevant="additions text"',
  'class="lvx-command-message is-assistant"',
  'data-ai-suggestion=',
  'aria-label="Passende Folgefragen"',
  'type="submit" data-ai-send',
  'aria-label="Anfrage an Luvia senden"',
  'aria-keyshortcuts="Enter"',
  'Enter sendet · Shift+Enter fügt eine Zeile ein',
  'form.onsubmit=',
  "overlay.addEventListener('keydown'",
  "event.target!==input||event.key!=='Enter'||event.shiftKey||event.isComposing||event.keyCode===229",
  'event.preventDefault();submit()',
  'if(submitting)return',
  "sendLabel.textContent='Luvia denkt …'",
  "sendLabel.textContent='Senden'",
  'input.readOnly=submitting',
  "button.setAttribute('aria-busy'",
  "appendMessage('user',request)",
  "appendMessage('assistant'",
  'appendSuggestions(response.data?.suggestedActions)',
  'suggestions.get(suggestion.dataset.aiSuggestion)'
])assert.ok(source.includes(needle),`AI Composer missing ${needle}`);

assert.equal((source.match(/type="submit" data-ai-send aria-label=/g)||[]).length,1,'exactly one semantic send control expected');
assert.doesNotMatch(source,/button\.textContent='Luvia denkt/,'loading copy must not destroy nested accessible button markup');
assert.doesNotMatch(source,/if\(event\.target\.closest\?\.\('\[data-ai-send\]'\)\)submit\(\)/,'send must use form semantics instead of delegated click-only behavior');
assert.doesNotMatch(source,/answer\.replaceChildren\(\)/,'conversation messages must not be erased for a later turn');

for(const forbidden of ['localStorage','sessionStorage','LuviaTripStore','LuviaPlacesCore','LuviaBookingRepository','.from(','.rpc(','functions.invoke(','commands.execute']){
  assert.equal(source.includes(forbidden),false,`M14 Composer may not gain persistence or Domain Command authority: ${forbidden}`);
}

assert.ok(safeRunner.includes('tests/m14.2-ai-composer-keyboard-submit.test.cjs'));
assert.ok(ownership.includes('tests/m14.2-ai-composer-keyboard-submit.test.cjs'));

console.log('M14.2 AI Composer Keyboard / Submit Semantics: PASS');
console.log('Visible semantic submit: PASS');
console.log('Enter / Shift+Enter / IME safety: PASS');
console.log('Conversation history / selectable follow-ups: PASS');
console.log('Domain command authority: NONE');
