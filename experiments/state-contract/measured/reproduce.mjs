// Scoped evidence runner. Requires local registry tarballs; installs only inside a fresh private directory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const [robotTar,typescriptTar,work,npmCli,...extra]=process.argv.slice(2);
if(!robotTar||!typescriptTar||!work||!npmCli||extra.length)throw Error('Usage: node reproduce.mjs <robot3-0.2.21.tgz> <typescript-4.5.4.tgz> <fresh-private-dir> <trusted-npm-cli.js>');
const manifest=JSON.parse(fs.readFileSync(path.join(here,'upstream-manifest.json'),'utf8'));
const digest=(b,algorithm='sha256')=>crypto.createHash(algorithm).update(b).digest(algorithm==='sha512'?'base64':'hex');
for(const item of manifest.files){const b=fs.readFileSync(path.join(here,'upstream',item.path));if(b.length!==item.bytes||digest(b)!==item.sha256)throw Error(`Frozen source mismatch: ${item.path}`);}
const tarballs={};
for(const [name,input] of [['robot3',robotTar],['typescript',typescriptTar]]){
 const fd=fs.openSync(input,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
 try {const stat=fs.fstatSync(fd);if(!stat.isFile()||stat.size>32*1024*1024)throw Error('Expected a regular local tarball of at most 32 MiB');tarballs[name]=fs.readFileSync(fd);}
 finally{fs.closeSync(fd);}
 const expected=manifest.dependencies[name];if(digest(tarballs[name])!==expected.tarballSha256||'sha512-'+digest(tarballs[name],'sha512')!==expected.integrity)throw Error(`Lock integrity mismatch: ${name}`);
}
// No cleanup of prior paths. A failed attempt remains inspectable; reuse requires another fresh directory.
fs.mkdirSync(work);const root=path.resolve(work);
const write=(name,value)=>fs.writeFileSync(path.join(root,name),value,{flag:'wx'});
const dependencies={},packages={'':{name:'frozen-state-export',version:'1.0.0',dependencies}};
for(const [name,b] of Object.entries(tarballs)){
 write(name+'.tgz',b);dependencies[name]='file:./'+name+'.tgz';const e=manifest.dependencies[name];packages['node_modules/'+name]={version:e.version,resolved:'file:./'+name+'.tgz',integrity:e.integrity};
}
write('package.json',JSON.stringify({name:'frozen-state-export',version:'1.0.0',private:true,dependencies},null,2)+'\n');
write('package-lock.json',JSON.stringify({name:'frozen-state-export',version:'1.0.0',lockfileVersion:3,requires:true,packages},null,2)+'\n');
function run(name,args){const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});write(name+'.stdout.txt',result.stdout||'');write(name+'.stderr.txt',result.stderr||'');if(result.status!==0)throw Error(`${name} failed (${result.status}): ${result.error?.message||'see original stderr'}`);return result.stdout;}
run('install',[path.resolve(npmCli),'ci','--ignore-scripts','--no-audit','--no-fund','--offline','--cache',path.join(root,'cache')]);
const require=createRequire(path.join(root,'runner.cjs')),ts=require('typescript');
for(const p of ['test/machines/features.ts','src/lib/dag.ts','src/lib/nodes.ts','src/util.ts']){
 const source=fs.readFileSync(path.join(here,'upstream',p),'utf8');
 const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},fileName:p,reportDiagnostics:true});
 if(result.diagnostics.length)throw Error('Unexpected transpilation diagnostics');
 const out=path.join(root,'compiled',p.replace(/\.ts$/,'.js'));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,result.outputText,{flag:'wx'});
}
write('export.cjs',`const fs=require('fs');
const {transitions}=require('./compiled/test/machines/features.js');
const {getDAG}=require('./compiled/src/lib/dag.js');
const dag=getDAG(transitions);
const initial=dag.nodes.filter(n=>n.kind==='state'&&n.label===transitions.current);
if(initial.length!==1)throw Error('Initial constructor state is not uniquely mapped');
fs.writeFileSync('derived-sidecar.json',JSON.stringify({initialState:initial[0].id,expectedEvents:[...new Set(dag.edges.map(e=>e.label))]},null,2)+'\\n',{flag:'wx'});
process.stdout.write(JSON.stringify(dag,null,2)+'\\n');\n`);
const output=run('getDAG',['export.cjs']);write('getDAG.stdout.json',output);
for(const name of ['getDAG.stdout.json','derived-sidecar.json'])if(fs.readFileSync(path.join(root,name),'utf8')!==fs.readFileSync(path.join(here,'inputs',name),'utf8'))throw Error(`Reproduction differs: ${name}`);
console.log(JSON.stringify({ok:true,states:JSON.parse(output).nodes.length,edges:JSON.parse(output).edges.length,eventsSent:0,scope:'Construction plus getDAG only; no typecheck/full build or callback execution.'}));
