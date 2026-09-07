const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let source=fs.readFileSync('supabase/functions/luvia-intelligence/schemas/index.ts','utf8');
source=source
  .replace(/^type JsonSchema=.*?;\s*/s,'')
  .replace('const schemas:Record<string,JsonSchema>=','const schemas=')
  .replace('export function outputSchema(name:string)','function outputSchema(name)')
  .concat('\nglobalThis.tripItinerarySchema=outputSchema("trip_itinerary");');

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
const day=schema.properties.days.items;
assert.deepStrictEqual(Array.from(day.required),['date','label','theme','role','entries']);
assert(!Object.prototype.hasOwnProperty.call(day.properties,'required'),'day required list must not be nested inside properties');
const provider=fs.readFileSync('supabase/functions/luvia-intelligence/providers/openai.ts','utf8'),registry=fs.readFileSync('supabase/functions/luvia-intelligence/capabilities/registry.ts','utf8');
assert(provider.includes("code:'OPENAI_INCOMPLETE_OUTPUT'"),'Incomplete Responses output needs a distinct retryable error');
assert(provider.indexOf("response?.status==='incomplete'")<provider.indexOf('JSON.parse(raw)'),'Incomplete output must be rejected before JSON parsing');
assert.match(registry,/trip\.compose'.*maxOutputTokens:16000,reasoningEffort:'medium'/s,'Complete trips need enough structured-output budget without maximum reasoning latency');
assert.match(registry,/trip\.audit'.*maxOutputTokens:5000,reasoningEffort:'medium'/s,'The independent audit needs a bounded output budget');
assert.match(registry,/trip\.audit':\{id:'trip\.audit',tier:'default'/,'The audit must use Terra while Sol remains reserved for composition and targeted repair');

console.log('Trip itinerary Structured Output schema: OK');
