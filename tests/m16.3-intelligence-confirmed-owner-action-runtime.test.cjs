'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const runtimePath='core/ai/ai-action-runtime.js';
const source=read(runtimePath);
const calls=[];
const events=[];
let uuidSequence=0;
let visitState={id:'visit-1',tripId:'trip-1',placeId:'place-strand',title:'Bestätigter Strandbesuch',state:'visited',isConfirmed:true,arrivedAt:'2026-08-25T08:00:00.000Z',durationSeconds:45*60,revision:'visit-rev-1'};
let alternativeVisitState=null;
let visitRecovery=null;
let exposeVisitEntries=true;
let duplicateVisitProjection=false;
let visitOwnerPlaces=[];

for(const forbidden of ['LuviaTripStore','LuviaPlaceCore','LuviaPlaceRuntime','LuviaBookingUI','LuviaTimelineCore','LuviaSupabaseService','.from(','.rpc(','functions.invoke(','localStorage','sessionStorage']){
  assert.equal(source.includes(forbidden),false,`M16 Action Runtime bypasses a public owner contract: ${forbidden}`);
}

const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,
  crypto:{randomUUID:()=>`uuid-${++uuidSequence}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  dispatchEvent(event){events.push(event)},
  LuviaTripContractV1:{
    getActiveTrip(){return{id:'trip-1',title:'Ostseeurlaub',timeZone:'Europe/Berlin',destination:{name:'Scharbeutz',timeZone:'Europe/Berlin'}}},
    listTrips(){return[{id:'trip-1',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}},{id:'trip-2',title:'Paris',destination:{name:'Paris'}}]},
    reads:{listTrips(){return this.listTrips?.()||[]}},
    commands:{
      selectActiveTrip(id,options){calls.push(['trip-select',id,options]);return{ok:true,id}},
      async updateTrip(id,patch){calls.push(['trip-update',id,patch]);return{ok:true,id}}
    }
  },
  LuviaPlacesContractV1:{
    reads:{
      async recommend(input){calls.push(['recommend',input]);return{places:[{id:'places/place-1',name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440}],route:{category:'food'}}},
      async getCard(id){return{place:{id,providerPlaceId:id,name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440},image:{url:'https://images.example/dunes.jpg'}}},
      getPlace(id){return visitOwnerPlaces.find(place=>[place.id,place.placeId,place.providerPlaceId].includes(id))||null},
      listPlaces(){return visitOwnerPlaces},
      async listSaved(){return visitOwnerPlaces},
      getVisit(id){const visit=id===visitState.id?visitState:id===alternativeVisitState?.id?alternativeVisitState:null;return visit?{...visit,confirmed:visit.isConfirmed}:null},
      visitRecoveries(){return visitRecovery?[{...visitRecovery}]:[]}
    },
    commands:{
      async favorite(payload){calls.push(['favorite',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async unfavorite(payload){calls.push(['unfavorite',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async importPlace(providerPlaceId,options){calls.push(['import-place',providerPlaceId,options]);return{id:'place-1',placeId:'place-1',tripPlaceId:'tp-1',providerPlaceId}},
      async plan(payload){calls.push(['plan',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async unplan(payload){calls.push(['unplan',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async updateLifecycle(tripPlaceId,status,patch,options){calls.push(['lifecycle',tripPlaceId,status,patch,options]);return{ok:true,tripPlaceId,status}},
      async updateVisit(visitId,payload){calls.push(['visit-update',visitId,payload]);visitState={...visitState,arrivedAt:payload.arrivedAt,durationSeconds:payload.durationSeconds,revision:'visit-rev-2'};return{...visitState}},
      async removeVisit(visitId,payload){calls.push(['visit-remove',visitId,payload]);visitState={...visitState,state:'removed',isConfirmed:false,revision:'visit-rev-3'};visitRecovery={tripId:'trip-1',recoveryId:'visit-recovery-1',visitId,placeId:visitState.placeId,title:visitState.title,expectedRevision:visitState.revision};return{...visitRecovery}},
      async restoreVisit(recoveryId,payload){calls.push(['visit-restore',recoveryId,payload]);visitState={...visitState,state:'visited',isConfirmed:true,revision:'visit-rev-4'};return{visitId:visitState.id,recoveryId,...visitState}}
    }
  },
  LuviaBookingContractV1:{
    reads:{
      async listForTrip(id){calls.push(['booking-list',id]);return[{id:'booking-1',tripId:id,title:'Dünenküche',status:'confirmed',date:'2026-08-26',time:'19:00',partySize:2}]},
      async lifecycleCapabilities(){return{actions:{modify:{available:true},message:{available:true},manageExternal:{available:false},cancel:{available:true}}}},
      async searchStayOffers(input){calls.push(['stay-search',input]);return{productMode:'fit_only',hotels:[],claims:{priceRankingAvailable:false,liveProviderCount:0},coverage:{fulfilledProviders:0,expectedProviders:2},search:{checkIn:input.checkIn,checkOut:input.checkOut}}}
    },
    commands:{
      async openPlaceBooking(payload,options){calls.push(['booking-open',payload,options]);return{opened:true,channel:'owner_dialog'}},
      async openStayOffer(payload,options){calls.push(['stay-offer-open',payload,options]);return{opened:true,bookingId:'booking-stay-1'}},
      async submitReservation(payload){calls.push(['booking-create',payload]);return{ok:true,bookingId:'booking-2',status:'requested',transport:'email',submissionState:'email_sent',providerOutcomeKnown:true}},
      async modifyBooking(id,payload){calls.push(['booking-modify',id,payload]);return{bookingId:id,status:'change_requested'}},
      async cancelBooking(id,payload){calls.push(['booking-cancel',id,payload]);const error=new Error('Provider timeout');error.code='BOOKING_PROVIDER_TIMEOUT';throw error}
    }
  },
  LuviaJourneyContractV1:{
    reads:{snapshot(){const visits=alternativeVisitState?[visitState,alternativeVisitState]:[visitState],entries=exposeVisitEntries?visits.flatMap(visit=>{const primary={id:`visit:${visit.id}`,source:'gps',sourceId:visit.id,sourceRevision:visit.revision,tripId:'trip-1',placeId:visit.placeId,title:visit.title,startAt:visit.arrivedAt,durationMinutes:Math.round(visit.durationSeconds/60)};return duplicateVisitProjection?[primary,{...primary,id:`timeline:${visit.id}`,title:'Bestätigter Besuch'}]:[primary]}):[];return{days:[{date:'2026-08-25',label:'Dienstag',entries}],summary:{entryCount:entries.length}}}},
    commands:{
      async openPlanningEditor(payload){calls.push(['journey-open',payload]);return{opened:true}},
      async editEntry(entryId,payload){calls.push(['journey-entry-schedule',entryId,payload]);return{entryId,operation:'restore-schedule'}},
      async removeEntry(entryId,payload){calls.push(['journey-entry-remove',entryId,payload]);return{entryId,recoveryId:'journey-recovery-1'}},
      async restoreRemovedEntry(recoveryId,payload){calls.push(['journey-entry-restore',recoveryId,payload]);return{entryId:'event:photo-1',recoveryId}}
    }
  },
  LuviaMemoryContractV1:{
    reads:{async listStories(){return[{id:'story-1',title:'Ein Tag am Meer',status:'published'}]}},
    commands:{stories:{async save(payload){calls.push(['memory-save',payload]);return{storyId:'story-1'}}}}
  },
  LuviaIdentityContractV1:{
    getPreferences(){return{dietaryPreferences:['vegetarian'],travelPace:'balanced'}},
    commands:{async updatePreferences(patch){calls.push(['preferences-update',patch]);return{ok:true}}}
  },
  LuviaNavigationContractV1:{
    createIntent(route,options){calls.push(['navigation-open',route,options]);return{kind:'screen.navigate',route,label:route}}
  }
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/intelligence/travel-orchestration-core.js',runtimePath]){
  vm.runInContext(read(file),context,{filename:file});
}

(async()=>{
  const runtime=context.LuviaAIActionRuntime;
  const diagnostics=runtime.diagnostics();
  assert.equal(diagnostics.actions,30);
  assert.equal(diagnostics.availableActions,29);
  assert.equal(diagnostics.connections.length,8);
  assert.equal(diagnostics.connections.filter(connection=>connection.owner!=='intelligence').every(connection=>connection.registered&&connection.operations===connection.totalOperations),true);
  assert.equal(diagnostics.connections.find(connection=>connection.owner==='intelligence').registered,false);

  const trips=await runtime.runMessage('Zeige mir meine Reisen');
  assert.equal(trips.results[0].kind,'trip_collection');
  assert.equal(trips.results[0].items.length,2);
  assert.equal(trips.results[0].items[1].actions[0].actionId,'trip.active.select');

  const bookings=await runtime.runMessage('Welche Buchungen habe ich?');
  assert.equal(bookings.results[0].kind,'booking_collection');
  assert.equal(bookings.results[0].items[0].actions[1].actionId,'booking.reservation.cancel');

  const memories=await runtime.runMessage('Zeige meine Reisegeschichten');
  assert.equal(memories.results[0].kind,'memory_collection');
  assert.equal(memories.results[0].items[0].title,'Ein Tag am Meer');

  const preferences=await runtime.runMessage('Welche Vorlieben sind gespeichert?');
  assert.equal(preferences.results[0].kind,'preference_summary');
  assert.equal(preferences.results[0].summary.scope,'self');
  assert.ok(preferences.results[0].summary.configuredCount>=1);

  const profiledPlaces=await runtime.runMessage('Find a restaurant for us.',{compiledIntent:{
    contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',mode:'read',clause:'A suitable restaurant',categoryHints:['food'],temporalHint:{},entityHints:{},missingInputs:[]}]
  }});
  assert.equal(profiledPlaces.results[0].kind,'place_collection');
  assert.equal(profiledPlaces.results[0].evidence.preferenceOwner,'identity.v1');
  assert.equal(profiledPlaces.results[0].evidence.confirmedProfileFields,2);
  assert.equal(profiledPlaces.results[0].evidence.profileFallbackUsed,true);
  const profiledRecommend=calls.find(call=>call[0]==='recommend');
  assert.equal(profiledRecommend[1].limit,3,'one chat wish may request at most three inline Places suggestions');
  assert.deepEqual(JSON.parse(JSON.stringify(profiledRecommend[1].profileContext)),{dietaryPreferences:['vegetarian'],travelPace:'balanced'});
  assert.deepEqual(JSON.parse(JSON.stringify(profiledRecommend[1].preferences)),{dietaryPreferences:['vegetarian'],travelPace:'balanced'});
  assert.equal(profiledRecommend[1].query,'A suitable restaurant');

  const viewport={center:{latitude:54.02,longitude:10.75},bounds:{south:54.01,north:54.03,west:10.74,east:10.76},radiusMeters:1500};
  const refreshed=await runtime.readPlaceViewport(profiledPlaces.results[0],viewport);
  const viewportRequest=calls.filter(call=>call[0]==='recommend').at(-1)[1];
  assert.equal(viewportRequest.query,'A suitable restaurant');
  assert.equal(viewportRequest.strictPlaceType,'restaurant');
  assert.equal(viewportRequest.requirePreferenceEvidence,true);
  assert.equal(viewportRequest.fastPath,true);
  assert.equal(viewportRequest.destinationContext.viewport.north,54.03);
  assert.equal(viewportRequest.maxDistanceMeters,1500);
  assert.equal(viewportRequest.preferences.dietaryPreferences[0],'vegetarian');
  assert.ok(refreshed.items[0].actions.some(action=>action.actionId==='places.place.favorite'));
  assert.ok(refreshed.items[0].actions.some(action=>action.actionId==='places.place.plan'));
  await assert.rejects(()=>runtime.readPlaceViewport({...profiledPlaces.results[0],evidence:{...profiledPlaces.results[0].evidence,tripId:'old-trip'}},viewport),error=>error.code==='PLACES_SEARCH_CONTEXT_EXPIRED');

  const explicitPlaces=await runtime.runMessage('Find a vegan restaurant.',{compiledIntent:{
    contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',mode:'read',clause:'A vegan restaurant',categoryHints:['food'],temporalHint:{},entityHints:{preferencePatch:{dietaryPreferences:['vegan']}},missingInputs:[]}]
  }});
  assert.equal(explicitPlaces.results[0].evidence.profileFallbackUsed,false);
  assert.deepEqual(JSON.parse(JSON.stringify(explicitPlaces.results[0].evidence.explicitRequestPreferenceFields)),['dietaryPreferences']);
  const explicitRecommend=calls.filter(call=>call[0]==='recommend').at(-1);
  assert.deepEqual(JSON.parse(JSON.stringify(explicitRecommend[1].preferences)),{dietaryPreferences:['vegan'],travelPace:'balanced'});
  assert.equal(explicitRecommend[1].preferenceMode,'explicit-request-over-confirmed-profile');

  const preferenceProposal=await runtime.runMessage('Merke dir bitte, dass ich vegan esse und entspannt reise.',{compiledIntent:{
    contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'identity',mode:'propose-write',missingInputs:[],entityHints:{preferencePatch:{dietaryPreferences:['vegan'],travelPace:'relaxed'}}}]
  }});
  const preferenceConfirmation=preferenceProposal.results.find(result=>result.kind==='confirmation');
  assert.ok(preferenceConfirmation,'a complete explicit preference write must produce a confirmation preview');
  const preferenceReceipt=await runtime.execute('identity.preferences.update',{}, {ledgerId:preferenceConfirmation.evidence.ledgerId,userGesture:true,confirmed:true});
  assert.equal(preferenceReceipt.evidence.status,'completed');
  assert.deepEqual(JSON.parse(JSON.stringify(calls.find(call=>call[0]==='preferences-update')[1])),{dietaryPreferences:['vegetarian','vegan'],travelPace:'relaxed'});

  const journeySchedule=runtime.prepare('journey.entry.schedule',{tripId:'trip-1',entryId:'event:photo-1',startAt:'2026-08-25T10:30:00.000Z',durationMinutes:45,expectedRevision:'event-rev-1',expectedConflictSignature:'[]'},{userGesture:true,idempotencyKey:'journey-schedule-once'});
  assert.equal(journeySchedule.result.kind,'confirmation');
  await runtime.execute('journey.entry.schedule',{}, {ledgerId:journeySchedule.ledgerId,userGesture:true,confirmed:true});
  const journeyScheduleCall=calls.find(call=>call[0]==='journey-entry-schedule');assert.equal(journeyScheduleCall[1],'event:photo-1');assert.equal(journeyScheduleCall[2].confirmed,true);assert.equal(journeyScheduleCall[2].operationId,'journey-schedule-once');
  const journeyRemove=runtime.prepare('journey.entry.remove',{tripId:'trip-1',entryId:'event:photo-1',expectedRevision:'event-rev-2'},{userGesture:true,idempotencyKey:'journey-remove-once'});
  const journeyRemoveReceipt=await runtime.execute('journey.entry.remove',{}, {ledgerId:journeyRemove.ledgerId,userGesture:true,confirmed:true});assert.equal(journeyRemoveReceipt.evidence.reference.recoveryId,'journey-recovery-1');
  const journeyRestore=runtime.prepare('journey.entry.restore',{tripId:'trip-1',recoveryId:'journey-recovery-1',expectedRevision:'event-rev-3',expectedConflictSignature:'[]'},{userGesture:true,idempotencyKey:'journey-restore-once'});
  await runtime.execute('journey.entry.restore',{}, {ledgerId:journeyRestore.ledgerId,userGesture:true,confirmed:true});assert.equal(calls.find(call=>call[0]==='journey-entry-restore')[1],'journey-recovery-1');

  const visitUpdate=runtime.prepare('journey.visit.update',{tripId:'trip-1',visitId:'visit-1',placeId:'place-strand',name:'Bestätigter Strandbesuch',startAt:'2026-08-25T16:15:00.000Z',durationMinutes:60,expectedRevision:'visit-rev-1',readbackRequired:true},{userGesture:true,idempotencyKey:'visit-update-once'});
  assert.equal(visitUpdate.result.kind,'confirmation');
  assert.equal(calls.filter(call=>call[0]==='visit-update').length,0,'natural language and preview must never mutate the visit');
  const visitUpdateReceipt=await runtime.execute('journey.visit.update',{}, {ledgerId:visitUpdate.ledgerId,userGesture:true,confirmed:true});
  assert.equal(visitUpdateReceipt.evidence.status,'completed');assert.equal(visitUpdateReceipt.evidence.reference.readbackVerified,true);assert.equal(calls.find(call=>call[0]==='visit-update')[2].confirmed,true);
  const visitRemove=runtime.prepare('journey.visit.remove',{tripId:'trip-1',visitId:'visit-1',placeId:'place-strand',name:'Bestätigter Strandbesuch',expectedRevision:'visit-rev-2',readbackRequired:true},{userGesture:true,idempotencyKey:'visit-remove-once'});
  const visitRemoveReceipt=await runtime.execute('journey.visit.remove',{}, {ledgerId:visitRemove.ledgerId,userGesture:true,confirmed:true});
  assert.equal(visitRemoveReceipt.evidence.reference.recoveryId,'visit-recovery-1');assert.equal(visitRemoveReceipt.evidence.reference.readbackState,'removed');
  const visitUndo=runtime.prepareUndo(visitRemove.ledgerId,{userGesture:true});
  assert.equal(visitUndo.result.evidence.actionId,'journey.visit.restore');
  const visitRestoreReceipt=await runtime.execute('journey.visit.restore',{}, {ledgerId:visitUndo.ledgerId,userGesture:true,confirmed:true});
  assert.equal(visitRestoreReceipt.evidence.status,'compensated');assert.equal(visitRestoreReceipt.evidence.reference.readbackState,'restored');assert.equal(calls.find(call=>call[0]==='visit-restore')[1],'visit-recovery-1');

  const updateMessage='Korrigiere den Besuch „Bestätigter Strandbesuch“ am 25.08.2026 um 18:15 Uhr auf 60 Minuten.';
  const updateProposal=await runtime.runMessage(updateMessage,{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',mode:'propose-write',clause:updateMessage,semanticGoalType:'confirmed_visit',semanticOperation:'update',temporalHint:{date:'2026-08-25',time:'18:15'},entityHints:{hasNamedTarget:true},missingInputs:[]}]}});
  const updateConfirmation=updateProposal.results[0];assert.equal(updateConfirmation.kind,'confirmation');assert.equal(updateConfirmation.evidence.actionId,'journey.visit.update');assert.equal(updateConfirmation.evidence.preview.durationMinutes,60);assert.equal(calls.filter(call=>call[0]==='visit-update').length,1,'the chat proposal must not perform a second visit write');runtime.cancel(updateConfirmation.evidence.ledgerId);
  const removeMessage='Entferne den Besuch „Bestätigter Strandbesuch“.';
  const removeProposal=await runtime.runMessage(removeMessage,{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',mode:'propose-write',clause:removeMessage,semanticGoalType:'confirmed_visit',semanticOperation:'remove',temporalHint:{},entityHints:{hasNamedTarget:true},missingInputs:[]}]}});
  assert.equal(removeProposal.results[0].evidence.actionId,'journey.visit.remove');assert.equal(calls.filter(call=>call[0]==='visit-remove').length,1,'the chat proposal must not perform a second visit removal');runtime.cancel(removeProposal.results[0].evidence.ledgerId);
  const restoreMessage='Stelle den Besuch „Bestätigter Strandbesuch“ wieder her.';
  const restoreProposal=await runtime.runMessage(restoreMessage,{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',mode:'propose-write',clause:restoreMessage,semanticGoalType:'confirmed_visit',semanticOperation:'restore',temporalHint:{},entityHints:{hasNamedTarget:true},missingInputs:[]}]}});
  assert.equal(restoreProposal.results[0].evidence.actionId,'journey.visit.restore');assert.equal(calls.filter(call=>call[0]==='visit-restore').length,1,'the chat proposal must not perform a second visit restore');runtime.cancel(restoreProposal.results[0].evidence.ledgerId);

  const originalVisitTitle=visitState.title;
  visitState={...visitState,title:'Bestätigter Besuch'};
  alternativeVisitState={id:'visit-2',tripId:'trip-1',placeId:'place-brechtmann',title:'Bestätigter Besuch',state:'visited',isConfirmed:true,arrivedAt:'2026-08-25T18:00:00.000Z',durationSeconds:60*60,revision:'visit-rev-brechtmann-1'};duplicateVisitProjection=true;
  visitOwnerPlaces=[{id:'place-strand',placeId:'place-strand',providerPlaceId:'google-grande-beach',name:'Restaurant · Grande Beach Café'},{id:'place-brechtmann',placeId:'place-brechtmann',providerPlaceId:'google-brechtmann',name:'Restaurant Brechtmann in Scharbeutz-Schürsdorf'}];
  const recommendCallsBeforeNamedVisit=calls.filter(call=>call[0]==='recommend').length;
  const namedVisitMessage='Ändere den bestätigten Besuch im Grande Beach Café heute auf 18:20 Uhr für 60 Minuten.';
  const namedVisitCompiled=context.LuviaTravelOrchestrationCoreV1.compileIntent(namedVisitMessage,{trip:{startDate:'2026-08-25',endDate:'2026-08-30'},now:'2026-08-25T12:00:00Z'});
  const namedVisit=await runtime.runMessage(namedVisitMessage,{compiledIntent:namedVisitCompiled,sourceMessage:namedVisitMessage});
  assert.equal(namedVisit.results[0].kind,'confirmation',JSON.stringify(namedVisit));assert.equal(namedVisit.results[0].evidence.actionId,'journey.visit.update');assert.equal(namedVisit.results[0].evidence.preview.visitId,'visit-1');assert.equal(namedVisit.results[0].evidence.preview.name,'Restaurant · Grande Beach Café');assert.equal(calls.filter(call=>call[0]==='recommend').length,recommendCallsBeforeNamedVisit,'local visit target resolution must not spend Places provider quota');runtime.cancel(namedVisit.results[0].evidence.ledgerId);
  visitOwnerPlaces=[{id:'place-strand',placeId:'place-strand',name:'DAS LEO'},{id:'place-brechtmann',placeId:'place-brechtmann',name:'DAS LEO'}];
  const duplicateNameMessage='Ändere den bestätigten Besuch bei DAS LEO am 25.08.2026 um 18:20 Uhr auf 60 Minuten.';
  const duplicateNameCompiled=context.LuviaTravelOrchestrationCoreV1.compileIntent(duplicateNameMessage,{trip:{startDate:'2026-08-25',endDate:'2026-08-30'},now:'2026-08-25T12:00:00Z'});
  const duplicateName=await runtime.runMessage(duplicateNameMessage,{compiledIntent:duplicateNameCompiled,sourceMessage:duplicateNameMessage});
  assert.equal(duplicateName.results[0].kind,'error');assert.equal(duplicateName.results[0].evidence.code,'AI_VISIT_TARGET_AMBIGUOUS');assert.match(duplicateName.results[0].message,/„erster“, „zweiter“ oder „letzter“/);assert.equal(calls.filter(call=>call[0]==='visit-update').length,1,'same-name visits must never select an arbitrary owner record');
  const firstDuplicateMessage='Ändere den ersten bestätigten Besuch bei DAS LEO am 25.08.2026 um 18:20 Uhr auf 60 Minuten.';
  const firstDuplicateCompiled=context.LuviaTravelOrchestrationCoreV1.compileIntent(firstDuplicateMessage,{trip:{startDate:'2026-08-25',endDate:'2026-08-30'},now:'2026-08-25T12:00:00Z'});
  const firstDuplicate=await runtime.runMessage(firstDuplicateMessage,{compiledIntent:firstDuplicateCompiled,sourceMessage:firstDuplicateMessage});
  assert.equal(firstDuplicate.results[0].kind,'confirmation',JSON.stringify(firstDuplicate));assert.equal(firstDuplicate.results[0].evidence.preview.visitId,'visit-1');runtime.cancel(firstDuplicate.results[0].evidence.ledgerId);
  alternativeVisitState=null;duplicateVisitProjection=false;visitOwnerPlaces=[];visitState={...visitState,title:originalVisitTitle};

  exposeVisitEntries=false;
  const recommendCallsBeforeMissingVisit=calls.filter(call=>call[0]==='recommend').length;
  const missingVisitMessage='Ändere meinen bestätigten Besuch heute auf 18:15 Uhr für 60 Minuten.';
  const missingVisitCompiled=context.LuviaTravelOrchestrationCoreV1.compileIntent(missingVisitMessage,{trip:{startDate:'2026-08-25',endDate:'2026-08-30'},now:'2026-08-25T12:00:00Z'});assert.equal(missingVisitCompiled.intents[0].mode,'propose-write');assert.equal(missingVisitCompiled.intents[0].semanticOperation,'update');
  const missingVisit=await runtime.runMessage(missingVisitMessage,{compiledIntent:missingVisitCompiled,sourceMessage:missingVisitMessage});
  assert.equal(missingVisit.handled,true);assert.equal(missingVisit.error,true);assert.equal(missingVisit.results[0].kind,'error');assert.equal(missingVisit.results[0].evidence.code,'AI_VISIT_NOT_FOUND');assert.equal(missingVisit.results[0].meta.consumerSafeCopy,true);assert.match(missingVisit.results[0].message,/kein bestätigter Besuch belegt/);assert.equal(missingVisit.results.some(result=>result.kind==='place_collection'),false,'a missing confirmed visit must never fall through to generic Places discovery');assert.equal(calls.filter(call=>call[0]==='recommend').length,recommendCallsBeforeMissingVisit,'a visit mutation without an owner candidate must not spend Places provider quota');
  exposeVisitEntries=true;

  const cancelled=runtime.prepare('places.place.unplan',{tripId:'trip-1',tripPlaceId:'tp-1',providerPlaceId:'place-1'},{userGesture:true});
  assert.equal(cancelled.requiresConfirmation,true);
  assert.equal(runtime.getActionState(cancelled.ledgerId).status,'confirmation_required');
  const cancelReceipt=runtime.cancel(cancelled.ledgerId);
  assert.equal(cancelReceipt.evidence.status,'cancelled');
  assert.equal(calls.filter(call=>call[0]==='unplan').length,0);

  assert.throws(
    ()=>runtime.prepare('places.place.plan',{tripId:'trip-1',providerPlaceId:'place-1'},{userGesture:true}),
    error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('date')
  );

  const prepared=runtime.prepare('places.place.plan',{
    tripId:'trip-1',providerPlaceId:'place-1',placeType:'restaurant',date:'2026-08-26',time:'19:00',
    fields:{planned_at:'2026-08-26T17:00:00.000Z',place_name:'Dünenküche',notes:'Expliziter Chat-Wunsch'}
  },{userGesture:true,idempotencyKey:'plan-once'});
  assert.equal(prepared.result.kind,'confirmation');
  const first=await runtime.execute('places.place.plan',{}, {ledgerId:prepared.ledgerId,userGesture:true,confirmed:true});
  const repeated=await runtime.execute('places.place.plan',{}, {ledgerId:prepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(first.evidence.status,'completed');
  assert.equal(repeated.evidence.idempotencyKey,'plan-once');
  assert.equal(calls.filter(call=>call[0]==='plan').length,1);
  assert.equal(calls.filter(call=>call[0]==='import-place').length,1);
  assert.equal(calls.find(call=>call[0]==='plan')[1].tripPlaceId,'tp-1');
  assert.equal(calls.some(call=>call[0]==='lifecycle'&&call[1]==='tp-1'&&call[2]==='planned'),true);
  assert.equal(runtime.getActionState(prepared.ledgerId).attempts,1);

  const undoPrepared=runtime.prepareUndo(prepared.ledgerId,{userGesture:true});
  assert.equal(undoPrepared.result.kind,'confirmation');
  assert.equal(undoPrepared.result.evidence.actionId,'places.place.unplan');
  const undone=await runtime.execute('places.place.unplan',{}, {ledgerId:undoPrepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(undone.evidence.status,'compensated');
  assert.deepEqual(calls.find(call=>call[0]==='unplan')[1].fields,['planned_at','place_name','notes']);
  assert.equal(calls.some(call=>call[0]==='lifecycle'&&call[1]==='tp-1'&&call[2]==='saved'),true);

  const create=runtime.prepare('booking.reservation.create',{tripId:'trip-1',place:{providerPlaceId:'place-1',name:'Restaurant am Wasser'},startAt:'2026-08-26T17:00:00.000Z',partySize:2},{userGesture:true,idempotencyKey:'booking-create-once'});
  const created=await runtime.execute('booking.reservation.create',{}, {ledgerId:create.ledgerId,userGesture:true,confirmed:true});
  assert.equal(created.evidence.status,'completed');
  assert.equal(calls.find(call=>call[0]==='booking-create')[1].idempotencyKey,'booking-create-once');

  const cancellation=runtime.prepare('booking.reservation.cancel',{tripId:'trip-1',bookingId:'booking-1',reason:'Plan geändert'},{userGesture:true,idempotencyKey:'booking-cancel-unclear'});
  const unclear=await runtime.execute('booking.reservation.cancel',{}, {ledgerId:cancellation.ledgerId,userGesture:true,confirmed:true});
  assert.equal(unclear.evidence.status,'outcome_unknown');
  assert.equal(unclear.evidence.retryable,false);
  assert.equal(runtime.getActionState(cancellation.ledgerId).status,'outcome_unknown');
  await assert.rejects(()=>runtime.retry(cancellation.ledgerId),error=>error.code==='INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED');
  assert.equal(calls.filter(call=>call[0]==='booking-cancel').length,1);

  assert.equal(events.some(event=>event.detail?.reason==='confirmation-required'),true);
  assert.equal(events.some(event=>event.detail?.reason==='command-completed'),true);
  assert.equal(diagnostics.ledger.storesRawPayload,false);
  assert.equal(diagnostics.ledger.storesForeignDomainTruth,false);

  console.log('M16.3 Confirmed Owner Action Runtime: PASS');
  console.log('29 available Owner actions plus 1 optional verified-event read: POLICY-COVERED');
  console.log('R2 confirmation + idempotent replay: PASS');
  console.log('R3 unknown external outcome blind retry: BLOCKED');
  console.log('Raw payload / foreign Domain Truth in ledger: NONE');
})().catch(error=>{console.error(error);process.exit(1)});
