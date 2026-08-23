(() => {
  'use strict';
  const VERSION='4.23.0';
  const state=new Map();
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const tripId=trip=>String(trip?.id||trip?.tripId||'');
  const intelligence=()=>window.LuviaIntelligenceContractV1||(()=>{throw new Error('Intelligence Contract v1 ist noch nicht bereit.')})();
  const activeTrip=()=>window.LuviaTripContractV1?.getActiveTrip?.()||null;
  function placeholder(){return{headline:'Luvia verbindet gerade eure Reise.',message:'Vorlieben, Reiseplan und aktueller Moment werden zu einer persönlichen Geschichte zusammengesetzt.',highlights:[],suggestedActions:[]}}
  function render({trip}={}){
    const id=tripId(trip),entry=state.get(id)||{data:placeholder(),loading:false,error:null};const data=entry.data||placeholder();
    queueMicrotask(()=>refresh(trip).catch(()=>{}));
    return `<div class="luv-ai-widget ${entry.loading?'is-loading':''}"><header><span class="luv-ai-orbit" aria-hidden="true"><i></i><b>✦</b></span><div><span class="luv-ai-kicker">Luvia Intelligence</span><h2>${esc(data.headline)}</h2></div><button type="button" data-ai-brief-refresh aria-label="Luvia Briefing aktualisieren">↻</button></header><p>${esc(data.message)}</p>${data.highlights?.length?`<div class="luv-ai-highlights">${data.highlights.map(item=>`<span>${esc(item)}</span>`).join('')}</div>`:''}<div class="luv-ai-widget-actions"><button type="button" data-ai-ask-open>Mit Luvia sprechen</button><button type="button" data-ai-transparency-open>So denkt Luvia</button></div>${entry.error?`<small class="luv-ai-note">Regelbasierter Modus aktiv: ${esc(entry.error)}</small>`:'<small class="luv-ai-note">Luvia liest Domain-Projektionen. Vorschläge verändern eure Reise nie selbst.</small>'}</div>`;
  }
  async function refresh(trip,{force=false}={}){
    const id=tripId(trip);if(!id)return null;const current=state.get(id);if(current?.loading)return current;if(current?.updatedAt&&!force&&Date.now()-current.updatedAt<60000)return current;
    state.set(id,{...(current||{}),data:current?.data||placeholder(),loading:true,error:null});window.dispatchEvent(new CustomEvent('luvia:dashboard-widget-refresh',{detail:{id:'aiBrain'}}));
    const journey=await window.LuviaJourneyKnowledgeGraph?.load?.({force}).catch(()=>null);
    const response=await intelligence().run('dashboard.brief',{currentMoment:{surface:'dashboard'},journey,plannedVisits:journey?.plannedVisits||[],instruction:'Nenne alle geplanten Einträge des relevanten Tages vollständig und chronologisch. Ein Timeline-Eintrag ist ein geplanter Besuch. Fehlende Buchungsdaten sind niemals eine Warnung.'},{fallback:true});
    const next={data:response.data,loading:false,error:response.meta?.fallback?'Die Cloud-KI war nicht erreichbar.':'',updatedAt:Date.now()};state.set(id,next);window.dispatchEvent(new CustomEvent('luvia:dashboard-widget-refresh',{detail:{id:'aiBrain'}}));return next;
  }
  function modalShell({kicker,title,body,className=''}){
    const overlay=document.createElement('div');overlay.className='luv-ai-proposal-overlay';overlay.innerHTML=`<section class="luv-ai-proposal ${className}" role="dialog" aria-modal="true"><span class="luv-ai-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2>${body}</section>`;document.body.appendChild(overlay);const close=()=>overlay.remove();overlay.addEventListener('click',event=>{if(event.target===overlay)close()});const closeButton=overlay.querySelector('[data-ai-close]');if(closeButton)closeButton.onclick=close;return overlay;
  }
  function askModal(){
    const overlay=modalShell({kicker:'Mit Luvia sprechen',title:'Was soll Luvia für eure Reise durchdenken?',className:'luv-ai-chat',body:'<textarea rows="4" placeholder="Zum Beispiel: Was passt heute noch zwischen Museum und Abendessen?"></textarea><div data-ai-answer></div><div class="luv-ai-proposal-actions"><button type="button" data-ai-close>Schließen</button><button type="button" data-ai-send>Fragen</button></div>'});
    overlay.querySelector('[data-ai-send]').onclick=async()=>{const button=overlay.querySelector('[data-ai-send]'),text=overlay.querySelector('textarea').value.trim(),answer=overlay.querySelector('[data-ai-answer]');if(!text)return;button.disabled=true;button.textContent='Luvia denkt …';try{const response=await intelligence().ask(text,{currentMoment:{surface:window.LuviaApp?.activeView?.()||'global-assistant'}});answer.innerHTML=`<div class="luv-ai-answer">${esc(response.data?.answer||'Dazu konnte Luvia gerade keine sichere Antwort formulieren.')}</div>`}catch(error){answer.innerHTML=`<div class="luv-ai-answer is-error">${esc(error.message)}</div>`}finally{button.disabled=false;button.textContent='Fragen'}};
  }
  function transparencyModal(){
    const api=intelligence();const snapshot=api.getSystemSnapshot();let memory=null;try{memory=api.getMemorySnapshot()}catch{}
    const capabilities=snapshot.capabilities||[],tiers=snapshot.modelTiers||[],sources=snapshot.sourceContracts||[];
    const body=`<p class="luv-ai-transparency-intro">Luvia kombiniert freigegebene Domain-Projektionen, wählt je Aufgabe eine Denkstufe und liefert einen belegbaren Vorschlag. Fachliche Wahrheit bleibt in ihrem jeweiligen Core.</p><div class="luv-ai-transparency-metrics"><article><b>${capabilities.length}</b><span>aktive Fähigkeiten</span></article><article><b>${sources.length}</b><span>öffentliche Quellen</span></article><article><b>${memory?.summary?.byStatus?.inferred||0}</b><span>offene Lernsignale</span></article></div><section class="luv-ai-transparency-section"><h3>Denkstufen</h3><div class="luv-ai-transparency-list">${tiers.map(tier=>`<article><strong>${esc(tier.alias)}</strong><span>${esc(tier.purpose)}</span></article>`).join('')}</div></section><section class="luv-ai-transparency-section"><h3>Was Luvia gerade kann</h3><div class="luv-ai-capability-grid">${capabilities.map(capability=>`<article><span>${esc(capability.mode)}</span><strong>${esc(capability.id)}</strong><small>${esc(capability.description)}</small></article>`).join('')}</div></section><section class="luv-ai-transparency-section"><h3>Verträge statt private Stores</h3><div class="luv-ai-source-pills">${sources.map(source=>`<span>${esc(source)}</span>`).join('')}</div><p>Journey/Timeline bleibt ein eigener Cross-Domain-Aggregator. Intelligence darf daraus lesen und Entwürfe bilden, besitzt diese Wahrheit aber nicht.</p></section><div class="luv-ai-policy-callout"><b>Du entscheidest.</b><span>Keine fremde Domain wird von Intelligence direkt verändert. Ausführung braucht Bestätigung und den Command des zuständigen Owners.</span></div><div class="luv-ai-proposal-actions"><button type="button" data-ai-close>Verstanden</button></div>`;
    return modalShell({kicker:'Intelligence Transparency',title:'So denkt Luvia',className:'luv-ai-transparency',body});
  }
  if(window.LuviaDashboardWidgets?.register)window.LuviaDashboardWidgets.register({id:'aiBrain',order:5,title:'Luvia Intelligence',icon:'✦',render});
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('[data-ai-brief-refresh],[data-ai-ask-open],[data-ai-transparency-open]');if(!button)return;
    if(button.matches('[data-ai-ask-open]'))return askModal();
    if(button.matches('[data-ai-transparency-open]'))return transparencyModal();
    const trip=activeTrip()||{};
    if(button.matches('[data-ai-brief-refresh]')){button.disabled=true;await refresh(trip,{force:true}).catch(error=>window.LuviaUIKit?.toast?.(error.message,{type:'error'}));button.disabled=false;}
  });
  window.addEventListener('luvia:journey-context-changed',()=>{const trip=activeTrip()||{};if(tripId(trip))refresh(trip,{force:true}).catch(()=>{})});
  window.LuviaAIDashboard=Object.freeze({version:VERSION,render,refresh,openChat:askModal,openTransparency:transparencyModal,diagnostics:()=>({version:VERSION,entries:state.size,widget:'aiBrain',contract:'intelligence.v1'})});
})();
