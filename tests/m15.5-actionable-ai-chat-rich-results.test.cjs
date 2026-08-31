'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');

for(const needle of [
  'LuviaAIActionRuntime',
  'actionRuntime().runMessage(step.label,{surface,compiledIntent:scoped,sourceMessage:conversation.request,excludedProviderPlaceIds:[...shownPlaceIds],feedbackContext:lastFeedbackContext})',
  'core?.compileIntent?.(request,context)',
  'core?.compileDialogue?.(request,dialogue,context)',
  'actionResponse.results.forEach(appendRichResult)',
  'class="lvx-rich-result is-',
  'class="lvx-place-card"',
  'class="lvx-day-card"',
  'class="lvx-command-receipt',
  'data-ai-owner-action=',
  'ownerActions=new Map()',
  'actionRuntime().prepare(offer.actionId,offer.payload,{userGesture:true,surface})',
  'ledgerId:prepared.ledgerId,userGesture:true',
  'actionRuntime().prepareUndo(ledgerId',
  'data-ai-action-undo=',
  'appendIntentGraph(compiled)',
  'sequencePlan?.(compiled)',
  'Owner-Aktion bestätigt; das Receipt steht im Verlauf.',
  'Ein Satz darf mehrere Wünsche enthalten.',
  'Lesen darf Luvia direkt.'
])assert.ok(source.includes(needle),`Actionable AI chat missing ${needle}`);

for(const forbidden of ['LuviaTripStore','LuviaPlaceCore','LuviaPlaceRuntime','LuviaBookingRepository','LuviaTimelineCore','LuviaSupabaseService','.from(','.rpc(','functions.invoke(','localStorage','sessionStorage']){
  assert.equal(source.includes(forbidden),false,`AI chat bypasses public owner boundary: ${forbidden}`);
}

assert.ok(/type="button" class="lvx-rich-action" data-ai-owner-action=/.test(source),'rich actions must be explicit buttons');
assert.ok(/ownerButton\.disabled=true;ownerButton\.setAttribute\('aria-busy','true'\)/.test(source),'owner action must expose busy state');
assert.ok(/receipt\.evidence\?\.status==='failed'/.test(source),'owner receipt failure must remain visible');
assert.ok(/safeImage\(item\.image\?\.url\)/.test(source),'provider image URL must pass the bounded media guard');
assert.ok(/role="log" aria-live="polite"/.test(source),'conversation log semantics must remain active');
assert.ok(/class="lvx-command-receipt[^`]*role="status"/.test(source),'receipts must announce status');

console.log('M15.5 Actionable AI Chat Rich Results: PASS');
console.log('Restaurant cards / Day Plan / Receipts: PASS');
console.log('Owner actions require direct user gesture: PASS');
console.log('Private Domain access in chat: 0');
