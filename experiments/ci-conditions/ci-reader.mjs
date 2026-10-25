import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const id=/^[A-Za-z][A-Za-z0-9_-]{0,47}$/u;
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const keys=(v,allowed)=>{if(!object(v))fail('ci/shape','Expected an object.');for(const key of Object.keys(v))if(!allowed.includes(key))fail('ci/field',`Unsupported snapshot field ${key}.`);};
const snippet=v=>{const text=JSON.stringify(v,null,2),n=Math.max(3,...(text.match(/`+/gu)||[]).map(s=>s.length+1));return `${'`'.repeat(n)}json\n${text}\n${'`'.repeat(n)}`;};
export function gate(condition){
 keys(condition,['availability','raw']);
 if(condition.availability==='unavailable'){if(condition.raw!==undefined)fail('ci/condition','Unavailable condition must not invent raw text.');return 'unknown: source condition unavailable; not unconditional';}
 if(condition.availability==='verified-absent'){if(condition.raw!==undefined)fail('ci/condition','Absent condition must not contain raw text.');return 'implicit success(): no explicit if in supplied source snapshot';}
 if(condition.availability!=='provided'||typeof condition.raw!=='string'||!condition.raw.trim()||condition.raw.length>2000)fail('ci/condition','Provide a nonempty raw condition, verified-absent, or unavailable.');
 const raw=condition.raw.trim(),expr=raw.startsWith('${{')&&raw.endsWith('}}')?raw.slice(3,-2).trim():raw;
 if(/^(?:success|failure|cancelled|always)\(\)$/iu.test(expr))return `explicit status function ${expr}; not evaluated`;
 // Deliberately tiny lexical subset: context == single-quoted string, optionally joined.
 // No function calls, coercion, interpolation, property calls or expression evaluation.
 const term="[A-Za-z_][A-Za-z0-9_]*(?:\\.[A-Za-z_][A-Za-z0-9_]*)+\\s*(?:==|!=)\\s*'(?:[^']|'')*'";
 if(new RegExp(`^(?:${term})(?:\\s*(?:&&|\\|\\|)\\s*(?:${term}))*$`,'u').test(expr))return 'implicit success() AND supplied if: recognized no-function comparison syntax; not evaluated';
 return 'unknown: status-function analysis outside supported syntax; supplied if not evaluated';
}
export function matrixReading(matrix){
 keys(matrix,['kind','axes','raw','modifiers']);
 if(matrix.kind==='none'){if(Object.keys(matrix).length!==1)fail('ci/matrix','No matrix cannot also declare matrix fields.');return {kind:'none',meaning:'no matrix declared in snapshot; one job definition, not one observed run'};}
 if(matrix.kind==='unknown'){if(Object.keys(matrix).length!==1)fail('ci/matrix','Unknown matrix must not invent axes.');return {kind:'unknown',combinations:null,meaning:'matrix source unavailable'};}
 if(matrix.kind==='dynamic'){if(typeof matrix.raw!=='string'||!matrix.raw.trim()||matrix.axes!==undefined||matrix.modifiers!==undefined)fail('ci/matrix','Dynamic matrix needs raw expression only.');return {kind:'dynamic',raw:matrix.raw,combinations:null,meaning:'unknown; expression preserved and not expanded'};}
 if(matrix.kind!=='literal'||!object(matrix.axes)||matrix.raw!==undefined||!Array.isArray(matrix.modifiers)||matrix.modifiers.some(x=>!['include','exclude'].includes(x)))fail('ci/matrix','Literal matrix needs axes and an explicit include/exclude modifiers list.');
 const axes=Object.entries(matrix.axes);if(!axes.length||axes.length>10)fail('ci/matrix','Provide 1–10 literal axes.');let product=1;
 for(const [name,values]of axes){if(!id.test(name)||!Array.isArray(values)||!values.length||values.length>100||values.some(x=>!['string','number','boolean'].includes(typeof x)||typeof x==='number'&&!Number.isFinite(x)))fail('ci/matrix','Axes must contain bounded scalar values.');if(values.some(x=>typeof x==='string'&&x.includes('${{')))fail('ci/literal-expression','Expression-like values cannot be counted as literal combinations.');if(product>Number.MAX_SAFE_INTEGER/values.length)fail('ci/matrix-overflow','Declared matrix axis product exceeds the exact safe-integer limit; no approximate count is emitted.');product*=values.length;}
 return {kind:'literal',axes:matrix.axes,modifiers:matrix.modifiers,combinations:matrix.modifiers.length?null:product,meaning:matrix.modifiers.length?'unknown: include/exclude not expanded':'declared axis product only; no observed executions'};
}
// Table cells use the existing inline-code renderer, never raw HTML. Delimiter-heavy
// or long raw text stays complete in the JSON evidence instead of being reinterpreted.
function literalCell(text){return /[`\\\r\n]/u.test(text)||/\{(?:good|bad|caution):/u.test(text)||text.length>180?'raw text retained in job evidence below':`\`${text}\``;}
function overviewRow(r){
 const raw=r.condition.availability==='provided'?literalCell(r.condition.raw):r.condition.availability==='verified-absent'?'no explicit if (verified absent)':'unknown: source unavailable';
 const status=r.statusGate.startsWith('implicit success() AND')?'implicit success() AND if':r.statusGate.startsWith('implicit success()')?'implicit success()':r.statusGate.startsWith('explicit status')?r.statusGate.split(';')[0]:'unknown: not analyzed';
 const matrix=r.matrix.combinations!==null&&r.matrix.combinations!==undefined?`${r.matrix.combinations} declared combinations`:r.matrix.kind==='none'?'no matrix declared':r.matrix.kind==='dynamic'?'unknown: dynamic expression':r.matrix.kind==='literal'?'unknown: include/exclude not expanded':'unknown: source unavailable';
 return `| ${r.id} | ${raw} | ${status} | ${matrix} |`;
}
export function compileSnapshot(input){
 keys(input,['version','kind','title','source','coverage','jobs']);
 if(input.version!==1||input.kind!=='manual-static-workflow-snapshot')fail('ci/snapshot','Require the explicit custom manual-static-workflow-snapshot contract; gha-graph exports are not accepted.');
 if(typeof input.title!=='string'||!/^[-\p{L}\p{N} .:()]{1,80}$/u.test(input.title))fail('ci/title','Use a short plain title.');
 keys(input.source,['url','commit','path','sha256','classification']);if(!['upstream-source','synthetic'].includes(input.source.classification)||typeof input.source.url!=='string'||!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/blob\/[a-f0-9]{40}\//u.test(input.source.url)||!/^[a-f0-9]{40}$/u.test(input.source.commit)||!/^[a-f0-9]{64}$/u.test(input.source.sha256)||typeof input.source.path!=='string')fail('ci/source','Supply explicit classification and fixed GitHub source provenance. Synthetic mutations retain source baseline but are not upstream exports.');
 if(input.source.path.startsWith('/')||input.source.path.includes('\\')||input.source.path.split('/').some(p=>p==='..'||p==='.')||!input.source.url.endsWith(`/blob/${input.source.commit}/${input.source.path}`))fail('ci/source','Source URL, commit and relative path must agree.');
 keys(input.coverage,['stepConditions','outputs','reusableWorkflows','execution']);
 if(['stepConditions','outputs','reusableWorkflows'].some(k=>input.coverage[k]!=='not-inspected')||input.coverage.execution!=='not-run')fail('ci/coverage','This reader only accepts not-run execution and not-inspected static omissions.');
 if(!Array.isArray(input.jobs)||!input.jobs.length||input.jobs.length>30)fail('ci/jobs','Provide 1–30 job definitions.');
 const ids=new Set(),readings=[];
 for(const job of input.jobs){keys(job,['id','needs','condition','matrix','sourceLines']);if(typeof job.id!=='string'||!id.test(job.id)||ids.has(job.id))fail('ci/job-id','Job IDs must be valid and unique.');ids.add(job.id);if(!Array.isArray(job.needs)||new Set(job.needs).size!==job.needs.length||job.needs.some(n=>typeof n!=='string'))fail('ci/needs','Needs must be a unique explicit ID array.');if(!Array.isArray(job.sourceLines)||job.sourceLines.length!==2||job.sourceLines.some(n=>!Number.isSafeInteger(n)||n<1)||job.sourceLines[1]<job.sourceLines[0])fail('ci/lines','Provide a valid source line range.');readings.push({id:job.id,needs:job.needs,condition:job.condition,statusGate:gate(job.condition),matrix:matrixReading(job.matrix),sourceLines:job.sourceLines,runOutcome:'unknown: no run data'});}
 const visiting=new Set(),done=new Set();const visit=job=>{if(visiting.has(job.id))fail('ci/cycle',`Dependency cycle at ${job.id}.`);if(done.has(job.id))return;visiting.add(job.id);for(const need of job.needs){if(!ids.has(need))fail('ci/missing-needs',`${job.id} needs missing job ${need}.`);visit(input.jobs.find(x=>x.id===need));}visiting.delete(job.id);done.add(job.id);};input.jobs.forEach(visit);
 const levels=new Map();const level=job=>{if(!levels.has(job.id))levels.set(job.id,job.needs.length?1+Math.max(...job.needs.map(n=>level(input.jobs.find(j=>j.id===n)))):0);return levels.get(job.id);};
 const grouped=new Map();for(const job of input.jobs){const l=level(job);if(!grouped.has(l))grouped.set(l,[]);grouped.get(l).push(job.id);}
 const architecture={schema_version:1,diagram_type:'architecture',meta:{title:input.title,subtitle:'Declared needs only · conditions not evaluated · run outcome unknown',output:'needs.html'},layout:{mode:'grid',cols:Math.min(12,grouped.size),cellW:160,cellH:80,gapX:100,gapY:80},components:input.jobs.map(j=>({id:j.id,type:'backend',label:j.id,col:level(j),row:grouped.get(level(j)).indexOf(j.id)*2})),connections:input.jobs.flatMap(j=>j.needs.map(n=>({from:n,to:j.id,label:'needs'}))),cards:[{dot:'slate',title:'Scope',items:['Arrows mean declared needs; no job is shown as ran, skipped or successful.','Missing if is not unconditional: implicit status gates still apply.',`Snapshot class: ${input.source.classification}. Step conditions, outputs and reusable-workflow internals not inspected.`]}]};
 let markdown=`# ${input.title} {#ci-conditions}\n\nNeeds describe dependencies, not which jobs will run. Conditions are not evaluated; run outcomes remain unknown.\n\n@answer scope="${input.source.classification} snapshot · execution not run · static reading only"\n@meta locale=en\n\n## What are the declared gates? {#overview}\n\n| Job | Raw if or availability | Status gate | Declared matrix |\n| --- | --- | --- | --- |\n${readings.map(overviewRow).join('\n')}\n\nAll conditions remain not evaluated. Counts describe declarations, not observed runs. Complete raw values and source ranges follow below.\n\n## Which jobs depend on earlier jobs? {#needs}\n\n@diagram architecture source=needs.json\n\n`;
 for(const r of readings)markdown+=`## ${r.id}: conditions and matrix {#job-${r.id}}\n\n${r.statusGate}. Run outcome: unknown.\n\n${snippet(r)}\n\n`;
 markdown+=`## What was inspected and omitted? {#coverage}\n\nThis is an explicitly curated snapshot, not a complete YAML parser or runner. Status-function analysis is a bounded syntax reading, never expression evaluation. Matrix counts are declarations, not observed runs.\n\n${snippet({source:input.source,coverage:input.coverage})}\n`;
 return {architecture,markdown,receipt:{kind:'ci-conditions-reading',inputSha256:createHash('sha256').update(JSON.stringify(input)).digest('hex'),source:input.source,coverage:input.coverage,jobs:readings,expressionEvaluation:'not-performed',runConclusions:'unavailable'}};
}
export function writeBundle(inputPath,directory){const input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(inputPath))),result=compileSnapshot(input);fs.mkdirSync(directory);const dirStat=fs.lstatSync(directory),owned=[];try{for(const[name,text]of[['needs.json',JSON.stringify(result.architecture,null,2)+'\n'],['conditions.archify.md',result.markdown],['reading.receipt.json',JSON.stringify(result.receipt,null,2)+'\n']]){const file=path.join(directory,name),fd=fs.openSync(file,'wx'),stat=fs.fstatSync(fd);owned.push({file,stat});try{fs.writeFileSync(fd,text);}finally{fs.closeSync(fd);}}}catch(error){for(const {file,stat}of owned){const current=fs.lstatSync(file,{throwIfNoEntry:false});if(current?.dev===stat.dev&&current?.ino===stat.ino)fs.unlinkSync(file);}const current=fs.lstatSync(directory,{throwIfNoEntry:false});if(current?.dev===dirStat.dev&&current?.ino===dirStat.ino){try{fs.rmdirSync(directory);}catch{}}throw error;}return {ok:true,jobs:input.jobs.length};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{if(process.argv.length!==4)fail('ci/usage','Usage: node ci-reader.mjs snapshot.json fresh-directory');console.log(JSON.stringify(writeBundle(...process.argv.slice(2))));}catch(e){console.error(JSON.stringify({ok:false,code:e.code||'ci/input',message:e.message}));process.exitCode=1;}}
