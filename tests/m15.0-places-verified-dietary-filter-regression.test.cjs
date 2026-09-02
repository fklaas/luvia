const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('core/places/global-place-contracts.js','utf8');
const finalUi=fs.readFileSync('core/places/places-final-foundation.js','utf8');
const discoveryAdapter=fs.readFileSync('app/adapters/places-discovery-adapter.js','utf8');
const categories=Object.freeze({
  food:Object.freeze({label:'Essen',includedTypes:Object.freeze(['restaurant','vegetarian_restaurant','vegan_restaurant','bistro','cafe']),excludedTypes:Object.freeze(['airport']),synonyms:Object.freeze(['Restaurant'])}),
  activities:Object.freeze({label:'Aktivitäten',includedTypes:Object.freeze(['tourist_attraction']),excludedTypes:Object.freeze([]),synonyms:Object.freeze([])}),
  culture:Object.freeze({label:'Kultur',includedTypes:Object.freeze(['movie_theater']),excludedTypes:Object.freeze([]),synonyms:Object.freeze([])})
});
const window={LuviaPreferenceSchema:{normalizePreferences:value=>value,summary:()=>[]}};
const context={window,LuviaPlacesDomainContractCoreV1:{categories:()=>categories}};
context.globalThis=context;
vm.runInContext(source,vm.createContext(context),{filename:'global-place-contracts.js'});

const contracts=window.LuviaGlobalPlaceContracts;
const verified={providerPlaceId:'google-verified',name:'Strandgenuss',primaryType:'bistro',types:['bistro','restaurant','food'],features:{servesVegetarianFood:true}};
const contradicted={...verified,providerPlaceId:'google-contradicted',features:{servesVegetarianFood:false}};
const unknown={...verified,providerPlaceId:'google-unknown',features:{}};
const explicitType={providerPlaceId:'google-explicit',name:'Grüne Küche',types:['vegetarian_restaurant','restaurant'],features:{}};
const genericDoner={providerPlaceId:'google-doner',name:'City Döner Grill',types:['kebab_shop','restaurant'],features:{servesVegetarianFood:true}};
const vegetarianDoner={providerPlaceId:'google-veggie-doner',name:'Veganer Döner',types:['vegetarian_restaurant','kebab_shop','restaurant'],features:{servesVegetarianFood:true}};

assert.equal(contracts.accepts(verified,'food','Vegetarisch essen',{}),true,'positive provider evidence must not require vegetarian wording in the place name');
assert.equal(contracts.accepts(contradicted,'food','Vegetarisch essen',{}),false,'negative provider evidence must remain a hard rejection');
assert.equal(contracts.accepts(unknown,'food','Vegetarisch essen',{}),false,'unknown dietary evidence must remain unverified');
assert.equal(contracts.accepts(explicitType,'food','Vegetarisch essen',{}),true,'an explicit provider type is verified dietary evidence');
assert.equal(contracts.accepts(genericDoner,'food','Vegetarisch essen',{}),false,'a meat-led primary offer must not become a vegetarian recommendation from one generic option flag');
assert.equal(contracts.accepts(vegetarianDoner,'food','Vegetarisch essen',{}),true,'an explicit vegetarian offer profile must remain eligible');
assert.equal(contracts.evidence(verified,'Vegetarisch essen','food',{}).traits.vegetarian,'confirmed');
assert.match(contracts.evidence(verified,'Vegetarisch essen','food',{}).sentences.join(' '),/ausdrücklich belegt/);
assert.equal(contracts.diagnostics().verifiedDietaryEvidence,true);
assert.match(finalUi,/const MAX_RESULTS=18;/,'Places must retain a meaningful ranked result set');
assert.match(finalUi,/const CANDIDATE_LIMIT=60;/,'Places must evaluate multiple query cascades instead of stopping at the first small result set');
assert.match(finalUi,/const INITIAL_VISIBLE_RESULTS=6;/,'the first screen must remain focused');
assert.match(finalUi,/data-show-more/,'the remaining verified Places must be progressively revealable');
assert.match(finalUi,/candidateLimit:CANDIDATE_LIMIT,limit:MAX_RESULTS/,'the owner request must pass both breadth limits explicitly');
assert.match(finalUi,/zeigt zuerst die sechs stärksten Treffer/,'the UI must explain progressive breadth accurately');
assert.doesNotMatch(finalUi,/höchstens fünf echte Treffer/,'the former five-result promise must be removed');
assert.match(discoveryAdapter,/candidateLimit=Math\.min\(60,Math\.max\(20,/,'candidate breadth must remain bounded');
assert.match(discoveryAdapter,/minimumQueryVariants=Math\.min\(queryLimit,Math\.max\(1,Number\(diversity\.minimumQueryVariants\|\|3\)\)\)/,'deep discovery must sample at least three semantic provider queries before settling');
assert.match(discoveryAdapter,/diversityTarget=Math\.min\(candidateLimit,Math\.max\(requestedLimit\*3,requestedLimit\+6\)\)/,'candidate breadth must exceed the visible card count so repeated top results can be rotated out');
assert.match(discoveryAdapter,/queryIndex\+1>=minimumQueryVariants&&hasEnoughCandidates\(\)/,'the provider cascade may settle only after both semantic breadth and the diversity pool are satisfied');
assert.match(discoveryAdapter,/catch\(error\)\{return\{places:\[\],error,attempt:\{query,strictDestination,ok:false/,'one failing provider query must be represented as an empty failed attempt instead of rejecting the complete provider batch');
assert.match(discoveryAdapter,/Promise\.all\(selectedQueries\.map\(query=>providerRequest\(query,true\)\)\)/,'the explicit parallel fast path must keep provider variants failure-isolated');
assert.match(discoveryAdapter,/plan\.queries\.slice\(0,queryLimit\)/,'query expansion must remain latency-bounded');

console.log('LUVIA_M15_0_PLACES_VERIFIED_DIETARY_FILTER_REGRESSION_OK');
