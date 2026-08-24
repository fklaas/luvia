var LuviaMemoryDomainContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='memory.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const STORY_STATUSES=Object.freeze(['draft','published','archived']);
const FILTERS=Object.freeze(['all','favorites','unassigned','photos','videos']);
const SORTS=Object.freeze(['captured-desc','captured-asc','updated-desc']);

const text=value=>value==null?null:String(value);
const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const pick=(value,...keys)=>{
  for(const key of keys){if(value&&value[key]!==undefined)return value[key]}
  return undefined;
};
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const unique=values=>[...new Set((values||[]).map(value=>text(value)).filter(Boolean))];
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const normalizeSearch=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE');
const dateValue=value=>{
  const timestamp=Date.parse(value||'');
  return Number.isFinite(timestamp)?timestamp:0;
};
const dayKey=value=>{
  const direct=clean(value);
  if(/^\d{4}-\d{2}-\d{2}$/.test(direct))return direct;
  const timestamp=Date.parse(direct);
  if(!Number.isFinite(timestamp))return null;
  return new Date(timestamp).toISOString().slice(0,10);
};

function projectContribution(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    authorId:text(pick(row,'authorId','author_id','userId','user_id')),
    promptKey:text(pick(row,'promptKey','prompt_key')),
    promptText:text(pick(row,'promptText','prompt_text')),
    answerText:text(pick(row,'answerText','answer_text')),
    reaction:text(row.reaction),
    mediaId:text(pick(row,'mediaId','media_id')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectAlbum(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    clusterId:text(pick(row,'clusterId','sourceClusterId','source_cluster_id')),
    title:text(row.title),
    description:text(row.description),
    mood:text(row.mood),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id')),
    mediaIds:unique(pick(row,'mediaIds','media_ids')),
    status:text(row.status)||'draft',
    contributions:(row.contributions||[]).map(projectContribution).filter(Boolean),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectCard(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    authorId:text(pick(row,'authorId','author_id')),
    cardType:text(pick(row,'cardType','card_type')),
    sourceType:text(pick(row,'sourceType','source_type')),
    content:text(row.content),
    mediaId:text(pick(row,'mediaId','media_id')),
    clusterId:text(pick(row,'clusterId','cluster_id')),
    storyId:text(pick(row,'storyId','journeyId','journey_id')),
    reaction:text(row.reaction),
    weight:number(row.weight)||1,
    visibility:row.visibility==='private'?'private':'trip',
    status:text(row.status)||'active',
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectChapter(row,index=0){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    position:number(row.position)??index,
    title:text(row.title)||`Kapitel ${index+1}`,
    dayKey:dayKey(pick(row,'dayKey','day_key')),
    summary:text(row.summary),
    mood:text(row.mood),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id'))
  });
}

function projectStoryItem(row,index=0){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    chapterPosition:number(pick(row,'chapterPosition','chapter_position'))??0,
    position:number(row.position)??index,
    itemType:text(pick(row,'itemType','item_type'))||'media',
    mediaId:text(pick(row,'mediaId','media_id')),
    albumId:text(pick(row,'albumId','memoryAlbumId','memory_album_id')),
    clusterId:text(pick(row,'clusterId','cluster_id')),
    journeyEntryId:text(pick(row,'journeyEntryId','timelineEventId','timeline_event_id')),
    dayKey:dayKey(pick(row,'dayKey','day_key'))
  });
}

function projectStory(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    title:text(row.title),
    subtitle:text(row.subtitle),
    description:text(row.description),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id')),
    status:STORY_STATUSES.includes(row.status)?row.status:'draft',
    chapters:(row.chapters||[]).map(projectChapter).filter(Boolean).sort((a,b)=>a.position-b.position),
    items:(row.items||[]).map(projectStoryItem).filter(Boolean).sort((a,b)=>a.chapterPosition-b.chapterPosition||a.position-b.position),
    contributions:(row.contributions||[]).map(projectContribution).filter(Boolean),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectCluster(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    title:text(row.title),
    kind:text(row.kind),
    state:text(row.state),
    mediaIds:unique(pick(row,'mediaIds','media_ids')),
    startAt:text(pick(row,'startAt','start_at')),
    endAt:text(pick(row,'endAt','end_at'))
  });
}

function projectMediaReference(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    participantId:text(pick(row,'participantId','participant_id')),
    type:text(row.type),
    purpose:text(row.purpose),
    source:text(row.source),
    displayName:text(pick(row,'displayName','display_name','originalName','original_name')),
    mimeType:text(pick(row,'mimeType','mime_type')),
    status:text(row.status),
    capturedAt:text(pick(row,'capturedAt','captured_at')),
    dayKey:dayKey(pick(row,'dayKey','day_key')||pick(row,'capturedAt','captured_at')),
    width:number(row.width),
    height:number(row.height),
    favorite:Boolean(row.favorite),
    placeId:text(pick(row,'placeId','place_id')),
    placeName:text(row.resolvedLocation?.name||row.captureLocationName),
    mediaKind:text(pick(row,'mediaKind','media_kind')),
    renderedPreviewAvailable:Boolean(row.renderedPreviewAvailable),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function membershipIndex(albums=[],stories=[]){
  const map=new Map();
  const ensure=mediaId=>{
    const key=text(mediaId);
    if(!key)return null;
    if(!map.has(key))map.set(key,{albumIds:[],albumTitles:[],storyIds:[],storyTitles:[]});
    return map.get(key);
  };
  for(const album of albums){
    for(const mediaId of album.mediaIds||[]){
      const entry=ensure(mediaId);if(!entry)continue;
      entry.albumIds.push(album.id);if(album.title)entry.albumTitles.push(album.title);
    }
  }
  for(const story of stories){
    for(const item of story.items||[]){
      const entry=ensure(item.mediaId);if(!entry)continue;
      entry.storyIds.push(story.id);if(story.title)entry.storyTitles.push(story.title);
    }
  }
  return map;
}

function buildLibrary(input={},options={}){
  const albums=(input.albums||[]).map(projectAlbum).filter(Boolean);
  const stories=(input.stories||[]).map(projectStory).filter(Boolean);
  const memberships=membershipIndex(albums,stories);
  const selected=new Set(unique(options.selectedIds));
  const query=normalizeSearch(options.query);
  const terms=query.split(' ').filter(Boolean);
  const filter=FILTERS.includes(options.filter)?options.filter:'all';
  const sort=SORTS.includes(options.sort)?options.sort:'captured-desc';
  const all=(input.media||[]).map(projectMediaReference).filter(item=>item&&item.id&&item.status!=='deleted').map(item=>{
    const refs=memberships.get(item.id)||{albumIds:[],albumTitles:[],storyIds:[],storyTitles:[]};
    return immutable({...item,memoryRefs:refs,selected:selected.has(item.id)});
  });
  const days=new Set(all.map(item=>item.dayKey).filter(Boolean));
  const stats=immutable({
    media:all.length,
    favorites:all.filter(item=>item.favorite).length,
    days:days.size,
    albums:albums.length,
    stories:stories.length,
    selected:selected.size
  });
  let filtered=all.filter(item=>{
    if(filter==='favorites'&&!item.favorite)return false;
    if(filter==='unassigned'&&(item.memoryRefs.albumIds.length||item.memoryRefs.storyIds.length))return false;
    if(filter==='photos'&&!(item.type==='image'||String(item.mimeType||'').startsWith('image/')))return false;
    if(filter==='videos'&&!(item.type==='video'||String(item.mimeType||'').startsWith('video/')))return false;
    if(!terms.length)return true;
    const haystack=normalizeSearch([
      item.displayName,item.dayKey,item.placeName,item.mediaKind,item.mimeType,
      ...item.memoryRefs.albumTitles,...item.memoryRefs.storyTitles
    ].filter(Boolean).join(' '));
    return terms.every(term=>haystack.includes(term));
  });
  filtered.sort((a,b)=>{
    if(sort==='captured-asc')return dateValue(a.capturedAt)-dateValue(b.capturedAt)||String(a.id).localeCompare(String(b.id));
    if(sort==='updated-desc')return dateValue(b.updatedAt)-dateValue(a.updatedAt)||String(a.id).localeCompare(String(b.id));
    return dateValue(b.capturedAt)-dateValue(a.capturedAt)||String(a.id).localeCompare(String(b.id));
  });
  const offset=Math.max(0,Number.parseInt(options.cursor,10)||0);
  const limit=Math.max(12,Math.min(120,Number(options.limit)||36));
  const items=filtered.slice(offset,offset+limit);
  return immutable({
    contractId:CONTRACT_ID,
    query:clean(options.query),filter,sort,stats,
    items,
    page:Object.freeze({offset,limit,total:filtered.length,hasMore:offset+items.length<filtered.length,nextCursor:offset+items.length}),
    provenance:Object.freeze({mediaTruth:'media.v1',memoryTruth:CONTRACT_ID,foreignTruth:false})
  });
}

function createSelection(ids=[],options={}){
  const max=Math.max(1,Math.min(200,Number(options.max)||60));
  const selected=unique(ids).slice(0,max);
  return immutable({ids:selected,count:selected.length,max,remaining:max-selected.length,full:selected.length>=max});
}

function toggleSelection(selection={},mediaId){
  const id=text(mediaId);
  if(!id)throw new TypeError('Memory selection requires a media id.');
  const current=createSelection(selection.ids||[],{max:selection.max});
  const ids=[...current.ids];
  const index=ids.indexOf(id);
  if(index>=0)ids.splice(index,1);
  else{
    if(ids.length>=current.max)throw new Error('MEMORY_SELECTION_LIMIT');
    ids.push(id);
  }
  return createSelection(ids,{max:current.max});
}

function createStoryDraft(input={}){
  const media=unique((input.media||[]).map(item=>item?.id)).map(id=>(input.media||[]).find(item=>String(item?.id)===id)).map(projectMediaReference).filter(Boolean).sort((a,b)=>dateValue(a.capturedAt)-dateValue(b.capturedAt)||String(a.id).localeCompare(String(b.id)));
  if(!media.length)throw new Error('MEMORY_STORY_REQUIRES_MEDIA');
  const groups=new Map();
  for(const item of media){const key=item.dayKey||'undatiert';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}
  const chapters=[...groups.entries()].map(([key,items],position)=>{
    const places=unique(items.map(item=>item.placeName));
    return immutable({
      position,
      title:key==='undatiert'?`Kapitel ${position+1}`:`Tag ${position+1}`,
      dayKey:key==='undatiert'?null:key,
      summary:places.length?places.slice(0,3).join(' · '):`${items.length} ${items.length===1?'Erinnerung':'Erinnerungen'}`,
      mood:null,
      coverMediaId:items[0].id,
      mediaIds:items.map(item=>item.id)
    });
  });
  const items=chapters.flatMap(chapter=>chapter.mediaIds.map((mediaId,position)=>immutable({chapterPosition:chapter.position,position,itemType:'media',mediaId,dayKey:chapter.dayKey})));
  const destination=clean(input.trip?.destination?.name||input.trip?.destinationName||'');
  const title=clean(input.title)||(destination?`Unsere Reise nach ${destination}`:'Unsere Reisegeschichte');
  const description=clean(input.description)||`${media.length} ${media.length===1?'Erinnerung':'Erinnerungen'} aus ${chapters.length} ${chapters.length===1?'Kapitel':'Kapiteln'} – bereit für eure gemeinsame Geschichte.`;
  return normalizeStoryCommand({id:input.id,title,subtitle:clean(input.subtitle),description,coverMediaId:media[0].id,status:input.status||'draft',chapters,items});
}

function normalizeStoryCommand(input={}){
  const title=clean(input.title).slice(0,120);
  if(!title)throw new Error('MEMORY_STORY_TITLE_REQUIRED');
  const status=STORY_STATUSES.includes(input.status)?input.status:'draft';
  const chapters=(input.chapters||[]).slice(0,60).map((chapter,index)=>({
    position:index,
    title:(clean(chapter.title)||`Kapitel ${index+1}`).slice(0,120),
    dayKey:dayKey(chapter.dayKey),
    summary:clean(chapter.summary).slice(0,800),
    mood:clean(chapter.mood).slice(0,80)||null,
    coverMediaId:text(chapter.coverMediaId)
  }));
  const items=(input.items||[]).slice(0,500).map((item,index)=>({
    chapterPosition:Math.max(0,Math.min(chapters.length-1,Number(item.chapterPosition)||0)),
    position:index,
    itemType:['media','album','journey'].includes(item.itemType)?item.itemType:'media',
    mediaId:text(item.mediaId),
    clusterId:text(item.clusterId),
    memoryAlbumId:text(item.memoryAlbumId||item.albumId),
    timelineEventId:text(item.timelineEventId||item.journeyEntryId),
    dayKey:dayKey(item.dayKey)
  })).filter(item=>item.mediaId||item.clusterId||item.memoryAlbumId||item.timelineEventId);
  if(!items.length)throw new Error('MEMORY_STORY_REQUIRES_ITEMS');
  return immutable({
    id:text(input.id),
    title,
    subtitle:clean(input.subtitle).slice(0,220),
    description:clean(input.description).slice(0,5000),
    coverMediaId:text(input.coverMediaId)||items.find(item=>item.mediaId)?.mediaId||null,
    status,
    chapters,
    items
  });
}

function projectTransfer(snapshot={}){
  const counts=Object.fromEntries(['queued','uploading','retry','completed','failed'].map(state=>[state,Math.max(0,Number(snapshot.counts?.[state])||0)]));
  const pending=counts.queued+counts.uploading+counts.retry+counts.failed;
  return immutable({
    online:snapshot.online!==false,
    running:Boolean(snapshot.running),
    total:Math.max(Number(snapshot.total)||0,pending),
    pending,
    counts,
    status:counts.failed?'attention':pending?'syncing':snapshot.online===false?'offline':'ready'
  });
}

const diagnostics=()=>immutable({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  browserless:true,
  truth:'canonical-memory-and-narrative-truth',
  mediaAssetTruth:false,
  persistence:false,
  filters:FILTERS,
  storyStatuses:STORY_STATUSES
});

return Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  storyStatuses:STORY_STATUSES,
  filters:FILTERS,
  sorts:SORTS,
  normalizeSearch,
  projectContribution,
  projectAlbum,
  projectCard,
  projectStory,
  projectCluster,
  projectMediaReference,
  buildLibrary,
  createSelection,
  toggleSelection,
  createStoryDraft,
  normalizeStoryCommand,
  projectTransfer,
  diagnostics
});
})();
