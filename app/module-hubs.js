(() => {
  'use strict';
  const VERSION='4.41.0';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const compassAssetBase='assets/brand/luvia-living-compass/layers';
  const compass=()=>`<span class="lv-plan-compass-mark" aria-hidden="true"><img class="lv-plan-compass-face" src="${compassAssetBase}/face.svg" alt=""><img class="lv-plan-compass-needle" src="${compassAssetBase}/two-ended-needle.svg" alt=""><img class="lv-plan-compass-hub" src="${compassAssetBase}/hub.svg" alt=""></span>`;
  const planIcon=icon=>({
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 4.3 4.3"/></svg>',
    heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/></svg>',
    star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>',
    pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>',
    map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2Z"/><path d="M9 4v14M15 6v14"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3v5M16 3v5M4 10h16"/></svg>',
    ticket:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v3a2.5 2.5 0 0 0 0 5v3H4v-3a2.5 2.5 0 0 0 0-5Z"/><path d="M12 7v11"/></svg>',
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.4 4.8-5"/></svg>',
    wallet:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h15v10H4z"/><path d="M4 7.5V6h12v1.5M15 11h4v3h-4z"/></svg>',
    route:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17.5" r="2"/><circle cx="18" cy="6.5" r="2"/><path d="M8 17.5h2.5a2.5 2.5 0 0 0 2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5H16"/></svg>',
    cloud:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 18h10a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 6.4 9 4.5 4.5 0 0 0 6.5 18Z"/></svg>',
    sun:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17h12l-1.5-2v-4.5a4.5 4.5 0 0 0-9 0V15Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
    mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m5 8 7 5 7-5"/></svg>',
    document:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20H6Z"/><path d="M14 3.5V8h4M9 12h6M9 15.5h6"/></svg>',
    command:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M16 6.5a2.5 2.5 0 0 1 0 5M16.5 14c2.2.3 3.5 1.9 4 4"/></svg>',
    camera:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3"/></svg>',
    memory:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m6.5 17 4-4 2.7 2.5 2.3-2 2 3.5"/></svg>',
    shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.8 7.9-7 10-4.2-2.1-7-5.2-7-10V6Z"/><path d="m9 12 2 2 4-5"/></svg>',
    lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    spark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.8 5.2 3.8 8.2 9 9-5.2.8-8.2 3.8-9 9-.8-5.2-3.8-8.2-9-9 5.2-.8 8.2-3.8 9-9Z"/></svg>'
  })[icon]||'';
  const feature=(title,description,icon,action,maturity='active')=>Object.freeze({title,description,icon,action,maturity});
  const COMPASS_CONTEXTS=Object.freeze({
    today:Object.freeze({title:'Was braucht euer Tag gerade?',description:'Luvia verbindet das Naheliegende, ohne euch in Menüs festzuhalten.',features:Object.freeze([
      feature('Entdecken','Places · gerankte Orte','search','places'),feature('Timeline','Jetzt, als Nächstes und später','route','timeline'),feature('Buchungen','Booking · Status und Antworten','ticket','bookings'),feature('Hinweise','Wetter und Konflikte','bell','attention','foundation'),feature('Wallet','Belege · offline','wallet','wallet','reserved'),feature('Erinnern','Memory Cards und Stories','memory','memories'),feature('Gemeinsam','Rollen und Entscheidungen','users','participants','reserved'),feature('Luvia fragen','Intelligence · planen und handeln','spark','assistant','foundation')
    ]),horizons:Object.freeze([feature('Neue Reise','Horizont','spark','new-trip','reserved'),feature('Profilkompass','Horizont','heart','preferences','foundation')])}),
    plan:Object.freeze({title:'Welche Richtung soll die Planung nehmen?',description:'Alle Planen-Funktionen bleiben auffindbar; nur die passende Richtung steht im Vordergrund.',features:Object.freeze([
      feature('Places','Suchen, Kategorien, Evidenz','search','places'),feature('Meine Orte','Gespeichert, geplant, besucht','heart','places-lifecycle','foundation'),feature('Timeline','Ort verbindlich einplanen','calendar','timeline'),feature('Booking','Anfragen, Antworten, Belege','ticket','bookings'),feature('Checklisten','Vorbereitung und unterwegs','check','checklists','reserved'),feature('Budget','Gemeinsame Reiseausgaben','wallet','budget','reserved'),feature('Routen','Etappen und externe Navigation','route','routes','foundation'),feature('Wetter','Kontext statt separater Kachel','cloud','weather','foundation')
    ]),horizons:Object.freeze([feature('Sprachhilfe','Horizont','spark','language','reserved'),feature('Community','Horizont','users','community','reserved')])}),
    trip:Object.freeze({title:'Wo möchtet ihr eure Reise öffnen?',description:'Tagesdaten, Menschen und Erlebnisse werden genau dann sichtbar, wenn sie euch weiterhelfen.',features:Object.freeze([
      feature('Timeline','Alle Tage, Momente und offene Zeitfenster','calendar','timeline'),feature('Teilnehmer','Rollen, Votes, Einladungen','users','participants','reserved'),feature('Besuchte Orte','Places-Lifecycle','pin','places-lifecycle','foundation'),feature('Live-Momente','Foto, Ton oder Notiz','camera','capture','foundation'),feature('Reisedaten','Ziel, Zeitraum, Reisefarbe','map','trip-settings'),feature('Wallet','Dokumente und Belege offline','wallet','wallet','reserved'),feature('Booking','Status und Antworten','ticket','bookings'),feature('Hinweise','Wetter, Entscheidungen und Konflikte','bell','attention','foundation')
    ]),horizons:Object.freeze([feature('Reise bearbeiten','Horizont','map','trip-settings'),feature('Neue Reise','Horizont','spark','new-trip','reserved')])}),
    memories:Object.freeze({title:'Wie soll diese Reise weiterleben?',description:'Media bleibt Asset-Owner; Memory macht daraus bewusst ausgewählte Geschichten.',features:Object.freeze([
      feature('Story Studio','Kapitel, Beiträge, Publish','memory','memories'),feature('Memory Cards','Vorderseite, Rückseite, Ton','camera','memories'),feature('Fotoalben','Cover, Auswahl, Beiträge','heart','albums'),feature('Mediathek','Fotos, Videos, Upload Queue','camera','gallery'),feature('Moment bewahren','Foto, Ton, Video, Notiz','spark','capture','foundation'),feature('Erinnerungskarte','Orte und Day Keys','map','memory-map','foundation'),feature('Mitwirkende','Gemeinsam, privat, consentiert','users','participants','reserved'),feature('Reviews','Erlebt, verifiziert, Reputation','star','reviews','reserved')
    ]),horizons:Object.freeze([feature('Reisebuch exportieren','Horizont','memory','memory-export','reserved'),feature('Experience Drop','Horizont','spark','social-drop','reserved')])}),
    profile:Object.freeze({title:'Was möchtest du für dich ausrichten?',description:'Identität, Reisekompass und Kontrolle bleiben persönlich; Admin- und Domain-Rechte bleiben getrennt.',features:Object.freeze([
      feature('Profilkompass','Vorlieben und Travel DNA','heart','preferences'),feature('Reisen','Aktiv wechseln oder neu beginnen','map','trip-settings','foundation'),feature('Menschen','Einladungen und Rollen','users','participants','reserved'),feature('Hinweise','Ruhezeiten und Intents','bell','attention','reserved'),feature('Datenschutz','Freigaben und Kontrolle','shield','privacy','foundation'),feature('Lernsignale','Bestätigen oder verwerfen','spark','signals','foundation'),feature('Wallet','Dokumente und Export','wallet','wallet','reserved'),feature('Administration','Rollen und Systemsteuerung','lock','admin','reserved')
    ]),horizons:Object.freeze([feature('Account','Horizont','shield','account','reserved'),feature('Geräte','Horizont','lock','devices','reserved')])}),
    'control-center':Object.freeze({title:'Was soll Luvia für euch im Blick behalten?',description:'Identität, Buchungen, Unterlagen und operative Reisewege bleiben klar getrennt – und laufen hier kontrolliert zusammen.',features:Object.freeze([
      feature('Identität & Datenschutz','Profil, Freigaben, Kontrolle','shield','control-center-identity','foundation'),
      feature('Buchungen','Status, Antworten, Belege','ticket','control-center-bookings'),
      feature('Reiseunterlagen','Tickets, Nachweise, Dokumente','document','travel-documents','reserved'),
      feature('Inbox','Nachrichten und Rückfragen','mail','control-center-inbox'),
      feature('Trip Command','Reisestatus und nächste Schritte','command','trip-command','foundation'),
      feature('Wallet','Offline-Unterlagen und Export','wallet','wallet','reserved')
    ]),horizons:Object.freeze([])})
  });
  const tile=(x)=>`<button type="button" class="lv-hub-tile ${x.primary?'is-primary':''} ${x.preview?'is-preview':''}" data-hub-action="${esc(x.action||'')}" ${x.disabled?'disabled':''}><span class="lv-hub-icon">${x.icon}</span><span class="lv-hub-copy"><strong>${esc(x.title)}</strong><small>${esc(x.description)}</small>${x.meta?`<em>${esc(x.meta)}</em>`:''}</span><span class="lv-hub-arrow">${x.preview?'Demnächst':'→'}</span></button>`;
  function tripStats(trip){const id=trip?.id||trip?.tripId;const places=window.LuviaPlacesContractV1?.listPlaces?.({tripId:id})||[];const planned=places.filter(p=>p?.lifecycle==='planned'||p?.metadata?.plannedAt||p?.metadata?.tripPlace?.planned_at).length;return {places:places.length,planned};}
  function shell({eyebrow,title,description,hero,tiles,footer=''}){return `<section class="lv-hub"><header class="lv-hub-head"><span>${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></header>${hero||''}<div class="lv-hub-grid">${tiles.map(tile).join('')}</div>${footer}</section>`;}
  function compassStage(contextKey='plan',trip){const context=COMPASS_CONTEXTS[contextKey]||COMPASS_CONTEXTS.today,stats=tripStats(trip);return `<section class="lv-plan-compass-stage" data-plan-compass-stage data-living-compass-stage data-compass-navigation="direction-ring" data-compass-context="${esc(contextKey)}" aria-labelledby="lv-plan-compass-title">
    <div class="lv-plan-compass-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="lv-plan-compass-heading"><div><span>Luvia Living Compass · ${esc(contextKey==='memories'?'Erinnern':contextKey==='trip'?'Reise':contextKey==='today'?'Heute':contextKey==='profile'?'Profil':contextKey==='control-center'?'Control Center':'Planen')}</span><h1 id="lv-plan-compass-title">${esc(context.title)}</h1><p>${esc(context.description)}</p></div><button type="button" class="lv-plan-compass-close" data-plan-compass-close aria-label="Kompass schließen und zu Heute zurückkehren">×</button></header>
    <div class="lv-plan-constellation">
      <span class="lv-plan-orbit lv-plan-orbit-a" aria-hidden="true"></span><span class="lv-plan-orbit lv-plan-orbit-b" aria-hidden="true"></span><span class="lv-plan-orbit lv-plan-orbit-c" aria-hidden="true"></span><span class="lv-plan-orbit lv-plan-orbit-d" aria-hidden="true"></span>
      <button type="button" class="lv-plan-compass-core" data-compass-ai data-ai-ask-open data-luvia-experience-component="commandSurface" data-luvia-experience-role="livingCompass" aria-label="Luvia fragen">${compass()}<small>Luvia fragen</small></button>
      <nav class="lv-plan-directions" aria-label="Funktionen in ${esc(contextKey)}">${context.features.map((item,index)=>{const angle=-90+index*(360/context.features.length),exitIndex=context.features.length-1-index;return `<button type="button" class="lv-plan-direction" data-hub-action="${esc(item.action)}" data-compass-label="${esc(item.title)}" data-maturity="${esc(item.maturity)}" data-plan-angle="${angle}" style="--direction-angle:${angle}deg;--direction-counter:${-angle}deg;--direction-index:${index};--direction-exit-index:${exitIndex}" aria-label="${esc(item.title)}: ${esc(item.description)} · ${esc(item.maturity)}"><span class="lv-plan-direction-motion"><span class="lv-plan-direction-idle"><span class="lv-plan-direction-surface"><i>${planIcon(item.icon)}</i><span class="lv-plan-direction-copy"><strong>${esc(item.title)}</strong><small>${esc(item.description)}</small></span></span></span></span></button>`}).join('')}</nav>
    </div>
    <footer class="lv-plan-compass-footer"><div>${context.horizons.map(item=>`<button type="button" data-hub-action="${esc(item.action)}" data-compass-label="${esc(item.title)}" data-maturity="${esc(item.maturity)}" data-plan-angle="180">${esc(item.title)} · Horizont</button>`).join('')}</div><p><span class="is-active"></span> aktiv <span class="is-foundation"></span> Foundation <span class="is-reserved"></span> geplant/reserviert · ${stats.planned?`${stats.planned} Orte geplant`:`${stats.places} Orte im Reisekontext`}</p></footer>
  </section>`;}
  function tripHub(activeTrip){return shell({eyebrow:'Unterwegs zusammen',title:'Eure Reise im Moment.',description:'Tagesablauf, Teilnehmer und Erlebnisse an einem Ort.',tiles:[
    {icon:'📅',title:'Timeline',description:'Alle Reisetage, bestätigten Momente und freien Spuren.',action:'timeline',primary:true},
    {icon:'👥',title:'Teilnehmer',description:'Gemeinsam planen und den Reisestatus sehen.',action:'participants'},
    {icon:'📍',title:'Besuchte Orte',description:'Per GPS oder manuell bestätigte Erlebnisse.',action:'places-lifecycle'},
    {icon:'✨',title:'Live-Momente',description:'Kleine gemeinsame Momente während der Reise.',preview:true,disabled:true},
    {icon:'ℹ️',title:'Reisedaten',description:'Ziel, Zeitraum und zentrale Informationen.',action:'trip-settings'}
  ]});}
  function memories(){return shell({eyebrow:'Für immer erinnern',title:'Aus Momenten wird eure Geschichte.',description:'Fotos, Orte und gemeinsame Erinnerungen werden automatisch zu eurer Reisegeschichte zusammengeführt.',tiles:[
    {icon:'📸',title:'Fotogalerie',description:'Alle Reisefotos nach Tag und Ort sortiert.',action:'gallery',primary:true},
    {icon:'💛',title:'Memory Albums',description:'Aus Fotomomenten bewusst gestaltete Erinnerungen machen.',action:'albums'},
    {icon:'📖',title:'Reisebuch',description:'Aus Timeline, Orten und Momenten entsteht euer Buch.',action:'travel-book'},
    {icon:'🎞️',title:'Reise-Revue',description:'Eure Reise wie ein persönlicher Jahresrückblick.',action:'review'},
    {icon:'⭐',title:'Highlights',description:'Lieblingsorte und besondere gemeinsame Momente.',preview:true,disabled:true}
  ]});}
  function more(){return shell({eyebrow:'Luvia anpassen',title:'Alles Weitere an seinem Platz.',description:'Persönliche Einstellungen, Reisekompass und Verwaltung.',tiles:[
    {icon:'👤',title:'Profil',description:'Name, Foto und persönliche Angaben.',action:'profile',primary:true},
    {icon:'🧭',title:'Reisekompass',description:'Vorlieben, Reisestil und persönliche Wünsche.',action:'preferences'},
    {icon:'⚙️',title:'Reiseeinstellungen',description:'Reise bearbeiten, Teilnehmer und Module.',action:'trip-settings'},
    {icon:'🔔',title:'Benachrichtigungen',description:'Hinweise und Erinnerungen steuern.',preview:true,disabled:true},
    {icon:'📤',title:'Export',description:'Reisedaten und Erinnerungen später exportieren.',preview:true,disabled:true},
    {icon:'❓',title:'Hilfe',description:'Antworten und Unterstützung rund um Luvia.',preview:true,disabled:true}
  ]});}
  function render(view,activeTrip){if(view==='plan')return compassStage('plan',activeTrip);if(view==='trip')return tripHub(activeTrip);if(view==='memories')return memories();if(view==='more')return more();return '';}
  window.LuviaModuleHubs=Object.freeze({version:VERSION,render,renderCompass:(context,activeTrip)=>compassStage(context,activeTrip),contexts:()=>Object.keys(COMPASS_CONTEXTS),diagnostics:()=>({version:VERSION,hubs:['plan','trip','memories','more'],compassContexts:Object.keys(COMPASS_CONTEXTS)})});
})();
