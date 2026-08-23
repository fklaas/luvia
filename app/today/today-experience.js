(()=>{
'use strict';

const VERSION='1.0.0';
let cleanup=null,binding=null;
const fallbackEsc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const core=()=>window.LuviaTodayCompositionCoreV1||(()=>{throw new Error('Today Composition Core v1 fehlt.')})();
function dateLabel(value){if(!value)return'';const parsed=new Date(`${value}T12:00:00`);return Number.isNaN(parsed.getTime())?'':parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}
function dateRange(trip={}){const start=dateLabel(trip.startDate||trip.start_date),end=dateLabel(trip.endDate||trip.end_date);return start?(end?`${start} – ${end}`:`Ab ${start}`):'Zeitraum noch offen'}
function networkOnline(){try{return window.LuviaPlatformPorts?.get?.('NetworkPort')?.isOnline?.()!==false}catch{return true}}
function modelFor({trip={},profile={}}={}){
  const travel=window.LuviaControlCenterTravelIdentity?.snapshot?.()||{};
  const attention=window.LuviaControlCenterAttention?.snapshot?.()||{items:[]};
  return core().compose({
    trip:{id:trip.id||trip.tripId,title:trip.title||trip.tripName,destination:trip.destination?.formattedAddress||trip.destination?.name||trip.destinationName,symbol:trip.symbol,dateRange:dateRange(trip)},
    viewer:{displayName:profile.displayName||profile.name},
    travel:{phase:travel.phase,tripDay:travel.tripDay},
    attention,
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
function premiumMarkup(model,esc){
  return`<section class="lvt-premium" data-today-premium data-experience-state="${esc(model.state)}" aria-labelledby="lvt-title"><div class="lvt-orbit" aria-hidden="true"><i></i><b>${esc(model.context.symbol)}</b></div><div class="lvt-copy"><div class="lvt-eyebrow"><span>${esc(model.context.label)}</span><i class="${model.status.online?'is-online':'is-offline'}"></i><small>${model.status.online?'Live verbunden':'Offline'}</small></div><p class="lvt-greeting">${esc(model.greeting)}</p><h1 id="lvt-title">${esc(model.headline)}</h1><p class="lvt-summary"><strong>${esc(model.context.tripTitle)}</strong><span>${esc(model.context.destination)}</span><span>${esc(model.summary)}</span></p><div class="lvt-actions">${model.quickActions.map(action=>actionMarkup(action,esc)).join('')}</div><p class="lvt-live" data-today-live aria-live="polite">${esc(model.status.message)}</p></div><aside class="lvt-attention-stack" aria-label="Reise-Aufmerksamkeit">${attentionMarkup(model,esc)}</aside></section>`;
}
function render({trip={},profile={},widgetsHtml='',esc=fallbackEsc}={}){
  const model=modelFor({trip,profile});
  return`<section class="lv-dashboard lvt-surface" data-today-experience data-today-contract="${core().contractId}">${premiumMarkup(model,esc)}<section class="lvt-journey" data-journey-projection="reserved-read-only"><div><span>Reiseverlauf</span><h2>Was ihr geplant habt</h2><p>Journey und Timeline bleiben eine eigenständige, read-only eingebundene Reiseprojektion.</p></div><button type="button" data-view="plan">Plan öffnen</button></section><div class="lv-grid" data-widget-grid>${widgetsHtml}</div></section>`;
}
function update(){
  const surface=binding?.container?.querySelector?.('[data-today-experience]');
  const current=surface?.querySelector?.('[data-today-premium]');
  if(!surface||!current)return false;
  const model=modelFor(binding.context),template=document.createElement('template');
  template.innerHTML=premiumMarkup(model,binding.context.esc||fallbackEsc).trim();
  current.replaceWith(template.content.firstElementChild);
  return true;
}
function unbind(){if(typeof cleanup==='function')cleanup();cleanup=null;binding=null}
function bind(container,context={}){
  unbind();
  binding={container,context};
  const disposers=[];
  const listen=name=>{const handler=()=>update();window.addEventListener(name,handler);disposers.push(()=>window.removeEventListener(name,handler))};
  ['luvia:control-center-attention-changed','luvia:control-center-travel-identity-changed','luvia:travel-context-changed','luvia:trip.changed'].forEach(listen);
  try{const unsubscribe=window.LuviaPlatformPorts?.get?.('NetworkPort')?.subscribe?.(()=>update());if(typeof unsubscribe==='function')disposers.push(unsubscribe)}catch{}
  cleanup=()=>disposers.splice(0).forEach(dispose=>{try{dispose()}catch{}});
  window.LuviaControlCenterTravelIdentity?.refresh?.();
  window.LuviaControlCenterAttention?.refresh?.().catch?.(()=>{});
  update();
  return unbind;
}
function diagnostics(){return Object.freeze({version:VERSION,contract:core().contractId,bound:Boolean(binding),domainTruth:false,journeyTimeline:'reserved-read-only-projection',ports:['NetworkPort']})}

window.LuviaTodayExperience=Object.freeze({version:VERSION,render,bind,unbind,update,diagnostics});
})();
