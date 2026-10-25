import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {ChromeVisualBrowser,findChrome} from '../../archify/bin/visual-check.mjs';
import {inspectPublicHtml} from '../../archify/explainer/browser-check.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const manifest=JSON.parse(read('source-manifest.json'));
const document=JSON.parse(read('input.explainer.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const file of manifest.files){
  const bytes=fs.readFileSync(path.join(root,file.local));
  assert.equal(hash(bytes),file.sha256);assert.equal(bytes.length,file.bytes);
}
const shown=manifest.shownSnippets.map(s=>({id:s.id,text:read('source/'+s.path).split('\n').slice(s.lines[0]-1,s.lines[1]).join('\n')}));
for(const s of shown)assert.equal(document.panels.flatMap(p=>p.blocks).find(b=>b.id===s.id).text,s.text);
const testSource=read('source/stevedore/tests/test_enabled.py');
assert.equal(testSource.match(/invoke_on_load=True/g).length,2);
assert.equal(testSource.match(/self\.assertEqual\(em\.names\(\), \['t2'\]\)/g).length,2);
const enabled=read('source/stevedore/enabled.py'),extension=read('source/stevedore/extension.py');
assert.ok(enabled.includes('invoke_on_load: bool = False'));
const enabledLoad=enabled.slice(enabled.indexOf('    def _load_one_plugin('));
assert.ok(enabledLoad.indexOf('super()._load_one_plugin(')<enabledLoad.indexOf('self.check_func(ext)'));
const parentLoad=extension.slice(extension.indexOf('    def _load_one_plugin('),extension.indexOf('    def names('));
assert.ok(parentLoad.indexOf('plugin = ep.load()')<parentLoad.indexOf('obj = plugin(*invoke_args, **invoke_kwds)'));
assert.ok(parentLoad.includes('else:\n            obj = None'));
assert.equal(read('explainer.html').includes('/Users/'),false,'no personal filesystem path in public HTML');
const browser=new ChromeVisualBrowser(findChrome());
const observations=[];
try{
  for(const width of [1440,390]){
    await browser.resetPage();
    const metrics=await inspectPublicHtml(browser,{artifactPath:path.join(root,'explainer.html'),width,height:1000,theme:'light',keyboard:false});
    assert.deepEqual(metrics.consoleErrors,[]);
    const result=await browser.cdp.send('Runtime.evaluate',{expression:`({
      snippets:[...document.querySelectorAll('[data-block-type="snippet"]')].map(b=>({id:b.id,text:b.querySelector('pre code').textContent})),
      officialRows:[...document.querySelectorAll('#expected-table tbody tr')].map(r=>r.textContent),
      defaultRows:[...document.querySelectorAll('#mode-table tbody tr')].map(r=>r.textContent),
      tables:['expected-table','order-table','mode-table'].map(id=>{const block=document.getElementById(id),table=block.querySelector('table');return {id,containerWidth:table.parentElement.clientWidth,tableWidth:table.scrollWidth}}),
      sourceLinks:[...document.querySelectorAll('.sources a')].map(a=>a.href),
      docWidth:document.documentElement.scrollWidth,
      title:document.querySelector('h1').textContent,
      diagramCount:document.querySelectorAll('[data-block-type="diagram"]').length
    })`,returnByValue:true},await browser.sessionPromise);
    assert.equal(result.exceptionDetails,undefined);
    const dom=result.result.value;
    assert.deepEqual(dom.snippets,shown);
    assert.equal(dom.officialRows.length,2);
    assert.ok(dom.officialRows.every(row=>row.includes("['t2']")));
    assert.ok(dom.defaultRows[0].includes('False（默认）')&&dom.defaultRows[0].includes('None'));
    assert.equal(dom.diagramCount,0);
    assert.equal(dom.docWidth,width);
    assert.equal(dom.sourceLinks.length,document.sources.length);
    assert.ok(dom.sourceLinks.every(url=>url.includes(manifest.revision)));
    observations.push({width,theme:'light',shownSnippetBytesExact:dom.snippets.map(s=>({id:s.id,sha256:hash(s.text)})),
      officialRows:dom.officialRows,defaultRows:dom.defaultRows,tables:dom.tables,docWidth:dom.docWidth,diagramCount:dom.diagramCount,sourceLinks:dom.sourceLinks,consoleErrors:metrics.consoleErrors,
      interactionBoundary:'DOM/source fidelity only; no pointer, keyboard, plugin load or complete browser gate acceptance'});
  }
}finally{await browser.close();}
console.log(JSON.stringify({method:'fixed file bytes, source text and actual Chrome DOM only; no Python or upstream code/test executed',sourceRevision:manifest.revision,
  completeFilesExact:manifest.files.length,sourceOrder:{parentBeforeCheck:true,loadBeforeOptionalInvoke:true,defaultInvokeFalse:true},officialExpectedSource:{explicitInvokeTrueStatements:2,namesT2Assertions:2},observations},null,2));
