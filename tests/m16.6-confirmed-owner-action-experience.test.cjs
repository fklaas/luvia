'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('core/experience/experience-foundation.css','utf8');

for(const token of [
  '/* M16 confirmed owner actions',
  '.lvx-command-confirmation{',
  '.lvx-rich-action.is-secondary{',
  '.lvx-rich-action.is-confirm{',
  '.lvx-entity-grid{',
  '.lvx-entity-card{',
  '.lvx-entity-card.is-active{',
  '.lvx-entity-symbol{',
  '.lvx-preference-grid{',
  '.lvx-command-receipt.is-cancelled{',
  'grid-template-columns:1fr 1.2fr',
  '.lvx-preference-grid article{flex:0 0 min(52vw,180px);scroll-snap-align:start}',
  '.lvx-rich-action,.lvx-command-confirmation'
])assert.ok(css.includes(token),`M16 Experience semantics missing ${token}`);

assert.equal((css.match(/!important/g)||[]).length,27,'M16 may not grow important-declaration debt');
assert.match(css,/\.lvx-command-confirmation\{[^}]*var\(--luvia-color-action-primary\)/,'confirmation must inherit active Trip accent');
assert.match(css,/\.lvx-entity-card\.is-active\{[^}]*var\(--luvia-color-action-primary-soft\)/,'active Trip card must inherit active Trip accent');
assert.match(css,/\.lvx-rich-action\.is-confirm\{[^}]*var\(--luvia-color-action-primary\)/,'confirm control must use semantic primary action token');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*\.lvx-command-confirmation/,'confirmation motion must have a reduced-motion equivalent');
assert.doesNotMatch(css,/\.lvx-(?:entity|preference|command-confirmation)[^{]*\{[^}]*(?:#ee6f83|#ff6b|rgb\()/i,'M16 shared components may not hardcode a trip accent');

console.log('M16.6 Confirmed Owner Action Experience: PASS');
console.log('Confirmation / entity / preference / receipt semantics: PASS');
console.log('Trip accent / mobile / reduced-motion inheritance: PASS');
console.log('New !important debt: 0');
