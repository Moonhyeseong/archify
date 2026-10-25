import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {parse} from 'parse5';
import {convert,publish} from './adapter.mjs';
const fixture=JSON.parse(fs.readFileSync('experiments/plan-actions/fixtures/synthetic.plan.json','utf8'));
const resource=change=>({address:'example.x',type:'example',change:{actions:['update'],...change}});
const plan=resources=>({format_version:'1.2',resource_changes:resources});
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'plan-actions-test-'));
const walk=n=>[n,...(n.childNodes??[]).flatMap(walk)];
const content=n=>n.nodeName==='#text'?n.value:(n.childNodes??[]).map(content).join('');

test('both replacement arrays retain different action and graph edge order',()=>{
 const r=convert(fixture,'synthetic');
 assert.deepEqual(r.projection.resources[2].change.actions,['delete','create']);
 assert.deepEqual(r.projection.resources[3].change.actions,['create','delete']);
 assert.deepEqual(r.workflow.nodes.filter(n=>n.lane==='r-3').map(n=>n.label),['delete','create']);
 assert.deepEqual(r.workflow.nodes.filter(n=>n.lane==='r-4').map(n=>n.label),['create','delete']);
 for(const e of r.workflow.edges){const a=r.workflow.nodes.find(n=>n.id===e.from),b=r.workflow.nodes.find(n=>n.id===e.to);assert.equal(a.lane,b.lane);}
 assert.equal(r.workflow.edges.length,2);
});
test('complete missing, false and true stay distinct; bad shapes refused',()=>{
 for(const [value,expected]of[[undefined,'not-provided'],[false,false],[true,true]]){const p=plan([]);if(value!==undefined)p.complete=value;assert.equal(convert(p,'synthetic').projection.complete,expected);}
 for(const bad of [null,0,'true',{},[]])assert.throws(()=>convert({...plan([]),complete:bad},'synthetic'),/boolean/);
});
test('deferred records stay separate and never become scheduled rows',()=>{
 const r=convert(fixture,'synthetic');assert.equal(r.projection.resources.length,5);assert.equal(r.projection.deferred.length,1);
 assert.equal(r.projection.deferred[0].resource.address,'example_service.later');assert.equal(r.workflow.lanes.length,5);
 const p={...plan([]),deferred_changes:[{reason:'provider_config_unknown'},{}]};const projected=convert(p,'synthetic').projection;
 assert.equal(projected.deferred[0].resource,null);assert.equal(projected.deferred[1].reason,null);
});
test('unknown, sensitive and literal null paths do not collapse',()=>{
 const r=convert(fixture,'synthetic').projection.resources[0].change;
 assert.deepEqual(r.unknownAfterPaths.paths,[['id']]);assert.deepEqual(r.sensitiveAfterPaths.paths,[['token']]);assert.deepEqual(r.explicitNullAfter.paths,[['endpoint']]);
 const c=convert(plan([resource({after:{a:null,b:[null,null]},after_unknown:{a:true,b:[false,true]},after_sensitive:{b:[true,false]}})]),'synthetic').projection.resources[0].change;
 assert.deepEqual(c.explicitNullAfter.paths,[]);assert.deepEqual(c.unknownAfterPaths.paths,[['a'],['b',1]]);assert.deepEqual(c.sensitiveAfterPaths.paths,[['b',0]]);
});
test('true ancestor mask suppresses all null-path traversal beneath it',()=>{
 const r=convert(plan([resource({after:{privateName:null},after_sensitive:true,after_unknown:{}})]),'synthetic').projection.resources[0].change;
 assert.deepEqual(r.sensitiveAfterPaths.paths,[[]]);assert.deepEqual(r.explicitNullAfter.paths,[]);
});
test('replace paths retain string versus numeric segments and resource identity/deposed',()=>{
 const input=resource({actions:['delete','create'],replace_paths:[['items',0,'0'],['items','0']]});input.deposed='opaque1';
 const r=convert(plan([input]),'synthetic').projection.resources[0];assert.equal(r.address,'example.x');assert.equal(r.deposed,'opaque1');
 assert.deepEqual(r.change.replacePaths.paths,[['items',0,'0'],['items','0']]);
});
test('no-op stays visible and omitted collections are not asserted as zero infrastructure',()=>{
 const r=convert(fixture,'synthetic');assert.ok(r.workflow.nodes.some(n=>n.label==='no-op'));
 const p=convert({format_version:'1.2',complete:true},'synthetic').projection;assert.equal(p.resourceChangesStatus,'not-provided');assert.equal(p.deferredChangesStatus,'not-provided');
 assert.throws(()=>convert({format_version:'1.2',values:{}},'synthetic'),/state-only/);
});
test('unselected root/resource/change values are counted but never copied',()=>{
 const p=plan([{...resource({future_change:{value:'SECRET_FUTURE_CHANGE'},before:'SECRET_BEFORE',after:'SECRET_AFTER'}),future_resource:'SECRET_RESOURCE'}]);p.future_root={nested:'SECRET_ROOT'};
 const r=convert(p,'synthetic');const out=JSON.stringify(r);for(const value of ['SECRET_FUTURE_CHANGE','SECRET_BEFORE','SECRET_AFTER','SECRET_RESOURCE','SECRET_ROOT'])assert.equal(out.includes(value),false);
 assert.equal(r.projection.unprojectedRootFieldCount,1);assert.equal(r.projection.resources[0].unprojectedFieldCount,1);assert.equal(r.projection.resources[0].change.unprojectedFieldCount,1);
});
test('unsupported action sequences and formats fail without guessing',()=>{
 for(const a of [[],['explode'],['create','update'],['create','create'],['create,delete'],[null]])assert.throws(()=>convert(plan([resource({actions:a})]),'synthetic'),/unsupported action/);
 for(const v of ['0.1','2.0','1.3','1.2.0',1.2,null,undefined])assert.throws(()=>convert({...plan([]),format_version:v},'synthetic'),/format_version/);
 for(const v of ['1.0','1.1','1.2'])assert.equal(convert({...plan([]),format_version:v},'synthetic').projection.formatVersion,v);
});
test('invalid masks, paths, limits and metadata are explicitly refused',()=>{
 for(const m of ['unknown',null,1,{bad:null}])assert.throws(()=>convert(plan([resource({after_unknown:m})]),'synthetic'),/mask/);
 for(const p of [[[true]],[[null]],[[-1]],'bad'])assert.throws(()=>convert(plan([resource({replace_paths:p})]),'synthetic'),/path|array/);
 assert.throws(()=>convert(plan(Array.from({length:7},()=>resource({}))),'synthetic'),/at most 6/);
 assert.throws(()=>convert(plan([{address:'',type:'x',change:{actions:['create']}}]),'synthetic'),/metadata/);
 assert.throws(()=>convert(plan([resource({})]),'unknown'),/kind/);
});
test('all original fixture values stay out of every generated JSON and HTML',()=>{
 const dir=tmp();try{
  const out=path.join(dir,'out');publish(JSON.stringify(fixture),'synthetic',out);
  for(const[type,input,output]of[['workflow','actions.workflow.json','actions.html'],['explainer','actions.explainer.json','explainer.html']]){const r=spawnSync(process.execPath,['archify/bin/archify.mjs','render',type,path.join(out,input),path.join(out,output),'--quality','standard'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}
  const values=fs.readFileSync('experiments/plan-actions/fixtures/synthetic.plan.json','utf8').match(/SYNTHETIC_[A-Z_]+/g);
  for(const file of fs.readdirSync(out)){const text=fs.readFileSync(path.join(out,file),'utf8');for(const marker of values)assert.equal(text.includes(marker),false,`${file} leaked an omitted fixture value`);}
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('hostile metadata paths and deferred reason stay literal with no active links or images',()=>{
 const dir=tmp();try{
  const attack='![x](https://attacker.invalid/i) [x](https://attacker.invalid/p) <img src="https://attacker.invalid/x"> ` | </code><script>evil()</script> * ** ~~ \\ [ ]';
  const p=plan([{address:attack,type:attack,change:{actions:['create'],after_unknown:{[attack]:true},replace_paths:[[attack]]}}]);p.deferred_changes=[{reason:attack}];
  const out=path.join(dir,'out');publish(JSON.stringify(p),'synthetic',out);const r=spawnSync(process.execPath,['archify/bin/archify.mjs','render','explainer',path.join(out,'actions.explainer.json'),path.join(out,'explainer.html')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
  const nodes=walk(parse(fs.readFileSync(path.join(out,'explainer.html'),'utf8')));
  assert.equal(nodes.some(n=>(n.attrs??[]).some(a=>['src','href'].includes(a.name)&&a.value.includes('attacker.invalid'))),false);
  assert.equal(nodes.some(n=>n.tagName==='script'&&content(n)==='evil()'),false);
  const cells=nodes.filter(n=>n.tagName==='td').map(content);
  assert.ok(cells.some(t=>t===`${attack} · ${attack}`),'identity is literal in final table');
  assert.ok(cells.includes(attack),'deferred reason is literal in final table');
  assert.ok(cells.includes(JSON.stringify([attack])),'unknown path stays literal in final table');
  assert.ok(cells.includes('create'),'single action remains represented without replacement graph');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('fresh output refuses an existing directory and symlink without touching victim',()=>{
 const dir=tmp();try{
  fs.mkdirSync(path.join(dir,'out'));fs.writeFileSync(path.join(dir,'victim'),'unrelated bytes');fs.symlinkSync(path.join(dir,'victim'),path.join(dir,'out/projection.json'));
  assert.throws(()=>publish(JSON.stringify(fixture),'synthetic',path.join(dir,'out')),/EEXIST/);assert.equal(fs.readFileSync(path.join(dir,'victim'),'utf8'),'unrelated bytes');assert.deepEqual(fs.readdirSync(path.join(dir,'out')),['projection.json']);
  fs.symlinkSync(path.join(dir,'out'),path.join(dir,'linked-out'));assert.throws(()=>publish(JSON.stringify(fixture),'synthetic',path.join(dir,'linked-out')),/EEXIST/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI bad input creates no output and never echoes a sensitive input value in error',()=>{
 const dir=tmp();try{
  fs.writeFileSync(path.join(dir,'bad.json'),JSON.stringify(plan([resource({actions:['SECRET_BAD_ACTION'],after:'SECRET_VALUE'})])));
  const r=spawnSync(process.execPath,['experiments/plan-actions/adapter.mjs',path.join(dir,'bad.json'),'synthetic',path.join(dir,'out')],{encoding:'utf8'});
  assert.equal(r.status,1);assert.equal(JSON.parse(r.stderr).ok,false);assert.equal((r.stdout+r.stderr).includes('SECRET_'),false);assert.equal(fs.existsSync(path.join(dir,'out')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('empty collections and missing lists render as coverage boundaries, without invented action edges',()=>{
 const dir=tmp();try{
  for(const[i,p]of[plan([]),{format_version:'1.2',complete:false}].entries()){const r=convert(p,'synthetic');assert.equal(r.workflow.edges.length,0);fs.writeFileSync(path.join(dir,`empty-${i}.json`),JSON.stringify(r.workflow));const rendered=spawnSync(process.execPath,['archify/bin/archify.mjs','render','workflow',path.join(dir,`empty-${i}.json`),path.join(dir,`empty-${i}.html`),'--quality','standard'],{encoding:'utf8'});assert.equal(rendered.status,0,rendered.stderr);
   fs.writeFileSync(path.join(dir,`empty-explainer-${i}.json`),JSON.stringify(r.explainer));const page=spawnSync(process.execPath,['archify/bin/archify.mjs','render','explainer',path.join(dir,`empty-explainer-${i}.json`),path.join(dir,`empty-explainer-${i}.html`)],{encoding:'utf8'});assert.equal(page.status,0,page.stderr);
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('compact overview declares its subset while action and path tables retain every resource',()=>{
 const r=convert(fixture,'synthetic');const overview=r.explainer.panels[0];
 const graph=overview.blocks.find(b=>b.type==='diagram').spec;
 assert.deepEqual(graph.lanes.map(l=>l.id),['r-3','r-4']);assert.equal(graph.nodes.length,4);
 assert.match(graph.meta.subtitle,/2 replacement rows shown; 3 other supplied resource rows omitted/);
 assert.deepEqual(overview.blocks[0].rows.map(row=>row.cells[0].text),['false','5 supplied · provided','1 separate records · provided']);
 const resourceTable=r.explainer.panels.find(p=>p.id==='resources').blocks[0];
 const pathsTable=r.explainer.panels.find(p=>p.id==='paths').blocks[0];
 assert.equal(resourceTable.rows.length,5);assert.equal(pathsTable.rows.length,5);assert.equal(resourceTable.rows[4].cells[1].text,'no-op');
 assert.equal(r.explainer.panels.flatMap(p=>p.blocks).some(b=>b.type==='snippet'),false,'compact page avoids repeated full JSON snippets');
});
