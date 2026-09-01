(()=>{
'use strict';

const core=globalThis.LuviaCollaborationInteractionContractCoreV1;
if(!core)throw new Error('Collaboration Interaction Contract v1: Browserless Core fehlt.');
const CONTRACT_ID=core.contractId;
const VERSION=core.version;
const RUNTIME_VERSION='1.0.0-owner-adapter';

function unavailable(provider){throw Object.assign(new Error(`Collaboration Interaction Contract v1: ${provider} ist nicht verfügbar.`),{code:'COLLABORATION_PROVIDER_UNAVAILABLE',provider})}
function tripContract(){return globalThis.LuviaTripContractV1||unavailable('trip.v1')}
function joinFlow(){return globalThis.LuviaJoinFlow||unavailable('LuviaJoinFlow')}
function tripExperience(){return globalThis.LuviaTripExperience||unavailable('LuviaTripExperience')}
function proposals(){return globalThis.LuviaJourneyPlaceProposals||unavailable('LuviaJourneyPlaceProposals')}
function port(id){return globalThis.LuviaPlatformPorts?.get?.(id)||unavailable(id)}
function activeTrip(input){return input&&typeof input==='object'?input:tripContract().reads?.getActiveTrip?.()||tripContract().getActiveTrip?.()||unavailable('active trip')}
function baseUrl(){return globalThis.LuviaEnvironment?.universalLink?.('index.html')||`${globalThis.location?.origin||''}${globalThis.location?.pathname||'/index.html'}`}
function sharePayload(input){return core.invitePayload(activeTrip(input),baseUrl())}

function getInviteSharePayload(input){return sharePayload(input)}
async function previewInvite(code){return core.preview(await joinFlow().preview(core.inviteCode(code)))}
async function listProposals(input={}){return Object.freeze(await proposals().list(String(input.tripId||'').trim()||undefined,{openOnly:input.openOnly!==false}))}
function openInvite(input){tripExperience().openInvite(activeTrip(input));return Object.freeze({opened:true,owner:'trip',contractId:CONTRACT_ID})}
async function copyInviteCode(input){const payload=sharePayload(input),copied=await port('SharingPort').copyText(payload.code);return Object.freeze({...payload,copied:Boolean(copied),copiedValue:'code'})}
async function copyInviteLink(input){const payload=sharePayload(input),copied=await port('SharingPort').copyText(payload.url);return Object.freeze({...payload,copied:Boolean(copied),copiedValue:'url'})}
async function shareInvite(input){const payload=sharePayload(input),shared=await port('SharingPort').share({title:payload.title,text:payload.text,url:payload.url});if(!shared)await port('SharingPort').copyText(payload.url);return Object.freeze({...payload,shared:Boolean(shared),copiedFallback:!shared})}
function openInviteEmail(input){const payload=sharePayload(input),url=`mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(payload.text)}`;return Object.freeze({...payload,opened:port('ExternalNavigationPort').open(url)!==false,channel:'email'})}
function openInviteWhatsApp(input){const payload=sharePayload(input),url=`https://wa.me/?text=${encodeURIComponent(payload.text)}`;return Object.freeze({...payload,opened:port('ExternalNavigationPort').open(url)!==false,channel:'whatsapp'})}
function setPendingJoinCode(input={}){const code=core.inviteCode(input.code||input);joinFlow().setPending({code,source:String(input.source||'public-contract')});return Object.freeze({pending:true,code})}
function cancelJoin(){joinFlow().setPending(null);return Object.freeze({pending:false,cancelled:true})}
async function joinTrip(input={}){return tripContract().commands.joinTrip(core.inviteCode(input.code),core.memberName(input.memberName))}
function openJoinedTrip(input={}){const tripId=String(input.tripId||input.id||'').trim();if(!tripId)throw Object.assign(new Error('Reise-ID fehlt.'),{code:'COLLABORATION_TRIP_REQUIRED'});const selection=tripContract().commands.selectActiveTrip(tripId),intent=globalThis.LuviaNavigationContractV1?.createIntent?.('trip',{source:'collaboration.interaction.v1'});return Object.freeze({opened:true,tripId,selection,intent:intent||null})}
async function voteProposal(input={}){const proposalId=String(input.proposalId||input.id||'').trim();if(!proposalId)throw Object.assign(new Error('Abstimmungs-ID fehlt.'),{code:'COLLABORATION_PROPOSAL_REQUIRED'});const choice=core.voteChoice(input.choice);const result=await proposals().vote(proposalId,choice.providerValue,String(input.tripId||'').trim()||undefined);return Object.freeze({choice,result})}

const reads=Object.freeze({getInviteSharePayload,previewInvite,listProposals});
const commands=Object.freeze({openInvite,copyInviteCode,copyInviteLink,shareInvite,openInviteEmail,openInviteWhatsApp,setPendingJoinCode,cancelJoin,joinTrip,openJoinedTrip,voteProposal});
const api=Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,commands,diagnostics:()=>Object.freeze({...core.diagnostics(),runtimeVersion:RUNTIME_VERSION,providers:Object.freeze({trip:Boolean(globalThis.LuviaTripContractV1),join:Boolean(globalThis.LuviaJoinFlow),proposals:Boolean(globalThis.LuviaJourneyPlaceProposals),sharing:Boolean(globalThis.LuviaPlatformPorts?.get?.('SharingPort'))})})});
globalThis.LuviaCollaborationInteractionContractV1=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:Boolean(globalThis.LuviaTripContractV1&&globalThis.LuviaJoinFlow),detail:'Collaboration interaction v1 compatibility owner adapter'})});
})();
