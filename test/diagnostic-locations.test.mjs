import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {formatDiagnostics} from '../archify/renderers/shared/diagnostics.mjs';
import {startPreview} from '../archify/bin/preview.mjs';
const cli=new URL('../archify/bin/archify.mjs',import.meta.url).pathname;
const fixture=new URL('../experiments/diagnostic-locations/fixtures/repeated-labels.archify.md',import.meta.url).pathname;
const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});

test('diagnostic locations: public text distinguishes three real identical-message subjects without altering JSON',()=>{
 const text=run(['validate','explainer',fixture]),json=run(['validate','explainer',fixture,'--json']);
 assert.equal(text.status,1);assert.equal(json.status,1);
 const diagnostics=JSON.parse(json.stdout).diagnostics;
 assert.equal(diagnostics.length,3);assert.equal(new Set(diagnostics.map(d=>d.message)).size,1);
 for(const [i,d]of diagnostics.entries()){
  assert.equal(d.subject.line,13+i);assert.equal(d.subject.column,1);
  assert.equal(d.subject.path,`/panels/0/blocks/1/rows/${i+2}/id`);
  assert.ok(text.stderr.includes(`line ${d.subject.line}, column 1, path ${JSON.stringify(d.subject.path)}, component "comparison"`));
  assert.ok(text.stderr.includes(d.message));
 }
 assert.equal((text.stderr.match(/\[explainer\/duplicate-id\]/gu)||[]).length,3);
});
test('diagnostic locations: only supplied suitable fields appear, zero block/index survive, inputs are not invented',()=>{
 const diagnostics=[{code:'example',message:'ordinary message',subject:{block:0,index:0,node:'worker',line:undefined,column:undefined,input:'/private/source.json'},supportedFixes:['repair this']}];
 const before=JSON.stringify(diagnostics),text=formatDiagnostics('failed',diagnostics);
 assert.match(text,/node "worker", block 0, index 0/);assert.doesNotMatch(text,/line |column |private\/source/);assert.equal(JSON.stringify(diagnostics),before);
 assert.equal(formatDiagnostics('failed',[{code:'example',message:'ordinary message'}]),'failed\n[example] ordinary message');
 assert.equal(formatDiagnostics('failed',[]),'failed');
 const bad=formatDiagnostics('failed',[{code:'example',message:'message',subject:{line:0,column:'1',node:[],path:{nested:true},block:-1}}]);
 assert.equal(bad,'failed\n[example] message');
});
test('diagnostic locations: supplied control characters remain literal on one line',()=>{
 const value='<img src=x>\n\r\u001b\u0085\u2028\u2029\u202e\u2066"\\';
 const text=formatDiagnostics('failed',[{code:'example',message:'message',subject:{node:value}}]);
 assert.equal(text.split('\n').length,2);assert.ok(text.includes('\\n\\r\\u001b\\u0085\\u2028\\u2029\\u202e\\u2066'));assert.equal(text.includes('\u202e'),false);
});
test('diagnostic locations: incomplete-install doctor does not acquire a renderer import',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-diag-doctor-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const bin=path.join(dir,'archify','bin');fs.mkdirSync(bin,{recursive:true});fs.copyFileSync(cli,path.join(bin,'archify.mjs'));
 const result=spawnSync(process.execPath,[path.join(bin,'archify.mjs'),'doctor'],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stdout,/Archify doctor/);assert.doesNotMatch(result.stderr,/ERR_MODULE_NOT_FOUND|Cannot find module/);
});
test('diagnostic locations: preview preserves located repeats and inserts hostile text through textContent',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-diag-preview-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const input=path.join(dir,'input.json'),output=path.join(dir,'output.html'),delivery=path.join(dir,'delivery.mjs');fs.writeFileSync(input,'{}');
 const subject={line:13,column:1,path:'/rows/0/id',node:'<img src=x onerror=alert(1)>\nsecond',index:0};
 const entries=[0,1].map(i=>({code:'example/repeated',message:'same message',subject:{...subject,line:13+i},supportedFixes:['repair']}));
 fs.writeFileSync(delivery,`console.log(JSON.stringify(${JSON.stringify({ok:false,stage:'prepare',error:'Invalid input',diagnostics:entries})}));process.exitCode=1;`);
 const preview=await startPreview({type:'tree',input,output,open:false,deliveryCli:delivery,pollMs:50});
 try{
  let state;for(let n=0;n<100;n++){state=await(await fetch(new URL('/state',preview.url))).json();if(state.status==='needs-fix')break;await new Promise(r=>setTimeout(r,30));}
  assert.equal(state.status,'needs-fix');assert.match(state.failure.message,/line 13/);assert.match(state.failure.message,/line 14/);assert.match(state.failure.message,/index 0/);assert.equal((state.failure.message.match(/same message/gu)||[]).length,2);
  const page=await(await fetch(preview.url)).text(),script=page.match(/<script>\n([\s\S]*?)\n  <\/script>/u)[1];
  const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',dataset:{},setAttribute(){},removeAttribute(){},addEventListener(){},classList:{add(){},remove(){}}});return elements.get(id);};
  let onMessage;const context={document:{getElementById:element,body:{dataset:{}}},window:{addEventListener(){}},EventSource:class{addEventListener(name,callback){if(name==='state')onMessage=callback;}},navigator:{clipboard:{writeText:async()=>{}}},console};
  vm.runInNewContext(script,context);onMessage({data:JSON.stringify(state)});
  assert.ok(element('diagnostic').textContent.includes('<img src=x onerror=alert(1)>'));
  assert.equal(element('diagnostic').innerHTML,undefined);assert.equal(fs.existsSync(output),false);
 }finally{await preview.stop();}
});
test('diagnostic locations: preview redacts JSON-quoted Windows paths as well as raw paths',()=>{
 const source=fs.readFileSync(new URL('../archify/bin/preview.mjs',import.meta.url),'utf8');
 const extract=name=>{const start=source.indexOf(`function ${name}(`),end=source.indexOf('\n}',start)+2;return source.slice(start,end);};
 const redact=vm.runInNewContext(`${extract('compactMessage')}\n(${extract('redactDiagnostic')})`);
 for (const windows of ['C:\\Users\\someone\\source.json', 'C:\\Users\\someone\\branch\u2028part\u2029.json']) {
  const located=formatDiagnostics('failed',[{code:'x',message:'message',subject:{path:windows}}]);
  const redacted=redact(located,[[windows,'<input.json>']]);assert.ok(redacted.includes('<input.json>'));assert.equal(redacted.includes('someone'),false);
 }
});
