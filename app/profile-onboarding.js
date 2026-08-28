(() => {
  'use strict';

  const VERSION = '1.0.0';
  const ROUTE = 'profile-onboarding';
  const STEPS = Object.freeze(['welcome','account','heart','rhythm','care','control','ready']);
  const STEP_COPY = Object.freeze({
    welcome:['Willkommen','Deine Luvia beginnt','Los geht’s'],
    account:['Identity','Du bleibst du','Reisekompass öffnen'],
    heart:['Reisegefühl','Was dich bewegt','Rhythmus bestimmen'],
    rhythm:['Reisekompass','Wie du reist','Bedürfnisse ergänzen'],
    care:['Reisekompass','Was wichtig ist','Kontrolle festlegen'],
    control:['Consent','Du entscheidest','Kompass ansehen'],
    ready:['Bereit','Dein Reisekompass','']
  });
  const STEP_SCENES = Object.freeze({welcome:'morning',account:'morning',heart:'moving',rhythm:'moving',care:'together',control:'together',ready:'memory'});
  const GROUPS = Object.freeze({
    interests:{max:4,required:true,items:['culinary','culture','nature','family','photography','adventure','local','wellness','beach','nightlife']},
    travelStyles:{max:4,required:true,items:['authentic','spontaneous','comfort','romantic','family_friendly','sustainable','planned','accessible']},
    mobilityPreferences:{max:5,items:['walking','rail','local_transit','cycling','rental','taxi','car','sustainable']},
    activityPreferences:{max:5,required:true,items:['outdoor','relaxed','active','water_fun','hiking','cycling','indoor']},
    entertainmentPreferences:{max:4,items:['live_music','theatre','events','cinema','concert','bar','comedy']},
    dietary:{max:4,required:true,neutral:'no_diet',items:['vegetarian','vegan','mixed','no_diet','halal','gluten_free','lactose_free']},
    familyPreferences:{max:4,neutral:'no_family_needs',items:['traveling_with_children','baby','stroller','family_friendly','no_family_needs']},
    accessibilityNeeds:{max:5,neutral:'no_accessibility',items:['step_free','wheelchair','quiet_spaces','hearing_support','visual_support','no_accessibility']}
  });
  const PACE = Object.freeze(['relaxed','balanced','active']);
  const BUDGET = Object.freeze(['low','medium','premium']);
  let mounted = null;

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
  const identity = () => window.LuviaIdentityContractV1;
  const schema = () => window.LuviaPreferenceSchema;
  const storage = () => window.LuviaPlatformPorts?.get?.('StoragePort') || window.LuviaIdentityPlatformWebPorts?.StoragePort || null;
  const auth = () => window.LuviaPlatformPorts?.get?.('AuthSessionPort')?.snapshot?.() || window.LuviaIdentityPlatformWebPorts?.AuthSessionPort?.snapshot?.() || window.LuviaAuth?.getState?.() || {};
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || identity()?.getViewerIdentity?.()?.reducedMotion === true;
  const userId = () => auth()?.user?.id || identity()?.getViewerIdentity?.()?.userId || 'viewer';
  const draftKey = () => `luviaProfileOnboardingDraftV1:${userId()}`;
  const deferredKey = () => `luviaProfileOnboardingDeferredV1:${userId()}`;

  function readSession(key, fallback = null) {
    try { return storage()?.get?.(key, fallback, {scope:'session'}) ?? fallback; }
    catch (_) { return fallback; }
  }
  function writeSession(key, value) {
    try { return storage()?.set?.(key, value, {scope:'session'}); }
    catch (_) { return value; }
  }
  function removeSession(key) {
    try { return storage()?.remove?.(key, {scope:'session'}); }
    catch (_) { return false; }
  }

  function shouldStart(profile = null) {
    const preferences = profile || identity()?.getPreferences?.('self') || {};
    return !preferences.preferencesCompletedAt && readSession(deferredKey(), false) !== true;
  }
  function defer() { writeSession(deferredKey(), true); }
  function clearDeferred() { removeSession(deferredKey()); }
  function draftStep() {
    const draft = readSession(draftKey(), null);
    return STEPS.includes(draft?.step) ? draft.step : 'welcome';
  }

  function readDraft() {
    const draft = readSession(draftKey(), null);
    return draft?.version === 1 && draft?.userId === userId() ? draft : null;
  }
  function writeDraft(state) {
    if (state.saving || state.finished) return;
    writeSession(draftKey(), {
      version:1,userId:userId(),step:STEPS[state.index],highest:state.highest,
      account:clone(state.account),answers:clone(state.answers),controls:clone(state.controls),updatedAt:new Date().toISOString()
    });
  }
  function clearDraft() { removeSession(draftKey()); }

  function initialState(root, options = {}) {
    const viewer = identity()?.getViewerIdentity?.() || {};
    const preferences = identity()?.getPreferences?.('self') || {};
    const initialAnswers = schema()?.answersFromPreferences?.(preferences) || {};
    const draft = options.resume === false ? null : readDraft();
    const requestedStep = STEPS.includes(options.step) ? options.step : draft?.step;
    const index = Math.max(0, STEPS.indexOf(requestedStep || 'welcome'));
    const email = auth()?.email || auth()?.user?.email || '';
    return {
      root, options:{...options}, mode:options.mode === 'edit' ? 'edit' : 'first-use',
      index, highest:Math.max(index, Number(draft?.highest || 0)), transition:false, transitionId:0,
      account:{
        firstName:draft?.account?.firstName ?? viewer.firstName ?? '',
        lastName:draft?.account?.lastName ?? viewer.lastName ?? '',
        displayName:draft?.account?.displayName ?? viewer.displayName ?? '',
        homeLocation:draft?.account?.homeLocation ?? viewer.homeLocation ?? '',
        email, privacyAck:Boolean(draft?.account?.privacyAck || preferences.preferencesCompletedAt)
      },
      answers:clone(draft?.answers || initialAnswers),
      controls:{
        personalizedRecommendations:draft?.controls?.personalizedRecommendations ?? viewer.personalizedRecommendations !== false,
        activityData:draft?.controls?.activityData ?? viewer.activityData !== false,
        locationSharing:draft?.controls?.locationSharing ?? viewer.locationSharing === true,
        notifications:draft?.controls?.notifications ?? viewer.notifications === true
      },
      initialPreferences:preferences,saving:false,error:null,finished:false,cleanup:[],toastTimer:0
    };
  }

  function option(id) { return schema()?.option?.(id) || {id,label:id,icon:'✦',tone:'cream'}; }
  function selected(state, group) { return unique(state.answers[group]); }
  function optionButton(state, group, id) {
    const item = option(id); const on = selected(state, group).includes(id);
    return `<button type="button" class="lpo-choice ${on?'is-selected':''}" data-lpo-choice="${esc(id)}" data-lpo-group="${esc(group)}" aria-pressed="${on?'true':'false'}"><i aria-hidden="true">${esc(item.icon)}</i><span>${esc(item.label)}</span></button>`;
  }
  function choiceGroup(state, id, title, note, className = '') {
    const config = GROUPS[id];
    return `<section class="lpo-choice-card ${esc(className)}"><header><div><strong>${esc(title)}</strong><small>${esc(note)}</small></div><span data-lpo-count="${esc(id)}">${selected(state,id).length}${config.max?` / ${config.max}`:''}</span></header><div class="lpo-choice-cloud" role="group" aria-label="${esc(title)}">${config.items.map(item=>optionButton(state,id,item)).join('')}</div></section>`;
  }
  function toggleMarkup(state, key, icon, title, copy) {
    const on = Boolean(state.controls[key]);
    return `<label class="lpo-control-card ${on?'is-on':''}"><span class="lpo-control-icon" aria-hidden="true">${esc(icon)}</span><span><strong>${esc(title)}</strong><small>${esc(copy)}</small></span><input type="checkbox" data-lpo-control="${esc(key)}" ${on?'checked':''}><i aria-hidden="true"></i></label>`;
  }

  function compassMarkup(className = '') {
    return `<div class="lpo-compass ${esc(className)}" aria-hidden="true"><span class="lpo-compass-ring ring-a"></span><span class="lpo-compass-ring ring-b"></span><span class="lpo-compass-face"><img src="assets/public-landing/luvia-compass-face.svg" alt=""><span class="lpo-compass-needle"><img src="assets/public-landing/luvia-compass-needle.svg" alt=""></span><img class="lpo-compass-hub" src="assets/public-landing/luvia-compass-hub.svg" alt=""></span></div>`;
  }
  function welcomePanel(state) {
    return `<article class="lpo-panel lpo-welcome"><div class="lpo-story-copy"><span class="lpo-kicker">Deine Luvia</span><h1>Bevor eine Reise beginnt,<br><em>lernen wir dich kennen.</em></h1><p>Dein Konto schützt deine Reisen. Dein persönlicher Reisekompass sorgt dafür, dass Luvia später nicht irgendeine, sondern deine Art zu reisen versteht.</p><div class="lpo-promises"><span><i>✓</i>Konto und Reise bleiben getrennt</span><span><i>✓</i>Jede Angabe bleibt änderbar</span><span><i>✓</i>Keine stillen Profiländerungen</span></div></div><aside class="lpo-compass-preview">${compassMarkup('is-preview')}<span class="lpo-orbit-chip chip-a">Genuss</span><span class="lpo-orbit-chip chip-b">Natur</span><span class="lpo-orbit-chip chip-c">Gemeinsam</span><span class="lpo-orbit-chip chip-d">Entdecken</span><div class="lpo-ticket"><span>DEIN REISEKOMPASS</span><strong>Persönlich. Erklärbar. Unter deiner Kontrolle.</strong><small>Wirkt später in Places, Planung, Move und Luvia Intelligence.</small></div></aside></article>`;
  }
  function accountPanel(state) {
    return `<article class="lpo-panel lpo-form-panel"><header class="lpo-panel-copy"><span class="lpo-kicker">Ein sicherer Anfang</span><h1>Wie darf Luvia dich ansprechen?</h1><p>Diese Angaben gehören zu deiner Identität – nicht zu einer einzelnen Reise oder Reisegruppe.</p></header><form class="lpo-open-form" data-lpo-account novalidate><div class="lpo-name-grid"><label><span>Vorname</span><input name="firstName" autocomplete="given-name" value="${esc(state.account.firstName)}" required></label><label><span>Nachname</span><input name="lastName" autocomplete="family-name" value="${esc(state.account.lastName)}" placeholder="Optional"></label></div><label><span>Anzeigename</span><input name="displayName" autocomplete="nickname" value="${esc(state.account.displayName)}" required><small>So begrüßt dich Luvia in deiner persönlichen Reiseansicht.</small></label><label><span>E-Mail</span><input type="email" value="${esc(state.account.email)}" readonly aria-readonly="true"><small>Wird vom sicheren Auth-Owner verwaltet und hier nicht verändert.</small></label><label><span>Dein Zuhause</span><input name="homeLocation" autocomplete="address-level2" value="${esc(state.account.homeLocation)}" placeholder="z. B. Hamburg"><small>Optional – hilft später bei Abreise, Distanzen und passenden Vorschlägen.</small></label><label class="lpo-ack"><input type="checkbox" name="privacyAck" ${state.account.privacyAck?'checked':''} required><span><strong>Ich habe verstanden:</strong> Konto, globaler Reisekompass und konkrete Reisen bleiben getrennte Datenbereiche.</span></label></form></article>`;
  }
  function heartPanel(state) {
    return `<article class="lpo-panel lpo-selection-panel"><header class="lpo-panel-copy"><span class="lpo-kicker">Reisekompass · Werte</span><h1>Was macht Reisen für dich besonders?</h1><p>Wähle bis zu vier Werte und vier Reisegefühle. Sie gelten global, niemals als unveränderliche Schublade.</p></header><div class="lpo-composer">${choiceGroup(state,'interests','Was zieht dich an?','Mindestens eins · bis zu vier')}${choiceGroup(state,'travelStyles','Wie soll es sich anfühlen?','Mindestens eins · bis zu vier','is-soft')}</div></article>`;
  }
  function rhythmPanel(state) {
    const pace = selected(state,'pace')[0] || 'balanced'; const budget = selected(state,'budget')[0] || 'medium';
    return `<article class="lpo-panel lpo-selection-panel"><header class="lpo-panel-copy"><span class="lpo-kicker">Reisekompass · Rhythmus</span><h1>Wie bewegst du dich durch einen Reisetag?</h1><p>Tempo, Budget, Mobilität und Aktivitäten helfen Luvia bei Tagesdichte, Wegen und Alternativen. Für jeden Moment darfst du später anders entscheiden.</p></header><div class="lpo-composer lpo-rhythm"><section class="lpo-range-card"><header><strong>Dein Grundtempo</strong><output data-lpo-pace-output>${esc(option(`pace_${pace}`).label)}</output></header><input data-lpo-pace type="range" min="0" max="2" step="1" value="${PACE.indexOf(pace)}" aria-label="Reisetempo"><div><span>Viel Luft</span><span>Ausgewogen</span><span>Viel erleben</span></div></section><section class="lpo-segment-card"><strong>Budgetstil</strong><div role="radiogroup" aria-label="Budgetstil">${BUDGET.map(id=>`<button type="button" data-lpo-budget="${id}" class="${budget===id?'is-selected':''}" aria-pressed="${budget===id?'true':'false'}">${esc(option(id).label)}</button>`).join('')}</div></section>${choiceGroup(state,'mobilityPreferences','Bevorzugte Mobilität','Optional · mehrere möglich')}${choiceGroup(state,'activityPreferences','Aktivitäten','Mindestens eins · bis zu fünf','is-soft')}${choiceGroup(state,'entertainmentPreferences','Abend & Unterhaltung','Optional · bis zu vier')}</div></article>`;
  }
  function carePanel(state) {
    return `<article class="lpo-panel lpo-selection-panel"><header class="lpo-panel-copy"><span class="lpo-kicker">Reisekompass · Bedürfnisse</span><h1>Was soll Luvia zuverlässig berücksichtigen?</h1><p>Ernährung, Familie und Barrierefreiheit sind keine Dekoration. Bestätigte Anforderungen beeinflussen echte Filter und werden privat behandelt.</p></header><div class="lpo-composer lpo-care">${choiceGroup(state,'dietary','Ernährung','Mindestens eine Angabe','is-care')}${choiceGroup(state,'familyPreferences','Familie','Optional','is-care is-soft')}${choiceGroup(state,'accessibilityNeeds','Barrierefreiheit & Reizbedarf','Optional und privat','is-care')}</div></article>`;
  }
  function controlPanel(state) {
    return `<article class="lpo-panel lpo-selection-panel"><header class="lpo-panel-copy"><span class="lpo-kicker">Deine Daten, deine Entscheidung</span><h1>Wie persönlich darf Luvia werden?</h1><p>Luvia darf Hinweise erkennen, aber deinen Reisekompass nur nach deiner ausdrücklichen Bestätigung verändern.</p></header><div class="lpo-composer lpo-controls">${toggleMarkup(state,'personalizedRecommendations','✦','Personalisierte Vorschläge','Dein bestätigter Reisekompass darf Places, Planung, Move und Intelligence kontextualisieren.')}${toggleMarkup(state,'activityData','⌾','Lernhinweise zur Bestätigung','Wiederkehrende Entscheidungen dürfen als Vorschlag erscheinen. Übernommen wird erst nach deinem Ja.')}${toggleMarkup(state,'locationSharing','⌖','Standort nur bei Nutzung','Wird später über den LocationPort angefragt und kann jederzeit wieder entzogen werden.')}${toggleMarkup(state,'notifications','◌','Ruhige Benachrichtigungen','Relevante Intents statt Dauer-Push. Eine Geräteberechtigung wird hier noch nicht automatisch angefordert.')}<div class="lpo-owner-note"><span>✓</span><p><strong>Identity besitzt deinen Kompass.</strong> Trip, Places, Booking oder Intelligence dürfen Kontext lesen, aber keine parallele Profilwahrheit anlegen.</p></div></div></article>`;
  }
  function buildPreferences(state) { return schema()?.preferencesFromAnswers?.(state.answers,state.initialPreferences) || {}; }
  function readyPanel(state) {
    const preferences = buildPreferences(state); const chips = (schema()?.summary?.(preferences) || []).map(item=>item.label).slice(0,8);
    return `<article class="lpo-panel lpo-ready"><div class="lpo-ready-compass">${compassMarkup('is-result')}<div class="lpo-profile-shape" aria-hidden="true"></div>${chips.slice(0,4).map((chip,index)=>`<span class="lpo-orbit-chip result-${index+1}">${esc(chip)}</span>`).join('')}</div><div class="lpo-ready-copy"><span class="lpo-kicker">Dein Reisekompass</span><h1>Luvia kennt jetzt deine Richtung. Nicht deine Grenzen.</h1><p>Dein globales Profil ist bereit. Eine konkrete Reise mit Ort, Zeitraum und Mitreisenden entsteht erst im eigenständigen nächsten Schritt.</p><div class="lpo-ready-facts">${chips.map((chip,index)=>`<span><i>${['✦','↝','◎','⌾'][index%4]}</i><b>${esc(chip)}</b></span>`).join('')}</div>${state.error?`<div class="lpo-save-error" role="alert"><strong>Dein Kompass wurde noch nicht gespeichert.</strong><span>${esc(state.error)}</span></div>`:''}<button type="button" class="lpo-save" data-lpo-save ${state.saving?'disabled':''}>${state.saving?'Wird sicher gespeichert …':state.mode==='edit'?'Reisekompass aktualisieren':'Reisekompass speichern'} <span>${state.saving?'☁':'→'}</span></button><small class="lpo-owner-proof">Ein bestätigter Identity-Command · keine Reiseerstellung · kein stilles Lernen</small></div></article>`;
  }
  function panelMarkup(state) {
    return ({welcome:welcomePanel,account:accountPanel,heart:heartPanel,rhythm:rhythmPanel,care:carePanel,control:controlPanel,ready:readyPanel})[STEPS[state.index]](state);
  }
  function progressMarkup(state) {
    const labels = ['Ankommen','Konto','Reisegefühl','Rhythmus','Bedürfnisse','Kontrolle','Kompass'];
    const icons = ['♡','F','✦','↝','◎','⌾','✓'];
    return `<nav class="lpo-progress" aria-label="Fortschritt des Profil-Onboardings">${STEPS.map((step,index)=>`${index?'<b class="'+(index<=state.index?'is-complete':'')+'"></b>':''}<button type="button" data-lpo-progress="${index}" class="${index===state.index?'is-active':''} ${index<state.index?'is-complete':''}" ${index>state.highest?'disabled':''} aria-current="${index===state.index?'step':'false'}"><i>${icons[index]}</i><span>${labels[index]}</span></button>`).join('')}</nav>`;
  }
  function worldMarkup(state) {
    const active = STEP_SCENES[STEPS[state.index]];
    const scenes = [['morning','prototype-coast-morning.png'],['moving','prototype-coast-bike.png'],['together','prototype-harbor-lunch.png'],['memory','prototype-memory-sunset.png']];
    return `<div class="lpo-world" aria-hidden="true">${scenes.map(([id,file])=>`<figure class="${id===active?'is-active':''}" data-lpo-scene="${id}"><img src="assets/public-landing/${file}" alt=""></figure>`).join('')}<div class="lpo-world-wash"></div><div class="lpo-grain"></div><span class="lpo-travel-mark mark-route">⌁</span><span class="lpo-travel-mark mark-sun">✺</span><span class="lpo-travel-mark mark-memory">♡</span></div>`;
  }
  function render(state, {focus = false} = {}) {
    writeDraft(state);
    const step = STEPS[state.index]; const [eyebrow,title,label] = STEP_COPY[step];
    state.root.innerHTML = `<section class="lpo" data-profile-onboarding data-step="${step}" data-mode="${state.mode}">${worldMarkup(state)}<header class="lpo-header"><button type="button" class="lpo-brand" data-lpo-home aria-label="Luvia Profil-Onboarding schließen">${compassMarkup('is-brand')}<span><strong>LUVIA</strong><small>Reisen, die mit dir leben.</small></span></button><button type="button" class="lpo-quiet" data-lpo-defer>${state.mode==='edit'?'Ohne Änderungen schließen':'Später fortsetzen'}</button></header>${progressMarkup(state)}<main class="lpo-stage" aria-live="polite">${panelMarkup(state)}</main><footer class="lpo-footer"><button type="button" class="lpo-back" data-lpo-back ${state.index===0?'hidden':''}><span>←</span> Zurück</button><div><small>${esc(eyebrow)}</small><strong>${esc(title)}</strong></div><button type="button" class="lpo-next" data-lpo-next ${step==='ready'?'hidden':''}>${esc(label)} <span>→</span></button></footer><div class="lpo-toast" data-lpo-toast role="status" aria-live="polite" hidden><span>!</span><div><strong></strong><small></small></div></div></section>`;
    bind(state);
    requestAnimationFrame(()=>state.root.querySelector('.lpo')?.classList.add('is-ready'));
    if (focus) requestAnimationFrame(()=>state.root.querySelector('.lpo-panel input,.lpo-panel button,.lpo-panel h1')?.focus?.({preventScroll:true}));
  }

  function toast(state, title, message) {
    clearTimeout(state.toastTimer);
    const element = state.root.querySelector('[data-lpo-toast]'); if (!element) return;
    element.querySelector('strong').textContent = title; element.querySelector('small').textContent = message; element.hidden = false;
    state.toastTimer = setTimeout(()=>{ if(element.isConnected) element.hidden = true; },3200);
  }
  function syncAccount(state) {
    const form = state.root.querySelector('[data-lpo-account]'); if (!form) return;
    const data = new FormData(form);
    state.account.firstName = String(data.get('firstName') || '').trim();
    state.account.lastName = String(data.get('lastName') || '').trim();
    state.account.displayName = String(data.get('displayName') || '').trim();
    state.account.homeLocation = String(data.get('homeLocation') || '').trim();
    state.account.privacyAck = data.has('privacyAck');
    writeDraft(state);
  }
  function validate(state) {
    const step = STEPS[state.index];
    if (step === 'account') {
      syncAccount(state); const form = state.root.querySelector('[data-lpo-account]');
      if (!form?.reportValidity?.()) return false;
      if (!state.account.privacyAck) { toast(state,'Deine Entscheidung fehlt noch','Bestätige bitte die klare Trennung von Konto, Profil und Reise.'); return false; }
    }
    const required = step==='heart'?['interests','travelStyles']:step==='rhythm'?['activityPreferences']:step==='care'?['dietary']:[];
    const missing = required.find(group=>selected(state,group).length===0);
    if (missing) { toast(state,'Eine Richtung fehlt noch','Wähle in jedem verpflichtenden Bereich mindestens eine Antwort.'); return false; }
    return true;
  }
  function commitHistory(state, step, replace = false) {
    const contract = window.LuviaNavigationContractV1; const history = window.LuviaNavigationHistoryV1;
    if (!contract?.createIntent || !history?.project) return;
    const intent = contract.createIntent(ROUTE,{source:'profile-onboarding',replace,params:{profileStep:step,profileMode:state.mode,returnTo:state.options.returnTo||'today'}});
    history.project(intent,{replace,source:'profile-onboarding'});
  }
  function go(state, index, {skipValidation=false,history=true,focus=true} = {}) {
    if (state.transition || index<0 || index>=STEPS.length || index===state.index) return;
    if (index>state.index && !skipValidation && !validate(state)) return;
    const target = STEPS[index]; if (history) commitHistory(state,target,false);
    const id=++state.transitionId; state.transition=true;
    state.root.querySelector('.lpo-stage')?.classList.add(index>state.index?'is-leaving-forward':'is-leaving-back');
    setTimeout(()=>{ if(id!==state.transitionId)return;state.index=index;state.highest=Math.max(state.highest,index);state.transition=false;render(state,{focus}); },reduceMotion()?1:360);
  }
  function choose(state, group, value, button) {
    const config = GROUPS[group]; if (!config) return;
    const values = selected(state,group); const exists=values.includes(value);
    let next;
    if (config.neutral && value===config.neutral) next=exists?[]:[value];
    else {
      const base=config.neutral?values.filter(item=>item!==config.neutral):values;
      if(exists) next=base.filter(item=>item!==value);
      else if(base.length>=config.max){toast(state,'Auswahl vollständig',`Hier sind bis zu ${config.max} Antworten vorgesehen.`);return;}
      else next=[...base,value];
    }
    state.answers[group]=next;
    state.root.querySelectorAll(`[data-lpo-group="${CSS.escape(group)}"]`).forEach(item=>{const on=next.includes(item.dataset.lpoChoice);item.classList.toggle('is-selected',on);item.setAttribute('aria-pressed',String(on));});
    const count=state.root.querySelector(`[data-lpo-count="${CSS.escape(group)}"]`);if(count)count.textContent=`${next.length} / ${config.max}`;
    button?.animate?.([{transform:'scale(.96)'},{transform:'scale(1.02)'},{transform:''}],{duration:reduceMotion()?1:360,easing:'cubic-bezier(.2,.8,.2,1)'});
    writeDraft(state);
  }
  async function save(state) {
    if(state.saving)return;
    const owner=identity(); if(!owner?.commands?.completeOnboarding){state.error='Der Identity-Onboarding-Command ist noch nicht verfügbar.';render(state,{focus:true});return;}
    state.saving=true;state.error=null;render(state);
    try{
      const preferences=buildPreferences(state);
      const result=await owner.commands.completeOnboarding({
        profile:{firstName:state.account.firstName,lastName:state.account.lastName,displayName:state.account.displayName||state.account.firstName,homeLocation:state.account.homeLocation,...state.controls},
        preferences,mode:state.mode
      });
      state.saving=false;state.finished=true;clearDraft();clearDeferred();
      await state.options.onComplete?.(result);
    }catch(error){state.saving=false;state.error=error?.message||'Der Reisekompass konnte nicht sicher gespeichert werden.';render(state,{focus:true});}
  }
  function cancel(state) {
    if(state.saving)return;
    if(state.mode==='first-use')defer();
    state.options.onCancel?.({mode:state.mode,step:STEPS[state.index],dirty:Boolean(readDraft())});
  }
  function bind(state) {
    state.root.querySelector('[data-lpo-next]')?.addEventListener('click',()=>go(state,state.index+1));
    state.root.querySelector('[data-lpo-back]')?.addEventListener('click',()=>go(state,state.index-1,{skipValidation:true}));
    state.root.querySelectorAll('[data-lpo-progress]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.lpoProgress);if(index<=state.highest)go(state,index,{skipValidation:true});}));
    state.root.querySelectorAll('[data-lpo-choice]').forEach(button=>button.addEventListener('click',()=>choose(state,button.dataset.lpoGroup,button.dataset.lpoChoice,button)));
    state.root.querySelector('[data-lpo-account]')?.addEventListener('input',()=>syncAccount(state));
    state.root.querySelector('[data-lpo-pace]')?.addEventListener('input',event=>{const value=PACE[Number(event.target.value)]||'balanced';state.answers.pace=[value];state.root.querySelector('[data-lpo-pace-output]').textContent=option(`pace_${value}`).label;writeDraft(state);});
    state.root.querySelectorAll('[data-lpo-budget]').forEach(button=>button.addEventListener('click',()=>{state.answers.budget=[button.dataset.lpoBudget];state.root.querySelectorAll('[data-lpo-budget]').forEach(item=>{const on=item===button;item.classList.toggle('is-selected',on);item.setAttribute('aria-pressed',String(on));});writeDraft(state);}));
    state.root.querySelectorAll('[data-lpo-control]').forEach(input=>input.addEventListener('change',()=>{state.controls[input.dataset.lpoControl]=input.checked;input.closest('.lpo-control-card')?.classList.toggle('is-on',input.checked);writeDraft(state);}));
    state.root.querySelector('[data-lpo-save]')?.addEventListener('click',()=>save(state));
    state.root.querySelectorAll('[data-lpo-defer],[data-lpo-home]').forEach(button=>button.addEventListener('click',()=>cancel(state)));
    const keyHandler=event=>{
      if(event.key==='Escape'){event.preventDefault();cancel(state);return;}
      if(event.altKey&&event.key==='ArrowLeft'){event.preventDefault();go(state,state.index-1,{skipValidation:true});}
      if(event.altKey&&event.key==='ArrowRight'){event.preventDefault();go(state,state.index+1);}
    };
    state.root.addEventListener('keydown',keyHandler);state.cleanup.push(()=>state.root.removeEventListener('keydown',keyHandler));
  }
  function unmount() {
    if(!mounted)return false;
    clearTimeout(mounted.toastTimer);mounted.transitionId+=1;mounted.cleanup.forEach(fn=>{try{fn();}catch(_){}});
    mounted.root.classList.remove('lpo-host');if(mounted.options.clear!==false)mounted.root.innerHTML='';mounted=null;return true;
  }
  function mount(root, options = {}) {
    if(!root)throw new Error('PROFILE_ONBOARDING_ROOT_REQUIRED');
    if(!identity()?.commands?.completeOnboarding)throw new Error('IDENTITY_ONBOARDING_OWNER_UNAVAILABLE');
    unmount();root.classList.add('lpo-host');mounted=initialState(root,options);render(mounted);return Object.freeze({version:VERSION,snapshot:()=>clone({mode:mounted?.mode,step:mounted?STEPS[mounted.index]:null,highest:mounted?.highest,saving:mounted?.saving,error:mounted?.error}),destroy:unmount});
  }
  function open(options = {}) {
    const navigation=window.LuviaNavigationContractV1;const app=window.LuviaApp;
    if(!navigation?.createIntent||!app?.show)throw new Error('PROFILE_ONBOARDING_NAVIGATION_UNAVAILABLE');
    const mode=options.mode==='first-use'?'first-use':'edit';const returnTo=options.returnTo||app.activeView?.()||'today';
    const intent=navigation.createIntent(ROUTE,{source:'profile-onboarding-open',params:{profileStep:options.step||'welcome',profileMode:mode,returnTo}});
    return app.show(ROUTE,{intent,source:'profile-onboarding-open'});
  }

  window.LuviaProfileOnboarding=Object.freeze({version:VERSION,route:ROUTE,mount,unmount,open,shouldStart,defer,clearDeferred,draftStep});
})();
