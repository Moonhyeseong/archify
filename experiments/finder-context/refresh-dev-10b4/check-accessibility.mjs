import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../../../archify/bin/visual-check.mjs';

// Evidence probe for two frozen artifacts; no page source, app code or product state is edited.
const [base, candidate] = process.argv.slice(2);
assert.ok(base && candidate, 'Pass base.html and candidate.html.');
const chrome = findChrome();
assert.ok(chrome, 'Set ARCHIFY_CHROME to an existing Chrome executable.');
const browser = new ChromeVisualBrowser(chrome);
const observations = [];
try {
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  const run = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.text);
    return result.result.value;
  };
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  async function key(key, code, value) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: value, ...(key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: value });
  }
  for (const [name, file] of [['base', base], ['candidate', candidate]]) {
    assert.ok(fs.statSync(file).isFile());
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(path.resolve(file)).href + '?theme=light' });
    await loaded;
    await run(`(async()=>{await document.fonts.ready;await Archify.viewerChromeLayout.whenStable();Archify.finder.open();const input=document.getElementById('node-finder-input');input.value='check-render-output.mjs';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));})()`);
    const rows = await run(`Array.from(document.querySelectorAll('.node-finder-result')).map(button=>({id:button.dataset.nodeId,name:button.getAttribute('aria-label'),reference:button.getAttribute('aria-describedby'),visibleMetadata:button.querySelector('small').textContent}))`);
    assert.equal(rows.length, 8);
    assert.equal(new Set(rows.map(row => row.name)).size, 1);
    const ax = (await send('Accessibility.getFullAXTree')).nodes
      .filter(node => !node.ignored && node.role?.value === 'button' && node.name?.value === rows[0].name)
      .map(node => ({ name: node.name.value, description: node.description?.value ?? null }));
    assert.equal(ax.length, 8);
    if (name === 'base') {
      assert.ok(rows.every(row => row.reference === null));
      assert.ok(ax.every(node => node.description === null));
    } else {
      assert.equal(new Set(ax.map(node => node.description)).size, 8);
      for (const row of rows) assert.ok(ax.some(node => node.description === row.visibleMetadata && node.description.includes(row.id)));
    }
    await run(`document.getElementById('node-finder-input').focus()`);
    const navigation = [];
    await key('ArrowDown', 'ArrowDown', 40);
    navigation.push(await run(`document.activeElement?.dataset.nodeId ?? document.activeElement?.id`));
    await key('ArrowDown', 'ArrowDown', 40);
    navigation.push(await run(`document.activeElement?.dataset.nodeId ?? document.activeElement?.id`));
    await key('Enter', 'Enter', 13);
    const selection = await run(`(async()=>{for(let i=0;i<120&&Archify.focus.active()!=='ex1_check';i++)await new Promise(resolve=>requestAnimationFrame(resolve));return {id:Archify.focus.active(),finderOpen:Archify.finder.isOpen(),context:document.getElementById('focus-context').textContent};})()`);
    assert.equal(selection.id, 'ex1_check');
    assert.equal(selection.finderOpen, false);
    observations.push({ name, artifact: path.basename(file), rows, accessibility: ax, navigation, selection });
  }
  assert.deepEqual(observations[0].rows.map(row => row.name), observations[1].rows.map(row => row.name));
  assert.deepEqual(observations[0].rows.map(row => row.visibleMetadata), observations[1].rows.map(row => row.visibleMetadata));
  process.stdout.write(JSON.stringify({ kind: 'actual-Chromium-accessibility-and-keyboard-observations', observations, limits: 'AX descriptions and key dispatch only; no VoiceOver/NVDA, speech output, physical keyboard, user benefit or cross-AT acceptance.' }, null, 2) + '\n');
} finally {
  browser.close();
}
