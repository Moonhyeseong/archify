import fs from 'node:fs';import path from 'node:path';import{createHash}from'node:crypto';import{pathToFileURL}from'node:url';
const EXPORTER='c6f0bc93a174770e04b965e459d339a880005e78';
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const outcome=v=>['passed','failed','skipped','error'].includes(v);
const phases=['setup','call','teardown'];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const safeRelative=p=>typeof p==='string'&&p.length>0&&p.length<=200&&!p.startsWith('/')&&!p.includes('\\')&&!p.includes(':')&&!/[\x00-\x1f]/u.test(p)&&!p.split('/').some(x=>!x||x==='.'||x==='..');
const needsLiteralDetail=v=>/[`\\\r\n\x00-\x1f]/u.test(String(v))||/\{(?:good|bad|caution):/u.test(String(v))||String(v).length>160;
const literal=v=>needsLiteralDetail(v)?'literal retained in selected evidence below':`\`${String(v)}\``;
const snippet=v=>{const s=JSON.stringify(v,null,2),n=Math.max(3,...(s.match(/`+/gu)||[]).map(x=>x.length+1));return `${'`'.repeat(n)}json\n${s}\n${'`'.repeat(n)}`;};
export function compileReport(bytes,sidecar){
 if(!obj(sidecar)||sidecar.version!==1||!['synthetic','redacted'].includes(sidecar.classification)||sidecar.exporterCommit!==EXPORTER||sidecar.pytestVersion!=='8.4.2')fail('failure/source','Require explicit synthetic/redacted sidecar, supported exporter commit and pytest 8.4.2 line convention.');
 if(sidecar.reportSha256!==digest(bytes))fail('failure/hash','Report bytes do not match the sidecar SHA-256.');
 if(!obj(sidecar.pathMap)||Object.values(sidecar.pathMap).some(p=>!safeRelative(p))||new Set(Object.values(sidecar.pathMap)).size!==Object.keys(sidecar.pathMap).length)fail('failure/path-map','Map exact report path strings to distinct safe relative display paths. No source file is read.');
 if(!['provided','omitted','unknown'].includes(sidecar.traceback)||typeof sidecar.showMessages!=='boolean')fail('failure/sidecar','Provide traceback coverage and explicit showMessages boolean.');
 const report=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!obj(report))fail('failure/report','Expected a JSON report object.');
 if(report.tests!==undefined&&!Array.isArray(report.tests)||report.collectors!==undefined&&!Array.isArray(report.collectors))fail('failure/report','Tests and collectors must be arrays when provided.');
 const tests=report.tests||[],collectors=report.collectors||[];if(tests.length>20||collectors.length>20)fail('failure/budget','Select at most 20 test and 20 collector records explicitly; no silent truncation.');
 const mapPath=raw=>typeof raw==='string'&&Object.hasOwn(sidecar.pathMap,raw)?sidecar.pathMap[raw]:null;
 const locations=[],records=[],seen=new Set();let frames=0,omittedFields=0;
 const position=(value,owner,role)=>{
  if(!obj(value)||typeof value.path!=='string'||!Number.isSafeInteger(value.lineno)||value.lineno<1)fail('failure/location','Crash/frame positions must contain a string path and positive one-based safe integer.');
  const displayPath=mapPath(value.path),loc={owner,role,path:displayPath||'unavailable: path not allowlisted',rawLine:value.lineno,displayLine:value.lineno,lineConvention:'one-based; unchanged',sourceVerification:'unverified literal; source text not read'};
  if(sidecar.showMessages&&typeof value.message==='string')loc.message=value.message;
  locations.push(loc);return loc;
 };
 for(const t of tests){
  if(!obj(t)||typeof t.nodeid!=='string'||!t.nodeid||seen.has(t.nodeid))fail('failure/identity','Test nodeids must be explicit unique strings; retries require a richer occurrence contract.');seen.add(t.nodeid);
  if(!outcome(t.outcome)||!Number.isSafeInteger(t.lineno)||t.lineno<0||t.lineno>=Number.MAX_SAFE_INTEGER)fail('failure/test','Require a supported reported outcome and nonnegative zero-based test.lineno that can be incremented exactly.');
  const rawPath=t.nodeid.split('::')[0],displayPath=mapPath(rawPath);if(!displayPath)fail('failure/test-path','Collected nodeid path must have an explicit sidecar display mapping; it does not identify the definition file.');
  const identity=displayPath+t.nodeid.slice(rawPath.length);const rec={test:identity,reportedOutcome:t.outcome,stages:{}};
  locations.push({owner:identity,role:'reported test line (file unavailable)',path:'unavailable: definition file not exported',rawLine:t.lineno,displayLine:t.lineno+1,lineConvention:'zero-based test.lineno + 1',sourceVerification:'location[0] omitted by exporter; nodeid path is not a definition-file claim'});
  for(const phase of phases){const stage=t[phase];if(stage===undefined){rec.stages[phase]={outcome:'not-provided',traceback:'unavailable: stage missing'};continue;}
   if(!obj(stage)||!['passed','failed','skipped'].includes(stage.outcome))fail('failure/stage',`Unsupported ${phase} stage shape or outcome.`);
   if(stage.outcome!=='failed'&&(stage.crash!==undefined||stage.traceback!==undefined))fail('failure/phase-conflict','Non-failed stages cannot carry failure locations in this supported slice.');
   const phaseRecord={outcome:stage.outcome,traceback:'unavailable: not provided; absence does not prove an empty stack'};
   if(stage.crash!==undefined)phaseRecord.crash=position(stage.crash,identity,`${phase} crash`);
   if(stage.traceback!==undefined){if(!Array.isArray(stage.traceback))fail('failure/traceback','Provided traceback must be an array.');if(sidecar.traceback==='omitted')fail('failure/coverage-conflict','Sidecar says traceback omitted but report contains traceback.');frames+=stage.traceback.length;if(frames>50)fail('failure/budget','At most 50 supplied frames; select explicitly rather than truncate.');phaseRecord.traceback=stage.traceback.length?'supplied entries; not a complete call graph':'supplied empty array; completeness not established';phaseRecord.frames=stage.traceback.map(f=>position(f,identity,`${phase} frame`));}
   else if(sidecar.traceback==='omitted')phaseRecord.traceback='unavailable: exporter omission declared';
   omittedFields+=Object.keys(stage).filter(k=>!['outcome','crash','traceback'].includes(k)).length;
   rec.stages[phase]=phaseRecord;
  }
  if(['failed','skipped'].includes(rec.stages.setup.outcome)&&t.call!==undefined)fail('failure/phase-conflict','A failed/skipped setup with supplied call results is inconsistent in this supported slice.');
  if(t.outcome==='passed'&&phases.some(p=>rec.stages[p].outcome==='failed'))fail('failure/outcome-conflict','Reported passed conflicts with a supplied failed phase.');
  omittedFields+=Object.keys(t).filter(k=>!['nodeid','lineno','outcome',...phases].includes(k)).length;
  records.push(rec);
 }
 const collection=[],collectSeen=new Set();
 for(const c of collectors){if(!obj(c)||typeof c.nodeid!=='string'||collectSeen.has(c.nodeid)||!['passed','failed','skipped'].includes(c.outcome))fail('failure/collector','Collectors require unique nodeids and supported outcomes.');collectSeen.add(c.nodeid);const display=mapPath(c.nodeid);collection.push({collector:display||'unavailable: collector identity not allowlisted',outcome:c.outcome,sourceLocation:'not supplied by collector serializer',longrepr:'not exported by this reader'});omittedFields+=Object.keys(c).filter(k=>!['nodeid','outcome'].includes(k)).length;}
 omittedFields+=Object.keys(report).filter(k=>!['tests','collectors'].includes(k)).length;
 const availability=report.tests===undefined&&report.collectors===undefined?'unavailable: summary-only input cannot establish no failures':tests.length===0&&collectors.length===0?'empty detail arrays supplied; completeness not established':'provided records only; no completeness claim';
 const failures=records.flatMap(r=>phases.filter(p=>r.stages[p].outcome==='failed').map(p=>`${r.test} ${p}`)),collectionFailures=collection.filter(c=>c.outcome==='failed').length;
 const projection={kind:'pytest-failure-reading',classification:sidecar.classification,exporterCommit:EXPORTER,pytestVersion:sidecar.pytestVersion,reportSha256:sidecar.reportSha256,availability,tests:records,collectors:collection,locations,reportedFailedStages:report.tests===undefined?null:failures.length,reportedFailedCollectors:report.collectors===undefined?null:collectionFailures,privacy:{omittedTopAndStageFieldCount:omittedFields,excluded:'root/environment/streams/log/longrepr/duration/summary/unknown fields and non-allowlisted paths; messages included only when explicitly enabled',warning:'Test identities, paths and selected messages are metadata and may still identify people/projects. This projection is not an anonymization guarantee.'},sourceVerification:'unverified literal positions only; no frame/test path or URL opened'};
 const headline=report.tests===undefined&&report.collectors===undefined?'Failure-stage counts unavailable: no test or collection detail records supplied.':`${report.tests===undefined?'Unavailable':failures.length} supplied failed stages; ${report.collectors===undefined?'unavailable':collectionFailures} supplied failed collectors.`;
 const inputDescription=sidecar.classification==='synthetic'?'synthetic supplied fixture':'provided redacted report';
 let md=`# Test failure stages and supplied positions {#test-failure-map}\n\n${headline} Missing stages are not passed. Positions are unverified literals, not root-cause or call-graph proof.\n\n@answer scope="${inputDescription} · this reader does not execute pytest or user code · ${availability}"\n@meta locale=en\n\n## Which stage actually has a supplied result? {#overview}\n\n| Test | Reported total | Setup | Call | Teardown |\n| --- | --- | --- | --- | --- |\n`;
 for(const r of records)md+=`| test ${records.indexOf(r)+1}: ${literal(r.test)} | ${r.reportedOutcome} | ${r.stages.setup.outcome} | ${r.stages.call.outcome} | ${r.stages.teardown.outcome} |\n`;
 for(const [i,r]of records.entries()){const coverage=phases.map(phase=>{const stage=r.stages[phase],text=stage.frames?`supplied ${stage.frames.length} frames (completeness unknown)`:stage.traceback.includes('omission')?'omitted (unavailable)':stage.outcome==='not-provided'?'stage missing':'not provided (unavailable)';return `${phase}: ${text}`;});md+=`\nTraceback coverage for test ${i+1}: ${coverage.join('; ')}.\n`;}
 if(!records.length)md+='| unavailable: no test records | not inferred | not-provided | not-provided | not-provided |\n';
 md+=`\n${availability}. The sidecar classifies this input as a ${inputDescription}. Classification is supplied metadata, not an anonymization or authenticity guarantee. The reader does not verify how the report was produced.\n\n## Which supplied source positions can be read? {#positions}\n\n| Record and role | Literal display path | Raw line | Display line | Convention |\n| --- | --- | --- | --- | --- |\n`;
 for(const l of locations)md+=`| location ${locations.indexOf(l)+1}: ${literal(l.owner+' '+l.role)} | ${literal(l.path)} | ${l.rawLine} | ${l.displayLine} | ${l.lineConvention} |\n`;
 if(!locations.length)md+='| unavailable | no supplied test/crash/frame positions | unavailable | unavailable | not inferred |\n';
 const messages=locations.map((l,i)=>({location:i+1,message:l.message})).filter(l=>l.message!==undefined);
 if(messages.length){md+='\n| Location | Selected message |\n| --- | --- |\n';for(const m of messages)md+=`| location ${m.location} | ${literal(m.message)} |\n`;}
 md+='\nNodeid identifies collection, not necessarily the definition file. The exporter retains test line but omits location[0], so that file is unavailable. No path or URL was opened; no source text was verified. Frame order is a supplied list, not proof of direct calls or a complete stack.\n\n## What happened during collection? {#collection}\n\n| Collector | Collection outcome | Position |\n| --- | --- | --- |\n';
 for(const c of collection)md+=`| collector ${collection.indexOf(c)+1}: ${literal(c.collector)} | ${c.outcome} | ${c.sourceLocation} |\n`;
 if(!collection.length)md+='| unavailable | no collector records supplied | no inference |\n';
 const details=[];
 for(const [i,r]of records.entries())if(needsLiteralDetail(r.test))details.push({field:`test ${i+1} collected identity`,value:r.test});
 for(const [i,l]of locations.entries())for(const [field,value]of Object.entries({identityAndRole:l.owner+' '+l.role,path:l.path,...(l.message!==undefined?{message:l.message}:{})}))if(needsLiteralDetail(value))details.push({field:`location ${i+1} ${field}`,value});
 for(const [i,c]of collection.entries())if(needsLiteralDetail(c.collector))details.push({field:`collector ${i+1} identity`,value:c.collector});
 md+=`\n## What was omitted and what evidence remains? {#evidence}\n\n@facts\n| Source pins | pytest-json-report c6f0bc93a174; pytest 8.4.2 bfae4224fd55 |\n| Input classification | ${sidecar.classification} |\n| Report SHA-256 | \`${sidecar.reportSha256}\` |\n| Scope | supplied stages and literal positions only; source files not read |\n| Excluded fields | root, environment, streams, logs, longrepr and unselected fields |\n\nMetadata is not necessarily anonymous. Missing traceback is unavailable, not an empty-stack or success claim. Complete selected evidence remains in the separate \`projection.json\` file; it is not duplicated in this page.\n`;
 if(details.length)md+=`\nOnly table values requiring literal detail are repeated here, without interpreting their content.\n\n${snippet(details)}\n`;

 return {markdown:md,projection};
}
export function writeBundle(reportPath,sidecarPath,directory){const bytes=fs.readFileSync(reportPath),sidecar=JSON.parse(fs.readFileSync(sidecarPath,'utf8')),result=compileReport(bytes,sidecar);fs.mkdirSync(directory);const dirIdentity=fs.lstatSync(directory),owned=[];try{for(const[name,text]of[['failure.archify.md',result.markdown],['projection.json',JSON.stringify(result.projection,null,2)+'\n']]){const file=path.join(directory,name),fd=fs.openSync(file,'wx'),identity=fs.fstatSync(fd);owned.push({file,identity});try{fs.writeFileSync(fd,text);}finally{fs.closeSync(fd);}}}catch(e){for(const{file,identity}of owned){const now=fs.lstatSync(file,{throwIfNoEntry:false});if(now?.dev===identity.dev&&now?.ino===identity.ino)fs.unlinkSync(file);}const now=fs.lstatSync(directory,{throwIfNoEntry:false});if(now?.dev===dirIdentity.dev&&now?.ino===dirIdentity.ino){try{fs.rmdirSync(directory);}catch{}}throw e;}return{ok:true,tests:result.projection.tests.length,collectors:result.projection.collectors.length};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{if(process.argv.length!==5)fail('failure/usage','Usage: node report-reader.mjs provided-report.json explicit-sidecar.json fresh-directory');console.log(JSON.stringify(writeBundle(...process.argv.slice(2))));}catch(e){console.error(JSON.stringify({ok:false,code:e.code||'failure/input',message:e.message}));process.exitCode=1;}}
