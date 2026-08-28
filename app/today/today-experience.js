(()=>{
'use strict';

const VERSION='1.2.0';
let cleanup=null,binding=null;
const fallbackEsc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const core=()=>window.LuviaTodayCompositionCoreV1||(()=>{throw new Error('Today Composition Core v1 fehlt.')})();
function dateLabel(value){if(!value)return'';const parsed=new Date(`${value}T12:00:00`);return Number.isNaN(parsed.getTime())?'':parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}
function dateRange(trip={}){const start=dateLabel(trip.startDate||trip.start_date),end=dateLabel(trip.endDate||trip.end_date);return start?(end?`${start} – ${end}`:`Ab ${start}`):'Zeitraum noch offen'}
function networkOnline(){try{return window.LuviaPlatformPorts?.get?.('NetworkPort')?.isOnline?.()!==false}catch{return true}}
function modelFor({trip={},profile={}}={}){
  const travel=window.LuviaControlCenterTravelIdentity?.snapshot?.()||{};
  const attention=window.LuviaControlCenterAttention?.snapshot?.()||{items:[]};
  const journey=window.LuviaJourneyContractV1?.reads?.snapshot?.({trip})||null;
  const preferenceGuidance=journey?window.LuviaTripPreferenceContextV1?.dayGuidance?.(journey)||null:null;
  return core().compose({
    trip:{id:trip.id||trip.tripId,title:trip.title||trip.tripName,destination:trip.destination?.formattedAddress||trip.destination?.name||trip.destinationName,symbol:trip.symbol,dateRange:dateRange(trip)},
    viewer:{displayName:profile.displayName||profile.name},
    travel:{phase:travel.phase,tripDay:travel.tripDay},
    attention,
    journey,
    preferenceGuidance,
    network:{online:networkOnline()},
    clock:{now:new Date().toISOString(),hour:new Date().getHours()}
  });
}
function actionMarkup(action,esc){
  if(action.kind==='assistant')return`<button class="lvt-action lvt-action--primary" type="button" data-ai-ask-open data-luvia-experience-component="commandSurface"><span aria-hidden="true">✦</span>${esc(action.label)}</button>`;
  return`<button class="lvt-action" type="button" data-view="${esc(action.route)}">${esc(action.label)}</button>`;
}
function attentionMarkup(model,esc){
  if(!model.attention.length)return`<article class="lvt-attention lvt-attention--clear"><span class="lvt-attention-icon" aria-hidden="true">✓</span><div><strong>Alles ruhig</strong><p>Keine offene Reiseentscheidung braucht gerade eure Aufmerksamkeit.</p></div></article>`;
  return model.attention.map(item=>`<article class="lvt-attention" data-level="${esc(item.level)}"><span class="lvt-attention-icon" aria-hidden="true">${item.level==='blocked'?'!':item.level==='action_required'?'→':'•'}</span><div><small>${esc(item.source)}</small><strong>${esc(item.title)}</strong>${item.message?`<p>${esc(item.message)}</p>`:''}${item.action?`<button type="button" data-view="${esc(item.action.route)}">${esc(item.action.label)}</button>`:''}</div></article>`).join('');
}
function phaseMarkup(model,esc){
  const phases=[['planning','Gestalten'],['before','Vorfreude'],['during','Unterwegs'],['after','Erinnern']];
  return`<ol class="lvt-phases" aria-label="Reisephase">${phases.map(([id,label])=>`<li class="${model.context.phase===id?'is-active':''}" ${model.context.phase===id?'aria-current="step"':''}><span></span><small>${esc(label)}</small></li>`).join('')}</ol>`;
}
function premiumMarkup(model,esc){
  if(model.journey)return`<section class="lvt-premium lvt-premium--living-day" data-today-premium data-experience-state="${esc(model.state)}" aria-labelledby="lvt-title"><img class="lvt-hero-image" src="assets/public-landing/prototype-coast-morning.png" alt="Ruhiger Morgen an der Küste"><div class="lvt-hero-shade" aria-hidden="true"></div><div class="lvt-copy"><div class="lvt-eyebrow"><span>${esc(model.context.label)}</span><i class="${model.status.online?'is-online':'is-offline'}"></i><small>${model.status.online?'Live verbunden':'Offline'}</small></div><p class="lvt-greeting">${esc(model.greeting)}</p><h1 id="lvt-title">${esc(model.headline)}</h1><p class="lvt-summary"><strong>${esc(model.context.tripTitle)}</strong><span>${esc(model.context.destination)}</span><span>${esc(model.summary)}</span></p>${sequenceMarkup(model,esc)}<div class="lvt-actions">${model.quickActions.slice(0,1).map(action=>actionMarkup(action,esc)).join('')}</div></div><div class="lvt-context">${suggestionMarkup(model,esc)}<aside class="lvt-attention-stack" aria-label="Reise-Aufmerksamkeit">${attentionMarkup(model,esc)}</aside></div></section>`;
  return`<section class="lvt-premium" data-today-premium data-experience-state="${esc(model.state)}" aria-labelledby="lvt-title"><div class="lvt-travel-thread" aria-hidden="true"><i></i><i></i><i></i></div><div class="lvt-copy"><div class="lvt-eyebrow"><span>${esc(model.context.label)}</span><i class="${model.status.online?'is-online':'is-offline'}"></i><small>${model.status.online?'Live verbunden':'Offline'}</small></div><p class="lvt-greeting">${esc(model.greeting)}</p><h1 id="lvt-title">${esc(model.headline)}</h1><p class="lvt-summary"><strong>${esc(model.context.tripTitle)}</strong><span>${esc(model.context.destination)}</span><span>${esc(model.summary)}</span></p>${phaseMarkup(model,esc)}<div class="lvt-actions">${model.quickActions.map(action=>actionMarkup(action,esc)).join('')}</div><p class="lvt-live" data-today-live aria-live="polite">${esc(model.status.message)}</p></div><div class="lvt-context"><div class="lvt-compass-story" data-luvia-experience-component="livingCompass"><span class="lv-logo lvt-compass-mark" aria-hidden="true"></span><span>Der Living Compass</span><strong>Hält euren nächsten sinnvollen Schritt sichtbar.</strong><button type="button" data-ai-ask-open aria-label="Luvia Compass öffnen">Luvia fragen <b aria-hidden="true">↗</b></button></div><aside class="lvt-attention-stack" aria-label="Reise-Aufmerksamkeit">${attentionMarkup(model,esc)}</aside></div></section>`;
}
function fmtTime(value){return value?new Date(value).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):''}
function sequenceMarkup(model,esc){
  const day=model.journey?.day,entries=day?.entries||[],openGap=day?.openGaps?.[0]||model.preferenceGuidance?.openGap||null;
  const moments=entries.slice(0,3).map(entry=>({time:fmtTime(entry.startAt),title:entry.title,kind:'planned'}));
  if(openGap)moments.push({time:fmtTime(openGap.startAt),title:'Freiraum für euch',kind:'open'});
  moments.sort((a,b)=>a.time.localeCompare(b.time));
  if(!moments.length)moments.push({time:'Heute',title:'Euer Tag ist noch offen',kind:'open'});
  return `<div class="lvt-day-sequence" aria-label="Heutiger Tagesbogen">${moments.map((item,index)=>`<span class="is-${esc(item.kind)}"><i>${esc(item.time)}</i><b>${esc(item.title)}</b>${index<moments.length-1?'<em aria-hidden="true"></em>':''}</span>`).join('')}</div>`;
}
function suggestionMarkup(model,esc){
  const suggestion=model.suggestion;if(!suggestion)return`<article class="lvt-suggestion"><span class="lvt-suggestion-mark" aria-hidden="true">✦</span><div><small>Luvia denkt mit</small><h2>Worauf habt ihr heute Lust?</h2><p>Ein Vorschlag wird aus eurem Reisekompass abgeleitet und bleibt bis zu eurer Bestätigung ein Entwurf.</p><button type="button" data-ai-ask-open>Mit Luvia entdecken <b aria-hidden="true">→</b></button></div></article>`;
  return `<article class="lvt-suggestion"><span class="lvt-suggestion-mark" aria-hidden="true">✦</span><div><small>Ein möglicher nächster Moment</small><h2>${esc(suggestion.query)}</h2><p>${esc(suggestion.reasons?.[0]||'Aus eurem Profil und dem Gefühl dieser Reise abgeleitet.')}</p><button type="button" data-today-suggestion-add data-suggestion-query="${esc(suggestion.query)}" data-suggestion-date="${esc(suggestion.targetDate)}" data-suggestion-start="${esc(suggestion.startAt)}">In Places entdecken <b aria-hidden="true">→</b></button><em>Vorschlag – geplant wird erst nach eurer Bestätigung.</em></div></article>`;
}
const premiumSignature=model=>JSON.stringify(model);
function render({trip={},profile={},widgetsHtml='',esc=fallbackEsc}={}){
  const model=modelFor({trip,profile});
  return`<section class="lv-dashboard lvt-surface" data-today-experience data-today-contract="${core().contractId}">${premiumMarkup(model,esc)}<section class="lvt-journey" data-journey-projection="journey.v1-read-only"><div><span>Euer lebender Tagesbogen</span><h2>Geplant, erlebt und erinnert bleibt in Bewegung.</h2><p>Der Journey Day Graph verbindet nur freigegebene Projektionen. Zeiten, Orte, Menschen und Erinnerungen bleiben bei ihren jeweiligen Owner-Cores.</p></div><button type="button" data-view="plan">Reise weiterplanen <b aria-hidden="true">→</b></button></section><section class="lvt-chapters" aria-labelledby="lvt-chapters-title"><header><span>Eure Reise, jetzt</span><h2 id="lvt-chapters-title">Was diesen Moment trägt.</h2></header><div class="lv-grid" data-widget-grid>${widgetsHtml}</div></section></section>`;
}
function update(){
  const surface=binding?.container?.querySelector?.('[data-today-experience]');
  const current=surface?.querySelector?.('[data-today-premium]');
  if(!surface||!current)return false;
  const model=modelFor(binding.context),signature=premiumSignature(model);if(signature===binding.signature)return false;
  const template=document.createElement('template');
  template.innerHTML=premiumMarkup(model,binding.context.esc||fallbackEsc).trim();
  const next=template.content.firstElementChild;next.classList.add('is-live-update');current.replaceWith(next);binding.signature=signature;
  return true;
}
function unbind(){if(typeof cleanup==='function')cleanup();cleanup=null;binding=null}
function bind(container,context={}){
  unbind();
  binding={container,context,signature:premiumSignature(modelFor(context))};
  const disposers=[];
  const listen=name=>{const handler=()=>update();window.addEventListener(name,handler);disposers.push(()=>window.removeEventListener(name,handler))};
  ['luvia:control-center-attention-changed','luvia:control-center-travel-identity-changed','luvia:travel-context-changed','luvia:trip.changed','luvia:journey.changed','luvia:identity.preferences.changed','luvia:places-lifecycle-changed'].forEach(listen);
  try{const unsubscribe=window.LuviaPlatformPorts?.get?.('NetworkPort')?.subscribe?.(()=>update());if(typeof unsubscribe==='function')disposers.push(unsubscribe)}catch{}
  cleanup=()=>disposers.splice(0).forEach(dispose=>{try{dispose()}catch{}});
  window.LuviaControlCenterTravelIdentity?.refresh?.();
  window.LuviaControlCenterAttention?.refresh?.().catch?.(()=>{});
  return unbind;
}
function diagnostics(){return Object.freeze({version:VERSION,contract:core().contractId,bound:Boolean(binding),domainTruth:false,journeyTimeline:'journey.v1-read-only-projection',ports:['NetworkPort']})}

window.LuviaTodayExperience=Object.freeze({version:VERSION,render,bind,unbind,update,diagnostics});
})();
