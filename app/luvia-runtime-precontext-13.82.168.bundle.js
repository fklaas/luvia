/* Generated before LuviaTripContext by scripts/build-runtime-bundle.cjs. Domain ownership remains in the original source files. */

/* ===== intelligence/kernel/version.js ===== */
(()=>{'use strict';window.LuviaKernelVersion=Object.freeze({core:'4.82.235',build:'13.82.168.116',name:'M16.5 Places and Stays Quality',channel:'integration-preview',builtAt:'2026-09-06T08:28:41.124Z'});window.LuviaCoreVersion=window.LuviaKernelVersion;window.LUVIA_RELEASE=window.LuviaKernelVersion;})();

;

/* ===== intelligence/environment.js ===== */
(function(){
  'use strict';

  const VERSION = '2.5.2-myluvia-app-deployment';
  const PROD_HOSTS = new Set(['myluvia.app','www.myluvia.app']);
  const STAGING_HOSTS = new Set(['staging.myluvia.app']);

  function trimSlashes(value){ return String(value || '').replace(/^\/+|\/+$/g, ''); }
  function ensureTrailingSlash(value){ return String(value || '').replace(/\/+$/, '') + '/'; }
  function normalizePath(path){
    const value = String(path || '').trim();
    if (!value) return '';
    return value.replace(/^\.\//, '').replace(/^\/+/, '');
  }

  function detect(){
    const loc = window.location;
    const host = (loc.hostname || '').toLowerCase();
    const protocol = loc.protocol || 'https:';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || protocol === 'file:';
    const isGitHubPages = host.endsWith('.github.io');
    const isStaging = STAGING_HOSTS.has(host) || host.startsWith('staging.');
    const isProduction = PROD_HOSTS.has(host);
    const nativeBridge = Boolean(window.Capacitor?.isNativePlatform?.() || window.webkit?.messageHandlers?.luviaNative || window.LUVIA_NATIVE);
    const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;

    let basePath = '/';
    if (isGitHubPages) {
      const firstSegment = trimSlashes(loc.pathname).split('/')[0];
      basePath = firstSegment ? `/${firstSegment}/` : '/';
    }
    if (protocol === 'file:') basePath = './';

    const name = nativeBridge ? 'native-ios' : isProduction ? 'production' : isStaging ? 'staging' : isGitHubPages ? 'github-pages' : isLocal ? 'local' : 'custom';
    const origin = protocol === 'file:' ? '' : loc.origin;
    const baseUrl = protocol === 'file:' ? './' : new URL(basePath, origin + '/').href;

    return Object.freeze({
      version: VERSION,
      name,
      hostname: host,
      origin,
      basePath,
      baseUrl: ensureTrailingSlash(baseUrl),
      isLocal,
      isGitHubPages,
      isStaging,
      isProduction,
      isNative: nativeBridge,
      isPwa: Boolean(displayModeStandalone && !nativeBridge),
      isBrowser: !nativeBridge,
      secureContext: window.isSecureContext,
      online: navigator.onLine
    });
  }

  let current = detect();

  function refresh(){ current = detect(); return current; }
  function get(){ return current; }

  function resolveUrl(path = '', options = {}){
    const clean = normalizePath(path);
    if (/^(https?:|mailto:|tel:|data:|blob:|#)/i.test(String(path || ''))) return String(path);
    const base = options.originOnly ? ensureTrailingSlash(current.origin || current.baseUrl) : current.baseUrl;
    return new URL(clean, base).href;
  }

  function relativeUrl(path = ''){
    const absolute = resolveUrl(path);
    if (!current.origin || !absolute.startsWith(current.origin)) return absolute;
    return absolute.slice(current.origin.length) || '/';
  }

  function assetUrl(path){ return resolveUrl(path); }
  function appUrl(path){ return resolveUrl(path); }
  function authRedirectUrl(path = ''){
    const target = path || 'index.html';
    return resolveUrl(target);
  }

  function universalLink(path = ''){
    const clean = normalizePath(path);
    return new URL(clean, 'https://myluvia.app/').href;
  }

  function snapshot(){
    return {...current,
      appIndex: appUrl('index.html'),
      diagnostics: appUrl('intelligence/test.html'),
      futureConsole: appUrl('intelligence/console.html'),
      authRedirect: authRedirectUrl('index.html'),
      universalLinkBase: 'https://myluvia.app/',
      nativeScheme: 'myluvia://',
      canonicalOrigin: 'https://myluvia.app',
      canonicalUrl: universalLink('')
    };
  }

  window.LuviaEnvironment = Object.freeze({
    version: VERSION,
    current: get,
    refresh,
    resolveUrl,
    relativeUrl,
    assetUrl,
    appUrl,
    authRedirectUrl,
    universalLink,
    snapshot,
    isDevelopment: () => !current.isProduction,
    isProduction: () => current.isProduction,
    isPwa: () => current.isPwa,
    isNative: () => current.isNative
  });

  window.addEventListener('online', refresh);
  window.addEventListener('offline', refresh);
  window.dispatchEvent(new CustomEvent('luvia:environment-ready', {detail: snapshot()}));
})();

;

/* ===== core/identity/identity-domain-contract-core.js ===== */
var LuviaIdentityDomainContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const VIEWER_FIELDS=Object.freeze([
  'userId','displayName','firstName','lastName','avatarUrl','avatarColor','language','timezone','homeLocation',
  'themeMode','density','reducedMotion','useTripAccent','defaultView','showArchivedTrips',
  'personalizedRecommendations','activityData','locationSharing','notifications'
]);
const PUBLIC_FIELDS=Object.freeze(['userId','displayName','avatarUrl','avatarColor']);
const PROFILE_WRITE_FIELDS=Object.freeze(VIEWER_FIELDS.filter(field=>field!=='userId'));
const PREFERENCE_FIELDS=Object.freeze([
  'dietaryPreferences','travelInterests','travelStyles','activityPreferences','entertainmentPreferences',
  'diningPreferences','mobilityPreferences','atmospherePreferences','travelPace','budgetPreference',
  'familyPreferences','accessibilityPreferences','accessibilityNeeds','preferenceSchemaVersion',
  'preferencesCompletedAt','preferencesUpdatedAt'
]);
const PREFERENCE_LAYERS=Object.freeze({
  explicit:Object.freeze({owner:'identity',persistence:'profile-preferences',requiresConfirmation:false}),
  observed:Object.freeze({owner:'intelligence',persistence:'intelligence-memory',requiresConfirmation:true})
});
const STATE_DEFAULTS=Object.freeze({profile:null,loaded:false,syncing:false,error:null,lastSyncedAt:null});

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(value instanceof Error)return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object'||value instanceof Error)return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function contractError(code,message,extra={}){
  const error=new Error(message);
  error.code=code;
  Object.assign(error,extra);
  return error;
}
function project(input,fields){
  const source=input&&typeof input==='object'?input:{};
  return immutable(Object.fromEntries(fields.map(field=>[field,source[field]===undefined?null:clone(source[field])])));
}
function sanitize(patch,fields,kind){
  if(!patch||typeof patch!=='object'||Array.isArray(patch)){
    throw contractError(`IDENTITY_CONTRACT_${kind}_PATCH_REQUIRED`,`${kind} patch must be an object.`);
  }
  const allowed=new Set(fields);
  const output={};
  for(const [field,value] of Object.entries(patch)){
    if(!allowed.has(field))throw contractError(`IDENTITY_CONTRACT_${kind}_FIELD_NOT_ALLOWED`,`${kind} field not allowed: ${field}`,{field});
    output[field]=clone(value);
  }
  return output;
}
function projectViewer(input={}){return project(input,VIEWER_FIELDS)}
function projectPublic(input={}){return project(input,PUBLIC_FIELDS)}
function projectPreferences(input={}){return project(input,PREFERENCE_FIELDS)}
function sanitizeProfilePatch(patch={}){return sanitize(patch,PROFILE_WRITE_FIELDS,'PROFILE')}
function sanitizePreferencePatch(patch={}){return sanitize(patch,PREFERENCE_FIELDS,'PREFERENCE')}
function normalizeDashboardLayout(items=[]){
  if(!Array.isArray(items))throw contractError('IDENTITY_CONTRACT_DASHBOARD_LAYOUT_REQUIRED','Dashboard layout must be an array.');
  return immutable(items.map((item,index)=>{
    const id=String(item?.id||'').trim();
    if(!id)throw contractError('IDENTITY_CONTRACT_DASHBOARD_LAYOUT_ID_REQUIRED','Dashboard item id is required.');
    return {id,enabled:item?.enabled!==false,position:Number.isInteger(item?.position)?item.position:index};
  }).sort((left,right)=>left.position-right.position).map((item,position)=>({...item,position})));
}
function classifyPreferenceLayer(input={}){
  const source=String(input.source||input.provenance||'').toLowerCase();
  const status=String(input.status||'').toLowerCase();
  const observed=Boolean(input.observed===true||['observed','inferred','learned','signal'].some(token=>source.includes(token))||status==='inferred');
  return observed?'observed':'explicit';
}
function preferenceSummary(input={}){
  const value=input&&typeof input==='object'?input:{};
  const collections=['dietaryPreferences','travelInterests','travelStyles','activityPreferences','entertainmentPreferences','diningPreferences','mobilityPreferences','atmospherePreferences','accessibilityNeeds'];
  const selected=collections.reduce((total,field)=>total+(Array.isArray(value[field])?value[field].length:0),0);
  return Object.freeze({layer:'explicit',selected,completed:Boolean(value.preferencesCompletedAt),schemaVersion:Number(value.preferenceSchemaVersion||0)||null});
}
function completion(input={}){
  const value=input&&typeof input==='object'?input:{};
  const fields=[value.displayName,value.homeLocation,value.timezone,(value.dietaryPreferences||[]).length||1,(value.travelInterests||[]).length,(value.travelStyles||[]).length,(value.activityPreferences||[]).length,value.travelPace,value.budgetPreference];
  return Math.round(fields.filter(Boolean).length/fields.length*100);
}
function createIdentityState(initial={}){
  let state={...STATE_DEFAULTS,...clone(initial)};
  function normalize(next){
    return {...STATE_DEFAULTS,...clone(next),profile:next?.profile==null?null:clone(next.profile),error:next?.error||null};
  }
  function snapshot(){return immutable({...state,profile:state.profile==null?null:clone(state.profile)})}
  function replace(next={}){state=normalize(next);return snapshot()}
  function patch(next={}){state=normalize({...state,...next});return snapshot()}
  return Object.freeze({snapshot,replace,patch});
}

return Object.freeze({
  version:VERSION,runtimeVersion:RUNTIME_VERSION,viewerFields:VIEWER_FIELDS,publicFields:PUBLIC_FIELDS,
  profileWriteFields:PROFILE_WRITE_FIELDS,preferenceFields:PREFERENCE_FIELDS,preferenceLayers:PREFERENCE_LAYERS,
  projectViewer,projectPublic,projectPreferences,sanitizeProfilePatch,sanitizePreferencePatch,normalizeDashboardLayout,
  classifyPreferenceLayer,preferenceSummary,completion,createIdentityState
});
})();

;

/* ===== core/events/event-contract-core.js ===== */
var LuviaEventContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const CONTRACT_ID='events.v1';
const ENVELOPE_VERSION='1';
const DEFINITIONS=Object.freeze({
  'identity.changed':Object.freeze({owner:'identity',notification:false}),
  'preferences.changed':Object.freeze({owner:'identity',notification:false}),
  'booking.confirmed':Object.freeze({owner:'booking',notification:true}),
  'place.saved':Object.freeze({owner:'places',notification:false}),
  'trip.completed':Object.freeze({owner:'trip',notification:true}),
  'memory.created':Object.freeze({owner:'media',notification:true}),
  'notification.intent.created':Object.freeze({owner:'platform',notification:false})
});

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
const text=value=>value==null?null:String(value);
function definition(name){return DEFINITIONS[String(name)]||null}
function createEnvelope(name,payload={},meta={},providers={}){
  const eventName=String(name||'').trim();
  if(!eventName||!eventName.includes('.'))throw new TypeError('Versioned event name required.');
  const now=typeof providers.now==='function'?providers.now():new Date().toISOString();
  const id=typeof providers.id==='function'?providers.id():`evt-${String(now).replace(/[^0-9A-Za-z]/g,'')}-${Math.random().toString(36).slice(2,10)}`;
  const registered=definition(eventName);
  return immutable({
    contractId:CONTRACT_ID,envelopeVersion:ENVELOPE_VERSION,id:text(id),name:eventName,occurredAt:text(now),
    source:text(meta.source||registered?.owner||'unknown'),owner:text(meta.owner||registered?.owner||null),
    subject:text(meta.subject),actorId:text(meta.actorId),correlationId:text(meta.correlationId),causationId:text(meta.causationId),
    domainContractId:text(meta.domainContractId),domainVersion:text(meta.domainVersion),notificationEligible:Boolean(registered?.notification),
    payload:payload&&typeof payload==='object'?payload:{value:payload}
  });
}
function validateEnvelope(envelope){
  const errors=[];
  if(envelope?.contractId!==CONTRACT_ID)errors.push('contractId');
  if(envelope?.envelopeVersion!==ENVELOPE_VERSION)errors.push('envelopeVersion');
  for(const field of ['id','name','occurredAt','source'])if(!envelope?.[field])errors.push(field);
  return Object.freeze({valid:errors.length===0,errors:Object.freeze(errors)});
}
function createNotificationIntent(envelope,presentation={}){
  const validation=validateEnvelope(envelope);
  if(!validation.valid)throw new TypeError(`Invalid source event envelope: ${validation.errors.join(', ')}`);
  return createEnvelope('notification.intent.created',{
    sourceEventId:envelope.id,sourceEventName:envelope.name,title:text(presentation.title),body:text(presentation.body),
    deepLink:presentation.deepLink&&typeof presentation.deepLink==='object'?presentation.deepLink:null
  },{source:'platform',owner:'platform',correlationId:envelope.correlationId,causationId:envelope.id},presentation.providers||{});
}

return Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,envelopeVersion:ENVELOPE_VERSION,
  definitions:DEFINITIONS,definition,createEnvelope,validateEnvelope,createNotificationIntent,
  deliveryPolicy:'explicit-notification-port-only'
});
})();

;

/* ===== auth/config.js ===== */
(() => {
  'use strict';
  if (!window.LuviaEnvironment?.authRedirectUrl) throw new Error('Luvia Environment fehlt vor der Auth-Konfiguration.');
  const redirectUrl = window.LuviaEnvironment.authRedirectUrl('index.html');
  const config = Object.freeze({
    url: 'https://yiadkcxgyzdgyadnhyqe.supabase.co',
    publishableKey: 'sb_publishable_RMrTCl-8az9LV2y8OAGPEw_dy3ioVOs',
    redirectUrl
  });
  // Canonical Luvia namespace. Paris* remains a read-compatible alias during migration phase 1.
  window.LuviaSupabaseConfig = config;
  window.ParisSupabaseConfig = config;
  window.LUVIA_AUTH_CONFIG = Object.freeze({
    supabaseUrl: config.url,
    publishableKey: config.publishableKey,
    redirectUrl
  });
})();

;

/* ===== core/runtime/auth-command-contract-core.js ===== */
var LuviaAuthCommandContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='auth.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const MODES=Object.freeze(['login','register']);
const PROVIDERS=Object.freeze(['google','apple']);
const clean=value=>String(value??'').trim();

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
function failure(code,message){throw Object.assign(new Error(message),{code})}
function mode(value){
  const normalized=clean(value).toLowerCase();
  if(!MODES.includes(normalized))failure('AUTH_MODE_INVALID','Anmeldemodus muss login oder register sein.');
  return normalized;
}
function provider(value){
  const normalized=clean(value).toLowerCase();
  if(!PROVIDERS.includes(normalized))failure('AUTH_PROVIDER_INVALID','Nur Google oder Apple sind als Anmeldeanbieter erlaubt.');
  return normalized;
}
function email(value){
  const normalized=clean(value).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))failure('AUTH_EMAIL_INVALID','Bitte eine gültige E-Mail-Adresse angeben.');
  return normalized;
}
function password(value){
  const normalized=String(value??'');
  if(normalized.length<6)failure('AUTH_PASSWORD_INVALID','Das Passwort muss mindestens 6 Zeichen lang sein.');
  return normalized;
}
function profile(input={}){
  return immutable({
    firstName:clean(input.firstName).slice(0,80),
    lastName:clean(input.lastName).slice(0,80),
    displayName:clean(input.displayName).slice(0,120),
    preferences:input.preferences&&typeof input.preferences==='object'?clone(input.preferences):null,
    travelIdea:input.travelIdea&&typeof input.travelIdea==='object'?clone(input.travelIdea):null
  });
}
function createModeIntent(value){
  const selected=mode(value);
  return immutable({kind:'auth.mode.select',contractId:CONTRACT_ID,version:VERSION,mode:selected,stateChanging:false,requiresConfirmation:false});
}
function projectState(input={}){
  const user=input.user||{};
  const pending=input.pendingUpgrade||null;
  return immutable({
    loading:Boolean(input.loading),
    anonymous:Boolean(input.anonymous),
    authenticated:Boolean(input.authenticated),
    signedOut:Boolean(input.signedOut),
    email:clean(input.email||user.email||pending?.email).toLowerCase(),
    emailConfirmed:Boolean(input.emailConfirmed),
    provider:clean(input.provider),
    providers:(Array.isArray(input.identities)?input.identities:[]).map(identity=>clean(identity?.provider)).filter(Boolean),
    user:user?.id?{
      id:clean(user.id),
      email:clean(user.email).toLowerCase(),
      displayName:clean(user.user_metadata?.display_name||user.user_metadata?.name),
      firstName:clean(user.user_metadata?.first_name),
      lastName:clean(user.user_metadata?.last_name)
    }:null,
    pendingUpgrade:pending?{
      email:clean(pending.email).toLowerCase(),
      firstName:clean(pending.firstName),
      lastName:clean(pending.lastName),
      displayName:clean(pending.displayName),
      stage:clean(pending.stage),
      requestedAt:clean(pending.requestedAt),
      confirmedAt:clean(pending.confirmedAt)
    }:null,
    lastEvent:clean(input.lastEvent)
  });
}
function receipt(action,state,details={}){
  return immutable({ok:true,action:clean(action),contractId:CONTRACT_ID,version:VERSION,state:projectState(state),details:clone(details)});
}
function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,modes:MODES,providers:PROVIDERS,sensitiveOutput:Object.freeze([])});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,modes:MODES,providers:PROVIDERS,mode,provider,email,password,profile,createModeIntent,projectState,receipt,diagnostics});
})();

;

/* ===== auth/session.js ===== */
(() => {
  'use strict';

  let client = null;
  let initialized = false;
  let initPromise = null;
  let authSubscription = null;
  const listeners = new Set();
  const state = { session: null, user: null, loading: true, lastEvent: null };

  const PENDING_KEY = 'luviaAuthPendingUpgradeV2';
  const SIGNED_OUT_KEY = 'luviaAuthExplicitlySignedOutV1';
  const LEGACY_PENDING_KEY = 'parisAuthPendingUpgradeV2';
  const LEGACY_SIGNED_OUT_KEY = 'parisAuthExplicitlySignedOutV1';

  const volatileValues = new Map();
  const volatileStorage = Object.freeze({
    get:(key,fallback=null)=>volatileValues.has(String(key))?volatileValues.get(String(key)):fallback,
    set:(key,value)=>{volatileValues.set(String(key),value);return value},
    remove:key=>volatileValues.delete(String(key))
  });
  const secureStorage = () => window.LuviaPlatformPorts?.get?.('SecureStoragePort') || window.LuviaIdentityPlatformWebPorts?.SecureStoragePort || volatileStorage;
  const appStorage = () => window.LuviaPlatformPorts?.get?.('StoragePort') || window.LuviaIdentityPlatformWebPorts?.StoragePort || volatileStorage;

  function migrateLegacyAuthStorage() {
    try {
      const port=secureStorage();
      if (port.get(PENDING_KEY, null) == null && port.get(LEGACY_PENDING_KEY, null) != null) {
        port.set(PENDING_KEY, port.get(LEGACY_PENDING_KEY, null));
      }
      if (port.get(SIGNED_OUT_KEY, null) == null && port.get(LEGACY_SIGNED_OUT_KEY, null) != null) {
        port.set(SIGNED_OUT_KEY, port.get(LEGACY_SIGNED_OUT_KEY, null));
      }
    } catch (_) {}
  }
  migrateLegacyAuthStorage();

  function readPending() {
    try { return secureStorage().get(PENDING_KEY, null); }
    catch (_) { return null; }
  }
  function writePending(value) {
    if (value) {
      secureStorage().set(PENDING_KEY, value);
      secureStorage().set(LEGACY_PENDING_KEY, value);
    } else {
      secureStorage().remove(PENDING_KEY);
      secureStorage().remove(LEGACY_PENDING_KEY);
    }
  }
  function isExplicitlySignedOut() {
    const values=[secureStorage().get(SIGNED_OUT_KEY, false),secureStorage().get(LEGACY_SIGNED_OUT_KEY, false)];
    return values.some(value=>value===true||value===1||value==='1');
  }
  function setExplicitlySignedOut(value) {
    if (value) {
      secureStorage().set(SIGNED_OUT_KEY, true);
      secureStorage().set(LEGACY_SIGNED_OUT_KEY, true);
    } else {
      secureStorage().remove(SIGNED_OUT_KEY);
      secureStorage().remove(LEGACY_SIGNED_OUT_KEY);
    }
  }
  function isAnonymousUser(user) {
    if (!user) return false;
    const identities = Array.isArray(user.identities) ? user.identities : [];
    const hasPermanentIdentity = identities.some(identity => identity?.provider && identity.provider !== 'anonymous');
    const hasEmailIdentity = Boolean(user.email) || identities.some(identity => identity?.provider === 'email');
    return !hasPermanentIdentity && !hasEmailIdentity;
  }
  function isPermanentUser(user) {
    return Boolean(user && !isAnonymousUser(user));
  }
  function notify() {
    const snapshot = getState();
    listeners.forEach(fn => { try { fn(snapshot); } catch (e) { console.warn('LuviaAuth listener', e); } });
    document.dispatchEvent(new CustomEvent('luvia:auth-changed', { detail: snapshot }));
    // Compatibility event for legacy modules during phase 1.
    document.dispatchEvent(new CustomEvent('paris:auth-changed', { detail: snapshot }));
  }
  function getState() {
    const user = state.user;
    const anonymous = isAnonymousUser(user);
    // Ein alter Wizard-Eintrag darf ein bereits bestätigtes Konto niemals wieder
    // in den Assistenten zurückschicken. Pending ist nur für echte anonyme User relevant.
    const pending = anonymous ? readPending() : null;
    return {
      session: state.session,
      user,
      loading: state.loading,
      anonymous,
      authenticated: Boolean(user && !anonymous),
      signedOut: Boolean(!user && isExplicitlySignedOut()),
      email: user?.email || pending?.email || '',
      emailConfirmed: Boolean(user?.email_confirmed_at || user?.confirmed_at),
      provider: user?.app_metadata?.provider || ((user?.identities || []).find(x => x?.provider !== 'anonymous')?.provider) || (anonymous ? 'anonymous' : ''),
      identities: user?.identities || [],
      lastEvent: state.lastEvent,
      pendingUpgrade: pending
    };
  }
  async function setFromSession(session, event) {
    state.session = session || null;
    state.user = session?.user || null;
    state.loading = false;
    state.lastEvent = event || null;
    if (isPermanentUser(state.user)) {
      setExplicitlySignedOut(false);
      writePending(null);
    }
    notify();
  }
  async function init(supabaseClient) {
    if (initialized && !state.loading) return getState();
    if (initPromise) return initPromise;
    client = supabaseClient;
    initialized = true;
    initPromise = (async () => {
      const initial = await client.auth.getSession();
      if (initial.error) throw initial.error;
      const initialSession = initial.data.session || null;
      const listener = client.auth.onAuthStateChange((event, nextSession) => {
        Promise.resolve().then(() => setFromSession(nextSession, event));
      });
      authSubscription = listener?.data?.subscription || null;
      // Eine lokal gespeicherte, signierte Sitzung darf den ersten sichtbaren App-Frame
      // nicht von einem Netzwerk-Roundtrip abhängig machen. Supabase/RLS bleibt für alle
      // Datenzugriffe maßgeblich; nur das aktuelle User-Objekt wird im Hintergrund erneuert.
      await setFromSession(initialSession, 'INITIAL_SESSION');
      if (initialSession && typeof client.auth.getUser === 'function') {
        const expectedUserId = initialSession.user?.id || null;
        Promise.resolve().then(async () => {
          let fresh;
          try { fresh = await client.auth.getUser(); }
          catch (error) {
            console.warn('LuviaAuth background user refresh', error);
            return;
          }
          if (fresh?.error || !fresh?.data?.user || !state.session) return;
          if (expectedUserId && state.user?.id !== expectedUserId) return;
          await setFromSession({ ...state.session, user: fresh.data.user }, 'USER_REFRESHED');
        }).catch(error => console.warn('LuviaAuth background user refresh', error));
      }
      return getState();
    })();
    try {
      return await initPromise;
    } catch (error) {
      initialized = false;
      client = null;
      throw error;
    } finally {
      initPromise = null;
    }
  }
  async function ensureInitialSession(supabaseClient) {
    await init(supabaseClient);
    const current = await supabaseClient.auth.getSession();
    if (current.error) throw current.error;
    const session = current.data.session || null;
    // Kein automatischer anonymer Login mehr. Ohne gespeicherte Sitzung bleibt die
    // App abgemeldet, bis bewusst ein Login oder „Ohne Konto fortfahren“ gewählt wird.
    await setFromSession(session, session ? 'ENSURE_SESSION' : 'SIGNED_OUT_SESSION');
    return session;
  }
  function requireClient() {
    if (!client) throw new Error('Authentifizierung ist noch nicht bereit.');
    return client;
  }
  async function refreshCurrentUser() {
    const c = requireClient();
    const sessionResult = await c.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    if (!sessionResult.data.session) {
      await setFromSession(null, 'USER_REFRESHED_SIGNED_OUT');
      return null;
    }
    const result = await c.auth.getUser();
    if (result.error) throw result.error;
    const freshSession = await c.auth.getSession();
    if (freshSession.error) throw freshSession.error;
    const mergedSession = freshSession.data.session
      ? { ...freshSession.data.session, user: result.data.user }
      : null;
    await setFromSession(mergedSession, 'USER_REFRESHED');
    return result.data.user;
  }
  async function signIn(email, password) {
    const result = await requireClient().auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || '')
    });
    if (result.error) throw result.error;
    setExplicitlySignedOut(false);
    writePending(null);
    await setFromSession(result.data.session, 'SIGNED_IN');
    return result.data;
  }
  async function signUp({ email, password, firstName, lastName, displayName, preferences = null, travelIdea = null }) {
    const name = String(displayName || `${firstName || ''} ${lastName || ''}`).trim();
    const result = await requireClient().auth.signUp({
      email: String(email || '').trim(),
      password: String(password || ''),
      options: {
        emailRedirectTo: (window.LuviaSupabaseConfig || window.ParisSupabaseConfig).redirectUrl,
        data: { first_name: firstName || '', last_name: lastName || '', display_name: name, luvia_preferences: preferences || undefined, preference_schema_version: preferences?.preferenceSchemaVersion || preferences?.preferenceVersion || 3, travel_idea: travelIdea || undefined, onboarding_completed_at: preferences?.preferencesCompletedAt || preferences?.travelPreferences?.onboardingCompletedAt || null }
      }
    });
    if (result.error) throw result.error;
    setExplicitlySignedOut(false);
    if (result.data.session) await setFromSession(result.data.session, 'SIGNED_UP');
    return result.data;
  }
  async function requestAnonymousEmail({ email, firstName, lastName, displayName }) {
    const current = getState();
    if (!current.user) throw new Error('Keine aktive Anmeldung gefunden.');
    if (!current.anonymous && !current.pendingUpgrade) throw new Error('Dieses Konto ist bereits dauerhaft gesichert.');
    const cleanEmail = String(email || '').trim().toLowerCase();
    const name = String(displayName || `${firstName || ''} ${lastName || ''}`).trim();
    const payload = {
      email: cleanEmail,
      firstName: String(firstName || ''),
      lastName: String(lastName || ''),
      displayName: name,
      userId: current.user.id,
      requestedAt: new Date().toISOString(),
      stage: 'email-sent'
    };
    const result = await requireClient().auth.updateUser({
      email: cleanEmail,
      data: { first_name: payload.firstName, last_name: payload.lastName, display_name: name }
    }, { emailRedirectTo: (window.LuviaSupabaseConfig || window.ParisSupabaseConfig).redirectUrl });
    if (result.error) throw result.error;
    writePending(payload);
    notify();
    return result.data;
  }
  async function checkUpgradeConfirmation() {
    const pending = readPending();
    if (!pending) return { confirmed: false, user: getState().user };
    const user = await refreshCurrentUser();
    const confirmed = Boolean(
      user?.email &&
      String(user.email).toLowerCase() === String(pending.email).toLowerCase() &&
      (user.email_confirmed_at || user.confirmed_at) &&
      !isAnonymousUser(user)
    );
    if (confirmed) {
      writePending({ ...pending, stage: 'email-confirmed', confirmedAt: new Date().toISOString() });
      notify();
    }
    return { confirmed, user };
  }
  async function completeAnonymousUpgrade(password) {
    const pending = readPending();
    if (!pending) throw new Error('Es wurde keine laufende Kontosicherung gefunden.');
    const checked = await checkUpgradeConfirmation();
    if (!checked.confirmed) throw new Error('Die E-Mail-Adresse ist noch nicht bestätigt. Öffne zuerst den Link aus der E-Mail.');
    const result = await requireClient().auth.updateUser({ password: String(password || '') });
    if (result.error) throw result.error;
    writePending(null);
    setExplicitlySignedOut(false);
    const sessionResult = await requireClient().auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    const nextSession = sessionResult.data.session
      ? { ...sessionResult.data.session, user: result.data.user || sessionResult.data.session.user }
      : null;
    await setFromSession(nextSession, 'ACCOUNT_UPGRADED');
    await refreshCurrentUser();
    return result.data;
  }
  function cancelPendingUpgrade() { writePending(null); notify(); }
  async function resetPassword(email) {
    const result = await requireClient().auth.resetPasswordForEmail(String(email || '').trim(), {
      redirectTo: `${(window.LuviaSupabaseConfig || window.ParisSupabaseConfig).redirectUrl}?auth=recovery`
    });
    if (result.error) throw result.error;
    return true;
  }
  async function updatePassword(password) {
    const result = await requireClient().auth.updateUser({ password: String(password || '') });
    if (result.error) throw result.error;
    await refreshCurrentUser();
    return result.data;
  }
  async function signInWithProvider(provider) {
    setExplicitlySignedOut(false);
    const result = await requireClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: (window.LuviaSupabaseConfig || window.ParisSupabaseConfig).redirectUrl, skipBrowserRedirect: false }
    });
    if (result.error) throw result.error;
    return result.data;
  }
  async function linkProvider(provider) {
    const result = await requireClient().auth.linkIdentity({
      provider,
      options: { redirectTo: (window.LuviaSupabaseConfig || window.ParisSupabaseConfig).redirectUrl }
    });
    if (result.error) throw result.error;
    return result.data;
  }
  async function signOut() {
    const c = requireClient();
    setExplicitlySignedOut(true);
    writePending(null);
    try { window.dispatchEvent(new CustomEvent('luvia:logout')); } catch (_) {}
    try { await window.ParisPeople?.stop?.(); } catch (_) {}
    try { await window.ParisCloud?.disconnectRealtime?.(); } catch (_) {}
    const result = await c.auth.signOut({ scope: 'local' });
    if (result.error) {
      setExplicitlySignedOut(false);
      throw result.error;
    }
    try { const port=appStorage();port.remove('luviaActiveModule',{scope:'session'});port.remove('luviaPendingModule',{scope:'session'});port.remove('luviaActiveModule');port.remove('luviaPendingModule');window.LuviaOwnerFlowNavigationV1?.authLogout?.(); } catch (_) {}
    await setFromSession(null, 'SIGNED_OUT');
  }
  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  const api = {
    init,
    ensureInitialSession,
    getState,
    onChange,
    signIn,
    signUp,
    requestAnonymousEmail,
    checkUpgradeConfirmation,
    completeAnonymousUpgrade,
    cancelPendingUpgrade,
    refreshCurrentUser,
    resetPassword,
    updatePassword,
    signInWithProvider,
    linkProvider,
    signOut
  };
  window.LuviaAuth = api;
  // Compatibility alias; new core code must use window.LuviaAuth.
  window.ParisAuth = api;
})();

;

/* ===== auth/ui.js ===== */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function css(){if(document.getElementById('luviaAuthCss'))return;const s=document.createElement('style');s.id='luviaAuthCss';s.textContent=`
  .pa-stack{display:grid;gap:14px}.pa-stack [hidden]{display:none!important}.pa-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pa-field{display:grid;gap:7px}.pa-field label{font-size:13px;font-weight:850;color:#536b7c}.pa-field input{width:100%;box-sizing:border-box;border:1px solid #dfe6e9;border-radius:14px;padding:13px 14px;background:#f8fafb;color:#314b60;font:600 16px system-ui;outline:none}.pa-field input:focus{border-color:#db7996;box-shadow:0 0 0 4px rgba(219,121,150,.12);background:#fff}.pa-wide{grid-column:1/-1}.pa-actions{display:flex;gap:9px;flex-wrap:wrap}.pa-provider{width:100%;border:1px solid #dfe5e8;border-radius:15px;padding:13px;background:#fff;color:#354f62;font-weight:850;cursor:pointer}.pa-provider.apple{background:#111;color:#fff;border-color:#111}.pa-status{padding:13px 14px;border-radius:14px;background:#eef8f5;color:#34745c;line-height:1.45;font-size:14px}.pa-status.warn{background:#fff5e8;color:#8b632b}.pa-status.error{background:#fff0f1;color:#a94455}.pa-divider{display:flex;align-items:center;gap:10px;color:#98a5ad;font-size:12px}.pa-divider:before,.pa-divider:after{content:"";height:1px;background:#e5eaec;flex:1}.pa-link{border:0;background:none;color:#b54e71;font-weight:800;padding:4px;cursor:pointer}.pa-account-hero{display:flex;align-items:center;gap:14px}.pa-avatar{width:58px;height:58px;border-radius:18px;background:linear-gradient(145deg,#e86e94,#bd5f81);color:#fff;display:grid;place-items:center;font:900 24px Georgia}.pa-muted{color:#7b8b96;font-size:14px;line-height:1.55}.pa-chip{display:inline-flex;padding:6px 10px;border-radius:999px;background:#eef8f5;color:#34745c;font-size:12px;font-weight:900}.pa-chip.anon{background:#fff5e8;color:#966323}.pa-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:4px 0 8px}.pa-progress span{height:6px;border-radius:999px;background:#e8edef}.pa-progress span.on{background:linear-gradient(90deg,#e86e94,#bd5f81)}.pa-stepmark{font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#b15c79}.pa-mail-hero{text-align:center;padding:8px 4px}.pa-mail-icon{width:74px;height:74px;border-radius:24px;margin:0 auto 14px;display:grid;place-items:center;background:#fff0f5;font-size:34px}.pa-checklist{display:grid;gap:9px;margin:4px 0}.pa-checkitem{display:flex;gap:10px;align-items:flex-start;color:#627684;font-size:14px;line-height:1.45}.pa-checkitem b{color:#355066}.pa-security{display:grid;gap:10px}.pa-login-note{padding:14px;border:1px solid #f1d8e2;border-radius:16px;background:#fff8fb;color:#6d5862;font-size:14px;line-height:1.5}.pa-guest{width:100%;margin-top:4px}@media(max-width:520px){.pa-grid{grid-template-columns:1fr}.pa-wide{grid-column:auto}.pa-actions{display:grid}.pa-actions>*{width:100%}}
  `;document.head.appendChild(s)}
  function auth(){return window.LuviaAuth || window.ParisAuth}
  function message(box,text,type=''){box.innerHTML=`<div class="pa-status ${type}">${esc(text)}</div>`}
  function validEmail(email){return /^\S+@\S+\.\S+$/.test(email)}
  function progress(step){return `<div class="pa-progress" aria-label="Schritt ${step} von 3"><span class="on"></span><span class="${step>=2?'on':''}"></span><span class="${step>=3?'on':''}"></span></div>`}

  function standardForm(mode,state){
    const anonymous=state.anonymous;
    const title=mode==='register'?'Konto erstellen':'Anmelden';
    const repeat=mode!=='login'?`<div class="pa-field pa-wide"><label>Passwort wiederholen</label><input name="repeat" type="password" autocomplete="new-password"></div>`:'';
    return `<div class="pa-stack"><div><h3 style="margin:0 0 6px;color:#355066;font:900 25px Georgia">${title}</h3><div class="pa-muted">${mode==='register'?'E-Mail und Passwort genügen. Profil und Reise folgen danach.':'Melde dich mit deinem bestehenden Luvia-Konto an.'}</div></div><form class="pa-grid" data-auth-form><div class="pa-field pa-wide"><label>E-Mail-Adresse</label><input name="email" type="email" inputmode="email" autocomplete="email" required></div><div class="pa-field pa-wide"><label>Passwort</label><input name="password" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" required></div>${repeat}<div class="pa-wide pa-actions"><button class="pc-btn primary" type="submit">${title}</button>${mode==='login'?'<button class="pa-link" type="button" data-forgot>Passwort vergessen</button>':''}</div></form><div data-auth-message aria-live="polite"></div><div class="pa-divider">oder</div><button class="pa-provider apple" type="button" data-provider="apple"><span class="provider-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.54c-.03-3 2.45-4.45 2.56-4.52-1.4-2.05-3.58-2.33-4.35-2.36-1.83-.19-3.61 1.1-4.54 1.1-.95 0-2.38-1.08-3.93-1.05-1.99.03-3.85 1.18-4.87 2.95-2.11 3.65-.54 9.02 1.48 11.97 1.01 1.44 2.18 3.05 3.73 2.99 1.51-.06 2.07-.96 3.89-.96 1.8 0 2.33.96 3.9.92 1.63-.03 2.65-1.44 3.62-2.89 1.17-1.65 1.64-3.28 1.66-3.36-.04-.01-3.13-1.2-3.16-4.79ZM14.07 3.72A4.2 4.2 0 0 0 15.03.7a4.28 4.28 0 0 0-2.77 1.44 4.02 4.02 0 0 0-.99 2.91 3.54 3.54 0 0 0 2.8-1.33Z"/></svg></span><span>Mit Apple fortfahren</span></button><button class="pa-provider google" type="button" data-provider="google"><span class="provider-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.31.32-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.53l3.35-2.61Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"/></svg></span><span>Mit Google fortfahren</span></button><button class="pa-link" data-switch type="button">${mode==='login'?'Noch kein Konto? Jetzt registrieren':'Schon registriert? Anmelden'}</button>${anonymous?'<div class="pa-login-note"><b>Anonymes Luvia-Konto aktiv.</b><br>Mit der Anmeldung wechselst du jetzt direkt zu deinem bereits angelegten E-Mail-Konto.</div>':''}</div>`;
  }
  function bindStandard(container,mode){
    const form=container.querySelector('[data-auth-form]'),box=container.querySelector('[data-auth-message]');
    form.onsubmit=async e=>{e.preventDefault();const submit=form.querySelector('[type="submit"]'),fd=new FormData(form),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||''),repeat=mode==='login'?undefined:String(fd.get('repeat')||'');try{if(!validEmail(email))throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');if(mode!=='login'&&password.length<8)throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');if(repeat!==undefined&&password!==repeat)throw new Error('Die Passwörter stimmen nicht überein.');submit.disabled=true;form.setAttribute('aria-busy','true');message(box,'Wird verarbeitet …');if(mode==='register')await auth().signUp({email,password});else await auth().signIn(email,password);message(box,mode==='login'?'Anmeldung erfolgreich. Luvia öffnet deine Reise.':'Fast geschafft: Bestätige jetzt deine E-Mail. Beim ersten Anmelden begrüßt dich der Living Compass und führt dich durch deine Reisewelt.');if(mode==='login'){await auth().refreshCurrentUser?.();document.dispatchEvent(new CustomEvent('reisezeit:login-success',{detail:auth().getState()}));window.LuviaOwnerFlowNavigationV1?.authLoginSuccess?.()}}catch(err){message(box,err.message||'Die Aktion konnte nicht abgeschlossen werden.','error')}finally{if(submit?.isConnected)submit.disabled=false;if(form?.isConnected)form.removeAttribute('aria-busy')}};
    container.querySelector('[data-forgot]')?.addEventListener('click',()=>renderRecoveryRequest(container,form.elements.email.value.trim()));
    container.querySelector('[data-switch]')?.addEventListener('click',()=>renderAuthForm(container,mode==='login'?'register':'login'));
    container.querySelectorAll('[data-provider]').forEach(b=>b.onclick=async()=>{try{message(box,`${b.dataset.provider==='apple'?'Apple':'Google'} wird geöffnet …`);await auth().signInWithProvider(b.dataset.provider)}catch(err){message(box,err.message||'Dieser Anbieter ist in Supabase noch nicht fertig eingerichtet.','error')}})
  }
  function renderAuthForm(container,mode='login'){css();container.innerHTML=standardForm(mode,auth().getState());bindStandard(container,mode);container.dispatchEvent(new CustomEvent('luvia:auth-mode-rendered',{bubbles:true,detail:{mode}}))}

  function renderRecoveryRequest(container,initialEmail=''){
    css();container.innerHTML=`<div class="pa-stack"><div><h3 style="margin:0 0 6px;color:#355066;font:900 25px Georgia">Passwort zurücksetzen</h3><div class="pa-muted">Wir senden dir einen sicheren Link für ein neues Passwort.</div></div><form class="pa-grid" data-recovery-request><div class="pa-field pa-wide"><label>E-Mail-Adresse</label><input name="email" type="email" inputmode="email" autocomplete="email" value="${esc(initialEmail)}" required></div><div class="pa-wide pa-actions"><button class="pc-btn primary" type="submit">Recovery-Link senden</button><button class="pa-link" type="button" data-recovery-back>Zur Anmeldung</button></div></form><div data-recovery-message aria-live="polite"></div></div>`;
    const form=container.querySelector('[data-recovery-request]'),box=container.querySelector('[data-recovery-message]');
    form.onsubmit=async event=>{event.preventDefault();const submit=form.querySelector('[type="submit"]'),email=String(new FormData(form).get('email')||'').trim();try{if(!validEmail(email))throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');submit.disabled=true;form.setAttribute('aria-busy','true');message(box,'Recovery-Link wird gesendet …');await auth().resetPassword(email);message(box,'Der Recovery-Link wurde gesendet. Öffne jetzt deine E-Mail.')}catch(error){message(box,error.message||'Der Recovery-Link konnte nicht gesendet werden.','error')}finally{submit.disabled=false;form.removeAttribute('aria-busy')}};
    container.querySelector('[data-recovery-back]').onclick=()=>renderAuthForm(container,'login');
    container.dispatchEvent(new CustomEvent('luvia:auth-mode-rendered',{bubbles:true,detail:{mode:'recovery-request'}}));
  }

  function renderRecoveryForm(container,{onComplete}={}){
    css();const state=auth()?.getState?.()||{};
    container.innerHTML=`<div class="pa-stack"><form class="pa-grid" data-recovery-password><div class="pa-field pa-wide"><label>Neues Passwort</label><input name="password" type="password" autocomplete="new-password" minlength="8" required></div><div class="pa-field pa-wide"><label>Passwort wiederholen</label><input name="repeat" type="password" autocomplete="new-password" minlength="8" required></div><div class="pa-wide pa-actions"><button class="pc-btn primary" type="submit">Passwort sicher speichern</button></div></form><div data-recovery-message aria-live="polite"></div>${state.session?'':'<div class="pa-status warn">Der Recovery-Link ist ungültig oder abgelaufen. Fordere bitte einen neuen Link an.</div><button class="pa-link" type="button" data-new-recovery>Neuen Link anfordern</button>'}</div>`;
    const form=container.querySelector('[data-recovery-password]'),box=container.querySelector('[data-recovery-message]');
    if(!state.session){form.hidden=true;container.querySelector('[data-new-recovery]').onclick=()=>renderRecoveryRequest(container);return}
    form.onsubmit=async event=>{event.preventDefault();const submit=form.querySelector('[type="submit"]'),data=new FormData(form),password=String(data.get('password')||''),repeat=String(data.get('repeat')||'');try{if(password.length<8)throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');if(password!==repeat)throw new Error('Die Passwörter stimmen nicht überein.');submit.disabled=true;form.setAttribute('aria-busy','true');message(box,'Neues Passwort wird sicher gespeichert …');await auth().updatePassword(password);message(box,'Dein Passwort wurde aktualisiert. Luvia öffnet jetzt deine Reise.');await onComplete?.()}catch(error){message(box,error.message||'Das Passwort konnte nicht aktualisiert werden.','error')}finally{if(submit?.isConnected)submit.disabled=false;if(form?.isConnected)form.removeAttribute('aria-busy')}};
  }

  function wizardStep1(container,st){
    const p=st.pendingUpgrade||{};
    container.innerHTML=`<div class="pa-stack">${progress(1)}<div><div class="pa-stepmark">Schritt 1 von 3</div><h3 style="margin:6px 0;color:#355066;font:900 25px Georgia">E-Mail verknüpfen</h3><div class="pa-muted">Zuerst wird nur deine E-Mail-Adresse mit dem bestehenden anonymen Konto verbunden. Das Passwort folgt erst nach der Bestätigung.</div></div><form class="pa-grid" data-upgrade-email><div class="pa-field"><label>Vorname</label><input name="firstName" autocomplete="given-name" value="${esc(p.firstName||'')}"></div><div class="pa-field"><label>Nachname</label><input name="lastName" autocomplete="family-name" value="${esc(p.lastName||'')}"></div><div class="pa-field pa-wide"><label>Anzeigename</label><input name="displayName" autocomplete="nickname" value="${esc(p.displayName||window.ParisCloud?.memberName||'')}"></div><div class="pa-field pa-wide"><label>E-Mail-Adresse</label><input name="email" type="email" inputmode="email" autocomplete="email" value="${esc(p.email||'')}" required></div><div class="pa-wide pa-actions"><button class="pc-btn primary" type="submit">Bestätigungsmail senden</button></div></form><div data-upgrade-message></div></div>`;
    const form=container.querySelector('[data-upgrade-email]'),box=container.querySelector('[data-upgrade-message]');
    form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),email=String(fd.get('email')||'').trim();try{if(!validEmail(email))throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');message(box,'Bestätigungsmail wird vorbereitet …');await auth().requestAnonymousEmail({email,firstName:String(fd.get('firstName')||''),lastName:String(fd.get('lastName')||''),displayName:String(fd.get('displayName')||'')});wizardStep2(container,auth().getState())}catch(err){message(box,err.message||'Die Bestätigungsmail konnte nicht gesendet werden.','error')}};
  }
  function wizardStep2(container,st){
    const p=st.pendingUpgrade||{};
    container.innerHTML=`<div class="pa-stack">${progress(2)}<div class="pa-mail-hero"><div class="pa-mail-icon">✉️</div><div class="pa-stepmark">Schritt 2 von 3</div><h3 style="margin:7px 0;color:#355066;font:900 25px Georgia">E-Mail bestätigen</h3><div class="pa-muted">Wir haben eine Bestätigung an <b>${esc(p.email||st.email)}</b> gesendet.</div></div><div class="pa-checklist"><div class="pa-checkitem"><span>1.</span><div>Öffne die E-Mail von Supabase und tippe auf den Bestätigungslink.</div></div><div class="pa-checkitem"><span>2.</span><div>Du wirst zurück zur Luvia geleitet.</div></div><div class="pa-checkitem"><span>3.</span><div>Tippe danach hier auf <b>„Bestätigung prüfen“</b>.</div></div></div><div class="pa-actions"><button class="pc-btn primary" data-check>Bestätigung prüfen</button><button class="pc-btn" data-resend>Mail erneut senden</button><button class="pa-link" data-change>Andere E-Mail verwenden</button></div><div data-upgrade-message></div></div>`;
    const box=container.querySelector('[data-upgrade-message]');
    container.querySelector('[data-check]').onclick=async()=>{try{message(box,'Bestätigung wird geprüft …');const result=await auth().checkUpgradeConfirmation();if(!result.confirmed){message(box,'Noch nicht bestätigt. Öffne den Link aus der E-Mail und versuche es danach erneut.','warn');return}wizardStep3(container,auth().getState())}catch(err){message(box,err.message||'Die Bestätigung konnte nicht geprüft werden.','error')}};
    container.querySelector('[data-resend]').onclick=async()=>{try{message(box,'Neue Bestätigungsmail wird gesendet …');await auth().requestAnonymousEmail(p);message(box,'Eine neue Bestätigungsmail wurde gesendet.')}catch(err){message(box,err.message||'Die E-Mail konnte nicht erneut gesendet werden.','error')}};
    container.querySelector('[data-change]').onclick=()=>{auth().cancelPendingUpgrade();wizardStep1(container,auth().getState())};
  }
  function wizardStep3(container,st){
    const p=st.pendingUpgrade||{};
    container.innerHTML=`<div class="pa-stack">${progress(3)}<div><div class="pa-stepmark">Schritt 3 von 3</div><h3 style="margin:6px 0;color:#355066;font:900 25px Georgia">Passwort festlegen</h3><div class="pa-muted">Deine E-Mail <b>${esc(p.email||st.email)}</b> ist bestätigt. Lege jetzt das Passwort für Anmeldungen auf weiteren Geräten fest.</div></div><form class="pa-grid" data-upgrade-password><div class="pa-field pa-wide"><label>Passwort</label><input name="password" type="password" autocomplete="new-password" required></div><div class="pa-field pa-wide"><label>Passwort wiederholen</label><input name="repeat" type="password" autocomplete="new-password" required></div><div class="pa-wide pa-actions"><button class="pc-btn primary" type="submit">Konto abschließen</button></div></form><div data-upgrade-message></div></div>`;
    const form=container.querySelector('[data-upgrade-password]'),box=container.querySelector('[data-upgrade-message]');
    form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),password=String(fd.get('password')||''),repeat=String(fd.get('repeat')||'');try{if(password.length<8)throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');if(password!==repeat)throw new Error('Die Passwörter stimmen nicht überein.');message(box,'Konto wird abgeschlossen …');await auth().completeAnonymousUpgrade(password);message(box,'Dein Konto ist jetzt dauerhaft gesichert.');setTimeout(()=>render(container),700)}catch(err){message(box,err.message||'Das Konto konnte nicht abgeschlossen werden.','error')}};
  }
  function renderWizard(container,st){
    const p=st.pendingUpgrade;
    if(!p){wizardStep1(container,st);return}
    if(p.stage==='email-confirmed' || (st.emailConfirmed && !st.anonymous)){wizardStep3(container,st);return}
    wizardStep2(container,st);
  }
  function render(container){
    css(); const st=auth()?.getState?.()||{loading:true};
    if(st.loading){container.innerHTML='<div class="pc-card">Kontostatus wird geladen …</div>';return}
    if(!st.user){
      container.innerHTML=`<div class="pc-head"><div><h2>Konto</h2><p>Melde dich an, um deine Reisen auf diesem Gerät zu öffnen.</p></div></div><div class="pc-card pa-stack"><div data-signed-out-auth></div></div>`;
      renderAuthForm(container.querySelector('[data-signed-out-auth]'),'login');
      return
    }
    if(st.anonymous){
      container.innerHTML=`<div class="pc-head"><div><h2>Konto</h2><p>Melde dich jetzt mit deinem bestehenden E-Mail-Konto an.</p></div></div><div class="pc-card pa-stack"><div class="pa-account-hero"><div class="pa-avatar">${esc((window.ParisCloud?.memberName||'P').charAt(0).toUpperCase())}</div><div><b style="font-size:20px;color:#355066">${esc(window.ParisCloud?.memberName||'Anonymes Luvia-Konto')}</b><div class="pa-muted">Aktuell ist noch die anonyme Gerätesitzung aktiv.</div><span class="pa-chip anon">Anonym</span></div></div><div class="pa-login-note"><b>Dein E-Mail-Konto existiert bereits.</b><br>Gib unten deine E-Mail-Adresse und dein Passwort ein. Die App ersetzt danach die anonyme Sitzung durch dein dauerhaftes Konto.</div><div data-anonymous-login></div></div>`;
      renderAuthForm(container.querySelector('[data-anonymous-login]'),'login');
      return
    }
    const name=st.user?.user_metadata?.display_name||st.user?.user_metadata?.full_name||window.ParisCloud?.memberName||st.email;
    container.innerHTML=`<div class="pc-head"><div><h2>Konto</h2><p>Anmeldung, Sicherheit und verbundene Methoden.</p></div></div><div class="pc-card pa-stack"><div class="pa-account-hero"><div class="pa-avatar">${esc(String(name||'P').charAt(0).toUpperCase())}</div><div><b style="font-size:20px;color:#355066">${esc(name)}</b><div class="pa-muted">${esc(st.email)}</div><span class="pa-chip">Dauerhaft gesichert</span></div></div><div class="pc-row"><div><b>Anmeldemethode</b><div class="pc-meta">${esc(st.provider)}</div></div><span>${st.identities.length} verbunden</span></div><div class="pc-row"><div><b>Weitere Anmeldung verbinden</b><div class="pc-meta">Dasselbe Konto auch über Apple oder Google verwenden.</div></div><div class="pa-actions"><button class="pc-btn" data-link="apple"> Apple</button><button class="pc-btn" data-link="google">G Google</button></div></div><div class="pc-row"><div><b>Passwort ändern</b><div class="pc-meta">Mindestens 8 Zeichen.</div></div><button class="pc-btn" data-password>Ändern</button></div><div class="pc-row"><div><b>Auf diesem Gerät abmelden</b><div class="pc-meta">Cloud-Daten bleiben erhalten.</div></div><button class="pc-btn danger" data-signout>Abmelden</button></div><div data-account-message></div></div>`;
    const box=container.querySelector('[data-account-message]');container.querySelectorAll('[data-link]').forEach(b=>b.onclick=async()=>{try{await auth().linkProvider(b.dataset.link)}catch(err){message(box,err.message,'error')}});container.querySelector('[data-password]').onclick=async()=>{const p=prompt('Neues Passwort (mindestens 8 Zeichen):');if(!p)return;try{if(p.length<8)throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');await auth().updatePassword(p);message(box,'Passwort wurde aktualisiert.')}catch(err){message(box,err.message,'error')}};container.querySelector('[data-signout]').onclick=async()=>{if(!confirm('Auf diesem Gerät wirklich abmelden?'))return;try{message(box,'Du wirst abgemeldet …');await auth().signOut()}catch(err){message(box,err.message||'Abmelden fehlgeschlagen.','error')}}
  }
  let lastMountedContainer=null;
  const originalRender=render;
  function trackedRender(container){lastMountedContainer=container;return originalRender(container)}
  document.addEventListener('luvia:auth-changed',()=>{
    if(lastMountedContainer?.isConnected) originalRender(lastMountedContainer);
  });
  const api={render:trackedRender,renderAuthForm,renderRecoveryRequest,renderRecoveryForm};window.LuviaAuthUI=api;window.ParisAuthUI=api;
})();

;

/* ===== core/services/supabase-service.js ===== */
(() => {
  'use strict';
  let client=null,startPromise=null,created=0;
  function config(){return window.LuviaSupabaseConfig||window.ParisSupabaseConfig||window.LUVIA_AUTH_CONFIG||{};}
  function create(){
    if(client)return client;
    if(window.LuviaSupabaseClient||window.ParisSupabaseClient){client=window.LuviaSupabaseClient||window.ParisSupabaseClient;window.LuviaSupabaseClient=client;window.ParisSupabaseClient=client;return client;}
    const factory=window.supabase?.createClient,c=config();
    if(typeof factory!=='function')throw new Error('Supabase-Bibliothek wurde nicht geladen.');
    const key=c.publishableKey||c.supabaseKey||c.anonKey;
    if(!c.url||!key)throw new Error('Supabase-Konfiguration fehlt.');
    client=factory(c.url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},global:{headers:{'x-client-info':'luvia/12.1.1'}}});
    created+=1;window.LuviaSupabaseClient=client;window.ParisSupabaseClient=client;
    window.dispatchEvent(new CustomEvent('luvia:supabase-client-ready',{detail:{instances:created}}));
    return client;
  }
  async function start(){if(startPromise)return startPromise;startPromise=(async()=>{const c=create();await (window.LuviaAuth||window.ParisAuth).init(c);return c})().catch(e=>{startPromise=null;throw e});return startPromise;}
  async function rpc(name,params={}){const c=await start(),r=await c.rpc(name,params);if(r.error)throw r.error;return r.data;}
  function getClient(){return client||window.LuviaSupabaseClient||window.ParisSupabaseClient||null;}
  function diagnostics(){return Object.freeze({ready:Boolean(getClient()),instances:created || ((window.LuviaSupabaseClient||window.ParisSupabaseClient)?1:0),version:'2.0.0'});}
  window.LuviaSupabaseService=Object.freeze({version:'2.0.0',create,start,rpc,getClient,diagnostics});
})();

;

/* ===== core/experience/experience-contract-core.js ===== */
var LuviaExperienceContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='experience.v1';
const VERSION='1';
const RUNTIME_VERSION='1.1.0';

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function copy(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(copy);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)]));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0))}
function normalizeHex(value,fallback='#ef6254'){
  const candidate=text(value).toLowerCase();
  if(/^#[0-9a-f]{3}$/.test(candidate))return `#${candidate.slice(1).split('').map(character=>character.repeat(2)).join('')}`;
  if(/^#[0-9a-f]{6}$/.test(candidate))return candidate;
  return fallback;
}
function hexChannels(value){
  const hex=normalizeHex(value).slice(1);
  return [0,2,4].map(index=>parseInt(hex.slice(index,index+2),16));
}
function toHex(channels){return `#${channels.map(channel=>Math.round(clamp(channel,0,255)).toString(16).padStart(2,'0')).join('')}`}
function mixHex(from,to,amount){
  const ratio=clamp(amount,0,1);
  const left=hexChannels(from);
  const right=hexChannels(to);
  return toHex(left.map((channel,index)=>channel+(right[index]-channel)*ratio));
}
function normalizeCompassAngle(value){
  return ((Number(value||0)+180)%360+360)%360-180;
}
function luminance(value){
  const channels=hexChannels(value).map(channel=>channel/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}
function contrastRatio(first,second){
  const values=[luminance(first),luminance(second)].sort((a,b)=>b-a);
  return Number(((values[0]+.05)/(values[1]+.05)).toFixed(2));
}
function rgbToHsl(value){
  const [red,green,blue]=hexChannels(value).map(channel=>channel/255);
  const max=Math.max(red,green,blue);
  const min=Math.min(red,green,blue);
  const delta=max-min;
  let hue=0;
  if(delta){
    if(max===red)hue=60*(((green-blue)/delta)%6);
    else if(max===green)hue=60*((blue-red)/delta+2);
    else hue=60*((red-green)/delta+4);
  }
  if(hue<0)hue+=360;
  const lightness=(max+min)/2;
  const saturation=delta===0?0:delta/(1-Math.abs(2*lightness-1));
  return [hue,saturation,lightness];
}
function hslToHex(hue,saturation,lightness){
  const s=clamp(saturation,0,1);
  const l=clamp(lightness,0,1);
  const chroma=(1-Math.abs(2*l-1))*s;
  const segment=((hue%360)+360)%360/60;
  const x=chroma*(1-Math.abs(segment%2-1));
  const [red,green,blue]=segment<1?[chroma,x,0]:segment<2?[x,chroma,0]:segment<3?[0,chroma,x]:segment<4?[0,x,chroma]:segment<5?[x,0,chroma]:[chroma,0,x];
  const match=l-chroma/2;
  return toHex([(red+match)*255,(green+match)*255,(blue+match)*255]);
}
function token(category,value,dark,cssVariable,swiftUI,compose){
  return immutable({category,value,dark:dark??value,cssVariable,native:{swiftUI,compose}});
}

const BRAND=immutable({
  ink:'#102a3c',
  mineral:'#f7f9f9',
  directions:{north:'#ef6254',east:'#f4b34c',south:'#2c93a9',west:'#2f8c73'}
});

function resolveCompassDirectionTone(angle){
  const normalizedAngle=normalizeCompassAngle(angle);
  // Navigation angles follow the actual needle artwork: 0deg points north,
  // 90deg east, +/-180deg south and -90deg west. Keep the tone on that
  // coordinate system so the selected surface samples the ring beneath the
  // red needle tip instead of a colour shifted by one quadrant.
  const offset=((normalizedAngle%360)+360)%360/360;
  const stops=[
    {offset:0,color:BRAND.directions.north},
    {offset:.25,color:BRAND.directions.east},
    {offset:.5,color:BRAND.directions.south},
    {offset:.75,color:BRAND.directions.west},
    {offset:1,color:BRAND.directions.north}
  ];
  const right=stops.findIndex(stop=>stop.offset>=offset);
  const upper=stops[Math.max(1,right)];
  const lower=stops[Math.max(0,Math.max(1,right)-1)];
  const ratio=(offset-lower.offset)/Math.max(.0001,upper.offset-lower.offset);
  const color=mixHex(lower.color,upper.color,ratio);
  const onColor=contrastRatio(color,BRAND.ink)>=contrastRatio(color,'#ffffff')?BRAND.ink:'#ffffff';
  return immutable({
    contractId:CONTRACT_ID,
    source:'official-compass-ring-angle',
    angle:normalizedAngle,
    offset:Number(offset.toFixed(6)),
    color,
    soft:mixHex('#ffffff',color,.13),
    veil:mixHex('#ffffff',color,.07),
    onColor,
    cssVariables:{
      '--lv-compass-direction-angle':`${normalizedAngle}deg`,
      '--lv-compass-direction-color':color,
      '--lv-compass-direction-soft':mixHex('#ffffff',color,.13),
      '--lv-compass-direction-veil':mixHex('#ffffff',color,.07),
      '--lv-compass-direction-on':onColor
    },
    domainTruth:false
  });
}

const TOKENS=immutable({
  'color.surface.canvas':token('color','#fff8f7','#101820','--luvia-color-surface-canvas','LuviaColor.surfaceCanvas','LuviaTheme.colorScheme.surfaceCanvas'),
  'color.surface.primary':token('color','#fbfcfd','#17232d','--luvia-color-surface-primary','LuviaColor.surfacePrimary','LuviaTheme.colorScheme.surfacePrimary'),
  'color.surface.elevated':token('color','#ffffff','#1d2b36','--luvia-color-surface-elevated','LuviaColor.surfaceElevated','LuviaTheme.colorScheme.surfaceElevated'),
  'color.surface.subtle':token('color','#f3f7f8','#243541','--luvia-color-surface-subtle','LuviaColor.surfaceSubtle','LuviaTheme.colorScheme.surfaceSubtle'),
  'color.surface.scrim':token('color','rgba(31,43,54,.56)','rgba(4,9,13,.72)','--luvia-color-surface-scrim','LuviaColor.surfaceScrim','LuviaTheme.colorScheme.surfaceScrim'),
  'color.text.primary':token('color','#263f54','#f2f6f8','--luvia-color-text-primary','LuviaColor.textPrimary','LuviaTheme.colorScheme.textPrimary'),
  'color.text.muted':token('color','#687b8c','#a9bac5','--luvia-color-text-muted','LuviaColor.textMuted','LuviaTheme.colorScheme.textMuted'),
  'color.text.inverse':token('color','#ffffff','#101820','--luvia-color-text-inverse','LuviaColor.textInverse','LuviaTheme.colorScheme.textInverse'),
  'color.border.subtle':token('color','#dfe6ea','#30434f','--luvia-color-border-subtle','LuviaColor.borderSubtle','LuviaTheme.colorScheme.borderSubtle'),
  'color.border.focus':token('color','#d94f71','#ff9db2','--luvia-color-border-focus','LuviaColor.borderFocus','LuviaTheme.colorScheme.borderFocus'),
  'color.action.primary':token('color','#e96784','#f58da4','--luvia-color-action-primary','LuviaColor.actionPrimary','LuviaTheme.colorScheme.actionPrimary'),
  'color.action.onPrimary':token('color','#ffffff','#17232d','--luvia-color-action-on-primary','LuviaColor.onActionPrimary','LuviaTheme.colorScheme.onActionPrimary'),
  'color.action.primarySoft':token('color','#fff0f4','#4b2e3a','--luvia-color-action-primary-soft','LuviaColor.actionPrimarySoft','LuviaTheme.colorScheme.actionPrimarySoft'),
  'color.brand.ink':token('color',BRAND.ink,'#f2f6f8','--luvia-color-brand-ink','LuviaColor.brandInk','LuviaTheme.colorScheme.brandInk'),
  'color.brand.mineral':token('color',BRAND.mineral,'#17232d','--luvia-color-brand-mineral','LuviaColor.brandMineral','LuviaTheme.colorScheme.brandMineral'),
  'color.brand.compass.north':token('color',BRAND.directions.north,'#ff8d81','--luvia-color-compass-north','LuviaColor.compassNorth','LuviaTheme.colorScheme.compassNorth'),
  'color.brand.compass.east':token('color',BRAND.directions.east,'#f8c878','--luvia-color-compass-east','LuviaColor.compassEast','LuviaTheme.colorScheme.compassEast'),
  'color.brand.compass.south':token('color',BRAND.directions.south,'#72c2d2','--luvia-color-compass-south','LuviaColor.compassSouth','LuviaTheme.colorScheme.compassSouth'),
  'color.brand.compass.west':token('color',BRAND.directions.west,'#72c1a8','--luvia-color-compass-west','LuviaColor.compassWest','LuviaTheme.colorScheme.compassWest'),
  'color.trip.accent':token('color',BRAND.directions.north,'#ff8d81','--luvia-color-trip-accent','LuviaColor.tripAccent','LuviaTheme.colorScheme.tripAccent'),
  'color.trip.complement':token('color',BRAND.directions.south,'#72c2d2','--luvia-color-trip-complement','LuviaColor.tripComplement','LuviaTheme.colorScheme.tripComplement'),
  'color.trip.onAccent':token('color','#ffffff',BRAND.ink,'--luvia-color-trip-on-accent','LuviaColor.onTripAccent','LuviaTheme.colorScheme.onTripAccent'),
  'color.trip.accentSoft':token('color','#fff0ed','#4b2e3a','--luvia-color-trip-accent-soft','LuviaColor.tripAccentSoft','LuviaTheme.colorScheme.tripAccentSoft'),
  'color.status.success':token('color','#2d8a63','#72d7a9','--luvia-color-status-success','LuviaColor.statusSuccess','LuviaTheme.colorScheme.statusSuccess'),
  'color.status.warning':token('color','#a96916','#f2bd66','--luvia-color-status-warning','LuviaColor.statusWarning','LuviaTheme.colorScheme.statusWarning'),
  'color.status.danger':token('color','#b7465a','#ff91a4','--luvia-color-status-danger','LuviaColor.statusDanger','LuviaTheme.colorScheme.statusDanger'),
  'color.status.info':token('color','#4779a8','#86b9e8','--luvia-color-status-info','LuviaColor.statusInfo','LuviaTheme.colorScheme.statusInfo'),
  'font.family.body':token('typography','Manrope, Inter, Avenir Next, Segoe UI, system-ui, sans-serif',null,'--luvia-font-family-body','LuviaTypography.bodyFamily','LuviaTheme.typography.bodyFamily'),
  'font.family.display':token('typography','Manrope, Inter, Avenir Next, Segoe UI, system-ui, sans-serif',null,'--luvia-font-family-display','LuviaTypography.displayFamily','LuviaTheme.typography.displayFamily'),
  'font.family.mono':token('typography','SFMono-Regular, Consolas, Liberation Mono, monospace',null,'--luvia-font-family-mono','LuviaTypography.monoFamily','LuviaTheme.typography.monoFamily'),
  'font.size.label':token('typography','.75rem',null,'--luvia-font-size-label','LuviaTypography.label','LuviaTheme.typography.label'),
  'font.size.body':token('typography','1rem',null,'--luvia-font-size-body','LuviaTypography.body','LuviaTheme.typography.body'),
  'font.size.bodyLarge':token('typography','1.125rem',null,'--luvia-font-size-body-large','LuviaTypography.bodyLarge','LuviaTheme.typography.bodyLarge'),
  'font.size.title':token('typography','1.375rem',null,'--luvia-font-size-title','LuviaTypography.title','LuviaTheme.typography.title'),
  'font.size.titleLarge':token('typography','clamp(1.7rem,3vw,2.25rem)',null,'--luvia-font-size-title-large','LuviaTypography.titleLarge','LuviaTheme.typography.titleLarge'),
  'font.size.display':token('typography','clamp(2.35rem,6vw,4.25rem)',null,'--luvia-font-size-display','LuviaTypography.display','LuviaTheme.typography.display'),
  'font.weight.regular':token('typography','400',null,'--luvia-font-weight-regular','LuviaTypography.regular','LuviaTheme.typography.regular'),
  'font.weight.medium':token('typography','500',null,'--luvia-font-weight-medium','LuviaTypography.medium','LuviaTheme.typography.medium'),
  'font.weight.semibold':token('typography','600',null,'--luvia-font-weight-semibold','LuviaTypography.semibold','LuviaTheme.typography.semibold'),
  'font.weight.bold':token('typography','700',null,'--luvia-font-weight-bold','LuviaTypography.bold','LuviaTheme.typography.bold'),
  'lineHeight.tight':token('typography','1.08',null,'--luvia-line-height-tight','LuviaTypography.tight','LuviaTheme.typography.tight'),
  'lineHeight.heading':token('typography','1.18',null,'--luvia-line-height-heading','LuviaTypography.heading','LuviaTheme.typography.heading'),
  'lineHeight.body':token('typography','1.64',null,'--luvia-line-height-body','LuviaTypography.bodyLeading','LuviaTheme.typography.bodyLeading'),
  'space.1':token('spacing','4px',null,'--luvia-space-1','LuviaSpacing.xs2','LuviaTheme.spacing.xs2'),
  'space.2':token('spacing','8px',null,'--luvia-space-2','LuviaSpacing.xs','LuviaTheme.spacing.xs'),
  'space.3':token('spacing','12px',null,'--luvia-space-3','LuviaSpacing.sm','LuviaTheme.spacing.sm'),
  'space.4':token('spacing','16px',null,'--luvia-space-4','LuviaSpacing.md','LuviaTheme.spacing.md'),
  'space.5':token('spacing','20px',null,'--luvia-space-5','LuviaSpacing.lg','LuviaTheme.spacing.lg'),
  'space.6':token('spacing','24px',null,'--luvia-space-6','LuviaSpacing.xl','LuviaTheme.spacing.xl'),
  'space.8':token('spacing','32px',null,'--luvia-space-8','LuviaSpacing.xl2','LuviaTheme.spacing.xl2'),
  'space.10':token('spacing','40px',null,'--luvia-space-10','LuviaSpacing.xl3','LuviaTheme.spacing.xl3'),
  'space.12':token('spacing','48px',null,'--luvia-space-12','LuviaSpacing.xl4','LuviaTheme.spacing.xl4'),
  'space.16':token('spacing','64px',null,'--luvia-space-16','LuviaSpacing.xl5','LuviaTheme.spacing.xl5'),
  'radius.xs':token('radius','10px',null,'--luvia-radius-xs','LuviaRadius.xs','LuviaTheme.radius.xs'),
  'radius.sm':token('radius','14px',null,'--luvia-radius-sm','LuviaRadius.sm','LuviaTheme.radius.sm'),
  'radius.md':token('radius','18px',null,'--luvia-radius-md','LuviaRadius.md','LuviaTheme.radius.md'),
  'radius.lg':token('radius','24px',null,'--luvia-radius-lg','LuviaRadius.lg','LuviaTheme.radius.lg'),
  'radius.xl':token('radius','30px',null,'--luvia-radius-xl','LuviaRadius.xl','LuviaTheme.radius.xl'),
  'radius.pill':token('radius','999px',null,'--luvia-radius-pill','LuviaRadius.pill','LuviaTheme.radius.pill'),
  'elevation.control':token('elevation','0 6px 18px rgba(41,49,67,.08)','0 8px 22px rgba(0,0,0,.24)','--luvia-elevation-control','LuviaElevation.control','LuviaTheme.elevation.control'),
  'elevation.card':token('elevation','0 16px 44px rgba(41,49,67,.08)','0 18px 50px rgba(0,0,0,.28)','--luvia-elevation-card','LuviaElevation.card','LuviaTheme.elevation.card'),
  'elevation.float':token('elevation','0 30px 100px rgba(31,38,53,.22)','0 32px 110px rgba(0,0,0,.5)','--luvia-elevation-float','LuviaElevation.floating','LuviaTheme.elevation.floating'),
  'motion.duration.instant':token('motion','0ms',null,'--luvia-motion-instant','LuviaMotion.instant','LuviaTheme.motion.instant'),
  'motion.duration.fast':token('motion','140ms',null,'--luvia-motion-fast','LuviaMotion.fast','LuviaTheme.motion.fast'),
  'motion.duration.base':token('motion','220ms',null,'--luvia-motion-base','LuviaMotion.base','LuviaTheme.motion.base'),
  'motion.duration.slow':token('motion','360ms',null,'--luvia-motion-slow','LuviaMotion.slow','LuviaTheme.motion.slow'),
  'motion.duration.story':token('motion','720ms',null,'--luvia-motion-story','LuviaMotion.story','LuviaTheme.motion.story'),
  'motion.duration.brandIntro':token('motion','2400ms',null,'--luvia-motion-brand-intro','LuviaMotion.brandIntro','LuviaTheme.motion.brandIntro'),
  'motion.easing.standard':token('motion','cubic-bezier(.22,.72,.2,1)',null,'--luvia-ease-standard','LuviaMotion.standard','LuviaTheme.motion.standard'),
  'motion.easing.enter':token('motion','cubic-bezier(.16,1,.3,1)',null,'--luvia-ease-enter','LuviaMotion.enter','LuviaTheme.motion.enter'),
  'motion.easing.exit':token('motion','cubic-bezier(.4,0,1,1)',null,'--luvia-ease-exit','LuviaMotion.exit','LuviaTheme.motion.exit'),
  'layout.content.max':token('layout','1180px',null,'--luvia-layout-content-max','LuviaLayout.contentMax','LuviaTheme.layout.contentMax'),
  'layout.touch.minimum':token('layout','44px',null,'--luvia-layout-touch-minimum','LuviaLayout.minimumTouchTarget','LuviaTheme.layout.minimumTouchTarget'),
  'layout.breakpoint.compact':token('layout','640px',null,'--luvia-breakpoint-compact','LuviaBreakpoint.compact','LuviaTheme.breakpoint.compact'),
  'layout.breakpoint.medium':token('layout','980px',null,'--luvia-breakpoint-medium','LuviaBreakpoint.medium','LuviaTheme.breakpoint.medium'),
  'layout.breakpoint.expanded':token('layout','1440px',null,'--luvia-breakpoint-expanded','LuviaBreakpoint.expanded','LuviaTheme.breakpoint.expanded'),
  'zIndex.content':token('layer','1',null,'--luvia-z-content','LuviaLayer.content','LuviaTheme.layer.content'),
  'zIndex.sticky':token('layer','30',null,'--luvia-z-sticky','LuviaLayer.sticky','LuviaTheme.layer.sticky'),
  'zIndex.dock':token('layer','40',null,'--luvia-z-dock','LuviaLayer.dock','LuviaTheme.layer.dock'),
  'zIndex.overlay':token('layer','2147483000',null,'--luvia-z-overlay','LuviaLayer.overlay','LuviaTheme.layer.overlay'),
  'zIndex.toast':token('layer','2147483600',null,'--luvia-z-toast','LuviaLayer.toast','LuviaTheme.layer.toast')
});

const COMPONENTS=immutable({
  button:{role:'action',variants:['primary','secondary','quiet','destructive'],states:['default','pressed','disabled','loading'],minimumTouchTarget:44,native:{swiftUI:'LuviaButton',compose:'LuviaButton'}},
  iconButton:{role:'action',variants:['standard','accent','quiet'],states:['default','pressed','disabled','loading'],minimumTouchTarget:44,native:{swiftUI:'LuviaIconButton',compose:'LuviaIconButton'}},
  input:{role:'data-entry',variants:['text','search','multiline','select'],states:['default','focus','disabled','error','success'],minimumTouchTarget:44,native:{swiftUI:'LuviaField',compose:'LuviaField'}},
  card:{role:'content-group',variants:['flat','elevated','interactive','attention'],states:['default','pressed','disabled','loading'],native:{swiftUI:'LuviaCard',compose:'LuviaCard'}},
  dialog:{role:'modal-task',variants:['standard','confirmation','destructive'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaDialogHost',compose:'LuviaDialogHost'}},
  sheet:{role:'modal-task',variants:['compact','adaptive','fullHeight'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaSheetHost',compose:'LuviaSheetHost'}},
  navigation:{role:'primary-navigation',variants:['dock','rail','bar'],states:['default','selected','disabled'],native:{swiftUI:'LuviaNavigationHost',compose:'LuviaNavigationHost'}},
  tabs:{role:'section-navigation',variants:['standard','compact'],states:['default','selected','disabled'],native:{swiftUI:'LuviaTabs',compose:'LuviaTabs'}},
  chip:{role:'selection',variants:['filter','choice','status'],states:['default','selected','disabled'],minimumTouchTarget:44,native:{swiftUI:'LuviaChip',compose:'LuviaChip'}},
  menu:{role:'action-list',variants:['standard','contextual'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaMenu',compose:'LuviaMenu'}},
  toast:{role:'transient-feedback',variants:['info','success','warning','error'],native:{swiftUI:'LuviaToastHost',compose:'LuviaToastHost'}},
  banner:{role:'persistent-feedback',variants:['info','success','warning','error','offline'],native:{swiftUI:'LuviaBanner',compose:'LuviaBanner'}},
  commandSurface:{role:'assistant-command',variants:['global','contextual','confirmation'],hostContract:'overlay-host.v1',states:['idle','loading','success','error'],native:{swiftUI:'LuviaCommandSurface',compose:'LuviaCommandSurface'}},
  livingCompass:{role:'spatial-navigation-and-intelligence-entry',variants:['brand','activeTrip','compact','expanded'],states:['dormant','inviting','expanded','seeking','directionSelected','settled'],layers:['face','needle','hub'],rotatableLayer:'needle',directionToneSource:'official-compass-ring-angle',minimumTouchTarget:44,native:{swiftUI:'LuviaLivingCompass',compose:'LuviaLivingCompass'}}
});

const STATES=immutable({
  loading:{tone:'neutral',role:'status',live:'polite',busy:true,blocksInteraction:false},
  empty:{tone:'neutral',role:'status',live:'polite',busy:false,blocksInteraction:false},
  error:{tone:'danger',role:'alert',live:'assertive',busy:false,blocksInteraction:false},
  offline:{tone:'warning',role:'status',live:'polite',busy:false,blocksInteraction:false},
  disabled:{tone:'neutral',role:'status',live:'off',busy:false,blocksInteraction:true},
  permission:{tone:'info',role:'status',live:'polite',busy:false,blocksInteraction:true},
  pending:{tone:'info',role:'status',live:'polite',busy:true,blocksInteraction:false},
  success:{tone:'success',role:'status',live:'polite',busy:false,blocksInteraction:false},
  attention:{tone:'warning',role:'status',live:'polite',busy:false,blocksInteraction:false}
});

const MOTION=immutable({
  enter:{duration:'motion.duration.slow',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.enter',compose:'LuviaMotion.enter'}},
  exit:{duration:'motion.duration.fast',easing:'motion.easing.exit',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.exit',compose:'LuviaMotion.exit'}},
  feedback:{duration:'motion.duration.base',easing:'motion.easing.standard',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.feedback',compose:'LuviaMotion.feedback'}},
  sharedTransition:{duration:'motion.duration.slow',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.sharedTransition',compose:'LuviaMotion.sharedTransition'}},
  compassSharedElement:{duration:'motion.duration.story',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',layers:['face','needle','hub'],native:{swiftUI:'LuviaMotion.compassSharedElement',compose:'LuviaMotion.compassSharedElement'}},
  compassNodeReveal:{duration:'motion.duration.slow',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',staggerMilliseconds:42,native:{swiftUI:'LuviaMotion.compassNodeReveal',compose:'LuviaMotion.compassNodeReveal'}},
  compassNeedleSeek:{duration:'motion.duration.story',easing:'motion.easing.standard',reducedDuration:'motion.duration.instant',rotates:['needle'],fixed:['face','hub'],native:{swiftUI:'LuviaMotion.compassNeedleSeek',compose:'LuviaMotion.compassNeedleSeek'}},
  compassDirectionSelection:{duration:'motion.duration.story',easing:'motion.easing.standard',reducedDuration:'motion.duration.instant',settleMilliseconds:620,synchronized:['selected-node','four-orbit-lines','ambient-veil'],native:{swiftUI:'LuviaMotion.compassDirectionSelection',compose:'LuviaMotion.compassDirectionSelection'}},
  compassAmbientInvite:{duration:'motion.duration.brandIntro',easing:'motion.easing.standard',reducedDuration:'motion.duration.instant',rotates:['needle'],fixed:['face','hub'],nonBlocking:true,native:{swiftUI:'LuviaMotion.compassAmbientInvite',compose:'LuviaMotion.compassAmbientInvite'}},
  compassBrandIntro:{duration:'motion.duration.brandIntro',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',playsOncePerLaunch:true,nonBlocking:true,native:{swiftUI:'LuviaMotion.compassBrandIntro',compose:'LuviaMotion.compassBrandIntro'}}
});

const HAPTICS=immutable({
  select:{intensity:'light',webIntent:'optional',native:{swiftUI:'selectionChanged',compose:'TextHandleMove'}},
  navigate:{intensity:'light',webIntent:'optional',native:{swiftUI:'impactLight',compose:'VirtualKey'}},
  confirm:{intensity:'medium',webIntent:'optional',native:{swiftUI:'impactMedium',compose:'Confirm'}},
  success:{intensity:'semantic',webIntent:'optional',native:{swiftUI:'notificationSuccess',compose:'Confirm'}},
  warning:{intensity:'semantic',webIntent:'optional',native:{swiftUI:'notificationWarning',compose:'Reject'}},
  compassSeek:{intensity:'light',webIntent:'optional',native:{swiftUI:'selectionChanged',compose:'SegmentFrequentTick'}}
});

const ACCESSIBILITY=immutable({
  minimumTouchTarget:44,
  focusVisible:true,
  focusMustNotRelyOnColorAlone:true,
  keyboardEquivalentForPointerActions:true,
  screenReaderNamesRequired:true,
  dynamicTypeRequired:true,
  reducedMotionRequired:true,
  contrast:{normalText:4.5,largeText:3,uiComponents:3},
  liveRegions:{status:'polite',error:'assertive'},
  native:{swiftUI:'Accessibility and Dynamic Type',compose:'Semantics and scalable typography'}
});

function getToken(id){const value=TOKENS[text(id)];return value||null}
function listTokens(options={}){
  const category=text(options.category);
  return Object.entries(TOKENS).filter(([,definition])=>!category||definition.category===category).map(([id,definition])=>immutable({id,...copy(definition)}));
}
function getComponent(id){return COMPONENTS[text(id)]||null}
function listComponents(){return Object.entries(COMPONENTS).map(([id,definition])=>immutable({id,...copy(definition)}))}
function getState(id){return STATES[text(id)]||null}
function listStates(){return Object.entries(STATES).map(([id,definition])=>immutable({id,...copy(definition)}))}
function getMotion(id){return MOTION[text(id)]||null}
function resolveMotion(id,options={}){
  const definition=getMotion(id);
  if(!definition)return null;
  const durationId=options.reducedMotion?definition.reducedDuration:definition.duration;
  return immutable({id:text(id),durationToken:durationId,duration:getToken(durationId)?.value||'0ms',easingToken:definition.easing,easing:getToken(definition.easing)?.value||'linear',reducedMotion:Boolean(options.reducedMotion),native:copy(definition.native)});
}
function getHaptic(id){return HAPTICS[text(id)]||null}
function listHaptics(){return Object.entries(HAPTICS).map(([id,definition])=>immutable({id,...copy(definition)}))}
function deriveActiveTripPalette(options={}){
  const accent=normalizeHex(options.accent,BRAND.directions.north);
  const [hue,saturation,lightness]=rgbToHsl(accent);
  const complement=normalizeHex(options.complement,hslToHex(hue+165,Math.max(.46,saturation*.88),clamp(lightness,.34,.62)));
  const candidates=[BRAND.ink,'#ffffff','#000000'];
  const onAccent=candidates.sort((first,second)=>contrastRatio(accent,second)-contrastRatio(accent,first))[0];
  const soft=mixHex('#ffffff',accent,.13);
  return immutable({
    contractId:CONTRACT_ID,
    source:'explicit-experience-input',
    personalized:Boolean(text(options.accent)),
    accent,
    complement,
    onAccent,
    soft,
    contrast:{onAccent:contrastRatio(accent,onAccent),minimumNormalText:ACCESSIBILITY.contrast.normalText},
    cssVariables:{
      '--luvia-color-trip-accent':accent,
      '--luvia-color-trip-complement':complement,
      '--luvia-color-trip-on-accent':onAccent,
      '--luvia-color-trip-accent-soft':soft,
      '--luvia-color-action-primary':accent,
      '--luvia-color-action-on-primary':onAccent,
      '--luvia-color-action-primary-soft':soft
    },
    domainTruth:false
  });
}
function createCompassTheme(options={}){
  const activeTrip=deriveActiveTripPalette(options);
  const personalized=activeTrip.personalized||text(options.variant)==='activeTrip';
  const ringStops=personalized
    ?[{offset:0,color:activeTrip.accent},{offset:.5,color:activeTrip.complement},{offset:1,color:activeTrip.accent}]
    :[{offset:0,color:BRAND.directions.north},{offset:.25,color:BRAND.directions.east},{offset:.5,color:BRAND.directions.south},{offset:.75,color:BRAND.directions.west},{offset:1,color:BRAND.directions.north}];
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    variant:personalized?'activeTrip':'brand',
    palette:{ringStops,directionPoints:copy(BRAND.directions),needle:{north:personalized?activeTrip.accent:BRAND.directions.north,south:personalized?activeTrip.complement:BRAND.directions.south},hub:{primary:personalized?activeTrip.accent:BRAND.directions.north,secondary:personalized?activeTrip.complement:BRAND.directions.east}},
    geometry:{viewBox:'0 0 128 128',center:{x:64,y:64},safeAreaRatio:.125,minimumCompactPixels:16,primaryFromPixels:96},
    layers:{fixed:['face','hub'],rotatable:['needle'],rotationOrigin:{x:64,y:64},forbidden:['whole-mark','face','hub']},
    assets:{primary:'assets/brand/luvia-living-compass/primary.svg',compact:'assets/brand/luvia-living-compass/compact.svg',face:'assets/brand/luvia-living-compass/layers/face.svg',needle:'assets/brand/luvia-living-compass/layers/two-ended-needle.svg',hub:'assets/brand/luvia-living-compass/layers/hub.svg'},
    activeTripPalette:activeTrip,
    domainTruth:false
  });
}
function createTheme(options={}){
  const mode=text(options.mode,'light')==='dark'?'dark':'light';
  const values=Object.fromEntries(Object.entries(TOKENS).map(([id,definition])=>[id,mode==='dark'?definition.dark:definition.value]));
  const explicitAccent=text(options.tripAccent||options.accent);
  const activeTrip=deriveActiveTripPalette({accent:explicitAccent,complement:options.tripComplement||options.complement});
  if(explicitAccent){
    values['color.action.primary']=text(options.accent)||activeTrip.accent;
    values['color.action.onPrimary']=text(options.onAccent)||activeTrip.onAccent;
    values['color.action.primarySoft']=text(options.accentSoft)||activeTrip.soft;
  }
  values['color.trip.accent']=activeTrip.accent;
  values['color.trip.complement']=activeTrip.complement;
  values['color.trip.onAccent']=activeTrip.onAccent;
  values['color.trip.accentSoft']=activeTrip.soft;
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,mode,values,activeTrip,compass:createCompassTheme({accent:explicitAccent,complement:options.tripComplement||options.complement})});
}
function getSystemSnapshot(){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,scope:'global',layers:['primitive','semantic','component','feature'],tokens:listTokens(),components:listComponents(),states:listStates(),motion:Object.entries(MOTION).map(([id,definition])=>({id,...copy(definition)})),haptics:listHaptics(),brand:copy(BRAND),compass:createCompassTheme(),accessibility:copy(ACCESSIBILITY),nativePlatforms:['swiftui','compose'],inheritsGlobalTheme:true,allowsProductForks:false,domainTruth:false});
}
function diagnostics(){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,tokenCount:Object.keys(TOKENS).length,componentCount:Object.keys(COMPONENTS).length,stateCount:Object.keys(STATES).length,motionPatternCount:Object.keys(MOTION).length,hapticIntentCount:Object.keys(HAPTICS).length,activeTripPalette:'explicit-input-only',compassRotatableLayers:['needle'],compassDirectionTone:'official-compass-ring-angle',compassOrbitLines:4,nativePlatforms:['swiftui','compose'],overlayHost:'overlay-host.v1'});
}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,getToken,listTokens,getComponent,listComponents,getState,listStates,getMotion,resolveMotion,getHaptic,listHaptics,deriveActiveTripPalette,resolveCompassDirectionTone,createCompassTheme,createTheme,getSystemSnapshot,diagnostics});
})();

;

/* ===== app/adapters/experience-web-adapter.js ===== */
(()=>{
'use strict';

const VERSION='1.1.0';
const core=window.LuviaExperienceContractCoreV1;
if(!core?.createTheme)throw new Error('Experience Web Adapter benötigt experience.v1.');

const listeners=new Set();
let current=null;

function freeze(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,freeze(item)])));
}
function notify(){listeners.forEach(listener=>{try{listener(current)}catch(error){console.error('[LuviaExperience] subscriber',error)}})}
function applyTheme(input={}){
  const mode=input.resolved==='dark'||input.mode==='dark'?'dark':'light';
  const accent=input.tripAccent||input.palette?.accent||input.accent;
  const complement=input.tripComplement||input.palette?.complement||input.complement;
  const theme=core.createTheme({mode,tripAccent:accent,tripComplement:complement,onAccent:input.palette?.contrast||input.onAccent,accentSoft:input.palette?.soft||input.accentSoft});
  const element=document.documentElement;
  for(const token of core.listTokens()){
    const value=theme.values[token.id];
    if(token.cssVariable&&value!=null)element.style.setProperty(token.cssVariable,String(value));
  }
  element.dataset.luviaExperience='v1';
  element.dataset.luviaExperienceTheme=theme.mode;
  element.dataset.luviaTripAccent=theme.activeTrip.personalized?'personalized':'brand';
  current=freeze({contractId:core.contractId,version:core.version,runtimeVersion:VERSION,adapter:'web-css-custom-properties',mode:theme.mode,appliedTokenCount:core.listTokens().length,activeTripPalette:theme.activeTrip,compass:theme.compass,updatedAt:new Date().toISOString(),domainTruth:false});
  notify();
  window.dispatchEvent(new CustomEvent('luvia:experience-theme-applied',{detail:current}));
  return current;
}
function subscribe(listener){
  if(typeof listener!=='function')throw new TypeError('Experience Subscriber muss eine Funktion sein.');
  listeners.add(listener);
  if(current)listener(current);
  return()=>listeners.delete(listener);
}
function snapshot(){return current}
function getSystemSnapshot(){return freeze({...core.getSystemSnapshot(),adapter:'web-css-custom-properties',runtimeVersion:VERSION,theme:current})}
function diagnostics(){return freeze({...core.diagnostics(),adapter:'web-css-custom-properties',adapterVersion:VERSION,browserless:false,applied:Boolean(current),mode:current?.mode||null,subscribers:listeners.size})}

window.LuviaExperienceContractV1=Object.freeze({contractId:core.contractId,version:core.version,runtimeVersion:VERSION,getToken:core.getToken,listTokens:core.listTokens,getComponent:core.getComponent,listComponents:core.listComponents,getState:core.getState,listStates:core.listStates,getMotion:core.getMotion,resolveMotion:core.resolveMotion,getHaptic:core.getHaptic,listHaptics:core.listHaptics,deriveActiveTripPalette:core.deriveActiveTripPalette,createCompassTheme:core.createCompassTheme,createTheme:core.createTheme,getSystemSnapshot,applyTheme,subscribe,snapshot,diagnostics});
window.addEventListener('luvia:theme-changed',event=>applyTheme(event.detail||{}));
applyTheme({mode:document.documentElement.dataset.theme||'light'});
window.dispatchEvent(new CustomEvent('luvia:experience-ready',{detail:window.LuviaExperienceContractV1}));
})();

;

/* ===== core/services/theme-service.js ===== */
﻿(() => {
  'use strict';
  const DEFAULT='#ee6f83';let media=null,listener=null;
  const clamp=n=>Math.max(0,Math.min(255,Math.round(n))),normalize=v=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v).toLowerCase():DEFAULT;
  const rgb=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}),hex=o=>'#'+[o.r,o.g,o.b].map(v=>clamp(v).toString(16).padStart(2,'0')).join('');
  const mix=(a,b,w)=>{const x=rgb(normalize(a)),y=rgb(normalize(b));return hex({r:x.r+(y.r-x.r)*w,g:x.g+(y.g-x.g)*w,b:x.b+(y.b-x.b)*w})};
  const luminance=c=>{const x=rgb(normalize(c));return(.2126*x.r+.7152*x.g+.0722*x.b)/255};
  function palette(accent){const a=normalize(accent);return{accent:a,hover:mix(a,'#000000',.12),soft:mix(a,'#ffffff',.84),muted:mix(a,'#ffffff',.66),border:mix(a,'#ffffff',.54),contrast:luminance(a)>.62?'#203142':'#fff',shadow:`0 18px 50px ${mix(a,'#ffffff',.62)}80`};}
  function resolved(mode){return mode==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):(mode==='dark'?'dark':'light');}
  function apply(input){const tripContract=window.LuviaTripContractV1,contractTrip=tripContract?.getActiveTrip?.()||{},trip={...contractTrip,...(input||{})},profile=window.LuviaProfileService?.snapshot?.().profile||{},mode=profile.themeMode||'system',actual=resolved(mode),candidates=[trip.accent,trip.accent_color,trip.themeColor,trip.theme_color,trip.color,trip.settings?.accent,trip.settings?.accent_color,trip.settings?.themeColor,trip.settings?.theme_color,trip.moduleSettings?.theme?.accent,trip.module_settings?.theme?.accent,trip.visualTheme?.accent,trip.visual_theme?.accent],accent=(candidates.find(v=>/^#[0-9a-f]{6}$/i.test(String(v||'')))||DEFAULT),p=palette(accent),html=document.documentElement,s=html.style;html.dataset.theme=actual;html.dataset.themeMode=mode;html.dataset.density=profile.density||'comfortable';html.classList.toggle('reduce-motion',Boolean(profile.reducedMotion));Object.entries({'--lv-accent':p.accent,'--trip-accent':p.accent,'--module-accent':p.accent,'--rv2-accent':p.accent,'--luv-place-accent':p.accent,'--today-accent':p.accent,'--trip-accent-hover':p.hover,'--trip-accent-soft':p.soft,'--trip-accent-muted':p.muted,'--trip-accent-border':p.border,'--trip-accent-contrast':p.contrast,'--trip-accent-shadow':p.shadow}).forEach(([k,v])=>s.setProperty(k,v));document.querySelector('meta[name="theme-color"]')?.setAttribute('content',actual==='dark'?'#17232d':p.soft);window.dispatchEvent(new CustomEvent('luvia:theme-changed',{detail:{mode,resolved:actual,palette:p,tripId:trip.id||null}}));return {mode,resolved:actual,palette:p};}
  function watch(){if(media)return;media=matchMedia('(prefers-color-scheme: dark)');listener=()=>{if((window.LuviaProfileService?.snapshot?.().profile?.themeMode||'system')==='system')apply()};media.addEventListener?.('change',listener);}
  watch();window.LuviaTheme=Object.freeze({version:'2.3.0',apply,palette,normalize,resolved});
})();

;

/* ===== core/storage/storage.js ===== */
(() => {
  'use strict';
  const PREFIX='luvia.';
  const KEYS=Object.freeze({activeTripId:PREFIX+'activeTripId',trips:PREFIX+'trips.v1',migration:PREFIX+'migration.paris.v1'});
  const parse=(v,f)=>{try{return v==null?f:JSON.parse(v)}catch{return f}};
  const api=Object.freeze({
    keys:KEYS,
    get(key,fallback=null){return parse(localStorage.getItem(key),fallback)},
    set(key,value){localStorage.setItem(key,JSON.stringify(value));return value},
    remove(key){localStorage.removeItem(key)},
    getText(key,fallback=''){return localStorage.getItem(key)??fallback},
    setText(key,value){localStorage.setItem(key,String(value));return value}
  });
  window.LuviaStorage=api;
})();

;

/* ===== core/media/media-domain-contract-core.js ===== */
var LuviaMediaDomainContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const DEFAULT_BUCKET='luvia-media';
const UPLOAD_STATES=Object.freeze(['queued','uploading','retry','completed','failed']);
const TRANSITIONS=Object.freeze({
  queued:Object.freeze(['uploading','failed']),
  uploading:Object.freeze(['retry','completed','failed']),
  retry:Object.freeze(['uploading','failed']),
  completed:Object.freeze([]),
  failed:Object.freeze(['queued'])
});

const text=value=>value==null?null:String(value);
const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const bool=value=>Boolean(value);
const pick=(obj,...keys)=>{
  for(const key of keys){if(obj&&obj[key]!==undefined)return obj[key]}
  return undefined;
};
const dayKey=value=>{
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
const freezeArray=items=>Object.freeze((items||[]).map(item=>item&&typeof item==='object'&&!Object.isFrozen(item)?Object.freeze(item):item));
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};

function projectEditSettings(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return Object.freeze({});
  const out={};
  for(const key of ['rotation','crop','brightness','contrast','saturation','warmth','temperature','blur','vignette','exposure','highlights','shadows','clarity','hue','grain','filter','frame','sticker','caption']){
    if(value[key]!==undefined)out[key]=value[key];
  }
  if(Array.isArray(value.overlays)){
    out.overlays=freezeArray(value.overlays.map(item=>Object.freeze({
      type:text(item?.type),value:text(item?.value),x:number(item?.x),y:number(item?.y),size:number(item?.size),rotation:number(item?.rotation),schema:text(item?.schema)
    })));
  }
  return Object.freeze(out);
}

function projectResolvedLocation(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  return Object.freeze({
    name:text(value.name),
    address:text(value.address),
    providerPlaceId:text(pick(value,'providerPlaceId','provider_place_id')),
    primaryType:text(pick(value,'primaryType','primary_type')),
    status:text(value.status),
    source:text(value.source),
    distanceMeters:number(pick(value,'distanceMeters','distance_meters')),
    confidence:number(value.confidence)
  });
}

function projectOwnerMedia(row,options={}){
  if(!row)return null;
  const fallbackBucket=options.bucket||DEFAULT_BUCKET;
  const capturedAt=pick(row,'capturedAt','captured_at')||pick(row,'createdAt','created_at');
  const metadata=row.metadata&&typeof row.metadata==='object'?row.metadata:{};
  return Object.freeze({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    userId:text(pick(row,'userId','user_id')),
    participantId:text(pick(row,'participantId','participant_id')),
    type:text(row.type),
    purpose:text(row.purpose),
    source:text(row.source),
    originalName:text(pick(row,'originalName','original_name')),
    displayName:text(pick(row,'displayName','display_name')??metadata.caption),
    mimeType:text(pick(row,'mimeType','mime_type')),
    storageBucket:text(pick(row,'storageBucket','storage_bucket')||fallbackBucket),
    storagePath:text(pick(row,'storagePath','storage_path')),
    previewPath:text(pick(row,'previewPath','preview_path')),
    thumbnailPath:text(pick(row,'thumbnailPath','thumbnail_path')),
    status:text(row.status),
    capturedAt:text(capturedAt),
    dayKey:text(pick(row,'dayKey','day_key')||dayKey(capturedAt)),
    timezone:text(row.timezone),
    latitude:number(row.latitude),
    longitude:number(row.longitude),
    width:number(row.width),
    height:number(row.height),
    fileSize:number(pick(row,'fileSize','file_size')),
    contentHash:text(pick(row,'contentHash','content_hash')),
    placeId:text(pick(row,'placeId','place_id')),
    favorite:bool(row.favorite),
    editSettings:pick(row,'editSettings','edit_settings')||{},
    metadata,
    renderedPreviewPath:text(pick(row,'renderedPreviewPath','rendered_preview_path')||metadata.renderedPreviewPath),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectPublicMedia(item){
  if(!item)return null;
  const metadata=item.metadata&&typeof item.metadata==='object'?item.metadata:{};
  return Object.freeze({
    id:text(item.id),
    tripId:text(pick(item,'tripId','trip_id')),
    participantId:text(pick(item,'participantId','participant_id')),
    type:text(item.type),
    purpose:text(item.purpose),
    source:text(item.source),
    originalName:text(pick(item,'originalName','original_name')),
    displayName:text(pick(item,'displayName','display_name')),
    mimeType:text(pick(item,'mimeType','mime_type')),
    status:text(item.status),
    capturedAt:text(pick(item,'capturedAt','captured_at')),
    dayKey:text(pick(item,'dayKey','day_key')),
    timezone:text(item.timezone),
    latitude:number(item.latitude),
    longitude:number(item.longitude),
    width:number(item.width),
    height:number(item.height),
    fileSize:number(pick(item,'fileSize','file_size')),
    placeId:text(pick(item,'placeId','place_id')),
    favorite:bool(item.favorite),
    renderedPreviewAvailable:Boolean(pick(item,'renderedPreviewPath','rendered_preview_path')||metadata.renderedPreviewPath),
    mediaKind:text(pick(item,'mediaKind','media_kind')??metadata.mediaKind),
    captureEvidenceAvailable:Boolean(metadata.captureEvidence||metadata.exif?.gpsAvailable),
    metadataAutoChecked:Boolean(metadata.metadataAutoCheckedAt),
    resolvedLocation:projectResolvedLocation(metadata.resolvedLocation),
    captureLocationName:text(metadata.captureLocation?.name),
    editSettings:projectEditSettings(pick(item,'editSettings','edit_settings')),
    createdAt:text(pick(item,'createdAt','created_at')),
    updatedAt:text(pick(item,'updatedAt','updated_at'))
  });
}

function projectRealtime(payload={}){
  const table=text(payload.table);
  const current=projectPublicMedia(payload.new);
  const previous=projectPublicMedia(payload.old);
  return Object.freeze({
    scope:table==='media_day_polaroids'?'polaroids':'media',
    eventType:text(pick(payload,'eventType','event_type','event')),
    mediaId:text(current?.id??previous?.id??pick(payload.new,'id','media_id')??pick(payload.old,'id','media_id')),
    media:current,
    previous
  });
}

function projectUploadTask(task){
  if(!task)return null;
  return Object.freeze({
    id:text(task.id),
    mediaId:text(task.mediaId),
    tripId:text(task.tripId),
    userId:text(task.userId),
    state:text(task.state),
    attempts:number(task.attempts)??0,
    queuedAt:text(task.queuedAt),
    updatedAt:text(task.updatedAt),
    nextAttemptAt:text(task.nextAttemptAt),
    lastError:text(task.lastError)
  });
}

function createUploadTask(input={}){
  const id=text(input.id);
  const mediaId=text(input.mediaId);
  const tripId=text(input.tripId);
  const userId=text(input.userId);
  if(!id||!mediaId||!tripId||!userId)throw new TypeError('Media upload task requires id, mediaId, tripId and userId.');
  const now=text(input.now)||new Date().toISOString();
  return Object.freeze({
    id,mediaId,tripId,userId,
    state:'queued',
    attempts:0,
    queuedAt:now,
    updatedAt:now,
    nextAttemptAt:null,
    lastError:null,
    options:immutable(input.options||{}),
    body:input.body
  });
}

function transitionUploadTask(task,next,patch={}){
  if(!task||!UPLOAD_STATES.includes(task.state))throw new TypeError('Invalid media upload task.');
  if(!UPLOAD_STATES.includes(next)||!TRANSITIONS[task.state].includes(next)){
    throw new Error(`Invalid media upload transition: ${task.state} -> ${next}`);
  }
  return Object.freeze({...task,...patch,state:next,updatedAt:text(patch.updatedAt)||new Date().toISOString()});
}

function createUploadCoordinator(providers={}){
  const queue=providers.queue||{};
  const network=providers.network||{};
  const lifecycle=providers.lifecycle||{};
  const execute=providers.execute;
  const now=typeof providers.now==='function'?providers.now:()=>new Date().toISOString();
  const maxAttempts=Math.max(1,Number(providers.maxAttempts)||5);
  const listeners=new Set();
  let running=null,started=false,unsubscribeNetwork=()=>{},unsubscribeLifecycle=()=>{};
  for(const method of ['put','list','remove'])if(typeof queue[method]!=='function')throw new TypeError(`Media upload queue provider missing: ${method}`);
  if(typeof execute!=='function')throw new TypeError('Media upload execute provider missing.');
  const online=()=>typeof network.isOnline!=='function'||network.isOnline()!==false;
  const emit=(type,task,error=null)=>{
    const event=Object.freeze({type,task:projectUploadTask(task),error:error?String(error?.message||error):null,at:now()});
    for(const listener of listeners){try{listener(event)}catch{}}
    return event;
  };
  async function enqueue(input={}){
    const task=createUploadTask({...input,now:now()});
    await queue.put(task);
    emit('queued',task);
    return projectUploadTask(task);
  }
  async function drain(options={}){
    if(running)return running;
    running=(async()=>{
      const summary={processed:0,completed:0,retried:0,failed:0,offline:false};
      if(!online()){summary.offline=true;return Object.freeze(summary)}
      const tasks=[...(await queue.list()||[])].sort((a,b)=>String(a.queuedAt||'').localeCompare(String(b.queuedAt||'')));
      for(const task of tasks){
        if(!online()){summary.offline=true;break}
        if(!['queued','retry','failed'].includes(task.state))continue;
        if(task.state==='failed'&&!options.includeFailed)continue;
        if(task.nextAttemptAt&&!options.force&&Date.parse(task.nextAttemptAt)>Date.parse(now()))continue;
        const queued=task.state==='failed'?transitionUploadTask(task,'queued',{updatedAt:now()}):task;
        const working=transitionUploadTask(queued,'uploading',{attempts:(Number(queued.attempts)||0)+1,nextAttemptAt:null,lastError:null,updatedAt:now()});
        await queue.put(working);
        summary.processed++;
        emit('uploading',working);
        try{
          await execute(working);
          const completed=transitionUploadTask(working,'completed',{updatedAt:now()});
          await queue.remove(working.id);
          summary.completed++;
          emit('completed',completed);
        }catch(error){
          const exhausted=working.attempts>=maxAttempts;
          const delay=Math.min(300000,1000*(2**Math.max(0,working.attempts-1)));
          const failed=transitionUploadTask(working,exhausted?'failed':'retry',{
            lastError:String(error?.message||error),
            nextAttemptAt:exhausted?null:new Date(Date.parse(now())+delay).toISOString(),
            updatedAt:now()
          });
          await queue.put(failed);
          if(exhausted)summary.failed++;else summary.retried++;
          emit(exhausted?'failed':'retry',failed,error);
          if(!online()){summary.offline=true;break}
        }
      }
      return Object.freeze(summary);
    })();
    try{return await running}finally{running=null}
  }
  async function snapshot(){
    const tasks=await queue.list();
    const counts=Object.fromEntries(UPLOAD_STATES.map(state=>[state,0]));
    for(const task of tasks||[])if(counts[task.state]!==undefined)counts[task.state]++;
    return Object.freeze({started,running:Boolean(running),online:online(),total:(tasks||[]).length,counts:Object.freeze(counts)});
  }
  function subscribe(listener){if(typeof listener!=='function')return()=>{};listeners.add(listener);return()=>listeners.delete(listener)}
  function start(){
    if(started)return api;
    started=true;
    if(typeof network.subscribe==='function')unsubscribeNetwork=network.subscribe(state=>{const value=typeof state==='boolean'?state:state?.online;if(value!==false)drain({force:true}).catch(()=>{})});
    if(typeof lifecycle.subscribe==='function')unsubscribeLifecycle=lifecycle.subscribe(state=>{const value=typeof state==='string'?state:state?.state;if(['active','visible','foreground'].includes(value))drain({force:true}).catch(()=>{})});
    if(online())drain().catch(()=>{});
    return api;
  }
  function stop(){unsubscribeNetwork();unsubscribeLifecycle();unsubscribeNetwork=()=>{};unsubscribeLifecycle=()=>{};started=false;return api}
  const api=Object.freeze({enqueue,drain,snapshot,subscribe,start,stop});
  return api;
}

return Object.freeze({
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  bucket:DEFAULT_BUCKET,
  uploadStates:UPLOAD_STATES,
  projectOwnerMedia,
  projectPublicMedia,
  projectRealtime,
  projectUploadTask,
  createUploadTask,
  transitionUploadTask,
  createUploadCoordinator
});
})();

;

/* ===== core/memory/memory-domain-contract-core.js ===== */
var LuviaMemoryDomainContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='memory.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const STORY_STATUSES=Object.freeze(['draft','published','archived']);
const FILTERS=Object.freeze(['all','favorites','unassigned','photos','videos']);
const SORTS=Object.freeze(['captured-desc','captured-asc','updated-desc']);

const text=value=>value==null?null:String(value);
const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const pick=(value,...keys)=>{
  for(const key of keys){if(value&&value[key]!==undefined)return value[key]}
  return undefined;
};
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const unique=values=>[...new Set((values||[]).map(value=>text(value)).filter(Boolean))];
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const normalizeSearch=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE');
const dateValue=value=>{
  const timestamp=Date.parse(value||'');
  return Number.isFinite(timestamp)?timestamp:0;
};
const dayKey=value=>{
  const direct=clean(value);
  if(/^\d{4}-\d{2}-\d{2}$/.test(direct))return direct;
  const timestamp=Date.parse(direct);
  if(!Number.isFinite(timestamp))return null;
  return new Date(timestamp).toISOString().slice(0,10);
};

function projectContribution(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    authorId:text(pick(row,'authorId','author_id','userId','user_id')),
    promptKey:text(pick(row,'promptKey','prompt_key')),
    promptText:text(pick(row,'promptText','prompt_text')),
    answerText:text(pick(row,'answerText','answer_text')),
    reaction:text(row.reaction),
    mediaId:text(pick(row,'mediaId','media_id')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectAlbum(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    clusterId:text(pick(row,'clusterId','sourceClusterId','source_cluster_id')),
    title:text(row.title),
    description:text(row.description),
    mood:text(row.mood),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id')),
    mediaIds:unique(pick(row,'mediaIds','media_ids')),
    status:text(row.status)||'draft',
    contributions:(row.contributions||[]).map(projectContribution).filter(Boolean),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectCard(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    authorId:text(pick(row,'authorId','author_id')),
    cardType:text(pick(row,'cardType','card_type')),
    sourceType:text(pick(row,'sourceType','source_type')),
    content:text(row.content),
    mediaId:text(pick(row,'mediaId','media_id')),
    clusterId:text(pick(row,'clusterId','cluster_id')),
    storyId:text(pick(row,'storyId','journeyId','journey_id')),
    reaction:text(row.reaction),
    weight:number(row.weight)||1,
    visibility:row.visibility==='private'?'private':'trip',
    status:text(row.status)||'active',
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectChapter(row,index=0){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    position:number(row.position)??index,
    title:text(row.title)||`Kapitel ${index+1}`,
    dayKey:dayKey(pick(row,'dayKey','day_key')),
    summary:text(row.summary),
    mood:text(row.mood),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id'))
  });
}

function projectStoryItem(row,index=0){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    chapterPosition:number(pick(row,'chapterPosition','chapter_position'))??0,
    position:number(row.position)??index,
    itemType:text(pick(row,'itemType','item_type'))||'media',
    mediaId:text(pick(row,'mediaId','media_id')),
    albumId:text(pick(row,'albumId','memoryAlbumId','memory_album_id')),
    clusterId:text(pick(row,'clusterId','cluster_id')),
    journeyEntryId:text(pick(row,'journeyEntryId','timelineEventId','timeline_event_id')),
    dayKey:dayKey(pick(row,'dayKey','day_key'))
  });
}

function projectStory(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    title:text(row.title),
    subtitle:text(row.subtitle),
    description:text(row.description),
    coverMediaId:text(pick(row,'coverMediaId','cover_media_id')),
    status:STORY_STATUSES.includes(row.status)?row.status:'draft',
    chapters:(row.chapters||[]).map(projectChapter).filter(Boolean).sort((a,b)=>a.position-b.position),
    items:(row.items||[]).map(projectStoryItem).filter(Boolean).sort((a,b)=>a.chapterPosition-b.chapterPosition||a.position-b.position),
    contributions:(row.contributions||[]).map(projectContribution).filter(Boolean),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectCluster(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    title:text(row.title),
    kind:text(row.kind),
    state:text(row.state),
    mediaIds:unique(pick(row,'mediaIds','media_ids')),
    startAt:text(pick(row,'startAt','start_at')),
    endAt:text(pick(row,'endAt','end_at'))
  });
}

function projectMediaReference(row){
  if(!row)return null;
  return immutable({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    participantId:text(pick(row,'participantId','participant_id')),
    type:text(row.type),
    purpose:text(row.purpose),
    source:text(row.source),
    displayName:text(pick(row,'displayName','display_name','originalName','original_name')),
    mimeType:text(pick(row,'mimeType','mime_type')),
    status:text(row.status),
    capturedAt:text(pick(row,'capturedAt','captured_at')),
    dayKey:dayKey(pick(row,'dayKey','day_key')||pick(row,'capturedAt','captured_at')),
    width:number(row.width),
    height:number(row.height),
    favorite:Boolean(row.favorite),
    placeId:text(pick(row,'placeId','place_id')),
    placeName:text(row.resolvedLocation?.name||row.captureLocationName),
    mediaKind:text(pick(row,'mediaKind','media_kind')),
    renderedPreviewAvailable:Boolean(row.renderedPreviewAvailable),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function membershipIndex(albums=[],stories=[]){
  const map=new Map();
  const ensure=mediaId=>{
    const key=text(mediaId);
    if(!key)return null;
    if(!map.has(key))map.set(key,{albumIds:[],albumTitles:[],storyIds:[],storyTitles:[]});
    return map.get(key);
  };
  for(const album of albums){
    for(const mediaId of album.mediaIds||[]){
      const entry=ensure(mediaId);if(!entry)continue;
      entry.albumIds.push(album.id);if(album.title)entry.albumTitles.push(album.title);
    }
  }
  for(const story of stories){
    for(const item of story.items||[]){
      const entry=ensure(item.mediaId);if(!entry)continue;
      entry.storyIds.push(story.id);if(story.title)entry.storyTitles.push(story.title);
    }
  }
  return map;
}

function buildLibrary(input={},options={}){
  const albums=(input.albums||[]).map(projectAlbum).filter(Boolean);
  const stories=(input.stories||[]).map(projectStory).filter(Boolean);
  const memberships=membershipIndex(albums,stories);
  const selected=new Set(unique(options.selectedIds));
  const query=normalizeSearch(options.query);
  const terms=query.split(' ').filter(Boolean);
  const filter=FILTERS.includes(options.filter)?options.filter:'all';
  const sort=SORTS.includes(options.sort)?options.sort:'captured-desc';
  const all=(input.media||[]).map(projectMediaReference).filter(item=>item&&item.id&&item.status!=='deleted').map(item=>{
    const refs=memberships.get(item.id)||{albumIds:[],albumTitles:[],storyIds:[],storyTitles:[]};
    return immutable({...item,memoryRefs:refs,selected:selected.has(item.id)});
  });
  const days=new Set(all.map(item=>item.dayKey).filter(Boolean));
  const stats=immutable({
    media:all.length,
    favorites:all.filter(item=>item.favorite).length,
    days:days.size,
    albums:albums.length,
    stories:stories.length,
    selected:selected.size
  });
  let filtered=all.filter(item=>{
    if(filter==='favorites'&&!item.favorite)return false;
    if(filter==='unassigned'&&(item.memoryRefs.albumIds.length||item.memoryRefs.storyIds.length))return false;
    if(filter==='photos'&&!(item.type==='image'||String(item.mimeType||'').startsWith('image/')))return false;
    if(filter==='videos'&&!(item.type==='video'||String(item.mimeType||'').startsWith('video/')))return false;
    if(!terms.length)return true;
    const haystack=normalizeSearch([
      item.displayName,item.dayKey,item.placeName,item.mediaKind,item.mimeType,
      ...item.memoryRefs.albumTitles,...item.memoryRefs.storyTitles
    ].filter(Boolean).join(' '));
    return terms.every(term=>haystack.includes(term));
  });
  filtered.sort((a,b)=>{
    if(sort==='captured-asc')return dateValue(a.capturedAt)-dateValue(b.capturedAt)||String(a.id).localeCompare(String(b.id));
    if(sort==='updated-desc')return dateValue(b.updatedAt)-dateValue(a.updatedAt)||String(a.id).localeCompare(String(b.id));
    return dateValue(b.capturedAt)-dateValue(a.capturedAt)||String(a.id).localeCompare(String(b.id));
  });
  const offset=Math.max(0,Number.parseInt(options.cursor,10)||0);
  const limit=Math.max(12,Math.min(120,Number(options.limit)||36));
  const items=filtered.slice(offset,offset+limit);
  return immutable({
    contractId:CONTRACT_ID,
    query:clean(options.query),filter,sort,stats,
    items,
    page:Object.freeze({offset,limit,total:filtered.length,hasMore:offset+items.length<filtered.length,nextCursor:offset+items.length}),
    provenance:Object.freeze({mediaTruth:'media.v1',memoryTruth:CONTRACT_ID,foreignTruth:false})
  });
}

function createSelection(ids=[],options={}){
  const max=Math.max(1,Math.min(200,Number(options.max)||60));
  const selected=unique(ids).slice(0,max);
  return immutable({ids:selected,count:selected.length,max,remaining:max-selected.length,full:selected.length>=max});
}

function toggleSelection(selection={},mediaId){
  const id=text(mediaId);
  if(!id)throw new TypeError('Memory selection requires a media id.');
  const current=createSelection(selection.ids||[],{max:selection.max});
  const ids=[...current.ids];
  const index=ids.indexOf(id);
  if(index>=0)ids.splice(index,1);
  else{
    if(ids.length>=current.max)throw new Error('MEMORY_SELECTION_LIMIT');
    ids.push(id);
  }
  return createSelection(ids,{max:current.max});
}

function createStoryDraft(input={}){
  const media=unique((input.media||[]).map(item=>item?.id)).map(id=>(input.media||[]).find(item=>String(item?.id)===id)).map(projectMediaReference).filter(Boolean).sort((a,b)=>dateValue(a.capturedAt)-dateValue(b.capturedAt)||String(a.id).localeCompare(String(b.id)));
  if(!media.length)throw new Error('MEMORY_STORY_REQUIRES_MEDIA');
  const groups=new Map();
  for(const item of media){const key=item.dayKey||'undatiert';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}
  const chapters=[...groups.entries()].map(([key,items],position)=>{
    const places=unique(items.map(item=>item.placeName));
    return immutable({
      position,
      title:key==='undatiert'?`Kapitel ${position+1}`:`Tag ${position+1}`,
      dayKey:key==='undatiert'?null:key,
      summary:places.length?places.slice(0,3).join(' · '):`${items.length} ${items.length===1?'Erinnerung':'Erinnerungen'}`,
      mood:null,
      coverMediaId:items[0].id,
      mediaIds:items.map(item=>item.id)
    });
  });
  const items=chapters.flatMap(chapter=>chapter.mediaIds.map((mediaId,position)=>immutable({chapterPosition:chapter.position,position,itemType:'media',mediaId,dayKey:chapter.dayKey})));
  const destination=clean(input.trip?.destination?.name||input.trip?.destinationName||'');
  const title=clean(input.title)||(destination?`Unsere Reise nach ${destination}`:'Unsere Reisegeschichte');
  const description=clean(input.description)||`${media.length} ${media.length===1?'Erinnerung':'Erinnerungen'} aus ${chapters.length} ${chapters.length===1?'Kapitel':'Kapiteln'} – bereit für eure gemeinsame Geschichte.`;
  return normalizeStoryCommand({id:input.id,title,subtitle:clean(input.subtitle),description,coverMediaId:media[0].id,status:input.status||'draft',chapters,items});
}

function normalizeStoryCommand(input={}){
  const title=clean(input.title).slice(0,120);
  if(!title)throw new Error('MEMORY_STORY_TITLE_REQUIRED');
  const status=STORY_STATUSES.includes(input.status)?input.status:'draft';
  const chapters=(input.chapters||[]).slice(0,60).map((chapter,index)=>({
    position:index,
    title:(clean(chapter.title)||`Kapitel ${index+1}`).slice(0,120),
    dayKey:dayKey(chapter.dayKey),
    summary:clean(chapter.summary).slice(0,800),
    mood:clean(chapter.mood).slice(0,80)||null,
    coverMediaId:text(chapter.coverMediaId)
  }));
  const items=(input.items||[]).slice(0,500).map((item,index)=>({
    chapterPosition:Math.max(0,Math.min(chapters.length-1,Number(item.chapterPosition)||0)),
    position:index,
    itemType:['media','album','journey'].includes(item.itemType)?item.itemType:'media',
    mediaId:text(item.mediaId),
    clusterId:text(item.clusterId),
    memoryAlbumId:text(item.memoryAlbumId||item.albumId),
    timelineEventId:text(item.timelineEventId||item.journeyEntryId),
    dayKey:dayKey(item.dayKey)
  })).filter(item=>item.mediaId||item.clusterId||item.memoryAlbumId||item.timelineEventId);
  if(!items.length)throw new Error('MEMORY_STORY_REQUIRES_ITEMS');
  return immutable({
    id:text(input.id),
    title,
    subtitle:clean(input.subtitle).slice(0,220),
    description:clean(input.description).slice(0,5000),
    coverMediaId:text(input.coverMediaId)||items.find(item=>item.mediaId)?.mediaId||null,
    status,
    chapters,
    items
  });
}

function projectTransfer(snapshot={}){
  const counts=Object.fromEntries(['queued','uploading','retry','completed','failed'].map(state=>[state,Math.max(0,Number(snapshot.counts?.[state])||0)]));
  const pending=counts.queued+counts.uploading+counts.retry+counts.failed;
  return immutable({
    online:snapshot.online!==false,
    running:Boolean(snapshot.running),
    total:Math.max(Number(snapshot.total)||0,pending),
    pending,
    counts,
    status:counts.failed?'attention':pending?'syncing':snapshot.online===false?'offline':'ready'
  });
}

const diagnostics=()=>immutable({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  browserless:true,
  truth:'canonical-memory-and-narrative-truth',
  mediaAssetTruth:false,
  persistence:false,
  filters:FILTERS,
  storyStatuses:STORY_STATUSES
});

return Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  storyStatuses:STORY_STATUSES,
  filters:FILTERS,
  sorts:SORTS,
  normalizeSearch,
  projectContribution,
  projectAlbum,
  projectCard,
  projectStory,
  projectCluster,
  projectMediaReference,
  buildLibrary,
  createSelection,
  toggleSelection,
  createStoryDraft,
  normalizeStoryCommand,
  projectTransfer,
  diagnostics
});
})();

;

/* ===== core/platform/memory-runtime-context-adapter.js ===== */
(()=>{
'use strict';

const root=globalThis;

function authSessionPort(){
  const registered=root.LuviaPlatformPorts?.get?.('AuthSessionPort');
  return registered||root.LuviaIdentityPlatformWebPorts?.AuthSessionPort||null;
}

async function get(){
  const client=root.LuviaSupabaseService?.getClient?.()||root.LuviaSupabase?.getClient?.()||root.LuviaSupabase?.client?.()||null;
  const tripContract=root.LuviaTripContractV1;
  const activeTrip=tripContract?.getActiveTrip?.()||null;
  const tripContext=tripContract?.getContext?.()||{};
  const tripId=String(activeTrip?.id||activeTrip?.tripId||tripContext.activeTripId||tripContext.tripId||'');
  const auth=authSessionPort()?.snapshot?.()||{};
  const userId=String(auth.user?.id||auth.session?.user?.id||'');
  if(!client)throw new Error('Memory Runtime benötigt eine aktive Datenverbindung.');
  if(!userId)throw new Error('Memory Runtime benötigt eine gültige Anmeldung.');
  if(!tripId)throw new Error('Memory Runtime benötigt eine aktive Reise.');
  return Object.freeze({client,tripId,userId,trip:activeTrip});
}

const diagnostics=()=>Object.freeze({
  contractId:'memory-runtime-context.v1',
  ready:Boolean(root.LuviaSupabaseService&&root.LuviaTripContractV1&&authSessionPort()),
  tripBoundary:'trip.v1',
  authBoundary:'AuthSessionPort',
  mediaBoundary:'media.v1',
  ownsTruth:false
});

root.LuviaMemoryRuntimeContextV1=Object.freeze({version:'1.0.0',get,diagnostics});
})();

;

/* ===== core/media/media-metadata.js ===== */
(() => {
  'use strict';
  const VERSION='4.28.6.7';
  const TYPE_SIZE={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
  const isHeic=file=>/image\/(hei[cf]|heic-sequence|heif-sequence)/i.test(file?.type||'')||/\.hei[cf]$/i.test(file?.name||'');
  const isJpeg=file=>/image\/(jpeg|jpg)/i.test(file?.type||'')||/\.jpe?g$/i.test(file?.name||'');
  const ascii=(v,o,n)=>{let s='';for(let i=0;i<n&&o+i<v.byteLength;i++){const c=v.getUint8(o+i);if(!c)break;s+=String.fromCharCode(c)}return s};
  const exifDate=(value,offset)=>{if(value instanceof Date&&!Number.isNaN(value.getTime()))return value.toISOString();const m=String(value||'').trim().match(/^(\d{4}):?(\d{2}):?(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);if(!m)return null;const zone=/^[-+]\d\d:\d\d$/.test(String(offset||''))?offset:'';const d=new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${zone}`);return Number.isNaN(d.getTime())?null:d.toISOString()};
  const rational=(v,o,le)=>{if(o+8>v.byteLength)return null;const n=v.getUint32(o,le),d=v.getUint32(o+4,le);return d?n/d:null};
  function ifd(v,tiff,offset,le){const out={},base=tiff+offset;if(base<0||base+2>v.byteLength)return out;const count=v.getUint16(base,le);for(let i=0;i<count;i++){const e=base+2+i*12;if(e+12>v.byteLength)break;const tag=v.getUint16(e,le),type=v.getUint16(e+2,le),amount=v.getUint32(e+4,le),bytes=amount*(TYPE_SIZE[type]||1),pointer=v.getUint32(e+8,le),pos=bytes<=4?e+8:tiff+pointer;if(pos>=0&&pos<v.byteLength)out[tag]={type,amount,pos,bytes,pointer}}return out}
  const text=(v,e)=>e&&[1,2,7].includes(e.type)?ascii(v,e.pos,e.amount).trim():null;
  const short=(v,e,le)=>e&&e.pos+2<=v.byteLength?v.getUint16(e.pos,le):null;
  const valueOffset=(v,e,le)=>e&&e.pos+4<=v.byteLength?v.getUint32(e.pos,le):null;
  const decimal=(a,ref)=>{if(!a||a.length<3||a.some(x=>!Number.isFinite(x)))return null;let x=a[0]+a[1]/60+a[2]/3600;if(/[SW]/i.test(String(ref)))x*=-1;return Number.isFinite(x)?x:null};
  async function parseJpegExif(file){
    if(!file||!isJpeg(file))return{};const v=new DataView(await file.arrayBuffer());if(v.byteLength<4||v.getUint16(0,false)!==0xffd8)return{};let o=2;
    while(o+4<=v.byteLength){while(o<v.byteLength&&v.getUint8(o)!==0xff)o++;while(o<v.byteLength&&v.getUint8(o)===0xff)o++;if(o>=v.byteLength)break;const code=v.getUint8(o++);if(code===0xd9||code===0xda)break;if(code>=0xd0&&code<=0xd7)continue;if(o+2>v.byteLength)break;const len=v.getUint16(o,false);if(len<2||o+len>v.byteLength)break;const payload=o+2;
      if(code===0xe1&&len>=8&&ascii(v,payload,6)==='Exif'){const t=payload+6,endian=ascii(v,t,2),le=endian==='II';if(!le&&endian!=='MM')return{};if(v.getUint16(t+2,le)!==42)return{};const root=ifd(v,t,v.getUint32(t+4,le),le),exOffset=valueOffset(v,root[0x8769],le),gpsOffset=valueOffset(v,root[0x8825],le),ex=Number.isFinite(exOffset)?ifd(v,t,exOffset,le):{},g=Number.isFinite(gpsOffset)?ifd(v,t,gpsOffset,le):{};const latRef=text(v,g[1]),lonRef=text(v,g[3]),latitude=g[2]?.type===5?decimal([0,1,2].map(i=>rational(v,g[2].pos+i*8,le)),latRef):null,longitude=g[4]?.type===5?decimal([0,1,2].map(i=>rational(v,g[4].pos+i*8,le)),lonRef):null,dateRaw=text(v,ex[0x9003]||ex[0x9004]||root[0x0132]),offsetRaw=text(v,ex[0x9011]||ex[0x9012]||root[0x9010]);return{capturedAt:exifDate(dateRaw,offsetRaw),latitude,longitude,source:'exif-jpeg',exif:{container:'jpeg',make:text(v,root[0x010f]),model:text(v,root[0x0110]),software:text(v,root[0x0131]),orientation:short(v,root[0x0112],le),lensModel:text(v,ex[0xa434]),dateTimeOriginal:dateRaw,offsetTimeOriginal:offsetRaw,gpsAvailable:Number.isFinite(latitude)&&Number.isFinite(longitude)}}}o+=len}return{};
  }
  async function parseWithExifr(file){
    if(!window.exifr?.parse)return{};
    const raw=await window.exifr.parse(file,{tiff:true,exif:true,gps:true,ifd0:true,interop:true,translateValues:true,reviveValues:true,mergeOutput:true});
    if(!raw)return{};const latitude=Number.isFinite(Number(raw.latitude))?Number(raw.latitude):null,longitude=Number.isFinite(Number(raw.longitude))?Number(raw.longitude):null,capturedAt=exifDate(raw.DateTimeOriginal||raw.CreateDate||raw.ModifyDate,raw.OffsetTimeOriginal||raw.OffsetTimeDigitized||raw.OffsetTime);
    return{capturedAt,latitude,longitude,source:isHeic(file)?'exif-heic':'exif-library',exif:{container:isHeic(file)?'heic':isJpeg(file)?'jpeg':'image',make:raw.Make||null,model:raw.Model||null,software:raw.Software||null,lensModel:raw.LensModel||null,orientation:raw.Orientation||null,dateTimeOriginal:raw.DateTimeOriginal instanceof Date?raw.DateTimeOriginal.toISOString():raw.DateTimeOriginal||null,offsetTimeOriginal:raw.OffsetTimeOriginal||null,gpsAvailable:Number.isFinite(latitude)&&Number.isFinite(longitude),gpsAltitude:Number.isFinite(Number(raw.GPSAltitude))?Number(raw.GPSAltitude):null,rawTags:Object.keys(raw).filter(k=>/^(GPS|Date|Create|Modify|Offset|Make|Model|Lens|Orientation)/.test(k)).slice(0,80)}};
  }
  async function parse(file){let library={};try{library=await parseWithExifr(file)}catch(error){console.warn('[LuviaMediaMetadata] exifr parse failed',error)}if(library.capturedAt||library.latitude!=null||library.longitude!=null)return library;try{return await parseJpegExif(file)}catch(error){console.warn('[LuviaMediaMetadata] JPEG fallback failed',error);return{}}}
  async function displayBlob(file){if(isHeic(file)&&typeof window.heic2any==='function'){const result=await window.heic2any({blob:file,toType:'image/jpeg',quality:.9});return Array.isArray(result)?result[0]:result}return file}
  async function dimensions(file){try{const source=await displayBlob(file);if(typeof createImageBitmap==='function'){const b=await createImageBitmap(source),r={width:b.width,height:b.height};b.close?.();return r}}catch(error){console.warn('[LuviaMediaMetadata] dimensions failed',error)}return{width:null,height:null}}
  async function contentHash(file){if(!crypto?.subtle||!(file instanceof Blob))return null;const n=512*1024,a=await file.slice(0,Math.min(file.size,n)).arrayBuffer(),start=Math.max(0,file.size-n),b=start?await file.slice(start).arrayBuffer():new ArrayBuffer(0),m=new TextEncoder().encode(`${file.name||''}|${file.size}|${file.type||''}`),all=new Uint8Array(a.byteLength+b.byteLength+m.byteLength);all.set(new Uint8Array(a));all.set(new Uint8Array(b),a.byteLength);all.set(m,a.byteLength+b.byteLength);const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',all));return[...hash].map(x=>x.toString(16).padStart(2,'0')).join('')}
  async function extract(file,options={}){const [parsed,size,hash]=await Promise.all([parse(file),dimensions(file),contentHash(file)]);const fallback=options.capturedAt||(file?.lastModified?new Date(file.lastModified).toISOString():new Date().toISOString()),location=options.location||{},latitude=parsed.latitude??location.latitude??null,longitude=parsed.longitude??location.longitude??null,hasExifGps=parsed.latitude!=null&&parsed.longitude!=null;return Object.freeze({capturedAt:parsed.capturedAt||fallback,latitude,longitude,locationAccuracy:hasExifGps?null:(location.accuracy??null),width:size.width,height:size.height,contentHash:hash,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||null,evidence:parsed.source||(location.latitude!=null?'global_location':file?.lastModified?'file_last_modified':'upload_time'),captureSource:options.captureSource||options.source||'user_upload',deviceMetadata:options.deviceMetadata||null,exif:{...(parsed.exif||{}),originalGpsFound:hasExifGps,parser:window.exifr?.parse?'exifr+fallback':'jpeg-fallback'},originalLastModified:file?.lastModified||null,originalName:file?.name||null,mimeType:file?.type||null,isHeic:isHeic(file)})}
  window.LuviaMediaMetadata=Object.freeze({version:VERSION,extract,parse,parseJpegExif,contentHash,isHeic,displayBlob});
})();

;

/* ===== core/media/media-preview.js ===== */
(() => {
  'use strict';
  const VERSION='4.28.2.2',BUILD='13.28.2.2';
  const isHeic=file=>/hei[cf]/i.test(file?.type||'')||/\.hei[cf]$/i.test(file?.name||'');
  async function decodedBlob(file){
    if(isHeic(file)&&typeof window.heic2any==='function'){
      const converted=await window.heic2any({blob:file,toType:'image/jpeg',quality:.86});
      return Array.isArray(converted)?converted[0]:converted;
    }
    return file;
  }
  async function make(file,{max=1600,quality=.84}={}){
    const source=await decodedBlob(file);
    const bitmap=await createImageBitmap(source);
    const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('Vorschau konnte nicht erzeugt werden.')),'image/jpeg',quality));
    return{blob,width:canvas.width,height:canvas.height,mimeType:'image/jpeg'};
  }
  window.LuviaMediaPreview=Object.freeze({version:VERSION,build:BUILD,isHeic,make,available:()=>typeof createImageBitmap==='function'});
})();

;

/* ===== core/media/media-core.js ===== */
﻿(() => {
  'use strict';
  const VERSION='4.30.1',BUILD='13.30.1',BUCKET='luvia-media',channels=new Map();
  let uploadCoordinator=null;
  const domain=()=>globalThis.LuviaMediaDomainContractCoreV1;
  const platformPort=id=>globalThis.LuviaPlatformPorts?.get?.(id)||null;
  const mediaStorage=()=>{
    const port=platformPort('MediaStoragePort');
    if(!port)throw new Error('Media Core benötigt einen MediaStoragePort.');
    return port;
  };
  const id=()=>crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ext=f=>(f?.name?.split('.').pop()||f?.type?.split('/').pop()||'jpg').replace(/[^a-z0-9]/gi,'').toLowerCase()||'jpg';
  const day=iso=>{const d=new Date(iso);return Number.isNaN(d.getTime())?null:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  async function context(){
    const client=window.LuviaSupabaseService?.getClient?.()||window.LuviaSupabase?.getClient?.()||window.LuviaSupabase?.client?.()||window.ParisSupabaseClient||window.ParisCloud?.client;
    const tripContract=window.LuviaTripContractV1,trip=tripContract?.getActiveTrip?.()||null,tripContext=tripContract?.getContext?.()||{};
    const tripId=String(trip?.id||trip?.tripId||tripContext?.activeTripId||tripContext?.tripId||'');
    let userId=window.ParisAuth?.getState?.()?.user?.id||window.LuviaRuntime?.getSnapshot?.()?.auth?.user?.id||null;
    if(!userId&&client?.auth?.getSession){const session=await client.auth.getSession();if(session?.error)throw session.error;userId=session?.data?.session?.user?.id||null}
    if(!client)throw new Error('Media Core benötigt eine aktive Supabase-Verbindung.');
    if(!userId)throw new Error('Media Core benötigt eine gültige Anmeldung.');
    if(!tripId)throw new Error('Media Core benötigt eine aktive Reise.');
    return{client,tripId,userId,trip};
  }

  const distance=(a,b)=>{const R=6371000,dLat=(Number(b.latitude)-Number(a.latitude))*Math.PI/180,dLon=(Number(b.longitude)-Number(a.longitude))*Math.PI/180,x=Math.sin(dLat/2)**2+Math.cos(Number(a.latitude)*Math.PI/180)*Math.cos(Number(b.latitude)*Math.PI/180)*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))};
  async function resolveCaptureLocation(meta){
    if(!Number.isFinite(Number(meta?.latitude))||!Number.isFinite(Number(meta?.longitude)))return null;
    const location={latitude:Number(meta.latitude),longitude:Number(meta.longitude)};
    if(!window.LuviaPlaces?.nearbySearch)return{latitude:location.latitude,longitude:location.longitude,source:'exif',status:'coordinates_only'};
    try{const response=await window.LuviaPlaces.nearbySearch({location,radius:350,maxResultCount:10,rankPreference:'DISTANCE',strictDestination:false,languageCode:'de'}),places=response?.data?.places||[];const ranked=places.map(place=>({place,distanceMeters:distance(location,place.location||place.coordinates||{latitude:place.latitude,longitude:place.longitude})})).filter(x=>Number.isFinite(x.distanceMeters)).sort((a,b)=>a.distanceMeters-b.distanceMeters),best=ranked[0];if(!best)return{...location,source:'exif',status:'coordinates_only'};return{...location,source:'exif+google_places',status:'resolved',name:best.place.displayName||best.place.name||null,address:best.place.formattedAddress||best.place.shortAddress||best.place.address||null,providerPlaceId:String(best.place.providerPlaceId||best.place.id||'').replace(/^places\//,''),primaryType:best.place.primaryType||null,distanceMeters:Math.round(best.distanceMeters),confidence:best.distanceMeters<=80?.98:best.distanceMeters<=180?.88:.72}}catch(error){console.warn('[LuviaMediaCore] Ortsauflösung fehlgeschlagen',error);return{...location,source:'exif',status:'resolver_failed',error:error?.code||error?.message||'resolver_failed'}}
  }

  function entity(r){
    const core=domain();
    if(!core?.projectOwnerMedia)throw new Error('Media Domain Contract Core ist nicht geladen.');
    return core.projectOwnerMedia(r,{bucket:BUCKET});
  }
  async function list(options={}){const{client,tripId}=await context();let q=client.from('media').select('*').eq('trip_id',tripId).neq('status','deleted');if(options.type)q=q.eq('type',options.type);if(options.dayKey)q=q.eq('day_key',options.dayKey);if(options.favorite)q=q.eq('favorite',true);const r=await q.order('captured_at',{ascending:true,nullsFirst:false}).order('created_at',{ascending:true});if(r.error)throw r.error;return(r.data||[]).map(entity)}
  async function get(mediaId){const{client,tripId}=await context(),r=await client.from('media').select('*').eq('trip_id',tripId).eq('id',mediaId).maybeSingle();if(r.error)throw r.error;return r.data?entity(r.data):null}
  async function signedUrl(item,expiresIn=3600){
    const bucket=item?.storageBucket||BUCKET;
    const candidates=[item?.renderedPreviewPath,item?.metadata?.renderedPreviewPath,item?.previewPath,item?.thumbnailPath,item?.storagePath].filter(Boolean);
    if(!candidates.length)return null;
    const{client}=await context();
    let lastError=null;
    for(const path of [...new Set(candidates)]){
      const r=await mediaStorage().createSignedUrl(bucket,path,expiresIn);
      if(!r.error&&r.data?.signedUrl)return r.data.signedUrl;
      lastError=r.error||null;
    }
    if(lastError)throw lastError;
    return null;
  }

  async function signedOriginalUrl(item,expiresIn=3600){
    const bucket=item?.storageBucket||BUCKET,candidates=[item?.previewPath,item?.thumbnailPath,item?.storagePath].filter(Boolean);
    if(!candidates.length)return null;const{client}=await context();let lastError=null;
    for(const path of [...new Set(candidates)]){const r=await mediaStorage().createSignedUrl(bucket,path,expiresIn);if(!r.error&&r.data?.signedUrl)return r.data.signedUrl;lastError=r.error||null}
    if(lastError)throw lastError;return null;
  }
  async function saveRenderedPreview(mediaId,blob,{editSettings=null,displayName,metadataPatch={}}={}){
    if(!(blob instanceof Blob))throw new TypeError('Gerenderte Fotovorschau fehlt.');
    const{client,tripId,userId}=await context(),item=await get(mediaId);if(!item)throw new Error('Foto wurde nicht gefunden.');
    const path=`${tripId}/${userId}/${mediaId}/rendered.jpg`;
    const stored=await mediaStorage().upload(item.storageBucket||BUCKET,path,blob,{upsert:true,contentType:'image/jpeg',cacheControl:'0'});if(stored.error)throw stored.error;
    const metadata={...(item.metadata||{}),...(metadataPatch||{}),renderedPreviewPath:path,renderedAt:new Date().toISOString(),renderSchema:'image-composite-v1'};
    const saved=await update(mediaId,{...(editSettings?{editSettings}:{}),...(displayName!==undefined?{displayName}:{}),metadata});window.dispatchEvent(new CustomEvent('luvia:media-composite-updated',{detail:{mediaId,tripId,dayKey:saved.dayKey}}));return saved;
  }
  async function performUpload(file,options={}){
    if(!(file instanceof Blob))throw new TypeError('Media Core erwartet eine Datei oder einen Blob.');
    const{client,tripId,userId}=await context(),mediaId=options.id||id();
    const source=['user_upload','remote_url','provider','generated','app_camera'].includes(options.source)?options.source:'user_upload';
    const meta=await window.LuviaMediaMetadata.extract(file,{capturedAt:options.capturedAt,location:options.captureLocation,source,deviceMetadata:options.deviceMetadata});
    const resolvedLocation=await resolveCaptureLocation(meta);
    if(meta.contentHash){const d=await client.from('media').select('*').eq('trip_id',tripId).eq('content_hash',meta.contentHash).neq('status','deleted').limit(1).maybeSingle();if(d.error&&d.error.code!=='PGRST116')throw d.error;if(d.data)return{entity:entity(d.data),duplicate:true}}
    const path=`${tripId}/${userId}/${mediaId}/original.${ext(file)}`,capturedAt=meta.capturedAt,row={id:mediaId,trip_id:tripId,user_id:userId,type:'image',purpose:'memory',source,original_name:file.name||null,display_name:options.displayName??options.caption??null,mime_type:file.type||'application/octet-stream',storage_bucket:BUCKET,storage_path:path,status:'pending',captured_at:capturedAt,day_key:day(capturedAt),timezone:meta.timezone,latitude:meta.latitude,longitude:meta.longitude,width:meta.width,height:meta.height,file_size:file.size||null,content_hash:meta.contentHash,favorite:Boolean(options.favorite),edit_settings:{},metadata:{...(options.metadata||{}),captureEvidence:meta.evidence,captureLocationAccuracy:meta.locationAccuracy??null,deviceMetadata:meta.deviceMetadata||null,captureSource:options.captureSource||meta.captureSource||source,exif:meta.exif||{},resolvedLocation,originalLastModified:meta.originalLastModified||null,originalName:meta.originalName||null,mimeType:meta.mimeType||null,isHeic:Boolean(meta.isHeic)}};
    const created=await client.from('media').insert(row).select('*').single();if(created.error)throw created.error;
    const stored=await mediaStorage().upload(BUCKET,path,file,{upsert:false,contentType:row.mime_type,cacheControl:'31536000'});
    if(stored.error){await client.from('media').update({status:'failed'}).eq('id',mediaId);throw stored.error}
    let previewPath=null;
    try{if(window.LuviaMediaPreview?.available?.()){const preview=await window.LuviaMediaPreview.make(file),candidate=`${tripId}/${userId}/${mediaId}/preview.jpg`,saved=await mediaStorage().upload(BUCKET,candidate,preview.blob,{upsert:true,contentType:'image/jpeg',cacheControl:'31536000'});if(!saved.error)previewPath=candidate}}catch(error){console.warn('[LuviaMediaCore] Preview skipped',error)}
    const ready=await client.from('media').update({status:'ready',preview_path:previewPath}).eq('id',mediaId).select('*').single();if(ready.error)throw ready.error;
    return{entity:entity(ready.data),duplicate:false};
  }
  async function ensureUploadCoordinator(){
    if(uploadCoordinator)return uploadCoordinator;
    if(!globalThis.LuviaPlatformPorts){try{await globalThis.LuviaPlatformPortsReady}catch{}}
    const storage=mediaStorage(),core=domain();
    if(!core?.createUploadCoordinator)throw new Error('Media Upload Coordinator Core ist nicht geladen.');
    for(const method of ['stageUpload','listStagedUploads','removeStagedUpload']){
      if(typeof storage[method]!=='function')throw new Error(`MediaStoragePort.${method} fehlt.`);
    }
    uploadCoordinator=core.createUploadCoordinator({
      queue:{put:task=>storage.stageUpload(task),list:()=>storage.listStagedUploads(),remove:taskId=>storage.removeStagedUpload(taskId)},
      network:platformPort('NetworkPort')||{},
      lifecycle:platformPort('LifecyclePort')||{},
      execute:task=>performUpload(task.body,{...(task.options||{}),id:task.mediaId,__queuedRetry:true})
    });
    uploadCoordinator.subscribe(event=>globalThis.dispatchEvent(new CustomEvent('luvia:media-upload-queue-changed',{detail:event})));
    uploadCoordinator.start();
    return uploadCoordinator;
  }
  async function queueUpload(file,options={}){
    const{tripId,userId}=await context(),mediaId=options.id||id(),coordinator=await ensureUploadCoordinator();
    const uploadTask=await coordinator.enqueue({id:`${tripId}:${mediaId}`,mediaId,tripId,userId,body:file,options:{...options,id:mediaId}});
    const queued=entity({id:mediaId,trip_id:tripId,user_id:userId,type:'image',purpose:'memory',source:options.source||'user_upload',original_name:file.name||null,display_name:options.displayName??options.caption??null,mime_type:file.type||'application/octet-stream',storage_bucket:BUCKET,storage_path:null,status:'queued',captured_at:options.capturedAt||new Date().toISOString(),file_size:file.size||null,favorite:Boolean(options.favorite),edit_settings:{},metadata:{...(options.metadata||{}),captureSource:options.captureSource||options.source||'user_upload'},created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    return{entity:queued,duplicate:false,queued:true,uploadTask};
  }
  async function upload(file,options={}){
    if(!(file instanceof Blob))throw new TypeError('Media Core erwartet eine Datei oder einen Blob.');
    if(platformPort('NetworkPort')?.isOnline?.()===false)return queueUpload(file,options);
    return performUpload(file,options);
  }
  async function flushUploadQueue(options={}){return(await ensureUploadCoordinator()).drain(options)}
  async function uploadQueueDiagnostics(){return(await ensureUploadCoordinator()).snapshot()}
  async function update(mediaId,patch={}){const{client,tripId}=await context(),mapped={};if('capturedAt'in patch){mapped.captured_at=patch.capturedAt;mapped.day_key=day(patch.capturedAt)}if('displayName'in patch)mapped.display_name=String(patch.displayName||'').trim()||null;if('favorite'in patch)mapped.favorite=Boolean(patch.favorite);if('editSettings'in patch)mapped.edit_settings=patch.editSettings||{};if('placeId'in patch)mapped.place_id=patch.placeId||null;if('metadata'in patch)mapped.metadata=patch.metadata||{};if('latitude'in patch)mapped.latitude=patch.latitude??null;if('longitude'in patch)mapped.longitude=patch.longitude??null;if('width'in patch)mapped.width=patch.width??null;if('height'in patch)mapped.height=patch.height??null;if(!Object.keys(mapped).length)return get(mediaId);const r=await client.from('media').update(mapped).eq('trip_id',tripId).eq('id',mediaId).select('*').single();if(r.error)throw r.error;return entity(r.data)}
  async function updateLegacyGallery(mediaId,patch={}){const item=await get(mediaId);if(!item)return null;const metadata={...(item.metadata||{})};if('favorite'in patch)metadata.favorite=Boolean(patch.favorite);if('polaroid'in patch)metadata.polaroid=Boolean(patch.polaroid);if('caption'in patch)metadata.caption=String(patch.caption||'');return update(mediaId,{metadata,...('favorite'in patch?{favorite:Boolean(patch.favorite)}:{}),...('caption'in patch?{displayName:String(patch.caption||'')}: {})})}
  const toggleFavorite=async mediaId=>{const item=await get(mediaId);return update(mediaId,{favorite:!item?.favorite})};
  async function listPolaroids(){const{client,tripId}=await context(),r=await client.from('media_day_polaroids').select('*').eq('trip_id',tripId);if(r.error){if(['42P01','PGRST205'].includes(r.error.code))return{};throw r.error}return Object.fromEntries((r.data||[]).map(x=>[String(x.day_key),x.media_id]))}
  async function setPolaroid(mediaId,dayKey){const{client,tripId,userId}=await context(),item=await get(mediaId);if(!item)throw new Error('Foto wurde nicht gefunden.');const key=dayKey||item.dayKey;if(!key)throw new Error('Das Foto ist keinem Reisetag zugeordnet.');const r=await client.from('media_day_polaroids').upsert({trip_id:tripId,day_key:key,media_id:mediaId,selected_by:userId,selected_at:new Date().toISOString()},{onConflict:'trip_id,day_key'}).select('*').single();if(r.error)throw r.error;const existing=await client.from('timeline_events').select('id,metadata').eq('trip_id',tripId).eq('event_type','photo_memory');if(!existing.error){const ids=(existing.data||[]).filter(x=>x.metadata?.polaroidDayKey===key).map(x=>x.id);if(ids.length)await client.from('timeline_events').delete().eq('trip_id',tripId).in('id',ids)}const occurredAt=item.capturedAt||`${key}T12:00:00`;const title=item.displayName||`Polaroid des Tages`;const created=await client.from('timeline_events').insert({trip_id:tripId,event_type:'photo_memory',title,description:'Polaroid des Tages',occurred_at:occurredAt,source:'media_polaroid',is_automatic:false,metadata:{mediaId,mediaIds:[mediaId],polaroid:true,polaroidDayKey:key}});if(created.error)throw created.error;window.dispatchEvent(new CustomEvent('luvia:media-polaroid-changed',{detail:{mediaId,tripId,dayKey:key}}));window.dispatchEvent(new CustomEvent('luvia:memory-bridge-applied',{detail:{tripId}}));return r.data}
  async function linkPlace(mediaId,placeId,options={}){const{client,tripId,userId}=await context(),r=await client.from('media_place_links').upsert({trip_id:tripId,media_id:mediaId,place_id:placeId,source:options.source||'manual',confidence:options.confidence??1,evidence:options.evidence||{},created_by:userId},{onConflict:'media_id,place_id'}).select('*').single();if(r.error)throw r.error;await update(mediaId,{placeId});return r.data}
  async function remove(mediaId){const{client,tripId}=await context(),item=await get(mediaId);if(!item)return false;const paths=[item.storagePath,item.previewPath,item.thumbnailPath,item.renderedPreviewPath,item.metadata?.renderedPreviewPath].filter(Boolean);if(paths.length){const s=await mediaStorage().remove(item.storageBucket||BUCKET,paths);if(s.error)throw s.error}const r=await client.from('media').update({status:'deleted'}).eq('trip_id',tripId).eq('id',mediaId);if(r.error)throw r.error;await client.from('media_cluster_items').delete().eq('media_id',mediaId);window.dispatchEvent(new CustomEvent('luvia:media-deleted',{detail:{mediaId,tripId}}));return true}
  async function clearTripGallery(options={}){
    const{client,tripId}=await context(),progress=typeof options.onProgress==='function'?options.onProgress:()=>{};
    const all=await client.from('media').select('*').eq('trip_id',tripId);if(all.error)throw all.error;
    const rows=all.data||[],mediaIds=rows.map(row=>row.id);
    const safe=async promise=>{const r=await promise;if(r?.error&&!['42P01','PGRST205','42703'].includes(r.error.code))throw r.error;return r};
    progress('Verknüpfte Memory Journeys und Memory Moments werden entfernt …');
    const memoryContract=globalThis.LuviaMemoryContractV1;
    if(!memoryContract?.commands?.maintenance?.clearForTrip)throw new Error('Memory Contract v1 Maintenance Command fehlt.');
    const clearedMemories=await memoryContract.commands.maintenance.clearForTrip({tripId,reason:'gallery-clear'});
    progress('Fotomomente und Polaroids werden entfernt …');
    await safe(client.from('media_day_polaroids').delete().eq('trip_id',tripId));
    const clusterRows=await safe(client.from('media_clusters').select('id').eq('trip_id',tripId));
    const clusterIds=(clusterRows?.data||[]).map(x=>x.id);
    if(clusterIds.length)await safe(client.from('media_cluster_items').delete().in('cluster_id',clusterIds));
    await safe(client.from('media_clusters').delete().eq('trip_id',tripId));
    progress('Fotoeinträge werden aus der Timeline entfernt …');
    await safe(client.from('timeline_events').delete().eq('trip_id',tripId).eq('event_type','photo_memory'));
    if(mediaIds.length){
      await safe(client.from('media_place_links').delete().in('media_id',mediaIds));
      await safe(client.from('live_moment_media').delete().in('media_id',mediaIds));
    }
    progress('Originale und Vorschaubilder werden aus dem Storage gelöscht …');
    const byBucket=new Map();
    for(const row of rows){const bucket=row.storage_bucket||BUCKET;const paths=[row.storage_path,row.preview_path,row.metadata?.renderedPreviewPath].filter(Boolean);if(paths.length)byBucket.set(bucket,[...(byBucket.get(bucket)||[]),...paths]);if(row.thumbnail_path)byBucket.set('luvia-media-thumbnails',[...(byBucket.get('luvia-media-thumbnails')||[]),row.thumbnail_path])}
    for(const[bucket,rawPaths]of byBucket){const paths=[...new Set(rawPaths)];for(let i=0;i<paths.length;i+=100){const r=await mediaStorage().remove(bucket,paths.slice(i,i+100));if(r.error&&!/not found|does not exist/i.test(r.error.message||''))console.warn('[LuviaMediaCore] Storage-Bereinigung teilweise fehlgeschlagen',bucket,r.error)}}
    progress('Mediendatensätze werden endgültig gelöscht …');
    const deleted=await client.from('media').delete().eq('trip_id',tripId);if(deleted.error)throw deleted.error;
    window.dispatchEvent(new CustomEvent('luvia:gallery-cleared',{detail:{tripId,count:rows.length}}));
    return{tripId,count:rows.length,albumCount:Number(clearedMemories?.albums)||0,storyCount:Number(clearedMemories?.stories)||0,clusterCount:clusterIds.length};
  }

  async function subscribe(callback){const{client,tripId}=await context();if(channels.has(tripId))await channels.get(tripId)();const c=client.channel(`luvia-media-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'media',filter:`trip_id=eq.${tripId}`},callback).on('postgres_changes',{event:'*',schema:'public',table:'media_day_polaroids',filter:`trip_id=eq.${tripId}`},callback).subscribe();const stop=async()=>{await client.removeChannel(c);channels.delete(tripId)};channels.set(tripId,stop);return stop}
  async function downloadAsset(mediaId,variant='original'){
    const item=await get(mediaId);if(!item)return null;
    const paths=variant==='preview'?[item.renderedPreviewPath,item.previewPath,item.thumbnailPath,item.storagePath]:[item.storagePath,item.previewPath,item.thumbnailPath];
    let lastError=null;
    for(const path of [...new Set(paths.filter(Boolean))]){const r=await mediaStorage().download(item.storageBucket||BUCKET,path);if(!r.error&&r.data)return r.data;lastError=r.error||null}
    if(lastError)throw lastError;return null;
  }
  async function reanalyze(mediaId){const item=await get(mediaId);if(!item)throw new Error('Foto wurde nicht gefunden.');const blob=await downloadAsset(mediaId,'original');if(!blob)throw new Error('Originaldatei ist nicht verfügbar.');const file=new File([blob],item.originalName||`photo.${ext({name:item.storagePath,type:item.mimeType})}`,{type:item.mimeType||blob.type,lastModified:item.metadata?.originalLastModified||Date.now()});const meta=await window.LuviaMediaMetadata.extract(file,{source:item.source});const resolvedLocation=await resolveCaptureLocation(meta);return update(mediaId,{capturedAt:meta.capturedAt,latitude:meta.latitude,longitude:meta.longitude,width:meta.width,height:meta.height,metadata:{...(item.metadata||{}),captureEvidence:meta.evidence,exif:meta.exif||{},resolvedLocation,reanalyzedAt:new Date().toISOString(),isHeic:Boolean(meta.isHeic)}})}
  const diagnostics=()=>({service:'media-core',version:VERSION,build:BUILD,status:'active',ok:true,checkedAt:new Date().toISOString(),durationMs:0,dependencies:{domainCore:Boolean(domain()),metadata:Boolean(window.LuviaMediaMetadata),preview:Boolean(window.LuviaMediaPreview),mediaStoragePort:Boolean(platformPort('MediaStoragePort')),networkPort:Boolean(platformPort('NetworkPort')),lifecyclePort:Boolean(platformPort('LifecyclePort'))},checks:{canonicalMediaEntity:true,realtimeOwner:'media-core',hydrationBoundary:'media.v1',storageBoundary:'MediaStoragePort',backgroundUploadAdapterCapable:true,offlineQueueAdapterCapable:true,favorites:true,nonDestructiveEditing:true,dayPolaroids:true},failedChecks:[],warnings:[]});
  window.LuviaMediaCore=Object.freeze({version:VERSION,build:BUILD,bucket:BUCKET,getContext:context,list,get,upload,initializeUploadQueue:ensureUploadCoordinator,flushUploadQueue,uploadQueueDiagnostics,update,updateLegacyGallery,reanalyze,toggleFavorite,listPolaroids,setPolaroid,linkPlace,remove,clearTripGallery,signedUrl,signedOriginalUrl,downloadAsset,saveRenderedPreview,subscribe,diagnostics,rowToEntity:entity});
  if(platformPort('MediaStoragePort'))ensureUploadCoordinator().catch(error=>console.warn('[LuviaMediaCore] Upload Queue nicht gestartet',error));
})();

;

/* ===== core/media/media-clustering.js ===== */
(() => {
  'use strict';
  const VERSION='4.29.4', BUILD='13.29.4';
  const MAX_GAP_MS=20*60*1000, MAX_DISTANCE_M=300, channels=new Map();
  const radians=v=>v*Math.PI/180;
  const distance=(a,b)=>{if([a.latitude,a.longitude,b.latitude,b.longitude].some(v=>v===null||v===undefined))return null;const R=6371000,dLat=radians(b.latitude-a.latitude),dLon=radians(b.longitude-a.longitude),x=Math.sin(dLat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
  const dayKey=m=>m.dayKey||String(m.capturedAt||m.createdAt||'').slice(0,10)||'unknown';
  const kind=m=>{const n=(m.displayName||m.originalName||'').toLowerCase(),meta=m.metadata||{},ratio=m.width&&m.height?m.width/m.height:null;if(m.mediaKind)return m.mediaKind;if(meta.mediaKind)return meta.mediaKind;if(/screenshot|bildschirmfoto|screen[_ -]?shot/.test(n))return'screenshot';if(/ticket|boarding|rechnung|receipt|qr|document|scan/.test(n))return'document';if(ratio&&ratio<.62)return'screenshot';return'photo'};
  const compatible=(a,b)=>{if(dayKey(a)!==dayKey(b))return false;const gap=Math.abs(new Date(b.capturedAt||b.createdAt)-new Date(a.capturedAt||a.createdAt));if(gap>MAX_GAP_MS)return false;const d=distance(a,b);return d===null||d<=MAX_DISTANCE_M};
  const signature=ids=>[...ids].map(String).sort().join('-');
  function generate(media){const photos=[...media].filter(x=>x.status!=='deleted').sort((a,b)=>new Date(a.capturedAt||a.createdAt)-new Date(b.capturedAt||b.createdAt));const groups=[];let current=[];for(const item of photos){if(!current.length||compatible(current[current.length-1],item))current.push(item);else{groups.push(current);current=[item]}}if(current.length)groups.push(current);return groups.filter(group=>group.length>=2||kind(group[0])!=='photo').map(items=>{const first=items[0],last=items.at(-1),kinds=items.map(kind),dominant=kinds.filter(x=>x==='photo').length>=Math.ceil(items.length/2)?'moment':(kinds.includes('document')?'documents':'screenshots');const locationNames=items.map(x=>x.resolvedLocation?.name||x.resolvedLocation?.address||x.metadata?.resolvedLocation?.name||x.metadata?.resolvedLocation?.address).filter(Boolean),locationName=locationNames.sort((a,b)=>locationNames.filter(x=>x===b).length-locationNames.filter(x=>x===a).length)[0]||null,captured=new Date(first.capturedAt||first.createdAt),hour=captured.getHours(),part=hour<11?'Morgen':hour<17?'Nachmittag':'Abend';return{id:`auto-${signature(items.map(x=>x.id))}`,tripId:first.tripId,dayKey:dayKey(first),title:dominant==='moment'?(locationName?`${locationName} – kurz mal mittendrin`:`${part} in Bildern`):dominant==='documents'?'Reisedokumente':'Screenshots',kind:dominant,startAt:first.capturedAt||first.createdAt,endAt:last.capturedAt||last.createdAt,mediaIds:items.map(x=>x.id),items,automatic:true,confidence:items.length>2?.94:.82}})}
  async function ctx(){const media=window.LuviaMediaCore;if(!media)throw new Error('Media Core ist nicht geladen.');return{...(await media.getContext()),media}}
  async function listPersisted(){const{client,tripId}=await ctx();const c=await client.from('media_clusters').select('*').eq('trip_id',tripId).order('start_at');if(c.error){if(['42P01','PGRST205'].includes(c.error.code))return[];throw c.error}const ids=(c.data||[]).map(x=>x.id);let links=[];if(ids.length){const q=await client.from('media_cluster_items').select('*').in('cluster_id',ids).order('position');if(q.error)throw q.error;links=q.data||[]}return(c.data||[]).map(row=>({...row,mediaIds:links.filter(x=>x.cluster_id===row.id).map(x=>x.media_id)}))}
  const sameIso=(a,b)=>String(a||'')===String(b||'');
  const sameMembership=(a,b)=>signature(a||[])===signature(b||[]);
  const clusterPayloadChanged=(existing,payload)=>
    String(existing?.title||'')!==String(payload.title||'') ||
    String(existing?.kind||'')!==String(payload.kind||'') ||
    !sameIso(existing?.start_at,payload.start_at) ||
    !sameIso(existing?.end_at,payload.end_at) ||
    Boolean(existing?.is_automatic)!==Boolean(payload.is_automatic) ||
    Number(existing?.confidence||0)!==Number(payload.confidence||0) ||
    String(existing?.source_key||'')!==String(payload.source_key||'') ||
    String(existing?.state||'')!==String(payload.state||'');
  let syncPromise=null;
  async function performSyncGenerated(generated){
    const{client,tripId,userId}=await ctx();
    const persisted=await listPersisted();
    const manualMedia=new Set(persisted.filter(x=>!x.is_automatic&&x.state!=='dismissed').flatMap(x=>x.mediaIds));
    const activeSignatures=new Set();
    for(const cluster of generated){
      const ids=[...new Set((cluster.mediaIds||[]).filter(id=>!manualMedia.has(id)).map(String))];
      if(ids.length<2&&cluster.kind==='moment')continue;
      const stable=`${tripId}:media:${signature(ids)}`;
      activeSignatures.add(stable);
      const dismissed=persisted.find(x=>x.source_key===stable&&x.state==='dismissed');
      if(dismissed)continue;
      const payload={trip_id:tripId,title:cluster.title,kind:cluster.kind,start_at:cluster.startAt,end_at:cluster.endAt,is_automatic:true,confidence:cluster.confidence,source_key:stable,state:'active',updated_by:userId};
      const upserted=await client.from('media_clusters').upsert({...payload,created_by:userId},{onConflict:'trip_id,source_key',ignoreDuplicates:false}).select('*').single();
      if(upserted.error)throw upserted.error;
      const row=upserted.data;
      if(!row)continue;
      if(ids.length){
        const memberships=ids.map((media_id,position)=>({cluster_id:row.id,media_id,position,created_by:userId}));
        const linked=await client.from('media_cluster_items').upsert(memberships,{onConflict:'media_id',ignoreDuplicates:false});
        if(linked.error)throw linked.error;
      }
      const currentLinks=await client.from('media_cluster_items').select('media_id').eq('cluster_id',row.id);
      if(currentLinks.error)throw currentLinks.error;
      const obsolete=(currentLinks.data||[]).map(x=>String(x.media_id)).filter(id=>!ids.includes(id));
      if(obsolete.length){const removed=await client.from('media_cluster_items').delete().eq('cluster_id',row.id).in('media_id',obsolete);if(removed.error)throw removed.error}
    }
    const stale=persisted.filter(x=>x.is_automatic&&x.state!=='dismissed'&&x.source_key?.includes(':media:')&&!activeSignatures.has(x.source_key)).map(x=>x.id);
    if(stale.length){const r=await client.from('media_clusters').update({state:'dismissed',updated_by:userId}).eq('trip_id',tripId).in('id',stale);if(r.error)throw r.error}
    let current=await listPersisted();
    const empty=current.filter(x=>x.state!=='dismissed'&&(!x.mediaIds||x.mediaIds.length===0)).map(x=>x.id);
    if(empty.length){const r=await client.from('media_clusters').update({state:'dismissed',updated_by:userId}).eq('trip_id',tripId).in('id',empty);if(r.error)throw r.error;current=current.filter(x=>!empty.includes(x.id))}
    return current
  }
  async function syncGenerated(generated){
    if(syncPromise)return syncPromise;
    syncPromise=performSyncGenerated(generated).finally(()=>{syncPromise=null});
    return syncPromise;
  }
  async function rename(id,title){const{client,tripId,userId}=await ctx();const r=await client.from('media_clusters').update({title:String(title||'').trim()||'Fotomoment',is_automatic:false,updated_by:userId}).eq('trip_id',tripId).eq('id',id).select('*').single();if(r.error)throw r.error;return r.data}
  async function setKind(id,value){const allowed=new Set(['moment','screenshots','documents']);if(!allowed.has(value))throw new Error('Unbekannter Cluster-Typ.');const{client,tripId,userId}=await ctx();const r=await client.from('media_clusters').update({kind:value,is_automatic:false,updated_by:userId}).eq('trip_id',tripId).eq('id',id).select('*').single();if(r.error)throw r.error;return r.data}
  async function dissolve(id){const{client,tripId,userId}=await ctx();const r=await client.from('media_clusters').update({state:'dismissed',is_automatic:false,updated_by:userId}).eq('trip_id',tripId).eq('id',id);if(r.error)throw r.error;return true}
  async function subscribe(callback){const{client,tripId}=await ctx();if(channels.has(tripId))await channels.get(tripId)();const channel=client.channel(`luvia-media-clusters-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'media_clusters',filter:`trip_id=eq.${tripId}`},callback).on('postgres_changes',{event:'*',schema:'public',table:'media_cluster_items'},callback).subscribe();const stop=async()=>{await client.removeChannel(channel);channels.delete(tripId)};channels.set(tripId,stop);return stop}
  const diagnostics=()=>({service:'media-clustering',version:VERSION,build:BUILD,status:'active',ok:true,checkedAt:new Date().toISOString(),durationMs:0,dependencies:{mediaCore:Boolean(window.LuviaMediaCore)},checks:{timeClustering:true,locationClustering:true,realtime:true,stableMembershipSignature:true,manualCorrections:true},failedChecks:[],warnings:[]});
  window.LuviaMediaClustering=Object.freeze({version:VERSION,build:BUILD,generate,listPersisted,syncGenerated,rename,setKind,dissolve,subscribe,diagnostics,classify:kind,distance});
})();

;

/* ===== core/media/memory-albums.js ===== */
(() => {
'use strict';
const VERSION='4.35.0',BUILD='13.35.0',channels=new Map();
let writeDepth=0;
const missing=e=>['42P01','PGRST205'].includes(e?.code);
async function ctx(){const runtime=globalThis.LuviaMemoryRuntimeContextV1;if(!runtime?.get)throw new Error('Memory Runtime Context v1 ist nicht geladen.');return runtime.get()}
async function mediaByIds(ids=[]){const unique=[...new Set(ids.map(String).filter(Boolean))];if(!unique.length)return[];const contract=globalThis.LuviaMediaContractV1||globalThis.LuviaMediaContract;if(!contract?.reads?.listMedia)throw new Error('Media Contract v1 ist nicht geladen.');const rows=await contract.reads.listMedia();const map=new Map((rows||[]).map(row=>[String(row.id),row]));return unique.map(id=>map.get(id)).filter(Boolean)}
async function contributionsFor(albumIds=[]){if(!albumIds.length)return[];const{client}=await ctx();const r=await client.from('memory_album_contributions').select('*').in('album_id',albumIds).order('updated_at',{ascending:true});if(r.error){if(missing(r.error))return[];throw r.error}return r.data||[]}
async function list(){const{client,tripId}=await ctx();const a=await client.from('memory_albums').select('*').eq('trip_id',tripId).order('updated_at',{ascending:false});if(a.error){if(missing(a.error))return[];throw a.error}const ids=(a.data||[]).map(x=>x.id);let links=[],favorites=[],contributions=[];if(ids.length){const [q,f,c]=await Promise.all([client.from('memory_album_items').select('album_id,media_id,position').in('album_id',ids).order('position'),client.from('memory_album_favorites').select('album_id,user_id,media_id').in('album_id',ids),contributionsFor(ids)]);if(q.error&&!missing(q.error))throw q.error;if(f.error&&!missing(f.error))throw f.error;links=q.data||[];favorites=f.data||[];contributions=c||[]}return(a.data||[]).map(row=>({...row,mediaIds:links.filter(x=>x.album_id===row.id).map(x=>x.media_id),favorites:favorites.filter(x=>x.album_id===row.id),contributions:contributions.filter(x=>x.album_id===row.id)}))}
async function listClusters(){const clustering=window.LuviaMediaClustering;if(!clustering?.listPersisted)return[];const rows=await clustering.listPersisted();return(rows||[]).filter(x=>x.state!=='dismissed'&&Array.isArray(x.mediaIds)&&x.mediaIds.length)}
async function getByCluster(clusterId){const{client,tripId}=await ctx();const a=await client.from('memory_albums').select('*').eq('trip_id',tripId).eq('source_cluster_id',clusterId).maybeSingle();if(a.error){if(missing(a.error))return null;throw a.error}if(!a.data)return null;const [q,c,f]=await Promise.all([client.from('memory_album_items').select('media_id,position').eq('album_id',a.data.id).order('position'),contributionsFor([a.data.id]),client.from('memory_album_favorites').select('*').eq('album_id',a.data.id)]);if(q.error&&!missing(q.error))throw q.error;if(f.error&&!missing(f.error))throw f.error;return{...a.data,mediaIds:(q.data||[]).map(x=>x.media_id),contributions:c||[],favorites:f.data||[]}}
async function listMembers(){const{client,tripId}=await ctx();const r=await client.rpc('luvia_list_trip_members',{p_trip_id:tripId});if(r.error)return[];return(r.data||[]).map(x=>({id:x.user_id||x.userId||x.id,displayName:x.display_name||x.displayName||x.name||'Teilnehmer',avatarUrl:x.avatar_url||x.avatarUrl||null})).filter(x=>x.id)}
async function setFavorite(albumId,mediaId){const{client,userId}=await ctx();const r=await client.from('memory_album_favorites').upsert({album_id:albumId,user_id:userId,media_id:mediaId,updated_at:new Date().toISOString()},{onConflict:'album_id,user_id'}).select('*').single();if(r.error&&!missing(r.error))throw r.error;return r.data||null}
async function saveContribution(albumId,input={}){const{client,userId}=await ctx();const payload={album_id:albumId,user_id:userId,prompt_key:String(input.promptKey||'perspective'),prompt_text:String(input.promptText||''),answer_text:String(input.answerText||''),reaction:String(input.reaction||''),media_id:input.mediaId||null,metadata:input.metadata||{},updated_at:new Date().toISOString()};const r=await client.from('memory_album_contributions').upsert(payload,{onConflict:'album_id,user_id,prompt_key'}).select('*').single();if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die Migration für gemeinsame Memory-Beiträge ausführen.');throw r.error}window.dispatchEvent(new CustomEvent('luvia:memory-contribution-updated',{detail:{albumId,local:true}}));return r.data}
async function save(input){const{client,tripId,userId}=await ctx(),mediaIds=[...new Set((input.mediaIds||[]).map(String))];if(!mediaIds.length)throw new Error('Die Erinnerung braucht mindestens ein Foto.');writeDepth++;try{const payload={trip_id:tripId,source_cluster_id:input.clusterId||null,title:String(input.title||'Unsere Erinnerung').trim(),description:String(input.description||'').trim(),mood:input.mood||null,cover_media_id:input.coverMediaId||mediaIds[0],status:input.status||'draft',metadata:{...(input.metadata||{}),module:'memory-moment-v1'},updated_by:userId,updated_at:new Date().toISOString()};let existing=input.id?{id:input.id}:input.clusterId?await getByCluster(input.clusterId):null,result;if(existing?.id)result=await client.from('memory_albums').update(payload).eq('trip_id',tripId).eq('id',existing.id).select('*').single();else result=await client.from('memory_albums').insert({...payload,created_by:userId}).select('*').single();if(result.error)throw result.error;const id=result.data.id;const del=await client.from('memory_album_items').delete().eq('album_id',id);if(del.error)throw del.error;const rows=mediaIds.map((media_id,position)=>({album_id:id,media_id,position,created_by:userId}));if(rows.length){const ins=await client.from('memory_album_items').insert(rows);if(ins.error)throw ins.error}if(input.favoriteMediaId)await setFavorite(id,input.favoriteMediaId);window.dispatchEvent(new CustomEvent('luvia:memory-album-updated',{detail:{albumId:id,clusterId:input.clusterId,local:true}}));return{...result.data,mediaIds}}finally{writeDepth=Math.max(0,writeDepth-1)}}
async function remove(id){const{client,tripId}=await ctx();const r=await client.from('memory_albums').delete().eq('trip_id',tripId).eq('id',id);if(r.error)throw r.error;window.dispatchEvent(new CustomEvent('luvia:memory-album-updated',{detail:{albumId:id,deleted:true,local:true}}));return true}
async function subscribe(callback){const{client,tripId}=await ctx();if(channels.has(tripId))await channels.get(tripId)();const c=client.channel(`luvia-memory-albums-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_albums',filter:`trip_id=eq.${tripId}`},payload=>{if(!writeDepth)callback(payload)}).on('postgres_changes',{event:'*',schema:'public',table:'memory_album_contributions'},payload=>{if(!writeDepth)callback(payload)}).subscribe();const stop=async()=>{await client.removeChannel(c);channels.delete(tripId)};channels.set(tripId,stop);return stop}
window.LuviaMemoryAlbums=Object.freeze({version:VERSION,build:BUILD,list,listClusters,mediaByIds,getByCluster,listMembers,setFavorite,saveContribution,save,remove,subscribe,isWriting:()=>writeDepth>0,diagnostics:()=>({version:VERSION,build:BUILD,isolated:true,galleryTouched:false,writeDepth})});
})();

;

/* ===== core/media/memory-journeys.js ===== */
(() => {
'use strict';
const VERSION='4.35.0',BUILD='13.35.0';
let writeDepth=0,channel=null;
const missing=e=>['42P01','PGRST205'].includes(e?.code);
async function ctx(){const runtime=globalThis.LuviaMemoryRuntimeContextV1;if(!runtime?.get)throw new Error('Memory Runtime Context v1 ist nicht geladen.');return runtime.get()}
async function list(){const{client,tripId}=await ctx();const q=await client.from('memory_journeys').select('*').eq('trip_id',tripId).order('updated_at',{ascending:false});if(q.error){if(missing(q.error))return[];throw q.error}const ids=(q.data||[]).map(x=>x.id);if(!ids.length)return[];const [chapters,items,contributions]=await Promise.all([
 client.from('memory_journey_chapters').select('*').in('journey_id',ids).order('position'),
 client.from('memory_journey_items').select('*').in('journey_id',ids).order('position'),
 client.from('memory_journey_contributions').select('*').in('journey_id',ids).order('updated_at')
]);for(const r of [chapters,items,contributions])if(r.error&&!missing(r.error))throw r.error;return(q.data||[]).map(row=>({...row,chapters:(chapters.data||[]).filter(x=>x.journey_id===row.id),items:(items.data||[]).filter(x=>x.journey_id===row.id),contributions:(contributions.data||[]).filter(x=>x.journey_id===row.id)}))}
async function get(id){return(await list()).find(x=>String(x.id)===String(id))||null}
function dayKey(item){return item.dayKey||item.day_key||String(item.capturedAt||item.createdAt||'').slice(0,10)||'undatiert'}
async function source(){const mediaContract=globalThis.LuviaMediaContractV1||globalThis.LuviaMediaContract;if(!mediaContract?.reads?.listMedia)throw new Error('Media Contract v1 ist nicht geladen.');const media=await mediaContract.reads.listMedia(),clusters=await window.LuviaMemoryAlbums.listClusters(),moments=await window.LuviaMemoryAlbums.list();const days=[...new Set(media.map(dayKey))].sort();return{media,clusters,moments,days}}
async function save(input={}){const{client,tripId,userId}=await ctx();writeDepth++;try{const payload={trip_id:tripId,title:String(input.title||'Unsere Reisegeschichte').trim(),subtitle:String(input.subtitle||'').trim(),description:String(input.description||'').trim(),cover_media_id:input.coverMediaId||null,status:input.status||'draft',metadata:{...(input.metadata||{}),experience:'memory-journey',version:2},updated_by:userId,updated_at:new Date().toISOString()};let r;if(input.id)r=await client.from('memory_journeys').update(payload).eq('id',input.id).eq('trip_id',tripId).select('*').single();else r=await client.from('memory_journeys').insert({...payload,created_by:userId}).select('*').single();if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die Migration für Memory Journeys ausführen.');throw r.error}const id=r.data.id;if(input.chapters){const del=await client.from('memory_journey_chapters').delete().eq('journey_id',id);if(del.error&&!missing(del.error))throw del.error;const rows=input.chapters.map((c,position)=>({journey_id:id,position,title:c.title||`Kapitel ${position+1}`,day_key:c.dayKey||null,summary:c.summary||'',mood:c.mood||null,cover_media_id:c.coverMediaId||null,metadata:c.metadata||{},created_by:userId}));if(rows.length){const ins=await client.from('memory_journey_chapters').insert(rows);if(ins.error)throw ins.error}}
if(input.items){const del=await client.from('memory_journey_items').delete().eq('journey_id',id);if(del.error&&!missing(del.error))throw del.error;const rows=input.items.map((x,position)=>({journey_id:id,chapter_position:Number(x.chapterPosition||0),position,item_type:x.itemType||'media',media_id:x.mediaId||null,cluster_id:x.clusterId||null,memory_album_id:x.memoryAlbumId||null,timeline_event_id:x.timelineEventId||null,day_key:x.dayKey||null,metadata:x.metadata||{},created_by:userId}));if(rows.length){const ins=await client.from('memory_journey_items').insert(rows);if(ins.error)throw ins.error}}
window.dispatchEvent(new CustomEvent('luvia:memory-journey-updated',{detail:{journeyId:id,local:true}}));return{...r.data,id}}finally{writeDepth=Math.max(0,writeDepth-1)}}
async function saveContribution(journeyId,input={}){const{client,userId}=await ctx();const p={journey_id:journeyId,user_id:userId,prompt_key:input.promptKey||'journey-perspective',prompt_text:input.promptText||'',answer_text:input.answerText||'',reaction:input.reaction||'',metadata:input.metadata||{},updated_at:new Date().toISOString()};const r=await client.from('memory_journey_contributions').upsert(p,{onConflict:'journey_id,user_id,prompt_key'}).select('*').single();if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die Migration für Memory Journeys ausführen.');throw r.error}return r.data}
async function remove(id){const{client,tripId}=await ctx();const r=await client.from('memory_journeys').delete().eq('id',id).eq('trip_id',tripId);if(r.error)throw r.error;return true}
async function subscribe(cb){const{client,tripId}=await ctx();if(channel)await client.removeChannel(channel);channel=client.channel(`luvia-memory-journeys-${tripId}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_journeys',filter:`trip_id=eq.${tripId}`},p=>{if(!writeDepth)cb(p)}).on('postgres_changes',{event:'*',schema:'public',table:'memory_journey_contributions'},p=>{if(!writeDepth)cb(p)}).subscribe();return async()=>{if(channel)await client.removeChannel(channel);channel=null}}
window.LuviaMemoryJourneys=Object.freeze({version:VERSION,build:BUILD,list,get,source,save,saveContribution,remove,subscribe,isWriting:()=>writeDepth>0});
})();

;

/* ===== core/media/memory-cards.js ===== */
﻿(() => {
'use strict';
const VERSION='4.37.7',BUILD='13.37.7';
let channel=null,identityChannel=null,voteChannel=null,reviewChannel=null,writeDepth=0;
const missing=e=>['42P01','PGRST205'].includes(e?.code);
const validColor=v=>/^#[0-9a-f]{6}$/i.test(String(v||'').trim())?String(v).trim().toLowerCase():null;
function activeTrip(){return window.LuviaTripContractV1?.getActiveTrip?.()||{}}
function tripAccent(){const themed=validColor(getComputedStyle(document.documentElement).getPropertyValue('--trip-accent'));if(themed)return themed;const t=activeTrip();return [t.accent,t.accent_color,t.themeColor,t.theme_color,t.color,t.settings?.accent,t.settings?.accent_color,t.settings?.themeColor,t.settings?.theme_color].map(validColor).find(Boolean)||null}
async function ctx(){const runtime=globalThis.LuviaMemoryRuntimeContextV1;if(!runtime?.get)throw new Error('Memory Runtime Context v1 ist nicht geladen.');return runtime.get()}
async function list(filters={}){const{client,tripId}=await ctx();let q=client.from('memory_cards').select('*').eq('trip_id',tripId).neq('status','dismissed').order('created_at',{ascending:true});if(filters.clusterId)q=q.eq('cluster_id',filters.clusterId);if(filters.authorId)q=q.eq('author_id',filters.authorId);if(filters.cardType)q=q.eq('card_type',filters.cardType);const r=await q;if(r.error){if(missing(r.error))return[];throw r.error}return r.data||[]}
async function save(input={}){const{client,tripId,userId}=await ctx();const cardType=String(input.cardType||'note').trim();if(!cardType)throw new Error('Memory Card braucht einen Typ.');const payload={trip_id:tripId,author_id:userId,card_type:cardType,source_type:String(input.sourceType||'manual'),content:String(input.content||'').trim(),media_id:input.mediaId||null,cluster_id:input.clusterId||null,journey_id:input.journeyId||null,reaction:String(input.reaction||''),weight:Math.max(1,Math.min(3,Number(input.weight||1))),visibility:input.visibility==='private'?'private':'trip',status:input.status||'active',dedupe_key:input.dedupeKey||null,metadata:input.metadata||{},updated_at:new Date().toISOString()};writeDepth++;try{let r;if(input.id)r=await client.from('memory_cards').update(payload).eq('trip_id',tripId).eq('author_id',userId).eq('id',input.id).select('*').single();else if(payload.dedupe_key)r=await client.from('memory_cards').upsert(payload,{onConflict:'trip_id,dedupe_key'}).select('*').single();else r=await client.from('memory_cards').insert(payload).select('*').single();if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die Migration für Memory Cards ausführen.');throw r.error}window.dispatchEvent(new CustomEvent('luvia:memory-card-updated',{detail:{card:r.data,local:true}}));return r.data}finally{writeDepth=Math.max(0,writeDepth-1)}}
async function setWeight(id,weight){const{client,tripId,userId}=await ctx();const r=await client.from('memory_cards').update({weight:Math.max(1,Math.min(3,Number(weight||1))),updated_at:new Date().toISOString()}).eq('trip_id',tripId).eq('author_id',userId).eq('id',id).select('*').single();if(r.error)throw r.error;return r.data}
async function dismiss(id){const{client,tripId,userId}=await ctx();const r=await client.from('memory_cards').update({status:'dismissed',updated_at:new Date().toISOString()}).eq('trip_id',tripId).eq('author_id',userId).eq('id',id);if(r.error)throw r.error;return true}
async function members(){
  const{client,tripId}=await ctx();
  const r=await client.rpc('luvia_list_trip_members',{p_trip_id:tripId});
  if(r.error)return[];
  const base=(r.data||[]).map(x=>({id:x.user_id||x.userId||x.id,displayName:x.display_name||x.displayName||x.name||'Reisender',avatarUrl:x.avatar_url||x.avatarUrl||null,avatarColor:x.avatar_color||x.avatarColor||null})).filter(x=>x.id);
  if(!base.length)return base;
  let resolved=base;
  try{
    const ids=base.map(x=>x.id),identity=await client.from('memory_member_identity').select('user_id,display_name,avatar_url,avatar_color').in('user_id',ids);
    if(!identity.error){const byId=new Map((identity.data||[]).map(x=>[String(x.user_id),x]));resolved=base.map(x=>{const live=byId.get(String(x.id));return{...x,displayName:live?.display_name||x.displayName,avatarUrl:live?.avatar_url||x.avatarUrl,avatarColor:live?.avatar_color||x.avatarColor||null}})}
  }catch(_){}
  const local=window.LuviaProfileService?.snapshot?.()?.profile||null;
  if(local?.userId)resolved=resolved.map(x=>String(x.id)===String(local.userId)?{...x,displayName:local.displayName||x.displayName,avatarUrl:local.avatarUrl||x.avatarUrl,avatarColor:local.avatarColor||x.avatarColor}:x);
  return resolved;
}


async function setAlbumReview(cardId,decision){
  const allowed=['included','excluded','undecided'];if(!allowed.includes(decision))throw new Error('INVALID_ALBUM_REVIEW_DECISION');
  const{client,tripId,userId}=await ctx();
  const payload={trip_id:tripId,card_id:cardId,user_id:userId,decision,updated_at:new Date().toISOString()};
  const r=await client.from('memory_card_album_reviews').upsert(payload,{onConflict:'card_id,user_id'}).select('*').single();
  if(r.error){if(missing(r.error))throw new Error('Bitte die 13.36.10 Migration für Memory Album Review ausführen.');throw r.error}
  window.dispatchEvent(new CustomEvent('luvia:memory-album-review-updated',{detail:{cardId,decision,tripId,local:true}}));return r.data;
}
async function albumReviews(cardIds=[]){
  const ids=[...new Set(cardIds.map(String).filter(Boolean))];if(!ids.length)return{};
  const{client,userId}=await ctx();const r=await client.from('memory_card_album_reviews').select('card_id,decision,updated_at').eq('user_id',userId).in('card_id',ids);
  if(r.error){if(missing(r.error))return{};throw r.error}return Object.fromEntries((r.data||[]).map(x=>[String(x.card_id),x.decision]));
}

const curationClass=card=>{const t=String(card?.card_type||'');if(t==='photo')return'hero';if(['quote','place','food','inside_joke','note'].includes(t))return'story';return'signal'};
async function syncPhotoCandidates(clusterId,mediaIds=[]){
  const ids=[...new Set(mediaIds.map(String).filter(Boolean))].slice(0,3),context=await ctx();
  const existing=await list({clusterId}),mine=existing.filter(c=>String(c.author_id)===String(context.userId)&&c.card_type==='photo');
  for(const card of mine){if(card.media_id&&!ids.includes(String(card.media_id)))await dismiss(card.id)}
  const saved=[];for(const mediaId of ids){const same=mine.find(c=>String(c.media_id)===String(mediaId));saved.push(await save({id:same?.id||null,cardType:'photo',sourceType:'cluster-discovery',clusterId,mediaId,weight:2,dedupeKey:`cluster:${clusterId}:author:${context.userId}:photo:${mediaId}`,metadata:{...(same?.metadata||{}),choice:'personal-favorite',curation_class:'hero',selected_for_stack:true}}))}return saved;
}
async function stackCuration(clusterIds=[]){
  const ids=[...new Set(clusterIds.map(String).filter(Boolean))];if(!ids.length)return{states:{},proposals:{}};const{client,tripId}=await ctx();
  const [states,proposals]=await Promise.all([client.from('memory_stack_curation').select('*').eq('trip_id',tripId).in('cluster_id',ids),client.from('memory_stack_title_proposals').select('*').eq('trip_id',tripId).in('cluster_id',ids).order('created_at',{ascending:true})]);
  if(states.error&&!missing(states.error))throw states.error;if(proposals.error&&!missing(proposals.error))throw proposals.error;
  const proposalMap={};for(const row of proposals.data||[])(proposalMap[String(row.cluster_id)]??=[]).push(row);return{states:Object.fromEntries((states.data||[]).map(x=>[String(x.cluster_id),x])),proposals:proposalMap};
}
async function saveTitleProposal(clusterId,title){const clean=String(title||'').trim().slice(0,90);if(!clean)throw new Error('Titel darf nicht leer sein.');const{client,tripId,userId}=await ctx();const r=await client.from('memory_stack_title_proposals').upsert({trip_id:tripId,cluster_id:clusterId,user_id:userId,title:clean,updated_at:new Date().toISOString()},{onConflict:'trip_id,cluster_id,user_id'}).select('*').single();if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die Memory Curation Foundation Migration ausführen.');throw r.error}window.dispatchEvent(new CustomEvent('luvia:memory-curation-updated',{detail:{clusterId,local:true}}));return r.data}
async function dissolveStack(clusterId){const{client,tripId}=await ctx();const r=await client.rpc('luvia_memory_dissolve_stack',{p_trip_id:tripId,p_cluster_id:clusterId});if(r.error)throw r.error;window.dispatchEvent(new CustomEvent('luvia:memory-curation-updated',{detail:{clusterId,dissolved:true,local:true}}));return true}
async function albumReviewSummary(cardIds=[]){const ids=[...new Set(cardIds.map(String).filter(Boolean))];if(!ids.length)return{byCard:{},reviewers:0};const{client,tripId}=await ctx();const r=await client.from('memory_card_album_reviews').select('card_id,user_id,decision').eq('trip_id',tripId).in('card_id',ids);if(r.error){if(missing(r.error))return{byCard:{},reviewers:0};throw r.error}const byCard={},users=new Set();for(const row of r.data||[]){users.add(String(row.user_id));const k=String(row.card_id);const b=byCard[k]??={included:0,excluded:0,undecided:0,total:0};b[row.decision]=(b[row.decision]||0)+1;b.total++}return{byCard,reviewers:users.size}}


async function albumVotes(clusterId,cardIds=[]){const ids=[...new Set(cardIds.map(String).filter(Boolean))];if(!ids.length)return{};const{client,tripId,userId}=await ctx();const r=await client.from('memory_card_album_votes').select('card_id,points').eq('trip_id',tripId).eq('cluster_id',clusterId).eq('user_id',userId).in('card_id',ids);if(r.error){if(missing(r.error))return{};throw r.error}return Object.fromEntries((r.data||[]).map(x=>[String(x.card_id),Number(x.points||0)]))}
async function saveAlbumVotes(clusterId,votes={},budget=0){const{client,tripId,userId}=await ctx();const rows=Object.entries(votes).map(([cardId,points])=>({trip_id:tripId,cluster_id:clusterId,card_id:cardId,user_id:userId,points:Math.max(0,Math.min(3,Number(points||0))),updated_at:new Date().toISOString()}));const total=rows.reduce((n,x)=>n+x.points,0);if(budget&&total>budget)throw new Error('Dein Punktebudget ist überschritten.');if(!rows.length)return[];const r=await client.from('memory_card_album_votes').upsert(rows,{onConflict:'card_id,user_id'}).select('*');if(r.error){if(missing(r.error))throw new Error('Bitte zuerst die 13.37.1 Migration ausführen.');throw r.error}window.dispatchEvent(new CustomEvent('luvia:memory-album-votes-updated',{detail:{clusterId,local:true}}));return r.data||[]}
async function albumVoteSummary(clusterIds=[]){const ids=[...new Set(clusterIds.map(String).filter(Boolean))];if(!ids.length)return{byCluster:{}};const{client,tripId}=await ctx();const r=await client.from('memory_card_album_votes').select('cluster_id,card_id,user_id,points,updated_at').eq('trip_id',tripId).in('cluster_id',ids);if(r.error){if(missing(r.error))return{byCluster:{}};throw r.error}const byCluster={};for(const row of r.data||[]){const ck=String(row.cluster_id),card=String(row.card_id),uid=String(row.user_id),points=Number(row.points||0),c=byCluster[ck]??={byCard:{},byUser:{},rows:0};const bc=c.byCard[card]??={points:0,voters:0};bc.points+=points;if(points>0)bc.voters++;const bu=c.byUser[uid]??={cards:{},total:0,updatedAt:null};bu.cards[card]=points;bu.total+=points;bu.updatedAt=row.updated_at||bu.updatedAt;c.rows++}return{byCluster}}
async function updateStory(id,content){const text=String(content||'').replace(/\s+/g,' ').trim().slice(0,420);if(text.length<40)throw new Error('Die Geschichte ist noch zu kurz.');const{client,tripId,userId}=await ctx();const current=await client.from('memory_cards').select('metadata').eq('trip_id',tripId).eq('author_id',userId).eq('id',id).single();if(current.error)throw current.error;const metadata={...(current.data?.metadata||{}),curation_class:'story',story_enriched:true,story_context:true,story_updated_at:new Date().toISOString()};const r=await client.from('memory_cards').update({content:text,metadata,updated_at:new Date().toISOString()}).eq('trip_id',tripId).eq('author_id',userId).eq('id',id).select('*').single();if(r.error)throw r.error;window.dispatchEvent(new CustomEvent('luvia:memory-card-updated',{detail:{card:r.data,local:true}}));return r.data}

async function subscribe(cb){const{client,tripId}=await ctx();if(channel)await client.removeChannel(channel);channel=client.channel(`luvia-memory-cards-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_cards',filter:`trip_id=eq.${tripId}`},p=>{if(!writeDepth)cb?.(p)}).subscribe();return async()=>{if(channel){await client.removeChannel(channel);channel=null}}}
async function subscribeIdentities(cb){const{client}=await ctx();if(identityChannel)await client.removeChannel(identityChannel);identityChannel=client.channel(`luvia-memory-identities-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_member_identity'},p=>cb?.(p)).subscribe();return async()=>{if(identityChannel){await client.removeChannel(identityChannel);identityChannel=null}}}

async function subscribeReviews(cb){const{client,tripId}=await ctx();if(reviewChannel)await client.removeChannel(reviewChannel);reviewChannel=client.channel(`luvia-memory-reviews-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_card_album_reviews',filter:`trip_id=eq.${tripId}`},p=>cb?.(p)).subscribe();return async()=>{if(reviewChannel){await client.removeChannel(reviewChannel);reviewChannel=null}}}
async function subscribeVotes(cb){const{client,tripId}=await ctx();if(voteChannel)await client.removeChannel(voteChannel);voteChannel=client.channel(`luvia-memory-votes-${tripId}-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'memory_card_album_votes',filter:`trip_id=eq.${tripId}`},p=>cb?.(p)).subscribe();return async()=>{if(voteChannel){await client.removeChannel(voteChannel);voteChannel=null}}}
window.LuviaMemoryCards=Object.freeze({version:VERSION,build:BUILD,list,save,setWeight,dismiss,members,setAlbumReview,albumReviews,albumReviewSummary,albumVotes,saveAlbumVotes,albumVoteSummary,updateStory,syncPhotoCandidates,curationClass,stackCuration,saveTitleProposal,dissolveStack,subscribe,subscribeIdentities,subscribeReviews,subscribeVotes,tripAccent,activeTrip,isWriting:()=>writeDepth>0});
})();

;

/* ===== app/gallery-view.js ===== */
(() => {
  'use strict';

  const VERSION = '4.29.4';
  const BUILD = '13.29.4';
  const DIAGNOSTICS_LABEL = '[LuviaGalleryDiagnostics]';
  const platformPort=id=>globalThis.LuviaPlatformPorts?.get?.(id)||null;
  let diagnosticsEnabled = /(?:^|[?&])galleryDebug=1(?:&|$)/.test(location.search);
  const diagnosticsState = {
    mountedAt: null, mountCount: 0, loadCount: 0, readDataCount: 0, renderAllCount: 0,
    renderFavoritesCount: 0, renderClustersCount: 0, renderDaysCount: 0,
    hydrateBatchCount: 0, imageUrlRequestCount: 0, mediaRealtimeCount: 0,
    clusterRealtimeCount: 0, ignoredClusterRealtimeCount: 0, clusterSyncCount: 0, scheduledRefreshCount: 0, coalescedRefreshCount: 0,
    reasons: {}, lastLoadMs: 0, lastReadMs: 0, lastRenderMs: 0
  };
  const diag = (event, detail={}) => {
    diagnosticsState.reasons[event]=(diagnosticsState.reasons[event]||0)+1;
    if (diagnosticsEnabled) console.info(DIAGNOSTICS_LABEL,event,{...detail,snapshot:{...diagnosticsState}});
  };
  const REALTIME_DEBOUNCE_MS = 3500;
  const REALTIME_MAX_WAIT_MS = 0;
  const FILTERS = {
    none: ['Original', ''], warm: ['Golden Hour', 'sepia(.18) saturate(1.15) contrast(1.04)'], cool: ['Blue Sky', 'hue-rotate(10deg) saturate(1.08)'], vivid: ['Pop', 'saturate(1.45) contrast(1.1)'], soft: ['Soft', 'contrast(.92) saturate(.88) brightness(1.04)'], mono: ['Mono', 'grayscale(1) contrast(1.08)'],
    paris: ['Paris', 'sepia(.12) saturate(1.16) contrast(1.06) hue-rotate(-6deg)'], sunset: ['Sunset', 'sepia(.24) saturate(1.35) hue-rotate(-12deg)'], rose: ['Rosé', 'sepia(.12) saturate(1.2) hue-rotate(325deg)'], cinema: ['Cinema', 'contrast(1.2) saturate(.78) sepia(.1)'], noir: ['Noir', 'grayscale(1) contrast(1.35) brightness(.92)'], retro: ['Retro', 'sepia(.38) saturate(.82) contrast(.92)'], film: ['Film', 'contrast(1.12) saturate(.9) brightness(.98)'], dreamy: ['Dreamy', 'brightness(1.08) contrast(.88) saturate(.86)'], tropical: ['Tropical', 'saturate(1.45) hue-rotate(-8deg) contrast(1.04)'], aqua: ['Aqua', 'saturate(1.2) hue-rotate(18deg)'], candy: ['Candy', 'saturate(1.4) hue-rotate(335deg) brightness(1.04)'], matte: ['Matte', 'contrast(.86) saturate(.78) brightness(1.06)'],
    crisp: ['Crisp', 'contrast(1.22) saturate(1.12)'], faded: ['Faded', 'contrast(.82) saturate(.68) brightness(1.1)'], night: ['Night', 'brightness(.86) contrast(1.22) saturate(1.18) hue-rotate(8deg)'], bwsoft: ['B&W Soft', 'grayscale(1) contrast(.9) brightness(1.08)'], bwdramatic: ['B&W Drama', 'grayscale(1) contrast(1.5)'], travel: ['Travel', 'saturate(1.22) contrast(1.08) sepia(.06)']
  };
  const STICKERS = ['', '✨','💫','⭐','🌟','❤️','💕','💖','📍','🗺️','✈️','🚗','🚆','🌸','🌹','🥂','🍾','🎉','🎈','☀️','🌅','🌙','🏰','🗼','🎡','🎢','🛍️','🍝','☕','📸','👨‍👩‍👧','👶'];
  const FRAMES = ['', 'polaroid', 'rounded', 'film', 'postcard', 'story', 'classic', 'white', 'shadow', 'stamp', 'cinema', 'travel'];

  let host = null;
  let items = [];
  let clusters = [];
  let polaroids = {};
  let activeDay = null;
  let unsubMedia = null;
  let unsubClusters = null;
  let busy = false;
  let pending = null;
  let loadTimer = null;
  let realtimeBatchStartedAt = 0;
  let suppressRealtimeUntil = 0;
  let clusterSyncInProgress = false;
  let muteClusterRealtimeUntil = 0;
  let lastFingerprint = '';
  let lastClusterInputFingerprint = '';
  let lastMediaRealtimeAt = 0;
  let dayLimit = 10;
  function mountOverlay(overlay,{name='consumer.gallery',initialFocus=null,onClose}={}){const ui=LuviaUI;if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');const mounted=ui.adopt(overlay,{name,kind:'dialog',closeSelector:'[data-close],[data-cancel]',initialFocus,onClose});return(reason='owner')=>mounted.close(reason)}
  const urlCache = new Map();
  const urlFailureCache = new Map();

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cssEsc = value => window.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  const dateKey = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'unknown' : `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  };
  const fmtDate = value => value ? new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date(value)) : 'Ohne Datum';
  const fmtTime = value => value ? new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(value)) : '–';
  const suggestName = () => '';
  const displayName = item => item.displayName || 'Titel hinzufügen';
  const locationName = item => item?.resolvedLocation?.name || item?.resolvedLocation?.address || item?.captureLocationName || (item?.latitude!=null&&item?.longitude!=null?'GPS-Standort gespeichert':'Kein Standort gespeichert');
  const tripContract=()=>window.LuviaTripContractV1||window.LuviaTripContract||null;
  const activeTrip=()=>tripContract()?.getActiveTrip?.()||{};
  const mediaContract=()=>window.LuviaMediaContractV1||window.LuviaMediaContract||null;
  const mediaReads=()=>{const api=mediaContract()?.reads;if(!api)throw new Error('Media Contract v1 ist nicht verfügbar.');return api};
  const mediaCommands=()=>{const api=mediaContract()?.commands?.media;if(!api)throw new Error('Media Contract v1 Commands sind nicht verfügbar.');return api};
  const normalizeOverlay=o=>({type:o?.type==='text'?'text':'sticker',value:String(o?.value||''),x:Math.max(0,Math.min(1,Number(o?.x??.5)>1?Number(o.x)/100:Number(o?.x??.5))),y:Math.max(0,Math.min(1,Number(o?.y??.5)>1?Number(o.y)/100:Number(o?.y??.5))),size:Math.max(.025,Math.min(.5,Number(o?.size)||(((o?.type==='text') ? .07 : .13)*Number(o?.scale||1)))),rotation:Number(o?.rotation||0),schema:'image-v2'});
  const settings = item => {const value={brightness:100,contrast:100,saturation:100,temperature:0,blur:0,vignette:0,exposure:0,highlights:0,shadows:0,clarity:0,hue:0,grain:0,filter:'none',rotation:0,frame:'',sticker:'',caption:'',overlays:[],...item.editSettings};value.overlays=(value.overlays||[]).map(normalizeOverlay);return value};
  const editCss = item => {
    const edit = settings(item);
    const preset = FILTERS[edit.filter]?.[1] || '';
    const temperature = Number(edit.temperature || 0);
    const temperatureFilter = temperature > 0 ? `sepia(${Math.min(.35,temperature/180)}) hue-rotate(${-temperature/6}deg)` : temperature < 0 ? `hue-rotate(${Math.abs(temperature)/4}deg)` : '';
    const exposure=100+Number(edit.exposure||0),contrast=Number(edit.contrast)+Number(edit.clarity||0)*.25,shadowBoost=Math.max(0,Number(edit.shadows||0))*.12,highlightCut=Math.max(0,-Number(edit.highlights||0))*.08;return `brightness(${exposure*Number(edit.brightness)/100+shadowBoost-highlightCut}%) contrast(${contrast}%) saturate(${Number(edit.saturation)}%) hue-rotate(${Number(edit.hue||0)}deg) blur(${Number(edit.blur)}px) ${temperatureFilter} ${preset}`.trim();
  };
  const overlayMarkup = edit => `<span class="lv-saved-overlays" style="--image-rotation:${Number(edit.rotation||0)}deg">${(edit.overlays||[]).map(raw=>{const o=normalizeOverlay(raw);return `<span class="lv-saved-overlay ${o.type==='text'?'is-text':'is-sticker'}" style="--overlay-x:${o.x*100};--overlay-y:${o.y*100};--overlay-rotation:${o.rotation}deg;--overlay-size:${o.size}">${esc(o.value||'')}</span>`}).join('')}</span>`;
  const photoVisual = (item, attrs='') => {
    const edit = settings(item),baked=Boolean(item?.renderedPreviewAvailable);
    return `<span class="lv-photo-visual ${baked?'is-baked':`frame-${esc(edit.frame||'none')}`}" ${attrs}><span class="lv-photo-media-canvas"><img alt="${esc(displayName(item))}" ${baked?'':`style="filter:${esc(editCss(item))};transform:rotate(${Number(edit.rotation||0)}deg)"`}><i>Bild wird geladen …</i>${baked?'':`${edit.vignette?`<b class="lv-photo-vignette" style="opacity:${Math.min(.8,Number(edit.vignette)/100)}"></b>`:''}${overlayMarkup(edit)}`}</span></span>`;
  };

  function syncOverlayGeometry(scope=document){scope.querySelectorAll('.lv-photo-media-canvas,.lv-lightbox-canvas').forEach(canvas=>{const img=canvas.querySelector(':scope > img'),stage=canvas.querySelector(':scope > .lv-saved-overlays');if(!img||!stage)return;const sync=()=>{const bw=img.clientWidth,bh=img.clientHeight,nw=img.naturalWidth,nh=img.naturalHeight;if(!bw||!bh||!nw||!nh)return;const scale=Math.min(bw/nw,bh/nh),w=nw*scale,h=nh*scale;stage.style.left=`${(bw-w)/2}px`;stage.style.top=`${(bh-h)/2}px`;stage.style.width=`${w}px`;stage.style.height=`${h}px`};img.addEventListener('load',sync,{once:true});if(img.complete)requestAnimationFrame(sync);if(!img.dataset.overlayObserved){img.dataset.overlayObserved='1';new ResizeObserver(sync).observe(img)}})}

  async function renderComposite(item,state){
    const sourceUrl=await mediaReads().signedOriginalUrl(item.id,1800);if(!sourceUrl)throw new Error('Originalfoto konnte nicht geladen werden.');
    const response=await fetch(sourceUrl);if(!response.ok)throw new Error('Originalfoto konnte nicht geladen werden.');
    const bitmap=await createImageBitmap(await response.blob()),max=2400,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
    const base=document.createElement('canvas');base.width=w;base.height=h;const ctx=base.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.filter=editCss({editSettings:state});ctx.drawImage(bitmap,0,0,w,h);ctx.filter='none';bitmap.close?.();
    if(Number(state.vignette||0)>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.22,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${Math.min(.72,Number(state.vignette)/125)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
    for(const raw of state.overlays||[]){const o=normalizeOverlay(raw),x=o.x*w,y=o.y*h,size=Math.max(12,o.size*w);ctx.save();ctx.translate(x,y);ctx.rotate(Number(o.rotation||0)*Math.PI/180);ctx.textAlign='center';ctx.textBaseline='middle';if(o.type==='text'){ctx.font=`700 ${size}px system-ui,-apple-system,sans-serif`;ctx.lineWidth=Math.max(2,size*.08);ctx.strokeStyle='rgba(0,0,0,.65)';ctx.strokeText(o.value,0,0);ctx.fillStyle='#fff';ctx.fillText(o.value,0,0)}else{ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;ctx.fillText(o.value,0,0)}ctx.restore()}
    let final=base,rotation=((Number(state.rotation||0)%360)+360)%360;if(rotation){const swap=rotation===90||rotation===270,out=document.createElement('canvas');out.width=swap?h:w;out.height=swap?w:h;const oc=out.getContext('2d',{alpha:false});oc.fillStyle='#fff';oc.fillRect(0,0,out.width,out.height);oc.translate(out.width/2,out.height/2);oc.rotate(rotation*Math.PI/180);oc.drawImage(base,-w/2,-h/2);final=out}
    return await new Promise((resolve,reject)=>final.toBlob(blob=>blob?resolve(blob):reject(new Error('Bearbeitete Fotodatei konnte nicht erzeugt werden.')),'image/jpeg',.92));
  }
  function shell() {
    return `<section class="lv-gallery-view">
      <header class="lv-gallery-hero">
        <div><span>📸 Realtime Galerie</span><h1>Eure gemeinsamen Reisefotos</h1><p>Momente, Reisetage, Favoriten und kreative Bearbeitung – ohne sichtbares Neuladen.</p></div>
        <div class="lv-gallery-upload-actions"><button type="button" data-gallery-download>Galerie herunterladen</button><button type="button" class="lv-gallery-danger" data-gallery-clear>Galerie leeren</button><button type="button" class="lv-gallery-upload" data-gallery-add>Fotos auswählen</button><button type="button" class="lv-gallery-upload" data-gallery-capture>Foto aufnehmen</button></div>
      </header>
      <div class="lv-gallery-status" data-gallery-status>Galerie wird geladen …</div>
      <section class="lv-gallery-section"><div class="lv-gallery-section-head"><div><span>⭐ Auswahl</span><h2>Favoriten</h2></div><strong data-favorite-count>0</strong></div><div class="lv-favorites" data-gallery-favorites></div></section>

      <section class="lv-gallery-section"><div class="lv-gallery-section-head"><div><span>🗓️ Reisetage</span><h2>Fototage</h2></div><strong data-gallery-count>0 Fotos</strong></div><div data-gallery-days></div></section>
    </section>`;
  }

  async function urlFor(item) {
    const cacheKey=`${item.id}:${item.renderedPreviewAvailable?'rendered':'source'}:${item.updatedAt||''}`;
    if (urlCache.has(cacheKey)) return urlCache.get(cacheKey);
    if ((urlFailureCache.get(item.id)||0)>Date.now()) return '';
    try {
      const url = await mediaReads().signedUrl(item.id, 1800);
      if (url) {urlCache.set(cacheKey, url);urlFailureCache.delete(item.id);return url}
      urlFailureCache.set(item.id,Date.now()+300000);return '';
    } catch {urlFailureCache.set(item.id,Date.now()+300000);return ''}
  }
  const safeFileName=(value,fallback='foto')=>{const v=String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-{2,}/g,'-').replace(/^-+|-+$/g,'');return(v||fallback).slice(0,90)};
  const extensionFor=(item,url='')=>{const mime=String(item?.renderedPreviewAvailable?'image/jpeg':item?.mimeType||'').split('/')[1];if(mime)return mime.replace('jpeg','jpg');return String(item?.originalName||url).match(/\.([a-z0-9]{2,5})(?:$|[?#])/i)?.[1]?.toLowerCase()||'jpg'};
  const downloadFileName=(item,index=1,url='')=>`${String(index).padStart(2,'0')}-${safeFileName(displayName(item)||item?.originalName||`foto-${index}`)}.${extensionFor(item,url)}`;
  function triggerDownload(source,name){const href=typeof source==='string'?source:URL.createObjectURL(source),a=document.createElement('a');a.href=href;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();if(typeof source!=='string')setTimeout(()=>URL.revokeObjectURL(href),5000)}
  const encoder=new TextEncoder(),crcTable=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return t})();
  function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
  function zipBlob(files){const local=[],central=[];let offset=0;for(const f of files){const data=f.bytes,name=encoder.encode(f.name),crc=crc32(data),lh=new Uint8Array(30+name.length),lv=new DataView(lh.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(8,0,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);lh.set(name,30);local.push(lh,data);const ch=new Uint8Array(46+name.length),cv=new DataView(ch.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);ch.set(name,46);central.push(ch);offset+=lh.length+data.length}const size=central.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,size,true);ev.setUint32(16,offset,true);return new Blob([...local,...central,end],{type:'application/zip'})}
  async function ensureMedia(id){return items.find(x=>String(x.id)===String(id))||await mediaReads().getMedia(id)}
  async function downloadPhotoAsset(idOrItem){const item=typeof idOrItem==='string'?await ensureMedia(idOrItem):idOrItem,url=await urlFor(item);if(!url)throw new Error('Foto konnte nicht geladen werden.');const r=await fetch(url);if(!r.ok)throw new Error('Foto konnte nicht heruntergeladen werden.');triggerDownload(await r.blob(),downloadFileName(item,1,url));return true}
  async function downloadCollection(ids,label='Luvia-Galerie'){const files=[];for(let i=0;i<ids.length;i++){const item=await ensureMedia(typeof ids[i]==='string'?ids[i]:ids[i].id),url=item?await urlFor(item):'';if(!url)continue;const r=await fetch(url);if(!r.ok)continue;files.push({name:downloadFileName(item,files.length+1,url),bytes:new Uint8Array(await r.arrayBuffer())})}if(!files.length)throw new Error('Keine Bilder konnten geladen werden.');triggerDownload(zipBlob(files),`${safeFileName(label,'Luvia-Galerie')}.zip`);return true}
  async function shareCollection(ids,label='Luvia-Album'){const files=[];for(let i=0;i<ids.length;i++){const item=await ensureMedia(ids[i]),url=item?await urlFor(item):'';if(!url)continue;const r=await fetch(url);if(!r.ok)continue;const blob=await r.blob();files.push({blob,name:downloadFileName(item,files.length+1,url),type:blob.type||'image/jpeg'})}if(files.length&&await platformPort('SharingPort')?.shareFiles?.({title:label,text:`${label} · ${files.length} Fotos`,files}))return true;await downloadCollection(ids,label);return false}
  function status(text, type='') {
    const node = host?.querySelector('[data-gallery-status]');
    if (!node) return;
    node.textContent = text;
    node.dataset.state = type;
  }
  function showError(error) {
    console.error('[LuviaGalleryView]', error);
    status(error?.message || 'Galerie konnte nicht aktualisiert werden.', 'error');
  }
  function fingerprint() {
    return JSON.stringify({
      items: items.map(item => [item.id,item.favorite,item.displayName,item.dayKey,item.renderedPreviewAvailable,item.updatedAt,item.editSettings,item.status]),
      clusters: clusters.map(cluster => [cluster.id,cluster.title,cluster.state,cluster.mediaIds]),
      polaroids
    });
  }
  function clusterInputFingerprint(list=items) {
    return JSON.stringify(list.map(item => [
      String(item.id), String(item.dayKey||''), String(item.capturedAt||item.createdAt||''), String(item.status||''),
      item.latitude ?? null, item.longitude ?? null, item.mediaKind || null
    ]).sort((a,b)=>a[0].localeCompare(b[0])));
  }
  function scheduleLoad(reason='Realtime', options={}) {
    if (Date.now() < suppressRealtimeUntil && options.realtime) return;
    diagnosticsState.scheduledRefreshCount++;
    if(loadTimer||busy||pending)diagnosticsState.coalescedRefreshCount++;
    const now=Date.now();
    if(options.realtime && !realtimeBatchStartedAt) realtimeBatchStartedAt=now;
    diag('schedule-refresh',{reason,realtime:Boolean(options.realtime),busy,alreadyQueued:Boolean(loadTimer)});
    const previous = pending || {};
    pending = {
      ...previous,
      ...options,
      reason,
      analyze: Boolean(previous.analyze || options.analyze),
      force: Boolean(previous.force || options.force),
      silent: previous.silent === false || options.silent === false ? false : true
    };
    if (busy) return;
    clearTimeout(loadTimer);
    const delay=options.immediate?0:(options.realtime?REALTIME_DEBOUNCE_MS:250);
    loadTimer = setTimeout(() => {
      const queued=pending||{};
      pending=null;
      loadTimer=null;
      realtimeBatchStartedAt=0;
      load(queued);
    }, delay);
  }

  async function tripDays() {
    const trip = activeTrip();
    const start = trip.start_date || trip.startDate || trip.startsAt || trip.start_at;
    const end = trip.end_date || trip.endDate || trip.endsAt || trip.end_at;
    if (!start || !end) return [];
    const from = new Date(start), to = new Date(end), result = [];
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return [];
    from.setHours(12,0,0,0); to.setHours(12,0,0,0);
    for (let day = new Date(from); day <= to; day.setDate(day.getDate()+1)) result.push(dateKey(day));
    return result;
  }
  async function dayGroups() {
    const days = await tripDays();
    const daySet = new Set(days);
    const groups = days.map(key => ({key,label:fmtDate(`${key}T12:00:00`),items:items.filter(item => item.dayKey === key)}));
    const other = items.filter(item => !daySet.has(item.dayKey));
    if (other.length) groups.push({key:'other',label:'Sonstige Reisebilder',items:other});
    return groups;
  }

  function card(item, compact=false) {
    return `<article class="lv-gallery-photo ${compact?'is-compact':''}" data-photo="${esc(item.id)}">
      <button type="button" class="lv-photo-open" data-photo-open="${esc(item.id)}">${photoVisual(item,`data-photo-image="${esc(item.id)}"`)}</button>
      <div class="lv-photo-meta"><strong>${esc(displayName(item))}</strong><small>${esc(fmtTime(item.capturedAt))}</small></div>
      <div class="lv-photo-actions"><button type="button" data-photo-favorite="${esc(item.id)}" class="${item.favorite?'is-on':''}" title="Favorit">${item.favorite?'★':'☆'}</button><button type="button" class="lv-photo-timeline-action" data-photo-timeline="${esc(item.id)}" title="Als Polaroid des Tages zur Timeline hinzufügen" aria-label="Als Polaroid des Tages zur Timeline hinzufügen">▣</button><button type="button" data-photo-edit="${esc(item.id)}" title="Bearbeiten">✎</button><button type="button" data-photo-remove="${esc(item.id)}" title="Löschen">×</button></div>
    </article>`;
  }
  async function hydrateImages(root, list) {
    diagnosticsState.hydrateBatchCount++;
    diag('hydrate-batch',{count:list.length});
    await Promise.all(list.map(async item => {
      const url = await urlFor(item);
      root.querySelectorAll(`[data-photo-image="${cssEsc(item.id)}"]`).forEach(node => {
        if (url) { const image=node.querySelector('img'); if(image) image.src=url; else node.style.backgroundImage = `url("${url}")`; node.querySelector('i')?.remove(); }
        else node.innerHTML = '<i>Vorschau nicht verfügbar</i>';
      });
    }));
    syncOverlayGeometry(root);
  }
  function bindPhotoActions(root) {
    root.querySelectorAll('[data-photo-open]').forEach(button => button.onclick = () => openLightbox(button.dataset.photoOpen));
    root.querySelectorAll('[data-photo-favorite]').forEach(button => button.onclick = async event => {
      event.stopPropagation(); suppressRealtimeUntil = Date.now()+1500;
      await mediaCommands().toggleFavorite(button.dataset.photoFavorite);
      await load({reason:'Favorit',silent:true,analyze:false,force:true});
    });
    root.querySelectorAll('[data-photo-timeline]').forEach(button => button.onclick = async event => {event.stopPropagation();const item=items.find(x=>x.id===button.dataset.photoTimeline);if(!item?.dayKey)return showError(new Error('Dieses Foto ist keinem Reisetag zugeordnet.'));suppressRealtimeUntil=Date.now()+1400;button.disabled=true;try{await mediaCommands().setPolaroid(item.id,item.dayKey);await load({reason:'Polaroid',silent:true,analyze:false,force:true});status('Foto wurde als Polaroid des Tages zur Timeline hinzugefügt.','ready')}finally{button.disabled=false}});
    root.querySelectorAll('[data-photo-edit]').forEach(button => button.onclick = event => { event.stopPropagation(); openEditor(button.dataset.photoEdit); });
    root.querySelectorAll('[data-photo-remove]').forEach(button => button.onclick = async event => {
      event.stopPropagation();
      if (!confirm('Foto wirklich entfernen?')) return;
      suppressRealtimeUntil = Date.now()+1800;
      await mediaCommands().remove(button.dataset.photoRemove);
      await load({reason:'Löschen',silent:true,analyze:true,force:true});
    });
  }

  async function renderFavorites() {
    diagnosticsState.renderFavoritesCount++;
    const root = host.querySelector('[data-gallery-favorites]');
    const favorites = items.filter(item => item.favorite);
    host.querySelector('[data-favorite-count]').textContent = String(favorites.length);
    if (!favorites.length) { root.innerHTML = '<div class="lv-inline-empty">Noch keine Favoriten – tippe bei einem Foto auf ☆.</div>'; return; }
    root.innerHTML = favorites.map(item => card(item,true)).join('');
    await hydrateImages(root,favorites); bindPhotoActions(root);
  }

  async function renderDays() {
    diagnosticsState.renderDaysCount++;
    const root = host?.querySelector('[data-gallery-days]');
    if (!root) return;
    const groups = await dayGroups();
    if (!groups.length) { root.innerHTML = '<div class="lv-gallery-empty"><b>📷</b><h3>Noch keine Reisefotos</h3></div>'; return; }
    if (activeDay) {
      const group = groups.find(entry => entry.key === activeDay);
      if (!group) activeDay = null;
      else {
        const hero = group.key !== 'other' && polaroids[group.key] ? group.items.find(item => item.id === polaroids[group.key]) : null;
        root.innerHTML = `<div class="lv-day-page is-entering"><div class="lv-day-page-toolbar"><button type="button" class="lv-day-back" data-day-back>← Alle Fototage</button><span>${group.items.length} Foto${group.items.length===1?'':'s'}</span></div><header class="lv-day-page-hero"><div><small>${group.key==='other'?'WEITERE AUFNAHMEN':'EUER REISETAG'}</small><h3>${esc(group.label)}</h3><p>${group.items.length ? 'Alle Bilder dieses Tages – gemeinsam, bearbeitbar und in Echtzeit.' : 'Für diesen Tag wurden noch keine Fotos gespeichert.'}</p></div></header>${hero?`<button type="button" class="lv-polaroid-card" data-photo-open="${esc(hero.id)}">${photoVisual(hero,`data-photo-image="${esc(hero.id)}"`)}<b>Polaroid des Tages</b><small>${esc(displayName(hero))}</small></button>`:''}<div class="lv-gallery-grid">${group.items.map(item=>card(item)).join('')}</div></div>`;
        root.querySelector('[data-day-back]').onclick = () => { root.querySelector('.lv-day-page')?.classList.add('is-leaving'); setTimeout(()=>{activeDay=null;renderDays();},180); };
        await hydrateImages(root,group.items); bindPhotoActions(root); return;
      }
    }
    const visible = groups.slice(0, dayLimit);
    const hidden = Math.max(0, groups.length-visible.length);
    root.innerHTML = `<div class="lv-day-tiles">${visible.map(group => {
      const cover = (group.key!=='other' && polaroids[group.key] ? group.items.find(item=>item.id===polaroids[group.key]) : null) || group.items[0] || null;
      return `<button type="button" class="lv-day-tile ${group.items.length?'has-photos':'is-empty'}" data-day-open="${esc(group.key)}"><span class="lv-day-tile-cover" ${cover?`data-photo-image="${esc(cover.id)}"`:''}><i>${cover?'Bild wird geladen …':'Noch frei'}</i></span><div><small>${group.key==='other'?'WEITERE AUFNAHMEN':'REISETAG'}</small><strong>${esc(group.label)}</strong><em>${group.items.length} Foto${group.items.length===1?'':'s'}</em></div><b>→</b></button>`;
    }).join('')}</div>${groups.length>10?`<div class="lv-day-more"><button type="button" data-days-toggle>${dayLimit<groups.length?`Mehr Tage anzeigen (${hidden})`:'Weniger Tage anzeigen'}</button></div>`:''}`;
    await hydrateImages(root, visible.flatMap(group=>group.items.slice(0,1)));
    root.querySelectorAll('[data-day-open]').forEach(button => button.onclick = () => { activeDay=button.dataset.dayOpen; renderDays(); });
    root.querySelector('[data-days-toggle]')?.addEventListener('click',()=>{dayLimit=dayLimit<groups.length?groups.length:10;renderDays()});
  }

  function clusterReason(cluster) {
    const related = items.filter(item => cluster.mediaIds?.includes(item.id));
    const gpsCount = related.filter(item => item.latitude != null && item.longitude != null).length;
    if (gpsCount === related.length && related.length) return `${related.length} Fotos in kurzer Folge mit Standortdaten.`;
    if (gpsCount > 0) return `${related.length} Fotos in kurzer Folge; Standortdaten teilweise vorhanden.`;
    return `${related.length} Fotos innerhalb weniger Minuten; keine Standortdaten vorhanden.`;
  }
  async function renderClusters() {
    diagnosticsState.renderClustersCount++;
    const root = host?.querySelector('[data-gallery-clusters]');
    if (!root) return;
    const visible = clusters.filter(cluster => cluster.state !== 'dismissed' && cluster.mediaIds?.length);
    const countNode=host?.querySelector('[data-cluster-count]'); if(countNode) countNode.textContent=String(visible.length);
    if (!visible.length) { root.innerHTML = '<div class="lv-gallery-empty compact"><b>✨</b><h3>Noch keine Fotomomente</h3><p>Mehrere Fotos innerhalb von 20 Minuten werden automatisch gruppiert.</p></div>'; return; }
    root.innerHTML = `<div class="lv-cluster-grid">${visible.map(cluster => `<article class="lv-cluster-card"><button class="lv-cluster-collage" data-cluster-open="${esc(cluster.id)}">${cluster.mediaIds.slice(0,4).map(id=>`<span data-cluster-image="${esc(id)}"></span>`).join('')}<b>${cluster.mediaIds.length} Fotos</b></button><div class="lv-cluster-copy"><small>${esc(fmtDate(cluster.start_at))} · ${esc(fmtTime(cluster.start_at))}</small><h3>${esc(cluster.title||'Gemeinsamer Memory Moment')}</h3><p>${esc(clusterReason(cluster))}</p><div><button type="button" class="lv-cluster-ai-title" data-cluster-ai-title="${esc(cluster.id)}">✨ KI-Titel wählen</button><button type="button" data-memory-bridge="${esc(cluster.id)}">Memory Moment öffnen</button><button type="button" data-cluster-dismiss="${esc(cluster.id)}">Auflösen</button></div></div></article>`).join('')}</div>`;
    await Promise.all(visible.flatMap(cluster => cluster.mediaIds.slice(0,4).map(async id => {
      const item = items.find(entry=>entry.id===id), node = root.querySelector(`[data-cluster-image="${cssEsc(id)}"]`);
      if (!item || !node) return; node.innerHTML=photoVisual(item,`data-photo-image="${esc(item.id)}"`); await hydrateImages(node,[item]);
    })));
    root.querySelectorAll('[data-cluster-open]').forEach(button => button.onclick = () => openCluster(button.dataset.clusterOpen));
    root.querySelectorAll('[data-cluster-ai-title]').forEach(button => button.onclick = () => openClusterTitlePicker(button.dataset.clusterAiTitle));
    root.querySelectorAll('[data-memory-bridge]').forEach(button => button.onclick = () => openMemoryBridge(button.dataset.memoryBridge));
    root.querySelectorAll('[data-cluster-dismiss]').forEach(button => button.onclick = async () => {
      if (!confirm('Automatische Gruppierung auflösen?')) return;
      suppressRealtimeUntil=Date.now()+1600; await window.LuviaMediaClustering.dissolve(button.dataset.clusterDismiss); await window.LuviaJourneyContractV1?.commands?.removePhotoMemoryByCluster?.(button.dataset.clusterDismiss); await load({silent:true,analyze:false,force:true});
    });
  }

  async function openClusterTitlePicker(clusterId) {
    const cluster=clusters.find(entry=>String(entry.id)===String(clusterId)); if(!cluster)return;
    const overlay=document.createElement('div'); overlay.className='lv-photo-overlay';
    overlay.innerHTML=`<section class="lv-cluster-dialog lv-title-picker"><button data-close>×</button><span>✨ Luvia Titelfunk</span><h2>Wie soll dieser Fotomoment heißen?</h2><p>Die Auswahl wird bei jedem Öffnen neu gemischt. „Neue Vorschläge“ erzeugt eine frische Runde.</p><div class="lv-title-suggestion-status">Verspielte Titel werden vorbereitet …</div><div class="lv-title-suggestions" data-title-suggestions></div><div class="lv-editor-actions"><button type="button" data-title-refresh>✨ Neue Vorschläge</button><button type="button" data-cancel>Abbrechen</button></div></section>`;
    const removeOverlay=mountOverlay(overlay,{name:'consumer.gallery.cluster-title',initialFocus:'[data-title-refresh]'}),close=()=>removeOverlay();
    overlay.querySelector('[data-close]').onclick=close;overlay.querySelector('[data-cancel]').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
    const render=async()=>{
      const statusNode=overlay.querySelector('.lv-title-suggestion-status'),grid=overlay.querySelector('[data-title-suggestions]'),refresh=overlay.querySelector('[data-title-refresh]');
      refresh.disabled=true;statusNode.textContent='KI und Luvia sammeln neue Ideen …';grid.innerHTML='';
      try{
        const proposal=await window.LuviaAIMemoryBridge.analyze(clusterId);
        const pool=[...(proposal.titleSuggestions||[]),proposal.title].filter(Boolean);
        const shuffled=[...new Set(pool)].sort(()=>Math.random()-.5).slice(0,12);
        grid.innerHTML=shuffled.map(title=>`<button type="button" data-title-choice="${esc(title)}">${esc(title)}</button>`).join('');
        statusNode.textContent=`${shuffled.length} Vorschläge · locker, frech, verspielt und passend zum Moment`;
        grid.querySelectorAll('[data-title-choice]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await window.LuviaMediaClustering.rename(clusterId,button.dataset.titleChoice);close();await load({reason:'Cluster-Titel',silent:true,analyze:false,force:true});status('Fotomoment-Titel wurde gespeichert.','ready')}catch(error){showError(error);button.disabled=false}});
      }catch(error){statusNode.textContent='Vorschläge konnten gerade nicht geladen werden.';showError(error)}
      finally{refresh.disabled=false}
    };
    overlay.querySelector('[data-title-refresh]').onclick=render;
    await render();
  }

  async function openCluster(id) {
    const cluster = clusters.find(entry=>String(entry.id)===String(id)); if (!cluster) return;
    const selected = items.filter(item=>cluster.mediaIds.includes(item.id));
    const overlay=document.createElement('div'); overlay.className='lv-photo-overlay';
    overlay.innerHTML=`<section class="lv-cluster-dialog"><button data-close>×</button><span>✨ Memory Moment</span><h2>${esc(cluster.title||'Gemeinsamer Memory Moment')}</h2><p>${esc(clusterReason(cluster))}</p><div class="lv-cluster-detail-grid">${selected.map(item=>`<button type="button" data-cluster-photo="${esc(item.id)}">${photoVisual(item,`data-photo-image="${esc(item.id)}"`)}</button>`).join('')}</div></section>`;
    const removeOverlay=mountOverlay(overlay,{name:'consumer.gallery.cluster'}); await hydrateImages(overlay,selected);
    overlay.querySelector('[data-close]').onclick=()=>removeOverlay(); overlay.onclick=e=>{if(e.target===overlay)removeOverlay()};
    overlay.querySelectorAll('[data-cluster-photo]').forEach(button=>button.onclick=()=>{removeOverlay();openLightbox(button.dataset.clusterPhoto)});
  }

  async function openLightbox(id) {
    let item=items.find(entry=>entry.id===id);if(!item){item=await mediaReads().getMedia(id).catch(()=>null);if(item)items=[...items,item]}if(!item)return;
    const url=await urlFor(item),overlay=document.createElement('div');overlay.className='lv-photo-overlay';
    overlay.innerHTML=`<section class="lv-photo-dialog"><button data-close>×</button><div class="lv-photo-large">${url?`<img class="lv-photo-direct-image" src="${esc(url)}" alt="${esc(displayName(item))}">`:'<p>Bild konnte nicht geladen werden.</p>'}</div><footer><div><strong>${esc(displayName(item))}</strong><small>${esc(fmtDate(item.capturedAt))} · ${esc(fmtTime(item.capturedAt))}</small><small class="lv-photo-location">📍 ${esc(locationName(item))}</small></div><button data-light-download>⬇ Herunterladen</button><button data-light-polaroid>▣ Polaroid des Tages</button><button data-light-fav>${item.favorite?'★ Favorit':'☆ Favorit'}</button><button data-light-edit>✎ Bearbeiten</button></footer></section>`;
    const removeOverlay=mountOverlay(overlay,{name:'consumer.gallery.lightbox'}),close=()=>removeOverlay();overlay.querySelector('[data-close]').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
    overlay.querySelector('[data-light-download]').onclick=async()=>{try{await downloadPhotoAsset(item)}catch(error){showError(error)}};const pb=overlay.querySelector('[data-light-polaroid]');if(pb)pb.onclick=async()=>{try{await mediaCommands().setPolaroid(item.id,item.dayKey);status('Polaroid des Tages wurde in die Timeline übernommen.','ready')}catch(error){showError(error)}};
    overlay.querySelector('[data-light-fav]').onclick=async()=>{suppressRealtimeUntil=Date.now()+1200;await mediaCommands().toggleFavorite(id);close();await load({silent:true,force:true})};
    overlay.querySelector('[data-light-edit]').onclick=()=>{close();openEditor(id)};
  }

  function editorControls(edit) {
    const filterButtons=Object.entries(FILTERS).map(([key,[label]])=>`<button type="button" class="lv-filter-chip ${edit.filter===key?'is-active':''}" data-filter="${key}">${esc(label)}</button>`).join('');
    const stickerButtons=STICKERS.filter(Boolean).map(sticker=>`<button type="button" class="lv-sticker-chip" data-quick-sticker="${esc(sticker)}">${esc(sticker)}</button>`).join('');
    return `<nav class="lv-studio-tools" aria-label="Foto-Werkzeuge">
      <button type="button" data-studio-tab="look" class="is-active"><b>◐</b><span>Looks</span></button>
      <button type="button" data-studio-tab="adjust"><b>☷</b><span>Anpassen</span></button>
      <button type="button" data-studio-tab="decorate"><b>✦</b><span>Kreativ</span></button>
      <button type="button" data-studio-tab="title"><b>T</b><span>Titel</span></button>
    </nav>
    <div class="lv-studio-drawer is-open" data-studio-drawer>

      <div class="lv-studio-pane is-active" data-studio-pane="look"><div class="lv-filter-browser"><div>${filterButtons}</div></div></div>
      <div class="lv-studio-pane" data-studio-pane="adjust"><div class="lv-editor-sliders"><label>Helligkeit <input type="range" min="50" max="150" value="${Number(edit.brightness)}" data-ed="brightness"><output>${Number(edit.brightness)}%</output></label><label>Kontrast <input type="range" min="50" max="160" value="${Number(edit.contrast)}" data-ed="contrast"><output>${Number(edit.contrast)}%</output></label><label>Sättigung <input type="range" min="0" max="200" value="${Number(edit.saturation)}" data-ed="saturation"><output>${Number(edit.saturation)}%</output></label><label>Wärme <input type="range" min="-50" max="50" value="${Number(edit.temperature)}" data-ed="temperature"><output>${Number(edit.temperature)}</output></label><label>Belichtung <input type="range" min="-40" max="40" value="${Number(edit.exposure||0)}" data-ed="exposure"><output>${Number(edit.exposure||0)}</output></label><label>Lichter <input type="range" min="-50" max="50" value="${Number(edit.highlights||0)}" data-ed="highlights"><output>${Number(edit.highlights||0)}</output></label><label>Schatten <input type="range" min="-50" max="50" value="${Number(edit.shadows||0)}" data-ed="shadows"><output>${Number(edit.shadows||0)}</output></label><label>Klarheit <input type="range" min="-40" max="40" value="${Number(edit.clarity||0)}" data-ed="clarity"><output>${Number(edit.clarity||0)}</output></label><label>Weichzeichnen <input type="range" min="0" max="8" step=".5" value="${Number(edit.blur)}" data-ed="blur"><output>${Number(edit.blur)}</output></label><label>Vignette <input type="range" min="0" max="100" value="${Number(edit.vignette)}" data-ed="vignette"><output>${Number(edit.vignette)}%</output></label><label>Farbton <input type="range" min="-180" max="180" value="${Number(edit.hue||0)}" data-ed="hue"><output>${Number(edit.hue||0)}</output></label></div></div>
      <div class="lv-studio-pane" data-studio-pane="decorate"><div class="lv-editor-fun"><label>Rahmen <select data-ed="frame">${FRAMES.map(frame=>`<option value="${frame}">${frame?frame[0].toUpperCase()+frame.slice(1):'Kein Rahmen'}</option>`).join('')}</select></label><div class="lv-sticker-browser">${stickerButtons}</div><label>Text im Bild <input type="text" maxlength="60" value="${esc(edit.caption||'')}" data-ed="caption" placeholder="Euer Moment …"></label><div class="lv-tool-row"><button type="button" data-add-text>Text hinzufügen</button><button type="button" data-rotate>↻ 90° drehen</button></div></div></div>
      <div class="lv-studio-pane" data-studio-pane="title"><div class="lv-editor-name"><input value="" placeholder="Eigener Fototitel" data-edit-name><button type="button" data-ai-title>✨ Wechselnde KI-Titel vorschlagen</button><div class="lv-photo-title-suggestions" data-photo-title-suggestions></div><small data-metadata-summary></small></div></div>
    </div>`;
  }

  function placeContextFor(item){const trip=activeTrip();const known=item.placeId&&window.LuviaPlaceCore?.getPlace?.(item.placeId);const destination=trip.destination||{};return{placeName:item.resolvedLocation?.name||known?.name||known?.title||null,placeAddress:item.resolvedLocation?.address||null,destinationName:destination.name||trip.destinationName||null,destinationLatitude:destination.latitude??null,destinationLongitude:destination.longitude??null};}
  function galleryDownloadLabel(){const trip=activeTrip();return`${trip.title||'Luvia'} Galerie`;}
  async function aiTitleFor(item) {
    const url = await urlFor(item);
    if (!url) throw new Error('Für dieses Foto ist keine sichere Vorschau verfügbar.');
    if (!window.LuviaOpenAIProvider?.run) throw new Error('Luvia Bildanalyse ist noch nicht geladen.');
    const result = await window.LuviaOpenAIProvider.run({capability:'media.describe',tier:'fast',input:{imageUrl:url,language:'de',instruction:'Erzeuge 10 deutlich unterschiedliche kurze deutsche Fototitel als titles-Array. Mische verspielt, frech, lustig, warm und ruhig. Maximal 2 bis 7 Wörter je Titel. Nutze nur belegbare Bild-, Zeit-, Orts- und Reisekontexte; keine erfundenen Details, keine kitschigen Standardsätze und keine Wiederholungen.'},context:{capturedAt:item.capturedAt,latitude:item.latitude,longitude:item.longitude,dayKey:item.dayKey,...placeContextFor(item)}} ,{timeoutMs:45000});
    const data=result?.data?.result||result?.result||result?.data||{};
    const titles=[...(data.titles||data.titleSuggestions||[]),data.title].map(String).map(x=>x.trim()).filter(Boolean);
    return [...new Set(titles)].slice(0,12);
  }

  async function openEditor(id) {
    let item=items.find(entry=>entry.id===id); if(!item){item=await mediaReads().getMedia(id).catch(()=>null);if(item)items=[...items,item]} if(!item)return;
    const validPolaroid=(await tripDays()).includes(item.dayKey),url=await urlFor(item),edit=settings(item),state={...edit,overlays:[...(edit.overlays||[])]},overlay=document.createElement('div');
    if(edit.sticker && !(edit.overlays||[]).length)state.overlays.push({type:'sticker',value:edit.sticker,x:.84,y:.16,size:.13,rotation:0,schema:'image-v2'});
    if(edit.caption && !(edit.overlays||[]).some(x=>x.type==='text'))state.overlays.push({type:'text',value:edit.caption,x:.5,y:.78,size:.07,rotation:0,schema:'image-v2'});
    state.sticker=''; state.caption=''; overlay.className='lv-photo-overlay';
    overlay.innerHTML=`<section class="lv-editor-dialog lv-editor-pro"><header class="lv-editor-topbar"><div><span>🎨 Luvia Photo Studio</span><strong>Foto bearbeiten</strong></div><button data-close aria-label="Editor schließen">×</button></header><div class="lv-editor-workspace"><div class="lv-editor-preview-shell"><div class="lv-editor-preview frame-${esc(edit.frame||'none')}"><img src="${esc(url)}" alt="${esc(displayName(item))}"><b class="lv-photo-vignette"></b><div class="lv-editor-overlay-stage" data-overlay-stage></div></div></div><aside class="lv-editor-panel">${editorControls(edit)}</aside></div><div class="lv-editor-actions"><button data-reset>Zurücksetzen</button><button data-polaroid ${validPolaroid?'':'disabled'}>Polaroid des Tages</button><button class="primary" data-save>Speichern</button></div></section>`;
    const removeOverlay=mountOverlay(overlay,{name:'consumer.gallery.editor',initialFocus:'[data-close]'});
    const preview=overlay.querySelector('.lv-editor-preview'),img=preview.querySelector('img'),vignette=preview.querySelector('.lv-photo-vignette'),overlayStage=preview.querySelector('[data-overlay-stage]');
    const syncOverlayStage=()=>{overlayStage.style.left=`${img.offsetLeft}px`;overlayStage.style.top=`${img.offsetTop}px`;overlayStage.style.width=`${img.offsetWidth}px`;overlayStage.style.height=`${img.offsetHeight}px`;overlayStage.style.transform=`rotate(${Number(state.rotation||0)}deg)`;overlayStage.style.transformOrigin='center';};img.addEventListener('load',()=>requestAnimationFrame(syncOverlayStage));if(img.complete)requestAnimationFrame(syncOverlayStage);img.addEventListener('error',()=>{if(!img.alt)img.alt='Vorschau nicht verfügbar'});new ResizeObserver(()=>syncOverlayStage()).observe(preview);
    overlay.querySelector('[data-ed="frame"]').value=state.frame||''; const nameInput=overlay.querySelector('[data-edit-name]'); if(nameInput) nameInput.value=item.displayName||''; const summary=overlay.querySelector('[data-metadata-summary]'); if(summary) summary.textContent=[item.capturedAt?`${fmtDate(item.capturedAt)} · ${fmtTime(item.capturedAt)}`:'',item.resolvedLocation?.name?`Ort: ${item.resolvedLocation.name}`:item.latitude!=null&&item.longitude!=null?'EXIF-GPS vorhanden, Ort noch nicht benannt':'Kein GPS in der gelieferten Datei',item.captureEvidenceAvailable?'Metadaten verfügbar':''].filter(Boolean).join(' · ');
    const renderOverlays=()=>{overlayStage.innerHTML=(state.overlays||[]).map((raw,i)=>{const o=normalizeOverlay(raw);state.overlays[i]=o;return `<div class="lv-canvas-item ${o.type==='text'?'is-text':'is-sticker'}" data-overlay-index="${i}" style="left:${o.x*100}%;top:${o.y*100}%;--overlay-size:${o.size};transform:translate(-50%,-50%) rotate(${o.rotation}deg)"><span>${esc(o.value||'')}</span><button type="button" data-overlay-delete="${i}">×</button><i data-overlay-handle="${i}" title="Größe ziehen · Doppeltippen dreht">↗</i><output>${Math.round(o.size*100)}%</output></div>`}).join('');bindCanvasItems()};
    const bindCanvasItems=()=>{overlayStage.querySelectorAll('.lv-canvas-item').forEach(node=>{let start=null;node.onpointerdown=e=>{if(e.target.closest('button,i'))return;node.setPointerCapture(e.pointerId);const r=overlayStage.getBoundingClientRect(),o=state.overlays[Number(node.dataset.overlayIndex)];start={x:e.clientX,y:e.clientY,ox:o.x,oy:o.y,r};};node.onpointermove=e=>{if(!start)return;const o=state.overlays[Number(node.dataset.overlayIndex)];o.x=Math.max(0,Math.min(1,start.ox+(e.clientX-start.x)/start.r.width));o.y=Math.max(0,Math.min(1,start.oy+(e.clientY-start.y)/start.r.height));node.style.left=(o.x*100)+'%';node.style.top=(o.y*100)+'%'};node.onpointerup=()=>start=null;});overlayStage.querySelectorAll('[data-overlay-delete]').forEach(b=>b.onclick=()=>{state.overlays.splice(Number(b.dataset.overlayDelete),1);renderOverlays()});overlayStage.querySelectorAll('[data-overlay-handle]').forEach(h=>{let startDistance=0,base=.13;h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const node=h.parentElement,r=node.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;startDistance=Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy));base=state.overlays[Number(h.dataset.overlayHandle)].size||.13;h.setPointerCapture(e.pointerId)};h.onpointermove=e=>{if(!h.hasPointerCapture(e.pointerId))return;const node=h.parentElement,r=node.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,d=Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy)),o=state.overlays[Number(h.dataset.overlayHandle)];o.size=Math.max(.025,Math.min(.5,base*(d/startDistance)));node.style.setProperty('--overlay-size',o.size);const out=node.querySelector('output');if(out)out.textContent=Math.round(o.size*100)+'%'};h.onpointerup=e=>{try{h.releasePointerCapture(e.pointerId)}catch{}};h.onpointercancel=h.onpointerup;h.ondblclick=()=>{const o=state.overlays[Number(h.dataset.overlayHandle)];o.rotation=(Number(o.rotation||0)+15)%360;renderOverlays()}})};
    const apply=()=>{img.style.filter=editCss({editSettings:state});img.style.transform=`rotate(${Number(state.rotation||0)}deg)`;preview.className=`lv-editor-preview frame-${state.frame||'none'}`;vignette.style.opacity=Math.min(.8,Number(state.vignette||0)/100);syncOverlayStage();renderOverlays()}; apply();
    overlay.querySelectorAll('input[type=range]').forEach(input=>input.oninput=()=>{state[input.dataset.ed]=Number(input.value);input.nextElementSibling.textContent=input.dataset.ed==='temperature'||input.dataset.ed==='blur'?input.value:`${input.value}%`;apply()});
    overlay.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{state.filter=button.dataset.filter;overlay.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===button));apply()});
    {const control=overlay.querySelector('[data-ed="frame"]');control.onchange=()=>{state.frame=control.value;apply()}}
    overlay.querySelector('[data-rotate]').onclick=()=>{state.rotation=(Number(state.rotation||0)+90)%360;apply()};
    const drawer=overlay.querySelector('[data-studio-drawer]');
    overlay.querySelectorAll('[data-studio-tab]').forEach(button=>button.onclick=()=>{const key=button.dataset.studioTab;overlay.querySelectorAll('[data-studio-tab]').forEach(x=>x.classList.toggle('is-active',x===button));overlay.querySelectorAll('[data-studio-pane]').forEach(x=>x.classList.toggle('is-active',x.dataset.studioPane===key));drawer?.classList.add('is-open')});
    overlay.querySelector('[data-ai-title]').onclick=async()=>{const button=overlay.querySelector('[data-ai-title]'),box=overlay.querySelector('[data-photo-title-suggestions]');button.disabled=true;button.textContent='✨ Neue Titel werden gemischt …';try{let titles=await aiTitleFor(item);if(!titles.length)titles=['Kamera an, Alltag aus','Nicht geplant. Trotzdem perfekt.','Guter Tag. Punkt.','Mehr davon, bitte','Ganz schön viel Leben','Kurz raus, viel gesehen'];titles=[...titles].sort(()=>Math.random()-.5).slice(0,8);box.innerHTML=titles.map(title=>`<button type="button" data-photo-title-choice="${esc(title)}">${esc(title)}</button>`).join('');box.querySelectorAll('[data-photo-title-choice]').forEach(choice=>choice.onclick=()=>{overlay.querySelector('[data-edit-name]').value=choice.dataset.photoTitleChoice})}catch(error){showError(error)}finally{button.disabled=false;button.textContent='✨ Andere KI-Titel vorschlagen'}};
    overlay.querySelectorAll('[data-quick-sticker]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.quickSticker;if(!value)return;state.overlays=[...(state.overlays||[]),{type:'sticker',value,x:.5,y:.5,size:.13,rotation:0,schema:'image-v2'}];apply()}));
    overlay.querySelector('[data-add-text]')?.addEventListener('click',()=>{const value=overlay.querySelector('[data-ed="caption"]')?.value?.trim()||'Euer Moment';state.overlays=[...(state.overlays||[]),{type:'text',value,x:.5,y:.78,size:.07,rotation:0,schema:'image-v2'}];apply()});
    overlay.querySelector('[data-reset]').onclick=()=>{Object.assign(state,{brightness:100,contrast:100,saturation:100,temperature:0,blur:0,vignette:0,exposure:0,highlights:0,shadows:0,clarity:0,hue:0,grain:0,filter:'none',rotation:0,frame:'',sticker:'',caption:'',overlays:[]});const textInput=overlay.querySelector('[data-ed="caption"]'); if(textInput) textInput.value=''; apply();overlay.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x.dataset.filter==='none'))};
    const polaroidButton=overlay.querySelector('[data-polaroid]'); if(polaroidButton&&!polaroidButton.disabled)polaroidButton.onclick=async()=>{suppressRealtimeUntil=Date.now()+1200;await mediaCommands().setPolaroid(id,item.dayKey);removeOverlay();await load({silent:true,force:true});status('Polaroid des Tages gespeichert.','ready')};
    overlay.querySelector('[data-save]').onclick=async()=>{const button=overlay.querySelector('[data-save]');button.disabled=true;button.textContent='Wird fest gespeichert …';try{suppressRealtimeUntil=Date.now()+2200;const blob=await renderComposite(item,state),name=overlay.querySelector('[data-edit-name]')?.value||item.displayName||'';await mediaCommands().saveRenderedPreview(id,blob,{displayName:name,editSettings:state});urlCache.clear();window.dispatchEvent(new CustomEvent('luvia:media-view-refresh',{detail:{mediaId:id}}));removeOverlay();await load({silent:true,force:true});status('Foto wurde als feste bearbeitete Ansicht gespeichert.','ready')}catch(error){showError(error);button.disabled=false;button.textContent='Speichern'}};
    const close=()=>removeOverlay(); overlay.querySelector('[data-close]').onclick=close; overlay.onclick=e=>{if(e.target===overlay)close()};
  }

  async function openMemoryBridge(clusterId) {
    try {
      const proposal=await window.LuviaAIMemoryBridge.analyze(clusterId),overlay=document.createElement('div'); overlay.className='lv-photo-overlay';
      overlay.innerHTML=`<section class="lv-editor-dialog"><button data-close>×</button><span>✨ AI Memory Bridge</span><h2>${esc(proposal.title)}</h2><p>${esc(proposal.explanation)}</p><div class="lv-inline-empty"><b>Warum wurde dieser Moment erkannt?</b><ul>${(proposal.evidenceSummary?.facts||proposal.context?.summary?.facts||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div>${proposal.actions.map((action,index)=>`<label class="lv-memory-option"><input type="checkbox" data-memory-action="${index}" checked><span><b>${esc(action.label)}</b><small>${Math.round((action.confidence||0)*100)} % Sicherheit</small></span></label>`).join('')}<div class="lv-editor-actions"><button data-cancel>Abbrechen</button><button class="primary" data-confirm>Bestätigen & verknüpfen</button></div></section>`;
      const removeOverlay=mountOverlay(overlay,{name:'consumer.gallery.memory-bridge'}); const close=()=>removeOverlay(); overlay.querySelector('[data-close]').onclick=close; overlay.querySelector('[data-cancel]').onclick=close;
      overlay.querySelector('[data-confirm]').onclick=async()=>{const selected=proposal.actions.filter((_,i)=>overlay.querySelector(`[data-memory-action="${i}"]`)?.checked);await window.LuviaAIMemoryBridge.apply(proposal,{confirmed:true,selectedActions:selected});close();status('Erinnerung wurde bestätigt und verknüpft.','ready')};
    } catch(error) { showError(error); }
  }

  async function readData({analyze=false}={}) {
    const started=performance.now(); diagnosticsState.readDataCount++;
    items=await mediaReads().listMedia({type:'image'});
    const pendingMetadata=items.filter(item=>!item.captureEvidenceAvailable&&!item.metadataAutoChecked).slice(0,4);
    for(const candidate of pendingMetadata){try{const refreshed=await mediaCommands().reanalyze(candidate.id);items=items.map(x=>x.id===refreshed.id?refreshed:x)}catch{}}
    polaroids=await mediaReads().listPolaroids();
    if (analyze) {
      const clusterFingerprint=clusterInputFingerprint(items);
      if (clusterFingerprint === lastClusterInputFingerprint) {
        clusters=await window.LuviaMediaClustering.listPersisted();
        diag('cluster-sync-skipped',{reason:'unchanged-media-input'});
      } else {
        const generated=window.LuviaMediaClustering.generate(items);
        clusterSyncInProgress = true;
        muteClusterRealtimeUntil = Date.now() + 5000;
        diagnosticsState.clusterSyncCount++;
        diag('cluster-sync-start',{generated:generated.length});
        try {
          clusters=await window.LuviaMediaClustering.syncGenerated(generated);
          lastClusterInputFingerprint=clusterFingerprint;
        } catch (error) {
          console.warn('[LuviaGalleryView] Cluster-Synchronisierung übersprungen; Galerie bleibt aktuell.', error);
          clusters=await window.LuviaMediaClustering.listPersisted().catch(()=>[]);
        } finally {
          clusterSyncInProgress = false;
          muteClusterRealtimeUntil = Math.max(muteClusterRealtimeUntil, Date.now() + 2500);
          diag('cluster-sync-finish',{clusters:clusters.length});
        }
      }
    } else clusters=await window.LuviaMediaClustering.listPersisted();
    diagnosticsState.lastReadMs=Math.round(performance.now()-started);diag('read-data',{analyze,items:items.length,clusters:clusters.length,durationMs:diagnosticsState.lastReadMs});
  }
  async function renderAll({force=false}={}) {
    const started=performance.now(); diagnosticsState.renderAllCount++;
    const next=fingerprint(); if(!force && next===lastFingerprint)return; lastFingerprint=next;
    const countNode=host?.querySelector('[data-gallery-count]'); if(!countNode)return; countNode.textContent=`${items.length} Foto${items.length===1?'':'s'}`;
    await renderFavorites(); await renderClusters(); await renderDays();
    diagnosticsState.lastRenderMs=Math.round(performance.now()-started);diag('render-all',{force,durationMs:diagnosticsState.lastRenderMs});
  }
  async function load(options={}) {
    if(!host)return;
    if(busy){pending={...pending,...options};return}
    busy=true;
    const started=performance.now();diagnosticsState.loadCount++;diag('load-start',{reason:options.reason||'direct',analyze:Boolean(options.analyze),force:Boolean(options.force)});
    const silent=options.silent!==false;
    if(!silent)status('Galerie wird aktualisiert …');
    try {
      await readData({analyze:Boolean(options.analyze)});
      await renderAll({force:Boolean(options.force)});
      const activeClusterCount=clusters.filter(c=>c.state!=='dismissed'&&c.mediaIds?.length).length;
      status(`${items.length} Fotos · ${activeClusterCount} Fotomomente · Realtime aktiv`,'ready');
    }
    catch(error){showError(error)}
    finally {diagnosticsState.lastLoadMs=Math.round(performance.now()-started);diag('load-finish',{reason:options.reason||'direct',durationMs:diagnosticsState.lastLoadMs});busy=false; if(pending){const next=pending;pending=null;realtimeBatchStartedAt=0;scheduleLoad(next.reason||'Nachlauf',{...next,immediate:!next.realtime})}}
  }

  function clearGalleryDialog() {
    return new Promise(resolve=>{
      const overlay=document.createElement('div');overlay.className='lv-photo-overlay';
      overlay.innerHTML=`<section class="lv-editor-dialog lv-gallery-clear-dialog"><button data-close aria-label="Schließen">×</button><span>⚠️ Endgültig löschen</span><h2>Galerie vollständig leeren?</h2><p>Alle Fotos dieser Reise werden aus Galerie und Storage gelöscht. Fotomomente, Memory Albums sowie Foto- und Polaroid-Einträge der Timeline verschwinden ebenfalls.</p><div class="lv-gallery-clear-warning"><b>Dieser Vorgang kann nicht rückgängig gemacht werden.</b><small>Tippe <strong>GALERIE LEEREN</strong> ein, um fortzufahren.</small></div><label>Bestätigung<input data-clear-confirm autocomplete="off" placeholder="GALERIE LEEREN"></label><div class="lv-editor-actions"><button data-cancel>Abbrechen</button><button class="danger" data-confirm disabled>Alles endgültig löschen</button></div></section>`;
      let settled=false,remove=null;const finish=value=>{if(settled)return;settled=true;remove?.(value?'confirm':'reject');resolve(value)};remove=mountOverlay(overlay,{name:'consumer.gallery.clear',initialFocus:'[data-clear-confirm]',onClose:()=>{if(!settled){settled=true;resolve(false)}}});const input=overlay.querySelector('[data-clear-confirm]'),confirmButton=overlay.querySelector('[data-confirm]');
      overlay.querySelector('[data-close]').onclick=()=>finish(false);overlay.querySelector('[data-cancel]').onclick=()=>finish(false);overlay.onclick=e=>{if(e.target===overlay)finish(false)};
      input.oninput=()=>{confirmButton.disabled=input.value.trim().toUpperCase()!=='GALERIE LEEREN'};
      confirmButton.onclick=()=>finish(true);requestAnimationFrame(()=>input.focus());
    });
  }
  async function clearGallery() {
    if(!items.length){status('Die Galerie ist bereits leer.','ready');return}
    if(!(await clearGalleryDialog()))return;
    const button=host?.querySelector('[data-gallery-clear]');if(button)button.disabled=true;
    suppressRealtimeUntil=Date.now()+120000;clearTimeout(loadTimer);loadTimer=null;pending=null;
    status('Galerie wird vollständig geleert …');
    try{
      const result=await mediaCommands().clearGallery({onProgress:progress=>status(progress)});
      urlCache.clear();urlFailureCache.clear();items=[];clusters=[];polaroids={};lastFingerprint='';lastClusterInputFingerprint='';
      await renderAll({force:true});status('Galerie wurde vollständig geleert.','ready');
      window.dispatchEvent(new CustomEvent('luvia:gallery-cleared',{detail:result}));
      window.dispatchEvent(new CustomEvent('luvia:timeline-cloud-changed',{detail:{tripId:result.tripId}}));
      window.dispatchEvent(new CustomEvent('luvia:memory-album-updated',{detail:{tripId:result.tripId,cleared:true,local:true}}));
    }catch(error){showError(error)}finally{if(button)button.disabled=false;suppressRealtimeUntil=Date.now()+3000}
  }

  async function currentLocation() {
    const port=platformPort('LocationPort');
    if(!port?.isSupported?.())return null;
    try{return await port.getCurrent({accuracy:'high',timeoutMs:8000,maximumAgeMs:30000})}catch{return null}
  }
  async function upload(files,{camera=false}={}) {
    const list=[...files]; if(!list.length)return;
    let queued=0;
    suppressRealtimeUntil=Date.now()+Math.max(15000,list.length*5000);
    let location=window.LuviaPresenceVisitCore?.diagnostics?.()?.lastPosition||null;
    if(camera&&!location) location=await currentLocation();
    status(`${list.length} Foto${list.length===1?'':'s'} werden hochgeladen …`);
    for(let i=0;i<list.length;i++){
      status(`Upload ${i+1}/${list.length}: ${list[i].name||'Foto'}`);
      const result=await mediaCommands().upload(list[i],{source:camera?'app_camera':'user_upload',captureSource:camera?'app_camera':'file_picker',capturedAt:camera?new Date().toISOString():undefined,captureLocation:location,deviceMetadata:camera?platformPort('DevicePort')?.info?.()||null:null});
      if(result?.queued)queued++;
    }
    if(queued<list.length)await load({silent:false,analyze:true,force:true});
    if(queued)status(`${queued} Foto${queued===1?' wurde':'s wurden'} offline vorgemerkt und wird bei aktiver Verbindung hochgeladen.`,'ready');
    suppressRealtimeUntil=Date.now()+5000;
  }

  function mediaRealtime(payload) {
    diagnosticsState.mediaRealtimeCount++;
    lastMediaRealtimeAt=Date.now();
    const scope=payload?.scope||'';
    const event=payload?.eventType;
    diag('media-realtime',{scope,event});
    if(!['media','polaroids'].includes(scope))return;
    if(scope==='media' && event==='UPDATE'){
      const next=payload?.media||{},current=items.find(item=>String(item.id)===String(next.id));
      const meaningful=!current||['displayName','favorite','editSettings','status','capturedAt','dayKey','renderedPreviewAvailable','updatedAt'].some(key=>JSON.stringify(current[key]??null)!==JSON.stringify(next[key]??null));
      if(!meaningful){diag('media-realtime-ignored',{reason:'delivery-metadata-update'});return}
    }
    const next=payload?.media||{},current=items.find(item=>String(item.id)===String(next.id||payload?.mediaId));
    const analyze=scope==='media'&&(event==='INSERT'||event==='DELETE'||(event==='UPDATE'&&(!current||String(current.capturedAt||'')!==String(next.capturedAt||'')||String(current.dayKey||'')!==String(next.dayKey||'')||String(current.status||'')!==String(next.status||''))));
    scheduleLoad('Media Realtime',{realtime:true,silent:true,analyze,force:false});
  }
  function clusterRealtime(payload) {
    diagnosticsState.clusterRealtimeCount++;
    const muted = clusterSyncInProgress || Date.now() < muteClusterRealtimeUntil;
    diag('cluster-realtime',{table:payload?.table,event:payload?.eventType||payload?.event,muted});
    if (muted || (lastMediaRealtimeAt && Date.now()-lastMediaRealtimeAt < REALTIME_DEBOUNCE_MS+1200)) {
      diagnosticsState.ignoredClusterRealtimeCount++;
      diag('cluster-realtime-ignored',{reason:clusterSyncInProgress?'own-sync':muted?'grace-window':'covered-by-media-batch'});
      return;
    }
    scheduleLoad('Cluster Realtime',{realtime:true,silent:true,analyze:false,force:false});
  }

  async function mount(target) {
    if (host === target && target?.dataset?.luviaGalleryMounted === '1') {
      diag('mount-skipped',{reason:'already-mounted'});
      return ()=>unmount();
    }
    if (host) await unmount();
    diagnosticsState.mountCount++;diagnosticsState.mountedAt=new Date().toISOString();diag('mount',{mountCount:diagnosticsState.mountCount});
    host=target; host.dataset.luviaGalleryMounted='1'; host.innerHTML=shell();
    diagnosticsEnabled=diagnosticsEnabled||platformPort('OfflineCachePort')?.read('gallery.debug',false)===true;
    host.querySelector('[data-gallery-download]').onclick=async()=>{try{await downloadCollection(items.map(x=>x.id),galleryDownloadLabel())}catch(error){showError(error)}};
    host.querySelector('[data-gallery-clear]').onclick=()=>clearGallery();
    host.querySelector('[data-gallery-add]').onclick=async()=>{try{const files=await platformPort('MediaPickerPort')?.pickImages?.()||[];await upload(files)}catch(error){showError(error)}};
    host.querySelector('[data-gallery-capture]').onclick=async()=>{try{const file=await platformPort('MediaCapturePort')?.captureImage?.({facingMode:'environment'});if(file)await upload([file],{camera:true})}catch(error){showError(error)}};
    unsubMedia=await mediaReads().subscribe(mediaRealtime);
    unsubClusters=await window.LuviaMediaClustering.subscribe(clusterRealtime);
    const refresh=()=>scheduleLoad('Media-Ansicht aktualisiert',{immediate:true,force:true,analyze:false});window.addEventListener('luvia:media-composite-updated',refresh);window.addEventListener('luvia:media-view-refresh',refresh);window.addEventListener('luvia:media-deleted',refresh);host.__luviaMediaRefresh=refresh;await load({silent:false,analyze:true,force:true});
    return ()=>unmount();
  }
  async function unmount(){if(host?.__luviaMediaRefresh){window.removeEventListener('luvia:media-composite-updated',host.__luviaMediaRefresh);window.removeEventListener('luvia:media-view-refresh',host.__luviaMediaRefresh);window.removeEventListener('luvia:media-deleted',host.__luviaMediaRefresh)}clearTimeout(loadTimer);await unsubMedia?.();await unsubClusters?.();unsubMedia=unsubClusters=null;urlCache.clear();urlFailureCache.clear();if(host){delete host.dataset.luviaGalleryMounted;host.innerHTML=''}host=null;activeDay=null;lastFingerprint='';lastClusterInputFingerprint='';lastMediaRealtimeAt=0}

  window.LuviaGalleryDiagnostics=Object.freeze({version:VERSION,build:BUILD,snapshot:()=>JSON.parse(JSON.stringify({...diagnosticsState,enabled:diagnosticsEnabled,nativePorts:{picker:Boolean(platformPort('MediaPickerPort')),capture:Boolean(platformPort('MediaCapturePort')),location:Boolean(platformPort('LocationPort')),device:Boolean(platformPort('DevicePort')),sharing:Boolean(platformPort('SharingPort'))}})),reset:()=>{for(const key of Object.keys(diagnosticsState)){if(typeof diagnosticsState[key]==='number')diagnosticsState[key]=0;else if(key==='reasons')diagnosticsState[key]={}}diag('reset')},enable:()=>{diagnosticsEnabled=true;platformPort('OfflineCachePort')?.write('gallery.debug',true);console.info(DIAGNOSTICS_LABEL,'enabled')},disable:()=>{diagnosticsEnabled=false;platformPort('OfflineCachePort')?.remove('gallery.debug')},isEnabled:()=>diagnosticsEnabled});
  window.LuviaGalleryView=Object.freeze({version:VERSION,build:BUILD,mount,unmount,refresh:options=>load({silent:false,force:true,...options}),openPhoto:openLightbox,openEditor,renderVisual:(item,attrs='')=>photoVisual(item,attrs),hydrateVisuals:(root,list)=>hydrateImages(root,list),locationName,downloadPhoto:downloadPhotoAsset,downloadCollection,shareCollection,diagnostics:()=>window.LuviaGalleryDiagnostics.snapshot()});
})();

;

/* ===== app/albums-view.js ===== */
(() => {
'use strict';
const VERSION='4.32.0',BUILD='13.31.0';
let host=null,albums=[],journeys=[],unsub=null,unsubJourneys=null,urlCache=new Map();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const auth=()=>window.ParisAuth?.getState?.()?.user||{};
function mountMemoryOverlay(root,{name='consumer.memories',label='',initialFocus=null}={}){const ui=LuviaUI;if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');const mounted=ui.adopt(root,{name,kind:'dialog',closeSelector:'[data-close]',label,initialFocus});return{root:mounted.overlay,close:(reason='owner')=>mounted.close(reason)}}
const mediaContract=()=>window.LuviaMediaContractV1||window.LuviaMediaContract||null;
async function imageUrl(item){if(!item?.id)return'';if(urlCache.has(item.id))return urlCache.get(item.id);let url='';try{url=await mediaContract()?.reads?.signedUrl?.(item.id,3600)||''}catch{}urlCache.set(item.id,url);return url}
async function setImage(node,item,alt='Reisefoto'){if(!node||!item)return;const url=await imageUrl(item);if(!node.isConnected)return;node.innerHTML=url?`<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async">`:'<span class="lv-memory-empty-art">💛</span>'}
const moodIcon=m=>({'Romantisch':'💞','Abenteuer':'🧭','Familienzeit':'👨‍👩‍👧','Genuss':'🍝','Entdeckung':'✨','Alltagsmoment':'☕','Meilenstein':'🏆'}[m]||'💛');
function meta(album){const m=album.metadata||{};return[m.dateStart?fmt(m.dateStart):'',m.locationName||'',`${album.mediaIds?.length||0} Fotos`].filter(Boolean).join(' · ')}
function progress(album){const participants=album.metadata?.participantIds?.length||1,voices=new Set((album.contributions||[]).map(x=>String(x.user_id))).size;return Math.min(100,Math.round((voices/participants)*100))}
function card(album){const p=progress(album),preserved=album.status==='published';return`<article class="lv-memory-card" data-open="${esc(album.id)}"><div class="lv-memory-card-cover" data-cover="${esc(album.id)}"><span class="lv-memory-empty-art">💛</span><div class="lv-memory-card-glow"></div></div><div class="lv-memory-card-body"><small>${esc(meta(album))}</small><h2>${esc(album.title||'Unsere Erinnerung')}</h2><p>${esc(album.description||'Eine gemeinsame Reiseerinnerung wächst aus euren Perspektiven.')}</p><div class="lv-memory-tags"><span>✨ Memory Moment</span><span>${moodIcon(album.mood)} ${esc(album.mood||'Erinnerung')}</span><span>${preserved?'✓ Bewahrt':'✦ Wächst'}</span></div><div class="lv-memory-growth"><i style="width:${p}%"></i><span>${p>=100?'Alle Perspektiven verbunden':'Eure Erinnerung wächst'}</span></div></div></article>`}
async function renderLegacy(){if(!host)return;host.innerHTML='<section class="lv-memory-view"><div class="lv-memory-loading">Eure Erinnerungen werden geöffnet …</div></section>';albums=await window.LuviaMemoryAlbums.list();host.innerHTML=`<section class="lv-memory-view"><header class="lv-memory-hero"><div><span>💛 MEMORY JOURNEYS</span><h1>Reisen, die ihr noch einmal fühlen könnt</h1><p>Aus Fotos, Stimmen und kleinen Details entsteht eure gemeinsame Geschichte – Perspektive für Perspektive.</p></div><button class="lv-memory-primary" data-memory-create>✨ Moment wiedererleben</button></header><div class="lv-memory-promise"><b>Nicht nur, wo ihr wart.</b><span>Was es euch bedeutet hat.</span></div><div class="lv-memory-grid">${albums.length?albums.map(card).join(''):'<div class="lv-memory-empty"><b>💛</b><h2>Eine Erinnerung wartet auf euch</h2><p>Öffnet einen Memory Moment und erlebt ihn gemeinsam noch einmal – mit euren eigenen Blickwinkeln.</p><button class="lv-memory-primary" data-memory-create>Ersten Moment wiedererleben</button></div>'}</div></section>`;bind();for(const album of albums){const item=(await window.LuviaMemoryAlbums.mediaByIds([album.cover_media_id||album.mediaIds?.[0]]))[0];setImage(host.querySelector(`[data-cover="${CSS.escape(String(album.id))}"]`),item,album.title)}}
function bindLegacy(){host.querySelectorAll('[data-memory-create]').forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();openClusterPicker()});host.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openAlbum(c.dataset.open))}
async function openClusterPicker(){const clusters=await window.LuviaMemoryAlbums.listClusters(),existing=new Set(albums.map(a=>String(a.source_cluster_id)).filter(Boolean)),available=clusters.filter(c=>!existing.has(String(c.id))),o=document.createElement('div');o.className='lv-memory-overlay';o.innerHTML=`<section class="lv-memory-dialog lv-memory-picker"><button data-close>×</button><span class="lv-memory-kicker">✦ Der Anfang eurer Zeitreise</span><h2>Welchen Moment möchtet ihr wieder öffnen?</h2><p>Wählt keinen Datensatz. Wählt den Moment, der euch gerade zurückruft.</p><div class="lv-memory-cluster-list">${available.length?available.map(c=>`<button data-cluster="${esc(c.id)}"><b>${esc(c.title||'Ein gemeinsamer Fotomoment')}</b><small>${c.mediaIds.length} Fotos · wartet auf eure Geschichte</small><em>Wiedererleben →</em></button>`).join(''):'<div class="lv-memory-empty compact"><p>Alle vorhandenen Memory Moments wurden bereits geöffnet oder es gibt noch keine Memory Moments.</p><button data-gallery>Fotogalerie öffnen</button></div>'}</div></section>`;const mounted=mountMemoryOverlay(o,{name:'consumer.memories.cluster-picker',initialFocus:'[data-close]'}),close=()=>mounted.close();o.querySelector('[data-close]').onclick=close;o.onclick=e=>{if(e.target===o)close()};o.querySelector('[data-gallery]')?.addEventListener('click',()=>{close();window.LuviaApp.show('gallery')});o.querySelectorAll('[data-cluster]').forEach(b=>b.onclick=()=>{const c=available.find(x=>String(x.id)===String(b.dataset.cluster));close();startJourney(c)})}
const moods=[['💞','Romantisch'],['🧭','Abenteuer'],['👨‍👩‍👧','Familienzeit'],['🍝','Genuss'],['✨','Entdeckung'],['☕','Alltagsmoment'],['🏆','Meilenstein']];
const questions=[['first-thought','Was war dein allererster Gedanke in diesem Moment?'],['hidden-detail','Welches kleine Detail möchtest du niemals vergessen?'],['off-camera','Was ist auf den Bildern nicht zu sehen?'],['funny-truth','Worüber musstest du hier lachen?'],['tell-later','Was würdest du später über diesen Moment erzählen?'],['typical-us','Was war daran ganz typisch für euch?']];
function titleIdeas(state,location){const who=(state.memberNames||[]).slice(0,3).join(', '),place=location||'diesem Ort',m=state.mood||'Moment';const pools=[`Kurz mal mitten im schönsten Moment`,`Vier Bilder, ein ganzes ${place}-Gefühl`,`Hier waren wir einfach wir`,`Zwischen ${place}, Lachen und uns`,`Plan war anders. Erinnerung wurde besser.`,`Das bleibt zwischen uns – und in Luvia`,`Ein bisschen Chaos, ganz viel ${m}`,`${place} hatte keine Chance gegen uns`,`Genau hier wurde aus Zeit Erinnerung`,who?`${who} und dieser eine Moment`:null,`Was auf den Bildern fehlt, wissen nur wir`,`Noch einmal dorthin, bitte`,`Der Moment, der länger blieb als geplant`,`So fühlt sich ${m.toLowerCase()} an`].filter(Boolean);return pools.sort(()=>Math.random()-.5).slice(0,6)}
async function startJourney(cluster,existing=null){const media=await window.LuviaMemoryAlbums.mediaByIds(existing?.mediaIds||cluster.mediaIds),dates=media.map(x=>x.capturedAt).filter(Boolean).sort(),location=media.map(x=>x.metadata?.resolvedLocation?.name||x.metadata?.resolvedLocation?.address).find(Boolean)||'',members=await window.LuviaMemoryAlbums.listMembers(),me=auth();const current=existing||null;const myContribution=current?.contributions?.find(x=>String(x.user_id)===String(me.id));const state={chapter:0,id:current?.id||null,clusterId:cluster?.id||current?.source_cluster_id,title:current?.title||cluster?.title||'Unsere Erinnerung',mood:current?.mood||'',mediaIds:[...(current?.mediaIds||cluster.mediaIds)],coverMediaId:current?.cover_media_id||media[0]?.id||null,favoriteMediaId:(current?.favorites||[]).find(f=>String(f.user_id)===String(me.id))?.media_id||null,description:current?.description||'',participantIds:current?.metadata?.participantIds||members.map(x=>x.id),locationName:current?.metadata?.locationName||location,dateStart:current?.metadata?.dateStart||dates[0]||'',dateEnd:current?.metadata?.dateEnd||dates.at(-1)||dates[0]||'',members,memberNames:members.map(x=>x.displayName),promptKey:myContribution?.prompt_key||questions[Math.floor(Math.random()*questions.length)][0],answerText:myContribution?.answer_text||'',reaction:myContribution?.reaction||'',status:current?.status||'draft'};const o=document.createElement('div');o.className='lv-memory-overlay';const mounted=mountMemoryOverlay(o,{name:'consumer.memories.moment-journey',label:'Memory Moment'}),close=()=>mounted.close();function shell(content,theme=''){o.innerHTML=`<section class="lv-memory-dialog lv-memory-journey ${theme}"><button data-close>×</button><div class="lv-memory-chapters">${['Erwachen','Wiedersehen','Perspektive','Name','Herzbild','Geschichte','Bewahren'].map((x,i)=>`<i class="${i<=state.chapter?'on':''}" title="${x}"></i>`).join('')}</div>${content}</section>`;o.querySelector('[data-close]').onclick=close;o.onclick=e=>{if(e.target===o)close()}}
async function persist(status=state.status){const saved=await window.LuviaMemoryAlbums.save({id:state.id,clusterId:state.clusterId,title:state.title,mood:state.mood,mediaIds:state.mediaIds,coverMediaId:state.coverMediaId,favoriteMediaId:state.favoriteMediaId,description:state.description,status,metadata:{participantIds:state.participantIds,locationName:state.locationName,dateStart:state.dateStart,dateEnd:state.dateEnd,chapter:state.chapter}});state.id=saved.id;state.status=status;return saved}
async function paint(){if(state.chapter===0)return awaken();if(state.chapter===1)return replay();if(state.chapter===2)return perspective();if(state.chapter===3)return naming();if(state.chapter===4)return heartImage();if(state.chapter===5)return weave();return preserve()}
async function awaken(){shell(`<div class="lv-memory-cinematic"><div class="lv-memory-awaken-image" data-awake></div><div class="lv-memory-awaken-copy"><span>${fmt(state.dateStart)}${state.locationName?` · ${esc(state.locationName)}`:''}</span><h2>Erinnert ihr euch?</h2><p>${media.length} Fotos entstanden nah beieinander. Vielleicht war es nur ein kurzer Augenblick. Vielleicht genau der, der geblieben ist.</p><button class="lv-memory-primary" data-next>Moment wiedererleben</button></div></div>`,'is-cinematic');setImage(o.querySelector('[data-awake]'),media[0],state.title);o.querySelector('[data-next]').onclick=()=>{state.chapter=1;paint()}}
async function replay(){shell(`<span class="lv-memory-kicker">Kapitel 2 · Der Moment erwacht</span><h2>Schaut noch einmal hin</h2><p>Keine Bearbeitung. Kein Formular. Nur ein kurzer Weg zurück.</p><div class="lv-memory-replay">${media.map((x,i)=>`<figure data-replay="${esc(x.id)}" style="--delay:${i*.45}s"><span data-img="${esc(x.id)}"></span><figcaption>${i===0?'Das erste Bild':i===media.length-1?'Und dann dieses Bild':'Wenige Augenblicke später …'}</figcaption></figure>`).join('')}</div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Was ist euch geblieben?</button></div>`,'is-replay');for(const x of media)setImage(o.querySelector(`[data-img="${CSS.escape(String(x.id))}"]`),x);o.querySelector('[data-back]').onclick=()=>{state.chapter=0;paint()};o.querySelector('[data-next]').onclick=async()=>{await persist('draft');state.chapter=2;paint()}}
function perspective(){const q=questions.find(x=>x[0]===state.promptKey)||questions[0];shell(`<span class="lv-memory-kicker">Kapitel 3 · Eure Perspektiven</span><h2>Dein Blick fehlt noch</h2><p>Alle erleben dieselbe Reise anders. Genau daraus wird eure gemeinsame Geschichte.</p><div class="lv-memory-voice-card"><small>${esc(me.user_metadata?.display_name||me.email||'Deine Perspektive')}</small><h3>${esc(q[1])}</h3><textarea data-answer placeholder="Ein Satz reicht. Ein Insider auch. Oder etwas, das nur du bemerkt hast.">${esc(state.answerText)}</textarea><div class="lv-memory-reactions">${['💛','😂','🥹','✨','🤍','🤯'].map(r=>`<button data-reaction="${r}" class="${state.reaction===r?'on':''}">${r}</button>`).join('')}</div><button data-new-question>Andere Frage</button></div><div class="lv-memory-community"><b>Eure Erinnerung wächst</b><div>${state.members.map(m=>`<span class="${current?.contributions?.some(c=>String(c.user_id)===String(m.id))||String(m.id)===String(me.id)&&state.answerText?'on':''}">${esc(m.displayName)}</span>`).join('')}</div></div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Meinen Blick beitragen</button></div>`);o.querySelector('[data-answer]').oninput=e=>state.answerText=e.target.value;o.querySelectorAll('[data-reaction]').forEach(b=>b.onclick=()=>{state.reaction=b.dataset.reaction;o.querySelectorAll('[data-reaction]').forEach(x=>x.classList.toggle('on',x===b))});o.querySelector('[data-new-question]').onclick=()=>{const choices=questions.filter(x=>x[0]!==state.promptKey);state.promptKey=choices[Math.floor(Math.random()*choices.length)][0];paint()};o.querySelector('[data-back]').onclick=()=>{state.chapter=1;paint()};o.querySelector('[data-next]').onclick=async()=>{if(!state.answerText.trim()&&!state.reaction)return;await persist('draft');await window.LuviaMemoryAlbums.saveContribution(state.id,{promptKey:state.promptKey,promptText:q[1],answerText:state.answerText,reaction:state.reaction});state.chapter=3;paint()}}
function naming(){const ideas=titleIdeas(state,state.locationName);shell(`<span class="lv-memory-kicker">Kapitel 4 · Wie soll dieser Moment heißen?</span><h2>Ein Name, der nach euch klingt</h2><p>Verspielt, frech, warm oder ganz schlicht. Nicht perfekt – persönlich.</p><div class="lv-memory-title-cards">${ideas.map((t,i)=>`<button data-title="${esc(t)}" class="tone-${i%3}">${esc(t)}</button>`).join('')}</div><button class="lv-memory-shuffle" data-shuffle>↻ Neue Vorschläge</button><label>Oder euer eigener Titel<input data-title-input value="${esc(state.title)}"></label><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Dieser Name bleibt</button></div>`);o.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{state.title=b.dataset.title;o.querySelector('[data-title-input]').value=state.title});o.querySelector('[data-title-input]').oninput=e=>state.title=e.target.value;o.querySelector('[data-shuffle]').onclick=paint;o.querySelector('[data-back]').onclick=()=>{state.chapter=2;paint()};o.querySelector('[data-next]').onclick=async()=>{if(!state.title.trim())return;await persist('draft');state.chapter=4;paint()}}
async function heartImage(){shell(`<span class="lv-memory-kicker">Kapitel 5 · Das Herzbild</span><h2>Welches Bild bringt euch sofort zurück?</h2><p>Wählt nicht das technisch beste. Wählt das, das etwas in euch auslöst.</p><div class="lv-memory-photo-picker">${media.map(x=>`<button data-pick="${esc(x.id)}" class="${state.mediaIds.includes(x.id)?'on':''}"><span data-img="${esc(x.id)}">📷</span><i data-cover="${esc(x.id)}" class="${String(state.coverMediaId)===String(x.id)?'on':''}">Herzbild</i><em data-favorite="${esc(x.id)}" class="${String(state.favoriteMediaId)===String(x.id)?'on':''}">♥</em></button>`).join('')}</div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Mit diesem Bild weiter</button></div>`);for(const x of media)setImage(o.querySelector(`[data-img="${CSS.escape(String(x.id))}"]`),x);o.querySelectorAll('[data-cover]').forEach(i=>i.onclick=e=>{e.stopPropagation();state.coverMediaId=i.dataset.cover;paint()});o.querySelectorAll('[data-favorite]').forEach(i=>i.onclick=e=>{e.stopPropagation();state.favoriteMediaId=i.dataset.favorite;paint()});o.querySelectorAll('[data-pick]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-cover],[data-favorite]'))return;const id=b.dataset.pick;if(state.mediaIds.includes(id)){if(state.mediaIds.length===1)return;state.mediaIds=state.mediaIds.filter(x=>x!==id)}else state.mediaIds.push(id);b.classList.toggle('on',state.mediaIds.includes(id))});o.querySelector('[data-back]').onclick=()=>{state.chapter=3;paint()};o.querySelector('[data-next]').onclick=async()=>{await persist('draft');state.chapter=5;paint()}}
async function weave(){const fresh=await window.LuviaMemoryAlbums.getByCluster(state.clusterId),voices=fresh?.contributions||[];const voiceText=voices.map(v=>`${v.reaction||''} ${v.answer_text||''}`.trim()).filter(Boolean);const suggested=[`An ${state.locationName||'diesem Ort'} entstand mehr als nur eine kleine Reihe von Fotos. ${voiceText.join(' ')} Genau deshalb ist dieser Moment geblieben.`,`Eigentlich dauerte dieser Augenblick nur kurz. In euren Erinnerungen wurde er größer: ${voiceText.join(' ')} Ein Moment, viele Blicke – und eine gemeinsame Geschichte.`][voiceText.length>1?1:0];state.description=state.description||suggested;shell(`<span class="lv-memory-kicker">Kapitel 6 · Eure Geschichte</span><h2>Aus vielen Blicken wird ein Wir</h2><p>Luvia verbindet nur das, was ihr beigetragen habt. Nichts wird erfunden.</p><div class="lv-memory-voices">${voices.length?voices.map(v=>`<blockquote><b>${esc(v.reaction||'💛')}</b><p>${esc(v.answer_text||'')}</p></blockquote>`).join(''):'<blockquote><p>Deine Perspektive ist der erste Baustein. Weitere Reisende können später ergänzen.</p></blockquote>'}</div><label>Eure gemeinsame Erzählung<textarea data-story>${esc(state.description)}</textarea></label><div class="lv-memory-tone-buttons"><button data-tone="short">Kürzer</button><button data-tone="warm">Wärmer</button><button data-tone="funny">Frecher</button><button data-tone="we">Mehr wie wir</button></div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Unsere Geschichte bewahren</button></div>`);o.querySelector('[data-story]').oninput=e=>state.description=e.target.value;o.querySelectorAll('[data-tone]').forEach(b=>b.onclick=()=>{const base=state.description.replace(/\s+/g,' ').trim();if(b.dataset.tone==='short')state.description=base.split('. ').slice(0,2).join('. ');if(b.dataset.tone==='warm')state.description=`Manche Momente fühlen sich schon beim Erinnern wieder warm an. ${base}`;if(b.dataset.tone==='funny')state.description=`Der Plan? Vermutlich ein anderer. Das Ergebnis? Zum Glück genau dieses. ${base}`;if(b.dataset.tone==='we')state.description=`So waren wir in diesem Moment: ${base}`;paint()});o.querySelector('[data-back]').onclick=()=>{state.chapter=4;paint()};o.querySelector('[data-next]').onclick=async()=>{await persist('draft');state.chapter=6;paint()}}
async function preserve(){const cover=media.find(x=>String(x.id)===String(state.coverMediaId))||media[0];shell(`<div class="lv-memory-final"><div class="lv-memory-final-cover" data-final-cover></div><div><span class="lv-memory-kicker">Kapitel 7 · Bewahren</span><h2>${esc(state.title)}</h2><p>${esc(state.description)}</p><div class="lv-memory-final-meta">${esc(meta({metadata:{dateStart:state.dateStart,locationName:state.locationName},mediaIds:state.mediaIds}))}</div><h3>Ist das eure Erinnerung?</h3><button class="lv-memory-primary" data-preserve>💛 So möchte ich mich daran erinnern</button><button data-back>Noch einmal zurück</button></div></div>`,'is-final');setImage(o.querySelector('[data-final-cover]'),cover,state.title);o.querySelector('[data-back]').onclick=()=>{state.chapter=5;paint()};o.querySelector('[data-preserve]').onclick=async()=>{await persist('published');o.innerHTML=`<section class="lv-memory-dialog"><div class="lv-memory-success"><b>💛</b><h2>Diese Erinnerung ist jetzt bewahrt</h2><p>Sie darf weiter wachsen, wenn andere Reisende ihren Blick ergänzen.</p><button class="lv-memory-primary" data-done>Zu euren Erinnerungen</button></div></section>`;o.querySelector('[data-done]').onclick=()=>{close();renderWorld()}}}
paint()}
async function openAlbum(id){const album=albums.find(x=>String(x.id)===String(id));if(!album)return;const cluster={id:album.source_cluster_id,mediaIds:album.mediaIds,title:album.title};startJourney(cluster,album)}
function journeyCard(j){const chapters=j.chapters?.length||0,voices=new Set((j.contributions||[]).map(x=>String(x.user_id))).size;return`<article class="lv-memory-card lv-journey-card" data-journey-open="${esc(j.id)}"><div class="lv-memory-card-cover" data-journey-cover="${esc(j.id)}"><span class="lv-memory-empty-art">🗺️</span><div class="lv-memory-card-glow"></div><b class="lv-memory-type-badge">EURE REISE</b></div><div class="lv-memory-card-body"><small>${chapters} Kapitel · ${voices} Perspektiven</small><h2>${esc(j.title||'Unsere Reisegeschichte')}</h2><p>${esc(j.description||'Eine ganze Reise wird aus Tagen, Momenten und euren Blickwinkeln neu erzählt.')}</p><div class="lv-memory-tags"><span>🗺️ Memory Journey</span><span>${j.status==='published'?'✓ Bewahrt':'✦ Wächst'}</span></div></div></article>`}
async function renderWorld(){if(!host)return;host.innerHTML='<section class="lv-memory-view"><div class="lv-memory-loading">Eure Erinnerungen werden geöffnet …</div></section>';[albums,journeys]=await Promise.all([window.LuviaMemoryAlbums.list(),window.LuviaMemoryJourneys?.list?.()||[]]);host.innerHTML=`<section class="lv-memory-view"><header class="lv-memory-hero"><div><span>💛 MEMORY WORLDS</span><h1>Reisen, die ihr noch einmal fühlen könnt</h1><p>Bewahrt einzelne Augenblicke als Memory Moments – und verbindet eure ganze Reise zu einer gemeinsamen Memory Journey.</p></div><button class="lv-memory-primary" data-memory-create>✨ Etwas wiedererleben</button></header><div class="lv-memory-promise"><b>Nicht nur, wo ihr wart.</b><span>Was es euch bedeutet hat.</span></div><section class="lv-memory-library-section"><div class="lv-memory-library-head"><span>🗺️ DIE GANZE REISE</span><h2>Memory Journeys</h2><p>Reisetage, Fotomomente, Lieblingsbilder und die Perspektiven aller Reisenden werden zu Kapiteln einer gemeinsamen Geschichte.</p></div><div class="lv-memory-grid">${journeys.length?journeys.map(journeyCard).join(''):'<div class="lv-memory-empty compact"><b>🗺️</b><h2>Eure Reise wartet auf ihre Geschichte</h2><p>Luvia schlägt aus allen Tagen und Momenten eine erste Kapitelreise vor.</p><button class="lv-memory-primary" data-create-journey>Ganze Reise wiedererleben</button></div>'}</div></section><section class="lv-memory-library-section"><div class="lv-memory-library-head"><span>✨ EINZELNE AUGENBLICKE</span><h2>Memory Moments</h2><p>Ein automatisch erkannter Fotomoment wird zu einer kleinen, liebevoll erzählten Erinnerung.</p></div><div class="lv-memory-grid">${albums.length?albums.map(card).join(''):'<div class="lv-memory-empty compact"><b>💛</b><h2>Ein Moment wartet auf euch</h2><p>Öffnet einen Memory Moment und erlebt ihn aus euren unterschiedlichen Blickwinkeln.</p><button class="lv-memory-primary" data-create-moment>Memory Moment öffnen</button></div>'}</div></section></section>`;bindWorld();for(const album of albums){const item=(await window.LuviaMemoryAlbums.mediaByIds([album.cover_media_id||album.mediaIds?.[0]]))[0];setImage(host.querySelector(`[data-cover="${CSS.escape(String(album.id))}"]`),item,album.title)}for(const journey of journeys){const item=(await window.LuviaMemoryAlbums.mediaByIds([journey.cover_media_id].filter(Boolean)))[0];setImage(host.querySelector(`[data-journey-cover="${CSS.escape(String(journey.id))}"]`),item,journey.title)}}
function bindWorld(){host.querySelectorAll('[data-memory-create]').forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();openExperiencePicker()});host.querySelectorAll('[data-create-moment]').forEach(button=>button.onclick=openClusterPicker);host.querySelectorAll('[data-create-journey]').forEach(button=>button.onclick=()=>startFullJourney());host.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openAlbum(c.dataset.open));host.querySelectorAll('[data-journey-open]').forEach(c=>c.onclick=()=>startFullJourney(c.dataset.journeyOpen))}
function openExperiencePicker(){const o=document.createElement('div');o.className='lv-memory-overlay';o.innerHTML=`<section class="lv-memory-dialog lv-experience-picker"><button data-close>×</button><span class="lv-memory-kicker">Was möchtet ihr wiedererleben?</span><h2>Zwei Wege zurück</h2><p>Ein einzelner Augenblick oder die ganze Reise – beides darf seine eigene Geschichte bekommen.</p><div class="lv-memory-choice-grid"><button data-choice="moment"><b>✨ Memory Moment</b><strong>Einen Augenblick bewahren</strong><span>Aus einem Fotomoment wird eine kleine gemeinsame Geschichte.</span><em>Moment öffnen →</em></button><button data-choice="journey"><b>🗺️ Memory Journey</b><strong>Die ganze Reise wiedererleben</strong><span>Alle Tage, Momente, Lieblingsbilder und Perspektiven werden zu Kapiteln.</span><em>Reise beginnen →</em></button></div></section>`;const mounted=mountMemoryOverlay(o,{name:'consumer.memories.experience-picker',initialFocus:'[data-close]'}),close=()=>mounted.close();o.querySelector('[data-close]').onclick=close;o.onclick=e=>{if(e.target===o)close()};o.querySelector('[data-choice="moment"]').onclick=()=>{close();openClusterPicker()};o.querySelector('[data-choice="journey"]').onclick=()=>{close();startFullJourney()}}
function journeyTitleIdeas(source){const days=source.days?.length||0,photos=source.media?.length||0;return[`Unsere Reise, noch einmal`,`Zwischen Ankommen und Nicht-mehr-wegwollen`,`Was von dieser Reise bleibt`,`${days} Tage, ${photos} Bilder und wir`,`Die Reise, die länger blieb`,`Einmal zurück zu uns`,`Von kleinen Wegen und großen Erinnerungen`,`Nicht nur dort gewesen`,`Unser Weg durch diese Tage`,`Die schönsten Umwege waren unsere`].sort(()=>Math.random()-.5).slice(0,6)}
function journeyQuestion(){const q=[['afterglow','Was ist das Erste, das dir geblieben ist?'],['surprise','Welcher Moment hat dich selbst überrascht?'],['together','Wann habt ihr euch auf dieser Reise besonders nah gefühlt?'],['repeat','Was würdest du sofort noch einmal genauso erleben?'],['untold','Welche Geschichte erzählen die Fotos noch nicht?']];return q[Math.floor(Math.random()*q.length)]}
async function startFullJourney(id=null){const existing=id?await window.LuviaMemoryJourneys.get(id):null,source=await window.LuviaMemoryJourneys.source(),members=await window.LuviaMemoryAlbums.listMembers(),q=journeyQuestion();if(!source.media.length&&!existing)return;const key=m=>m.dayKey||m.day_key||String(m.capturedAt||m.createdAt||'').slice(0,10)||'undatiert';const grouped=source.days.map((dayKey,index)=>{const media=source.media.filter(x=>key(x)===dayKey),clusters=source.clusters.filter(c=>c.mediaIds.some(id=>media.some(m=>String(m.id)===String(id))));return{dayKey,title:index===0?'Ankommen':`Reisetag ${index+1}`,summary:'',coverMediaId:media[0]?.id||null,media,clusters}});const state={step:0,id:existing?.id||null,title:existing?.title||'Unsere Reise, noch einmal',description:existing?.description||'',coverMediaId:existing?.cover_media_id||source.media[0]?.id||null,chapters:grouped,answer:'',reaction:'',promptKey:q[0],promptText:q[1],status:existing?.status||'draft'};const o=document.createElement('div');o.className='lv-memory-overlay';const mounted=mountMemoryOverlay(o,{name:'consumer.memories.full-journey',label:'Memory Journey'}),close=()=>mounted.close();function shell(content,theme=''){o.innerHTML=`<section class="lv-memory-dialog lv-memory-journey lv-full-journey ${theme}"><button data-close>×</button><div class="lv-memory-chapters">${['Rückkehr','Tage','Momente','Perspektiven','Name','Geschichte','Bewahren'].map((x,i)=>`<i class="${i<=state.step?'on':''}" title="${x}"></i>`).join('')}</div>${content}</section>`;o.querySelector('[data-close]').onclick=close;o.onclick=e=>{if(e.target===o)close()}}
async function save(status=state.status){const items=[];state.chapters.forEach((c,ci)=>{c.clusters.forEach((cl,i)=>items.push({chapterPosition:ci,position:i,itemType:'cluster',clusterId:cl.id,dayKey:c.dayKey,metadata:{title:cl.title}}));const used=new Set(c.clusters.flatMap(x=>x.mediaIds.map(String)));c.media.filter(m=>!used.has(String(m.id))).forEach((m,i)=>items.push({chapterPosition:ci,position:c.clusters.length+i,itemType:'media',mediaId:m.id,dayKey:c.dayKey}))});const r=await window.LuviaMemoryJourneys.save({id:state.id,title:state.title,description:state.description,coverMediaId:state.coverMediaId,status,chapters:state.chapters.map(c=>({title:c.title,dayKey:c.dayKey,summary:c.summary,coverMediaId:c.coverMediaId,metadata:{photoCount:c.media.length,clusterCount:c.clusters.length}})),items,metadata:{participantIds:members.map(x=>x.id),dayCount:state.chapters.length,photoCount:source.media.length}});state.id=r.id;state.status=status}
async function paint(){if(state.step===0)return intro();if(state.step===1)return days();if(state.step===2)return moments();if(state.step===3)return perspectives();if(state.step===4)return naming();if(state.step===5)return story();return preserve()}
async function intro(){shell(`<div class="lv-memory-cinematic"><div class="lv-memory-awaken-image" data-awake></div><div class="lv-memory-awaken-copy"><span>${state.chapters.length} Reisetage · ${source.media.length} Fotos · ${source.clusters.length} Memory Moments</span><h2>Seid ihr bereit, noch einmal loszufahren?</h2><p>Luvia öffnet eure Reise als Weg: Tag für Tag, Moment für Moment, Perspektive für Perspektive.</p><button class="lv-memory-primary" data-next>Unsere Reise wiedererleben</button></div></div>`,'is-cinematic');setImage(o.querySelector('[data-awake]'),source.media[0],state.title);o.querySelector('[data-next]').onclick=()=>{state.step=1;paint()}}
async function days(){shell(`<span class="lv-memory-kicker">Kapitel 2 · Eure Reisetage</span><h2>Jeder Tag bekommt einen eigenen Rhythmus</h2><p>Luvia hat aus euren Fotos erste Kapitel gebaut. Ihr gebt ihnen die Namen, die zu euch passen.</p><div class="lv-journey-day-list">${state.chapters.map((c,i)=>`<article><div data-cover="${i}"></div><label><small>${fmt(c.dayKey)}</small><input data-title="${i}" value="${esc(c.title)}"><textarea data-summary="${i}" placeholder="Was war das Gefühl dieses Tages?">${esc(c.summary)}</textarea></label><span>${c.media.length} Fotos · ${c.clusters.length} Memory Moments</span></article>`).join('')}</div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Durch die Momente gehen</button></div>`);for(let i=0;i<state.chapters.length;i++)setImage(o.querySelector(`[data-cover="${i}"]`),state.chapters[i].media[0]);o.querySelectorAll('[data-title]').forEach(x=>x.oninput=e=>state.chapters[+x.dataset.title].title=e.target.value);o.querySelectorAll('[data-summary]').forEach(x=>x.oninput=e=>state.chapters[+x.dataset.summary].summary=e.target.value);o.querySelector('[data-back]').onclick=()=>{state.step=0;paint()};o.querySelector('[data-next]').onclick=async()=>{await save('draft');state.step=2;paint()}}
function moments(){shell(`<span class="lv-memory-kicker">Kapitel 3 · Die Reise erwacht</span><h2>Aus Clustern werden Memory Moments</h2><p>Memory Moments sind einzelne Szenen. Die Memory Journey verbindet sie zur ganzen Reise.</p><div class="lv-journey-moment-stream">${state.chapters.map(c=>`<section><h3>${esc(c.title)}</h3><div>${c.clusters.length?c.clusters.map(cl=>`<article><b>${esc(cl.title||'Gemeinsamer Moment')}</b><span>${cl.mediaIds.length} Fotos</span><em>Memory Moment</em></article>`).join(''):`<article class="empty"><b>Die kleinen Zwischenräume</b><span>${c.media.length} einzelne Fotos erzählen diesen Tag.</span></article>`}</div></section>`).join('')}</div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Unsere Blicke hinzufügen</button></div>`);o.querySelector('[data-back]').onclick=()=>{state.step=1;paint()};o.querySelector('[data-next]').onclick=()=>{state.step=3;paint()}}
function perspectives(){shell(`<span class="lv-memory-kicker">Kapitel 4 · Alle erleben anders</span><h2>Dein Blick auf die ganze Reise</h2><p>Die anderen Reisenden können später ihre eigene Perspektive ergänzen.</p><div class="lv-memory-voice-card"><h3>${esc(state.promptText)}</h3><textarea data-answer>${esc(state.answer)}</textarea><div class="lv-memory-reactions">${['💛','😂','🥹','✨','🤍','🤯'].map(r=>`<button data-reaction="${r}" class="${state.reaction===r?'on':''}">${r}</button>`).join('')}</div></div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Meinen Blick beitragen</button></div>`);o.querySelector('[data-answer]').oninput=e=>state.answer=e.target.value;o.querySelectorAll('[data-reaction]').forEach(b=>b.onclick=()=>{state.reaction=b.dataset.reaction;paint()});o.querySelector('[data-back]').onclick=()=>{state.step=2;paint()};o.querySelector('[data-next]').onclick=async()=>{await save('draft');if(state.answer.trim()||state.reaction)await window.LuviaMemoryJourneys.saveContribution(state.id,{promptKey:state.promptKey,promptText:state.promptText,answerText:state.answer,reaction:state.reaction});state.step=4;paint()}}
function naming(){const ideas=journeyTitleIdeas(source);shell(`<span class="lv-memory-kicker">Kapitel 5 · Der Name eurer Reise</span><h2>Wie soll sie später zu euch zurückkommen?</h2><div class="lv-memory-title-cards">${ideas.map((t,i)=>`<button data-title="${esc(t)}" class="tone-${i%3}">${esc(t)}</button>`).join('')}</div><button class="lv-memory-shuffle" data-shuffle>↻ Neue Vorschläge</button><label>Euer eigener Titel<input data-title-input value="${esc(state.title)}"></label><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Dieser Titel bleibt</button></div>`);o.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{state.title=b.dataset.title;o.querySelector('[data-title-input]').value=state.title});o.querySelector('[data-title-input]').oninput=e=>state.title=e.target.value;o.querySelector('[data-shuffle]').onclick=paint;o.querySelector('[data-back]').onclick=()=>{state.step=3;paint()};o.querySelector('[data-next]').onclick=async()=>{await save('draft');state.step=5;paint()}}
async function story(){const fresh=state.id?await window.LuviaMemoryJourneys.get(state.id):null,voices=fresh?.contributions||[],chapterText=state.chapters.map(c=>`${c.title}${c.summary?`: ${c.summary}`:''}`).join('. '),voiceText=voices.map(v=>`${v.reaction||''} ${v.answer_text||''}`.trim()).filter(Boolean).join(' ');state.description=state.description||`${chapterText}. ${voiceText} Diese Reise bestand nicht nur aus Orten, sondern aus all den kleinen Blicken, die ihr miteinander geteilt habt.`;shell(`<span class="lv-memory-kicker">Kapitel 6 · Eure gemeinsame Geschichte</span><h2>Aus Tagen wird eine Reise. Aus Blicken wird ein Wir.</h2><div class="lv-memory-voices">${voices.length?voices.map(v=>`<blockquote><b>${esc(v.reaction||'💛')}</b><p>${esc(v.answer_text||'')}</p></blockquote>`).join(''):'<blockquote><p>Deine Perspektive ist der Anfang.</p></blockquote>'}</div><label>Eure Reiseerzählung<textarea data-story>${esc(state.description)}</textarea></label><div class="lv-memory-tone-buttons"><button data-tone="short">Kürzer</button><button data-tone="warm">Wärmer</button><button data-tone="funny">Frecher</button><button data-tone="we">Mehr wie wir</button></div><div class="lv-memory-actions"><button data-back>Zurück</button><button class="lv-memory-primary" data-next>Die Reise bewahren</button></div>`);o.querySelector('[data-story]').oninput=e=>state.description=e.target.value;o.querySelectorAll('[data-tone]').forEach(b=>b.onclick=()=>{const base=state.description.replace(/\s+/g,' ').trim();if(b.dataset.tone==='short')state.description=base.split('. ').slice(0,3).join('. ');if(b.dataset.tone==='warm')state.description=`Schon beim Zurückdenken fühlt sich diese Reise wieder warm an. ${base}`;if(b.dataset.tone==='funny')state.description=`Der Plan war gut. Die Umwege waren besser. ${base}`;if(b.dataset.tone==='we')state.description=`So waren wir auf dieser Reise: ${base}`;paint()});o.querySelector('[data-back]').onclick=()=>{state.step=4;paint()};o.querySelector('[data-next]').onclick=async()=>{await save('draft');state.step=6;paint()}}
async function preserve(){const cover=source.media.find(x=>String(x.id)===String(state.coverMediaId))||source.media[0];shell(`<div class="lv-memory-final"><div class="lv-memory-final-cover" data-final-cover></div><div><span class="lv-memory-kicker">Kapitel 7 · Bewahren</span><h2>${esc(state.title)}</h2><p>${esc(state.description)}</p><div class="lv-memory-final-meta">${state.chapters.length} Kapitel · ${source.media.length} Fotos · ${members.length} Reisende</div><h3>Ist das eure Reisegeschichte?</h3><button class="lv-memory-primary" data-preserve>💛 So möchten wir uns daran erinnern</button><button data-back>Noch einmal zurück</button></div></div>`,'is-final');setImage(o.querySelector('[data-final-cover]'),cover,state.title);o.querySelector('[data-back]').onclick=()=>{state.step=5;paint()};o.querySelector('[data-preserve]').onclick=async()=>{await save('published');o.innerHTML=`<section class="lv-memory-dialog"><div class="lv-memory-success"><b>🗺️</b><h2>Eure Memory Journey ist bewahrt</h2><p>Sie darf weiter wachsen, sobald weitere Reisende ihre Perspektive ergänzen.</p><button class="lv-memory-primary" data-done>Zur Erinnerungswelt</button></div></section>`;o.querySelector('[data-done]').onclick=()=>{close();renderWorld()}}}paint()}

async function mount(node){host=node;await renderWorld();unsub=await window.LuviaMemoryAlbums.subscribe(()=>setTimeout(renderWorld,700));unsubJourneys=await window.LuviaMemoryJourneys?.subscribe?.(()=>setTimeout(renderWorld,700));return()=>{unsub?.();unsubJourneys?.();unsub=null;unsubJourneys=null;host=null}}
window.LuviaAlbumsView=Object.freeze({version:VERSION,build:BUILD,mount,render:renderWorld});
})();

;

/* ===== app/memory-render-engine.js ===== */
(() => {
    'use strict';
    const VERT = `#version 300 es
  in vec2 a_pos;
  out vec2 v_uv;
  void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0.,1.);}`;
    const FRAG = `#version 300 es
  precision highp float;
  in vec2 v_uv; out vec4 outColor;
  uniform vec2 u_res; uniform float u_time; uniform float u_mode; uniform vec2 u_pointer;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
  float sdCircle(vec2 p,float r){return length(p)-r;}
  float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
  vec3 sky(vec2 uv){float y=uv.y;vec3 c=mix(vec3(.83,.93,.98),vec3(.28,.66,.86),smoothstep(0.,1.,y));float cl=fbm(vec2(uv.x*3.+u_time*.008,uv.y*5.));float cloud=smoothstep(.62,.84,cl)*(1.-smoothstep(.66,1.,uv.y));c=mix(c,vec3(1.),cloud*.72);return c;}
  vec3 flight(vec2 uv){vec3 c=mix(vec3(.88,.96,.99),vec3(.31,.69,.88),smoothstep(0.,1.,uv.y));float t=u_time*.018;vec2 p1=vec2(fract(.12+t),.78+.05*sin(u_time*.07));vec2 p2=vec2(fract(.58+t*.72),.60+.06*sin(u_time*.05+1.7));vec2 p3=vec2(fract(.86+t*.48),.86+.03*sin(u_time*.04+2.4));float e1=length((uv-p1)*vec2(1.0,3.2));float e2=length((uv-p2)*vec2(1.0,3.8));float e3=length((uv-p3)*vec2(1.0,4.2));float cl=(1.-smoothstep(.10,.24,e1))*.34+(1.-smoothstep(.09,.22,e2))*.27+(1.-smoothstep(.08,.20,e3))*.22;c=mix(c,vec3(1.),cl);float haze=pow(max(0.,1.-uv.y),3.);c+=vec3(.12,.07,.03)*haze;return c;}
  vec3 dining(vec2 uv){vec2 p=uv-.5;float grain=fbm(vec2(uv.x*18.,uv.y*8.));vec3 wood=mix(vec3(.24,.095,.045),vec3(.52,.24,.12),grain);float plate=sdCircle(vec2(p.x*1.35,p.y),.235);float rim=smoothstep(.018,-.018,abs(plate)-.018);float inner=smoothstep(.02,-.02,plate+.055);vec3 c=wood;c=mix(c,vec3(.94,.92,.86),inner*.98);c=mix(c,vec3(.78,.74,.66),rim*.8);float shadow=smoothstep(.10,-.02,sdCircle(vec2((p.x-.012)*1.35,p.y+.025),.27));c*=1.-shadow*.18;float glass=sdCircle(vec2((p.x-.28)*1.35,p.y+.13),.08);c=mix(c,vec3(.82,.94,1.),smoothstep(.01,-.01,glass)*.20);float cut=sdBox(vec2(p.x+.32,p.y),vec2(.012,.26));c=mix(c,vec3(.72,.70,.65),smoothstep(.008,-.008,cut));float lamp=1.-smoothstep(.0,.7,length(p-vec2(-.25,.22)));c+=vec3(.14,.07,.02)*lamp;return c;}
  vec3 beach(vec2 uv){float horizon=.57+.012*sin(uv.x*11.+u_time*.35)+.006*sin(uv.x*31.-u_time*.7);vec3 water=mix(vec3(.02,.36,.52),vec3(.11,.70,.78),uv.y);float wave=sin(uv.x*32.+u_time*1.3)+sin(uv.x*73.-u_time*.9)*.35;water+=vec3(.07,.12,.14)*wave*.08;float sandN=fbm(uv*vec2(35.,18.));vec3 sand=mix(vec3(.80,.58,.31),vec3(.96,.82,.57),sandN);float beachEdge=horizon+.025*sin(uv.x*13.+u_time*.45);vec3 c=uv.y>beachEdge?water:sand;float foam=1.-smoothstep(.0,.028,abs(uv.y-beachEdge));foam*=.75+.25*sin(uv.x*80.+u_time*2.2);c=mix(c,vec3(.96,.98,.97),foam*.78);if(uv.y>.9)c=mix(c,sky(vec2(uv.x,(uv.y-.9)*8.)),.35);return c;}
  vec3 city(vec2 uv){vec3 c=mix(vec3(.98,.72,.48),vec3(.36,.52,.75),uv.y);float ground=.34; if(uv.y<ground){c=vec3(.10,.12,.16);float x=uv.x*36.;float id=floor(x);float h=.08+hash(vec2(id,1.))*.22;if(uv.y<ground+h)c=mix(c,vec3(.06,.07,.10),.8);float win=step(.72,hash(floor(vec2(x*2.,uv.y*75.))+4.));c+=vec3(.95,.62,.25)*win*.28;}float sun=1.-smoothstep(.0,.16,length(uv-vec2(.78,.72)));c+=vec3(.45,.22,.06)*sun*.5;return c;}
  vec3 studio(vec2 uv){vec2 p=uv-.5;vec3 c=mix(vec3(.035,.03,.045),vec3(.12,.08,.11),uv.y);float beam=max(0.,1.-abs(p.x+p.y*.35)*2.6);c+=vec3(.20,.09,.14)*beam*.28;float floorGlow=exp(-8.*abs(uv.y-.14));c+=vec3(.30,.16,.09)*floorGlow*.16;float grain=(hash(gl_FragCoord.xy+u_time)-.5)*.025;c+=grain;return c;}
  vec3 cloudScene(vec2 uv){vec3 c=sky(uv);float glow=1.-smoothstep(0.,.55,length(uv-vec2(.5,.52)));c+=vec3(.12,.07,.10)*glow*.12;return c;}
  vec3 premiere(vec2 uv){vec3 c=studio(uv);float vign=smoothstep(.2,.78,length(uv-.5));c*=1.-vign*.55;float gold=exp(-18.*length(uv-vec2(.18,.82)));c+=vec3(.34,.22,.06)*gold;return c;}
  void main(){vec2 uv=v_uv;uv.x+=(u_pointer.x-.5)*.015;uv.y+=(u_pointer.y-.5)*.01;vec3 c;
    if(u_mode<.5)c=flight(uv);else if(u_mode<1.5)c=flight(uv);else if(u_mode<2.5)c=city(uv);else if(u_mode<3.5)c=dining(uv);else if(u_mode<4.5)c=beach(uv);else if(u_mode<5.5)c=studio(uv);else if(u_mode<6.5)c=premiere(uv);else c=cloudScene(uv);
    outColor=vec4(pow(c,vec3(.94)),1.);
  }`;
    const modeFor = { flight: 0, day: 1, city: 2, dining: 3, beach: 4, studio: 5, premiere: 6, moment: 7, cloud: 7 };
    function compile(gl, type, src) { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(sh) || 'Shader error'); return sh; }
    function program(gl) { const p = gl.createProgram(); gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(p) || 'Program error'); return p; }
    class MemoryRenderEngine {
        constructor(host) {
            this.start = performance.now();
            this.mode = 0;
            this.raf = 0;
            this.flightEpoch = performance.now();
            this.flightDuration = 8600;
            this.pointer = { x: .5, y: .5 };
            this.loop = () => { const now = performance.now(); const gl = this.gl; gl.useProgram(this.prog); gl.uniform1f(this.uTime, (now - this.start) / 1000); gl.uniform2f(this.uRes, this.glCanvas.width, this.glCanvas.height); gl.uniform1f(this.uMode, this.mode); gl.uniform2f(this.uPointer, this.pointer.x, this.pointer.y); gl.drawArrays(gl.TRIANGLES, 0, 6); this.drawRoute(now); this.raf = requestAnimationFrame(this.loop); };
            this.host = host;
            host.innerHTML = '';
            this.glCanvas = document.createElement('canvas');
            this.overlay = document.createElement('canvas');
            this.glCanvas.className = 'mr-webgl';
            this.overlay.className = 'mr-overlay';
            host.append(this.glCanvas, this.overlay);
            const gl = this.glCanvas.getContext('webgl2', { antialias: true, alpha: false, premultipliedAlpha: false });
            if (!gl)
                throw new Error('WebGL2 wird auf diesem Gerät nicht unterstützt.');
            this.gl = gl;
            const c = this.overlay.getContext('2d');
            if (!c)
                throw new Error('Canvas wird nicht unterstützt.');
            this.ctx = c;
            this.prog = program(gl);
            gl.useProgram(this.prog);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
            const a = gl.getAttribLocation(this.prog, 'a_pos');
            gl.enableVertexAttribArray(a);
            gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
            this.uTime = gl.getUniformLocation(this.prog, 'u_time');
            this.uRes = gl.getUniformLocation(this.prog, 'u_res');
            this.uMode = gl.getUniformLocation(this.prog, 'u_mode');
            this.uPointer = gl.getUniformLocation(this.prog, 'u_pointer');
            this.ro = new ResizeObserver(() => this.resize());
            this.ro.observe(host);
            host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); this.pointer.x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); this.pointer.y = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)); }, { passive: true });
            this.resize();
            this.loop();
        }
        resize() { const d = Math.min(2, window.devicePixelRatio || 1), r = this.host.getBoundingClientRect(), w = Math.max(2, Math.round(r.width * d)), h = Math.max(2, Math.round(r.height * d)); for (const c of [this.glCanvas, this.overlay]) {
            if (c.width !== w)
                c.width = w;
            if (c.height !== h)
                c.height = h;
            c.style.width = r.width + 'px';
            c.style.height = r.height + 'px';
        } this.gl.viewport(0, 0, w, h); }
        setScene(name, opts = {}) { this.mode = modeFor[name] ?? 0; this.host.dataset.renderScene = name; }
        flightPoint(t, cycle) {
            const seed = cycle * 1.913 + 0.73;
            const x = -0.12 + t * 1.24 + Math.sin((t * 2.0 + seed) * Math.PI) * 0.018;
            const y = 0.48 + Math.sin(t * Math.PI * 2.0 + seed) * 0.18 + Math.sin(t * Math.PI * 4.7 + seed * 1.31) * 0.075 + Math.sin(t * Math.PI * 8.3 + seed * 0.47) * 0.025;
            return { x, y: Math.max(0.15, Math.min(0.82, y)) };
        }
        drawRoute(now) {
            const x = this.ctx, w = this.overlay.width, d = w / Math.max(1, this.host.clientWidth);
            x.clearRect(0, 0, this.overlay.width, this.overlay.height);
            if (!(this.mode === 0 || this.mode === 1)) return;
            const elapsed = Math.max(0, now - this.flightEpoch);
            const cycle = Math.floor(elapsed / this.flightDuration);
            const p = (elapsed % this.flightDuration) / this.flightDuration;
            x.save(); x.scale(d, d);
            const cw = this.host.clientWidth, ch = this.host.clientHeight;
            const tailStart = Math.max(0, p - 0.24);
            const steps = 34;
            for (let i = 1; i < steps; i++) {
                const a = tailStart + (p - tailStart) * ((i - 1) / (steps - 1));
                const b = tailStart + (p - tailStart) * (i / (steps - 1));
                const qa = this.flightPoint(a, cycle), qb = this.flightPoint(b, cycle);
                const alpha = 0.05 + 0.43 * (i / steps);
                x.beginPath(); x.moveTo(qa.x * cw, qa.y * ch); x.lineTo(qb.x * cw, qb.y * ch);
                x.strokeStyle = `rgba(255,255,255,${alpha})`; x.lineWidth = 2.0; x.stroke();
            }
            const q = this.flightPoint(p, cycle), q2 = this.flightPoint(Math.min(1, p + .004), cycle);
            const ang = Math.atan2((q2.y - q.y) * ch, (q2.x - q.x) * cw);
            x.translate(q.x * cw, q.y * ch); x.rotate(ang);
            x.fillStyle = 'rgba(28,42,58,.96)'; x.beginPath();
            x.moveTo(20, 0); x.lineTo(-7, -5); x.lineTo(-18, -16); x.lineTo(-22, -14); x.lineTo(-14, -3); x.lineTo(-19, 0); x.lineTo(-14, 3); x.lineTo(-22, 14); x.lineTo(-18, 16); x.lineTo(-7, 5); x.closePath(); x.fill();
            x.restore();
        }
        destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.host.innerHTML = ''; }
    }
    window.LuviaMemoryRenderEngine = Object.freeze({ version: '1.0.1', create: (host) => new MemoryRenderEngine(host) });
})();

;

/* ===== app/memory-export-engine.js ===== */
(() => {
    'use strict';
    const clean = (html = '') => { const d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
    const mediaContract = () => window.LuviaMediaContractV1 || window.LuviaMediaContract || null;
    async function signed(m) { if (!m?.id)
        return ''; try {
        return await mediaContract()?.reads?.signedUrl?.(m.id, 3600) || '';
    }
    catch {
        return '';
    } }
    async function image(m) { const u = await signed(m); if (!u)
        return null; return await new Promise(r => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => r(im); im.onerror = () => r(null); im.src = u; }); }
    function selected(model, n = 8) { const arr = [...(model.media || [])]; return arr.sort((a, b) => { const ca = String(a.id) === String(model.cover) ? 5 : 0, cb = String(b.id) === String(model.cover) ? 5 : 0; return (cb + (model.weights?.[String(b.id)] || 2)) - (ca + (model.weights?.[String(a.id)] || 2)); }).slice(0, n); }
    function fit(ctx, im, x, y, w, h, zoom = 1) { const s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * zoom, iw = im.naturalWidth * s, ih = im.naturalHeight * s; ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
    function rounded(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function wrap(ctx, t, x, y, w, line, max = 6) { let cur = '', lines = 0; for (const word of String(t || '').split(/\s+/)) {
        const test = cur ? cur + ' ' + word : word;
        if (ctx.measureText(test).width > w && cur) {
            ctx.fillText(cur, x, y);
            y += line;
            lines++;
            cur = word;
            if (lines >= max - 1)
                break;
        }
        else
            cur = test;
    } if (cur && lines < max)
        ctx.fillText(cur, x, y); return y; }
    function plate(ctx, x, y, w, h, alpha = .78) { ctx.save(); rounded(ctx, x, y, w, h, 30); ctx.fillStyle = `rgba(14,19,25,${alpha})`; ctx.fill(); ctx.restore(); }
    function dl(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
    function canvas(w = 1080, h = 1920) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    async function blob(c, type = 'image/png', quality = .94) { return await new Promise((r, j) => c.toBlob(b => b ? r(b) : j(new Error('Export konnte nicht erzeugt werden.')), type, quality)); }
    async function storyFrames(model) {
        const medias = selected(model, 7), ims = await Promise.all(medias.map(image));
        const title = model.title || `Unsere Reise${model.destination ? ' nach ' + model.destination : ''}`;
        const story = clean(model.story || '');
        const voice = (model.voices || []).map(v => clean(v.answer_text || v.answerText || '')).find(Boolean) || story;
        const frames = [];
        // Frame 1: cinematic cover + secondary memory inset
        {
            const c = canvas(), x = c.getContext('2d');
            x.fillStyle = '#121820';
            x.fillRect(0, 0, c.width, c.height);
            if (ims[0])
                fit(x, ims[0], 0, 0, 1080, 1920, 1.05);
            const g = x.createLinearGradient(0, 650, 0, 1920);
            g.addColorStop(0, 'rgba(10,15,20,.04)');
            g.addColorStop(1, 'rgba(10,15,20,.82)');
            x.fillStyle = g;
            x.fillRect(0, 500, 1080, 1420);
            if (ims[1]) {
                x.save();
                rounded(x, 690, 130, 290, 420, 28);
                x.clip();
                fit(x, ims[1], 690, 130, 290, 420, 1.05);
                x.restore();
                x.strokeStyle = 'rgba(255,255,255,.8)';
                x.lineWidth = 6;
                rounded(x, 690, 130, 290, 420, 28);
                x.stroke();
            }
            x.fillStyle = '#fff';
            x.font = '800 82px system-ui';
            wrap(x, title, 76, 1320, 920, 92, 4);
            x.font = '600 28px system-ui';
            x.fillStyle = 'rgba(255,255,255,.86)';
            x.fillText('LUVIA · GEMEINSAM ERINNERN', 76, 1810);
            frames.push(await blob(c));
        }
        // Frame 2: mixed scrapbook collage, not one image
        {
            const c = canvas(), x = c.getContext('2d');
            x.fillStyle = '#f2e6d5';
            x.fillRect(0, 0, 1080, 1920);
            const slots = [[60, 110, 470, 630], [555, 110, 465, 410], [555, 545, 465, 500], [60, 765, 470, 440]];
            for (let i = 0; i < slots.length; i++) {
                const im = ims[i + 1] || ims[i];
                if (!im)
                    continue;
                const [sx, sy, sw, sh] = slots[i];
                x.save();
                rounded(x, sx, sy, sw, sh, 26);
                x.clip();
                fit(x, im, sx, sy, sw, sh, 1.04);
                x.restore();
            }
            plate(x, 70, 1265, 940, 470, .84);
            x.fillStyle = '#fff';
            x.font = '800 54px system-ui';
            wrap(x, title, 110, 1350, 860, 62, 3);
            x.font = '500 31px system-ui';
            x.fillStyle = 'rgba(255,255,255,.9)';
            wrap(x, voice || story || 'Eure Reise. Eure Bilder. Eure Geschichte.', 110, 1510, 860, 44, 5);
            x.font = '700 22px system-ui';
            x.fillStyle = 'rgba(255,255,255,.72)';
            const bits = [model.sensory?.food, model.sensory?.weather, model.sensory?.people].filter(Boolean).slice(0, 3);
            x.fillText(bits.length ? bits.join(' · ') : 'LUVIA MEMORY STORY', 110, 1690);
            frames.push(await blob(c));
        }
        // Frame 3: voices + trip detail + photo strip
        {
            const c = canvas(), x = c.getContext('2d');
            const grad = x.createLinearGradient(0, 0, 1080, 1920);
            grad.addColorStop(0, '#c9e6ed');
            grad.addColorStop(1, '#e8c99e');
            x.fillStyle = grad;
            x.fillRect(0, 0, 1080, 1920);
            x.fillStyle = '#173346';
            x.font = '800 72px system-ui';
            wrap(x, 'Was von dieser Reise bleibt', 70, 160, 900, 82, 3);
            let y = 430;
            const quotes = (model.voices || []).map(v => ({ name: v.displayName || v.name || 'Reisender', text: clean(v.answer_text || v.answerText || ''), reaction: v.reaction || '♥' })).filter(v => v.text).slice(0, 3);
            for (const q of quotes.length ? quotes : [{ name: 'Eure Geschichte', text: story || 'Einige Augenblicke brauchen keine große Erklärung.', reaction: '♥' }]) {
                plate(x, 70, y, 940, 210, .72);
                x.fillStyle = '#fff';
                x.font = '700 28px system-ui';
                x.fillText(`${q.reaction} ${q.name}`, 105, y + 58);
                x.font = '500 30px system-ui';
                wrap(x, q.text, 105, y + 112, 850, 40, 3);
                y += 240;
            }
            const stripY = 1370, sw = 290, gap = 28;
            for (let i = 0; i < 3; i++) {
                const im = ims[i];
                if (!im)
                    continue;
                const sx = 70 + i * (sw + gap);
                x.save();
                rounded(x, sx, stripY, sw, 390, 24);
                x.clip();
                fit(x, im, sx, stripY, sw, 390, 1.04);
                x.restore();
            }
            x.fillStyle = '#173346';
            x.font = '700 22px system-ui';
            x.fillText('LUVIA · MEMORY STORY SET', 70, 1845);
            frames.push(await blob(c));
        }
        return frames;
    }
    function crcTable() { const table = new Uint32Array(256); for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++)
            c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    } return table; }
    const CRC = crcTable();
    function crc32(data) { let c = 0xffffffff; for (const b of data)
        c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
    function u16(v) { return new Uint8Array([v & 255, (v >>> 8) & 255]); }
    function u32(v) { return new Uint8Array([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]); }
    function concat(parts) { const n = parts.reduce((a, b) => a + b.length, 0), out = new Uint8Array(n); let o = 0; for (const p of parts) {
        out.set(p, o);
        o += p.length;
    } return out; }
    async function zip(files) { const enc = new TextEncoder(), locals = [], central = []; let offset = 0; for (const f of files) {
        const name = enc.encode(f.name), data = new Uint8Array(await f.blob.arrayBuffer()), crc = crc32(data), local = concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data]);
        locals.push(local);
        central.push(concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
        offset += local.length;
    } const cd = concat(central), body = concat(locals), end = concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(body.length), u16(0)]); return new Blob([body, cd, end], { type: 'application/zip' }); }
    async function exportStory(model) { const frames = await storyFrames(model); const z = await zip(frames.map((b, i) => ({ name: `luvia-story-${String(i + 1).padStart(2, '0')}.png`, blob: b }))); dl(z, `luvia-story-set-${Date.now()}.zip`); return true; }
    async function exportPost(model) { const medias = selected(model, 5), ims = await Promise.all(medias.map(image)); const c = canvas(1080, 1350), x = c.getContext('2d'); x.fillStyle = '#efe2d2'; x.fillRect(0, 0, 1080, 1350); const slots = [[50, 50, 620, 690], [695, 50, 335, 330], [695, 405, 335, 335]]; for (let i = 0; i < slots.length; i++) {
        if (!ims[i])
            continue;
        const [a, b, w, h] = slots[i];
        x.save();
        rounded(x, a, b, w, h, 24);
        x.clip();
        fit(x, ims[i], a, b, w, h, 1.03);
        x.restore();
    } plate(x, 50, 780, 980, 500, .80); x.fillStyle = '#fff'; x.font = '800 58px system-ui'; wrap(x, model.title || 'Unsere Erinnerung', 90, 875, 900, 66, 3); x.font = '500 29px system-ui'; x.fillStyle = 'rgba(255,255,255,.90)'; wrap(x, clean(model.story || '').slice(0, 420), 90, 1035, 900, 40, 4); x.font = '700 20px system-ui'; x.fillStyle = 'rgba(255,255,255,.72)'; x.fillText('LUVIA · GEMEINSAM ERINNERN', 90, 1230); dl(await blob(c), 'luvia-post-' + Date.now() + '.png'); return true; }
    function mp4Mime() { const candidates = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=h264', 'video/mp4']; return candidates.find(t => window.MediaRecorder?.isTypeSupported?.(t)) || null; }
    async function exportMp4(model, kind = 'reel') { const mime = mp4Mime(); if (!mime)
        throw new Error('Dieser Browser kann MP4/H.264 nicht direkt erzeugen. Luvia erstellt bewusst keinen WebM-Ersatz. Bitte den Export in aktuellem Edge/Chrome auf Windows testen.'); const c = canvas(720, 1280), x = c.getContext('2d'), fps = 30, stream = c.captureStream(fps), rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: kind === 'film' ? 8000000 : 6000000 }), chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data); const done = new Promise(r => rec.onstop = () => r()); const media = selected(model, kind === 'film' ? 10 : 7), ims = await Promise.all(media.map(image)), duration = kind === 'film' ? 1.6 : 1.15; rec.start(500); for (let i = 0; i < Math.max(1, ims.length); i++) {
        const im = ims[i], frames = Math.round(duration * fps);
        for (let f = 0; f < frames; f++) {
            const p = f / (frames - 1), ease = p * p * (3 - 2 * p);
            x.fillStyle = '#10161d';
            x.fillRect(0, 0, 720, 1280);
            if (im) {
                const zoom = 1.03 + ease * .08, s = Math.max(720 / im.naturalWidth, 1280 / im.naturalHeight) * zoom, iw = im.naturalWidth * s, ih = im.naturalHeight * s;
                const panX = Math.sin(i * 1.7) * 30 * ease, panY = Math.cos(i * 1.3) * 22 * ease;
                x.globalAlpha = Math.min(1, p * 6, (1 - p) * 6);
                x.drawImage(im, (720 - iw) / 2 + panX, (1280 - ih) / 2 + panY, iw, ih);
                x.globalAlpha = 1;
            }
            const g = x.createLinearGradient(0, 650, 0, 1280);
            g.addColorStop(0, 'rgba(8,12,16,0)');
            g.addColorStop(1, 'rgba(8,12,16,.84)');
            x.fillStyle = g;
            x.fillRect(0, 580, 720, 700);
            plate(x, 34, 900, 652, 300, .62);
            x.fillStyle = '#fff';
            x.font = '800 42px system-ui';
            wrap(x, model.title || 'Unsere Erinnerung', 64, 970, 590, 48, 3);
            const quote = clean((model.voices || [])[i % (Math.max(1, (model.voices || []).length))]?.answer_text || model.story || '').slice(0, 150);
            x.font = '500 22px system-ui';
            x.fillStyle = 'rgba(255,255,255,.9)';
            wrap(x, quote, 64, 1110, 590, 30, 3);
            x.font = '700 15px system-ui';
            x.fillStyle = 'rgba(255,255,255,.7)';
            x.fillText(kind === 'film' ? 'LUVIA MEMORY FILM' : 'LUVIA REEL', 64, 1230);
            await new Promise(r => setTimeout(r, 1000 / fps));
        }
    } rec.stop(); await done; const out = new Blob(chunks, { type: mime }); dl(out, `luvia-${kind}-${Date.now()}.mp4`); return true; }
    window.LuviaMemoryExportEngine = Object.freeze({ version: '1.0.0', exportStory, exportPost, exportReel: (m) => exportMp4(m, 'reel'), exportFilm: (m) => exportMp4(m, 'film'), mp4Supported: () => Boolean(mp4Mime()) });
})();

;

/* ===== app/memory-worlds-v3.js ===== */
(() => {
'use strict';
const VERSION='4.38.0',BUILD='13.37.7';
let host=null,stopCards=null,stopIdentities=null,stopReviews=null,stopVotes=null,stopTrip=null,stopTheme=null,urlCache=new Map(),homeState=null;
const deckSessionSeed=Math.random().toString(36).slice(2);
const validColor=v=>/^#[0-9a-f]{6}$/i.test(String(v||'').trim())?String(v).trim().toLowerCase():null;
const tripContract=()=>window.LuviaTripContractV1||window.LuviaTripContract||null;
const tripRecord=()=>tripContract()?.getActiveTrip?.()||{};
const mediaContract=()=>window.LuviaMediaContractV1||window.LuviaMediaContract||null;
const inheritedAccent=()=>{const nodes=[document.documentElement,document.body,document.querySelector('.lv-dashboard'),document.querySelector('.lv-shell'),document.querySelector('#app'),host].filter(Boolean),props=['--trip-accent','--lv-accent','--module-accent'];for(const node of nodes){const css=getComputedStyle(node);for(const prop of props){const hit=validColor(css.getPropertyValue(prop));if(hit)return hit}}return null};
const tripAccent=()=>{
  // Canonical visual source: exactly the active trip accent already applied by LuviaTheme/dashboard.
  const themed=validColor(getComputedStyle(document.documentElement).getPropertyValue('--trip-accent'));if(themed)return themed;
  const t=tripRecord(),contextTrip=tripContract()?.getContext?.()||{};
  const canonical=[t.accent,contextTrip.accent].map(validColor).find(Boolean);
  if(canonical)return canonical;
  const coreAccent=validColor(window.LuviaMemoryCards?.tripAccent?.());if(coreAccent)return coreAccent;
  return inheritedAccent()||'#ee6f83';
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const me=()=>window.ParisAuth?.getState?.()?.user||{};
const REACTIONS=['❤️','🥹','😂','🥰','🤩','🫶','✨','☀️','🌊','🍝','☕','🎢','🏙️','🌿','🎶','📸','😌','🤭','😋','🥳','🤯','🙈','💫','🔥'];
const QUESTIONS=['Was sieht man auf diesen Bildern nicht?','Was würdest du jemandem erzählen, der nicht dabei war?','Welches kleine Detail ist dir davon geblieben?','Was war hier anders als geplant?','Was hat diesen Moment für dich ausgemacht?'];
const VIBES=[['spontaneous','Völlig spontan','⚡'],['planned','Lange geplant','🗓️'],['quiet','Klein, aber besonders','🤍'],['funny','Einfach lustig','😂'],['highlight','Echtes Highlight','✨'],['chaos','Schönes Chaos','🫠']];
const fmt=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'long'}).format(d)};
async function signed(m){if(!m?.id)return'';const k=String(m.id);if(urlCache.has(k))return urlCache.get(k);let u='';try{u=await mediaContract()?.reads?.signedUrl?.(m.id,3600)||''}catch{}urlCache.set(k,u);return u}
async function putImg(el,m){if(!el||!m)return;const u=await signed(m);if(u&&el.isConnected)el.innerHTML=`<img src="${esc(u)}" alt="Reisefoto" loading="lazy" decoding="async">`}
const whoName=(card,members)=>members.find(x=>String(x.id)===String(card.author_id))?.displayName||'Reisender';
const weightLabel=n=>Number(n)>=3?'Herzstück':Number(n)===2?'Im Fokus':'Im Stapel';
const typeIcon=t=>({photo:'📸',quote:'💬',vibe:'✨',reaction:'💛',place:'📍',food:'🍝',weather:'☀️',inside_joke:'🤭'}[t]||'◌');
const typeName=t=>({photo:'Lieblingsblick',quote:'Gedanke',vibe:'Momentgefühl',reaction:'Reaktion',place:'Ort',food:'Genuss',weather:'Atmosphäre',inside_joke:'Insider'}[t]||'Erinnerung');
const focusTitle=(card,name)=>({photo:`Ein Lieblingsblick von ${name}`,quote:`Ein Gedanke von ${name}`,vibe:`So fühlte sich der Moment für ${name} an`,reaction:`Eine spontane Reaktion von ${name}`,place:`Ein Ort, der ${name} geblieben ist`,food:`Ein Genussmoment von ${name}`,weather:`So war die Atmosphäre für ${name}`,inside_joke:`Ein Insider von ${name}`}[card?.card_type]||`Eine Erinnerung von ${name}`);
const focusMeaning=card=>({photo:'Ein Foto, das diesen Moment aus einer persönlichen Perspektive festhält.',quote:'Ein Satz, der bewahrt, was auf den Fotos allein nicht zu sehen ist.',vibe:'Die Stimmung dieses Moments – festgehalten ohne lange Erklärung.',reaction:'Die spontane Reaktion, die genau zu diesem Augenblick gehört.',place:'Der Ort als Teil der Erinnerung – nicht nur als Adresse.',food:'Ein Geschmack oder Genussmoment, der zur Reisegeschichte gehört.',weather:'Die Atmosphäre, die diesen Moment geprägt hat.',inside_joke:'Ein kleines gemeinsames Detail, das nur für euch seine ganze Bedeutung hat.'}[card?.card_type]||'Ein Baustein eures gemeinsamen Memory Moments.');
const memberColor=(id,members)=>{const m=members.find(x=>String(x.id)===String(id))||{};return [m.avatarColor,m.avatar_color,m.profileColor,m.profile_color,m.accent,m.color].map(validColor).find(Boolean)||null};
const contributorPalette=(people,members)=>[...new Set(people.map(id=>memberColor(id,members)).filter(Boolean))];
function resolveMemoryVisualPalette(items,members){
  const people=deckPeople(items),trip=tripAccent();
  if(people.length<=1)return Object.freeze({mode:'single',people,trip,contributors:[],primary:trip,secondary:trip,stackLayers:[trip,trip,trip,trip,trip,trip]});
  const contributors=contributorPalette(people,members);
  const usable=contributors.length?contributors:[trip];
  return Object.freeze({mode:'multi',people,trip,contributors,primary:usable[0],secondary:usable[1]||usable[0],stackLayers:Array.from({length:6},(_,i)=>usable[i%usable.length])});
}
const deckColor=(card,members,people,items)=>{const visual=resolveMemoryVisualPalette(items?.length?items:(homeState?.grouped?[...homeState.grouped.values()].find(list=>list.some(x=>String(x.id)===String(card?.id)))||[]:[]),members);if(visual.mode==='single')return visual.trip;return memberColor(card?.author_id,members)||visual.stackLayers[0]};
const stagePalette=(items,members)=>{const visual=resolveMemoryVisualPalette(items,members);return[visual.primary,visual.secondary]};
const deckPeople=items=>[...new Set(items.map(x=>String(x.author_id)).filter(Boolean))];
const shuffled=(items,salt='')=>{const a=[...items];for(let i=a.length-1;i>0;i--){const r=Math.abs(Math.sin(Date.now()*0.00037+i*17+salt.length*13+Math.random()*97));const j=Math.floor(r*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const memberInitial=(id,members)=>{const n=members.find(x=>String(x.id)===String(id))?.displayName||'?';return n.trim().charAt(0).toUpperCase()||'?'};
const cardTone=t=>({photo:'photo',quote:'quote',vibe:'vibe',reaction:'reaction',place:'place',food:'food',weather:'weather',inside_joke:'joke'}[t]||'note');
function clusterForKey(key,clusters){if(!key?.startsWith('cluster:'))return null;const id=key.slice(8);return clusters.find(c=>String(c.id)===String(id))||null}
function seeded(key,index){let h=2166136261;for(const ch of `${key}:${index}`){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return((h>>>0)%10000)/10000}
function mediaDay(item){return item?.dayKey||item?.day_key||String(item?.capturedAt||item?.captured_at||item?.createdAt||item?.created_at||'').slice(0,10)||''}
function stackDay(cluster,media=[]){if(!cluster)return'';const ids=new Set((cluster.mediaIds||[]).map(String)),counts=new Map();for(const m of media){if(!ids.has(String(m.id)))continue;const d=mediaDay(m);if(d)counts.set(d,(counts.get(d)||0)+1)}return[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||String(cluster.started_at||cluster.start_at||cluster.created_at||'').slice(0,10)}
function fmtDayKey(v){if(!v)return'';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'long'}).format(d)}
const curationClass=c=>window.LuviaMemoryCards?.curationClass?.(c)||(c?.card_type==='photo'?'hero':['quote','place','food','inside_joke','note'].includes(c?.card_type)?'story':'signal');
function stackAutoTitle(cluster,media=[]){const day=fmtDayKey(stackDay(cluster,media));const raw=String(cluster?.title||'').trim();const generic=/^(gemeinsamer )?(memory )?moment$/i.test(raw);return [day,!generic&&raw?raw:null].filter(Boolean).join(' · ')||raw||'Gemeinsamer Moment'}
function stackTitleParts(cluster,state,media=[]){const day=fmtDayKey(stackDay(cluster,media))||'Reisetag';const raw=String(state?.chosen_title||cluster?.title||'').trim();const generic=/^(gemeinsamer )?(memory )?moment$/i.test(raw);return{day,title:(!generic&&raw)||'Unser gemeinsamer Moment'}}
const voteBudget=count=>Math.max(3,Math.min(18,Math.ceil(Math.max(1,count)*1.5)));
const storyValuable=card=>{if(curationClass(card)!=='story')return true;const text=String(card?.content||'').replace(/\s+/g,' ').trim(),words=text?text.split(' ').filter(Boolean).length:0,meta=card?.metadata||{};return meta.story_enriched===true||meta.story_context===true||(text.length>=80&&words>=12)};
const albumCandidate=card=>curationClass(card)!=='story'||storyValuable(card);
const experienceLabel=c=>c?._experience?.kind==='moment'?'Moment':c?._experience?.kind==='story'?'Geschichte':typeName(c?.card_type);
const experiencePrimary=c=>c?._experience?.kind==='moment'?(String(c?._experience?.clusterTitle||'').trim()||String(c?._experience?.vibeLabel||c?.content||'Ein Moment, der geblieben ist').trim()):String(c?.content||'').trim();
const momentLabel=card=>String(card?._experience?.vibeLabel||card?.content||'').replace(/^Passte zu:\s*/i,'').trim();
function experienceCards(items,cluster=null){
  const out=[];
  const byAuthor=new Map();
  for(const c of items){const id=String(c.author_id||'');if(!byAuthor.has(id))byAuthor.set(id,[]);byAuthor.get(id).push(c)}
  for(const cards of byAuthor.values()){
    const photos=cards.filter(c=>c.card_type==='photo');out.push(...photos);
    const stories=cards.filter(c=>curationClass(c)==='story');
    const vibe=cards.find(c=>c.card_type==='vibe');const reaction=cards.find(c=>c.card_type==='reaction');
    if(stories.length){
      for(const story of stories){out.push({...story,_experience:{kind:'story',vibeLabel:momentLabel(vibe),reaction:reaction?.reaction||'',clusterTitle:String(cluster?.title||'').trim()}})}
    }else if(vibe||reaction){
      const base=vibe||reaction;
      out.push({...base,_experience:{kind:'moment',vibeLabel:momentLabel(vibe)||'Ein Moment, der geblieben ist',reaction:reaction?.reaction||base?.reaction||'',clusterTitle:String(cluster?.title||'').trim()}})
    }
    // Raw vibe/reaction rows remain persisted in Supabase, but are intentionally
    // not rendered as separate experience cards when they can be combined.
    for(const c of cards){if(c.card_type==='photo'||curationClass(c)==='story'||c.card_type==='vibe'||c.card_type==='reaction')continue;out.push(c)}
  }
  return out;
}
const candidateCards=(items,summary)=>items.filter(c=>(summary?.byCard?.[String(c.id)]?.included||0)>0&&albumCandidate(c));
const clusterVoteProgress=(clusterId,candidates,voteSummary,members)=>{const c=voteSummary?.byCluster?.[String(clusterId)]||{byCard:{},byUser:{}},ids=candidates.map(x=>String(x.id)),memberIds=members.map(x=>String(x.id));const completed=memberIds.filter(uid=>ids.length&&ids.every(id=>Object.prototype.hasOwnProperty.call(c.byUser?.[uid]?.cards||{},id)));const meDone=completed.includes(String(me().id||''));const ranking=ids.map(id=>({id,points:Number(c.byCard?.[id]?.points||0),voters:Number(c.byCard?.[id]?.voters||0)})).sort((a,b)=>b.points-a.points||b.voters-a.voters);return{...c,completed,meDone,allDone:memberIds.length>0&&completed.length===memberIds.length,ranking,winners:ranking.filter(x=>x.points>0)}};
function isTripOwner(){const t=tripRecord();return t?.isOwner===true||String(t?.role||'').toLowerCase()==='owner'}

async function renderHome(){
  if(!host||!window.LuviaMemoryCards||!window.LuviaMemoryJourneys)return;
  host.innerHTML='<section class="mc-home"><div class="mc-loading">Erinnerungen werden gesammelt …</div></section>';
  let src,cards,members,curation={states:{},proposals:{}},reviewSummary={byCard:{},reviewers:0},voteSummary={byCluster:{}};
  try{[src,cards,members]=await Promise.all([window.LuviaMemoryJourneys.source(),window.LuviaMemoryCards.list(),window.LuviaMemoryCards.members()]);[curation,reviewSummary,voteSummary]=await Promise.all([window.LuviaMemoryCards.stackCuration?.((src.clusters||[]).map(c=>c.id))||curation,window.LuviaMemoryCards.albumReviewSummary?.(cards.map(c=>c.id))||reviewSummary,window.LuviaMemoryCards.albumVoteSummary?.((src.clusters||[]).map(c=>c.id))||voteSummary])}catch(e){host.innerHTML=`<section class="mc-home"><div class="mc-error"><h2>Memory Cards sind noch nicht bereit</h2><p>${esc(e.message||e)}</p></div></section>`;return}
  const clusters=(src.clusters||[]).filter(c=>Array.isArray(c.mediaIds)&&c.mediaIds.length);
  const effectiveCards=cards; // Raw memory rows remain source-of-truth; experienceCards() composes non-photo rows per stack.
  const meId=me().id;
  const touched=new Set(effectiveCards.filter(c=>String(c.author_id)===String(meId)&&c.cluster_id).map(c=>String(c.cluster_id)));
  const pending=clusters.filter(c=>!touched.has(String(c.id)));
  const grouped=new Map();for(const c of effectiveCards){const key=c.cluster_id?`cluster:${c.cluster_id}`:`free:${c.id}`;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(c)}
  const stacks=[...grouped.entries()].filter(([key])=>{const c=clusterForKey(key,clusters);return !c||curation.states?.[String(c.id)]?.status!=='dissolved'}).reverse();
  homeState={src,cards:effectiveCards,members,clusters,grouped,curation,reviewSummary,voteSummary};
  host.innerHTML=`<section class="mc-home">
    <header class="mc-hero"><div><span class="mc-eyebrow">LUVIA MEMORIES</span><h1>Kleine Dinge. Echte Erinnerungen.</h1><p>Ihr müsst keine Reise beschreiben. Wählt, reagiert, ergänzt einen Satz – Luvia bewahrt die Bausteine eurer gemeinsamen Geschichte.</p></div><div class="mc-stats"><b>${effectiveCards.length}</b><span>kuratierte Cards</span><b>${members.length}</b><span>Reisende</span></div></header>
    <section class="mc-section"><div class="mc-section-title"><div><small>GEMEINSAM ERINNERN</small><h2>${pending.length?'Diese Momente warten auf deinen Blick':'Für den Moment ist alles entdeckt'}</h2></div><p>Ein paar schnelle Entscheidungen reichen. Danach landet der Moment als Kartenstapel bei euren Erinnerungen.</p></div><div class="mc-discover-grid">${pending.slice(0,8).map((c,i)=>`<button class="mc-discover" data-cluster="${esc(c.id)}" data-i="${i}"><div class="mc-discover-photo"></div><div class="mc-discover-copy"><span>${c.mediaIds.length} Fotos</span><strong>${fmtDayKey(stackDay(c,src.media||[]))||'Gemeinsamer Moment'}</strong><em>Erinnerung öffnen →</em></div></button>`).join('')||'<div class="mc-empty">Neue Foto-Momente erscheinen hier automatisch, sobald es etwas zu entdecken gibt.</div>'}</div></section>
    <section class="mc-section mc-decks-section"><div class="mc-section-title"><div><small>EURE KARTENSTAPEL</small><h2>Was von der Reise wirklich hängen bleibt</h2></div><p>Jeder Stapel gehört zu einem Moment. Tippen oder klicken, um die Karten wieder vor euch auszubreiten.</p></div><div class="mc-deck-grid">${stacks.map(([key,items],i)=>renderStack(key,items,members,i)).join('')||'<div class="mc-empty">Noch keine Kartenstapel. Öffnet oben den ersten Moment.</div>'}</div></section>
  </section>`;
  for(const b of host.querySelectorAll('[data-cluster]')){const c=pending[Number(b.dataset.i)];const media=await window.LuviaMemoryAlbums.mediaByIds(c.mediaIds);putImg(b.querySelector('.mc-discover-photo'),media[0]);b.onclick=()=>openDiscovery(c,media,members)}
  await paintCardPhotos(host,effectiveCards,src.media||[]);
  for(const el of host.querySelectorAll('[data-stack]'))el.onclick=()=>openDeck(el.dataset.stack,el);
  host.querySelectorAll('[data-title-propose]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openTitleModal(b.dataset.titlePropose)},{once:false}));
  host.querySelectorAll('[data-vote-open]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openVotingModal(b.dataset.voteOpen)},{once:false}));
  host.querySelectorAll('[data-vote-result]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openVotingResults(b.dataset.voteResult)},{once:false}));
  host.querySelectorAll('[data-stack-dissolve]').forEach(b=>b.onclick=async e=>{e.stopPropagation();if(!confirm('Kartenstapel auflösen? Fotos und Memory Cards bleiben erhalten. Nur die gemeinsame Stapel-Zuordnung wird ausgeblendet.'))return;b.disabled=true;try{await window.LuviaMemoryCards.dissolveStack(b.dataset.stackDissolve);await renderHome()}catch(error){alert(error.message||error)}finally{b.disabled=false}});
}

function renderStack(key,items,members,index){
  const clusterForExperience=clusterForKey(key,homeState?.clusters||[]);items=experienceCards(items,clusterForExperience);
  const visual=resolveMemoryVisualPalette(items,members),people=visual.people,photos=items.filter(x=>x.card_type==='photo'&&x.media_id);
  const hero=(photos.length?photos[Math.floor(Math.random()*photos.length)]:items[Math.floor(Math.random()*items.length)])||items[0];
  const rot=((Math.random()-.5)*2.0).toFixed(2),lift=Math.round((Math.random()-.5)*8);
  const rest=shuffled(items.filter(x=>String(x.id)!==String(hero.id)),`${deckSessionSeed}:${key}:${index}`);
  const visible=Math.min(6,Math.max(3,items.length));
  const layers=Array.from({length:visible},(_,i)=>{
    const c=rest[i%Math.max(1,rest.length)]||hero; const color=visual.stackLayers[i%visual.stackLayers.length];
    return `<span class="mc-deck-layer layer-${i+1}" style="--layer-color:${esc(color)};--layer-i:${i}"></span>`;
  }).join('');
  const voices=people.map(id=>`<span class="mc-voice-dot" style="--voice:${esc(visual.mode==='single'?visual.trip:(memberColor(id,members)||visual.primary))}" title="${esc(members.find(x=>String(x.id)===id)?.displayName||'Reisender')}">${esc(memberInitial(id,members))}</span>`).join('');
  const accent=visual.mode==='single'?visual.trip:(memberColor(hero.author_id,members)||visual.primary);
  const cluster=clusterForKey(key,homeState?.clusters||[]),clusterId=cluster?.id?String(cluster.id):'';
  const state=clusterId?homeState?.curation?.states?.[clusterId]:null,proposals=clusterId?(homeState?.curation?.proposals?.[clusterId]||[]):[];
  const titleParts=stackTitleParts(cluster,state,homeState?.src?.media||[]);
  const heroCount=items.filter(c=>curationClass(c)==='hero').length,storyCount=items.filter(c=>curationClass(c)==='story').length,signalCount=items.filter(c=>curationClass(c)==='signal').length,reviewed=items.filter(c=>(homeState?.reviewSummary?.byCard?.[String(c.id)]?.total||0)>=members.length).length,reviewReady=members.length>0&&reviewed===items.length;
  const candidates=candidateCards(items,homeState?.reviewSummary),vote=clusterId?clusterVoteProgress(clusterId,candidates,homeState?.voteSummary,members):null;
  const waiting=vote?Math.max(0,members.length-vote.completed.length):0;
  const hasVoteProgress=Boolean(vote&&(vote.allDone||vote.meDone||Object.keys(vote.byUser||{}).length));
  const status=vote?.allDone?`Eure Auswahl steht fest · ${vote.winners.length} ${vote.winners.length===1?'Favorit':'Favoriten'}`:vote?.meDone?`Du hast gewählt · ${waiting} ${waiting===1?'Stimme fehlt':'Stimmen fehlen'} noch`:reviewReady&&candidates.length?'Bereit für eure Lieblingsmomente':reviewReady?'Gemeinsam angesehen':'Ihr entscheidet gerade, was ins Album soll';
  const voteAction=candidates.length&&(reviewReady||hasVoteProgress)?(vote?.allDone?`<button type="button" class="primary" data-vote-result="${esc(clusterId)}">Ergebnis ansehen</button>`:`<button type="button" class="primary" data-vote-open="${esc(clusterId)}">${vote?.meDone?'Punkte ändern':'Lieblingsmomente wählen'}</button>`):'';
  const summaryChips=`<span class="mc-deck-summary-chips"><b>${heroCount} Foto${heroCount===1?'':'s'}</b>${storyCount?`<b>${storyCount} ${storyCount===1?'Geschichte':'Geschichten'}</b>`:''}${signalCount?`<b>${signalCount} Moment${signalCount===1?'':'e'}</b>`:''}</span>`;
  return `<div class="mc-deck-wrap"><button class="mc-deck" data-stack="${esc(key)}" style="--deck-rot:${rot}deg;--deck-lift:${lift}px;--deck-accent:${esc(accent)}">
    ${layers}
    <span class="mc-deck-front tone-${cardTone(hero.card_type)}" style="--person-color:${esc(accent)}"><span class="mc-deck-photo" data-card-media="${esc(hero.media_id||'')}">${hero.media_id?'':`<b>${typeIcon(hero.card_type)}</b>`}</span><span class="mc-deck-info"><span class="mc-deck-meta"><small>${items.length} Karten · ${people.length} ${people.length===1?'Stimme':'Stimmen'}</small><span class="mc-voices">${voices}</span></span><span class="mc-deck-day">${esc(titleParts.day)}</span><strong>${esc(titleParts.title)}</strong></span></span>
  </button><div class="mc-deck-summary">${summaryChips}<span class="mc-deck-summary-status">${esc(status)}</span></div>${cluster?`<div class="mc-deck-curation"><button type="button" data-title-propose="${esc(clusterId)}">Titel vorschlagen${proposals.length?` · ${proposals.length}`:''}</button>${voteAction}${isTripOwner()?`<button type="button" class="danger" data-stack-dissolve="${esc(clusterId)}">Stapel auflösen</button>`:''}</div>`:''}</div>`
}

function curationModal(html){const root=document.createElement('div');root.className='mc-curation-modal';root.innerHTML=`<div class="mc-curation-dialog">${html}</div>`;const ui=LuviaUI;if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');const mounted=ui.adopt(root,{name:'consumer.memory-worlds.curation',kind:'dialog',closeSelector:'[data-modal-close]'}),close=()=>mounted.close('owner');root.addEventListener('click',e=>{if(e.target===root)close()});root.querySelectorAll('[data-modal-close]').forEach(b=>b.addEventListener('click',close));return{root,close}}
function openTitleModal(clusterId){const proposals=homeState?.curation?.proposals?.[String(clusterId)]||[],uid=String(me().id||''),own=proposals.find(p=>String(p.user_id)===uid)?.title||'';const m=curationModal(`<button class="mc-modal-x" data-modal-close>×</button><small>EUER STAPEL · TITELIDEE</small><h2>Wie soll dieser Moment heißen?</h2><p>Jeder Mitreisende darf einen Vorschlag machen. Später entscheidet ihr gemeinsam, welcher Titel bleibt.</p><label>Dein Vorschlag<input data-title-input maxlength="90" value="${esc(own)}" placeholder="z. B. Parade, Sonne und schönes Chaos"></label><div class="mc-modal-actions"><button data-modal-close>Abbrechen</button><button class="is-primary" data-save-title>Vorschlag speichern</button></div>`);const input=m.root.querySelector('[data-title-input]');setTimeout(()=>input?.focus(),80);m.root.querySelector('[data-save-title]').onclick=async e=>{const title=input.value.trim();if(!title)return;const b=e.currentTarget;b.disabled=true;try{await window.LuviaMemoryCards.saveTitleProposal(clusterId,title);m.close();await renderHome()}catch(err){b.disabled=false;input.setCustomValidity(err.message||'Speichern nicht möglich');input.reportValidity()}}}
async function openVotingModal(clusterId){
  const key=`cluster:${clusterId}`,cluster=clusterForKey(key,homeState?.clusters||[]),items=experienceCards(homeState?.grouped?.get(key)||[],cluster),candidates=candidateCards(items,homeState?.reviewSummary);if(!candidates.length)return;
  const budget=voteBudget(candidates.length),saved=await window.LuviaMemoryCards.albumVotes?.(clusterId,candidates.map(c=>c.id))||{},votes=Object.assign(Object.fromEntries(candidates.map(c=>[String(c.id),0])),saved),mediaMap=new Map((homeState?.src?.media||[]).map(x=>[String(x.id),x]));
  const rowMarkup=candidates.map(c=>{const cls=curationClass(c),valuable=storyValuable(c),name=whoName(c,homeState.members),text=experiencePrimary(c),signal=c._experience?.reaction||c.reaction||typeIcon(c.card_type);return `<article data-vote-card="${esc(c.id)}" class="mc-vote-card vote-${cls}"><button type="button" class="mc-vote-preview ${c.media_id?'has-photo':''}" ${c.media_id?`data-vote-media="${esc(c.media_id)}" data-open-gallery-photo="${esc(c.media_id)}" aria-label="Foto groß anzeigen"`:''}>${c.media_id?'':`<span>${esc(signal)}</span>`}</button><div class="mc-vote-copy"><small>${esc(experienceLabel(c))} · ${esc(name)}</small><strong>${esc(c.media_id?(text||'Dieses Foto'):text||typeName(c.card_type))}</strong>${cls==='story'?`<p>${valuable?'Eine persönliche Mini-Geschichte für euer Album.':'Noch zu kurz für eine Album-Geschichte.'}</p>`:''}${cls==='signal'&&c.content?`<p>${esc(c.content)}</p>`:''}</div><div class="mc-vote-points">${[0,1,2,3].map(n=>`<button data-points="${n}" class="${Number(votes[String(c.id)]||0)===n?'is-selected':''}">${n}</button>`).join('')}</div></article>`}).join('');
  const m=curationModal(`<button class="mc-modal-x" data-modal-close>×</button><small>EURE LIEBLINGSMOMENTE</small><h2>Welche Erinnerungen sollen besonders zählen?</h2><p class="mc-budget-copy"><b data-budget-status></b> Je wichtiger dir eine Erinnerung ist, desto mehr Punkte kannst du ihr geben.</p><div class="mc-vote-list">${rowMarkup}</div><div class="mc-modal-actions"><button data-modal-close>Später</button><button class="is-primary" data-save-votes>Auswahl speichern</button></div>`);
  for(const el of m.root.querySelectorAll('[data-vote-media]')){const media=mediaMap.get(String(el.dataset.voteMedia));if(media)await putImg(el,media)};m.root.querySelectorAll('[data-open-gallery-photo]').forEach(el=>el.onclick=e=>{e.stopPropagation();window.LuviaGalleryView?.openPhoto?.(el.dataset.openGalleryPhoto)})
  const left=()=>budget-Object.values(votes).reduce((a,b)=>a+Number(b||0),0),refresh=()=>{const remaining=Math.max(0,left()),status=m.root.querySelector('[data-budget-status]');if(status)status.textContent=remaining?`Noch ${remaining} von ${budget} Punkten verfügbar.`:`Alle ${budget} Punkte vergeben.`;m.root.querySelectorAll('[data-vote-card]').forEach(row=>row.querySelectorAll('[data-points]').forEach(b=>b.classList.toggle('is-selected',Number(votes[row.dataset.voteCard]||0)===Number(b.dataset.points))))};
  m.root.querySelectorAll('[data-vote-card]').forEach(row=>row.querySelectorAll('[data-points]').forEach(b=>b.onclick=()=>{const id=row.dataset.voteCard,n=Number(b.dataset.points),current=Number(votes[id]||0);if(left()+current-n<0){b.classList.add('limit-hit');setTimeout(()=>b.classList.remove('limit-hit'),300);return}votes[id]=n;refresh()}));
  m.root.querySelector('[data-save-votes]').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{await window.LuviaMemoryCards.saveAlbumVotes(clusterId,votes,budget);m.close();await renderHome()}catch(err){b.disabled=false;alert(err.message||err)}};refresh()
}
async function openVotingResults(clusterId){
  const key=`cluster:${clusterId}`,cluster=clusterForKey(key,homeState?.clusters||[]),items=experienceCards(homeState?.grouped?.get(key)||[],cluster),candidates=candidateCards(items,homeState?.reviewSummary),progress=clusterVoteProgress(clusterId,candidates,homeState?.voteSummary,homeState?.members||[]),byId=new Map(items.map(c=>[String(c.id),c])),mediaMap=new Map((homeState?.src?.media||[]).map(x=>[String(x.id),x]));
  const ranked=progress.ranking.filter(x=>x.points>0);if(!ranked.length){const m=curationModal(`<button class="mc-modal-x" data-modal-close>×</button><small>EURE AUSWAHL</small><h2>Noch kein gemeinsamer Favorit</h2><p>Alle haben gewählt, aber bisher hat keine Karte Punkte bekommen. Ihr könnt eure Punkte jederzeit noch einmal ändern.</p><div class="mc-modal-actions"><button data-modal-close>Schließen</button><button class="is-primary" data-result-edit>Punkte ändern</button></div>`);m.root.querySelector('[data-result-edit]').onclick=()=>{m.close();openVotingModal(clusterId)};return}
  let rank=0,last=null;const rows=ranked.map((r,i)=>{if(last!==r.points)rank=i+1;last=r.points;const c=byId.get(r.id),name=whoName(c,homeState.members),individual=(homeState.members||[]).map(mem=>{const pts=Number(progress.byUser?.[String(mem.id)]?.cards?.[r.id]||0);return pts?`${esc(mem.displayName)} ${pts}`:''}).filter(Boolean).join(' · ');return `<article class="mc-result-card" data-result-card="${esc(r.id)}"><div class="mc-result-rank">#${rank}</div><button type="button" class="mc-result-preview ${c?.media_id?'has-photo':''}" ${c?.media_id?`data-result-media="${esc(c.media_id)}" data-open-gallery-photo="${esc(c.media_id)}" aria-label="Foto groß anzeigen"`:''}>${c?.media_id?'':`<span>${typeIcon(c?.card_type)}</span>`}</button><div><small>${esc(experienceLabel(c))} · ${esc(name)}</small><strong>${esc(experiencePrimary(c)||experienceLabel(c))}</strong><p>${r.points} ${r.points===1?'Punkt':'Punkte'}${individual?` · ${individual}`:''}</p></div></article>`}).join('');
  const m=curationModal(`<button class="mc-modal-x" data-modal-close>×</button><small>EURE AUSWAHL STEHT FEST</small><h2>Diese Erinnerungen zählen für euch am meisten.</h2><p>Die höchst bewerteten Karten werden beim späteren Reisealbum besonders berücksichtigt. Nichts wird gelöscht – eure Punkte bilden die gemeinsame Reihenfolge.</p><div class="mc-result-list">${rows}</div><div class="mc-result-note">✨ ${ranked.length} ${ranked.length===1?'Erinnerung':'Erinnerungen'} mit Punkten · Gleichstände bleiben gleichwertig.</div><div class="mc-modal-actions"><button data-modal-close>Schließen</button><button class="is-primary" data-result-edit>Punkte ändern</button></div>`);
  for(const el of m.root.querySelectorAll('[data-result-media]')){const media=mediaMap.get(String(el.dataset.resultMedia));if(media)await putImg(el,media)};m.root.querySelectorAll('[data-open-gallery-photo]').forEach(el=>el.onclick=e=>{e.stopPropagation();window.LuviaGalleryView?.openPhoto?.(el.dataset.openGalleryPhoto)});m.root.querySelector('[data-result-edit]').onclick=()=>{m.close();openVotingModal(clusterId)}
}

async function paintCardPhotos(root,cards,media){const map=new Map(media.map(m=>[String(m.id),m]));for(const el of root.querySelectorAll('[data-card-media]')){const m=map.get(String(el.dataset.cardMedia));if(m)await putImg(el,m)}}

function overlay({deck=false,onClose=null}={}){const root=document.createElement('div');root.className=deck?'mc-overlay mc-deck-overlay':'mc-overlay';root.innerHTML='<div class="mc-flow"></div><div class="mc-overlay-nav"><button class="mc-back" aria-label="Zurück">←</button><button class="mc-x" aria-label="Schließen">×</button></div>';const ui=LuviaUI;if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');document.body.classList.add('mc-open');let timer=null,closing=false;const mounted=ui.adopt(root,{name:deck?'consumer.memory-worlds.deck':'consumer.memory-worlds.flow',kind:'sheet',content:root.querySelector('.mc-flow'),closeOnBackdrop:false,closeSelector:'',label:deck?'Memory Moment':'Memory World',onClose:reason=>{if(timer)clearTimeout(timer);document.body.classList.remove('mc-open');onClose?.(reason)}});const close=(delay=260)=>{if(closing||mounted.closed)return;closing=true;root.classList.add('closing');timer=setTimeout(()=>mounted.close('owner'),delay)};root.querySelector('.mc-x').onclick=()=>close();return{root,flow:root.querySelector('.mc-flow'),back:root.querySelector('.mc-back'),close}}
async function swap(ctx,html,{motion='fade',showBack=true}={}){
  const old=ctx.flow.firstElementChild;
  if(old){old.classList.add('is-leaving');await new Promise(r=>setTimeout(r,180));old.remove()}
  const n=document.createElement('section');n.className=`mc-screen motion-${motion}`;n.innerHTML=html;ctx.flow.append(n);ctx.back.hidden=!showBack;requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add('is-visible')));return n
}

async function openDiscovery(cluster,media,members,startStep=0){
  const ctx=overlay(),cards=await window.LuviaMemoryCards.list({clusterId:cluster.id}),uid=String(me().id||'');
  const state={step:startStep,photoIds:cards.filter(c=>String(c.author_id)===uid&&c.card_type==='photo'&&c.media_id).map(c=>String(c.media_id)).slice(0,3),answer:cards.find(c=>String(c.author_id)===uid&&c.card_type==='quote')?.content||'',reaction:cards.find(c=>String(c.author_id)===uid&&c.card_type==='reaction')?.reaction||'',vibe:cards.find(c=>String(c.author_id)===uid&&c.card_type==='vibe')?.metadata?.value||'',question:QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)]};
  ctx.back.onclick=()=>{if(state.step<=0){ctx.close();return}state.step--;show()};
  async function show(){
    if(state.step===0){const p=await swap(ctx,`<div class="mc-intro-copy"><small>HERO CARDS · DEIN BLICK</small><h1>Welche Fotos sollen in euren Kartenstapel?</h1><p>Markiere bis zu drei Bilder. So können mehrere Perspektiven später gemeinsam fürs Album bewertet werden.</p></div><div class="mc-photo-choice mc-photo-choice-multi">${media.slice(0,12).map((m,i)=>`<button data-photo="${esc(m.id)}" data-pi="${i}" class="${state.photoIds.includes(String(m.id))?'picked':''}"><figure></figure><span>${state.photoIds.includes(String(m.id))?'✓ Im Stapel':'Auswählen'}</span></button>`).join('')}</div><div class="mc-photo-selection-meta"><b data-photo-count>${state.photoIds.length}</b> von 3 Fotos ausgewählt</div><button class="mc-primary" data-next ${state.photoIds.length?'':'disabled'}>Weiter</button>`,{motion:'focus',showBack:false});for(const b of p.querySelectorAll('[data-photo]')){putImg(b.querySelector('figure'),media[Number(b.dataset.pi)]);b.onclick=()=>{const id=String(b.dataset.photo),pos=state.photoIds.indexOf(id);if(pos>=0)state.photoIds.splice(pos,1);else if(state.photoIds.length<3)state.photoIds.push(id);else{b.classList.add('limit-hit');setTimeout(()=>b.classList.remove('limit-hit'),350);return}p.querySelectorAll('[data-photo]').forEach(x=>{const hit=state.photoIds.includes(String(x.dataset.photo));x.classList.toggle('picked',hit);x.querySelector('span').textContent=hit?'✓ Im Stapel':'Auswählen'});p.querySelector('[data-photo-count]').textContent=String(state.photoIds.length);p.querySelector('[data-next]').disabled=!state.photoIds.length}}p.querySelector('[data-next]').onclick=async()=>{await window.LuviaMemoryCards.syncPhotoCandidates(cluster.id,state.photoIds);state.step=1;show()}}
    else if(state.step===1){const p=await swap(ctx,`<div class="mc-question"><small>DEIN BLICK</small><h1>${esc(state.question)}</h1><textarea maxlength="420" placeholder="Erzähl in 1–3 Sätzen, was auf den Fotos allein nicht zu sehen ist.">${esc(state.answer)}</textarea><div class="mc-counter"><span data-count>${state.answer.length}</span>/420</div><div class="mc-question-actions"><button class="mc-link" data-other>↻ Andere Frage</button><button class="mc-primary" data-next>So lassen</button></div></div>`,{motion:'soft'});const ta=p.querySelector('textarea');setTimeout(()=>ta.focus(),220);ta.oninput=()=>{state.answer=ta.value;p.querySelector('[data-count]').textContent=ta.value.length};p.querySelector('[data-other]').onclick=async()=>{const title=p.querySelector('h1');title.classList.add('text-swap');await new Promise(r=>setTimeout(r,140));state.question=QUESTIONS[(QUESTIONS.indexOf(state.question)+1)%QUESTIONS.length];title.textContent=state.question;requestAnimationFrame(()=>title.classList.remove('text-swap'))};p.querySelector('[data-next]').onclick=async()=>{if(state.answer.trim())await window.LuviaMemoryCards.save({cardType:'quote',sourceType:'cluster-discovery',clusterId:cluster.id,content:state.answer,dedupeKey:`cluster:${cluster.id}:author:${uid}:quote`,metadata:{question:state.question,curation_class:'story',story_enriched:state.answer.trim().length>=80&&state.answer.trim().split(/\s+/).filter(Boolean).length>=12,story_context:true}});state.step=2;show()}}
    else if(state.step===2){const p=await swap(ctx,`<div class="mc-vibe"><small>OHNE VIELE WORTE</small><h1>Was war das für ein Moment?</h1><div class="mc-vibe-grid">${VIBES.map(([k,l,e])=>`<button data-vibe="${k}" class="${state.vibe===k?'picked':''}"><b>${e}</b><span>${l}</span></button>`).join('')}</div><h2>Und welches Gefühl passt sofort?</h2><div class="mc-reactions">${REACTIONS.map(r=>`<button data-react="${r}" class="${state.reaction===r?'picked':''}">${r}</button>`).join('')}</div><button class="mc-primary" data-next>Aufdecken</button></div>`,{motion:'rise'});p.querySelectorAll('[data-vibe]').forEach(b=>b.onclick=()=>{state.vibe=b.dataset.vibe;p.querySelectorAll('[data-vibe]').forEach(x=>x.classList.toggle('picked',x===b))});p.querySelectorAll('[data-react]').forEach(b=>b.onclick=()=>{state.reaction=b.dataset.react;p.querySelectorAll('[data-react]').forEach(x=>x.classList.toggle('picked',x===b))});p.querySelector('[data-next]').onclick=async()=>{if(state.vibe||state.reaction){const hit=VIBES.find(x=>x[0]===state.vibe);await window.LuviaMemoryCards.save({cardType:'vibe',sourceType:'cluster-discovery',clusterId:cluster.id,content:hit?.[1]||'Ein Gefühl, das geblieben ist',reaction:'',dedupeKey:`cluster:${cluster.id}:author:${uid}:vibe`,metadata:{value:state.vibe||null,curation_class:'signal',role:'supporting-context'}});if(state.reaction)await window.LuviaMemoryCards.save({cardType:'reaction',sourceType:'cluster-discovery',clusterId:cluster.id,content:hit?.[1]?`Passte zu: ${hit[1]}`:'Spontane Reaktion',reaction:state.reaction,dedupeKey:`cluster:${cluster.id}:author:${uid}:reaction`,metadata:{vibe:state.vibe||null,curation_class:'signal',role:'moment-accent'}})}state.step=3;show()}}
    else {const freshRaw=await window.LuviaMemoryCards.list({clusterId:cluster.id}),fresh=experienceCards(freshRaw,cluster);const p=await swap(ctx,`<div class="mc-reveal-head"><small>AUFGEDECKT</small><h1>So erinnert ihr euch daran.</h1><p>${members.length>1?'Jede Perspektive darf anders sein. Genau daraus entsteht später eure gemeinsame Geschichte.':'Deine Cards sind gespeichert. Sobald weitere Reisende beitragen, erscheinen ihre Perspektiven hier.'}</p></div><div class="mc-reveal">${fresh.map((c,i)=>renderLooseCard(c,members,i,'reveal')).join('')}</div><div class="mc-finish"><button class="mc-primary" data-done>Zum Kartenstapel</button><span>${fresh.length} Cards entstanden</span></div>`,{motion:'scatter'});await paintLoosePhotos(p,fresh,media);p.querySelectorAll('[data-weight][data-own="1"]').forEach(b=>b.onclick=async()=>{const c=fresh.find(x=>String(x.id)===String(b.dataset.weight));const next=Number(c.weight)>=3?1:Number(c.weight)+1;await window.LuviaMemoryCards.setWeight(c.id,next);b.textContent=weightLabel(next);c.weight=next});p.querySelectorAll('[data-weight][data-own="0"]').forEach(b=>b.disabled=true);p.querySelector('[data-done]').onclick=()=>{ctx.close();setTimeout(renderHome,300)}}
  }
  show();
}

function renderLooseCard(c,members,i,mode='deck'){
  const uid=String(me().id||''),rot=((seeded(c.id,i)-.5)*(mode==='deck'?3.0:1.6)).toFixed(2),x=Math.round((seeded(c.id,i+10)-.5)*22),y=Math.round((seeded(c.id,i+20)-.5)*18);
  const group=homeState?.grouped?[...homeState.grouped.values()].find(list=>list.some(x=>String(x.id)===String(c.id)))||[]:[];const cls=curationClass(c);const visual=resolveMemoryVisualPalette(group.length?group:[c],members);const accent=memberColor(c.author_id,members)||(visual.mode==='multi'?visual.primary:visual.trip),name=whoName(c,members),label=experienceLabel(c);
  const exp=c._experience||null,siblingVibe=group.find(v=>v.card_type==='vibe'&&String(v.author_id)===String(c.author_id));
  const reactionContext=exp?.kind==='moment'?`<div class="mc-moment-context"><span>${esc(exp.vibeLabel||'Ein Moment, der geblieben ist')}</span>${exp.reaction?`<b>${esc(exp.reaction)}</b>`:''}</div>`:(exp?.kind==='story'&&(exp.vibeLabel||exp.reaction)?`<div class="mc-story-context">${exp.reaction?`<b>${esc(exp.reaction)}</b>`:''}${exp.vibeLabel?`<span>${esc(exp.vibeLabel)}</span>`:''}</div>`:(c.card_type==='reaction'&&siblingVibe?`<p class="mc-signal-caption">${esc(whoName(c,members))}: ${esc(siblingVibe.content||'Ein Gefühl, das geblieben ist')}</p>`:''));
  const primary=experiencePrimary(c),content=primary?`${cls==='story'?'<span class="mc-story-kicker">Unsere kleine Geschichte</span>':exp?.kind==='moment'?'<span class="mc-story-kicker">So war dieser Moment</span>':''}<p>${esc(primary.replace(/^Passte zu:\s*/i,''))}</p>`:'';
  const reaction=exp?.kind==='moment'?'':(c.reaction?`<strong>${esc(c.reaction)}</strong>`:(c.card_type==='reaction'?`<strong>${esc(c.content||'✨')}</strong>`:''));
  const textLength=String(c.content||c.reaction||'').trim().length,textClass=textLength>100?'text-long':textLength>48?'text-medium':'text-short';
  return `<article class="mc-loose-card tone-${cardTone(c.card_type)} curation-${cls} w${c.weight} ${textClass}" data-loose-card="${esc(c.id)}" style="--card-rot:${rot}deg;--card-x:${x}px;--card-y:${y}px;--card-i:${i};--person-color:${esc(accent)}"><div class="mc-card-ribbon"></div><div class="mc-loose-media" data-mid="${esc(c.media_id||'')}">${c.media_id?'':`<span class="mc-card-symbol">${typeIcon(c.card_type)}</span><em>${esc(label)}</em>`}</div><div class="mc-loose-copy"><div class="mc-card-author"><span style="--avatar:${esc(accent)}">${esc(memberInitial(c.author_id,members))}</span><small>${esc(name)}</small></div>${content}${reaction}${reactionContext}${cls==='story'&&!storyValuable(c)&&String(c.author_id)===uid&&mode==='deck'?`<button type="button" class="mc-story-enrich" data-story-edit="${esc(c.id)}">Erinnerung ergänzen</button>`:''}<div class="mc-card-foot"><i>${esc(label)}</i><button class="mc-weight" data-weight="${esc(c.id)}" data-own="${String(c.author_id)===uid?'1':'0'}">${weightLabel(c.weight)}</button></div>${mode==='deck'?`<div class="mc-album-review" aria-label="Auswahl fürs zukünftige Memory Album"><button type="button" data-album-review="excluded" data-card-id="${esc(c.id)}" title="Nicht ins Album"><b>←</b><span>Nicht ins Album</span></button><button type="button" data-album-review="included" data-card-id="${esc(c.id)}" title="Für Album behalten"><span>Für Album</span><b>→</b></button></div>`:''}</div></article>`
}
function openStoryEditModal(card,onSaved){const current=String(card?.content||'').trim();const m=curationModal(`<button class="mc-modal-x" data-modal-close>×</button><small>DEINE GESCHICHTE</small><h2>Was macht diese Erinnerung erzählenswert?</h2><p>Ein guter Album-Text erzählt mehr als eine Überschrift: Was ist passiert, was war überraschend – und warum ist dir genau das geblieben?</p><label>Deine Mini-Geschichte<textarea data-story-input maxlength="420" rows="6" placeholder="z. B. Wir wollten eigentlich nur kurz stehen bleiben …">${esc(current)}</textarea></label><div class="mc-story-hint">Mindestens ein paar vollständige Sätze helfen, damit daraus später eine echte Story Card wird.</div><div class="mc-modal-actions"><button data-modal-close>Abbrechen</button><button class="is-primary" data-save-story>Geschichte speichern</button></div>`);const input=m.root.querySelector('[data-story-input]');setTimeout(()=>input?.focus(),80);m.root.querySelector('[data-save-story]').onclick=async e=>{const text=input.value.replace(/\s+/g,' ').trim();if(text.length<80||text.split(/\s+/).filter(Boolean).length<12){input.setCustomValidity('Für eine Story Card brauchen wir ein paar vollständige Sätze mit etwas Kontext.');input.reportValidity();return}const b=e.currentTarget;b.disabled=true;try{const saved=await window.LuviaMemoryCards.updateStory(card.id,text);card.content=saved.content;card.metadata=saved.metadata||{};m.close();await onSaved?.(saved)}catch(err){b.disabled=false;input.setCustomValidity(err.message||'Speichern nicht möglich');input.reportValidity()}}}
async function paintLoosePhotos(root,cards,media){const map=new Map(media.map(m=>[String(m.id),m]));for(const el of root.querySelectorAll('[data-mid]')){const m=map.get(String(el.dataset.mid));if(m)await putImg(el,m)}}

async function openDeck(key,sourceEl){
  if(!homeState)return;
  let items=homeState.grouped.get(key)||[];if(!items.length)return;
  const cluster=clusterForKey(key,homeState.clusters);items=experienceCards(items,cluster);const media=cluster?await window.LuviaMemoryAlbums.mediaByIds(cluster.mediaIds):homeState.src.media||[];
  const home=host.querySelector('.mc-home');const decks=[...host.querySelectorAll('.mc-deck')];decks.forEach(d=>d.classList.toggle('is-source',d===sourceEl));home?.classList.add('is-deck-opening');
  await new Promise(r=>setTimeout(r,520));
  const ctx=overlay({deck:true,onClose:()=>{home?.classList.remove('is-deck-opening');decks.forEach(d=>d.classList.remove('is-source'))}});ctx.root.classList.add('mc-canvas-overlay');
  const baseClose=ctx.close;ctx.close=()=>baseClose(420);ctx.root.querySelector('.mc-x').onclick=ctx.close;
  const visual=resolveMemoryVisualPalette(items,homeState.members),people=visual.people;
  const [stageA,stageB]=stagePalette(items,homeState.members);ctx.root.style.setProperty('--mc-stage-a',stageA);ctx.root.style.setProperty('--mc-stage-b',stageB);ctx.root.style.setProperty('--mc-stage-trip',tripAccent());
  ctx.back.onclick=()=>ctx.close();
  const showSpread=async()=>{
    const arranged=shuffled(items,`${key}:${Math.random()}`);
    const mobile=matchMedia('(max-width:800px)').matches;
    const cardsMarkup=mobile?`<div class="mc-mobile-throw" data-throw-deck><div class="mc-throw-stack">${arranged.map((c,i)=>`<section class="mc-throw-card" data-throw-card="${i}" style="--throw-order:${i}">${renderLooseCard(c,homeState.members,i,'deck')}</section>`).join('')}<div class="mc-swipe-feedback mc-swipe-feedback-left" data-swipe-feedback="excluded"><b>←</b><strong>Nicht ins Album</strong><small>Die Erinnerung bleibt erhalten.</small></div><div class="mc-swipe-feedback mc-swipe-feedback-right" data-swipe-feedback="included"><strong>Für Album behalten</strong><b>→</b><small>Für euer späteres Memory Album vorgemerkt.</small></div></div><div class="mc-throw-meta"><span><b data-throw-index>1</b> von ${arranged.length}</span><em>Wische links oder rechts und entscheide fürs Album.</em></div><div class="mc-review-complete" data-review-complete hidden><small>REVIEW ABGESCHLOSSEN</small><h3>Alle Karten geprüft.</h3><p><b data-review-included-count>0</b> fürs Album behalten · <b data-review-excluded-count>0</b> nicht ausgewählt</p><div><button type="button" data-review-again>Auswahl erneut prüfen</button><button type="button" class="is-primary" data-review-close>Zurück zu Erinnerungen</button></div></div></div>`:`<div class="mc-spread" data-count="${items.length}">${arranged.map((c,i)=>renderLooseCard(c,homeState.members,i,'deck')).join('')}</div>`;
    const p=await swap(ctx,`<div class="mc-deck-stage-head"><div class="mc-stage-head-surface"><small>MEMORY MOMENT</small>${cluster?`<b class="mc-stage-day">${esc(stackTitleParts(cluster,homeState?.curation?.states?.[String(cluster.id)],homeState.src.media||[]).day)}</b>`:''}<h2>${cluster?esc(stackTitleParts(cluster,homeState?.curation?.states?.[String(cluster.id)],homeState.src.media||[]).title):'Eure Karten'}</h2><span>${items.length} ${items.length===1?'Erinnerung':'Erinnerungen'} · ${people.length} ${people.length===1?'Stimme':'Stimmen'}</span></div></div><div class="mc-stage-atmosphere" aria-hidden="true"><span class="mc-route mc-route-a"></span><span class="mc-route mc-route-b"></span><span class="mc-route mc-route-c"></span><span class="mc-postmark">LUVIA · MOMENT</span><span class="mc-travel-sketch mc-sketch-ticket">BON VOYAGE</span><span class="mc-travel-sketch mc-sketch-photo">MEMORY</span><span class="mc-travel-sketch mc-sketch-pin">⌖</span><span class="mc-travel-sketch mc-sketch-heart">♡</span><span class="mc-travel-sketch mc-sketch-plane">✈︎</span></div><div class="mc-stage-decor" aria-hidden="true"><i>✦</i><i>✈</i><i>⌖</i><i>♡</i><i>↝</i><i>⌾</i><i>⌁</i><i>✦</i><i>△</i><i>· · ·</i></div>${cardsMarkup}${cluster?'<button class="mc-continue" data-continue>Moment weiter ergänzen</button>':''}`,{motion:'scatter',showBack:true});
    await paintLoosePhotos(p,arranged,media);
    let reviews={};try{reviews=await window.LuviaMemoryCards.albumReviews?.(arranged.map(c=>c.id))||{};p.querySelectorAll('[data-album-review]').forEach(b=>b.classList.toggle('is-selected',reviews[String(b.dataset.cardId)]===b.dataset.albumReview));}catch(error){console.warn('[MemoryReview] Bestehende Auswahl konnte nicht geladen werden.',error)}
    if(!mobile)positionSpread(p.querySelector('.mc-spread'),arranged,true);
    else bindThrowDeck(p.querySelector('[data-throw-deck]'),arranged,reviews,()=>closeSpread());
    for(const card of p.querySelectorAll('[data-loose-card]'))card.onclick=e=>{if(e.target.closest('button')||card.closest('.mc-throw-card')?.dataset.dragged==='1')return;openCardDetail(ctx,items.find(x=>String(x.id)===String(card.dataset.looseCard)),homeState.members,media,showSpread)};
    p.querySelectorAll('[data-weight][data-own="1"]').forEach(b=>b.onclick=async e=>{e.stopPropagation();const c=items.find(x=>String(x.id)===String(b.dataset.weight));const next=Number(c.weight)>=3?1:Number(c.weight)+1;await window.LuviaMemoryCards.setWeight(c.id,next);c.weight=next;b.textContent=weightLabel(next);b.closest('.mc-loose-card')?.classList.remove('w1','w2','w3');b.closest('.mc-loose-card')?.classList.add(`w${next}`)});
    p.querySelectorAll('[data-album-review]').forEach(b=>b.onclick=async e=>{e.stopPropagation();b.disabled=true;try{await window.LuviaMemoryCards.setAlbumReview(b.dataset.cardId,b.dataset.albumReview);reviews[String(b.dataset.cardId)]=b.dataset.albumReview;const row=b.closest('.mc-album-review'),card=b.closest('.mc-loose-card');row?.querySelectorAll('button').forEach(x=>x.classList.toggle('is-selected',x===b));card?.classList.toggle('is-album-included',b.dataset.albumReview==='included');card?.classList.toggle('is-album-excluded',b.dataset.albumReview==='excluded');}catch(error){console.warn('[MemoryReview]',error)}finally{b.disabled=false}});
    p.querySelectorAll('[data-story-edit]').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=items.find(x=>String(x.id)===String(b.dataset.storyEdit));if(c)openStoryEditModal(c,async()=>{await renderHome();showSpread()})});
    if(cluster)p.querySelector('[data-continue]').onclick=()=>{ctx.close();setTimeout(()=>openDiscovery(cluster,media,homeState.members,0),460)};
    ctx.back.onclick=()=>closeSpread();
  };
  const closeSpread=async()=>{
    const spread=ctx.flow.querySelector('.mc-spread');if(spread){spread.classList.add('is-gathering');spread.classList.remove('mc-motion-ready');await new Promise(r=>setTimeout(r,960))}
    ctx.close();
    // Refresh persisted review/vote summaries after the overlay closes. Album review
    // decisions live in their own table and are not covered by the memory-card
    // subscription, so the overview must explicitly reload them here.
    setTimeout(()=>{if(host)renderHome()},460);
  };
  await showSpread();
}
function bindThrowDeck(root,items,initialReviews={},onClose){
  const total=items.length;
  if(!root)return;
  const stack=root.querySelector('.mc-throw-stack'),indexEl=root.querySelector('[data-throw-index]'),complete=root.querySelector('[data-review-complete]'),includedEl=root.querySelector('[data-review-included-count]'),excludedEl=root.querySelector('[data-review-excluded-count]');
  if(!stack)return;
  const cards=[...stack.querySelectorAll('.mc-throw-card')],feedbackLeft=stack.querySelector('[data-swipe-feedback="excluded"]'),feedbackRight=stack.querySelector('[data-swipe-feedback="included"]');let cursor=0,active=null,startX=0,startY=0,lastX=0,lastT=0,velocity=0,reviews={...initialReviews};
  const depthPreset=[
    {x:0,y:0,r:0,scale:1,opacity:1},
    {x:-13,y:21,r:-2.6,scale:.981,opacity:.93},
    {x:15,y:40,r:2.9,scale:.961,opacity:.84},
    {x:-9,y:58,r:-3.3,scale:.941,opacity:.74}
  ];
  const feedback=(x=0,threshold=120)=>{const amount=Math.min(1,Math.abs(x)/Math.max(1,threshold));if(feedbackLeft){feedbackLeft.style.setProperty('--swipe-feedback',x<0?String(amount):'0');feedbackLeft.classList.toggle('is-armed',x<0&&amount>.72)}if(feedbackRight){feedbackRight.style.setProperty('--swipe-feedback',x>0?String(amount):'0');feedbackRight.classList.toggle('is-armed',x>0&&amount>.72)}};
  const updateComplete=()=>{const values=items.map(x=>reviews[String(x.id)]),inc=values.filter(x=>x==='included').length,exc=values.filter(x=>x==='excluded').length;if(includedEl)includedEl.textContent=String(inc);if(excludedEl)excludedEl.textContent=String(exc)};
  const refresh=()=>{cards.forEach((card,i)=>{const rel=i-cursor,depth=Math.max(0,rel),preset=depthPreset[Math.min(depth,depthPreset.length-1)];card.hidden=rel<0||rel>3;card.style.setProperty('--throw-depth',String(depth));card.style.setProperty('--stack-x',`${preset.x}px`);card.style.setProperty('--stack-y',`${preset.y}px`);card.style.setProperty('--stack-r',`${preset.r}deg`);card.style.setProperty('--stack-scale',String(preset.scale));card.style.setProperty('--stack-opacity',String(preset.opacity));card.classList.toggle('is-front',rel===0)});if(indexEl)indexEl.textContent=String(Math.min(cursor+1,total));const done=cursor>=total;root.classList.toggle('is-complete',done);if(complete)complete.hidden=!done;updateComplete();feedback(0)};
  const settle=card=>{card.classList.add('is-settling');card.style.setProperty('--drag-x','0px');card.style.setProperty('--drag-y','0px');card.style.setProperty('--drag-r','0deg');feedback(0);setTimeout(()=>{card.classList.remove('is-settling');card.style.removeProperty('--drag-x');card.style.removeProperty('--drag-y');card.style.removeProperty('--drag-r')},300)};
  const throwAway=(card,dir,y)=>{const cardId=items[cursor]?.id||card.querySelector('[data-loose-card]')?.dataset.looseCard,decision=dir>0?'included':'excluded';if(cardId){reviews[String(cardId)]=decision;window.LuviaMemoryCards?.setAlbumReview?.(cardId,decision).catch(error=>console.warn('[MemoryReview]',error))}const target=dir>0?feedbackRight:feedbackLeft;target?.classList.add('is-committed');const distance=Math.max(innerWidth*1.32,680)*dir;card.dataset.dragged='1';card.classList.add('is-thrown');card.style.setProperty('--drag-x',`${distance}px`);card.style.setProperty('--drag-y',`${Math.max(-150,Math.min(150,y*.50))}px`);card.style.setProperty('--drag-r',`${dir*22}deg`);setTimeout(()=>{cursor++;refresh();card.hidden=true;card.classList.remove('is-thrown');card.style.removeProperty('--drag-x');card.style.removeProperty('--drag-y');card.style.removeProperty('--drag-r');target?.classList.remove('is-committed');setTimeout(()=>{card.dataset.dragged='0'},90)},360)};
  stack.addEventListener('pointerdown',e=>{const card=e.target.closest('.mc-throw-card.is-front');if(!card||e.target.closest('button'))return;active=card;startX=lastX=e.clientX;startY=e.clientY;lastT=performance.now();velocity=0;card.dataset.dragged='0';card.classList.add('is-dragging');card.setPointerCapture?.(e.pointerId)});
  stack.addEventListener('pointermove',e=>{if(!active)return;const x=e.clientX-startX,y=e.clientY-startY,now=performance.now(),dt=Math.max(8,now-lastT),threshold=Math.min(125,stack.clientWidth*.27);velocity=(e.clientX-lastX)/dt;lastX=e.clientX;lastT=now;if(Math.abs(x)>7)active.dataset.dragged='1';active.style.setProperty('--drag-x',`${x}px`);active.style.setProperty('--drag-y',`${y*.22}px`);active.style.setProperty('--drag-r',`${Math.max(-14,Math.min(14,x*.04))}deg`);feedback(x,threshold);e.preventDefault()});
  const release=e=>{if(!active)return;const card=active,x=e.clientX-startX,y=e.clientY-startY,threshold=Math.min(125,stack.clientWidth*.27),shouldThrow=Math.abs(x)>=threshold||Math.abs(velocity)>.68;card.classList.remove('is-dragging');active=null;if(shouldThrow)throwAway(card,(x||velocity)>=0?1:-1,y);else{settle(card);setTimeout(()=>{card.dataset.dragged='0'},320)}};
  stack.addEventListener('pointerup',release);stack.addEventListener('pointercancel',release);
  root.querySelector('[data-review-again]')?.addEventListener('click',()=>{cursor=0;cards.forEach(c=>{c.hidden=false;c.dataset.dragged='0'});refresh()});
  root.querySelector('[data-review-close]')?.addEventListener('click',()=>onClose?.());
  refresh();
}
function positionSpread(root,items,reroll=false){
  if(!root||matchMedia('(max-width:800px)').matches)return;
  const cards=[...root.querySelectorAll('.mc-loose-card')];if(!cards.length)return;
  const rnd=Math.random,count=cards.length,box=root.getBoundingClientRect();
  const compact=box.width<1450||box.height<650,maxWidth=compact?220:252;
  const dynamicWidth=Math.round(Math.max(170,Math.min(maxWidth,Math.sqrt(Math.max(1,box.width*box.height/count))*.46)));
  root.style.setProperty('--mc-card-width',`${dynamicWidth}px`);
  const cw=dynamicWidth,ch=Math.max(dynamicWidth*1.42,...cards.map(el=>el.getBoundingClientRect().height||0)),cx=box.width/2,cy=box.height/2;
  const edgeX=Math.max(cw*.58,32),edgeY=Math.max(ch*.52,28);
  const rx=Math.max(cw*.95,Math.min(box.width*.39,box.width/2-edgeX));
  const ry=Math.max(ch*.62,Math.min(box.height*.34,box.height/2-edgeY));
  root.style.setProperty('--mc-radius-x',`${Math.round(rx)}px`);root.style.setProperty('--mc-radius-y',`${Math.round(ry)}px`);
  const startAngle=rnd()*Math.PI*2,placed=[];
  const overlapRatio=(a,b)=>{const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y),ox=Math.max(0,cw-dx),oy=Math.max(0,ch-dy);return(ox*oy)/(cw*ch)};
  for(let i=0;i<count;i++){
    const base=startAngle+(Math.PI*2*i/count),ring=i%3===0?.48:.72+rnd()*.20;let best=null,bestScore=-1e9;
    for(let n=0;n<80;n++){
      const angle=base+(rnd()-.5)*Math.min(.46,Math.PI/count*.72),radius=Math.max(.34,Math.min(.96,ring+(rnd()-.5)*.22));
      const c={x:cx+Math.cos(angle)*rx*radius,y:cy+Math.sin(angle)*ry*radius};
      const overlaps=placed.map(p=>overlapRatio(c,p)),worst=overlaps.length?Math.max(...overlaps):0;
      const minDist=placed.length?Math.min(...placed.map(p=>Math.hypot(c.x-p.x,c.y-p.y))):cw*2;
      const targetMin=cw*.72,tooClose=Math.max(0,targetMin-minDist)/targetMin;
      const score=4-worst*34-tooClose*8-Math.abs(radius-.72)*.35+rnd()*.22;
      if(score>bestScore){best=c;bestScore=score}
    }
    placed.push(best||{x:cx,y:cy});
  }
  root.classList.remove('mc-motion-ready');
  cards.forEach((el,i)=>{const p=placed[i],w=el.getBoundingClientRect().width||cw,h=el.getBoundingClientRect().height||ch;const left=Math.round(p.x-w/2),top=Math.round(p.y-h/2),fromX=Math.round(cx-(left+w/2)),fromY=Math.round(cy-(top+h/2));el.style.setProperty('--spread-left',`${left}px`);el.style.setProperty('--spread-top',`${top}px`);el.style.setProperty('--spread-r',`${((rnd()-.5)*5).toFixed(2)}deg`);el.style.setProperty('--spread-from-x',`${fromX}px`);el.style.setProperty('--spread-from-y',`${fromY}px`);el.style.setProperty('--motion-order',String(i));el.style.setProperty('--motion-reverse',String(Math.max(0,cards.length-1-i)));el.style.zIndex=String(20+i)});
  requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('mc-motion-ready')));
}

async function openCardDetail(ctx,card,members,media,onBack){
  const entry=homeState?.grouped?[...homeState.grouped.entries()].find(([,list])=>list.some(x=>String(x.id)===String(card.id))):null;
  const key=entry?.[0]||'',group=entry?.[1]||[card],visual=resolveMemoryVisualPalette(group,members),focusAccent=visual.mode==='single'?visual.trip:(memberColor(card.author_id,members)||visual.primary);
  const name=whoName(card,members),cluster=clusterForKey(key,homeState?.clusters||[]),dateLabel=cluster?(fmtDayKey(stackDay(cluster,homeState?.src?.media||[]))||'diesem Reisetag'):'diesem Moment',cardIndex=Math.max(0,group.findIndex(x=>String(x.id)===String(card.id)))+1;
  const p=await swap(ctx,`<div class="mc-card-focus-wrap" style="--focus-accent:${esc(focusAccent)}"><div class="mc-card-focus-scene"><div class="mc-focus-aura" aria-hidden="true"><i></i><i></i><i></i></div>${renderLooseCard(card,members,0,'focus')}</div><aside class="mc-card-focus-note"><small>${(curationClass(card)==='story'?'GESCHICHTE':typeName(card.card_type).toUpperCase())} · IM FOKUS</small><h2>${esc(focusTitle(card,name))}</h2><p class="mc-focus-context">Aus eurem Memory Moment vom ${esc(dateLabel)} · Karte ${cardIndex} von ${group.length}</p><p class="mc-focus-meaning">${esc(focusMeaning(card))}</p><span>Tippe oder klicke auf die freie Fläche, um diese Karte zurück in den Stapel zu legen.</span></aside></div>`,{motion:'focus',showBack:true});
  await paintLoosePhotos(p,[card],media);const detail=p.querySelector('.mc-loose-card');detail.classList.add('is-focus');
  const back=async()=>{ctx.back.onclick=null;await onBack()};ctx.back.onclick=back;
  p.onclick=e=>{if(e.target.closest('.mc-loose-card,.mc-card-focus-note,button'))return;back()};
}

async function mount(node){host=node;await renderHome();stopCards=await window.LuviaMemoryCards.subscribe(()=>setTimeout(renderHome,350));stopIdentities=await window.LuviaMemoryCards.subscribeIdentities?.(()=>{window.LuviaMemoryCards.members().then(m=>{if(!homeState)return;homeState.members=m;renderHome()})});stopReviews=await window.LuviaMemoryCards.subscribeReviews?.(()=>{if(host)setTimeout(renderHome,120)});stopVotes=await window.LuviaMemoryCards.subscribeVotes?.(()=>{if(host)setTimeout(renderHome,120)});stopTrip=tripContract()?.subscribe?.(()=>{if(host)setTimeout(renderHome,80)});const onTheme=()=>{if(host)setTimeout(renderHome,60)};window.addEventListener('luvia:theme-changed',onTheme);stopTheme=()=>window.removeEventListener('luvia:theme-changed',onTheme);return()=>{stopCards?.();stopIdentities?.();stopReviews?.();stopVotes?.();stopTrip?.();stopTheme?.();stopCards=null;stopIdentities=null;stopReviews=null;stopVotes=null;stopTrip=null;stopTheme=null;host=null}}
window.LuviaAlbumsView=Object.freeze({version:VERSION,build:BUILD,mount,render:renderHome,experience:'memory-deck-consistency-realtime-story-rework',model:'cards -> decks -> moments -> journeys -> studio'});
})();

;

/* ===== core/legacy/paris-migrator.js ===== */
(() => {
  'use strict';
  const OLD=Object.freeze({active:'parisIdentityV1',registry:'parisTripRegistryV1',tripId:'parisSupabaseTripIdV2',owner:'parisDeviceOwner'});
  const parse=(v,f)=>{try{return v==null?f:JSON.parse(v)}catch{return f}};
  const text=(...values)=>values.find(v=>typeof v==='string'&&v.trim())?.trim()||'';
  function destination(value,row={}){
    const source=value&&typeof value==='object'?value:{};
    return Object.freeze({
      name:text(source.name,source.label,row.destination_name,row.destinationName,typeof value==='string'?value:'',row.location,row.city),
      formattedAddress:text(source.formattedAddress,source.displayName,source.formatted_address,row.destination_formatted_address,row.formattedAddress),
      country:text(source.country,row.destination_country,row.destinationCountry,row.country),
      countryCode:text(source.countryCode,source.country_code,row.destination_country_code,row.countryCode).toUpperCase(),
      placeId:text(source.placeId,source.place_id,row.destination_place_id,row.placeId),
      latitude:Number.isFinite(Number(source.latitude??source.lat??source.center?.lat??row.destination_latitude??row.latitude))?Number(source.latitude??source.lat??source.center?.lat??row.destination_latitude??row.latitude):null,
      longitude:Number.isFinite(Number(source.longitude??source.lng??source.center?.lng??row.destination_longitude??row.longitude))?Number(source.longitude??source.lng??source.center?.lng??row.destination_longitude??row.longitude):null,
      timezone:text(source.timezone,row.timezone),
      provider:text(source.provider,source.source,row.destinationProvider,row.destination_provider)
    });
  }
  function normalize(row={}){
    const id=text(row.id,row.tripId,row.trip_id);
    const structuredDestination=(row.destination&&typeof row.destination==='object')?row.destination:(row.destinationModel||row.destination_context||row.destinationContext||row.destination);
    const dest=destination(structuredDestination,row);
    return {
      id,tripId:id,ownerId:text(row.ownerId,row.owner_id),title:text(row.title,row.tripName,row.trip_name)||'Unsere Reise',tripName:text(row.tripName,row.trip_name,row.title)||'Unsere Reise',
      destination:dest,destinationName:dest.name,joinCode:text(row.joinCode,row.join_code),memberName:text(row.memberName,row.member_name,localStorage.getItem(OLD.owner))||'Mitreisend',
      role:text(row.role,row.member_role)||(row.is_owner?'owner':'member'),isOwner:Boolean(row.isOwner||row.is_owner||['owner','admin'].includes(row.role||row.member_role)),mode:row.mode||'shared',
      symbol:row.symbol||'❤️',accent:row.accent||row.accent_color||row.themeColor||row.theme_color||row.color||row.settings?.accent||row.settings?.themeColor||row.settings?.theme_color||'#e76f91',tripType:row.tripType||row.trip_type||'couple',startDate:row.startDate||row.start_date||'',endDate:row.endDate||row.end_date||'',
      modules:Array.isArray(row.modules)?row.modules:(Array.isArray(row.selectedModules)?row.selectedModules:(Array.isArray(row.selected_modules)?row.selected_modules:[])),
      moduleSettings:row.moduleSettings||row.module_settings||{},dashboardWidgets:row.dashboardWidgets||[],createdAt:row.createdAt||row.created_at||null,updatedAt:row.updatedAt||row.updated_at||null,lastOpenedAt:row.lastOpenedAt||null,cloud:Boolean(row.cloud||row.trip_id)
    };
  }
  function readLegacy(){
    const registry=parse(localStorage.getItem(OLD.registry),[])||[];
    const active=parse(localStorage.getItem(OLD.active),null);
    const map=new Map();
    [...registry,active].filter(Boolean).forEach(item=>{const trip=normalize(item);if(trip.id)map.set(trip.id,{...(map.get(trip.id)||{}),...trip})});
    return {trips:[...map.values()],activeTripId:normalize(active||{}).id||localStorage.getItem(OLD.tripId)||null};
  }
  function toLegacy(trip){return {...trip,tripId:trip.id,tripName:trip.title,destination:trip.destination?.name||'',destinationModel:trip.destination,selectedModules:trip.modules}}
  function mirror({trips,activeTripId}){
    localStorage.setItem(OLD.registry,JSON.stringify((trips||[]).map(toLegacy)));
    const active=(trips||[]).find(t=>t.id===activeTripId);
    if(active){localStorage.setItem(OLD.active,JSON.stringify(toLegacy(active)));localStorage.setItem(OLD.tripId,active.id);if(active.memberName)localStorage.setItem(OLD.owner,active.memberName)}
    else{localStorage.removeItem(OLD.active);localStorage.removeItem(OLD.tripId)}
  }
  window.LuviaLegacyParisMigrator=Object.freeze({oldKeys:OLD,normalize,readLegacy,mirror,toLegacy});
})();

;

/* ===== legacy/paris/cloud-adapter.js ===== */
(() => {
  'use strict';
  const requireClient=client=>{const value=client||window.ParisCloud?.client||window.ParisSupabaseClient;if(!value)throw new Error('Cloud-Verbindung ist noch nicht bereit.');return value};
  const parseJson=value=>{if(value&&typeof value==='object')return value;try{return JSON.parse(value||'null')||{}}catch{return {}}};
  async function listTrips(client){
    const response=await requireClient(client).rpc('paris_list_my_trips');
    if(response.error)throw response.error;
    return Promise.all((response.data||[]).map(async row=>{
      const destination=parseJson(row.destination_context);
      let moduleConfig=null;
      try{
        const moduleResponse=await requireClient(client).rpc('luvia_get_trip_modules',{p_trip_id:row.trip_id||row.id});
        if(!moduleResponse.error)moduleConfig=Array.isArray(moduleResponse.data)?moduleResponse.data[0]:moduleResponse.data;
      }catch(error){console.warn('[LuviaCloudAdapter] Modulkonfiguration konnte nicht geladen werden.',error)}
      const modules=Array.isArray(moduleConfig?.modules)?moduleConfig.modules:(Array.isArray(row.modules)?row.modules:[]);
      const moduleSettings=moduleConfig?.settings&&typeof moduleConfig.settings==='object'?moduleConfig.settings:(row.module_settings||{});
      return {...row,modules,selectedModules:modules,moduleSettings,destination:{...destination,name:destination.name||row.destination_name||row.destination||'',country:destination.country||row.destination_country||'',countryCode:destination.countryCode||row.destination_country_code||'',placeId:destination.placeId||row.destination_place_id||'',formattedAddress:destination.formattedAddress||row.destination_formatted_address||'',latitude:destination.latitude??row.destination_latitude??null,longitude:destination.longitude??row.destination_longitude??null}};
    }));
  }

  async function saveProfile(client,trip){
    const t=trip||{},d=t.destination&&typeof t.destination==='object'?t.destination:{};
    const response=await requireClient(client).rpc('luvia_save_trip_profile',{p_trip_id:t.id||t.tripId,p_trip_name:t.title||t.tripName||'Unsere Reise',p_destination_context:d,p_symbol:t.symbol||'❤️',p_accent:t.accent||'#ee6f83',p_start_date:t.startDate||null,p_end_date:t.endDate||null});
    if(response.error)throw response.error;return response.data;
  }
  async function joinTrip(client,{code,memberName}){const response=await requireClient(client).rpc('join_trip_by_code',{join_code:String(code||'').trim().toUpperCase(),member_name:String(memberName||'').trim()});if(response.error)throw response.error;return response.data}
  window.LuviaLegacyParisCloud=Object.freeze({listTrips,saveProfile,joinTrip});
})();

;

/* ===== core/trips/trip-state-core.js ===== */
var LuviaTripStateCoreV1=(()=>{'use strict';
const VERSION='1';

function create({now=()=>new Date().toISOString(),beforeChange=()=>{},afterChange=()=>{},onSubscriberError=()=>{}}={}){
  const listeners=new Set();
  let state={trips:[],activeTripId:null,loaded:false};

  const sortTrips=items=>[...items].sort(
    (a,b)=>
      (Date.parse(b.lastOpenedAt||b.updatedAt||b.createdAt||0)||0)-
      (Date.parse(a.lastOpenedAt||a.updatedAt||a.createdAt||0)||0)
  );

  function mergeDestination(previous={},incoming={}){
    const merged={...previous,...incoming};

    for(const [key,value] of Object.entries(merged)){
      if(value===''||value==null){
        const old=previous?.[key];

        if(old!==''&&old!=null){
          merged[key]=old;
        }
      }
    }

    return merged;
  }

  function mergeTrip(previous={},incoming={}){
    const destination=mergeDestination(
      previous.destination||{},
      incoming.destination||{}
    );

    const merged={
      ...previous,
      ...incoming,
      destination,
      destinationName:
        destination.name||
        incoming.destinationName||
        previous.destinationName
    };

    for(const [key,value] of Object.entries(merged)){
      if(
        (value===''||value==null)&&
        previous?.[key]!==''&&
        previous?.[key]!=null
      ){
        merged[key]=previous[key];
      }
    }

    return merged;
  }

  function snapshot(){
    const activeTrip=
      state.trips.find(
        t=>t.id===state.activeTripId
      )||null;

    return Object.freeze({
      trips:[...state.trips],
      activeTripId:state.activeTripId,
      activeTrip,
      hasTrips:state.trips.length>0,
      hasActiveTrip:Boolean(activeTrip),
      loaded:state.loaded
    });
  }

  function publish(reason='changed',detail={}){
    const value=snapshot();
    const meta=Object.freeze({
      reason,
      ...detail
    });

    beforeChange(
      value,
      meta
    );

    for(const fn of listeners){
      try{
        fn(value);
      }
      catch(error){
        onSubscriberError(error);
      }
    }

    afterChange(
      value,
      meta
    );

    return value;
  }

  function initialize(
    {
      trips=[],
      activeTripId=null
    }={},
    {
      silent=false
    }={}
  ){
    const map=new Map();

    for(const trip of trips){
      if(trip?.id){
        map.set(
          trip.id,
          {
            ...(map.get(trip.id)||{}),
            ...trip
          }
        );
      }
    }

    state={
      trips:sortTrips(
        [...map.values()]
      ),
      activeTripId:
        activeTripId||null,
      loaded:true
    };

    if(
      state.activeTripId&&
      !state.trips.some(
        t=>t.id===state.activeTripId
      )
    ){
      state.activeTripId=null;
    }

    return silent
      ?snapshot()
      :publish('initialized');
  }

  function reconcileLegacy({
    trips=[],
    activeTripId=null
  }={}){
    if(
      !trips.length&&
      !activeTripId
    ){
      return snapshot();
    }

    const map=new Map(
      state.trips.map(
        t=>[
          t.id,
          t
        ]
      )
    );

    for(const trip of trips){
      if(trip?.id){
        map.set(
          trip.id,
          {
            ...(map.get(trip.id)||{}),
            ...trip
          }
        );
      }
    }

    state.trips=sortTrips(
      [...map.values()]
    );

    if(activeTripId){
      state.activeTripId=
        activeTripId;
    }

    return publish(
      'legacy-reconciled'
    );
  }

  function upsert(
    trip,
    {
      activate=false,
      notify=true,
      reason='trip-upserted'
    }={}
  ){
    if(!trip?.id){
      throw new Error(
        'Reise-ID fehlt.'
      );
    }

    const i=
      state.trips.findIndex(
        t=>t.id===trip.id
      );

    if(i>=0){
      state.trips[i]=mergeTrip(
        state.trips[i],
        trip
      );
    }
    else{
      state.trips.push(
        trip
      );
    }

    state.trips=sortTrips(
      state.trips
    );

    if(activate){
      state.activeTripId=
        trip.id;
    }

    return notify
      ?publish(reason)
      :snapshot();
  }

  function setActive(
    id,
    {
      touch=true,
      source='user',
      notify=true
    }={}
  ){
    if(!id){
      state.activeTripId=null;

      return notify
        ?publish('trip-cleared')
        :snapshot();
    }

    const trip=
      state.trips.find(
        t=>t.id===id
      );

    if(!trip){
      throw new Error(
        'Die ausgewählte Reise ist nicht verfügbar.'
      );
    }

    if(touch){
      trip.lastOpenedAt=
        now();
    }

    state.activeTripId=id;

    state.trips=sortTrips(
      state.trips
    );

    const reason=
      source==='boot-cloud'
        ?'trip-selected-cloud'
        :'trip-selected';

    return notify
      ?publish(
          reason,
          {
            selectedTrip:trip
          }
        )
      :snapshot();
  }

  function clearActive(options={}){
    return setActive(
      null,
      options
    );
  }

  function replaceRemote(
    remote,
    {
      ignoreLocalActive=false
    }={}
  ){
    const previousActive=
      ignoreLocalActive
        ?null
        :state.activeTripId;

    const cachedById=
      new Map(
        state.trips.map(
          t=>[
            t.id,
            t
          ]
        )
      );

    const incoming=
      sortTrips(
        (remote||[])
          .filter(
            t=>t?.id
          )
      );

    state.trips=
      incoming.map(
        t=>mergeTrip(
          cachedById.get(t.id)||{},
          t
        )
      );

    state.activeTripId=
      state.trips.some(
        t=>t.id===previousActive
      )
        ?previousActive
        :(state.trips[0]?.id||null);

    state.loaded=true;

    return publish(
      'remote-hydrated'
    );
  }

  function mergeRemote(remote){
    for(const trip of remote||[]){
      if(trip?.id){
        upsert(trip);
      }
    }

    if(
      !state.activeTripId&&
      state.trips.length
    ){
      state.activeTripId=
        state.trips[0].id;
    }

    return publish(
      'remote-merged'
    );
  }

  function subscribe(fn){
    listeners.add(fn);

    fn(
      snapshot()
    );

    return()=>listeners.delete(fn);
  }

  return Object.freeze({
    version:VERSION,
    snapshot,
    initialize,
    reconcileLegacy,
    upsert,
    setActive,
    clearActive,
    replaceRemote,
    mergeRemote,
    mergeTrip,
    sortTrips,
    subscribe
  });
}

return Object.freeze({
  version:VERSION,
  create
});
})();

;

/* ===== core/trips/trip-store.js ===== */
(()=>{
  'use strict';

  const web=window;
  const stateCoreModule=
    LuviaTripStateCoreV1;

  if(
    !stateCoreModule||
    typeof stateCoreModule.create!=='function'
  ){
    throw new Error(
      'LuviaTripStore requires LuviaTripStateCoreV1 before initialization.'
    );
  }

  const storage=
    ()=>web.LuviaStorage;

  const migrator=
    ()=>web.LuviaLegacyParisMigrator;

  const normalize=
    input=>migrator().normalize(input);

  function persist(
    value,
    {
      mirror=true
    }={}
  ){
    const s=storage();

    s.set(
      s.keys.trips,
      value.trips
    );

    if(value.activeTripId){
      s.setText(
        s.keys.activeTripId,
        value.activeTripId
      );
    }
    else{
      s.remove(
        s.keys.activeTripId
      );
    }

    if(mirror){
      migrator().mirror({
        trips:value.trips,
        activeTripId:value.activeTripId,
        loaded:value.loaded
      });
    }
  }

  function migrationMarker(){
    const s=storage();

    s.set(
      s.keys.migration,
      {
        completedAt:
          new Date().toISOString(),
        source:
          'legacy/paris'
      }
    );
  }

  function events(
    value,
    meta
  ){
    web.dispatchEvent(
      new CustomEvent(
        'luvia:trips-changed',
        {
          detail:{
            ...value,
            reason:meta.reason
          }
        }
      )
    );

    document.dispatchEvent(
      new CustomEvent(
        'luvia:trip-context-changed',
        {
          detail:value
        }
      )
    );
  }

  const stateCore=
    stateCoreModule.create({
      beforeChange(
        value,
        meta
      ){
        persist(value);

        if(
          meta.reason===
          'initialized'
        ){
          migrationMarker();
        }

        if(meta.selectedTrip){
          document.dispatchEvent(
            new CustomEvent(
              'reisezeit:trip-selected',
              {
                detail:
                  migrator().toLegacy(
                    meta.selectedTrip
                  )
              }
            )
          );
        }
      },

      afterChange:
        events,

      onSubscriberError:
        error=>console.warn(
          '[LuviaTripStore]',
          error
        )
    });

  function snapshot(){
    return stateCore.snapshot();
  }

  function initialize({
    silent=false
  }={}){
    const s=storage();

    const legacy=
      migrator().readLegacy();

    const canonical=
      s.get(
        s.keys.trips,
        []
      )||[];

    const map=
      new Map();

    for(const row of [
      ...canonical,
      ...(legacy.trips||[])
    ]){
      const trip=
        normalize(row);

      if(trip?.id){
        map.set(
          trip.id,
          {
            ...(map.get(trip.id)||{}),
            ...trip
          }
        );
      }
    }

    const value=
      stateCore.initialize(
        {
          trips:[
            ...map.values()
          ],
          activeTripId:
            s.getText(
              s.keys.activeTripId,
              ''
            )||
            legacy.activeTripId||
            null
        },
        {
          silent
        }
      );

    if(silent){
      persist(value);
      migrationMarker();
    }

    return value;
  }

  function reconcileLegacy(){
    const legacy=
      migrator().readLegacy();

    return stateCore.reconcileLegacy({
      trips:
        legacy.trips||[],
      activeTripId:
        legacy.activeTripId||null
    });
  }

  function upsert(
    input,
    options={}
  ){
    return stateCore.upsert(
      normalize(input),
      options
    );
  }

  function setActive(
    id,
    options={}
  ){
    return stateCore.setActive(
      id,
      options
    );
  }

  function clearActive(){
    return stateCore.clearActive();
  }

  async function loadRemote(
    client,
    {
      authoritative=true,
      ignoreLocalActive=false
    }={}
  ){
    let rows=[];

    try{
      rows=
        await web
          .LuviaLegacyParisCloud
          .listTrips(
            client
          );
    }
    catch(error){
      if(
        !stateCore
          .snapshot()
          .trips
          .length
      ){
        throw error;
      }

      console.warn(
        '[LuviaTripStore] Remote-Liste nicht verfügbar, lokaler Cache bleibt als Offline-Fallback aktiv.',
        error
      );

      return snapshot();
    }

    let remote=
      stateCore.sortTrips(
        (rows||[])
          .map(normalize)
          .filter(
            t=>t?.id
          )
      );

    if(authoritative){
      const cached=
        new Map(
          snapshot()
            .trips
            .map(
              t=>[
                t.id,
                t
              ]
            )
        );

      for(
        let i=0;
        i<remote.length;
        i++
      ){
        const cloudTrip=
          remote[i];

        const local=
          cached.get(
            cloudTrip.id
          );

        const cloudIncomplete=
          !cloudTrip.destination?.name||
          !cloudTrip.destination?.country||
          !cloudTrip.startDate||
          !cloudTrip.endDate;

        const cacheComplete=
          Boolean(
            local?.destination?.name&&
            (
              local.destination.country||
              local.destination.placeId
            )&&
            local.startDate&&
            local.endDate
          );

        if(
          cloudIncomplete&&
          cacheComplete
        ){
          try{
            await web
              .LuviaLegacyParisCloud
              .saveProfile(
                client,
                local
              );

            remote[i]=
              stateCore.mergeTrip(
                cloudTrip,
                local
              );

            console.info(
              '[LuviaTripStore] Vollständiges lokales Reiseprofil einmalig nach Supabase repariert.',
              cloudTrip.id
            );
          }
          catch(error){
            console.warn(
              '[LuviaTripStore] Cloud-Profil konnte nicht repariert werden.',
              error
            );
          }
        }
      }

      return stateCore.replaceRemote(
        remote,
        {
          ignoreLocalActive
        }
      );
    }

    return stateCore.mergeRemote(
      remote.map(normalize)
    );
  }

  window.LuviaTripStore=Object.freeze({
    initialize,
    reconcileLegacy,
    snapshot,
    upsert,
    setActive,
    clearActive,
    loadRemote,
    normalize,

    subscribe:
      fn=>stateCore.subscribe(fn)
  });

  web.LuviaTripStateReaderV1=Object.freeze({
    snapshot,

    subscribe:
      fn=>stateCore.subscribe(fn)
  });
})();

;
