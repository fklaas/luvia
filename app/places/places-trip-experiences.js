/* Consumer composition only: Journey, Places and shared preference projections. */
(() => {
  'use strict';
  const text=v=>String(v??'').trim(),id=p=>text(p?.providerPlaceId||p?.provider_place_id||p?.id),esc=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const point=p=>{const c=p?.coordinates||p?.location||p?.metadata?.coordinates||p,lat=c?.latitude??c?.lat,lng=c?.longitude??c?.lng;return lat!=null&&lng!=null&&Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))&&Math.abs(Number(lat))<=90&&Math.abs(Number(lng))<=180?{latitude:Number(lat),longitude:Number(lng)}:null};
  const lngLat=p=>{const c=point(p);return c?[c.longitude,c.latitude]:null};
  const distance=(a,b)=>{a=point(a);b=point(b);if(!a||!b)return Infinity;const r=x=>x*Math.PI/180,h=Math.sin(r(b.latitude-a.latitude)/2)**2+Math.cos(r(a.latitude))*Math.cos(r(b.latitude))*Math.sin(r(b.longitude-a.longitude)/2)**2;return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))};
  function zone(trip){const candidate=trip?.timeZone||trip?.timezone||trip?.destination?.timeZone||trip?.destination?.timezone;try{if(candidate){new Intl.DateTimeFormat('de',{timeZone:candidate});return candidate}}catch{}return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}
  function localParts(value,timeZone){return Object.fromEntries(new Intl.DateTimeFormat('sv-SE',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(p=>[p.type,p.value]))}
  function localDate(value,timeZone){const p=localParts(value,timeZone);return `${p.year}-${p.month}-${p.day}`}
  function localTime(value,timeZone){const p=localParts(value,timeZone);return `${p.hour}:${p.minute}`}
  function instant(date,time,timeZone){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return null;
    const target=Date.parse(`${date}T${time}:00Z`);if(!Number.isFinite(target))return null;
    let value=target;for(let n=0;n<3;n++){const p=localParts(value,timeZone),represented=Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00Z`);value+=target-represented}
    return localDate(value,timeZone)===date&&localTime(value,timeZone)===time?new Date(value).toISOString():null;
  }
  const dateLabel=date=>new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
  const activeEntry=e=>!/(cancelled|canceled|storniert|declined)/i.test(text(e?.metadata?.bookingStatus||e?.status));
  const scheduledEntry=e=>activeEntry(e)&&!/visited|memory|photo/i.test(text(e?.kind))&&!(Date.parse(e?.endAt)-Date.parse(e?.startAt)>18*3600000&&/hotel|lodging|accommodation|stay/i.test(text(e?.entityType)));
  function freeWindow(entries,startAt,minutes=90){
    const start=Date.parse(startAt);if(!Number.isFinite(start))return{available:false,reason:'Bitte eine gültige Startzeit wählen.'};
    const rows=(entries||[]).filter(scheduledEntry).filter(e=>Number.isFinite(Date.parse(e.startAt))).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt));
    const unknownEnd=rows.find(e=>Date.parse(e.startAt)<=start&&!Number.isFinite(Date.parse(e.endAt)));
    if(unknownEnd)return{available:false,reason:`Für „${unknownEnd.title}“ fehlt die Endzeit. Bitte in der Timeline ergänzen.`};
    const ongoing=rows.find(e=>Date.parse(e.startAt)<=start&&Date.parse(e.endAt)>start);
    if(ongoing)return{available:false,reason:`Zu dieser Zeit läuft „${ongoing.title}“. Wähle eine Zeit danach.`};
    const next=rows.find(e=>Date.parse(e.startAt)>start),end=Math.min(start+Math.max(0,minutes)*60000,next?Date.parse(next.startAt):Infinity);
    const previous=rows.filter(e=>Date.parse(e.endAt)<=start).sort((a,b)=>Date.parse(b.endAt)-Date.parse(a.endAt))[0]||null;
    return{available:end>start,startAt:new Date(start).toISOString(),endAt:new Date(end).toISOString(),minutes:Math.floor((end-start)/60000),next:next||null,previous};
  }
  const groupMatches=p=>p?.groupFit?.reliable===true&&p?.travelerInsights?.length===p.groupFit.travelerCount&&p.travelerInsights.every(t=>t.reliable===true&&t.eligible===true&&t.match===true&&t.score>=60);
  function samePlannedPlace(place,entry){
    const provider=text(entry.providerPlaceId||entry.place?.providerPlaceId||entry.metadata?.providerPlaceId);if(provider&&provider===id(place))return true;
    const name=v=>text(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
    const plannedName=entry.metadata?.placeName||entry.name||text(entry.title).replace(/^.*? · /,'');
    return Boolean(name(place.name)&&name(place.name)===name(plannedName)&&distance(place,entry)<=100);
  }
  function personReason(person,place){
    if(person.eligible===false)return 'Eine verbindliche Anforderung ist nicht erfüllt.';
    const useful=(person.reasons||[]).find(reason=>!/(?:Ortsdaten greifen|Begriffe aus|keine.*Angaben|noch.*unklar|nicht.*belegt)/i.test(reason));
    const evidence=place.features?.servesVegetarianFood===true?'Vegetarische Optionen sind hinterlegt.':place.accessibilityOptions?.wheelchairAccessibleEntrance===true?'Ein rollstuhlgerechter Eingang ist bestätigt.':'';
    const positive=person.reliable?(evidence||useful||'Belegte Ortsmerkmale stimmen mit deinen Vorlieben überein.'):'Vorlieben oder Ortsangaben fehlen noch.';
    return [positive,...(person.unknowns||[]).slice(0,1)].filter(Boolean).join(' ').replace(/\bstroller\b/gi,'Kinderwagen-Zugang').replace(/\bvegetarian\b/gi,'Vegetarische Auswahl').replace(/\bwheelchair\b/gi,'Rollstuhlzugang');
  }
  function fitWindow(window,visit,outbound,inbound,buffer=10){
    if(!window?.available||outbound?.verified!==true||inbound?.verified!==true)return{verified:false,fits:false};
    const total=Number(visit)+Number(outbound.durationMinutes)+Number(inbound.durationMinutes)+buffer;
    return{verified:Number.isFinite(total),fits:Number.isFinite(total)&&total<=window.minutes,total,remaining:window.minutes-total};
  }
  const modes=[['base','Wie wäre unser Urlaub von hier aus?','Von hier aus'],['group','Passt für uns','Für uns'],['free','Wir haben noch 90 Minuten','90 Minuten'],['day','Diesen Tag erleben','Tag erleben'],['other','Heute lieber anders','Plan B']];
  // Shell resume may remount the same route. Preserve this short-lived consumer
  // projection; no Timeline, Trip or preference truth is written here.
  const uiSessions=new Map();
  ['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:profile-changed'].forEach(name=>globalThis.addEventListener?.(name,()=>uiSessions.clear()));
  function create({context,select,open,notify}){
    let host=null,mode='',date='',time='',visit=45,scenario='different',alive=true,token=0,busy=false,message='',choices=[],group=[],routes=[],window=null,comparison=[],dayIndex=0,subscription=null,timer=null,renderedMap=null,markers=[];
    const initial=context(),sessionKey=JSON.stringify([initial.trip?.id||initial.trip?.tripId,initial.surface,initial.geography]),saved=uiSessions.get(sessionKey);
    const previous=saved&&Date.now()-saved.at<120000?saved:null;
    const cache=previous?.cache||new Map();let baseTargets=previous?.baseTargets||[],resume=previous?.busy===true;
    if(previous){mode=previous.mode;date=previous.date;time=previous.time;visit=previous.visit;scenario=previous.scenario;message=previous.message;choices=previous.choices;group=previous.group;routes=previous.routes;window=previous.window;comparison=previous.comparison;dayIndex=previous.dayIndex}
    function remember(){if(uiSessions.size>=4&&!uiSessions.has(sessionKey))uiSessions.delete(uiSessions.keys().next().value);uiSessions.set(sessionKey,{at:Date.now(),mode,date,time,visit,scenario,message,choices,group,routes,window,comparison,dayIndex,busy,cache,baseTargets})}
    const ctx=()=>context(),journey=()=>globalThis.LuviaJourneyContractV1?.reads,places=()=>globalThis.LuviaPlacesContractV1?.reads;
    const tz=()=>zone(ctx().trip);
    function graph(){try{return journey()?.snapshot?.({trip:ctx().trip})||{days:[],entries:[]}}catch{return{days:[],entries:[]}}}
    const entries=()=>{const tripId=text(ctx().trip?.id||ctx().trip?.tripId);return(graph().entries||[]).filter(e=>!e.tripId||e.tripId===tripId)};
    const dates=()=>{const g=graph(),trip=ctx().trip,start=text(trip?.startDate||trip?.start_date).slice(0,10),end=text(trip?.endDate||trip?.end_date).slice(0,10),values=(g.days||[]).map(d=>d.date).filter(d=>(!start||d>=start)&&(!end||d<=end));return values.length?values:[start||localDate(Date.now(),tz())]};
    const dayEntries=()=>entries().filter(e=>e.startAt&&localDate(e.startAt,tz())===date&&activeEntry(e)).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt));
    function initDate(){const all=dates(),today=localDate(Date.now(),tz());if(!all.includes(date))date=all.includes(today)?today:all[0];if(!time)time=date===today?localTime(Date.now(),tz()):'10:00'}
    function clearMap(){for(const m of markers)m.remove?.();markers=[];if(renderedMap){try{if(renderedMap.getLayer('luvia-trip-walk'))renderedMap.removeLayer('luvia-trip-walk');if(renderedMap.getSource('luvia-trip-walk'))renderedMap.removeSource('luvia-trip-walk')}catch{}}renderedMap=null}
    function paintMap(){
      clearMap();const map=ctx().map;if(!map||!map.isStyleLoaded?.()||!mode)return;renderedMap=map;
      const features=routes.filter(r=>r?.geometry).map(r=>({type:'Feature',properties:{},geometry:r.geometry}));
      if(features.length){map.addSource('luvia-trip-walk',{type:'geojson',data:{type:'FeatureCollection',features}});map.addLayer({id:'luvia-trip-walk',type:'line',source:'luvia-trip-walk',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#2c93a9','line-width':5,'line-opacity':.8}})}
      const rows=mode==='day'?dayEntries():choices.map(c=>c.place||c);
      rows.forEach((row,index)=>{if(!point(row)||!globalThis.maplibregl?.Marker)return;const button=document.createElement('button');button.type='button';button.className='lv-trip-map-stop';button.textContent=String(index+1);button.title=row.title||row.name||`Stopp ${index+1}`;button.setAttribute('aria-label',button.title);button.onclick=()=>{if(mode==='day'){dayIndex=index;render();focusEntry(index)}else{select?.(id(row));openChoice(index)}};markers.push(new globalThis.maplibregl.Marker({element:button,anchor:'bottom'}).setLngLat(lngLat(row)).addTo(map))});
    }
    function focusEntry(index){const row=dayEntries()[index],map=ctx().map;if(point(row)&&map)map.easeTo({center:lngLat(row),zoom:15,pitch:map.getPitch(),duration:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?0:450})}
    const status=()=>`<p class="lv-trip-map-note" role="status">${esc(message||'')}</p>`;
    const button=(action,label,disabled=false)=>`<button type="button" data-trip-map-action="${esc(action)}" ${disabled?'disabled':''}>${esc(label)}</button>`;
    function dayPicker(){return `<label>Reisetag<select data-trip-map-input="date" aria-label="Reisetag">${dates().map(d=>`<option value="${esc(d)}" ${date===d?'selected':''}>${esc(dateLabel(d))}</option>`).join('')}</select></label>`}
    function card(choice,index){const p=choice.place||choice,photo=(p.photos||[]).find(x=>/^https:\/\//.test(x.uri||x.url||'')),fit=groupMatches(p),insights=p.travelerInsights||[];return `<article class="lv-trip-map-card">${photo?`<img src="${esc(photo.uri||photo.url)}" alt="${esc(p.name)}" loading="lazy">`:''}<div><small>${index+1} · ${fit?'Passt für uns':esc(choice.label||'Zum Entdecken')}</small><h3>${esc(p.name||p.title)}</h3>${photo?.attribution?`<small>${esc(photo.attribution)}</small>`:''}<p>${esc(choice.detail||p.formattedAddress||p.address||'')}</p>${insights.length?`<ul class="lv-trip-map-people">${insights.map(t=>`<li><b>${esc(t.name)}</b> · ${esc(personReason(t,p))}</li>`).join('')}</ul>`:''}${choice.fit?`<p>${choice.fit.fits?`Zeitlich möglich · ${choice.fit.total} Min. mit Wegen und Puffer`:'Zu knapp für dieses Zeitfenster'}</p>`:''}${button(`open:${index}`,p.timelineEntry?'Geplanten Stopp bearbeiten':'Ansehen & planen')}</div></article>`}
    function content(){
      const current=ctx().selected;
      if(mode==='base')return `<p>Was erreicht ihr von <strong>${esc(current?.name||'diesem Ausgangspunkt')}</strong> aus? Vergleicht Fußwege zu euren geplanten Stopps und passenden Orten.</p>${button('discover',busy?'Umgebung wird geprüft …':'Umgebung & Fußwege prüfen',busy||!point(current))}${comparison.length?`<div class="lv-trip-map-comparison">${comparison.map(c=>`<p><strong>${esc(c.name)}</strong><br>${c.count} geprüfte Ziele · im Mittel ${c.average} Min. zu Fuß</p>`).join('')}</div>`:''}`;
      if(mode==='group')return `<p>Wir prüfen die freigegebenen Vorlieben jeder mitreisenden Person. Fehlende Angaben und widersprechende Anforderungen bleiben sichtbar.</p>${button('discover',busy?'Vorlieben werden geprüft …':'Sichtbare Orte für uns prüfen',busy)}${group.length?`<p>${group.filter(groupMatches).length} von ${group.length} Orten passen nach den belegten Angaben zu allen erfassten Reisenden.</p>`:''}`;
      if(mode==='free')return `<p>Freie Zeit aus eurer Timeline: Hinweg, Aufenthalt, Weg zum nächsten Termin und 10 Minuten Puffer werden zusammen geprüft.</p><div class="lv-trip-map-fields">${dayPicker()}<label>Start um<input data-trip-map-input="time" type="time" value="${esc(time)}" aria-label="Startzeit"></label><label>Aufenthalt<select data-trip-map-input="visit" aria-label="Aufenthaltsdauer">${[30,45,60].map(n=>`<option value="${n}" ${visit===n?'selected':''}>${n} Minuten</option>`).join('')}</select></label></div><small>Zeitzone: ${esc(tz())}. ${ctx().trip?.timeZone||ctx().trip?.destination?.timeZone?'':'Es gilt die Gerätezeitzone.'}</small>${window?.available?`<p><strong>${window.minutes} Minuten verfügbar</strong> · ${esc(localTime(window.startAt,tz()))}–${esc(localTime(window.endAt,tz()))}${window.next?` · danach ${esc(window.next.title)}`:' · Rückweg zum Startpunkt'}</p>`:''}${button('discover',busy?'Wege werden geprüft …':'Zeitfenster & Orte prüfen',busy)}`;
      if(mode==='day'){const rows=dayEntries();return `<div class="lv-trip-map-fields">${dayPicker()}${button('previous-day','Voriger Tag',dates().indexOf(date)===0)}${button('next-day','Nächster Tag',dates().indexOf(date)===dates().length-1)}</div>${rows.length?`<ol class="lv-trip-map-day">${rows.map((e,i)=>`<li class="${i===dayIndex?'is-current':''}">${button(`stop:${i}`,`${localTime(e.startAt,tz())} · ${e.title}`)}<small>${point(e)?'Auf der Karte ansehen':'Ort noch nicht verknüpft'}${e.endAt?` · bis ${localTime(e.endAt,tz())}`:' · Endzeit fehlt'}</small></li>`).join('')}</ol>${button('next-stop','Nächsten Stopp erleben',dayIndex>=rows.length-1)} ${button('day-routes',busy?'Tageswege werden geladen …':'Fußwege des Tages prüfen',busy||rows.length<2)}`:'<p>Dieser Reisetag ist noch frei. Unter „90 Minuten“ oder „Plan B“ könnt ihr einen ersten Ort auswählen.</p>'}`}
      if(mode==='other')return `<p>Eine andere Idee für ${esc(dateLabel(date))}. Wählt euren Anlass; bestehende Termine bleiben stehen, bis ihr selbst eine Änderung plant.</p><div class="lv-trip-map-fields">${dayPicker()}<label>Worauf habt ihr Lust?<select data-trip-map-input="scenario" aria-label="Alternative wählen"><option value="different" ${scenario==='different'?'selected':''}>Etwas Neues</option><option value="calm" ${scenario==='calm'?'selected':''}>Mehr Ruhe</option><option value="rain" ${scenario==='rain'?'selected':''}>Lieber drinnen</option></select></label></div>${scenario==='rain'?'<small>Von euch gewählter Anlass, keine Wettervorhersage. Öffnung und Eignung vor dem Besuch prüfen.</small>':''}${button('discover',busy?'Alternativen werden gesucht …':'Andere Ideen finden',busy)}`;
      return '';
    }
    function render(){if(!host||!alive)return;initDate();host.innerHTML=`<nav class="lv-trip-map-tabs" aria-label="Urlaub mit der Karte entdecken">${modes.map(([key,label,short])=>`<button type="button" data-trip-map-action="mode:${key}" aria-label="${label}" aria-pressed="${mode===key}">${esc(short)}</button>`).join('')}</nav>${mode?`<section class="lv-trip-map-panel" aria-label="${esc(modes.find(m=>m[0]===mode)?.[1])}" aria-busy="${busy}"><div class="lv-trip-map-title"><h2>${esc(modes.find(m=>m[0]===mode)?.[1])}</h2>${button('close','Schließen')}</div>${content()}${status()}<div class="lv-trip-map-cards">${choices.map(card).join('')}</div></section>`:''}`}
    async function candidates(category){
      const c=ctx(),key=JSON.stringify([c.trip?.id,c.geography,category]);if(cache.has(key))return cache.get(key);
      const request=places().recommend({trip:c.trip,destination:c.geography,destinationContext:c.geography,strictDestination:true,maxDistanceMeters:c.geography.searchRadiusMeters||3000,category,query:category==='culture'?'Kultur':category==='nature'?'Natur':'Restaurant',userQuery:'',subjectText:'',providers:['geoapify'],fastPath:true,fastQueryLimit:1,parallelFastQueries:false,limit:30,candidateLimit:30,profilePreferences:{}}).then(result=>result?.places||result?.data?.places||[]).catch(error=>{cache.delete(key);throw error});cache.set(key,request);return request;
    }
    async function discover(){
      const run=++token,chosenMode=mode,base=ctx().selected;busy=true;message='';choices=[];routes=[];render();clearMap();
      try{
        if(chosenMode==='group'){
          const ranked=await globalThis.LuviaJourneySuggestions.assessGroup(ctx().results,{trip:ctx().trip,targetDate:date});if(run!==token||!alive)return;
          group=ranked;choices=[...ranked].sort((a,b)=>Number(groupMatches(b))-Number(groupMatches(a))).slice(0,12).map(place=>({place,label:groupMatches(place)?'Passt für uns':'Passung noch offen'}));
          message=ranked.length?'Für die Prüfung wurden keine zusätzlichen Orts- oder KI-Abfragen benötigt.':'Wählt zunächst eine Kategorie mit Orten.';
        }else if(chosenMode==='day'){await dayRoutes(run);return}
        else{
          const category=chosenMode==='other'?(scenario==='rain'?'culture':scenario==='calm'?'nature':ctx().category==='food'?'culture':'food'):'food';
          let rows=await candidates(category);if(run!==token||!alive)return;
          rows=await globalThis.LuviaJourneySuggestions.assessGroup(rows,{trip:ctx().trip,targetDate:date});if(run!==token||!alive)return;
          const planned=dayEntries();
          rows=rows.filter(p=>point(p)&&!(p.travelerInsights||[]).some(t=>t.eligible===false));
          if(chosenMode==='other'){
            rows=rows.filter(p=>!planned.some(e=>samePlannedPlace(p,e)));
            if(scenario==='rain')rows=rows.filter(p=>(p.types||[]).some(t=>['movie_theater','art_gallery','performing_arts_theater','museum'].includes(t)));
            if(scenario==='calm')rows=rows.filter(p=>(p.types||[]).some(t=>['park','garden','beach','spa'].includes(t)));
            choices=rows.sort((a,b)=>Number(groupMatches(b))-Number(groupMatches(a))).slice(0,6).map(place=>({place,label:scenario==='rain'?'Idee für drinnen':scenario==='calm'?'Zeit zum Durchatmen':'Etwas anderes'}));message=choices.length?'Wählt einen Ort, um ihn für diesen Reisetag zu planen.':'Für diesen Anlass fehlen derzeit belegte Alternativen im Reisegebiet.';
          }else{
            let origin=point(base)||point(ctx().geography),returnTo=origin;
            if(chosenMode==='free'){
              rows=rows.filter(p=>!planned.some(e=>samePlannedPlace(p,e)));
              const midnight=Date.parse(instant(date,'00:00',tz()));
              window=freeWindow(entries().filter(e=>Date.parse(e.endAt||e.startAt)>=midnight),instant(date,time,tz()),90);
              if(!window.available){message=window.reason;return}
              if(window.previous){origin=point(window.previous);if(!origin){message=`Für den vorherigen Termin „${window.previous.title}“ fehlt der Ort. Bitte in der Timeline ergänzen.`;return}}
              if(window.next){returnTo=point(window.next);if(!returnTo){message=`Für „${window.next.title}“ fehlt der Ort. Ohne ihn ist der Anschlussweg nicht prüfbar.`;return}}else returnTo=origin;
              if(!origin){message='Bitte zuerst einen Ausgangspunkt auf der Karte wählen.';return}
            }
            if(!origin){message='Bitte zuerst eine Unterkunft oder einen Ausgangspunkt wählen.';return}
            const plannedPlaces=chosenMode==='base'?entries().filter(scheduledEntry).filter(e=>point(e)&&dates().includes(localDate(e.startAt,tz()))).map(e=>({id:`timeline:${e.id}`,name:e.title,coordinates:point(e),timelineEntry:e})):[];
            const unique=new Map([...plannedPlaces,...rows.filter(p=>!plannedPlaces.some(entry=>samePlannedPlace(p,entry.timelineEntry)))].filter(p=>id(p)!==id(base)).map(p=>[id(p),p]));
            const shortlist=chosenMode==='base'&&baseTargets.length?baseTargets:[...unique.values()].sort((a,b)=>Number(Boolean(b.timelineEntry))-Number(Boolean(a.timelineEntry))||Number(groupMatches(b))-Number(groupMatches(a))||distance(origin,a)-distance(origin,b)).slice(0,chosenMode==='free'?3:4);
            if(chosenMode==='base'&&!baseTargets.length)baseTargets=shortlist;
            const checked=[];
            for(const place of shortlist){
              if(run!==token||!alive)return;
              try{const outbound=await places().getRoute(origin,point(place));if(run!==token||!alive)return;
                const inbound=chosenMode==='free'?await places().getRoute(point(place),returnTo):null;if(run!==token||!alive)return;
                const fit=chosenMode==='free'?fitWindow(window,visit,outbound,inbound):null;
                checked.push({place,label:groupMatches(place)?'Passt für uns':'Passung bitte prüfen',detail:`${outbound.durationMinutes} Min. zu Fuß · ${(outbound.distanceMeters/1000).toFixed(1).replace('.',',')} km${inbound?` · ${inbound.durationMinutes} Min. ${window.next?'zum nächsten Termin':'zurück'}`:''}`,fit,outbound,inbound});
              }catch{checked.push({place,label:'Weg derzeit nicht prüfbar',detail:'Bitte den Weg vor dem Einplanen prüfen.'})}
            }
            choices=chosenMode==='free'?checked.filter(c=>c.fit?.fits):checked;routes=choices.flatMap(c=>[c.outbound,c.inbound]).filter(Boolean);
            if(chosenMode==='base'&&checked.some(c=>c.outbound)){const valid=checked.filter(c=>c.outbound);comparison=[...comparison.filter(c=>c.id!==id(base)),{id:id(base),name:base?.name||'Ausgangspunkt',count:valid.length,average:Math.round(valid.reduce((sum,c)=>sum+c.outbound.durationMinutes,0)/valid.length)}].slice(-2)}
            message=chosenMode==='free'?(choices.length?`${choices.length} zeitlich mögliche Ideen. Öffnung, Eintritt und persönliche Eignung vor dem Planen prüfen.`:'Unter den geprüften nahen Orten passt aktuell keiner nachweislich in dieses Zeitfenster. Aufenthaltsdauer oder Startzeit ändern.'):'Fußwege von Geoapify. Der Vergleich umfasst die hier aufgeführten Ziele; er bewertet keine unbekannten Ortsmerkmale.';
          }
        }
      }catch{if(run===token)message='Die Prüfung ist gerade nicht vollständig möglich. Bitte erneut versuchen.'}
      finally{if(run===token&&alive){busy=false;render();paintMap()}}
    }
    async function dayRoutes(existingToken){
      const run=existingToken||++token;busy=true;routes=[];message='';render();const rows=dayEntries(),failures=[];
      try{for(let i=1;i<Math.min(rows.length,21);i++){if(run!==token||!alive)return;if(!point(rows[i-1])||!point(rows[i])){failures.push(i);continue}try{const route=await places().getRoute(point(rows[i-1]),point(rows[i]));if(run!==token||!alive)return;routes.push(route)}catch{failures.push(i)}}
        if(run===token)message=`${routes.length} ${routes.length===1?'Fußweg':'Fußwege'} geprüft · insgesamt ${routes.reduce((sum,r)=>sum+r.durationMinutes,0)} Min.${failures.length?' · Für einzelne Abschnitte fehlen Orte oder Routen.':''}${rows.length>21?' Weitere Abschnitte wurden noch nicht geprüft.':''}`;
      }finally{if(run===token&&alive){busy=false;render();paintMap()}}
    }
    function invalidate(){++token;busy=false;choices=[];routes=[];group=[];window=null;message='';dayIndex=0;clearMap()}
    function openChoice(index){const choice=choices[index];if(!choice)return;const p=choice.place||choice;if(p.timelineEntry){journey()?.getEntry?.(p.timelineEntry.id);globalThis.LuviaJourneyContractV1?.commands?.editEntry?.(p.timelineEntry);return}open?.(p,{targetDate:date,...(mode==='free'&&choice.fit?.fits?{startAt:new Date(Date.parse(window.startAt)+choice.outbound.durationMinutes*60000).toISOString(),endAt:new Date(Date.parse(window.startAt)+(choice.outbound.durationMinutes+visit)*60000).toISOString()}: {})})}
    function click(event){const target=event.target.closest?.('[data-trip-map-action]');if(!target||!host.contains(target))return;const [action,value]=target.dataset.tripMapAction.split(':');
      if(action==='mode'){invalidate();mode=mode===value?'':value;initDate();render();paintMap();return}
      if(action==='close'){invalidate();mode='';render();return}
      if(action==='discover'){discover();return}if(action==='day-routes'){dayRoutes();return}
      if(action==='open'){openChoice(Number(value));return}if(action==='stop'){dayIndex=Number(value);render();focusEntry(dayIndex);return}
      if(action==='next-stop'){dayIndex=Math.min(dayEntries().length-1,dayIndex+1);render();focusEntry(dayIndex);return}
      if(action==='previous-day'||action==='next-day'){const all=dates();date=all[Math.max(0,Math.min(all.length-1,all.indexOf(date)+(action==='next-day'?1:-1)))];invalidate();render();paintMap()}
    }
    function change(event){const key=event.target.dataset.tripMapInput;if(!key)return;const value=event.target.value;if(key==='date')date=value;if(key==='time')time=value;if(key==='visit')visit=Number(value);if(key==='scenario')scenario=value;invalidate();render();paintMap()}
    const journeyFingerprint=()=>JSON.stringify(entries().map(e=>[e.id,e.title,e.startAt,e.endAt,e.status,e.metadata?.bookingStatus,point(e)]));
    let lastJourney=journeyFingerprint();
    try{subscription=journey()?.subscribe?.(()=>{if(!alive)return;const current=journeyFingerprint();if(current===lastJourney)return;lastJourney=current;invalidate();message=mode?'Die Timeline wurde aktualisiert. Bitte die Vorschläge erneut prüfen.':'';render();paintMap()})}catch{}
    timer=setInterval(()=>{if(mode==='free'&&date===localDate(Date.now(),tz())&&window&&Date.parse(window.startAt)<Date.now()){invalidate();time=localTime(Date.now(),tz());message='Die Startzeit ist vergangen. Bitte das aktuelle Zeitfenster erneut prüfen.';render()}},60000);
    return Object.freeze({attach(node){if(host){host.removeEventListener('click',click);host.removeEventListener('change',change)}host=node;if(host){host.addEventListener('click',click);host.addEventListener('change',change);render();if(resume){resume=false;queueMicrotask(()=>{if(alive&&mode)discover()})}}},selectionChanged(){if(mode==='base'){invalidate();render()}},resultsChanged(){if(mode==='group'){invalidate();render()}},paintMap,destroy(){remember();alive=false;++token;clearInterval(timer);subscription?.();clearMap();if(host){host.removeEventListener('click',click);host.removeEventListener('change',change)}host=null}});
  }
  globalThis.LuviaTripMapExperiences=Object.freeze({version:'1.0.1',create,freeWindow,fitWindow,groupMatches,samePlannedPlace,personReason,instant,localDate,point});
})();
