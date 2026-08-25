(() => {
  'use strict';
  const VERSION='4.39.0';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const compassAssetBase='assets/brand/luvia-living-compass/layers';
  const compass=()=>`<span class="lv-plan-compass-mark" aria-hidden="true"><img class="lv-plan-compass-face" src="${compassAssetBase}/face.svg" alt=""><img class="lv-plan-compass-needle" src="${compassAssetBase}/two-ended-needle.svg" alt=""><img class="lv-plan-compass-hub" src="${compassAssetBase}/hub.svg" alt=""></span>`;
  const planIcon=icon=>({
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 4.3 4.3"/></svg>',
    heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3v5M16 3v5M4 10h16"/></svg>',
    ticket:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v3a2.5 2.5 0 0 0 0 5v3H4v-3a2.5 2.5 0 0 0 0-5Z"/><path d="M12 7v11"/></svg>',
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.4 4.8-5"/></svg>',
    wallet:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h15v10H4z"/><path d="M4 7.5V6h12v1.5M15 11h4v3h-4z"/></svg>',
    route:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17.5" r="2"/><circle cx="18" cy="6.5" r="2"/><path d="M8 17.5h2.5a2.5 2.5 0 0 0 2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5H16"/></svg>',
    cloud:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 18h10a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 6.4 9 4.5 4.5 0 0 0 6.5 18Z"/></svg>'
  })[icon]||'';
  const PLAN_FEATURES=Object.freeze([
    {title:'Places',description:'Suchen, Kategorien, Evidenz',icon:'search',action:'places',maturity:'active'},
    {title:'Meine Orte',description:'Gespeichert, geplant, besucht',icon:'heart',action:'places-lifecycle',maturity:'foundation'},
    {title:'Timeline',description:'Zum Tagesbogen hinzufügen',icon:'calendar',action:'timeline',maturity:'active'},
    {title:'Booking',description:'Anfragen, Antworten, Belege',icon:'ticket',action:'bookings',maturity:'active'},
    {title:'Checklisten',description:'Vorbereitung und unterwegs',icon:'check',action:'checklists',maturity:'reserved'},
    {title:'Budget',description:'Gemeinsame Reiseausgaben',icon:'wallet',action:'budget',maturity:'reserved'},
    {title:'Routen',description:'Etappen und externe Navigation',icon:'route',action:'routes',maturity:'foundation'},
    {title:'Wetter',description:'Kontext für eure Reise',icon:'cloud',action:'weather',maturity:'foundation'}
  ]);
  const tile=(x)=>`<button type="button" class="lv-hub-tile ${x.primary?'is-primary':''} ${x.preview?'is-preview':''}" data-hub-action="${esc(x.action||'')}" ${x.disabled?'disabled':''}><span class="lv-hub-icon">${x.icon}</span><span class="lv-hub-copy"><strong>${esc(x.title)}</strong><small>${esc(x.description)}</small>${x.meta?`<em>${esc(x.meta)}</em>`:''}</span><span class="lv-hub-arrow">${x.preview?'Demnächst':'→'}</span></button>`;
  function tripStats(trip){const id=trip?.id||trip?.tripId;const places=window.LuviaPlacesContractV1?.listPlaces?.({tripId:id})||[];const planned=places.filter(p=>p?.lifecycle==='planned'||p?.metadata?.plannedAt||p?.metadata?.tripPlace?.planned_at).length;return {places:places.length,planned};}
  function shell({eyebrow,title,description,hero,tiles,footer=''}){return `<section class="lv-hub"><header class="lv-hub-head"><span>${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></header>${hero||''}<div class="lv-hub-grid">${tiles.map(tile).join('')}</div>${footer}</section>`;}
  function plan(trip){const stats=tripStats(trip);return `<section class="lv-plan-compass-stage" data-plan-compass-stage aria-labelledby="lv-plan-compass-title">
    <div class="lv-plan-compass-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="lv-plan-compass-heading"><div><span>Luvia Living Compass</span><h1 id="lv-plan-compass-title">Welche Richtung soll die Planung nehmen?</h1><p>Alle Planen-Funktionen bleiben auffindbar; nur die passende Richtung steht im Vordergrund.</p></div><button type="button" class="lv-plan-compass-close" data-plan-compass-close aria-label="Kompass schließen und zu Heute zurückkehren">×</button></header>
    <div class="lv-plan-constellation">
      <span class="lv-plan-orbit lv-plan-orbit-a" aria-hidden="true"></span><span class="lv-plan-orbit lv-plan-orbit-b" aria-hidden="true"></span>
      <button type="button" class="lv-plan-compass-core" data-ai-ask-open data-luvia-experience-component="commandSurface" data-luvia-experience-role="livingCompass" aria-label="Luvia fragen">${compass()}<small>Luvia fragen</small></button>
      <nav class="lv-plan-directions" aria-label="Planen-Funktionen">${PLAN_FEATURES.map((feature,index)=>{const angle=-90+index*(360/PLAN_FEATURES.length);return `<button type="button" class="lv-plan-direction" data-hub-action="${esc(feature.action)}" data-maturity="${esc(feature.maturity)}" data-plan-angle="${angle}" style="--direction-angle:${angle}deg;--direction-counter:${-angle}deg;--direction-index:${index}"><i>${planIcon(feature.icon)}</i><span><strong>${esc(feature.title)}</strong><small>${esc(feature.description)}</small></span></button>`}).join('')}</nav>
    </div>
    <footer class="lv-plan-compass-footer"><div><button type="button" data-hub-action="language">Sprachhilfe · Horizont</button><button type="button" data-hub-action="community">Community · Horizont</button></div><p><span class="is-active"></span> aktiv <span class="is-foundation"></span> Foundation <span class="is-reserved"></span> geplant/reserviert · ${stats.planned?`${stats.planned} Orte geplant`:`${stats.places} Orte im Reisekontext`}</p></footer>
  </section>`;}
  function tripHub(activeTrip){return shell({eyebrow:'Unterwegs zusammen',title:'Eure Reise im Moment.',description:'Tagesablauf, Teilnehmer und Erlebnisse an einem Ort.',tiles:[
    {icon:'🗓️',title:'Tagesübersicht',description:'Was heute ansteht und was als Nächstes kommt.',action:'today',primary:true},
    {icon:'📅',title:'Timeline',description:'Alle Reisetage und geplanten Orte.',action:'timeline'},
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
  function render(view,activeTrip){if(view==='plan')return plan(activeTrip);if(view==='trip')return tripHub(activeTrip);if(view==='memories')return memories();if(view==='more')return more();return '';}
  window.LuviaModuleHubs=Object.freeze({version:VERSION,render,diagnostics:()=>({version:VERSION,hubs:['plan','trip','memories','more']})});
})();
