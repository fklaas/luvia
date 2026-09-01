var LuviaHumanAIActionLifecycleCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.human-ai-action-lifecycle.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const MODES=Object.freeze({READ_ONLY:'READ_ONLY',OPEN_ONLY:'OPEN_ONLY',DRAFT_ONLY:'DRAFT_ONLY',PRESENTATION_ONLY:'PRESENTATION_ONLY',PERMISSION_REQUEST:'PERMISSION_REQUEST',EXTERNAL_HANDOFF:'EXTERNAL_HANDOFF',MUTATION:'MUTATION',CONTROL_MUTATION:'CONTROL_MUTATION'});
const TERMINAL=new Set(['COMPLETED','CANCELLED','COMPENSATED']);
const text=value=>String(value??'').trim();
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
function immutable(value){if(value&&typeof value==='object'){Object.values(value).forEach(immutable);Object.freeze(value)}return value}
function lifecycleError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}
function actionId(action){return text(action?.id||action?.actionId)}
function modeFor(action={}){
  if(action?.lifecycle?.stateChanging===true)return action?.owner?.contract&&action?.owner?.method?MODES.MUTATION:MODES.CONTROL_MUTATION;
  const effect=text(action.effect).toUpperCase();
  if(effect==='READ')return MODES.READ_ONLY;if(effect==='NAVIGATION')return MODES.OPEN_ONLY;if(effect==='DRAFT')return MODES.DRAFT_ONLY;
  if(effect==='PERMISSION')return MODES.PERMISSION_REQUEST;if(effect==='EXTERNAL')return MODES.EXTERNAL_HANDOFF;
  return MODES.PRESENTATION_ONLY;
}
function compileLifecycle(action={}){
  const id=actionId(action);if(!id)throw new TypeError('Human-AI lifecycle requires an action id.');
  const mode=modeFor(action),mutation=mode===MODES.MUTATION||mode===MODES.CONTROL_MUTATION,lifecycle=action.lifecycle||{},supportsUndo=mutation&&lifecycle.reversible===true&&Boolean(text(lifecycle.compensationActionId));
  const stages=mutation?(mode===MODES.CONTROL_MUTATION?['INPUT_VALIDATION','AUTHORITY_GATE','PREVIEW','EXPLICIT_CONFIRMATION','IDEMPOTENCY','CONTROL_COMMAND','CONTROL_RECEIPT','CONTROL_STATE_READBACK','SUCCESS_OR_RECOVERY']:['INPUT_VALIDATION','AUTHORITY_GATE','PREVIEW','EXPLICIT_CONFIRMATION','IDEMPOTENCY','OWNER_COMMAND','OWNER_RECEIPT','READBACK_OR_RECONCILIATION','SUCCESS_OR_RECOVERY']):
    mode===MODES.READ_ONLY?['AUTHORITY_GATE','OWNER_READ','RESULT_OR_EMPTY','RETRY_OR_REFINE']:
    mode===MODES.DRAFT_ONLY?['AUTHORITY_GATE','INPUT_VALIDATION','DRAFT_UPDATE','DISCARD_OR_COMMIT_SEPARATELY']:
    mode===MODES.PERMISSION_REQUEST?['PURPOSE_PREVIEW','DIRECT_USER_GESTURE','PLATFORM_PERMISSION_RESULT']:
    mode===MODES.PRESENTATION_ONLY?['PRESENTATION','DISMISS']:['AUTHORITY_GATE','DIRECT_USER_GESTURE','OWNER_OPEN','OPENED_OR_FAILED'];
  if(supportsUndo)stages.push('UNDO_PREVIEW','UNDO_CONFIRMATION','OWNER_COMPENSATION','COMPENSATION_RECEIPT');
  return immutable({actionId:id,label:text(action.label)||id,mode,effect:text(action.effect).toUpperCase(),risk:text(action.risk).toUpperCase(),stateChanging:mutation,
    owner:{contract:text(action?.owner?.contract)||null,method:text(action?.owner?.method)||null,bindingStatus:text(action?.owner?.bindingStatus)||null},
    preview:{required:mutation,title:`${text(action.label)||'Änderung'} prüfen`,consequence:text(action.note||action.consequence||lifecycle.confirmationDescription)||'Die Folgen werden vor der Bestätigung angezeigt.'},
    confirmation:{required:mutation,separateVisibleControl:mutation,naturalLanguageAccepted:false,policy:mutation?'EXPLICIT':text(lifecycle.confirmationPolicy)||'NEVER'},
    idempotency:{required:mutation,policy:mutation?'REQUIRED':text(lifecycle.idempotency)||'NONE'},receipt:{required:mutation,ownerAttributed:mode===MODES.MUTATION,controlAttributed:mode===MODES.CONTROL_MUTATION},
    readback:{required:mutation,policy:mode===MODES.CONTROL_MUTATION?'CONTROL_STATE_READBACK':mutation&&(text(action.effect).toUpperCase()==='EXTERNAL')?'RECONCILE_PROVIDER_THEN_OWNER_READBACK':mutation?'OWNER_READBACK':'NONE'},
    recovery:{unknownExternalOutcome:text(action.effect).toUpperCase()==='EXTERNAL'?'RECONCILE_BEFORE_RETRY':'OWNER_GUIDED',blindRetry:false,description:text(lifecycle.recoveryDescription)||'Sicheren Owner-Status prüfen und verständlich fortsetzen.'},
    undo:{supported:supportsUndo,requiresNewPreview:supportsUndo,requiresSeparateConfirmation:supportsUndo,compensationActionId:supportsUndo?text(lifecycle.compensationActionId):null},
    stages,naturalLanguageConfirmsMutation:false,ownerExecution:false
  });
}
function initialStatus(mode,authorityDecision){
  if(text(authorityDecision)!=='ALLOW')return'AUTHORITY_BLOCKED';
  if(mode===MODES.MUTATION||mode===MODES.CONTROL_MUTATION)return'PREVIEW_REQUIRED';
  if(mode===MODES.READ_ONLY)return'OWNER_READ_READY';if(mode===MODES.DRAFT_ONLY)return'DRAFT_READY';
  if(mode===MODES.PERMISSION_REQUEST)return'PURPOSE_PREVIEW_REQUIRED';if(mode===MODES.PRESENTATION_ONLY)return'PRESENTATION_READY';return'USER_GESTURE_REQUIRED';
}
function createInstance(input={}){
  if(Object.prototype.hasOwnProperty.call(input,'input')||Object.prototype.hasOwnProperty.call(input,'payload'))throw lifecycleError('LIFECYCLE_RAW_PAYLOAD_FORBIDDEN','Store only an input reference and digest in the lifecycle.');
  const definition=input.definition?immutable(clone(input.definition)):compileLifecycle(input.action||{}),instanceId=text(input.instanceId)||`${definition.actionId}:lifecycle`,authorityDecision=text(input.authorityDecision)||'BLOCKED';
  return immutable({contractId:CONTRACT_ID,version:VERSION,instanceId,actionId:definition.actionId,status:initialStatus(definition.mode,authorityDecision),terminal:false,authorityDecision,inputRef:text(input.inputRef)||null,inputDigest:text(input.inputDigest)||null,idempotencyKey:null,previewRef:null,confirmationRef:null,ownerInvocationRef:null,receipt:null,readbackRef:null,reconciliationRef:null,undoPreviewRef:null,compensationReceipt:null,definition:clone(definition),events:[]});
}
function requireStatus(instance,allowed,eventType){if(!allowed.includes(instance.status))throw lifecycleError('LIFECYCLE_TRANSITION_FORBIDDEN',`${eventType} is not allowed from ${instance.status}.`,{status:instance.status,eventType})}
function requireVisibleConfirmation(event,expectedPreviewRef){if(event.userGesture!==true||text(event.source)!=='VISIBLE_CONTROL'||!text(event.confirmationRef)||text(event.previewRef)!==text(expectedPreviewRef))throw lifecycleError('LIFECYCLE_VISIBLE_CONFIRMATION_REQUIRED','Confirmation requires the visible control for the exact preview.');}
function safeEvent(event,status){return{type:text(event.type),status,ref:text(event.ref||event.receiptId||event.readbackRef||event.reconciliationRef||event.confirmationRef)||null}}
function transition(current={},event={}){
  const instance=clone(current),type=text(event.type).toUpperCase();if(!instance.actionId||!instance.definition)throw lifecycleError('LIFECYCLE_INSTANCE_INVALID','Lifecycle instance is invalid.');if(!type)throw lifecycleError('LIFECYCLE_EVENT_REQUIRED','Lifecycle event type is required.');if(instance.terminal&&type!=='REQUEST_UNDO')throw lifecycleError('LIFECYCLE_TERMINAL','The lifecycle is already terminal.');
  const mutation=instance.definition.stateChanging===true;
  if(type==='SHOW_PREVIEW'){requireStatus(instance,['PREVIEW_REQUIRED'],'SHOW_PREVIEW');if(!text(event.previewRef))throw lifecycleError('LIFECYCLE_PREVIEW_REF_REQUIRED','A bounded preview reference is required.');instance.previewRef=text(event.previewRef);instance.status='CONFIRMATION_REQUIRED';}
  else if(type==='CONFIRM'){requireStatus(instance,['CONFIRMATION_REQUIRED'],'CONFIRM');requireVisibleConfirmation(event,instance.previewRef);instance.confirmationRef=text(event.confirmationRef);instance.status='IDEMPOTENCY_REQUIRED';}
  else if(type==='SET_IDEMPOTENCY'){requireStatus(instance,['IDEMPOTENCY_REQUIRED'],'SET_IDEMPOTENCY');if(!text(event.idempotencyKey))throw lifecycleError('LIFECYCLE_IDEMPOTENCY_REQUIRED','A non-empty idempotency key is required.');instance.idempotencyKey=text(event.idempotencyKey);instance.status='OWNER_COMMAND_READY';}
  else if(type==='OWNER_DISPATCHED'){requireStatus(instance,['OWNER_COMMAND_READY'],'OWNER_DISPATCHED');if(instance.definition.mode===MODES.MUTATION&&!instance.definition.owner.contract)throw lifecycleError('LIFECYCLE_OWNER_COMMAND_UNAVAILABLE','The public Owner command is unavailable.');if(!text(event.ownerInvocationRef))throw lifecycleError('LIFECYCLE_OWNER_INVOCATION_REF_REQUIRED','The Owner invocation reference is required.');instance.ownerInvocationRef=text(event.ownerInvocationRef);instance.status='OWNER_PENDING';}
  else if(type==='OWNER_RECEIPT'){requireStatus(instance,['OWNER_PENDING'],'OWNER_RECEIPT');const receiptStatus=text(event.status).toUpperCase();if(!text(event.receiptId)||!['COMPLETED','FAILED','OUTCOME_UNKNOWN'].includes(receiptStatus))throw lifecycleError('LIFECYCLE_RECEIPT_INVALID','A valid Owner receipt id and status are required.');instance.receipt={receiptId:text(event.receiptId),status:receiptStatus,ownerRef:text(event.ownerRef)||null};instance.status=receiptStatus==='COMPLETED'?'READBACK_REQUIRED':receiptStatus==='OUTCOME_UNKNOWN'?'RECONCILIATION_REQUIRED':'RECOVERY_REQUIRED';}
  else if(type==='READBACK_VERIFIED'){requireStatus(instance,['READBACK_REQUIRED'],'READBACK_VERIFIED');if(!text(event.readbackRef))throw lifecycleError('LIFECYCLE_READBACK_REF_REQUIRED','An Owner readback reference is required.');instance.readbackRef=text(event.readbackRef);instance.status='COMPLETED';instance.terminal=true;}
  else if(type==='RECONCILE'){requireStatus(instance,['RECONCILIATION_REQUIRED'],'RECONCILE');if(!text(event.reconciliationRef))throw lifecycleError('LIFECYCLE_RECONCILIATION_REF_REQUIRED','A reconciliation reference is required.');instance.reconciliationRef=text(event.reconciliationRef);instance.status='RECONCILIATION_PENDING';}
  else if(type==='RECONCILIATION_RESULT'){requireStatus(instance,['RECONCILIATION_PENDING'],'RECONCILIATION_RESULT');const result=text(event.status).toUpperCase();if(!['COMPLETED','FAILED'].includes(result))throw lifecycleError('LIFECYCLE_RECONCILIATION_RESULT_INVALID','Reconciliation must resolve to completed or failed.');instance.status=result==='COMPLETED'?'READBACK_REQUIRED':'RECOVERY_REQUIRED';}
  else if(type==='RETRY'){if(instance.status==='RECONCILIATION_REQUIRED')throw lifecycleError('LIFECYCLE_RECONCILIATION_REQUIRED','Unknown external outcomes must be reconciled before retry.');requireStatus(instance,['RECOVERY_REQUIRED'],'RETRY');if(event.userGesture!==true||text(event.source)!=='VISIBLE_CONTROL')throw lifecycleError('LIFECYCLE_VISIBLE_RETRY_REQUIRED','Retry requires a visible user gesture.');instance.idempotencyKey=null;instance.ownerInvocationRef=null;instance.receipt=null;instance.status=mutation?'IDEMPOTENCY_REQUIRED':'OWNER_READ_READY';instance.terminal=false;}
  else if(type==='CANCEL'){requireStatus(instance,['PREVIEW_REQUIRED','CONFIRMATION_REQUIRED','IDEMPOTENCY_REQUIRED','USER_GESTURE_REQUIRED','PURPOSE_PREVIEW_REQUIRED'],'CANCEL');instance.status='CANCELLED';instance.terminal=true;}
  else if(type==='REQUEST_UNDO'){requireStatus(instance,['COMPLETED'],'REQUEST_UNDO');if(instance.definition.undo.supported!==true)throw lifecycleError('LIFECYCLE_UNDO_UNAVAILABLE','This Owner does not provide a truthful compensation action.');if(event.userGesture!==true||text(event.source)!=='VISIBLE_CONTROL')throw lifecycleError('LIFECYCLE_VISIBLE_UNDO_REQUIRED','Undo must start from a visible user gesture.');instance.status='UNDO_PREVIEW_REQUIRED';instance.terminal=false;}
  else if(type==='SHOW_UNDO_PREVIEW'){requireStatus(instance,['UNDO_PREVIEW_REQUIRED'],'SHOW_UNDO_PREVIEW');if(!text(event.previewRef))throw lifecycleError('LIFECYCLE_UNDO_PREVIEW_REF_REQUIRED','A bounded Undo preview reference is required.');instance.undoPreviewRef=text(event.previewRef);instance.status='UNDO_CONFIRMATION_REQUIRED';}
  else if(type==='CONFIRM_UNDO'){requireStatus(instance,['UNDO_CONFIRMATION_REQUIRED'],'CONFIRM_UNDO');requireVisibleConfirmation(event,instance.undoPreviewRef);instance.status='COMPENSATION_COMMAND_READY';}
  else if(type==='COMPENSATION_DISPATCHED'){requireStatus(instance,['COMPENSATION_COMMAND_READY'],'COMPENSATION_DISPATCHED');if(!text(event.ownerInvocationRef))throw lifecycleError('LIFECYCLE_OWNER_INVOCATION_REF_REQUIRED','The compensation invocation reference is required.');instance.status='COMPENSATION_PENDING';}
  else if(type==='COMPENSATION_RECEIPT'){requireStatus(instance,['COMPENSATION_PENDING'],'COMPENSATION_RECEIPT');const receiptStatus=text(event.status).toUpperCase();if(!text(event.receiptId)||!['COMPLETED','FAILED'].includes(receiptStatus))throw lifecycleError('LIFECYCLE_RECEIPT_INVALID','A valid compensation receipt is required.');instance.compensationReceipt={receiptId:text(event.receiptId),status:receiptStatus,ownerRef:text(event.ownerRef)||null};instance.status=receiptStatus==='COMPLETED'?'COMPENSATED':'RECOVERY_REQUIRED';instance.terminal=receiptStatus==='COMPLETED';}
  else throw lifecycleError('LIFECYCLE_EVENT_UNKNOWN',`Unknown lifecycle event: ${type}.`);
  instance.events=[...(instance.events||[]),safeEvent(event,instance.status)].slice(-40);instance.terminal=TERMINAL.has(instance.status);return immutable(instance);
}
function describeCoverage(catalog=[]){const actions=Array.isArray(catalog)?catalog:[],definitions=actions.map(compileLifecycle),countBy=key=>definitions.reduce((out,item)=>(out[item[key]]=(out[item[key]]||0)+1,out),{});return immutable({contractId:CONTRACT_ID,version:VERSION,catalogActions:actions.length,lifecycleActions:definitions.length,modes:countBy('mode'),stateChanging:definitions.filter(item=>item.stateChanging).length,previewAndExplicitConfirmation:definitions.filter(item=>item.stateChanging&&item.preview.required&&item.confirmation.required&&item.confirmation.separateVisibleControl).length,idempotencyRequired:definitions.filter(item=>item.idempotency.required).length,ownerReceiptAndReadback:definitions.filter(item=>item.receipt.ownerAttributed&&item.readback.required).length,controlReceiptAndReadback:definitions.filter(item=>item.receipt.controlAttributed&&item.readback.required).length,truthfulUndo:definitions.filter(item=>item.undo.supported).length,unknownExternalBlindRetry:false,naturalLanguageConfirmsMutation:false,ownerExecution:false});}
return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,modes:MODES,compileLifecycle,createInstance,transition,describeCoverage});
})();
