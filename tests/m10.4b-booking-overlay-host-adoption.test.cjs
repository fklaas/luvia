'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bookingUi=read('core/booking/booking-ui.js');
const controlCenter=read('app/control-center/booking-control-center.js');
const timeline=read('core/places/timeline-core.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert.match(bookingUi,/ui\.adopt\(node,/,'Place Booking dialog must use Overlay Host legacy adoption');
assert(bookingUi.includes("name:'booking.place-request'"),'Place Booking owner name missing');
assert.match(bookingUi,/content:node\.querySelector\('\.lv-booking-dialog'\)/,'Host must own dialog semantics without changing Booking DOM');
assert.match(bookingUi,/closeSelector:'\[data-booking-close\]'/,'Booking close buttons must delegate to the host');
assert.match(bookingUi,/initialFocus:'\[data-booking-date\]'/,'Booking dialog needs a deterministic initial focus');
assert.match(bookingUi,/if\(!activeHandle\|\|activeHandle\.overlay!==node\)return false/,'First open and already-closed paths require a null-safe host guard');
assert.doesNotMatch(bookingUi,/document\.body\.appendChild\(node\)|document\.querySelector\('\.lv-booking-backdrop'\)|node\?\.remove\(\)/,'Booking UI must not retain a private overlay root lifecycle');

assert.match(controlCenter,/function syncActionOverlay\(r\)/,'Control Center requires one sheet synchronization boundary');
assert.match(controlCenter,/name:`booking\.control-center\.\$\{actionMode\}`/,'Modify and Cancel sheets need Booking owner names');
assert.match(controlCenter,/kind:'sheet'/,'Booking mutations must be classified as sheets');
assert.match(controlCenter,/closeOnBackdrop:!actionBusy,closeOnEscape:!actionBusy,closeOnBack:!actionBusy/,'In-flight provider mutations must block dismissive host actions');
assert.match(controlCenter,/mounted\.overlay\.addEventListener\('click',click\)/,'Portaled Booking sheets must retain owner event handling');
assert.match(controlCenter,/if\(actionOverlay&&actionOverlayKey===key\)\{actionOverlay\.content\.replaceChildren/,'State updates must reuse the active host surface');
assert.match(controlCenter,/onClose:\(\)=>\{[^}]*actionOverlay/s,'External host dismissal must clear the Booking action lifecycle');
assert.doesNotMatch(controlCenter,/if\(mobileMutation\)\{target\.innerHTML=/,'Mobile mutation surface must be portaled instead of replacing the module root');
assert.doesNotMatch(controlCenter,/\$\{desktopActionPanel\(r\)\}<\/aside>/,'Desktop mutation surface must not remain embedded in the module root');
assert.match(controlCenter,/closeActionOverlay\('unmount'\)/,'Module unmount must close its owned host surface');

assert.doesNotMatch(`${bookingUi}\n${controlCenter}`,/history\.(?:pushState|replaceState|back)|localStorage|sessionStorage/,'Booking overlay adoption must not gain History or browser-storage ownership');
assert.doesNotMatch(`${bookingUi}\n${controlCenter}`,/\.from\s*\(|\.rpc\s*\(/,'Booking presentation must not gain direct database ownership');
assert.match(timeline,/function openEditor|function editEntry|openEditor\(/,'Timeline/Journey must remain separately present');
assert(!timeline.includes('booking.control-center'),'Timeline/Journey must not be absorbed into Booking overlay ownership');
assert(safeRunner.includes('tests/m10.4b-booking-overlay-host-adoption.test.cjs'),'M10.4B guard missing from Safe Regression');

console.log('M10.4B Booking Overlay Host Adoption: PASS');
console.log('Place request dialog: host-owned');
console.log('Modify / Cancel desktop and mobile sheets: host-owned with in-flight dismissal guard');
