var LuviaPlacesDomainContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const clean=value=>String(value??'').trim();
const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const coordinateNumber=value=>{
  if(typeof value==='boolean'||value==null)return null;
  if(typeof value!=='number'&&typeof value!=='string')return null;
  if(typeof value==='string'&&!value.trim())return null;
  const normalized=Number(value);
  return Number.isFinite(normalized)?normalized:null;
};
const providerId=value=>clean(value).replace(/^places\//,'');
const httpsUrl=value=>{const url=clean(value);return /^https:\/\//i.test(url)?url:null};
const providerRefsProjection=value=>Object.freeze(Object.fromEntries(Object.entries(value&&typeof value==='object'?value:{}).slice(0,6).map(([key,id])=>[clean(key).toLowerCase().slice(0,40),providerId(id).slice(0,180)]).filter(([key,id])=>key&&id)));
const evidenceProjection=value=>Object.freeze((Array.isArray(value)?value:[]).slice(0,8).map(item=>Object.freeze({provider:clean(item?.provider).toLowerCase().slice(0,40)||'unknown',kind:clean(item?.kind).toLowerCase().slice(0,80)||'place-fact'})));
const photoProjection=value=>Object.freeze((Array.isArray(value)?value:[]).slice(0,3).map(item=>{const author=item?.authorAttributions?.[0]||{};return Object.freeze({name:clean(item?.name).slice(0,240)||null,uri:httpsUrl(item?.uri||item?.url||item?.photoUri),widthPx:number(item?.widthPx||item?.width),heightPx:number(item?.heightPx||item?.height),attribution:clean(item?.attribution||author?.displayName).slice(0,180)||null,attributionUrl:httpsUrl(item?.attributionUrl||author?.uri),sourceUrl:httpsUrl(item?.sourceUrl||item?.googleMapsUri)});}));
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};

const CATEGORIES=immutable({
  food:{key:'food',icon:'🍽️',label:'Essen & Trinken',type:'restaurant',primaryType:'restaurant',domainTypes:['restaurant'],includedType:'restaurant',includedTypes:['restaurant','cafe','bakery','bar','meal_takeaway','vegetarian_restaurant','vegan_restaurant'],excludedTypes:['hospital','movie_theater','locality'],query:'Restaurants Cafés Bars Essen',keywords:['essen','restaurant','nudeln','pasta','vegetar','vegan','café','cafe','frühstück','bar','trinken'],synonyms:['Restaurant','Café','Bistro','Essen']},
  accommodation:{key:'accommodation',icon:'🏨',label:'Unterkünfte',type:'accommodation',primaryType:'accommodation',domainTypes:['accommodation'],includedType:'lodging',includedTypes:['lodging','hotel','hostel','motel','bed_and_breakfast','guest_house','resort_hotel','campground'],excludedTypes:['restaurant','hospital','locality'],query:'Hotels Unterkünfte Hostels Apartments',keywords:['hotel','unterkunft','hostel','apartment','übernachten','zimmer','resort','pension'],synonyms:['Hotel','Unterkunft','Hostel','Apartment','Bed and Breakfast']},
  activities:{key:'activities',icon:'🎟️',label:'Aktivitäten',type:'activity',primaryType:'activity',domainTypes:['activity','attraction','family'],includedType:'',includedTypes:['amusement_park','amusement_center','aquarium','bowling_alley','escape_room','fitness_center','gym','playground','skating_rink','spa','sports_activity_location','stadium','swimming_pool','water_park','zoo','tourist_attraction'],excludedTypes:['hospital','store','locality','restaurant','cafe','bakery','meal_takeaway','food_court','catering','lodging','hotel','hostel'],query:'Aktivitäten Erlebnisse Freizeit',keywords:['aktivität','aktivitäten','unternehmen','erleben','freizeit','indoor','outdoor','spielen','spaß'],synonyms:['Aktivität','Erlebnis','Freizeit','Freizeitzentrum','Sport und Freizeit']},
  themeparks:{key:'themeparks',icon:'🎢',label:'Freizeitparks',type:'activity',primaryType:'activity',domainTypes:['activity','attraction','family'],includedType:'amusement_park',includedTypes:['amusement_park','amusement_center','water_park'],excludedTypes:['hospital','store','locality','restaurant','cafe','bakery','meal_takeaway','catering','lodging','hotel'],query:'Freizeitparks Themenparks Erlebnisparks',keywords:['freizeitpark','themenpark','erlebnispark','achterbahn'],synonyms:['Freizeitpark','Themenpark','Erlebnispark']},
  wellness:{key:'wellness',icon:'♨️',label:'Wellness & Spa',type:'activity',primaryType:'activity',domainTypes:['activity','nature'],includedType:'spa',includedTypes:['spa'],excludedTypes:['hospital','locality','restaurant','cafe','bakery','meal_takeaway','catering','lodging','hotel'],query:'Wellness Spa Sauna Erholung',keywords:['wellness','spa','sauna','massage'],synonyms:['Wellness','Spa','Sauna']},
  water:{key:'water',icon:'🌊',label:'Wassererlebnisse',type:'activity',primaryType:'activity',domainTypes:['activity','nature'],includedType:'',includedTypes:['water_park','swimming_pool','beach','marina'],excludedTypes:['hospital','locality','restaurant','cafe','bakery','meal_takeaway','catering','lodging','hotel'],query:'Wassererlebnisse Schwimmen Strand Wassersport',keywords:['wasserpark','wassersport','schwimmen','strandbad'],synonyms:['Wasserpark','Schwimmen','Wassersport']},
  sights:{key:'sights',icon:'🏛️',label:'Sehenswürdigkeiten',type:'attraction',primaryType:'attraction',domainTypes:['attraction'],includedType:'tourist_attraction',includedTypes:['tourist_attraction','historical_landmark','monument','observation_deck'],excludedTypes:['restaurant','hospital'],query:'Sehenswürdigkeiten Wahrzeichen besondere Orte',keywords:['sehenswürdigkeit','wahrzeichen','besichtigen','aussicht','historisch'],synonyms:['Sehenswürdigkeit','Wahrzeichen','Aussichtspunkt']},
  photo:{key:'photo',icon:'📸',label:'Fotospots',type:'photo_spot',primaryType:'photo_spot',domainTypes:['photo_spot','attraction','nature'],includedType:'tourist_attraction',includedTypes:['tourist_attraction','historical_landmark','monument','observation_deck','park','garden','natural_feature'],excludedTypes:['hospital'],query:'Fotospots besondere Perspektiven Aussicht Architektur',keywords:['foto','fotospot','fotografieren','instagram','perspektive','aussicht','architektur'],synonyms:['Fotospot','Fotoort','Aussicht','Architektur']},
  culture:{key:'culture',icon:'🎭',label:'Kultur',type:'attraction',primaryType:'attraction',domainTypes:['attraction','activity'],includedType:'',includedTypes:['museum','movie_theater','art_gallery','performing_arts_theater','concert_hall'],excludedTypes:['hospital','restaurant'],query:'Museen Kino Theater Kultur',keywords:['museum','kino','film','theater','galerie','kultur','konzert'],synonyms:['Museum','Kino','Theater','Galerie']},
  nature:{key:'nature',icon:'🌿',label:'Natur & Erholung',type:'nature',primaryType:'nature',domainTypes:['nature','activity'],includedType:'park',includedTypes:['park','garden','beach','hiking_area','natural_feature'],excludedTypes:['store','hospital','lodging','accommodation','hotel','hostel','motel','guest_house','bed_and_breakfast','apartment','vacation_rental','holiday_home','resort_hotel','campground','spa'],query:'Parks Gärten Natur Erholung',keywords:['natur','park','garten','strand','see','wandern','spazieren','erholung'],synonyms:['Park','Garten','See','Strand','Natur']},
  shopping:{key:'shopping',icon:'🛍️',label:'Shopping',type:'shopping',primaryType:'shopping',domainTypes:['shopping'],includedType:'',includedTypes:['shopping_mall','market','store','clothing_store','department_store'],excludedTypes:['hospital'],query:'Shopping Märkte besondere Geschäfte',keywords:['shopping','einkaufen','markt','boutique','souvenir','geschäft'],synonyms:['Shopping','Markt','Geschäft']},
  malls:{key:'malls',icon:'🏬',label:'Einkaufszentren',type:'shopping',primaryType:'shopping',domainTypes:['shopping'],includedType:'shopping_mall',includedTypes:['shopping_mall','department_store'],excludedTypes:['hospital'],query:'Einkaufszentren Shopping Center',keywords:['einkaufszentrum','shopping center','mall'],synonyms:['Einkaufszentrum','Shopping Center','Mall']},
  nightlife:{key:'nightlife',icon:'🌙',label:'Nachtleben',type:'custom',primaryType:'custom',domainTypes:['activity','restaurant'],includedType:'',includedTypes:['nightlife_spot','bar','pub','cocktail_bar','wine_bar','night_club','dance_club','discotheque','lounge_bar','concert_hall','live_music_venue','music_venue','jazz_club','comedy_club','karaoke_bar','casino'],excludedTypes:['hospital','locality'],query:'Bars Pubs Cocktailbars Weinbars Lounges Clubs Diskotheken Live-Musik Karaoke Comedy Casinos Nachtleben',keywords:['nachtleben','club','diskothek','disco','rooftop','cocktail','weinbar','pub','lounge','live musik','karaoke','comedy','casino','abend'],synonyms:['Club','Diskothek','Bar','Pub','Cocktailbar','Weinbar','Lounge','Live-Musik','Karaoke','Comedy','Casino']},
  practical:{key:'practical',icon:'🧰',label:'Praktisch unterwegs',type:'custom',primaryType:'custom',domainTypes:['custom','mobility'],includedType:'',includedTypes:['pharmacy','supermarket','parking','electric_vehicle_charging_station','gas_station','atm','laundry'],excludedTypes:['tourist_attraction'],query:'Apotheke Supermarkt Parkplatz Toilette Ladestation',keywords:['apotheke','supermarkt','toilette','parkplatz','laden','ladestation','geldautomat','waschsalon','tankstelle'],synonyms:['Apotheke','Supermarkt','Parkplatz','Ladestation']}
});

function categories(){return CATEGORIES}
function category(key){return CATEGORIES[clean(key)]||CATEGORIES.activities}
function categoryFor(text=''){
  const query=clean(text).toLowerCase();
  let best='activities',score=0;
  for(const [key,definition] of Object.entries(CATEGORIES)){
    const next=definition.keywords.reduce((sum,keyword)=>sum+(query.includes(keyword)?1:0),0);
    if(next>score){best=key;score=next}
  }
  return best;
}
function routeDiscovery(input={}){
  const requested=clean(input.category);
  const key=CATEGORIES[requested]?requested:categoryFor(input.text||input.query);
  const definition=category(key);
  return immutable({
    category:key,
    label:definition.label,
    primaryType:definition.primaryType,
    domainTypes:definition.domainTypes,
    includedType:definition.includedType,
    includedTypes:definition.includedTypes,
    excludedTypes:definition.excludedTypes,
    query:clean(input.query||input.text)||definition.query
  });
}
function createDeepLink(input={}){
  const route=routeDiscovery(input);
  return immutable({screen:'places',params:{category:route.category,query:route.query}});
}

function coordinatesProjection(input){
  if(!input||typeof input!=='object')return null;
  const latitude=coordinateNumber(input.latitude??input.lat),longitude=coordinateNumber(input.longitude??input.lng);
  if(latitude==null||longitude==null)return null;
  if(latitude < -90||latitude > 90||longitude < -180||longitude > 180)return null;
  return immutable({latitude,longitude});
}
function placeTitle(input={}){
  const candidates=[
    input.name,
    input.displayName?.text,
    input.displayName,
    input.shortAddress,
    input.address,
    input.formattedAddress,
    input.formatted_address,
    input.primaryTypeLabel
  ];
  for(const candidate of candidates){
    const title=clean(candidate);
    if(title&&title.length>=2&&!/^\[object object\]$/i.test(title))return title;
  }
  return 'Unbenannter Ort';
}
function detailsSource(input){
  if(!input||typeof input!=='object')return null;
  const nested=input.place&&typeof input.place==='object'?input.place:null;
  if(!nested)return input;
  const nestedTitle=placeTitle(nested);
  const outerTitle=placeTitle(input);
  const nestedHasIdentity=Boolean(providerId(nested.providerPlaceId||nested.provider_place_id||nested.id)||(nestedTitle&&nestedTitle!=='Unbenannter Ort'));
  if(!nestedHasIdentity)return input;
  return {
    ...input,
    ...nested,
    name:nestedTitle!=='Unbenannter Ort'?nestedTitle:outerTitle,
    displayName:nested.displayName||input.displayName||nested.name||input.name,
    formattedAddress:nested.formattedAddress||nested.formatted_address||input.formattedAddress||input.formatted_address||input.address,
    address:nested.address||input.address||nested.formattedAddress||input.formattedAddress
  };
}
function projectPlace(input){
  if(!input||typeof input!=='object')return null;
  const source=detailsSource(input)||input;
  const id=clean(source.id||source.placeId||source.place_id||source.providerPlaceId||source.provider_place_id);
  if(!id)return null;
  return immutable({
    id,
    tripId:clean(source.tripId||source.trip_id)||null,
    tripPlaceId:clean(source.tripPlaceId||source.trip_place_id)||null,
    providerPlaceId:providerId(source.providerPlaceId||source.provider_place_id||source.sourceId||source.source_id||id)||null,
    primaryType:clean(source.primaryType||source.primary_type)||'custom',
    roles:[...(source.roles||[])].map(String),
    name:placeTitle(source),
    description:clean(source.description||source.editorialSummary?.text||source.editorialSummary),
    coordinates:coordinatesProjection(source.coordinates||source.position||source['loca'+'tion']||{latitude:source.latitude,longitude:source.longitude}),
    address:clean(source.address||source.formattedAddress||source.formatted_address||source.shortAddress),
    lifecycle:clean(source.lifecycle||source.lifecycleStatus||source.lifecycle_status||source.status)||'discovered',
    isFavorite:typeof source.isFavorite==='boolean'?source.isFavorite:(typeof source.is_favorite==='boolean'?source.is_favorite:null),
    capabilities:[...(source.capabilities||[])].map(String),
    bookingDomains:[...(source.bookingDomains||[])].map(String),
    createdAt:clean(source.createdAt||source.created_at)||null,
    updatedAt:clean(source.updatedAt||source.updated_at)||null
  });
}
function profileFitProjection(input,context={}){
  if(!input||typeof input!=='object')return null;
  const source=detailsSource(input)||input,id=providerId(source.providerPlaceId||source.provider_place_id||source.id);
  if(!id)return null;
  const focus=clean(context.focus||source.profileFit?.focus).toLowerCase(),categoryKey=clean(context.category||source.requestedCategory||source.requestCategory||source.category).toLowerCase();
  const types=new Set([source.primaryType,source.primary_type,source.category,...(source.types||[])].map(value=>clean(value).toLowerCase()).filter(Boolean));
  const providerText=clean([...(source.providerPrimaryFoodTypes||[]),...(source.providerNativeTypes||[]),...(source.types||[]),source.editorialSummary?.text||source.editorialSummary].filter(Boolean).join(' ')).toLowerCase();
  const meatLed=/steak|grillhaus|grillhouse|churrasc|kebab|d[oö]ner|barbecue|bbq/.test(clean([source.name,source.primaryType,source.primaryTypeLabel,...types].join(' ')).toLowerCase());
  const dedicatedVegetarian=types.has('vegetarian_restaurant')||types.has('vegan_restaurant'),dedicatedVegan=types.has('vegan_restaurant');
  const vegetarianEvidence=source.features?.servesVegetarianFood!==false&&(dedicatedVegetarian||source.features?.servesVegetarianFood===true||/vegetar|vegan|plant[ _-]?based|pflanzenk[uü]che|fleischlos/.test(providerText));
  const veganEvidence=source.features?.servesVeganFood!==false&&(dedicatedVegan||source.features?.servesVeganFood===true||/vegan|plant[ _-]?based|rein pflanzlich|pflanzenk[uü]che/.test(providerText));
  const score=number(source.preferenceFit?.score??source.groupFit?.score??source.preferenceScore),coverage=number(source.preferenceFit?.coverage??source.groupFit?.coverage??source.preferenceCoverage);
  const reasons=[...(source.preferenceReasons||[]),...(source.recommendation?.reasons||[]),...(source.aiReasons||[])].map(clean).filter(Boolean);
  const blocked=source.preferenceDiscoveryMatch===false||clean(source.preferenceConstraintState||source.recommendation?.constraintState).toLowerCase()==='blocked';
  const categoryEligible=categoryKey!=='accommodation'||[...types].some(value=>/hotel|lodging|hostel|motel|campground|accommodation|guest_house|bed_and_breakfast|resort|vacation_rental|holiday_home/.test(value));
  let state='unknown',reason='',facts=[];
  if(categoryKey==='food'&&focus==='vegetarisch'){
    const matched=!blocked&&vegetarianEvidence&&(!meatLed||dedicatedVegetarian);
    state=matched?'matched':blocked||meatLed?'blocked':'unknown';
    if(matched){reason='Vegetarische Auswahl ist in den Ortsdaten ausdrücklich belegt.';facts=['Vegetarische Auswahl'];}
  }else if(categoryKey==='food'&&focus==='vegan'){
    const matched=!blocked&&veganEvidence&&(!meatLed||dedicatedVegan);
    state=matched?'matched':blocked||meatLed?'blocked':'unknown';
    if(matched){reason='Vegane Auswahl ist in den Ortsdaten ausdrücklich belegt.';facts=['Vegane Auswahl'];}
  }else if(!['vegetarisch','vegan'].includes(focus)&&categoryEligible&&!blocked&&source.preferenceDiscoveryMatch===true&&score!=null&&score>0&&coverage!=null&&coverage>0&&reasons.length){
    state='matched';reason=reasons[0];facts=reasons.slice(0,3);
  }else if(blocked)state='blocked';
  return immutable({owner:'places',contractId:'places.v1',providerPlaceId:id,state,focus:focus||'profile',score,coverage,reason:reason||null,facts:facts.map(label=>({code:clean(label).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),label,source:'provider'})),providerEvidence:state==='matched',observedAt:clean(source.ownerObservedAt||source.providerObservedAt)||null});
}
function projectDetails(input){
  if(!input||typeof input!=='object')return null;
  const source=detailsSource(input)||input;
  const base=projectPlace(source);
  const id=providerId(source.providerPlaceId||source.provider_place_id||source.id||source.name)||base?.providerPlaceId||null;
  return immutable({
    ...(base||{}),
    providerPlaceId:id,
    name:base?.name||placeTitle(source),
    address:base?.address||clean(source.formattedAddress||source.formatted_address||source.shortAddress),
    rating:number(source.rating),
    userRatingCount:number(source.userRatingCount||source.user_rating_count),
    priceLevel:clean(source.priceLevel||source.price_level)||null,
    website:clean(source.websiteUri||source.website||source.website_uri)||null,
    phone:clean(source.internationalPhoneNumber||source.nationalPhoneNumber||source.phone)||null,
    mapsUrl:clean(source.googleMapsUri||source.mapsUrl||source.google_maps_uri)||null,
    openNow:source.currentOpeningHours?.openNow??source.openNow??null,
    types:[...(source.types||[])].map(String),
    businessStatus:clean(source.businessStatus||source.business_status)||null,
    features:source.features&&typeof source.features==='object'?source.features:{},
    accessibilityOptions:source.accessibilityOptions&&typeof source.accessibilityOptions==='object'?source.accessibilityOptions:{},
    provider:clean(source.provider||source.source).toLowerCase()||null,
    source:clean(source.source).toLowerCase()||null,
    providerRefs:providerRefsProjection(source.providerRefs),
    providerEvidence:evidenceProjection(source.evidence||source.providerEvidence),
    providerNativeTypes:[...(source.providerNativeTypes||[])].map(String).slice(0,50),
    providerPrimaryFoodTypes:[...(source.providerPrimaryFoodTypes||[])].map(String).slice(0,20),
    providerObservedAt:clean(source.providerObservedAt)||null,
    ownerObservedAt:clean(source.ownerObservedAt)||null,
    providerFactsCached:source.providerFactsCached===true,
    providerReadiness:clean(source.providerReadiness)||null,
    distanceMeters:number(source.distanceMeters),
    distanceSource:clean(source.distanceSource)||null,
    photos:photoProjection(source.photos),
    editorialSummary:clean(source.editorialSummary?.text||source.editorialSummary)||null,
    openingHours:source.openingHours||source.regularOpeningHours||null,
    discoveryQueries:[...(source.discoveryQueries||[])].map(String),
    spatialConstraint:source.spatialConstraint&&typeof source.spatialConstraint==='object'?source.spatialConstraint:null,
    aiMatchScore:number(source.aiMatchScore),
    aiReasons:[...(source.aiReasons||source._luviaReasons||[])].map(String),
    aiUnknowns:[...(source.aiUnknowns||[])].map(String),
    preferenceDiscoveryMatch:typeof source.preferenceDiscoveryMatch==='boolean'?source.preferenceDiscoveryMatch:null,
    preferenceConstraintState:clean(source.preferenceConstraintState)||null,
    preferenceScore:number(source.preferenceScore),
    preferenceCoverage:number(source.preferenceCoverage),
    preferenceReasons:[...(source.preferenceReasons||[])].map(String),
    preferenceWarnings:[...(source.preferenceWarnings||[])].map(String),
    preferenceResolutionVersion:clean(source.preferenceResolutionVersion)||null,
    profileFit:source.profileFit&&typeof source.profileFit==='object'?source.profileFit:profileFitProjection(source,{focus:source.profileFit?.focus,category:source.requestedCategory||source.requestCategory||source.category})
  });
}
function projectSaved(input){
  if(!input||typeof input!=='object')return null;
  const entity=input.entity||input.rawEntity||input;
  const place=entity.place||input.place||entity;
  const link=entity.tripPlace||entity.trip_place||input.tripPlace||input.trip_place||{};
  const base=projectDetails(place);
  if(!base)return null;
  return immutable({
    ...base,
    tripId:clean(input.tripId||link.trip_id||base.tripId)||null,
    tripPlaceId:clean(input.tripPlaceId||link.id||base.tripPlaceId)||null,
    providerPlaceId:providerId(input.providerPlaceId||place.providerPlaceId||place.provider_place_id||place.source_id||base.providerPlaceId)||null,
    primaryType:clean(input.placeType||place.primaryType||place.primary_type||base.primaryType)||'custom',
    lifecycle:clean(input.status||link.lifecycle_status||link.status||base.lifecycle)||'discovered',
    isFavorite:typeof input.isFavorite==='boolean'?input.isFavorite:Boolean(link.is_favorite??link.isFavorite??base.isFavorite)
  });
}

function rows(response){
  if(Array.isArray(response))return response;
  if(Array.isArray(response?.places))return response.places;
  if(Array.isArray(response?.data?.places))return response.data.places;
  if(Array.isArray(response?.data?.entities))return response.data.entities;
  if(Array.isArray(response?.data))return response.data;
  return [];
}
function localSearchRadius(destination={},requestedRadius){
  const explicit=Number(requestedRadius),stored=Number(destination?.searchRadiusMeters);
  return Number.isFinite(explicit)&&explicit>0?Math.max(500,Math.min(50000,explicit)):Math.max(500,Math.min(3000,Number.isFinite(stored)&&stored>0?stored:3000));
}
function create(providers={}){
  const call=(name,...args)=>{
    const provider=providers[name];
    if(typeof provider!=='function'){
      const error=new Error('Places Domain provider unavailable: '+name);
      error.code='PLACES_DOMAIN_PROVIDER_UNAVAILABLE';
      error.provider=name;
      throw error;
    }
    return provider(...args);
  };
  async function search(options={}){
    const response=await call('search',options);
    const places=Object.freeze(rows(response).map(projectPlace).filter(Boolean));
    return Object.freeze({places,count:places.length});
  }
  function getPlace(placeId){return projectPlace(call('getPlace',placeId))}
  function listPlaces(filters={}){return Object.freeze(rows(call('listPlaces',filters)).map(projectPlace).filter(Boolean))}
  async function getDetails(placeId,options={}){return projectDetails(await call('getDetails',placeId,options))}
  async function listSaved(filters={}){return Object.freeze(rows(await call('listSaved',filters)).map(projectSaved).filter(Boolean))}
  async function recommend(options={}){
    const response=await call('recommend',options);
    const places=Object.freeze(rows(response).map(projectDetails).filter(Boolean));
    return Object.freeze({places,count:places.length,route:routeDiscovery(options),plan:immutable(response?.plan||null)});
  }
  function getLifecycle(query){
    const value=call('getLifecycle',query);
    if(typeof value==='string')return value||null;
    return projectSaved(value)?.lifecycle||projectPlace(value)?.lifecycle||null;
  }
  function snapshot(){const places=listPlaces();return Object.freeze({version:VERSION,places,count:places.length})}
  return Object.freeze({version:VERSION,search,getPlace,listPlaces,getDetails,listSaved,recommend,getLifecycle,categories,category,categoryFor,routeDiscovery,createDeepLink,snapshot});
}

return Object.freeze({version:VERSION,localSearchRadius,categories,category,categoryFor,routeDiscovery,createDeepLink,projectPlace,projectDetails,projectSaved,profileFitProjection,create});
})();
