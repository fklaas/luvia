const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const entry=read('app/public-entry.js');
const shell=read('app/app-shell.js');
const index=read('index.html');
const sw=read('sw.js');
const force=read('force-update.html');
const version=read('intelligence/kernel/version.js');
const mig=read('supabase/migrations/20260810085800_core_v4_68_7_public_entry_mount_contract_signed_out_boot_fix.sql');

assert(entry.includes("const VERSION = '13.68.7'"));
assert(entry.includes("container || document.getElementById('app')"));
assert(entry.includes("LUVIA_PUBLIC_ENTRY_CONTAINER_MISSING"));
assert(entry.includes("LUVIA_PUBLIC_ENTRY_MOUNT_FAILED"));
assert(shell.includes("const mountRoot=root||document.getElementById('app')"));
assert(shell.includes('window.LuviaGuidedJourneyEntry.render(mountRoot)'));
assert(shell.includes("joinRendered&&mountRoot.children.length>0"));
assert(shell.includes("JoinFlow meldete Render-Erfolg ohne DOM"));
assert(shell.includes('inViewport'));
assert(shell.includes("version:'13.68.7'"));
assert(index.includes('v=13.68.7'));
assert(sw.includes("luvia-shell-v13.68.7"));
assert(force.includes('appv=13.68.7'));
assert(version.includes("core:'4.68.7'"));
assert(version.includes("build:'13.68.7'"));
assert(mig.includes("'luvia_core','4.68.7'"));
assert(mig.includes("'luvia_build','13.68.7'"));

console.log('LUVIA_V13_68_7_PUBLIC_ENTRY_MOUNT_CONTRACT_OK');
