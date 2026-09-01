'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');

for(const token of [
  'confirmations=new Map()',
  'recoveries=new Map()',
  'data-ai-confirmation-card=',
  'data-ai-confirm=',
  'data-ai-cancel-confirmation=',
  'consumer().projectPreview({result,preview,compensatesLedgerId})',
  'actionRuntime().prepare(offer.actionId,offer.payload,{userGesture:true,surface})',
  'prepared.requiresConfirmation',
  'ledgerId:entry.ledgerId,userGesture:true,confirmed:true',
  'actionRuntime().cancel(entry.ledgerId)',
  'data-ai-action-retry=',
  'actionRuntime().retry(ledgerId)',
  "result.evidence?.status==='outcome_unknown'",
  "result.kind==='trip_collection'",
  "result.kind==='booking_collection'",
  "result.kind==='memory_collection'",
  "result.kind==='preference_summary'",
  'lvx-trip-card',
  'lvx-booking-card',
  'lvx-memory-card',
  'class="lvx-preference-grid"'
])assert.ok(source.includes(token),`M16 confirmed action chat missing ${token}`);

assert.equal(source.includes('Verbindlich bestätigen'),false,'confirmation copy must stay concise for consumers');

for(const forbidden of ['confirm(', 'window.confirm','naturalLanguageConfirmation','autoConfirm','blindRetry']){
  assert.equal(source.includes(forbidden),false,`M16 chat contains unsafe confirmation/retry shortcut: ${forbidden}`);
}

assert.match(source,/const failed=result\.evidence\?\.status==='failed'[\s\S]*if\(failed&&result\.evidence\?\.retryable&&ledgerId\)/,'retry must require an explicitly retryable failed receipt');
assert.match(source,/confirmButton\?await actionRuntime\(\)\.execute/,'confirmation control must be the execution branch');
assert.match(source,/cancelButton&&entry\.sourceButton/,'cancel must restore the originating owner action');

console.log('M16.4 Intelligence Confirmation / Recovery Chat: PASS');
console.log('Explicit confirm / cancel controls: PASS');
console.log('Trip / Booking / Memory / Identity rich results: PASS');
console.log('Outcome-unknown blind retry control: NONE');
