'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{stripTypeScriptTypes}=require('node:module');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx=vm.createContext({console,Date,Map,Set,Promise,setTimeout,clearTimeout,URL,URLSearchParams,AbortSignal,Deno:{env:{get:name=>name==='GEOAPIFY_API_KEY'?'test':''}},document:{documentElement:{classList:{contains:()=>false}}}});ctx.window=ctx;
for(const file of ['core/places/places-domain-contract-core.js','core/places/global-place-contracts.js','app/places/places-spatial-composition-core.js'])vm.runInContext(read(file),ctx);
vm.runInContext(read('app/places/places-spatial-experience.js').replace('globalThis.LuviaPlacesSpatialExperience=','globalThis.filters={state,CATEGORY_FILTERS,emptyFilters,filteredResults,filterAvailability,publicRuntime};globalThis.LuviaPlacesSpatialExperience='),ctx);
ctx.providerFetch=(_p,_o,_u,url,init)=>ctx.fetch(url,init);ctx.enrichLinkedMedia=async p=>p;
vm.runInContext(stripTypeScriptTypes(read('supabase/functions/luvia-gateway/_shared/places.ts').replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,''))+'\nglobalThis.provider={geoapifyCategoriesFromOptions,normalizedGeoapifyPlace,geoapifyPlacesSearch,geoapifyPlaceDetails};',ctx);
// Independent provider fixtures: a UI filter must recognize actual provider taxonomy.
const cases={hotel:'accommodation.hotel',apartment:'accommodation.apartment',vacation_rental:'accommodation.chalet',hostel:'accommodation.hostel',campground:'camping.camp_site',restaurant:'catering.restaurant',cafe:'catering.cafe',bar:'catering.bar',bakery:'commercial.food_and_drink.bakery',meal_takeaway:'catering.fast_food',food_court:'catering.food_court',amusement_park:'entertainment.theme_park',amusement_center:'entertainment.activity_park',water_park:'entertainment.water_park',playground:'leisure.playground',zoo:'entertainment.zoo',spa:'leisure.spa',swimming_pool:'sport.swimming_pool',beach:'beach',marina:'maritime.marina',tourist_attraction:'tourism.sights',historical_landmark:'tourism.sights.castle',monument:'tourism.sights.memorial.monument',observation_deck:'tourism.attraction.viewpoint',park:'leisure.park',garden:'leisure.park.garden',museum:'entertainment.museum',art_gallery:'entertainment.culture.gallery',movie_theater:'entertainment.cinema',performing_arts_theater:'entertainment.culture.theatre',shopping_mall:'commercial.shopping_mall',market:'commercial.marketplace',clothing_store:'commercial.clothing.clothes',department_store:'commercial.department_store',night_club:'adult.nightclub',pharmacy:'healthcare.pharmacy',supermarket:'commercial.supermarket',parking:'parking',electric_vehicle_charging_station:'service.vehicle.charging_station',atm:'service.financial.atm',vegetarian_restaurant:'vegetarian.only',vegan_restaurant:'vegan.only'};
for(const cuisine of ['italian','german','mediterranean','greek','french','spanish','indian','chinese','japanese','thai','vietnamese','korean','mexican','lebanese','turkish'])cases[`${cuisine}_restaurant`]=`catering.restaurant.${cuisine}`;
cases.middle_eastern_restaurant='catering.restaurant.arab';
cases.asian_restaurant='catering.restaurant.asian';
cases.fine_dining_restaurant='catering.restaurant';cases.hiking_area='natural';cases.concert_hall='entertainment.culture';
const rawFixtures={fine_dining_restaurant:{dining:'fine_dining'},hiking_area:{information:'trailhead'},concert_hall:{amenity:'concert_hall'}};
const f=ctx.filters,point={latitude:54.02,longitude:10.75};let tested=0;
for(const [category,schema]of Object.entries(f.CATEGORY_FILTERS))for(const [group,options]of [['types',schema.types||schema.subtypes||[]],['cuisines',schema.cuisines||[]]])for(const [type]of options){
 if(!type)continue;f.state.category=category;f.state.filters=f.emptyFilters();f.state.filters[group]=[type];
 if(!cases[type]){assert.ok(f.filterAvailability(type),`${category}/${type} must explain unavailable provider support`);continue}
 const p=ctx.provider.normalizedGeoapifyPlace({properties:{place_id:type,name:'Fixture',lat:point.latitude,lon:point.longitude,categories:[cases[type]],datasource:{raw:rawFixtures[type]||{}}}});
 assert.ok(p.types.includes(type),`${category}/${type} must map ${cases[type]}`);
 f.state.results=[{...p,coordinates:point},{id:'wrong',name:'Wrong',types:['unrelated'],coordinates:point}];
 assert.equal(f.filteredResults().length,1,`${category}/${type} must exclude a wrong type`);tested++;
}
f.state.category='food';f.state.filters=f.emptyFilters();f.state.filters.types=['restaurant','cafe'];f.state.filters.cuisines=['italian_restaurant'];
f.state.results=[{id:'yes',types:['restaurant','italian_restaurant'],rating:4.8,distanceMeters:50,distanceReference:'destination'},{id:'other',types:['restaurant','german_restaurant'],rating:3,distanceMeters:10,distanceReference:'destination'}];
assert.deepEqual(Array.from(f.filteredResults(),p=>p.id),['yes'],'OR within one group, AND across groups');
f.state.filters=f.emptyFilters();assert.equal(f.filteredResults().length,2,'reset restores full cohort');
f.state.sort='distance';assert.equal(f.filteredResults()[0].id,'other','distance sort works without device permission');
for(const key of ['openNow','rated','rating45','reservable','accessible','vegetarian']){
 f.state.sort='fit';f.state.filters=f.emptyFilters();f.state.filters[key]=true;
 const yes={id:'yes',types:['restaurant'],openNow:true,rating:4.8,features:{reservable:true,servesVegetarianFood:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},no={id:'no',types:['restaurant'],openNow:false,rating:3,features:{reservable:false,servesVegetarianFood:false},accessibilityOptions:{wheelchairAccessibleEntrance:false}},unknown={id:'unknown',types:['restaurant']};
 f.state.results=[yes,no,unknown];const ids=Array.from(f.filteredResults(),p=>p.id);assert.ok(ids.includes('yes'),`${key} includes proof`);assert.ok(!ids.includes('unknown'),`${key} never invents missing facts`);if(key!=='rated')assert.ok(!ids.includes('no'),`${key} excludes contrary facts`);
}
f.state.filters=f.emptyFilters();f.state.filters.priceLevels=['PRICE_LEVEL_MODERATE'];f.state.results=[{id:'yes',priceLevel:'PRICE_LEVEL_MODERATE'},{id:'unknown'},{id:'no',priceLevel:'PRICE_LEVEL_INEXPENSIVE'}];assert.deepEqual(Array.from(f.filteredResults(),p=>p.id),['yes']);
f.state.filters=f.emptyFilters();f.state.filters.vegetarian=true;f.state.results=[{id:'steak',name:'Kleines Steakhouse',types:['restaurant','vegetarian'],features:{servesVegetarianFood:true}},{id:'coast',name:'COAST',types:['restaurant'],features:{servesVegetarianFood:true}}];assert.deepEqual(Array.from(f.filteredResults(),p=>p.id),['coast'],'generic vegetarian metadata must not make a steakhouse pass the manual filter');
for(const [type,category]of Object.entries({hotel:'accommodation.hotel',apartment:'accommodation.apartment',vacation_rental:'accommodation.chalet',hostel:'accommodation.hostel',campground:'camping.camp_site'})){const p=ctx.provider.normalizedGeoapifyPlace({properties:{place_id:type,name:type,lat:54,lon:10,categories:[category]}});assert.ok(p.types.includes(type),`accommodation subtype ${type} must survive normalization`)}
(async()=>{
 const cuisineCalls=[];
 ctx.fetch=async url=>{const u=new URL(url);cuisineCalls.push(u);const native=(u.searchParams.get('conditions')||u.searchParams.get('categories')).split(',');return{ok:true,status:200,json:async()=>({features:native.map(category=>({properties:{place_id:category,name:category,lat:54.02,lon:10.75,categories:[category.startsWith('catering.')?'catering.restaurant':category,category]}}))})}};
 for(const [type]of f.CATEGORY_FILTERS.food.cuisines){
  const before=cuisineCalls.length;const rows=await ctx.provider.geoapifyPlacesSearch('Cuisine Restaurant',{location:point},{category:'food',includedType:type,includedTypes:[type],userQuery:''},null,null);
  assert.ok(rows.some(p=>p.types.includes(type)),`${type}: actual provider request and returned normalization must agree`);
  assert.equal(cuisineCalls.length-before,1,`${type}: a successful typed cuisine uses one precise provider request`);
 }
 assert.equal(cuisineCalls.filter(u=>u.searchParams.get('limit')==='500').length,0,'successful typed cuisines never spend the expensive catering cohort');
 const start=cuisineCalls.length;
 const union=await ctx.provider.geoapifyPlacesSearch('Italienisch Deutsch Griechisch Restaurant',{location:point},{category:'food',includedTypes:['italian_restaurant','german_restaurant','greek_restaurant'],userQuery:''},null,null);
 assert.equal(cuisineCalls.length-start,1,'national cuisine union uses one provider request, not a broad cohort or per-cuisine fanout');
 assert.deepEqual(cuisineCalls.at(-1).searchParams.get('categories').split(',').sort(),['catering.restaurant.german','catering.restaurant.greek','catering.restaurant.italian']);
 f.state.category='food';f.state.filters=f.emptyFilters();f.state.filters.types=['restaurant'];f.state.filters.cuisines=['italian_restaurant','german_restaurant','greek_restaurant'];f.state.results=union;
 assert.equal(f.filteredResults().length,3,'type AND cuisine groups retain each cuisine in an OR selection');
 const mixedStart=cuisineCalls.length;await ctx.provider.geoapifyPlacesSearch('Italienisch Vegan Restaurant',{location:point},{category:'food',includedTypes:['italian_restaurant','vegan_restaurant'],userQuery:''},null,null);
 assert.equal(cuisineCalls.length-mixedStart,2);assert.equal(cuisineCalls.at(-2).searchParams.has('conditions'),false,'vegan alternative must not restrict Italian branch');assert.equal(cuisineCalls.at(-1).searchParams.get('conditions'),'vegan.only');
 for(const evidence of [{catering:{cuisine:'italian; greek'}},{cuisine:['italian','greek']},{datasource:{raw:{cuisine:'italian;greek'}}}]){
  const p=ctx.provider.normalizedGeoapifyPlace({properties:{place_id:'structured',name:'Evidence',lat:54,lon:10,categories:['catering.restaurant'],...evidence}});assert.ok(p.types.includes('italian_restaurant')&&p.types.includes('greek_restaurant'),'explicit structured cuisines survive normalization');
 }
 // Independent real-world counterexample: Sai Gon is recorded as Asian, not
 // Chinese. A broader category must retain it without inventing a child cuisine.
 const saiGon=ctx.provider.normalizedGeoapifyPlace({properties:{place_id:'sai-gon',name:'Sai Gon',lat:54.0497067,lon:10.7509787,categories:['catering','catering.restaurant','catering.restaurant.asian'],catering:{cuisine:'asian'}}});
 f.state.filters=f.emptyFilters();f.state.filters.cuisines=['asian_restaurant'];f.state.results=[saiGon];assert.equal(f.filteredResults().length,1);
 f.state.filters.cuisines=['chinese_restaurant'];assert.equal(f.filteredResults().length,0,'generic Asian must never imply Chinese');
 for(const cuisine of ['chinese','thai','vietnamese','sushi']){
  const p=ctx.provider.normalizedGeoapifyPlace({properties:{place_id:cuisine,name:'Kitchen',lat:54,lon:10,categories:['catering.restaurant',`catering.restaurant.${cuisine}`]}});assert.ok(p.types.includes('asian_restaurant'),`${cuisine} belongs to broader Asian cuisine`);
 }
 const rescueCalls=[];ctx.fetch=async url=>{const u=new URL(url);rescueCalls.push(u);if(u.searchParams.get('limit')==='500')return{ok:true,status:200,json:async()=>({features:[{properties:{place_id:'raw-cuisine',name:'Raw cuisine',lat:54.02,lon:10.75,categories:['catering.restaurant'],catering:{cuisine:'italian'}}}]})};return{ok:true,status:200,json:async()=>({features:[]})}};
 const rescued=await ctx.provider.geoapifyPlacesSearch('Italienisch Restaurant',{location:point},{category:'food',includedType:'italian_restaurant',includedTypes:['italian_restaurant'],userQuery:''},null,null);
 assert.equal(rescueCalls.length,2,'a genuine typed zero performs one bounded cohort rescue');assert.equal(rescued.length,1);assert.ok(rescued[0].types.includes('italian_restaurant'));
 const partialCalls=[];ctx.fetch=async url=>{const u=new URL(url),category=u.searchParams.get('categories');partialCalls.push(category);if(category==='entertainment')throw Object.assign(new Error('supplement unavailable'),{code:'PROVIDER_BUDGET_DENIED',status:503});return{ok:true,status:200,json:async()=>({features:[{properties:{place_id:category,name:category,lat:54.02,lon:10.75,categories:[category]}}]})}};
 const partialActivities=await ctx.provider.geoapifyPlacesSearch('Aktivitäten Erlebnisse Freizeit',{location:point},{category:'activities',userQuery:'',maxResultCount:50},null,null);
 assert.deepEqual(partialCalls.sort(),['entertainment','leisure','sport'],'all broad category parents are requested independently');
 assert.equal(partialActivities.length,2,'one failed broad-category supplement must retain successful sibling results');
 const composition=ctx.LuviaPlacesSpatialCompositionCoreV1;
 const preferencePins=composition.compose({places:[{id:'yes',name:'Yes',coordinates:point,preferenceDiscoveryMatch:true,preferenceConstraintState:'verify'},{id:'no',name:'No',coordinates:point,preferenceDiscoveryMatch:false,preferenceScore:95,preferenceFit:{score:95,coverage:100},preferenceReasons:['generic'],preferenceConstraintState:'satisfied'}],runtime:{status:'ready'}}).markers;
 assert.equal(preferencePins.find(p=>p.providerPlaceId==='yes').preferred,true);assert.equal(preferencePins.find(p=>p.providerPlaceId==='no').preferred,false,'pin badge obeys the same explicit match verdict as Passend');
 f.state.status='ready';f.state.results=[];assert.equal(f.publicRuntime(0).status,'empty','a settled zero must render an honest empty state even without a stale source cohort');
 const calls=[];ctx.fetch=async url=>{calls.push(new URL(url));return{ok:true,status:200,json:async()=>({features:[{properties:{feature_type:'details',place_id:'abc',name:'Real Place',lat:54.02,lon:10.75,categories:['catering.restaurant'],wiki_and_media:{image:'https://example.org/real-place.jpg'}}}]})}};
 const detail=await ctx.provider.geoapifyPlaceDetails('geoapify:abc',{enrichMedia:true});assert.equal(detail.name,'Real Place');assert.equal(detail.photos[0].uri,'https://example.org/real-place.jpg');
 await ctx.provider.geoapifyPlaceDetails('geoapify:abc',{enrichMedia:true});assert.equal(calls.length,1,'exact-place media details are cached');
 await ctx.provider.geoapifyPlacesSearch('Restaurant',{location:point},{category:'food',includedTypes:['vegetarian_restaurant'],userQuery:''},null,null);assert.equal(calls.at(-1).searchParams.get('conditions'),'vegetarian.only');assert.equal(calls.at(-1).searchParams.has('name'),false,'UI filter names never become venue-name queries');
 await ctx.provider.geoapifyPlacesSearch('Restaurant',{location:point},{category:'food',includedType:'restaurant',includedTypes:['restaurant','cafe','vegetarian_restaurant','vegan_restaurant'],userQuery:''},null,null);assert.equal(calls.at(-1).searchParams.has('conditions'),false,'general Food taxonomy is an OR cohort, never a dedicated vegan filter');
 const sent=[];ctx.performance={now:()=>Date.now()};ctx.LuviaBackend={request:async(action,payload)=>{sent.push({action,payload});return{ok:true,data:{places:[]}}}};vm.runInContext(read('intelligence/places-service.js'),ctx);
 await ctx.LuviaPlaces.textSearch('Restaurant Scharbeutz',{destination:{name:'Scharbeutz',location:point},userQuery:'',accessibleOnly:true,reservableOnly:true,vegetarianOnly:true,strictPlaceType:'vegetarian_restaurant',minUserRatingCount:100,priceLevels:['PRICE_LEVEL_MODERATE']});
 for(const key of ['accessibleOnly','reservableOnly','vegetarianOnly'])assert.equal(sent.at(-1).payload.options[key],true,`${key} must reach the actual gateway payload`);
 assert.equal(sent.at(-1).payload.options.userQuery,'');assert.equal(sent.at(-1).payload.options.strictPlaceType,'vegetarian_restaurant');assert.equal(sent.at(-1).payload.options.minUserRatingCount,100);
 await ctx.LuviaPlaces.details('geoapify:abc',{enrichMedia:true});assert.equal(sent.at(-1).payload.options.enrichMedia,true,'photo enrichment must survive the transport boundary');
 const nativeFixtures=[['Cafe',['catering','catering.cafe']],['Bakery',['commercial','commercial.food_and_drink','commercial.food_and_drink.bakery']],['Theme park',['entertainment','entertainment.theme_park']],['Garden',['leisure','leisure.park','leisure.park.garden']]].map(([name,categories])=>ctx.provider.normalizedGeoapifyPlace({properties:{place_id:name,name,lat:54.02,lon:10.75,categories}}));
 ctx.LuviaBackend.request=async()=>({ok:true,data:{places:nativeFixtures}});
 const carried=(await ctx.LuviaPlaces.textSearch('Fixture',{destination:{location:point}})).data.places;
 assert.equal(carried.find(p=>p.name==='Cafe').types.includes('restaurant'),false,'catering parent must not turn cafes into restaurants');
 assert.equal(carried.find(p=>p.name==='Bakery').types.includes('restaurant'),false,'legacy food regex must not turn bakeries into restaurants');
 assert.equal(carried.find(p=>p.name==='Theme park').types.includes('park'),false,'theme parks must not pass the nature park filter');
 assert.equal(carried.find(p=>p.name==='Garden').types.includes('park'),true,'a real park garden retains its parent');
 console.log(`Filter matrix: ${tested} category/subtype mappings, all fact filters, combinations/reset, distance and exact-place media: PASS`);
})().catch(error=>{console.error(error);process.exitCode=1});
