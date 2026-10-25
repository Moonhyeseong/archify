import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ChromeVisualBrowser,findChrome} from '../../archify/bin/visual-check.mjs';
import {inspectPublicHtml} from '../../archify/explainer/browser-check.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(root,'source/revision.mjs'),'utf8');
const browser=new ChromeVisualBrowser(findChrome());
const records=[];
const value=async expression=>{
  const result=await browser.cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},await browser.sessionPromise);
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  return result.result.value;
};
const send=async(method,params)=>browser.cdp.send(method,params,await browser.sessionPromise);
const waitFor=async id=>{
  for(let n=0;n<40;n++){
    const s=await value(`({hash:location.hash,active:document.activeElement.id,y:document.getElementById(${JSON.stringify(id)})?.getBoundingClientRect().y})`);
    if(s.hash==='#'+id&&s.active===id&&s.y>=0&&s.y<900)return s;
    await new Promise(resolve=>setTimeout(resolve,25));
  }
  throw new Error('Target did not receive fragment/focus/visible location: '+id+' '+JSON.stringify(await value(`({hash:location.hash,active:document.activeElement.outerHTML.slice(0,500),target:document.getElementById(${JSON.stringify(id)})?.outerHTML,rect:document.getElementById(${JSON.stringify(id)})?.getBoundingClientRect().toJSON(),scroll:scrollY})`)));
};
const click=async selector=>{
  const rect=await value(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing link');e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...rect,button:'left',clickCount:1});
};
const enter=async selector=>{
  assert.equal(await value(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center'});e.focus();return document.activeElement===e;})()`),true);
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
};

try {
  for(const width of [1440,390])for(const theme of ['light','dark']){
    await browser.resetPage();
    const metrics=await inspectPublicHtml(browser,{artifactPath:path.join(root,'candidate.html'),width,height:900,theme,keyboard:false});
    assert.deepEqual(metrics.consoleErrors,[]);
    assert.equal(metrics.scrollWidth,width,'page itself must not overflow');
    assert.deepEqual(await value(`['snippet-a','snippet-b'].map(id=>document.querySelector('#'+id+' pre code').textContent)`),[source,source]);
    await click('a[href="#expnote-snippet-a-note-text"]');
    const pointerNote=await waitFor('expnote-snippet-a-note-text');
    await click('a[href="#expnote-snippet-a-line-6"]');
    const pointerReturn=await waitFor('expnote-snippet-a-line-6');
    await enter('a[href="#expnote-snippet-b-note-child"]');
    const keyboardNote=await waitFor('expnote-snippet-b-note-child');
    await enter('a[href="#expnote-snippet-b-line-16"]');
    const keyboardReturn=await waitFor('expnote-snippet-b-line-16');
    const history=await send('Page.getNavigationHistory',{});
    await send('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex-1].id});
    await waitFor('expnote-snippet-b-note-child');
    await send('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex].id});
    await waitFor('expnote-snippet-b-line-16');
    const scrollable=await value(`(()=>{const p=document.querySelector('#snippet-b pre');const maximum=p.scrollWidth-p.clientWidth;p.scrollLeft=maximum;return{maximum,actual:p.scrollLeft};})()`);
    if(width===390)assert.ok(scrollable.maximum>0&&scrollable.actual>0);
    await enter('a[href="#expnote-snippet-b-note-child"]');await waitFor('expnote-snippet-b-note-child');
    await enter('a[href="#expnote-snippet-b-line-16"]');await waitFor('expnote-snippet-b-line-16');
    await value(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:text=>{window.__lineNotesCopied=text;return Promise.resolve();}}})`);
    const copied=[];
    for(const id of ['snippet-a','snippet-b']){
      await click('#'+id+' [data-copy]');
      const payload=await value(`new Promise(resolve=>setTimeout(()=>resolve(window.__lineNotesCopied),0))`);
      assert.equal(payload,source);copied.push(createHash('sha256').update(payload).digest('hex'));
    }
    await value(`document.querySelector('.cite a[href="#source-revision-source"]').focus()`);
    assert.equal(await value(`!document.querySelector('.source-card').hidden`),true,'original source card still opens');
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert.equal(await value(`document.querySelector('.source-card').hidden`),true);
    await click('a[href="#panel-a"]');
    assert.equal(await value('location.hash'),'#panel-a','ordinary panel link still works');
    records.push({width,theme,pointerNote,pointerReturn,keyboardNote,keyboardReturn,backForwardExact:true,
      horizontalScroll:scrollable,copiedSha256:copied,sourceCardOpenEscape:true,panelLink:true,consoleErrors:metrics.consoleErrors,
      tabStopBoundary:'activation uses focused ordinary anchors plus real Enter; target tabindex=-1; not a complete Tab traversal'});
  }
  const url=pathToFileURL(path.join(root,'candidate.html'));url.hash='expnote-snippet-b-note-child';
  const session=await browser.sessionPromise,loaded=browser.cdp.waitFor('Page.loadEventFired',session);loaded.catch(()=>{});
  await send('Page.navigate',{url:url.href});await loaded;await waitFor('expnote-snippet-b-note-child');
  process.stdout.write(JSON.stringify({mechanism:'actual headless Chrome CDP pointer/Enter/history; copied payload uses resolved stub, no OS clipboard write',records,deepLinkExact:true,nativeChild:'not present; not claimed tested'},null,2)+'\n');
} finally { await browser.close(); }
