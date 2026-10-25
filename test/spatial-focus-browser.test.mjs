import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findChrome } from '../archify/bin/visual-check.mjs';
import { desktopBrowser } from './helpers/desktop-browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;
test('Spatial focus reads visible nodes without changing semantic activation', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME for actual keyboard evidence.',
}, async t => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-spatial-test-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const render = (type, input, name) => {
    const output = path.join(scratch, name + '.html');
    execFileSync(process.execPath, [path.join(root, 'archify/bin/archify.mjs'), 'render', type, input, output]);
    return output;
  };
  const files = {
    fixture: render('architecture', path.join(root, 'test/fixtures/spatial-focus.architecture.json'), 'fixture'),
    workflow: render('workflow', path.join(root, 'archify/examples/agent-tool-call.workflow.json'), 'workflow'),
    tree: render('tree', path.join(root, 'archify/examples/payment-platform.tree.json'), 'tree'),
  };
  const records = [];
  t.after(() => {
    if (process.env.ARCHIFY_SPATIAL_EVIDENCE) fs.writeFileSync(process.env.ARCHIFY_SPATIAL_EVIDENCE, JSON.stringify(records, null, 2) + '\n');
  });
  const browser = desktopBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  async function run(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(r.exceptionDetails, undefined, r.exceptionDetails?.exception?.description);
    return r.result?.value;
  }
  let serial = 0;
  async function load(mode = 'fixture', theme = 'light') {
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    const ready = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(files[mode]).href + '?theme=' + theme + '&run=' + ++serial });
    await ready; await run('document.fonts.ready'); await run('Archify.viewerChromeLayout.whenStable()');
    await run(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
  }
  async function key(name, code = name, modifiers = 0) {
    const vk = { Tab:9, Enter:13, ArrowLeft:37, ArrowUp:38, ArrowRight:39, ArrowDown:40 }[name];
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:name, code, windowsVirtualKeyCode:vk, modifiers });
    await send('Input.dispatchKeyEvent', { type:'keyUp', key:name, code, windowsVirtualKeyCode:vk, modifiers });
  }
  const focused = () => run(`document.activeElement.getAttribute('data-node-id')`);
  const focus = id => run(`document.querySelector('[data-node-id="${id}"]').focus({preventScroll:true})`);
  const state = () => run(`({active:Archify.focus.active(),pin:Archify.focus.relationship(),hash:location.hash,camera:Archify.view.state(),passport:document.getElementById('focus-chip').innerHTML,scroll:[scrollX,scrollY]})`);
  async function tabTo(id) {
    for (let i=0;i<80;i++) { await key('Tab'); if (await focused() === id) return; }
    assert.fail('Actual Tab did not reach ' + id);
  }
  await t.test('real Tab, arrows, Tab order and Enter keep navigation separate from activation', async () => {
    await load(); await tabTo('a');
    const before = await state();
    await key('ArrowRight'); assert.equal(await focused(), 'b', 'geometric neighbor, not next DOM node c');
    assert.deepEqual(await state(), before);
    await key('ArrowDown'); assert.equal(await focused(), 'd'); assert.deepEqual(await state(), before);
    await focus('a'); await key('Tab'); assert.equal(await focused(), 'c', 'existing Tab order is untouched');
    await key('Tab','Tab',8); assert.equal(await focused(), 'a');
    await key('ArrowRight'); await key('Enter');
    assert.equal(await run('Archify.focus.active()'), 'b');
    assert.equal(await run('document.getElementById("focus-label").textContent'), 'Same label');
    records.push({scenario:'tab-arrows-enter',focused:await focused(),active:await run('Archify.focus.active()')});
  });
  await t.test('old selection, pinned relation, Passport and camera survive readable keyboard focus', async () => {
    for (const theme of ['light','dark']) {
      await load('fixture',theme); await run(`Archify.focus.inspectRelationshipById('a-to-b')`); await focus('a');
      const before = await state(); await key('ArrowRight'); await key('ArrowRight');
      assert.equal(await focused(),'c'); assert.deepEqual(await state(),before);
      await run(`new Promise((resolve,reject)=>{const start=performance.now();function poll(){if(Number(getComputedStyle(document.querySelector('[data-node-id="c"]')).opacity)>.99)return resolve();if(performance.now()-start>2000)return reject(new Error('Focused node stayed dim'));requestAnimationFrame(poll)}poll()})`);
      assert.equal(await run(`document.querySelector('[data-node-id="c"]').matches(':focus-visible')`),true);
      records.push({scenario:'selected-focus-'+theme,active:await run('Archify.focus.active()'),focus:await focused(),opacity:await run(`getComputedStyle(document.activeElement).opacity`)});
    }
  });
  await t.test('direction uses rectangle gaps, then center distance, then artifact order', async () => {
    await load();
    await run(`document.querySelectorAll('[data-node-id]').forEach(n=>{if(n.dataset.nodeId!=='a')n.style.display='none'});document.querySelector('.diagram-container>svg').insertAdjacentHTML('beforeend','<g data-node-id="small" tabindex="0"><rect x="260" y="120" width="20" height="60"/></g><g data-node-id="wide" tabindex="0"><rect x="180" y="120" width="300" height="60"/></g>')`);
    await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'wide','near edge beats nearer center');
    await run(`document.querySelector('[data-node-id="wide"]').remove();document.querySelector('[data-node-id="small"]').remove();document.querySelector('.diagram-container>svg').insertAdjacentHTML('beforeend','<g data-node-id="deeper" tabindex="0"><rect x="180" y="120" width="100" height="100"/></g><g data-node-id="nearer" tabindex="0"><rect x="180" y="120" width="100" height="60"/></g>')`);
    await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'nearer');
    await run(`document.querySelector('[data-node-id="deeper"]').remove();const n=document.querySelector('[data-node-id="nearer"]').cloneNode(true);n.dataset.nodeId='equal';document.querySelector('.diagram-container>svg').appendChild(n)`);
    await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'nearer');
  });
  await t.test('hidden, zero-area, out-of-viewport nodes and empty direction do not take focus', async () => {
    for (const style of ['display:none','visibility:hidden','opacity:0','transform:scale(0)','transform:translateX(5000px)']) {
      await load(); await run(`document.querySelectorAll('[data-node-id]').forEach(n=>{if(!['a','b'].includes(n.dataset.nodeId))n.style.display='none'});document.querySelector('[data-node-id="b"]').style.cssText=${JSON.stringify(style)}`);
      await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'a',style);
    }
    await load(); await run(`const s=document.querySelector('.diagram-container>svg'),b=document.querySelector('[data-node-id="b"]'),g=document.createElementNS(s.namespaceURI,'g');g.style.opacity='0';s.appendChild(g);g.appendChild(b);document.querySelectorAll('[data-node-id]').forEach(n=>{if(!['a','b'].includes(n.dataset.nodeId))n.style.display='none'})`);
    await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'a','invisible ancestor');
    await load(); await run(`const s=document.querySelector('.diagram-container>svg'),b=document.querySelector('[data-node-id="b"]'),g=document.createElementNS(s.namespaceURI,'g'),r=b.getBoundingClientRect(),clip=document.querySelector('.diagram-container').getBoundingClientRect();g.setAttribute('transform','translate('+((clip.right-5-r.left)/b.getScreenCTM().a)+' 0)');b.replaceWith(g);g.appendChild(b);document.querySelectorAll('[data-node-id]').forEach(n=>{if(!['a','b'].includes(n.dataset.nodeId))n.style.display='none'})`);
    await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'a','partly clipped target');
    await load(); await focus('a'); const before=await state(); await key('ArrowLeft'); assert.equal(await focused(),'a'); assert.deepEqual(await state(),before);
    // A real boundary arrow must not fall through to native page scrolling.
    await run(`document.body.insertAdjacentHTML('beforeend','<div style="position:absolute;top:2200px;height:1px">scroll boundary fixture</div>')`);
    await focus('d'); const boundary=await state(); await key('ArrowDown');
    await run(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
    assert.equal(await focused(),'d'); assert.deepEqual(await state(),boundary);
  });
  await t.test('IME, modifiers, prevented keys, descendants and anchors are not hijacked', async () => {
    await load();
    await focus('a'); await run(`document.querySelector('[data-node-id="b"]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}))`);
    assert.equal(await focused(),'a','only an actually focused origin can navigate');
    for (const options of [{isComposing:true},{keyCode:229},{shiftKey:true},{ctrlKey:true},{altKey:true},{metaKey:true}]) {
      await focus('a'); await run(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true,...${JSON.stringify(options)}}))`);
      assert.equal(await focused(),'a');
    }
    await focus('a'); await run(`document.querySelector('[data-node-id="a"]').addEventListener('keydown',e=>e.preventDefault(),{once:true})`); await key('ArrowRight'); assert.equal(await focused(),'a');
    await run(`const a=document.querySelector('[data-node-id="a"]');a.insertAdjacentHTML('beforeend','<foreignObject x="45" y="125" width="80" height="30"><input xmlns="http://www.w3.org/1999/xhtml" id="inner-input" value="abc"/></foreignObject>')`);
    await run(`document.getElementById('inner-input').focus()`); await key('ArrowRight'); assert.equal(await run('document.activeElement.id'),'inner-input');
    await load(); await run(`const a=document.querySelector('[data-node-id="a"]'),link=document.createElementNS(a.namespaceURI,'a');link.setAttribute('href','#author-link');a.replaceWith(link);link.appendChild(a)`); await focus('a'); await key('ArrowRight'); assert.equal(await focused(),'a');
  });
  await t.test('Workflow arrows focus spatially and Tree left/right remain branch controls', async () => {
    await load('workflow');
    const pair = await run(`(()=>{const ns=[...document.querySelectorAll('.diagram-container>svg [data-node-id]')].filter(n=>n.tabIndex>=0);for(const a of ns){const x=a.getBoundingClientRect();for(const b of ns){const y=b.getBoundingClientRect();if(a!==b&&y.left>x.right&&x.top>=0&&y.top>=0&&x.bottom<innerHeight&&y.bottom<innerHeight)return [a.dataset.nodeId,b.dataset.nodeId]}}return null})()`);
    assert.ok(pair,'real Workflow has visible directional nodes'); await focus(pair[0]); const before=await state(); await key('ArrowRight'); assert.notEqual(await focused(),pair[0]); assert.deepEqual(await state(),before);
    await load('tree'); const branch=await run(`document.querySelector('.diagram-container>svg [data-node-id]:has([data-tree-toggle]),.diagram-container>svg [data-node-id][data-tree-collapsed]')?.dataset.nodeId || document.querySelector('[data-tree-toggle]')?.getAttribute('data-tree-toggle')`);
    assert.ok(branch); await focus(branch); await key('ArrowLeft'); assert.equal(await focused(),branch); assert.equal(await run(`document.querySelector('[data-node-id="${branch}"]').hasAttribute('data-tree-collapsed')`),true);
    await key('ArrowRight'); assert.equal(await focused(),branch); assert.equal(await run(`document.querySelector('[data-node-id="${branch}"]').hasAttribute('data-tree-collapsed')`),false);
  });
});
