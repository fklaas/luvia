(() => {
  'use strict';

  const VERSION='1.2.0';
  const INITIAL_VISIBLE_RESULTS=6;
  const PAGE_SIZE=6;
  const MAX_RESULTS=18;
  const MAP_STYLE='https://tiles.openfreemap.org/styles/liberty';
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
  const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true||document.documentElement.classList.contains('reduce-motion');
  const categoryMeta=Object.freeze({
    food:{icon:'heart',hint:'Restaurant · Café · Bar'},
    accommodation:{icon:'home',hint:'Hotel · Apartment · Camping'},
    activities:{icon:'star',hint:'Freizeit · Familie · Wellness'},
    sights:{icon:'pin',hint:'Wahrzeichen · Aussicht'},
    photo:{icon:'camera',hint:'Licht · Perspektive · Natur'},
    culture:{icon:'culture',hint:'Museum · Kino · Bühne'},
    nature:{icon:'map',hint:'Strand · Park · Wandern'},
    shopping:{icon:'wallet',hint:'Markt · Boutique · Feinkost'},
    nightlife:{icon:'spark',hint:'Bar · Club · Live-Musik'},
    practical:{icon:'route',hint:'Apotheke · Parken · Laden'}
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
    check:'<path d="m5 12 4 4L19 6"/>',
    compass:'<circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>'
  });
  const icon=(name,label='')=>`<svg viewBox="0 0 24 24" ${label?`aria-label="${esc(label)}" role="img"`:'aria-hidden="true"'}>${icons[name]||icons.pin}</svg>`;
  const compassMarkup=()=>`<span class="lv-places-spatial__compass" aria-hidden="true"><img src="assets/brand/luvia-living-compass/layers/face.svg" alt=""><img class="is-needle" src="assets/brand/luvia-living-compass/layers/two-ended-needle.svg" alt=""><img src="assets/brand/luvia-living-compass/layers/hub.svg" alt=""></span>`;

  const state={
    root:null,trip:null,categories:[],category:'food',query:'Ruhiges Restaurant am Wasser',results:[],visibleLimit:INITIAL_VISIBLE_RESULTS,
    status:'loading',error:null,offline:false,selectedId:null,details:new Map(),images:new Map(),saved:new Map(),map:null,mapMarkers:new Map(),filters:{openNow:false,rated:false},filterOpen:false,
    requestToken:0,lifecycleToken:0,renderToken:0,networkUnsubscribe:null,planningHandle:null,lastSearchAt:null,preferenceResolution:null,planningDraft:null
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
  function filteredResults(){return state.results.filter(place=>(!state.filters.openNow||place.openNow===true)&&(!state.filters.rated||Number(place.rating)>0))}
  function publicRuntime(filteredCount=filteredResults().length){
    const filteredEmpty=state.status==='ready'&&state.results.length>0&&filteredCount===0;
    return{status:state.offline?'offline':filteredEmpty?'empty':state.status,loading:state.status==='loading',offline:state.offline,error:state.error,settled:['ready','empty','error','offline'].includes(state.status)};
  }
  function model(){const places=filteredResults();return COMPOSITION().compose({sourceContract:'places.v1',categories:state.categories,places,visibleLimit:state.visibleLimit,runtime:publicRuntime(places.length)})}
  function selectedPlace(){return state.results.find(place=>providerId(place)===state.selectedId)||state.results[0]||null}
  function categoryDefinition(key=state.category){return state.categories.find(item=>item.key===key)||state.categories[0]||{key:'activities',label:'Aktivitäten',primaryType:'activity',query:'Aktivitäten Erlebnisse Freizeit'}}
  function notify(message,type='success'){globalThis.LuviaUIKit?.toast?.(message,{type})}

  async function loadSaved(lifecycleToken=state.lifecycleToken){
    const contract=placesContract();
    if(!contract?.reads?.listSaved){
      if(lifecycleToken===state.lifecycleToken)state.saved.clear();
      return false;
    }
    try{
      const rows=await contract.reads.listSaved({tripId:tripId(state.trip)});
      if(lifecycleToken!==state.lifecycleToken)return false;
      state.saved.clear();
      for(const item of rows||[])state.saved.set(providerId(item),item);
      return true;
    }catch{return false}
  }
  async function enrichCards(items){
    const contract=placesContract();
    if(!contract?.reads?.getCard)return items;
    const enriched=await Promise.all(items.map(async place=>{
      const id=providerId(place);
      try{
        const card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});
        if(card?.image)state.images.set(id,card.image);
        return {...place,...(card?.place||{}),image:card?.image||place.image||null};
      }catch{return place}
    }));
    return enriched;
  }
  async function search({query=state.query,category=state.category,focus=true}={}){
    const contract=placesContract();
    const token=++state.requestToken;
    state.query=clean(query)||categoryDefinition(category).query;
    state.category=categoryDefinition(category).key;
    state.visibleLimit=INITIAL_VISIBLE_RESULTS;
    state.error=null;
    if(state.offline){state.status='offline';render();return false}
    state.status='loading';render();
    try{
      if(!contract?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig geladen.'),{publicMessage:'Die Places-Suche ist noch nicht bereit. Bitte ladet die App neu.'});
      const context=preferenceContext()?.snapshot?.()||{};
      const response=await contract.reads.recommend({
        tripId:tripId(state.trip),
        text:state.query,
        query:state.query,
        category:state.category,
        destination:destination(state.trip),
        candidateLimit:60,
        limit:MAX_RESULTS,
        profilePreferences:context.profilePreferences||{},
        tripComposition:context.tripComposition||{},
        trip:context.trip||state.trip
      });
      if(token!==state.requestToken)return false;
      const raw=(response?.places||[]).slice(0,MAX_RESULTS);
      const first=await enrichCards(raw.slice(0,INITIAL_VISIBLE_RESULTS));
      if(token!==state.requestToken)return false;
      state.results=[...first,...raw.slice(INITIAL_VISIBLE_RESULTS)];
      state.preferenceResolution=response?.preferenceResolution||context.resolution||null;
      state.selectedId=providerId(state.results[0])||null;
      state.status=state.results.length?'ready':'empty';
      state.lastSearchAt=new Date().toISOString();
      saveCached();
      await loadSaved();
      render();
      if(focus)state.root?.querySelector('.lv-places-spatial__canvas')?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
      return true;
    }catch(error){
      if(token!==state.requestToken)return false;
      state.error={userMessage:error?.publicMessage||'Die Places-Suche konnte gerade nicht geladen werden.'};
      state.status='error';
      render();
      return false;
    }
  }

  function categoryMarkup(categories){return categories.map(item=>{
    const meta=categoryMeta[item.key]||{icon:'pin',hint:item.primaryType};
    const active=item.key===state.category;
    return `<button type="button" class="lv-places-spatial__category ${active?'is-active':''}" data-places-category="${esc(item.key)}" aria-pressed="${active}" aria-selected="${active}"><span class="lv-places-spatial__category-icon">${icon(meta.icon)}</span><span class="lv-places-spatial__category-copy"><strong>${esc(item.label)}</strong><small>${esc(meta.hint)}</small></span></button>`;
  }).join('')}
  function statusMarkup(view){
    const ariaRole=view.status.ariaRole;
    return `<p class="lv-places-spatial__status is-${esc(view.status.kind)}" role="${esc(ariaRole)}" aria-live="${esc(view.status.ariaLive)}">${view.status.busy?'<i aria-hidden="true"></i>':''}<span>${esc(view.status.message)}</span>${view.status.canRetry?'<button type="button" data-places-retry>Erneut versuchen</button>':''}</p>`;
  }
  function filterMarkup(){
    if(!state.filterOpen)return'';
    return `<aside class="lv-places-spatial__filter-panel" aria-label="Places filtern"><div><span>Ergebnisse eingrenzen</span><strong>Nur nachvollziehbare Filter</strong></div><button type="button" data-places-filter-option="openNow" aria-pressed="${state.filters.openNow}">${icon('check')} Jetzt geöffnet</button><button type="button" data-places-filter-option="rated" aria-pressed="${state.filters.rated}">${icon('star')} Mit Bewertung</button><button type="button" data-places-filter-reset ${state.filters.openNow||state.filters.rated?'':'disabled'}>Zurücksetzen</button></aside>`;
  }
  function priceLabel(value){
    const normalized=clean(value).toUpperCase();
    const map={PRICE_LEVEL_FREE:'Kostenlos',PRICE_LEVEL_INEXPENSIVE:'€',PRICE_LEVEL_MODERATE:'€€',PRICE_LEVEL_EXPENSIVE:'€€€',PRICE_LEVEL_VERY_EXPENSIVE:'€€€€'};
    return map[normalized]||(/^€+$/.test(normalized)?normalized:'');
  }
  function reason(place,index){
    const supplied=(place.preferenceReasons||place.aiReasons||place._luviaReasons||[]).map(clean).find(Boolean);
    if(supplied)return supplied;
    const open=place.openNow===true?' und ist aktuell geöffnet':'';
    return index===0?`Passt am stärksten zu eurer Suche und dem aktuellen Reisekontext${open}.`:`Eine nachvollziehbare Alternative aus denselben geprüften Ortsdaten${open}.`;
  }
  function preferenceMarkup(){
    const resolution=state.preferenceResolution;
    if(!resolution)return'';
    const profile=(resolution.profileSignals||[]).slice(0,2),trip=(resolution.tripSignals||[]).slice(0,3),constraints=(resolution.hardConstraints||[]).slice(0,3);
    return `<aside class="lv-places-spatial__preference" aria-label="So richtet Luvia diese Suche aus"><div><small>Warum diese Reihenfolge?</small><strong>Profil schützt. Diese Reise gewichtet.</strong></div><ul>${constraints.map(item=>`<li class="is-constraint">${icon('check')}<span><b>${esc(item.label)}</b><small>Feste Anforderung aus deinem Profil</small></span></li>`).join('')}${profile.map(item=>`<li>${icon('compass')}<span><b>${esc(item.label)}</b><small>Globale Vorliebe</small></span></li>`).join('')}${trip.map(item=>`<li class="is-trip">${icon('spark')}<span><b>${esc(item.label)}</b><small>Gefühl nur für diese Reise</small></span></li>`).join('')}</ul></aside>`;
  }
  function evidenceMarkup(place){
    const entries=[];
    if(place.coordinates)entries.push(`<span class="lv-places-spatial__evidence is-coordinate">${icon('pin')} Koordinate verifiziert</span>`);
    else entries.push(`<span class="lv-places-spatial__evidence is-unknown">${icon('pin')} Keine Kartenposition</span>`);
    if(place.rating!=null)entries.push(`<span class="lv-places-spatial__evidence">${icon('star')} Bewertungsdaten vorhanden</span>`);
    if(place.bookingDomains?.length)entries.push(`<span class="lv-places-spatial__evidence is-booking">${icon('ticket')} Booking-Fähigkeit</span>`);
    return entries.join('');
  }
  function detailMarkup(place){
    const detail=state.details.get(providerId(place));
    if(!detail)return'';
    if(detail.loading)return`<div class="lv-places-spatial__detail" role="status">Details und Evidenz werden über places.v1 geladen …</div>`;
    if(detail.error)return`<div class="lv-places-spatial__detail" role="alert">Details konnten gerade nicht ergänzt werden.</div>`;
    const value=detail.value||place;
    const rows=[
      value.website?`<a href="#" data-places-external="${esc(value.website)}">Website öffnen</a>`:'',
      value.phone?`<span>Telefon ${esc(value.phone)}</span>`:'',
      value.businessStatus?`<span>Status ${esc(value.businessStatus)}</span>`:''
    ].filter(Boolean).join('');
    return `<div class="lv-places-spatial__detail"><strong>Details &amp; Evidenz</strong><p>${esc(value.description||place.description||'Die sichtbaren Angaben stammen aus der öffentlichen Places-Projektion.')}</p><div>${rows||'<span>Keine weiteren verifizierten Angaben verfügbar.</span>'}</div></div>`;
  }
  function resultCard(place,index){
    const id=providerId(place),selected=id===state.selectedId,saved=state.saved.get(id),image=state.images.get(id)||place.image;
    const opening=place.openNow===true?{className:'is-open',label:'Geöffnet'}:place.openNow===false?{className:'is-closed',label:'Geschlossen'}:{className:'is-unknown',label:'Öffnung prüfen'};
    const rating=place.rating!=null?`<strong class="lv-places-spatial__fact">${Number(place.rating).toFixed(1).replace('.',',')}</strong><span class="lv-places-spatial__fact">${place.userRatingCount?`${Number(place.userRatingCount).toLocaleString('de-DE')} Bewertungen`:'Bewertung'}</span>`:'';
    const price=priceLabel(place.priceLevel);
    return `<article class="lv-places-spatial__result-card ${selected?'is-selected':''}" id="place-result-${index+1}" data-place-card="${esc(id)}" aria-current="${selected}">
      <button type="button" class="lv-places-spatial__result-media" data-places-select="${esc(id)}" aria-label="${esc(place.name)} auf der Karte auswählen">
        ${image?.url?`<img src="${esc(image.url)}" alt="${esc(image.alt||place.name)}" loading="lazy">`:`<span class="lv-places-spatial__image-fallback">${icon(categoryMeta[state.category]?.icon||'pin')}</span>`}
        <b class="lv-places-spatial__result-rank">${index+1}</b>
      </button>
      <div class="lv-places-spatial__result-body">
        <div class="lv-places-spatial__result-topline"><span>${esc(categoryDefinition().label)} · ${esc(place.address||destination(state.trip))}</span><span class="lv-places-spatial__result-status ${opening.className}">${opening.label}</span></div>
        <h3>${esc(place.name)}</h3>
        <p class="lv-places-spatial__reason">${esc(reason(place,index))}</p>
        <div class="lv-places-spatial__result-facts">${rating}${price?`<span class="lv-places-spatial__fact">${esc(price)}</span>`:''}${saved?`<span class="lv-places-spatial__fact is-saved">${esc(saved.lifecycle==='planned'?'Geplant':'Gespeichert')}</span>`:''}</div>
        <div class="lv-places-spatial__result-evidence">${evidenceMarkup(place)}</div>
        <div class="lv-places-spatial__result-secondary-actions">
          <button type="button" data-places-detail="${esc(id)}" aria-expanded="${state.details.has(id)}" aria-controls="place-detail-${esc(id)}">Details &amp; Evidenz</button>
          <button type="button" data-places-maps="${esc(id)}" ${place.coordinates||place.mapsUrl?'':'disabled'}>Auf Karte öffnen</button>
        </div>
        <div id="place-detail-${esc(id)}" data-places-detail-region="${esc(id)}" aria-live="polite">${detailMarkup(place)}</div>
        <div class="lv-places-spatial__result-actions">
          <button type="button" class="lv-places-spatial__result-secondary" data-places-favorite="${esc(id)}" aria-pressed="${saved?.isFavorite===true}">${saved?.isFavorite?'Favorit ✓':'Favorisieren'}</button>
          <button type="button" class="lv-places-spatial__result-secondary" data-places-booking="${esc(id)}">Booking prüfen</button>
          <button type="button" class="lv-places-spatial__result-primary" data-places-plan="${esc(id)}">Zum Tag planen</button>
        </div>
      </div>
    </article>`;
  }
  function emptyResultsMarkup(view){
    if(view.status.kind==='loading')return`<div class="lv-places-spatial__state" aria-hidden="true">${Array.from({length:3},()=>'<i class="lv-places-spatial__skeleton"></i>').join('')}</div>`;
    return `<div class="lv-places-spatial__state is-${esc(view.status.kind)}"><span class="lv-places-spatial__state-icon">${icon('compass')}</span><strong>${view.status.kind==='error'?'Die Verbindung ist kurz abgebogen.':'Noch kein verlässlicher Treffer.'}</strong><p>${esc(view.status.message)}</p></div>`;
  }
  function render(){
    if(!state.root)return;
    const renderToken=++state.renderToken;
    destroyMap();
    const view=model(),visible=view.visibleResults,remaining=view.counts.remaining,filterCount=Number(state.filters.openNow)+Number(state.filters.rated);
    state.root.innerHTML=`<section class="lv-places-spatial" role="region" aria-label="Luvia Places" data-state="${esc(view.status.kind)}" aria-busy="${view.status.busy}">
      <header class="lv-places-spatial__heading">
        <div class="lv-places-spatial__heading-copy"><span class="lv-places-spatial__kicker">Spatial Compass Light</span><h1>Was möchtet ihr heute entdecken?</h1><p>Viele Möglichkeiten, ein klarer räumlicher Zusammenhang.</p></div>
        <button type="button" class="lv-places-spatial__ai-action" data-ai-ask-open>${icon('spark')} Mit Luvia suchen</button>
      </header>
      <section class="lv-places-spatial__context" aria-label="Planen-Funktionskompass">
        <button type="button" class="lv-places-spatial__context-compass" data-places-back-plan aria-label="Alle Planen-Funktionen im Living Compass öffnen">${compassMarkup()}</button>
        <div class="lv-places-spatial__context-copy"><small>Planen ist mehr als eine Suche</small><h2>Zehn Fähigkeiten, ein nachvollziehbarer Weg.</h2><p>Orte, gespeicherte Favoriten, Tagesbogen, Booking, Checklisten, Budget, Routen, Wetter, Sprachhilfe und Community erscheinen im Kontext – nicht als starre Kachelwand.</p></div>
        <div class="lv-places-spatial__capabilities"><span class="lv-places-spatial__capability">Places</span><span class="lv-places-spatial__capability">Booking</span><span class="lv-places-spatial__capability">Budget</span><span class="lv-places-spatial__capability">Route</span><span class="lv-places-spatial__capability lv-places-spatial__capability--more">+6</span><button type="button" class="lv-places-spatial__primary-action" data-view="bookings">Buchungen öffnen ${icon('arrow')}</button></div>
      </section>
      <form class="lv-places-spatial__search" data-places-search novalidate>
        <label class="lv-places-spatial__search-field" for="places-query"><span class="sr-only">Orte suchen</span><span class="lv-places-spatial__search-icon">${icon('search')}</span><input class="lv-places-spatial__search-input" id="places-query" name="query" value="${esc(state.query)}" placeholder="Ruhiges Restaurant am Wasser" autocomplete="off"></label>
        <button type="button" class="lv-places-spatial__filter" data-places-filter aria-expanded="${state.filterOpen}" aria-controls="places-filter-panel">${icon('filter')} Filter <span class="lv-places-spatial__filter-count">${filterCount}</span></button>
        <button type="submit" class="lv-places-spatial__search-submit">Suchen</button>
      </form>
      <div id="places-filter-panel">${filterMarkup()}</div>
      ${preferenceMarkup()}
      ${statusMarkup(view)}
      <nav class="lv-places-spatial__categories" aria-label="Kanonische Places-Kategorien aus places.v1">${categoryMarkup(view.categories)}</nav>
      <div class="lv-places-spatial__canvas">
        <section class="lv-places-spatial__map" aria-label="Geografisch genaue Luvia-Karte">
          <div class="lv-places-spatial__map-fallback" data-places-map-fallback aria-hidden="true"><i></i><i></i><i></i><span>${icon('map')} Räumliche Ergebnisansicht</span></div>
          <div class="lv-places-spatial__map-engine" data-places-map role="group" aria-label="Karte mit ${view.counts.markers} koordinatenverifizierten Orten"></div>
          <div class="lv-places-spatial__map-message" data-places-map-message role="status" aria-live="polite"><i></i><span>Karte wird aus den echten Ortskoordinaten aufgebaut …</span></div>
          <aside class="lv-places-spatial__map-story"><small>Places v1 · verifizierte Geodaten</small><strong>${view.counts.markers} von ${view.counts.visible} sichtbaren Orten auf der Karte.</strong><p>Marker entstehen ausschließlich aus vollständigen WGS84-Koordinaten der Places-Projektion. Fehlende Koordinaten werden nicht erfunden.</p></aside>
        </section>
        <aside class="lv-places-spatial__results" aria-label="Gerankte Orte">
          <header class="lv-places-spatial__results-header"><div><strong>${view.counts.visible} von ${view.counts.total} gerankte Orte</strong><small>Produktive Places-Daten · keine Demo-Pins</small></div><button type="button" class="lv-places-spatial__results-tool" data-places-filter aria-expanded="${state.filterOpen}" aria-controls="places-filter-panel" aria-label="Ergebnisse filtern">${icon('filter')}</button></header>
          <div class="lv-places-spatial__result-list">${visible.length?visible.map(resultCard).join(''):emptyResultsMarkup(view)}</div>
          ${remaining?`<button type="button" class="lv-places-spatial__load-more" data-places-more>Nächste ${Math.min(PAGE_SIZE,remaining)} Orte laden</button>`:''}
        </aside>
      </div>
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
        if(layer.type==='background')map.setPaintProperty(layer.id,'background-color','#f4f1eb');
        if(layer.type==='fill'){
          if(/water/.test(key))map.setPaintProperty(layer.id,'fill-color','#9bcbd8');
          else if(/park|wood|grass/.test(key))map.setPaintProperty(layer.id,'fill-color','#dce8dc');
          else if(/building/.test(key))map.setPaintProperty(layer.id,'fill-color','#ddd8cf');
          else if(/landuse|landcover|residential|commercial/.test(key))map.setPaintProperty(layer.id,'fill-color','#f0ede7');
        }
        if(layer.type==='line'&&/road|street|transport/.test(key)){
          map.setPaintProperty(layer.id,'line-color',/motorway|trunk/.test(key)?'#d9c4b8':'#fffefd');
          map.setPaintProperty(layer.id,'line-opacity',.94);
        }
        if(layer.type==='line'&&/boundary/.test(key))map.setPaintProperty(layer.id,'line-opacity',.18);
        if(layer.type==='symbol'){
          map.setPaintProperty(layer.id,'text-color','#344b5c');
          map.setPaintProperty(layer.id,'text-halo-color','rgba(255,255,255,.94)');
          map.setPaintProperty(layer.id,'text-halo-width',1.25);
        }
      }catch{}
    }
  }
  function markerButton(marker){
    const button=document.createElement('button');
    button.type='button';
    button.className='lv-places-spatial__marker';
    button.dataset.providerPlaceId=marker.providerPlaceId;
    button.setAttribute('aria-label',`${marker.rank}. ${marker.name} in der Ergebnisliste auswählen`);
    button.setAttribute('aria-controls',marker.resultId);
    button.setAttribute('aria-pressed',String(marker.providerPlaceId===state.selectedId));
    button.innerHTML=`<span>${marker.rank}</span>`;
    button.classList.toggle('is-selected',marker.providerPlaceId===state.selectedId);
    button.addEventListener('click',()=>select(marker.providerPlaceId,true,false));
    return button;
  }
  function mountMap(view,renderToken=state.renderToken){
    const container=state.root?.querySelector('[data-places-map]');
    if(!container||renderToken!==state.renderToken)return;
    if(!view.markers.length){setMapMessage('Für diese Treffer liegen noch keine vollständigen Kartenkoordinaten vor. Die Ergebnisliste bleibt nutzbar.','empty');return}
    if(!globalThis.maplibregl){setMapMessage('Die geografische Karte ist gerade nicht verfügbar. Alle Orte bleiben in der Liste vollständig bedienbar.','unavailable');return}
    try{
      const first=view.markers[0];
      const compactMap=globalThis.matchMedia?.('(max-width: 800px)')?.matches;
      const map=new globalThis.maplibregl.Map({container,style:MAP_STYLE,center:first.lngLat,zoom:13,bearing:0,pitch:0,interactive:true,attributionControl:true,fadeDuration:reducedMotion()||compactMap?0:320});
      state.map=map;
      const current=()=>renderToken===state.renderToken&&container.isConnected&&state.map===map;
      map.addControl(new globalThis.maplibregl.NavigationControl({showCompass:false,showZoom:true}),'top-left');
      map.on('load',()=>{
        if(!current())return;
        styleCorporateMap(map);
        for(const marker of view.markers){
          const instance=new globalThis.maplibregl.Marker({element:markerButton(marker),anchor:'bottom',offset:[0,-5]}).setLngLat(marker.lngLat).addTo(map);
          state.mapMarkers.set(marker.providerPlaceId,instance);
        }
        if(view.markers.length>1)map.fitBounds(view.bounds.lngLatBounds,{padding:compactMap?{top:42,right:34,bottom:104,left:34}:{top:72,right:72,bottom:170,left:72},maxZoom:15,duration:reducedMotion()?0:(compactMap?220:650)});
        else map.easeTo({center:first.lngLat,zoom:14,duration:reducedMotion()?0:(compactMap?180:500)});
        setMapMessage(`${view.markers.length} koordinatenverifizierte Orte auf der Karte.`,`ready`);
        setTimeout(()=>{if(current())map.resize()},100);
      });
      map.on('error',event=>{
        if(current()&&(!map.loaded()||event?.error))setMapMessage('Kartendaten konnten nicht vollständig geladen werden. Die Ergebnisliste bleibt verfügbar.','unavailable');
      });
    }catch{
      if(renderToken===state.renderToken&&container.isConnected)setMapMessage('Die Karte konnte nicht aufgebaut werden. Die Ergebnisliste bleibt verfügbar.','unavailable');
    }
  }
  function destroyMap(){
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
  }
  function findPlace(id){return state.results.find(place=>providerId(place)===id)||null}
  function detailControl(id){return[...(state.root?.querySelectorAll('[data-places-detail]')||[])].find(button=>button.dataset.placesDetail===id)||null}
  function detailRegion(id){return[...(state.root?.querySelectorAll('[data-places-detail-region]')||[])].find(region=>region.dataset.placesDetailRegion===id)||null}
  function renderDetail(id){
    const place=findPlace(id),button=detailControl(id),region=detailRegion(id);
    if(!place||!button||!region)return false;
    button.setAttribute('aria-expanded',String(state.details.has(id)));
    region.innerHTML=detailMarkup(place);
    region.querySelectorAll('[data-places-external]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openExternal(link.dataset.placesExternal)}));
    return true;
  }
  async function loadDetails(id){
    const place=findPlace(id),contract=placesContract();
    if(!place||!contract?.reads?.getDetails)return;
    select(id,false,true);
    if(state.details.has(id)){state.details.delete(id);renderDetail(id);return}
    const pending={loading:true};
    const lifecycleToken=state.lifecycleToken,root=state.root;
    state.details.set(id,pending);renderDetail(id);
    try{
      const value=await contract.reads.getDetails(id,{regionCode:state.trip?.destination?.countryCode||'DE'});
      if(lifecycleToken!==state.lifecycleToken||state.root!==root||state.details.get(id)!==pending)return;
      state.details.set(id,{value});
    }catch{
      if(lifecycleToken!==state.lifecycleToken||state.root!==root||state.details.get(id)!==pending)return;
      state.details.set(id,{error:true});
    }
    renderDetail(id);
  }
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
      const result=await bookingContract()?.commands?.openPlaceBooking?.(place,{source:'consumer.places-spatial',reserveExternalWindow:true});
      if(result?.opened!==true)notify('Für diesen Ort ist gerade kein bestätigter Booking-Weg verfügbar.','info');
    }catch(error){notify(error?.message||'Booking konnte nicht geöffnet werden.','error')}
    finally{button.disabled=false}
  }
  function planningDialog(place){
    const start=state.trip?.startDate||state.trip?.start_date||new Date().toISOString().slice(0,10);
    const modal=document.createElement('div');
    modal.className='lv-places-spatial__planning-overlay';
    modal.innerHTML=`<form class="lv-places-spatial__planning"><button type="button" data-planning-close aria-label="Schließen">×</button><span>Zum Tagesbogen hinzufügen</span><h2>${esc(place.name)}</h2><label>Reisetag<input name="date" type="date" required value="${esc(start)}"></label><label>Uhrzeit<input name="time" type="time" value="19:00"></label><label>Notiz<textarea name="note" placeholder="Optional"></textarea></label><button type="submit" class="is-primary">Verbindlich einplanen</button></form>`;
    if(!globalThis.LuviaUI?.adopt){notify('Der Planungsdialog ist noch nicht bereit.','error');return}
    state.planningHandle?.close?.('replace');
    const mounted=globalThis.LuviaUI.adopt(modal,{name:'consumer.places-spatial.plan',kind:'sheet',content:modal.querySelector('form'),closeSelector:'[data-planning-close]',initialFocus:'input[name="date"]',label:`${place.name} zum Tagesbogen hinzufügen`,onClose:()=>{if(state.planningHandle?.id===mounted.id)state.planningHandle=null}});
    state.planningHandle=mounted;
    modal.querySelector('form').addEventListener('submit',async event=>{
      event.preventDefault();
      const submit=event.submitter;submit.disabled=true;
      try{
        const form=new FormData(event.currentTarget),date=form.get('date'),time=form.get('time')||'19:00',plannedAt=new Date(`${date}T${time}:00`).toISOString();
        const entity=await importPlace(place,'planned');
        if(!entity?.tripPlaceId)throw new Error('Die Place-Verknüpfung konnte nicht erstellt werden.');
        const fields={planned_at:plannedAt,notes:clean(form.get('note')),place_name:place.name};
        await placesContract().commands.plan({tripId:tripId(state.trip),placeType:categoryDefinition().primaryType,tripPlaceId:entity.tripPlaceId,placeId:entity.id,fields});
        await placesContract().commands.updateLifecycle(entity.tripPlaceId,'planned',{}, {tripId:tripId(state.trip)});
        globalThis.dispatchEvent(new CustomEvent('luvia:place-plan-changed',{detail:{tripId:tripId(state.trip),tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:providerId(place),lifecycle:'planned',plannedAt,fields}}));
        globalThis.dispatchEvent(new CustomEvent('luvia:places-lifecycle-changed',{detail:{tripId:tripId(state.trip),tripPlaceId:entity.tripPlaceId,providerPlaceId:providerId(place),lifecycle:'planned'}}));
        mounted.close('saved');await loadSaved();render();notify('Zum Tagesbogen hinzugefügt.');
      }catch(error){notify(error?.message||'Der Ort konnte nicht eingeplant werden.','error')}
      finally{submit.disabled=false}
    });
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
  function bind(){
    const root=state.root;
    root.querySelector('[data-places-search]')?.addEventListener('submit',event=>{event.preventDefault();search({query:new FormData(event.currentTarget).get('query'),category:state.category})});
    root.querySelectorAll('[data-places-category]').forEach(button=>button.addEventListener('click',()=>{const def=categoryDefinition(button.dataset.placesCategory);search({query:def.query,category:def.key})}));
    root.querySelectorAll('[data-places-select]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.placesSelect)));
    root.querySelectorAll('[data-places-detail]').forEach(button=>button.addEventListener('click',()=>loadDetails(button.dataset.placesDetail)));
    root.querySelectorAll('[data-places-external]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openExternal(link.dataset.placesExternal)}));
    root.querySelectorAll('[data-places-maps]').forEach(button=>button.addEventListener('click',()=>openMaps(findPlace(button.dataset.placesMaps))));
    root.querySelectorAll('[data-places-favorite]').forEach(button=>button.addEventListener('click',()=>favorite(findPlace(button.dataset.placesFavorite),button)));
    root.querySelectorAll('[data-places-booking]').forEach(button=>button.addEventListener('click',()=>openBooking(findPlace(button.dataset.placesBooking),button)));
    root.querySelectorAll('[data-places-plan]').forEach(button=>button.addEventListener('click',()=>planningDialog(findPlace(button.dataset.placesPlan))));
    root.querySelectorAll('[data-places-retry]').forEach(button=>button.addEventListener('click',()=>search({focus:false})));
    root.querySelector('[data-places-more]')?.addEventListener('click',()=>showMore());
    root.querySelector('[data-places-back-plan]')?.addEventListener('click',()=>globalThis.LuviaApp?.openCompass?.('plan')||globalThis.LuviaApp?.show?.('plan'));
    root.querySelectorAll('[data-places-filter]').forEach(button=>button.addEventListener('click',()=>{state.filterOpen=!state.filterOpen;render();if(state.filterOpen)state.root?.querySelector('[data-places-filter-option]')?.focus()}));
    root.querySelectorAll('[data-places-filter-option]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.placesFilterOption;state.filters[key]=!state.filters[key];state.visibleLimit=INITIAL_VISIBLE_RESULTS;render()}));
    root.querySelector('[data-places-filter-reset]')?.addEventListener('click',()=>{state.filters={openNow:false,rated:false};state.visibleLimit=INITIAL_VISIBLE_RESULTS;render()});
  }

  async function mount(root,trip){
    if(!root)throw new TypeError('Places Spatial Experience benötigt ein Mount-Ziel.');
    unmount();
    const lifecycleToken=state.lifecycleToken;
    state.root=root;state.trip=trip;state.visibleLimit=INITIAL_VISIBLE_RESULTS;state.status='loading';state.error=null;state.filters={openNow:false,rated:false};state.filterOpen=false;state.details.clear();state.images.clear();state.saved.clear();state.preferenceResolution=null;state.planningDraft=preferenceContext()?.consumeDraft?.()||null;
    if(state.planningDraft?.query)state.query=clean(state.planningDraft.query);
    const contract=placesContract();
    if(!contract?.reads?.categories)throw new Error('places.v1 ist nicht verfügbar.');
    state.categories=COMPOSITION().normalizeCategories(contract.reads.categories());
    const networkPort=port('NetworkPort');
    state.offline=networkPort?.isOnline?.()===false;
    loadCached();
    state.networkUnsubscribe=networkPort?.subscribe?.(snapshot=>{
      const wasOffline=state.offline;
      state.offline=snapshot?.online===false;
      if(state.offline){state.status='offline';render()}
      else if(wasOffline)search({focus:false});
    })||null;
    await loadSaved(lifecycleToken);
    if(lifecycleToken!==state.lifecycleToken||state.root!==root)return false;
    render();
    if(!state.offline)search({focus:false});
    return true;
  }
  function unmount(){
    state.lifecycleToken++;
    state.renderToken++;
    state.requestToken++;
    destroyMap();
    state.networkUnsubscribe?.();state.networkUnsubscribe=null;
    state.planningHandle?.close?.('unmount');state.planningHandle=null;
    if(state.root)state.root.innerHTML='';
    state.root=null;state.trip=null;state.results=[];state.selectedId=null;state.details.clear();state.images.clear();state.saved.clear();
  }
  function diagnostics(){return{version:VERSION,status:state.root?'mounted':'idle',sourceContract:'places.v1',visibleLimit:state.visibleLimit,resultCount:state.results.length,markerCount:state.root?model().counts.markers:0,offline:state.offline,mapRenderer:Boolean(globalThis.maplibregl),ports:{NetworkPort:Boolean(port('NetworkPort')),ExternalNavigationPort:Boolean(port('ExternalNavigationPort')),OfflineCachePort:Boolean(port('OfflineCachePort'))},domainTruth:false}}

  globalThis.LuviaPlacesSpatialExperience=Object.freeze({version:VERSION,mount,unmount,search,diagnostics});
})();
