(()=>{
'use strict';

const VERSION='1.0.0';
let target=null,unsubs=[],clickHandler=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const port=id=>window.LuviaPlatformPorts?.get?.(id)||window.LuviaIdentityPlatformWebPorts?.[id]||null;
const yesNo=value=>value?'<span class="ic-status is-ready">Bereit</span>':'<span class="ic-status is-open">Offen</span>';
function model(){
  const identity=window.LuviaIdentityContractV1;
  const viewer=identity?.getViewerIdentity?.()||{};
  const preferences=identity?.getPreferences?.('self')||{};
  const core=window.LuviaIdentityDomainContractCoreV1;
  const summary=core?.preferenceSummary?.(preferences)||{selected:0,completed:false,schemaVersion:null};
  const completion=core?.completion?.({...viewer,...preferences})||0;
  const auth=port('AuthSessionPort')?.snapshot?.()||{};
  const secure=port('SecureStoragePort')?.diagnostics?.()||{};
  const notification=port('NotificationPort')?.status?.()||{supported:false,permission:'unsupported'};
  const ports=['StoragePort','SecureStoragePort','AuthSessionPort','NotificationPort'].map(id=>({id,ready:Boolean(port(id))}));
  return {identity,viewer,preferences,summary,completion,auth,secure,notification,ports,event:window.LuviaEventContractV1?.diagnostics?.()||null};
}
function portLabel(id){return({StoragePort:'Datenablage',SecureStoragePort:'Sicherer Speicher',AuthSessionPort:'Anmeldung',NotificationPort:'Mitteilungen'})[id]||id}
function render(){
  if(!target)return;
  let value;
  try{value=model()}catch(error){target.innerHTML=`<section class="ic-center"><div class="ic-error"><strong>Identity Center ist noch nicht bereit.</strong><span>${esc(error.message)}</span></div></section>`;return}
  const ready=value.ports.filter(item=>item.ready).length;
  const ring=Math.max(0,Math.min(100,value.completion));
  const notificationLabel=value.notification.permission==='granted'?'Erlaubt':value.notification.permission==='denied'?'Blockiert':value.notification.supported?'Noch nicht aktiviert':'Nicht unterstützt';
  target.innerHTML=`<section class="ic-center" aria-label="Identität und Datenschutz">
    <header class="ic-hero">
      <div><button class="ic-back" type="button" data-view="control-center">← Control Center</button><span class="ic-kicker">Identity Core · M8</span><h1>Deine Identität. Deine Entscheidungen.</h1><p>Profil, explizite Vorlieben, Anmeldung und Gerätefähigkeiten sind jetzt über stabile, native-fähige Verträge getrennt.</p><div class="ic-hero-actions"><button class="ic-primary" type="button" data-ic-preferences>Reisekompass öffnen</button><button type="button" data-profile-open="security">Sicherheit & Daten</button></div></div>
      <div class="ic-ring" style="--ic-progress:${ring * 3.6}deg"><div><strong>${ring}%</strong><span>Profilklarheit</span></div></div>
    </header>
    <section class="ic-trust-strip"><div><strong>${ready}/4</strong><span>Native Platform Ports</span></div><div><strong>${value.summary.selected}</strong><span>explizite Auswahlwerte</span></div><div><strong>v${esc(value.event?.envelopeVersion||'–')}</strong><span>Event Envelope</span></div><div><strong>${value.auth.authenticated?'Aktiv':'Inaktiv'}</strong><span>Auth Session</span></div></section>
    <section class="ic-grid">
      <article class="ic-card ic-wide"><div class="ic-card-head"><div><span class="ic-kicker">Klare Datenherkunft</span><h2>Vorlieben bleiben nachvollziehbar</h2></div>${yesNo(value.summary.completed)}</div><div class="ic-lanes">
        <div class="ic-lane is-explicit"><span>01</span><div><strong>Von dir festgelegt</strong><p>Globale Reisevorlieben gehören zur Identity Truth und werden nur über <code>identity.v1</code> geändert.</p><small>${value.summary.selected} Auswahlwerte · Schema ${esc(value.summary.schemaVersion||'–')}</small></div></div>
        <div class="ic-lane is-observed"><span>02</span><div><strong>Von Luvia beobachtet</strong><p>Lernsignale bleiben Intelligence-owned. Sie verändern dein Profil erst nach deiner ausdrücklichen Bestätigung.</p><small>Keine duplizierte Identity Truth</small></div></div>
      </div></article>
      <article class="ic-card"><div class="ic-card-head"><div><span class="ic-kicker">Konto</span><h2>${esc(value.viewer.displayName||'Luvia Profil')}</h2></div>${yesNo(value.auth.authenticated)}</div><p>${value.auth.authenticated?'Die aktive Sitzung wird vom Auth-Anbieter gehalten und über AuthSessionPort projiziert.':'Aktuell ist keine bestätigte Sitzung verfügbar.'}</p><dl><div><dt>Provider</dt><dd>${esc(value.auth.provider||'–')}</dd></div><div><dt>Session-Owner</dt><dd>Supabase Auth</dd></div><div><dt>Trip-Kontext</dt><dd>separater Trip Core</dd></div></dl></article>
      <article class="ic-card"><div class="ic-card-head"><div><span class="ic-kicker">Geräteschutz</span><h2>Plattformgerecht gespeichert</h2></div>${yesNo(Boolean(port('SecureStoragePort')))}</div><p>Web nutzt isolierten Origin-Speicher. Native Adapter können dieselben Verträge mit Keychain oder Keystore erfüllen.</p><dl><div><dt>Web-Schutz</dt><dd>${esc(value.secure.protection||'–')}</dd></div><div><dt>Hardware-backed</dt><dd>${value.secure.hardwareBacked?'Ja':'Web: nein'}</dd></div><div><dt>Token-Owner</dt><dd>${esc(value.secure.tokenOwner||'Auth Provider')}</dd></div></dl></article>
      <article class="ic-card"><div class="ic-card-head"><div><span class="ic-kicker">Mitteilungen</span><h2>${esc(notificationLabel)}</h2></div>${yesNo(value.notification.permission==='granted')}</div><p>Domain Events lösen niemals selbst Browser-Mitteilungen aus. Zustellung erfolgt ausschließlich nach einer expliziten Port-Aktion.</p>${value.notification.supported&&value.notification.permission==='default'?'<button class="ic-secondary" type="button" data-ic-notifications>Mitteilungen bewusst aktivieren</button>':''}<small class="ic-policy">Event → Intent → NotificationPort · keine automatische Zustellung</small></article>
      <article class="ic-card"><div class="ic-card-head"><div><span class="ic-kicker">Native Readiness</span><h2>Ein Vertrag, drei Plattformen</h2></div>${yesNo(ready===4)}</div><div class="ic-port-list">${value.ports.map(item=>`<div><span>${esc(portLabel(item.id))}</span>${yesNo(item.ready)}</div>`).join('')}</div><p class="ic-footnote">Web ist aktiv; iOS und Android erhalten plattformspezifische Adapter ohne Neuschreiben der Identity-Regeln.</p></article>
    </section>
    <section class="ic-events"><div><span class="ic-kicker">Cross-Core Events</span><h2>Versioniert, kausal, zustellungsneutral.</h2><p><code>booking.confirmed</code>, <code>place.saved</code>, <code>trip.completed</code> und <code>memory.created</code> teilen dasselbe Envelope – ohne Domain Truth oder UI Ownership zu verschieben.</p></div><span class="ic-event-badge">events.v1</span></section>
    <footer>Identity Center ${VERSION} · Identity Truth ≠ Trip Context ≠ Intelligence Signals</footer>
  </section>`;
}
async function onClick(event){
  if(event.target.closest('[data-ic-preferences]'))return window.LuviaProfileOnboarding?.open?.({mode:'edit',returnTo:'control-center-identity'});
  if(event.target.closest('[data-ic-notifications]')){await port('NotificationPort')?.requestPermission?.();render()}
}
function mount(element){
  if(!element)throw new Error('Identity Center target required.');
  target=element;clickHandler=event=>onClick(event).catch(error=>window.LuviaUIKit?.toast?.(error.message,{type:'error'}));target.addEventListener('click',clickHandler);
  unsubs=[window.LuviaIdentityContractV1?.subscribe?.(render),port('AuthSessionPort')?.subscribe?.(render)].filter(Boolean);render();return diagnostics();
}
function unmount(){unsubs.forEach(unsubscribe=>{try{unsubscribe()}catch{}});unsubs=[];if(target&&clickHandler)target.removeEventListener('click',clickHandler);clickHandler=null;target=null}
function diagnostics(){return Object.freeze({version:VERSION,mounted:Boolean(target),identityContract:Boolean(window.LuviaIdentityContractV1),eventContract:Boolean(window.LuviaEventContractV1),ports:['StoragePort','SecureStoragePort','AuthSessionPort','NotificationPort'].filter(id=>Boolean(port(id)))})}
window.LuviaIdentityCenter=Object.freeze({version:VERSION,mount,unmount,render,diagnostics});
})();
