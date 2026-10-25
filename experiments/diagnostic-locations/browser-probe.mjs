import fs from 'node:fs';
import path from 'node:path';
import {startPreview} from '../../archify/bin/preview.mjs';
import {ChromeVisualBrowser,findChrome} from '../../archify/bin/visual-check.mjs';
const directory=fs.mkdtempSync('/tmp/archify-diagnostic-browser-');
const input=path.join(directory,'input.json'),output=path.join(directory,'output.html'),delivery=path.join(directory,'delivery.mjs');
const node='<img src=x onerror="globalThis.__diagnosticInjected=true">\n@directive\u2028tail';
const diagnostics=[13,14].map(line=>({code:'probe/location',message:'Same literal message',subject:{line,column:1,path:`/rows/${line-13}/id`,node,index:0}}));
fs.writeFileSync(input,'{}',{flag:'wx'});
fs.writeFileSync(delivery,`console.log(JSON.stringify(${JSON.stringify({ok:false,error:'Controlled browser literal probe',stage:'prepare',diagnostics})}));process.exitCode=1;`,{flag:'wx'});
const preview=await startPreview({type:'tree',input,output,open:false,deliveryCli:delivery,pollMs:50});
const browser=new ChromeVisualBrowser(findChrome());
try{
 const session=await browser.sessionPromise;
 await browser.cdp.send('Page.navigate',{url:preview.url},session);
 let observed;
 for(let i=0;i<100;i++){
  const result=await browser.cdp.send('Runtime.evaluate',{expression:`({text:document.getElementById('diagnostic')?.textContent||'', images:document.getElementById('diagnostic')?.querySelectorAll('img').length||0,injected:globalThis.__diagnosticInjected===true})`,returnByValue:true},session);
  observed=result.result.value;
  if(observed.text.includes('line 14'))break;
  await new Promise(resolve=>setTimeout(resolve,80));
 }
 const checks={line13:observed.text.includes('line 13'),line14:observed.text.includes('line 14'),indexZero:observed.text.includes('index 0'),literalHtml:observed.text.includes('<img src=x'),escapedLineSeparator:observed.text.includes('\\u2028'),noElement:observed.images===0,noExecution:observed.injected===false};
 const result={kind:'actual-headless-preview-browser-probe',browser:'Chrome via existing product CDP helper',checks,pass:Object.values(checks).every(Boolean),diagnosticText:observed.text};
 console.log(JSON.stringify(result,null,2));if(!result.pass)process.exitCode=1;
}finally{await browser.close();await preview.stop({force:true});}
