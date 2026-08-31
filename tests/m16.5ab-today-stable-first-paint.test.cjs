'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app/today/today-experience.js'),'utf8').replace(/\r\n?/g,'\n');

assert.match(source,/const DISPLAY_CACHE_KEY='luvia\.today\.first-paint\.v1'/,'Today must keep a trip-scoped first-paint cache');
assert.match(source,/function freshCachedWeather\(/,'weather must be available synchronously on a warm first paint');
assert.match(source,/function freshCachedMemoryCount\(/,'memory totals must be available synchronously on a warm first paint');
assert.match(source,/data-today-trip-id=/,'stable DOM preservation must be scoped to the unchanged trip');
assert.match(source,/function preserveStableFirstPaint\(/,'owner refreshes must preserve visible first-paint state');
assert.match(source,/newImage\.replaceWith\(oldImage\)/,'the already decoded hero image node must survive same-trip owner refreshes');
assert.match(source,/newWeather\.replaceWith\(oldWeather\)/,'the hydrated weather card must survive same-trip owner refreshes');
assert.match(source,/const hydrateStableWeather=async\(\)=>/,'weather may hydrate once without replacing the Today surface');
assert.match(source,/const hydrateStableMemories=async\(\)=>/,'memory totals may hydrate once without replacing the Today surface');
assert.match(source,/const discoverStableDestinationPhoto=async\(\)=>/,'provider imagery must be discovered without a visible mid-session image swap');

const discovery=source.slice(source.indexOf('const discoverStableDestinationPhoto='),source.indexOf("const listen=name=>"));
assert.match(discovery,/cacheDisplay\(context\.trip,\{photo:/,'provider imagery must be cached for the next stable mount');
assert.doesNotMatch(discovery,/\.src\s*=/,'provider discovery must not swap the visible hero image');

const queue=source.match(/queueMicrotask\(\(\)=>\{([^}]+)\}\)/)?.[1]||'';
assert.match(queue,/hydrateStableWeather\(\)/);
assert.match(queue,/hydrateStableMemories\(\)/);
assert.match(queue,/discoverStableDestinationPhoto\(\)/);
assert.doesNotMatch(queue,/(?:^|;)hydrateWeather\(\)/,'legacy weather hydration must not run');
assert.doesNotMatch(queue,/(?:^|;)hydrateMemories\(\)/,'legacy memory hydration must not run');
assert.doesNotMatch(queue,/(?:^|;)hydrateDestinationPhoto\(\)/,'legacy visible photo swap must not run');

console.log('M16.5AB Today stable first paint: PASS');
