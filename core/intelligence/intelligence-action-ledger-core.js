var LuviaIntelligenceActionLedgerCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.action-ledger.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const STATUS=Object.freeze({
  PROPOSED:'proposed',
  CONFIRMATION_REQUIRED:'confirmation_required',
  CONFIRMED:'confirmed',
  RUNNING:'running',
  SUCCEEDED:'succeeded',
  FAILED:'failed',
  OUTCOME_UNKNOWN:'outcome_unknown',
  CANCELLED:'cancelled',
  COMPENSATING:'compensating',
  COMPENSATED:'compensated'
});
const TERMINAL=new Set([STATUS.SUCCEEDED,STATUS.CANCELLED,STATUS.COMPENSATED]);
const TRANSITIONS=Object.freeze({
  [STATUS.PROPOSED]:Object.freeze([STATUS.CONFIRMATION_REQUIRED,STATUS.CONFIRMED,STATUS.RUNNING,STATUS.CANCELLED]),
  [STATUS.CONFIRMATION_REQUIRED]:Object.freeze([STATUS.CONFIRMED,STATUS.CANCELLED]),
  [STATUS.CONFIRMED]:Object.freeze([STATUS.RUNNING,STATUS.CANCELLED]),
  [STATUS.RUNNING]:Object.freeze([STATUS.SUCCEEDED,STATUS.FAILED,STATUS.OUTCOME_UNKNOWN]),
  [STATUS.FAILED]:Object.freeze([STATUS.RUNNING,STATUS.CANCELLED,STATUS.COMPENSATING]),
  [STATUS.OUTCOME_UNKNOWN]:Object.freeze([STATUS.CANCELLED,STATUS.COMPENSATING]),
  [STATUS.SUCCEEDED]:Object.freeze([STATUS.COMPENSATING]),
  [STATUS.COMPENSATING]:Object.freeze([STATUS.COMPENSATED,STATUS.FAILED,STATUS.OUTCOME_UNKNOWN]),
  [STATUS.CANCELLED]:Object.freeze([]),
  [STATUS.COMPENSATED]:Object.freeze([])
});

function text(value,fallback=''){return String(value??fallback).trim()}
function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function stable(value){
  if(value==null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;
  return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}
function digest(value){
  const source=stable(value);let hash=2166136261;
  for(let index=0;index<source.length;index++){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619)}
  return`fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`;
}
function error(code,message,extra={}){const value=new Error(message);value.code=code;Object.assign(value,extra);return value}
function transitionAllowed(from,to){return Boolean(TRANSITIONS[from]?.includes(to))}

function createActionLedger({clock=()=>new Date().toISOString(),idFactory=null,maxEntries=200}={}){
  const records=new Map();
  const idempotency=new Map();
  let sequence=0;
  const nextId=()=>text(idFactory?.(++sequence))||`action-${sequence}`;
  const trim=()=>{
    while(records.size>=Math.max(20,Number(maxEntries)||200)){
      const removable=[...records.values()].find(record=>TERMINAL.has(record.status));
      if(!removable)throw error('INTELLIGENCE_ACTION_LEDGER_CAPACITY','Action Ledger has no removable terminal entry.');
      records.delete(removable.id);
      if(removable.idempotencyKey)idempotency.delete(removable.idempotencyKey);
    }
  };
  const snapshot=record=>record?immutable(clone(record)):null;
  const requireRecord=id=>{
    const record=records.get(text(id));
    if(!record)throw error('INTELLIGENCE_ACTION_LEDGER_NOT_FOUND','Action Ledger entry was not found.',{ledgerId:text(id)});
    return record;
  };
  const append=(record,status,detail={})=>{
    if(!transitionAllowed(record.status,status))throw error('INTELLIGENCE_ACTION_LEDGER_TRANSITION_INVALID',`Invalid Action Ledger transition ${record.status} -> ${status}.`,{ledgerId:record.id,from:record.status,to:status});
    const at=clock();
    record.status=status;
    record.updatedAt=at;
    record.attempts=status===STATUS.RUNNING?record.attempts+1:record.attempts;
    record.history.push(immutable({status,at,code:text(detail.code)||null,retryable:typeof detail.retryable==='boolean'?detail.retryable:null,outcomeUnknown:detail.outcomeUnknown===true,receiptDigest:detail.receipt===undefined?null:digest(detail.receipt)}));
    return snapshot(record);
  };

  function create(input={}){
    const actionId=text(input.actionId),idempotencyKey=text(input.idempotencyKey);
    if(!actionId)throw error('INTELLIGENCE_ACTION_LEDGER_ACTION_REQUIRED','Action id is required.');
    if(!idempotencyKey)throw error('INTELLIGENCE_ACTION_LEDGER_IDEMPOTENCY_REQUIRED','Idempotency key is required.');
    const existingId=idempotency.get(idempotencyKey);
    if(existingId)return snapshot(records.get(existingId));
    trim();
    const at=clock(),id=nextId();
    const record={
      id,actionId,owner:text(input.owner),ownerContract:text(input.ownerContract),effect:text(input.effect),risk:text(input.risk),confirmation:text(input.confirmation),
      reversible:input.reversible===true,idempotencyKey,correlationId:text(input.correlationId)||null,payloadDigest:digest(input.payload||{}),referenceDigest:digest(input.reference||{}),
      status:STATUS.PROPOSED,attempts:0,createdAt:at,updatedAt:at,history:[immutable({status:STATUS.PROPOSED,at,code:null,retryable:null,outcomeUnknown:false,receiptDigest:null})]
    };
    records.set(id,record);idempotency.set(idempotencyKey,id);return snapshot(record);
  }
  function requireConfirmation(id){const record=requireRecord(id);return record.status===STATUS.CONFIRMATION_REQUIRED?snapshot(record):append(record,STATUS.CONFIRMATION_REQUIRED)}
  function confirm(id){const record=requireRecord(id);return record.status===STATUS.CONFIRMED?snapshot(record):append(record,STATUS.CONFIRMED)}
  function begin(id){
    const record=requireRecord(id);
    if(record.status===STATUS.RUNNING||TERMINAL.has(record.status))return snapshot(record);
    if(record.status===STATUS.CONFIRMATION_REQUIRED)throw error('INTELLIGENCE_ACTION_LEDGER_CONFIRMATION_REQUIRED','Action must be confirmed before execution.',{ledgerId:record.id});
    if(record.status===STATUS.OUTCOME_UNKNOWN)throw error('INTELLIGENCE_ACTION_LEDGER_OUTCOME_UNKNOWN','Action outcome requires owner reconciliation before retry.',{ledgerId:record.id});
    return append(record,STATUS.RUNNING);
  }
  function succeed(id,receipt={}){const record=requireRecord(id);return append(record,STATUS.SUCCEEDED,{receipt})}
  function fail(id,{code='INTELLIGENCE_ACTION_FAILED',retryable=true,outcomeUnknown=false,receipt=null}={}){
    const record=requireRecord(id),status=outcomeUnknown?STATUS.OUTCOME_UNKNOWN:STATUS.FAILED;
    return append(record,status,{code,retryable:outcomeUnknown?false:retryable,outcomeUnknown,receipt});
  }
  function cancel(id){const record=requireRecord(id);return TERMINAL.has(record.status)?snapshot(record):append(record,STATUS.CANCELLED)}
  function startCompensation(id){return append(requireRecord(id),STATUS.COMPENSATING)}
  function finishCompensation(id,receipt={}){return append(requireRecord(id),STATUS.COMPENSATED,{receipt})}
  function get(id){return snapshot(records.get(text(id)))}
  function findByIdempotency(key){const id=idempotency.get(text(key));return id?get(id):null}
  function list({actionId=null,status=null}={}){return immutable([...records.values()].filter(record=>(!actionId||record.actionId===actionId)&&(!status||record.status===status)).map(snapshot))}
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,count:records.size,byStatus:Object.fromEntries(Object.values(STATUS).map(status=>[status,[...records.values()].filter(record=>record.status===status).length])),storesForeignDomainTruth:false,storesRawPayload:false})}

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,status:STATUS,create,requireConfirmation,confirm,begin,succeed,fail,cancel,startCompensation,finishCompensation,get,findByIdempotency,list,diagnostics});
}

function policySnapshot(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,statuses:STATUS,transitions:TRANSITIONS,terminal:[...TERMINAL],payloadStorage:'digest-only',foreignDomainTruth:false,directForeignMutation:false,unknownOutcomeRetry:'blocked-until-owner-reconciliation'});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,status:STATUS,transitions:TRANSITIONS,immutable,digest,transitionAllowed,createActionLedger,policySnapshot});
})();
