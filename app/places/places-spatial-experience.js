(() => {
  'use strict';

  const VERSION='1.36.5-single-owner-profile-evidence-cache';
  const INITIAL_VISIBLE_RESULTS=6;
  const PAGE_SIZE=6;
  const MAX_RESULTS=80;
  const PROVIDER_PAGE_SIZE=50;
  const MAP_STYLE='https://tiles.openfreemap.org/styles/liberty';
  const COMPASS_MAP_PALETTE=Object.freeze({
    coral:'#ef6254',
    sun:'#f4b34c',
    sea:'#2c93a9',
    grove:'#2f8c73',
    paper:'#f8f3ed',
    water:'#cfe8ee',
    park:'#dcebe4',
    building:'#f7dfd9',
    land:'#fbf0d6',
    ink:'#344b5c'
  });
  const COMPOSITION=()=>globalThis.LuviaPlacesSpatialCompositionCoreV1;
  const placesContract=()=>globalThis.LuviaPlacesContractV1||globalThis.LuviaPlacesContract;
  const bookingContract=()=>globalThis.LuviaBookingContractV1||globalThis.LuviaBookingPublicContract;
  const preferenceContext=()=>globalThis.LuviaTripPreferenceContextV1;
  const port=id=>globalThis.LuviaPlatformPorts?.get?.(id)||null;
  const clean=value=>String(value??'').trim();
  const esc=value=>clean(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const providerId=place=>clean(place?.providerPlaceId||place?.provider_place_id||place?.id).replace(/^places\//,'');
  const tripId=trip=>clean(trip?.id||trip?.tripId);
  const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.name)||'eurem Reiseziel';
  const specializedLocalRadius=()=>state.category==='food'&&(state.filters.cuisines||[]).length?5000:0;
  const tripGeography=trip=>{
    const source=trip&&typeof trip==='object'?trip:{};
    const dest=source.destination&&typeof source.destination==='object'?source.destination:null;
    const model=source.destinationModel&&typeof source.destinationModel==='object'?source.destinationModel:null;
    const latitude=Number(dest?.location?.latitude??dest?.center?.lat??dest?.latitude??model?.latitude??source.destinationLat??source.latitude);
    const longitude=Number(dest?.location?.longitude??dest?.center?.lng??dest?.longitude??model?.longitude??source.destinationLng??source.longitude);
    const name=destination(source);
    const requestedRadius=state.searchRadiusMeters||specializedLocalRadius();
    const radius=requestedRadius||Math.round(Number(dest?.searchRadiusMeters||model?.searchRadiusMeters||3000));
    const payload={name,displayName:name,countryCode:clean(dest?.countryCode||model?.countryCode||source.countryCode),searchRadiusMeters:placesContract()?.reads?.localSearchRadius?.({searchRadiusMeters:radius},requestedRadius||undefined)??(requestedRadius?Math.max(500,Math.min(10000,requestedRadius)):Math.max(500,Math.min(3000,Number.isFinite(radius)?radius:3000)))};
    if(Number.isFinite(latitude)&&Number.isFinite(longitude)){
      payload.center={lat:latitude,lng:longitude};
      payload.location={latitude,longitude};
    }
    return payload;
  };
  const destinationContext=trip=>tripGeography(trip);
  const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true||document.documentElement.classList.contains('reduce-motion');
  const categoryMeta=Object.freeze({
    food:{icon:'heart',hint:'Restaurant · Café · Bar'},
    accommodation:{icon:'home',hint:'Hotel · Apartment · Camping'},
    activities:{icon:'star',hint:'Freizeit · Familie · Wellness'},
    themeparks:{icon:'spark',hint:'Themenpark · Erlebnispark'},
    wellness:{icon:'heart',hint:'Spa · Sauna · Erholung'},
    water:{icon:'map',hint:'Wasserpark · Schwimmen · Strand'},
    sights:{icon:'pin',hint:'Wahrzeichen · Aussicht'},
    photo:{icon:'camera',hint:'Licht · Perspektive · Natur'},
    culture:{icon:'culture',hint:'Museum · Kino · Bühne'},
    nature:{icon:'map',hint:'Strand · Park · Wandern'},
    shopping:{icon:'wallet',hint:'Markt · Boutique · Feinkost'},
    malls:{icon:'wallet',hint:'Shopping Center · Kaufhaus'},
    nightlife:{icon:'spark',hint:'Bar · Pub · Club · Live-Musik'},
    practical:{icon:'route',hint:'Apotheke · Parken · Laden'}
  });
  const emptyFilters=()=>({openNow:false,rated:false,rating45:false,nearby:false,vegetarian:false,reservable:false,accessible:false,priceLevels:[],types:[],cuisines:[]});
  const HERE_PRIMARY_CUISINE_ALIASES=Object.freeze({
    italian_restaurant:['italian','italienisch'],german_restaurant:['german','deutsch'],mediterranean_restaurant:['mediterranean','mediterran'],greek_restaurant:['greek','griechisch'],french_restaurant:['french','franzosisch'],spanish_restaurant:['spanish','spanisch'],indian_restaurant:['indian','indisch'],asian_restaurant:['asian','asiatisch'],chinese_restaurant:['chinese','chinesisch'],japanese_restaurant:['japanese','japanisch'],thai_restaurant:['thai','thailandisch'],vietnamese_restaurant:['vietnamese','vietnamesisch'],korean_restaurant:['korean','koreanisch'],mexican_restaurant:['mexican','mexikanisch'],middle_eastern_restaurant:['middle eastern','middle_eastern','nahostlich','arabian'],lebanese_restaurant:['lebanese','libanesisch'],turkish_restaurant:['turkish','turkisch'],vegetarian_restaurant:['vegetarian','vegetarisch'],vegan_restaurant:['vegan']
  });
  const CATEGORY_FILTERS=globalThis.LuviaGlobalPlaceContracts?.filterDefinitions||Object.freeze({});
  const icons=Object.freeze({
    search:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 4.3 4.3"/>',
    heart:'<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/>',
    home:'<path d="m4 11 8-7 8 7v9H4Z"/><path d="M9 20v-6h6v6"/>',
    star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    pin:'<path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
    camera:'<path d="M4 8h3l1.4-2h7.2L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3"/>',
    culture:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="m8 15 2.5-3 2.5 2 2-2 2 3"/><circle cx="9" cy="9" r="1"/>',
    map:'<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2Z"/><path d="M9 4v14m6-12v14"/>',
    wallet:'<path d="M4 7.5h15v10H4z"/><path d="M4 7.5V6h12v1.5M15 11h4v3h-4z"/>',
    spark:'<path d="M12 3c.8 5.2 3.8 8.2 9 9-5.2.8-8.2 3.8-9 9-.8-5.2-3.8-8.2-9-9 5.2-.8 8.2-3.8 9-9Z"/>',
    route:'<circle cx="6" cy="17.5" r="2"/><circle cx="18" cy="6.5" r="2"/><path d="M8 17.5h2.5A2.5 2.5 0 0 0 13 15V9a2.5 2.5 0 0 1 2.5-2.5H16"/>',
    filter:'<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    ticket:'<path d="M4 7h16v3a2.5 2.5 0 0 0 0 5v3H4v-3a2.5 2.5 0 0 0 0-5Z"/><path d="M12 7v11"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7"/><path d="M12 7h.01"/>',
    grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    compass:'<circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>'
  });
  const icon=(name,label='')=>`<svg viewBox="0 0 24 24" ${label?`aria-label="${esc(label)}" role="img"`:'aria-hidden="true"'}>${icons[name]||icons.pin}</svg>`;
  const compassMarkup=()=>`<span class="lv-places-spatial__compass" aria-hidden="true"><img src="assets/brand/luvia-living-compass/layers/face.svg" alt=""><img class="is-needle" src="assets/brand/luvia-living-compass/layers/two-ended-needle.svg" alt=""><img src="assets/brand/luvia-living-compass/layers/hub.svg" alt=""></span>`;

  const state={
    story:null,root:null,trip:null,surface:'places',searchRadiusMeters:0,activeViewport:null,categories:[],category:'food',query:'Restaurant',userQuery:'',results:[],visibleLimit:MAX_RESULTS,
    status:'loading',error:null,readNotice:null,offline:false,selectedId:null,images:new Map(),imageInflight:new Map(),photoWarmToken:0,preferenceEvidenceKey:'',preferenceEvidenceInflight:null,preferenceEvidenceToken:0,preferenceEvidence:{state:'idle',focus:'',provider:'',returned:0,eligible:0,before:0,after:0,error:''},saved:new Map(),map:null,mapMarkers:new Map(),filters:emptyFilters(),sort:'fit',fitOnly:false,filterOpen:false,filterSection:null,mapPanel:null,history:[],
    requestToken:0,lifecycleToken:0,renderToken:0,networkUnsubscribe:null,preferenceHandlers:[],preferenceRefreshTimer:0,filterRefreshTimer:0,planningHandle:null,mapProjection:null,lastSearchAt:null,lastSearchTrace:null,preferenceResolution:null,aiDecision:null,planningDraft:null,onRootClick:null,categoryCohorts:new Map()
  };

  const MAP_CACHE_FRESH_MS=5*60*1000,MAP_CACHE_MAX_MS=24*60*60*1000,CATEGORY_COHORT_MAX_MS=15*60*1000;
  function cacheScope(trip=state.trip){const g=tripGeography(trip),c=COMPOSITION().normalizeCoordinates(g.location||g.center);return JSON.stringify({trip:tripId(trip),surface:state.surface,destination:destination(trip),latitude:c?.latitude,longitude:c?.longitude})}
  function cacheKey(){return `consumer:places-spatial:v8-single-owner-profile-evidence:${state.surface}:${tripId(state.trip)||'active'}`}
  function loadCached(){
    try{
      const cached=port('OfflineCachePort')?.read(cacheKey(),null),age=Date.now()-Date.parse(cached?.savedAt||'');
      if(state.planningDraft?.query||!cached||cached.scope!==cacheScope()||!Number.isFinite(age)||age<0||age>MAP_CACHE_MAX_MS||!Array.isArray(cached.results)||!state.categories.some(item=>item.key===cached.category))return false;
      const usable=cached.results.filter(place=>{const title=clean(place?.name||place?.displayName);return title&&!/^(unbenannter ort|unbekannter ort|unknown place|\[object object\])$/i.test(title)&&/^(?:geoapify|tomtom|here):/.test(providerId(place))&&COMPOSITION().normalizeCoordinates(place.coordinates||place.location)});
      if(!usable.length)return false;
      state.category=clean(cached.category)||state.category;
      state.results=decoratePreferences(usable.slice(0,MAX_RESULTS),state.trip);
      const cachedRadius=Math.round(Number(cached.searchRadiusMeters)||0);
      state.searchRadiusMeters=cachedRadius>=500&&cachedRadius<=10000?cachedRadius:0;
      state.query=clean(cached.query)||state.query;
      state.selectedId=providerId(state.results[0])||null;state.lastSearchAt=cached.savedAt;
      state.status=state.offline?'offline':'ready';return true;
    }catch{return false}
  }
  function saveCached(){
    // Only an unfiltered destination cohort can seed a later default mount.
    if(state.activeViewport||state.userQuery||state.readNotice||activeFilterCount()||!state.results.length)return;
    const results=state.results.filter(p=>/^(?:geoapify|tomtom|here):/.test(providerId(p))).slice(0,MAX_RESULTS);
    if(!results.length)return;
    try{port('OfflineCachePort')?.write(cacheKey(),{scope:cacheScope(),query:state.query,category:state.category,searchRadiusMeters:state.searchRadiusMeters,results,savedAt:state.lastSearchAt||new Date().toISOString()})}catch{}
  }
  function categoryCohortKey(category=state.category){return JSON.stringify({scope:cacheScope(),category:clean(category),radius:Math.max(0,Math.min(10000,Math.round(Number(state.searchRadiusMeters)||0)))})}
  function rememberCategoryCohort(){
    if(state.activeViewport||state.userQuery||activeFilterCount()||!state.results.length||!['ready','loading'].includes(state.status))return false;
    const key=categoryCohortKey(),savedAt=new Date().toISOString();
    state.categoryCohorts.set(key,{results:state.results.slice(0,MAX_RESULTS),savedAt,sourceSavedAt:state.lastSearchAt||savedAt,preferenceResolution:state.preferenceResolution,aiDecision:state.aiDecision});
    while(state.categoryCohorts.size>24)state.categoryCohorts.delete(state.categoryCohorts.keys().next().value);
    return true;
  }
  function restoreCategoryCohort(category,query){
    const key=categoryCohortKey(category,query),cohort=state.categoryCohorts.get(key),age=Date.now()-Date.parse(cohort?.savedAt||'');
    if(!cohort||!Number.isFinite(age)||age<0||age>CATEGORY_COHORT_MAX_MS||!Array.isArray(cohort.results)||!cohort.results.length){if(cohort)state.categoryCohorts.delete(key);return false}
    state.results=decoratePreferences(cohort.results.slice(0,MAX_RESULTS),state.trip);state.selectedId=providerId(state.results[0])||null;state.lastSearchAt=cohort.sourceSavedAt||cohort.savedAt;state.preferenceResolution=cohort.preferenceResolution||null;state.aiDecision=cohort.aiDecision||null;state.status='ready';state.error=null;state.readNotice='Bereits geladene Orte · Aktualisierung läuft im Hintergrund.';return true;
  }
  function verifiedFitScore(place){
    const fit=place?.groupFit||place?.preferenceFit||{},score=Number(fit?.score??place?.preferenceScore),coverage=Number(fit?.coverage??place?.preferenceCoverage),reasons=[...(place?.preferenceReasons||[]),...(place?.aiReasons||[]),...(place?._luviaReasons||[])].filter(Boolean);
    if(!Number.isFinite(score)||score<=0||score>100||!Number.isFinite(coverage)||coverage<=0||!reasons.length)return null;
    return score;
  }
  function isPreferredPlace(place){return place?.preferenceDiscoveryMatch===true||(place?.preferenceDiscoveryMatch==null&&verifiedFitScore(place)!=null&&place?.preferenceConstraintState==='satisfied')}
  function preferredPlaceIds(source=state.results){
    return new Set((Array.isArray(source)?source:[])
      .filter(place=>Boolean(COMPOSITION().normalizeCoordinates(place?.coordinates||place?.location))&&isPreferredPlace(place))
      .map(providerId));
  }
  const hasDeviceDistance=place=>place?.distanceReference==='device'&&place?.distanceMeters!=null&&Number.isFinite(Number(place.distanceMeters));
  const hasReferenceDistance=place=>['device','destination','map-center'].includes(place?.distanceReference)&&place?.distanceMeters!=null&&Number.isFinite(Number(place.distanceMeters));
  const normalizedPriceLevel=value=>({0:'PRICE_LEVEL_FREE',1:'PRICE_LEVEL_INEXPENSIVE',2:'PRICE_LEVEL_MODERATE',3:'PRICE_LEVEL_EXPENSIVE',4:'PRICE_LEVEL_VERY_EXPENSIVE'}[clean(value)]||clean(value).toUpperCase());
  function placeTypeSet(place){return new Set([place?.primaryType,place?.primary_type,place?.category,...(place?.types||[])].map(clean).filter(Boolean))}
  const normalizedEvidence=value=>clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s-]+/g,'_');
  function hasPrimaryCuisineEvidence(place,type){
    const aliases=HERE_PRIMARY_CUISINE_ALIASES[type];
    if(!aliases||!providerId(place).startsWith('here:'))return true;
    const projected=(place?.providerPrimaryFoodTypes||[]).map(normalizedEvidence);
    const primary=projected.length?projected:(place?.raw?.foodTypes||[]).filter(item=>item?.primary===true).map(item=>normalizedEvidence(item?.name||item?.id));
    return primary.some(value=>aliases.some(alias=>{const expected=normalizedEvidence(alias);return value===expected||value.includes(expected)}));
  }
  function matchesTypeGroup(place,values=[]){if(!values.length)return true;const types=placeTypeSet(place);return values.some(value=>value==='vegetarian_restaurant'?hasVegetarianProviderEvidence(place):value==='vegan_restaurant'?hasVeganProviderEvidence(place):types.has(value)&&hasPrimaryCuisineEvidence(place,value))}
  function activeFilterCount(){return['openNow','rated','rating45','nearby','vegetarian','reservable','accessible'].filter(key=>Boolean(state.filters[key])).length+(state.filters.priceLevels||[]).length+(state.filters.types||[]).length+(state.filters.cuisines||[]).length}
  function filteredResults(source=state.results){const preferred=state.fitOnly?preferredPlaceIds(source):null,rows=(Array.isArray(source)?source:[]).filter(place=>(!state.fitOnly||preferred.has(providerId(place)))&&matchesTypeGroup(place,state.filters.types)&&matchesTypeGroup(place,state.filters.cuisines)&&(!state.filters.openNow||place.openNow===true)&&(!state.filters.rated||Number(place.rating)>0)&&(!state.filters.rating45||Number(place.rating)>=4.5)&&(!state.filters.nearby||(hasReferenceDistance(place)&&Number(place.distanceMeters)<=5000))&&(!state.filters.vegetarian||hasVegetarianProviderEvidence(place))&&(!state.filters.reservable||place.features?.reservable===true)&&(!state.filters.accessible||place.accessibilityOptions?.wheelchairAccessibleEntrance===true)&&(!(state.filters.priceLevels||[]).length||state.filters.priceLevels.includes(normalizedPriceLevel(place.priceLevel))));return rows.sort((left,right)=>state.sort==='rating'?Number(right.rating||0)-Number(left.rating||0):state.sort==='distance'?(hasReferenceDistance(left)?Number(left.distanceMeters):Infinity)-(hasReferenceDistance(right)?Number(right.distanceMeters):Infinity):(verifiedFitScore(right)??Number(right.discoveryScore??right.rating??0))-(verifiedFitScore(left)??Number(left.discoveryScore??left.rating??0)))}
  function ensureVisibleFitResults(source=state.results){
    return filteredResults(source);
  }
  function publicRuntime(filteredCount=filteredResults().length){
    const filteredEmpty=state.status==='ready'&&filteredCount===0;
    return{status:state.offline?'offline':filteredEmpty?'empty':state.status,loading:state.status==='loading',offline:state.offline,error:state.error,settled:['ready','empty','error','offline'].includes(state.status)};
  }
  function model(){const places=ensureVisibleFitResults();return COMPOSITION().compose({sourceContract:'places.v1',categories:state.categories,places,visibleLimit:state.visibleLimit,runtime:publicRuntime(places.length)})}
  function selectedPlace(){return state.results.find(place=>providerId(place)===state.selectedId)||state.results[0]||null}
  function categoryDefinition(key=state.category){return state.categories.find(item=>item.key===key)||state.categories[0]||{key:'activities',label:'Aktivitäten',primaryType:'activity',query:'Aktivitäten Erlebnisse Freizeit'}}
  function categoryFilterDefinition(){return CATEGORY_FILTERS[state.category]||CATEGORY_FILTERS.activities}
  function selectedFilterTypes(){return[...(state.filters.types||[]),...(state.filters.cuisines||[])]}
  function filterTypeLabel(value){const schema=categoryFilterDefinition();return[...(schema.types||schema.subtypes||[]),...(schema.cuisines||[])].find(item=>item[0]===value)?.[1]||value}
  function profileDietaryFocus(){
    const context=preferenceContext()?.snapshot?.()||{},raw=JSON.stringify(context.profilePreferences||{}).toLowerCase();
    return /vegan/.test(raw)?'Vegan':/vegetar/.test(raw)?'Vegetarisch':'';
  }
  function publishProfileEvidenceDiagnostics(patch={}){
    state.preferenceEvidence={...state.preferenceEvidence,...patch};
    const host=state.root?.querySelector?.('[data-places-map]');
    if(!host)return state.preferenceEvidence;
    const values={fitEvidenceState:state.preferenceEvidence.state,fitEvidenceFocus:state.preferenceEvidence.focus,fitEvidenceProvider:state.preferenceEvidence.provider,fitEvidenceReturned:String(state.preferenceEvidence.returned||0),fitEvidenceEligible:String(state.preferenceEvidence.eligible||0),fitEvidenceBefore:String(state.preferenceEvidence.before||0),fitEvidenceAfter:String(state.preferenceEvidence.after||0),fitEvidenceError:state.preferenceEvidence.error};
    for(const [key,value] of Object.entries(values)){if(value==null||value==='')delete host.dataset[key];else host.dataset[key]=value}
    return state.preferenceEvidence;
  }
  function requiresVegetarianEvidence(){
    return state.category==='food'&&(Boolean(state.filters.vegetarian)||(state.filters.cuisines||[]).includes('vegetarian_restaurant'));
  }
  const meatLedVenue=place=>/steak|grillhaus|grillhouse|churrasc|kebab|d[oö]ner|barbecue|bbq/.test(clean([place?.name,place?.primaryType,place?.primaryTypeLabel,...placeTypeSet(place)].join(' ')).toLowerCase());
  function providerDietaryEvidenceText(place){
    const foodTypes=[...(place?.providerPrimaryFoodTypes||[]),...(place?.providerNativeTypes||[]),...(place?.raw?.foodTypes||[]).flatMap(item=>typeof item==='string'?[item]:[item?.name,item?.id])];
    return clean([...(place?.types||[]),...foodTypes,place?.editorialSummary?.text||place?.editorialSummary].filter(Boolean).join(' ')).toLowerCase();
  }
  function hasVegetarianProviderEvidence(place){
    const types=placeTypeSet(place);
    const dedicated=types.has('vegetarian_restaurant')||types.has('vegan_restaurant');
    if(meatLedVenue(place)&&!dedicated)return false;
    if(place?.features?.servesVegetarianFood===false)return false;
    return dedicated||place?.features?.servesVegetarianFood===true||/vegetar|vegan|plant[ _-]?based|pflanzenk[uü]che|fleischlos/.test(providerDietaryEvidenceText(place));
  }
  function hasVeganProviderEvidence(place){
    const types=placeTypeSet(place),dedicated=types.has('vegan_restaurant');
    if(meatLedVenue(place)&&!dedicated)return false;
    if(place?.features?.servesVeganFood===false)return false;
    return dedicated||place?.features?.servesVeganFood===true||/vegan|plant[ _-]?based|rein pflanzlich|pflanzenk[uü]che/.test(providerDietaryEvidenceText(place));
  }
  function activeSearchDefinition(){
    const definition=categoryDefinition(),selected=selectedFilterTypes(),labels=selected.map(filterTypeLabel),dietary=state.category==='food'&&state.filters.vegetarian?'Vegetarisch':'';
    const guided=[dietary,...labels,state.category==='food'&&labels.length?'Restaurant':''].filter(Boolean).join(' ');
    const query=[clean(state.userQuery),guided].filter(Boolean).join(' ')||definition.query;
    return{...definition,includedType:selected.length===1?selected[0]:'',includedTypes:selected,query};
  }
  function notify(message,type='success'){globalThis.LuviaUIKit?.toast?.(message,{type})}

  function decoratePreferences(items,trip=state.trip,{category=state.category,query=state.query}={}){
    const places=Array.isArray(items)?items:[],contract=globalThis.LuviaIntelligenceContractV1,context=preferenceContext()?.snapshot?.()||{};
    const resolver=contract?.reads?.resolveTripPreferences||contract?.resolveTripPreferences,ranker=contract?.reads?.rankPlaceCandidates||contract?.rankPlaceCandidates;
    if(typeof resolver!=='function'||typeof ranker!=='function'||!places.length)return places;
    try{
      const payload={profilePreferences:context.profilePreferences||{},tripComposition:trip?.composition||context.tripComposition||{},trip:trip||context.trip||{}},resolution=resolver(payload),ranked=ranker({...payload,resolution,candidates:places,query,category}),byId=new Map((ranked?.places||[]).map(place=>[providerId(place),place]));
      const blocked=new Set(ranked?.meta?.blockedProviderPlaceIds||[]);
      return places.map(place=>byId.get(providerId(place))||(blocked.has(providerId(place))?{...place,preferenceDiscoveryMatch:false,preferenceConstraintState:'blocked'}:place));
    }catch{return places}
  }
  function mergeKnownPreferenceEvidence(items,knownItems=state.results){
    const knownById=new Map((Array.isArray(knownItems)?knownItems:[]).map(place=>[providerId(place),place]).filter(([id])=>id));
    return (Array.isArray(items)?items:[]).map(place=>{
      const known=knownById.get(providerId(place));
      if(!known)return place;
      return {...known,...place,features:{...(known.features||{}),...(place.features||{})},accessibilityOptions:{...(known.accessibilityOptions||{}),...(place.accessibilityOptions||{})},coordinates:place.coordinates||place.location||known.coordinates||known.location||null};
    });
  }
  function viewportDescriptor(map){
    const raw=map?.getBounds?.(),center=map?.getCenter?.();
    if(!raw||!center)return null;
    const bounds={south:Number(raw.getSouth()),west:Number(raw.getWest()),north:Number(raw.getNorth()),east:Number(raw.getEast())},point={latitude:Number(center.lat),longitude:Number(center.lng)};
    if(!Object.values(bounds).every(Number.isFinite)||!Object.values(point).every(Number.isFinite)||bounds.west>=bounds.east||bounds.south>=bounds.north)return null;
    const latKm=Math.abs(bounds.north-bounds.south)*111.32,lngKm=Math.abs(bounds.east-bounds.west)*111.32*Math.cos(point.latitude*Math.PI/180),radiusMeters=Math.min(50000,Math.max(250,Math.ceil(Math.hypot(latKm,lngKm)*500)));
    return{bounds,center:point,zoom:Number(map.getZoom?.()||0),radiusMeters,key:[bounds.south,bounds.west,bounds.north,bounds.east].map(value=>value.toFixed(4)).join(':')};
  }
  function beginViewportIntent(descriptor){
    // Intent changes with the gesture, not when the provider eventually replies.
    // A category switch during debounce must search the area the user sees.
    state.activeViewport=descriptor;
    state.requestToken++;
    clearTimeout(state.filterRefreshTimer);state.filterRefreshTimer=0;
    state.error=null;
    state.readNotice=null;
    state.status='loading';
    refreshSearchScope();
  }
  function exactProviderKeys(place){
    const keys=new Set(),id=providerId(place);
    if(id)keys.add(id);
    for(const [provider,rawId] of Object.entries(place?.providerRefs||{})){
      const value=clean(rawId).replace(/^places\//,'');
      if(value)keys.add(`${clean(provider).toLowerCase()}:${value}`);
    }
    return keys;
  }
  const normalizedProviderName=place=>clean(place?.name||place?.displayName).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’`]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const providerIdentityName=place=>normalizedProviderName(place).replace(/\beis ?cafe\b/g,' eis ').split(/\s+/).filter(token=>token&&!['der','die','das','cafe','restaurant','bistro','gasthaus','gaststatte'].includes(token)).join('');
  function crossProviderDistanceMeters(left,right){
    const a=COMPOSITION().normalizeCoordinates(left?.coordinates||left?.location),b=COMPOSITION().normalizeCoordinates(right?.coordinates||right?.location);
    if(!a||!b)return Infinity;
    const rad=value=>value*Math.PI/180,dLat=rad(b.latitude-a.latitude),dLng=rad(b.longitude-a.longitude),lat1=rad(a.latitude),lat2=rad(b.latitude),h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
  }
  function strictCrossProviderIdentity(left,right){
    const leftName=providerIdentityName(left),rightName=providerIdentityName(right);
    if(!leftName||leftName!==rightName)return false;
    return crossProviderDistanceMeters(left,right)<=120;
  }
  function verifiedObjectMerge(current={},incoming={}){
    const merged={...(current||{})};
    for(const [key,value] of Object.entries(incoming||{}))if(value!==null&&value!==undefined&&value!=='')merged[key]=value;
    return merged;
  }
  function mergeExactProviderEvidence(cohort,evidenceRows){
    const places=Array.isArray(cohort)?cohort:[],rows=Array.isArray(evidenceRows)?evidenceRows:[],assignments=new Map(),claimed=new Set();
    for(let placeIndex=0;placeIndex<places.length;placeIndex++){
      const keys=exactProviderKeys(places[placeIndex]),evidenceIndex=rows.findIndex((row,index)=>!claimed.has(index)&&[...exactProviderKeys(row)].some(key=>keys.has(key)));
      if(evidenceIndex>=0){assignments.set(placeIndex,{evidence:rows[evidenceIndex],crossProvider:false});claimed.add(evidenceIndex)}
    }
    for(let evidenceIndex=0;evidenceIndex<rows.length;evidenceIndex++){
      if(claimed.has(evidenceIndex))continue;
      const candidates=places.map((place,placeIndex)=>({placeIndex,distance:assignments.has(placeIndex)?Infinity:crossProviderDistanceMeters(place,rows[evidenceIndex])})).filter(candidate=>candidate.distance<=120&&strictCrossProviderIdentity(places[candidate.placeIndex],rows[evidenceIndex])).sort((left,right)=>left.distance-right.distance);
      if(candidates.length){assignments.set(candidates[0].placeIndex,{evidence:rows[evidenceIndex],crossProvider:true});claimed.add(evidenceIndex)}
    }
    return places.map((place,placeIndex)=>{
      const assignment=assignments.get(placeIndex),evidence=assignment?.evidence,crossProviderEvidence=assignment?.crossProvider===true;
      if(!evidence)return place;
      return{
        ...place,
        types:[...new Set([...(place.types||[]),...(evidence.types||[])])],
        providerRefs:{...(place.providerRefs||{}),...(evidence.providerRefs||{})},
        evidence:[...(place.evidence||[]),...(evidence.evidence||[]),...(crossProviderEvidence?[{provider:'multi',kind:'canonical-name-and-max-120m-profile-evidence'}]:[])],
        features:verifiedObjectMerge(place.features,evidence.features),
        accessibilityOptions:verifiedObjectMerge(place.accessibilityOptions,evidence.accessibilityOptions),
        providerFactsCached:place.providerFactsCached===true||evidence.providerFactsCached===true,
        ownerObservedAt:evidence.ownerObservedAt||place.ownerObservedAt||null
      };
    });
  }
  function mergeProfileEvidenceCohort(cohort,evidenceRows,focus='Vegetarisch'){
    const merged=mergeExactProviderEvidence(cohort,evidenceRows),eligible=(Array.isArray(evidenceRows)?evidenceRows:[]).filter(place=>focus==='Vegan'?hasVeganProviderEvidence(place):hasVegetarianProviderEvidence(place)),knownKeys=new Set(merged.flatMap(place=>[...exactProviderKeys(place)]));
    const additions=[];
    for(const place of eligible){
      const keys=[...exactProviderKeys(place)];
      if(keys.some(key=>knownKeys.has(key))||merged.some(existing=>strictCrossProviderIdentity(existing,place))||additions.some(existing=>strictCrossProviderIdentity(existing,place)))continue;
      additions.push(place);for(const key of keys)knownKeys.add(key);
    }
    return [...merged,...additions].slice(0,MAX_RESULTS);
  }
  function profileEvidenceCohortKey(focus=profileDietaryFocus()){
    return [cacheScope(),state.category,focus,...state.results.map(providerId).filter(Boolean)].join('|');
  }
  async function hydrateProfileEvidence(searchToken=state.requestToken,focus=profileDietaryFocus(),key=profileEvidenceCohortKey(focus)){
    const contract=placesContract();
    if(state.category!=='food'||!focus||!state.results.length||!contract?.reads?.recommend){publishProfileEvidenceDiagnostics({state:!focus?'skipped-no-profile-focus':'skipped-unavailable',focus,provider:'',returned:0,eligible:0,before:0,after:0,error:''});return false}
    // The retained free-provider cohort already had its chance to prove a fit.
    // When it contains a verified candidate, keep that result and spend no
    // additional provider budget. Otherwise use the evidence providers directly.
    // Geoapify/OSM remains first because its explicit diet tags can prove the
    // profile fit without touching a bounded provider quota. HERE, Google and
    // Foursquare are fallbacks only when that free evidence cohort is empty.
    if(preferredPlaceIds(state.results).size){const count=preferredPlaceIds(state.results).size;publishProfileEvidenceDiagnostics({state:'free-provider-hit',focus,provider:'free-cascade',returned:0,eligible:count,before:count,after:count,error:''});return false}
    const evidenceType=focus==='Vegan'?'vegan_restaurant':'vegetarian_restaurant',geography=tripGeography(state.trip),context=preferenceContext()?.snapshot?.()||{};
    publishProfileEvidenceDiagnostics({state:'requesting',focus,provider:'geoapify,openstreetmap,here,google,foursquare',returned:0,eligible:0,before:0,after:0,error:''});
    try{
      const response=await contract.reads.recommend({
        // The ordinary map remains on the free-provider cascade. This one
        // cached profile read starts with free Geoapify/OSM dietary evidence,
        // then reaches HERE and the tightly budgeted Google/Foursquare sources
        // only when no free provider can prove a positive fit.
        tripId:tripId(state.trip),text:focus==='Vegan'?'Restaurants und Cafés mit belegtem veganem Angebot':'Restaurants und Cafés mit belegtem vegetarischem Angebot',query:focus==='Vegan'?'Restaurants Cafés veganes Angebot':'Restaurants Cafés vegetarisches Angebot',subjectText:'',userQuery:'',category:'food',destination:geography,destinationContext:geography,candidateLimit:40,limit:40,profilePreferences:{},tripComposition:context.tripComposition||{},trip:state.trip,includedType:evidenceType,includedTypes:[evidenceType],vegetarianOnly:focus!=='Vegan',strictPlaceType:evidenceType,strictDestination:true,maxDistanceMeters:Number(geography.searchRadiusMeters)||3000,sortBy:'distance',providers:['geoapify','openstreetmap','here','google','foursquare'],fastPath:true,parallelFastQueries:false,fastQueryLimit:1,queryVariantLimit:1,providerTimeoutMs:14000
      });
      if(searchToken!==state.requestToken||state.category!=='food'||key!==state.preferenceEvidenceKey)return false;
      const before=preferredPlaceIds(state.results).size;
      const evidenceRows=response?.places||[],eligible=evidenceRows.filter(place=>focus==='Vegan'?hasVeganProviderEvidence(place):hasVegetarianProviderEvidence(place)).length,providerMeta=response?.providerDiagnostics||{},provider=[...(providerMeta.used||[]),...(providerMeta.answered||[]),...(providerMeta.attempted||[])].map(clean).filter(Boolean).filter((value,index,all)=>all.indexOf(value)===index).join(',');
      state.results=decoratePreferences(mergeProfileEvidenceCohort(state.results,evidenceRows,focus),state.trip);
      const after=preferredPlaceIds(state.results).size;
      publishProfileEvidenceDiagnostics({state:after>before?'ready':'empty',focus,provider,returned:evidenceRows.length,eligible,before,after,error:''});
      rememberCategoryCohort();saveCached();
      if(state.mapProjection)updateFilteredMap();else render();
      publishProfileEvidenceDiagnostics();
      return after>before;
    }catch(error){
      if(key===state.preferenceEvidenceKey)state.preferenceEvidenceKey='';
      publishProfileEvidenceDiagnostics({state:'error',focus,provider:'geoapify,openstreetmap,here,google,foursquare',returned:0,eligible:0,before:preferredPlaceIds(state.results).size,after:preferredPlaceIds(state.results).size,error:clean(error?.code||error?.message||'PROFILE_EVIDENCE_UNAVAILABLE').slice(0,120)});
      console.warn('[PlacesSpatial] Bounded profile evidence refresh unavailable.',error?.code||error?.message||error);
      return false;
    }finally{
      if(key===state.preferenceEvidenceKey)state.preferenceEvidenceInflight=null;
    }
  }
  function warmProfileEvidence(searchToken=state.requestToken){
    const focus=profileDietaryFocus();
    if(state.category!=='food'||!focus||!state.results.length){if(state.category==='food')publishProfileEvidenceDiagnostics({state:!focus?'skipped-no-profile-focus':'skipped-no-results',focus,provider:'',returned:0,eligible:0,before:0,after:0,error:''});return}
    const key=profileEvidenceCohortKey(focus);
    if(state.preferenceEvidenceKey===key||state.preferenceEvidenceInflight)return;
    state.preferenceEvidenceKey=key;
    publishProfileEvidenceDiagnostics({state:'scheduled',focus,provider:'geoapify,openstreetmap,here,google,foursquare',returned:0,eligible:0,before:0,after:0,error:''});
    const warmToken=++state.preferenceEvidenceToken;
    const schedule=callback=>typeof globalThis.requestIdleCallback==='function'?globalThis.requestIdleCallback(callback,{timeout:500}):setTimeout(callback,80);
    schedule(()=>{
      if(warmToken!==state.preferenceEvidenceToken||searchToken!==state.requestToken||!state.root?.isConnected)return;
      state.preferenceEvidenceInflight=hydrateProfileEvidence(searchToken,focus,key);
    });
  }
  function viewportTrace(response,{category,viewportKey,resultCount,attempt}){
    const providerRows=response?.providerDiagnostics||[],requestRows=response?.requestDiagnostics||[],providers=[...new Set(providerRows.flatMap(row=>row?.used?.length?row.used:row?.attempted||[]).map(clean).filter(Boolean))];
    return Object.freeze({kind:'viewport',category:clean(category),viewportKey:clean(viewportKey),resultCount:Number(resultCount)||0,attempt:clean(attempt)||'initial',requestId:requestRows.map(row=>clean(row?.requestId)).filter(Boolean).join(',').slice(0,240),provider:providers.join(',').slice(0,120),cacheHit:response?.cache?.hit===true||requestRows.some(row=>row?.cacheHit===true),durationMs:Math.round(requestRows.reduce((sum,row)=>sum+(Number(row?.durationMs)||0),0))});
  }
  function attachViewportTrace(rows,trace){try{Object.defineProperty(rows,'viewportTrace',{value:trace,enumerable:false})}catch{}return rows}
  function publishTraceToHost(host,trace){
    if(!host)return;
    const values={searchKind:trace?.kind,searchCategory:trace?.category,searchViewport:trace?.viewportKey,searchRequestId:trace?.requestId,searchProvider:trace?.provider,searchCache:trace?String(Boolean(trace.cacheHit)):null,searchDurationMs:trace?.durationMs==null?null:String(trace.durationMs),searchResultCount:trace?.resultCount==null?null:String(trace.resultCount),searchAttempt:trace?.attempt,searchError:trace?.errorCode};
    for(const [key,value] of Object.entries(values)){if(value==null||value==='')delete host.dataset[key];else host.dataset[key]=value}
  }
  function publishSearchTrace(trace=state.lastSearchTrace){
    if(trace)state.lastSearchTrace=trace;
    if(state.mapProjection)publishTraceToHost(state.root?.querySelector?.('[data-places-map]'),trace);
  }
  async function viewportSearch({bounds,center,radiusMeters,key='',query='Orte',userQuery='',type='custom',includedType='',includedTypes=[],category=state.category,trip=state.trip,providers=['auto'],openNow=false,minRating=null,minUserRatingCount=0,priceLevels=[],vegetarianOnly=false,reservableOnly=false,accessibleOnly=false,forceRefresh=false,continuityAttempt='initial',continuityEligible=null}={}){
    const reader=placesContract()?.reads?.searchViewport;
    if(!bounds||!center||typeof reader!=='function')throw Object.assign(new Error('Places viewport search is not ready.'),{code:'PLACES_VIEWPORT_UNAVAILABLE'});
    const response=await reader({tripId:tripId(trip),bounds,center,radiusMeters,type,category,userQuery,query:clean(query)||'Orte',includedType,includedTypes,strictTypeFiltering:Boolean(includedType||includedTypes.length),maxResultCount:PROVIDER_PAGE_SIZE,maxViewportResults:MAX_RESULTS,providers,openNow,minRating,minUserRatingCount,priceLevels,vegetarianOnly,reservableOnly,accessibleOnly,forceRefresh,sortBy:'relevance',requestOptions:{timeoutMs:10000}});
    // A viewport refresh may return a deliberately lean provider projection. Keep
    // already verified preference facts for the same immutable provider identity
    // before ranking again, otherwise switching to "Passend" can lose pins that
    // were verified by the richer discovery response moments earlier.
    const candidates=mergeKnownPreferenceEvidence((response?.places||[]).slice(0,MAX_RESULTS),category===state.category?state.results:[]);
    const rows=decoratePreferences(candidates,trip,{category,query}).map(place=>({...place,distanceReference:'map-center'})).filter(place=>(!vegetarianOnly||hasVegetarianProviderEvidence(place))&&(!reservableOnly||place.features?.reservable===true)&&(!accessibleOnly||place.accessibilityOptions?.wheelchairAccessibleEntrance===true)&&placeMatchesActiveCategory(place,category));
    return attachViewportTrace(rows,viewportTrace(response,{category,viewportKey:key,resultCount:rows.length,attempt:continuityAttempt}));
  }
  const CONTINUITY_RETRY_CATEGORIES=new Set(['food','activities','nature','shopping','nightlife','accommodation']);
  function shouldRetryEmptyViewport(options={}){const unfiltered=typeof options.continuityEligible==='boolean'?options.continuityEligible:activeFilterCount()===0;return CONTINUITY_RETRY_CATEGORIES.has(options.category||state.category)&&!clean(options.userQuery)&&unfiltered}
  function transientViewportFailure(error){const code=clean(error?.code);return [502,503,504].includes(Number(error?.status))||/BACKEND_TIMEOUT|NETWORK_UNAVAILABLE|PLACES_(?:ALL_PROVIDERS_FAILED|PROVIDER_READ_UNAVAILABLE)|PROVIDER_(?:TRANSPORT_ERROR|READ_UNAVAILABLE)/.test(code)}
  function transientDestinationFailure(error){const code=clean(error?.code);return [429,502,503,504].includes(Number(error?.status))||/RATE_LIMITED|RATE_LIMIT_COOLDOWN|BACKEND_CIRCUIT_OPEN|BACKEND_TIMEOUT|NETWORK_UNAVAILABLE|PLACES_(?:ALL_PROVIDERS_FAILED|PROVIDER_READ_UNAVAILABLE)|PROVIDER_(?:TRANSPORT_ERROR|READ_UNAVAILABLE)/.test(code)}
  async function viewportSearchWithContinuity(options={},isCurrent=()=>true){
    let first;
    try{first=await viewportSearch(options)}catch(error){
      if(!isCurrent()||!shouldRetryEmptyViewport(options)||!transientViewportFailure(error))throw error;
      return viewportSearch({...options,forceRefresh:true,continuityAttempt:'transient-retry'});
    }
    if(first.length||!isCurrent()||!shouldRetryEmptyViewport(options))return first;
    return viewportSearch({...options,forceRefresh:true,continuityAttempt:'empty-retry'});
  }

  async function loadSaved(lifecycleToken=state.lifecycleToken){
    const contract=placesContract();
    if(!contract?.reads?.listSaved){
      if(lifecycleToken===state.lifecycleToken)state.saved.clear();
      return false;
    }
    try{
      const rows=await contract.reads.listSaved({tripId:tripId(state.trip)});
      if(lifecycleToken!==state.lifecycleToken)return false;
      const before=JSON.stringify([...state.saved.entries()]);
      state.saved.clear();
      for(const item of rows||[])state.saved.set(providerId(item),item);
      return before!==JSON.stringify([...state.saved.entries()]);
    }catch{return false}
  }
  async function enrichCards(items){
    const contract=placesContract();
    if(!contract?.reads?.getCard)return items;
    const enriched=[...items];let cursor=0;
    const worker=async()=>{while(cursor<items.length){const index=cursor++,place=items[index],id=providerId(place);try{const card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720,source:place});if(card?.image)state.images.set(id,card.image);enriched[index]={...place,...(card?.place||{}),image:card?.image||place.image||null}}catch{enriched[index]=place}}};
    await Promise.all([worker(),worker(),worker()]);
    return enriched;
  }
  function placeMatchesActiveCategory(place,categoryKey=state.category){
    try{
      if(globalThis.LuviaGlobalPlaceContracts?.accepts){
        // Category purity only. Do not reuse the category default query as a subject
        // gate — stems like "erlebniss" from "Erlebnisse" would wipe valid activity pins.
        return globalThis.LuviaGlobalPlaceContracts.accepts(place,categoryKey,'',{})!==false;
      }
    }catch{}
    return true;
  }
  function clearVisibleCategoryResults({message='Neue Kategorie wird geladen …'}={}){
    state.results=[];
    state.selectedId=null;
    state.error=null;
    state.status='loading';
    state.lastSearchTrace=Object.freeze({kind:'viewport',category:state.category,viewportKey:state.activeViewport?.key||'',resultCount:0,attempt:'loading',requestId:'',provider:'',cacheHit:false,durationMs:null});
    const mapHost=state.root?.querySelector?.('[data-places-map]');
    if(state.mapProjection){
      try{state.mapProjection.update?.([])}catch{}
      if(mapHost)projectionRefreshState(mapHost,true,message);
      publishSearchTrace();
      refreshMapBrowser();
      refreshMapPreview();
    }else if(state.root)render();
  }
  async function search({query=state.query,userQuery=state.userQuery,category=state.category,focus=true,silent=false,preserveMap=false,replaceCategory=false,_retriedTransient=false}={}){
    const contract=placesContract();
    const token=++state.requestToken;
    const nextCategory=categoryDefinition(category).key;
    const categoryChanged=replaceCategory||nextCategory!==state.category;
    state.mapProjection?.cancelPending?.();
    state.userQuery=clean(userQuery);
    state.query=clean(query)||categoryDefinition(category).query;
    state.category=nextCategory;
    state.visibleLimit=MAX_RESULTS;
    state.error=null;
    state.readNotice=null;
    if(state.offline){state.status='offline';render();return false}
    if(categoryChanged)clearVisibleCategoryResults({message:`${categoryDefinition().label} wird geladen · vorherige Pins werden entfernt.`});
    else if(!silent||!state.results.length){
      state.status='loading';
      if(state.mapProjection)projectionRefreshState(state.root?.querySelector('[data-places-map]'),true,'Neue Orte werden geladen · die aktuelle Karte bleibt sichtbar.');
      else render();
    }
    try{
      if(!contract?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig geladen.'),{publicMessage:'Die Places-Suche ist noch nicht bereit. Bitte ladet die App neu.'});
      const context=preferenceContext()?.snapshot?.()||{},positionContext=globalThis.LuviaTravelContext?.snapshot?.()?.location||null;
      const activeDefinition=activeSearchDefinition(),selectedTypes=selectedFilterTypes();
      const geography=tripGeography(state.trip);
      // First paint always searches the trip destination only. Broader coverage
      // comes solely from deliberate map pan/zoom viewport reads.
      const request={
        tripId:tripId(state.trip),
        text:state.query,
        query:state.query,
        // Do not reuse the category default query as a subject gate.
        subjectText:state.userQuery||'',
        userQuery:state.userQuery||'',
        category:state.category,
        destination:geography,
        destinationContext:geography,
        candidateLimit:60,
        limit:MAX_RESULTS,
        profilePreferences:{},
        tripComposition:context.tripComposition||{},
        trip:state.trip,
        momentContext:state.planningDraft||null,
        positionContext,
        includedType:selectedTypes.length===1?selectedTypes[0]:'',
        includedTypes:selectedTypes,
        openNow:state.filters.openNow,
        minRating:state.filters.rating45?4.5:(state.filters.rated?0.1:null),
        priceLevels:state.filters.priceLevels||[],
        vegetarianOnly:requiresVegetarianEvidence(),
        accessibleOnly:state.filters.accessible,
        reservableOnly:state.filters.reservable,
        strictPlaceType:selectedTypes.length===1?selectedTypes[0]:'',
        strictDestination:true,
        maxDistanceMeters:Number(geography.searchRadiusMeters)||3000,
        sortBy:'distance'
      };
      // Keep every visible map search on the active free-provider cascade. The
      // gateway applies vegetarian/vegan evidence as a hard post-condition, so
      // a disabled richer source can never turn a valid empty result into an
      // unavailable map (and can never admit a meat-led venue as "Passend").
      const searchProviders=['auto'];
      const response=state.activeViewport&&preserveMap?{places:await viewportSearchWithContinuity({...state.activeViewport,query:activeDefinition.query,type:activeDefinition.primaryType,includedType:activeDefinition.includedType,includedTypes:activeDefinition.includedTypes||[],category:state.category,trip:state.trip,userQuery:state.userQuery,providers:searchProviders,vegetarianOnly:requiresVegetarianEvidence(),accessibleOnly:state.filters.accessible,reservableOnly:state.filters.reservable,openNow:state.filters.openNow,minRating:request.minRating,priceLevels:state.filters.priceLevels},()=>token===state.requestToken)}:await contract.reads.recommend({...request,providers:searchProviders,fastPath:true,parallelFastQueries:false,fastQueryLimit:1,queryVariantLimit:1,providerTimeoutMs:6500,candidateLimit:MAX_RESULTS,limit:MAX_RESULTS});
      if(token!==state.requestToken)return false;
      const raw=decoratePreferences((response?.places||[]).slice(0,MAX_RESULTS),state.trip)
        .map(place=>({...place,distanceReference:positionContext&&Number.isFinite(Number(place.distanceMeters))?'device':'destination'}))
        .filter(place=>placeMatchesActiveCategory(place,state.category));
      const trace=response?.places?.viewportTrace||Object.freeze({kind:'destination',category:state.category,viewportKey:'',resultCount:raw.length,attempt:'initial',requestId:'',provider:[...new Set((response?.plan?.attempts||[]).flatMap(item=>item?.providers?.used||[]))].join(',').slice(0,120),cacheHit:Boolean(response?.plan?.attempts?.some(item=>item?.cached||item?.stale)),durationMs:null});
      publishSearchTrace(trace);
      state.results=raw;
      state.preferenceResolution=response?.preferenceResolution||context.resolution||null;
      state.aiDecision=response?.aiMeta||null;
      state.selectedId=providerId(state.results[0])||null;
      state.status=state.results.length?'ready':'empty';
      state.readNotice=response?.plan?.attempts?.some(attempt=>attempt.stale)?'Zuletzt geladene Orte · Aktualisieren ist gerade nicht möglich.':null;
      state.lastSearchAt=(state.readNotice?response?.plan?.attempts?.find(attempt=>attempt.stale)?.ownerObservedAt:null)||new Date().toISOString();
      rememberCategoryCohort();
      saveCached();
      const keepMap=Boolean(preserveMap&&state.mapProjection)||Boolean(state.mapProjection);
      if(keepMap)updateFilteredMap();else render();
      // Map-first: do not fan out deep multi-query discovery. Warm only the first
      // three exact entities after useful pins exist; the shared card cache and
      // gateway budget policy coalesce them and stop provider quota bursts.
      // The first mounted map hydrates its selected preview in mountMap(). A
      // filter refresh must not prefetch details for results the traveler has
      // not opened: pin selection remains the exact on-demand photo trigger.
      // This protects the shared free-provider budget for the next map search.
      return true;
    }catch(error){
      if(token!==state.requestToken)return false;
      const retryable=transientDestinationFailure(error);
      if(!state.results.length&&retryable&&!_retriedTransient){
        await new Promise(resolve=>setTimeout(resolve,1200));
        if(token!==state.requestToken)return false;
        return search({query,userQuery,category,focus:false,silent:true,preserveMap,replaceCategory,_retriedTransient:true});
      }
      // After a category switch, never keep foreign-category pins from the previous search.
      if(filteredResults(state.results).length&&!categoryChanged&&!replaceCategory){
        state.status='ready';
        state.error=null;
        const mapHost=state.root?.querySelector?.('[data-places-map]');
        if(mapHost){
          projectionState(mapHost,'ready','Nachladen fehlgeschlagen · Karte und bisherige Pins bleiben sichtbar.');
          projectionRefreshState(mapHost,false);
        }
        console.warn('[PlacesSpatial] Search refresh kept the visible provider result.',error?.code||error?.message||error);
      }else{
        state.results=[];
        state.selectedId=null;
        state.error={userMessage:error?.publicMessage||null,code:error?.code||'PLACES_SEARCH_FAILED',status:Number(error?.status)||null};
        state.status='error';
        publishSearchTrace(Object.freeze({kind:'viewport',category:state.category,viewportKey:state.activeViewport?.key||'',resultCount:0,attempt:'error',errorCode:state.error.code,requestId:error?.requestId||'',provider:'',cacheHit:false,durationMs:null}));
        if(state.mapProjection){
          try{state.mapProjection.update?.([])}catch{}
          const mapHost=state.root?.querySelector?.('[data-places-map]');
          projectionRefreshState(mapHost,false);
          projectionState(mapHost,'unavailable',state.error.userMessage||'Orte konnten gerade nicht geladen werden. Bitte erneut versuchen.');
          refreshMapPreview();refreshMapBrowser();
        }
        else render();
      }
      return false;
    }
  }

  function categoryMarkup(categories){return categories.map(item=>{
    const meta=categoryMeta[item.key]||{icon:'pin',hint:item.primaryType};
    const active=item.key===state.category;
    return `<button type="button" class="lv-places-spatial__category ${active?'is-active':''}" data-places-category="${esc(item.key)}" aria-pressed="${active}" aria-selected="${active}"><span class="lv-places-spatial__category-icon">${icon(meta.icon)}</span><span class="lv-places-spatial__category-copy"><strong>${esc(item.label)}</strong><small>${esc(meta.hint)}</small></span></button>`;
  }).join('')}
  function mapCategoryMarkup(categories){return categories.map(item=>{
    const active=item.key===state.category;
    return `<button type="button" data-places-category="${esc(item.key)}" aria-pressed="${active}" aria-selected="${active}">${esc(item.label)}</button>`;
  }).join('')}
  function statusMarkup(view){
    const ariaRole=view.status.ariaRole;
    return `<p class="lv-places-spatial__status is-${esc(view.status.kind)}" role="${esc(ariaRole)}" aria-live="${esc(view.status.ariaLive)}">${view.status.busy?'<i aria-hidden="true"></i>':''}<span>${esc(view.status.message)}</span>${view.status.canRetry?'<button type="button" data-places-retry>Erneut versuchen</button>':''}</p>`;
  }
  function filterAvailability(key){
    if(state.filters[key]===true||state.sort===key)return '';
    const rows=state.results||[];
    const predicates={openNow:p=>typeof p.openNow==='boolean',rated:p=>p.rating!=null&&Number(p.rating)>0,rating45:p=>p.rating!=null&&Number(p.rating)>0,rating:p=>p.rating!=null&&Number(p.rating)>0,price:p=>Boolean(p.priceLevel),reservable:p=>typeof p.features?.reservable==='boolean',nearby:hasReferenceDistance,distance:hasReferenceDistance};
    if(['fine_dining_restaurant','hiking_area','concert_hall'].includes(key)&&!rows.some(p=>placeTypeSet(p).has(key)))return 'Für diese Orte fehlt noch eine bestätigte Einordnung.';
    return predicates[key]&&!rows.some(predicates[key])?'Für diese Orte fehlen die nötigen Angaben.':'';
  }
  function filterOption(key,label){const unavailable=filterAvailability(key);return `<button type="button" data-places-filter-option="${esc(key)}" aria-pressed="${Boolean(state.filters[key])}" >${esc(label)}${unavailable?`<small>${esc(unavailable)}</small>`:''}</button>`}
  function filterFactOptions(){
    const facts=categoryFilterDefinition().facts;
    return[
      facts.includes('openNow')?['openNow','Jetzt geöffnet']:null,
      ['rated','Mit Bewertung'],
      facts.includes('rating45')?['rating45','Mindestens 4,5 Sterne']:null,
      facts.includes('nearby')?['nearby',state.activeViewport?'Bis 5 km um die Kartenmitte':'Bis 5 km um das Reiseziel']:null,
      facts.includes('vegetarian')?['vegetarian','Vegetarisch bestätigt']:null,
      facts.includes('reservable')?['reservable','Reservierbar bestätigt']:null,
      facts.includes('accessible')?['accessible','Rollstuhlgerechter Eingang']:null
    ].filter(Boolean);
  }
  function filterSections(){
    const schema=categoryFilterDefinition(),types=schema.types||schema.subtypes||[],sections=[];
    if(types.length)sections.push({key:'types',label:state.category==='food'?'Art':'Typ',options:types.filter(([value])=>Boolean(value)),count:(state.filters.types||[]).length});
    if((schema.cuisines||[]).length)sections.push({key:'cuisines',label:'Landesküche',options:schema.cuisines,count:(state.filters.cuisines||[]).length});
    sections.push({key:'facts',label:'Merkmale',options:filterFactOptions(),count:filterFactOptions().filter(([key])=>state.filters[key]).length});
    if(schema.facts.includes('priceLevel'))sections.push({key:'price',label:'Preisniveau',options:[['PRICE_LEVEL_INEXPENSIVE','€'],['PRICE_LEVEL_MODERATE','€€'],['PRICE_LEVEL_EXPENSIVE','€€€'],['PRICE_LEVEL_VERY_EXPENSIVE','€€€€']],count:(state.filters.priceLevels||[]).length});
    sections.push({key:'sort',label:'Sortierung',options:[['fit','Persönliche Passung'],['rating','Beste Bewertung'],['distance','Kürzeste Entfernung']],count:state.sort==='fit'?0:1});
    return sections;
  }
  function filterMarkup(){
    const sections=filterSections(),active=sections.find(section=>section.key===state.filterSection);
    if(!active)return `<div class="lv-places-spatial__filter-reveal is-open"><aside class="lv-places-spatial__filter-panel" aria-label="${esc(categoryDefinition().label)} filtern"><nav class="lv-places-spatial__filter-sections" aria-label="Filterbereiche">${sections.map(section=>`<button type="button" data-places-filter-section="${esc(section.key)}"><span>${esc(section.label)}</span><small>${section.count?`${section.count} aktiv`:'Auswählen'}</small><i aria-hidden="true">›</i></button>`).join('')}</nav>${activeFilterCount()?'<button type="button" class="lv-places-spatial__filter-reset" data-places-filter-reset>Alle Filter zurücksetzen</button>':''}</aside></div>`;
    const buttons=active.options.map(([value,label])=>{
      if(active.key==='facts')return filterOption(value,label);
      if(active.key==='sort')return `<button type="button"  title="${esc(filterAvailability(value))}" data-places-sort="${esc(value)}" aria-pressed="${state.sort===value}">${esc(label)}${filterAvailability(value)?`<small>${esc(filterAvailability(value))}</small>`:''}</button>`;
      if(active.key==='price')return `<button type="button"  title="${esc(filterAvailability('price'))}" data-places-price="${esc(value)}" aria-pressed="${(state.filters.priceLevels||[]).includes(value)}">${esc(label)}${filterAvailability('price')?`<small>${esc(filterAvailability('price'))}</small>`:''}</button>`;
      return `<button type="button"  title="${esc(filterAvailability(value))}" data-places-subtype="${esc(value)}" data-places-subtype-group="${esc(active.key)}" aria-pressed="${(state.filters[active.key]||[]).includes(value)}">${esc(label)}${filterAvailability(value)?`<small>${esc(filterAvailability(value))}</small>`:''}</button>`;
    }).join('');
    return `<div class="lv-places-spatial__filter-reveal is-open"><aside class="lv-places-spatial__filter-panel" aria-label="${esc(active.label)} filtern"><header class="lv-places-spatial__filter-detail-head"><button type="button" data-places-filter-back aria-label="Zurück zu den Filterbereichen">←</button><strong>${esc(active.label)}</strong><small>Mehrfachauswahl</small></header><div class="lv-places-spatial__filter-options">${buttons}</div></aside></div>`;
  }
  function mapProviderStateMarkup(view){
    if(view.status.kind!=='error')return '';
    return `<div class="lv-places-spatial__map-provider-state is-error" role="alert" aria-live="assertive"><strong>Ortsquellen gerade nicht erreichbar</strong><p>${esc(view.status.message)}</p><button type="button" class="lv-places-spatial__map-provider-retry" data-places-retry>Erneut versuchen</button></div>`;
  }
  function mapDiscoveryToolsMarkup(view){
    const filterCount=activeFilterCount();
    const pinBrowserHidden=view.status.kind==='error'||view.status.kind==='loading';
    return `<div class="lv-places-spatial__map-tools" aria-label="Kartenansicht, Suche, Kategorien und Filter">
      <div class="lv-places-spatial__fit-toggle" role="group" aria-label="Orte nach Passung anzeigen"><button type="button" data-places-fit-mode="all" aria-pressed="${!state.fitOnly}">Alle</button><button type="button" data-places-fit-mode="fit" aria-pressed="${state.fitOnly}">Passend</button></div>
      <div class="lv-places-spatial__map-browser" data-places-map-browser ${pinBrowserHidden?'hidden':''}><button type="button" data-places-map-navigate="previous" aria-label="Vorheriger Pin">←</button><span><b data-places-map-current>${view.counts.markers?Math.max(1,view.markers.findIndex(marker=>marker.providerPlaceId===state.selectedId)+1):0}</b>/<span data-places-map-total>${view.counts.markers}</span></span><button type="button" data-places-map-navigate="next" aria-label="Nächster Pin">→</button></div>
      <button type="button" data-places-map-tool="search" aria-label="Orte suchen" aria-pressed="${state.mapPanel==='search'}" title="Suchen">${icon('search')}</button>
      <button type="button" data-places-map-tool="categories" aria-label="${state.surface==='accommodation'?'Unterkunftsart auswählen':'Place-Kategorie auswählen'}" aria-pressed="${state.mapPanel==='categories'}" title="Kategorien">${icon('grid')}</button>
      <button type="button" data-places-map-tool="filter" aria-label="Ergebnisse filtern${filterCount?` · ${filterCount} aktiv`:''}" aria-pressed="${state.mapPanel==='filter'}" title="Filter">${icon('filter')}${filterCount?`<span class="lv-places-spatial__map-tool-count">${filterCount}</span>`:''}</button>
      <span class="lv-places-spatial__legend-anchor"><button type="button" class="lv-places-spatial__legend-trigger" aria-label="Kartenlegende" aria-describedby="places-map-legend" title="Legende">${icon('info')}</button><span class="lv-places-spatial__legend" id="places-map-legend" role="tooltip"><b>So liest du die Karte</b><span>Die Pinfarben folgen dem vollständigen Luvia-Kompass. „Passend“ zeigt Orte mit belegten Profiltreffern. Offene Eigenschaften wie Kinderwagenzugang stehen in den Details. „Alle“ zeigt die gesamte Kategorie.</span></span></span>
    </div>`;
  }
  function accommodationTypesMarkup(){return `<button type="button" data-places-category="accommodation" aria-pressed="${!state.filters.types.length}">Alle Unterkünfte</button>${CATEGORY_FILTERS.accommodation.types.map(([value,label])=>`<button type="button" data-places-subtype="${value}" data-places-subtype-group="types" aria-pressed="${state.filters.types.includes(value)}">${esc(label)}</button>`).join('')}`}
  function mapDiscoveryPanelsMarkup(){
    return `<div class="lv-places-spatial__map-panels">
      <section class="lv-places-spatial__map-panel is-search" data-places-map-panel="search" ${state.mapPanel==='search'?'':'hidden'} aria-label="Orte suchen"><header class="lv-places-spatial__map-panel-head"><small>Suche</small><button type="button" data-places-map-panel-close aria-label="Suche schließen">×</button></header><form class="lv-places-spatial__map-query" data-places-search novalidate><label for="places-map-query">${icon('search')}<input type="search" enterkeyhint="search" id="places-map-query" name="query" aria-label="Orte suchen" value="${esc(state.userQuery)}" placeholder="Ort oder Wunsch suchen" autocomplete="off"></label></form></section>
      <section class="lv-places-spatial__map-panel" data-places-map-panel="categories" ${state.mapPanel==='categories'?'':'hidden'} aria-label="${state.surface==='accommodation'?'Unterkunftsart auswählen':'Place-Kategorie auswählen'}"><header class="lv-places-spatial__map-panel-head"><small>Kategorie</small><button type="button" data-places-map-panel-close aria-label="Kategorien schließen">×</button></header><nav class="lv-places-spatial__map-categories" aria-label="Kanonische Places-Kategorien aus places.v1">${state.surface==='accommodation'?accommodationTypesMarkup():mapCategoryMarkup(model().categories)}</nav></section>
      <section class="lv-places-spatial__map-panel is-filter" data-places-map-panel="filter" ${state.mapPanel==='filter'?'':'hidden'} aria-label="Ergebnisse filtern"><header class="lv-places-spatial__map-panel-head"><small>Filter · ${esc(categoryDefinition().label)}</small><button type="button" data-places-map-panel-close aria-label="Filter schließen">×</button></header><div data-places-filter-content>${filterMarkup()}</div></section>
    </div>`;
  }
  function priceLabel(value){
    const normalized=clean(value).toUpperCase();
    const map={PRICE_LEVEL_FREE:'Kostenlos',PRICE_LEVEL_INEXPENSIVE:'€',PRICE_LEVEL_MODERATE:'€€',PRICE_LEVEL_EXPENSIVE:'€€€',PRICE_LEVEL_VERY_EXPENSIVE:'€€€€'};
    return map[normalized]||(/^€+$/.test(normalized)?normalized:'');
  }
  function distanceLabel(place){
    const meters=Number(place?.distanceMeters);
    if(!hasDeviceDistance(place)||meters<=0)return'';
    return meters<1000?`${Math.round(meters)} m vom aktuellen Standort`:`${(meters/1000).toFixed(1).replace('.',',')} km vom aktuellen Standort`;
  }
  function matchLabel(place){
    const score=verifiedFitScore(place);
    return Number.isFinite(score)&&score>0?`${Math.round(score)}% persönlich passend`:'';
  }
  function placeCategoryLabel(place){
    // Labels follow the active search category. Type-guessing previously showed
    // "Essen & Trinken" for leftover restaurant pins while Aktivitäten was selected.
    const active=categoryDefinition().label;
    if(!place)return active;
    const type=[place?.primaryType,place?.primary_type,place?.category,...(place?.types||[])].map(clean).join(' ').toLowerCase();
    if(state.category==='food')return'Essen & Trinken';
    if(state.category==='accommodation')return'Unterkunft';
    if(state.category==='nightlife')return'Nachtleben';
    if(state.category==='nature'&&/park|nature|beach|garden/.test(type))return'Natur & Erholung';
    if(state.category==='culture'&&/museum|culture|gallery|historic|cinema|theater/.test(type))return'Kultur';
    if(state.category==='sights'&&/attraction|landmark|sight|monument/.test(type))return'Sehenswürdigkeit';
    if(state.category==='shopping'&&/store|shop|market|mall/.test(type))return'Shopping';
    return active;
  }
  function reason(place,index){
    const ai=(place.aiReasons||[]).map(clean).find(Boolean),preference=(place.preferenceReasons||place._luviaReasons||[]).map(clean).find(Boolean);
    if(ai&&preference&&ai!==preference)return`${ai} ${preference}`;
    if(ai||preference)return ai||preference;
    return index===0?'Noch ohne persönliche KI-Begründung: Provider-Fakten sind belegt, die Passung wird im Ergebnis-Sheet für alle Reisenden eingeordnet.':'Die Fakten sind belegt; eine persönliche Begründung wird erst nach der gemeinsamen Reisenden-Einordnung gezeigt.';
  }
  function preferenceMarkup(){
    const resolution=state.preferenceResolution;
    if(!resolution)return'';
    const profile=(resolution.profileSignals||[]).slice(0,2),trip=(resolution.tripSignals||[]).slice(0,3),constraints=(resolution.hardConstraints||[]).slice(0,3);
    const ai=state.aiDecision?.ranking,aiLabel=ai?.used&&!ai?.fallback?'Luvia-KI ordnet · Fakten sichern ab':ai?.fallback?'Regelbasiert abgesichert · KI gerade nicht verfügbar':'Profil schützt · diese Reise gewichtet';
    return `<aside class="lv-places-spatial__preference" aria-label="So richtet Luvia diese Suche aus"><div><small>Warum diese Reihenfolge?</small><strong>${esc(aiLabel)}</strong></div><ul>${constraints.map(item=>`<li class="is-constraint">${icon('check')}<span><b>${esc(item.label)}</b><small>Feste Anforderung aus deinem Profil</small></span></li>`).join('')}${profile.map(item=>`<li>${icon('compass')}<span><b>${esc(item.label)}</b><small>Globale Vorliebe</small></span></li>`).join('')}${trip.map(item=>`<li class="is-trip">${icon('spark')}<span><b>${esc(item.label)}</b><small>Gefühl nur für diese Reise</small></span></li>`).join('')}</ul></aside>`;
  }
  function rememberViewed(place){
    const id=providerId(place);if(!id)return;
    state.history=[{...place,providerPlaceId:id,viewedAt:Date.now()},...state.history.filter(item=>providerId(item)!==id)].slice(0,6);
    refreshHistory();
  }
  function historyMarkup(){
    const rows=state.history;
    return `<section class="lv-places-spatial__history" data-places-history-region aria-label="Zuletzt auf der Karte angesehen"><header><div><small>Pin-Verlauf</small><strong>${rows.length?'Zuletzt angesehen':'Noch keinen Pin geöffnet'}</strong></div>${rows.length?'<button type="button" data-places-history-clear>Leeren</button>':''}</header><div class="lv-places-spatial__history-list">${rows.map((place,index)=>`<button type="button" data-places-history="${esc(providerId(place))}"><span>${index+1}</span><b>${esc(place.name||'Ort')}</b><small>${esc(place.address||categoryDefinition().label)}</small></button>`).join('')||'<p>Tippt einen Pin an. Nur die von euch geöffneten Orte erscheinen hier – keine zweite Ergebnisliste.</p>'}</div></section>`;
  }
  function refreshHistory(){
    const current=state.root?.querySelector('[data-places-history-region]');if(!current)return;
    const template=document.createElement('template');template.innerHTML=historyMarkup();current.replaceWith(template.content.firstElementChild);
  }
  function mapBrowserPlaces(){return filteredResults().filter(place=>Boolean(COMPOSITION().normalizeCoordinates(place?.coordinates||place?.location)))}
  function mapBrowserPosition(){const rows=mapBrowserPlaces(),index=Math.max(0,rows.findIndex(place=>providerId(place)===state.selectedId));return{rows,index:rows.length?index:0,count:rows.length}}
  function mapPreviewImage(place){
    const image=state.images.get(providerId(place))||place?.image||null;
    return clean(image?.url||image?.uri||image?.photoUri||place?._cardPhotoUri||place?.photoUri||place?.imageUrl);
  }
  function categoryPlaceholder(category='places',compact=false){
    return `<span class="lv-category-image${compact?' is-compact':''}" role="img" aria-label="Kein Foto dieses Ortes verfügbar">${icon('camera')}<small>Noch kein Ortsfoto verfügbar</small></span>`;
  }
  function mapPreviewMarkup(place=findPlace(state.selectedId)){
    const imageUrl=mapPreviewImage(place);
    if(!place)return'<span class="lv-places-spatial__map-preview-empty">Pin auswählen</span>';
    return `<span class="lv-places-spatial__map-preview-cue" aria-hidden="true"><i></i><i></i><i></i></span><button type="button" class="lv-places-spatial__map-preview-open" data-places-preview-open value="${esc(providerId(place))}" aria-label="Details zu ${esc(place.name||'ausgewähltem Ort')} öffnen oder nach oben ziehen">${imageUrl?`<img src="${esc(imageUrl)}" alt="${esc(place.name||'Ausgewählter Ort')}" loading="eager" fetchpriority="high" decoding="async">`:categoryPlaceholder(state.category,true)}<span><small>${esc(placeCategoryLabel(place))}</small><strong>${esc(place.name||'Ausgewählter Ort')}</strong></span></button>`;
  }
  function refreshMapPreview(){
    const preview=state.root?.querySelector('.lv-places-spatial__map-preview');
    if(!preview)return;
    const place=findPlace(state.selectedId);
    preview.__luviaSelectedPlace=place||null;
    preview.innerHTML=mapPreviewMarkup(place);
    preview.hidden=!place;
  }
  async function hydratePlaceImage(place,{refreshSelected=true}={}){
    const id=providerId(place),contract=placesContract();
    if(!id||state.images.has(id)||!contract?.reads?.getCard)return state.images.get(id)||null;
    if(state.imageInflight.has(id))return state.imageInflight.get(id);
    // Photo reads stay on-demand for the selected immutable provider identity.
    // The gateway may enrich only an exact same-name, same-coordinate match.
    const task=(async()=>{try{
      const card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720,source:place});
      if(!card?.place&&!card?.image)return null;
      const nextPlace={...place,...(card.place||{}),features:verifiedObjectMerge(place.features,card?.place?.features),accessibilityOptions:verifiedObjectMerge(place.accessibilityOptions,card?.place?.accessibilityOptions),image:card.image||place.image||null};
      if(!clean(nextPlace.name)||/^(unbenannter ort|unbekannter ort)$/i.test(clean(nextPlace.name)))nextPlace.name=place.name;
      if(card.image)state.images.set(id,card.image);
      state.results=decoratePreferences(state.results.map(row=>providerId(row)===id?nextPlace:row),state.trip);
      if(refreshSelected&&state.selectedId===id)refreshMapPreview();
      if(state.fitOnly&&state.mapProjection)updateFilteredMap();
      return card.image||null;
    }catch{return null}finally{state.imageInflight.delete(id)}})();
    state.imageInflight.set(id,task);
    return task;
  }
  async function hydrateMapPreview(place){return hydratePlaceImage(place,{refreshSelected:true})}
  function warmInitialPhotos(searchToken=state.requestToken){
    const warmToken=++state.photoWarmToken;
    const rows=filteredResults().filter(place=>providerId(place)&&!state.images.has(providerId(place))).slice(0,1);
    const schedule=callback=>typeof globalThis.requestIdleCallback==='function'?globalThis.requestIdleCallback(callback,{timeout:900}):setTimeout(callback,250);
    schedule(async()=>{
      for(const place of rows){
        if(warmToken!==state.photoWarmToken||searchToken!==state.requestToken||!state.root?.isConnected)return;
        await hydratePlaceImage(place,{refreshSelected:true});
      }
    });
  }
  function refreshMapBrowser(){
    const browser=state.root?.querySelector('[data-places-map-browser]');if(!browser)return;
    const position=mapBrowserPosition(),current=browser.querySelector('[data-places-map-current]'),total=browser.querySelector('[data-places-map-total]');
    if(current)current.textContent=String(position.count?position.index+1:0);if(total)total.textContent=String(position.count);
    browser.querySelectorAll('button').forEach(button=>button.disabled=position.count<2);
  }
  function navigateMap(direction){
    const position=mapBrowserPosition();if(!position.count)return;
    const delta=direction==='previous'?-1:1,next=(position.index+delta+position.count)%position.count,place=position.rows[next];
    // Arrow navigation is deliberately locked to the current result set. Only a
    // real traveler pan/zoom may trigger a new viewport request and a new count.
    select(providerId(place),false,false);rememberViewed(place);
  }
  function resultCard(place,index){
    const id=providerId(place),selected=id===state.selectedId,saved=state.saved.get(id),image=state.images.get(id)||place.image,imageUrl=clean(image?.url||image?.uri||image?.photoUri||place?._cardPhotoUri);
    const admission=admissionFor(place);
    const opening=place.openNow===true?{className:'is-open',label:'Geöffnet'}:place.openNow===false?{className:'is-closed',label:'Geschlossen'}:{className:'is-unknown',label:'Öffnung prüfen'};
    const rating=place.rating!=null?`<strong class="lv-places-spatial__fact">${Number(place.rating).toFixed(1).replace('.',',')}</strong><span class="lv-places-spatial__fact">${place.userRatingCount?`${Number(place.userRatingCount).toLocaleString('de-DE')} Bewertungen`:'Bewertung'}</span>`:'';
    const price=priceLabel(place.priceLevel),distance=distanceLabel(place),match=matchLabel(place);
    return `<article class="lv-places-spatial__result-card ${selected?'is-selected':''}" id="place-result-${index+1}" data-place-card="${esc(id)}" aria-current="${selected}" data-compact-place-card>
      <button type="button" class="lv-places-spatial__result-media" data-places-select="${esc(id)}" aria-label="${esc(place.name)} auf der Karte auswählen" aria-pressed="${selected}">
        ${imageUrl?`<img src="${esc(imageUrl)}" alt="${esc(image?.alt||place.name)}" loading="${index<2?'eager':'lazy'}" fetchpriority="${index===0?'high':'auto'}" decoding="async">`:`<span class="lv-places-spatial__image-fallback" role="img" aria-label="Noch kein belegtes Anbieterfoto">${icon(categoryMeta[state.category]?.icon||'pin')}<small>Karte statt ungeprüftem Foto</small></span>`}
        <b class="lv-places-spatial__result-rank">${index+1}</b>
      </button>
      <div class="lv-places-spatial__result-body">
        <div class="lv-places-spatial__result-topline"><span>${esc(placeCategoryLabel(place))} · ${esc(place.address||destination(state.trip))}</span><span class="lv-places-spatial__result-status ${opening.className}">${opening.label}</span></div>
        <h3>${esc(place.name)}</h3>
        <p class="lv-places-spatial__reason">${esc(reason(place,index))}</p>
        <div class="lv-places-spatial__result-facts">${match?`<strong class="lv-places-spatial__fact is-match">${esc(match)}</strong>`:''}${rating}${price?`<span class="lv-places-spatial__fact">${esc(price)}</span>`:''}${distance?`<span class="lv-places-spatial__fact">${esc(distance)}</span>`:''}${saved?`<span class="lv-places-spatial__fact is-saved">${esc(saved.lifecycle==='planned'?'Geplant':'Gespeichert')}</span>`:''}</div>
        ${admission?.relevant?`<div class="lv-places-spatial__admission is-${esc(admission.notice.tone)}"><span>${esc(admission.notice.label)}</span><small>${esc(admission.notice.detail)}</small></div>`:''}
        <div class="lv-places-spatial__result-secondary-actions">
          <button type="button" data-places-maps="${esc(id)}" ${place.coordinates||place.mapsUrl?'':'disabled'}>Route</button>
        </div>
        <div class="lv-places-spatial__result-actions">
          <button type="button" class="lv-places-spatial__result-secondary" data-places-favorite="${esc(id)}" aria-pressed="${saved?.isFavorite===true}">${saved?.isFavorite?'Favorit ✓':'Favorisieren'}</button>
          ${admission?.action?.available?`<button type="button" class="lv-places-spatial__result-secondary" data-places-booking="${esc(id)}">${esc(admission.action.label)}</button>`:''}
          <button type="button" class="lv-places-spatial__result-primary" data-places-plan="${esc(id)}">Zur Timeline hinzufügen</button>
        </div>
      </div>
    </article>`;
  }
  function emptyResultsMarkup(view){
    if(view.status.kind==='loading')return`<div class="lv-places-spatial__state" aria-hidden="true">${Array.from({length:3},()=>'<i class="lv-places-spatial__skeleton"></i>').join('')}</div>`;
    return `<div class="lv-places-spatial__state is-${esc(view.status.kind)}"><span class="lv-places-spatial__state-icon">${icon('compass')}</span><strong>${view.status.kind==='error'?'Ortsquellen gerade nicht erreichbar':'Noch kein verlässlicher Treffer.'}</strong><p>${esc(view.status.message)}</p></div>`;
  }
  function render(){
    if(!state.root)return;
    const renderToken=++state.renderToken;
    destroyMap();
    const view=model();
    state.root.innerHTML=`<section class="lv-places-spatial" role="region" aria-label="${state.surface==='accommodation'?'Luvia Unterkünfte':'Luvia Places'}" data-state="${esc(view.status.kind)}" aria-busy="${view.status.busy}">
      <header class="lv-places-spatial__heading">
        <div class="lv-places-spatial__heading-copy"><h1>${state.surface==='accommodation'?'Wo möchtet ihr übernachten?':'Was möchtet ihr heute entdecken?'}</h1><p><span class="lv-places-spatial__scope">${esc(state.activeViewport?'Im sichtbaren Kartenausschnitt':`${tripGeography(state.trip).searchRadiusMeters/1000} km um ${destination(state.trip)}`)}</span> · <button type="button" data-view="bookings">Buchungen ansehen</button></p></div>
      </header>
      <div class="lv-places-spatial__canvas">
        <section class="lv-places-spatial__map" data-place-map-shell aria-label="Geografisch genaue Luvia-Karte">
          <div class="lv-places-spatial__map-fallback" data-places-map-fallback aria-hidden="true"><i></i><i></i><i></i><span>${icon('map')} Karte wird geladen …</span></div>
          <div class="lv-places-spatial__map-engine" data-places-map role="group" aria-label="Karte mit ${view.counts.markers} koordinatenverifizierten Orten"></div>
          <div class="lv-places-spatial__map-message" data-places-map-message role="status" aria-live="polite" data-state="${view.status.kind==='error'?'unavailable':'loading'}"><i></i><span>${view.status.kind==='error'?esc(view.status.message):'Karte wird aus den echten Ortskoordinaten aufgebaut …'}</span></div>
          ${mapProviderStateMarkup(view)}
          ${mapDiscoveryToolsMarkup(view)}
          <div class="lv-places-spatial__view-controls"><button type="button" data-places-perspective aria-label="${port('OfflineCachePort')?.read('consumer:places-map-perspective')==='2d'?'Zur 3D-Karte wechseln':'Zur 2D-Karte wechseln'}">${port('OfflineCachePort')?.read('consumer:places-map-perspective')==='2d'?'3D':'2D'}</button><button type="button" data-places-recenter aria-label="Zurück zum Reiseziel">${icon('compass')}<span>Reiseziel</span></button></div>
          ${mapDiscoveryPanelsMarkup()}
          <aside class="lv-places-spatial__map-preview" ${selectedPlace()?'':'hidden'} aria-live="polite" aria-label="Kurzvorschau des ausgewählten Pins">${mapPreviewMarkup()}</aside>
        </section>
      </div>
      <div class="lv-trip-map-experiences" data-trip-map-host></div>
      ${historyMarkup()}
    </section>`;
    bind();
    requestAnimationFrame(()=>{if(renderToken===state.renderToken)mountMap(view,renderToken)});
  }

  function setMapMessage(message,stateName='ready'){
    const node=state.root?.querySelector('[data-places-map-message]');
    if(!node)return;
    node.dataset.state=stateName;
    node.querySelector('span').textContent=message;
    const map=node.closest('.lv-places-spatial__map');if(map){map.dataset.mapState=stateName;map.classList.toggle('is-ready',stateName==='ready')}
  }
  function styleCorporateMap(map){
    const paint=(id,prop,value)=>{if(value==null||value==='')return;try{map.setPaintProperty(id,prop,value)}catch{}};
    for(const layer of map.getStyle()?.layers||[]){
      const key=`${layer.id} ${layer['source-layer']||''}`.toLowerCase();
      if(layer.type==='background')paint(layer.id,'background-color',COMPASS_MAP_PALETTE.paper);
      if(layer.type==='fill'){
        if(/water/.test(key))paint(layer.id,'fill-color',COMPASS_MAP_PALETTE.water);
        else if(/park|wood|grass/.test(key))paint(layer.id,'fill-color',COMPASS_MAP_PALETTE.park);
        else if(/building/.test(key))paint(layer.id,'fill-color',COMPASS_MAP_PALETTE.building);
        else if(/landuse|landcover|residential|commercial/.test(key))paint(layer.id,'fill-color',COMPASS_MAP_PALETTE.land);
      }
      if(layer.type==='line'&&/road|street|transport/.test(key)){
        paint(layer.id,'line-color',/motorway|trunk/.test(key)?'#e7c88c':'#fffefd');
        paint(layer.id,'line-opacity',.94);
      }
      if(layer.type==='line'&&/boundary/.test(key))paint(layer.id,'line-opacity',.18);
      if(layer.type==='fill-extrusion'){
        paint(layer.id,'fill-extrusion-color','#e9e3dc');
        paint(layer.id,'fill-extrusion-opacity',.55);
        paint(layer.id,'fill-extrusion-vertical-gradient',true);
      }
      if(layer.type==='symbol'){
        paint(layer.id,'text-color',COMPASS_MAP_PALETTE.ink);
        paint(layer.id,'text-halo-color','rgba(255,255,255,.94)');
        paint(layer.id,'text-halo-width',1.25);
      }
    }
  }
  function markerAnchor(marker,button){
    const anchor=document.createElement('div');
    anchor.className='lv-places-spatial__marker-anchor';
    anchor.classList.toggle('is-selected',button.classList.contains('is-selected'));
    anchor.classList.toggle('is-preferred',marker.preferred===true);
    anchor.style.setProperty('--places-marker-float-delay',`${-((Math.max(1,Number(marker.rank)||1)-1)*.47).toFixed(2)}s`);
    anchor.append(button);
    return anchor;
  }
  function installMissingStyleImageFallback(map,current){
    map.on('styleimagemissing',event=>{
      if(!current()||!event?.id||map.hasImage?.(event.id))return;
      try{map.addImage(event.id,{width:1,height:1,data:new Uint8Array([0,0,0,0])})}catch{}
    });
  }
  function markerButton(marker){
    const button=document.createElement('button');
    button.type='button';
    button.className='lv-places-spatial__marker';
    button.dataset.providerPlaceId=marker.providerPlaceId;
    button.dataset.compassTone=String((marker.rank-1)%12);
    button.setAttribute('aria-label',`${marker.rank}. ${marker.name} auswählen${marker.preferred?' · passt besonders zu euren belegten Vorlieben':''}`);
    button.setAttribute('aria-controls',marker.resultId);
    button.setAttribute('aria-pressed',String(marker.providerPlaceId===state.selectedId));
    button.innerHTML=`<span>${marker.rank}</span><b aria-hidden="true">Passt</b>`;
    button.classList.toggle('is-selected',marker.providerPlaceId===state.selectedId);
    button.classList.toggle('is-preferred',marker.preferred===true);
    button.addEventListener('click',()=>{
      const place=findPlace(marker.providerPlaceId);select(marker.providerPlaceId,false,false);rememberViewed(place);
    });
    return markerAnchor(marker,button);
  }

  function projectionState(container,stateName,message){
    const shell=container?.closest?.('[data-place-map-shell],[data-event-map-shell]');
    if(container)container.dataset.mapState=stateName;
    if(shell){shell.dataset.mapState=stateName;shell.classList.toggle('is-ready',stateName==='ready'||stateName==='empty')}
    const status=shell?.querySelector?.('[data-place-map-status],[data-event-map-status],[data-places-map-message]');
    if(status){
      if(status.matches?.('[data-places-map-message]'))status.dataset.state=stateName==='unavailable'||stateName==='empty'?'unavailable':stateName==='ready'?'ready':'loading';
      const copy=status.querySelector?.('span');if(copy)copy.textContent=stateName==='empty'&&shell?.querySelector?.('[data-places-map-message]')?emptySearchMessage():message;else status.textContent=message;
      if(status.matches?.('[data-places-map-message]'))syncEmptySearchActions(status,stateName==='empty');
    }
  }
  function projectionRefreshState(container,busy,message=''){
    const shell=container?.closest?.('[data-place-map-shell],[data-event-map-shell]');
    if(!shell)return;
    if(busy){shell.dataset.mapRefreshing='true';shell.setAttribute('aria-busy','true')}
    else{delete shell.dataset.mapRefreshing;shell.removeAttribute('aria-busy')}
    const status=shell.querySelector?.('[data-place-map-status],[data-event-map-status],[data-places-map-message]');
    if(status){if(busy)status.querySelector?.('[data-places-empty-actions]')?.remove();status.dataset.refreshing=String(Boolean(busy));const copy=status.querySelector?.('span');if(message){if(copy)copy.textContent=message;else status.textContent=message}}
  }
  function projectionMarkerButton(marker,{selectedId=null,onSelect=null}={}){
    const button=document.createElement('button');
    button.type='button';
    button.className='lv-places-spatial__marker is-inline-projection';
    button.dataset.providerPlaceId=marker.providerPlaceId;
    button.dataset.compassTone=String((marker.rank-1)%12);
    button.setAttribute('aria-label',`${marker.rank}. ${marker.name} auswählen${marker.preferred?' · passt besonders zu euren belegten Vorlieben':''}`);
    button.setAttribute('aria-pressed',String(marker.providerPlaceId===selectedId));
    button.innerHTML=`<span>${marker.rank}</span><b aria-hidden="true">Passt</b>`;
    button.classList.toggle('is-selected',marker.providerPlaceId===selectedId);
    button.classList.toggle('is-preferred',marker.preferred===true);
    button.addEventListener('click',()=>onSelect?.(marker.providerPlaceId,marker));
    return markerAnchor(marker,button);
  }
  function mountProjection(container,places,{selectedId=null,initialCenter=null,onSelect=null,onViewportIntent=null,onViewportSearch=null,projectViewportResults=null,onViewportResults=null,onViewportError=null,category=null,label='Places v1 · verifizierte Geodaten',runtimeStatus=null}={}){
    if(!container)throw new TypeError('Places Map Projection benötigt ein Mount-Ziel.');
    let currentPlaces=Array.isArray(places)?places:[],view=COMPOSITION().compose({sourceContract:'places.v1',places:currentPlaces,visibleLimit:Math.max(1,Math.min(MAX_RESULTS,currentPlaces.length||1)),runtime:{status:'ready',settled:true}});
    let map=null,mapReady=false,alive=true,disconnectObserver=null,viewportTimer=0,viewportRequest=0,lastViewportKey='';const markerInstances=new Map();
    const destroy=()=>{if(!alive)return;alive=false;++viewportRequest;clearTimeout(viewportTimer);projectionRefreshState(container,false);disconnectObserver?.disconnect?.();disconnectObserver=null;for(const marker of markerInstances.values())try{marker.remove?.()}catch{}markerInstances.clear();try{map?.remove?.()}catch{}map=null;container.replaceChildren()};
    const current=()=>alive&&container.isConnected&&map;
    const fallbackCenter=COMPOSITION().normalizeCoordinates(initialCenter);
    if(!view.markers.length&&!fallbackCenter){projectionState(container,'empty','Keine vollständigen Places-Koordinaten für den Kartenstart.');return Object.freeze({view,map:null,destroy})}
    if(!globalThis.maplibregl){projectionState(container,'unavailable','MapLibre ist gerade nicht verfügbar: Die verifizierte Liste bleibt verfügbar.');return Object.freeze({view,map:null,destroy})}
    try{
      const compactMap=globalThis.matchMedia?.('(max-width: 800px)')?.matches,first=fallbackCenter||view.markers[0];
      map=new globalThis.maplibregl.Map({container,style:MAP_STYLE,center:first.lngLat,zoom:13,bearing:0,pitch:port('OfflineCachePort')?.read('consumer:places-map-perspective')==='2d'?0:35,interactive:true,attributionControl:{customAttribution:'Ortsquellen: <a href="https://www.geoapify.com/" target="_blank" rel="noopener">Geoapify</a> · <a href="https://www.tomtom.com/" target="_blank" rel="noopener">© TomTom</a> · <a href="https://www.here.com/" target="_blank" rel="noopener">© HERE</a>'},fadeDuration:reducedMotion()||compactMap?0:320});
      installMissingStyleImageFallback(map,current);
      map.addControl(new globalThis.maplibregl.NavigationControl({showCompass:false,showZoom:true}),'top-left');
      const replaceMarkers=nextPlaces=>{
        if(!current())return view;
        const nextPlacesList=Array.isArray(nextPlaces)?nextPlaces:[],nextView=COMPOSITION().compose({sourceContract:'places.v1',places:nextPlacesList,visibleLimit:Math.max(1,Math.min(MAX_RESULTS,nextPlacesList.length||1)),runtime:{status:'ready',settled:true}}),nextMarkerInstances=new Map();
        try{for(const marker of nextView.markers){const instance=new globalThis.maplibregl.Marker({element:projectionMarkerButton(marker,{selectedId,onSelect}),anchor:'bottom',offset:[0,-5]}).setLngLat(marker.lngLat).addTo(map);nextMarkerInstances.set(marker.providerPlaceId,instance)}}catch(error){for(const marker of nextMarkerInstances.values())try{marker.remove?.()}catch{}throw error}
        for(const marker of markerInstances.values())try{marker.remove?.()}catch{}markerInstances.clear();
        for(const [id,marker] of nextMarkerInstances)markerInstances.set(id,marker);
        currentPlaces=nextPlacesList;view=nextView;container.setAttribute('aria-label',`Karte mit ${view.markers.length} koordinatenverifizierten Orten`);
        return view;
      };
      // DOM pins do not need to wait for map tiles or fonts.
      replaceMarkers(currentPlaces);
      const cancelPending=()=>{viewportRequest++;clearTimeout(viewportTimer);lastViewportKey=''};
      const queueViewportSearch=event=>{
        // Programmatic fit/ease/resize is not a request to explore another area.
        if(!event?.originalEvent||typeof onViewportSearch!=='function'||!current())return;
        const descriptor=viewportDescriptor(map);if(!descriptor||descriptor.key===lastViewportKey)return;
        lastViewportKey=descriptor.key;const token=++viewportRequest;clearTimeout(viewportTimer);
        onViewportIntent?.(descriptor);
        projectionRefreshState(container,true,'Neue Pins werden im Hintergrund geladen …');
        viewportTimer=setTimeout(async()=>{
          if(token!==viewportRequest||!current())return;
          try{
            const raw=await onViewportSearch(descriptor);
            if(token!==viewportRequest||!current())return;
            const rawTrace=raw?.viewportTrace||null;
            const bounds=descriptor.bounds;
            const incoming=(Array.isArray(raw)?raw:[]).filter(place=>{
              const c=COMPOSITION().normalizeCoordinates(place?.coordinates||place?.location);
              return c&&c.latitude>=bounds.south&&c.latitude<=bounds.north&&c.longitude>=bounds.west&&c.longitude<=bounds.east&&placeMatchesActiveCategory(place,category||state.category);
            });
            // Keep the full candidate cohort, project fit only for rendering.
            // A successful empty read replaces old pins just like a nonempty read.
            const shown=typeof projectViewportResults==='function'?projectViewportResults(incoming):incoming;
            const updated=replaceMarkers(shown);
            publishTraceToHost(container,rawTrace);
            onViewportResults?.(incoming,descriptor,updated,rawTrace);
            projectionState(container,updated.markers.length?'ready':'empty',updated.markers.length?`${updated.markers.length} Treffer im sichtbaren Kartenausschnitt.`:'Keine belegten Treffer für diese Auswahl im Kartenausschnitt.');
            projectionRefreshState(container,false);
          }catch(error){
            if(token!==viewportRequest||!current())return;
            lastViewportKey='';
            onViewportError?.(error,descriptor);
            projectionState(container,'ready','Nachladen fehlgeschlagen, bisherige Pins bleiben sichtbar.');
            projectionRefreshState(container,false);
          }
        },350);
      };
      const onMapReady=()=>{
        if(!current()||mapReady)return;
        mapReady=true;
        styleCorporateMap(map);
        replaceMarkers(currentPlaces);
        // First frame must stay on the trip destination. Fitting every marker
        // previously zoomed out to distant outliers and then widened viewport search.
        if(fallbackCenter){
          map.easeTo({center:fallbackCenter.lngLat,zoom:13,duration:reducedMotion()?0:(compactMap?180:420)});
        }else if(view.markers.length>1){
          map.fitBounds(view.bounds.lngLatBounds,{padding:compactMap?38:54,maxZoom:15,duration:reducedMotion()?0:(compactMap?220:560)});
        }else{
          map.easeTo({center:first.lngLat,zoom:view.markers.length?14:12,duration:reducedMotion()?0:(compactMap?180:420)});
        }
        const status=typeof runtimeStatus==='function'?runtimeStatus():runtimeStatus;
        if(status?.kind==='loading'){projectionState(container,'ready','Die Karte ist bereit · Orte werden gesucht …');projectionRefreshState(container,true,'Orte werden gesucht …')}
        else if(status?.kind==='error')projectionState(container,'unavailable',status.message||'Keine verbundene Ortsquelle konnte diese Suche vollständig beantworten.');
        else{
          const summary=view.markers.length?`${label} · ${view.markers.length} von ${view.counts.visible} Treffern mit Owner-Koordinaten.`:`${label} · Keine belegten Treffer mit Koordinaten in dieser Ansicht.`;
          projectionState(container,view.markers.length?'ready':'empty',summary);
        }
        if(typeof onViewportSearch==='function'){map.on('moveend',queueViewportSearch);map.on('dragend',queueViewportSearch);map.on('zoomend',queueViewportSearch);}
        setTimeout(()=>{if(current()){map.resize();state.story?.paintMap?.()}},100);
      };
      map.on('style.load',onMapReady);map.on('load',onMapReady);
      map.on('error',event=>{if(!current())return;if(!mapReady&&!map.loaded())projectionRefreshState(container,true,'Kartendaten laden verzögert · Ortsuche läuft unabhängig weiter.');else if(event?.error)projectionRefreshState(container,false,'Ein Teil der Kartendaten lädt verzögert · Karte und vorhandene Pins bleiben sichtbar.')});
      disconnectObserver=new MutationObserver(()=>{if(!container.isConnected)destroy()});
      disconnectObserver.observe(document.documentElement,{childList:true,subtree:true});
      return Object.freeze({get view(){return view},get map(){return map},update:replaceMarkers,cancelPending,destroy});
    }catch{
      projectionState(container,'unavailable','Die Karte konnte nicht aufgebaut werden; die verifizierte Places-Liste bleibt verfügbar.');
      return Object.freeze({view,map:null,destroy});
    }
  }
  function mountMap(view,renderToken=state.renderToken){
    const container=state.root?.querySelector('[data-places-map]');
    if(!container||renderToken!==state.renderToken)return;
    if(!globalThis.maplibregl){setMapMessage('Die geografische Karte ist gerade nicht verfügbar. Bitte versuche den Kartenausschnitt gleich erneut.','unavailable');return}
    try{
      const def=activeSearchDefinition();
      const target=tripGeography(state.trip),initialCenter=COMPOSITION().normalizeCoordinates(target.location||target.center);
      state.mapProjection=mountProjection(container,ensureVisibleFitResults(),{selectedId:state.selectedId,initialCenter,runtimeStatus:()=>model().status,label:`${def.label} · Live-Kartenausschnitt`,onSelect:id=>{const place=findPlace(id);select(id,false,false);rememberViewed(place)},onViewportIntent:beginViewportIntent,onViewportSearch:descriptor=>{const active=activeSearchDefinition(),category=state.category;return viewportSearchWithContinuity({...descriptor,query:active.query,userQuery:state.userQuery,type:active.primaryType,includedType:active.includedType,includedTypes:active.includedTypes||[],category,trip:state.trip,openNow:state.filters.openNow,minRating:state.filters.rating45?4.5:(state.filters.rated?0.1:null),priceLevels:state.filters.priceLevels||[],vegetarianOnly:requiresVegetarianEvidence(),reservableOnly:state.filters.reservable,accessibleOnly:state.filters.accessible},()=>state.category===category&&state.activeViewport?.key===descriptor.key)},projectViewportResults:rows=>ensureVisibleFitResults(rows),onViewportResults:(rows,descriptor,_view,trace)=>{state.activeViewport=descriptor;state.results=(Array.isArray(rows)?rows:[]).filter(place=>placeMatchesActiveCategory(place));state.status=state.results.length?'ready':'empty';state.error=null;state.lastSearchAt=new Date().toISOString();publishSearchTrace(trace);const visible=ensureVisibleFitResults();state.selectedId=visible.some(place=>providerId(place)===state.selectedId)?state.selectedId:providerId(visible[0])||null;select(state.selectedId,false,false)},onViewportError:error=>{state.status=state.results.length?'ready':'error';state.error=state.results.length?null:{code:error?.code||'PLACES_VIEWPORT_UNAVAILABLE',userMessage:'Der Kartenausschnitt konnte gerade nicht geladen werden.'}}});
      state.map=state.mapProjection?.map||null;
      publishSearchTrace();
      hydrateMapPreview(findPlace(state.selectedId));
    }catch{
      if(renderToken===state.renderToken&&container.isConnected)setMapMessage('Die Karte konnte nicht aufgebaut werden. Bitte versuche den Kartenausschnitt gleich erneut.','unavailable');
    }
  }
  function destroyMap(){
    try{state.mapProjection?.destroy?.()}catch{}
    state.mapProjection=null;
    try{state.map?.remove?.()}catch{}
    state.map=null;
    state.mapMarkers.clear();
  }
  function select(id,scroll=false,moveMap=true){
    const selectionChanged=state.selectedId!==id;
    state.selectedId=id;
    state.root?.querySelectorAll('[data-place-card]').forEach(card=>{
      const selected=card.dataset.placeCard===id;
      card.classList.toggle('is-selected',selected);
      card.setAttribute('aria-current',String(selected));
      card.querySelector('[data-places-select]')?.setAttribute('aria-pressed',String(selected));
    });
    state.root?.querySelectorAll('.lv-places-spatial__marker').forEach(marker=>{
      const selected=marker.dataset.providerPlaceId===id;
      marker.classList.toggle('is-selected',selected);
      marker.setAttribute('aria-pressed',String(selected));
      marker.closest('.lv-places-spatial__marker-anchor')?.classList.toggle('is-selected',selected);
    });
    const card=[...(state.root?.querySelectorAll('[data-place-card]')||[])].find(item=>item.dataset.placeCard===id);
    if(scroll)card?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'nearest',inline:'start'});
    const coordinates=COMPOSITION().normalizeCoordinates(findPlace(id)?.coordinates);
    if(moveMap&&coordinates&&state.map){try{state.map.easeTo({center:coordinates.lngLat,zoom:Math.max(Number(state.map.getZoom?.()||13),14),duration:reducedMotion()?0:520})}catch{}}
    refreshMapBrowser();
    refreshMapPreview();
    hydrateMapPreview(findPlace(id));
    if(selectionChanged)state.story?.selectionChanged?.();
  }
  function findPlace(id){return state.results.find(place=>providerId(place)===id)||state.history.find(place=>providerId(place)===id)||null}
  function openMaps(place){
    const navigationPort=port('ExternalNavigationPort');
    if(place?.mapsUrl)return navigationPort?.open(place.mapsUrl);
    return navigationPort?.openMaps({latitude:place?.coordinates?.latitude,longitude:place?.coordinates?.longitude,label:`${place?.name||''} ${place?.address||''}`.trim(),providerPlaceId:providerId(place)});
  }
  function openExternal(url){
    try{
      const navigationPort=port('ExternalNavigationPort');
      if(!navigationPort?.open)throw new Error('ExternalNavigationPort ist nicht verfügbar.');
      const opened=navigationPort.open(url);
      if(opened===false)notify('Die Website konnte nicht geöffnet werden.','info');
      return opened;
    }catch{
      notify('Dieser externe Link konnte nicht sicher geöffnet werden.','error');
      return false;
    }
  }
  async function importPlace(place,status='idea'){
    const def=categoryDefinition();
    return placesContract().commands.importPlace(providerId(place),{tripId:tripId(state.trip),type:def.primaryType,providerPlace:place,tripPlace:{status}});
  }
  async function favorite(place,button){
    button.disabled=true;
    try{
      let record=state.saved.get(providerId(place));
      if(!record?.tripPlaceId)record=await importPlace(place,'idea');
      const next=record?.isFavorite!==true;
      const command=next?'favorite':'unfavorite';
      await placesContract().commands[command]({tripId:tripId(state.trip),placeType:categoryDefinition().primaryType,tripPlaceId:record.tripPlaceId,placeId:record.id,providerPlaceId:providerId(place)});
      await loadSaved();render();notify(next?'Als Favorit gespeichert.':'Aus Favoriten entfernt.');
    }catch(error){notify(error?.message||'Favorit konnte nicht geändert werden.','error')}
    finally{button.disabled=false}
  }
  async function openBooking(place,button){
    button.disabled=true;
    try{
      const result=await bookingContract()?.commands?.openPlaceBooking?.(place,{source:'consumer.places-spatial',reserveExternalWindow:false});
      if(result?.opened!==true)notify('Für diesen Ort ist gerade kein bestätigter Booking-Weg verfügbar.','info');
    }catch(error){notify(error?.message||'Booking konnte nicht geöffnet werden.','error')}
    finally{button.disabled=false}
  }
  function admissionFor(place){try{return bookingContract()?.reads?.resolveAdmission?.(place)||globalThis.LuviaBookingAdmissionCore?.resolve?.(place)||null}catch{return null}}
  function planningDate(){
    const today=new Date().toISOString().slice(0,10),start=clean(state.trip?.startDate||state.trip?.start_date).slice(0,10),end=clean(state.trip?.endDate||state.trip?.end_date).slice(0,10);
    return start&&today<start?start:end&&today>end?start||today:today;
  }
  function resultSheetInput(places=filteredResults(),selectedId=state.selectedId){
    if(!places.length)return null;
    const navigationPlaces=(places.length>1?places:filteredResults()).filter(place=>providerId(place));
    const selected=navigationPlaces.find(place=>providerId(place)===selectedId)||places.find(place=>providerId(place)===selectedId)||findPlace(selectedId);
    if(!selected){notify('Dieser Ort ist nicht mehr Teil der aktuellen Karte. Bitte die Suche neu laden.','info');return null}
    const selectedIndex=Math.max(0,navigationPlaces.findIndex(place=>providerId(place)===providerId(selected)));
    return{places:[selected],selectedId:providerId(selected),trip:state.trip,query:state.query,source:state.surface==='accommodation'?'hotel-map':'places-search',targetDate:planningDate(),reasons:[categoryDefinition().label,state.query],navigation:{index:selectedIndex,count:navigationPlaces.length},onNavigate:direction=>{if(navigationPlaces.length<2)return;const delta=direction==='previous'?-1:1,index=(selectedIndex+delta+navigationPlaces.length)%navigationPlaces.length,next=navigationPlaces[index];select(providerId(next),false,false);rememberViewed(next);openResultSheet(navigationPlaces,providerId(next))},onSelectionChange:id=>select(id,false,false)};
  }
  function openResultSheet(places=filteredResults(),selectedId=state.selectedId,{interactive=false,origin=null}={}){
    const input=resultSheetInput(places,selectedId);if(!input)return null;
    const api=globalThis.LuviaJourneySuggestions,opener=interactive?api?.openResultsInteractive:api?.openResults;
    if(typeof opener!=='function'){notify('Die einheitliche Ergebnisansicht ist noch nicht bereit.','error');return null}
    return opener(interactive&&origin?{...input,interactiveOrigin:origin}:input);
  }
  function bindMapPreviewGesture(preview,{getPlace,getPlaces,openSheet}={}){
    if(!preview||typeof getPlace!=='function'||typeof openSheet!=='function')return null;
    let pointerId=null,gesturePlace=null,activationPlace=null,activationOrigin=null,startY=0,lastY=0,lastAt=0,releaseVelocity=0,progress=0,maxDistance=0,controller=null,gestureHost=null,backgroundHost=null,suppressClick=false;
    const visiblePreviewPlace=()=>preview.__luviaSelectedPlace||getPlace(clean(preview.querySelector('[data-places-preview-open]')?.value));
    const placesFromSnapshot=place=>{const id=providerId(place),rows=typeof getPlaces==='function'?getPlaces():[];return[place,...(Array.isArray(rows)?rows:[]).filter(item=>providerId(item)!==id)]};
    const gestureOrigin=()=>{const source=preview.getBoundingClientRect(),map=preview.closest('[data-place-map-shell]')?.getBoundingClientRect?.()||source;return{source:{left:source.left,top:source.top,right:source.right,bottom:source.bottom,width:source.width,height:source.height},map:{left:map.left,top:map.top,right:map.right,bottom:map.bottom,width:map.width,height:map.height},viewport:{width:innerWidth,height:innerHeight}}};
    const releaseGestureHost=()=>{if(!gestureHost)return;Object.assign(gestureHost,{onpointermove:null,onpointerup:null,onpointercancel:null});gestureHost=null};
    const restoreModalIsolation=()=>{if(!backgroundHost)return;backgroundHost.inert=true;backgroundHost.setAttribute('aria-hidden','true');backgroundHost=null};
    const beginInteractive=()=>{
      if(controller||!providerId(gesturePlace))return controller;
      controller=openSheet(placesFromSnapshot(gesturePlace),providerId(gesturePlace),{interactive:true,origin:activationOrigin||gestureOrigin()});gestureHost=controller?.overlay||null;
      if(!gestureHost){controller=null;return null}
      backgroundHost=preview;while(backgroundHost?.parentElement&&backgroundHost.parentElement!==document.body)backgroundHost=backgroundHost.parentElement;
      if(backgroundHost){backgroundHost.inert=false;backgroundHost.removeAttribute('aria-hidden');try{preview.setPointerCapture?.(pointerId)}catch{}}
      Object.assign(gestureHost,{onpointermove:move,onpointerup:finish,onpointercancel:cancel});return controller;
    };
    const finish=event=>{
      if(pointerId==null||event.pointerId!==pointerId)return;
      try{preview.releasePointerCapture?.(pointerId)}catch{}
      const dragged=maxDistance>=4,hadController=Boolean(controller),open=Boolean(hadController&&(progress>=.16||releaseVelocity>.34));
      preview.classList.remove('is-dragging');controller?.settle?.(open);
      const releasedPlace=gesturePlace,releasedOrigin=activationOrigin;
      if(hadController||dragged){suppressClick=true;activationPlace=null;activationOrigin=null;setTimeout(()=>{suppressClick=false},0)}
      else{activationPlace=releasedPlace;activationOrigin=releasedOrigin;setTimeout(()=>{if(activationPlace===releasedPlace){activationPlace=null;activationOrigin=null}},0)}
      releaseGestureHost();restoreModalIsolation();pointerId=null;gesturePlace=null;controller=null;progress=0;maxDistance=0;
    };
    const move=event=>{
      if(pointerId==null||event.pointerId!==pointerId)return;const y=Number(event.clientY),now=performance.now(),distance=Math.max(0,startY-y);maxDistance=Math.max(maxDistance,Math.abs(startY-y));releaseVelocity=Math.max(0,(lastY-y)/Math.max(1,now-lastAt));lastY=y;lastAt=now;
      if(distance<1&&!controller)return;if(!controller&&!beginInteractive())return;event.preventDefault();progress=Math.min(1,distance/Math.min(440,Math.max(220,innerHeight*.5)));controller.update?.(progress);
    };
    const cancel=event=>{if(pointerId==null||event.pointerId!==pointerId)return;preview.classList.remove('is-dragging');controller?.settle?.(false);releaseGestureHost();restoreModalIsolation();pointerId=null;gesturePlace=null;activationPlace=null;activationOrigin=null;controller=null;progress=0;maxDistance=0};
    preview.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;gesturePlace=visiblePreviewPlace();activationPlace=gesturePlace;if(!providerId(gesturePlace))return;activationOrigin=gestureOrigin();pointerId=event.pointerId;startY=lastY=Number(event.clientY);lastAt=performance.now();releaseVelocity=0;progress=0;maxDistance=0;preview.classList.add('is-dragging');try{preview.setPointerCapture?.(pointerId)}catch{}});
    preview.addEventListener('pointermove',move);
    preview.addEventListener('pointerup',finish);preview.addEventListener('pointercancel',cancel);
    preview.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();activationPlace=null;activationOrigin=null;return}const place=activationPlace||visiblePreviewPlace(),origin=activationOrigin||gestureOrigin();activationPlace=null;activationOrigin=null;if(!providerId(place))return;openSheet(placesFromSnapshot(place),providerId(place),{interactive:true,origin})?.settle?.(true)});
    return Object.freeze({destroy:()=>{controller?.cancel?.();releaseGestureHost();restoreModalIsolation();pointerId=null;gesturePlace=null;activationPlace=null;activationOrigin=null;controller=null}});
  }
  function bindPreviewGesture(){
    const preview=state.root?.querySelector('.lv-places-spatial__map-preview');
    return bindMapPreviewGesture(preview,{getPlace:id=>findPlace(id||state.selectedId),getPlaces:()=>filteredResults(),openSheet:openResultSheet});
  }
  async function showMore(){
    const previous=state.visibleLimit;
    state.visibleLimit=Math.min(MAX_RESULTS,state.visibleLimit+PAGE_SIZE);
    const missing=state.results.slice(previous,state.visibleLimit).filter(place=>!state.images.has(providerId(place)));
    if(missing.length){
      const enriched=await enrichCards(missing);
      const byId=new Map(enriched.map(place=>[providerId(place),place]));
      state.results=state.results.map(place=>byId.get(providerId(place))||place);
    }
    render();
  }
  function emptySearchMessage(){
    if(state.fitOnly)return 'Für diese Auswahl ist die Passung zu euren Vorlieben noch nicht belegt. „Alle“ zeigt auch ungeprüfte Orte.';
    const scope=state.activeViewport?'im sichtbaren Kartenausschnitt':`im ${tripGeography(state.trip).searchRadiusMeters/1000}-km-Umkreis um ${destination(state.trip)}`;
    return `Noch keine bestätigten Treffer ${scope}. ${state.category==='food'?'Küchenangaben':'Angaben'} können fehlen; das bedeutet nicht, dass es dort keine solchen Orte gibt.`;
  }
  function emptySearchActions(){
    if(state.fitOnly||state.status==='loading'||state.offline)return '';
    const currentRadius=tripGeography(state.trip).searchRadiusMeters;
    const targetRadius=currentRadius<5000?5000:10000;
    const canExpand=!state.activeViewport&&currentRadius<10000;
    const canBroaden=state.category==='food'&&!state.filters.cuisines.includes('asian_restaurant')&&state.filters.cuisines.some(type=>['chinese_restaurant','japanese_restaurant','thai_restaurant','vietnamese_restaurant','korean_restaurant','indian_restaurant'].includes(type));
    return `${canExpand?`<button type="button" data-places-expand-radius data-target-radius="${targetRadius}">Im ${targetRadius/1000}-km-Umkreis suchen</button>`:''}${canBroaden?'<button type="button" data-places-broaden-cuisine>Alle asiatischen Küchen suchen</button>':''}`;
  }
  function syncEmptySearchActions(node,empty){
    node.querySelector?.('[data-places-empty-actions]')?.remove();
    const actions=state.status==='error'?'<button type="button" data-places-retry>Erneut versuchen</button>':empty?emptySearchActions():'';
    if(actions)node.insertAdjacentHTML('beforeend',`<div data-places-empty-actions>${actions}</div>`);
  }
  async function expandDestinationSearch(){
    if(state.activeViewport||state.status==='loading')return;
    const currentRadius=tripGeography(state.trip).searchRadiusMeters;
    const targetRadius=currentRadius<5000?5000:currentRadius<10000?10000:currentRadius;
    if(targetRadius===currentRadius)return;
    clearTimeout(state.filterRefreshTimer);state.searchRadiusMeters=targetRadius;
    const definition=activeSearchDefinition();
    await search({query:definition.query,focus:false,preserveMap:true});
    if(state.activeViewport||state.searchRadiusMeters!==targetRadius)return;
    const center=tripGeography(state.trip).location;
    if(center){const dy=targetRadius/111320,dx=dy/Math.cos(center.latitude*Math.PI/180);state.map?.fitBounds?.([[center.longitude-dx,center.latitude-dy],[center.longitude+dx,center.latitude+dy]],{padding:70,duration:reducedMotion()?0:350});}
  }
  function refreshSearchScope(){
    const scope=state.root?.querySelector('.lv-places-spatial__scope');if(scope)scope.textContent=state.activeViewport?'Im sichtbaren Kartenausschnitt':`${tripGeography(state.trip).searchRadiusMeters/1000} km um ${destination(state.trip)}${state.searchRadiusMeters>=5000?' · einschließlich Umgebung':''}`;
  }
  function updateFilteredMap(){
    syncFilterSelections();
    state.story?.resultsChanged?.();
    refreshSearchScope();
    if(state.root?.dataset)state.root.dataset.state=state.status;
    state.root?.setAttribute?.('aria-busy',String(state.status==='loading'));
    const rows=ensureVisibleFitResults(),view=state.mapProjection?.update?.(rows);
    const mapHost=state.root?.querySelector('[data-places-map]');
    if(mapHost&&state.status!=='loading'){
      projectionRefreshState(mapHost,false);
      projectionState(mapHost,rows.length?'ready':'empty',rows.length?`${rows.length} Orte · ${state.fitOnly?'Passend':'Alle'}`:state.fitOnly?'Für diese Orte ist passende Eignung noch nicht belegt. „Alle“ zeigt die übrigen Orte.':emptySearchMessage());
      if(state.readNotice&&rows.length){
        const notice=state.root?.querySelector('[data-places-map-message]');
        if(notice){notice.dataset.state='unavailable';const copy=notice.querySelector('span');if(copy)copy.textContent=state.readNotice;}
      }
    }
    const count=activeFilterCount(),button=state.root?.querySelector('[data-places-map-tool="filter"]');let badge=button?.querySelector('.lv-places-spatial__map-tool-count');
    if(button){button.setAttribute('aria-label',`Ergebnisse filtern${count?` · ${count} aktiv`:''}`);if(count&&!badge){badge=document.createElement('span');badge.className='lv-places-spatial__map-tool-count';button.append(badge)}else if(!count&&badge){badge.remove();badge=null}}
    if(!rows.some(place=>providerId(place)===state.selectedId))state.selectedId=providerId(rows[0])||null;
    if(badge)badge.textContent=String(count);select(state.selectedId,false,false);
  }
  function setFilterOpen(open,{focus=false}={}){
    state.filterOpen=Boolean(open);
    const trigger=state.root?.querySelector('[data-places-filter]'),reveal=state.root?.querySelector('.lv-places-spatial__filter-reveal');
    trigger?.setAttribute('aria-expanded',String(state.filterOpen));
    reveal?.classList.toggle('is-open',state.filterOpen);
    reveal?.setAttribute('aria-hidden',String(!state.filterOpen));
    if(focus&&state.filterOpen)requestAnimationFrame(()=>reveal?.querySelector('button')?.focus());
  }
  function setMapPanel(panel,{focus=false}={}){
    state.mapPanel=state.mapPanel===panel?null:panel;
    state.filterOpen=state.mapPanel==='filter';
    if(state.filterOpen)refreshFilterPanel();
    if(state.mapPanel!=='filter')state.filterSection=null;
    state.root?.querySelectorAll('[data-places-map-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.placesMapTool===state.mapPanel)));
    state.root?.querySelectorAll('[data-places-map-panel]').forEach(node=>{node.hidden=node.dataset.placesMapPanel!==state.mapPanel});
    if(focus&&state.mapPanel)requestAnimationFrame(()=>state.root?.querySelector(`[data-places-map-panel="${state.mapPanel}"] input, [data-places-map-panel="${state.mapPanel}"] button`)?.focus());
  }
  function refreshFilterPanel({focus=false}={}){
    const host=state.root?.querySelector('[data-places-filter-content]');
    if(!host)return;
    host.innerHTML=filterMarkup();
    if(focus)requestAnimationFrame(()=>host.querySelector('button')?.focus());
  }
  function scheduleFilterSearch(){
    clearTimeout(state.filterRefreshTimer);
    state.filterRefreshTimer=setTimeout(()=>{const def=activeSearchDefinition();search({query:def.query,category:state.category,focus:false,silent:true,preserveMap:true})},260);
  }
  function toggleFilterArray(key,value){
    const current=new Set(state.filters[key]||[]);
    if(current.has(value))current.delete(value);else current.add(value);
    state.filters[key]=[...current];
  }
  function syncFilterSelections(){
    state.root?.querySelectorAll('[data-places-subtype]').forEach(button=>button.setAttribute('aria-pressed',String((state.filters[button.dataset.placesSubtypeGroup]||[]).includes(button.dataset.placesSubtype))));
    if(state.surface==='accommodation')state.root?.querySelectorAll('[data-places-category="accommodation"]').forEach(button=>button.setAttribute('aria-pressed',String(!state.filters.types.length)));
  }
  function applyFilterChange({network=true}={}){
    updateFilteredMap();
    if(network){
      const selected=selectedFilterTypes().map(filterTypeLabel).filter(Boolean).slice(0,2).join(' · '),label=selected||categoryDefinition().label;
      projectionRefreshState(state.root?.querySelector('[data-places-map]'),true,`${label} wird aus den Ortsquellen geladen.`);
      scheduleFilterSearch();
    }
  }
  function applyCategory(key){
    const def=categoryDefinition(key);
    state.searchRadiusMeters=0;
    state.filters=emptyFilters();
    state.userQuery='';
    state.filterSection=null;
    state.category=def.key;
    state.query=def.query;
    const filterTitle=state.root?.querySelector('[data-places-map-panel="filter"] .lv-places-spatial__map-panel-head small');
    if(filterTitle)filterTitle.textContent=`Filter · ${def.label}`;
    state.root?.querySelectorAll('[data-places-category]').forEach(button=>{
      const on=button.dataset.placesCategory===def.key;
      button.classList.toggle('is-active',on);
      button.setAttribute('aria-pressed',String(on));
      button.setAttribute('aria-selected',String(on));
    });
    const filterHost=state.root?.querySelector('[data-places-filter-content]');
    if(filterHost)filterHost.innerHTML=filterMarkup();
    syncFilterSelections();
    // Reuse only an exact, recent cohort for this category and destination. This
    // keeps known correct pins visible while the provider cascade refreshes in
    // the background, without ever showing the previous category under a new label.
    const restored=restoreCategoryCohort(def.key,def.query);
    if(restored){updateFilteredMap();projectionRefreshState(state.root?.querySelector('[data-places-map]'),true,`${def.label} wird im Hintergrund aktualisiert.`)}
    search({query:def.query,category:def.key,preserveMap:true,replaceCategory:!restored,focus:false});
  }
  function bind(){
    const root=state.root;
    if(!state.story&&globalThis.LuviaTripMapExperiences)state.story=globalThis.LuviaTripMapExperiences.create({
      context:()=>({trip:state.trip,surface:state.surface,category:state.category,geography:tripGeography(state.trip),selected:selectedPlace(),results:filteredResults(),map:state.map}),
      select:id=>{if(findPlace(id))select(id,false,false)},
      open:(place,moment)=>globalThis.LuviaJourneySuggestions?.openResults?.({places:[place],selectedId:providerId(place),trip:state.trip,source:'trip-map-experience',...moment}),notify
    });
    state.story?.attach?.(root.querySelector('[data-trip-map-host]'));
    root.querySelector('[data-places-perspective]')?.addEventListener('click',event=>{
      const flat=Number(state.map?.getPitch?.()||0)<10,next=flat?'3d':'2d';
      port('OfflineCachePort')?.write('consumer:places-map-perspective',next);
      state.map?.easeTo?.({pitch:flat?35:0,bearing:0,duration:reducedMotion()?0:400});event.currentTarget.textContent=flat?'2D':'3D';event.currentTarget.setAttribute('aria-label',flat?'Zur 2D-Karte wechseln':'Zur 3D-Karte wechseln');
    });
    root.querySelector('[data-places-recenter]')?.addEventListener('click',()=>{
      const geography=tripGeography(state.trip);state.activeViewport=null;state.mapProjection?.cancelPending?.();
      if(geography.location)state.map?.easeTo?.({center:[geography.location.longitude,geography.location.latitude],zoom:13,duration:reducedMotion()?0:450});
      const def=activeSearchDefinition();search({query:def.query,focus:false,preserveMap:true});
    });
    root.querySelector('[data-places-search]')?.addEventListener('submit',event=>{event.preventDefault();state.userQuery=clean(new FormData(event.currentTarget).get('query'));state.mapPanel=null;state.filterOpen=false;const def=activeSearchDefinition();search({query:def.query,category:state.category})});
    root.querySelectorAll('[data-places-select]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.placesSelect)));
    root.querySelectorAll('[data-places-external]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openExternal(link.dataset.placesExternal)}));
    root.querySelectorAll('[data-places-maps]').forEach(button=>button.addEventListener('click',()=>openMaps(findPlace(button.dataset.placesMaps))));
    root.querySelectorAll('[data-places-favorite]').forEach(button=>button.addEventListener('click',()=>favorite(findPlace(button.dataset.placesFavorite),button)));
    root.querySelectorAll('[data-places-booking]').forEach(button=>button.addEventListener('click',()=>openBooking(findPlace(button.dataset.placesBooking),button)));
    root.querySelectorAll('.lv-places-spatial__result-media img').forEach(image=>image.addEventListener('error',()=>{const host=image.closest('.lv-places-spatial__result-media');if(host){const fallback=document.createElement('span');fallback.className='lv-places-spatial__image-fallback';fallback.setAttribute('role','img');fallback.setAttribute('aria-label','Noch kein belegtes Anbieterfoto');fallback.innerHTML=`${icon(categoryMeta[state.category]?.icon||'pin')}<small>Karte statt ungeprüftem Foto</small>`;image.replaceWith(fallback)}},{once:true}));
    root.querySelectorAll('[data-places-plan]').forEach(button=>button.addEventListener('click',async event=>{
      event.preventDefault();event.stopPropagation();
      const id=button.dataset.placesPlan,place=findPlace(id);
      if(!place){notify('Dieser Ort ist in der aktuellen Places-Auswahl nicht mehr verfügbar. Bitte sucht noch einmal.','error');return}
      try{
        // Ein direkter Karten- oder Plan-Einstieg übergibt ausschließlich die
        // ausdrücklich gewählte Owner-Entität an den gemeinsamen Bottom Sheet.
        await openResultSheet([findPlace(id)].filter(Boolean),id);
      }catch(error){
        console.error('[PlacesSpatialTimelineSheet]',error);
        notify(error?.message||'Die Timeline-Auswahl konnte gerade nicht geöffnet werden.','error');
      }
    }));
    root.querySelector('[data-places-more]')?.addEventListener('click',()=>showMore());
    root.querySelector('[data-places-back-plan]')?.addEventListener('click',()=>globalThis.LuviaApp?.openCompass?.('plan')||globalThis.LuviaApp?.show?.('plan'));
    root.querySelectorAll('[data-places-map-tool]').forEach(button=>button.addEventListener('click',()=>setMapPanel(button.dataset.placesMapTool,{focus:true})));
    root.querySelectorAll('[data-places-map-panel-close]').forEach(button=>button.addEventListener('click',()=>setMapPanel(null)));
    root.querySelector('[data-place-map-shell] [data-places-map]')?.addEventListener('click',event=>{if(event.target.closest?.('.lv-places-spatial__map-panels,.lv-places-spatial__map-tools,.lv-places-spatial__map-preview'))return;if(state.mapPanel)setMapPanel(null)});
    root.querySelectorAll('[data-places-fit-mode]').forEach(button=>button.addEventListener('click',()=>{
      // Re-evaluate the retained provider cohort against the latest Identity
      // snapshot. Toggling the view must never trigger a new provider search.
      state.results=decoratePreferences(state.results,state.trip);
      state.fitOnly=button.dataset.placesFitMode==='fit';
      root.querySelectorAll('[data-places-fit-mode]').forEach(item=>item.setAttribute('aria-pressed',String((item.dataset.placesFitMode==='fit')===state.fitOnly)));
      updateFilteredMap();
      warmProfileEvidence(state.requestToken);
    }));
    root.querySelectorAll('[data-places-map-navigate]').forEach(button=>button.addEventListener('click',()=>navigateMap(button.dataset.placesMapNavigate)));
    bindPreviewGesture();
    if(state.onRootClick)root.removeEventListener?.('click',state.onRootClick);
    state.onRootClick=event=>{
      if(event.target.closest?.('[data-places-retry]')){search({query:activeSearchDefinition().query,focus:false,preserveMap:true});return}
      if(event.target.closest?.('[data-places-expand-radius]')){expandDestinationSearch();return}
      if(event.target.closest?.('[data-places-broaden-cuisine]')){state.filters.cuisines=['asian_restaurant'];refreshFilterPanel();applyFilterChange();return}
      const category=event.target.closest?.('[data-places-category]');if(category){event.preventDefault();event.stopPropagation();applyCategory(category.dataset.placesCategory);return}
      const section=event.target.closest?.('[data-places-filter-section]');if(section){state.filterSection=section.dataset.placesFilterSection;refreshFilterPanel({focus:true});return}
      if(event.target.closest?.('[data-places-filter-back]')){state.filterSection=null;refreshFilterPanel({focus:true});return}
      const option=event.target.closest?.('[data-places-filter-option]');if(option){const key=option.dataset.placesFilterOption;state.filters[key]=!state.filters[key];option.setAttribute('aria-pressed',String(state.filters[key]));applyFilterChange();return}
      const sort=event.target.closest?.('[data-places-sort]');if(sort){state.sort=sort.dataset.placesSort;root.querySelectorAll('[data-places-sort]').forEach(item=>item.setAttribute('aria-pressed',String(item===sort)));applyFilterChange({network:false});return}
      const price=event.target.closest?.('[data-places-price]');if(price){toggleFilterArray('priceLevels',price.dataset.placesPrice);price.setAttribute('aria-pressed',String(state.filters.priceLevels.includes(price.dataset.placesPrice)));applyFilterChange();return}
      const subtype=event.target.closest?.('[data-places-subtype]');if(subtype){const group=subtype.dataset.placesSubtypeGroup;toggleFilterArray(group,subtype.dataset.placesSubtype);subtype.setAttribute('aria-pressed',String(state.filters[group].includes(subtype.dataset.placesSubtype)));applyFilterChange();return}
      if(event.target.closest?.('[data-places-filter-reset]')){state.filters=emptyFilters();state.sort='fit';state.filterSection=null;refreshFilterPanel();applyFilterChange();return}
      const item=event.target.closest?.('[data-places-history]');if(item){const place=state.history.find(row=>providerId(row)===item.dataset.placesHistory);if(place){rememberViewed(place);openResultSheet([place],providerId(place))}return}
      if(event.target.closest?.('[data-places-history-clear]')){state.history=[];refreshHistory()}
    };
    root.addEventListener?.('click',state.onRootClick);
  }

  function bindPreferenceRefresh(){
    const refresh=()=>{
      clearTimeout(state.preferenceRefreshTimer);
      state.preferenceRefreshTimer=setTimeout(()=>{if(state.root&&!state.offline)search({focus:false,silent:true})},800);
    };
    state.preferenceHandlers=['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:profile-changed','luvia:trip-preferences-projected'].map(name=>{globalThis.addEventListener?.(name,refresh);return{name,refresh}});
  }

  async function mount(root,trip,{surface='places'}={}){
    if(!root)throw new TypeError('Places Spatial Experience benötigt ein Mount-Ziel.');
    unmount();
    const lifecycleToken=state.lifecycleToken;
    state.surface=surface==='accommodation'?'accommodation':'places';state.category=state.surface==='accommodation'?'accommodation':'food';state.query=state.surface==='accommodation'?'Unterkünfte':'Restaurant';
    state.root=root;state.trip=trip;state.lastSearchAt=null;state.searchRadiusMeters=0;state.activeViewport=null;state.visibleLimit=MAX_RESULTS;state.status='loading';state.error=null;state.filters=emptyFilters();state.sort='fit';state.fitOnly=false;state.filterOpen=false;state.filterSection=null;state.mapPanel=null;state.userQuery='';state.history=[];state.images.clear();state.imageInflight.clear();state.photoWarmToken++;state.preferenceEvidenceKey='';state.preferenceEvidenceInflight=null;state.preferenceEvidenceToken++;state.preferenceEvidence={state:'idle',focus:'',provider:'',returned:0,eligible:0,before:0,after:0,error:''};state.saved.clear();state.preferenceResolution=null;state.aiDecision=null;state.planningDraft=state.surface==='places'?(preferenceContext()?.consumeDraft?.()||null):null;
    if(state.planningDraft?.query){state.userQuery=clean(state.planningDraft.query);state.query=state.userQuery}
    const contract=placesContract();
    if(!contract?.reads?.categories)throw new Error('places.v1 ist nicht verfügbar.');
    const categories=COMPOSITION().normalizeCategories(contract.reads.categories());
    state.categories=state.surface==='accommodation'?categories.filter(category=>category.key==='accommodation'):categories.filter(category=>category.key!=='accommodation'&&category.primaryType!=='accommodation');
    const networkPort=port('NetworkPort');
    state.offline=networkPort?.isOnline?.()===false;
    const restored=loadCached();
    if(restored)rememberCategoryCohort();
    state.networkUnsubscribe=networkPort?.subscribe?.(snapshot=>{
      const wasOffline=state.offline;
      state.offline=snapshot?.online===false;
      if(state.offline){state.status='offline';render()}
      else if(wasOffline)search({focus:false});
    })||null;
    render();
    if(restored){const selected=findPlace(state.selectedId);if(selected)hydrateMapPreview(selected);warmInitialPhotos(state.requestToken)}
    bindPreferenceRefresh();
    loadSaved(lifecycleToken).then(changed=>{if(changed&&lifecycleToken===state.lifecycleToken&&state.root===root)updateFilteredMap()});
    await Promise.resolve();
    if(lifecycleToken!==state.lifecycleToken||state.root!==root)return false;
    if(!state.offline&&(!restored||Date.now()-Date.parse(state.lastSearchAt||'')>=MAP_CACHE_FRESH_MS))search({focus:false,silent:restored});
    return true;
  }
  function resume(trip){
    if(!state.root?.isConnected||!state.map||!trip||tripId(trip)!==tripId(state.trip)||cacheScope(trip)!==cacheScope())return false;
    state.trip=trip;state.results=decoratePreferences(state.results,trip);state.map.resize?.();updateFilteredMap();
    if(!state.offline&&state.status!=='loading'&&Date.now()-Date.parse(state.lastSearchAt||'1970-01-01')>=MAP_CACHE_FRESH_MS)search({focus:false,silent:true,preserveMap:true});
    return true;
  }
  function unmount(root=null){
    if(root&&state.root!==root)return false;
    state.story?.destroy?.();state.story=null;
    state.lifecycleToken++;
    state.renderToken++;
    state.requestToken++;
    state.photoWarmToken++;
    destroyMap();
    state.networkUnsubscribe?.();state.networkUnsubscribe=null;
    clearTimeout(state.preferenceRefreshTimer);state.preferenceRefreshTimer=0;
    clearTimeout(state.filterRefreshTimer);state.filterRefreshTimer=0;
    for(const item of state.preferenceHandlers)globalThis.removeEventListener?.(item.name,item.refresh);
    state.preferenceHandlers=[];
    state.planningHandle?.close?.('unmount');state.planningHandle=null;
    if(state.root&&state.onRootClick)state.root.removeEventListener?.('click',state.onRootClick);
    state.onRootClick=null;
    if(state.root)state.root.innerHTML='';
    state.root=null;state.trip=null;state.results=[];state.selectedId=null;state.images.clear();state.imageInflight.clear();state.saved.clear();
  }
  function diagnostics(){return{version:VERSION,surface:state.surface,category:state.category,status:state.root?'mounted':'idle',sourceContract:'places.v1',visibleLimit:state.visibleLimit,resultCount:state.results.length,markerCount:state.root?model().counts.markers:0,offline:state.offline,mapRenderer:Boolean(globalThis.maplibregl),profileEvidence:{...state.preferenceEvidence},ports:{NetworkPort:Boolean(port('NetworkPort')),ExternalNavigationPort:Boolean(port('ExternalNavigationPort')),OfflineCachePort:Boolean(port('OfflineCachePort'))},domainTruth:false}}

  globalThis.LuviaPlacesSpatialExperience=Object.freeze({version:VERSION,mount,unmount,resume,search,viewportSearch,viewportSearchWithContinuity,decoratePreferences,mergeProfileEvidenceCohort,transientDestinationFailure,tripGeography,isPreferredPlace,categoryPlaceholder,openResultSheet,mountProjection,bindMapPreviewGesture,styleCorporateMap,compassMapPalette:COMPASS_MAP_PALETTE,diagnostics});
})();
