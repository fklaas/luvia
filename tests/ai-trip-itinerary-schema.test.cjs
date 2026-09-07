const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let source=fs.readFileSync('supabase/functions/luvia-intelligence/schemas/index.ts','utf8');
source=source
  .replace(/^type JsonSchema=.*?;\s*/s,'')
  .replace('const schemas:Record<string,JsonSchema>=','const schemas=')
  .replace('export function outputSchema(name:string)','function outputSchema(name)')
  .concat('\nglobalThis.tripItinerarySchema=outputSchema("trip_itinerary");globalThis.compactTripItinerarySchema=outputSchema("trip_itinerary_compact");');

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
const provider=fs.readFileSync('supabase/functions/luvia-intelligence/providers/openai.ts','utf8'),registry=fs.readFileSync('supabase/functions/luvia-intelligence/capabilities/registry.ts','utf8');
assert(provider.includes("code:'OPENAI_INCOMPLETE_OUTPUT'"),'Incomplete Responses output needs a distinct retryable error');
assert(provider.indexOf("response?.status==='incomplete'")<provider.indexOf('JSON.parse(raw)'),'Incomplete output must be rejected before JSON parsing');
assert.match(registry,/planning\.dialogue':\{id:'planning\.dialogue',tier:'fast'.*maxOutputTokens:6000,reasoningEffort:'low'/s,'Trip understanding starts on Luna with enough structured-output headroom');
assert.match(provider,/structured&&model!==candidates\.at\(-1\)/,'A malformed fast-model response must escalate to the default model');
assert.match(provider,/attempts\.push\(\{model,requestId,usage,latencyMs,success:false/,'Paid failed structured-output attempts must remain visible to cost telemetry');
assert.match(registry,/trip\.compose'.*schema:'trip_itinerary_compact'.*maxOutputTokens:12000,reasoningEffort:'low'/s,'Trip composition uses the compact semantic schema with bounded reasoning and output budget');
assert.match(registry,/trip\.audit'.*maxOutputTokens:5000,reasoningEffort:'low'/s,'The independent audit needs a bounded output and reasoning budget');
assert.match(registry,/trip\.audit':\{id:'trip\.audit',tier:'default'/,'The audit must use Terra while Sol remains reserved for composition and targeted repair');
assert.match(provider,/body\.reasoning=\{effort:args\.capability\.reasoningEffort\}/,'All tiers obey the bounded capability reasoning budget');

console.log('Trip itinerary Structured Output schema: OK');
