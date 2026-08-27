'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const EDGE = process.env.LUVIA_E2E_BROWSER || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT = path.join(ROOT, 'test-results', 'm16.5t');

function startStaticServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json; charset=utf-8' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const file = path.resolve(ROOT, `.${pathname}`);
    if (file !== ROOT && !file.startsWith(`${ROOT}${path.sep}`)) { response.writeHead(403); response.end('Forbidden'); return; }
    fs.readFile(file, (error, data) => {
      if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end(error.code || 'Error'); return; }
      response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(data);
    });
  });
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', () => resolve(server)); });
}

const center = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

async function clickAtCenter(page, locator) {
  const box = await locator.boundingBox();
  assert.ok(box, 'real pointer target has no rendered box');
  const point = center(box);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.waitForTimeout(38);
  await page.mouse.up();
}

async function waitReady(page, fixture, { level = 'closed' } = {}) {
  await page.goto(fixture, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(expected => window.__m165tFixture?.ready === true && document.querySelector('[data-compass-gate]')?.dataset.compassLevel === expected, level, { timeout: 15000 });
}

async function mouseArc(page, locator, fromDegrees, toDegrees, steps = 12) {
  const box = await locator.boundingBox();
  assert.ok(box, 'Compass ring has no rendered box');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = box.width * .42;
  const point = degrees => ({ x: cx + Math.cos(degrees * Math.PI / 180) * radius, y: cy + Math.sin(degrees * Math.PI / 180) * radius });
  const start = point(fromDegrees);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (let index = 1; index <= steps; index += 1) {
    const next = point(fromDegrees + (toDegrees - fromDegrees) * index / steps);
    await page.mouse.move(next.x, next.y, { steps: 2 });
  }
  await page.mouse.up();
}

async function unlockWithMouse(page) {
  const gate = page.locator('[data-compass-gate]');
  const core = page.locator('[data-compass-gate-toggle]');
  await mouseArc(page, core, -90, 5);
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'crown');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.crown-wheel'), '::before').animationName), 'compass-hardware-clue', 'the green clue did not move onto the crown');
  await clickAtCenter(page, page.locator('[data-compass-crown]'));
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'turn-back');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.compass-lock-index'), '::after').animationName), 'compass-hardware-clue', 'the green clue did not return to the moving ring index');
  await mouseArc(page, core, 0, -112, 14);
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'latch');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.compass-latch>i'), '::before').animationName), 'compass-hardware-clue', 'the green clue did not move onto the lower latch');
  const latch = page.locator('[data-compass-latch]');
  const box = await latch.boundingBox();
  assert.ok(box, 'Compass latch has no rendered box');
  await page.mouse.move(box.x + 9, box.y + 18);
  await page.mouse.down();
  for (let index = 1; index <= 10; index += 1) {
    const progress = index / 10;
    await page.mouse.move(box.x + 9 + (box.width - 18) * progress, box.y + 18 + Math.sin(progress * Math.PI) * 9, { steps: 2 });
  }
  await page.mouse.up();
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'primary', null, { timeout: 6000 });
  assert.equal(await gate.getAttribute('data-puzzle-step'), 'open');
}

async function openWorld(page, world) {
  await clickAtCenter(page, page.locator(`[data-world-target="${world}"]`));
  await page.waitForFunction(target => document.querySelector(`[data-story-world="${target}"]`)?.classList.contains('is-visible'), world, { timeout: 7000 });
}

async function returnToWorlds(page, world) {
  const canvas = page.locator(`[data-story-world="${world}"]`);
  await clickAtCenter(page, canvas.locator('[data-world-back]'));
  await page.waitForFunction(target => document.querySelector(`[data-story-world="${target}"]`)?.hidden === true && document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'worlds', world, { timeout: 5000 });
  await page.waitForTimeout(780);
}

async function touchPath(page, points) {
  const client = await page.context().newCDPSession(page);
  const point = ({ x, y }) => ({ x, y, id: 1, radiusX: 8, radiusY: 8, rotationAngle: 0, force: .5 });
  try {
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(points[0])] });
    for (const current of points.slice(1)) {
      await page.waitForTimeout(38);
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(current)] });
    }
    await page.waitForTimeout(38);
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally {
    await client.detach();
  }
}

async function touchArc(page, locator, fromDegrees, toDegrees, steps = 12) {
  const box = await locator.boundingBox();
  assert.ok(box, 'touch Compass ring has no rendered box');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = box.width * .41;
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const degrees = fromDegrees + (toDegrees - fromDegrees) * index / steps;
    points.push({ x: cx + Math.cos(degrees * Math.PI / 180) * radius, y: cy + Math.sin(degrees * Math.PI / 180) * radius });
  }
  await touchPath(page, points);
}

async function touchCenter(page, locator) {
  const box = await locator.boundingBox();
  assert.ok(box, 'touch target has no rendered box');
  await touchPath(page, [center(box)]);
}

async function unlockWithTouch(page) {
  const core = page.locator('[data-compass-gate-toggle]');
  await touchArc(page, core, -90, 5);
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'crown');
  await touchCenter(page, page.locator('[data-compass-crown]'));
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'turn-back');
  await touchArc(page, core, 0, -112, 14);
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'latch');
  const latch = page.locator('[data-compass-latch]');
  const box = await latch.boundingBox();
  assert.ok(box, 'touch latch has no rendered box');
  const points = [];
  for (let index = 0; index <= 10; index += 1) {
    const progress = index / 10;
    points.push({ x: box.x + 9 + (box.width - 18) * progress, y: box.y + 18 + Math.sin(progress * Math.PI) * 9 });
  }
  await touchPath(page, points);
  await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'primary', null, { timeout: 6000 });
}

(async () => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const server = process.env.LUVIA_E2E_BASE_URL ? null : await startStaticServer();
  const baseUrl = process.env.LUVIA_E2E_BASE_URL || `http://127.0.0.1:${server.address().port}`;
  const fixture = `${baseUrl}/tests/fixtures/m16.5t-public-landing-browser.html?qa=m165t-e2e`;
  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  const pageErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(12000);
    page.on('pageerror', error => pageErrors.push(`desktop: ${error.message}`));
    await waitReady(page, fixture);

    const intro = await page.evaluate(() => {
      const splashLogo = document.querySelector('#luviaBootSplash .lv-start-splash__logo');
      const splashInner = document.querySelector('#luviaBootSplash .lv-start-splash__inner');
      return {
        splashLogos: document.querySelectorAll('#luviaBootSplash .lv-start-splash__logo').length,
        duplicateHandoffs: document.querySelectorAll('.lv-public-intro-handoff').length,
        dockReady: splashLogo?.dataset.publicDockReady || null,
        dockVariables: splashLogo?.getAttribute('style') || '',
        logoAnimation: splashLogo ? getComputedStyle(splashLogo).animationName : '',
        logoTransform: splashLogo ? getComputedStyle(splashLogo).transform : '',
        innerAnimation: splashInner ? getComputedStyle(splashInner).animationName : '',
        appAnimation: getComputedStyle(document.getElementById('app')).animationName
      };
    });
    assert.equal(intro.splashLogos, 1, `the intro must have exactly one source logo: ${JSON.stringify(intro)}`);
    assert.equal(intro.duplicateHandoffs, 0, `a duplicate handoff logo would flash over the Compass: ${JSON.stringify(intro)}`);
    assert.equal(intro.dockReady, null, `the retired docking state returned: ${JSON.stringify(intro)}`);
    assert.equal(intro.dockVariables, '', `the intro still has docking geometry: ${JSON.stringify(intro)}`);
    assert.equal(intro.logoAnimation, 'none', `the logo must only inherit the calm parent fade: ${JSON.stringify(intro)}`);
    assert.equal(intro.logoTransform, 'none', `the logo still grows or flies over the Compass: ${JSON.stringify(intro)}`);
    assert.equal(intro.innerAnimation, 'lv-public-intro-fade', `the intro does not own the calm fade: ${JSON.stringify(intro)}`);
    assert.equal(intro.appAnimation, 'lv-public-app-after-intro', `the closed Compass appeared before the intro faded: ${JSON.stringify(intro)}`);
    await page.waitForFunction(() => !document.getElementById('luviaBootSplash'), null, { timeout: 5000 });
    const closed = await page.evaluate(() => ({
      splash: Boolean(document.getElementById('luviaBootSplash')),
      duplicateHandoffs: document.querySelectorAll('.lv-public-intro-handoff').length,
      assemblyOpacity: getComputedStyle(document.querySelector('.landing-compass-assembly')).opacity,
      lidLogoOpacity: getComputedStyle(document.querySelector('.landing-compass-lid img')).opacity,
      lidLogoVisibility: getComputedStyle(document.querySelector('.landing-compass-lid img')).visibility,
      faceOpacity: getComputedStyle(document.querySelector('.landing-compass-face')).opacity,
      crownFixed: document.querySelector('[data-compass-crown]')?.parentElement === document.querySelector('[data-compass-assembly]'),
      latchFixed: document.querySelector('[data-compass-latch]')?.parentElement === document.querySelector('[data-compass-assembly]')
    }));
    assert.deepEqual(closed, { splash: false, duplicateHandoffs: 0, assemblyOpacity: '1', lidLogoOpacity: '0', lidLogoVisibility: 'hidden', faceOpacity: '0', crownFixed: true, latchFixed: true });

    const closedHardware = await page.evaluate(() => {
      const assembly = document.querySelector('[data-compass-assembly]').getBoundingClientRect();
      const crown = document.querySelector('[data-compass-crown]').getBoundingClientRect();
      const latch = document.querySelector('[data-compass-latch]').getBoundingClientRect();
      const crownWheel = document.querySelector('.crown-wheel');
      const latchTrack = document.querySelector('.compass-latch>i');
      return {
        crownRatio: crown.width / assembly.width,
        latchRatio: latch.width / assembly.width,
        crownGold: getComputedStyle(crownWheel).backgroundImage,
        latchBlue: getComputedStyle(latchTrack, '::after').backgroundImage,
        latchTrackBackground: getComputedStyle(latchTrack).backgroundImage,
        latchHintWidth: getComputedStyle(latchTrack, '::before').width,
        latchHintColor: getComputedStyle(latchTrack, '::before').backgroundColor,
        indexClue: getComputedStyle(document.querySelector('.compass-lock-index'), '::after').animationName,
        crownClue: getComputedStyle(crownWheel, '::before').animationName,
        latchClue: getComputedStyle(latchTrack, '::before').animationName
      };
    });
    assert.ok(closedHardware.crownRatio < .11, `the crown is still oversized: ${JSON.stringify(closedHardware)}`);
    assert.ok(closedHardware.latchRatio < .28, `the lower latch is still oversized: ${JSON.stringify(closedHardware)}`);
    assert.match(closedHardware.crownGold, /rgb\(244, 179, 76\)|rgb\(255, 214, 118\)/);
    assert.match(closedHardware.latchBlue, /rgb\(44, 147, 169\)/);
    assert.equal(closedHardware.latchTrackBackground, 'none', 'the irritating blue bar returned');
    assert.equal(closedHardware.latchHintWidth, '6px', 'the small green action point expanded into a bar');
    assert.equal(closedHardware.latchHintColor, 'rgb(47, 140, 115)');
    assert.equal(closedHardware.indexClue, 'compass-hardware-clue');
    assert.equal(closedHardware.crownClue, 'none');
    assert.equal(closedHardware.latchClue, 'none');

    await unlockWithMouse(page);
    const primaryAssembly = await page.locator('[data-compass-assembly]').boundingBox();
    assert.ok(primaryAssembly);
    await page.screenshot({ path: path.join(OUTPUT, 'desktop-primary-hardware.png'), fullPage: false });

    const navigationEntries = await page.evaluate(() => performance.getEntriesByType('navigation').length);
    await clickAtCenter(page, page.locator('[data-compass-choice="login"]'));
    await page.waitForFunction(() => document.querySelector('[data-public-auth-layer]')?.hidden === false && location.hash === '#anmelden');
    await page.waitForTimeout(560);
    await clickAtCenter(page, page.locator('button.lv-public-auth-close'));
    await page.waitForFunction(() => document.querySelector('[data-public-auth-layer]')?.hidden === true);
    assert.equal(await page.locator('[data-compass-gate]').getAttribute('data-compass-level'), 'primary');
    assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation').length), navigationEntries, 'closing auth reloaded the Landing');

    await clickAtCenter(page, page.locator('[data-compass-choice="register"]'));
    await page.waitForFunction(() => document.querySelector('[data-public-auth-layer]')?.hidden === false && location.hash === '#registrieren');
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('[data-public-auth-layer]')?.hidden === true && location.hash === '#compass-gate');
    assert.equal(await page.locator('[data-compass-gate]').getAttribute('data-compass-level'), 'primary', 'Browser Back lost the already-open Compass');

    await clickAtCenter(page, page.locator('[data-compass-choice="worlds"]'));
    await page.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'worlds');
    await page.waitForTimeout(950);
    const hardwareWorlds = await page.evaluate(() => {
      const assembly = document.querySelector('[data-compass-assembly]').getBoundingClientRect();
      const crown = document.querySelector('[data-compass-crown]').getBoundingClientRect();
      const latch = document.querySelector('[data-compass-latch]').getBoundingClientRect();
      return { assembly: { x: assembly.x, y: assembly.y, width: assembly.width, height: assembly.height }, crown: { x: crown.x, y: crown.y }, latch: { x: latch.x, y: latch.y }, sameCrownParent: document.querySelector('[data-compass-crown]').parentElement === document.querySelector('[data-compass-assembly]'), sameLatchParent: document.querySelector('[data-compass-latch]').parentElement === document.querySelector('[data-compass-assembly]') };
    });
    assert.ok(hardwareWorlds.assembly.width < primaryAssembly.width * .9, 'world switch did not scale the complete Compass assembly');
    assert.equal(hardwareWorlds.sameCrownParent, true);
    assert.equal(hardwareWorlds.sameLatchParent, true);
    assert.ok(hardwareWorlds.crown.x > hardwareWorlds.assembly.x + hardwareWorlds.assembly.width * .78, 'crown detached while the Compass scaled');
    assert.ok(hardwareWorlds.latch.y > hardwareWorlds.assembly.y + hardwareWorlds.assembly.height * .6, 'latch detached while the Compass scaled');

    await openWorld(page, 'begin');
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(250);
    const destinationBeforeTap = await page.locator('[data-destination-copy]').innerText();
    await clickAtCenter(page, page.locator('[data-begin-cycle]').first());
    await page.waitForFunction(previous => document.querySelector('[data-destination-copy]')?.textContent !== previous, destinationBeforeTap);
    assert.equal(await page.locator('.journey-tone-palette [data-tone-index]').count(), 10, 'the calm card must retain exactly ten primary tones');
    assert.match(await page.locator('.journey-tone-more').innerText(), /40 weitere Reisefarben\s+Farbenfächer öffnen/);
    await clickAtCenter(page, page.locator('.journey-tone-more'));
    await page.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.classList.contains('is-open'));
    assert.equal(await page.locator('.journey-tone-dialog-grid [data-tone-index]').count(), 50);
    assert.ok((await page.locator('.journey-tone-dialog-panel').boundingBox()).height < 700, 'the tone canvas escaped the viewport');
    await page.screenshot({ path: path.join(OUTPUT, 'desktop-50-tone-canvas.png'), fullPage: false });
    await clickAtCenter(page, page.locator('.journey-tone-dialog-grid [data-tone-index="17"]'));
    await page.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.hidden === true);
    assert.match(await page.locator('[data-tone-copy]').innerText(), /Fern begleitet eure Reise/);
    assert.equal(await page.locator('.journey-tone-more').getAttribute('aria-expanded'), 'false');
    await clickAtCenter(page, page.locator('.journey-tone-more'));
    await page.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.classList.contains('is-open'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.hidden === true);
    await returnToWorlds(page, 'begin');

    await openWorld(page, 'horizons');
    const horizonDots = page.locator('[data-horizon-dots] button');
    assert.equal(await horizonDots.count(), 5);
    await clickAtCenter(page, horizonDots.nth(2));
    assert.equal(await horizonDots.nth(2).getAttribute('aria-pressed'), 'true');
    await returnToWorlds(page, 'horizons');

    await openWorld(page, 'spatial');
    assert.equal(await page.locator('[data-place-types] button').count(), 9);
    await clickAtCenter(page, page.getByRole('button', { name: /Café/ }).first());
    assert.match(await page.locator('.rondell-place-card.is-active .place-kind').innerText(), /Café/);
    const beforePlace = await page.locator('[data-place-counter]').innerText();
    await clickAtCenter(page, page.locator('[data-place-next]'));
    assert.notEqual(await page.locator('[data-place-counter]').innerText(), beforePlace);
    const savePlace = page.locator('.rondell-place-card.is-active button');
    await savePlace.scrollIntoViewIfNeeded();
    await clickAtCenter(page, savePlace);
    assert.equal(await savePlace.getAttribute('aria-pressed'), 'true', 'the visible Place action is still decorative');
    assert.match(await savePlace.innerText(), /Vorgemerkt/);
    assert.equal(await page.evaluate(() => window.__m165tFixture.mapInstances), 1, 'Place interaction rebuilt the map');
    assert.ok(await page.evaluate(() => window.__m165tFixture.mapFlyCalls.length >= 2), 'selected Places did not move the map');
    await returnToWorlds(page, 'spatial');

    await openWorld(page, 'memory');
    assert.equal(await page.locator('.memory-mode-rail [data-memory-mode]').count(), 4);
    await clickAtCenter(page, page.locator('.memory-mode-rail [data-memory-mode="editor"]'));
    assert.equal(await page.locator('[data-memory-preview="editor"]').isVisible(), true, 'editor Memory preview did not open');
    assert.equal(await page.locator('[data-photo-control]').count(), 3, 'photo controls are not semantic range inputs');
    const lightControl = page.locator('[data-photo-control="light"]');
    const lightBox = await lightControl.boundingBox();
    assert.ok(lightBox, 'light range has no rendered pointer target');
    await page.mouse.move(lightBox.x + lightBox.width * .72, lightBox.y + lightBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(lightBox.x + lightBox.width * .24, lightBox.y + lightBox.height / 2, { steps: 10 });
    await page.mouse.up();
    assert.notEqual(await lightControl.inputValue(), '22', 'the visible light regulator ignored a real mouse drag');
    await lightControl.focus();
    await page.keyboard.press('End');
    assert.equal(await lightControl.inputValue(), '50');
    assert.equal(await page.locator('[data-photo-output="light"]').innerText(), '+50');
    assert.equal(await page.evaluate(() => document.querySelector('[data-photo-editor]').style.getPropertyValue('--editor-brightness')), '1.2');
    await page.locator('[data-photo-compare]').fill('74');
    assert.equal(await page.evaluate(() => document.querySelector('[data-photo-editor]').style.getPropertyValue('--compare')), '74%');
    await clickAtCenter(page, page.locator('[data-photo-reset]'));
    assert.equal(await lightControl.inputValue(), '0');

    await clickAtCenter(page, page.locator('.memory-mode-rail [data-memory-mode="reel"]'));
    await clickAtCenter(page, page.locator('[data-reel-scene="2"]'));
    assert.equal(await page.locator('[data-reel-scene="2"]').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('[data-reel-title]').innerText(), /Licht bleibt/);

    await clickAtCenter(page, page.locator('.memory-mode-rail [data-memory-mode="book"]'));
    const firstBookImage = await page.locator('[data-book-image="left"]').getAttribute('src');
    await clickAtCenter(page, page.locator('[data-book-turn]'));
    assert.notEqual(await page.locator('[data-book-image="left"]').getAttribute('src'), firstBookImage, 'the visible book page control did not turn the spread');

    await clickAtCenter(page, page.locator('.memory-mode-rail [data-memory-mode="gallery"]'));
    const soundButton = page.locator('[data-memory-sound] button');
    await clickAtCenter(page, soundButton);
    assert.equal(await soundButton.getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('[data-memory-sound-state]').innerText(), /läuft/);
    await returnToWorlds(page, 'memory');

    await openWorld(page, 'story');
    await clickAtCenter(page, page.locator('[data-journey-step="2"]'));
    assert.equal(await page.locator('[data-journey-step="2"]').getAttribute('class').then(value => value.includes('is-active')), true);
    assert.match(await page.locator('[data-journey-selected]').innerText(), /Entscheidungen/);
    await returnToWorlds(page, 'story');

    await openWorld(page, 'product-demo');
    assert.equal(await page.locator('[data-phone-tab]').count(), 3);
    for (const mode of ['places', 'memory', 'compass']) {
      await clickAtCenter(page, page.locator(`[data-phone-tab="${mode}"]`));
      assert.equal(await page.locator(`[data-phone-panel="${mode}"]`).isVisible(), true, `${mode} phone teaser did not open`);
    }
    await returnToWorlds(page, 'product-demo');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'desktop Landing has horizontal overflow');
    await page.close();

    const keyboard = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    keyboard.setDefaultTimeout(12000);
    keyboard.on('pageerror', error => pageErrors.push(`keyboard: ${error.message}`));
    await waitReady(keyboard, `${fixture}&input=keyboard`);
    await keyboard.waitForTimeout(1250);
    await keyboard.locator('[data-compass-gate-toggle]').focus();
    for (let index = 0; index < 6; index += 1) await keyboard.keyboard.press('ArrowRight');
    await keyboard.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'crown');
    assert.equal(await keyboard.evaluate(() => document.activeElement === document.querySelector('[data-compass-crown]')), true);
    await keyboard.keyboard.press('Enter');
    await keyboard.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'turn-back');
    for (let index = 0; index < 9; index += 1) await keyboard.keyboard.press('ArrowLeft');
    await keyboard.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.puzzleStep === 'latch');
    assert.equal(await keyboard.evaluate(() => document.activeElement === document.querySelector('[data-compass-latch] input')), true);
    await keyboard.keyboard.press('End');
    await keyboard.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'primary', null, { timeout: 5000 });
    await keyboard.close();

    const motionContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const motion = await motionContext.newPage();
    motion.setDefaultTimeout(12000);
    motion.on('pageerror', error => pageErrors.push(`motion-toggle: ${error.message}`));
    await waitReady(motion, `${fixture}&motion=toggle`);
    await motion.waitForFunction(() => !document.getElementById('luviaBootSplash'));
    await clickAtCenter(motion, motion.locator('.motion-toggle'));
    await motion.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'primary' && document.querySelector('[data-public-landing]')?.classList.contains('is-motion-reduced'));
    assert.equal(await motion.evaluate(() => localStorage.getItem('luvia-public-motion')), 'reduced');
    assert.equal(await motion.locator('.motion-toggle').getAttribute('aria-pressed'), 'true');
    await motion.reload({ waitUntil: 'domcontentloaded' });
    await motion.waitForFunction(() => window.__m165tFixture?.ready === true && document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'primary');
    assert.equal(await motion.locator('[data-compass-puzzle-console]').getAttribute('aria-hidden'), 'true');
    await motion.waitForFunction(() => !document.getElementById('luviaBootSplash'));
    await clickAtCenter(motion, motion.locator('.motion-toggle'));
    assert.equal(await motion.evaluate(() => localStorage.getItem('luvia-public-motion')), 'full');
    await motion.reload({ waitUntil: 'domcontentloaded' });
    await motion.waitForFunction(() => window.__m165tFixture?.ready === true && document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'closed');
    await motionContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    mobile.setDefaultTimeout(12000);
    mobile.on('pageerror', error => pageErrors.push(`mobile: ${error.message}`));
    await waitReady(mobile, `${fixture}&input=touch`);
    await mobile.waitForTimeout(1250);
    await unlockWithTouch(mobile);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'mobile Landing has horizontal overflow');
    await touchCenter(mobile, mobile.locator('[data-compass-choice="worlds"]'));
    await mobile.waitForFunction(() => document.querySelector('[data-compass-gate]')?.dataset.compassLevel === 'worlds');
    await mobile.waitForTimeout(900);
    await touchCenter(mobile, mobile.locator('[data-world-target="begin"]'));
    await mobile.waitForFunction(() => document.querySelector('[data-story-world="begin"]')?.classList.contains('is-visible'), null, { timeout: 7000 });
    await mobile.locator('.journey-tone-more').scrollIntoViewIfNeeded();
    await touchCenter(mobile, mobile.locator('.journey-tone-more'));
    await mobile.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.classList.contains('is-open'));
    assert.equal(await mobile.locator('.journey-tone-dialog-grid [data-tone-index]').count(), 50);
    await mobile.screenshot({ path: path.join(OUTPUT, 'mobile-touch-50-tone-canvas.png'), fullPage: false });
    await touchCenter(mobile, mobile.locator('.journey-tone-dialog-close'));
    await mobile.waitForFunction(() => document.querySelector('.journey-tone-dialog')?.hidden === true);
    await mobileContext.close();

    const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const reduced = await reducedContext.newPage();
    reduced.setDefaultTimeout(12000);
    reduced.on('pageerror', error => pageErrors.push(`reduced: ${error.message}`));
    await waitReady(reduced, `${fixture}&motion=reduce`, { level: 'primary' });
    await reduced.waitForTimeout(700);
    const reducedState = await reduced.evaluate(() => ({
      splash: Boolean(document.getElementById('luviaBootSplash')),
      duplicateHandoffs: document.querySelectorAll('.lv-public-intro-handoff').length,
      atmosphereAnimation: getComputedStyle(document.querySelector('.landing-compass-atmosphere')).animationName,
      rotorTransition: getComputedStyle(document.querySelector('.landing-compass-rotor')).transitionDuration,
      level: document.querySelector('[data-compass-gate]')?.dataset.compassLevel,
      toggleDisabled: document.querySelector('.motion-toggle')?.disabled,
      puzzleHidden: document.querySelector('[data-compass-puzzle-console]')?.getAttribute('aria-hidden')
    }));
    assert.equal(reducedState.splash, false);
    assert.equal(reducedState.duplicateHandoffs, 0);
    assert.equal(reducedState.atmosphereAnimation, 'none');
    assert.ok(['0s', '0.00001s', '1e-05s'].includes(reducedState.rotorTransition), `reduced-motion rotor still transitions: ${reducedState.rotorTransition}`);
    assert.equal(reducedState.level, 'primary');
    assert.equal(reducedState.toggleDisabled, true);
    assert.equal(reducedState.puzzleHidden, 'true');
    await reducedContext.close();

    assert.deepEqual(pageErrors, [], 'public Landing E2E emitted page errors');
    console.log('M16.5T public Landing real Edge E2E: PASS');
    console.log('Desktop mouse puzzle / fixed hardware / intro / auth close / Browser Back: PASS');
    console.log('50 named tones / dedicated tone canvas / selection close / Escape: PASS');
    console.log('Horizons / Places map / interactive Memory tools / Journey / reduced phone demo: PASS');
    console.log('Keyboard puzzle / mobile CDP touch emulation / persistent motion-off bypass / system reduced motion: PASS');
    console.log(`Evidence: ${OUTPUT}`);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
