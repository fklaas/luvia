(() => {
'use strict';
const VERSION='4.61.0-category-query-split';
const UI_CATEGORIES=LuviaPlacesDomainContractCoreV1.categories();
const INTENTS=Object.freeze({
  mini_golf:{category:'activities',label:'Minigolf',patterns:[/mini[ -]?golf/i,/miniature golf/i,/adventure golf/i,/putt[ -]?putt/i],queries:['Minigolf','Miniature Golf','Adventure Golf','Putt-Putt'],match:/mini[ _-]?golf|miniature[ _-]?golf|adventure[ _-]?golf|putt[ _-]?putt/i,typeMatch:/mini[ _-]?golf|miniature[ _-]?golf|adventure[ _-]?golf|putt[ _-]?putt/i,exclude:null,niche:true,specificEvidence:true},
  beach_supplies:{category:'shopping',label:'mögliche Einkaufsorte für Strand- und Badesachen',patterns:[/luftmatrat/i,/pool[ -]?float/i,/inflatable/i,/schwimmring/i,/badespielzeug/i,/strandspielzeug/i,/beach suppl/i],queries:['Strandbedarf Geschäft','Badespielzeug Geschäft','Beach supplies shop','Surf shop','Sporting goods store'],match:/strandbedarf|badespielzeug|strandspielzeug|beach[ _-]?(?:suppl|shop)|surf[ _-]?shop|sporting[ _-]?goods|outdoor[ _-]?(?:shop|store)|camping[ _-]?(?:shop|store)|spielwaren|toy[ _-]?store|department[ _-]?store|supermarket|hypermarket/i,exclude:/hotel|lodging|unterkunft|restaurant|cafe|bakery|bäckerei/i,niche:true,specificEvidence:true,fulfillmentMode:'retail',requiresInventoryVerification:true},
  skydiving:{category:'activities',label:'Fallschirmspringen',patterns:[/fallschirm/i,/skydiv/i,/tandemsprung/i,/parachut/i,/bodyflying/i,/windtunnel/i],queries:['Fallschirmspringen','Tandemsprung','Skydiving','Fallschirmsprung','Indoor Skydiving','Bodyflying'],match:/fallschirm|skydiv|tandemsprung|parachut|bodyflying|windtunnel|freefall/i,exclude:/tierpark|zoo|museum|trampolin|superfly(?!.*skydiv)/i,niche:true},
  swimming:{category:'activities',label:'Schwimmen',patterns:[/schwimm/i,/baden/i,/badesee/i,/pool/i,/wasserpark/i],queries:['Schwimmbad','Hallenbad','Freibad','Badesee','Therme','Wasserpark','Aquatic Center'],match:/schwimm|hallenbad|freibad|therme|badesee|wasserpark|aquatic|pool/i,niche:false},
  cinema:{category:'culture',label:'Kino',patterns:[/kino/i,/cinema/i,/filmtheater/i],queries:['Kino','Cinema','Filmtheater'],match:/kino|cinema|filmtheater/i,niche:false},
  vegetarian:{category:'food',label:'Vegetarisch essen',patterns:[/vegetar/i,/vegan/i],queries:['Vegetarisches Restaurant','Veganes Restaurant','Vegetarian Restaurant'],match:/vegetar|vegan/i,niche:false},
  pasta:{category:'food',label:'Pasta essen',patterns:[/nudel/i,/pasta/i,/italien/i],queries:['Italienisches Restaurant Pasta','Pasta Restaurant','Vegetarisches Restaurant Nudeln'],match:/pasta|nudel|italien|trattoria|osteria/i,niche:false},
  hidden_gem:{category:'activities',label:'echter Geheimtipp',patterns:[/nicht jeder tourist/i,/geheimtipp/i,/hidden gem/i,/abseits.*tourist/i,/wenig bekannt/i,/unbekannt/i,/locals? kennen/i,/insider/i,/überseh/i],queries:['versteckter Geheimtipp','lieu insolite','off the beaten path','local favorite','unusual place','hidden gem'],match:null,exclude:null,niche:true}
});
const KNOWN_MASS_TOURISM=/eiffel|tour eiffel|louvre|arc de triomphe|sacr[ée] coeur|notre[ -]?dame|mus[ée]e d.?orsay|disneyland|versailles|palais de tokyo|centre pompidou|pompidou|moulin rouge|sainte[- ]chapelle|panth[ée]on|galeries lafayette|champs[- ]?[ée]lys[ée]es|montparnasse tower|tour montparnasse/i;
const CENTER_TERMS=/\b(?:zentrum|stadtzentrum|innenstadt|ortskern|city\s*cent(?:er|re)|town\s*cent(?:er|re)|downtown|centre[- ]ville|centro(?:\s+(?:citt[aà]|urbano|da\s+cidade))?|centrum|stadscentrum)\b/i;
const WATERFRONT_TERMS=/\b(?:am\s+wasser|by\s+the\s+water|strand[a-zäöüß]*|beach[a-z]*|seafront|waterfront|shore|coast(?:al)?|k[uü]ste|promenade|meer|sea|plage|littoral|playa|costa|praia|spiaggia|lungomare|kust|boulevard|marina|hafen|harbour|harbor|port)\b/i;
const OUTSKIRTS_TERMS=/\b(?:stadtrand|au[sß]erhalb|außerhalb|outskirts|outside\s+(?:town|the\s+city)|p[eé]riph[eé]rie|fuera\s+del\s+centro|periferia|buiten\s+het\s+centrum)\b/i;
const VEGETARIAN_FOCUS=/vegetarian_restaurant|vegan_restaurant|vegetar(?:isch|ian)|vegan|plant[ _-]?based|pflanzenk[uü]che|fleischlos/i;
const MEAT_LED_OFFER=/kebab|kebap|d[oö]ner|steak(?:house)?|barbecue|\bbbq\b|grill|hamburger|burger|greek_restaurant|griech(?:isch|e[rsnm]?)/i;
const AVOID_PREFIX=/(?:\b(?:nicht|kein(?:e[rmns]?)?|ohne|statt|abseits|weg\s+von|not|without|away\s+from|instead\s+of|pas|sans|plut[oô]t\s+que|loin\s+de|no\s+(?:en|a|al|cerca|junto|sobre|directamente)|sin|en\s+vez\s+de|non|senza|invece\s+di|n[aã]o|sem|em\s+vez\s+de|niet|zonder|in\s+plaats\s+van)\b).{0,32}/i;
const SPECIFIC_STOP_WORDS=new Set('zeige zeigen zeig suche suchen such entdecken entdecke empfehlen empfiehl vorschlagen vorschläge show list search looking recommend please rather suitable euer unseren urlaub eher aber also ansehen angebot angebote auswahl bitte bisschen children city der die das den dem des direct directly direkt ein eine einer einem einen etwas euch eure euren eurer für fuer find finde finden gefunden geht gerne heute ich im in into kind kinder kids mal mit mochte möchte moechte nach nahe near noch option optionen ort orte place places restaurant restaurants ruhig ruhige ruhigen sehen soll spielen stadt statt super und uns unsere unseren want was wasser weiter wish wunsch wünsche wuensche zum zur'.split(' '));
const BROAD_EVIDENCE_TERMS=new Set('activity activities aktivitat aktivitäten aktivitaet attraction business company erlebnis erleben freizeit geschäft geschaft laden möglichkeit möglichkeiten option place places shop store tourist attraction venue'.split(' '));
const CATEGORY_TYPE_ALIASES=Object.freeze({
  accommodation:Object.freeze(['accommodation','lodging','hotel','hostel','motel','bed_and_breakfast','guest_house','guesthouse','resort','resort_hotel','campground','camping_cabin','private_guest_room','apartment','serviced_apartment','holiday_apartment','apartment_hotel','extended_stay_hotel','holiday_home','vacation_rental','cottage','inn','pension','ferienwohnung']),
  nightlife:Object.freeze(['night_club','nightclub','nightlife_spot','dance_club','discotheque','disco','bar','beer_bar','cocktail_bar','sports_bar','tiki_bar','wine_bar','lounge_bar','pub','concert_hall','live_music_venue','music_venue','jazz_club','comedy_club','karaoke_bar']),
  food:Object.freeze(['restaurant','cafe','bar','bakery','meal_takeaway','food_court','catering','catering_restaurant','catering_cafe','catering_bar','catering_bakery','catering_fast_food']),
  activities:Object.freeze(['activity','entertainment','leisure','sport','amusement_park','amusement_center','playground','zoo','spa','swimming_pool','water_park']),
  wellness:Object.freeze(['spa','leisure_spa','sauna','wellness']),
  nature:Object.freeze(['park','garden','beach','hiking_area','natural','leisure_park','nature']),
  sights:Object.freeze(['tourist_attraction','tourism','tourism_sights','historical_landmark','monument','attraction']),
  culture:Object.freeze(['museum','art_gallery','movie_theater','performing_arts_theater','concert_hall','entertainment_museum','entertainment_culture','culture'])
});
const QUALIFIED_PROVIDER_TYPE_SUFFIXES=new Set(['restaurant','hotel','hostel','motel']);
const clean=v=>String(v??'').trim();
const fold=v=>clean(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE').replace(/ß/g,'ss');
const words=v=>fold(v).match(/[\p{L}\d]+/gu)||[];
const stem=v=>{let s=fold(v);for(let i=0;i<4;i++){const next=s.replace(/(?:ern|em|en|er|es|ungen|ung|e|n|s)$/,'');if(next===s||next.length<4)break;s=next}return s};
const typeKey=v=>fold(v).replace(/[^\p{L}\d]+/gu,'_').replace(/^_+|_+$/g,'');
function category(key){return UI_CATEGORIES[key]||UI_CATEGORIES.activities}
function intentFor(text='',categoryKey=''){const value=String(text);for(const [key,intent] of Object.entries(INTENTS)){if(intent.patterns.some(rx=>rx.test(value)))return {key,...intent,category:key==='hidden_gem'?(categoryKey||'activities'):intent.category}}return {key:'generic',category:categoryKey||'activities',label:category(categoryKey).label,queries:[],match:null,exclude:null,niche:false}}
function categoryVocabulary(categoryKey=''){const def=category(categoryKey);return new Set(words([def.label,def.query,...(def.synonyms||[]),...(def.keywords||[])].join(' ')).flatMap(token=>[token,stem(token)]))}
function isCategoryBrowseSubject(goalText='',categoryKey='',destination=''){
  const text=clean(goalText);if(!text)return true;
  const def=category(categoryKey);if(fold(text)===fold(def.query))return true;
  const vocab=categoryVocabulary(categoryKey),tokens=words(text),destinationTerms=new Set(words(destination).flatMap(token=>[token,stem(token)]));
  return Boolean(tokens.length)&&tokens.every(raw=>{
    const token=stem(raw);
    return token.length<4||destinationTerms.has(raw)||destinationTerms.has(token)||SPECIFIC_STOP_WORDS.has(raw)||SPECIFIC_STOP_WORDS.has(token)||BROAD_EVIDENCE_TERMS.has(raw)||BROAD_EVIDENCE_TERMS.has(token)||vocab.has(raw)||vocab.has(token)||CENTER_TERMS.test(raw)||WATERFRONT_TERMS.test(raw)||OUTSKIRTS_TERMS.test(raw);
  });
}
function specificTerms(value='',destination='',categoryKey=''){const destinationTerms=new Set(words(destination).flatMap(token=>[token,stem(token)])),categoryTerms=new Set([...Object.values(UI_CATEGORIES).flatMap(def=>words([def.label,...(def.synonyms||[]),...(def.keywords||[])].join(' ')).flatMap(token=>[token,stem(token)])),...categoryVocabulary(categoryKey)]),terms=[];for(const raw of words(value)){const token=stem(raw);if(token.length<4||SPECIFIC_STOP_WORDS.has(raw)||SPECIFIC_STOP_WORDS.has(token)||BROAD_EVIDENCE_TERMS.has(raw)||BROAD_EVIDENCE_TERMS.has(token)||destinationTerms.has(raw)||destinationTerms.has(token)||categoryTerms.has(raw)||categoryTerms.has(token)||CENTER_TERMS.test(raw)||WATERFRONT_TERMS.test(raw)||OUTSKIRTS_TERMS.test(raw))continue;terms.push(token)}return[...new Set(terms)]}
function providerEvidenceText(place={}){return [place?.name,place?.displayName?.text,place?.editorialSummary?.text,place?.editorialSummary,place?.description,place?.primaryType,place?.primary_type,place?.primaryTypeLabel,place?.primary_type_label,...(place?.types||[]),...(place?.providerNativeTypes||[])].map(clean).filter(Boolean).join(' ')}
function providerCategoryTypeKeys(place={}){
  const values=[place?.primaryType,place?.primary_type,place?.primaryTypeLabel,place?.primary_type_label,place?.primaryTypeDisplayName?.text,place?.primaryTypeDisplayName,...(place?.types||[]),...(place?.providerNativeTypes||[])].map(clean).filter(Boolean),keys=[];
  for(const value of values){keys.push(typeKey(value));for(const segment of value.split(/[>\/|]+/))keys.push(typeKey(segment))}
  return [...new Set(keys.filter(Boolean))];
}
function providerTypeMatches(value,accepted){return value===accepted||QUALIFIED_PROVIDER_TYPE_SUFFIXES.has(accepted)&&value.endsWith('_'+accepted)}
function hasProviderCategoryEvidence(place={},categoryKey='',definition=category(categoryKey)){
  const specificCategory=['wellness','themeparks','water','malls'].includes(categoryKey);
  const canonicalPrimaryType=typeKey(definition?.primaryType),canonicalOwnerTypes=!specificCategory&&canonicalPrimaryType&&canonicalPrimaryType!=='custom'?[definition.primaryType,...(definition?.domainTypes||[])]:[];
  const aliases=[...(definition?.includedTypes||[]),...canonicalOwnerTypes,...(CATEGORY_TYPE_ALIASES[categoryKey]||[])].map(typeKey).filter(Boolean),providerTypes=providerCategoryTypeKeys(place);
  return aliases.some(accepted=>providerTypes.some(value=>providerTypeMatches(value,accepted)));
}
function evidenceContract(goalText='',categoryKey='',plan={},destination=''){
  const intent=intentFor(goalText,categoryKey),searchPlans=Array.isArray(plan?.searchPlans)?plan.searchPlans:[],aiQueries=searchPlans.map(item=>item?.query),aiTypes=searchPlans.flatMap(item=>item?.includedTypes||[]);
  // Category default/browse queries are taxonomy routes, not open-vocabulary subjects.
  // Stem collisions like Erlebnisse→erlebniss must never empty the Activities map.
  const browse=isCategoryBrowseSubject(goalText,intent.category||categoryKey,destination);
  const rawTerms=browse?[]:specificTerms(goalText,destination,intent.category||categoryKey);
  const expandedTerms=browse?[]:specificTerms([...intent.queries,...aiQueries,...aiTypes].join(' '),destination,intent.category||categoryKey);
  const strict=!browse&&(intent.specificEvidence===true||intent.key!=='generic'&&Boolean(intent.match)||rawTerms.length>0);
  return Object.freeze({version:1,intentKey:intent.key,category:intent.category||categoryKey,strict,rawTerms:Object.freeze(rawTerms),expandedTerms:Object.freeze([...new Set([...rawTerms,...expandedTerms])]),fulfillmentMode:intent.fulfillmentMode||'venue',requiresInventoryVerification:intent.requiresInventoryVerification===true,claimPolicy:intent.requiresInventoryVerification===true?'provider-place-category-only-inventory-unverified':'provider-place-evidence-required',categoryBrowse:browse===true});
}
function matchesEvidenceContract(place={},contract={},intent={}){
  const hay=providerEvidenceText(place),normalized=fold(hay),hayTokens=new Set(words(hay).flatMap(token=>[token,stem(token)]));
  if(intent.typeMatch){const typeEvidence=[place?.primaryType,place?.primary_type,place?.primaryTypeLabel,place?.primary_type_label,...(place?.types||[]),...(place?.providerNativeTypes||[])].map(clean).filter(Boolean).join(' ');return intent.typeMatch.test(typeEvidence)}
  if(intent.match)return intent.match.test(hay);
  if(!contract.strict)return true;
  const strong=(contract.expandedTerms||[]).filter(term=>term.length>=4&&!BROAD_EVIDENCE_TERMS.has(term));
  return strong.some(term=>hayTokens.has(term)||normalized.includes(term));
}
function avoided(text,terms){const value=String(text);for(const match of value.matchAll(new RegExp(terms.source,'gi'))){const prefix=value.slice(Math.max(0,match.index-40),match.index);if(AVOID_PREFIX.test(prefix))return true}return false}
function spatialIntent(text=''){
  const value=String(text),center=CENTER_TERMS.test(value),waterfront=WATERFRONT_TERMS.test(value),outskirts=OUTSKIRTS_TERMS.test(value),avoidCenter=avoided(value,CENTER_TERMS),avoidWaterfront=avoided(value,WATERFRONT_TERMS),avoidOutskirts=avoided(value,OUTSKIRTS_TERMS),prefer=[];
  if(center&&!avoidCenter)prefer.push('center');
  if(waterfront&&!avoidWaterfront)prefer.push('waterfront');
  if(outskirts&&!avoidOutskirts)prefer.push('outskirts');
  const avoid=[];if(avoidCenter)avoid.push('center');if(avoidWaterfront)avoid.push('waterfront');if(avoidOutskirts)avoid.push('outskirts');
  return Object.freeze({explicit:Boolean(prefer.length||avoid.length),prefer:Object.freeze(prefer),avoid:Object.freeze(avoid),source:'user-query',verifiedBy:'places-provider-evidence'});
}
function semanticSignals(text=''){const q=String(text).toLowerCase(),spatial=spatialIntent(text);return Object.freeze({hidden:/nicht jeder tourist|geheimtipp|hidden gem|abseits.*tourist|wenig bekannt|unbekannt|locals? kennen|insider|überseh/.test(q),quiet:/ruhig|entspannt|wenig los|ohne trubel|still/.test(q),romantic:/romant|date|hochzeitstag|zu zweit/.test(q),view:/aussicht|blick|view|panorama|rooftop/.test(q),family:/kind|baby|famil/.test(q),stroller:/kinderwagen|buggy/.test(q),local:/lokal|local|authentisch|viertel|nachbarschaft/.test(q),budget:/günstig|preiswert|budget|nicht teuer/.test(q),accessible:/barrierefrei|rollstuhl|accessible/.test(q),vegetarian:/vegetar/.test(q),vegan:/vegan/.test(q),photo:/foto|fotospot|instagram|fotograf/.test(q),spatial});}
function normalizedPreferences(preferences={}){return window.LuviaPreferenceSchema?.normalizePreferences?.(preferences)||preferences||{}}
function profileSignals(preferences={}){const p=normalizedPreferences(preferences),raw=JSON.stringify(p).toLowerCase(),labels=(window.LuviaPreferenceSchema?.summary?.(p)||[]).map(x=>x.label).filter(Boolean);return Object.freeze({raw,labels,dietary:[...(p.dietaryPreferences||[])],family:p.familyPreferences||{},accessibility:[...(p.accessibilityNeeds||p.accessibilityPreferences?.needs||[])],styles:[...(p.travelStyles||[])],interests:[...(p.travelInterests||[])],activities:[...(p.activityPreferences||[])],dining:[...(p.diningPreferences||[])],atmosphere:[...(p.atmospherePreferences||[])],pace:p.travelPace||p.travelPreferences?.pace||null,budget:p.budgetPreference||p.travelPreferences?.budget||null,vegetarian:/vegetar/.test(raw),vegan:/vegan/.test(raw),stroller:/kinderwagen|buggy|stroller/.test(raw),withChildren:/kind|baby|family|famil/.test(raw),accessible:/barriere|rollstuhl|accessible/.test(raw)});}
function destinationLabel(destination=''){return destination&&typeof destination==='object'?clean(destination.name||destination.displayName||destination.destinationName||destination.formattedAddress):clean(destination)}
function queryCascade(goal={},destination='',preferences={},options={}){const text=clean(goal.text),place=destinationLabel(destination),intent=intentFor(text,goal.category),def=category(intent.category||goal.category),profile=profileSignals(preferences),spatial=spatialIntent(text),strictRestaurant=options.strictPlaceType==='restaurant';let variants=strictRestaurant?[text,'Restaurant','Local restaurant','Full-service restaurant']:[text,...intent.queries,...def.synonyms];if(spatial.prefer.includes('center'))variants=[text,strictRestaurant?'Restaurant Stadtzentrum':`${def.label} Stadtzentrum`,strictRestaurant?'Restaurant city centre':`${def.label} city centre`,...variants];if(spatial.prefer.includes('waterfront'))variants=[text,strictRestaurant?'Restaurant am Wasser':`${def.label} am Wasser`,strictRestaurant?'Waterfront restaurant':`${def.label} waterfront`,...variants];if(spatial.prefer.includes('outskirts'))variants=[text,strictRestaurant?'Restaurant am Stadtrand':`${def.label} am Stadtrand`,...variants];if(intent.key==='hidden_gem')variants=[text,`echter Geheimtipp ${def.label}`,`wenig bekannter ${def.label}`,`lieu insolite ${def.label}`,`off the beaten path ${def.label}`,`local favorite ${def.label}`,...variants];if((intent.category==='food'||goal.category==='food')&&profile.vegetarian&&!/vegetar|vegan/i.test(text))variants=[text,'Vegetarisches Restaurant',...variants];return [...new Set(variants.map(v=>place&&!fold(v).includes(fold(place))?`${v} ${place}`.trim():clean(v)).filter(Boolean))].slice(0,14)}
function reviewCount(place={}){
  const value=place?.userRatingCount??place?.user_rating_count??place?.ratingCount;
  if(value==null||value==='')return null;
  const numeric=Number(value);
  return Number.isFinite(numeric)?numeric:null;
}
function iconicOrMassTourism(place={}){
  const name=clean(place?.name).toLowerCase();
  const reviews=reviewCount(place);
  return (reviews!=null&&reviews>=5000)||KNOWN_MASS_TOURISM.test(name);
}
function hiddenGemEligible(place={}){
  const name=clean(place?.name);
  const reviews=reviewCount(place);
  const summary=String(place?.editorialSummary?.text||place?.editorialSummary||'');
  if(KNOWN_MASS_TOURISM.test(`${name} ${summary}`))return false;
  return reviews!=null&&reviews>=5000?false:true;
}
function spatialAssessment(place={},requested={}){
  const constraint=requested?.explicit===true?requested:spatialIntent(requested?.text||requested||''),hay=`${place?.name||''} ${place?.formattedAddress||place?.address||''} ${place?.editorialSummary?.text||place?.editorialSummary||''} ${(place?.types||[]).join(' ')}`,evidence=[];
  if(CENTER_TERMS.test(hay))evidence.push('center');
  if(WATERFRONT_TERMS.test(hay))evidence.push('waterfront');
  if(OUTSKIRTS_TERMS.test(hay))evidence.push('outskirts');
  const contradicted=constraint.avoid?.some(zone=>evidence.includes(zone))||constraint.prefer?.some(zone=>evidence.length&&evidence.includes(zone)===false&&((zone==='center'&&evidence.includes('waterfront'))||(zone==='waterfront'&&evidence.includes('center')))),confirmed=constraint.prefer?.some(zone=>evidence.includes(zone))||constraint.avoid?.some(zone=>evidence.length&&evidence.includes(zone)===false),state=!constraint.explicit?'not-requested':contradicted?'contradicted':confirmed?'confirmed':'unknown';
  const reasons=[];
  if(state==='confirmed')reasons.push('Die Provider-Ortsdaten stützen die ausdrücklich gewünschte Lage.');
  if(state==='contradicted')reasons.push('Die Provider-Ortsdaten widersprechen der ausdrücklich gewünschten Lage; der Ort wird nicht empfohlen.');
  if(state==='unknown')reasons.push('Die genaue Lagepräferenz ist verstanden, aber in den verfügbaren Provider-Ortsdaten noch nicht eindeutig belegt.');
  return Object.freeze({state,requested:constraint,evidence:Object.freeze(evidence),scoreDelta:state==='confirmed'?28:state==='contradicted'?-180:state==='unknown'?-8:0,reasons:Object.freeze(reasons)});
}
function evidenceState(positive=false,negative=false){return positive&&negative?'conflict':positive?'confirmed':negative?'not_confirmed':'unknown'}
function veganEvidenceConfirmed(place={}){
  const features=place.features||{};
  if(features.servesVeganFood===false||features.servesVegetarianFood===false)return false;
  const types=(place.types||[]).filter(type=>!/^(?:vegetarian|vegan)(?:[._](?:yes|no))?$/.test(String(type).toLowerCase()));
  const offer=[place.name,place.editorialSummary?.text||place.editorialSummary,...types].filter(Boolean).join(' ');
  if(/vegan|plant[ _-]?based|pflanzenk[uü]che/i.test(offer))return true;
  return features.servesVeganFood===true&&!MEAT_LED_OFFER.test(offer);
}
function evidence(place={},goalText='',categoryKey='',preferences={}){const types=(place?.types||[]).map(String),hay=`${place?.name||''} ${place?.editorialSummary?.text||place?.editorialSummary||''} ${types.join(' ')}`.toLowerCase(),features=place?.features||{},sem=semanticSignals(goalText),profile=profileSignals(preferences),vegetarianFocus=VEGETARIAN_FOCUS.test([place?.name,place?.editorialSummary?.text||place?.editorialSummary,...types.filter(type=>!/^(?:vegetarian|vegan)(?:[._](?:yes|no))?$/.test(type.toLowerCase()))].filter(Boolean).join(' ')),meatLed=MEAT_LED_OFFER.test(hay),veggiePos=vegetarianFocus||features.servesVegetarianFood===true&&!meatLed,veggieNeg=features.servesVegetarianFood===false;const strollerPos=features.strollerAccessible===true||features.strollerFriendly===true||place?.accessibilityOptions?.strollerAccessible===true,strollerNeg=features.strollerAccessible===false||features.strollerFriendly===false;const accessPos=features.wheelchairAccessible===true||place?.accessibilityOptions?.wheelchairAccessibleEntrance===true||place?.accessibilityOptions?.wheelchairAccessibleSeating===true,accessNeg=features.wheelchairAccessible===false||place?.accessibilityOptions?.wheelchairAccessibleEntrance===false;const traits={vegetarian:evidenceState(veggiePos,veggieNeg),stroller:evidenceState(strollerPos,strollerNeg),accessible:evidenceState(accessPos,accessNeg)};const sentences=[];if((sem.vegetarian||sem.vegan||profile.vegetarian||profile.vegan)&&categoryKey==='food'){if(traits.vegetarian==='confirmed')sentences.push(vegetarianFocus?'Das erkennbare Angebotsprofil ist vegetarisch oder vegan ausgerichtet.':'Vegetarische Optionen sind für diesen Ort durch Provider-Fakten ausdrücklich belegt.');else if(traits.vegetarian==='not_confirmed')sentences.push('Die verfügbaren Ortsdaten sprechen gegen eine verlässlich vegetarische Eignung, deshalb wertet Luvia diesen Punkt nicht als erfüllt.');else if(traits.vegetarian==='conflict')sentences.push('Die Quellen widersprechen sich bei den vegetarischen Optionen. Luvia behandelt die Eignung deshalb vorsichtshalber als nicht verifiziert.');else if(meatLed)sentences.push('Das erkennbare Hauptangebot ist fleischzentriert; einzelne Optionen genügen nicht für „Passend“.');else sentences.push('Vegetarische Optionen sind in den verfügbaren Quellen noch nicht eindeutig verifiziert.');}
if(sem.stroller||profile.stroller){if(traits.stroller==='confirmed')sentences.push('Die verfügbaren Angaben bestätigen, dass der Ort mit Kinderwagen gut zugänglich ist.');else if(traits.stroller==='not_confirmed')sentences.push('Die verfügbaren Angaben bestätigen keine gute Kinderwagen-Zugänglichkeit.');else sentences.push('Zur Kinderwagen-Zugänglichkeit liegen noch keine ausreichend eindeutigen Angaben vor.');}
if(sem.accessible||profile.accessible){if(traits.accessible==='confirmed')sentences.push('Die verfügbaren Angaben bestätigen barrierefreie Zugänglichkeit.');else if(traits.accessible==='not_confirmed')sentences.push('Barrierefreie Zugänglichkeit ist nach den verfügbaren Angaben nicht bestätigt.');else sentences.push('Zur Barrierefreiheit liegen noch keine ausreichend eindeutigen Angaben vor.');}
return Object.freeze({traits,sentences});}
function isStreetShellName(value=''){const name=clean(value),parts=name.split(/\s+/).filter(Boolean);return parts.length===1&&/(?:straße|strasse|str\.|weg|allee|gasse|damm|ufer|ring)$/i.test(parts[0])}
function accepts(place,categoryKey,goalText='',preferences={},options={}){
  const intent=intentFor(goalText,categoryKey),resolvedCategory=intent.category||categoryKey,def=category(resolvedCategory),name=clean(place?.name),hay=providerEvidenceText(place),providerTypes=providerCategoryTypeKeys(place),contract=options.evidenceContract||evidenceContract(goalText,categoryKey,options.plan||{},options.destination||'');
  if(!clean(place?.providerPlaceId||place?.id).replace(/^places\//,'')||name.length<2)return false;
  // Street-only shells (e.g. unnamed OSM recreation_ground → "Ostpreußenstraße") are not venues.
  if(isStreetShellName(name))return false;
  if(intent.exclude?.test(hay))return false;
  const specificAmenity=intent.specificEvidence===true&&Boolean(intent.typeMatch)&&providerTypes.some(value=>intent.typeMatch.test(value));
  if(!specificAmenity&&def.excludedTypes.some(excluded=>providerTypes.some(value=>providerTypeMatches(value,typeKey(excluded)))))return false;
  // Non-food/non-nightlife categories must never keep catering leftovers from a prior
  // search, viewport merge, or broad provider alias collision.
  if(resolvedCategory!=='food'&&resolvedCategory!=='nightlife'){
    const foodOnly=providerTypes.some(value=>/^(?:restaurant|cafe|bakery|meal_takeaway|food_court|catering)(?:_|$)/.test(value)||value.includes('catering_'));
    if(foodOnly&&!specificAmenity)return false;
  }
  // Search terms and model plans may prove the requested subject, but only the
  // provider taxonomy may prove the canonical Places category. In particular,
  // a venue name containing "Hotel" is not accommodation evidence.
  if(!hasProviderCategoryEvidence(place,resolvedCategory,def))return false;
  const sem=semanticSignals(goalText);
  if(sem.hidden&&!hiddenGemEligible(place))return false;
  if(spatialAssessment(place,sem.spatial).state==='contradicted')return false;
  if(intent.key==='vegetarian'){
    const dietaryEvidence=evidence(place,goalText,resolvedCategory,preferences).traits.vegetarian;
    if(sem.vegan?!veganEvidenceConfirmed(place):dietaryEvidence!=='confirmed')return false;
  }else if(!matchesEvidenceContract(place,contract,intent))return false;
  return true;
}
function naturalReason(sentence=''){let s=clean(sentence);if(!s)return'';s=s.replace(/^Passt direkt zu [„\"]?(.+?)[”\"]?$/i,'Der Ort passt direkt zu eurem Wunsch nach $1.').replace(/^Greift eure konkrete Suche auf:\s*/i,'Die verfügbaren Ortsdaten greifen wichtige Begriffe aus eurer Suche auf: ').replace(/^Priorisiert weniger offensichtliche Orte statt klassischer Top-Sehenswürdigkeiten$/i,'Der Ort gehört nach den verfügbaren Popularitätssignalen nicht zu den klassischen Massen-Touristen-Zielen und passt deshalb besser zu eurer Geheimtipp-Suche.');return /[.!?]$/.test(s)?s:`${s}.`}
function relevance(place,goalText='',categoryKey='',preferences={}){const intent=intentFor(goalText,categoryKey),types=(place?.types||[]).join(' '),hay=`${place?.name||''} ${place?.editorialSummary?.text||place?.editorialSummary||''} ${types}`.toLowerCase(),reasons=[];let score=0;if(intent.match?.test(hay)){score+=48;reasons.push(`Der Ort passt direkt zu eurem Wunsch nach ${intent.label}.`)}const tokens=String(goalText).toLowerCase().split(/[^a-zäöüß0-9]+/).filter(x=>x.length>3&&!['etwas','finden','kennt','jeder','tourist'].includes(x));const matched=tokens.filter(t=>hay.includes(t));if(matched.length){score+=Math.min(20,matched.length*6);reasons.push(`Die verfügbaren Ortsdaten greifen wichtige Begriffe aus eurer Suche auf: ${matched.slice(0,3).join(', ')}.`)}const sem=semanticSignals(goalText),spatial=spatialAssessment(place,sem.spatial);score+=spatial.scoreDelta;reasons.push(...spatial.reasons);if(sem.hidden){const reviews=reviewCount(place);if(!hiddenGemEligible(place)){score-=160}else if(reviews!=null){score+=reviews<500?42:reviews<1500?32:reviews<3000?20:8;reasons.push('Der Ort gehört nach den verfügbaren Popularitätssignalen nicht zu den klassischen Massen-Touristen-Zielen und passt deshalb besser zu eurer Geheimtipp-Suche.')}}if(sem.quiet&&/quiet|calm|ruhig|garden|park|courtyard|bibliothek|library|chapel|passage|square/.test(hay)){score+=14;reasons.push('Die Ortsbeschreibung enthält konkrete Hinweise auf eine ruhigere Atmosphäre.')}if(sem.view&&/view|panorama|rooftop|terrace|aussicht|tower|deck/.test(hay)){score+=16;reasons.push('Die verfügbaren Angaben nennen Aussicht, Panorama oder eine erhöhte Terrasse.')}if(sem.local&&/local|neighbou?rhood|quartier|artisan|independent|marché|market|passage/.test(hay)){score+=14;reasons.push('Die Ortsdaten enthalten Hinweise auf einen lokalen oder quartierbezogenen Charakter.')}if(sem.photo&&/view|architecture|historic|garden|street|passage|panorama|bridge|art/.test(hay)){score+=12;reasons.push('Der Ort bietet nach den verfügbaren Angaben interessante Motive für Fotos.')}const profile=profileSignals(preferences);const ev=evidence(place,goalText,categoryKey,preferences);reasons.push(...ev.sentences);if((categoryKey==='food'||intent.category==='food')&&(profile.vegetarian||profile.vegan)){if(ev.traits.vegetarian==='confirmed')score+=24;else if(ev.traits.vegetarian==='not_confirmed'||ev.traits.vegetarian==='conflict')score-=30;else score-=8;}return {score,reasons:[...new Set(reasons.map(naturalReason).filter(Boolean))],intent,evidence:ev,profile,spatial};}
function diagnostics(){return{version:VERSION,status:'ready',uiCategories:Object.keys(UI_CATEGORIES).length,intents:Object.keys(INTENTS),singleRegistry:true,strictHiddenGem:true,evidenceConflictResolution:true,verifiedDietaryEvidence:true,profileCanonical:true,multilingualSpatialIntent:true,spatialContradictionsRejected:true,openVocabularyEvidenceGate:true,providerCategoryEvidenceRequired:true,categoryEvidenceBeforeSubjectEvidence:true,accommodationNameFallback:false,nightlifeProviderTaxonomyGate:true,inventoryClaimsFromPlaceMetadata:false}}
window.LuviaGlobalPlaceContracts=Object.freeze({version:VERSION,categories:UI_CATEGORIES,intents:INTENTS,category,intentFor,evidenceContract,queryCascade,semanticSignals,spatialIntent,spatialAssessment,profileSignals,evidence,accepts,relevance,hiddenGemEligible,iconicOrMassTourism,hasProviderCategoryEvidence,diagnostics});
})();
