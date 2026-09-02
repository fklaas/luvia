'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');

for(const needle of [
  'LuviaAIActionRuntime',
  'actionRuntime().runMessage(step.label,{surface,compiledIntent:scoped,sourceMessage:conversation.request,knownPlaceSubjects:[...placeSubjects.values()],excludedProviderPlaceIds:[...shownPlaceIds],feedbackContext:lastFeedbackContext})',
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
  'const referencedPlan=(compiled,request)=>',
  'actionRuntime().prepare(reference.offer.actionId,reference.offer.payload,{userGesture:true,surface})',
  'Erst mit deiner Bestätigung wird der Eintrag erstellt.',
  'ledgerId:prepared.ledgerId,userGesture:true',
  'actionRuntime().prepareUndo(ledgerId',
  'data-ai-action-undo=',
  'appendIntentGraph(compiled)',
  'sequencePlan?.(compiled)',
  'Die Änderung ist abgeschlossen.',
  'Ein Satz darf mehrere Wünsche enthalten.',
  'Passende Informationen liest Luvia direkt.'
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
assert.match(source,/const displayDate=value=>/,'chat must own one visible DD.MM.YYYY formatter');
assert.match(source,/const zonedDateTime=value=>/,'absolute owner timestamps must be projected through the active trip or profile timezone');
assert.match(source,/time=value=>zonedDateTime\(value\)\?\.time/,'Journey readback must not display the raw UTC clock from an ISO timestamp');
assert.match(source,/result\.meta\?\.planningDetailsIncluded\?renderJourneyResilience/,'journey diagnostics must not flood an ordinary day-plan answer');
assert.match(source,/displayDate\(day\.date\)/,'day cards must render their date in user format');
assert.match(source,/consumer\(\)\.projectPreview\(\{result,preview,compensatesLedgerId\}\)/,'mutation previews must use the shared consumer projection with user-formatted dates');

console.log('M15.5 Actionable AI Chat Rich Results: PASS');
console.log('Restaurant cards / Day Plan / Receipts: PASS');
console.log('Owner actions require direct user gesture: PASS');
console.log('Private Domain access in chat: 0');
