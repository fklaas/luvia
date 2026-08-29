(()=>{
'use strict';

const VERSION='1.2.0';
const boundRoots=new WeakSet();
let dayHandle=null;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const contract=()=>globalThis.LuviaJourneyContractV1||(()=>{throw new Error('Journey Contract v1 fehlt.')})();
const experience=()=>globalThis.LuviaExperienceContractV1||null;
const fmtDate=value=>new Date(`${value}T12:00:00`).toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'short'});
const fmtLongDate=value=>new Date(`${value}T12:00:00`).toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
const fmtTime=value=>value?new Date(value).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'Offen';
const icon=entry=>({restaurant:'🍽️',accommodation:'🏨',attraction:'🏛️',activity:'🎟️',photo_spot:'📸',photo_memory:'✦',shopping:'🛍️',nature:'🌿',mobility:'🚉'}[entry?.entityType]||'⌖');
const statusCopy=Object.freeze({attention:'Konflikt prüfen',live:'Heute',planned:'Geplant',open:'Noch offen'});
function currentProjection(trip){return contract().reads.snapshot({trip})}
function dayCard(day,esc){
  const first=day.entries[0],last=day.entries.at(-1),windowCopy=day.entries.length?`${fmtTime(first.startAt)}–${fmtTime(last.endAt)}`:'Freiraum';
  return`<button class="lvj-day is-${esc(day.status)}" type="button" data-journey-date="${esc(day.date)}" aria-label="${esc(fmtLongDate(day.date))}, ${esc(statusCopy[day.status])}"><span class="lvj-day-date"><small>${esc(fmtDate(day.date).split(' ')[0])}</small><strong>${esc(new Date(`${day.date}T12:00:00`).getDate())}</strong><em>${esc(new Date(`${day.date}T12:00:00`).toLocaleDateString('de-DE',{month:'short'}))}</em></span><span class="lvj-day-state">${day.conflicts.length?`<i aria-hidden="true">!</i>${day.conflicts.length} Konflikt${day.conflicts.length===1?'':'e'}`:`${day.entries.length} ${day.entries.length===1?'Moment':'Momente'}`}</span><span class="lvj-day-window">${esc(windowCopy)}</span><small class="lvj-day-open">${day.openGaps?.length||0} ${day.openGaps?.length===1?'offenes Zeitfenster':'offene Zeitfenster'}</small></button>`;
}
function renderCalendar(trip,esc=escapeHtml){
  const view=currentProjection(trip),summary=view.summary,next=view.nextEntry;
  return`<section class="lvj-composer" data-journey-composer data-journey-contract="${view.contractId}" data-luvia-experience-component="card"><header class="lvj-header"><div><span class="lvj-kicker">Eure Timeline</span><h2>Tag für Tag, klar im Blick</h2><p>${next?`Als Nächstes: <strong>${esc(next.title)}</strong> um ${esc(fmtTime(next.startAt))} Uhr.`:'Eure Tage warten auf die ersten gemeinsamen Pläne.'}</p></div><div class="lvj-metrics" aria-label="Timeline Übersicht"><span><b>${summary.plannedDayCount}</b> geplant</span><span class="${summary.conflictCount?'is-attention':''}"><b>${summary.conflictCount}</b> Konflikte</span><button type="button" data-ai-ask-open data-luvia-experience-component="commandSurface"><i aria-hidden="true">✦</i> Mit Luvia planen</button></div></header><div class="lvj-days" role="list" aria-label="Reisetage">${view.days.map(day=>dayCard(day,esc)).join('')||'<p class="lvj-empty">Sobald der Reisezeitraum feststeht, entsteht hier eure Timeline.</p>'}</div><footer><span>${summary.entryCount} bestätigte und erlebte Momente</span><span>Änderungen bleiben bis zu eurer Bestätigung Vorschläge.</span></footer></section>`;
}
function entryMarkup(entry,esc){
  const owner=entry.provenance.owner,editable=['journey','places'].includes(owner),memory=owner==='media'||entry.kind==='photo_memory';
  return`<article class="lvj-entry" data-owner="${esc(owner)}"><time datetime="${esc(entry.startAt)}">${esc(fmtTime(entry.startAt))}</time><span class="lvj-entry-route" aria-hidden="true"><i></i></span><div class="lvj-entry-card"><span class="lvj-entry-icon" aria-hidden="true">${icon(entry)}</span><div><small>${esc(owner)} · ${esc(entry.provenance.sourceContract)}</small><h3>${esc(entry.title)}</h3><p>${esc(entry.durationMinutes)} Minuten${entry.automatic?' · automatisch erfasst':''}</p></div><div class="lvj-entry-actions"><button type="button" data-journey-entry-open="${esc(entry.id)}">${memory?'Erinnerung':'Ort'} öffnen</button>${editable?`<button type="button" data-journey-entry-edit="${esc(entry.id)}">Zeit ändern</button>`:''}</div></div></article>`;
}
function timelinePhoto(trip={},entry={}){
  const direct=entry.metadata?.imageUrl||entry.metadata?.photoUrl||entry.metadata?.coverUrl;
  if(direct)return direct;
  const destination=String(trip.destination?.name||trip.destination?.formattedAddress||trip.destinationName||'').toLowerCase();
  if(/kopenhagen|copenhagen/.test(destination))return'assets/public-landing/travel-copenhagen.webp';
  if(/lissabon|lisbon/.test(destination))return'assets/public-landing/travel-lisbon.webp';
  if(/alpen|berg|dolomit|tirol|braies/.test(destination))return'assets/public-landing/travel-pragser-wildsee.webp';
  if(/japan/.test(destination))return'assets/public-landing/travel-rural-japan.webp';
  return'assets/public-landing/travel-warnemuende.webp';
}
function timelineEntry(entry,trip,esc){
  const owner=entry.provenance.owner,memory=owner==='media'||entry.kind==='photo_memory',photo=timelinePhoto(trip,entry);
  return`<article class="lvjt-entry" data-owner="${esc(owner)}"><time datetime="${esc(entry.startAt)}">${esc(fmtTime(entry.startAt))}</time><span class="lvjt-line" aria-hidden="true"><i></i></span><div class="lvjt-entry-card"><img src="${esc(photo)}" alt="" loading="lazy" decoding="async"><div><small>${memory?'Erlebt · Memory bereit':`${esc(entry.entityType)} · ${esc(owner)}`}</small><h3>${esc(entry.title)}</h3><p>${esc(entry.description||`${entry.durationMinutes} Minuten in eurem bestätigten Tagesplan.`)}</p><span class="lvjt-entry-meta">${esc(entry.durationMinutes)} Min. · ${esc(entry.provenance.sourceContract)}</span><button type="button" data-journey-entry-open="${esc(entry.id)}">${memory?'Moment bewahren':'Details öffnen'} →</button></div></div></article>`;
}
function timelineGap(gap,date,esc){
  return`<article class="lvjt-gap"><time>${esc(fmtTime(gap.startAt))}</time><span class="lvjt-line" aria-hidden="true"><i>✦</i></span><div><small>${esc(gap.durationMinutes)} Minuten zwischen euren bestätigten Momenten</small><h3>Dazwischen ist Raum für euch.</h3><p>Luvia kann drei konkrete, fachlich geprüfte Möglichkeiten vorbereiten. Orte, Profil, Reisegefühl und der restliche Tag werden gemeinsam betrachtet; ohne eure Bestätigung bleibt alles unverändert.</p><button type="button" data-journey-discover="${esc(date)}" data-journey-start="${esc(gap.startAt)}" data-journey-end="${esc(gap.endAt)}">Luvias Vorschläge öffnen →</button></div></article>`;
}
function timelineDayPanel(day,trip,esc,index){
  const flow=[...day.entries.map(entry=>({at:entry.startAt,html:timelineEntry(entry,trip,esc)})),...(day.openGaps||[]).slice(0,2).map(gap=>({at:gap.startAt,html:timelineGap(gap,day.date,esc)}))].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
  return`<section class="lvjt-day-panel ${index===0?'is-active':''}" data-timeline-day="${esc(day.date)}" ${index===0?'':'hidden'}><div class="lvjt-day-flow">${flow.map(item=>item.html).join('')||`<article class="lvjt-empty"><span>✦</span><h3>Dieser Tag gehört noch euch.</h3><p>Noch ist kein Moment bestätigt. Luvia kann drei reale Möglichkeiten vorbereiten, die zu euch, dem Ort und dem übrigen Reiseplan passen.</p><button type="button" data-journey-discover="${esc(day.date)}">Luvias Vorschläge öffnen</button></article>`}</div><aside class="lvjt-rail"><article class="lvjt-pulse"><small>Luvia Day Pulse</small><h3>${day.conflicts.length?'Dieser Tag braucht eine Entscheidung.':'Euer Tag hat noch Luft.'}</h3><p>${day.conflicts.length?`${day.conflicts.length} Konflikt${day.conflicts.length===1?'':'e'} bleiben sichtbar, bis ihr sie löst.`:`${day.summary.entryCount} bestätigte ${day.summary.entryCount===1?'Station':'Stationen'} · ${Math.round(day.summary.openMinutes/60*10)/10} Stunden noch offen.`}</p></article><article><small>Was hier zusammenläuft</small><h3>Pläne, Buchungen und Erlebnisse.</h3><p>Alles erscheint in zeitlicher Reihenfolge. Wenn sich etwas ändert, bleibt der ursprüngliche Eintrag nachvollziehbar.</p></article><article><small>Ihr behaltet die Kontrolle</small><h3>Luvia schlägt vor. Ihr entscheidet.</h3><p>Erst eine ausdrücklich bestätigte Auswahl verändert eure Reise.</p></article></aside></section>`;
}
function renderTimeline(trip,esc=escapeHtml){
  const view=currentProjection(trip),days=view.days||[],selected=days.find(day=>day.status==='live')||days[0]||null;
  const ordered=days;
  const destination=trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||'eurem Reiseziel';
  return`<section class="lvjt-surface" data-journey-timeline data-journey-contract="${view.contractId}" aria-labelledby="lvjt-title"><header class="lvjt-intro"><button type="button" data-view="today">← Heute</button><span>Timeline · ${selected?esc(fmtLongDate(selected.date)):'Reisezeitraum offen'}</span><h1 id="lvjt-title">Eure Reise.<br>Moment für Moment.</h1></header><section class="lvjt-compass-banner"><span class="lvjt-compass" aria-hidden="true"><img src="assets/brand/luvia-living-compass/layers/face.svg" alt=""><img class="is-needle" src="assets/brand/luvia-living-compass/layers/two-ended-needle.svg" alt=""><img src="assets/brand/luvia-living-compass/layers/hub.svg" alt=""></span><div><small>${esc(String(destination).split(',')[0])} · Living Journey</small><h2>Bestätigte Pläne, echte Erlebnisse und freie Zeit in einer Linie.</h2><p>Buchungen, geplante Orte, bestätigte Besuche und Erinnerungen erscheinen automatisch an der richtigen Stelle. Luvia markiert nur dort Möglichkeiten, wo tatsächlich Raum ist.</p></div><button class="lvjt-compass-action" type="button" data-journey-discover="${esc(selected?.date||'')}" data-journey-start="${esc(selected?.openGaps?.[0]?.startAt||'')}">✦ Drei Vorschläge für diesen Tag</button></section><nav class="lvjt-date-rail" aria-label="Reisetage">${ordered.map(day=>{const active=day.date===selected?.date;return`<button class="${active?'is-active':''}" type="button" data-timeline-date="${esc(day.date)}" aria-pressed="${active?'true':'false'}"><small>${esc(fmtDate(day.date).split(' ')[0])}</small><strong>${new Date(`${day.date}T12:00:00`).getDate()}</strong><span>${day.status==='live'?'Heute':day.entries[0]?.title||'Offen'}</span></button>`}).join('')||'<span>Der Reisezeitraum ist noch offen.</span>'}</nav><div class="lvjt-context"><span><small>Ausgewählter Tag</small><strong>${selected?esc(fmtLongDate(selected.date)):esc(destination)}</strong></span><span><small>Bestätigt</small><strong>${selected?.summary?.entryCount||0} ${selected?.summary?.entryCount===1?'Moment':'Momente'}</strong></span><span><small>Noch offen</small><strong>${Math.round((selected?.summary?.openMinutes||0)/60*10)/10} Stunden</strong></span><span><small>Aufmerksamkeit</small><strong>${selected?.conflicts?.length?`${selected.conflicts.length} prüfen`:'Alles klar'}</strong></span></div>${ordered.map(day=>timelineDayPanel(day,trip,esc,day.date===selected?.date?0:1)).join('')||timelineDayPanel({date:new Date().toISOString().slice(0,10),entries:[],openGaps:[],conflicts:[],summary:{entryCount:0,openGapCount:0,openMinutes:840}},trip,esc,0)}</section>`;
}
function openWindowMarkup(window,date,esc){return`<article class="lvj-open-window"><time>${esc(fmtTime(window.startAt))}–${esc(fmtTime(window.endAt))}</time><span aria-hidden="true">✦</span><div><small>Noch offen · ${esc(window.durationMinutes)} Minuten</small><h3>Raum für einen passenden Moment</h3><p>Luvia kann drei echte Möglichkeiten aus Places, Profil, Reisegefühl und diesem Zeitfenster zusammenführen.</p><button type="button" data-journey-discover="${esc(date)}" data-journey-start="${esc(window.startAt)}" data-journey-end="${esc(window.endAt)}">Luvias Vorschläge öffnen</button></div></article>`}
function conflictMarkup(conflict,esc){
  const minutes=conflict.overlapMinutes??conflict.availableMinutes;
  return`<article class="lvj-conflict" role="status"><span aria-hidden="true">!</span><div><strong>${conflict.kind==='overlap'?'Zwei Pläne überschneiden sich':'Der Übergang ist sehr knapp'}</strong><p>${conflict.kind==='overlap'?`${minutes} Minuten Überschneidung.`:`Nur ${minutes} Minuten bis zum nächsten Programmpunkt.`} Luvia kann Alternativen vorbereiten; geändert wird erst nach eurer Bestätigung.</p></div><button type="button" data-ai-ask-open>Mit Luvia lösen</button></article>`;
}
function openEntry(entry,handle){
  if(entry.kind==='photo_memory'||entry.provenance.owner==='media')return contract().commands.openPhotoMemory(entry.id,handle);
  handle?.close?.('open-place');
  globalThis.dispatchEvent(new CustomEvent('luvia:open-place-request',{detail:{type:entry.entityType,placeId:entry.place.placeId,tripPlaceId:entry.place.tripPlaceId,providerPlaceId:entry.place.providerPlaceId,title:entry.title,returnView:'today',overlayOnly:true}}));
}
function openDay(date){
  const day=contract().reads.getDay(date);
  if(!day)return null;
  dayHandle?.close?.('replace');
  const ui=globalThis.LuviaUI;if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');
  const content=document.createElement('section');content.className='lvj-day-detail';content.dataset.journeyDay=date;content.dataset.luviaExperienceComponent='sheet';
  const flow=[...day.entries.map(item=>({at:item.startAt,html:entryMarkup(item,escapeHtml)})),...(day.openGaps||[]).map(item=>({at:item.startAt,html:openWindowMarkup(item,day.date,escapeHtml)}))].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
  content.innerHTML=`<header><div><span class="lvj-kicker">${escapeHtml(statusCopy[day.status])}</span><h2>${escapeHtml(fmtLongDate(day.date))}</h2><p>${day.summary.entryCount?`${day.summary.entryCount} Programmpunkte · ${Math.round(day.summary.plannedMinutes/60*10)/10} Stunden geplant`:'Ein freier Tag – ideal für spontane Wünsche.'}</p></div><button type="button" data-journey-close aria-label="Tagesansicht schließen">×</button></header>${day.conflicts.map(item=>conflictMarkup(item,escapeHtml)).join('')}<div class="lvj-entry-list">${flow.map(item=>item.html).join('')||'<div class="lvj-day-empty"><span aria-hidden="true">✦</span><h3>Dieser Tag gehört noch euch</h3><p>Beschreibt Luvia, worauf ihr Lust habt. Sie darf Vorschläge kombinieren, aber keine Buchung ohne Bestätigung ausführen.</p><button type="button" data-ai-ask-open>Tag mit Luvia gestalten</button></div>'}</div>`;
  const mounted=ui.mount({name:'journey.day-detail',kind:'sheet',content,className:'lvj-day-overlay',closeSelector:'[data-journey-close]',initialFocus:'[data-journey-close]',label:`Tagesplan ${fmtLongDate(day.date)}`,onClose:()=>{if(dayHandle?.id===mounted.id)dayHandle=null}});dayHandle=mounted;
  mounted.overlay.querySelectorAll('[data-journey-entry-open]').forEach(button=>button.onclick=()=>{const entry=day.entries.find(item=>item.id===button.dataset.journeyEntryOpen);if(entry)openEntry(entry,mounted)});
  mounted.overlay.querySelectorAll('[data-journey-entry-edit]').forEach(button=>button.onclick=()=>{const entry=day.entries.find(item=>item.id===button.dataset.journeyEntryEdit);if(!entry)return;mounted.close('edit-entry');contract().commands.editEntry(entry.id,updates=>{const next=Object.values(updates||{}).find(Boolean);openDay(next?String(next).slice(0,10):date)})});
  mounted.overlay.querySelectorAll('[data-journey-discover]').forEach(button=>button.onclick=()=>{const guidance=globalThis.LuviaTripPreferenceContextV1?.dayGuidance?.(contract().reads.snapshot())?.suggestion||{kind:'draft-place-discovery',requiresConfirmation:true,targetDate:button.dataset.journeyDiscover,startAt:button.dataset.journeyStart,endAt:button.dataset.journeyEnd,query:'Ein passender gemeinsamer Reisemoment'};mounted.close('open-suggestions');globalThis.LuviaJourneySuggestions?.open?.({...guidance,targetDate:button.dataset.journeyDiscover,startAt:button.dataset.journeyStart,endAt:button.dataset.journeyEnd})});
  return mounted.overlay;
}
function bindCalendar(root=document){
  if(!root||boundRoots.has(root))return;boundRoots.add(root);
  root.addEventListener('click',event=>{const button=event.target.closest?.('[data-journey-date]');if(!button||!root.contains(button))return;event.preventDefault();event.stopPropagation();openDay(button.dataset.journeyDate)});
}
function bindTimeline(root=document){
  if(!root)return;
  root.querySelectorAll('[data-timeline-date]').forEach(button=>button.addEventListener('click',()=>{
    const date=button.dataset.timelineDate;
    root.querySelectorAll('[data-timeline-date]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});
    root.querySelectorAll('[data-timeline-day]').forEach(panel=>{const active=panel.dataset.timelineDay===date;panel.hidden=!active;panel.classList.toggle('is-active',active)});
  }));
  root.querySelectorAll('[data-journey-entry-open]').forEach(button=>button.addEventListener('click',()=>{const entry=contract().reads.snapshot().entries.find(item=>item.id===button.dataset.journeyEntryOpen);if(entry)openEntry(entry,null)}));
  root.querySelectorAll('[data-journey-discover]').forEach(button=>button.addEventListener('click',()=>{const snapshot=contract().reads.snapshot(),guidance=globalThis.LuviaTripPreferenceContextV1?.dayGuidance?.(snapshot)?.suggestion||{kind:'draft-place-discovery',requiresConfirmation:true,query:'Ein passender gemeinsamer Reisemoment'};globalThis.LuviaJourneySuggestions?.open?.({...guidance,targetDate:button.dataset.journeyDiscover,startAt:button.dataset.journeyStart,endAt:button.dataset.journeyEnd})}));
}
function diagnostics(){return Object.freeze({version:VERSION,contract:contract().contractId,experience:experience()?.contractId||null,owner:'journey.day-composer',domainTruth:false,dayGraphTruth:false,overlayHost:'overlay-host.v1',minimumTouchTarget:48})}

globalThis.LuviaJourneyDayComposer=Object.freeze({version:VERSION,renderCalendar,renderTimeline,bindCalendar,bindTimeline,openDay,diagnostics});
})();
