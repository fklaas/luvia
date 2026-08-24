(()=>{
'use strict';

const VERSION='1.0.0';
const PAGE_SIZE=36;
const MAX_VISIBLE=120;
const PREVIEW_CONCURRENCY=6;
const previewCache=new Map();
let host=null;
let trip=null;
let abortController=null;
let unsubscribe=null;
let refreshTimer=0;
let searchTimer=0;
let loadSequence=0;
let composerHandle=null;
let state=createState();

function createState(){return{query:'',filter:'all',sort:'captured-desc',selection:{ids:[],count:0,max:60,remaining:60,full:false},snapshot:null,items:[],page:null,loading:true,loadingMore:false,error:null}}
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const contract=()=>globalThis.LuviaMemoryContractV1||(()=>{throw new Error('Memory Contract v1 fehlt.')})();
const fmtDate=value=>{if(!value)return'Ohne Datum';const parsed=new Date(value);return Number.isFinite(parsed.getTime())?parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):String(value)};
const plural=(value,one,many)=>`${value} ${value===1?one:many}`;
const statusCopy=Object.freeze({draft:'Entwurf',published:'Veröffentlicht',archived:'Archiviert'});
const transferCopy=Object.freeze({ready:'Alles gesichert',syncing:'Wird gesichert',offline:'Offline verfügbar',attention:'Transfer prüfen'});

function render(){return`<section class="lvm-space is-loading" data-premium-memories data-luvia-experience-component="screen" aria-busy="true"><div class="lvm-skeleton"><span></span><span></span><span></span></div></section>`}

function stat(label,value,detail){return`<span class="lvm-stat"><b>${esc(value)}</b><span>${esc(label)}</span><small>${esc(detail)}</small></span>`}
function transferMarkup(transfer={}){const status=transfer.status||'ready',copy=transferCopy[status]||transferCopy.ready;return`<div class="lvm-transfer is-${esc(status)}" role="status"><span class="lvm-transfer-mark" aria-hidden="true">${status==='ready'?'✓':status==='attention'?'!':'↻'}</span><span><b>${esc(copy)}</b><small>${transfer.pending?`${plural(transfer.pending,'Element','Elemente')} ausstehend`:transfer.online===false?'Änderungen synchronisieren später':'Medien und Geschichten sind aktuell'}</small></span></div>`}
function storyCard(story){const count=story.items?.length||0;return`<article class="lvm-story" data-memory-story="${esc(story.id)}"><span class="lvm-story-symbol" aria-hidden="true">${story.status==='published'?'✦':'◇'}</span><div><small>${esc(statusCopy[story.status]||story.status||'Entwurf')} · ${plural(story.chapters?.length||0,'Kapitel','Kapitel')}</small><h3>${esc(story.title||'Reisegeschichte')}</h3><p>${esc(story.description||`${plural(count,'Erinnerung','Erinnerungen')} warten auf eure Perspektive.`)}</p></div><button type="button" data-memory-story-edit="${esc(story.id)}">${story.status==='published'?'Ansehen':'Weiter gestalten'}</button></article>`}
function mediaCard(item){const selected=state.selection.ids.includes(String(item.id));const labels=[item.dayKey?fmtDate(item.dayKey):'',item.placeName||'',item.favorite?'Favorit':''].filter(Boolean);return`<button class="lvm-memory ${selected?'is-selected':''}" type="button" data-memory-select="${esc(item.id)}" aria-pressed="${selected}" aria-label="${selected?'Auswahl entfernen':'Auswählen'}: ${esc(item.displayName||'Erinnerung')}"><span class="lvm-memory-visual"><span class="lvm-memory-placeholder" aria-hidden="true">${item.type==='video'?'▶':'✦'}</span><img data-memory-preview="${esc(item.id)}" alt="" loading="lazy" decoding="async"><span class="lvm-memory-check" aria-hidden="true">${selected?'✓':'＋'}</span>${item.type==='video'?'<span class="lvm-memory-kind">Video</span>':''}</span><span class="lvm-memory-copy"><b>${esc(item.displayName||item.placeName||'Reisemoment')}</b><small>${esc(labels.join(' · ')||'Gemeinsame Erinnerung')}</small></span></button>`}

function renderBody(){
  if(!host)return;
  if(state.error){host.className='lvm-space';host.setAttribute('aria-busy','false');host.innerHTML=`<section class="lvm-error" role="alert"><span aria-hidden="true">!</span><h1>Erinnerungen konnten nicht geladen werden</h1><p>${esc(state.error.message||state.error)}</p><button type="button" data-memory-retry>Erneut versuchen</button></section>`;return}
  if(state.loading||!state.snapshot){host.className='lvm-space is-loading';host.setAttribute('aria-busy','true');host.innerHTML='<div class="lvm-skeleton"><span></span><span></span><span></span></div>';return}
  const snapshot=state.snapshot,stats=snapshot.library?.stats||{},transfer=snapshot.transfers||{},stories=(snapshot.stories||[]).filter(item=>item.status!=='archived');
  host.className='lvm-space';host.setAttribute('aria-busy','false');
  host.innerHTML=`
    <header class="lvm-hero">
      <div class="lvm-hero-copy"><span class="lvm-eyebrow">Memory Studio · eure Geschichte</span><h1>Aus Augenblicken wird etwas, das bleibt.</h1><p>Luvia ordnet eure Medien, hält Entwürfe zusammen und macht aus ausgewählten Momenten eine gemeinsame Reisegeschichte.</p><div class="lvm-hero-actions"><button type="button" class="is-primary" data-memory-compose ${state.selection.count?'':'disabled'}><span aria-hidden="true">✦</span> Geschichte aus Auswahl</button><button type="button" data-ai-ask-open><span aria-hidden="true">◇</span> Luvia inspirieren lassen</button></div></div>
      <div class="lvm-hero-aside">${transferMarkup(transfer)}<div class="lvm-stats" aria-label="Memory Übersicht">${stat('Momente',stats.media||0,plural(stats.days||0,'Tag','Tage'))}${stat('Favoriten',stats.favorites||0,'bewusst markiert')}${stat('Alben',stats.albums||0,'gemeinsam kuratiert')}${stat('Geschichten',stats.stories||0,'Entwürfe & Werke')}</div></div>
    </header>
    <section class="lvm-story-section" aria-labelledby="lvm-story-title"><header><div><span class="lvm-eyebrow">Story Atelier</span><h2 id="lvm-story-title">Eure Reise, Kapitel für Kapitel</h2></div><span>${stories.length?plural(stories.length,'Geschichte','Geschichten'):'Noch kein Entwurf'}</span></header><div class="lvm-story-rail">${stories.slice(0,6).map(storyCard).join('')||'<article class="lvm-story is-empty"><span class="lvm-story-symbol" aria-hidden="true">✦</span><div><small>Bereit, wenn ihr es seid</small><h3>Die erste Geschichte beginnt mit eurer Auswahl</h3><p>Wählt unten mehrere Momente. Luvia gruppiert sie deterministisch nach Tagen; ihr entscheidet über Titel und Veröffentlichung.</p></div></article>'}</div></section>
    <section class="lvm-library" aria-labelledby="lvm-library-title"><header class="lvm-library-head"><div><span class="lvm-eyebrow">Intelligente Mediathek</span><h2 id="lvm-library-title">Alle Momente. Eine klare Auswahl.</h2><p>${plural(state.page?.total??state.items.length,'Treffer','Treffer')} · bis zu 60 Momente pro Geschichte</p></div><div class="lvm-library-links"><button type="button" data-view="gallery">Galerie öffnen</button><button type="button" data-view="albums">Alben öffnen</button></div></header>
      <div class="lvm-toolbar"><label class="lvm-search"><span aria-hidden="true">⌕</span><span class="sr-only">Erinnerungen suchen</span><input type="search" data-memory-search value="${esc(state.query)}" placeholder="Ort, Datum, Album oder Dateiname" autocomplete="off"></label><div class="lvm-filters" role="group" aria-label="Mediathek filtern">${[['all','Alle'],['favorites','Favoriten'],['unassigned','Noch frei'],['photos','Fotos'],['videos','Videos']].map(([id,label])=>`<button type="button" data-memory-filter="${id}" aria-pressed="${state.filter===id}">${label}</button>`).join('')}</div><label class="lvm-sort"><span>Sortierung</span><select data-memory-sort><option value="captured-desc" ${state.sort==='captured-desc'?'selected':''}>Neueste zuerst</option><option value="captured-asc" ${state.sort==='captured-asc'?'selected':''}>Älteste zuerst</option><option value="updated-desc" ${state.sort==='updated-desc'?'selected':''}>Zuletzt bearbeitet</option></select></label></div>
      <div class="lvm-grid" role="list" aria-live="polite">${state.items.map(mediaCard).join('')||`<div class="lvm-library-empty"><span aria-hidden="true">◇</span><h3>${state.query||state.filter!=='all'?'Keine passenden Momente':'Noch keine Medien für diese Reise'}</h3><p>${state.query||state.filter!=='all'?'Ändert Suche oder Filter – eure Originale bleiben unberührt.':'Öffnet die Galerie, um Fotos und Videos sicher hinzuzufügen.'}</p><button type="button" data-view="gallery">Zur Fotogalerie</button></div>`}</div>
      ${state.page?.hasMore&&state.items.length<MAX_VISIBLE?`<button class="lvm-load-more" type="button" data-memory-more ${state.loadingMore?'disabled':''}>${state.loadingMore?'Weitere Momente werden geladen …':`Weitere ${Math.min(PAGE_SIZE,state.page.total-state.items.length)} Momente laden`}</button>`:''}
    </section>
    <aside class="lvm-selection ${state.selection.count?'is-visible':''}" aria-live="polite"><span><b>${state.selection.count}</b><small>von ${state.selection.max} ausgewählt</small></span><button type="button" data-memory-selection-clear>Auswahl leeren</button><button type="button" class="is-primary" data-memory-compose ${state.selection.count?'':'disabled'}>Geschichte gestalten <span aria-hidden="true">→</span></button></aside>
    <p class="sr-only" data-memory-live aria-live="polite"></p>`;
  hydratePreviews();
}

async function hydratePreviews(){
  if(!host)return;
  const pending=[...host.querySelectorAll('[data-memory-preview]')];
  let cursor=0;
  const worker=async()=>{while(cursor<pending.length){const image=pending[cursor++],id=image.dataset.memoryPreview;if(!id||!image.isConnected)continue;let url=previewCache.get(id);if(url===undefined){try{url=await contract().reads.signedAsset(id,{expiresIn:1800})||''}catch{url=''}previewCache.set(id,url)}if(image.isConnected&&url){image.src=url;image.onload=()=>image.closest('.lvm-memory-visual')?.classList.add('is-ready')}}};
  await Promise.all(Array.from({length:Math.min(PREVIEW_CONCURRENCY,pending.length)},worker));
}

async function load({reset=true}={}){
  const sequence=++loadSequence;
  state.error=null;
  if(reset){state.loading=true;renderBody()}
  else{state.loadingMore=true;renderBody()}
  try{
    const options={query:state.query,filter:state.filter,sort:state.sort,selectedIds:state.selection.ids,limit:PAGE_SIZE,cursor:reset?0:state.items.length};
    if(reset){const snapshot=await contract().reads.snapshot(options);if(sequence!==loadSequence)return;state.snapshot=snapshot;state.items=[...(snapshot.library?.items||[])];state.page=snapshot.library?.page||null}
    else{const page=await contract().reads.library(options);if(sequence!==loadSequence)return;const seen=new Set(state.items.map(item=>String(item.id)));state.items=[...state.items,...page.items.filter(item=>!seen.has(String(item.id)))];state.page=page.page}
    state.loading=false;state.loadingMore=false;renderBody();
  }catch(error){if(sequence!==loadSequence)return;state.loading=false;state.loadingMore=false;state.error=error;renderBody()}
}

function announce(message){const live=host?.querySelector('[data-memory-live]');if(live)live.textContent=message;globalThis.LuviaUIKit?.toast?.(message,{type:'success'})}
function toggle(mediaId){try{state.selection=contract().composition.toggleSelection(state.selection,mediaId);renderBody();announce(`${state.selection.count} Momente ausgewählt.`)}catch(error){announce(error?.message==='MEMORY_SELECTION_LIMIT'?'Maximal 60 Momente pro Geschichte.':'Auswahl konnte nicht geändert werden.')}}
function clearSelection(){state.selection=contract().composition.createSelection([],{max:60});renderBody();announce('Auswahl geleert.')}

function chapterMarkup(chapter,index,items=[]){const count=items.filter(item=>Number(item.chapterPosition)===index).length;return`<li><span>${index+1}</span><div><b>${esc(chapter.title)}</b><small>${esc(chapter.dayKey?fmtDate(chapter.dayKey):'Ohne Datum')} · ${plural(count,'Moment','Momente')}</small></div></li>`}
function openComposer(draft){
  composerHandle?.close?.('replace');
  const ui=globalThis.LuviaUI;if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');
  const content=document.createElement('section');content.className='lvm-composer';content.dataset.memoryComposer='true';content.dataset.luviaExperienceComponent='sheet';
  const isExisting=Boolean(draft.id);
  content.innerHTML=`<header><div><span class="lvm-eyebrow">${isExisting?'Geschichte weitergestalten':'Neuer Story-Entwurf'}</span><h2>Gebt euren Momenten eine Stimme.</h2><p>${plural(draft.items?.length||0,'Erinnerung','Erinnerungen')} in ${plural(draft.chapters?.length||0,'Kapitel','Kapiteln')} – nach Reisetagen geordnet.</p></div><button type="button" data-memory-composer-close aria-label="Story Composer schließen">×</button></header><form><label><span>Titel</span><input name="title" maxlength="120" required value="${esc(draft.title||'')}"></label><label><span>Beschreibung</span><textarea name="description" maxlength="5000" rows="4">${esc(draft.description||'')}</textarea></label><section class="lvm-chapters"><header><b>Kapitelvorschlag</b><small>Die Reihenfolge folgt dem Aufnahmedatum</small></header><ol>${(draft.chapters||[]).map((chapter,index)=>chapterMarkup(chapter,index,draft.items||[])).join('')}</ol></section><p class="lvm-composer-error" data-memory-composer-error role="alert"></p><footer><button type="button" data-memory-composer-close>Abbrechen</button><span></span><button type="submit" data-memory-save="draft">Als Entwurf sichern</button><button type="submit" class="is-primary" data-memory-save="published">Veröffentlichen</button></footer></form>`;
  const mounted=ui.mount({name:'memory.story-composer',kind:'sheet',content,className:'lvm-composer-overlay',closeSelector:'[data-memory-composer-close]',initialFocus:'input[name="title"]',label:'Memory Story Composer',onClose:()=>{if(composerHandle?.id===mounted.id)composerHandle=null}});composerHandle=mounted;
  const form=content.querySelector('form');let intent='draft';content.querySelectorAll('[data-memory-save]').forEach(button=>button.addEventListener('click',()=>{intent=button.dataset.memorySave}));
  form.addEventListener('submit',async event=>{event.preventDefault();const errorNode=content.querySelector('[data-memory-composer-error]');const controls=[...form.elements];controls.forEach(control=>control.disabled=true);errorNode.textContent='';try{const command={...draft,title:String(new FormData(form).get('title')||''),description:String(new FormData(form).get('description')||''),status:intent};const saved=intent==='published'?await contract().commands.stories.publish(command):await contract().commands.stories.save(command);mounted.close('saved');state.selection=contract().composition.createSelection([],{max:60});announce(intent==='published'?`„${saved?.title||command.title}“ wurde veröffentlicht.`:`„${saved?.title||command.title}“ wurde als Entwurf gesichert.`);await load({reset:true})}catch(error){errorNode.textContent=error?.message||'Die Geschichte konnte nicht gespeichert werden.';controls.forEach(control=>control.disabled=false)}});
  return mounted.overlay;
}

async function compose(){if(!state.selection.count)return announce('Wählt zuerst mindestens einen Moment aus.');try{const draft=await contract().reads.createDraft(state.selection.ids,{trip});openComposer(draft)}catch(error){announce(error?.message||'Der Story-Entwurf konnte nicht erstellt werden.')}}
async function editStory(storyId){try{const story=await contract().reads.getStory(storyId);if(!story)throw new Error('Geschichte nicht gefunden.');openComposer(story)}catch(error){announce(error?.message||'Die Geschichte konnte nicht geöffnet werden.')}}

function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>load({reset:true}),220)}
function bind(root=document,options={}){
  unbind();trip=options.trip||null;host=root?.matches?.('[data-premium-memories]')?root:root?.querySelector?.('[data-premium-memories]');if(!host)return false;
  state=createState();state.selection=contract().composition.createSelection([],{max:60});abortController=new AbortController();const signal=abortController.signal;
  host.addEventListener('click',event=>{const select=event.target.closest('[data-memory-select]');if(select){event.preventDefault();toggle(select.dataset.memorySelect);return}const filter=event.target.closest('[data-memory-filter]');if(filter){state.filter=filter.dataset.memoryFilter;load({reset:true});return}if(event.target.closest('[data-memory-compose]')){compose();return}if(event.target.closest('[data-memory-selection-clear]')){clearSelection();return}if(event.target.closest('[data-memory-more]')){load({reset:false});return}if(event.target.closest('[data-memory-retry]')){load({reset:true});return}const storyButton=event.target.closest('[data-memory-story-edit]');if(storyButton)editStory(storyButton.dataset.memoryStoryEdit)},{signal});
  host.addEventListener('input',event=>{if(!event.target.matches('[data-memory-search]'))return;state.query=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>load({reset:true}),280)},{signal});
  host.addEventListener('change',event=>{if(!event.target.matches('[data-memory-sort]'))return;state.sort=event.target.value;load({reset:true})},{signal});
  load({reset:true});Promise.resolve(contract().reads.subscribe(scheduleRefresh)).then(stop=>{if(host&&typeof stop==='function')unsubscribe=stop}).catch(()=>{});return true;
}

function unbind(){loadSequence+=1;clearTimeout(refreshTimer);clearTimeout(searchTimer);abortController?.abort();abortController=null;Promise.resolve(unsubscribe?.()).catch(()=>{});unsubscribe=null;host=null;trip=null}
function diagnostics(){return Object.freeze({version:VERSION,contract:'memory.v1',mediaAssetContract:'media.v1',owner:'Consumer Experience',domainTruth:false,storyTruth:false,overlayHost:'overlay-host.v1',pageSize:PAGE_SIZE,maxVisible:MAX_VISIBLE,selectionLimit:60,previewConcurrency:PREVIEW_CONCURRENCY,minimumTouchTarget:48})}

globalThis.LuviaPremiumMemoriesExperience=Object.freeze({version:VERSION,render,bind,unbind,openComposer,diagnostics});
})();
