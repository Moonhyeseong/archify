import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, realpathSync, mkdirSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { project, documents, generate } from './convert.mjs';
const a = () => JSON.parse(readFileSync(new URL('fixtures/priors-2.json',import.meta.url)));
const b = () => JSON.parse(readFileSync(new URL('fixtures/priors-1.json',import.meta.url)));
const temp = () => mkdtempSync(path.join(realpathSync(tmpdir()),'recipe-test-'));

test('only priors changes between fixtures and moves api::check across the body',()=>{
  const x=a(),y=b();y.recipes.release.priors=2;assert.deepEqual(y,x);
  const p=project(x,'release'),q=project(b(),'release');
  assert.deepEqual(p.before.map(x=>x.qualified),['web::check','api::check']);
  assert.deepEqual(q.before.map(x=>x.qualified),['web::check']);
  assert.deepEqual(q.after.map(x=>x.qualified),['api::check','notify']);
  assert.deepEqual(p.selected.dependencies.map(x=>x.recipe),q.selected.dependencies.map(x=>x.recipe));
});
test('native edges link three phases only, never invent an edge between priors',()=>{
  const x=JSON.parse(documents(project(a(),'release'))['stages.workflow.json']);
  assert.equal(x.nodes.length,3);
  assert.deepEqual(x.edges.map(e=>[e.from,e.to]),[['before','body'],['body','after']]);
  assert.deepEqual(x.cards[0].items,['web::check','api::check']);
});
test('qualified inventory preserves root and module same names; local resolution stays local',()=>{
  const x=a();x.modules.web.recipes.check.dependencies=[{recipe:'check',arguments:[],star:null}];x.modules.web.recipes.check.priors=1;
  assert.throws(()=>project(x,'release'),/cycle/);
  const p=project(a(),'release');assert.ok(p.inventory.includes('check'));assert.ok(p.inventory.includes('web::check'));assert.ok(p.inventory.includes('api::check'));
  assert.equal(new Set(p.inventory).size,5);
  x.modules.web.module_path='api';assert.throws(()=>project(x,'release'),/module_path/);
});
test('priors bounds, missing target, missing dependency and cycles refuse explicitly',()=>{
  for(const value of [-1,4,1.5,'2']){const x=a();x.recipes.release.priors=value;assert.throws(()=>project(x,'release')); }
  const x=a();x.recipes.release.dependencies[0].recipe='missing';assert.throws(()=>project(x,'release'),/Missing dependency/);
  const y=a();y.recipes.notify.dependencies=[{recipe:'release',arguments:[],star:null}];y.recipes.notify.priors=1;assert.throws(()=>project(y,'release'),/cycle/);
  assert.throws(()=>project(a(),'missing'),/absent/);
});
test('star and known expression AST stay unexpanded without evaluation',()=>{
  const x=a();x.recipes.release.dependencies[0].arguments=[['evaluate','touch should-never-exist'],['call','env_var','TOKEN']];x.recipes.release.dependencies[0].star=0;
  const d=project(x,'release').before[0];assert.equal(d.star,0);assert.equal(d.expansion,'not-expanded');assert.deepEqual(d.arguments,x.recipes.release.dependencies[0].arguments);
  x.recipes.release.dependencies[0].star=2;assert.throws(()=>project(x,'release'),/Star index/);
});
test('unknown fields/shapes and unsupported aliases, attributes and expression forms refuse',()=>{
  const cases=[x=>x.future=true,x=>delete x.recipes.release.priors,x=>x.recipes.release.extra=1,x=>x.recipes.release.dependencies[0].recipe={name:'check'},x=>x.recipes.release.dependencies[0].arguments=[['future-op',1]],x=>x.recipes.release.body=['not-fragment-array'],x=>x.aliases={go:{target:'release'}},x=>x.recipes.release.attributes=['parallel'],x=>x.settings.future=true,x=>x.recipes.release.dependencies[0].arguments=[['call',null]],x=>x.recipes.release.dependencies[0].arguments=[['variable','bad name']]];
  for(const change of cases){const x=a();change(x);assert.throws(()=>project(x,'release'));}
});
test('coverage never treats omitted disabled recipes or absent modules as zero source entries',()=>{
  const p=project(a(),'release');assert.match(p.coverage.sourceRecipes,/unknown.*disabled_recipes/);assert.match(p.coverage.absentModules,/unknown.*absent_modules/);assert.equal(p.coverage.inspectedDumpRecipes,5);assert.equal(p.coverage.execution,'not-run');
  const x=a();x.disabled_recipes={};assert.throws(()=>project(x,'release'),/unknown/);
});
test('JSON bounds limit strings, nesting, modules, dependency count and oversized files',()=>{
  const x=a();x.recipes.release.body=[['x'.repeat(2001)]];assert.throws(()=>project(x,'release'),/string bound/);
  const y=a();y.recipes.release.dependencies=Array(5).fill(y.recipes.release.dependencies[0]);assert.throws(()=>project(y,'release'),/bound/);
  const z=a();let nested=[];for(let i=0;i<20;i++)nested=[nested];z.recipes.release.body=[nested];assert.throws(()=>project(z,'release'),/depth/);
  const root=temp();try{const input=path.join(root,'large.json');writeFileSync(input,'x'.repeat(131073));assert.throws(()=>generate(input,'release',path.join(root,'out')),/128 KiB/);assert.equal(existsSync(path.join(root,'out')),false);}finally{rmSync(root,{recursive:true,force:true});}
});
test('fresh output and input/ancestor symlinks refuse while victim bytes remain intact',()=>{
 const root=temp();try{const input=path.join(root,'input.json');writeFileSync(input,JSON.stringify(a()));const victim=path.join(root,'victim');mkdirSync(victim);writeFileSync(path.join(victim,'projection.json'),'precious');const out=path.join(root,'out');generate(input,'release',out);assert.throws(()=>generate(input,'release',out));symlinkSync(victim,path.join(root,'link'));assert.throws(()=>generate(input,'release',path.join(root,'link')));assert.throws(()=>generate(input,'release',path.join(root,'link','child')),/ancestors/);symlinkSync(input,path.join(root,'input-link'));assert.throws(()=>generate(path.join(root,'input-link'),'release',path.join(root,'new')));assert.equal(readFileSync(path.join(victim,'projection.json'),'utf8'),'precious');assert.equal(existsSync(path.join(victim,'child')),false);}finally{rmSync(root,{recursive:true,force:true});}
});
test('public render accepts both fixtures and keeps argument/body strings literal without shell effects',()=>{
 const root=temp();const cli=fileURLToPath(new URL('../../archify/bin/archify.mjs',import.meta.url));
 try{
  for(const [index,dump]of [a(),b()].entries()){
   const victim=path.join(root,'not-executed');const marker=`touch ${victim}`;
   dump.recipes.release.dependencies[0].arguments=[['evaluate',marker],'[literal](https://example.invalid/not-source)','![x](https://example.invalid/no.png)','[run](javascript:alert(1))','`tick`|pipe\nnext'];
   dump.recipes.release.body=[[marker,'[body](https://example.invalid/body)']];
   const input=path.join(root,`input-${index}.json`),out=path.join(root,`out-${index}`);writeFileSync(input,JSON.stringify(dump));generate(input,'release',out);
   const result=spawnSync(process.execPath,[cli,'render','explainer',path.join(out,'review.archify.md'),path.join(out,'review.html')],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});assert.equal(result.status,0,result.stderr);
   const html=readFileSync(path.join(out,'review.html'),'utf8'),tbody=html.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0];assert.ok(tbody);assert.doesNotMatch(tbody,/<(?:a|img|script)\b/);assert.ok(tbody.includes('[literal](https://example.invalid/not-source)'));assert.equal(existsSync(victim),false);
   const p=JSON.parse(readFileSync(path.join(out,'projection.json'),'utf8'));assert.deepEqual(p.selected.body,dump.recipes.release.body);assert.equal(p.selected.dependencies[0].arguments[0][1],marker);
  }
 }finally{rmSync(root,{recursive:true,force:true});}
});
