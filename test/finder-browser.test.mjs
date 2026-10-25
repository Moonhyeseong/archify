import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../archify/bin/visual-check.mjs';
import { createViewerClick } from './helpers/viewer-click.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'archify');
const chromeConfigured = Object.prototype.hasOwnProperty.call(process.env, 'ARCHIFY_CHROME');
const chrome = chromeConfigured ? findChrome() : null;
if (chromeConfigured && !chrome) {
  throw new Error(`ARCHIFY_CHROME does not resolve to an executable browser: ${process.env.ARCHIFY_CHROME}`);
}

test('Finder preserves search, keyboard, contextual Route selection and cleanup', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run real-browser Finder checks.',
}, async (t) => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-finder-browser-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const evidence = process.env.ARCHIFY_FINDER_EVIDENCE;
  if (evidence) fs.mkdirSync(evidence, { recursive: true });
  const records = [];
  t.after(() => {
    if (evidence) fs.writeFileSync(path.join(evidence, 'observations.json'), JSON.stringify(records, null, 2) + '\n');
  });
  const cases = {
    architecture: 'web-app.architecture.json', workflow: 'agent-tool-call.workflow.json',
    sequence: 'cache-miss-request.sequence.json', dataflow: 'product-analytics.dataflow.json',
    lifecycle: 'agent-run.lifecycle.json',
  };
  const files = {};
  for (const [mode, example] of Object.entries(cases)) {
    files[mode] = path.join(scratch, mode + '.html');
    execFileSync(process.execPath, [path.join(skillRoot, `renderers/${mode}/render-${mode}.mjs`),
      path.join(skillRoot, 'examples', example), files[mode]]);
  }
  // A controlled metadata fixture exercises the Finder's input boundary;
  // repository verification and brand rendering have their own tests.
  files.metadata = path.join(scratch, 'metadata.html');
  const metadataSource = fs.readFileSync(files.architecture, 'utf8');
  assert.ok(metadataSource.includes('    Archify.finder = (function () {'), 'Finder fixture anchor');
  fs.writeFileSync(files.metadata, metadataSource.replace(
    '    Archify.finder = (function () {', `
    document.querySelector('[data-node-id="api"]').setAttribute('data-node-brand', 'finder-brand-token');
    var finderOriginalSources = Archify.sourceEvidence.node;
    Archify.sourceEvidence.node = function (id) {
      return id === 'api' ? [{path:'src/finder-proof.js',label:'Finder proof',line:12,endLine:18}] : finderOriginalSources(id);
    };
    Archify.finder = (function () {`));
  const browser = new ChromeVisualBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  await browser.cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' });
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  // Match the focused-page setup used by the WebM browser harness so that
  // programmatic SVG focus also dispatches native focusin/focusout events.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  async function run(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result?.value;
  }
  const click = await createViewerClick({ send, run, timeout: 10000 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.finderErrors = [];
    addEventListener('error', e => finderErrors.push(e.message));
    addEventListener('unhandledrejection', e => finderErrors.push(String(e.reason)));
    window.finderWait = (predicate, description = 'Finder observation') => new Promise((resolve, reject) => {
      const start = performance.now();
      function sample() {
        if (predicate()) return resolve();
        if (performance.now()-start > 10000) return reject(new Error(description + ' timed out; open=' + Archify.finder.isOpen() + ', active=' + document.activeElement.id));
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
  ` });
  async function load(mode = 'architecture', { theme = 'dark', width = 1440, height = 900, reduced = false, query = '' } = {}) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { media: '', features: [
      { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
    ] });
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(files[mode]).href + `?theme=${theme}${query}` });
    await loaded;
    await run('document.fonts.ready');
    await run('Archify.viewerChromeLayout.whenStable()');
  }
  async function key(key, code, windowsVirtualKeyCode) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
  }
  async function opened() {
    await run(`finderWait(() => Archify.finder.isOpen(), 'Finder panel opening')`);
    await run(`finderWait(() => document.activeElement.id === 'node-finder-input', 'Finder input focus')`);
  }
  async function search(text) {
    await run(`document.getElementById('node-finder-input').select()`);
    await send('Input.insertText', { text });
  }
  async function snapshot(scenario) {
    const value = await run(`(() => {
      const panel=document.getElementById('node-finder'), input=document.getElementById('node-finder-input');
      return {open:Archify.finder.isOpen(), context:Archify.finder.context(), count:Archify.finder.count,
        expanded:document.getElementById('btn-node-finder').getAttribute('aria-expanded'),
        panelContext:panel.getAttribute('data-context'), title:document.getElementById('node-finder-title').textContent,
        query:input.value, placeholder:input.placeholder, empty:document.getElementById('node-finder-empty').hidden,
        status:document.getElementById('node-finder-status').textContent,
        results:[...panel.querySelectorAll('.node-finder-result')].map(el=>({id:el.dataset.nodeId,badge:el.querySelector('em').textContent,aria:el.getAttribute('aria-label')})),
        activeId:document.activeElement.id, activeNode:document.activeElement.getAttribute('data-node-id'),
        focus:Archify.focus.active(), route:Archify.routeProbe.active(),
        routeFinder:document.getElementById('route-probe').getAttribute('data-finder-open'),
        errors:finderErrors,
        external:performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/^https?:/.test(n))};
    })()`);
    assert.deepEqual(value.errors, [], scenario); assert.deepEqual(value.external, [], scenario);
    records.push({ scenario, ...value });
    return value;
  }
  const ids = state => state.results.map(item => item.id);

  await t.test('five modes initialize one index and no external resources', async () => {
    for (const mode of Object.keys(cases)) {
      await load(mode);
      const state = await snapshot(mode + '-initial');
      assert.equal(state.open, false); assert.equal(state.count, state.results.length);
      assert.equal(state.count, await run(`document.querySelectorAll('.diagram-container svg [data-node-id]').length`));
      assert.equal(new Set(ids(state)).size, state.count);
      // One full open/close cycle covers the shared controller; retain
      // initialization and index checks for all five renderer inputs.
      if (mode === 'architecture') {
        await click('#btn-node-finder'); await opened();
        assert.equal((await snapshot(mode + '-open')).expanded, 'true');
        await key('Escape', 'Escape', 27);
        assert.equal((await snapshot(mode + '-closed')).activeId, 'btn-node-finder');
      }
    }
  });

  await t.test('search normalizes queries and preserves contextual lists and retained context', async () => {
    await load('metadata'); await click('#btn-node-finder'); await opened();
    for (const query of ['  API SERVER  ', 'finder-brand-token', 'src/finder-proof.js']) {
      await search(query); const state = await snapshot('query-' + query.trim());
      assert.deepEqual(ids(state), ['api']); assert.equal(state.empty, true);
      assert.match(state.status, /1/);
    }
    await search('no-matching-node');
    const empty = await snapshot('query-empty'); assert.deepEqual(ids(empty), []); assert.equal(empty.empty, false);
    await key('Enter', 'Enter', 13); assert.equal(await run('Archify.finder.isOpen()'), true);
    await run(`Archify.finder.open({context:{kind:'fixture',allowedIds:['db','api'],badges:{api:'custom badge'}}})`); await opened();
    const restricted = await snapshot('restricted');
    assert.deepEqual(ids(restricted), ['api', 'db']); assert.equal(restricted.results[0].badge, 'custom badge');
    await run(`Archify.finder.close()`);
    const closed = await snapshot('retained-context');
    assert.equal(closed.context, 'fixture'); assert.deepEqual(closed.results, restricted.results);
    await run(`Archify.finder.open({context:{allowedIds:[]}})`); await opened();
    assert.deepEqual(ids(await snapshot('no-allowed-items')), []);
    assert.equal(await run(`Archify.finder.select('missing')`), false);
    // Filtering is a list contract; the public select method uses all items.
    assert.equal(await run(`Archify.finder.select('api')`), true);
    assert.equal(await run('Archify.focus.active()'), 'api');
    await run('Archify.finder.open()'); await opened();
    const reset = await snapshot('default-restored'); assert.equal(reset.context, 'focus'); assert.equal(reset.results.length, reset.count);
  });

  await t.test('trusted keyboard navigation, selection and Escape preserve focus boundaries', async () => {
    await load();
    await key('/', 'Slash', 191); await opened();
    assert.deepEqual(await run(`(()=>{const input=document.getElementById('node-finder-input'),event=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true,shiftKey:true});input.dispatchEvent(event);return {prevented:event.defaultPrevented,focus:document.activeElement.id};})()`),{prevented:false,focus:'node-finder-input'});
    await key('ArrowDown', 'ArrowDown', 40);
    const first = await snapshot('keyboard-first'); assert.equal(first.activeNode, first.results[0].id);
    await key('ArrowUp', 'ArrowUp', 38);
    assert.equal((await snapshot('keyboard-wrap')).activeNode, first.results.at(-1).id);
    await key('Home', 'Home', 36); assert.equal((await snapshot('keyboard-home')).activeNode, first.results[0].id);
    assert.deepEqual(await run(`(()=>{const before=document.activeElement.getAttribute('data-node-id'),event=new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true,altKey:true});document.activeElement.dispatchEvent(event);return {prevented:event.defaultPrevented,focus:document.activeElement.getAttribute('data-node-id'),before};})()`),{prevented:false,focus:first.results[0].id,before:first.results[0].id});
    await key('End', 'End', 35); assert.equal((await snapshot('keyboard-end')).activeNode, first.results.at(-1).id);
    await key('Escape', 'Escape', 27);
    assert.equal((await snapshot('keyboard-escape')).activeId, 'btn-node-finder');
    await key('/', 'Slash', 191); await opened(); await search('API Server');
    // Slash in an input must not reopen the panel and erase the query.
    await key('/', 'Slash', 191); assert.equal(await run(`document.getElementById('node-finder-input').value`), 'API Server');
    assert.deepEqual(await run(`(()=>{const input=document.getElementById('node-finder-input'),event=new KeyboardEvent('keydown',{key:'Enter',keyCode:229,bubbles:true,cancelable:true});input.dispatchEvent(event);return {prevented:event.defaultPrevented,open:Archify.finder.isOpen(),focus:document.activeElement.id};})()`),{prevented:false,open:true,focus:'node-finder-input'});
    await key('Enter', 'Enter', 13);
    await run(`finderWait(() => !document.querySelector('.diagram-container').hasAttribute('data-camera-transaction'))`);
    const selected = await snapshot('normal-selection');
    assert.equal(selected.open, false); assert.equal(selected.focus, 'api'); assert.equal(selected.activeNode, 'api');
    assert.match(await run('location.hash'), /focus=api/);
    assert.equal(await run(`(() => {const n=document.querySelector('.diagram-container svg [data-node-id="api"]').getBoundingClientRect(),s=Archify.viewerChromeLayout.stageRect();return n.right>s.left&&n.left<s.right&&n.bottom>s.top&&n.top<s.bottom;})()`), true);
  });

  await t.test('real Route controls select source and target; cancellation restores Route focus', async () => {
    await load(); await click('#btn-route-probe'); await click('#route-probe-find'); await opened();
    let state = await snapshot('route-source');
    assert.equal(state.context, 'route-source'); assert.equal(state.routeFinder, 'true');
    assert.ok(ids(state).includes('users')); assert.ok(!ids(state).includes('db'));
    await key('Escape', 'Escape', 27);
    state = await snapshot('route-source-cancel'); assert.equal(state.route, 'source'); assert.equal(state.routeFinder, null); assert.equal(state.activeId, 'route-probe-find');
    await click('#route-probe-find'); await opened(); await search('Users');
    await click('.node-finder-result[data-node-id="users"]');
    state = await snapshot('route-source-selected'); assert.equal(state.route, 'target'); assert.equal(state.open, false); assert.equal(state.routeFinder, null);
    await click('#route-probe-find'); await opened();
    state = await snapshot('route-target'); assert.equal(state.context, 'route-target');
    assert.ok(ids(state).includes('db')); assert.ok(!ids(state).includes('users')); assert.ok(!ids(state).includes('auth'));
    assert.match(state.results.find(item => item.id === 'db').badge, /4/);
    assert.equal(await run(`Archify.finder.select('auth')`), false);
    assert.equal(await run('Archify.finder.isOpen()'), true);
    await run(`Archify.outline.select('auth')`);
    assert.equal(await run('Archify.routeProbe.active()'), 'target');
    await key('Escape', 'Escape', 27);
    assert.equal((await snapshot('route-target-cancel')).activeId, 'route-probe-find');
    await click('#route-probe-find'); await opened(); await search('PostgreSQL');
    await key('Enter', 'Enter', 13);
    state = await snapshot('route-result'); assert.equal(state.route, 'result'); assert.equal(state.routeFinder, null); assert.equal(state.open, false);
    const result = await run('Archify.routeProbe.result()');
    assert.deepEqual(result.nodes, ['users', 'cdn', 'lb', 'api', 'db']); assert.equal(result.hops, 4);
    assert.equal(await run('Archify.finder.context()'), 'route-target');
    await run(`Archify.outline.select('auth')`);
    assert.equal(await run('Archify.focus.active()'), 'auth', 'the index must focus nodes after a completed Route');
    assert.equal(await run('Archify.routeProbe.active()'), null);
    // A sink is allowed by Route's public API even though the source picker
    // filters it out. Its actual target context must render an empty list.
    await run(`Archify.routeProbe.begin({source:'db'})`);
    await click('#route-probe-find'); await opened();
    state = await snapshot('route-empty-target');
    assert.equal(state.context, 'route-target'); assert.deepEqual(ids(state), []); assert.equal(state.empty, false);
    await key('Enter', 'Enter', 13); assert.equal(await run('Archify.routeProbe.active()'), 'target');
    await key('Escape', 'Escape', 27);
    await click('#route-probe-clear');
    assert.equal(await run('Archify.finder.context()'), 'route-target');
    await run(`Archify.outline.select('api')`);
    assert.equal(await run('Archify.focus.active()'), 'api', 'the index must focus nodes after clearing Route selection');
    assert.equal(await run('Archify.routeProbe.active()'), null);
    await key('/', 'Slash', 191); await opened();
    assert.equal((await snapshot('route-cleared-default')).context, 'focus');
  });

  await t.test('panel coordination, outside clicks, repeated close and embed retain baseline semantics', async () => {
    await load();
    await run('Archify.exportMenu.open(); Archify.finder.open()'); await opened();
    assert.equal(await run('Archify.exportMenu.isOpen()'), false);
    await run('Archify.semanticLens.open(); Archify.finder.open()'); await opened();
    assert.equal(await run('Archify.semanticLens.isOpen()'), false);
    await run(`Archify.finder.close(); document.querySelector('[data-legend-kind][role="button"]').focus()`);
    assert.equal(await run(`document.querySelector('.diagram-container > svg').hasAttribute('data-legend-preview-active')`), true);
    await run('Archify.finder.open()'); await opened();
    assert.equal(await run(`document.querySelector('.diagram-container > svg').hasAttribute('data-legend-preview-active')`), false);
    await click('#btn-node-finder'); assert.equal(await run('Archify.finder.isOpen()'), false);
    await click('#btn-node-finder'); await opened();
    await click('h1'); assert.equal(await run('Archify.finder.isOpen()'), false);
    const rapid = await run(`(() => {Archify.finder.open(); const a=Archify.finder.close({restoreFocus:false}); const b=Archify.finder.close({restoreFocus:false}); return {a:a===undefined,b:b===undefined,open:Archify.finder.isOpen()};})()`);
    assert.deepEqual(rapid, { a: true, b: true, open: false });
    await run('new Promise(resolve => requestAnimationFrame(resolve))');
    await snapshot('rapid-close');
    await load('architecture', { query: '&embed=1' });
    assert.equal(await run('Archify.finder.open()'), false); assert.equal((await snapshot('embed')).open, false);
  });

  await t.test('themes, constrained viewport, reduced motion and exported SVG', async () => {
    for (const theme of ['dark', 'light']) {
      await load('architecture', { theme, width: 640, height: 600, reduced: true });
      await click('#btn-node-finder'); await opened();
      const layout = await run(`(() => {const p=document.getElementById('node-finder').getBoundingClientRect(),r=document.getElementById('node-finder-results'); return {visible:p.width>0&&p.height>0,within:p.left>=-1&&p.right<=innerWidth+1&&p.top>=-1&&p.bottom<=innerHeight+1,scroll:getComputedStyle(r).overflowY};})()`);
      assert.equal(layout.visible, true); assert.equal(layout.within, true); assert.match(layout.scroll, /auto|scroll/);
      await snapshot('constrained-' + theme);
      if (evidence) {
        await run(`Promise.all(document.querySelector('.node-finder-search').getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{})))`);
        await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(evidence, theme + '.png'), Buffer.from(shot.data, 'base64'));
      }
      await search('API Server'); await key('Enter', 'Enter', 13);
      await run(`finderWait(() => !document.querySelector('.diagram-container').hasAttribute('data-camera-transaction'))`);
      assert.equal(await run('Archify.focus.active()'), 'api');
      const exported = await run(`(async () => {
        const original=URL.createObjectURL; let blob;
        URL.createObjectURL=function(value){if(value.type.startsWith('image/svg+xml'))blob=value;return original.call(URL,value);};
        try {await Archify.exportMenu.run('svg');} finally {URL.createObjectURL=original;}
        const text=await blob.text(),root=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
        return {clean:!root.querySelector('[id^="node-finder"],.node-finder-result,[data-focus-selected]')&&!root.hasAttribute('data-focus-active'),geometry:root.getAttribute('viewBox')===document.querySelector('.diagram-container > svg').getAttribute('viewBox')};
      })()`);
      assert.deepEqual(exported, { clean: true, geometry: true });
      await snapshot('export-' + theme);
    }
  });
});

test('Finder results describe their own existing metadata for repeated measured Waterfall labels', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run real-browser Finder description checks.',
}, async (t) => {
  const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'archify-finder-description-'));
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
  const natural=path.join(scratch,'natural.html');
  execFileSync(process.execPath,[path.join(skillRoot,'renderers/waterfall/render-waterfall.mjs'),path.join(skillRoot,'examples/example-rebuild.waterfall.json'),natural]);
  const source=fs.readFileSync(natural,'utf8');
  const anchor='    Archify.finder = (function () {';
  const literal='<img src=x onerror="globalThis.__finderInjected=true"> `literal`';
  const hostile=path.join(scratch,'hostile.html');
  fs.writeFileSync(hostile,source.replace(anchor,`
    var finderHostile=document.querySelector('[data-node-id="ex0_check"]');
    finderHostile.setAttribute('data-node-sublabel',${JSON.stringify(literal)});
    finderHostile.setAttribute('data-node-context','context-only-not-visible');
${anchor}`));
  const noMeta=path.join(scratch,'empty-meta.html');
  fs.writeFileSync(noMeta,source.replace(anchor,`
    var finderEmpty=document.querySelector('[data-node-id="ex0_check"]');
    finderEmpty.setAttribute('data-node-id','');
    finderEmpty.setAttribute('data-node-kind','finder-empty-kind');
    finderEmpty.setAttribute('data-node-sublabel','');
    finderEmpty.setAttribute('data-node-tag','');
    finderEmpty.setAttribute('data-node-context','');
    var finderOriginalKind=viewerKindLabel;
    viewerKindLabel=function(kind){return kind==='finder-empty-kind'?'':finderOriginalKind(kind);};
${anchor}`));
  const browser=new ChromeVisualBrowser(chrome);t.after(()=>browser.close());
  const session=await browser.sessionPromise;
  const send=(method,params={})=>browser.cdp.send(method,params,session);
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.equal(result.exceptionDetails,undefined,result.exceptionDetails?.text);return result.result.value;};
  async function load(file){const loaded=browser.cdp.waitFor('Page.loadEventFired',session);await send('Page.navigate',{url:pathToFileURL(file).href+'?theme=light'});await loaded;await run('document.fonts.ready');await run('Archify.finder.open()');await run('new Promise(resolve=>requestAnimationFrame(resolve))');}
  async function search(query){await run(`(()=>{const input=document.getElementById('node-finder-input');input.value=${JSON.stringify(query)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
  const rows=()=>run(`Array.from(document.querySelectorAll('.node-finder-result')).map(button=>{const reference=button.getAttribute('aria-describedby'),target=reference?document.getElementById(reference):null,small=button.querySelector('small');return {id:button.dataset.nodeId,name:button.getAttribute('aria-label'),reference,description:target?.textContent??null,visibleMeta:small.textContent,metaTitle:small.title,withinRow:target?button.contains(target):false,uniqueReference:target?Array.from(document.querySelectorAll('[id]')).filter(el=>el.id===reference).length:0};})`);
  const checkRows=value=>{assert.equal(new Set(value.map(r=>r.reference)).size,value.length);for(const row of value){assert.ok(row.reference);assert.equal(row.description,row.visibleMeta);assert.equal(row.withinRow,true);assert.equal(row.uniqueReference,1);assert.ok(row.description.includes(row.id));}};
  await t.test('same action names expose distinct metadata and redraw references remain local',async()=>{
    await load(natural);await search('check-render-output.mjs');let value=await rows();assert.equal(value.length,8);assert.equal(new Set(value.map(r=>r.name)).size,1);assert.equal(new Set(value.map(r=>r.description)).size,8);checkRows(value);
    await search('ex1_check');value=await rows();assert.equal(value.length,1);assert.equal(value[0].id,'ex1_check');assert.equal(value[0].description.includes('ex0_check'),false);checkRows(value);
    const previous=value[0].reference;await search('nothing-matches-this');assert.deepEqual(await rows(),[]);assert.equal(await run(`document.getElementById(${JSON.stringify(previous)})===null`),true);
    await search('check-render-output.mjs');value=await rows();assert.equal(value.length,8);checkRows(value);
  });
  await t.test('keyboard selection still selects the requested repeated-label node',async()=>{
    await search('ex1_check');await run("document.getElementById('node-finder-input').focus()");
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    assert.equal(await run('Archify.focus.active()'),'ex1_check');assert.equal(await run('Archify.finder.isOpen()'),false);
  });
  await t.test('described metadata remains literal and does not turn tooltip-only context into visible text',async()=>{
    await load(hostile);await search('ex0_check');const value=await rows();assert.equal(value.length,1);checkRows(value);assert.ok(value[0].description.includes(literal));assert.equal(value[0].description.includes('context-only-not-visible'),false);assert.ok(value[0].metaTitle.includes('context-only-not-visible'));assert.equal(await run("document.querySelectorAll('#node-finder-results img').length"),0);assert.equal(await run('globalThis.__finderInjected===true'),false);
  });
  await t.test('an empty metadata row has no broken description reference',async()=>{
    await load(noMeta);await search('check-render-output.mjs');const value=await rows();const empty=value.find(r=>r.id==='');assert.ok(empty);assert.equal(empty.visibleMeta,'');assert.equal(empty.reference,null);assert.equal(empty.description,null);checkRows(value.filter(r=>r.id!==''));
  });
});
