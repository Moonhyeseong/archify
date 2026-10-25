import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../archify/bin/visual-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;

test('Delta exact rows show receipt values without changing identities or canonical exports', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run real Delta browser checks.',
}, async (t) => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-delta-values-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const file = path.join(scratch, 'checkout.html');
  execFileSync(process.execPath, [path.join(root, 'archify/bin/archify.mjs'), 'compare', 'architecture',
    path.join(root, 'archify/examples/checkout-platform.base.architecture.json'),
    path.join(root, 'archify/examples/checkout-platform.head.architecture.json'), file]);
  const original = fs.readFileSync(file, 'utf8');
  function variant(name, mutate) {
    const opening = '<script id="archify-compare-receipt" type="application/json">';
    const start = original.indexOf(opening) + opening.length;
    const end = original.indexOf('</script>', start);
    const receipt = JSON.parse(original.slice(start, end));
    mutate(receipt);
    const target = path.join(scratch, name + '.html');
    fs.writeFileSync(target, original.slice(0, start) + JSON.stringify(receipt).replace(/</g, '\\u003c') + original.slice(end));
    return target;
  }
  const literal = '中文 <img src=x onerror="window.literalExecuted=true"> $& ${literal} `tick`';
  const literals = variant('literals', receipt => {
    const component = receipt.changes.components.find(row => row.id === 'checkout');
    component.changedFields = ['/label']; component.baseLabel = literal; component.headLabel = '新名称';
    const connection = receipt.changes.connections.find(row => row.id === 'persist-order');
    connection.base.label = literal; connection.head.label = '';
    delete receipt.changes.connections.find(row => row.id === 'fraud-check').head.label;
  });
  const unavailable = variant('unavailable', receipt => {
    const row = receipt.changes.connections.find(row => row.id === 'persist-order');
    delete row.base; row.head.label = { unexpected: 'object' };
  });
  const browser = new ChromeVisualBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  await browser.cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' });
  const records = [];
  t.after(() => {
    if (process.env.ARCHIFY_DELTA_VALUES_EVIDENCE) {
      fs.mkdirSync(process.env.ARCHIFY_DELTA_VALUES_EVIDENCE, { recursive: true });
      fs.writeFileSync(path.join(process.env.ARCHIFY_DELTA_VALUES_EVIDENCE, 'observations.json'), JSON.stringify(records, null, 2) + '\n');
    }
  });
  async function run(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result?.value;
  }
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.deltaErrors=[];addEventListener('error',e=>deltaErrors.push(e.message));addEventListener('unhandledrejection',e=>deltaErrors.push(String(e.reason)));` });
  async function load(target = file, theme = 'dark', width = 1440) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(target).href }); await loaded;
    await run('document.fonts.ready');
    await run(`document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('details').open=true`);
  }
  async function click(selector, inline = 'start') {
    const point = await run(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});${inline ? `el.scrollIntoView({block:'center',inline:${JSON.stringify(inline)}});` : ''}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const box=el.getBoundingClientRect();const left=Math.max(0,box.left),right=Math.min(innerWidth,box.right);const x=(left+right)/2,y=box.top+box.height/2;const hit=document.elementFromPoint(x,y);if(!hit||!(el===hit||el.contains(hit)))throw new Error('Click target obscured: '+${JSON.stringify(selector)}+' '+JSON.stringify({left:box.left,right:box.right,top:box.top,bottom:box.bottom,x,y,hit:hit?.outerHTML.slice(0,180)}));return {x,y};})()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }
  const row = key => '.change-row[data-change-key="' + key + '"]';
  async function snapshot(scenario) {
    const state = await run(`(()=>{const values=document.querySelector('#review-values');return {hidden:values.hidden,text:values.textContent,selected:document.querySelector('.change-row[aria-current="step"]')?.dataset.changeKey,adjacent:values.previousElementSibling?.dataset.changeKey,fields:[...values.querySelectorAll('[data-change-field]')].map(row=>({field:row.dataset.changeField,values:[...row.querySelectorAll('code')].map(value=>value.textContent)})),errors:deltaErrors,external:performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/^https?:/.test(n))};})()`);
    assert.deepEqual(state.errors, []); assert.deepEqual(state.external, []);
    records.push({ scenario, ...state }); return state;
  }

  await t.test('real checkout changes show exact old/new facts beside the selected row in both themes', async () => {
    for (const theme of ['light', 'dark']) for (const width of [390, 1440]) {
      await load(file, theme, width);
      assert.equal((await snapshot('initial')).hidden, true);
      const before = await run('Archify.deltaExport.canonicalSvg()');
      await click(row('relationship:persist-order'));
      let state = await snapshot(theme + '-' + width + '-persist');
      assert.deepEqual(state.fields, [{ field: '/label', values: ['SQL', 'SQL tx'] }]);
      assert.equal(state.adjacent, state.selected);
      assert.equal(await run(`(()=>{const box=document.querySelector('#review-values').getBoundingClientRect();return box.left>=0&&box.right<=innerWidth+1;})()`), true);
      await click('#review-next'); state = await snapshot('next-to-geometry'); assert.deepEqual(state.fields, []);
      await click('#review-previous'); state = await snapshot('previous-to-label');
      assert.deepEqual(state.fields, [{ field: '/label', values: ['SQL', 'SQL tx'] }]);
      await click(row('relationship:authorize-payment'));
      state = await snapshot(theme + '-' + width + '-authorize');
      assert.deepEqual(state.fields, [{ field: '/from', values: ['orders', 'fraud'] }]);
      assert.match(state.text, /not included.*\/fromSide.*\/toSide.*\/via/);
      assert.equal(await run('Archify.deltaExport.canonicalSvg()'), before);
      await click(row('component:checkout'));
      state = await snapshot('unsupported-sublabel'); assert.deepEqual(state.fields, []); assert.match(state.text, /not included.*\/sublabel/);
      await click('[role="tab"][data-target="base"]'); assert.equal((await snapshot('before-tab')).hidden, true);
      await click('[role="tab"][data-target="delta"]'); assert.equal((await snapshot('delta-tab')).hidden, false);
      await click('#review-overview'); state = await snapshot('overview'); assert.equal(state.hidden, true); assert.equal(state.text, '');
    }
  });
  await t.test('horizontally scrolled narrow rows keep captions and both values visible without resetting scroll', async () => {
    for (const theme of ['light', 'dark']) for (const position of [300, 'end']) {
      // An optional frozen artifact proves that this visibility assertion
      // detects the original regression, independent of current generation.
      await load(process.env.ARCHIFY_DELTA_VALUES_SCROLL_BASELINE || file, theme, 390);
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
      const scroll = await run(`(()=>{const row=document.querySelector(${JSON.stringify(row('relationship:persist-order'))}),list=document.querySelector('.changes');row.scrollIntoView({block:'center',inline:'nearest'});list.scrollLeft=${position === 'end' ? 'list.scrollWidth-list.clientWidth' : 'Math.min(300,list.scrollWidth-list.clientWidth)'};return list.scrollLeft;})()`);
      assert.ok(scroll > 0, 'the regression path must start with actual horizontal scroll');
      await click(row('relationship:persist-order'), null);
      const visible = await run(`(()=>{const list=document.querySelector('.changes'),clip=list.getBoundingClientRect(),panel=document.querySelector('#review-values');return {scroll:list.scrollLeft,leaves:[...panel.querySelectorAll('dt,small,code')].map(el=>{const range=document.createRange();range.selectNodeContents(el);const rects=[...range.getClientRects()].filter(r=>r.width&&r.height);return {text:el.textContent,visible:rects.length>0&&rects.every(r=>r.left>=Math.max(0,clip.left)-1&&r.right<=Math.min(innerWidth,clip.right)+1&&r.top>=0&&r.bottom<=innerHeight),hit:rects.length>0&&rects.every(r=>{const target=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);return target===el||el.contains(target);})};})};})()`);
      records.push({ scenario: 'horizontal-scroll-' + theme + '-' + position, beforeScroll: scroll, ...visible });
      assert.equal(visible.scroll, scroll, 'selecting a row must preserve the horizontal reading position');
      assert.deepEqual(visible.leaves.map(value => value.text), ['Label', 'Before', 'SQL', 'After', 'SQL tx']);
      assert.ok(visible.leaves.every(value => value.visible && value.hit), JSON.stringify(visible));
    }
  });
  await t.test('literal text, normalized empty labels, missing fields and absent entities remain distinct', async () => {
    await load(literals);
    await click(row('relationship:persist-order'));
    let state = await snapshot('literal-edge'); assert.deepEqual(state.fields, [{ field: '/label', values: [literal, 'Empty or not supplied'] }]);
    assert.equal(await run('!!document.querySelector("#review-values img") || !!window.literalExecuted'), false);
    await click(row('component:checkout')); state = await snapshot('literal-component');
    assert.deepEqual(state.fields, [{ field: '/label', values: [literal, '新名称'] }]);
    await click(row('relationship:fraud-check')); state = await snapshot('added');
    assert.deepEqual(state.fields.map(field => field.values[0]), ['Relationship not present', 'Relationship not present', 'Relationship not present']);
    assert.equal(state.fields[2].values[1], 'Unavailable in receipt');
    await click(row('relationship:session-read')); state = await snapshot('removed');
    assert.deepEqual(state.fields.map(field => field.values[1]), ['Relationship not present', 'Relationship not present', 'Relationship not present']);
    await load(unavailable); await click(row('relationship:persist-order')); state = await snapshot('malformed-side');
    assert.deepEqual(state.fields, [{ field: '/label', values: ['Unavailable in receipt', 'Unavailable in receipt'] }]);
  });
  await t.test('identity mismatch clears stale values and canonical raster/print omit the readout', async () => {
    await load();
    const pristine = await run(`(async()=>{const blob=await Archify.deltaExport.shareCard();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].join(',');})()`);
    await click(row('relationship:persist-order'));
    const selected = await run(`(async()=>{const blob=await Archify.deltaExport.shareCard();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].join(',');})()`);
    assert.equal(selected, pristine);
    await send('Emulation.setEmulatedMedia', { media: 'print' });
    assert.equal(await run('getComputedStyle(document.querySelector("#review-values")).display'), 'none');
    await send('Emulation.setEmulatedMedia', { media: '' });
    await run(`document.querySelector('[data-view="delta"] [data-edge-id="authorize-payment"]').setAttribute('data-delta-classifications','tampered')`);
    await click(row('relationship:authorize-payment'));
    const state = await snapshot('identity-mismatch'); assert.equal(state.hidden, true); assert.equal(state.text, '');
    assert.equal(await run('document.querySelector("#review-status").dataset.state'), 'unavailable');
    assert.equal(await run('[...document.querySelectorAll(".change-row")].every(row=>row.disabled)'), true);
  });
});
