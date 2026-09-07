const ENDPOINT='https://openholidaysapi.org';
const KMK_CALENDAR='https://www.kmk.org/service/ferienregelung/ferienkalender.html';
const CACHE_TTL_MS=6*60*60*1000;
const cache=new Map();

const DE_SUBDIVISIONS=Object.freeze([
  ['DE-BW','Baden-Württemberg',['baden württemberg','baden-wuerttemberg','baden wurttemberg','bw']],
  ['DE-BY','Bayern',['bavaria','by']],
  ['DE-BE','Berlin',['be']],
  ['DE-BB','Brandenburg',['bb']],
  ['DE-HB','Bremen',['hb']],
  ['DE-HH','Hamburg',['hh']],
  ['DE-HE','Hessen',['hesse','he']],
  ['DE-MV','Mecklenburg-Vorpommern',['mecklenburg vorpommern','mecklenburg-vorpommern','mv']],
  ['DE-NI','Niedersachsen',['lower saxony','ni']],
  ['DE-NW','Nordrhein-Westfalen',['nordrhein westfalen','north rhine-westphalia','nrw','nw']],
  ['DE-RP','Rheinland-Pfalz',['rheinland pfalz','rp']],
  ['DE-SL','Saarland',['sl']],
  ['DE-SN','Sachsen',['saxony','sn']],
  ['DE-ST','Sachsen-Anhalt',['sachsen anhalt','saxony-anhalt','st']],
  ['DE-SH','Schleswig-Holstein',['schleswig holstein','sh']],
  ['DE-TH','Thüringen',['thueringen','thuringia','th']]
]);

function clean(value,limit=180){const result=String(value??'').trim();return limit?result.slice(0,limit):result}
function normalize(value){return clean(value).toLocaleLowerCase('de-DE').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\b(?:deutschland|germany)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function date(value){const text=clean(value,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return'';const parsed=new Date(`${text}T12:00:00Z`);return Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==text?'':text}
function error(code,message,status=400){return Object.assign(new Error(message),{code,status})}
function languageText(value,language='DE'){const rows=Array.isArray(value)?value:[];return clean(rows.find(item=>clean(item?.language).toUpperCase()===language)?.text||rows[0]?.text,240)}

export function resolveHolidayRegion(input={}){
  const requestedCountry=clean(input.countryIsoCode||input.countryCode,2).toUpperCase(),explicit=clean(input.subdivisionCode,16).toUpperCase(),requestedRegion=clean(input.schoolRegion||input.region,160);
  if(explicit){if(!/^[A-Z]{2}-[A-Z0-9]{1,8}$/.test(explicit))throw error('CALENDAR_SUBDIVISION_INVALID','Die Schulregion besitzt keinen gültigen ISO-Untergliederungscode.');const country=explicit.slice(0,2);if(requestedCountry&&requestedCountry!==country)throw error('CALENDAR_REGION_COUNTRY_MISMATCH','Land und Schulregion widersprechen sich.');const known=DE_SUBDIVISIONS.find(item=>item[0]===explicit);return Object.freeze({countryIsoCode:country,subdivisionCode:explicit,name:known?.[1]||requestedRegion||explicit});}
  const needle=normalize(requestedRegion),known=DE_SUBDIVISIONS.find(([,name,aliases])=>[name,...aliases].some(value=>normalize(value)===needle));
  if(known&&(!requestedCountry||requestedCountry==='DE'))return Object.freeze({countryIsoCode:'DE',subdivisionCode:known[0],name:known[1]});
  if(!requestedRegion)throw error('CALENDAR_REGION_REQUIRED','Für Schulferien fehlt die zuständige Schulregion.');
  throw error('CALENDAR_REGION_UNSUPPORTED',`Für ${requestedRegion} ist noch keine eindeutige Schulregions-Zuordnung hinterlegt.`);
}

function sourceFor(kind,region,requestUrl){const school=kind==='school-holiday',germanSchool=school&&region.countryIsoCode==='DE';return Object.freeze({provider:'OpenHolidays API',providerUrl:'https://www.openholidaysapi.org/',requestUrl,authority:germanSchool?'Kultusministerkonferenz':school?'Zuständige Schulbehörde':'Zuständige Feiertagsbehörde',authorityUrl:germanSchool?KMK_CALENDAR:'',method:'machine-readable-calendar'});}

export function normalizeHolidayRecords(rows,{kind,region,languageIsoCode='DE',requestUrl,retrievedAt}={}){
  const source=sourceFor(kind,region,requestUrl),seen=new Set();
  return (Array.isArray(rows)?rows:[]).filter(item=>!(item?.tags||[]).some(tag=>clean(tag).toLowerCase()==='exception')).map(item=>{
    const startDate=date(item?.startDate),endDate=date(item?.endDate),subdivisions=(item?.subdivisions||[]).map(value=>clean(value?.code,16).toUpperCase()).filter(Boolean);
    const nationwide=item?.nationwide===true;if(!startDate||!endDate||endDate<startDate||(!nationwide&&!subdivisions.includes(region.subdivisionCode)))return null;
    const providerId=clean(item?.id,100),id=`openholidays:${kind}:${providerId||region.subdivisionCode+':'+startDate+':'+endDate}`;
    if(seen.has(id))return null;seen.add(id);
    return Object.freeze({id,kind,region:region.name,countryIsoCode:region.countryIsoCode,subdivisionCode:region.subdivisionCode,name:languageText(item?.name,languageIsoCode)|| (kind==='school-holiday'?'Schulferien':'Feiertag'),startDate,endDate,nationwide,verified:true,status:'verified',source:source.provider,sourceRef:providerId||id,sourceUrl:source.requestUrl,providerUrl:source.providerUrl,authority:source.authority,authorityUrl:source.authorityUrl,retrievedAt,regionalScope:clean(item?.regionalScope,40),temporalScope:clean(item?.temporalScope,40),comment:languageText(item?.comment,languageIsoCode),scopeException:false});
  }).filter(Boolean).sort((left,right)=>left.startDate.localeCompare(right.startDate)||left.endDate.localeCompare(right.endDate));
}

async function responseRows(fetcher,url,signal){
  const response=await fetcher(url,{headers:{accept:'application/json'},signal});
  if(!response?.ok)throw error('CALENDAR_PROVIDER_FAILED',`Der Kalenderdienst antwortet mit HTTP ${Number(response?.status)||0}.`,502);
  const rows=await response.json();if(!Array.isArray(rows))throw error('CALENDAR_PROVIDER_PAYLOAD_INVALID','Der Kalenderdienst hat keine gültige Terminliste geliefert.',502);return rows;
}

export async function readTravelCalendarEvidence(input={},options={}){
  const region=resolveHolidayRegion(input),validFrom=date(input.validFrom),validTo=date(input.validTo),languageIsoCode=clean(input.languageIsoCode||'DE',2).toUpperCase();
  if(!validFrom||!validTo||validTo<validFrom)throw error('CALENDAR_RANGE_INVALID','Für den Kalenderabruf fehlt ein gültiger Zeitraum.');
  const duration=(Date.parse(`${validTo}T12:00:00Z`)-Date.parse(`${validFrom}T12:00:00Z`))/86400000;if(duration>1098)throw error('CALENDAR_RANGE_TOO_LARGE','Kalenderdaten können höchstens für drei Jahre gemeinsam geprüft werden.');
  const key=[region.subdivisionCode,validFrom,validTo,languageIsoCode].join(':');const cached=cache.get(key);if(options.force!==true&&cached&&cached.expiresAt>Date.now())return cached.value;
  const params=new URLSearchParams({countryIsoCode:region.countryIsoCode,subdivisionCode:region.subdivisionCode,languageIsoCode,validFrom,validTo}),schoolUrl=`${ENDPOINT}/SchoolHolidays?${params}`,publicUrl=`${ENDPOINT}/PublicHolidays?${params}`,fetcher=options.fetcher||fetch,retrievedAt=clean(options.retrievedAt)||new Date().toISOString(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.max(1000,Math.min(15000,Number(options.timeoutMs)||8000)));
  try{
    const [schoolResult,publicResult]=await Promise.allSettled([responseRows(fetcher,schoolUrl,controller.signal),responseRows(fetcher,publicUrl,controller.signal)]);
    if(schoolResult.status!=='fulfilled')throw schoolResult.reason;
    const evidence=[...normalizeHolidayRecords(schoolResult.value,{kind:'school-holiday',region,languageIsoCode,requestUrl:schoolUrl,retrievedAt}),...(publicResult.status==='fulfilled'?normalizeHolidayRecords(publicResult.value,{kind:'public-holiday',region,languageIsoCode,requestUrl:publicUrl,retrievedAt}):[])],warnings=publicResult.status==='rejected'?['Gesetzliche Feiertage konnten zusätzlich zu den Schulferien gerade nicht geladen werden.']:[];
    if(!evidence.some(item=>item.kind==='school-holiday'))throw error('CALENDAR_SCHOOL_HOLIDAYS_EMPTY',`Für ${region.name} wurden im angefragten Zeitraum keine bestätigten Schulferien geliefert.`,404);
    const value=Object.freeze({owner:'intelligence',contractId:'intelligence.v1',kind:'travel-calendar-evidence',status:'verified',region,range:{validFrom,validTo},evidence:Object.freeze(evidence),sources:Object.freeze([...new Map(evidence.map(item=>[item.sourceUrl,{provider:item.source,providerUrl:item.providerUrl,requestUrl:item.sourceUrl,authority:item.authority,authorityUrl:item.authorityUrl,retrievedAt:item.retrievedAt}])).values()]),warnings:Object.freeze(warnings),retrievedAt});
    if(options.fetcher==null)cache.set(key,{expiresAt:Date.now()+CACHE_TTL_MS,value});return value;
  }catch(cause){if(cause?.name==='AbortError')throw error('CALENDAR_PROVIDER_TIMEOUT','Der Kalenderdienst hat nicht rechtzeitig geantwortet.',504);throw cause;}finally{clearTimeout(timer)}
}
