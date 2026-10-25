import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const ID = /^[A-Za-z][A-Za-z0-9_-]{0,47}$/u;
const KINDS = new Set(['proposal','objection','revision','decision','withdrawal','message']);
const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
const object = (v, code) => { if (!v || typeof v !== 'object' || Array.isArray(v)) fail(code,'Expected an object.'); };
function keys(v, allowed) { for (const k of Object.keys(v)) if (!allowed.includes(k)) fail('thread/unsupported-field',`Unsupported field: ${k}. No hidden reasoning/session fields are accepted.`); }
function identifier(v) { if (typeof v !== 'string' || !ID.test(v)) fail('thread/id','IDs must start with a letter and contain only letters, digits, hyphen or underscore (max 48).'); }
function plain(v) { return typeof v === 'string' && /^[\p{L}\p{N} .,():_-]{1,90}$/u.test(v); }
const fence = value => { const text = JSON.stringify(value,null,2); const n = Math.max(3,...(text.match(/`+/gu)||[]).map(s=>s.length+1)); return `${'`'.repeat(n)}json\n${text}\n${'`'.repeat(n)}`; };

export function compileThread(input) {
  object(input,'thread/input'); keys(input,['version','declaration','title','participants','events']);
  if (input.version !== 1 || !['fictional','redacted'].includes(input.declaration)) fail('thread/declaration','Require version 1 and explicit fictional or redacted declaration. This does not automatically redact data.');
  if (!plain(input.title)) fail('thread/title','Use a short plain-text title.');
  if (!Array.isArray(input.participants) || input.participants.length<2 || input.participants.length>8) fail('thread/participants','Provide 2–8 participants.');
  const participants = new Set();
  for (const p of input.participants) {
    object(p,'thread/participant');keys(p,['id','label']);identifier(p.id);
    if (participants.has(p.id) || !plain(p.label)) fail('thread/participant','Participant IDs must be unique and labels plain text.');
    participants.add(p.id);
  }
  if (!Array.isArray(input.events) || input.events.length<1 || input.events.length>40) fail('thread/events','Provide 1–40 events.');
  const events = structuredClone(input.events), ids = new Set();
  for (const e of events) {
    object(e,'thread/event');keys(e,['id','from','to','order','timestamp','kind','text','references','objectionStatus']);identifier(e.id);
    if (ids.has(e.id)) fail('thread/duplicate-id',`Duplicate event ${e.id}.`);ids.add(e.id);
    if (!participants.has(e.from) || !participants.has(e.to)) fail('thread/unknown-participant',`Event ${e.id} names an undeclared participant.`);
    if (e.from===e.to) fail('thread/self-message','This experiment rejects self-messages; no topology is silently changed.');
    if (!KINDS.has(e.kind) || typeof e.text!=='string' || !e.text.trim() || e.text.length>2000) fail('thread/event-content',`Event ${e.id} needs a known kind and 1–2000 characters of explicit text.`);
    if (!Array.isArray(e.references) || e.references.some(r=>typeof r!=='string') || new Set(e.references).size!==e.references.length) fail('thread/references',`Event ${e.id} needs an explicit unique references array, including [] when none.`);
    if (e.kind==='objection' ? !['unresolved','withdrawn','addressed'].includes(e.objectionStatus) : e.objectionStatus!==undefined) fail('thread/objection-status','Only objections carry explicit unresolved/withdrawn/addressed status. Status is supplied, never inferred.');
    if (e.order!==undefined && (!Number.isSafeInteger(e.order)||e.order<1)) fail('thread/order','Orders must be positive safe integers.');
    if (e.timestamp!==undefined && (typeof e.timestamp!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/u.test(e.timestamp)||!Number.isFinite(Date.parse(e.timestamp))||new Date(e.timestamp).toISOString()!==e.timestamp)) fail('thread/timestamp','Timestamps must be valid canonical UTC ISO milliseconds.');
  }
  const allOrder=events.every(e=>e.order!==undefined), allTime=events.every(e=>e.timestamp!==undefined);
  if (!allOrder&&!allTime) fail('thread/mixed-order','Provide order on every event or timestamp on every event.');
  if (!allOrder&&events.some(e=>e.order!==undefined)) fail('thread/mixed-order','Partial order fields are ambiguous.');
  if (!allTime&&events.some(e=>e.timestamp!==undefined)) fail('thread/mixed-time','Partial timestamps are ambiguous.');
  events.sort((a,b)=>allOrder?a.order-b.order:Date.parse(a.timestamp)-Date.parse(b.timestamp));
  for(let i=1;i<events.length;i++) {
    if(allOrder&&events[i].order===events[i-1].order) fail('thread/order-conflict','Duplicate order.');
    if(allTime&&Date.parse(events[i].timestamp)<=Date.parse(events[i-1].timestamp)) fail('thread/timestamp-conflict','Timestamp ties or disagreement with order are rejected.');
  }
  const seen=new Set();
  for(const e of events) { for(const r of e.references) { if(!ids.has(r))fail('thread/missing-reference',`${e.id} references missing event ${r}; context unknown, import refused.`);if(!seen.has(r))fail('thread/forward-reference',`${e.id} references itself or a later event ${r}.`); }seen.add(e.id); }
  const unresolved=events.filter(e=>e.kind==='objection'&&e.objectionStatus==='unresolved').map(e=>e.id);
  const decisions=events.filter(e=>e.kind==='decision').map(e=>e.id);
  const scope=`${input.declaration} input · message order only · equal spacing is not elapsed time · no agreement inferred`;
  const sequence={schema_version:1,diagram_type:'sequence',meta:{title:input.title,subtitle:scope,output:'thread.sequence.html',legend:{entries:{default:{label:'Message'},security:{label:'Objection'},emphasis:{label:'Decision'},return:{label:'Withdrawal'}}}},participants:input.participants.map(p=>({...p,type:'backend'})),messages:events.map((e,i)=>({id:e.id,from:e.from,to:e.to,y:170+i*55,label:`${e.id}: ${e.kind}`,variant:e.kind==='objection'?'security':e.kind==='decision'?'emphasis':e.kind==='withdrawal'?'return':'default'})),cards:[{dot:'slate',title:'Evidence boundary',items:[scope,'Line colors denote event kinds only, without security/request/return protocol meaning.',`Recorded decision events: ${decisions.join(', ')||'none'}. This records a sender statement, not group approval.`,`Explicitly unresolved objections: ${unresolved.join(', ')||'none declared'}. Later decisions do not erase earlier messages.`, 'Every arrow ID matches an unchanged original event in the companion evidence page.']}]};
  let markdown=`# ${input.title} {#decision-thread}\n\nRecorded decisions: ${decisions.join(', ')||'none'}. Explicitly unresolved objections: ${unresolved.join(', ')||'none declared'}. Agreement is not inferred.\n\n@answer scope="${scope}"\n@meta locale=en\n\n## What was said in order? {#message-order}\n\n@diagram sequence source=thread.sequence.json\n\n`;
  for(const e of events)markdown+=`## ${e.id}: ${e.kind} {#event-${e.id}}\n\nFrom ${e.from} to ${e.to}. References: ${e.references.join(', ')||'none'}.${e.objectionStatus?` Input-declared objection status: ${e.objectionStatus}.`:''}\n\n${fence(e)}\n\n`;
  return {sequence,markdown,receipt:{version:1,experiment:'decision-thread',declaration:input.declaration,sourceSha256:createHash('sha256').update(JSON.stringify(input)).digest('hex'),orderMode:allOrder?'explicit-order':'timestamp-order',timingMeaning:'ordinal only; spacing has no duration meaning',events:events.map(e=>({id:e.id,from:e.from,to:e.to,originalIndex:input.events.findIndex(x=>x.id===e.id),references:e.references,sourcePointer:`/events/${input.events.findIndex(x=>x.id===e.id)}`,evidencePanel:`event-${e.id}`})),unresolvedObjections:unresolved,recordedDecisionEvents:decisions,agreement:'not inferred'}};
}

export function writeBundle(inputPath,outputDirectory) {
  const input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(inputPath)));
  const result=compileThread(input);
  // mkdir is exclusive: an existing file/directory/symlink/input alias is never reused.
  fs.mkdirSync(outputDirectory);
  const directoryIdentity=fs.lstatSync(outputDirectory),owned=[];
  try {
    for(const [name,data]of [['thread.sequence.json',JSON.stringify(result.sequence,null,2)+'\n'],['thread.archify.md',result.markdown],['thread.input.json',JSON.stringify(input,null,2)+'\n'],['thread.receipt.json',JSON.stringify(result.receipt,null,2)+'\n']]) {
      const file=path.join(outputDirectory,name),fd=fs.openSync(file,'wx');
      const identity=fs.fstatSync(fd);owned.push({file,identity});
      try{fs.writeFileSync(fd,data);}finally{fs.closeSync(fd);}
    }
  }catch(error){
    for(const {file,identity}of owned){const current=fs.lstatSync(file,{throwIfNoEntry:false});if(current?.dev===identity.dev&&current?.ino===identity.ino)fs.unlinkSync(file);}
    const current=fs.lstatSync(outputDirectory,{throwIfNoEntry:false});if(current?.dev===directoryIdentity.dev&&current?.ino===directoryIdentity.ino){try{fs.rmdirSync(outputDirectory);}catch{}}
    throw error;
  }
  return {ok:true,eventCount:result.receipt.events.length,unresolvedObjections:result.receipt.unresolvedObjections};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{if(process.argv.length!==4)fail('thread/usage','Usage: node thread-to-archify.mjs explicit-events.json fresh-output-directory');console.log(JSON.stringify(writeBundle(...process.argv.slice(2))));}catch(e){console.error(JSON.stringify({ok:false,code:e.code||'thread/input',message:e.message}));process.exitCode=1;}}
