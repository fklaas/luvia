import {FOURSQUARE_API_VERSION,FOURSQUARE_MAPPING_VERSION,FOURSQUARE_PRO_FIELDS,FOURSQUARE_SEARCH_FIELDS,FOURSQUARE_DETAILS_FIELDS,FOURSQUARE_VEGAN_VEGETARIAN_CATEGORY_ID,normalizeFoursquarePlace,boundedFoursquareError} from './foursquare-place-mapping.ts';
import {providerFetch} from './provider-budget.ts';
import {additionalSearch,additionalDetails} from './additional-places.ts';
import {enrichLinkedMedia} from './place-media.ts';
import {appleMapsConfiguration} from './apple-maps.ts';
import {osmDietaryConfiguration,osmDietarySearch} from './osm-dietary.ts';

const BASE='https://places.googleapis.com/v1';
const FOURSQUARE_BASE='https://places-api.foursquare.com';
const TIMEZONE_BASE='https://maps.googleapis.com/maps/api/timezone/json';
const cache=new Map<string,{expires:number,value:unknown}>();
const metrics={requests:0,successes:0,failures:0,cacheHits:0,resolutions:0,timezoneRequests:0,timezoneFailures:0,lastRequestAt:null as string|null,lastSuccessAt:null as string|null,lastError:null as unknown,providers:{google:{requests:0,successes:0,failures:0},foursquare:{requests:0,successes:0,failures:0,fieldFallbacks:0,exactMediaAttempts:0,exactMediaMatches:0,exactMediaMisses:0,exactMediaFailures:0},geoapify:{requests:0,successes:0,failures:0}}};
const SCHARBEUTZ_CUISINE_DESTINATION=Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:5000});
const CUISINE_HEALTH_TYPES=Object.freeze([
  ['mediterranean','Mediterran','mediterranean_restaurant'],['italian','Italienisch','italian_restaurant'],['german','Deutsch','german_restaurant'],['greek','Griechisch','greek_restaurant'],['french','Französisch','french_restaurant'],['spanish','Spanisch','spanish_restaurant'],['indian','Indisch','indian_restaurant'],['asian','Asiatisch','asian_restaurant'],['chinese','Chinesisch','chinese_restaurant'],['japanese','Japanisch','japanese_restaurant'],['thai','Thailändisch','thai_restaurant'],['vietnamese','Vietnamesisch','vietnamese_restaurant'],['korean','Koreanisch','korean_restaurant'],['mexican','Mexikanisch','mexican_restaurant'],['middle-eastern','Nahöstlich','middle_eastern_restaurant'],['lebanese','Libanesisch','lebanese_restaurant'],['turkish','Türkisch','turkish_restaurant'],['vegetarian','Vegetarisch','vegetarian_restaurant'],['vegan','Vegan','vegan_restaurant']
]);
const CUISINE_HEALTH_PROBES=Object.fromEntries(CUISINE_HEALTH_TYPES.map(([slug,label,type])=>[
  `${slug}-scharbeutz`,
  Object.freeze({query:`${label} Restaurant Scharbeutz`,destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['auto']),category:'food',includedType:type,includedTypes:Object.freeze([type]),strictPlaceType:type,strictTypeFiltering:true,strictDestination:true,maxResultCount:50,maxDistanceMeters:5000,vegetarianOnly:type==='vegetarian_restaurant'})})
]));
const HEALTH_PROBES=Object.freeze({
  ...CUISINE_HEALTH_PROBES,
  // Exact bounded production diagnostic for the evidence lane behind the
  // signed-in "Passend" toggle. It never returns credentials or raw provider
  // payloads and remains subject to the same Google search budget as the app.
  'vegetarian-google-scharbeutz':Object.freeze({query:'Restaurants Cafés mit belegtem vegetarischem Angebot',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['google']),category:'food',includedType:'vegetarian_restaurant',includedTypes:Object.freeze(['vegetarian_restaurant']),strictPlaceType:'vegetarian_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:20,maxDistanceMeters:8000,vegetarianOnly:true})}),
  'vegetarian-foursquare-scharbeutz':Object.freeze({query:'Vegetarisches Restaurant',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['foursquare']),category:'food',includedType:'vegetarian_restaurant',includedTypes:Object.freeze(['vegetarian_restaurant']),strictPlaceType:'vegetarian_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:20,maxDistanceMeters:8000,vegetarianOnly:true})}),
  'vegetarian-osm-scharbeutz':Object.freeze({query:'Vegetarisches Restaurant',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['openstreetmap']),category:'food',includedType:'vegetarian_restaurant',includedTypes:Object.freeze(['vegetarian_restaurant']),strictPlaceType:'vegetarian_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:40,maxDistanceMeters:3000,vegetarianOnly:true,sortBy:'distance'})}),
  'vegetarian-here-8km-scharbeutz':Object.freeze({query:'Vegetarisches Restaurant',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['here']),category:'food',includedType:'vegetarian_restaurant',includedTypes:Object.freeze(['vegetarian_restaurant']),strictPlaceType:'vegetarian_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:50,maxDistanceMeters:8000,vegetarianOnly:true})}),
  'vegetarian-here-15km-scharbeutz':Object.freeze({query:'Vegetarisches Restaurant',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['here']),category:'food',includedType:'vegetarian_restaurant',includedTypes:Object.freeze(['vegetarian_restaurant']),strictPlaceType:'vegetarian_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:50,maxDistanceMeters:15000,vegetarianOnly:true})}),
  'minigolf-scharbeutz':Object.freeze({query:'Minigolf',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})}),
  'minigolf-chat-scharbeutz':Object.freeze({query:'Minigolf in Scharbeutz Scharbeutz',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})}),
  'hotels-scharbeutz':Object.freeze({query:'Unterkünfte Scharbeutz',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000}),options:Object.freeze({includedType:'lodging'})}),
  'beach-supplies-scharbeutz':Object.freeze({query:'Strandbedarf Surf Shop',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})}),
  // Public, bounded parity probe for the exact filter path used by Places. It
  // exposes provider names/codes and a small place projection, never credentials
  // or private provider payloads.
  'chinese-scharbeutz':Object.freeze({query:'Chinesisch Restaurant',destination:SCHARBEUTZ_CUISINE_DESTINATION,options:Object.freeze({providers:Object.freeze(['auto']),category:'food',includedType:'chinese_restaurant',includedTypes:Object.freeze(['chinese_restaurant']),strictPlaceType:'chinese_restaurant',strictTypeFiltering:true,strictDestination:true,maxResultCount:50,maxDistanceMeters:5000})}),
  'spanish-scharbeutz':Object.freeze({query:'Spanisch Restaurant Scharbeutz',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:5000}),options:Object.freeze({providers:Object.freeze(['auto']),category:'food',includedType:'spanish_restaurant',includedTypes:Object.freeze(['spanish_restaurant']),strictPlaceType:'spanish_restaurant',strictTypeFiltering:true,maxResultCount:50,maxDistanceMeters:5000})}),
  'food-scharbeutz':Object.freeze({query:'Restaurants Cafés Bars Essen',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:3000}),options:Object.freeze({providers:Object.freeze(['auto']),category:'food',includedType:'restaurant',includedTypes:Object.freeze(['restaurant','cafe','bakery','bar','meal_takeaway','vegetarian_restaurant','vegan_restaurant']),strictTypeFiltering:false,strictDestination:true,maxDistanceMeters:3000})}),
  'nature-scharbeutz':Object.freeze({query:'Parks Gärten Natur Erholung',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:3000}),options:Object.freeze({providers:Object.freeze(['auto']),category:'nature',includedType:'park',includedTypes:Object.freeze(['park','garden','beach','hiking_area','natural_feature']),excludedTypes:Object.freeze(['lodging','accommodation','hotel','hostel','motel','guest_house','bed_and_breakfast','apartment','vacation_rental','holiday_home','resort_hotel','campground','spa']),strictDestination:true,maxDistanceMeters:3000})})
});
const SEARCH_FIELDS='places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.addressComponents,places.location,places.viewport,places.primaryType,places.primaryTypeDisplayName,places.types,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.regularOpeningHours,places.websiteUri,places.googleMapsUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.editorialSummary,places.photos,places.accessibilityOptions,places.businessStatus,places.servesVegetarianFood,places.goodForChildren,places.goodForGroups,places.servesBreakfast,places.servesLunch,places.servesDinner,places.takeout,places.delivery,places.dineIn,places.reservable';
const VIEWPORT_SEARCH_FIELDS='places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.viewport,places.primaryType,places.primaryTypeDisplayName,places.types,places.photos,places.accessibilityOptions,places.businessStatus,places.googleMapsUri';
const VIEWPORT_ENTERPRISE_FIELDS='places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours';
const VIEWPORT_ATMOSPHERE_FIELDS='places.servesVegetarianFood';
const isQuotaError=(error:any)=>{const status=Number(error?.status)||0;const text=`${error?.code||''} ${error?.message||''}`.toLowerCase();return status===429||/quota|rate.?limit|credits remaining|resource.?exhausted/.test(text)};
const searchFields=(options:any={})=>{if(options?.richEvidence===true)return SEARCH_FIELDS;const fields=[VIEWPORT_SEARCH_FIELDS];if(options?.openNow||Number(options?.minRating)>0||(Array.isArray(options?.priceLevels)&&options.priceLevels.length))fields.push(VIEWPORT_ENTERPRISE_FIELDS);if(options?.vegetarianOnly)fields.push(VIEWPORT_ATMOSPHERE_FIELDS);return fields.join(',');};
const DETAIL_FIELDS='id,displayName,formattedAddress,shortFormattedAddress,addressComponents,location,viewport,primaryType,primaryTypeDisplayName,types,rating,userRatingCount,priceLevel,currentOpeningHours,regularOpeningHours,websiteUri,googleMapsUri,nationalPhoneNumber,internationalPhoneNumber,editorialSummary,photos,reviews,accessibilityOptions,businessStatus,parkingOptions,evChargeOptions,fuelOptions,subDestinations,paymentOptions,servesVegetarianFood,goodForChildren,goodForGroups,menuForChildren,servesBreakfast,servesLunch,servesDinner,servesBeer,servesWine,takeout,delivery,dineIn,reservable';

const COUNTRY_META:Record<string,{languages:string[];currency:string}>={DE:{languages:['de'],currency:'EUR'},FR:{languages:['fr'],currency:'EUR'},BE:{languages:['nl','fr','de'],currency:'EUR'},NL:{languages:['nl'],currency:'EUR'},LU:{languages:['lb','fr','de'],currency:'EUR'},AT:{languages:['de'],currency:'EUR'},CH:{languages:['de','fr','it'],currency:'CHF'},ES:{languages:['es'],currency:'EUR'},PT:{languages:['pt'],currency:'EUR'},IT:{languages:['it'],currency:'EUR'},IE:{languages:['en','ga'],currency:'EUR'},GB:{languages:['en'],currency:'GBP'},DK:{languages:['da'],currency:'DKK'},SE:{languages:['sv'],currency:'SEK'},NO:{languages:['no'],currency:'NOK'},FI:{languages:['fi','sv'],currency:'EUR'},PL:{languages:['pl'],currency:'PLN'},CZ:{languages:['cs'],currency:'CZK'},HU:{languages:['hu'],currency:'HUF'},HR:{languages:['hr'],currency:'EUR'},GR:{languages:['el'],currency:'EUR'},US:{languages:['en'],currency:'USD'},CA:{languages:['en','fr'],currency:'CAD'},JP:{languages:['ja'],currency:'JPY'},AU:{languages:['en'],currency:'AUD'}};
const flagEmoji=(code:string)=>/^[A-Z]{2}$/.test(code)?String.fromCodePoint(...[...code].map(char=>127397+char.charCodeAt(0))):'';
function viewportRadius(viewport:any,center:{lat:number;lng:number}){if(!viewport)return 20000;const toRad=(value:number)=>value*Math.PI/180;const distance=(point:{lat:number;lng:number})=>{const dLat=toRad(point.lat-center.lat),dLng=toRad(point.lng-center.lng),lat1=toRad(center.lat),lat2=toRad(point.lat);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));};const corners=[{lat:viewport.south,lng:viewport.west},{lat:viewport.south,lng:viewport.east},{lat:viewport.north,lng:viewport.west},{lat:viewport.north,lng:viewport.east}];return Math.max(5000,Math.min(50000,Math.round(Math.max(...corners.map(distance))*1.35/1000)*1000));}

const DESTINATION_FIELDS='places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.viewport,places.primaryType,places.types';
const hash=(value:unknown)=>{const text=JSON.stringify(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36)};
const getKey=()=>Deno.env.get('GOOGLE_PLACES_API_KEY')||'';
const getFoursquareKey=()=>Deno.env.get('FOURSQUARE_API_KEY')||'';
const GEOAPIFY_BASE='https://api.geoapify.com/v2';
const getGeoapifyKey=()=>Deno.env.get('GEOAPIFY_API_KEY')||Deno.env.get('GEOAPIFY_KEY')||'';

function geoapifyRectFilter(rect:any){
  const low=rect?.low,high=rect?.high;
  if(!low||!high)return null;
  const lon1=Number(low.longitude??low.lng),lat1=Number(low.latitude??low.lat);
  const lon2=Number(high.longitude??high.lng),lat2=Number(high.latitude??high.lat);
  if(![lon1,lat1,lon2,lat2].every(Number.isFinite))return null;
  return `rect:${lon1},${lat1},${lon2},${lat2}`;
}
function geoapifyBiasFromRestriction(restriction:any){
  // Geoapify's `bias` prefers results within the viewport but doesn't hard-filter.
  const rect=restriction?.rectangle;
  const filter=geoapifyRectFilter(rect);
  if(!filter)return null;
  return filter;
}

const GEOAPIFY_DEFAULT_RADIUS_METERS=10000;
// Only use categories that Geoapify Places accepts. Invalid tokens (e.g. some
// nested catering/sport values) make the whole request 400 — and if the
// category-scoped fallback repeats them, food discovery dies while lodging works.
const GEOAPIFY_CATEGORIES_FALLBACK=Object.freeze(['catering','tourism.sights','leisure.park']);
const GEOAPIFY_CATEGORY_FALLBACK_BY_KEY=Object.freeze({
  food:Object.freeze(['catering']),
  restaurant:Object.freeze(['catering.restaurant','catering.cafe','catering.bar']),
  accommodation:Object.freeze(['accommodation']),
  lodging:Object.freeze(['accommodation']),
  activities:Object.freeze(['entertainment','leisure','sport']),
  activity:Object.freeze(['entertainment','leisure','sport']),
  themeparks:Object.freeze(['entertainment.theme_park','entertainment.water_park','entertainment.activity_park']),
  wellness:Object.freeze(['leisure.spa']),
  water:Object.freeze(['beach','sport.swimming_pool','entertainment.water_park']),
  sights:Object.freeze(['tourism.sights']),
  photo:Object.freeze(['tourism.sights','leisure.park']),
  culture:Object.freeze(['entertainment.museum','entertainment.cinema','entertainment.culture']),
  nature:Object.freeze(['natural','leisure.park','beach']),
  shopping:Object.freeze(['commercial']),
  malls:Object.freeze(['commercial.shopping_mall']),
  nightlife:Object.freeze(['catering.bar','catering.pub','adult.nightclub','adult.casino','entertainment.culture']),
  practical:Object.freeze(['commercial','healthcare.pharmacy','parking']),
  attraction:Object.freeze(['tourism.sights']),
  custom:Object.freeze(['catering','tourism.sights','leisure.park'])
});
const GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE=Object.freeze({
  restaurant:'catering.restaurant',
  cafe:'catering.cafe',
  bakery:'commercial.food_and_drink.bakery',
  bar:'catering.bar',
  meal_takeaway:'catering.fast_food',
  food_court:'catering.food_court',
  fine_dining_restaurant:'catering.restaurant',
  vegetarian_restaurant:'catering.restaurant',
  vegan_restaurant:'catering.restaurant',
  italian_restaurant:'catering.restaurant.italian',
  german_restaurant:'catering.restaurant.german',
  mediterranean_restaurant:'catering.restaurant.mediterranean',
  greek_restaurant:'catering.restaurant.greek',
  french_restaurant:'catering.restaurant.french',
  spanish_restaurant:'catering.restaurant.spanish',
  indian_restaurant:'catering.restaurant.indian',
  asian_restaurant:'catering.restaurant.asian,catering.restaurant.chinese,catering.restaurant.japanese,catering.restaurant.thai,catering.restaurant.vietnamese,catering.restaurant.korean,catering.restaurant.indian,catering.restaurant.sushi,catering.restaurant.malaysian,catering.restaurant.indonesian',
  chinese_restaurant:'catering.restaurant.chinese',
  japanese_restaurant:'catering.restaurant.japanese',
  thai_restaurant:'catering.restaurant.thai',
  vietnamese_restaurant:'catering.restaurant.vietnamese',
  korean_restaurant:'catering.restaurant.korean',
  mexican_restaurant:'catering.restaurant.mexican',
  middle_eastern_restaurant:'catering.restaurant.arab,catering.restaurant.oriental',
  lebanese_restaurant:'catering.restaurant.lebanese',
  turkish_restaurant:'catering.restaurant.turkish',
  accommodation:'accommodation',
  hotel:'accommodation.hotel',
  lodging:'accommodation',
  apartment:'accommodation.apartment',
  vacation_rental:'accommodation.chalet',
  hostel:'accommodation.hostel',
  campground:'camping.camp_site',
  park:'leisure.park',
  garden:'leisure.park.garden',
  beach:'beach',
  swimming_pool:'sport.swimming_pool',
  water_park:'entertainment.water_park',
  amusement_center:'entertainment.activity_park',
  amusement_park:'entertainment.theme_park',
  playground:'leisure.playground',
  zoo:'entertainment.zoo',
  spa:'leisure.spa',
  museum:'entertainment.museum',
  art_gallery:'entertainment.culture.gallery',
  movie_theater:'entertainment.cinema',
  performing_arts_theater:'entertainment.culture.theatre',
  marina:'maritime.marina',
  tourist_attraction:'tourism.sights',
  historical_landmark:'tourism.sights',
  monument:'tourism.sights.memorial.monument',
  observation_deck:'tourism.attraction.viewpoint',
  hiking_area:'natural',
  concert_hall:'entertainment.culture',

  shopping:'commercial',
  shopping_mall:'commercial.shopping_mall',
  market:'commercial.marketplace',
  store:'commercial',
  clothing_store:'commercial.clothing',
  department_store:'commercial.department_store',
  night_club:'adult.nightclub',
  nightclub:'adult.nightclub',
  nightlife_spot:'adult.nightclub',
  dance_club:'adult.nightclub',
  discotheque:'adult.nightclub',
  disco:'adult.nightclub',
  pub:'catering.pub',
  beer_bar:'catering.bar',
  cocktail_bar:'catering.bar',
  sports_bar:'catering.bar',
  tiki_bar:'catering.bar',
  wine_bar:'catering.bar',
  lounge:'catering.bar',
  lounge_bar:'catering.bar',
  beach_bar:'catering.bar',
  taproom:'catering.taproom',
  biergarten:'catering.biergarten',
  live_music_venue:'entertainment.culture',
  music_venue:'entertainment.culture',
  jazz_club:'entertainment.culture',
  comedy_club:'entertainment.culture',
  karaoke_bar:'adult.nightclub',
  casino:'adult.casino',
  pharmacy:'healthcare.pharmacy',
  supermarket:'commercial.supermarket',
  parking:'parking',
  electric_vehicle_charging_station:'service.vehicle.charging_station',
  atm:'service.financial.atm',
  laundry:'commercial',
  // Parent `catering` is the reliable food bucket. Nested lists previously 400'd
  // the whole Places map for the default Restaurant category.
  food:'catering',
  activities:'entertainment,leisure,sport',
  activity:'entertainment,leisure,sport',
  themeparks:'entertainment.theme_park,entertainment.water_park,entertainment.activity_park',
  wellness:'leisure.spa',
  water:'beach,sport.swimming_pool,entertainment.water_park',
  sights:'tourism.sights',
  photo:'tourism.sights,leisure.park',
  culture:'entertainment.museum,entertainment.cinema',
  nature:'natural,leisure.park,beach',
  malls:'commercial.shopping_mall',
  nightlife:'catering.bar,catering.pub,adult.nightclub,adult.casino,entertainment.culture',
  practical:'commercial,healthcare.pharmacy,parking',
  attraction:'tourism.sights',
  custom:'catering,tourism.sights,leisure.park'
});
const GEOAPIFY_CATEGORIES_BY_INTENT=Object.freeze({
  minigolf:'sport,entertainment,leisure',
  restaurant:'catering',
  hotel:'accommodation'
});
// Most categories stay on the cheapest successful provider. Nightlife is a
// deliberate exception: provider taxonomies split bars, clubs, live venues and
// casinos differently, so a tiny primary answer is a partial inventory rather
// than proof that the destination has no more evening venues.
const PROVIDER_BREADTH_FLOOR_BY_CATEGORY=Object.freeze({nightlife:12});
export function providerBreadthTarget(category:any,providers:any=['auto']){
  const requested=Array.isArray(providers)&&providers.length?providers:['auto'];
  return requested.includes('auto')?Number((PROVIDER_BREADTH_FLOOR_BY_CATEGORY as any)[String(category||'').toLowerCase()]||0):0;
}

function geoapifyFallbackCategories(options:any={}){
  const key=String(options?.category||options?.type||'').toLowerCase();
  return [...((GEOAPIFY_CATEGORY_FALLBACK_BY_KEY as any)[key]||GEOAPIFY_CATEGORIES_FALLBACK)];
}

function geoapifyCuisineSelections(options:any={}){
  const selected=Array.isArray(options.includedTypes)?options.includedTypes:[];
  const cuisines=selected.filter((type:string)=>type.endsWith('_restaurant')&&type!=='fine_dining_restaurant'&&(GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[type]);
  // Default Food taxonomy contains dietary types too; only explicit selections
  // may turn those into exclusive-diet conditions.
  return cuisines.some((type:string)=>!['vegetarian_restaurant','vegan_restaurant'].includes(type))||!options.includedType||selected.length===1?cuisines:[];
}
function geoapifyCategoriesFromOptions(options:any,textQuery=''){
  const categoryKey=String(options?.category||'').toLowerCase();
  const selectedTypes=Array.isArray(options?.includedTypes)?options.includedTypes:[];
  const cuisines=geoapifyCuisineSelections(options);
  const national=cuisines.filter((type:string)=>!['vegetarian_restaurant','vegan_restaurant'].includes(type));
  if(national.length)return [...new Set(national.flatMap((type:string)=>String((GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[type]).split(',')))];
  if(cuisines.length)return ['catering.restaurant'];
  if(options.strictTypeFiltering&&selectedTypes.length>1)return [...new Set(selectedTypes.flatMap((type:string)=>String((GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[type]||'').split(',')).filter(Boolean))];
  const strictType=String(options?.strictPlaceType||'').trim()||(selectedTypes.length===1?String(selectedTypes[0]).trim():'')||(!selectedTypes.length||options?.strictTypeFiltering?String(options?.includedType||'').trim():'');
  // One Luvia category → one Geoapify parent family. Subtype filters may refine
  // to a single mapped type; never mix tourism into food or vice versa.
  if(categoryKey&&(GEOAPIFY_CATEGORY_FALLBACK_BY_KEY as any)[categoryKey]){
    if(strictType&&(GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[strictType]){
      return String((GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[strictType]).split(',').map((part:string)=>part.trim()).filter(Boolean).slice(0,3);
    }
    return [...(GEOAPIFY_CATEGORY_FALLBACK_BY_KEY as any)[categoryKey]].slice(0,3);
  }
  const tokens=[...(Array.isArray(options?.includedTypes)?options.includedTypes:[]),options?.includedType, ...(Array.isArray(options?.includedPrimaryTypes)?options.includedPrimaryTypes:[]),options?.type].filter(Boolean);
  const categories=new Set<string>();
  const add=(value:any)=>{for(const part of String(value||'').split(',').map(item=>item.trim()).filter(Boolean))categories.add(part)};
  for(const token of tokens){
    const key=String(token).trim();
    const mapped=(GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[key];
    if(mapped)add(mapped);
  }
  const query=String(textQuery||'').toLowerCase();
  if(/mini[ -]?golf|putt[ -]?putt/.test(query))add(GEOAPIFY_CATEGORIES_BY_INTENT.minigolf);
  if(/restaurant|café|cafe|imbiss|essen/.test(query))add(GEOAPIFY_CATEGORIES_BY_INTENT.restaurant);
  if(/hotel|unterkunft|apartment/.test(query))add(GEOAPIFY_CATEGORIES_BY_INTENT.hotel);
  return categories.size?[...categories].slice(0,3):geoapifyFallbackCategories(options);
}
function geoapifyNameFilter(textQuery:string){
  const query=String(textQuery||'').replace(/\s+/g,' ').trim();
  if(!query)return '';
  if(/\[object object\]/i.test(query))return '';
  if(query.split(' ').length>3||query.length>40)return '';
  if(/\b(?:ruhig(?:e[nrs]?)?|am wasser|orte|aktivit|unterkunft|sehensw|entdeck|restaurants?|caf[eé]s?|bars?|essen|hotels?|imbiss)\b/i.test(query))return '';
  return query;
}
function geoapifyCircleFilter(destination:any,options:any,bias:any){
  const center=bias?.circle?.center||destination?.location||destination?.canonicalCity?.center||destination?.center||destination?.coordinates||null;
  const latitude=Number(center?.latitude??center?.lat);
  const longitude=Number(center?.longitude??center?.lng);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return null;
  const radius=Math.round(Number(options?.maxDistanceMeters||bias?.circle?.radius||destination?.searchRadiusMeters||GEOAPIFY_DEFAULT_RADIUS_METERS));
  return `circle:${longitude},${latitude},${Math.max(500,Math.min(50000,Number.isFinite(radius)?radius:GEOAPIFY_DEFAULT_RADIUS_METERS))}`;
}

function base64Url(bytes:Uint8Array){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function createPlacesSessionToken(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return base64Url(bytes);}
function normalizePlacesSessionToken(value:unknown){const token=String(value||'').trim();if(/^[A-Za-z0-9_-]{16,256}$/.test(token))return token;return createPlacesSessionToken();}

const cleanObject=(value:any):any=>{if(Array.isArray(value))return value.map(cleanObject);if(value&&typeof value==='object'){const out:any={};for(const[k,v]of Object.entries(value)){if(v!==undefined&&v!==null&&v!==''&&!(Array.isArray(v)&&!v.length))out[k]=cleanObject(v);}return out;}return value;};
function cached(key:string){const item=cache.get(key);if(!item)return null;if(item.expires<Date.now()){cache.delete(key);return null;}metrics.cacheHits++;return item.value;}
function store(key:string,value:unknown,ttlMs:number){cache.set(key,{expires:Date.now()+ttlMs,value});if(cache.size>250){const first=cache.keys().next().value;if(first)cache.delete(first);}}
function boundedGoogleError(body:any){const error=body?.error||{};const details=Array.isArray(error?.details)?error.details:[];const info=details.find((item:any)=>item&&typeof item==='object'&&(item.reason||item.metadata?.service))||{};return{providerStatus:String(error?.status||'UNKNOWN').slice(0,80),reason:String(info?.reason||error?.status||'unknown').slice(0,80),service:String(info?.metadata?.service||'places.googleapis.com').slice(0,160)};}
async function google(path:string,init:RequestInit,fieldMask?:string){const key=getKey();if(!key)throw Object.assign(new Error('Google Places API Key ist nicht konfiguriert.'),{code:'PLACES_NOT_CONFIGURED',status:503});metrics.requests++;metrics.providers.google.requests++;metrics.lastRequestAt=new Date().toISOString();const headers=new Headers(init.headers);headers.set('Content-Type','application/json');headers.set('X-Goog-Api-Key',key);if(fieldMask)headers.set('X-Goog-FieldMask',fieldMask);const response=await providerFetch('google',path.includes('search')?'search':path.includes('autocomplete')?'autocomplete':path.includes('/media')?'photo':'details',1,`${BASE}${path}`,{...init,headers});const body=await response.json().catch(()=>({}));if(!response.ok){const diagnostic=boundedGoogleError(body);metrics.failures++;metrics.providers.google.failures++;metrics.lastError={provider:'google',httpStatus:response.status,...diagnostic};const message=body?.error?.message||`Google Places Anfrage fehlgeschlagen (${response.status}).`;throw Object.assign(new Error(message),{code:'PLACES_PROVIDER_ERROR',status:response.status,reason:diagnostic.reason,service:diagnostic.service,providerStatus:diagnostic.providerStatus});}metrics.successes++;metrics.providers.google.successes++;metrics.lastSuccessAt=new Date().toISOString();return body;}

async function foursquare(path:string,params:Record<string,unknown>={}){
  const key=getFoursquareKey();
  if(!key)throw Object.assign(new Error('Foursquare Service API Key ist nicht konfiguriert.'),{code:'FOURSQUARE_NOT_CONFIGURED',status:503});
  const qs=new URLSearchParams();
  for(const [name,value] of Object.entries(params)){
    if(value===undefined||value===null||value===''||(Array.isArray(value)&&!value.length))continue;
    qs.set(name,Array.isArray(value)?value.join(','):String(value));
  }
  metrics.requests++;metrics.providers.foursquare.requests++;metrics.lastRequestAt=new Date().toISOString();
  const response=await providerFetch('foursquare',path.includes('/search')?'search':path.includes('/photos')?'photo':'details',1,`${FOURSQUARE_BASE}${path}${qs.size?`?${qs}`:''}`,{headers:{Accept:'application/json',Authorization:`Bearer ${key}`,'X-Places-Api-Version':FOURSQUARE_API_VERSION}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){const diagnostic=boundedFoursquareError(body);metrics.failures++;metrics.providers.foursquare.failures++;metrics.lastError={provider:'foursquare',status:response.status,...diagnostic};throw Object.assign(new Error(diagnostic.message||`Foursquare Anfrage fehlgeschlagen (${response.status}).`),{code:'FOURSQUARE_PROVIDER_ERROR',status:response.status,provider:diagnostic});}
  metrics.successes++;metrics.providers.foursquare.successes++;metrics.lastSuccessAt=new Date().toISOString();return body;
}
async function foursquareWithFieldFallback(path:string,params:Record<string,unknown>,fallbackFields:readonly string[]){
  try{return await foursquare(path,params)}catch(error:any){
    if(![400,403].includes(Number(error?.status))||!params.fields||/credits|billing|payment/i.test(String(error?.message||'')))throw error;
    metrics.providers.foursquare.fieldFallbacks++;
    try{return await foursquare(path,{...params,fields:fallbackFields.join(',')})}catch(fallbackError:any){
      if(![400,403].includes(Number(fallbackError?.status)))throw fallbackError;
      metrics.providers.foursquare.fieldFallbacks++;
      const {fields:_retiredFields,...providerDefaults}=params;
      return foursquare(path,providerDefaults);
    }
  }
}
function canonicalKey(place:any){const name=String(place?.name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();const lat=Number(place?.location?.latitude),lng=Number(place?.location?.longitude);return `${name}|${Number.isFinite(lat)?lat.toFixed(3):''}|${Number.isFinite(lng)?lng.toFixed(3):''}`;}
function mergeProviderPlaces(items:any[]){const out:any[]=[];const index=new Map<string,number>();for(const place of items){if(!place?.name)continue;const key=canonicalKey(place);const existingIndex=index.get(key);if(existingIndex===undefined){place.providerRefs=place.providerRefs||{[place.provider||'google-places']:String(place.id||'')};place.evidence=place.evidence||[{provider:place.provider||'google-places',kind:'place-search'}];index.set(key,out.length);out.push(place);continue;}const current=out[existingIndex];const preferGoogle=String(current.provider||'').includes('google')||String(place.provider||'').includes('google');const primary=String(current.provider||'').includes('google')?current:String(place.provider||'').includes('google')?place:current;const currentCount=current.userRatingCount,otherCount=place.userRatingCount;const userRatingCount=(currentCount==null&&otherCount==null)?null:Math.max(...[currentCount,otherCount].filter(v=>v!=null).map(v=>Number(v)).filter(v=>Number.isFinite(v)));out[existingIndex]={...current,...primary,provider:'multi',providerRefs:{...(current.providerRefs||{}),...(place.providerRefs||{}),[String(current.provider||'google')]:String(current.id||''),[String(place.provider||'foursquare')]:String(place.id||'')},evidence:[...(current.evidence||[]),...(place.evidence||[])],rating:current.rating??place.rating,userRatingCount,photos:(current.photos?.length?current.photos:place.photos)||[],_multiProvider:preferGoogle};}return out;}
function profileContextText(options:any){const p=options?.profileContext||{};const parts=[];if(p.vegetarian||p.diet==='vegetarian')parts.push('vegetarian food required');if(p.vegan||p.diet==='vegan')parts.push('vegan food required');if(p.withChild||p.familyFriendly)parts.push('traveling with a child; family friendly');if(p.stroller)parts.push('stroller friendly');for(const x of (p.preferences||[]).slice(0,8))parts.push(String(x));return parts.join(', ');}
// A Foursquare category filter is applied only when an owner caller supplies an
// explicit, reviewed taxonomy set. The broad five-digit "Restaurant" node does
// not reliably include every local descendant category in all datasets. Luvia
// therefore validates restaurant evidence after retrieval instead of silently
// excluding legitimate restaurants before ranking them.
function foursquareCategoryFilter(options:any){const strict=String(options?.strictPlaceType||options?.includedType||'');const dietary=['vegetarian_restaurant','vegan_restaurant'].includes(strict)?FOURSQUARE_VEGAN_VEGETARIAN_CATEGORY_ID:'';const explicit=Array.isArray(options?.foursquareCategoryIds)?options.foursquareCategoryIds.join(','):String(options?.foursquareCategoryIds||dietary);const safe=explicit.split(',').map((value:string)=>value.trim()).filter((value:string)=>/^\d{4,8}$|^[a-f0-9]{24}$/i.test(value)).slice(0,12);return safe.length?safe.join(','):undefined;}
function foursquareRadius(destination:any,options:any,anchor:any){if(!anchor)return undefined;const explicit=Number(options?.maxDistanceMeters);if(Number.isFinite(explicit)&&explicit>0)return Math.min(100000,Math.max(1000,Math.round(explicit)));const destinationRadius=Number(destination?.searchRadiusMeters||destination?.canonicalCity?.searchRadiusMeters);return Number.isFinite(destinationRadius)&&destinationRadius>0?Math.min(25000,Math.max(5000,Math.round(destinationRadius))):12000;}
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function foursquareQuery(query:string,destination:any){
  let normalized=String(query||'').replace(/\s+/g,' ').trim();
  const names=[destination?.canonicalCity?.name,destination?.name,destination?.displayName]
    .map((value:any)=>String(value||'').trim()).filter((value:string,index:number,items:string[])=>value.length>1&&items.findIndex(item=>item.toLocaleLowerCase('de-DE')===value.toLocaleLowerCase('de-DE'))===index)
    .sort((left:string,right:string)=>right.length-left.length);
  for(const name of names){
    const escaped=escapeRegExp(name);
    normalized=normalized.replace(new RegExp(`(?:\\b(?:in|bei|nahe|near)\\s+)?${escaped}(?=\\s|$)`,`gi`),' ');
  }
  normalized=normalized.replace(/\s+/g,' ').trim().replace(/\b(?:in|bei|nahe|near)\s*$/i,'').trim();
  return normalized.length>=2?normalized:String(query||'').trim();
}
async function foursquareSearch(query:string,destination:any,options:any){const anchor=searchAnchor(destination,options);const near=destination?.canonicalCity?.name||destination?.name||'';const params:any={query:foursquareQuery(query,destination),limit:Math.min(50,Math.max(1,Number(options?.maxResultCount||10))),sort:'RELEVANCE',fields:FOURSQUARE_SEARCH_FIELDS.join(',')};if(anchor)params.ll=`${anchor.latitude},${anchor.longitude}`;else if(near)params.near=near;const radius=foursquareRadius(destination,options,anchor),categoryFilter=foursquareCategoryFilter(options);if(radius)params.radius=radius;if(categoryFilter)params.fsq_category_ids=categoryFilter;if(options?.openNow)params.open_now=true;const raw=await foursquareWithFieldFallback('/places/search',params,[...FOURSQUARE_PRO_FIELDS,'distance']);const rows=raw.results||raw.places||[];return rows.map((place:any)=>normalizeFoursquarePlace(place,{evidenceKind:'place-search'}));}

function exactMediaName(value:any){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function exactMediaCandidate(place:any,candidate:any){
  const placeName=exactMediaName(place?.name),candidateName=exactMediaName(candidate?.name),meters=distanceMeters(candidate?.location,place?.location)??Infinity;
  if(!placeName||!candidateName||!candidate?.location||!place?.location)return false;
  if(placeName===candidateName)return meters<=120;
  // Provider naming often adds an owner or a location suffix (for example
  // “Toni's Essbar” vs “Essbar”). Accept that bounded alias only when the
  // distinctive shorter name is substantial, covers at least half the longer
  // name and both providers place the venue within 25 metres.
  const shorter=placeName.length<=candidateName.length?placeName:candidateName,longer=shorter===placeName?candidateName:placeName;
  return meters<=25&&shorter.length>=6&&shorter.length/longer.length>=.5&&longer.includes(shorter);
}
async function foursquarePlaceDetails(fsqId:string,enrichMedia=false){
  const raw=await foursquareWithFieldFallback(`/places/${encodeURIComponent(fsqId)}`,{fields:FOURSQUARE_DETAILS_FIELDS.join(',')},FOURSQUARE_PRO_FIELDS);
  let place=normalizeFoursquarePlace(raw,{evidenceKind:'place-details'});
  if(enrichMedia&&!place.photos?.length){
    try{
      const photoRaw=await foursquare(`/places/${encodeURIComponent(fsqId)}/photos`,{limit:1,sort:'POPULAR'}),photos=Array.isArray(photoRaw)?photoRaw:(photoRaw?.photos||photoRaw?.results||[]);
      if(photos.length)place=normalizeFoursquarePlace({...raw,fsq_place_id:raw?.fsq_place_id||fsqId,photos},{evidenceKind:'place-details-photo'});
    }catch{}
  }
  return place;
}
async function enrichExactFoursquareMedia(place:any){
  if(!place||place.photos?.length||!getFoursquareKey()||!exactMediaName(place.name)||!coordinate(place.location))return place;
  metrics.providers.foursquare.exactMediaAttempts++;
  try{
    const rows=await foursquareSearch(place.name,{location:place.location},{maxResultCount:3,maxDistanceMeters:1000});
    const candidates=rows.filter((candidate:any)=>exactMediaCandidate(place,candidate));
    let match=candidates.find((candidate:any)=>candidate.photos?.length)||null;
    if(!match&&candidates[0]){
      const fsqId=String(candidates[0].id||'').replace(/^fsq:/,'');
      if(fsqId){
        // The current Places API exposes photos through a dedicated place-photo
        // endpoint. Search/details premium fields may be unavailable on a free
        // plan, so request one popular photo only after strict identity matching.
        const raw=await foursquare(`/places/${encodeURIComponent(fsqId)}/photos`,{limit:1,sort:'POPULAR'});
        const photos=Array.isArray(raw)?raw:(raw?.photos||raw?.results||[]);
        const projected=normalizeFoursquarePlace({fsq_place_id:fsqId,name:candidates[0].name,latitude:candidates[0].location?.latitude,longitude:candidates[0].location?.longitude,photos},{evidenceKind:'place-photo'});
        if(projected.photos?.length)match={...candidates[0],photos:projected.photos};
      }
    }
    if(!match){metrics.providers.foursquare.exactMediaMisses++;return place}
    metrics.providers.foursquare.exactMediaMatches++;
    const fsqId=String(match.id||'').replace(/^fsq:/,'');
    return{...place,photos:match.photos,providerRefs:{...(place.providerRefs||{}),foursquare:fsqId},evidence:[...(place.evidence||[]),{provider:'foursquare',kind:'exact-name-and-coordinate-photo-match',providerPlaceId:fsqId,maxDistanceMeters:120}]};
  }catch{metrics.providers.foursquare.exactMediaFailures++;return place}
}

async function resolveTimezone(latitude:number,longitude:number){
  const key=getKey();
  if(!key)return{ok:false,status:'KEY_MISSING',message:'GOOGLE_PLACES_API_KEY fehlt.'};
  metrics.timezoneRequests++;
  try{
    const params=new URLSearchParams({location:`${latitude},${longitude}`,timestamp:String(Math.floor(Date.now()/1000)),key,language:'de'});
    const response=await providerFetch('google','timezone',1,`${TIMEZONE_BASE}?${params.toString()}`,{headers:{Accept:'application/json'}});
    const body=await response.json().catch(()=>({status:'INVALID_RESPONSE'}));
    console.log('[luvia-gateway][timezone] response',{
      httpStatus:response.status,
      ok:response.ok,
      googleStatus:body?.status||null,
      errorMessage:body?.errorMessage||body?.error_message||null,
      timeZoneId:body?.timeZoneId||null,
      timeZoneName:body?.timeZoneName||null,
      location:{latitude,longitude}
    });
    if(!response.ok||body?.status!=='OK'){
      metrics.timezoneFailures++;
      metrics.lastError={provider:'google-timezone',httpStatus:response.status,status:body?.status||'UNKNOWN_ERROR',message:body?.errorMessage||body?.error_message||'Time Zone API lieferte kein Ergebnis.'};
      return{ok:false,status:String(body?.status||`HTTP_${response.status}`),message:String(body?.errorMessage||body?.error_message||'Time Zone API lieferte kein Ergebnis.')};
    }
    return{ok:true,status:'OK',timezone:String(body.timeZoneId||''),timezoneName:String(body.timeZoneName||''),rawOffsetSeconds:Number(body.rawOffset||0),dstOffsetSeconds:Number(body.dstOffset||0)};
  }catch(error){
    metrics.timezoneFailures++;
    const message=error instanceof Error?error.message:String(error);
    metrics.lastError={provider:'google-timezone',status:'NETWORK_ERROR',message};
    return{ok:false,status:'NETWORK_ERROR',message};
  }
}
function normalizedViewport(v:any){if(!v)return null;const low=v.low||v.southwest||{};const high=v.high||v.northeast||{};const south=Number(low.latitude),west=Number(low.longitude),north=Number(high.latitude),east=Number(high.longitude);return [south,west,north,east].every(Number.isFinite)?{south,west,north,east}:null;}
function addressPart(components:any[],type:string){return components?.find(c=>Array.isArray(c.types)&&c.types.includes(type))||null;}
function geoapifyLuviaTypes(categories:any[]=[]){
  const types=new Set<string>();
  for(const raw of categories){
    const key=String(raw||'').toLowerCase();
    if(!key)continue;
    types.add(key.replace(/[./]+/g,'_'));
    if(key.startsWith('catering.restaurant'))types.add('restaurant');
    if(key.startsWith('catering.restaurant.')){const cuisine=key.slice('catering.restaurant.'.length);types.add(`${cuisine}_restaurant`);if(['arab','oriental'].includes(cuisine))types.add('middle_eastern_restaurant')}
    if(key.startsWith('catering.cafe'))types.add('cafe');
    if(key.startsWith('catering.bar'))types.add('bar');
    if(key==='catering.pub'){types.add('pub');types.add('bar')}
    if(key==='catering.taproom'||key==='catering.biergarten'){types.add('pub');types.add('bar')}
    if(key.startsWith('catering.bakery')||key==='commercial.food_and_drink.bakery')types.add('bakery');
    if(key==='catering.food_court')types.add('food_court');
    if(key.startsWith('catering.fast_food'))types.add('meal_takeaway');
    if(key.startsWith('accommodation'))types.add('lodging');
    if(key==='accommodation.hotel')types.add('hotel');
    if(key==='accommodation.apartment')types.add('apartment');
    if(key==='accommodation.chalet')types.add('vacation_rental');
    if(key==='accommodation.hostel')types.add('hostel');
    if(key.startsWith('camping.')){types.add('campground');types.add('lodging')}
    if(key==='vegetarian.only')types.add('vegetarian_restaurant');
    if(key==='vegan.only')types.add('vegan_restaurant');
    if(key==='leisure.park.garden')types.add('garden');
    if(key==='maritime.marina')types.add('marina');
    if(key==='adult.nightclub')types.add('night_club');
    if(key==='adult.casino')types.add('casino');
    if(/^tourism\.sights\.(?:castle|ruins|ruines|archaeological|fort|memorial)/.test(key))types.add('historical_landmark');
    if(key==='tourism.sights.memorial.monument')types.add('monument');
    if(key==='tourism.attraction.viewpoint')types.add('observation_deck');
    if(key==='healthcare.pharmacy'||key==='commercial.health_and_beauty.pharmacy')types.add('pharmacy');
    if(key==='commercial.supermarket')types.add('supermarket');
    if(key.startsWith('parking'))types.add('parking');
    if(key==='service.vehicle.charging_station')types.add('electric_vehicle_charging_station');
    if(key==='service.financial.atm')types.add('atm');
    if(key==='natural'||key.startsWith('natural.'))types.add('natural_feature');
    if(key.includes('spa')||key.includes('sauna')||key.includes('wellness'))types.add('spa');
    if(key.includes('playground'))types.add('playground');
    if(key==='park'||key.startsWith('leisure.park'))types.add('park');
    if(key.includes('beach'))types.add('beach');
    if(key.includes('museum'))types.add('museum');
    if(key.includes('zoo'))types.add('zoo');
    if(key.includes('theme_park')||key.includes('amusement'))types.add('amusement_park');
    if(key.includes('water_park'))types.add('water_park');
    if(key==='sport.swimming_pool')types.add('swimming_pool');
    if(key.startsWith('entertainment.activity_park'))types.add('amusement_center');
    if(key==='entertainment.cinema')types.add('movie_theater');
    if(key==='entertainment.culture.theatre')types.add('performing_arts_theater');
    if(key==='entertainment.culture.gallery')types.add('art_gallery');
    if(key.startsWith('tourism')||key.includes('sights')||key.includes('attraction'))types.add('tourist_attraction');
    if(key.startsWith('entertainment')||key.startsWith('leisure')||key.startsWith('sport'))types.add('activity');
    if(key.startsWith('commercial'))types.add('store');
    if(key.startsWith('commercial.clothing'))types.add('clothing_store');
    if(key==='commercial.department_store')types.add('department_store');
    if(key==='commercial.marketplace')types.add('market');
    if(key.includes('shopping_mall'))types.add('shopping_mall');
  }
  return[...types].slice(0,40);
}
const GEOAPIFY_GENERIC_TYPE=/^(?:building|wheelchair|access|access_limited|fee|vegetarian|vegan|no_dogs|internet_access|payment|toilets|outdoor|indoor)(?:_|$)/;
const GEOAPIFY_PRIMARY_RANK=Object.freeze(['restaurant','cafe','cocktail_bar','wine_bar','pub','bar','night_club','lounge_bar','live_music_venue','jazz_club','comedy_club','karaoke_bar','casino','bakery','meal_takeaway','lodging','spa','playground','amusement_park','water_park','zoo','museum','beach','park','tourist_attraction','shopping_mall','store','activity','sport','leisure','entertainment','catering']);
function preferChildCategory(mappedTypes:string[]=[],nativeEvidence:string[]=[]):string{
  const natives=nativeEvidence.map(value=>String(value||'').toLowerCase());
  // Child Geoapify paths beat generic parents and building.* noise.
  if(natives.some(value=>value.startsWith('catering.restaurant')||value==='catering.restaurant'))return'restaurant';
  if(natives.some(value=>value.startsWith('catering.cafe')))return'cafe';
  if(natives.some(value=>value.startsWith('catering.bar')))return'bar';
  if(natives.some(value=>value.startsWith('catering.bakery')))return'bakery';
  if(natives.some(value=>value.startsWith('catering.fast_food')))return'meal_takeaway';
  if(natives.some(value=>value.startsWith('accommodation.hotel')||value.startsWith('accommodation')))return'lodging';
  if(natives.some(value=>value.includes('shopping_mall')))return'shopping_mall';
  if(natives.some(value=>value.startsWith('entertainment.museum')||value.includes('museum')))return'museum';
  if(natives.some(value=>value.includes('playground')))return'playground';
  if(natives.some(value=>value.includes('theme_park')||value.includes('amusement')))return'amusement_park';
  const ranked=[...mappedTypes].filter(type=>type&&!GEOAPIFY_GENERIC_TYPE.test(type)&&!/[./]/.test(type));
  ranked.sort((left,right)=>{
    const li=GEOAPIFY_PRIMARY_RANK.indexOf(left),ri=GEOAPIFY_PRIMARY_RANK.indexOf(right);
    return (li<0?999:li)-(ri<0?999:ri);
  });
  return String(ranked[0]||mappedTypes.find(type=>!GEOAPIFY_GENERIC_TYPE.test(type))||mappedTypes[0]||'');
}
function geoapifyHasProviderName(props:any):boolean{
  return Boolean(
    geoapifyTextField(props?.name)||
    geoapifyTextField(props?.names)||
    geoapifyTextField(props?.names?.default)||
    geoapifyTextField(props?.names?.de)||
    geoapifyTextField(props?.names?.en)
  );
}
function geoapifyTextField(value:any):string{
  if(value==null||typeof value==='boolean')return '';
  if(typeof value==='number'&&Number.isFinite(value))return String(value);
  if(typeof value==='string')return value.trim();
  if(typeof value==='object'){
    for(const key of ['text','name','default','de','en','fr','nl','it','es']){
      const nested=geoapifyTextField((value as any)[key]);
      if(nested)return nested;
    }
  }
  return '';
}
function geoapifyTypeLabel(types:string[]=[]){
  const labels:Record<string,string>={
    restaurant:'Restaurant',cafe:'Café',bar:'Bar',pub:'Pub',cocktail_bar:'Cocktailbar',wine_bar:'Weinbar',night_club:'Club',lounge_bar:'Lounge',live_music_venue:'Live-Musik',jazz_club:'Jazzclub',comedy_club:'Comedy-Club',karaoke_bar:'Karaoke',casino:'Casino',bakery:'Bäckerei',meal_takeaway:'Imbiss',
    lodging:'Unterkunft',spa:'Wellness',playground:'Spielplatz',park:'Park',beach:'Strand',
    museum:'Museum',zoo:'Zoo',amusement_park:'Freizeitpark',water_park:'Wasserpark',
    tourist_attraction:'Sehenswürdigkeit',activity:'Aktivität',store:'Geschäft',shopping_mall:'Einkaufszentrum'
  };
  for(const type of types){if(labels[type])return labels[type]}
  return 'Ort';
}
function geoapifyFormattedAddress(props:any):string{
  const street=geoapifyTextField(props.street||props.address?.street);
  const house=geoapifyTextField(props.housenumber||props.address?.housenumber);
  const streetLine=[street,house].filter(Boolean).join(' ').trim();
  const candidates=[
    geoapifyTextField(typeof props.formatted==='string'?props.formatted:props.formatted?.address),
    geoapifyTextField(props.formatted_address),
    geoapifyTextField(props.address?.full),
    geoapifyTextField(props.address_line2),
    streetLine,
    geoapifyTextField(props.address_line1),
    [geoapifyTextField(props.postcode),geoapifyTextField(props.city||props.address?.city)].filter(Boolean).join(' ')
  ];
  return candidates.find(value=>value&&value.length>=2&&!/^\[object object\]$/i.test(value))||'';
}
function geoapifyPlaceName(props:any,mappedTypes:string[]=[]):string{
  // Never promote street/address shells to the place title. Unnamed OSM nodes must
  // not become pins like "Ostpreußenstraße".
  const candidates=[
    geoapifyTextField(props.name),
    geoapifyTextField(props.names),
    geoapifyTextField(props.names?.default),
    geoapifyTextField(props.names?.de),
    geoapifyTextField(props.names?.en),
    geoapifyTypeLabel(mappedTypes)
  ];
  return candidates.find(value=>value&&value.length>=2&&!/^\[object object\]$/i.test(value)&&!/^(unbenannter ort|unbekannter ort|unknown place|ort)$/i.test(value))||geoapifyTypeLabel(mappedTypes);
}
function normalizedPlace(p:any){const components=p.addressComponents||[];const country=addressPart(components,'country');return{id:p.id||String(p.name||'').replace(/^places\//,''),resourceName:p.name||p.id?`places/${p.id||String(p.name).replace(/^places\//,'')}`:null,name:p.displayName?.text||'',displayName:p.displayName?.text||'',languageCode:p.displayName?.languageCode||'',formattedAddress:p.formattedAddress||'',shortAddress:p.shortFormattedAddress||'',addressComponents:components,country:country?.longText||'',countryCode:String(country?.shortText||'').toUpperCase(),location:p.location||null,viewport:normalizedViewport(p.viewport),primaryType:p.primaryType||'',primaryTypeLabel:p.primaryTypeDisplayName?.text||'',types:p.types||[],rating:p.rating??null,userRatingCount:p.userRatingCount??null,priceLevel:p.priceLevel||null,businessStatus:p.businessStatus||null,openNow:p.currentOpeningHours?.openNow??null,openingHours:p.currentOpeningHours||p.regularOpeningHours||null,website:p.websiteUri||null,mapsUri:p.googleMapsUri||null,phone:p.internationalPhoneNumber||p.nationalPhoneNumber||null,photos:(p.photos||[]).map((x:any)=>({name:x.name,widthPx:x.widthPx,heightPx:x.heightPx,authorAttributions:x.authorAttributions||[]})),editorialSummary:p.editorialSummary?.text||null,reviews:p.reviews||[],accessibility:p.accessibilityOptions||null,accessibilityOptions:p.accessibilityOptions||null,parkingOptions:p.parkingOptions||null,evChargeOptions:p.evChargeOptions||null,fuelOptions:p.fuelOptions||null,subDestinations:p.subDestinations||[],features:{servesVegetarianFood:p.servesVegetarianFood??null,goodForChildren:p.goodForChildren??null,goodForGroups:p.goodForGroups??null,menuForChildren:p.menuForChildren??null,breakfast:p.servesBreakfast??null,lunch:p.servesLunch??null,dinner:p.servesDinner??null,beer:p.servesBeer??null,wine:p.servesWine??null,takeout:p.takeout??null,delivery:p.delivery??null,dineIn:p.dineIn??null,reservable:p.reservable??null},raw:p};}
function normalizedGeoapifyPlace(feature:any,options:any={}){
  const f=feature&&typeof feature==='object'?feature:{};
  const props=f.properties&&typeof f.properties==='object'?f.properties:{};
  if(!geoapifyHasProviderName(props))return null;
  const placeId=String(props.place_id||props.placeId||props.placeID||props.id||f.id||'');
  const id=placeId?`geoapify:${placeId}`:'';
  const latitude=Number(props.lat??props.latitude??props.location?.latitude??props.location?.lat??props.coordinates?.latitude);
  const longitude=Number(props.lon??props.longitude??props.location?.longitude??props.location?.lng??props.coordinates?.longitude);
  const categories=Array.isArray(props.categories)?props.categories:(typeof props.categories==='string'?props.categories.split(',').map(String):[]);
  const tags=Array.isArray(props.tags)?props.tags:(typeof props.tags==='string'?props.tags.split(',').map(String):[]);
  const nativeEvidence=[...categories,...tags].filter(Boolean).slice(0,30);
  const mappedTypes=geoapifyLuviaTypes(nativeEvidence);
  const rawCuisine=[props.datasource?.raw?.cuisine,props.catering?.cuisine,props.cuisine].flatMap(value=>(Array.isArray(value)?value:[value]).flatMap(item=>String(item||'').split(/[;,]/))).map(value=>String(value).trim().toLowerCase().replace(/[ -]+/g,'_'));
  for(const cuisine of rawCuisine){const canonical=['arab','oriental','middle_eastern'].includes(cuisine)?'middle_eastern':cuisine;if((GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[`${canonical}_restaurant`])mappedTypes.push(`${canonical}_restaurant`)}
  // A broader cuisine includes evidenced children; children never inherit a
  // specific kitchen from a generic Asian label or business name.
  if([...rawCuisine,...categories.map((value:string)=>String(value).replace(/^catering\.restaurant\./,''))].some(value=>['asian','chinese','japanese','thai','vietnamese','korean','indian','sushi','malaysian','indonesian'].includes(value)))mappedTypes.push('asian_restaurant');
  const textEvidence=String([...nativeEvidence,...mappedTypes].join(' ')).toLowerCase();
  const raw=props.datasource?.raw||{};
  const diet=(value:any,positive:boolean)=>value===false||String(value).toLowerCase()==='no'?false:value===true||['yes','only'].includes(String(value).toLowerCase())||positive?true:null;
  const servesVeganFood=diet(raw['diet:vegan']??props.catering?.diet?.vegan,/vegan/.test(textEvidence));
  const servesVegetarianFood=diet(raw['diet:vegetarian']??props.catering?.diet?.vegetarian,/vegetarian|vegan/.test(textEvidence)||servesVeganFood===true);
  if(raw.dining==='fine_dining'||raw.fine_dining==='yes')mappedTypes.push('fine_dining_restaurant');
  if(raw.amenity==='concert_hall'||raw.amenity==='music_venue')mappedTypes.push('concert_hall');
  if(raw.amenity==='music_venue'||raw.amenity==='live_music')mappedTypes.push('live_music_venue');
  if(raw.amenity==='nightclub'||raw.amenity==='dance_club'||raw.leisure==='dance')mappedTypes.push('night_club');
  if(raw.amenity==='pub'){mappedTypes.push('pub');mappedTypes.push('bar')}
  if(raw.amenity==='bar')mappedTypes.push('bar');
  if(raw.lounge==='yes'||raw.bar==='lounge'||raw.amenity==='lounge')mappedTypes.push('lounge_bar');
  if(raw.amenity==='casino')mappedTypes.push('casino');
  if(raw.amenity==='karaoke_box'||raw.amenity==='karaoke')mappedTypes.push('karaoke_bar');
  if(raw.amenity==='comedy_club')mappedTypes.push('comedy_club');
  if(raw.bar==='cocktail'||raw.cocktails==='yes')mappedTypes.push('cocktail_bar');
  if(raw.bar==='wine'||raw.wine==='yes')mappedTypes.push('wine_bar');
  if(raw.route==='hiking'||raw.information==='trailhead')mappedTypes.push('hiking_area');
  if(raw['diet:vegetarian']==='only'&&servesVegetarianFood===true)mappedTypes.push('vegetarian_restaurant');
  if(raw['diet:vegan']==='only'&&servesVeganFood===true)mappedTypes.push('vegan_restaurant');
  const wheelchair=String(raw.wheelchair||'').toLowerCase();
  const wheelchairAccessibleEntrance=wheelchair==='no'?false:wheelchair==='limited'||nativeEvidence.includes('wheelchair.limited')?null:wheelchair==='yes'||nativeEvidence.includes('wheelchair.yes')?true:null;
  const stroller=String(raw.stroller||'').toLowerCase();
  const openNowRaw=props.open_now??props.openNow??props.opening_hours?.open_now??props.openingHours?.open_now;
  const openNow=typeof openNowRaw==='boolean'?openNowRaw:null;
  const primaryType=String(preferChildCategory(mappedTypes,nativeEvidence)||options?.includedType||options?.includedPrimaryTypes?.[0]||'');
  const fallbackName=geoapifyPlaceName(props,mappedTypes);
  const formattedAddress=geoapifyFormattedAddress(props);
  const primaryTypeLabel=geoapifyTypeLabel(mappedTypes);
  return{
    id:id||null,
    providerPlaceId:id||null,
    name:fallbackName,
    displayName:fallbackName,
    resourceName:placeId?`geoapify/${placeId}`:null,
    provider:'geoapify',
    languageCode:String(props.lang||options?.languageCode||'').slice(0,5),
    formattedAddress,
    shortAddress:geoapifyTextField(props.address_line1)||geoapifyTextField(props.street)||geoapifyTextField(props.address?.street)||geoapifyTextField(props.city)||'',
    addressComponents:[],
    country:String((props.country??props.address?.country)||''),
    countryCode:String((props.country_code??props.countryCode)||'').toUpperCase(),
    location:(Number.isFinite(latitude)&&Number.isFinite(longitude))?{latitude,longitude}:null,
    viewport:null,
    primaryType:primaryType||'',
    primaryTypeLabel:primaryTypeLabel||'',
    types:[...new Set([...mappedTypes,...nativeEvidence])].filter(type=>! /^(?:vegetarian|vegan|wheelchair)(?:$|[._])/.test(type)||type==='vegetarian_restaurant'||type==='vegan_restaurant'),
    rating:null,
    userRatingCount:null,
    priceLevel:null,
    businessStatus:null,
    openNow,
    openingHours:props.opening_hours||props.openingHours||raw.opening_hours||null,
    website:props.website||raw.website||raw['contact:website']||null,
    mapsUri:null,
    phone:props.phone||raw.phone||raw['contact:phone']||null,
    photos:/^https:\/\//i.test(String(props.wiki_and_media?.image||''))?[{uri:String(props.wiki_and_media.image),attribution:'Bild aus dem verknüpften Ortseintrag',sourceUrl:String(props.wiki_and_media.image),provider:'geoapify',entityReference:id||null,verified:true}]:[],
    editorialSummary:null,
    reviews:[],
    accessibility:null,
    accessibilityOptions:wheelchairAccessibleEntrance!=null?{wheelchairAccessibleEntrance}:null,
    parkingOptions:null,
    evChargeOptions:null,
    fuelOptions:null,
    subDestinations:[],
    features:{
      reservable:['yes','required','recommended'].includes(String(raw.reservation||''))?true:raw.reservation==='no'?false:null,
      servesVegetarianFood,
      servesVeganFood,
      goodForChildren:null,
      strollerAccessible:stroller==='yes'?true:stroller==='no'?false:null
    },
    raw:props
  };
}

async function geoapifyPlaceDetails(rawId:string,options:any={}){
  const key=getGeoapifyKey();if(!key)throw Object.assign(new Error('Geoapify ist nicht konfiguriert.'),{code:'GEOAPIFY_NOT_CONFIGURED',status:503});
  const cacheKey=`geoapify-details-media-v3:${rawId}:${options.enrichMedia===true}`,hit=cached(cacheKey);if(hit)return hit;
  const params=new URLSearchParams({id:rawId.slice(9),features:'details',lang:String(options.languageCode||'de'),apiKey:key});
  metrics.requests++;metrics.providers.geoapify.requests++;
  const response=await providerFetch('geoapify','details',5,`${GEOAPIFY_BASE}/place-details?${params}`,{signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Object.assign(new Error('Die Ortsdetails sind gerade nicht verfügbar.'),{code:'GEOAPIFY_DETAILS_UNAVAILABLE',status:response.status});
  const body=await response.json(),feature=(body.features||[]).find((f:any)=>f.properties?.feature_type==='details')||body.features?.[0];
  if(!feature)return null;
  const props=feature.properties||{},place:any=normalizedGeoapifyPlace({...feature,properties:{...props,place_id:rawId.slice(9)}});
  if(!place)return null;
  place.provider='geoapify';place.editorialSummary=props.description||null;
  const media=props.wiki_and_media||{};
  // Only media explicitly linked to this exact provider entity is considered.
  // Never use nearby/brand pictures as a substitute for this place.
  if(/^https:\/\//i.test(String(media.image||''))){place.photos=[{uri:media.image,attribution:'Bild aus dem verknüpften Ortseintrag',sourceUrl:media.image,provider:'geoapify',entityReference:rawId,verified:true}]}
  else if(/^File:/i.test(String(media.wikimedia_commons||''))){
    try{
      const query=new URLSearchParams({action:'query',format:'json',titles:media.wikimedia_commons,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960'}),res=await fetch(`https://commons.wikimedia.org/w/api.php?${query}`,{headers:{'User-Agent':'Luvia/1.0 (place photo attribution)'},signal:AbortSignal.timeout(3000)}),json=await res.json(),page:any=Object.values(json.query?.pages||{})[0],info=page?.imageinfo?.[0];
      if(info?.url){const meta=info.extmetadata||{},plain=(v:any)=>String(v||'').replace(/<[^>]*>/g,'').slice(0,180);place.photos=[{uri:info.thumburl||info.url,attribution:[plain(meta.Artist?.value),plain(meta.LicenseShortName?.value)].filter(Boolean).join(' · '),attributionUrl:info.descriptionurl,sourceUrl:info.descriptionurl,provider:'wikimedia',entityReference:rawId,verified:true}]}
    }catch{}
  }
  metrics.successes++;metrics.providers.geoapify.successes++;
  const linked=await enrichLinkedMedia(place),enriched=options.enrichMedia===true?await enrichExactFoursquareMedia(linked):linked;store(cacheKey,enriched,30*60_000);return enriched;
}

const cuisineCohorts=new Map<string,{expires:number,promise:Promise<any[]>}>();
async function geoapifyCuisineCohort(apiKey:string,filter:string,language:string){
  const id=JSON.stringify([filter,language]),cached=cuisineCohorts.get(id);
  if(cached&&cached.expires>Date.now())return cached.promise;
  const promise=(async()=>{
    // One destination-scoped cohort is shared by every national cuisine for
    // 30 minutes. Two hundred rows cover the local 5 km inventory without the
    // 25-unit burst of the former 500-row rescue request.
    const params=new URLSearchParams({apiKey,categories:'catering',filter,limit:'200',lang:language||'de'});
    const response=await providerFetch('geoapify','search',10,`${GEOAPIFY_BASE}/places?${params}`,{signal:AbortSignal.timeout(4500)});
    if(!response.ok)throw new Error('CUISINE_COHORT_UNAVAILABLE');
    const body=await response.json();return Array.isArray(body.features)?body.features:[];
  })().catch(error=>{cuisineCohorts.delete(id);throw error});
  if(cuisineCohorts.size>=32)cuisineCohorts.delete(cuisineCohorts.keys().next().value!);
  cuisineCohorts.set(id,{expires:Date.now()+30*60_000,promise});return promise;
}
async function geoapifyPlacesSearch(textQuery:string,destination:any,options:any,restriction:any,bias:any){
  const key=getGeoapifyKey();
  if(!key)throw Object.assign(new Error('Geoapify API key ist nicht konfiguriert.'),{code:'GEOAPIFY_NOT_CONFIGURED',status:503});
  metrics.requests++;metrics.providers.geoapify.requests++;metrics.lastRequestAt=new Date().toISOString();
  const categories=geoapifyCategoriesFromOptions(options,textQuery);
  const filter=geoapifyRectFilter(restriction?.rectangle||restriction||null)||geoapifyCircleFilter(destination,options,bias);
  const circle=geoapifyCircleFilter(destination,options,bias);
  const rect=restriction?.rectangle||restriction;
  const anchor=rect?.low&&rect?.high?{latitude:(Number(rect.low.latitude)+Number(rect.high.latitude))/2,longitude:(Number(rect.low.longitude)+Number(rect.high.longitude))/2}:searchAnchor(destination,options);
  const biasParam=anchor?`proximity:${anchor.longitude},${anchor.latitude}`:(typeof bias==='string'?bias:null)||geoapifyBiasFromRestriction(restriction)||circle;
  const name=geoapifyNameFilter(options.userQuery!==undefined?options.userQuery:textQuery);
  // Geoapify Places treats some multi-category CSV lists as an intersection
  // (live Scharbeutz: leisure≈50, but leisure,sport≈1). Always request one
  // category per call and merge unique place_ids — splitGeoapifyCategories.
  const cuisines=geoapifyCuisineSelections(options),dietary=cuisines.filter((type:string)=>['vegetarian_restaurant','vegan_restaurant'].includes(type)),national=cuisines.filter((type:string)=>!dietary.includes(type));
  // A precise cuisine view needs far fewer candidates than the broad category
  // map. Keeping it within one 20-result provider unit leaves enough of the
  // minute budget for rapid filter switches and a deliberate photo/detail read.
  const limit=Math.min(cuisines.length?20:50,Math.max(1,Number(options?.maxResultCount||10)));
  // Cuisine siblings are an OR query before pagination. Never substitute the
  // generic first 50 catering results for a multi-cuisine selection.
  const categoryBatches:any[]=cuisines.length?[
    ...(national.length?[{cats:categories,condition:''}]:[]),
    ...dietary.map((type:string)=>({cats:['catering.restaurant'],condition:type==='vegan_restaurant'?'vegan':'vegetarian'}))
  ]:(categories.length>1?categories.map(category=>[category]):[categories.length?categories:geoapifyFallbackCategories(options)]).map(cats=>({cats}));
  const buildParams=(cats:string[],useName:boolean,condition?:string)=>{
    const params=new URLSearchParams();
    params.set('apiKey',key);
    params.set('categories',cats.join(','));
    if(useName&&name)params.set('name',name);
    if(filter)params.set('filter',filter);
    const selected=options.strictPlaceType||options.includedType||(options.includedTypes?.length===1?options.includedTypes[0]:'');
    const diet=condition!==undefined?condition:selected==='vegan_restaurant'?'vegan':selected==='vegetarian_restaurant'?'vegetarian':'';
    const conditions=[diet,options.vegetarianOnly&&!diet?'vegetarian':'',options.accessibleOnly?'wheelchair.yes':''].filter(Boolean);
    if(conditions.length)params.set('conditions',conditions.join(','));
    if(biasParam)params.set('bias',biasParam);
    params.set('limit',String(limit));
    if(options?.languageCode)params.set('lang',String(options.languageCode).slice(0,5));
    return params;
  };
  const run=async(cats:string[],useName:boolean,condition?:string)=>{
    const signal=globalThis.AbortSignal?.timeout?.(4500);
    const response=await providerFetch('geoapify','search',Math.ceil(limit/20),`${GEOAPIFY_BASE}/places?${buildParams(cats,useName,condition)}`,{headers:{Accept:'application/json'},...(signal?{signal}:{})});
    const body=await response.json().catch(()=>({}));
    return{response,body,cats};
  };
  const mergeFeatures=(rows:any[][])=>{
    const byId=new Map<string,any>();
    for(const features of rows){
      for(const feature of features){
        const id=String(feature?.properties?.place_id||feature?.properties?.placeId||feature?.id||'');
        if(!id||byId.has(id))continue;
        byId.set(id,feature);
      }
    }
    return[...byId.values()];
  };
  const runBatches=async(useName:boolean)=>{
    const settled=await Promise.allSettled(categoryBatches.map(batch=>run(batch.cats,useName,batch.condition)));
    const completed=settled.filter((item:any)=>item.status==='fulfilled').map((item:any)=>item.value);
    const successful=completed.filter((item:any)=>item.response.ok);
    // Broad Luvia categories are an OR across several provider parents. A slow
    // or budget-blocked supplement must not erase the useful siblings that
    // already answered. Only fail the read when every parent failed.
    if(successful.length)return{
      response:{ok:true,status:200},
      body:{features:mergeFeatures(successful.map((item:any)=>Array.isArray(item.body?.features)?item.body.features:[]))},
      cats:categories
    };
    const failed=completed.find((item:any)=>!item.response.ok);
    if(failed)return failed;
    const rejected=settled.find((item:any)=>item.status==='rejected') as PromiseRejectedResult|undefined;
    throw rejected?.reason||Object.assign(new Error('Geoapify Kategorien antworten gerade nicht.'),{code:'GEOAPIFY_PROVIDER_ERROR',status:503,provider:'geoapify'});
  };
  let {response,body}=await runBatches(true);
  if(response.ok&&name&&!(Array.isArray(body?.features)?body.features:[]).length){
    ({response,body}=await runBatches(false));
  }
  // A taxonomy error is an error, never permission to substitute another family.
  if(!response.ok){
    metrics.failures++;metrics.providers.geoapify.failures++;
    const status=Number(body?.status||response.status||0);
    const message=body?.error?.message||body?.message||`Geoapify Anfrage fehlgeschlagen (${response.status}).`;
    metrics.lastError={provider:'geoapify',status,code:body?.error?.code||body?.code||'GEOAPIFY_PROVIDER_ERROR',message};
    throw Object.assign(new Error(message),{code:'GEOAPIFY_PROVIDER_ERROR',status,provider:'geoapify'});
  }
  let features=Array.isArray(body?.features)?body.features:[];
  const matchesCuisineEvidence=(place:any)=>!cuisines.length||cuisines.some((type:string)=>type==='vegetarian_restaurant'?place?.features?.servesVegetarianFood===true:type==='vegan_restaurant'?place?.features?.servesVeganFood===true:place?.types?.includes(type));
  let normalized=features
    .map((feature:any)=>normalizedGeoapifyPlace(feature,options))
    .filter((place:any)=>place&&place.providerPlaceId&&place.name&&place.name.length>=2&&matchesCuisineEvidence(place));
  if(cuisines.length&&filter&&!normalized.length){
    // The official cuisine category is the cheap, precise path. A 500-place
    // catering cohort costs much more provider budget, so use it only to rescue
    // a genuine evidenced zero. Geoapify may return generic restaurants for a
    // cuisine category without attaching that cuisine to the feature; those are
    // not valid filter matches and must not suppress the bounded rescue read.
    try{const cohort=await geoapifyCuisineCohort(key,filter,String(options.languageCode||'de'));
      const eligible=cohort.filter((feature:any)=>{const p=normalizedGeoapifyPlace(feature,options);return p&&matchesCuisineEvidence(p)&&(!name||p.name.toLowerCase().includes(name.toLowerCase()))});
      normalized=mergeFeatures([eligible])
        .map((feature:any)=>normalizedGeoapifyPlace(feature,options))
        .filter((place:any)=>place&&place.providerPlaceId&&place.name&&place.name.length>=2&&matchesCuisineEvidence(place));
    }catch{}
  }
  metrics.successes++;metrics.providers.geoapify.successes++;metrics.lastSuccessAt=new Date().toISOString();
  return normalized
    .sort((a:any,b:any)=>(distanceMeters(anchor,a.location)??Infinity)-(distanceMeters(anchor,b.location)??Infinity))
    .slice(0,limit);
}

function destinationBias(destination:any,explicit:any){if(explicit)return explicit;const l=destination?.location;if(!l)return undefined;const latitude=Number(l.latitude??l.lat),longitude=Number(l.longitude??l.lng);if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return undefined;return{circle:{center:{latitude,longitude},radius:Math.max(1000,Math.min(50000,Number(destination?.searchRadiusMeters)||GEOAPIFY_DEFAULT_RADIUS_METERS))}};}
function destinationRestriction(destination:any,explicit:any){if(explicit)return explicit;const v=destination?.viewport;if(v&&[v.south,v.west,v.north,v.east].every((x:any)=>Number.isFinite(Number(x))))return{rectangle:{low:{latitude:Number(v.south),longitude:Number(v.west)},high:{latitude:Number(v.north),longitude:Number(v.east)}}};return undefined;}
function coordinate(value:any){const latitude=Number(value?.latitude??value?.lat),longitude=Number(value?.longitude??value?.lng);return Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;}
function distanceMeters(a:any,b:any){const x=coordinate(a),y=coordinate(b);if(!x||!y)return null;const rad=(v:number)=>v*Math.PI/180,dLat=rad(y.latitude-x.latitude),dLng=rad(y.longitude-x.longitude),lat1=rad(x.latitude),lat2=rad(y.latitude);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return Math.round(6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));}
function cityCandidate(candidates:any[]){const priorities=['locality','administrative_area_level_2','administrative_area_level_1','postal_town','country'];for(const type of priorities){const hit=candidates.find((x:any)=>x.primaryType===type||x.types?.includes(type));if(hit)return hit;}return candidates.find((x:any)=>x.location)||null;}
function landmarkCandidate(candidates:any[],city:any){return candidates.find((x:any)=>x.id!==city?.id&&['tourist_attraction','point_of_interest','establishment','premise'].includes(x.primaryType))||null;}
function searchAnchor(destination:any,options:any){const landmark=options?.landmarkContext||destination?.landmarkContext;if(landmark?.center||landmark?.location)return coordinate(landmark.center||landmark.location);return coordinate(destination?.canonicalCity?.center||destination?.location||destination?.center);}
function effectiveMaxDistanceMeters(destination:any,options:any){
  const explicit=Number(options?.maxDistanceMeters);
  if(Number.isFinite(explicit)&&explicit>0)return Math.min(50000,Math.max(500,Math.round(explicit)));
  if(options?.strictDestination===false)return 0;
  const destinationRadius=Number(destination?.searchRadiusMeters||destination?.canonicalCity?.searchRadiusMeters);
  if(Number.isFinite(destinationRadius)&&destinationRadius>0)return Math.min(50000,Math.max(500,Math.round(destinationRadius)));
  return searchAnchor(destination,options)?GEOAPIFY_DEFAULT_RADIUS_METERS:0;
}
const meatLedPlace=(place:any)=>/steak|grillhaus|grillhouse|churrasc|kebab|d[oö]ner|barbecue|bbq/.test(String([place?.name,place?.primaryType,place?.primaryTypeLabel,...(Array.isArray(place?.types)?place.types:[])].filter(Boolean).join(' ')).toLowerCase());
const dedicatedDietaryType=(place:any,type:string)=>Array.isArray(place?.types)&&place.types.includes(type);
function postProcessPlaces(places:any[],destination:any,options:any){
  const anchor=searchAnchor(destination,options);
  let list=places.map(p=>({...p,distanceMeters:anchor?distanceMeters(anchor,p.location):null,distanceSource:options?.landmarkContext||destination?.landmarkContext?'landmark':'canonical-city'}));
  const excluded=[...(Array.isArray(options?.excludedTypes)?options.excludedTypes:[]),...(Array.isArray(options?.excludedPrimaryTypes)?options.excludedPrimaryTypes:[])].map((value:any)=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')).filter(Boolean);
  if(excluded.length)list=list.filter(place=>{const types=[place?.primaryType,...(Array.isArray(place?.types)?place.types:[])].map(value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')).filter(Boolean);return!types.some(type=>excluded.some(rule=>type===rule||type.startsWith(`${rule}_`)||type.endsWith(`_${rule}`)))});
  const dietaryType=String(options?.strictPlaceType||options?.includedType||'');
  if(dietaryType==='vegetarian_restaurant')list=list.filter(p=>{const dedicated=dedicatedDietaryType(p,'vegetarian_restaurant')||dedicatedDietaryType(p,'vegan_restaurant');return(!meatLedPlace(p)||dedicated)&&(p.features?.servesVegetarianFood===true||dedicated)});
  else if(dietaryType==='vegan_restaurant')list=list.filter(p=>{const dedicated=dedicatedDietaryType(p,'vegan_restaurant');return(!meatLedPlace(p)||dedicated)&&(p.features?.servesVeganFood===true||dedicated)});
  else if(options?.vegetarianOnly){list=list.filter(p=>p.features?.servesVegetarianFood!==false);list.sort((a,b)=>Number(b.features?.servesVegetarianFood===true)-Number(a.features?.servesVegetarianFood===true));}
  // Apply every advertised fact filter at the provider boundary as well as in
  // the browser. Missing evidence never passes and can trigger a configured
  // provider fallback instead of returning a broad cohort that the UI later
  // reduces to a misleading zero.
  if(options?.openNow)list=list.filter(p=>p.openNow===true);
  if(Number(options?.minRating)>0){const min=Number(options.minRating);list=list.filter(p=>p.rating!=null&&Number(p.rating)>=min);}
  const priceLevels=(Array.isArray(options?.priceLevels)?options.priceLevels:[]).map((value:any)=>String(value));
  if(priceLevels.length)list=list.filter(p=>p.priceLevel!=null&&priceLevels.includes(String(p.priceLevel)));
  if(options?.reservableOnly)list=list.filter(p=>p.features?.reservable===true);
  if(options?.accessibleOnly)list=list.filter(p=>p.accessibilityOptions?.wheelchairAccessibleEntrance===true);
  if(Number(options?.minUserRatingCount)>0){const min=Number(options.minUserRatingCount);list=list.filter(p=>p.userRatingCount!=null&&Number(p.userRatingCount)>=min);}
  const maxDistance=effectiveMaxDistanceMeters(destination,options);
  if(maxDistance>0)list=list.filter(p=>p.distanceMeters!=null&&p.distanceMeters<=maxDistance);
  const sort=String(options?.sortBy||'relevance');
  if(sort==='distance')list.sort((a,b)=>(a.distanceMeters??Infinity)-(b.distanceMeters??Infinity));
  else if(sort==='rating')list.sort((a,b)=>{const ar=a.rating!=null?Number(a.rating):null,br=b.rating!=null?Number(b.rating):null;if(ar!=null&&br!=null){const diff=br-ar;if(diff!==0)return diff;}else if(ar!=null)return-1;else if(br!=null)return 1;const auc=a.userRatingCount!=null?Number(a.userRatingCount):null,buc=b.userRatingCount!=null?Number(b.userRatingCount):null;if(auc!=null&&buc!=null){const diff=buc-auc;if(diff!==0)return diff;}else if(auc!=null)return-1;else if(buc!=null)return 1;return 0;});
  else if(sort==='reviews')list.sort((a,b)=>{const auc=a.userRatingCount!=null?Number(a.userRatingCount):null,buc=b.userRatingCount!=null?Number(b.userRatingCount):null;if(auc==null&&buc==null)return 0;if(auc==null)return 1;if(buc==null)return-1;return buc-auc;});
  return list;
}
async function geoapifyGeocode(query:string,languageCode:string,regionCode?:string){
  const key=getGeoapifyKey();
  if(!key)throw Object.assign(new Error('Geoapify API Key ist nicht konfiguriert.'),{code:'GEOAPIFY_NOT_CONFIGURED',status:503,provider:'geoapify'});
  const url=new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text',query);
  url.searchParams.set('lang',String(languageCode||'de').slice(0,2));
  url.searchParams.set('limit','1');
  url.searchParams.set('format','geojson');
  url.searchParams.set('apiKey',key);
  if(regionCode)url.searchParams.set('filter',`countrycode:${String(regionCode).toLowerCase()}`);
  metrics.requests++;metrics.providers.geoapify.requests++;metrics.lastRequestAt=new Date().toISOString();
  const response=await providerFetch('geoapify','geocode',1,url.toString());
  const body=await response.json().catch(()=>({}));
  if(!response.ok){
    metrics.failures++;metrics.providers.geoapify.failures++;
    const message=body?.message||body?.error||`Geoapify Geocoding fehlgeschlagen (${response.status}).`;
    throw Object.assign(new Error(String(message)),{code:'GEOAPIFY_PROVIDER_ERROR',status:response.status,provider:'geoapify'});
  }
  metrics.successes++;metrics.providers.geoapify.successes++;metrics.lastSuccessAt=new Date().toISOString();
  return body;
}
async function resolveDestination(payload:any){
  const query=String(payload?.query||'').trim();
  if(query.length<2)throw Object.assign(new Error('Reiseziel muss mindestens zwei Zeichen enthalten.'),{code:'DESTINATION_QUERY_INVALID',status:400});
  const languageCode=String(payload?.languageCode||'de');
  const regionCode=payload?.regionCode?String(payload.regionCode).toUpperCase():undefined;
  const forceRefresh=payload?.forceRefresh===true||payload?.refresh===true;
  const key=`destination.resolve:v2.12.3.2-geoapify:${hash({query,languageCode,regionCode})}`;
  const hit=forceRefresh?null:cached(key);
  if(hit)return{data:hit,cache:{hit:true,key,ttlMs:7*24*60*60_000}};
  const raw=await geoapifyGeocode(query,languageCode,regionCode);
  const feature=Array.isArray(raw?.features)?raw.features[0]:null;
  const properties=feature?.properties||{};
  const latitude=Number(properties.lat??feature?.geometry?.coordinates?.[1]);
  const longitude=Number(properties.lon??feature?.geometry?.coordinates?.[0]);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw Object.assign(new Error('Reiseziel wurde nicht gefunden.'),{code:'DESTINATION_NOT_FOUND',status:404});
  const countryCode=String(properties.country_code||regionCode||'').toUpperCase();
  const name=String(properties.city||properties.town||properties.village||properties.name||query);
  const displayName=String(properties.formatted||name);
  const bbox=Array.isArray(properties.bbox)?properties.bbox:null;
  const viewport=bbox&&bbox.length===4?{west:Number(bbox[0]),south:Number(bbox[1]),east:Number(bbox[2]),north:Number(bbox[3])}:null;
  const regional=COUNTRY_META[countryCode]||{languages:[],currency:''};
  const result={destination:{
    schemaVersion:5,id:String(properties.place_id||''),name,displayName,
    country:String(properties.country||''),countryCode,placeId:String(properties.place_id||''),
    center:{lat:latitude,lng:longitude},location:{latitude,longitude},viewport,
    searchRadiusMeters:viewportRadius(viewport,{lat:latitude,lng:longitude}),radiusSource:viewport?'viewport':'default',
    timezone:'',timezoneName:'',timezoneStatus:'skipped',timezoneError:'',
    languageCodes:regional.languages,currency:regional.currency,
    locale:regional.languages[0]&&countryCode?`${regional.languages[0]}-${countryCode}`:'de-DE',
    flagEmoji:flagEmoji(countryCode),provider:'geoapify',source:'automatic-geocoding',
    primaryType:properties.result_type||null,canonicalCity:{name,placeId:String(properties.place_id||''),center:{lat:latitude,lng:longitude},viewport,country:String(properties.country||''),countryCode},
    landmarkContext:null,resolvedAt:new Date().toISOString(),rawType:properties.result_type||null
  }};
  metrics.resolutions++;
  store(key,result,7*24*60*60_000);
  return{data:result,cache:{hit:false,key,ttlMs:7*24*60*60_000,forced:forceRefresh}};
}

export async function placesAction(action:string,payload:any){
if(action==='destination.resolve')return resolveDestination(payload);
const options=payload?.options||{};const languageCode=options.languageCode||payload?.languageCode||'de';const regionCode=options.regionCode||payload?.regionCode||payload?.destination?.countryCode||'DE';const ttl=['places.details','places.photo','places.autocomplete'].includes(action)?0:5*60_000;const forceRefresh=options.forceRefresh===true;const {forceRefresh:_forceRefresh,...cacheOptions}=options;const cachePayload={...payload,options:cacheOptions};const key=`${action}:v2.16.6-osm-edge-proxy:${hash(cachePayload)}`;const hit=ttl>0&&!forceRefresh?cached(key):null;if(hit)return{data:hit,cache:{hit:true,key,ttlMs:ttl}};let result:any;
if(action==='places.health'){
  const requestedProbe=String(payload?.diagnosticProbe||'').trim().toLowerCase();
  const probe:any=HEALTH_PROBES[requestedProbe as keyof typeof HEALTH_PROBES]||null;
  let diagnosticProbe:any=null;
  if(probe){
    try{
      const response=await placesAction('places.text-search',{query:probe.query,destination:probe.destination,options:{providers:['geoapify'],maxResultCount:20,strictDestination:true,languageCode:'de',regionCode:'DE',...(probe.options||{})}});
      diagnosticProbe={key:requestedProbe,status:'ok',query:probe.query,destination:probe.destination.name,providers:response.data?.providers||null,places:(response.data?.places||[]).slice(0,12).map((place:any)=>({providerPlaceId:String(place?.providerPlaceId||place?.id||'').slice(0,160),name:String(place?.name||place?.displayName||'').slice(0,160),primaryType:String(place?.primaryType||'').slice(0,120),primaryTypeLabel:String(place?.primaryTypeLabel||'').slice(0,160),provider:String(place?.provider||'').slice(0,80),providerNativeTypes:(place?.providerNativeTypes||[]).slice(0,12).map((value:any)=>String(value).slice(0,120)),providerPrimaryFoodTypes:(place?.raw?.foodTypes||[]).filter((value:any)=>value?.primary===true).slice(0,8).map((value:any)=>String(value?.name||value?.id||'').slice(0,120)),types:(place?.types||[]).slice(0,12).map((value:any)=>String(value).slice(0,120)),servesVegetarianFood:place?.features?.servesVegetarianFood===true,servesVeganFood:place?.features?.servesVeganFood===true,photoCount:Array.isArray(place?.photos)?place.photos.length:0,location:coordinate(place?.location)}))};
    }catch(error:any){
      diagnosticProbe={key:requestedProbe,status:'failed',query:probe.query,destination:probe.destination.name,error:{code:String(error?.code||'PROBE_FAILED').slice(0,80),message:String(error?.message||'Diagnose fehlgeschlagen.').slice(0,240)},providerErrors:(error?.providerErrors||[]).slice(0,4).map((item:any)=>({provider:String(item?.provider||'unknown').slice(0,40),code:String(item?.code||'PROVIDER_ERROR').slice(0,80),status:Number(item?.status)||null,providerStatus:String(item?.providerStatus||'').slice(0,80)||null,reason:String(item?.reason||'unknown').slice(0,80),service:String(item?.service||'').slice(0,160)||null,message:String(item?.message||'Provider fehlgeschlagen.').slice(0,240)})),places:[]};
    }
  }
  result={status:'ok',service:'multi-provider-places-gateway',version:'4.38.7-osm-edge-proxy',configured:Boolean(getGeoapifyKey()||getKey()||getFoursquareKey()||Deno.env.get('TOMTOM_API_KEY')||Deno.env.get('HERE_API_KEY')),providerOrder:'free_budget_cascade',providers:{geoapify:{configured:Boolean(getGeoapifyKey()),priority:'primary',coordinateSchema:'top-level-latitude-longitude'},openstreetmap:osmDietaryConfiguration(),tomtom:{configured:Boolean(Deno.env.get('TOMTOM_API_KEY')),priority:'automatic_fallback',credentialExposure:false},here:{configured:Boolean(Deno.env.get('HERE_API_KEY')),priority:'automatic_fallback',credentialExposure:false},google:{configured:Boolean(getKey()),priority:'bounded_dietary_evidence_opt_in'},foursquare:{configured:Boolean(getFoursquareKey()),priority:'on_demand_dietary_fallback_and_exact_selected_media',apiVersion:FOURSQUARE_API_VERSION,mappingVersion:FOURSQUARE_MAPPING_VERSION,coordinateSchema:'top-level-latitude-longitude',premiumFieldsOptional:true,categoryFilteredSearch:'official-vegetarian-category-or-explicit-reviewed-taxonomy',postRetrievalCategoryEvidence:true,adaptiveDestinationRadius:true,exactMediaIdentity:'normalized_name_and_max_120m',aliasMediaIdentity:'contained_distinctive_name_and_max_25m',photoEndpoint:'one_popular_photo_after_exact_identity'},apple:{...appleMapsConfiguration(),priority:'parked_optional_paid_candidate',credentialExposure:false,placeImages:false,cuisineEvidence:false}},diagnosticProbe,availableDiagnosticProbes:Object.keys(HEALTH_PROBES),metrics:{...metrics},cache:{entries:cache.size}};return{data:result,cache:{hit:false,key:null,ttlMs:0}};
}
if(action==='places.text-search'){
  const destination=payload?.destination||null;const landmark=options.landmarkContext||destination?.landmarkContext||null;const effectiveDestination=landmark?.center?{...destination,location:{latitude:Number(landmark.center.lat??landmark.center.latitude),longitude:Number(landmark.center.lng??landmark.center.longitude)},viewport:landmark.viewport||null,searchRadiusMeters:options.maxDistanceMeters||destination?.searchRadiusMeters||GEOAPIFY_DEFAULT_RADIUS_METERS}:destination;const restriction=options.strictDestination===false?undefined:destinationRestriction(effectiveDestination,options.locationRestriction);const bias=restriction?undefined:destinationBias(effectiveDestination,options.locationBias);let textQuery=String(payload?.query||'');const cityName=destination?.canonicalCity?.name||destination?.name;if(options.vegetarianOnly&&!/vegetar/i.test(textQuery))textQuery=`vegetarisch ${textQuery}`;if(cityName&&!restriction&&!bias)textQuery=`${textQuery} in ${cityName}`;if(landmark?.name&&!textQuery.toLowerCase().includes(String(landmark.name).toLowerCase()))textQuery=`${textQuery} nahe ${landmark.name}`;
  // Automatic search keeps Geoapify first and uses bounded budgeted alternatives.
  // Explicit providers remain subject to the same server-side budget policy.
  const providers=Array.isArray(options.providers)&&options.providers.length?options.providers:['auto'],providerErrors:any[]=[],attempted:string[]=[],answered:string[]=[];
  let geoapifyPlaces:any[]=[],osmPlaces:any[]=[],googlePlaces:any[]=[],foursquarePlaces:any[]=[],fallbackReason:string|null=null;
  let processed:any[]=[],fallbackUsed=false,supplementUsed=false,supplementReason:string|null=null,mode='geoapify_primary';
  const wantsGeoapify=providers.includes('geoapify')||providers.includes('auto');
  const wantsOsmDietary=providers.includes('openstreetmap')||providers.includes('auto');
  const wantsLegacy=providers.includes('google')||providers.includes('foursquare');
  if(wantsGeoapify){
    attempted.push('geoapify');
    if(getGeoapifyKey()){
      try{
        geoapifyPlaces=await geoapifyPlacesSearch(String(payload?.query||textQuery),effectiveDestination,{...options,languageCode,regionCode,category:options.category||payload?.type||options.type,type:payload?.type||options.type},restriction,bias);
        answered.push('geoapify');
        geoapifyPlaces=geoapifyPlaces.map((p:any)=>({
          ...p,
          provider:'geoapify',
          source:'geoapify_places',
          providerRefs:{geoapify:String(String(p?.providerPlaceId||p?.id||'').replace(/^geoapify:/,''))},
          evidence:[{provider:'geoapify',kind:'place-search'}]
        }));
      }catch(error:any){
        fallbackReason=isQuotaError(error)?'geoapify_quota':'geoapify_failed';
        providerErrors.push({provider:'geoapify',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR',reason:error?.reason||null});
      }
    }else{
      fallbackReason='geoapify_not_configured';
      providerErrors.push({provider:'geoapify',message:'Geoapify API key ist nicht konfiguriert.',code:'GEOAPIFY_NOT_CONFIGURED'});
    }
    processed=postProcessPlaces(geoapifyPlaces,destination,{...options,maxDistanceMeters:options.maxDistanceMeters||effectiveDestination?.searchRadiusMeters||GEOAPIFY_DEFAULT_RADIUS_METERS});
    mode='geoapify_primary';
  }
  const dietaryEvidenceType=String(options.strictPlaceType||options.includedType||'');
  if(!processed.length&&wantsOsmDietary&&(options.vegetarianOnly===true||['vegetarian_restaurant','vegan_restaurant'].includes(dietaryEvidenceType))){
    attempted.push('openstreetmap');
    try{
      osmPlaces=(await osmDietarySearch(effectiveDestination,{...options,maxDistanceMeters:options.maxDistanceMeters||effectiveDestination?.searchRadiusMeters||8000})).map((place:any)=>({...place,evidence:[...(place.evidence||[]),{provider:'openstreetmap',kind:'bounded-profile-evidence-search'}]}));
      answered.push('openstreetmap');
      const osmProcessed=postProcessPlaces(osmPlaces,effectiveDestination,{...options,maxDistanceMeters:options.maxDistanceMeters||effectiveDestination?.searchRadiusMeters||8000});
      if(osmProcessed.length){processed=osmProcessed;fallbackUsed=Boolean(wantsGeoapify);fallbackReason=fallbackReason||'geoapify_empty_or_unavailable';mode='free_osm_dietary_evidence';}
    }catch(error:any){providerErrors.push({provider:'openstreetmap',code:error?.code||'OSM_DIETARY_PROVIDER_ERROR',message:error?.message||'OpenStreetMap-Ernährungshinweise sind gerade nicht verfügbar.',status:Number(error?.status)||null,reason:error?.reason||null})}
  }
  const categoryKey=String(options.category||payload?.type||options.type||'').toLowerCase();
  const breadthTarget=providerBreadthTarget(categoryKey,providers);
  const primaryResultCount=processed.length;
  if(!processed.length||breadthTarget>0&&processed.length<breadthTarget){
    for(const provider of (providers.includes('auto')?['tomtom','here']:providers.filter((p:string)=>p==='tomtom'||p==='here'))){
      attempted.push(provider);
      try{
        const rows=await additionalSearch(provider as 'tomtom'|'here',String(payload.query||textQuery),effectiveDestination,{...options,category:options.category||payload.type},restriction);
        answered.push(provider);
        const rect=restriction?.rectangle;
        const additionalProcessed=postProcessPlaces(rows,effectiveDestination,{...options,maxDistanceMeters:options.maxDistanceMeters||effectiveDestination?.searchRadiusMeters||GEOAPIFY_DEFAULT_RADIUS_METERS}).filter((p:any)=>!rect||(p.location.latitude>=rect.low.latitude&&p.location.latitude<=rect.high.latitude&&p.location.longitude>=rect.low.longitude&&p.location.longitude<=rect.high.longitude));
        if(additionalProcessed.length){
          const before=processed.length;
          processed=processed.length?postProcessPlaces(mergeProviderPlaces([...processed,...additionalProcessed]),effectiveDestination,{...options,maxDistanceMeters:options.maxDistanceMeters||effectiveDestination?.searchRadiusMeters||GEOAPIFY_DEFAULT_RADIUS_METERS}):additionalProcessed;
          if(primaryResultCount>0&&processed.length>before){supplementUsed=true;supplementReason='category_breadth_floor';mode='free_budget_supplement'}
          if(primaryResultCount===0&&processed.length){fallbackUsed=true;fallbackReason=fallbackReason||'geoapify_empty';mode='free_budget_cascade'}
        }
        if(processed.length&&breadthTarget===0)break;
        if(breadthTarget>0&&processed.length>=breadthTarget)break;
      }catch(error:any){providerErrors.push({provider,code:error.code||'PROVIDER_ERROR',message:'Zusätzliche Ortsquelle derzeit nicht verfügbar.',reason:error?.reason||null})}
    }
  }
  if(wantsLegacy&&!processed.length){
    // Explicit opt-in only — not used by the default Spatial/Hotels path.
    if(providers.includes('google')&&getKey()){
      attempted.push('google');
      const dietaryType=['vegetarian_restaurant','vegan_restaurant'].includes(String(options.strictPlaceType||options.includedType||''));
      const body=cleanObject({textQuery,languageCode,regionCode,maxResultCount:Math.min(20,options.maxResultCount||10),includedType:dietaryType?undefined:options.includedType||undefined,strictTypeFiltering:dietaryType?false:Boolean(options.strictTypeFiltering&&options.includedType),openNow:options.openNow||undefined,minRating:options.minRating||undefined,priceLevels:options.priceLevels||undefined,locationRestriction:restriction,locationBias:bias,rankPreference:options.rankPreference||undefined});
      try{const raw=await google('/places:searchText',{method:'POST',body:JSON.stringify(body)},searchFields(options));answered.push('google');googlePlaces=(raw.places||[]).map((x:any)=>({...normalizedPlace(x),provider:'google-places',source:'google_places',providerRefs:{google:String(x.id||'').replace(/^places\//,'')},evidence:[{provider:'google',kind:'place-search'}]}))}
      catch(error:any){fallbackReason=isQuotaError(error)?'google_quota':'google_failed';providerErrors.push({provider:'google',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR',status:Number(error?.status)||null,providerStatus:error?.providerStatus||null,reason:error?.reason||null,service:error?.service||null})}
    }else if(providers.includes('google'))fallbackReason='google_not_configured';
    const googleEligible=postProcessPlaces(googlePlaces,destination,options);if(providers.includes('google')&&!fallbackReason&&!googleEligible.length)fallbackReason='google_no_eligible_result';
    const useFoursquare=providers.includes('foursquare')&&getFoursquareKey()&&(!providers.includes('google')||Boolean(fallbackReason));
    if(useFoursquare){attempted.push('foursquare');try{foursquarePlaces=await foursquareSearch(String(payload?.query||textQuery),effectiveDestination,options);answered.push('foursquare')}catch(error:any){providerErrors.push({provider:'foursquare',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR',status:Number(error?.status)||null,reason:error?.reason||null})}}
    const foursquareIsFallback=providers.includes('google')&&attempted.includes('foursquare'),all=googleEligible.length&&!fallbackReason?googlePlaces:foursquarePlaces,merged=mergeProviderPlaces(all),legacyProcessed=postProcessPlaces(merged,destination,options);
    if(legacyProcessed.length){processed=legacyProcessed;fallbackUsed=Boolean(wantsGeoapify);mode=wantsGeoapify?'geoapify_then_legacy':'google_primary_foursquare_fallback';}
  }
  if(attempted.length&&providerErrors.length===attempted.length&&!processed.length)throw Object.assign(new Error('Keine verbundene Ortsquelle konnte die Suche beantworten.'),{code:'PLACES_ALL_PROVIDERS_FAILED',status:503,providerErrors});
  result={places:processed,providers:{mode,requested:providers,attempted:[...new Set(attempted)],answered:[...new Set(answered)],used:[...new Set(processed.flatMap((p:any)=>Object.keys(p.providerRefs||{})))],fallbackUsed,fallbackReason:fallbackUsed?fallbackReason:null,supplementUsed,supplementReason:supplementUsed?supplementReason:null,breadthTarget:breadthTarget||null,primaryResultCount,errors:providerErrors},searchContext:{destination,canonicalCity:destination?.canonicalCity||null,landmarkContext:landmark,restriction:restriction||null,bias:bias||null,anchor:searchAnchor(destination,options),profileContext:options.profileContext||null,intentContext:options.intentContext||null,filters:{openNow:Boolean(options.openNow),minRating:options.minRating||null,priceLevels:options.priceLevels||[],vegetarianOnly:Boolean(options.vegetarianOnly),minUserRatingCount:options.minUserRatingCount||0,maxDistanceMeters:effectiveMaxDistanceMeters(destination,options)||Number(options.maxDistanceMeters)||0},sortBy:options.sortBy||'relevance'}};
}
else if(action==='places.nearby-search'){const body=cleanObject({languageCode,regionCode,maxResultCount:options.maxResultCount||10,includedTypes:options.includedTypes?.length?options.includedTypes:(options.includedType?[options.includedType]:undefined),excludedTypes:options.excludedTypes?.length?options.excludedTypes:undefined,includedPrimaryTypes:options.includedPrimaryTypes?.length?options.includedPrimaryTypes:undefined,excludedPrimaryTypes:options.excludedPrimaryTypes?.length?options.excludedPrimaryTypes:undefined,rankPreference:options.rankPreference||'POPULARITY',locationRestriction:{circle:{center:payload.location,radius:payload.radius||3000}}});const raw=await google('/places:searchNearby',{method:'POST',body:JSON.stringify(body)},searchFields(options));const normalized=(raw.places||[]).map(normalizedPlace);result={places:postProcessPlaces(normalized,payload?.destination||{location:payload.location},options)};}
else if(action==='places.autocomplete'){const sessionToken=normalizePlacesSessionToken(options.sessionToken);const body=cleanObject({input:String(payload?.input||''),languageCode,regionCode,sessionToken,locationBias:destinationBias(payload?.destination,options.locationBias),includedPrimaryTypes:options.includedType?[options.includedType]:undefined});const raw=await google('/places:autocomplete',{method:'POST',body:JSON.stringify(body)});result={sessionToken,suggestions:(raw.suggestions||[]).map((s:any)=>({placeId:s.placePrediction?.placeId||null,text:s.placePrediction?.text?.text||s.queryPrediction?.text?.text||'',types:s.placePrediction?.types||[],distanceMeters:s.placePrediction?.distanceMeters??null,raw:s}))};}
else if(action==='places.details'){const rawId=String(payload?.placeId||'').replace(/^places\//,'');if(rawId.startsWith('tomtom:')||rawId.startsWith('here:')){const linked=await enrichLinkedMedia(await additionalDetails(rawId));result={place:options.enrichMedia===true?await enrichExactFoursquareMedia(linked):linked}}else if(rawId.startsWith('fsq:')){const fsqId=rawId.slice(4);result={place:await foursquarePlaceDetails(fsqId,options.enrichMedia===true)}}else if(rawId.startsWith('geoapify:')){const place=await geoapifyPlaceDetails(rawId,options);result=place?{place}:{place:null,reason:'geoapify_places_details_unavailable',preserveSeed:true}}else if(rawId.startsWith('openstreetmap:')){result={place:null,reason:'openstreetmap_dietary_evidence_seed_only',preserveSeed:true}}else{const id=encodeURIComponent(rawId);const raw=await google(`/places/${id}?languageCode=${encodeURIComponent(languageCode)}&regionCode=${encodeURIComponent(regionCode)}`,{method:'GET'},DETAIL_FIELDS);result={place:normalizedPlace(raw)}};}
else if(action==='places.photo'){const name=String(payload?.photoName||'');const qs=new URLSearchParams({skipHttpRedirect:'true',maxWidthPx:String(payload?.maxWidthPx||800)});if(payload?.maxHeightPx)qs.set('maxHeightPx',String(payload.maxHeightPx));const raw=await google(`/${name}/media?${qs}`,{method:'GET'});result={photoUri:raw.photoUri||null,name:raw.name||name};}
else throw Object.assign(new Error('Places-Aktion unbekannt.'),{code:'ACTION_NOT_FOUND',status:404});
const searchEmpty=['places.text-search','places.nearby-search'].includes(action)&&Array.isArray(result?.places)&&result.places.length===0;
const searchDegraded=action==='places.text-search'&&Array.isArray(result?.providers?.errors)&&result.providers.errors.length>0;
// A zero-result provider page is useful only for the current response. Caching it
// for five minutes turned one transient upstream miss into repeated empty maps
// while another route could already return the full category cohort.
const effectiveTtl=searchEmpty?0:searchDegraded?30_000:ttl;
if(effectiveTtl>0)store(key,result,effectiveTtl);return{data:result,cache:{hit:false,key,ttlMs:effectiveTtl,skippedEmpty:searchEmpty,degraded:searchDegraded,forced:forceRefresh}};}
export function placesDiagnostics(){return{configured:Boolean(getGeoapifyKey()||getKey()||getFoursquareKey()),providerOrder:'free_budget_cascade',providers:{geoapify:Boolean(getGeoapifyKey()),openstreetmap:osmDietaryConfiguration(),google:Boolean(getKey()),foursquare:Boolean(getFoursquareKey()),foursquareApiVersion:FOURSQUARE_API_VERSION,foursquareMappingVersion:FOURSQUARE_MAPPING_VERSION,apple:{...appleMapsConfiguration(),priority:'parked_optional_paid_candidate'}},metrics:{...metrics},cache:{entries:cache.size}};}
