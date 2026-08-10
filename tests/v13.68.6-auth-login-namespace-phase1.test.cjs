const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const config=read('auth/config.js');
const session=read('auth/session.js');
const ui=read('auth/ui.js');
const service=read('core/services/supabase-service.js');
const entry=read('app/public-entry.js');
const shell=read('app/app-shell.js');
const index=read('index.html');
const sw=read('sw.js');
const version=read('intelligence/kernel/version.js');
const placeholderMig=read('supabase/migrations/20260809214500_core_v4_68_5_placeholder_email_detection_verified_candidate_ranking_fix.sql');
const resolver=read('supabase/functions/booking-contact-resolve/index.ts');

assert(config.includes('window.LuviaSupabaseConfig = config'));
assert(config.includes('window.ParisSupabaseConfig = config'));
assert(session.includes('window.LuviaAuth = api'));
assert(session.includes('window.ParisAuth = api'));
assert(session.includes("new CustomEvent('luvia:auth-changed'"));
assert(session.includes("new CustomEvent('paris:auth-changed'"));
assert(session.includes("luviaAuthPendingUpgradeV2"));
assert(session.includes("parisAuthPendingUpgradeV2"));
assert(ui.includes('window.LuviaAuthUI=api'));
assert(ui.includes('window.ParisAuthUI=api'));
assert(service.includes('window.LuviaSupabaseClient=client;window.ParisSupabaseClient=client'));
assert(service.includes('(window.LuviaAuth||window.ParisAuth).init(c)'));

const showPos=entry.indexOf("show(root, 'home')");
const bindPos=entry.indexOf('try { bind(root); }');
assert(showPos>=0 && bindPos>showPos, 'Public Entry must activate a screen before binding');
assert(shell.includes("data-luvia-auth-recovery"));
assert(shell.includes("entry-watchdog"));
assert(shell.includes(".lv-home-copy,.lv-step-card,.lv-idea-content,.lv-entry-header"));
assert(shell.includes("lv-public-entry-active"));
assert(shell.includes("window.LuviaAuth||window.ParisAuth"));
assert(index.includes('v=13.68.6'));
assert(sw.includes("luvia-shell-v13.68.6"));
assert(sw.includes("'auth/config.js','auth/session.js','auth/ui.js'"));
assert(version.includes("core:'4.68.6'"));
assert(version.includes("build:'13.68.6'"));
assert(placeholderMig.includes('luvia_booking_is_placeholder_email'));
assert(placeholderMig.includes("'PLACEHOLDER_EMAIL'"));
assert(resolver.includes("return 'PLACEHOLDER_EMAIL'"));

console.log('LUVIA_V13_68_6_AUTH_LOGIN_NAMESPACE_PHASE1_OK');
