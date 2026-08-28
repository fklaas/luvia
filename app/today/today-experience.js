(()=>{
'use strict';

const VERSION='1.5.0';
let cleanup=null,binding=null;
const fallbackEsc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const core=()=>window.LuviaTodayCompositionCoreV1||(()=>{throw new Error('Today Composition Core v1 fehlt.')})();
function dateLabel(value){if(!value)return'';const parsed=new Date(`${value}T12:00:00`);return Number.isNaN(parsed.getTime())?'':parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}
function dateRange(trip={}){const start=dateLabel(trip.startDate||trip.start_date),end=dateLabel(trip.endDate||trip.end_date);return start?(end?`${start} – ${end}`:`Ab ${start}`):'Zeitraum noch offen'}
function networkOnline(){try{return window.LuviaPlatformPorts?.get?.('NetworkPort')?.isOnline?.()!==false}catch{return true}}
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.id||trip?.tripId);
function tripCoordinates(trip={}){
  const destination=trip.destination||trip.destinationModel||trip.destination_context||{};
  const location=destination.location||destination.center||destination.coordinates||{};
  const latitude=Number(destination.latitude??destination.lat??location.latitude??location.lat??trip.destinationLat);
  const longitude=Number(destination.longitude??destination.lng??location.longitude??location.lng??trip.destinationLng);
  return Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;
}
function journeyEntries(journey={}){
  journey=journey||{};
  const buckets=[journey.day?.entries,...(journey.days||[]).map(day=>day?.entries),journey.entries,journey.events].filter(Array.isArray);
  const seen=new Set(),entries=[];
  buckets.flat().forEach(entry=>{const key=clean(entry?.id||`${entry?.startAt||entry?.date||''}:${entry?.title||''}`);if(!key||seen.has(key))return;seen.add(key);entries.push(entry)});
  return entries;
}
function countdownFor(trip={}){
  const raw=trip.startDate||trip.start_date;const start=raw?new Date(`${raw}T00:00:00`):null;
  if(!start||Number.isNaN(start.getTime()))return{days:null,targetAt:null,label:'Zeitraum offen',detail:'Sobald das Datum steht, beginnt der Countdown.'};
  const days=Math.ceil((start.getTime()-Date.now())/86400000);
  if(days>1)return{days,targetAt:start.toISOString(),label:`Noch ${days} Tage`,detail:`bis ${clean(trip.destination?.name||trip.destinationName||'zu eurer Reise')}`};
  if(days===1)return{days,targetAt:start.toISOString(),label:'Morgen geht es los',detail:clean(trip.title||'Eure Reise')};
  if(days===0)return{days,targetAt:start.toISOString(),label:'Heute geht es los',detail:clean(trip.title||'Eure Reise')};
  return{days,targetAt:start.toISOString(),label:'Ihr seid unterwegs',detail:clean(trip.title||'Eure Reise')};
}
function dashboardProjection(trip={},profile={},journey={}){
  const id=tripId(trip),entries=journeyEntries(journey);
  const places=window.LuviaPlacesContractV1?.reads?.listPlaces?.({tripId:id})||[];
  const plannedPlaces=places.filter(place=>['planned','booked','visited','rated','memory','travel_book'].includes(clean(place.lifecycle||place.lifecycleStatus||place.status).toLowerCase())||place.plannedDate||place.startAt);
  const members=window.LuviaJoinFlow?.snapshot?.()||[];
  const presence=window.LuviaCollaboration?.snapshot?.().presence||[];
  const presenceByUser=new Map(presence.map(item=>[clean(item.user_id||item.userId),item]));
  const people=(members.length?members:[{user_id:profile.id||profile.userId,display_name:profile.displayName||profile.name||'Du',avatar_color:profile.avatarColor||profile.profileColor,role:'owner'}]).map((member,index)=>{
    const memberId=clean(member.user_id||member.userId),state=presenceByUser.get(memberId)||{},isViewer=Boolean(memberId&&memberId===clean(profile.id||profile.userId))||clean(member.role).toLowerCase()==='owner'&&index===0;
    return{initials:clean(member.display_name||member.displayName||member.name||'Du').split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase(),name:clean(member.display_name||member.displayName||member.name||'Mitreisende Person'),online:state.status==='online'||(isViewer&&networkOnline())||(!members.length&&networkOnline()),color:member.avatar_color||member.avatarColor||member.profileColor||['rgb(239 103 90)','rgb(46 157 153)','rgb(246 183 60)','rgb(78 139 185)'][index%4]};
  });
  return Object.freeze({countdown:countdownFor(trip),entries,places,plannedPlaces,people,onlineCount:people.filter(person=>person.online).length,coordinates:tripCoordinates(trip)});
}
function modelFor({trip={},profile={}}={}){
  const travel=window.LuviaControlCenterTravelIdentity?.snapshot?.()||{};
  const attention=window.LuviaControlCenterAttention?.snapshot?.()||{items:[]};
  const journey=window.LuviaJourneyContractV1?.reads?.snapshot?.({trip})||null;
  const preferenceGuidance=journey?window.LuviaTripPreferenceContextV1?.dayGuidance?.(journey)||null:null;
  const composed=core().compose({
    trip:{id:trip.id||trip.tripId,title:trip.title||trip.tripName,destination:trip.destination?.formattedAddress||trip.destination?.name||trip.destinationName,symbol:trip.symbol,dateRange:dateRange(trip)},
    viewer:{displayName:profile.displayName||profile.name},
    travel:{phase:travel.phase,tripDay:travel.tripDay},
    attention,
    journey,
    preferenceGuidance,
    network:{online:networkOnline()},
    clock:{now:new Date().toISOString(),hour:new Date().getHours()}
  });
  return Object.freeze({...composed,dashboard:dashboardProjection(trip,profile,journey),trip,profile});
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
const todayIcons=Object.freeze({
  sun:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  route:'<circle cx="6" cy="17.5" r="2"/><circle cx="18" cy="6.5" r="2"/><path d="M8 17.5h2.5A2.5 2.5 0 0 0 13 15V9a2.5 2.5 0 0 1 2.5-2.5H16"/>',
  pin:'<path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
  spark:'<path d="M12 3c.8 5.2 3.8 8.2 9 9-5.2.8-8.2 3.8-9 9-.8-5.2-3.8-8.2-9-9 5.2-.8 8.2-3.8 9-9Z"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 4.3 4.3"/>',
  memory:'<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m6.5 17 4.2-4 2.7 2.3 2.4-2.1 2.2 2"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 11.2 3.4 3.4 0 0 0 7 18Z"/>',
  shield:'<path d="m12 3 7 3v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6Z"/><path d="m9 12 2 2 4-5"/>'
});
function todayIcon(name){return`<svg viewBox="0 0 24 24" aria-hidden="true">${todayIcons[name]||todayIcons.spark}</svg>`}
function journeyMoments(model){
  const day=model.journey?.day||{},nextId=model.journey?.nextEntry?.id||null,now=Date.now();
  const entries=(day.entries||[]).map(entry=>({id:entry.id,time:fmtTime(entry.startAt)||'Offen',title:entry.title||'Reisemoment',kind:entry.id===nextId?'now':entry.endAt&&new Date(entry.endAt).getTime()<now?'done':'planned'}));
  const gaps=(day.openGaps||[]).slice(0,1).map(gap=>({id:gap.id,time:fmtTime(gap.startAt)||'Offen',title:'Freier Moment',kind:'open'}));
  const items=[...entries,...gaps].sort((a,b)=>a.time.localeCompare(b.time)).slice(0,4);
  return items.length?items:[{id:'open-day',time:'Heute',title:'Euer Tag ist offen',kind:'open'}];
}
function liveMapMarkup(model,esc){
  const items=journeyMoments(model),gaps=model.journey?.day?.openGaps?.length||0;
  return `<section class="lvt-live-map" aria-label="Euer heutiger Tagesbogen" data-owner="journey.v1"><header><span><i aria-hidden="true"></i><span><small>Heute live</small><strong>Euer Tag bewegt sich</strong></span></span><button type="button" data-view="trip">Tag öffnen ${todayIcon('arrow')}</button></header><div class="lvt-route-flow">${items.map((item,index)=>`<span class="is-${esc(item.kind)}"><i>${todayIcon(item.kind==='done'?'check':item.kind==='now'?'route':item.kind==='open'?'spark':'pin')}</i><b>${esc(item.time)}</b><small>${esc(item.title)}</small></span>${index<items.length-1?'<b aria-hidden="true"></b>':''}`).join('')}</div><footer><span>${todayIcon('route')} ${esc(model.context.tripTitle)}</span><span>${todayIcon('cloud')} ${gaps?`${gaps} ${gaps===1?'freie Spur':'freie Spuren'}`:'Tagesbogen steht'}</span><span>${todayIcon('shield')} Vorschlag bleibt Entwurf</span></footer></section>`;
}
function worldDockMarkup(model,esc){
  const entries=model.journey?.day?.entries?.length||0,gaps=model.journey?.day?.openGaps?.length||0;
  return `<nav class="lvt-world-dock" aria-label="Luvia Erlebnisräume"><button type="button" data-view="plan"><span>${todayIcon('search')}</span><span><small>Planen</small><strong>${model.suggestion?'Passende Idee liegt bereit':'Reise weiter gestalten'}</strong></span>${todayIcon('arrow')}</button><button type="button" data-view="trip"><span>${todayIcon('route')}</span><span><small>Reise</small><strong>${entries} ${entries===1?'Moment':'Momente'} · ${gaps} offen</strong></span>${todayIcon('arrow')}</button><button type="button" data-view="memory"><span>${todayIcon('memory')}</span><span><small>Erinnerungen</small><strong>Momente bewusst bewahren</strong></span>${todayIcon('arrow')}</button></nav>`;
}
function nextMomentMarkup(model,esc){
  const suggestion=model.suggestion;
  const attention=model.attention?.[0];
  const attentionHint=attention?`<small class="lvt-next-attention">${esc(attention.title)}</small>`:'';
  if(!suggestion)return`<button class="lvt-next-moment" type="button" data-ai-ask-open><span class="lvt-next-kicker">Dein nächster Moment</span>${attentionHint}<strong>Der nächste Abschnitt ist noch offen.</strong><span>Luvia denkt nur mit – du entscheidest, was daraus wird.</span><span class="lvt-next-cta">Ideen ansehen ${todayIcon('arrow')}</span></button>`;
  return `<button class="lvt-next-moment" type="button" data-today-suggestion-add data-suggestion-query="${esc(suggestion.query)}" data-suggestion-date="${esc(suggestion.targetDate)}" data-suggestion-start="${esc(suggestion.startAt)}"><span class="lvt-next-kicker">Dein nächster Moment</span>${attentionHint}<strong>${esc(suggestion.query)}</strong><span>${esc(suggestion.reasons?.[0]||'Aus eurem Profil und dem Gefühl dieser Reise abgeleitet.')}</span><span class="lvt-next-cta">In Places ansehen ${todayIcon('arrow')}</span><em>Erst deine Bestätigung macht daraus einen Plan.</em></button>`;
}
function avatarMarkup(model,esc){
  const people=model.dashboard.people;
  return `<div class="lvt-companions" aria-label="${esc(`${people.length} Mitreisende, ${model.dashboard.onlineCount} online`)}">${people.slice(0,5).map(person=>`<span style="--person-color:${esc(person.color)}" title="${esc(`${person.name} · ${person.online?'online':'offline'}`)}"><b>${esc(person.initials)}</b><i class="${person.online?'is-online':''}" aria-hidden="true"></i></span>`).join('')}${people.length>5?`<span class="is-more">+${people.length-5}</span>`:''}<small>${model.dashboard.onlineCount} online</small></div>`;
}
function weatherMarkup(model,esc){
  const coords=model.dashboard.coordinates,destination=model.context.destination||'am Reiseziel';
  return `<article class="lvt-glass lvt-weather" data-today-weather data-latitude="${coords?esc(coords.latitude):''}" data-longitude="${coords?esc(coords.longitude):''}" data-destination="${esc(destination)}" data-trip-start="${esc(model.trip.startDate||model.trip.start_date||'')}"><header><span>${todayIcon('sun')}<span><small>Wetter · ${esc(destination)}</small><strong data-weather-title>${coords?'Live-Wetter wird geladen':'Zielkoordinaten fehlen'}</strong></span></span><div role="group" aria-label="Wetterzeitraum"><button class="is-active" type="button" data-weather-mode="current" aria-pressed="true">Jetzt</button><button type="button" data-weather-mode="trip" aria-pressed="false">Reise</button></div></header><div class="lvt-weather-body" data-weather-current><b data-weather-temperature>–°</b><span><strong data-weather-condition>Aktuelle Prognose</strong><small data-weather-detail>${coords?'Wetterdaten werden im Hintergrund geladen.':'Öffne das Reiseziel, um Koordinaten zu ergänzen.'}</small></span></div><div class="lvt-weather-body" data-weather-trip hidden><b>${model.dashboard.countdown.days!=null&&model.dashboard.countdown.days<=16?'↗':'◎'}</b><span><strong>${model.dashboard.countdown.days!=null&&model.dashboard.countdown.days<=16?'Reiseprognose verfügbar':'Noch keine belastbare Prognose'}</strong><small>${model.dashboard.countdown.days!=null&&model.dashboard.countdown.days>16?'Eine echte Vorhersage erscheint spätestens 16 Tage vor Abreise. Keine erfundene Langfrist-Prognose.':'Die Wettertage eures Reisezeitraums werden live geladen.'}</small></span></div><footer>Open-Meteo · Zielkoordinaten · zuletzt live geladen</footer></article>`;
}
function metricMarkup(model,esc){
  const d=model.dashboard;
  return `<section class="lvt-metrics" aria-label="Reise auf einen Blick"><button type="button" data-view="trip" data-today-countdown data-countdown-at="${esc(d.countdown.targetAt||'')}"><small>Bis zur Reise</small><strong data-countdown-days>${esc(d.countdown.label)}</strong><span data-countdown-clock>${esc(d.countdown.detail)}</span></button><button type="button" data-view="plan"><small>Geplant</small><strong>${d.entries.length}</strong><span>${d.entries.length===1?'Reisemoment':'Reisemomente'}</span></button><button type="button" data-view="places-lifecycle"><small>Places</small><strong>${d.plannedPlaces.length}</strong><span>für diese Reise</span></button><button type="button" data-view="memory"><small>Erinnerungen</small><strong data-today-memory-count>…</strong><span>bewusste Momente</span></button></section>`;
}
function intelligenceMarkup(model,esc){
  const suggestion=model.suggestion;
  return `<article class="lvt-glass lvt-intelligence" data-today-ai-card><header><span>✦</span><div><small>Luvia Intelligence</small><strong data-ai-status>${suggestion?'Aus Profil + Reise abgeleitet':'Denkt im Hintergrund mit'}</strong></div><button type="button" data-ai-brief-refresh aria-label="Vorschläge neu denken">↻</button></header><div class="lvt-ai-slider" data-ai-slider aria-label="KI-Vorschläge für eure Planung"><button class="lvt-intelligence-idea" type="button" ${suggestion?`data-today-suggestion-add data-suggestion-query="${esc(suggestion.query)}" data-suggestion-date="${esc(suggestion.targetDate)}" data-suggestion-start="${esc(suggestion.startAt)}"`:'data-ai-ask-open'}><strong>${esc(suggestion?.query||'Eure Reise nimmt weiter Form an.')}</strong><span>${esc(suggestion?.reasons?.[0]||'Luvia verbindet Reisekompass, Zeitraum, Journey und bestätigte Places – ohne selbst etwas einzuplanen.')}</span><em>${suggestion?'In Places ansehen':'Mit Luvia entdecken'} ${todayIcon('arrow')}</em></button></div><footer>KI entwirft · Owner-Cores belegen · ihr bestätigt</footer></article>`;
}
function journeyEntryMarkup(model,esc){
  const d=model.dashboard,count=d.entries.length;
  return `<nav class="lvt-journey-entry" aria-label="Deine Reise direkt weiterführen"><span><small>Deine Reise</small><strong>${esc(model.context.tripTitle)}</strong><em>${esc(d.countdown.label)} · ${count} ${count===1?'Moment':'Momente'} geplant</em></span><div class="lvt-journey-actions"><button type="button" data-trip-switch-open>Reise wechseln</button><button type="button" data-view="trip">Anpassen ${todayIcon('arrow')}</button><button class="lvt-journey-help" type="button" data-ai-ask-open aria-label="Luvia um Hilfe für diese Reise bitten">✦</button></div></nav>`;
}
const destinationPhotoCatalog=Object.freeze([
  Object.freeze({match:/\b(kopenhagen|copenhagen)\b/i,url:'assets/public-landing/travel-copenhagen.webp',place:'Kopenhagen, Dänemark',creator:'Mircea Solomiea',source:'https://unsplash.com/photos/colorful-buildings-line-a-canal-with-bicycles-in-copenhagen-s4PtYXbCr4U'}),
  Object.freeze({match:/\b(lissabon|lisbon)\b/i,url:'assets/public-landing/travel-lisbon.webp',place:'Lissabon, Portugal',creator:'Ivo Sousa Martins',source:'https://unsplash.com/photos/a-yellow-tram-travels-down-a-cobblestone-street-aLXsw0n0Pyw'}),
  Object.freeze({match:/\b(pragser|braies)\b/i,url:'assets/public-landing/travel-pragser-wildsee.webp',place:'Pragser Wildsee, Südtirol',creator:'Kevin Schmid',source:'https://unsplash.com/photos/a-wooden-dock-sitting-next-to-a-mountain-lake-ZCm7kd3YZRA'}),
  Object.freeze({match:/\b(warnemünde|warnemuende)\b/i,url:'assets/public-landing/travel-warnemuende.webp',place:'Warnemünde, Deutschland',creator:'Maik Astheimer',source:'https://unsplash.com/photos/sand-dunes-and-beach-grass-face-the-ocean-TCzcX-9QoTk'}),
  Object.freeze({match:/\b(japan)\b/i,url:'assets/public-landing/travel-rural-japan.webp',place:'Ländliches Japan',creator:'Johnny',source:'https://unsplash.com/photos/a-train-is-traveling-past-flooded-fields-gc5M34_j208'})
]);
function destinationPhotoSeed(trip={}){
  const destination=trip.destination||{},name=clean(destination.formattedAddress||destination.name||trip.destinationName),exact=destinationPhotoCatalog.find(item=>item.match.test(name));
  if(exact)return{...exact,exact:true,kind:'curated-exact',alt:`Reisefotografie aus ${exact.place}`,credit:`Foto · ${exact.creator} / Unsplash`};
  const coastal=/\b(scharbeutz|ostsee|nordsee|küste|kueste|strand|meer|see|insel|coast|beach|ocean|island)\b/i.test(name);
  const mountain=/\b(alpen|berge|gebirge|mountain|dolom|tirol|bayern|schweiz|austria)\b/i.test(name);
  const fallback=coastal?destinationPhotoCatalog[3]:mountain?destinationPhotoCatalog[2]:Object.freeze({url:'assets/public-landing/book-roadtrip-car.jpg',place:'Reisemotiv',creator:'Nur Coşar',source:'https://www.pexels.com/photo/vintage-car-on-a-sunny-road-trip-32841200/'});
  return{...fallback,exact:false,kind:'semantic-fallback',alt:coastal?'Dokumentiertes Ostsee-Reisemotiv':mountain?'Dokumentiertes Berg-Reisemotiv':'Dokumentiertes Reisemotiv',credit:`Motiv-Fallback · ${fallback.creator} / ${fallback.source.includes('pexels')?'Pexels':'Unsplash'}`};
}
function focusedTodayMarkup(model,esc){
  const destination=clean(model.trip?.destination?.name||model.trip?.destinationName||model.context.destination)||'Eure Reise';
  const photo=destinationPhotoSeed(model.trip);
  return `<section class="lvt-premium lvt-premium--living-day lvt-today-focus" data-today-premium data-experience-state="${esc(model.state)}" data-journey-projection="journey.v1-read-only" data-place-projection="places.v1-read-only" data-ai-projection="dashboard.brief-draft" data-photo-resolution="${esc(photo.kind)}" aria-labelledby="lvt-title"><div class="lvt-hero-depth"><img class="lvt-hero-image" data-today-destination-image src="${esc(photo.url)}" alt="${esc(photo.alt)}" loading="eager" decoding="async" fetchpriority="high"></div><a class="lvt-photo-credit" data-today-photo-credit href="${esc(photo.source)}" target="_blank" rel="noreferrer">${esc(photo.credit)} ↗</a><div class="lvt-hero-shade" aria-hidden="true"></div><div class="lvt-play-orbits" aria-hidden="true"><i></i><i></i><i></i><i></i></div><header class="lvt-focus-heading"><span>Heute · ${esc(model.context.label)}</span><h1 id="lvt-title">${esc(model.greeting)} <em>${esc(destination)}</em> rückt näher.</h1><p>${esc(model.context.tripTitle)} · ${esc(model.summary)}</p></header><div class="lvt-focus-top">${weatherMarkup(model,esc)}${avatarMarkup(model,esc)}</div>${journeyEntryMarkup(model,esc)}<div class="lvt-focus-bottom">${metricMarkup(model,esc)}${intelligenceMarkup(model,esc)}</div></section>`;
}
function premiumMarkup(model,esc){
  if(model.journey)return`<section class="lvt-premium lvt-premium--living-day" data-today-premium data-experience-state="${esc(model.state)}" aria-labelledby="lvt-title"><img class="lvt-hero-image" src="assets/public-landing/prototype-coast-morning.png" alt="Ruhiger Morgen an der Küste"><div class="lvt-hero-shade" aria-hidden="true"></div><div class="lvt-hero-copy"><div class="lvt-weather-line">${todayIcon('sun')}<span>${esc(model.context.label)}</span><span>${model.status.online?'Reisekontext live':'Offline bereit'}</span></div><p class="lvt-hero-date">${esc(model.journey?.day?.date?dateLabel(model.journey.day.date):model.summary)}</p><h1 id="lvt-title">${esc(model.greeting)}<br><em>${esc(model.headline)}</em></h1><p>${esc(model.context.tripTitle)} · ${esc(model.context.destination)} · ${esc(model.summary)}</p></div>${liveMapMarkup(model,esc)}${nextMomentMarkup(model,esc)}${worldDockMarkup(model,esc)}</section>`;
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
const premiumSignature=model=>JSON.stringify({
  state:model.state,context:model.context,summary:model.summary,status:model.status,
  suggestion:model.suggestion,attention:model.attention,journey:model.journey,
  preferenceGuidance:model.preferenceGuidance,
  dashboard:{countdown:model.dashboard.countdown,entryCount:model.dashboard.entries.length,placeCount:model.dashboard.places.length,plannedPlaceCount:model.dashboard.plannedPlaces.length,people:model.dashboard.people}
});
function render({trip={},profile={},widgetsHtml='',esc=fallbackEsc}={}){
  const model=modelFor({trip,profile});
  return`<section class="lv-dashboard lvt-surface lvt-surface--focused" data-today-experience data-today-contract="${core().contractId}">${focusedTodayMarkup(model,esc)}</section>`;
}
function update(){
  const surface=binding?.container?.querySelector?.('[data-today-experience]');
  const current=surface?.querySelector?.('[data-today-premium]');
  if(!surface||!current)return false;
  const model=modelFor(binding.context),signature=premiumSignature(model);if(signature===binding.signature)return false;
  const template=document.createElement('template');
  template.innerHTML=focusedTodayMarkup(model,binding.context.esc||fallbackEsc).trim();
  const next=template.content.firstElementChild,container=binding.container,context=binding.context;
  next.classList.add('is-live-update');current.replaceWith(next);binding.signature=signature;
  bind(container,context);
  return true;
}
function unbind(){if(typeof cleanup==='function')cleanup();cleanup=null;binding=null}
function bind(container,context={}){
  unbind();
  binding={container,context,signature:premiumSignature(modelFor(context))};
  const disposers=[];
  const listen=name=>{const handler=()=>update();window.addEventListener(name,handler);disposers.push(()=>window.removeEventListener(name,handler))};
  ['luvia:control-center-attention-changed','luvia:control-center-travel-identity-changed','luvia:travel-context-changed','luvia:trip.changed','luvia:journey.changed','luvia:identity.preferences.changed','luvia:profile-changed','luvia:places-lifecycle-changed','luvia:trip-place-data-changed'].forEach(listen);
  try{const unsubscribe=window.LuviaPlatformPorts?.get?.('NetworkPort')?.subscribe?.(()=>update());if(typeof unsubscribe==='function')disposers.push(unsubscribe)}catch{}
  const weatherMode=mode=>{const card=container.querySelector('[data-today-weather]');if(!card)return;card.querySelectorAll('[data-weather-mode]').forEach(button=>{const active=button.dataset.weatherMode===mode;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))});const current=card.querySelector('[data-weather-current]'),trip=card.querySelector('[data-weather-trip]');if(current)current.hidden=mode!=='current';if(trip)trip.hidden=mode!=='trip'};
  container.querySelectorAll('[data-weather-mode]').forEach(button=>{const handler=()=>weatherMode(button.dataset.weatherMode);button.addEventListener('click',handler);disposers.push(()=>button.removeEventListener('click',handler))});
  const hydrateWeather=async()=>{const card=container.querySelector('[data-today-weather]');if(!card)return;const latitude=Number(card.dataset.latitude),longitude=Number(card.dataset.longitude);if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);try{const url=new URL('https://api.open-meteo.com/v1/forecast');url.search=new URLSearchParams({latitude:String(latitude),longitude:String(longitude),current:'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',timezone:'auto',forecast_days:'7'});const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error(`WEATHER_${response.status}`);const data=await response.json(),code=Number(data.current?.weather_code),condition=code===0?'Klar':code<=3?'Leicht bewölkt':code<=48?'Nebel':code<=67?'Regen':code<=77?'Schnee':code<=82?'Schauer':'Gewitter';card.querySelector('[data-weather-temperature]').textContent=`${Math.round(Number(data.current?.temperature_2m))}°`;card.querySelector('[data-weather-condition]').textContent=condition;card.querySelector('[data-weather-title]').textContent=`${condition} · ${Math.round(Number(data.current?.wind_speed_10m)||0)} km/h Wind`;card.querySelector('[data-weather-detail]').textContent=`Gefühlt ${Math.round(Number(data.current?.apparent_temperature))}° · heute ${Math.round(Number(data.daily?.temperature_2m_min?.[0]))}–${Math.round(Number(data.daily?.temperature_2m_max?.[0]))}° · Regen ${Math.round(Number(data.daily?.precipitation_probability_max?.[0])||0)} %`}catch{card.querySelector('[data-weather-title]').textContent='Wetter gerade nicht erreichbar';card.querySelector('[data-weather-detail]').textContent='Die letzte Reiseansicht bleibt nutzbar; Wetter wird beim nächsten Öffnen erneut geladen.'}finally{clearTimeout(timer)}};
  const hydrateMemories=async()=>{const target=container.querySelector('[data-today-memory-count]');if(!target)return;const results=await Promise.allSettled([window.LuviaMemoryAlbums?.list?.()||[],window.LuviaMemoryJourneys?.list?.()||[]]);const ids=new Set();results.forEach(result=>{if(result.status==='fulfilled'&&Array.isArray(result.value))result.value.forEach(item=>ids.add(clean(item?.id)||JSON.stringify(item)))});target.textContent=String(ids.size)};
  const hydrateCountdown=()=>{const card=container.querySelector('[data-today-countdown]'),target=card?.dataset.countdownAt?new Date(card.dataset.countdownAt).getTime():NaN;if(!card||!Number.isFinite(target))return;const daysNode=card.querySelector('[data-countdown-days]'),clockNode=card.querySelector('[data-countdown-clock]');const paint=()=>{const remaining=Math.max(0,target-Date.now()),days=Math.floor(remaining/86400000),hours=Math.floor(remaining%86400000/3600000),minutes=Math.floor(remaining%3600000/60000),seconds=Math.floor(remaining%60000/1000);daysNode.textContent=remaining?`${days} ${days===1?'Tag':'Tage'}`:'Heute geht es los';clockNode.textContent=remaining?`${String(hours).padStart(2,'0')} Std · ${String(minutes).padStart(2,'0')} Min · ${String(seconds).padStart(2,'0')} Sek`:'Eure Reise beginnt jetzt.'};paint();const timer=setInterval(paint,1000);disposers.push(()=>clearInterval(timer))};
  const hydrateDestinationPhoto=async()=>{const surface=container.querySelector('[data-today-premium]'),image=surface?.querySelector('[data-today-destination-image]'),credit=surface?.querySelector('[data-today-photo-credit]'),destination=context.trip?.destination||{},placeId=clean(destination.placeId||destination.providerPlaceId||context.trip?.destinationPlaceId);if(!surface||!image||!placeId||typeof window.LuviaPlacesContractV1?.reads?.getCard!=='function')return;try{const card=await window.LuviaPlacesContractV1.reads.getCard(placeId,{maxWidthPx:1800,maxHeightPx:1200}),resolved=card?.image;if(!resolved?.url)return;image.src=resolved.url;image.alt=`${clean(card?.place?.name||destination.name||'Reiseziel')} · Reisefotografie`;surface.dataset.photoResolution='places-exact-transient';if(credit){credit.textContent=`Foto · ${clean(resolved.attribution)||'Google Maps'} / ${clean(resolved.provider)||'Places'} ↗`;credit.href=resolved.attributionUrl||resolved.sourceUrl||'#';credit.toggleAttribute('aria-disabled',!resolved.attributionUrl&&!resolved.sourceUrl)}}catch(error){console.warn('[Luvia Today] Exaktes Zielfoto nicht verfügbar; dokumentierter Motiv-Fallback bleibt aktiv.',error?.message||error)}};
  const hydrateAi=async(force=false)=>{const card=container.querySelector('[data-today-ai-card]'),slider=card?.querySelector('[data-ai-slider]');if(!card||!slider||!window.LuviaAI?.run)return;const status=card.querySelector('[data-ai-status]'),destination=clean(context.trip?.destination?.name||context.trip?.destinationName||'eurem Reiseziel'),goal=`Unterschiedliche, konkrete Reiseideen in ${destination}, die zu Profil, Reisegefühl, Zeitraum und bereits geplanter Journey passen`;if(status)status.textContent='Luvia denkt mit OpenAI …';try{const [brief,planning]=await Promise.all([window.LuviaAI.run('dashboard.brief',{currentMoment:{surface:'today',tripId:tripId(context.trip),destination,reason:'visible-today-brief'}},{fallback:true,force}),window.LuviaAI.run('discovery.plan',{domain:'places',contract:{domain:'places',query:goal,includedTypes:[],excludedTypes:[],featureRequirements:{evidenceRequired:true},labels:{context:['today-dashboard',destination],priorities:['profile-and-trip-fit','different-experience-types']},freeText:goal},currentMoment:{surface:'today',domain:'places',tripId:tripId(context.trip),destination,reason:'visible-planning-suggestions'}},{fallback:true,force})]);const plan=planning?.data||{},seen=new Set();let ideas=(plan.searchPlans||[]).map(item=>({headline:clean(item?.query),message:clean(plan.reasoningSummary)||clean(brief?.data?.message)})).filter(item=>item.headline.length>=5&&!seen.has(item.headline.toLowerCase())&&seen.add(item.headline.toLowerCase()));if(planning?.meta?.fallback)ideas=ideas.slice(0,1);else ideas=ideas.slice(0,4);if(!ideas.length)return;if(status)status.textContent=planning?.meta?.fallback?'Regelbasiert abgesichert':'OpenAI · passende Planungsimpulse';slider.innerHTML=ideas.map((idea,index)=>`<button class="lvt-intelligence-idea" type="button" data-today-suggestion-add data-suggestion-query="${fallbackEsc(idea.headline)}"><small>${String(index+1).padStart(2,'0')}</small><strong>${fallbackEsc(idea.headline)}</strong><span>${fallbackEsc(idea.message||'Aus eurem bestätigten Reise- und Profilkontext abgeleitet.')}</span><em>In Places prüfen ${todayIcon('arrow')}</em></button>`).join('');slider.classList.toggle('has-multiple',ideas.length>1)}catch{if(status)status.textContent='Regelbasiert abgesichert'}};
  const refresh=container.querySelector('[data-ai-brief-refresh]');if(refresh){const handler=()=>hydrateAi(true);refresh.addEventListener('click',handler);disposers.push(()=>refresh.removeEventListener('click',handler))}
  const depthSurface=container.querySelector('[data-today-premium]');
  if(depthSurface&&!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){let frame=0;const move=event=>{if(event.pointerType==='touch')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const rect=depthSurface.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;depthSurface.style.setProperty('--lvt-depth-x',`${(x*12).toFixed(2)}px`);depthSurface.style.setProperty('--lvt-depth-y',`${(y*9).toFixed(2)}px`)})};const reset=()=>{depthSurface.style.setProperty('--lvt-depth-x','0px');depthSurface.style.setProperty('--lvt-depth-y','0px')};depthSurface.addEventListener('pointermove',move,{passive:true});depthSurface.addEventListener('pointerleave',reset,{passive:true});disposers.push(()=>{cancelAnimationFrame(frame);depthSurface.removeEventListener('pointermove',move);depthSurface.removeEventListener('pointerleave',reset)})}
  queueMicrotask(()=>{hydrateCountdown();hydrateWeather();hydrateMemories();hydrateAi(false);hydrateDestinationPhoto()});
  cleanup=()=>disposers.splice(0).forEach(dispose=>{try{dispose()}catch{}});
  window.LuviaControlCenterTravelIdentity?.refresh?.();
  window.LuviaControlCenterAttention?.refresh?.().catch?.(()=>{});
  return unbind;
}
function diagnostics(){return Object.freeze({version:VERSION,contract:core().contractId,bound:Boolean(binding),domainTruth:false,journeyTimeline:'journey.v1-read-only-projection',weather:'open-meteo-read-only',aiBrief:'dashboard.brief-background',destinationPhoto:'places-exact-transient-with-curated-semantic-fallback',ports:['NetworkPort']})}

window.LuviaTodayExperience=Object.freeze({version:VERSION,render,bind,unbind,update,diagnostics});
})();
