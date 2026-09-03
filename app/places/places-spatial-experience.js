(() => {
  'use strict';

  const VERSION='1.17.0-selected-pin-preview-gesture';
  const INITIAL_VISIBLE_RESULTS=6;
  const PAGE_SIZE=6;
  const MAX_RESULTS=80;
  const PROVIDER_PAGE_SIZE=20;
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
  const destinationContext=trip=>trip&&typeof trip==='object'?trip:{destinationName:destination(trip)};
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
    nightlife:{icon:'spark',hint:'Bar · Club · Live-Musik'},
    practical:{icon:'route',hint:'Apotheke · Parken · Laden'}
  });
  const emptyFilters=()=>({openNow:false,rated:false,rating45:false,nearby:false,vegetarian:false,reservable:false,accessible:false,priceLevels:[],types:[],cuisines:[]});
  const CATEGORY_FILTERS=Object.freeze({
    food:Object.freeze({label:'Restaurant & Küche',types:Object.freeze([
      ['restaurant','Restaurant'],['cafe','Café'],['bar','Bar'],['bakery','Bäckerei'],['meal_takeaway','Imbiss & Take-away'],['food_court','Food Court'],['fine_dining_restaurant','Fine Dining']
    ]),cuisines:Object.freeze([
      ['italian_restaurant','Italienisch'],['german_restaurant','Deutsch'],['mediterranean_restaurant','Mediterran'],['greek_restaurant','Griechisch'],['french_restaurant','Französisch'],['spanish_restaurant','Spanisch'],['indian_restaurant','Indisch'],['chinese_restaurant','Chinesisch'],['japanese_restaurant','Japanisch'],['thai_restaurant','Thailändisch'],['vietnamese_restaurant','Vietnamesisch'],['korean_restaurant','Koreanisch'],['mexican_restaurant','Mexikanisch'],['middle_eastern_restaurant','Nahöstlich'],['lebanese_restaurant','Libanesisch'],['turkish_restaurant','Türkisch'],['vegetarian_restaurant','Vegetarisch'],['vegan_restaurant','Vegan']
    ]),subtypes:Object.freeze([]),facts:Object.freeze(['openNow','rating45','vegetarian','reservable','accessible','priceLevel'])}),
    activities:Object.freeze({label:'Aktivität',subtypes:Object.freeze([['','Alle'],['amusement_park','Freizeitpark'],['playground','Spielplatz'],['zoo','Zoo'],['spa','Wellness'],['swimming_pool','Schwimmen']]),facts:Object.freeze(['openNow','rating45','accessible'])}),
    themeparks:Object.freeze({label:'Freizeitpark',subtypes:Object.freeze([['','Alle'],['amusement_park','Themenpark'],['amusement_center','Erlebniscenter'],['water_park','Wasserpark']]),facts:Object.freeze(['openNow','rating45','accessible'])}),
    wellness:Object.freeze({label:'Wellness',subtypes:Object.freeze([['','Alle'],['spa','Spa & Wellness']]),facts:Object.freeze(['openNow','rating45','accessible','priceLevel'])}),
    water:Object.freeze({label:'Wassererlebnis',subtypes:Object.freeze([['','Alle'],['water_park','Wasserpark'],['swimming_pool','Schwimmbad'],['beach','Strand'],['marina','Hafen']]),facts:Object.freeze(['openNow','rating45','accessible'])}),
    sights:Object.freeze({label:'Sehenswürdigkeit',subtypes:Object.freeze([['','Alle'],['tourist_attraction','Attraktion'],['historical_landmark','Historisch'],['monument','Denkmal'],['observation_deck','Aussicht']]),facts:Object.freeze(['openNow','rating45','accessible'])}),
    photo:Object.freeze({label:'Motiv',subtypes:Object.freeze([['','Alle'],['observation_deck','Aussicht'],['historical_landmark','Architektur'],['park','Natur'],['garden','Garten']]),facts:Object.freeze(['rating45','accessible'])}),
    culture:Object.freeze({label:'Kulturort',subtypes:Object.freeze([['','Alle'],['museum','Museum'],['art_gallery','Galerie'],['movie_theater','Kino'],['performing_arts_theater','Theater'],['concert_hall','Konzert']]),facts:Object.freeze(['openNow','rating45','accessible'])}),
    nature:Object.freeze({label:'Naturort',subtypes:Object.freeze([['','Alle'],['beach','Strand'],['park','Park'],['garden','Garten'],['hiking_area','Wandern'],['spa','Erholung']]),facts:Object.freeze(['rating45','accessible'])}),
    shopping:Object.freeze({label:'Einkaufen',subtypes:Object.freeze([['','Alle'],['shopping_mall','Center'],['market','Markt'],['clothing_store','Mode'],['department_store','Kaufhaus']]),facts:Object.freeze(['openNow','rating45','accessible','priceLevel'])}),
    malls:Object.freeze({label:'Einkaufszentrum',subtypes:Object.freeze([['','Alle'],['shopping_mall','Shopping Center'],['department_store','Kaufhaus']]),facts:Object.freeze(['openNow','rating45','accessible','priceLevel'])}),
    nightlife:Object.freeze({label:'Abendort',subtypes:Object.freeze([['','Alle'],['bar','Bar'],['night_club','Club'],['concert_hall','Live-Musik']]),facts:Object.freeze(['openNow','rating45','accessible','priceLevel'])}),
    practical:Object.freeze({label:'Praktischer Ort',subtypes:Object.freeze([['','Alle'],['pharmacy','Apotheke'],['supermarket','Supermarkt'],['parking','Parken'],['electric_vehicle_charging_station','Laden'],['atm','Geldautomat']]),facts:Object.freeze(['openNow','nearby','accessible'])})
  });
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
    root:null,trip:null,categories:[],category:'food',query:'Ruhiges Restaurant am Wasser',userQuery:'',results:[],visibleLimit:MAX_RESULTS,
    status:'loading',error:null,offline:false,selectedId:null,images:new Map(),saved:new Map(),map:null,mapMarkers:new Map(),filters:emptyFilters(),sort:'fit',fitOnly:false,filterOpen:false,filterSection:null,mapPanel:null,history:[],
    requestToken:0,lifecycleToken:0,renderToken:0,networkUnsubscribe:null,preferenceHandlers:[],preferenceRefreshTimer:0,filterRefreshTimer:0,planningHandle:null,mapProjection:null,lastSearchAt:null,preferenceResolution:null,aiDecision:null,planningDraft:null
  };

  function cacheKey(){return `consumer:places-spatial:${tripId(state.trip)||'active'}`}
  function loadCached(){
    try{
      const cached=port('OfflineCachePort')?.read(cacheKey(),null);
      if(!cached||!Array.isArray(cached.results))return false;
      state.results=cached.results.slice(0,MAX_RESULTS);
      state.query=clean(cached.query)||state.query;
      state.category=clean(cached.category)||state.category;
      state.selectedId=providerId(state.results[0])||null;
      state.status=state.offline?'offline':'ready';
      return state.results.length>0;
    }catch{return false}
  }
  function saveCached(){
    try{port('OfflineCachePort')?.write(cacheKey(),{query:state.query,category:state.category,results:state.results.slice(0,MAX_RESULTS),savedAt:new Date().toISOString()})}catch{}
  }
  function verifiedFitScore(place){
    const fit=place?.groupFit||place?.preferenceFit||{},score=Number(fit?.score??place?.preferenceScore),coverage=Number(fit?.coverage??place?.preferenceCoverage),reasons=[...(place?.preferenceReasons||[]),...(place?.aiReasons||[]),...(place?._luviaReasons||[])].filter(Boolean);
    if(!Number.isFinite(score)||score<=0||score>100||!Number.isFinite(coverage)||coverage<=0||!reasons.length)return null;
    return score;
  }
  function preferredPlaceIds(source=state.results){
    return new Set((Array.isArray(source)?source:[])
      .filter(place=>Boolean(COMPOSITION().normalizeCoordinates(place?.coordinates||place?.location))&&verifiedFitScore(place)!=null&&place?.preferenceConstraintState==='satisfied')
      .map(providerId));
  }
  const hasDeviceDistance=place=>place?.distanceReference==='device'&&Number.isFinite(Number(place?.distanceMeters));
  const normalizedPriceLevel=value=>({0:'PRICE_LEVEL_FREE',1:'PRICE_LEVEL_INEXPENSIVE',2:'PRICE_LEVEL_MODERATE',3:'PRICE_LEVEL_EXPENSIVE',4:'PRICE_LEVEL_VERY_EXPENSIVE'}[clean(value)]||clean(value).toUpperCase());
  function placeTypeSet(place){return new Set([place?.primaryType,place?.primary_type,place?.category,...(place?.types||[])].map(clean).filter(Boolean))}
  function matchesTypeGroup(place,values=[]){if(!values.length)return true;const types=placeTypeSet(place);return values.some(value=>types.has(value))}
  function activeFilterCount(){return['openNow','rated','rating45','nearby','vegetarian','reservable','accessible'].filter(key=>Boolean(state.filters[key])).length+(state.filters.priceLevels||[]).length+(state.filters.types||[]).length+(state.filters.cuisines||[]).length}
  function filteredResults(source=state.results){const preferred=state.fitOnly?preferredPlaceIds(source):null,rows=(Array.isArray(source)?source:[]).filter(place=>(!state.fitOnly||preferred.has(providerId(place)))&&matchesTypeGroup(place,state.filters.types)&&matchesTypeGroup(place,state.filters.cuisines)&&(!state.filters.openNow||place.openNow===true)&&(!state.filters.rated||Number(place.rating)>0)&&(!state.filters.rating45||Number(place.rating)>=4.5)&&(!state.filters.nearby||(hasDeviceDistance(place)&&Number(place.distanceMeters)<=5000))&&(!state.filters.vegetarian||hasVegetarianProviderEvidence(place))&&(!state.filters.reservable||place.features?.reservable===true)&&(!state.filters.accessible||place.accessibilityOptions?.wheelchairAccessibleEntrance===true)&&(!(state.filters.priceLevels||[]).length||state.filters.priceLevels.includes(normalizedPriceLevel(place.priceLevel))));return rows.sort((left,right)=>state.sort==='rating'?Number(right.rating||0)-Number(left.rating||0):state.sort==='distance'?(hasDeviceDistance(left)?Number(left.distanceMeters):Infinity)-(hasDeviceDistance(right)?Number(right.distanceMeters):Infinity):(verifiedFitScore(right)??Number(right.discoveryScore??right.rating??0))-(verifiedFitScore(left)??Number(left.discoveryScore??left.rating??0)))}
  function publicRuntime(filteredCount=filteredResults().length){
    const filteredEmpty=state.status==='ready'&&state.results.length>0&&filteredCount===0;
    return{status:state.offline?'offline':filteredEmpty?'empty':state.status,loading:state.status==='loading',offline:state.offline,error:state.error,settled:['ready','empty','error','offline'].includes(state.status)};
  }
  function model(){const places=filteredResults();return COMPOSITION().compose({sourceContract:'places.v1',categories:state.categories,places,visibleLimit:state.visibleLimit,runtime:publicRuntime(places.length)})}
  function selectedPlace(){return state.results.find(place=>providerId(place)===state.selectedId)||state.results[0]||null}
  function categoryDefinition(key=state.category){return state.categories.find(item=>item.key===key)||state.categories[0]||{key:'activities',label:'Aktivitäten',primaryType:'activity',query:'Aktivitäten Erlebnisse Freizeit'}}
  function categoryFilterDefinition(){return CATEGORY_FILTERS[state.category]||CATEGORY_FILTERS.activities}
  function selectedFilterTypes(){return[...(state.filters.types||[]),...(state.filters.cuisines||[])]}
  function filterTypeLabel(value){const schema=categoryFilterDefinition();return[...(schema.types||schema.subtypes||[]),...(schema.cuisines||[])].find(item=>item[0]===value)?.[1]||value}
  function profileDietaryFocus(){
    const context=preferenceContext()?.snapshot?.()||{},raw=JSON.stringify(context.profilePreferences||{}).toLowerCase();
    return /vegan/.test(raw)?'Vegan':/vegetar/.test(raw)?'Vegetarisch':'';
  }
  function requiresVegetarianEvidence(){
    return state.category==='food'&&Boolean(state.filters.vegetarian||/^(?:Vegetarisch|Vegan)$/.test(profileDietaryFocus()));
  }
  function hasVegetarianProviderEvidence(place){
    const types=placeTypeSet(place),text=clean([place?.name,place?.primaryType,place?.primaryTypeLabel,...types].join(' ')).toLowerCase();
    return place?.features?.servesVegetarianFood===true||types.has('vegetarian_restaurant')||types.has('vegan_restaurant')||/vegetar|vegan|plant[ _-]?based|pflanzenk[uü]che/.test(text);
  }
  function activeSearchDefinition(){
    const definition=categoryDefinition(),selected=selectedFilterTypes(),labels=selected.map(filterTypeLabel),dietary=state.category==='food'?profileDietaryFocus():'';
    const guided=[dietary,...labels,state.category==='food'&&labels.length?'Restaurant':''].filter(Boolean).join(' ');
    const query=[clean(state.userQuery),guided].filter(Boolean).join(' ')||definition.query;
    return{...definition,includedType:selected.length===1?selected[0]:(selected.length?'':definition.includedType||''),includedTypes:selected,query};
  }
  function notify(message,type='success'){globalThis.LuviaUIKit?.toast?.(message,{type})}

  function decoratePreferences(items,trip=state.trip){
    const places=Array.isArray(items)?items:[],contract=globalThis.LuviaIntelligenceContractV1,context=preferenceContext()?.snapshot?.()||{};
    const resolver=contract?.reads?.resolveTripPreferences||contract?.resolveTripPreferences,ranker=contract?.reads?.rankPlaceCandidates||contract?.rankPlaceCandidates;
    if(typeof resolver!=='function'||typeof ranker!=='function'||!places.length)return places;
    try{
      const payload={profilePreferences:context.profilePreferences||{},tripComposition:context.tripComposition||{},trip:context.trip||trip||{}},resolution=resolver(payload),ranked=ranker({...payload,resolution,candidates:places,query:state.query,category:state.category}),byId=new Map((ranked?.places||[]).map(place=>[providerId(place),place]));
      return places.map(place=>byId.get(providerId(place))||place);
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
  async function viewportSearch({bounds,center,radiusMeters,query='Orte',type='custom',includedType='',includedTypes=[],trip=state.trip,providers=['google','foursquare'],openNow=false,minRating=null,minUserRatingCount=0,priceLevels=[],vegetarianOnly=false,reservableOnly=false,accessibleOnly=false}={}){
    const reader=placesContract()?.reads?.searchViewport;
    if(!bounds||!center||typeof reader!=='function')return[];
    const response=await reader({tripId:tripId(trip),bounds,center,radiusMeters,type,query:clean(query)||'Orte',includedType,includedTypes,strictTypeFiltering:Boolean(includedType),maxResultCount:PROVIDER_PAGE_SIZE,maxViewportResults:MAX_RESULTS,providers,openNow,minRating,minUserRatingCount,priceLevels,vegetarianOnly,sortBy:'relevance',requestOptions:{timeoutMs:8000}});
    // A viewport refresh may return a deliberately lean provider projection. Keep
    // already verified preference facts for the same immutable provider identity
    // before ranking again, otherwise switching to "Passend" can lose pins that
    // were verified by the richer discovery response moments earlier.
    const candidates=mergeKnownPreferenceEvidence((response?.places||[]).slice(0,MAX_RESULTS));
    const rows=decoratePreferences(candidates,trip);
    return rows.filter(place=>(!vegetarianOnly||hasVegetarianProviderEvidence(place))&&(!reservableOnly||place.features?.reservable===true)&&(!accessibleOnly||place.accessibilityOptions?.wheelchairAccessibleEntrance===true));
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
    const worker=async()=>{while(cursor<items.length){const index=cursor++,place=items[index],id=providerId(place);try{const card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});if(card?.image)state.images.set(id,card.image);enriched[index]={...place,...(card?.place||{}),image:card?.image||place.image||null}}catch{enriched[index]=place}}};
    await Promise.all([worker(),worker(),worker()]);
    return enriched;
  }
  async function search({query=state.query,category=state.category,focus=true,silent=false,preserveMap=false}={}){
    const contract=placesContract();
    const token=++state.requestToken;
    state.query=clean(query)||categoryDefinition(category).query;
    state.category=categoryDefinition(category).key;
    state.visibleLimit=MAX_RESULTS;
    state.error=null;
    if(state.offline){state.status='offline';render();return false}
    if(!silent||!state.results.length){
      state.status='loading';
      if(state.results.length&&state.mapProjection)projectionRefreshState(state.root?.querySelector('[data-places-map]'),true,'Neue Orte werden geladen · die aktuelle Karte bleibt sichtbar.');
      else render();
    }
    try{
      if(!contract?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig geladen.'),{publicMessage:'Die Places-Suche ist noch nicht bereit. Bitte ladet die App neu.'});
      const context=preferenceContext()?.snapshot?.()||{},positionContext=globalThis.LuviaTravelContext?.snapshot?.()?.location||null;
      const activeDefinition=activeSearchDefinition(),selectedTypes=selectedFilterTypes();
      const request={
        tripId:tripId(state.trip),
        text:state.query,
        query:state.query,
        category:state.category,
        destination:destination(state.trip),
        destinationContext:destinationContext(context.trip||state.trip),
        candidateLimit:60,
        limit:MAX_RESULTS,
        profilePreferences:context.profilePreferences||{},
        tripComposition:context.tripComposition||{},
        trip:context.trip||state.trip,
        momentContext:state.planningDraft||null,
        positionContext,
        includedType:selectedTypes.length===1?selectedTypes[0]:'',
        includedTypes:selectedTypes,
        openNow:state.filters.openNow,
        minRating:state.filters.rating45?4.5:(state.filters.rated?0.1:null),
        priceLevels:state.filters.priceLevels||[],
        vegetarianOnly:requiresVegetarianEvidence(),
        strictPlaceType:selectedTypes.length===1?selectedTypes[0]:activeDefinition.primaryType
      };
      const response=await contract.reads.recommend({...request,fastPath:true,parallelFastQueries:false,fastQueryLimit:1,queryVariantLimit:1,providerTimeoutMs:6500,candidateLimit:20,limit:Math.min(12,MAX_RESULTS)});
      if(token!==state.requestToken)return false;
      const raw=(response?.places||[]).slice(0,MAX_RESULTS).map(place=>({...place,distanceReference:positionContext&&Number.isFinite(Number(place.distanceMeters))?'device':null}));
      state.results=raw;
      state.preferenceResolution=response?.preferenceResolution||context.resolution||null;
      state.aiDecision=response?.aiMeta||null;
      state.selectedId=providerId(state.results[0])||null;
      state.status=state.results.length?'ready':'empty';
      state.lastSearchAt=new Date().toISOString();
      saveCached();
      if(preserveMap&&state.mapProjection)updateFilteredMap();else render();
      const shouldDeepen=raw.length<INITIAL_VISIBLE_RESULTS;
      const enrichmentTasks=[
        enrichCards(raw.slice(0,INITIAL_VISIBLE_RESULTS)),
        shouldDeepen?contract.reads.recommend({...request,fastPath:false,queryVariantLimit:5,providerTimeoutMs:8000,candidateLimit:60,limit:MAX_RESULTS,diversity:{minimumQueryVariants:3,rotateAcrossQueries:true}}):Promise.resolve(null)
      ];
      Promise.allSettled(enrichmentTasks).then(results=>{
        if(token!==state.requestToken||!state.root)return;
        const cards=results[0]?.status==='fulfilled'?results[0].value:[],deep=results[1]?.status==='fulfilled'?results[1].value:null,byId=new Map(cards.map(place=>[providerId(place),place]));
        const enriched=(deep?.places?.length?deep.places:state.results).slice(0,MAX_RESULTS).map(place=>({...place,...(byId.get(providerId(place))||{}),distanceReference:positionContext&&Number.isFinite(Number(place.distanceMeters))?'device':null}));
        if(enriched.length){state.results=enriched;state.status='ready';state.error=null;state.preferenceResolution=deep?.preferenceResolution||state.preferenceResolution;state.aiDecision=deep?.aiMeta||state.aiDecision;state.selectedId=state.results.some(place=>providerId(place)===state.selectedId)?state.selectedId:providerId(state.results[0])||null;saveCached();if(preserveMap&&state.mapProjection)updateFilteredMap();else render()}
      });
      return true;
    }catch(error){
      if(token!==state.requestToken)return false;
      if(state.results.length){
        state.status='ready';
        state.error=null;
        const mapHost=state.root?.querySelector?.('[data-places-map]');
        if(mapHost){
          projectionState(mapHost,'ready','Nachladen fehlgeschlagen · Karte und bisherige Pins bleiben sichtbar.');
          projectionRefreshState(mapHost,false);
        }
        console.warn('[PlacesSpatial] Search refresh kept the visible provider result.',error?.code||error?.message||error);
      }else{
        state.error={userMessage:error?.publicMessage||null,code:error?.code||'PLACES_SEARCH_FAILED',status:Number(error?.status)||null};
        state.status='error';
        render();
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
  function filterOption(key,label){return `<button type="button" data-places-filter-option="${esc(key)}" aria-pressed="${Boolean(state.filters[key])}">${esc(label)}</button>`}
  function filterFactOptions(){
    const facts=categoryFilterDefinition().facts;
    return[
      facts.includes('openNow')?['openNow','Jetzt geöffnet']:null,
      ['rated','Mit Bewertung'],
      facts.includes('rating45')?['rating45','Mindestens 4,5 Sterne']:null,
      facts.includes('nearby')?['nearby','Bis 5 km']:null,
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
      if(active.key==='sort')return `<button type="button" data-places-sort="${esc(value)}" aria-pressed="${state.sort===value}">${esc(label)}</button>`;
      if(active.key==='price')return `<button type="button" data-places-price="${esc(value)}" aria-pressed="${(state.filters.priceLevels||[]).includes(value)}">${esc(label)}</button>`;
      return `<button type="button" data-places-subtype="${esc(value)}" data-places-subtype-group="${esc(active.key)}" aria-pressed="${(state.filters[active.key]||[]).includes(value)}">${esc(label)}</button>`;
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
      <div class="lv-places-spatial__map-browser" data-places-map-browser ${pinBrowserHidden?'hidden':''}><button type="button" data-places-map-navigate="previous" aria-label="Vorheriger Pin">←</button><span><b data-places-map-current">${view.counts.markers?Math.max(1,view.markers.findIndex(marker=>marker.providerPlaceId===state.selectedId)+1):0}</b>/<span data-places-map-total>${view.counts.markers}</span></span><button type="button" data-places-map-navigate="next" aria-label="Nächster Pin">→</button></div>
      <button type="button" data-places-map-tool="search" aria-label="Orte suchen" aria-pressed="${state.mapPanel==='search'}" title="Suchen">${icon('search')}</button>
      <button type="button" data-places-map-tool="categories" aria-label="Place-Kategorie auswählen" aria-pressed="${state.mapPanel==='categories'}" title="Kategorien">${icon('grid')}</button>
      <button type="button" data-places-map-tool="filter" aria-label="Ergebnisse filtern${filterCount?` · ${filterCount} aktiv`:''}" aria-pressed="${state.mapPanel==='filter'}" title="Filter">${icon('filter')}${filterCount?`<span class="lv-places-spatial__map-tool-count">${filterCount}</span>`:''}</button>
      <span class="lv-places-spatial__legend-anchor"><button type="button" class="lv-places-spatial__legend-trigger" aria-label="Kartenlegende" aria-describedby="places-map-legend" title="Legende">${icon('info')}</button><span class="lv-places-spatial__legend" id="places-map-legend" role="tooltip"><b>So liest du die Karte</b><span>Die Pinfarben folgen dem vollständigen Luvia-Kompass. „Passt“ erscheint nur bei belegten Vorlieben und erfüllten festen Anforderungen. „Alle“ zeigt auch noch ungeklärte Orte.</span></span></span>
    </div>`;
  }
  function mapDiscoveryPanelsMarkup(){
    return `<div class="lv-places-spatial__map-panels">
      <section class="lv-places-spatial__map-panel is-search" data-places-map-panel="search" ${state.mapPanel==='search'?'':'hidden'} aria-label="Orte suchen"><header class="lv-places-spatial__map-panel-head"><small>Suche</small><button type="button" data-places-map-panel-close aria-label="Suche schließen">×</button></header><form class="lv-places-spatial__map-query" data-places-search novalidate><label for="places-map-query">${icon('search')}<input type="search" enterkeyhint="search" id="places-map-query" name="query" aria-label="Orte suchen" value="${esc(state.userQuery)}" placeholder="Ort oder Wunsch suchen" autocomplete="off"></label></form></section>
      <section class="lv-places-spatial__map-panel" data-places-map-panel="categories" ${state.mapPanel==='categories'?'':'hidden'} aria-label="Place-Kategorie auswählen"><header class="lv-places-spatial__map-panel-head"><small>Kategorie</small><button type="button" data-places-map-panel-close aria-label="Kategorien schließen">×</button></header><nav class="lv-places-spatial__map-categories" aria-label="Kanonische Places-Kategorien aus places.v1">${mapCategoryMarkup(model().categories)}</nav></section>
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
    const type=[place?.primaryType,place?.primary_type,place?.category,...(place?.types||[])].map(clean).join(' ').toLowerCase();
    if(/hotel|lodging|hostel|motel|resort|accommodation|guest.house|bed.and.breakfast|campground/.test(type))return'Unterkunft';
    if(state.category==='nightlife'&&/bar|pub|night|club|concert|music/.test(type))return'Nachtleben';
    if(/restaurant|cafe|bar|bakery|food/.test(type))return'Essen & Trinken';
    if(/museum|culture|gallery|historic/.test(type))return'Kultur';
    if(/park|nature|beach|garden/.test(type))return'Natur & Erholung';
    if(/attraction|landmark|sight/.test(type))return'Sehenswürdigkeit';
    if(/store|shop|market/.test(type))return'Shopping';
    if(/night|club/.test(type))return'Nachtleben';
    return categoryDefinition().label;
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
  function mapPreviewMarkup(place=findPlace(state.selectedId)){
    const imageUrl=mapPreviewImage(place);
    if(!place)return'<span class="lv-places-spatial__map-preview-empty">Pin auswählen</span>';
    return `<span class="lv-places-spatial__map-preview-cue" aria-hidden="true"><i></i><i></i><i></i></span><button type="button" class="lv-places-spatial__map-preview-open" data-places-preview-open value="${esc(providerId(place))}" aria-label="Details zu ${esc(place.name||'ausgewähltem Ort')} öffnen oder nach oben ziehen">${imageUrl?`<img src="${esc(imageUrl)}" alt="${esc(place.name||'Ausgewählter Ort')}" loading="eager" fetchpriority="high" decoding="async">`:'<span class="lv-places-spatial__map-preview-loading" aria-label="Anbieterfoto wird geladen"></span>'}<span><small>${esc(placeCategoryLabel(place))}</small><strong>${esc(place.name||'Ausgewählter Ort')}</strong></span></button>`;
  }
  function refreshMapPreview(){
    const preview=state.root?.querySelector('.lv-places-spatial__map-preview');
    if(!preview)return;
    const place=findPlace(state.selectedId);
    preview.__luviaSelectedPlace=place||null;
    preview.innerHTML=mapPreviewMarkup(place);
    preview.hidden=!place;
  }
  async function hydrateMapPreview(place){
    const id=providerId(place),contract=placesContract();
    if(!id||state.images.has(id)||!contract?.reads?.getCard)return;
    try{
      const card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});
      if(!card?.image)return;
      state.images.set(id,card.image);
      state.results=state.results.map(row=>providerId(row)===id?{...row,...(card.place||{}),image:card.image}:row);
      if(state.selectedId===id)refreshMapPreview();
    }catch{}
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
    state.root.innerHTML=`<section class="lv-places-spatial" role="region" aria-label="Luvia Places" data-state="${esc(view.status.kind)}" aria-busy="${view.status.busy}">
      <header class="lv-places-spatial__heading">
        <div class="lv-places-spatial__heading-copy"><h1>Was möchtet ihr heute entdecken?</h1><p>Belegte Orte im sichtbaren Kartenausschnitt · <button type="button" data-view="bookings">Buchungen ansehen</button></p></div>
      </header>
      <div class="lv-places-spatial__canvas">
        <section class="lv-places-spatial__map" data-place-map-shell aria-label="Geografisch genaue Luvia-Karte">
          <div class="lv-places-spatial__map-fallback" data-places-map-fallback aria-hidden="true"><i></i><i></i><i></i><span>${icon('map')} Räumliche Ergebnisansicht</span></div>
          <div class="lv-places-spatial__map-engine" data-places-map role="group" aria-label="Karte mit ${view.counts.markers} koordinatenverifizierten Orten"></div>
          <div class="lv-places-spatial__map-message" data-places-map-message role="status" aria-live="polite" data-state="${view.status.kind==='error'?'unavailable':'loading'}"><i></i><span>${view.status.kind==='error'?esc(view.status.message):'Karte wird aus den echten Ortskoordinaten aufgebaut …'}</span></div>
          ${mapProviderStateMarkup(view)}
          ${mapDiscoveryToolsMarkup(view)}
          ${mapDiscoveryPanelsMarkup()}
          <aside class="lv-places-spatial__map-preview" ${selectedPlace()?'':'hidden'} aria-live="polite" aria-label="Kurzvorschau des ausgewählten Pins">${mapPreviewMarkup()}</aside>
        </section>
      </div>
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
    for(const layer of map.getStyle()?.layers||[]){
      const key=`${layer.id} ${layer['source-layer']||''}`.toLowerCase();
      try{
        if(layer.type==='background')map.setPaintProperty(layer.id,'background-color',COMPASS_MAP_PALETTE.paper);
        if(layer.type==='fill'){
          if(/water/.test(key))map.setPaintProperty(layer.id,'fill-color',COMPASS_MAP_PALETTE.water);
          else if(/park|wood|grass/.test(key))map.setPaintProperty(layer.id,'fill-color',COMPASS_MAP_PALETTE.park);
          else if(/building/.test(key))map.setPaintProperty(layer.id,'fill-color',COMPASS_MAP_PALETTE.building);
          else if(/landuse|landcover|residential|commercial/.test(key))map.setPaintProperty(layer.id,'fill-color',COMPASS_MAP_PALETTE.land);
        }
        if(layer.type==='line'&&/road|street|transport/.test(key)){
          map.setPaintProperty(layer.id,'line-color',/motorway|trunk/.test(key)?'#e7c88c':'#fffefd');
          map.setPaintProperty(layer.id,'line-opacity',.94);
        }
        if(layer.type==='line'&&/boundary/.test(key))map.setPaintProperty(layer.id,'line-opacity',.18);
        if(layer.type==='symbol'){
          map.setPaintProperty(layer.id,'text-color',COMPASS_MAP_PALETTE.ink);
          map.setPaintProperty(layer.id,'text-halo-color','rgba(255,255,255,.94)');
          map.setPaintProperty(layer.id,'text-halo-width',1.25);
        }
      }catch{}
    }
  }
  function markerAnchor(marker,button){
    const anchor=document.createElement('div');
    anchor.className='lv-places-spatial__marker-anchor';
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
    if(shell){shell.dataset.mapState=stateName;shell.classList.toggle('is-ready',stateName==='ready')}
    const status=shell?.querySelector?.('[data-place-map-status],[data-event-map-status],[data-places-map-message]');
    if(status){
      if(status.matches?.('[data-places-map-message]'))status.dataset.state=stateName==='unavailable'||stateName==='empty'?'unavailable':stateName==='ready'?'ready':'loading';
      const copy=status.querySelector?.('span');if(copy)copy.textContent=message;else status.textContent=message;
    }
  }
  function projectionRefreshState(container,busy,message=''){
    const shell=container?.closest?.('[data-place-map-shell],[data-event-map-shell]');
    if(!shell)return;
    if(busy){shell.dataset.mapRefreshing='true';shell.setAttribute('aria-busy','true')}
    else{delete shell.dataset.mapRefreshing;shell.removeAttribute('aria-busy')}
    const status=shell.querySelector?.('[data-place-map-status],[data-event-map-status],[data-places-map-message]');
    if(status){status.dataset.refreshing=String(Boolean(busy));const copy=status.querySelector?.('span');if(message){if(copy)copy.textContent=message;else status.textContent=message}}
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
  function mountProjection(container,places,{selectedId=null,initialCenter=null,onSelect=null,onViewportSearch=null,projectViewportResults=null,onViewportResults=null,label='Places v1 · verifizierte Geodaten',runtimeStatus=null}={}){
    if(!container)throw new TypeError('Places Map Projection benötigt ein Mount-Ziel.');
    let currentPlaces=Array.isArray(places)?places:[],view=COMPOSITION().compose({sourceContract:'places.v1',places:currentPlaces,visibleLimit:Math.max(1,Math.min(MAX_RESULTS,currentPlaces.length||1)),runtime:{status:'ready',settled:true}});
    let map=null,mapReady=false,alive=true,disconnectObserver=null,viewportTimer=0,viewportRequest=0,lastViewportKey='';const markerInstances=new Map();
    const destroy=()=>{if(!alive)return;alive=false;++viewportRequest;clearTimeout(viewportTimer);projectionRefreshState(container,false);disconnectObserver?.disconnect?.();disconnectObserver=null;for(const marker of markerInstances.values())try{marker.remove?.()}catch{}markerInstances.clear();try{map?.remove?.()}catch{}map=null;container.replaceChildren()};
    const current=()=>alive&&container.isConnected&&map;
    const fallbackCenter=COMPOSITION().normalizeCoordinates(initialCenter);
    if(!view.markers.length&&!fallbackCenter){projectionState(container,'empty','Keine vollständigen Places-Koordinaten für den Kartenstart.');return Object.freeze({view,map:null,destroy})}
    if(!globalThis.maplibregl){projectionState(container,'unavailable','MapLibre ist gerade nicht verfügbar: Die verifizierte Liste bleibt verfügbar.');return Object.freeze({view,map:null,destroy})}
    try{
      const compactMap=globalThis.matchMedia?.('(max-width: 800px)')?.matches,first=view.markers[0]||{lngLat:fallbackCenter.lngLat};
      map=new globalThis.maplibregl.Map({container,style:MAP_STYLE,center:first.lngLat,zoom:13,bearing:0,pitch:0,interactive:true,attributionControl:true,fadeDuration:reducedMotion()||compactMap?0:320});
      installMissingStyleImageFallback(map,current);
      map.addControl(new globalThis.maplibregl.NavigationControl({showCompass:false,showZoom:true}),'top-left');
      const replaceMarkers=nextPlaces=>{
        if(!current())return view;
        const nextPlacesList=Array.isArray(nextPlaces)?nextPlaces:[],nextView=COMPOSITION().compose({sourceContract:'places.v1',places:nextPlacesList,visibleLimit:Math.max(1,Math.min(MAX_RESULTS,nextPlacesList.length||1)),runtime:{status:'ready',settled:true}}),nextMarkerInstances=new Map();
        try{for(const marker of nextView.markers){const instance=new globalThis.maplibregl.Marker({element:projectionMarkerButton(marker,{selectedId,onSelect}),anchor:'bottom',offset:[0,-5]}).setLngLat(marker.lngLat).addTo(map);nextMarkerInstances.set(marker.providerPlaceId,instance)}}catch(error){for(const marker of nextMarkerInstances.values())try{marker.remove?.()}catch{}throw error}
        for(const marker of markerInstances.values())try{marker.remove?.()}catch{}markerInstances.clear();
        for(const [id,marker] of nextMarkerInstances)markerInstances.set(id,marker);
        currentPlaces=nextPlacesList;view=nextView;
        return view;
      };
      const queueViewportSearch=()=>{
        if(typeof onViewportSearch!=='function'||!current())return;
        const descriptor=viewportDescriptor(map);if(!descriptor||descriptor.key===lastViewportKey)return;
        lastViewportKey=descriptor.key;const token=++viewportRequest;clearTimeout(viewportTimer);
        projectionRefreshState(container,true,'Neue Pins werden im Hintergrund geladen …');
        viewportTimer=setTimeout(async()=>{if(token!==viewportRequest||!current())return;try{const raw=await onViewportSearch(descriptor);if(token!==viewportRequest||!current())return;const next=typeof projectViewportResults==='function'?projectViewportResults(raw):raw,updated=replaceMarkers(next);projectionState(container,'ready',updated.markers.length?`${label} · ${updated.markers.length} Treffer im sichtbaren Kartenausschnitt.`:'Keine belegten Treffer in diesem Ausschnitt · Karte bleibt aktiv.');projectionRefreshState(container,false);onViewportResults?.(raw,descriptor,updated)}catch(error){if(token!==viewportRequest||!current())return;projectionState(container,'ready',`${label} · Nachladen fehlgeschlagen, bisherige Pins bleiben sichtbar.`);projectionRefreshState(container,false)}},180);
      };
      map.on('load',()=>{
        if(!current())return;
        mapReady=true;
        styleCorporateMap(map);
        replaceMarkers(currentPlaces);
        if(view.markers.length>1)map.fitBounds(view.bounds.lngLatBounds,{padding:compactMap?38:54,maxZoom:15,duration:reducedMotion()?0:(compactMap?220:560)});
        else map.easeTo({center:first.lngLat,zoom:view.markers.length?14:12,duration:reducedMotion()?0:(compactMap?180:420)});
        if(runtimeStatus?.kind==='error')projectionState(container,'unavailable',runtimeStatus.message||'Keine verbundene Ortsquelle konnte diese Suche vollständig beantworten.');
        else{
          const summary=view.markers.length?`${label} · ${view.markers.length} von ${view.counts.visible} Treffern mit Owner-Koordinaten.`:`${label} · Keine belegten Treffer mit Koordinaten in dieser Ansicht.`;
          projectionState(container,'ready',summary);
        }
        if(typeof onViewportSearch==='function')map.once('idle',()=>{if(!current())return;lastViewportKey=viewportDescriptor(map)?.key||'';map.on('moveend',queueViewportSearch)});
        setTimeout(()=>{if(current())map.resize()},100);
      });
      map.on('error',event=>{if(!current())return;if(!mapReady&&!map.loaded())projectionState(container,'unavailable','Kartendaten sind noch nicht verfügbar.');else if(event?.error)projectionRefreshState(container,false,'Ein Teil der Kartendaten lädt verzögert · Karte und vorhandene Pins bleiben sichtbar.')});
      disconnectObserver=new MutationObserver(()=>{if(!container.isConnected)destroy()});
      disconnectObserver.observe(document.documentElement,{childList:true,subtree:true});
      return Object.freeze({get view(){return view},get map(){return map},update:replaceMarkers,destroy});
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
      const target=state.trip?.destination||state.trip||{},initialCenter=target.location||target.center||target.coordinates||{latitude:target.latitude,longitude:target.longitude};
      state.mapProjection=mountProjection(container,filteredResults(),{selectedId:state.selectedId,initialCenter,runtimeStatus:view.status,label:`${def.label} · Live-Kartenausschnitt`,onSelect:id=>{const place=findPlace(id);select(id,false,false);rememberViewed(place)},onViewportSearch:descriptor=>viewportSearch({...descriptor,query:def.query,type:def.primaryType,includedType:def.includedType,includedTypes:def.includedTypes||[],trip:state.trip,openNow:state.filters.openNow,minRating:state.filters.rating45?4.5:(state.filters.rated?0.1:null),priceLevels:state.filters.priceLevels||[],vegetarianOnly:requiresVegetarianEvidence(),reservableOnly:state.filters.reservable,accessibleOnly:state.filters.accessible}),projectViewportResults:rows=>filteredResults(rows),onViewportResults:rows=>{state.results=rows;const visible=filteredResults();state.selectedId=visible.some(place=>providerId(place)===state.selectedId)?state.selectedId:providerId(visible[0])||null;refreshMapBrowser();refreshMapPreview();hydrateMapPreview(findPlace(state.selectedId))}});
      state.map=state.mapProjection?.map||null;
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
    });
    const card=[...(state.root?.querySelectorAll('[data-place-card]')||[])].find(item=>item.dataset.placeCard===id);
    if(scroll)card?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'nearest',inline:'start'});
    const coordinates=COMPOSITION().normalizeCoordinates(findPlace(id)?.coordinates);
    if(moveMap&&coordinates&&state.map){try{state.map.easeTo({center:coordinates.lngLat,zoom:Math.max(Number(state.map.getZoom?.()||13),14),duration:reducedMotion()?0:520})}catch{}}
    refreshMapBrowser();
    refreshMapPreview();
    hydrateMapPreview(findPlace(id));
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
    return{places:[selected],selectedId:providerId(selected),trip:state.trip,query:state.query,source:'places-search',targetDate:planningDate(),reasons:[categoryDefinition().label,state.query],navigation:{index:selectedIndex,count:navigationPlaces.length},onNavigate:direction=>{if(navigationPlaces.length<2)return;const delta=direction==='previous'?-1:1,index=(selectedIndex+delta+navigationPlaces.length)%navigationPlaces.length,next=navigationPlaces[index];select(providerId(next),false,false);rememberViewed(next);openResultSheet(navigationPlaces,providerId(next))},onSelectionChange:id=>select(id,false,false)};
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
  function updateFilteredMap(){
    const rows=filteredResults(),view=state.mapProjection?.update?.(rows);
    const count=activeFilterCount(),button=state.root?.querySelector('[data-places-map-tool="filter"]');let badge=button?.querySelector('.lv-places-spatial__map-tool-count');
    if(button){button.setAttribute('aria-label',`Ergebnisse filtern${count?` · ${count} aktiv`:''}`);if(count&&!badge){badge=document.createElement('span');badge.className='lv-places-spatial__map-tool-count';button.append(badge)}else if(!count&&badge){badge.remove();badge=null}}
    if(!rows.some(place=>providerId(place)===state.selectedId))state.selectedId=providerId(rows[0])||null;
    if(badge)badge.textContent=String(count);refreshMapBrowser();refreshMapPreview();hydrateMapPreview(findPlace(state.selectedId));
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
  function applyFilterChange({network=true}={}){
    updateFilteredMap();
    if(network)scheduleFilterSearch();
  }
  function bind(){
    const root=state.root;
    root.querySelector('[data-places-search]')?.addEventListener('submit',event=>{event.preventDefault();state.userQuery=clean(new FormData(event.currentTarget).get('query'));state.mapPanel=null;state.filterOpen=false;const def=activeSearchDefinition();search({query:def.query,category:state.category})});
    root.querySelectorAll('[data-places-category]').forEach(button=>button.addEventListener('click',()=>{const def=categoryDefinition(button.dataset.placesCategory);state.filters=emptyFilters();state.userQuery='';state.filterSection=null;state.mapPanel=null;state.filterOpen=false;search({query:def.query,category:def.key})}));
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
    root.querySelectorAll('[data-places-retry]').forEach(button=>button.addEventListener('click',()=>search({focus:false})));
    root.querySelector('[data-places-more]')?.addEventListener('click',()=>showMore());
    root.querySelector('[data-places-back-plan]')?.addEventListener('click',()=>globalThis.LuviaApp?.openCompass?.('plan')||globalThis.LuviaApp?.show?.('plan'));
    root.querySelectorAll('[data-places-map-tool]').forEach(button=>button.addEventListener('click',()=>setMapPanel(button.dataset.placesMapTool,{focus:true})));
    root.querySelectorAll('[data-places-map-panel-close]').forEach(button=>button.addEventListener('click',()=>setMapPanel(null)));
    root.querySelector('[data-place-map-shell] [data-places-map]')?.addEventListener('click',()=>{if(state.mapPanel)setMapPanel(null)});
    root.querySelectorAll('[data-places-fit-mode]').forEach(button=>button.addEventListener('click',()=>{state.fitOnly=button.dataset.placesFitMode==='fit';root.querySelectorAll('[data-places-fit-mode]').forEach(item=>item.setAttribute('aria-pressed',String((item.dataset.placesFitMode==='fit')===state.fitOnly)));updateFilteredMap()}));
    root.querySelectorAll('[data-places-map-navigate]').forEach(button=>button.addEventListener('click',()=>navigateMap(button.dataset.placesMapNavigate)));
    bindPreviewGesture();
    root.addEventListener?.('click',event=>{
      const section=event.target.closest?.('[data-places-filter-section]');if(section){state.filterSection=section.dataset.placesFilterSection;refreshFilterPanel({focus:true});return}
      if(event.target.closest?.('[data-places-filter-back]')){state.filterSection=null;refreshFilterPanel({focus:true});return}
      const option=event.target.closest?.('[data-places-filter-option]');if(option){const key=option.dataset.placesFilterOption;state.filters[key]=!state.filters[key];option.setAttribute('aria-pressed',String(state.filters[key]));applyFilterChange();return}
      const sort=event.target.closest?.('[data-places-sort]');if(sort){state.sort=sort.dataset.placesSort;root.querySelectorAll('[data-places-sort]').forEach(item=>item.setAttribute('aria-pressed',String(item===sort)));applyFilterChange({network:false});return}
      const price=event.target.closest?.('[data-places-price]');if(price){toggleFilterArray('priceLevels',price.dataset.placesPrice);price.setAttribute('aria-pressed',String(state.filters.priceLevels.includes(price.dataset.placesPrice)));applyFilterChange();return}
      const subtype=event.target.closest?.('[data-places-subtype]');if(subtype){const group=subtype.dataset.placesSubtypeGroup;toggleFilterArray(group,subtype.dataset.placesSubtype);subtype.setAttribute('aria-pressed',String(state.filters[group].includes(subtype.dataset.placesSubtype)));applyFilterChange();return}
      if(event.target.closest?.('[data-places-filter-reset]')){state.filters=emptyFilters();state.sort='fit';state.filterSection=null;refreshFilterPanel();applyFilterChange();return}
      const item=event.target.closest?.('[data-places-history]');if(item){const place=state.history.find(row=>providerId(row)===item.dataset.placesHistory);if(place){rememberViewed(place);openResultSheet([place],providerId(place))}return}
      if(event.target.closest?.('[data-places-history-clear]')){state.history=[];refreshHistory()}
    });
  }

  function bindPreferenceRefresh(){
    const refresh=()=>{
      clearTimeout(state.preferenceRefreshTimer);
      state.preferenceRefreshTimer=setTimeout(()=>{if(state.root&&!state.offline)search({focus:false,silent:true})},90);
    };
    state.preferenceHandlers=['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:profile-changed','luvia:trip-preferences-projected'].map(name=>{globalThis.addEventListener?.(name,refresh);return{name,refresh}});
  }

  async function mount(root,trip){
    if(!root)throw new TypeError('Places Spatial Experience benötigt ein Mount-Ziel.');
    unmount();
    const lifecycleToken=state.lifecycleToken;
    state.root=root;state.trip=trip;state.visibleLimit=MAX_RESULTS;state.status='loading';state.error=null;state.filters=emptyFilters();state.sort='fit';state.fitOnly=false;state.filterOpen=false;state.filterSection=null;state.mapPanel=null;state.userQuery='';state.history=[];state.images.clear();state.saved.clear();state.preferenceResolution=null;state.aiDecision=null;state.planningDraft=preferenceContext()?.consumeDraft?.()||null;
    if(state.planningDraft?.query){state.userQuery=clean(state.planningDraft.query);state.query=state.userQuery}
    const contract=placesContract();
    if(!contract?.reads?.categories)throw new Error('places.v1 ist nicht verfügbar.');
    state.categories=COMPOSITION().normalizeCategories(contract.reads.categories()).filter(category=>category.key!=='accommodation'&&category.primaryType!=='accommodation');
    const networkPort=port('NetworkPort');
    state.offline=networkPort?.isOnline?.()===false;
    loadCached();
    state.networkUnsubscribe=networkPort?.subscribe?.(snapshot=>{
      const wasOffline=state.offline;
      state.offline=snapshot?.online===false;
      if(state.offline){state.status='offline';render()}
      else if(wasOffline)search({focus:false});
    })||null;
    render();
    bindPreferenceRefresh();
    loadSaved(lifecycleToken).then(changed=>{if(changed&&lifecycleToken===state.lifecycleToken&&state.root===root)render()});
    await Promise.resolve();
    if(lifecycleToken!==state.lifecycleToken||state.root!==root)return false;
    if(!state.offline)search({focus:false});
    return true;
  }
  function unmount(){
    state.lifecycleToken++;
    state.renderToken++;
    state.requestToken++;
    destroyMap();
    state.networkUnsubscribe?.();state.networkUnsubscribe=null;
    clearTimeout(state.preferenceRefreshTimer);state.preferenceRefreshTimer=0;
    clearTimeout(state.filterRefreshTimer);state.filterRefreshTimer=0;
    for(const item of state.preferenceHandlers)globalThis.removeEventListener?.(item.name,item.refresh);
    state.preferenceHandlers=[];
    state.planningHandle?.close?.('unmount');state.planningHandle=null;
    if(state.root)state.root.innerHTML='';
    state.root=null;state.trip=null;state.results=[];state.selectedId=null;state.images.clear();state.saved.clear();
  }
  function diagnostics(){return{version:VERSION,status:state.root?'mounted':'idle',sourceContract:'places.v1',visibleLimit:state.visibleLimit,resultCount:state.results.length,markerCount:state.root?model().counts.markers:0,offline:state.offline,mapRenderer:Boolean(globalThis.maplibregl),ports:{NetworkPort:Boolean(port('NetworkPort')),ExternalNavigationPort:Boolean(port('ExternalNavigationPort')),OfflineCachePort:Boolean(port('OfflineCachePort'))},domainTruth:false}}

  globalThis.LuviaPlacesSpatialExperience=Object.freeze({version:VERSION,mount,unmount,search,viewportSearch,decoratePreferences,openResultSheet,mountProjection,bindMapPreviewGesture,styleCorporateMap,compassMapPalette:COMPASS_MAP_PALETTE,diagnostics});
})();
