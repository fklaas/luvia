(()=>{
'use strict';

const VERSION='1.0.0';
const cache=new Map();
let activeHandle=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clean=value=>String(value??'').trim();
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
const tripId=trip=>clean(trip?.id||trip?.tripId);
const contracts=()=>({
  places:globalThis.LuviaPlacesContractV1,
  journey:globalThis.LuviaJourneyContractV1,
  context:globalThis.LuviaTripPreferenceContextV1,
  booking:globalThis.LuviaBookingContractV1
});
const timeValue=value=>{
  const date=value?new Date(value):null;
  return date&&!Number.isNaN(date.getTime())?date.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'10:00';
};
const dateValue=value=>clean(value).slice(0,10)||new Date().toISOString().slice(0,10);
const destinationOf=trip=>trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.destination||'';
const destinationContext=trip=>{
  const destination=trip?.destination||{};
  return{
    name:clean(destination.name||trip?.destinationName),
    formattedAddress:clean(destination.formattedAddress||destination.address||trip?.destinationName),
    placeId:clean(destination.placeId||destination.providerPlaceId||trip?.destinationPlaceId),
    latitude:Number.isFinite(Number(destination.latitude??destination.lat))?Number(destination.latitude??destination.lat):null,
    longitude:Number.isFinite(Number(destination.longitude??destination.lng))?Number(destination.longitude??destination.lng):null
  };
};
const categoryGroup=place=>{
  const value=clean(place?.primaryType||place?.primary_type||place?.types?.[0]).toLowerCase();
  if(/restaurant|cafe|bakery|bar|food|meal/.test(value))return'food';
  if(/park|beach|garden|natural|hiking|spa/.test(value))return'nature';
  if(/museum|gallery|theater|concert|landmark|monument|attraction/.test(value))return'culture';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return value||'places';
};
const categoryLabel=group=>({food:'Genuss',nature:'Draußen',culture:'Kultur',activities:'Erleben',places:'Entdecken'}[group]||'Entdecken');
const categoryIcon=group=>({food:'◌',nature:'≈',culture:'◇',activities:'↝',places:'✦'}[group]||'✦');
const visualCategory=place=>{
  const value=clean(place?.primaryType||place?.primary_type||place?.types?.[0]).toLowerCase();
  if(/cafe|bakery/.test(value))return'cafe';
  if(/restaurant|food|meal/.test(value))return'food';
  if(/bar|night_club|nightlife/.test(value))return'nightlife';
  if(/park|beach|garden|natural|hiking/.test(value))return'nature';
  if(/spa|wellness/.test(value))return'wellness';
  if(/museum|gallery|theater|concert/.test(value))return'culture';
  if(/landmark|monument|tourist_attraction/.test(value))return'sightseeing';
  if(/shop|store|market/.test(value))return'shopping';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return'places';
};
const visualLabel=group=>({food:'Restaurant',cafe:'Café',nightlife:'Abend',nature:'Draußen',wellness:'Wellness',culture:'Kultur',sightseeing:'Sehenswert',shopping:'Entdecken',activities:'Erleben',places:'Ort'}[group]||'Ort');
const visualIcon=group=>({food:'◌',cafe:'☕',nightlife:'◐',nature:'≈',wellness:'⌁',culture:'◇',sightseeing:'⌖',shopping:'✦',activities:'↝',places:'•'}[group]||'•');
const isBookable=place=>['food','cafe'].includes(visualCategory(place));
const ratings=place=>{
  const rating=Number(place?.rating||0),count=Number(place?.userRatingCount||place?.user_rating_count||0);
  return[rating?`${rating.toFixed(1).replace('.',',')} ★`:'',count?`${count.toLocaleString('de-DE')} Erfahrungen`:''].filter(Boolean).join(' · ');
};
function currentInput(input={}){
  const {context,journey}=contracts(),snapshot=context?.snapshot?.()||{},trip=snapshot.trip||{},graph=journey?.reads?.snapshot?.({trip})||journey?.reads?.snapshot?.()||{};
  const guidance=context?.dayGuidance?.(graph)?.suggestion||{};
  const targetDate=dateValue(input.targetDate||guidance.targetDate||graph.currentDay?.date||trip.startDate||trip.start_date);
  const day=graph.days?.find?.(item=>item.date===targetDate)||graph.currentDay||graph.days?.[0]||null;
  const gap=day?.openGaps?.find?.(item=>!input.startAt||item.startAt===input.startAt)||day?.openGaps?.[0]||null;
  return{
    trip,graph,day,targetDate,
    startAt:input.startAt||guidance.startAt||gap?.startAt||`${targetDate}T10:00:00`,
    endAt:input.endAt||guidance.endAt||gap?.endAt||null,
    query:clean(input.query||guidance.query||'Ein passender gemeinsamer Reisemoment'),
    reasons:[...(input.reasons||guidance.reasons||[])],
    snapshot
  };
}
function categoryPlan(input){
  const resolution=input.snapshot?.resolution||{},labels=[...(resolution.summary?.tripFeelings||[]),...(resolution.summary?.profileHighlights||[]),...input.reasons].join(' ').toLowerCase();
  const scheduled=(input.day?.entries||[]).map(categoryGroup),categories=[];
  const add=value=>{if(value&&!categories.includes(value))categories.push(value)};
  if(/ruhig|luft|entspann|natur|strand|meer/.test(labels))add('nature');
  if(/kultur|geschichte|neugier|authent/.test(labels))add('culture');
  if(/beweg|aktiv|famil|abenteuer|spann/.test(labels))add('activities');
  if(!scheduled.includes('food')||/genuss|kulinar|vegetar|vegan/.test(labels))add('food');
  ['nature','culture','activities','food'].forEach(add);
  return categories.slice(0,3);
}
function queryFor(category,input){
  const destination=destinationOf(input.trip);
  const feeling=input.snapshot?.resolution?.summary?.tripFeelings?.slice?.(0,2)?.join(' und ')||'';
  const base={
    nature:'Ein besonderer ruhiger Ort draußen',
    culture:'Lokales Leben, Kultur und Geschichten',
    activities:'Ein gemeinsames Erlebnis mit Charakter',
    food:'Ein passender Genussmoment mit lokaler Küche'
  }[category]||input.query;
  return[base,feeling?`für ${feeling}`:'',destination?`in ${destination}`:''].filter(Boolean).join(' ');
}
function cacheKey(input){return[tripId(input.trip),input.targetDate,clean(input.startAt),input.query].join('|')}
async function enrich(place){
  const api=contracts().places,id=providerId(place);
  if(!id||!api?.reads?.getCard)return place;
  try{
    const card=await api.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});
    return{...place,...(card?.place||{}),image:card?.image||place.image||null};
  }catch{return place}
}
function diversify(rows=[]){
  const selected=[],groups=new Set(),seen=new Set();
  for(const row of rows){const id=providerId(row);if(!id||seen.has(id))continue;seen.add(id);const group=categoryGroup(row);if(groups.has(group))continue;groups.add(group);selected.push(row);if(selected.length===3)break}
  for(const row of rows){const id=providerId(row);if(!id||selected.some(item=>providerId(item)===id))continue;selected.push(row);if(selected.length===3)break}
  return selected;
}
async function load(rawInput={},options={}){
  const input=currentInput(rawInput),key=cacheKey(input),existing=cache.get(key);
  if(existing&&!options.force&&Date.now()-existing.loadedAt<180000)return{...existing,input,cached:true};
  const api=contracts().places;
  if(!api?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig bereit.'),{code:'PLACES_CONTRACT_UNAVAILABLE'});
  const categories=categoryPlan(input),responses=await Promise.allSettled(categories.map(category=>api.reads.recommend({
    tripId:tripId(input.trip),
    text:queryFor(category,input),query:queryFor(category,input),category,
    destination:destinationOf(input.trip),destinationContext:destinationContext(input.trip),
    candidateLimit:24,limit:4,
    profilePreferences:input.snapshot.profilePreferences||{},
    tripComposition:input.snapshot.tripComposition||{},trip:input.trip,
    momentContext:{kind:'timeline-open-window',targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt,query:input.query,reasons:input.reasons}
  })));
  const successful=responses.filter(item=>item.status==='fulfilled').map(item=>item.value),rows=successful.flatMap(item=>item?.places||[]);
  if(!rows.length){
    const prior=existing||[...cache.values()].find(item=>item.input?.trip&&tripId(item.input.trip)===tripId(input.trip));
    if(prior)return{...prior,input,cached:true,stale:true,warning:'Die Live-Suche ist gerade nicht erreichbar. Ihr seht den letzten erfolgreichen, noch nicht bestätigten Vorschlagsstand.'};
    const failed=responses.find(item=>item.status==='rejected');
    throw Object.assign(new Error(failed?.reason?.publicMessage||failed?.reason?.message||'Luvia konnte gerade keine belegbaren Vorschläge laden.'),{code:failed?.reason?.code||'JOURNEY_SUGGESTIONS_UNAVAILABLE'});
  }
  const choices=await Promise.all(diversify(rows).map(enrich));
  const ai={planning:successful.some(item=>item?.plan?.ai&&!item.plan.ai.fallback),ranking:successful.some(item=>item?.aiMeta?.ranking?.used),fallback:successful.every(item=>item?.aiMeta?.ranking?.fallback===true||item?.plan?.ai?.fallback===true)};
  const result={input,choices,ai,loadedAt:Date.now(),cached:false,stale:false,warning:'',attempts:responses.length,successfulAttempts:successful.length};
  cache.set(key,result);return result;
}
function reasonFor(place,input){
  const reasons=[...(place?.aiReasons||[]),...(place?.recommendation?.reasons||[]),...(input.reasons||[])].map(clean).filter(Boolean);
  return reasons[0]||'Passt als anderer Moment zu eurem bestätigten Tagesplan und bleibt bis zur Auswahl nur ein Entwurf.';
}
function cardMarkup(place,index,input){
  const id=providerId(place),visual=visualCategory(place),image=place.image?.url||place.photoUri||place.imageUrl||'',meta=ratings(place),unknowns=[...(place.aiUnknowns||[])].map(clean).filter(Boolean).slice(0,2);
  return`<article class="lvjs-choice" data-suggestion-choice="${esc(id)}" data-choice-index="${index}" data-suggestion-category="${esc(visual)}"><button type="button" class="lvjs-choice-main" data-suggestion-select="${esc(id)}" aria-pressed="${index===0?'true':'false'}">${image?`<img src="${esc(image)}" alt="${esc(place.name||'Reiseort')}" loading="lazy" decoding="async">`:'<span class="lvjs-choice-placeholder" aria-hidden="true">✦</span>'}<span class="lvjs-choice-copy"><small>${esc(visualIcon(visual))} ${esc(visualLabel(visual))}</small><strong>${esc(place.name||'Unbenannter Ort')}</strong><em>${esc(place.formattedAddress||place.address||'Am Reiseziel')}</em>${meta?`<b>${esc(meta)}</b>`:''}<span>${esc(reasonFor(place,input))}</span>${unknowns.length?`<i>Noch zu prüfen: ${esc(unknowns.join(' · '))}</i>`:''}</span><span class="lvjs-choice-check" aria-hidden="true">✓</span></button></article>`;
}
function shellMarkup(input){
  const destination=destinationOf(input.trip)||'eurem Reiseziel';
  return`<header class="lvjs-header"><div><span>Luvia · ${esc(input.targetDate)}</span><h2>Drei Möglichkeiten für diesen Moment.</h2><p>Places belegt die Orte. Luvia ordnet sie mit Profil, Reisegefühl und eurem bestätigten Tag. Noch wurde nichts geplant.</p></div><button type="button" data-lvjs-close aria-label="Vorschläge schließen">×</button></header><div class="lvjs-status" data-lvjs-status role="status" aria-live="polite"><span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft ${esc(destination)} …</strong><small>Orte werden gesucht, fachlich gefiltert und persönlich gerankt.</small></div></div><div class="lvjs-results" data-lvjs-results hidden></div><form class="lvjs-confirm" data-lvjs-confirm hidden><div><span>Ausgewählt</span><strong data-lvjs-selected-name></strong><small>Diese Auswahl ist noch kein Plan.</small></div><label>Tag<input name="date" type="date" required value="${esc(input.targetDate)}"></label><label>Uhrzeit<input name="time" type="time" required value="${esc(timeValue(input.startAt))}"></label><span class="lvjs-confirm-actions"><button type="button" data-lvjs-booking hidden>Buchungsweg prüfen</button><button type="submit">Verbindlich einplanen</button></span></form><footer class="lvjs-footer"><span data-lvjs-ai-state>Places belegt · Luvia ordnet · ihr bestätigt</span><button type="button" data-lvjs-retry hidden>Erneut prüfen</button></footer>`;
}
async function openBooking(place,button,form,handle,result){
  const booking=contracts().booking;
  if(!booking?.commands?.openPlaceBooking)throw new Error('Booking ist gerade noch nicht bereit.');
  button.disabled=true;const label=button.textContent;button.textContent='Booking Core prüft …';
  try{
    const data=new FormData(form),sheetHost=handle.overlay.querySelector('[data-journey-suggestion-sheet]')||handle.overlay;
    const selectedId=providerId(place);
    const restore=()=>{sheetHost.className='lvjs-sheet';sheetHost.dataset.journeySuggestionSheet='true';sheetHost.innerHTML=shellMarkup(result.input);paintResults(handle,result,selectedId);queueMicrotask(()=>sheetHost.querySelector('[data-lvjs-booking]')?.focus())};
    const showRouteState=(kind,headline,copy)=>{const status=handle.overlay.querySelector('[data-lvjs-status]');if(!status)return;status.hidden=false;status.className=`lvjs-status ${kind}`;status.innerHTML=`<span aria-hidden="true">${kind==='is-success'?'↗':'!'}</span><div><strong>${esc(headline)}</strong><small>${esc(copy)}</small></div>`};
    const opened=await booking.commands.openPlaceBooking(place,{
      source:'consumer.journey-suggestions',host:sheetHost,onBack:restore,
      onExternal:({route})=>showRouteState('is-success',`${route.provider||'Buchungsanbieter'} wurde geöffnet.`, 'Der Booking Core hat den belegten Providerweg gewählt. Die Reservierungsdaten gebt ihr direkt dort ein.'),
      onUnavailable:({route})=>showRouteState('is-error','Kein belegter Buchungsweg gefunden.',route?.reason==='ROUTE_PREVIEW_UNAVAILABLE'?'Die Prüfung war technisch nicht erreichbar. Es wurde nichts geöffnet oder versendet.':'Weder ein belastbarer Providerlink noch eine verifizierte öffentliche Buchungs-E-Mail wurden gefunden.'),
      date:dateValue(data.get('date')),time:clean(data.get('time'))||timeValue(result.input.startAt),reserveExternalWindow:true
    });
    if(opened?.opened!==true&&opened?.channel!=='unavailable')throw new Error('Für diesen Ort ist gerade kein bestätigter Buchungsweg verfügbar.');
    return opened;
  }finally{button.disabled=false;button.textContent=label}
}
async function commit(place,form,input){
  const api=contracts().places,id=providerId(place),tid=tripId(input.trip);
  if(!tid||!id)throw new Error('Reise oder Place ist nicht eindeutig.');
  const data=new FormData(form),date=dateValue(data.get('date')),time=clean(data.get('time'))||timeValue(input.startAt),plannedAt=new Date(`${date}T${time}:00`).toISOString();
  const entity=await api.commands.importPlace(id,{tripId:tid,type:place.primaryType||categoryGroup(place),providerPlace:place,tripPlace:{status:'planned'}});
  if(!entity?.tripPlaceId)throw new Error('Places konnte den Ort nicht eindeutig mit der Reise verbinden.');
  const fields={planned_at:plannedAt,place_name:place.name,notes:'Von Luvia vorgeschlagen und ausdrücklich bestätigt.',metadata:{source:'journey-suggestion-sheet',suggestionVersion:VERSION}};
  const receipt=await api.commands.plan({tripId:tid,placeType:place.primaryType||categoryGroup(place),tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,fields});
  await api.commands.updateLifecycle?.(entity.tripPlaceId,'planned',{}, {tripId:tid});
  globalThis.dispatchEvent(new CustomEvent('luvia:place-plan-changed',{detail:{tripId:tid,tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,lifecycle:'planned',plannedAt,fields,receipt}}));
  return{receipt,plannedAt,entity};
}
function paintResults(handle,result,selectedId=''){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),results=root.querySelector('[data-lvjs-results]'),form=root.querySelector('[data-lvjs-confirm]'),footer=root.querySelector('[data-lvjs-ai-state]'),bookingButton=root.querySelector('[data-lvjs-booking]');
  if(result.warning)status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Letzter belegter Vorschlagsstand</strong><small>${esc(result.warning)}</small></div>`;
  else status.hidden=true;
  results.hidden=false;results.innerHTML=result.choices.map((place,index)=>cardMarkup(place,index,result.input)).join('');
  form.hidden=false;let selected=result.choices.find(place=>providerId(place)===selectedId)||result.choices[0]||null;
  const sync=()=>{root.querySelectorAll('[data-suggestion-select]').forEach(button=>button.setAttribute('aria-pressed',String(providerId(selected)===button.dataset.suggestionSelect)));root.querySelector('[data-lvjs-selected-name]').textContent=selected?.name||'';bookingButton.hidden=!isBookable(selected)};sync();
  results.onclick=event=>{const button=event.target.closest?.('[data-suggestion-select]');if(!button)return;selected=result.choices.find(place=>providerId(place)===button.dataset.suggestionSelect)||selected;sync()};
  bookingButton.onclick=async()=>{try{await openBooking(selected,bookingButton,form,handle,result)}catch(error){status.hidden=false;status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Booking konnte nicht geöffnet werden.</strong><small>${esc(error?.message||'Bitte versucht es gleich noch einmal.')}</small></div>`}};
  footer.textContent=result.ai.ranking?'Mit OpenAI persönlich geordnet · Fakten geprüft · ihr bestätigt':result.ai.fallback?'Sicher geordnet · Fakten geprüft · ihr bestätigt':'Belegte Orte · persönlich geordnet · ihr bestätigt';
  form.onsubmit=async event=>{event.preventDefault();const submit=event.submitter;if(!selected||!submit)return;submit.disabled=true;submit.textContent='Wird eingeplant …';try{const saved=await commit(selected,form,result.input);results.hidden=true;form.hidden=true;status.hidden=false;status.className='lvjs-status is-success';status.innerHTML=`<span aria-hidden="true">✓</span><div><strong>${esc(selected.name)} ist eingeplant.</strong><small>${esc(new Date(saved.plannedAt).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}))} · erscheint jetzt automatisch in eurer Timeline.</small><button type="button" data-lvjs-timeline>Zur Timeline</button></div>`;root.querySelector('[data-lvjs-timeline]').onclick=()=>{handle.close('planned');globalThis.LuviaApp?.show?.('timeline',{source:'journey-suggestion-receipt'})}}catch(error){submit.disabled=false;submit.textContent='Verbindlich einplanen';status.hidden=false;status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Nichts wurde verändert.</strong><small>${esc(error?.message||'Places konnte den Plan nicht bestätigen.')}</small></div>`}};
}
async function hydrate(handle,input,options={}){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),retry=root.querySelector('[data-lvjs-retry]');
  retry.hidden=true;status.hidden=false;status.className='lvjs-status';status.innerHTML='<span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft echte Orte …</strong><small>Places filtert Provider-Fakten; OpenAI ordnet nur die fachlich gültigen Kandidaten.</small></div>';
  root.querySelector('[data-lvjs-results]').hidden=true;root.querySelector('[data-lvjs-confirm]').hidden=true;
  try{paintResults(handle,await load(input,options))}catch(error){status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Vorschläge konnten nicht sicher geladen werden.</strong><small>${esc(error?.message||'Unbekannter Places-Fehler')} Die Timeline bleibt unverändert.</small></div>`;retry.hidden=false;retry.onclick=()=>hydrate(handle,input,{force:true})}
}
function open(rawInput={}){
  const input=currentInput(rawInput),ui=globalThis.LuviaUI;
  if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');
  activeHandle?.close?.('replace');
  const content=document.createElement('section');content.className='lvjs-sheet';content.dataset.journeySuggestionSheet='true';content.innerHTML=shellMarkup(input);
  let mounted=null;mounted=ui.mount({name:'journey.suggestions',kind:'sheet',content,className:'lvjs-overlay',closeOnEscape:false,closeSelector:'[data-lvjs-close]',initialFocus:'[data-lvjs-close]',label:'Luvia Vorschläge für den Reisetag',onClose:()=>{if(activeHandle?.id===mounted.id)activeHandle=null}});mounted.overlay.addEventListener('keydown',event=>{if(event.key!=='Escape')return;event.preventDefault();event.stopPropagation();const bookingBack=mounted.overlay.querySelector('[data-booking-close][aria-label="Zurück zu den Vorschlägen"]');bookingBack?bookingBack.click():mounted.close('escape')},true);activeHandle=mounted;hydrate(mounted,input);return mounted.overlay;
}
function diagnostics(){return Object.freeze({version:VERSION,owner:'consumer-orchestration',domainTruth:false,persistence:'ephemeral-cache-only',sources:['journey.v1','identity.v1','trip.v1','intelligence.v1','places.v1','booking.v1'],writeOwner:'places.v1',bookingOwner:'booking.v1',explicitConfirmation:true,cacheEntries:cache.size})}

globalThis.LuviaJourneySuggestions=Object.freeze({version:VERSION,load,open,diagnostics});
})();
