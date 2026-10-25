import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../../archify/bin/visual-check.mjs';

// This checks real text geometry in the two complete, public-rendered pages.
// It does not run the PR snippets or rerun the unrelated keyboard gate.
const [baseFile, candidateFile, ...extra] = process.argv.slice(2);
if (!baseFile || !candidateFile || extra.length) throw new Error('Usage: node check-browser.mjs <base.html> <candidate.html>');
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const browser = new ChromeVisualBrowser(process.env.ARCHIFY_CHROME || findChrome());
const results = [];
async function value(expression) {
  const result = await browser.cdp.send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  }, await browser.sessionPromise);
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  for (const [name, file] of [['base', baseFile], ['candidate', candidateFile]]) {
    for (const width of [1280, 390]) for (const theme of ['light', 'dark']) {
      await browser.resetPage();
      const session = await browser.sessionPromise;
      await browser.cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
      await browser.cdp.send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-color-scheme', value: theme }, { name: 'prefers-reduced-motion', value: 'reduce' }] }, session);
      const url = pathToFileURL(path.resolve(file)); url.searchParams.set('theme', theme);
      const loaded = browser.cdp.waitFor('Page.loadEventFired', session); loaded.catch(() => {});
      const navigation = await browser.cdp.send('Page.navigate', { url: url.href }, session);
      assert.equal(navigation.errorText, undefined);
      await loaded;
      await value('(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()');
      const measured = await value(`(()=>{
        const cells=Array.from(document.querySelectorAll('.diff-number')).filter(e=>/^\\d+$/.test(e.textContent));
        const numbers=cells.map(cell=>{
          const range=document.createRange();range.selectNodeContents(cell);
          const rects=Array.from(range.getClientRects());const box=cell.getBoundingClientRect();const css=getComputedStyle(cell);
          return {text:cell.textContent,lineBoxes:rects.length,cellWidth:box.width,
            textWidth:range.getBoundingClientRect().width,
            insideCell:rects.every(r=>r.left>=box.left+parseFloat(css.paddingLeft)-1&&r.right<=box.right-parseFloat(css.paddingRight)+1)};
        });
        const codes=Array.from(document.querySelectorAll('.diff-code code'));
        const longest=codes.reduce((a,b)=>a.textContent.length>b.textContent.length?a:b);
        const port=longest.closest('.diff-scroll');port.scrollLeft=port.scrollWidth;
        const text=longest.firstChild;const tail=document.createRange();tail.setStart(text,text.length-1);tail.setEnd(text,text.length);
        const tailBox=tail.getBoundingClientRect(),portBox=port.getBoundingClientRect();
        const codeRange=document.createRange();codeRange.selectNodeContents(longest);
        return {width:innerWidth,theme:document.documentElement.dataset.theme,pageScrollWidth:document.documentElement.scrollWidth,
          numbers,threeDigitNumbers:numbers.filter(n=>n.text.length===3),
          rows:Array.from(document.querySelectorAll('.diff-line')).map(r=>({old:r.dataset.oldLine??null,new:r.dataset.newLine??null,text:r.querySelector('code').textContent})),
          longCode:{characters:longest.textContent.length,lineBoxes:codeRange.getClientRects().length,scrollWidth:port.scrollWidth,clientWidth:port.clientWidth,scrollLeft:port.scrollLeft,
            tailInsidePort:tailBox.left>=portBox.left-1&&tailBox.right<=portBox.right+1}};
      })()`);
      assert.equal(measured.width, width);
      assert.equal(measured.theme, theme);
      assert.ok(measured.pageScrollWidth <= width + 1, 'The page must retain local rather than document horizontal scrolling');
      assert.ok(measured.threeDigitNumbers.some(n => n.text === '101'));
      assert.ok(measured.threeDigitNumbers.some(n => n.text === '109'));
      assert.ok(measured.longCode.characters > 300);
      assert.equal(measured.longCode.lineBoxes, 1, 'Code stays on its authored line');
      assert.ok(measured.longCode.scrollWidth > measured.longCode.clientWidth);
      assert.ok(measured.longCode.scrollLeft > 0);
      assert.equal(measured.longCode.tailInsidePort, true, 'Horizontal scrolling reaches the last code character');
      if (name === 'base') assert.ok(measured.threeDigitNumbers.some(n => n.lineBoxes > 1), 'The same check must reproduce the original wrapping');
      else {
        assert.ok(measured.numbers.every(n => n.lineBoxes === 1 && n.insideCell), 'Every supplied line number must remain complete on one visual line');
        const original = results.find(r => r.name === 'base' && r.width === width && r.theme === theme);
        assert.deepEqual(measured.rows, original.rows, 'CSS must not change old/new line identities or literal diff text');
      }
      results.push({ name, artifact: path.basename(file), artifactSha256: sha(file), ...measured });
    }
  }
  console.log(JSON.stringify({ kind: 'focused-real-dom-comparison', status: 'pass', meaning: 'Expected base wrap reproduced; candidate line numbers are complete; authored code/text and horizontal reachability retained.', runs: results }, null, 2));
} finally {
  await browser.close();
}
