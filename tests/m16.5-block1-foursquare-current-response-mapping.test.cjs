'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'..');
const mappingPath=path.join(root,'supabase/functions/luvia-gateway/_shared/foursquare-place-mapping.ts');
const placesPath=path.join(root,'supabase/functions/luvia-gateway/_shared/places.ts');

async function mapping(){
  return import(`${pathToFileURL(mappingPath).href}?test=${Date.now()}`);
}

test('current Foursquare 2025 response fields use top-level coordinates and no retired requests',async()=>{
  const module=await mapping();
  assert.equal(module.FOURSQUARE_API_VERSION,'2025-06-17');
  assert.equal(module.FOURSQUARE_RESTAURANT_CATEGORY_ID,'13065');
  assert.ok(module.FOURSQUARE_SEARCH_FIELDS.includes('latitude'));
  assert.ok(module.FOURSQUARE_SEARCH_FIELDS.includes('longitude'));
  assert.ok(module.FOURSQUARE_SEARCH_FIELDS.includes('photos'));
  assert.ok(module.FOURSQUARE_SEARCH_FIELDS.includes('distance'));
  assert.equal(module.FOURSQUARE_DETAILS_FIELDS.includes('distance'),false);
  for(const retired of ['geocodes','timezone']){
    assert.equal(module.FOURSQUARE_SEARCH_FIELDS.includes(retired),false,`${retired} must not be requested by search`);
    assert.equal(module.FOURSQUARE_DETAILS_FIELDS.includes(retired),false,`${retired} must not be requested by details`);
  }
});

test('current top-level response becomes a source-backed Luvia place with provider photo',async()=>{
  const {normalizeFoursquarePlace}=await mapping();
  const result=normalizeFoursquarePlace({
    fsq_place_id:'fsq-current-1',
    name:'Scharbeutz Mitte',
    latitude:54.0261,
    longitude:10.7564,
    geocodes:{main:{latitude:1,longitude:2}},
    location:{address:'Strandallee 1',locality:'Scharbeutz',postcode:'23683',country:'DE'},
    categories:[{id:13065,name:'Restaurant'}],
    photos:[{id:'photo-1',prefix:'https://images.example/',suffix:'.jpg',width:1200,height:800}],
    rating:8.7,
    stats:{total_ratings:213},
    hours:{open_now:true},
    veracity_rating:4
  });
  assert.deepEqual(result.location,{latitude:54.0261,longitude:10.7564});
  assert.equal(result.evidence[0].coordinateSchema,'top-level');
  assert.equal(result.formattedAddress,'Strandallee 1, Scharbeutz, 23683, DE');
  assert.equal(result.primaryTypeLabel,'Restaurant');
  assert.equal(result.primaryType,'restaurant');
  assert.ok(result.types.includes('restaurant'));
  assert.ok(result.providerNativeTypes.includes('13065'));
  assert.equal(result.rating,4.35);
  assert.equal(result.ratingScale,5);
  assert.equal(result.providerRatingRaw,8.7);
  assert.equal(result.providerRatingScale,10);
  assert.deepEqual(result.evidence[0].providerRating,{value:8.7,scale:10});
  assert.deepEqual(result.evidence[0].normalizedRating,{value:4.35,scale:5});
  assert.equal(result.userRatingCount,213);
  assert.equal(result.photos[0].uri,'https://images.example/900x900.jpg');
  assert.equal(result.veracityRating,4);
});

test('provider category labels become bounded Luvia discovery types without losing native evidence',async()=>{
  const {normalizeFoursquarePlace}=await mapping();
  const miniGolf=normalizeFoursquarePlace({fsq_place_id:'mini-golf',name:'Küsten Adventure Golf',latitude:54.02,longitude:10.75,categories:[{id:10054,name:'Arts and Entertainment > Miniature Golf Course'}]});
  const museum=normalizeFoursquarePlace({fsq_place_id:'museum',name:'Museum am Meer',latitude:54.03,longitude:10.76,categories:[{id:10027,name:'Arts and Entertainment > Museum'}]});
  assert.ok(miniGolf.types.includes('tourist_attraction'));
  assert.ok(museum.types.includes('museum'));
  assert.ok(miniGolf.providerNativeTypes.includes('Arts and Entertainment > Miniature Golf Course'));
});

test('legacy cached coordinates remain readable but missing provider facts are never invented',async()=>{
  const {normalizeFoursquarePlace}=await mapping();
  const legacy=normalizeFoursquarePlace({fsq_place_id:'legacy',name:'Alt',geocodes:{roof:{latitude:53.1,longitude:10.2}}});
  const missing=normalizeFoursquarePlace({fsq_place_id:'missing',name:'Ohne Beleg',photos:[{}]});
  assert.deepEqual(legacy.location,{latitude:53.1,longitude:10.2});
  assert.equal(legacy.evidence[0].coordinateSchema,'legacy-geocodes');
  assert.equal(missing.location,null);
  assert.deepEqual(missing.photos,[]);
  assert.equal(missing.rating,null);
  assert.equal(missing.providerRatingRaw,null);
  assert.equal(missing.userRatingCount,0);
});

test('public diagnostics are bounded and gateway owns a layered Pro-field fallback',async()=>{
  const {boundedFoursquareError}=await mapping();
  const diagnostic=boundedFoursquareError({error:{code:'INVALID_FIELD',message:'Field not available'},token:'must-not-leak',payload:{large:'must-not-leak'}});
  assert.deepEqual(diagnostic,{code:'INVALID_FIELD',message:'Field not available'});

  const source=fs.readFileSync(placesPath,'utf8');
  assert.match(source,/foursquareWithFieldFallback/);
  assert.match(source,/fieldFallbacks\+\+/);
  assert.match(source,/coordinateSchema:'top-level-latitude-longitude'/);
  assert.match(source,/version:'4\.30\.0'/);
  assert.match(source,/HEALTH_PROBES=Object\.freeze/);
  assert.match(source,/'minigolf-scharbeutz'/);
  assert.match(source,/'minigolf-chat-scharbeutz'/);
  assert.match(source,/'beach-supplies-scharbeutz'/);
  assert.match(source,/availableDiagnosticProbes:Object\.keys\(HEALTH_PROBES\)/);
  assert.match(source,/provider:tasks\[index\]\?\.provider\|\|'unknown'/);
  assert.match(source,/Promise\.allSettled\(tasks\.map\(task=>task\.promise\)\)/);
  assert.match(source,/query:foursquareQuery\(query,destination\)/);
  assert.match(source,/params\.fsq_category_ids=categoryFilter/);
  assert.match(source,/categoryFilteredSearch:'explicit-reviewed-taxonomy-only'/);
  assert.match(source,/postRetrievalCategoryEvidence:true/);
  assert.match(source,/return safe\.length\?safe\.join\(','\):undefined/);
  assert.doesNotMatch(source,/strictTypeFiltering===true&&String\(options\?\.includedType/);
  assert.match(source,/const \{fields:_retiredFields,\.\.\.providerDefaults\}=params/);
  assert.match(source,/return foursquare\(path,providerDefaults\)/);
  assert.match(source,/destination\?\.searchRadiusMeters/);
  assert.match(source,/Math\.min\(50,Math\.max\(1,Number\(options\?\.maxResultCount\|\|10\)\)\)/);
  assert.doesNotMatch(source,/fields:'[^']*(?:geocodes|timezone)/);
  assert.doesNotMatch(source,/lastError=\{provider:'foursquare',status:response\.status,body\}/);
});

test('Foursquare receives the subject without a duplicated geographic destination',async()=>{
  const {foursquareQuery}=await import(`${pathToFileURL(placesPath).href}?query-test=${Date.now()}`);
  const destination={name:'Scharbeutz',displayName:'Scharbeutz',canonicalCity:{name:'Scharbeutz'}};
  assert.equal(foursquareQuery('Minigolf in Scharbeutz Scharbeutz',destination),'Minigolf');
  assert.equal(foursquareQuery('Restaurant am Wasser in Scharbeutz',destination),'Restaurant am Wasser');
  assert.equal(foursquareQuery('Surf Shop Scharbeutz',destination),'Surf Shop');
  assert.equal(foursquareQuery('Scharbeutz',destination),'Scharbeutz','a destination-only query must not collapse below the provider minimum');
});
