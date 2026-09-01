var LuviaHumanAIParityFailureMatrixCoreV1=(()=>{
  'use strict';
  const CONTRACT_ID='intelligence.human-ai-parity-failure-matrix.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.0.0';
  const DIMENSIONS=Object.freeze(['contract','compiler','permission','confirmation','idempotency','receipt','recovery','undo','multilingual','typo','multiIntent','denial']);
  const EXECUTABLE=new Set(['AVAILABLE','CONDITIONAL']);
  const BOUND=new Set(['PUBLIC_CONTRACT_BOUND','PUBLIC_E2E_PROVEN','RUNTIME_REGISTERED']);
  const AI_ROUTED=new Set(['PUBLIC_E2E_PASS','REGISTERED_PARTIAL','PARTIAL','NATIVE_CHAT']);
  const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))freeze(child)}return value};
  const text=value=>String(value??'').trim();
  const byId=(items=[],key='actionId')=>new Map((items||[]).map(item=>[text(item?.[key]||item?.id),item]));
  const dimension=(status,evidence,expected,extra={})=>freeze({status,evidence,expected,...extra});
  const typoSample=value=>{const source=text(value);if(!source)return'';const replacements=[[/ä/i,'a'],[/ö/i,'o'],[/ü/i,'u'],[/ß/i,'ss'],[/ie/i,'i'],[/en\b/i,'n']];for(const [pattern,replacement]of replacements)if(pattern.test(source))return source.replace(pattern,replacement);return source.length>5?`${source.slice(0,3)}${source.slice(4)}`:source.toLowerCase()};
  function denialCases(policy={}){
    const cases=[];
    if(text(policy.requiredScope)&&policy.requiredScope!=='PUBLIC')cases.push({id:'permission_denied',given:`Berechtigung ${policy.requiredScope} fehlt`,expected:'Keine Ausführung; erforderliche Berechtigung verständlich anzeigen'});
    if(policy.reauthRequired===true)cases.push({id:'reauth_required',given:'Letzte Anmeldung ist zu alt',expected:'Erneute Anmeldung verlangen; keine Ausführung'});
    if((policy.consentRequirements||[]).length)cases.push({id:'consent_missing',given:'Erforderliche Zustimmung fehlt',expected:'Zustimmung erklären und anfordern; keine Ausführung'});
    if(policy.providerGate)cases.push({id:'provider_unavailable',given:`${policy.providerGate} ist nicht erreichbar`,expected:'Keine erfundenen Ergebnisse; Wiederholen oder manuellen Weg anbieten'});
    if(policy.networkPolicy==='ONLINE_REQUIRED')cases.push({id:'offline',given:'Gerät ist offline',expected:'Offline-Hinweis und sichere Fortsetzung; keine Ausführung'});
    return cases;
  }
  function failureCases({action={},policy={},lifecycle={},capability={},language={}}={}){
    const cases=[
      {id:'compiler_unresolved',given:'Wunsch kann nicht eindeutig zugeordnet werden',expected:'Rückfrage statt falscher Aktion'},
      {id:'owner_unavailable',given:'Zuständiger Bereich antwortet nicht',expected:'Ehrlicher Fehlerzustand; keine erfundenen Daten'},
      {id:'typo_input',given:typoSample(action.label),expected:`Weiterhin ${action.id} erkennen oder konkret nachfragen`},
      {id:'multi_intent',given:`${action.label} und danach einen zweiten Wunsch bearbeiten`,expected:'Wünsche trennen, Reihenfolge zeigen und Änderungen einzeln bestätigen'},
      ...denialCases(policy)
    ];
    if(capability.inputContractStatus==='OPEN'||(action.inputContract?.requiredFields||[]).length)cases.push({id:'input_missing',given:'Eine erforderliche Angabe fehlt',expected:'Fehlende Angabe konkret nennen; keinen Owner aufrufen'});
    if(lifecycle.confirmation?.required)cases.push({id:'confirmation_rejected',given:'Vorschau wird abgebrochen',expected:'Keine Änderung; Ausgangsaktion wieder benutzbar'});
    if(lifecycle.idempotency?.required)cases.push({id:'duplicate_command',given:'Derselbe bestätigte Befehl wird erneut gesendet',expected:'Keine doppelte Wirkung; vorhandenes Ergebnis zurückgeben'});
    if(lifecycle.receipt?.required)cases.push({id:'outcome_unknown',given:'Ausgang der Änderung ist unbekannt',expected:'Nicht blind wiederholen; beim Owner abgleichen'});
    if(lifecycle.stateChanging&&!lifecycle.undo?.supported)cases.push({id:'undo_unavailable',given:'Automatisches Rückgängig wird verlangt',expected:'Grenze ehrlich erklären und manuellen Wiederherstellungsweg zeigen'});
    if(language.coverage!=='MULTILINGUAL_CURATED')cases.push({id:'multilingual_unproven',given:'Der Wunsch wird nicht auf Deutsch formuliert',expected:'Evidenz offen lassen oder sicher nachfragen'});
    return freeze(cases);
  }
  function releaseStatus(action={},capability={}){
    if(action.ai?.coverage==='PUBLIC_E2E_PASS')return'PUBLIC_E2E_PROVEN';
    if(!EXECUTABLE.has(action.human?.status))return'NOT_APPLICABLE';
    if(capability.aiRouted===true||AI_ROUTED.has(action.ai?.coverage))return'LOCAL_AI_PATH';
    if(capability.manualOwnerFlowAvailable===true)return'MANUAL_OWNER_PATH';
    return'BLOCKED';
  }
  function compileRow(input={}){
    const action=input.action||{},language=input.language||{},policy=input.policy||{},lifecycle=input.lifecycle||{},capability=input.capability||{},projection=input.projection||{};
    if(!text(action.id))throw new TypeError('Parity matrix action.id is required.');
    const executable=EXECUTABLE.has(action.human?.status),routed=capability.aiRouted===true||AI_ROUTED.has(action.ai?.coverage),bound=BOUND.has(action.owner?.bindingStatus),stateChanging=lifecycle.stateChanging===true;
    const denials=denialCases(policy),release=releaseStatus(action,capability),blockers=[];
    if(executable&&release!=='PUBLIC_E2E_PROVEN')blockers.push('PUBLIC_E2E_EVIDENCE_OPEN');
    if(executable&&!routed)blockers.push('AI_ROUTE_OPEN');
    if(executable&&action.inputContract?.status==='OPEN')blockers.push('TYPED_INPUT_CONTRACT_OPEN');
    if(executable&&language.coverage!=='MULTILINGUAL_CURATED')blockers.push('MULTILINGUAL_EVIDENCE_OPEN');
    const dimensions={
      contract:dimension(bound?'PASS':action.owner?.bindingStatus==='NOT_APPLICABLE'?'NOT_REQUIRED':'OPEN',`${action.owner?.contract||'Kein öffentlicher Vertrag'} · ${action.owner?.method||'keine Methode'}`,bound?'Öffentlichen Owner-Weg verwenden':'Owner-Vertrag ergänzen',{inputContractStatus:action.inputContract?.status||'OPEN'}),
      compiler:dimension(language.coverage==='MULTILINGUAL_CURATED'?'PASS':'PARTIAL',language.coverage||'Kein Sprachvertrag',`„${action.label}“ eindeutig ${action.id} zuordnen`),
      permission:dimension(policy.actionId?'PASS':'OPEN',policy.actionId?`${policy.classification} · ${policy.requiredScope}`:'Keine Sicherheitsregel','Vor jedem Owner-Aufruf Berechtigung, Zustimmung, Provider und Netz prüfen'),
      confirmation:dimension(stateChanging?(lifecycle.confirmation?.separateVisibleControl?'PASS':'OPEN'):'NOT_REQUIRED',stateChanging?'Separate sichtbare Bestätigung':'Keine Änderung',stateChanging?'Ohne Bestätigung keine Ausführung':'Direkt lesen oder öffnen'),
      idempotency:dimension(stateChanging?(lifecycle.idempotency?.required?'PASS':'OPEN'):'NOT_REQUIRED',lifecycle.idempotency?.policy||'Nicht erforderlich',stateChanging?'Wiederholung darf keine doppelte Wirkung erzeugen':'Keine Mutations-ID erforderlich'),
      receipt:dimension(lifecycle.receipt?.required?'PASS':'NOT_REQUIRED',lifecycle.receipt?.required?(lifecycle.receipt.ownerAttributed?'Owner-Ergebnis':'Kontrolliertes Ergebnis'):'Kein Schreib-Receipt erforderlich',lifecycle.receipt?.required?'Erfolg, Fehler oder unbekannten Ausgang sichtbar belegen':'Lesergebnis normal darstellen'),
      recovery:dimension(lifecycle.recovery?.description?'PASS':'OPEN',lifecycle.recovery?.description||'Kein Wiederherstellungsweg',lifecycle.recovery?.blindRetry===false?'Keine blinde Wiederholung':'Wiederholungsgrenze ergänzen'),
      undo:dimension(lifecycle.undo?.supported?'PASS':'NOT_REQUIRED',lifecycle.undo?.supported?'Eigene Vorschau und Bestätigung':'Nicht automatisch zugesagt',lifecycle.undo?.supported?'Rückgängig als neue geschützte Änderung':'Manuellen Wiederherstellungsweg nennen'),
      multilingual:dimension(language.coverage==='MULTILINGUAL_CURATED'?'PASS':'OPEN',(language.curatedLocales||[]).join(', ')||'Nur kanonisches Deutsch',language.coverage==='MULTILINGUAL_CURATED'?'Kuratierten mehrsprachigen Fall auswerten':'Mehrsprachigen Beleg ergänzen'),
      typo:dimension(language.coverage==='MULTILINGUAL_CURATED'?'PARTIAL':'OPEN',typoSample(action.label),`Tippfehler sicher als ${action.id} erkennen oder nachfragen`),
      multiIntent:dimension(!executable?'NOT_REQUIRED':routed?'PARTIAL':'OPEN',routed?'Allgemeine Sequenzierung vorhanden':'Aktionsspezifischer AI-Weg fehlt','Mit einem zweiten Wunsch trennen, ordnen und Änderungen einzeln bestätigen'),
      denial:dimension(policy.actionId?'PASS':'OPEN',denials.length?`${denials.length} relevante Ablehnungsfälle`:'Basissperre gegen unzulässige Ausführung',denials.length?'Alle zutreffenden Ablehnungen fail-closed prüfen':'Unzulässige Ausführung weiterhin verhindern')
    };
    return freeze({sequence:action.sequence,actionId:action.id,label:action.label,category:action.category,area:action.area,surface:action.surface,effect:action.effect,risk:action.risk,humanStatus:action.human?.status,owner:{contract:action.owner?.contract||null,method:action.owner?.method||null,bindingStatus:action.owner?.bindingStatus||'OPEN'},ai:{coverage:action.ai?.coverage||'MISSING',routed,inputContractStatus:action.inputContract?.status||'OPEN',consumerView:projection.view||null},release:{status:release,publicEvidence:action.delivery?.publicEvidence||'OPEN',blockers:freeze([...new Set(blockers)])},dimensions:freeze(dimensions),failures:failureCases({action,policy,lifecycle,capability,language})});
  }
  function compileMatrix(input={}){
    const actions=input.actions||[],languages=byId(input.languages),policies=byId(input.policies),lifecycles=byId(input.lifecycles),capabilities=byId(input.capabilities),projections=byId(input.projections);
    return freeze(actions.map(action=>compileRow({action,language:languages.get(action.id),policy:policies.get(action.id),lifecycle:lifecycles.get(action.id),capability:capabilities.get(action.id),projection:projections.get(action.id)})));
  }
  const counts=(rows,key)=>rows.reduce((result,row)=>{const value=key(row);result[value]=(result[value]||0)+1;return result},{});
  function describeCoverage(rows=[]){
    const dimensionStatus={};for(const name of DIMENSIONS)dimensionStatus[name]=counts(rows,row=>row.dimensions[name].status);
    return freeze({catalogActions:rows.length,matrixRows:rows.length,dimensions:DIMENSIONS.length,releaseStatus:counts(rows,row=>row.release.status),publicE2eProven:rows.filter(row=>row.release.status==='PUBLIC_E2E_PROVEN').length,localAiPaths:rows.filter(row=>row.release.status==='LOCAL_AI_PATH').length,manualOwnerPaths:rows.filter(row=>row.release.status==='MANUAL_OWNER_PATH').length,protectedChanges:rows.filter(row=>row.dimensions.confirmation.status==='PASS').length,generatedFailureCases:rows.reduce((sum,row)=>sum+row.failures.length,0,dimensionStatus),driftGuard:true,ownerExecution:false});
  }
  function query(rows=[],filters={}){
    const search=text(filters.search).toLocaleLowerCase('de-DE'),category=text(filters.category),release=text(filters.releaseStatus),failure=text(filters.failureId),dimensionName=text(filters.dimension),dimensionStatus=text(filters.dimensionStatus),limit=Math.max(1,Math.min(Number(filters.limit)||rows.length,327));
    return freeze(rows.filter(row=>(!search||[row.actionId,row.label,row.category,row.area,row.owner.contract,row.owner.method].some(value=>text(value).toLocaleLowerCase('de-DE').includes(search)))&&(!category||row.category===category)&&(!release||row.release.status===release)&&(!failure||row.failures.some(item=>item.id===failure))&&(!dimensionName||!dimensionStatus||row.dimensions[dimensionName]?.status===dimensionStatus)).slice(0,limit));
  }
  function projectRow(row={}){
    const releaseLabels={PUBLIC_E2E_PROVEN:'Öffentlich bewiesen',LOCAL_AI_PATH:'Lokal über Luvia vorbereitet',MANUAL_OWNER_PATH:'Im passenden Bereich nutzbar',BLOCKED:'Noch nicht verfügbar',NOT_APPLICABLE:'Nicht als Produktaktion vorgesehen'};
    const open=DIMENSIONS.filter(name=>['OPEN','PARTIAL','BLOCKED'].includes(row.dimensions?.[name]?.status));
    return freeze({actionId:row.actionId,title:row.label,category:row.category,status:releaseLabels[row.release?.status]||'Status offen',summary:open.length?`${open.length} Nachweise sind noch offen.`:'Alle erforderlichen Nachweise sind vorhanden.',openDimensions:open,failures:(row.failures||[]).map(item=>({title:item.id.replaceAll('_',' '),message:item.expected}))});
  }
  return freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,dimensions:DIMENSIONS,compileRow,compileMatrix,describeCoverage,query,projectRow,typoSample});
})();
