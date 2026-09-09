const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let source=fs.readFileSync('supabase/functions/luvia-intelligence/schemas/index.ts','utf8');
source=source
  .replace(/^type JsonSchema=.*?;\s*/s,'')
  .replace('const schemas:Record<string,JsonSchema>=','const schemas=')
  .replace('export function outputSchema(name:string)','function outputSchema(name)')
  .concat('\nglobalThis.tripItinerarySchema=outputSchema("trip_itinerary");globalThis.compactTripItinerarySchema=outputSchema("trip_itinerary_compact");globalThis.tripDayRepairSchema=outputSchema("trip_day_repair");');

const context={};
vm.createContext(context);
vm.runInContext(source,context);

function validateSchemaNode(schema,path){
  assert(schema===true||schema===false||schema&&typeof schema==='object'&&!Array.isArray(schema),`${path} must be a JSON Schema object or boolean`);
  if(typeof schema==='boolean')return;
  if(schema.properties){
    assert(schema.properties&&typeof schema.properties==='object'&&!Array.isArray(schema.properties),`${path}.properties must be an object`);
    for(const [name,propertySchema] of Object.entries(schema.properties))validateSchemaNode(propertySchema,`${path}.properties.${name}`);
    if(schema.type==='object'){
      assert.strictEqual(schema.additionalProperties,false,`${path} must reject unspecified properties in strict output mode`);
      assert.deepStrictEqual([...schema.required].sort(),Object.keys(schema.properties).sort(),`${path}.required must contain every declared property exactly once`);
    }
  }
  if(Object.prototype.hasOwnProperty.call(schema,'items'))validateSchemaNode(schema.items,`${path}.items`);
}

const schema=context.tripItinerarySchema;
validateSchemaNode(schema,'trip_itinerary');
const compact=context.compactTripItinerarySchema;
validateSchemaNode(compact,'trip_itinerary_compact');
const repair=context.tripDayRepairSchema;
validateSchemaNode(repair,'trip_day_repair');
const day=schema.properties.days.items;
assert.deepStrictEqual(Array.from(day.required),['date','label','theme','role','balance','freeTime','entries']);
assert(!Object.prototype.hasOwnProperty.call(day.properties,'required'),'day required list must not be nested inside properties');
assert.deepStrictEqual(Array.from(schema.required),['title','summary','travelPromise','days','uncertaintyMap','bookingOrder','neighborhoodRecommendation','alternatives','backupOptions','uncoveredRequirements','warnings','confidence']);
assert.deepStrictEqual(Array.from(schema.properties.travelPromise.required),['summary','commitments','deliberateFreeTime','exclusions']);
assert.deepStrictEqual(Array.from(schema.properties.uncertaintyMap.items.required),['subject','kind','state','reason','source','observedAt','expiresAt','affectedDayDates','providerPlaceIds','evidenceRefs']);
assert.deepStrictEqual(Array.from(compact.properties.days.items.required),['date','theme','balance','freeTime','entries']);
assert.deepStrictEqual(Array.from(compact.properties.days.items.properties.entries.items.required),['providerPlaceId','time','durationMinutes','reason']);
assert(!Object.prototype.hasOwnProperty.call(compact.properties.days.items.properties,'role'),'The model must not repeat the deterministic day role');
assert(!Object.prototype.hasOwnProperty.call(compact.properties.days.items.properties.entries.items.properties,'category'),'The model must not repeat the provider-owned Place category');
assert.deepStrictEqual(Array.from(repair.required),['days','reasoningSummary','confidence']);
assert.strictEqual(repair.properties.days.minItems,1,'A repair response must contain its requested day');
assert.strictEqual(repair.properties.days.maxItems,1,'A repair call must return exactly one day');
assert.deepStrictEqual(Array.from(repair.properties.days.items.required),['date','theme','balance','freeTime','entries']);
const domainSource=fs.readFileSync('core/intelligence/intelligence-domain-contract-core.js','utf8');
assert.match(domainSource,/case'trip_day_repair':output=tripDayRepair\(value\)/,'The browser Intelligence validator must preserve structured day-repair output instead of reducing it to a generic answer');
assert.match(domainSource,/function tripDayRepair\(value=\{\}\).*days:\(Array\.isArray\(value\.days\)\?value\.days:\[\]\)\.slice\(0,1\)/s,'The day-repair validator must retain exactly one replacement day');
const adapter=fs.readFileSync('core/platform/intelligence-contract-adapter.js','utf8');
assert(!/source\.role&&source\.role!==expected\.role/.test(adapter),'The compact model normalization must not override the contract-owned arrival or departure role');
assert.match(adapter,/certainty='modelled'/,'AI placement decisions remain explicitly modelled after compact output normalization');
const provider=fs.readFileSync('supabase/functions/luvia-intelligence/providers/openai.ts','utf8'),registry=fs.readFileSync('supabase/functions/luvia-intelligence/capabilities/registry.ts','utf8');
assert(provider.includes("code:'OPENAI_INCOMPLETE_OUTPUT'"),'Incomplete Responses output needs a distinct retryable error');
assert(provider.indexOf("response?.status==='incomplete'")<provider.indexOf('JSON.parse(raw)'),'Incomplete output must be rejected before JSON parsing');
assert.match(registry,/planning\.dialogue':\{id:'planning\.dialogue',tier:'fast'.*maxOutputTokens:2800,reasoningEffort:'none'/s,'Trip understanding uses Luna without a separate reasoning budget and with compact structured-output headroom');
assert.match(provider,/planning\.dialogue'\)body\.text\.verbosity='low'/,'The latency-critical trip understanding response requests concise structured strings');
assert.match(registry,/discovery\.plan':\{id:'discovery\.plan',tier:'fast'.*maxOutputTokens:1200,reasoningEffort:'low'/s,'Destination inspiration uses the fast low-reasoning lane instead of spending the complete-trip model budget');
assert.match(provider,/structured&&model!==candidates\.at\(-1\)/,'A malformed fast-model response must escalate to the default model');
assert.match(provider,/attempts\.push\(\{model,requestId,usage,latencyMs,success:false/,'Paid failed structured-output attempts must remain visible to cost telemetry');
assert.match(registry,/trip\.compose'.*schema:'trip_itinerary_compact'.*maxOutputTokens:5200,reasoningEffort:'none'/s,'The first complete-trip draft uses the compact schema without extra reasoning tokens and with a 5,200-token ceiling');
assert.match(registry,/trip\.compose-day-repair'.*schema:'trip_day_repair'.*maxOutputTokens:4500,reasoningEffort:'low'/s,'A failed day receives a smaller replacement output instead of regenerating the whole trip');
assert.match(adapter,/purpose:'repair-failed-trip-day'/,'Dated plan blockers must enter the one-day repair lane');
assert.match(adapter,/for\(const repairPolicy of repairPolicies\)/,'Several failed days must be repaired through isolated, resumable day jobs');
assert.match(registry,/trip\.audit'.*maxOutputTokens:3500,reasoningEffort:'low'/s,'The independent audit needs a bounded output and reasoning budget');
assert.match(registry,/trip\.audit':\{id:'trip\.audit',tier:'default'/,'The audit must use Terra while Sol remains reserved for composition and targeted repair');
assert.match(provider,/body\.reasoning=\{effort:args\.capability\.reasoningEffort\}/,'All tiers obey the bounded capability reasoning budget');

console.log('Trip itinerary Structured Output schema: OK');
