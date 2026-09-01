(()=>{
'use strict';

const VERSION='1.1.0';
const ENTITY='journey_place_proposal';
const EVENT=Object.freeze({created:'journey.place-proposal.created',vote:'journey.place-proposal.vote',applying:'journey.place-proposal.applying',applied:'journey.place-proposal.applied',failed:'journey.place-proposal.failed',cancelled:'journey.place-proposal.cancelled'});
let unsubscribe=null,memberCache=new Map();
const clean=value=>String(value??'').trim();
const collaboration=()=>globalThis.LuviaCollaboration||null;
const client=()=>globalThis.LuviaSupabaseService?.getClient?.()||null;
const activeTrip=()=>globalThis.LuviaTripContractV1?.reads?.getActiveTrip?.()||globalThis.LuviaTripContractV1?.reads?.getContext?.()||null;
const tripId=input=>clean(input?.id||input?.tripId||input?.trip_id||activeTrip()?.id||activeTrip()?.tripId);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const proposalId=()=>crypto.randomUUID?.()||`proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const compactPlace=place=>({
  providerPlaceId:clean(place?.providerPlaceId||place?.id).replace(/^places\//,''),name:clean(place?.name),formattedAddress:clean(place?.formattedAddress||place?.address),primaryType:clean(place?.primaryType||place?.primary_type),canonicalType:clean(place?.canonicalType),types:Array.isArray(place?.types)?place.types.slice(0,12):[],rating:Number(place?.rating)||null,userRatingCount:Number(place?.userRatingCount)||null,priceLevel:clean(place?.priceLevel)||null,openNow:place?.openNow??null,features:clone(place?.features||{}),accessibilityOptions:clone(place?.accessibilityOptions||{}),coordinates:clone(place?.coordinates||place?.location||null),mapsUrl:clean(place?.mapsUrl||place?.googleMapsUri)||null,website:clean(place?.website||place?.websiteUri)||null,menuUrl:clean(place?.menuUrl||place?.menu_url)||null,menuVerified:place?.menuVerified===true||place?.menuEvidence?.verified===true,image:place?.image?.url?{url:clean(place.image.url),alt:clean(place.image.alt)}:null,photoUri:clean(place?.photoUri||place?.imageUrl)||null,travelerFit:clean(place?.travelerFit),travelerInsights:clone(place?.travelerInsights||[]),groupFit:clone(place?.groupFit||null),fitMethod:clean(place?.groupFit?.method||place?.fitMethod)||null,aiScoreUsed:false,accent:clean(place?.accent||place?.categoryAccent)||null
});

function decisionPolicy({trip=activeTrip(),plannedAt=Date.now(),memberCount=1,now=Date.now()}={}){
  const planned=new Date(plannedAt).getTime(),start=new Date(trip?.startDate||trip?.start_date||plannedAt).getTime(),end=new Date(trip?.endDate||trip?.end_date||plannedAt).getTime(),during=Number.isFinite(start)&&now>=start&&(!Number.isFinite(end)||now<=end+86400000);
  if(memberCount<=1)return Object.freeze({mode:'owner_decides',hours:0,label:'Direkt einplanen'});
  if(during&&planned-now<=90*60*1000)return Object.freeze({mode:'owner_decides',hours:0,label:'Reiseleitung entscheidet jetzt'});
  if(during)return Object.freeze({mode:'vote',hours:1,label:'1 Stunde abstimmen'});
  const days=(start-now)/86400000;
  return days>=7?Object.freeze({mode:'vote',hours:24,label:'24 Stunden abstimmen'}):Object.freeze({mode:'vote',hours:12,label:'12 Stunden abstimmen'});
}

async function ensureTrip(id){
  const api=collaboration();if(!api)throw new Error('Collaboration Core ist noch nicht bereit.');
  if(api.snapshot?.().tripId!==id)await api.watchTrip?.(id);
  await api.refresh?.({silent:true});return api;
}
async function currentUserId(){
  const sdk=client();if(!sdk?.auth?.getUser)throw new Error('Für eine Abstimmung ist eine Anmeldung erforderlich.');
  const result=await sdk.auth.getUser(),id=result?.data?.user?.id;if(!id)throw new Error('Für eine Abstimmung ist eine Anmeldung erforderlich.');return clean(id);
}
async function members(id=tripId()){
  if(!id)return[];if(memberCache.has(id)&&Date.now()-memberCache.get(id).at<30000)return clone(memberCache.get(id).rows);
  const sdk=client();if(!sdk)throw new Error('Collaboration ist noch nicht mit der Cloud verbunden.');
  const result=await sdk.rpc('luvia_list_trip_members',{p_trip_id:id});if(result.error)throw result.error;
  const rows=(result.data||[]).map(row=>({id:clean(row.user_id||row.userId||row.id),name:clean(row.display_name||row.displayName||row.name)||'Mitreisende Person',role:clean(row.role||row.member_role)||'member',avatarUrl:row.avatar_url||row.avatarUrl||null})).filter(row=>row.id);memberCache.set(id,{at:Date.now(),rows});return clone(rows);
}
function activities(id){
  const snapshot=collaboration()?.snapshot?.()||{};if(id&&snapshot.tripId!==id)return[];
  return (snapshot.activities||[]).filter(row=>row.entity_type===ENTITY&&clean(row.entity_id)).slice().reverse();
}
function derive(id,memberRows=[]){
  const proposals=new Map();
  for(const row of activities(id)){
    const pid=clean(row.entity_id),meta=row.metadata||{};if(!pid)continue;
    if(row.event_type===EVENT.created){
      proposals.set(pid,{id:pid,trip_id:clean(row.trip_id||id),proposed_by:clean(row.actor_user_id),place_snapshot:clone(meta.placeSnapshot||{}),planned_at:meta.plannedAt,duration_minutes:Number(meta.durationMinutes)||75,transfer_minutes:Number(meta.transferMinutes)||0,decision_mode:clean(meta.policy?.mode)||'vote',expires_at:meta.expiresAt,created_at:row.created_at,application_status:'idle',trip_place_id:null,_events:[row],_votes:new Map(),member_count:Number(meta.memberCount)||memberRows.length||1,policy:meta.policy||null});continue;
    }
    const proposal=proposals.get(pid);if(!proposal)continue;proposal._events.push(row);
    if(row.event_type===EVENT.vote)proposal._votes.set(clean(row.actor_user_id),{user_id:clean(row.actor_user_id),vote:meta.vote===null?null:meta.vote===true,updated_at:row.created_at,actor_name:row.actor_name});
    if(row.event_type===EVENT.applying)proposal.application_status='applying';
    if(row.event_type===EVENT.applied){proposal.application_status='applied';proposal.trip_place_id=clean(meta.tripPlaceId)||null}
    if(row.event_type===EVENT.failed)proposal.application_status='failed';
    if(row.event_type===EVENT.cancelled)proposal.cancelled=true;
  }
  return [...proposals.values()].map(proposal=>{
    const votes=[...proposal._votes.values()],yes=votes.filter(row=>row.vote===true).length,no=votes.filter(row=>row.vote===false).length,abstain=votes.filter(row=>row.vote===null).length,total=Math.max(1,proposal.member_count,memberRows.length),majority=Math.floor(total/2)+1,expiresAt=new Date(proposal.expires_at).getTime(),expired=Number.isFinite(expiresAt)&&Date.now()>=expiresAt;
    const status=proposal.cancelled?'cancelled':proposal.application_status==='applied'?'applied':proposal.decision_mode==='owner_decides'||yes>=majority?'approved':no>=majority||expired?'rejected':'pending';
    return Object.freeze({...proposal,status,journey_place_proposal_votes:votes,yes_votes:yes,no_votes:no,abstain_votes:abstain,required_votes:majority,member_count:total,expired,placeSnapshot:proposal.place_snapshot,plannedAt:proposal.planned_at,durationMinutes:proposal.duration_minutes,transferMinutes:proposal.transfer_minutes});
  }).sort((left,right)=>String(left.planned_at).localeCompare(String(right.planned_at)));
}
async function list(id=tripId(),options={}){
  if(!id)return[];await ensureTrip(id);const group=await members(id).catch(()=>[]),rows=derive(id,group);return options.openOnly===false?rows:rows.filter(row=>['pending','approved'].includes(row.status)&&row.application_status!=='applied');
}
async function record(id,eventType,title,metadata={}){
  const api=await ensureTrip(id),result=await api.record?.(eventType,title,{entityType:ENTITY,entityId:metadata.proposalId,metadata});
  if(!result)throw new Error('Die Gruppenentscheidung konnte nicht sicher synchronisiert werden. Es wurde nichts verändert.');
  await api.refresh?.({silent:true});return result;
}
function emit(reason,proposal){globalThis.dispatchEvent(new CustomEvent('luvia:journey-place-proposal-changed',{detail:{reason,proposal}}))}
async function create(input={}){
  const id=tripId(input.trip),providerPlaceId=clean(input.providerPlaceId);if(!id||!providerPlaceId||!input.plannedAt)throw new Error('Reise, Place und Zeitpunkt müssen für die Abstimmung feststehen.');
  const group=input.members?.filter?.(row=>row?.id)||await members(id),policy=decisionPolicy({trip:input.trip||activeTrip(),plannedAt:input.plannedAt,memberCount:group.length}),pid=proposalId(),expiresAt=new Date(Date.now()+Math.max(policy.hours,1/60)*3600000).toISOString();
  await record(id,EVENT.created,'Place zur gemeinsamen Timeline vorgeschlagen',{proposalId:pid,providerPlaceId,placeSnapshot:compactPlace(input.placeSnapshot),plannedAt:new Date(input.plannedAt).toISOString(),durationMinutes:Number(input.durationMinutes)||75,transferMinutes:Number(input.transferMinutes)||0,policy,expiresAt,memberCount:Math.max(1,group.length),memberIds:group.map(row=>row.id).filter(Boolean)});
  await vote(pid,true,id);const proposal=(await list(id,{openOnly:false})).find(row=>row.id===pid);emit('created',proposal);return proposal;
}
async function vote(pid,value,id=tripId()){
  const proposal=(await list(id,{openOnly:false})).find(row=>row.id===pid);if(!proposal)throw new Error('Diese Abstimmung ist nicht mehr verfügbar.');
  const normalized=value==null?null:Boolean(value),title=normalized===null?'Bei der Abstimmung enthalten':normalized?'Für den Place gestimmt':'Gegen den Place gestimmt';
  await record(id,EVENT.vote,title,{proposalId:pid,vote:normalized});const next=(await list(id,{openOnly:false})).find(row=>row.id===pid);emit('voted',next);return next;
}
async function claim(pid){
  const id=tripId(),uid=await currentUserId(),proposal=(await list(id,{openOnly:false})).find(row=>row.id===pid);
  if(!proposal||proposal.status!=='approved'||proposal.application_status==='applied'||proposal.proposed_by!==uid)return null;
  if(proposal.application_status!=='applying')await record(id,EVENT.applying,'Bestätigten Gruppenentscheid anwenden',{proposalId:pid});
  return (await list(id,{openOnly:false})).find(row=>row.id===pid)||null;
}
async function finish(pid,tripPlaceId,success=true){
  const id=tripId(),eventType=success?EVENT.applied:EVENT.failed;await record(id,eventType,success?'Place wurde gemeinsam eingeplant':'Place konnte noch nicht eingeplant werden',{proposalId:pid,tripPlaceId:tripPlaceId||null});
  const proposal=(await list(id,{openOnly:false})).find(row=>row.id===pid);emit(success?'applied':'failed',proposal);return proposal;
}
function subscribe(listener,id=tripId()){
  unsubscribe?.();const api=collaboration();if(!api?.subscribe)return()=>{};let signature='';unsubscribe=api.subscribe(async state=>{if(id&&state.tripId!==id)return;const group=await members(id).catch(()=>[]),rows=derive(id,group),next=rows.map(row=>`${row.id}:${row.status}:${row.application_status}:${row.yes_votes}:${row.no_votes}`).join('|');if(next===signature)return;signature=next;listener?.(rows);for(const proposal of rows)emit('realtime',proposal)});return()=>{unsubscribe?.();unsubscribe=null};
}
function diagnostics(){return Object.freeze({version:VERSION,owner:'collaboration',storage:'trip_activity_events',schemaMutation:false,placesMutation:false,journeyMutation:false,deterministicApplier:'proposer-only',decisionPolicies:['24h-before-week','12h-before-trip','1h-during-trip','owner-imminent']})}

globalThis.LuviaJourneyPlaceProposals=Object.freeze({version:VERSION,decisionPolicy,members,create,vote,list,claim,finish,subscribe,diagnostics});
})();
