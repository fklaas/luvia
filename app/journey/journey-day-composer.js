(()=>{
'use strict';

const VERSION='1.1.0';
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
function currentProjection(trip){return contract().snapshot({trip})}
function dayCard(day,esc){
  const first=day.entries[0],last=day.entries.at(-1),windowCopy=day.entries.length?`${fmtTime(first.startAt)}–${fmtTime(last.endAt)}`:'Freiraum';
  return`<button class="lvj-day is-${esc(day.status)}" type="button" data-journey-date="${esc(day.date)}" aria-label="${esc(fmtLongDate(day.date))}, ${esc(statusCopy[day.status])}"><span class="lvj-day-date"><small>${esc(fmtDate(day.date).split(' ')[0])}</small><strong>${esc(new Date(`${day.date}T12:00:00`).getDate())}</strong><em>${esc(new Date(`${day.date}T12:00:00`).toLocaleDateString('de-DE',{month:'short'}))}</em></span><span class="lvj-day-state">${day.conflicts.length?`<i aria-hidden="true">!</i>${day.conflicts.length} Konflikt${day.conflicts.length===1?'':'e'}`:`${day.entries.length} ${day.entries.length===1?'Moment':'Momente'}`}</span><span class="lvj-day-window">${esc(windowCopy)}</span><small class="lvj-day-open">${day.openGaps?.length||0} freie ${day.openGaps?.length===1?'Spur':'Spuren'}</small></button>`;
}
function renderCalendar(trip,esc=escapeHtml){
  const view=currentProjection(trip),summary=view.summary,next=view.nextEntry;
  return`<section class="lvj-composer" data-journey-composer data-journey-contract="${view.contractId}" data-luvia-experience-component="card"><header class="lvj-header"><div><span class="lvj-kicker">Euer Reisefluss</span><h2>Tag für Tag, klar im Blick</h2><p>${next?`Als Nächstes: <strong>${esc(next.title)}</strong> um ${esc(fmtTime(next.startAt))} Uhr.`:'Eure Tage warten auf die ersten gemeinsamen Pläne.'}</p></div><div class="lvj-metrics" aria-label="Journey Übersicht"><span><b>${summary.plannedDayCount}</b> geplant</span><span class="${summary.conflictCount?'is-attention':''}"><b>${summary.conflictCount}</b> Konflikte</span><button type="button" data-ai-ask-open data-luvia-experience-component="commandSurface"><i aria-hidden="true">✦</i> Mit Luvia planen</button></div></header><div class="lvj-days" role="list" aria-label="Reisetage">${view.days.map(day=>dayCard(day,esc)).join('')||'<p class="lvj-empty">Sobald der Reisezeitraum feststeht, entsteht hier euer Day Graph.</p>'}</div><footer><span>${summary.entryCount} Reiseereignisse aus freigegebenen Owner-Projektionen</span><span>Journey besitzt Reihenfolge &amp; Konflikte – keine fremde Domain Truth</span></footer></section>`;
}
function entryMarkup(entry,esc){
  const owner=entry.provenance.owner,editable=['journey','places'].includes(owner),memory=owner==='media'||entry.kind==='photo_memory';
  return`<article class="lvj-entry" data-owner="${esc(owner)}"><time datetime="${esc(entry.startAt)}">${esc(fmtTime(entry.startAt))}</time><span class="lvj-entry-route" aria-hidden="true"><i></i></span><div class="lvj-entry-card"><span class="lvj-entry-icon" aria-hidden="true">${icon(entry)}</span><div><small>${esc(owner)} · ${esc(entry.provenance.sourceContract)}</small><h3>${esc(entry.title)}</h3><p>${esc(entry.durationMinutes)} Minuten${entry.automatic?' · automatisch erfasst':''}</p></div><div class="lvj-entry-actions"><button type="button" data-journey-entry-open="${esc(entry.id)}">${memory?'Erinnerung':'Ort'} öffnen</button>${editable?`<button type="button" data-journey-entry-edit="${esc(entry.id)}">Zeit ändern</button>`:''}</div></div></article>`;
}
function openWindowMarkup(window,date,esc){return`<article class="lvj-open-window"><time>${esc(fmtTime(window.startAt))}–${esc(fmtTime(window.endAt))}</time><span aria-hidden="true">✦</span><div><small>Freie Spur · ${esc(window.durationMinutes)} Minuten</small><h3>Raum für einen passenden Moment</h3><p>Luvia darf passende Orte vorschlagen. Der Tagesplan ändert sich erst nach eurer Bestätigung.</p><button type="button" data-journey-discover="${esc(date)}" data-journey-start="${esc(window.startAt)}">In Places entdecken</button></div></article>`}
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
  const day=contract().getDay(date);
  if(!day)return null;
  dayHandle?.close?.('replace');
  const ui=globalThis.LuviaUI;if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');
  const content=document.createElement('section');content.className='lvj-day-detail';content.dataset.journeyDay=date;content.dataset.luviaExperienceComponent='sheet';
  const flow=[...day.entries.map(item=>({at:item.startAt,html:entryMarkup(item,escapeHtml)})),...(day.openGaps||[]).map(item=>({at:item.startAt,html:openWindowMarkup(item,day.date,escapeHtml)}))].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
  content.innerHTML=`<header><div><span class="lvj-kicker">${escapeHtml(statusCopy[day.status])}</span><h2>${escapeHtml(fmtLongDate(day.date))}</h2><p>${day.summary.entryCount?`${day.summary.entryCount} Programmpunkte · ${Math.round(day.summary.plannedMinutes/60*10)/10} Stunden geplant`:'Ein freier Tag – ideal für spontane Wünsche.'}</p></div><button type="button" data-journey-close aria-label="Tagesansicht schließen">×</button></header>${day.conflicts.map(item=>conflictMarkup(item,escapeHtml)).join('')}<div class="lvj-entry-list">${flow.map(item=>item.html).join('')||'<div class="lvj-day-empty"><span aria-hidden="true">✦</span><h3>Dieser Tag gehört noch euch</h3><p>Beschreibt Luvia, worauf ihr Lust habt. Sie darf Vorschläge kombinieren, aber keine Buchung ohne Bestätigung ausführen.</p><button type="button" data-ai-ask-open>Tag mit Luvia gestalten</button></div>'}</div>`;
  const mounted=ui.mount({name:'journey.day-detail',kind:'sheet',content,className:'lvj-day-overlay',closeSelector:'[data-journey-close]',initialFocus:'[data-journey-close]',label:`Tagesplan ${fmtLongDate(day.date)}`,onClose:()=>{if(dayHandle?.id===mounted.id)dayHandle=null}});dayHandle=mounted;
  mounted.overlay.querySelectorAll('[data-journey-entry-open]').forEach(button=>button.onclick=()=>{const entry=day.entries.find(item=>item.id===button.dataset.journeyEntryOpen);if(entry)openEntry(entry,mounted)});
  mounted.overlay.querySelectorAll('[data-journey-entry-edit]').forEach(button=>button.onclick=()=>{const entry=day.entries.find(item=>item.id===button.dataset.journeyEntryEdit);if(!entry)return;mounted.close('edit-entry');contract().commands.editEntry(entry.id,updates=>{const next=Object.values(updates||{}).find(Boolean);openDay(next?String(next).slice(0,10):date)})});
  mounted.overlay.querySelectorAll('[data-journey-discover]').forEach(button=>button.onclick=()=>{const guidance=globalThis.LuviaTripPreferenceContextV1?.dayGuidance?.(contract().snapshot())?.suggestion||{kind:'draft-place-discovery',requiresConfirmation:true,targetDate:button.dataset.journeyDiscover,startAt:button.dataset.journeyStart,query:'Ein Ort, der in diesen Freiraum passt'};globalThis.LuviaTripPreferenceContextV1?.setDraft?.({...guidance,targetDate:button.dataset.journeyDiscover,startAt:button.dataset.journeyStart});mounted.close('discover-place');globalThis.LuviaApp?.show?.('places',{source:'journey-open-window'})});
  return mounted.overlay;
}
function bindCalendar(root=document){
  if(!root||boundRoots.has(root))return;boundRoots.add(root);
  root.addEventListener('click',event=>{const button=event.target.closest?.('[data-journey-date]');if(!button||!root.contains(button))return;event.preventDefault();event.stopPropagation();openDay(button.dataset.journeyDate)});
}
function diagnostics(){return Object.freeze({version:VERSION,contract:contract().contractId,experience:experience()?.contractId||null,owner:'journey.day-composer',domainTruth:false,dayGraphTruth:false,overlayHost:'overlay-host.v1',minimumTouchTarget:48})}

globalThis.LuviaJourneyDayComposer=Object.freeze({version:VERSION,renderCalendar,bindCalendar,openDay,diagnostics});
})();
