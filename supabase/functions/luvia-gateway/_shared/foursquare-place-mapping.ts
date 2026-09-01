export const FOURSQUARE_API_VERSION='2025-06-17';
export const FOURSQUARE_MAPPING_VERSION='2026-09-01.category-breadth-rating-scale.v3';
export const FOURSQUARE_RESTAURANT_CATEGORY_ID='13065';

const PRO_FIELDS=[
  'fsq_place_id',
  'name',
  'categories',
  'location',
  'latitude',
  'longitude',
  'tel',
  'website',
  'social_media',
  'link',
  'chains',
  'related_places'
];

const PREMIUM_FIELDS=[
  'attributes',
  'description',
  'hours',
  'photos',
  'place_actions',
  'popularity',
  'price',
  'rating',
  'stats',
  'tastes',
  'veracity_rating'
];

export const FOURSQUARE_PRO_FIELDS=Object.freeze([...PRO_FIELDS]);
export const FOURSQUARE_SEARCH_FIELDS=Object.freeze([...PRO_FIELDS,'distance',...PREMIUM_FIELDS]);
export const FOURSQUARE_DETAILS_FIELDS=Object.freeze([...PRO_FIELDS,...PREMIUM_FIELDS]);

function finiteCoordinate(value:any){
  const number=Number(value);
  return Number.isFinite(number)?number:null;
}

function normalizedRating(value:any){
  if(value===null||value===undefined||value==='')return{rating:null,providerRatingRaw:null};
  const providerRatingRaw=Number(value);
  if(!Number.isFinite(providerRatingRaw)||providerRatingRaw<0||providerRatingRaw>10)return{rating:null,providerRatingRaw:null};
  return{rating:Math.round((providerRatingRaw/2)*100)/100,providerRatingRaw};
}

function coordinatePair(place:any){
  const directLatitude=finiteCoordinate(place?.latitude);
  const directLongitude=finiteCoordinate(place?.longitude);
  if(directLatitude!==null&&directLongitude!==null)return{latitude:directLatitude,longitude:directLongitude,source:'top-level'};

  // Read-only compatibility for cached responses from the retired v3 schema.
  const legacy=place?.geocodes?.main||place?.geocodes?.roof||null;
  const legacyLatitude=finiteCoordinate(legacy?.latitude);
  const legacyLongitude=finiteCoordinate(legacy?.longitude);
  return legacyLatitude!==null&&legacyLongitude!==null
    ?{latitude:legacyLatitude,longitude:legacyLongitude,source:'legacy-geocodes'}
    :null;
}

function photoUri(photo:any,width=900){
  if(!photo)return null;
  if(/^https:\/\//i.test(String(photo.url||'')))return String(photo.url);
  if(photo.prefix&&photo.suffix)return `${photo.prefix}${width}x${width}${photo.suffix}`;
  return null;
}

function addressText(location:any){
  if(location?.formatted_address)return String(location.formatted_address);
  return [location?.address,location?.locality,location?.region,location?.postcode,location?.country]
    .map(value=>String(value||'').trim())
    .filter((value,index,items)=>value&&items.indexOf(value)===index)
    .join(', ');
}

function canonicalCategoryTypes(labels:string[]){
  const values=labels.map(value=>String(value||'').toLowerCase()),types:string[]=[];
  const add=(type:string,pattern:RegExp)=>{if(values.some(value=>pattern.test(value)))types.push(type);};
  add('restaurant',/\brestaurant\b|ristorante|restaurante|restaurang|restauracja|restoran|restaurace|ресторан|مطعم|餐厅|餐館|レストラン/);
  add('cafe',/\bcaf[eé]\b|coffee|tea house/);
  add('bakery',/bakery|boulangerie|b[äa]ckerei/);
  add('bar',/\bbar\b|pub|cocktail/);
  add('lodging',/hotel|hostel|motel|lodging|resort|bed and breakfast|guest house|campground/);
  add('amusement_park',/amusement park|theme park/);
  add('bowling_alley',/bowling/);
  add('escape_room',/escape room/);
  add('aquarium',/aquarium/);
  add('zoo',/\bzoo\b|animal park/);
  add('water_park',/water park/);
  add('stadium',/stadium/);
  add('swimming_pool',/swimming pool|aquatic center/);
  add('tourist_attraction',/attraction|landmark|monument|observation deck|miniature golf|mini golf/);
  add('museum',/museum/);
  add('movie_theater',/movie theater|cinema/);
  add('art_gallery',/art gallery/);
  add('performing_arts_theater',/performing arts|theater|theatre/);
  add('concert_hall',/concert hall|music venue/);
  add('park',/\bpark\b/);
  add('garden',/garden|botanical/);
  add('beach',/beach|strand/);
  add('hiking_area',/hiking|trail/);
  add('spa',/\bspa\b|wellness/);
  add('shopping_mall',/shopping mall/);
  add('market',/\bmarket\b/);
  add('store',/\bstore\b|\bshop\b|boutique/);
  add('pharmacy',/pharmacy|apotheke/);
  add('supermarket',/supermarket|grocery/);
  add('parking',/parking/);
  add('electric_vehicle_charging_station',/charging station/);
  add('gas_station',/gas station|petrol station/);
  add('atm',/\batm\b/);
  add('laundry',/laundry|laundromat/);
  return [...new Set(types)];
}

export function normalizeFoursquarePlace(place:any,{evidenceKind='place-search'}:any={}){
  const p=place&&typeof place==='object'?place:{};
  const location=p.location&&typeof p.location==='object'?p.location:{};
  const coordinates=coordinatePair(p);
  const categories=(Array.isArray(p.categories)?p.categories:[]);
  const categoryLabels=categories.map((category:any)=>category?.name||category?.short_name).filter(Boolean).map(String);
  const categoryIds=categories.map((category:any)=>String(category?.id||'')).filter(Boolean);
  const canonicalTypes=canonicalCategoryTypes(categoryLabels);
  const id=String(p.fsq_place_id||p.id||'');
  const country=String(location.country||'');
  const rating=normalizedRating(p.rating);
  const photos=(Array.isArray(p.photos)?p.photos:[]).map((photo:any)=>{
    const uri=photoUri(photo);
    return uri?{name:`foursquare/${id}/photos/${String(photo.id||'primary')}`,uri,widthPx:photo.width??null,heightPx:photo.height??null,authorAttributions:[]}:null;
  }).filter(Boolean);

  return {
    id:`fsq:${id}`,
    providerPlaceId:`fsq:${id}`,
    resourceName:`foursquare/${id}`,
    provider:'foursquare',
    source:'foursquare_places',
    name:String(p.name||''),
    displayName:String(p.name||''),
    formattedAddress:addressText(location),
    shortAddress:String(location.address||location.locality||''),
    country,
    countryCode:/^[a-z]{2}$/i.test(country)?country.toUpperCase():'',
    location:coordinates?{latitude:coordinates.latitude,longitude:coordinates.longitude}:null,
    primaryType:canonicalTypes[0]||categoryIds[0]||'',
    primaryTypeLabel:categoryLabels[0]||'',
    types:[...canonicalTypes,...categoryIds,...categoryLabels],
    providerNativeTypes:[...categoryIds,...categoryLabels],
    rating:rating.rating,
    ratingScale:5,
    providerRatingRaw:rating.providerRatingRaw,
    providerRatingScale:10,
    userRatingCount:p.stats?.total_ratings??0,
    priceLevel:p.price??null,
    businessStatus:p.date_closed?'CLOSED_PERMANENTLY':'OPERATIONAL',
    openNow:p.hours?.open_now??null,
    openingHours:p.hours||null,
    website:p.website||null,
    mapsUri:null,
    phone:p.tel||null,
    photos,
    editorialSummary:p.description||p.tastes?.slice?.(0,4)?.join(', ')||null,
    reviews:[],
    accessibility:null,
    accessibilityOptions:null,
    features:{
      servesVegetarianFood:null,
      reservable:p.attributes?.takes_reservations??null
    },
    placeActions:Array.isArray(p.place_actions)?p.place_actions:[],
    veracityRating:p.veracity_rating??null,
    providerRefs:{foursquare:id},
    evidence:[{
      provider:'foursquare',
      kind:evidenceKind,
      categories:categoryLabels,
      coordinateSchema:coordinates?.source||'missing',
      providerRating:rating.providerRatingRaw===null?null:{value:rating.providerRatingRaw,scale:10},
      normalizedRating:rating.rating===null?null:{value:rating.rating,scale:5},
      veracityRating:p.veracity_rating??null
    }],
    raw:p
  };
}

export function boundedFoursquareError(body:any){
  const source=body&&typeof body==='object'?body:{};
  const nested=source.error&&typeof source.error==='object'?source.error:{};
  const message=String(source.message||nested.message||'Foursquare-Anfrage fehlgeschlagen.').slice(0,240);
  const code=String(source.code||nested.code||'FOURSQUARE_PROVIDER_ERROR').slice(0,80);
  return {code,message};
}
