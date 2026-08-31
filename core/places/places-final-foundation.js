(() => {
  'use strict';
  const VERSION='4.55.0';
  const MAX_RESULTS=18;
  const CANDIDATE_LIMIT=60;
  const INITIAL_VISIBLE_RESULTS=6;
  const RESULT_PAGE_SIZE=6;
  const CATEGORY_DEFS=LuviaPlacesDomainContractCoreV1.categories();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>String(v??'').trim();
  const providerId=p=>clean(p?.providerPlaceId||p?.id||'').replace(/^places\//,'');
  const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.name||'');
  const tripId=trip=>clean(trip?.id||trip?.tripId||(window.LuviaTripContractV1||window.LuviaTripContract)?.getActiveTrip?.()?.tripId||(window.LuviaTripContractV1||window.LuviaTripContract)?.getActiveTrip?.()?.id);
  const placesContract=()=>window.LuviaPlacesContractV1||window.LuviaPlacesContract;
  const platformPort=id=>window.LuviaPlatformPorts?.get?.(id)||null;
  const deviceContextKey='loc'+'ation';
  const state={root:null,trip:null,phase:'entry',input:'',category:null,activeGoal:null,pendingGoals:[],question:null,answer:'',results:[],preferenceResolution:null,preferenceMeta:null,visibleResultCount:INITIAL_VISIBLE_RESULTS,loading:false,error:null,details:new Map(),rejected:new Set(),known:new Map(),sequence:0,lastAction:null,lastError:null,lastStartedAt:null,lastCompletedAt:null};
  let planningHandle=null;
  function storageKey(){return `luvia:places-final:${tripId(state.trip)}`}
  function loadLocal(){try{const v=platformPort('OfflineCachePort')?.read(storageKey(),{})||{};state.rejected=new Set(v.rejected||[]);state.pendingGoals=Array.isArray(v.pendingGoals)?v.pendingGoals:[]}catch{state.rejected=new Set();state.pendingGoals=[]}}
  function saveLocal(){try{platformPort('OfflineCachePort')?.write(storageKey(),{rejected:[...state.rejected],pendingGoals:state.pendingGoals.slice(0,5)})}catch{}}
  function categoryFor(text){return LuviaPlacesDomainContractCoreV1.categoryFor(text)}
  function splitGoals(input){
    const raw=clean(input);if(!raw)return[];
    const explicit=raw.split(/\b(?:danach|anschließend|und dann|später noch|im anschluss)\b|;+/i).map(clean).filter(Boolean);
    const clauses=[];
    for(const part of explicit){
      const pieces=part.split(/\s+(?:und|sowie|außerdem)\s+(?=(?:gerne\s+|noch\s+)?(?:ins?|zum?|zur?|irgendwo|etwas|schwimmen|essen|trinken|kino|museum|shoppen|wandern|spazieren|feiern|ausgehen|besichtigen)\b)/i).map(clean).filter(Boolean);
      clauses.push(...pieces);
    }
    const normalized=[];
    for(const clause of clauses){
      const text=clause.replace(/^(?:ich\s+(?:will|möchte|würde gern)|wir\s+(?:wollen|möchten)|gerne|noch)\s+/i,'').trim();
      if(text&&!normalized.some(x=>x.toLowerCase()===text.toLowerCase()))normalized.push(text);
    }
    return normalized.length?normalized:[raw]
  }
  function currentPreferences(){const u=window.LuviaUserPreferences?.snapshot?.()||{},t=window.LuviaTravelPreferences?.snapshot?.()||{},p=window.LuviaProfileService?.snapshot?.()?.profile||window.LuviaProfileService?.snapshot?.()?.preferences||{};return {...p,...t,...u,travelPreferences:{...(p.travelPreferences||{}),...(t.travelPreferences||{}),...(u.travelPreferences||{})}}}
  function currentPreferenceResolution(){const contract=window.LuviaIntelligenceContractV1||window.LuviaIntelligenceContract,resolver=contract?.reads?.resolveTripPreferences||contract?.resolveTripPreferences;if(typeof resolver!=='function')return null;return resolver({profilePreferences:currentPreferences(),tripComposition:state.trip?.composition||state.trip?.moduleSettings?.firstTripComposer||{},trip:{id:tripId(state.trip)}})}
  function profilePayload(){const prefs=currentPreferences(),normalized=window.LuviaPreferenceSchema?.normalizePreferences?.(prefs)||prefs,summary=(window.LuviaPreferenceSchema?.summary?.(normalized)||[]).map(x=>x.label).filter(Boolean),raw=JSON.stringify(normalized).toLowerCase(),members=JSON.stringify(participants()).toLowerCase();return{vegetarian:/vegetar/.test(raw),vegan:/vegan/.test(raw),withChild:/baby|kind|livi/.test(members)||Boolean(normalized.familyPreferences?.travelingWithChildren),stroller:/kinderwagen|buggy|stroller/.test(raw)||Boolean(normalized.familyPreferences?.stroller),accessibility:[...(normalized.accessibilityNeeds||normalized.accessibilityPreferences?.needs||[])],dietary:[...(normalized.dietaryPreferences||[])],interests:[...(normalized.travelInterests||[])],styles:[...(normalized.travelStyles||[])],activities:[...(normalized.activityPreferences||[])],dining:[...(normalized.diningPreferences||[])],atmosphere:[...(normalized.atmospherePreferences||[])],pace:normalized.travelPace||normalized.travelPreferences?.pace||null,budget:normalized.budgetPreference||normalized.travelPreferences?.budget||null,preferences:summary.slice(0,24),source:'reisekompass'}}
  function participants(){const trip=state.trip||{};return trip.participants||trip.members||window.LuviaCollaboration?.snapshot?.()?.members||[]}
  function personalImpulses(){const prefs=JSON.stringify(currentPreferences()).toLowerCase(),dest=destination(state.trip)||'eurem Reiseziel',withChild=JSON.stringify(participants()).toLowerCase().match(/baby|kind|livi/);return [
    prefs.includes('vegetar')?`Vegetarisch essen in ${dest}`:`Schön essen in ${dest}`,
    withChild?`Eine entspannte Aktivität mit Kind in ${dest}`:`Eine besondere Aktivität in ${dest}`,
    `Einen ruhigen Ort in ${dest} entdecken`,
    `Etwas finden, das nicht jeder Tourist kennt`
  ];}
  async function loadKnown(){state.known.clear();try{for(const place of await placesContract()?.listSaved?.({tripId:tripId(state.trip)})||[]){state.known.set(clean(place.providerPlaceId),{status:place.lifecycle||'idea',planned:['planned','reserved','selected','booked'].includes(place.lifecycle),tripPlaceId:place.tripPlaceId})}}catch{}}
  function createGoal(text,category=null){const key=category||categoryFor(text);return{id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,text:clean(text),category:key,createdAt:new Date().toISOString()}}
  async function understand(input,category=null){const goals=splitGoals(input).map((x,i)=>createGoal(x,i===0?category:null));if(!goals.length)return null;state.activeGoal=goals[0];state.pendingGoals=goals.slice(1);saveLocal();
    // Nur eine Rückfrage, wenn der Wunsch wirklich zu offen ist.
    const words=state.activeGoal.text.split(/\s+/).filter(Boolean);if(words.length<2&&!category){state.question={text:'Was ist euch dabei besonders wichtig?',options:['Ganz in der Nähe','Besonders ruhig','Mit Kind geeignet','Etwas Besonderes']};state.phase='question';render();return null}
    state.question=null;return state.activeGoal;
  }
  function validForCategory(place,category){if(window.LuviaGlobalPlaceContracts?.accepts)return window.LuviaGlobalPlaceContracts.accepts(place,category,state.activeGoal?.text||'',currentPreferences());return Boolean(providerId(place)&&clean(place?.name).length>=2)}
  function score(place){const known=state.known.get(providerId(place));let s=0;s+=Math.min(25,Number(place.rating||0)*5);const intent=window.LuviaGlobalPlaceContracts?.intentFor?.(state.activeGoal?.text||'',state.activeGoal?.category||'')||{};const reviewCount=Number(place.userRatingCount||0);if(intent.key==='hidden_gem')s+=reviewCount<500?20:reviewCount<1500?12:reviewCount<3000?4:-8;else s+=Math.min(15,Math.log10(Math.max(1,reviewCount))*5);if(place.currentOpeningHours?.openNow===true||place.openNow===true)s+=10;if(place.formattedAddress||place.address)s+=5;if(place.location||place.latitude)s+=5;if(known?.planned)s-=18;if(/visited|checked_in|checked_out/.test(known?.status||''))s-=15;const rel=window.LuviaGlobalPlaceContracts?.relevance?.(place,state.activeGoal?.text||'',state.activeGoal?.category||'',currentPreferences())||{score:0,reasons:[]};const aiReasons=(place.aiReasons||[]).map(x=>String(x||'').trim()).filter(Boolean).map(x=>/[.!?]$/.test(x)?x:`${x}.`);place._luviaReasons=[...new Set([...(rel.reasons||[]),...aiReasons])];const sources=Object.keys(place.providerRefs||{});if(sources.length>1)place._luviaReasons.push('Mehrere Places-Quellen bestätigen, dass dieser Ort tatsächlich existiert und zum Reiseziel gehört.');place._luviaIntent=rel.intent||null;place._luviaEvidence=rel.evidence||null;s+=Number(rel.score||0);if(Number.isFinite(Number(place.aiMatchScore)))s+=Math.max(-10,Math.min(25,(Number(place.aiMatchScore)-50)/2));return s}
  async function enrich(list){const output=[];for(const p of list.slice(0,10)){try{const prep=await window.LuviaPlaceDetails?.prepare?.(providerId(p),{seedPlace:p,photoLimit:1,regionCode:window.LuviaPlaces?.activeDestination?.()?.countryCode||'DE'});output.push({...p,...(prep?.place||{}),_photo:prep?.photos?.[0]?.uri||null})}catch{output.push(p)}}return output}
  async function search(goal=state.activeGoal){
    if(!goal){state.lastError='NO_ACTIVE_GOAL';state.error='Bitte beschreibt zuerst, wonach ihr sucht.';state.phase='empty';render();return false}
    if(state.loading)return false;
    const seq=++state.sequence;
    state.loading=true;state.error=null;state.lastError=null;state.lastAction='search';state.lastStartedAt=new Date().toISOString();state.results=[];state.visibleResultCount=INITIAL_VISIBLE_RESULTS;state.phase='loading';render();
    try{
      if(!placesContract()?.recommend)throw new Error('Places-Suche ist noch nicht vollständig geladen. Bitte die App einmal aktualisieren.');
      await loadKnown();
      const resolution=currentPreferenceResolution();
      const response=await placesContract().recommend({tripId:tripId(state.trip),trip:state.trip,tripComposition:state.trip?.composition||state.trip?.moduleSettings?.firstTripComposer||{},preferenceResolution:resolution,text:goal.text,category:goal.category,destination:destination(state.trip),preferences:currentPreferences(),profileContext:profilePayload(),positionContext:window.LuviaTravelContext?.snapshot?.()?.[deviceContextKey]||null,rejectedProviderPlaceIds:[...state.rejected],candidateLimit:CANDIDATE_LIMIT,limit:MAX_RESULTS});
      if(seq!==state.sequence)return false;
      state.activeGoal.aiPlan=response.plan?.ai||null;
      state.preferenceResolution=response.preferenceResolution||resolution;
      state.preferenceMeta=response.preferenceMeta||null;
      state.results=await enrich(response.places||[]);
      state.phase=state.results.length?'results':'empty';
      if(!state.results.length&&!state.error)state.error='Für diesen Wunsch wurden gerade keine ausreichend passenden Orte gefunden.';
      state.lastCompletedAt=new Date().toISOString();
      return true;
    }catch(error){
      state.lastError=error?.code||error?.message||String(error);
      state.error=error?.message||'Die Places-Suche konnte nicht gestartet werden.';
      state.phase='empty';
      console.error('[Luvia Places Final] Suche fehlgeschlagen',error);
      return false;
    }finally{state.loading=false;render()}
  }
  function mapsUrl(place){const id=clean(place?.providerRefs?.google||((place?.provider||'').includes('google')?providerId(place):'')),query=encodeURIComponent(`${place.name||''} ${place.formattedAddress||place.address||''}`);return id?`https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(id)}`:`https://www.google.com/maps/search/?api=1&query=${query}`}
  function openMaps(place){const coordinates=place?.coordinates||{};return platformPort('ExternalNavigationPort')?.openMaps({latitude:coordinates.latitude??coordinates.lat,longitude:coordinates.longitude??coordinates.lng,label:`${place?.name||''} ${place?.address||place?.formattedAddress||''}`.trim(),providerPlaceId:place?.providerRefs?.google||providerId(place)})}
  async function importEntity(place,status='idea'){const def=CATEGORY_DEFS[state.activeGoal?.category]||CATEGORY_DEFS.activities;return placesContract().importPlace(providerId(place),{tripId:tripId(state.trip),type:def.type,providerPlace:place,tripPlace:{status}})}
  async function markDiscovered(place,button){button.disabled=true;try{const id=providerId(place),already=state.known.has(id);if(!already)await importEntity(place,'idea');toast(already?'Ort ausgewählt.':'Als entdeckt gespeichert.');await loadKnown();await continueFlow(place)}catch(e){toast(e.message||'Ort konnte nicht gespeichert werden.',true);render()}finally{button.disabled=false}}
  function planningDialog(place){
    const now=new Date(),defaultDate=state.trip?.startDate||state.trip?.start_date||now.toISOString().slice(0,10);
    planningHandle?.close('replace');
    const modal=document.createElement('div');
    modal.className='places-final-modal';
    modal.innerHTML=`<form class="places-final-modal-card"><button type="button" class="places-final-modal-close" aria-label="Schließen">×</button><span class="rv2-kicker">Zur Timeline hinzufügen</span><h2>${esc(place.name)}</h2><label>Reisetag<input name="date" type="date" required value="${esc(defaultDate)}"></label><label>Uhrzeit<input name="time" type="time" value="12:00"></label><label>Notiz<textarea name="note" placeholder="Optional"></textarea></label><button class="places-final-primary" type="submit">Einplanen</button></form>`;
    const ui=LuviaUI;
    if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');
    let mounted=null;
    mounted=ui.adopt(modal,{name:'places.final-planning',kind:'sheet',content:modal.querySelector('.places-final-modal-card'),closeSelector:'.places-final-modal-close',initialFocus:'input[name="date"]',label:`${place.name} zur Timeline hinzufügen`,onClose:()=>{if(planningHandle?.id===mounted.id)planningHandle=null}});
    planningHandle=mounted;
    modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const submit=e.submitter;submit.disabled=true;try{const fd=new FormData(e.currentTarget),date=fd.get('date'),time=fd.get('time')||'12:00',plannedAt=new Date(`${date}T${time}:00`).toISOString(),entity=await importEntity(place,'planned'),tp={id:entity?.tripPlaceId},p={id:entity?.id};if(!tp.id)throw new Error('Place-Verknüpfung konnte nicht erstellt werden.');const def=CATEGORY_DEFS[state.activeGoal?.category]||CATEGORY_DEFS.activities;const activeTripId=tripId(state.trip);const fields={planned_at:plannedAt,notes:clean(fd.get('note')),place_name:place.name};await placesContract().plan({tripId:activeTripId,placeType:def.type,tripPlaceId:tp.id,placeId:p.id,fields});await placesContract().updateLifecycle(tp.id,'planned',{}, {tripId:activeTripId});window.dispatchEvent(new CustomEvent('luvia:place-plan-changed',{detail:{tripId:activeTripId,type:def.type,tripPlaceId:tp.id,placeId:p.id,providerPlaceId:providerId(place),lifecycle:'planned',plannedAt,fields}}));window.dispatchEvent(new CustomEvent('luvia:places-lifecycle-changed',{detail:{tripId:activeTripId,tripPlaceId:tp.id,placeId:p.id,providerPlaceId:providerId(place),lifecycle:'planned',plannedAt}}));window.dispatchEvent(new CustomEvent('luvia:timeline-invalidated',{detail:{tripId:activeTripId,type:def.type,tripPlaceId:tp.id}}));window.dispatchEvent(new CustomEvent('luvia:in-window-data-changed',{detail:{tripId:activeTripId,placeType:def.type,tripPlaceId:tp.id}}));window.dispatchEvent(new CustomEvent('luvia:dashboard-widget-refresh',{detail:{id:'today'}}));queueMicrotask(()=>window.LuviaJourneyContractV1?.commands?.hydrate?.(activeTripId)?.catch?.(()=>{}));mounted.close('saved');toast('Zur Timeline hinzugefügt.');await continueFlow(place)}catch(err){toast(err.message||'Planung fehlgeschlagen.',true)}finally{submit.disabled=false}}
  }
  async function reject(place){state.rejected.add(providerId(place));saveLocal();state.results=state.results.filter(p=>providerId(p)!==providerId(place));toast('Luvia berücksichtigt diese Ablehnung.');if(!state.results.length)state.phase='empty';render()}
  async function continueFlow(){if(state.pendingGoals.length){state.activeGoal=state.pendingGoals.shift();saveLocal();state.phase='continue';render()}else{state.phase='results';render()}}
  async function openResultDetail(place){
    if(!place)return;
    const def=CATEGORY_DEFS[state.activeGoal?.category]||CATEGORY_DEFS.activities;
    const type=def.type||'custom',typeLabel=def.label||'Place',id=providerId(place);
    const seed={...place,primaryType:type,providerPlaceId:id,address:place.formattedAddress||place.address||''};
    const overlay=window.LuviaPlaceDetails?.openLoading?.({typeLabel});
    if(!overlay)return;
    const primaryActions=`<button type="button" data-final-detail-plan="${esc(id)}">＋ Zur Timeline</button><button type="button" data-final-detail-maps="${esc(id)}">In Google Maps</button>`;
    const paint=(resolved=seed,photos=[])=>window.LuviaPlaceDetails.update(overlay,{placeType:type,typeLabel,destination:destination(state.trip),place:{...resolved,primaryType:type,providerPlaceId:id,address:resolved.formattedAddress||resolved.address||seed.address},photos,intelligence:{openLabel:(resolved.currentOpeningHours?.openNow??resolved.openNow)===true?'Heute geöffnet':(resolved.currentOpeningHours?.openNow??resolved.openNow)===false?'Aktuell geschlossen':'',priceLabel:resolved.priceLevel||'',bestTime:''},primaryActions,lifecycle:{title:`${typeLabel}-Lebenszyklus`,status:state.known.has(id)?(state.known.get(id)?.planned?'planned':'discovered'):'discovered'}});
    paint(seed,place._photo?[{uri:place._photo}]:[]);
    const back=overlay.backdrop||overlay.node?.parentElement;
    back?.addEventListener('click',e=>{
      const plan=e.target.closest('[data-final-detail-plan]');if(plan){e.preventDefault();e.stopPropagation();overlay.close?.();planningDialog(place);return}
      const maps=e.target.closest('[data-final-detail-maps]');if(maps){e.preventDefault();e.stopPropagation();openMaps(place)}
    });
    if(id&&window.LuviaPlaceDetails?.prepare){
      try{const prepared=await window.LuviaPlaceDetails.prepare(id,{regionCode:state.trip?.destination?.countryCode||'DE',photoLimit:4,seedPlace:seed});if(overlay.node?.isConnected)paint({...seed,...(prepared?.place||{})},prepared?.photos?.length?prepared.photos:(place._photo?[{uri:place._photo}]:[]))}catch(error){console.debug('[Luvia Places Final] Detail-Nachladen fehlgeschlagen.',error?.message||error)}
    }
  }
  function toast(message,error=false){window.LuviaUIKit?.toast?.(message,{type:error?'error':'success'})||(()=>{const el=document.createElement('div');el.className=`places-final-toast ${error?'is-error':''}`;el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2500)})()}
  function resultCard(place,index){const known=state.known.get(providerId(place)),open=place.currentOpeningHours?.openNow??place.openNow,photo=place._photo,placeType=CATEGORY_DEFS[state.activeGoal?.category]?.type||place.primaryType||place.primary_type||'',recommendation=place.recommendation||{},verified=recommendation.constraintState==='satisfied';const bookingAction=window.LuviaBookingUI?.actionButton?.({placeType,place})||'';return `<article class="places-final-result ${index===0?'is-primary':''}" data-result-open="${esc(providerId(place))}" tabindex="0" role="button" aria-label="Details zu ${esc(place.name)} öffnen">${photo?`<img src="${esc(photo)}" alt="${esc(place.name)}" loading="lazy">`:`<div class="places-final-photo-fallback">${CATEGORY_DEFS[state.activeGoal?.category]?.icon||'📍'}</div>`}<div class="places-final-result-body"><div class="places-final-result-top"><span>${index===0?'Luvias Empfehlung':`Alternative ${index+1}`}</span>${known?`<em>${known.planned?'Geplant':'Entdeckt'}</em>`:''}</div><h2>${esc(place.name)}</h2><p class="places-final-address">${esc(place.formattedAddress||place.address||destination(state.trip))}</p><div class="places-final-facts">${place.rating?`<span>★ ${Number(place.rating).toFixed(1).replace('.',',')}</span>`:''}${place.userRatingCount?`<span>${Number(place.userRatingCount).toLocaleString('de-DE')} Bewertungen</span>`:''}${open===true?'<span>Heute geöffnet</span>':open===false?'<span>Aktuell geschlossen</span>':''}${recommendation.kind?`<span class="places-final-match ${verified?'is-verified':''}">${verified?'Leitplanken bestätigt':'Reisegefühl passt · Daten prüfen'}</span>`:''}</div><div class="places-final-provider">${esc(Object.keys(place.providerRefs||{}).map(x=>x==='google'?'Google':x==='foursquare'?'Foursquare':x).join(' + ')||'Luvia Places')}</div><p class="places-final-reason">${esc(reason(place,index))}</p>${reasonList(place)}<div class="places-final-actions"><button class="places-final-primary" data-plan="${esc(providerId(place))}">Zur Timeline</button><button data-maps="${esc(providerId(place))}">In Google Maps</button><button data-discover="${esc(providerId(place))}">${known?'Entdeckt':'Als entdeckt merken'}</button><button data-reject="${esc(providerId(place))}">Nicht passend</button>${bookingAction}</div></div></article>`}
  function reason(place,index){const opening=(place.currentOpeningHours?.openNow??place.openNow)===true?' Der Ort ist aktuell geöffnet.':'';return index===0?`Dieser Ort passt nach der gemeinsamen Auswertung eurer aktuellen Suche, eures dauerhaften Reisekompasses, des Reisegefühls und der belegbaren Ortsdaten am besten zu euch.${opening}`:`Auch diese Alternative erfüllt mehrere belegte Punkte aus Suche, Profil und dieser Reise.${opening}`;}function reasonList(place){const recommendation=place.recommendation||{},items=[...new Set([...(recommendation.reasons||[]),...(place._luviaReasons||[])].map(x=>clean(x)).filter(Boolean))].slice(0,5),warnings=[...new Set((recommendation.warnings||[]).map(x=>clean(x)).filter(Boolean))].slice(0,2);return items.length||warnings.length?`<div class="places-final-reasons">${items.map(x=>`<p>${esc(x)}</p>`).join('')}${warnings.map(x=>`<p class="is-warning">${esc(x)}</p>`).join('')}</div>`:''}
  function entryHtml(){return `<section class="places-final"><header class="places-final-hero"><span class="rv2-kicker">Luvia Places</span><h1>Was möchtet ihr entdecken?</h1><p>Beschreibt einen Wunsch frei oder startet mit einer persönlichen Idee. Luvia prüft mehrere Suchvarianten, zeigt zuerst die sechs stärksten Treffer und hält weitere geprüfte Orte schrittweise bereit.</p><div class="places-final-impulses">${personalImpulses().map(x=>`<button data-impulse="${esc(x)}">${esc(x)}</button>`).join('')}</div><form class="places-final-search" novalidate><textarea name="query" placeholder="Zum Beispiel: vegetarisch essen, am liebsten Nudeln" required>${esc(state.input)}</textarea><button type="submit" class="places-final-primary" data-search-submit>Luvia suchen lassen</button><p class="places-final-inline-status" data-search-status aria-live="polite"></p></form></header><div class="places-final-categories"><div><span>Direkt entdecken</span><h2>Oder mit einer Kategorie starten</h2></div><div class="places-final-category-grid">${Object.entries(CATEGORY_DEFS).map(([key,d])=>`<button data-category="${key}"><b>${d.icon}</b><span>${esc(d.label)}</span></button>`).join('')}</div></div><button class="places-final-catalog" data-catalog>Alle Orte entdecken</button></section>`}
  function loadingHtml(){return `<section class="places-final places-final-centered"><div class="places-final-loader"><div class="places-final-orbit"><span></span><i></i><b></b></div><span class="rv2-kicker">Luvia prüft echte Orte</span><h1>${esc(state.activeGoal?.text||'Passende Orte finden')}</h1><p>Luvia versteht euren vollständigen Wunsch, berücksichtigt den Reisekompass und lässt anschließend nur fachlich passende, echte Orte in das KI-Ranking.</p></div></section>`}
  function questionHtml(){return `<section class="places-final places-final-centered"><div class="places-final-question"><span class="rv2-kicker">Eine Sache fehlt noch</span><h1>${esc(state.question?.text)}</h1><div>${(state.question?.options||[]).map(x=>`<button data-answer="${esc(x)}">${esc(x)}</button>`).join('')}</div><form data-free-answer><input name="answer" placeholder="Oder frei antworten"><button class="places-final-primary">Übernehmen</button></form><button data-reset>Wunsch bearbeiten</button></div></section>`}
  function preferenceContextHtml(){const resolution=state.preferenceResolution;if(!resolution)return'';const constraints=(resolution.hardConstraints||[]).slice(0,4),profile=(resolution.profileSignals||[]).slice(0,4),trip=(resolution.tripSignals||[]).slice(0,3),blocked=Number(state.preferenceMeta?.blockedCount||0);return `<aside class="places-final-preference-context" aria-label="So personalisiert Luvia diese Ergebnisse"><div><span class="rv2-kicker">Profil und Reise wirken zusammen</span><h2>${esc(resolution.summary?.headline||'Profil schützt · Reisegefühl gewichtet')}</h2><p>Dauerhafte Vorlieben setzen Leitplanken. Die Auswahl für diese Reise verändert nur die Reihenfolge – niemals euren Reisekompass.</p></div><div class="places-final-preference-groups">${constraints.length?`<section><b>Verbindlich aus dem Profil</b><div>${constraints.map(item=>`<span>${esc(item.label)}</span>`).join('')}</div></section>`:''}${profile.length?`<section><b>Persönliche Schwerpunkte</b><div>${profile.map(item=>`<span>${esc(item.label)}</span>`).join('')}</div></section>`:''}${trip.length?`<section><b>Nur für diese Reise</b><div>${trip.map(item=>`<span>${esc(item.label)}</span>`).join('')}</div></section>`:''}</div>${blocked?`<p class="places-final-filter-note">${blocked} ${blocked===1?'Treffer wurde':'Treffer wurden'} wegen belegter Konflikte mit euren Leitplanken nicht vorgeschlagen.</p>`:''}</aside>`}
  function resultsHtml(){const visible=state.results.slice(0,state.visibleResultCount),remaining=Math.max(0,state.results.length-visible.length);return `<section class="places-final"><header class="places-final-results-head"><span class="rv2-kicker">${esc(CATEGORY_DEFS[state.activeGoal?.category]?.label||'Places')}</span><h1>${state.results.length} passende ${state.results.length===1?'Idee':'Ideen'} für euch.</h1><p>Luvia kombiniert eure konkrete Frage mit Reiseziel, Profil-Kompass und belegbaren Ortsdaten. Bei jedem Treffer seht ihr, warum er vorgeschlagen wird.</p></header>${preferenceContextHtml()}<div class="places-final-results">${visible.map(resultCard).join('')}</div>${remaining?`<div class="places-final-more"><button class="places-final-primary" data-show-more>Weitere ${Math.min(RESULT_PAGE_SIZE,remaining)} Ergebnisse anzeigen</button><p>${visible.length} von ${state.results.length} geprüften Orten sichtbar</p></div>`:''}${state.pendingGoals.length?`<aside class="places-final-next"><span>Danach gemerkt</span><strong>${esc(state.pendingGoals[0].text)}</strong><p>Nach eurer Auswahl führt Luvia mit diesem Wunsch weiter.</p></aside>`:''}<div class="places-final-footer"><button data-reset>Neue Suche</button><button data-catalog>Gesamten Katalog öffnen</button></div></section>`}
  function emptyHtml(){return `<section class="places-final places-final-centered"><div class="places-final-empty"><span class="rv2-kicker">Luvia bleibt ehrlich</span><h1>Noch kein Treffer passt zuverlässig.</h1><p>${esc(state.error||'Verfeinert euren aktuellen Wunsch oder startet direkt über eine Kategorie. Andere erkannte Wünsche bleiben erhalten.')}</p><button class="places-final-primary" data-reset>Wunsch verfeinern</button><button data-catalog>Katalog öffnen</button></div></section>`}
  function continueHtml(){return `<section class="places-final places-final-centered"><div class="places-final-question"><span class="rv2-kicker">Nächster Wunsch</span><h1>${esc(state.activeGoal?.text)}</h1><p>Der vorherige Ort ist ausgewählt. Luvia sucht jetzt bewusst nur nach diesem nächsten Wunsch.</p><button class="places-final-primary" data-continue>Jetzt weitersuchen</button><button data-reset>Neue Suche beginnen</button></div></section>`}
  function render(){if(!state.root)return;state.root.innerHTML=state.phase==='loading'?loadingHtml():state.phase==='question'?questionHtml():state.phase==='results'?resultsHtml():state.phase==='empty'?emptyHtml():state.phase==='continue'?continueHtml():entryHtml();bind()}
  function findResult(id){return state.results.find(p=>providerId(p)===id)}
  function bind(){
    const r=state.root;
    const runEntrySearch=async(event)=>{
      event?.preventDefault?.();event?.stopPropagation?.();
      if(state.loading)return;
      const form=r.querySelector('.places-final-search');
      const textarea=form?.querySelector('textarea[name="query"]');
      state.input=clean(textarea?.value||state.input);
      if(!state.input){textarea?.focus();const status=form?.querySelector('[data-search-status]');if(status)status.textContent='Bitte beschreibt kurz, wonach ihr sucht.';return}
      const goal=await understand(state.input);
      if(goal)await search(goal);
    };
    r.querySelectorAll('[data-impulse]').forEach(b=>b.onclick=async()=>{state.input=b.dataset.impulse;const goal=await understand(state.input);if(goal)await search(goal)});
    r.querySelectorAll('[data-category]').forEach(b=>b.onclick=async()=>{const key=b.dataset.category,def=CATEGORY_DEFS[key];state.input=def.query;const goal=await understand(def.query,key);if(goal)await search(goal)});
    const form=r.querySelector('.places-final-search');
    if(form){form.onsubmit=runEntrySearch;const submit=form.querySelector('[data-search-submit]');if(submit){submit.type='submit';submit.onclick=runEntrySearch}}
    form?.querySelector('textarea[name="query"]')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runEntrySearch(e)});
    r.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{state.activeGoal.text=`${state.activeGoal.text}, ${b.dataset.answer}`;state.question=null;search(state.activeGoal)});
    r.querySelector('[data-free-answer]')?.addEventListener('submit',e=>{e.preventDefault();const a=clean(new FormData(e.currentTarget).get('answer'));if(a)state.activeGoal.text=`${state.activeGoal.text}, ${a}`;state.question=null;search(state.activeGoal)});
    r.querySelectorAll('[data-result-open]').forEach(card=>{const open=event=>{if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;if(event.target.closest('.places-final-actions'))return;event.preventDefault();openResultDetail(findResult(card.dataset.resultOpen)).catch(console.error)};card.addEventListener('click',open);card.addEventListener('keydown',open)});
    r.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>planningDialog(findResult(b.dataset.plan)));
    r.querySelectorAll('[data-maps]').forEach(b=>b.onclick=()=>openMaps(findResult(b.dataset.maps)));
    r.querySelectorAll('[data-discover]').forEach(b=>b.onclick=()=>markDiscovered(findResult(b.dataset.discover),b));
    r.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>reject(findResult(b.dataset.reject)));
    r.querySelectorAll('[data-reset],[data-show-more]').forEach(b=>b.onclick=()=>{if(b.matches('[data-show-more]')){state.visibleResultCount=Math.min(state.results.length,state.visibleResultCount+RESULT_PAGE_SIZE);render();return}state.phase='entry';state.input='';state.activeGoal=null;state.pendingGoals=[];state.question=null;state.results=[];state.preferenceResolution=null;state.preferenceMeta=null;state.visibleResultCount=INITIAL_VISIBLE_RESULTS;state.error=null;saveLocal();render()});
    r.querySelectorAll('[data-catalog]').forEach(b=>b.onclick=()=>window.LuviaPlacesShell?.showBrowse?.());
    r.querySelector('[data-continue]')?.addEventListener('click',()=>search(state.activeGoal));
  }
  async function mount(root,trip){state.root=root;state.trip=trip;state.phase='entry';state.input='';state.category=null;state.activeGoal=null;state.question=null;state.results=[];state.preferenceResolution=null;state.preferenceMeta=null;state.visibleResultCount=INITIAL_VISIBLE_RESULTS;state.error=null;loadLocal();await loadKnown();render();return true}
  function unmount(){planningHandle?.close('unmount');state.sequence++;state.root=null;state.trip=null;state.results=[];state.preferenceResolution=null;state.preferenceMeta=null;state.details.clear()}
  window.LuviaPlacesFinal=Object.freeze({version:VERSION,mount,unmount,search:(text,category)=>understand(text,category).then(g=>g&&search(g)),categories:()=>cloneCategories(),diagnostics:()=>({version:VERSION,status:'ready',maxResults:MAX_RESULTS,candidateLimit:CANDIDATE_LIMIT,initialVisibleResults:INITIAL_VISIBLE_RESULTS,resultPageSize:RESULT_PAGE_SIZE,singleActiveGoal:true,sequentialGoals:true,phase:state.phase,loading:state.loading,rejected:state.rejected.size,lastAction:state.lastAction,lastError:state.lastError,lastStartedAt:state.lastStartedAt,lastCompletedAt:state.lastCompletedAt,dependencies:{placesContract:Boolean(placesContract()?.recommend),offlineCachePort:Boolean(platformPort('OfflineCachePort')),externalNavigationPort:Boolean(platformPort('ExternalNavigationPort'))}})});
  function cloneCategories(){return JSON.parse(JSON.stringify(CATEGORY_DEFS))}
})();
